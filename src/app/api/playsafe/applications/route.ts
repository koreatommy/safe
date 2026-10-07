import { NextResponse } from "next/server";
import { jsonError } from "@/lib/server/http";
import { facilityPhotoPayload } from "@/lib/playsafe-workflow/server/facilityPhotoPayload";
import { readApplication } from "@/lib/playsafe-workflow/server/readApplication";
import { rpcErrorMessage } from "@/lib/playsafe-workflow/server/rpcErrors";
import { allUploaded, facilityPhotoFiles, removeSubmissionFiles } from "@/lib/playsafe-workflow/server/submissionStorage";

export async function POST(request: Request) {
  const read = await readApplication(request);
  if (!read.ok) return read.response;
  const { admin, submitter } = read.context;
  const { input } = read;

  const files = facilityPhotoFiles(input.requestId, input.facilityPhotos);
  if (!(await allUploaded(admin, files))) {
    return jsonError("사진 업로드가 끝나지 않았습니다. 다시 저장해 주세요.", 409);
  }

  const { data, error } = await admin.rpc("save_playsafe_application", {
    payload: {
      id: input.id,
      submitter,
      consentAt: input.consentAt,
      eligibilityVersion: input.eligibilityVersion,
      information: input.information,
      facilityPhotos: facilityPhotoPayload(input.facilityPhotos, files),
      answers: input.answers,
    },
  });
  if (error) {
    await removeSubmissionFiles(admin, files);
    return jsonError(rpcErrorMessage(error), 409);
  }
  return NextResponse.json(data);
}
