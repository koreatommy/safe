import { NextResponse } from "next/server";
import { jsonError } from "@/lib/server/http";
import { readSubmission } from "@/lib/playsafe-workflow/server/readSubmission";
import { rpcErrorMessage } from "@/lib/playsafe-workflow/server/rpcErrors";
import { toSubmissionPayload } from "@/lib/playsafe-workflow/server/submissionPayload";
import { allUploaded, removeSubmissionFiles, submissionFiles } from "@/lib/playsafe-workflow/server/submissionStorage";

export async function POST(request: Request) {
  const read = await readSubmission(request);
  if (!read.ok) return read.response;
  const { admin, submitter } = read.context;

  const files = submissionFiles(read.input);
  if (!(await allUploaded(admin, files))) {
    return jsonError("사진 업로드가 끝나지 않았습니다. 다시 등록해 주세요.", 409);
  }

  const { data, error } = await admin.rpc("submit_playsafe_registration", {
    payload: toSubmissionPayload(read.input, submitter, files),
  });
  if (error) {
    await removeSubmissionFiles(admin, files);
    return jsonError(rpcErrorMessage(error), 409);
  }
  const result = (data ?? {}) as { registrationId?: string; idempotent?: boolean };
  return NextResponse.json({ registrationId: result.registrationId ?? "", idempotent: Boolean(result.idempotent) });
}
