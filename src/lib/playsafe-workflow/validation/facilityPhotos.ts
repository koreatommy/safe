import { MAX_FACILITY_PHOTOS } from "@/data/playsafe/facility-registration";
import { FACILITY_PHOTO_MAX_BYTES } from "../constants";
import type { SubmissionFacilityPhoto } from "../submissionTypes";
import { isUuid } from "./facility";
import { parsePhotoMeta, validatePhotoMeta } from "./photo";

/** 없으면 빈 배열, 형식이 틀리면 null. */
export function parseFacilityPhotos(value: unknown): SubmissionFacilityPhoto[] | null {
  if (value == null) return [];
  if (!Array.isArray(value)) return null;
  const parsed = value.map((item): SubmissionFacilityPhoto | null => {
    if (!item || typeof item !== "object") return null;
    const raw = item as Record<string, unknown>;
    const meta = parsePhotoMeta(raw);
    if (!meta || typeof raw.id !== "string" || typeof raw.slot !== "number") return null;
    return { id: raw.id, slot: raw.slot, ...meta };
  });
  return parsed.some((photo) => photo === null) ? null : (parsed as SubmissionFacilityPhoto[]);
}

export function validateFacilityPhotos(photos: SubmissionFacilityPhoto[]): string | null {
  if (photos.length > MAX_FACILITY_PHOTOS) return `시설 전경사진은 최대 ${MAX_FACILITY_PHOTOS}장까지 등록할 수 있습니다.`;
  const slots = new Set(photos.map((photo) => photo.slot));
  const slotsValid = slots.size === photos.length && [...slots].every((slot) => slot >= 1 && slot <= MAX_FACILITY_PHOTOS);
  if (!slotsValid || photos.some((photo) => !isUuid(photo.id))) {
    return "시설 전경사진 정보가 올바르지 않습니다. 사진을 지우고 다시 추가해 주세요.";
  }
  for (const photo of photos) {
    const problem = validatePhotoMeta(photo, FACILITY_PHOTO_MAX_BYTES, "시설 전경사진");
    if (problem) return problem;
  }
  return null;
}
