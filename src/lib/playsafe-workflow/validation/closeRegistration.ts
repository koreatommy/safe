import type { CloseRegistrationInput } from "../types";
import {
  allEligible,
  isUuid,
  parseEligibilityAnswers,
  parseFacilityInformation,
  validateEligibility,
  validateFacilityInformation,
} from "./facility";

export function parseCloseInput(value: unknown): CloseRegistrationInput | null {
  if (!value || typeof value !== "object") return null;
  const raw = value as Record<string, unknown>;
  const { information, answers } = raw;
  if (!information || typeof information !== "object" || !Array.isArray(answers)) return null;
  return {
    id: typeof raw.id === "string" && raw.id ? raw.id : undefined,
    consentAt: typeof raw.consentAt === "string" ? raw.consentAt : "",
    eligibilityVersion: typeof raw.eligibilityVersion === "string" ? raw.eligibilityVersion : "",
    information: parseFacilityInformation(information),
    answers: parseEligibilityAnswers(answers),
  };
}

export function validateCloseInput(input: CloseRegistrationInput): string | null {
  if (!input.consentAt) return "개인정보 수집 동의 후 저장할 수 있습니다.";
  if (input.id && !isUuid(input.id)) return "등록 식별자가 올바르지 않습니다.";
  return (
    validateFacilityInformation(input.information) ??
    validateEligibility(input.answers, input.eligibilityVersion) ??
    (allEligible(input.answers) ? "판단 기준을 모두 충족한 등록은 종결할 수 없습니다." : null)
  );
}
