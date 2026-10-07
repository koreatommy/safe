import "server-only";

import type { ApplicationInput, Submitter } from "../types";
import { facilityPhotoPayload } from "./facilityPhotoPayload";
import { pathFor, type StoredFile } from "./submissionStorage";

/** save_playsafe_application RPC 인자. 사진 경로는 서버가 정한 값만 넣고, 새 사진이 없는 기구는 경로를 비워 기존 사진을 유지한다. */
export function toApplicationPayload(input: ApplicationInput, submitter: Submitter, files: StoredFile[]) {
  return {
    id: input.id,
    submitter,
    consentAt: input.consentAt,
    eligibilityVersion: input.eligibilityVersion,
    information: input.information,
    facilityPhotos: facilityPhotoPayload(input.facilityPhotos, files),
    answers: input.answers,
    ...(input.equipment
      ? {
          equipment: input.equipment.map(({ id, type, typeCode, date, memo }) => ({
            id,
            type,
            typeCode,
            date,
            memo,
            photoPath: pathFor(files, "equipment", id),
            thumbPath: pathFor(files, "equipment", id, "thumb"),
          })),
        }
      : {}),
  };
}
