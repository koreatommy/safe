import { NextResponse } from "next/server";
import { jsonError } from "@/lib/server/http";
import { loadSavedRegistration } from "@/lib/playsafe-workflow/server/loadSavedRegistration";
import { requireSubmitter } from "@/lib/playsafe-workflow/server/requireSubmitter";
import { isUuid } from "@/lib/playsafe-workflow/validation/facility";

type RouteContext = { params: Promise<{ id: string }> };

export async function GET(request: Request, context: RouteContext) {
  const auth = requireSubmitter(request);
  if (!auth.ok) return auth.response;

  const { id } = await context.params;
  if (!isUuid(id)) return jsonError("등록 정보가 올바르지 않습니다.", 400);
  const result = await loadSavedRegistration(auth.context.admin, id, auth.context.submitter);
  if (!result.ok) return jsonError(result.message, result.status);
  return NextResponse.json(result.registration, { headers: { "Cache-Control": "no-store" } });
}
