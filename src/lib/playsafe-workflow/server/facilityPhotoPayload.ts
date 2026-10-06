import "server-only";

import type { SubmissionFacilityPhoto } from "../submissionTypes";
import { pathFor, type StoredFile } from "./submissionStorage";

/** RPC에 넘기는 시설 전경사진. 경로는 서버가 정한 값만 넣는다. */
export function facilityPhotoPayload(photos: SubmissionFacilityPhoto[], files: StoredFile[]) {
  return photos.map((photo) => ({
    id: photo.id,
    slot: photo.slot,
    bytes: photo.bytes,
    mimeType: photo.mimeType,
    photoPath: pathFor(files, "facility", photo.id),
    thumbPath: pathFor(files, "facility", photo.id, "thumb"),
  }));
}
