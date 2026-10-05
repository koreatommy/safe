import { MAX_SOURCE_BYTES, MAX_STORED_BYTES, PHOTO_PRESETS } from "@/data/playsafe/checklist-photos";
import type { CheckPhoto } from "@/data/playsafe/types";
import { compressImageToBudget, UnsupportedImageError } from "./compressImage";
import { checklistPhotoStore } from "./photoStore";

export class CheckPhotoError extends Error {}

/** Compresses a picked image and stores the Blob in IndexedDB, returning only its metadata. */
export async function prepareCheckPhoto(file: File): Promise<CheckPhoto> {
  if (!file.type.startsWith("image/")) throw new CheckPhotoError("이미지 파일만 등록할 수 있습니다.");
  if (file.size > MAX_SOURCE_BYTES) throw new CheckPhotoError("30MB 이하 사진을 선택해 주세요.");

  const blob = await compressImageToBudget(file, PHOTO_PRESETS, MAX_STORED_BYTES).catch((cause: unknown) => {
    if (cause instanceof UnsupportedImageError) throw new CheckPhotoError(cause.message);
    throw cause;
  });
  if (!blob) throw new CheckPhotoError("사진을 줄이지 못했습니다. 다른 사진을 선택해 주세요.");

  const photo: CheckPhoto = { id: crypto.randomUUID(), bytes: blob.size, type: blob.type || file.type };
  await checklistPhotoStore.put(photo.id, blob).catch(() => {
    throw new CheckPhotoError("브라우저 저장 공간이 부족해 사진을 저장하지 못했습니다.");
  });
  return photo;
}
