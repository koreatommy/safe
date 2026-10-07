import type { EquipmentRow, FacilityPhoto } from "@/data/playsafe/types";
import { dataUrlToBlob } from "@/lib/playsafe/dataUrl";
import type { SubmissionEquipment } from "../submissionTypes";
import type { ApplicationInput, ApplicationResult } from "../types";
import { typeCodeForTitle } from "../validation/facility";
import { postApplication, requestApplicationUploads } from "./api";
import { photoMetaOf, withThumbnail, type PhotoBlobs } from "./photoBlobs";
import { uploadToSignedUrl } from "./photoUpload";

type EquipmentSource = {
  rows: readonly EquipmentRow[];
  /** 이미 DB에 사진이 저장된 기구 id. 다시 올리지 않고 서버에 기존 사진 유지를 맡긴다. */
  storedPhotoIds: ReadonlySet<string>;
};

type ApplicationSource = Omit<ApplicationInput, "requestId" | "facilityPhotos" | "equipment"> & {
  facilityPhotos: FacilityPhoto[];
  equipment?: EquipmentSource;
};

async function photoBlobs(items: readonly { id: string; photo: string }[]): Promise<Map<string, PhotoBlobs>> {
  const entries = await Promise.all(
    items.map(async (item) => {
      const blob = item.photo ? dataUrlToBlob(item.photo) : null;
      return blob ? ([item.id, await withThumbnail(blob)] as const) : null;
    }),
  );
  return new Map(entries.filter((entry) => entry !== null));
}

function equipmentInput(source: EquipmentSource, meta: ReturnType<typeof photoMetaOf>): SubmissionEquipment[] {
  return source.rows.map((row) => ({
    id: row.id,
    type: row.type,
    typeCode: typeCodeForTitle(row.type),
    date: row.date,
    memo: row.memo,
    photo: meta.get(row.id) ?? null,
  }));
}

/** 새 사진(원본 + 썸네일)을 서명 URL로 먼저 올린 뒤 시설정보·등록신청(·기구정보)을 저장한다. */
export async function saveApplication({ facilityPhotos, equipment, ...source }: ApplicationSource): Promise<ApplicationResult> {
  const newEquipmentPhotos = (equipment?.rows ?? []).filter((row) => !equipment?.storedPhotoIds.has(row.id));
  const blobs = await photoBlobs([...facilityPhotos, ...newEquipmentPhotos]);
  const meta = photoMetaOf(blobs);
  const input: ApplicationInput = {
    ...source,
    requestId: crypto.randomUUID(),
    facilityPhotos: facilityPhotos.flatMap((photo, index) => {
      const photoMeta = meta.get(photo.id);
      return photoMeta ? [{ id: photo.id, slot: index + 1, ...photoMeta }] : [];
    }),
    ...(equipment ? { equipment: equipmentInput(equipment, meta) } : {}),
  };

  if (blobs.size > 0) {
    const uploads = await requestApplicationUploads(input);
    const jobs = [...Object.entries(uploads.facility), ...Object.entries(uploads.equipment)].flatMap(([id, tickets]) => {
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
