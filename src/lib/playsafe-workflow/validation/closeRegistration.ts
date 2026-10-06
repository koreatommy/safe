import type { CloseRegistrationInput } from "../types";
import {
  allEligible,
  isUuid,
  parseEligibilityAnswers,
  parseFacilityInformation,
  validateEligibility,
  validateFacilityInformation,
} from "./facility";
import { parseFacilityPhotos, validateFacilityPhotos } from "./facilityPhotos";

export function parseCloseInput(value: unknown): CloseRegistrationInput | null {
  if (!value || typeof value !== "object") return null;
  const raw = value as Record<string, unknown>;
  const { information, answers } = raw;
  if (!information || typeof information !== "object" || !Array.isArray(answers)) return null;
  const facilityPhotos = parseFacilityPhotos(raw.facilityPhotos);
  if (!facilityPhotos) return null;
  return {
    id: typeof raw.id === "string" && raw.id ? raw.id : undefined,
    requestId: typeof raw.requestId === "string" ? raw.requestId : "",
    consentAt: typeof raw.consentAt === "string" ? raw.consentAt : "",
    eligibilityVersion: typeof raw.eligibilityVersion === "string" ? raw.eligibilityVersion : "",
    information: parseFacilityInformation(information),
    facilityPhotos,
    answers: parseEligibilityAnswers(answers),
  };
}

export function validateCloseInput(input: CloseRegistrationInput): string | null {
  if (!input.consentAt) return "개인정보 수집 동의 후 저장할 수 있습니다.";
  if (input.id && !isUuid(input.id)) return "등록 식별자가 올바르지 않습니다.";
  if (input.facilityPhotos.length > 0 && !isUuid(input.requestId)) {
    return "등록 요청 정보가 올바르지 않습니다. 페이지를 새로고침해 주세요.";
  }
  return (
    validateFacilityInformation(input.information) ??
    validateFacilityPhotos(input.facilityPhotos) ??
    validateEligibility(input.answers, input.eligibilityVersion) ??
    (allEligible(input.answers) ? "판단 기준을 모두 충족한 등록은 종결할 수 없습니다." : null)
  );
}
