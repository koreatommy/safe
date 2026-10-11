import "server-only";

import type { SupabaseClient } from "@supabase/supabase-js";
import type { AdminRegistrationUpdate } from "../adminTypes";
import { PLAYSAFE_TABLES } from "../constants";
import {
  answerRows,
  checklistPhotoRows,
  type AnswerRow,
  type AssessmentEditResult,
  type ChecklistPhotoRow,
} from "./assessmentRows";
import { createAssessmentEdit } from "./createAssessmentEdit";
import type { StoredFile } from "./submissionStorage";

export type { AssessmentEditResult } from "./assessmentRows";

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

/**
 * 안전성평가의 평가자·평가일·18개 항목·위험요소 사진을 고친다.
 * 평가 행이 없으면 관리자가 새로 등록하는 것으로 보고 평가를 만든다.
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
  if (assessment && !update.assessment) return { ok: false, message: "안전성평가 항목이 빠졌습니다. 다시 저장해 주세요." };
  if (!update.assessment) return { ok: true, removedPaths: [] };
  if (!assessment) {
    return createAssessmentEdit(supabase, registrationId, update.assessment, update.equipment.length, files);
  }

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
  const photoRows = checklistPhotoRows(assessmentId, previousPhotos, update.assessment, files);
  if ("message" in photoRows) return { ok: false, message: photoRows.message };

  const { error: headerError } = await supabase
    .from(PLAYSAFE_TABLES.assessments)
    .update({
      assessor: update.assessment.assessor,
      eval_date: update.assessment.evalDate || null,
    })
    .eq("id", assessmentId);
  if (headerError) return { ok: false, message: "안전성평가를 수정하지 못했습니다." };

  const nextAnswers = answerRows(assessmentId, update.assessment);
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
