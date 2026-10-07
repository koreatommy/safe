import { NextResponse } from "next/server";
import { jsonError, readJson } from "@/lib/server/http";
import { PLAYSAFE_TABLES } from "@/lib/playsafe-workflow/constants";
import { adminEditFiles, createSubmissionUploads } from "@/lib/playsafe-workflow/server/submissionStorage";
import { requireAdminSession } from "@/lib/playsafe-workflow/server/requireAdminSession";
import { prepareAdminUpload } from "@/lib/playsafe-workflow/validation/adminUpdate";
import { isUuid } from "@/lib/playsafe-workflow/validation/facility";

type RouteContext = { params: Promise<{ id: string }> };

export async function POST(request: Request, context: RouteContext) {
  const guard = await requireAdminSession();
  if (!guard.ok) return guard.response;

  const { id } = await context.params;
  if (!isUuid(id)) return jsonError("등록 정보가 올바르지 않습니다.", 400);
  const prepared = prepareAdminUpload(await readJson(request));
  if (!prepared.ok) return jsonError(prepared.message, 400);

  const { data, error } = await guard.supabase.from(PLAYSAFE_TABLES.registrations).select("id").eq("id", id).maybeSingle();
  if (error) return jsonError("사진 업로드 주소를 만들지 못했습니다. 잠시 후 다시 시도해 주세요.", 502);
  if (!data) return jsonError("등록을 찾을 수 없습니다.", 404);

  const { requestId, facilityPhotos, equipmentPhotos, checklistPhotos } = prepared.value;
  const uploads = await createSubmissionUploads(
    guard.supabase,
    adminEditFiles(
      requestId,
      facilityPhotos,
      equipmentPhotos.map((photo) => ({ id: photo.id, photo })),
      checklistPhotos,
    ),
  );
  if (!uploads) return jsonError("사진 업로드 주소를 만들지 못했습니다. 잠시 후 다시 시도해 주세요.", 502);
  return NextResponse.json(uploads);
}
