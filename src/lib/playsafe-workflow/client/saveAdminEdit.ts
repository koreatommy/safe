import type { AdminAssessmentUpdate, AdminEquipmentInput, AdminFacilityPhotoInput, AdminRegistrationUpdate } from "../adminTypes";
import type { PhotoMeta } from "../submissionTypes";
import { newChecklistPhotos } from "../validation/adminAssessment";
import { fetchAdminUploadUrls, updateAdminRegistration } from "./adminApi";
import type { AdminEditDraft } from "./adminEditDraft";
import { adminPhotoBlobs } from "./prepareAdminPhoto";
import { photoMetaOf } from "./photoBlobs";
import { uploadToSignedUrl } from "./photoUpload";

function facilityPhotosOf(draft: AdminEditDraft, meta: Map<string, PhotoMeta>): AdminFacilityPhotoInput[] {
  return draft.facilityPhotos.map((photo) => {
    if (photo.kind === "keep") return { action: "keep", id: photo.id };
    const next = meta.get(photo.id);
    if (!next) throw new Error("사진을 준비하지 못했습니다. 다시 저장해 주세요.");
    return { action: "new", id: photo.id, ...next };
  });
}

function equipmentOf(draft: AdminEditDraft, meta: Map<string, PhotoMeta>): AdminEquipmentInput[] {
  return draft.equipment.map((row) => {
    if (row.photo.kind === "keep") return { ...row, photo: { action: "keep" } };
    if (row.photo.kind === "none") return { ...row, photo: { action: "clear" } };
    const next = meta.get(row.id);
    if (!next) throw new Error("사진을 준비하지 못했습니다. 다시 저장해 주세요.");
    return { ...row, photo: { action: "new", ...next } };
  });
}

function assessmentOf(draft: AdminEditDraft, meta: Map<string, PhotoMeta>): AdminAssessmentUpdate | null {
  if (!draft.assessment) return null;
  return {
    assessor: draft.assessment.assessor,
    evalDate: draft.assessment.evalDate,
    answers: draft.assessment.answers.map(({ itemCode, status, memo }) => ({ itemCode, status, memo })),
    photos: draft.assessment.answers.flatMap((answer) =>
      answer.status === "risk_found"
        ? answer.photos.map((photo) => {
            if (photo.kind === "keep") return { action: "keep" as const, id: photo.id, itemCode: answer.itemCode };
            const next = meta.get(photo.id);
            if (!next) throw new Error("사진을 준비하지 못했습니다. 다시 저장해 주세요.");
            return { action: "new" as const, id: photo.id, itemCode: answer.itemCode, ...next };
          })
        : [],
    ),
  };
}

/** 바뀐 사진을 올린 뒤 시설정보·전경사진·기구정보·안전성평가를 저장한다. */
export async function saveAdminEdit(registrationId: string, draft: AdminEditDraft): Promise<void> {
  const requestId = crypto.randomUUID();
  const fresh = [
    ...draft.facilityPhotos.flatMap((photo) => (photo.kind === "new" ? [{ id: photo.id, blob: photo.blob }] : [])),
    ...draft.equipment.flatMap((row) => (row.photo.kind === "new" ? [{ id: row.id, blob: row.photo.blob }] : [])),
    ...(draft.assessment?.answers.flatMap((answer) =>
      answer.photos.flatMap((photo) => (photo.kind === "new" ? [{ id: photo.id, blob: photo.blob }] : [])),
    ) ?? []),
  ];
  const blobs = new Map(await Promise.all(fresh.map(async (item) => [item.id, await adminPhotoBlobs(item.blob)] as const)));
  const meta = photoMetaOf(blobs);
  const facilityPhotos = facilityPhotosOf(draft, meta);
  const equipment = equipmentOf(draft, meta);
  const assessment = assessmentOf(draft, meta);
  const update: AdminRegistrationUpdate = {
    requestId,
    submitter: { name: draft.submitterName, email: draft.submitterEmail },
    information: draft.information,
    facilityPhotos,
    equipment,
    assessment,
  };

  if (blobs.size > 0) {
    const uploads = await fetchAdminUploadUrls(registrationId, {
      requestId,
      facilityPhotos: facilityPhotos.flatMap((photo, index) =>
        photo.action === "new" ? [{ id: photo.id, slot: index + 1, bytes: photo.bytes, mimeType: photo.mimeType, thumb: photo.thumb }] : [],
      ),
      equipmentPhotos: equipment.flatMap((row) => (row.photo.action === "new" ? [{ id: row.id, ...row.photo }] : [])),
      checklistPhotos: assessment ? newChecklistPhotos(assessment) : [],
    });
    const jobs = [...Object.entries(uploads.facility), ...Object.entries(uploads.equipment), ...Object.entries(uploads.checklist)].flatMap(([id, tickets]) => {
      const photo = blobs.get(id);
      if (!photo || !tickets.main || !tickets.thumb) return [];
      return [
        { ticket: tickets.main, blob: photo.main },
        { ticket: tickets.thumb, blob: photo.thumb },
      ];
    });
    if (jobs.length !== blobs.size * 2) throw new Error("사진 업로드 주소를 만들지 못했습니다. 다시 저장해 주세요.");
    await Promise.all(jobs.map((job) => uploadToSignedUrl(job.ticket, job.blob, job.blob.type))).catch(() => {
      throw new Error("사진을 업로드하지 못했습니다. 네트워크 상태를 확인한 뒤 다시 저장해 주세요.");
    });
  }

  await updateAdminRegistration(registrationId, update);
}
