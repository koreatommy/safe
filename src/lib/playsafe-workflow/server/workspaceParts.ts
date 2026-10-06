import type { SupabaseClient } from "@supabase/supabase-js";
import type { EligibilityAnswer, FacilityManagerInfo } from "@/data/playsafe/types";
import { PLAYSAFE_BUCKETS, PLAYSAFE_TABLES } from "../constants";
import type { AnswerStatus, AssessmentWorkspace, EligibilityPair } from "../types";
import { loadFacilityPhotoView } from "./facilityPhotoView";
import { signStoragePaths } from "./signStoragePaths";

export type RegistrationView = AssessmentWorkspace["registration"];
export type AssessmentView = AssessmentWorkspace["assessment"];

function infoFromRow(row: Record<string, unknown>): FacilityManagerInfo {
  const text = (key: string) => (typeof row[key] === "string" ? row[key] : "");
  return {
    managerName: text("manager_name"),
    phone: text("phone"),
    email: text("email"),
    facilityName: text("facility_name"),
    facilityNo: text("facility_no"),
    place: text("place"),
    placeEtc: text("place_etc"),
    postcode: text("postcode"),
    address: text("address"),
    detailAddress: text("detail_address"),
    water: text("water"),
    indoor: text("indoor"),
  };
}

function eligibilityFromJson(value: unknown): EligibilityPair[] {
  if (!Array.isArray(value)) return [];
  return value.flatMap((item) => {
    if (!item || typeof item !== "object") return [];
    const row = item as Record<string, unknown>;
    if (typeof row.code !== "string") return [];
    if (row.answer !== "yes" && row.answer !== "no") return [];
    return [{ code: row.code, answer: row.answer as EligibilityAnswer }];
  });
}

export async function loadRegistrationView(
  supabase: SupabaseClient,
  registrationId: string,
): Promise<RegistrationView | null> {
  const [{ data: registration }, { data: equipment }, facilityPhotos] = await Promise.all([
    supabase.from(PLAYSAFE_TABLES.registrations).select("*").eq("id", registrationId).maybeSingle(),
    supabase.from(PLAYSAFE_TABLES.equipment).select("*").eq("registration_id", registrationId).order("sort_order"),
    loadFacilityPhotoView(supabase, registrationId),
  ]);
  if (!registration) return null;

  const rows = equipment ?? [];
  const urls = await signStoragePaths(
    supabase,
    PLAYSAFE_BUCKETS.equipment,
    rows.flatMap((row) => [row.photo_path as string | null, row.thumb_path as string | null]),
  );
  const equipmentRows = rows.map((row) => {
    const photoUrl = urls.get(row.photo_path as string) ?? null;
    return {
      id: row.id as string,
      type: row.type_label as string,
      typeCode: row.type_code as string,
      date: (row.installed_on as string | null) ?? "",
      memo: row.memo as string,
      photoPath: (row.photo_path as string | null) ?? null,
      photoUrl,
      photoThumbUrl: urls.get(row.thumb_path as string) ?? photoUrl,
    };
  });

  return {
    id: registration.id as string,
    submitter: {
      name: (registration.submitter_name as string | null) ?? "",
      email: (registration.submitter_email as string | null) ?? "",
    },
    status: registration.status,
    information: infoFromRow(registration as Record<string, unknown>),
    facilityPhotos,
    answers: eligibilityFromJson(registration.eligibility_answers),
    equipment: equipmentRows,
    consentAt: registration.consent_at as string,
  };
}

export async function loadAssessmentView(
  supabase: SupabaseClient,
  registrationId: string,
): Promise<AssessmentView | null> {
  const { data: assessment } = await supabase
    .from(PLAYSAFE_TABLES.assessments)
    .select("*")
    .eq("registration_id", registrationId)
    .maybeSingle();
  if (!assessment) return null;

  const [{ data: answers }, { data: photos }] = await Promise.all([
    supabase.from(PLAYSAFE_TABLES.answers).select("*").eq("assessment_id", assessment.id),
    supabase.from(PLAYSAFE_TABLES.photos).select("*").eq("assessment_id", assessment.id),
  ]);

  const urls = await signStoragePaths(
    supabase,
    PLAYSAFE_BUCKETS.checklist,
    (photos ?? []).flatMap((row) => [row.storage_path as string, row.thumb_path as string | null]),
  );
  const photoRows = (photos ?? []).map((row) => {
    const url = urls.get(row.storage_path as string) ?? null;
    return {
      id: row.id as string,
      itemCode: row.item_code as string,
      slot: row.slot as number,
      bytes: row.bytes as number,
      mimeType: row.mime_type as string,
      url,
      thumbUrl: urls.get(row.thumb_path as string) ?? url,
    };
  });

  return {
    id: assessment.id as string,
    status: assessment.status,
    assessor: assessment.assessor as string,
    evalDate: (assessment.eval_date as string | null) ?? "",
    checklistVersion: assessment.checklist_version as string,
    answers: (answers ?? []).map((row) => ({
      itemCode: row.item_code as string,
      status: row.status as AnswerStatus,
      memo: row.memo as string,
    })),
    photos: photoRows,
  };
}
