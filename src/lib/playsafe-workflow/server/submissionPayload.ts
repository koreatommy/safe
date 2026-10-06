import "server-only";

import type { SubmissionInput } from "../submissionTypes";
import type { Submitter } from "../types";
import { facilityPhotoPayload } from "./facilityPhotoPayload";
import { pathFor, type StoredFile } from "./submissionStorage";

type StoredFiles = StoredFile[];

/** submit_playsafe_registration RPC 인자. 사진 경로는 서버가 정한 값만 넣는다. */
export function toSubmissionPayload(input: SubmissionInput, submitter: Submitter, files: StoredFiles) {
  return {
    submissionId: input.submissionId,
    id: input.id,
    submitter,
    consentAt: input.consentAt,
    eligibilityVersion: input.eligibilityVersion,
    information: input.information,
    facilityPhotos: facilityPhotoPayload(input.facilityPhotos, files),
    answers: input.answers,
    equipment: input.equipment.map(({ id, type, typeCode, date, memo }) => ({
      id,
      type,
      typeCode,
      date,
      memo,
      photoPath: pathFor(files, "equipment", id),
      thumbPath: pathFor(files, "equipment", id, "thumb"),
    })),
    checklist: {
      version: input.checklist.version,
      assessor: input.checklist.assessor.trim(),
      evalDate: input.checklist.evalDate,
      answers: input.checklist.answers,
      photos: input.checklist.photos.map((photo) => ({
        id: photo.id,
        itemCode: photo.itemCode,
        slot: photo.slot,
        bytes: photo.bytes,
        mimeType: photo.mimeType,
        storagePath: pathFor(files, "checklist", photo.id),
        thumbPath: pathFor(files, "checklist", photo.id, "thumb"),
      })),
    },
  };
}
