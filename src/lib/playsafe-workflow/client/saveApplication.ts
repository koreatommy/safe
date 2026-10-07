import type { FacilityPhoto } from "@/data/playsafe/types";
import { dataUrlToBlob } from "@/lib/playsafe/dataUrl";
import type { ApplicationInput, ApplicationResult } from "../types";
import { postApplication, requestApplicationUploads } from "./api";
import { photoMetaOf, withThumbnail, type PhotoBlobs } from "./photoBlobs";
import { uploadToSignedUrl } from "./photoUpload";

type ApplicationSource = Omit<ApplicationInput, "requestId" | "facilityPhotos"> & { facilityPhotos: FacilityPhoto[] };

async function facilityBlobs(photos: FacilityPhoto[]): Promise<Map<string, PhotoBlobs>> {
  const entries = await Promise.all(
    photos.map(async (photo) => {
      const blob = dataUrlToBlob(photo.photo);
      return blob ? ([photo.id, await withThumbnail(blob)] as const) : null;
    }),
  );
  return new Map(entries.filter((entry) => entry !== null));
}

/** 시설 전경사진(원본 + 썸네일)을 서명 URL로 먼저 올린 뒤 시설정보·등록신청을 저장한다. */
export async function saveApplication({ facilityPhotos, ...source }: ApplicationSource): Promise<ApplicationResult> {
  const blobs = await facilityBlobs(facilityPhotos);
  const meta = photoMetaOf(blobs);
  const input: ApplicationInput = {
    ...source,
    requestId: crypto.randomUUID(),
    facilityPhotos: facilityPhotos.flatMap((photo, index) => {
      const photoMeta = meta.get(photo.id);
      return photoMeta ? [{ id: photo.id, slot: index + 1, ...photoMeta }] : [];
    }),
  };

  if (blobs.size > 0) {
    const uploads = await requestApplicationUploads(input);
    const jobs = Object.entries(uploads.facility).flatMap(([id, tickets]) => {
      const photo = blobs.get(id)!;
      return [
        { ticket: tickets.main, blob: photo.main },
        { ticket: tickets.thumb, blob: photo.thumb },
      ];
    });
    await Promise.all(jobs.map((job) => uploadToSignedUrl(job.ticket, job.blob, job.blob.type))).catch(() => {
      throw new Error("사진을 업로드하지 못했습니다. 네트워크 상태를 확인한 뒤 다시 저장해 주세요.");
    });
  }
  return postApplication(input);
}
