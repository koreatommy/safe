import { NextResponse } from "next/server";
import { jsonError } from "@/lib/server/http";
import { loadAdminDetail } from "@/lib/playsafe-workflow/server/loadAdminDetail";
import { requireAdminSession } from "@/lib/playsafe-workflow/server/requireAdminSession";
import { isUuid } from "@/lib/playsafe-workflow/validation/facility";

type RouteContext = { params: Promise<{ id: string }> };

export async function GET(_request: Request, context: RouteContext) {
  const guard = await requireAdminSession();
  if (!guard.ok) return guard.response;

  const { id } = await context.params;
  if (!isUuid(id)) return jsonError("등록 정보가 올바르지 않습니다.", 400);
  const detail = await loadAdminDetail(guard.supabase, id);
  if (!detail) return jsonError("등록을 찾을 수 없습니다.", 404);
  return NextResponse.json(detail);
}
