import type { ChecklistSnapshot } from "@/lib/playsafe/checklistStorage";
import { toSubmissionInput } from "../submissionMapper";
import type { SubmissionResult, SubmissionUploads } from "../submissionTypes";
import { validateSubmissionInput } from "../validation/submission";
import { requestSubmissionUploads, submitRegistration } from "./api";
import { loadChecklistPhotoBlobs, photoMetaOf, type PhotoBlobs } from "./photoBlobs";
import { uploadToSignedUrl } from "./photoUpload";
import { loadSubmitter } from "./submitterStore";

type SubmitAssessmentOptions = {
  submissionId: string;
  registrationId: string;
  snapshot: ChecklistSnapshot;
  onProgress: (done: number, total: number) => void;
};

function uploadJobs(uploads: SubmissionUploads, blobs: Map<string, PhotoBlobs>) {
  return Object.entries(uploads.checklist).flatMap(([id, tickets]) => {
    const photo = blobs.get(id)!;
    return [
      { ticket: tickets.main, blob: photo.main },
      { ticket: tickets.thumb, blob: photo.thumb },
    ];
  });
}

/** 위험요소 사진(원본 압축본 + 썸네일)을 서명 URL로 먼저 올린 뒤, DB에 저장된 등록에 안전성평가를 등록한다. */
export async function submitAssessment({
  submissionId,
  registrationId,
  snapshot,
  onProgress,
}: SubmitAssessmentOptions): Promise<SubmissionResult> {
  if (!loadSubmitter()) throw new Error("입력자 정보가 없습니다. 시설정보입력에서 입력자 이름·이메일을 확인해 주세요.");

  const blobs = await loadChecklistPhotoBlobs(snapshot);
  const input = toSubmissionInput({ submissionId, registrationId, snapshot, photoMeta: photoMetaOf(blobs) });
  const problem = validateSubmissionInput(input);
  if (problem) throw new Error(problem);

  if (blobs.size > 0) {
    const jobs = uploadJobs(await requestSubmissionUploads(input), blobs);
    let done = 0;
    onProgress(done, jobs.length);
    for (const job of jobs) {
      await uploadToSignedUrl(job.ticket, job.blob, job.blob.type).catch(() => {
        throw new Error("사진을 업로드하지 못했습니다. 네트워크 상태를 확인한 뒤 다시 등록해 주세요.");
      });
      done += 1;
      onProgress(done, jobs.length);
    }
  }
  return submitRegistration(input);
}
