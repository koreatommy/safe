import "server-only";

import type { AdminAssessmentUpdate } from "../adminTypes";
import { pathFor, type StoredFile } from "./submissionStorage";

export type AnswerRow = {
  assessment_id: string;
  item_code: string;
  status: string;
  memo: string;
};

export type AssessmentEditResult = { ok: true; removedPaths: string[] } | { ok: false; message: string };

export type ChecklistPhotoRow = {
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

export function answerRows(assessmentId: string, assessment: AdminAssessmentUpdate): AnswerRow[] {
  return assessment.answers.map((answer) => ({
    assessment_id: assessmentId,
    item_code: answer.itemCode,
    status: answer.status,
    memo: answer.memo,
  }));
}

/** 유지할 사진은 기존 행을 그대로 쓰고, 새 사진은 업로드된 경로로 행을 만든다. 슬롯은 항목 안의 순서로 다시 매긴다. */
export function checklistPhotoRows(
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
