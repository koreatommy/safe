import type { FacilityPhoto } from "@/data/playsafe/types";
import { dataUrlToBlob } from "@/lib/playsafe/dataUrl";
import type { CloseRegistrationInput, CloseRegistrationResult } from "../types";
import { closeRegistration, requestCloseUploads } from "./api";
import { photoMetaOf, withThumbnail, type PhotoBlobs } from "./photoBlobs";
import { uploadToSignedUrl } from "./photoUpload";

type CloseSource = Omit<CloseRegistrationInput, "requestId" | "facilityPhotos"> & { facilityPhotos: FacilityPhoto[] };

async function facilityBlobs(photos: FacilityPhoto[]): Promise<Map<string, PhotoBlobs>> {
  const entries = await Promise.all(
    photos.map(async (photo) => {
      const blob = dataUrlToBlob(photo.photo);
      return blob ? ([photo.id, await withThumbnail(blob)] as const) : null;
    }),
  );
  return new Map(entries.filter((entry) => entry !== null));
}

/** 시설 전경사진(원본 + 썸네일)을 서명 URL로 먼저 올린 뒤 대상 아님으로 종결한다. */
export async function closeWithPhotos({ facilityPhotos, ...source }: CloseSource): Promise<CloseRegistrationResult> {
  const blobs = await facilityBlobs(facilityPhotos);
  const meta = photoMetaOf(blobs);
  const input: CloseRegistrationInput = {
    ...source,
    requestId: crypto.randomUUID(),
    facilityPhotos: facilityPhotos.flatMap((photo, index) => {
      const photoMeta = meta.get(photo.id);
      return photoMeta ? [{ id: photo.id, slot: index + 1, ...photoMeta }] : [];
    }),
  };

  if (blobs.size > 0) {
    const uploads = await requestCloseUploads(input);
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
  return closeRegistration(input);
}
