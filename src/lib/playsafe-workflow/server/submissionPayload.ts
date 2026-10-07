import "server-only";

import type { SubmissionInput } from "../submissionTypes";
import type { Submitter } from "../types";
import { pathFor, type StoredFile } from "./submissionStorage";

/** submit_playsafe_assessment RPC 인자. 사진 경로는 서버가 정한 값만 넣는다. */
export function toSubmissionPayload(input: SubmissionInput, submitter: Submitter, files: StoredFile[]) {
  return {
    submissionId: input.submissionId,
    id: input.id,
    submitter,
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
