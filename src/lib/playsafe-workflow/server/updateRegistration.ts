import "server-only";

import type { SupabaseClient } from "@supabase/supabase-js";
import { playTypes } from "@/data/playsafe/play-types";
import type { AdminRegistrationUpdate } from "../adminTypes";
import { PLAYSAFE_BUCKETS, PLAYSAFE_TABLES } from "../constants";
import { newFacilityPhotos } from "../validation/adminUpdate";
import { newChecklistPhotos } from "../validation/adminAssessment";
import { applyAssessmentEdit } from "./updateAssessmentEdit";
import { adminEditFiles, allUploaded, pathFor, type StoredFile } from "./submissionStorage";

type UpdateRegistrationResult =
  | { ok: true }
  | { ok: false; status: 400 | 404 | 409 | 502; message: string };

type FacilityPhotoRow = {
  id: string;
  registration_id: string;
  slot: number;
  photo_path: string;
  thumb_path: string | null;
  bytes: number;
  mime_type: string;
};

type EquipmentRow = {
  id: string;
  registration_id: string;
  type_code: string;
  type_label: string;
  installed_on: string | null;
  memo: string;
  photo_path: string | null;
  thumb_path: string | null;
  sort_order: number;
  matched_equipment_id: number | null;
};

const fail = (status: 400 | 404 | 409 | 502, message: string): UpdateRegistrationResult => ({
  ok: false,
  status,
  message,
});

function dbMessage(error: { code?: string } | null): string {
  if (error?.code === "23505") return "같은 입력자 이름·이메일로 이미 등록된 시설명입니다.";
  if (error?.code === "23514") return "입력자 이름과 이메일 형식을 확인해 주세요.";
  return "시설 정보를 수정하지 못했습니다.";
}

function unusedPaths(previous: Array<string | null>, next: Array<string | null>): string[] {
  const kept = new Set(next.filter((path): path is string => Boolean(path)));
  return [...new Set(previous.flatMap((path) => (path && !kept.has(path) ? [path] : [])))];
}

async function swapRows(
  supabase: SupabaseClient,
  table: string,
  registrationId: string,
  previous: object[],
  next: object[],
): Promise<string | null> {
  const { error: deleted } = await supabase.from(table).delete().eq("registration_id", registrationId);
  if (deleted) return "시설 정보를 수정하지 못했습니다.";
  if (next.length === 0) return null;
  const { error: inserted } = await supabase.from(table).insert(next);
  if (!inserted) return null;
  if (previous.length > 0) await supabase.from(table).insert(previous);
  return "사진·기구 정보를 저장하지 못했습니다. 다시 시도해 주세요.";
}

function nextFacilityRows(
  registrationId: string,
  existing: FacilityPhotoRow[],
  update: AdminRegistrationUpdate,
  files: StoredFile[],
): { rows: FacilityPhotoRow[] } | { message: string } {
  const rows: FacilityPhotoRow[] = [];
  for (const [index, photo] of update.facilityPhotos.entries()) {
    if (photo.action === "keep") {
      const prev = existing.find((row) => row.id === photo.id);
      if (!prev) return { message: "유지할 시설 전경사진을 찾지 못했습니다. 화면을 새로고침해 주세요." };
      rows.push({ ...prev, slot: index + 1 });
      continue;
    }
    const photoPath = pathFor(files, "facility", photo.id);
    const thumbPath = pathFor(files, "facility", photo.id, "thumb");
    if (!photoPath || !thumbPath) return { message: "시설 전경사진 업로드 정보가 올바르지 않습니다." };
    rows.push({
      id: photo.id,
      registration_id: registrationId,
      slot: index + 1,
      photo_path: photoPath,
      thumb_path: thumbPath,
      bytes: photo.bytes,
      mime_type: photo.mimeType,
    });
  }
  return { rows };
}

function nextEquipmentRows(
  registrationId: string,
  existing: EquipmentRow[],
  update: AdminRegistrationUpdate,
  files: StoredFile[],
): { rows: EquipmentRow[] } | { message: string } {
  const rows: EquipmentRow[] = [];
  for (const [index, row] of update.equipment.entries()) {
    const prev = existing.find((item) => item.id === row.id);
    const label = playTypes.find((type) => type.slug === row.typeCode)?.title ?? "";
    let photoPath: string | null = null;
    let thumbPath: string | null = null;
    if (row.photo.action === "keep") {
      if (!prev) return { message: "기존 사진을 유지할 기구를 찾지 못했습니다. 화면을 새로고침해 주세요." };
      photoPath = prev.photo_path;
      thumbPath = prev.thumb_path;
    } else if (row.photo.action === "new") {
      photoPath = pathFor(files, "equipment", row.id);
      thumbPath = pathFor(files, "equipment", row.id, "thumb");
      if (!photoPath || !thumbPath) return { message: "기구사진 업로드 정보가 올바르지 않습니다." };
    }
    rows.push({
      id: row.id,
      registration_id: registrationId,
      type_code: row.typeCode,
      type_label: label,
      installed_on: row.date || null,
      memo: row.memo,
      photo_path: photoPath,
      thumb_path: thumbPath,
      sort_order: index + 1,
      matched_equipment_id: prev?.matched_equipment_id ?? null,
    });
  }
  return { rows };
}

/** 관리자 세션의 service_role로 시설·전경사진·기구를 고친다. 상태·판단 기준·임시시설번호는 유지한다. */
export async function updateRegistration(
  supabase: SupabaseClient,
  registrationId: string,
  update: AdminRegistrationUpdate,
): Promise<UpdateRegistrationResult> {
  const [registration, facility, equipment] = await Promise.all([
    supabase.from(PLAYSAFE_TABLES.registrations).select("id").eq("id", registrationId).maybeSingle(),
    supabase.from(PLAYSAFE_TABLES.facilityPhotos).select("id, registration_id, slot, photo_path, thumb_path, bytes, mime_type").eq("registration_id", registrationId),
    supabase
      .from(PLAYSAFE_TABLES.equipment)
      .select("id, registration_id, type_code, type_label, installed_on, memo, photo_path, thumb_path, sort_order, matched_equipment_id")
      .eq("registration_id", registrationId),
  ]);
  if (registration.error || facility.error || equipment.error) return fail(502, "시설 정보를 수정하지 못했습니다.");
  if (!registration.data) return fail(404, "등록을 찾을 수 없습니다.");

  const previousPhotos = (facility.data ?? []) as FacilityPhotoRow[];
  const previousEquipment = (equipment.data ?? []) as EquipmentRow[];
  const files = adminEditFiles(
    update.requestId,
    newFacilityPhotos(update),
    update.equipment.flatMap((row) => (row.photo.action === "new" ? [{ id: row.id, photo: row.photo }] : [])),
    update.assessment ? newChecklistPhotos(update.assessment) : [],
  );
  const facilityRows = nextFacilityRows(registrationId, previousPhotos, update, files);
  if ("message" in facilityRows) return fail(400, facilityRows.message);
  const equipmentRows = nextEquipmentRows(registrationId, previousEquipment, update, files);
  if ("message" in equipmentRows) return fail(400, equipmentRows.message);
  if (!(await allUploaded(supabase, files))) {
    return fail(409, "사진 업로드가 끝나지 않았습니다. 다시 저장해 주세요.");
  }

  const info = update.information;
  const { error: updated } = await supabase
    .from(PLAYSAFE_TABLES.registrations)
    .update({
      submitter_name: update.submitter.name,
      submitter_email: update.submitter.email,
      manager_name: info.managerName,
      phone: info.phone,
      email: info.email,
      facility_name: info.facilityName,
      place: info.place,
      place_etc: info.placeEtc,
      postcode: info.postcode,
      address: info.address,
      detail_address: info.detailAddress,
      water: info.water,
      indoor: info.indoor,
    })
    .eq("id", registrationId);
  if (updated) {
    if (updated.code === "23505") return fail(409, dbMessage(updated));
    if (updated.code === "23514") return fail(400, dbMessage(updated));
    return fail(502, "시설 정보를 수정하지 못했습니다.");
  }

  const photoError = await swapRows(supabase, PLAYSAFE_TABLES.facilityPhotos, registrationId, previousPhotos, facilityRows.rows);
  if (photoError) return fail(502, photoError);
  const equipmentError = await swapRows(
    supabase,
    PLAYSAFE_TABLES.equipment,
    registrationId,
    previousEquipment,
    equipmentRows.rows,
  );
  if (equipmentError) {
    await swapRows(supabase, PLAYSAFE_TABLES.facilityPhotos, registrationId, facilityRows.rows, previousPhotos);
    return fail(502, equipmentError);
  }

  const assessmentEdit = await applyAssessmentEdit(supabase, registrationId, update, files);
  if (!assessmentEdit.ok) {
    await swapRows(supabase, PLAYSAFE_TABLES.equipment, registrationId, equipmentRows.rows, previousEquipment);
    await swapRows(supabase, PLAYSAFE_TABLES.facilityPhotos, registrationId, facilityRows.rows, previousPhotos);
    const status = assessmentEdit.message.includes("못했습니다") ? 502 : 400;
    return fail(status, assessmentEdit.message);
  }

  const stale = [
    [PLAYSAFE_BUCKETS.facility, unusedPaths(
      previousPhotos.flatMap((row) => [row.photo_path, row.thumb_path]),
      facilityRows.rows.flatMap((row) => [row.photo_path, row.thumb_path]),
    )],
    [PLAYSAFE_BUCKETS.equipment, unusedPaths(
      previousEquipment.flatMap((row) => [row.photo_path, row.thumb_path]),
      equipmentRows.rows.flatMap((row) => [row.photo_path, row.thumb_path]),
    )],
    [PLAYSAFE_BUCKETS.checklist, assessmentEdit.removedPaths],
  ] as const;
  await Promise.all(
    stale
      .filter(([, paths]) => paths.length > 0)
      .map(([bucket, paths]) => supabase.storage.from(bucket).remove([...paths]).catch(() => undefined)),
  );
  return { ok: true };
}
