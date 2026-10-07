import { MAX_FACILITY_PHOTOS } from "@/data/playsafe/facility-registration";
import { PLAY_TYPE_SLUGS } from "@/data/playsafe/play-types";
import type { FacilityManagerInfo } from "@/data/playsafe/types";
import type {
  AdminEquipmentInput,
  AdminEquipmentPhotoInput,
  AdminFacilityPhotoInput,
  AdminRegistrationUpdate,
  AdminUploadRequest,
} from "../adminTypes";
import { EQUIPMENT_PHOTO_MAX_BYTES, FACILITY_PHOTO_MAX_BYTES, MAX_MEMO_LENGTH } from "../constants";
import type { SubmissionFacilityPhoto } from "../submissionTypes";
import { parseAdminAssessment, parseChecklistUploads, validateAdminAssessment, validateChecklistUploads, normalizeAdminAssessment } from "./adminAssessment";
import { isUuid, parseFacilityInformation } from "./facility";
import { parseFacilityPhotos, validateFacilityPhotos } from "./facilityPhotos";
import { parsePhotoMeta, validatePhotoMeta } from "./photo";

const EMAIL_RE = /^[^@\s]+@[^@\s]+\.[^@\s]+$/;
const DATE_RE = /^\d{4}-\d{2}-\d{2}$/;
export const MAX_ADMIN_EQUIPMENT = 50;
const MAX_TEXT = 300;

type Prepared<T> = { ok: true; value: T } | { ok: false; message: string };

function isIsoDate(value: string): boolean {
  if (!DATE_RE.test(value)) return false;
  const [year, month, day] = value.split("-").map(Number);
  const date = new Date(Date.UTC(year, month - 1, day));
  return date.getUTCFullYear() === year && date.getUTCMonth() === month - 1 && date.getUTCDate() === day;
}

function parseFacilityPhoto(item: unknown): AdminFacilityPhotoInput | null {
  if (!item || typeof item !== "object") return null;
  const raw = item as Record<string, unknown>;
  if (typeof raw.id !== "string") return null;
  if (raw.action === "keep") return { action: "keep", id: raw.id };
  if (raw.action !== "new") return null;
  const meta = parsePhotoMeta(raw);
  return meta ? { action: "new", id: raw.id, ...meta } : null;
}

function parseEquipmentPhoto(item: unknown): AdminEquipmentPhotoInput | null {
  if (!item || typeof item !== "object") return null;
  const raw = item as Record<string, unknown>;
  if (raw.action === "keep" || raw.action === "clear") return { action: raw.action };
  if (raw.action !== "new") return null;
  const meta = parsePhotoMeta(raw);
  return meta ? { action: "new", ...meta } : null;
}

function parseEquipment(item: unknown): AdminEquipmentInput | null {
  if (!item || typeof item !== "object") return null;
  const raw = item as Record<string, unknown>;
  const photo = parseEquipmentPhoto(raw.photo);
  if (!photo || typeof raw.id !== "string" || typeof raw.typeCode !== "string") return null;
  if (typeof raw.date !== "string" || typeof raw.memo !== "string") return null;
  return { id: raw.id, typeCode: raw.typeCode, date: raw.date, memo: raw.memo, photo };
}

function parseUpdate(value: unknown): AdminRegistrationUpdate | null {
  if (!value || typeof value !== "object") return null;
  const raw = value as Record<string, unknown>;
  const submitter = raw.submitter;
  if (!submitter || typeof submitter !== "object") return null;
  const person = submitter as Record<string, unknown>;
  if (typeof person.name !== "string" || typeof person.email !== "string") return null;
  if (!raw.information || typeof raw.information !== "object") return null;
  if (!Array.isArray(raw.facilityPhotos) || !Array.isArray(raw.equipment)) return null;
  const facilityPhotos = raw.facilityPhotos.map(parseFacilityPhoto);
  const equipment = raw.equipment.map(parseEquipment);
  if (facilityPhotos.some((photo) => photo === null) || equipment.some((row) => row === null)) return null;
  return {
    requestId: typeof raw.requestId === "string" ? raw.requestId : "",
    submitter: { name: person.name, email: person.email },
    information: parseFacilityInformation(raw.information),
    facilityPhotos: facilityPhotos as AdminFacilityPhotoInput[],
    equipment: equipment as AdminEquipmentInput[],
    assessment: null,
  };
}

function bounded(value: string, max: number, label: string): string | null {
  return value.trim().length <= max ? null : `${label}은 ${max}자 이하로 입력해 주세요.`;
}

function validateInformation(info: FacilityManagerInfo): string | null {
  if (!info.facilityName.trim()) return "시설명을 입력해 주세요.";
  return (
    bounded(info.facilityName, 200, "시설명") ??
    bounded(info.managerName, MAX_TEXT, "관리주체 성명") ??
    bounded(info.phone, 30, "전화번호") ??
    bounded(info.email, MAX_TEXT, "관리주체 이메일") ??
    bounded(info.place, MAX_TEXT, "설치장소") ??
    bounded(info.placeEtc, MAX_TEXT, "기타 설치장소") ??
    bounded(info.postcode, 20, "우편번호") ??
    bounded(info.address, 500, "주소") ??
    bounded(info.detailAddress, 500, "상세주소") ??
    bounded(info.water, 20, "물놀이형") ??
    bounded(info.indoor, 20, "실내외 구분")
  );
}

function validateNewFacilityPhoto(photo: Extract<AdminFacilityPhotoInput, { action: "new" }>): string | null {
  return validatePhotoMeta(photo, FACILITY_PHOTO_MAX_BYTES, "시설 전경사진");
}

function duplicateIds(ids: string[]): boolean {
  return new Set(ids).size !== ids.length;
}

function validateUpdate(update: AdminRegistrationUpdate): string | null {
  const name = update.submitter.name.trim();
  const email = update.submitter.email.trim().toLowerCase();
  if (!name) return "입력자 이름을 입력해 주세요.";
  if (name.length > 100) return "입력자 이름은 100자 이하로 입력해 주세요.";
  if (!EMAIL_RE.test(email)) return "입력자 이메일 형식을 확인해 주세요.";
  if (update.information.email.trim() && !EMAIL_RE.test(update.information.email.trim())) {
    return "관리주체 이메일 형식을 확인해 주세요.";
  }
  const infoProblem = validateInformation(update.information);
  if (infoProblem) return infoProblem;
  if (update.facilityPhotos.length > MAX_FACILITY_PHOTOS) {
    return `시설 전경사진은 최대 ${MAX_FACILITY_PHOTOS}장까지 등록할 수 있습니다.`;
  }
  if (duplicateIds(update.facilityPhotos.map((photo) => photo.id))) return "시설 전경사진 정보가 올바르지 않습니다.";
  for (const photo of update.facilityPhotos) {
    if (!isUuid(photo.id)) return "시설 전경사진 정보가 올바르지 않습니다.";
    if (photo.action === "new") {
      const problem = validateNewFacilityPhoto(photo);
      if (problem) return problem;
    }
  }
  if (update.assessment) {
    const assessmentProblem = validateAdminAssessment(update.assessment);
    if (assessmentProblem) return assessmentProblem;
  }
  const hasNewPhoto =
    update.facilityPhotos.some((photo) => photo.action === "new") ||
    update.equipment.some((row) => row.photo.action === "new") ||
    Boolean(update.assessment?.photos.some((photo) => photo.action === "new"));
  if (hasNewPhoto && !isUuid(update.requestId)) return "사진 업로드 정보가 올바르지 않습니다. 다시 저장해 주세요.";
  if (!hasNewPhoto && update.requestId && !isUuid(update.requestId)) {
    return "사진 업로드 정보가 올바르지 않습니다. 다시 저장해 주세요.";
  }
  if (update.equipment.length > MAX_ADMIN_EQUIPMENT) return `놀이기구는 최대 ${MAX_ADMIN_EQUIPMENT}대까지 등록할 수 있습니다.`;
  if (duplicateIds(update.equipment.map((row) => row.id))) return "기구 식별자가 중복되었습니다.";
  for (const row of update.equipment) {
    if (!isUuid(row.id)) return "기구 식별자가 올바르지 않습니다.";
    if (!PLAY_TYPE_SLUGS.has(row.typeCode)) return "기구 유형을 확인해 주세요.";
    if (row.date && !isIsoDate(row.date)) return "설치일자를 확인해 주세요.";
    if (row.memo.length > MAX_MEMO_LENGTH) return `기구 메모는 ${MAX_MEMO_LENGTH}자 이하로 입력해 주세요.`;
    if (row.photo.action === "new") {
      const problem = validatePhotoMeta(row.photo, EQUIPMENT_PHOTO_MAX_BYTES, "기구사진");
      if (problem) return problem;
    }
  }
  return null;
}

function normalize(update: AdminRegistrationUpdate): AdminRegistrationUpdate {
  const place = update.information.place.trim();
  return {
    ...update,
    requestId: update.requestId.trim(),
    submitter: {
      name: update.submitter.name.trim(),
      email: update.submitter.email.trim().toLowerCase(),
    },
    information: {
      ...update.information,
      managerName: update.information.managerName.trim(),
      phone: update.information.phone.trim(),
      email: update.information.email.trim(),
      facilityName: update.information.facilityName.trim(),
      place,
      placeEtc: place === "기타" ? update.information.placeEtc.trim() : "",
      postcode: update.information.postcode.trim(),
      address: update.information.address.trim(),
      detailAddress: update.information.detailAddress.trim(),
      water: update.information.water.trim(),
      indoor: update.information.indoor.trim(),
    },
    assessment: update.assessment ? normalizeAdminAssessment(update.assessment) : null,
  };
}

export function prepareAdminUpdate(value: unknown): Prepared<AdminRegistrationUpdate> {
  const parsed = parseUpdate(value);
  if (!parsed || !value || typeof value !== "object") return { ok: false, message: "수정 내용이 올바르지 않습니다." };
  const assessment = parseAdminAssessment((value as Record<string, unknown>).assessment);
  if (typeof assessment === "string") return { ok: false, message: assessment };
  const update = { ...parsed, assessment };
  const problem = validateUpdate(update);
  if (problem) return { ok: false, message: problem };
  return { ok: true, value: normalize(update) };
}

function parseEquipmentPhotoUpload(item: unknown): (AdminUploadRequest["equipmentPhotos"][number]) | null {
  if (!item || typeof item !== "object") return null;
  const raw = item as Record<string, unknown>;
  const meta = parsePhotoMeta(raw);
  if (!meta || typeof raw.id !== "string") return null;
  return { id: raw.id, ...meta };
}

export function prepareAdminUpload(value: unknown): Prepared<AdminUploadRequest> {
  if (!value || typeof value !== "object") return { ok: false, message: "업로드 정보가 올바르지 않습니다." };
  const raw = value as Record<string, unknown>;
  const facilityPhotos = parseFacilityPhotos(raw.facilityPhotos);
  const checklistPhotos = parseChecklistUploads(raw.checklistPhotos);
  if (!facilityPhotos || !checklistPhotos || !Array.isArray(raw.equipmentPhotos)) {
    return { ok: false, message: "업로드 정보가 올바르지 않습니다." };
  }
  const equipmentPhotos = raw.equipmentPhotos.map(parseEquipmentPhotoUpload);
  if (equipmentPhotos.some((photo) => photo === null)) return { ok: false, message: "업로드 정보가 올바르지 않습니다." };
  const upload: AdminUploadRequest = {
    requestId: typeof raw.requestId === "string" ? raw.requestId : "",
    facilityPhotos,
    equipmentPhotos: equipmentPhotos as AdminUploadRequest["equipmentPhotos"],
    checklistPhotos,
  };
  if (!isUuid(upload.requestId)) return { ok: false, message: "사진 업로드 정보가 올바르지 않습니다." };
  const facilityProblem = validateFacilityPhotos(upload.facilityPhotos);
  if (facilityProblem) return { ok: false, message: facilityProblem };
  if (upload.equipmentPhotos.length > MAX_ADMIN_EQUIPMENT) {
    return { ok: false, message: `놀이기구는 최대 ${MAX_ADMIN_EQUIPMENT}대까지 등록할 수 있습니다.` };
  }
  if (duplicateIds(upload.equipmentPhotos.map((photo) => photo.id)) || upload.equipmentPhotos.some((photo) => !isUuid(photo.id))) {
    return { ok: false, message: "기구사진 정보가 올바르지 않습니다." };
  }
  for (const photo of upload.equipmentPhotos) {
    const problem = validatePhotoMeta(photo, EQUIPMENT_PHOTO_MAX_BYTES, "기구사진");
    if (problem) return { ok: false, message: problem };
  }
  const checklistProblem = validateChecklistUploads(upload.checklistPhotos);
  if (checklistProblem) return { ok: false, message: checklistProblem };
  return { ok: true, value: upload };
}

export function newFacilityPhotos(update: AdminRegistrationUpdate): SubmissionFacilityPhoto[] {
  return update.facilityPhotos.flatMap((photo, index) =>
    photo.action === "new" ? [{ id: photo.id, slot: index + 1, bytes: photo.bytes, mimeType: photo.mimeType, thumb: photo.thumb }] : [],
  );
}
