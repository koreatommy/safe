import { EQUIPMENT_PHOTO_MAX_BYTES } from "../constants";
import type { SubmissionEquipment, SubmissionInput } from "../submissionTypes";
import { parseChecklist, validateChecklist } from "./assessment";
import {
  allEligible,
  isUuid,
  parseEligibilityAnswers,
  parseEquipmentInput,
  parseFacilityInformation,
  validateEligibility,
  validateEquipment,
  validateFacilityInformation,
} from "./facility";
import { parseFacilityPhotos, validateFacilityPhotos } from "./facilityPhotos";
import { parsePhotoMeta, validatePhotoMeta } from "./photo";

function parseEquipment(item: unknown): SubmissionEquipment | null {
  const base = parseEquipmentInput(item);
  if (!base) return null;
  const photo = (item as Record<string, unknown>).photo;
  if (photo == null) return { ...base, photo: null };
  if (typeof photo !== "object") return null;
  const meta = parsePhotoMeta(photo as Record<string, unknown>);
  return meta ? { ...base, photo: meta } : null;
}

export function parseSubmissionInput(value: unknown): SubmissionInput | null {
  if (!value || typeof value !== "object") return null;
  const raw = value as Record<string, unknown>;
  const { information, answers, equipment } = raw;
  if (!information || typeof information !== "object" || !Array.isArray(answers) || !Array.isArray(equipment)) {
    return null;
  }
  const parsedEquipment = equipment.map(parseEquipment);
  const facilityPhotos = parseFacilityPhotos(raw.facilityPhotos);
  const checklist = parseChecklist(raw.checklist);
  if (!checklist || !facilityPhotos || parsedEquipment.some((row) => row === null)) return null;
  return {
    submissionId: typeof raw.submissionId === "string" ? raw.submissionId : "",
    id: typeof raw.id === "string" && raw.id ? raw.id : undefined,
    consentAt: typeof raw.consentAt === "string" ? raw.consentAt : "",
    eligibilityVersion: typeof raw.eligibilityVersion === "string" ? raw.eligibilityVersion : "",
    information: parseFacilityInformation(information),
    facilityPhotos,
    answers: parseEligibilityAnswers(answers),
    equipment: parsedEquipment as SubmissionEquipment[],
    checklist,
  };
}

function validateEquipmentPhotos(equipment: SubmissionEquipment[]): string | null {
  for (const row of equipment) {
    if (!row.photo) continue;
    const problem = validatePhotoMeta(row.photo, EQUIPMENT_PHOTO_MAX_BYTES, "기구사진");
    if (problem) return problem;
  }
  return null;
}

export function validateSubmissionInput(input: SubmissionInput): string | null {
  if (!isUuid(input.submissionId)) return "등록 요청 정보가 올바르지 않습니다. 페이지를 새로고침해 주세요.";
  if (!input.consentAt) return "개인정보 수집 동의 후 등록할 수 있습니다.";
  if (input.id && !isUuid(input.id)) return "등록 식별자가 올바르지 않습니다.";
  return (
    validateFacilityInformation(input.information) ??
    validateFacilityPhotos(input.facilityPhotos) ??
    validateEligibility(input.answers, input.eligibilityVersion) ??
    (allEligible(input.answers) ? null : "판단 기준을 모두 충족해야 안전성평가를 등록할 수 있습니다.") ??
    validateEquipment(input.equipment) ??
    validateEquipmentPhotos(input.equipment) ??
    validateChecklist(input.checklist)
  );
}
