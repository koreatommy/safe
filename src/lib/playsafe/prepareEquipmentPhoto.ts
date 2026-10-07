import { MAX_PHOTO_BYTES, PHOTO_MAX_EDGE, PHOTO_QUALITY } from "@/data/playsafe/facility-registration";
import { compressImage, UnsupportedImageError } from "./compressImage";
import { formatBytes } from "./formatBytes";

export class EquipmentPhotoError extends Error {}

/** 선택한 기구사진을 검사·압축해 미리보기용 data URL과 표시 이름을 돌려준다. */
export async function prepareEquipmentPhoto(file: File): Promise<{ photo: string; name: string }> {
  if (!file.type.startsWith("image/") || file.size > MAX_PHOTO_BYTES) {
    throw new EquipmentPhotoError("10MB 이하 이미지 파일을 선택해 주세요.");
  }
  try {
    const { dataUrl, bytes } = await compressImage(file, { maxEdge: PHOTO_MAX_EDGE, quality: PHOTO_QUALITY });
    return { photo: dataUrl, name: `${file.name} (${formatBytes(file.size)} → ${formatBytes(bytes)})` };
  } catch (cause) {
    throw new EquipmentPhotoError(cause instanceof UnsupportedImageError ? cause.message : "사진을 읽지 못했습니다.");
  }
}
