import { MAX_SOURCE_BYTES, MAX_STORED_BYTES, PHOTO_PRESETS } from "@/data/playsafe/checklist-photos";
import { MAX_PHOTO_BYTES, PHOTO_MAX_EDGE, PHOTO_QUALITY } from "@/data/playsafe/facility-registration";
import { compressImageToBudget, UnsupportedImageError } from "@/lib/playsafe/compressImage";
import { EQUIPMENT_PHOTO_MAX_BYTES, THUMBNAIL_MAX_BYTES, THUMBNAIL_MAX_EDGE } from "../constants";
import { withThumbnail, type PhotoBlobs } from "./photoBlobs";

const THUMB_PRESETS = [
  { maxEdge: THUMBNAIL_MAX_EDGE, quality: 0.6 },
  { maxEdge: 240, quality: 0.45 },
  { maxEdge: 160, quality: 0.4 },
];

/** 관리자 수정에서 고른 사진을 저장 가능한 WebP/JPEG로 줄인다. */
export async function prepareAdminPhoto(file: File): Promise<Blob> {
  if (!file.type.startsWith("image/") || file.size > MAX_PHOTO_BYTES) {
    throw new Error("10MB 이하 이미지 파일을 선택해 주세요.");
  }
  try {
    const blob = await compressImageToBudget(
      file,
      [
        { maxEdge: PHOTO_MAX_EDGE, quality: PHOTO_QUALITY },
        { maxEdge: 1280, quality: 0.7 },
        { maxEdge: 1024, quality: 0.6 },
      ],
      EQUIPMENT_PHOTO_MAX_BYTES,
    );
    if (!blob) throw new Error("사진이 너무 큽니다. 더 작은 사진을 선택해 주세요.");
    return blob;
  } catch (cause) {
    if (cause instanceof UnsupportedImageError) throw new Error(cause.message);
    if (cause instanceof Error && cause.message.startsWith("사진이")) throw cause;
    throw new Error("사진을 읽지 못했습니다.");
  }
}

/** 위험요소 사진은 항목당 저장 한도(300KB)에 맞게 줄인다. */
export async function prepareAdminChecklistPhoto(file: File): Promise<Blob> {
  if (!file.type.startsWith("image/")) throw new Error("이미지 파일만 등록할 수 있습니다.");
  if (file.size > MAX_SOURCE_BYTES) throw new Error("30MB 이하 사진을 선택해 주세요.");
  try {
    const blob = await compressImageToBudget(file, PHOTO_PRESETS, MAX_STORED_BYTES);
    if (!blob) throw new Error("사진을 줄이지 못했습니다. 다른 사진을 선택해 주세요.");
    return blob;
  } catch (cause) {
    if (cause instanceof UnsupportedImageError) throw new Error(cause.message);
    if (cause instanceof Error && cause.message.startsWith("사진")) throw cause;
    throw new Error("사진을 읽지 못했습니다.");
  }
}

export async function adminPhotoBlobs(blob: Blob): Promise<PhotoBlobs> {
  const photo = await withThumbnail(blob);
  if (photo.thumb.size <= THUMBNAIL_MAX_BYTES) return photo;
  const thumb = await compressImageToBudget(blob, THUMB_PRESETS, THUMBNAIL_MAX_BYTES);
  if (!thumb) throw new Error("썸네일을 만들지 못했습니다. 다른 사진을 선택해 주세요.");
  return { main: photo.main, thumb };
}
