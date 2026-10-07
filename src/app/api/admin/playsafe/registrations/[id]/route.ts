import { NextResponse } from "next/server";
import { jsonError, readJson } from "@/lib/server/http";
import { deleteRegistration } from "@/lib/playsafe-workflow/server/deleteRegistration";
import { loadAdminDetail } from "@/lib/playsafe-workflow/server/loadAdminDetail";
import { requireAdminSession } from "@/lib/playsafe-workflow/server/requireAdminSession";
import { updateRegistration } from "@/lib/playsafe-workflow/server/updateRegistration";
import { prepareAdminUpdate } from "@/lib/playsafe-workflow/validation/adminUpdate";
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

export async function PATCH(request: Request, context: RouteContext) {
  const guard = await requireAdminSession();
  if (!guard.ok) return guard.response;

  const { id } = await context.params;
  if (!isUuid(id)) return jsonError("등록 정보가 올바르지 않습니다.", 400);
  const prepared = prepareAdminUpdate(await readJson(request));
  if (!prepared.ok) return jsonError(prepared.message, 400);
  const result = await updateRegistration(guard.supabase, id, prepared.value);
  if (!result.ok) return jsonError(result.message, result.status);
  return NextResponse.json({ ok: true });
}

export async function DELETE(_request: Request, context: RouteContext) {
  const guard = await requireAdminSession();
  if (!guard.ok) return guard.response;

  const { id } = await context.params;
  if (!isUuid(id)) return jsonError("등록 정보가 올바르지 않습니다.", 400);
  const result = await deleteRegistration(guard.supabase, id);
  if (result === "not_found") return jsonError("등록을 찾을 수 없습니다.", 404);
  if (result === "failed") return jsonError("삭제하지 못했습니다.", 502);
  return NextResponse.json({ ok: true });
}
