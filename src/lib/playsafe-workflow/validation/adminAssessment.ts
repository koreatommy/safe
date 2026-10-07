import type { AdminAssessmentUpdate, AdminChecklistPhotoInput } from "../adminTypes";
import {
  CHECKLIST_PHOTO_MAX_BYTES,
  CHECKLIST_VERSION,
  MAX_ASSESSOR_LENGTH,
  MAX_MEMO_LENGTH,
  MAX_PHOTOS_PER_ITEM,
} from "../constants";
import { checklistItemCodes } from "../itemCodes";
import type { SubmissionChecklistPhoto } from "../submissionTypes";
import { isAnswerStatus } from "./assessment";
import { isUuid } from "./facility";
import { parsePhotoMeta, validatePhotoMeta } from "./photo";

const DATE_RE = /^\d{4}-\d{2}-\d{2}$/;

function isIsoDate(value: string): boolean {
  if (!DATE_RE.test(value)) return false;
  const [year, month, day] = value.split("-").map(Number);
  const date = new Date(Date.UTC(year, month - 1, day));
  return date.getUTCFullYear() === year && date.getUTCMonth() === month - 1 && date.getUTCDate() === day;
}

function parseChecklistPhoto(item: unknown): AdminChecklistPhotoInput | null {
  if (!item || typeof item !== "object") return null;
  const raw = item as Record<string, unknown>;
  if (typeof raw.id !== "string" || typeof raw.itemCode !== "string") return null;
  if (raw.action === "keep") return { action: "keep", id: raw.id, itemCode: raw.itemCode };
  if (raw.action !== "new") return null;
  const meta = parsePhotoMeta(raw);
  return meta ? { action: "new", id: raw.id, itemCode: raw.itemCode, ...meta } : null;
}

/** 없으면 null. 형식이 틀리면 오류 문자열. */
export function parseAdminAssessment(value: unknown): AdminAssessmentUpdate | null | string {
  if (value == null) return null;
  if (!value || typeof value !== "object") return "안전성평가 정보가 올바르지 않습니다.";
  const raw = value as Record<string, unknown>;
  if (!Array.isArray(raw.answers) || !Array.isArray(raw.photos)) return "안전성평가 정보가 올바르지 않습니다.";
  const answers = raw.answers.flatMap((item) => {
    if (!item || typeof item !== "object") return [];
    const row = item as Record<string, unknown>;
    if (typeof row.itemCode !== "string" || !isAnswerStatus(row.status) || typeof row.memo !== "string") return [];
    return [{ itemCode: row.itemCode, status: row.status, memo: row.memo }];
  });
  if (answers.length !== raw.answers.length) return "안전성평가 항목이 올바르지 않습니다.";
  const photos = raw.photos.map(parseChecklistPhoto);
  if (photos.some((photo) => photo === null)) return "위험요소 사진 정보가 올바르지 않습니다.";
  return {
    assessor: typeof raw.assessor === "string" ? raw.assessor : "",
    evalDate: typeof raw.evalDate === "string" ? raw.evalDate : "",
    answers,
    photos: photos as AdminChecklistPhotoInput[],
  };
}

export function validateAdminAssessment(assessment: AdminAssessmentUpdate): string | null {
  const expected = checklistItemCodes(CHECKLIST_VERSION);
  if (assessment.assessor.trim().length > MAX_ASSESSOR_LENGTH) {
    return `평가자는 ${MAX_ASSESSOR_LENGTH}자 이내로 입력해 주세요.`;
  }
  if (assessment.evalDate && !isIsoDate(assessment.evalDate)) return "평가일 형식을 확인해 주세요.";
  const byCode = new Map(assessment.answers.map((answer) => [answer.itemCode, answer]));
  if (assessment.answers.length !== expected.length || byCode.size !== expected.length) {
    return "안전성평가 18개 항목을 모두 확인해 주세요.";
  }
  for (const code of expected) {
    const answer = byCode.get(code);
    if (!answer || answer.status === "unrecorded") return "안전성평가 18개 항목을 모두 확인해 주세요.";
    if (answer.memo.length > MAX_MEMO_LENGTH) return `조치 메모는 ${MAX_MEMO_LENGTH}자 이내로 입력해 주세요.`;
  }
  const riskCodes = new Set(assessment.answers.filter((answer) => answer.status === "risk_found").map((answer) => answer.itemCode));
  const ids = new Set<string>();
  const counts = new Map<string, number>();
  for (const photo of assessment.photos) {
    if (!isUuid(photo.id) || ids.has(photo.id)) return "위험요소 사진 정보가 올바르지 않습니다.";
    ids.add(photo.id);
    if (!riskCodes.has(photo.itemCode)) return "사진은 '위험요소 있음' 항목에만 첨부할 수 있습니다.";
    const count = (counts.get(photo.itemCode) ?? 0) + 1;
    if (count > MAX_PHOTOS_PER_ITEM) return `위험요소 사진은 항목당 ${MAX_PHOTOS_PER_ITEM}장까지 등록할 수 있습니다.`;
    counts.set(photo.itemCode, count);
    if (photo.action === "new") {
      const problem = validatePhotoMeta(photo, CHECKLIST_PHOTO_MAX_BYTES, "위험요소 사진");
      if (problem) return problem;
    }
  }
  return null;
}

export function normalizeAdminAssessment(assessment: AdminAssessmentUpdate): AdminAssessmentUpdate {
  return { ...assessment, assessor: assessment.assessor.trim(), evalDate: assessment.evalDate.trim() };
}

export function parseChecklistUploads(value: unknown): SubmissionChecklistPhoto[] | null {
  if (value == null) return [];
  if (!Array.isArray(value)) return null;
  const codes = new Set(checklistItemCodes(CHECKLIST_VERSION));
  const parsed = value.map((item): SubmissionChecklistPhoto | null => {
    if (!item || typeof item !== "object") return null;
    const raw = item as Record<string, unknown>;
    const meta = parsePhotoMeta(raw);
    if (!meta || typeof raw.id !== "string" || typeof raw.itemCode !== "string" || typeof raw.slot !== "number") return null;
    if (!codes.has(raw.itemCode)) return null;
    return { id: raw.id, itemCode: raw.itemCode, slot: raw.slot, ...meta };
  });
  if (parsed.some((photo) => photo === null)) return null;
  return parsed as SubmissionChecklistPhoto[];
}

export function validateChecklistUploads(photos: SubmissionChecklistPhoto[]): string | null {
  const ids = new Set<string>();
  const slots = new Set<string>();
  for (const photo of photos) {
    if (!isUuid(photo.id) || ids.has(photo.id)) return "위험요소 사진 정보가 올바르지 않습니다.";
    ids.add(photo.id);
    const slotKey = `${photo.itemCode}:${photo.slot}`;
    if (!Number.isInteger(photo.slot) || photo.slot < 1 || photo.slot > MAX_PHOTOS_PER_ITEM || slots.has(slotKey)) {
      return `위험요소 사진은 항목당 ${MAX_PHOTOS_PER_ITEM}장까지 등록할 수 있습니다.`;
    }
    slots.add(slotKey);
    const problem = validatePhotoMeta(photo, CHECKLIST_PHOTO_MAX_BYTES, "위험요소 사진");
    if (problem) return problem;
  }
  return null;
}

/** 항목 안에서 사진 순서로 슬롯(1~3)을 매긴 새 위험요소 사진. */
export function newChecklistPhotos(assessment: AdminAssessmentUpdate): SubmissionChecklistPhoto[] {
  const counts = new Map<string, number>();
  return assessment.photos.flatMap((photo) => {
    const slot = (counts.get(photo.itemCode) ?? 0) + 1;
    counts.set(photo.itemCode, slot);
    if (photo.action !== "new") return [];
    return [{ id: photo.id, itemCode: photo.itemCode, slot, bytes: photo.bytes, mimeType: photo.mimeType, thumb: photo.thumb }];
  });
}
