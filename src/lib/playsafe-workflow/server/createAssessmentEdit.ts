import "server-only";

import type { SupabaseClient } from "@supabase/supabase-js";
import type { AdminAssessmentUpdate } from "../adminTypes";
import { CHECKLIST_VERSION, PLAYSAFE_TABLES } from "../constants";
import { answerRows, checklistPhotoRows, type AssessmentEditResult } from "./assessmentRows";
import type { StoredFile } from "./submissionStorage";

const FAILED = "안전성평가를 등록하지 못했습니다.";

/**
 * 안전성평가가 없는 시설에 관리자가 평가를 새로 등록한다.
 * 사용자 제출과 같이 평가대상 시설·기구 1대 이상일 때만 받고, 등록 상태를 '안전성평가 등록 완료'로 바꾼다.
 * 중간에 실패하면 만든 평가 행을 지워 답변·사진 행까지 cascade로 되돌린다.
 */
export async function createAssessmentEdit(
  supabase: SupabaseClient,
  registrationId: string,
  assessment: AdminAssessmentUpdate,
  equipmentCount: number,
  files: StoredFile[],
): Promise<AssessmentEditResult> {
  const { data: registration, error } = await supabase
    .from(PLAYSAFE_TABLES.registrations)
    .select("status")
    .eq("id", registrationId)
    .maybeSingle();
  if (error || !registration) return { ok: false, message: FAILED };
  if (registration.status === "not_target") {
    return { ok: false, message: "평가대상이 아닌 시설은 안전성평가를 등록할 수 없습니다." };
  }
  if (equipmentCount < 1) {
    return { ok: false, message: "기구를 1대 이상 등록해야 안전성평가를 등록할 수 있습니다." };
  }

  const assessmentId = crypto.randomUUID();
  const photos = checklistPhotoRows(assessmentId, [], assessment, files);
  if ("message" in photos) return { ok: false, message: photos.message };

  const submittedAt = new Date().toISOString();
  const { error: created } = await supabase.from(PLAYSAFE_TABLES.assessments).insert({
    id: assessmentId,
    registration_id: registrationId,
    status: "submitted",
    checklist_version: CHECKLIST_VERSION,
    assessor: assessment.assessor,
    eval_date: assessment.evalDate || null,
    submitted_at: submittedAt,
  });
  if (created) {
    if (created.code === "23505") return { ok: false, message: "이미 안전성평가가 등록된 시설입니다. 화면을 새로고침해 주세요." };
    return { ok: false, message: FAILED };
  }

  const rollback = async () => {
    await supabase.from(PLAYSAFE_TABLES.assessments).delete().eq("id", assessmentId);
    return { ok: false as const, message: FAILED };
  };

  const { error: answersError } = await supabase.from(PLAYSAFE_TABLES.answers).insert(answerRows(assessmentId, assessment));
  if (answersError) return rollback();
  if (photos.rows.length > 0) {
    const { error: photosError } = await supabase.from(PLAYSAFE_TABLES.photos).insert(photos.rows);
    if (photosError) return rollback();
  }
  const { error: statusError } = await supabase
    .from(PLAYSAFE_TABLES.registrations)
    .update({ status: "submitted", submitted_at: submittedAt })
    .eq("id", registrationId);
  if (statusError) return rollback();

  return { ok: true, removedPaths: [] };
}
