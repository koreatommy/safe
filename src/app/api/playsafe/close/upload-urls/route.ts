import { NextResponse } from "next/server";
import { jsonError } from "@/lib/server/http";
import { readClose } from "@/lib/playsafe-workflow/server/readClose";
import { createSubmissionUploads, facilityPhotoFiles } from "@/lib/playsafe-workflow/server/submissionStorage";

export async function POST(request: Request) {
  const read = await readClose(request);
  if (!read.ok) return read.response;

  const files = facilityPhotoFiles(read.input.requestId, read.input.facilityPhotos);
  const uploads = await createSubmissionUploads(read.context.admin, files);
  if (!uploads) return jsonError("사진 업로드 주소를 만들지 못했습니다. 잠시 후 다시 시도해 주세요.", 502);
  return NextResponse.json(uploads);
}
