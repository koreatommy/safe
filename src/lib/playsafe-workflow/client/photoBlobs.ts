import type { CompletedRegistration } from "@/data/playsafe/types";
import type { ChecklistSnapshot } from "@/lib/playsafe/checklistStorage";
import { compressImageBlob } from "@/lib/playsafe/compressImage";
import { checklistPhotoStore, equipmentPhotoStore } from "@/lib/playsafe/photoStore";
import { THUMBNAIL_MAX_EDGE, THUMBNAIL_QUALITY } from "../constants";
import type { PhotoMeta } from "../submissionTypes";

export type PhotoBlobs = { main: Blob; thumb: Blob };

const toThumbnail = (blob: Blob) =>
  compressImageBlob(blob, { maxEdge: THUMBNAIL_MAX_EDGE, quality: THUMBNAIL_QUALITY });

async function withThumbnail(main: Blob): Promise<PhotoBlobs> {
  return { main, thumb: await toThumbnail(main) };
}

/** 브라우저에 임시 저장된 압축 사진을 꺼내고, 관리자 목록용 썸네일을 함께 만든다. key는 기구 id 또는 평가 사진 id. */
export async function loadPhotoBlobs(
  registration: CompletedRegistration,
  snapshot: ChecklistSnapshot,
): Promise<Map<string, PhotoBlobs>> {
  const blobs = new Map<string, PhotoBlobs>();
  await Promise.all(
    registration.equipment.map(async (row) => {
      const blob = await equipmentPhotoStore.get(row.id).catch(() => undefined);
      if (blob) blobs.set(row.id, await withThumbnail(blob));
    }),
  );
  const photoIds = snapshot.records.flatMap((record) => record.photos.map((photo) => photo.id));
  await Promise.all(
    photoIds.map(async (id) => {
      const blob = await checklistPhotoStore.get(id).catch(() => undefined);
      if (!blob) throw new Error("브라우저에서 위험요소 사진을 찾지 못했습니다. 해당 사진을 지우고 다시 추가해 주세요.");
      blobs.set(id, await withThumbnail(blob));
    }),
  );
  return blobs;
}

export function photoMetaOf(blobs: Map<string, PhotoBlobs>): Map<string, PhotoMeta> {
  return new Map(
    [...blobs].map(([id, { main, thumb }]) => [
      id,
      { bytes: main.size, mimeType: main.type, thumb: { bytes: thumb.size, mimeType: thumb.type } },
    ]),
  );
}
