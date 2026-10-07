import { NextResponse } from "next/server";
import { jsonError } from "@/lib/server/http";
import { PLAYSAFE_TABLES } from "@/lib/playsafe-workflow/constants";
import type { ApplicationResult } from "@/lib/playsafe-workflow/types";
import { toApplicationPayload } from "@/lib/playsafe-workflow/server/applicationPayload";
import { readApplication } from "@/lib/playsafe-workflow/server/readApplication";
import { rpcErrorMessage } from "@/lib/playsafe-workflow/server/rpcErrors";
import { allUploaded, applicationFiles, removeSubmissionFiles } from "@/lib/playsafe-workflow/server/submissionStorage";

export async function POST(request: Request) {
  const read = await readApplication(request);
  if (!read.ok) return read.response;
  const { admin, submitter } = read.context;
  const { input } = read;

  const files = applicationFiles(input);
  if (!(await allUploaded(admin, files))) {
    return jsonError("사진 업로드가 끝나지 않았습니다. 다시 저장해 주세요.", 409);
  }

  const { data, error } = await admin.rpc("save_playsafe_application", {
    payload: toApplicationPayload(input, submitter, files),
  });
  if (error) {
    await removeSubmissionFiles(admin, files);
    return jsonError(rpcErrorMessage(error), 409);
  }
  const result = data as Omit<ApplicationResult, "facilityNo">;
  const { data: row } = await admin
    .from(PLAYSAFE_TABLES.registrations)
    .select("facility_no")
    .eq("id", result.registrationId)
    .maybeSingle();
  return NextResponse.json({ ...result, facilityNo: (row?.facility_no as string | undefined) ?? "" });
}
