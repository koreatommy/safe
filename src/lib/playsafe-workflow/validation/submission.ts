import type { SubmissionInput } from "../submissionTypes";
import { parseChecklist, validateChecklist } from "./assessment";
import { isUuid } from "./facility";

export function parseSubmissionInput(value: unknown): SubmissionInput | null {
  if (!value || typeof value !== "object") return null;
  const raw = value as Record<string, unknown>;
  const checklist = parseChecklist(raw.checklist);
  if (!checklist) return null;
  return {
    submissionId: typeof raw.submissionId === "string" ? raw.submissionId : "",
    id: typeof raw.id === "string" ? raw.id : "",
    checklist,
  };
}

export function validateSubmissionInput(input: SubmissionInput): string | null {
  if (!isUuid(input.submissionId)) return "등록 요청 정보가 올바르지 않습니다. 페이지를 새로고침해 주세요.";
  if (!isUuid(input.id)) return "저장된 시설정보를 찾을 수 없습니다. 시설정보입력에서 기구정보를 저장해 주세요.";
  return validateChecklist(input.checklist);
}
