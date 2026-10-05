import {
  ANSWER_STATUSES,
  CHECKLIST_PHOTO_MAX_BYTES,
  CHECKLIST_VERSION,
  MAX_ASSESSOR_LENGTH,
  MAX_MEMO_LENGTH,
  MAX_PHOTOS_PER_ITEM,
} from "../constants";
import { checklistItemCodes } from "../itemCodes";
import type { SubmissionChecklist, SubmissionChecklistPhoto } from "../submissionTypes";
import type { AnswerStatus } from "../types";
import { isUuid } from "./facility";
import { parsePhotoMeta, validatePhotoMeta } from "./photo";

const DATE_RE = /^\d{4}-\d{2}-\d{2}$/;

export function isAnswerStatus(value: unknown): value is AnswerStatus {
  return typeof value === "string" && (ANSWER_STATUSES as readonly string[]).includes(value);
}

const text = (raw: Record<string, unknown>, key: string) => (typeof raw[key] === "string" ? (raw[key] as string) : "");

function parsePhoto(item: unknown): SubmissionChecklistPhoto | null {
  if (!item || typeof item !== "object") return null;
  const raw = item as Record<string, unknown>;
  const meta = parsePhotoMeta(raw);
  if (!meta) return null;
  return { ...meta, id: text(raw, "id"), itemCode: text(raw, "itemCode"), slot: typeof raw.slot === "number" ? raw.slot : 0 };
}

export function parseChecklist(value: unknown): SubmissionChecklist | null {
  if (!value || typeof value !== "object") return null;
  const raw = value as Record<string, unknown>;
  if (!Array.isArray(raw.answers) || !Array.isArray(raw.photos)) return null;
  const answers = raw.answers.flatMap((item) => {
    if (!item || typeof item !== "object") return [];
    const row = item as Record<string, unknown>;
    if (typeof row.itemCode !== "string" || !isAnswerStatus(row.status)) return [];
    return [{ itemCode: row.itemCode, status: row.status, memo: text(row, "memo") }];
  });
  const photos = raw.photos.map(parsePhoto);
  if (photos.some((photo) => photo === null)) return null;
  return {
    version: text(raw, "version"),
    assessor: text(raw, "assessor"),
    evalDate: text(raw, "evalDate"),
    answers,
    photos: photos as SubmissionChecklistPhoto[],
  };
}

function validatePhotos(checklist: SubmissionChecklist): string | null {
  const riskCodes = new Set(checklist.answers.filter((a) => a.status === "risk_found").map((a) => a.itemCode));
  const ids = new Set<string>();
  const slots = new Set<string>();
  for (const photo of checklist.photos) {
    if (!isUuid(photo.id) || ids.has(photo.id)) return "사진 식별자가 올바르지 않습니다.";
    ids.add(photo.id);
    if (!riskCodes.has(photo.itemCode)) return "사진은 '위험요소 있음' 항목에만 첨부할 수 있습니다.";
    const slotKey = `${photo.itemCode}:${photo.slot}`;
    if (!Number.isInteger(photo.slot) || photo.slot < 1 || photo.slot > MAX_PHOTOS_PER_ITEM || slots.has(slotKey)) {
      return `사진은 항목당 ${MAX_PHOTOS_PER_ITEM}장까지 등록할 수 있습니다.`;
    }
    slots.add(slotKey);
    const problem = validatePhotoMeta(photo, CHECKLIST_PHOTO_MAX_BYTES, "위험요소 사진");
    if (problem) return problem;
  }
  return null;
}

/** 18개 항목이 모두 기록되어야 등록할 수 있다. */
export function validateChecklist(checklist: SubmissionChecklist): string | null {
  const expected = checklistItemCodes(checklist.version);
  if (checklist.version !== CHECKLIST_VERSION || expected.length === 0) {
    return "안전성평가 항목 버전이 오래되었습니다. 페이지를 새로고침해 주세요.";
  }
  if (checklist.assessor.length > MAX_ASSESSOR_LENGTH) return `평가자는 ${MAX_ASSESSOR_LENGTH}자 이내로 입력해 주세요.`;
  if (checklist.evalDate && !DATE_RE.test(checklist.evalDate)) return "평가일 형식을 확인해 주세요.";

  const byCode = new Map(checklist.answers.map((answer) => [answer.itemCode, answer]));
  if (checklist.answers.length !== expected.length || byCode.size !== expected.length) {
    return "모든 항목을 확인한 뒤 등록해 주세요.";
  }
  for (const code of expected) {
    const answer = byCode.get(code);
    if (!answer || answer.status === "unrecorded") return "모든 항목을 확인한 뒤 등록해 주세요.";
    if (answer.memo.length > MAX_MEMO_LENGTH) return `조치 메모는 ${MAX_MEMO_LENGTH}자 이내로 입력해 주세요.`;
  }
  return validatePhotos(checklist);
}
