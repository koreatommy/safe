import { EQUIPMENT_PHOTO_MAX_BYTES } from "../constants";
import type { SubmissionEquipment } from "../submissionTypes";
import { parseEquipmentInput, validateEquipment } from "./facility";
import { parsePhotoMeta, validatePhotoMeta } from "./photo";

function parseEquipmentItem(item: unknown): SubmissionEquipment | null {
  const base = parseEquipmentInput(item);
  if (!base) return null;
  const photo = (item as Record<string, unknown>).photo;
  if (photo == null) return { ...base, photo: null };
  if (typeof photo !== "object") return null;
  const meta = parsePhotoMeta(photo as Record<string, unknown>);
  return meta ? { ...base, photo: meta } : null;
}

/** 없으면 undefined(기구 미포함 저장), 형식이 틀리면 null. */
export function parseEquipmentList(value: unknown): SubmissionEquipment[] | undefined | null {
  if (value == null) return undefined;
  if (!Array.isArray(value)) return null;
  const parsed = value.map(parseEquipmentItem);
  return parsed.some((row) => row === null) ? null : (parsed as SubmissionEquipment[]);
}

export function validateEquipmentList(equipment: SubmissionEquipment[]): string | null {
  const problem = validateEquipment(equipment);
  if (problem) return problem;
  for (const row of equipment) {
    if (!row.photo) continue;
    const photoProblem = validatePhotoMeta(row.photo, EQUIPMENT_PHOTO_MAX_BYTES, "기구사진");
    if (photoProblem) return photoProblem;
  }
  return null;
}
