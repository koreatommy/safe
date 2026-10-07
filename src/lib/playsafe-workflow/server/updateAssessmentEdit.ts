import "server-only";

import type { SupabaseClient } from "@supabase/supabase-js";
import type { AdminAssessmentUpdate, AdminRegistrationUpdate } from "../adminTypes";
import { PLAYSAFE_TABLES } from "../constants";
import { pathFor, type StoredFile } from "./submissionStorage";

type AnswerRow = {
  assessment_id: string;
  item_code: string;
  status: string;
  memo: string;
};

type ChecklistPhotoRow = {
  id: string;
  assessment_id: string;
  item_code: string;
  slot: number;
  storage_path: string;
  thumb_path: string | null;
  bytes: number;
  mime_type: string;
  status: string;
};

export type AssessmentEditResult = { ok: true; removedPaths: string[] } | { ok: false; message: string };

async function replaceRows(
  supabase: SupabaseClient,
  table: string,
  column: string,
  id: string,
  previous: object[],
  next: object[],
): Promise<string | null> {
  const { error: deleted } = await supabase.from(table).delete().eq(column, id);
  if (deleted) return "안전성평가를 수정하지 못했습니다.";
  if (next.length === 0) return null;
  const { error: inserted } = await supabase.from(table).insert(next);
  if (!inserted) return null;
  if (previous.length > 0) await supabase.from(table).insert(previous);
  return "위험요소 사진을 저장하지 못했습니다. 다시 시도해 주세요.";
}

function nextPhotos(
  assessmentId: string,
  existing: ChecklistPhotoRow[],
  assessment: AdminAssessmentUpdate,
  files: StoredFile[],
): { rows: ChecklistPhotoRow[] } | { message: string } {
  const rows: ChecklistPhotoRow[] = [];
  const counts = new Map<string, number>();
  for (const photo of assessment.photos) {
    const slot = (counts.get(photo.itemCode) ?? 0) + 1;
    counts.set(photo.itemCode, slot);
    if (photo.action === "keep") {
      const prev = existing.find((row) => row.id === photo.id);
      if (!prev || prev.item_code !== photo.itemCode) {
        return { message: "유지할 위험요소 사진을 찾지 못했습니다. 화면을 새로고침해 주세요." };
      }
      rows.push({ ...prev, slot });
      continue;
    }
    const storagePath = pathFor(files, "checklist", photo.id);
    const thumbPath = pathFor(files, "checklist", photo.id, "thumb");
    if (!storagePath || !thumbPath) return { message: "위험요소 사진 업로드 정보가 올바르지 않습니다." };
    rows.push({
      id: photo.id,
      assessment_id: assessmentId,
      item_code: photo.itemCode,
      slot,
      storage_path: storagePath,
      thumb_path: thumbPath,
      bytes: photo.bytes,
      mime_type: photo.mimeType,
      status: "attached",
    });
  }
  return { rows };
}

/**
 * 이미 있는 안전성평가의 평가자·평가일·18개 항목·위험요소 사진을 고친다.
 * 평가 행이 없으면 새로 만들지 않는다.
 */
export async function applyAssessmentEdit(
  supabase: SupabaseClient,
  registrationId: string,
  update: AdminRegistrationUpdate,
  files: StoredFile[],
): Promise<AssessmentEditResult> {
  const { data: assessment, error } = await supabase
    .from(PLAYSAFE_TABLES.assessments)
    .select("id")
    .eq("registration_id", registrationId)
    .maybeSingle();
  if (error) return { ok: false, message: "안전성평가를 수정하지 못했습니다." };
  if (!assessment && update.assessment) return { ok: false, message: "안전성평가가 등록된 뒤에 항목을 수정할 수 있습니다." };
  if (assessment && !update.assessment) return { ok: false, message: "안전성평가 항목이 빠졌습니다. 다시 저장해 주세요." };
  if (!assessment || !update.assessment) return { ok: true, removedPaths: [] };

  const assessmentId = assessment.id as string;
  const [answers, photos] = await Promise.all([
    supabase.from(PLAYSAFE_TABLES.answers).select("assessment_id, item_code, status, memo").eq("assessment_id", assessmentId),
    supabase
      .from(PLAYSAFE_TABLES.photos)
      .select("id, assessment_id, item_code, slot, storage_path, thumb_path, bytes, mime_type, status")
      .eq("assessment_id", assessmentId),
  ]);
  if (answers.error || photos.error) return { ok: false, message: "안전성평가를 수정하지 못했습니다." };

  const previousAnswers = (answers.data ?? []) as AnswerRow[];
  const previousPhotos = (photos.data ?? []) as ChecklistPhotoRow[];
  const photoRows = nextPhotos(assessmentId, previousPhotos, update.assessment, files);
  if ("message" in photoRows) return { ok: false, message: photoRows.message };

  const { error: headerError } = await supabase
    .from(PLAYSAFE_TABLES.assessments)
    .update({
      assessor: update.assessment.assessor,
      eval_date: update.assessment.evalDate || null,
    })
    .eq("id", assessmentId);
  if (headerError) return { ok: false, message: "안전성평가를 수정하지 못했습니다." };

  const nextAnswers: AnswerRow[] = update.assessment.answers.map((answer) => ({
    assessment_id: assessmentId,
    item_code: answer.itemCode,
    status: answer.status,
    memo: answer.memo,
  }));
  const answerError = await replaceRows(supabase, PLAYSAFE_TABLES.answers, "assessment_id", assessmentId, previousAnswers, nextAnswers);
  if (answerError) return { ok: false, message: answerError };
  const photoError = await replaceRows(
    supabase,
    PLAYSAFE_TABLES.photos,
    "assessment_id",
    assessmentId,
    previousPhotos,
    photoRows.rows,
  );
  if (photoError) {
    await replaceRows(supabase, PLAYSAFE_TABLES.answers, "assessment_id", assessmentId, nextAnswers, previousAnswers);
    return { ok: false, message: photoError };
  }

  const kept = new Set(photoRows.rows.flatMap((row) => [row.storage_path, row.thumb_path].filter((path): path is string => Boolean(path))));
  const removedPaths = [
    ...new Set(
      previousPhotos.flatMap((row) =>
        [row.storage_path, row.thumb_path].flatMap((path) => (path && !kept.has(path) ? [path] : [])),
      ),
    ),
  ];
  return { ok: true, removedPaths };
}
