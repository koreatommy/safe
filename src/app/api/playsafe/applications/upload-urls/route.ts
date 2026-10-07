import { NextResponse } from "next/server";
import { jsonError } from "@/lib/server/http";
import { readApplication } from "@/lib/playsafe-workflow/server/readApplication";
import { applicationFiles, createSubmissionUploads } from "@/lib/playsafe-workflow/server/submissionStorage";

export async function POST(request: Request) {
  const read = await readApplication(request);
  if (!read.ok) return read.response;

  const uploads = await createSubmissionUploads(read.context.admin, applicationFiles(read.input));
  if (!uploads) return jsonError("사진 업로드 주소를 만들지 못했습니다. 잠시 후 다시 시도해 주세요.", 502);
  return NextResponse.json(uploads);
}
