import { NextResponse } from "next/server";
import { jsonError } from "@/lib/server/http";
import type { TargetFilter } from "@/lib/playsafe-workflow/adminTypes";
import { listRegistrations } from "@/lib/playsafe-workflow/server/adminQueries";
import { requireAdminSession } from "@/lib/playsafe-workflow/server/requireAdminSession";

const KEYWORD_MAX_LENGTH = 100;
const TARGET_FILTERS: readonly TargetFilter[] = ["all", "target", "not_target"];

const targetParam = (value: string | null): TargetFilter =>
  TARGET_FILTERS.includes(value as TargetFilter) ? (value as TargetFilter) : "all";

function pageParam(value: string | null): number {
  const page = Number(value);
  return Number.isInteger(page) && page > 0 ? page : 1;
}

export async function GET(request: Request) {
  const guard = await requireAdminSession();
  if (!guard.ok) return guard.response;

  const params = new URL(request.url).searchParams;
  const keyword = (params.get("q") ?? "").trim().slice(0, KEYWORD_MAX_LENGTH);
  const search = { keyword, target: targetParam(params.get("target")) };
  const result = await listRegistrations(guard.supabase, search, pageParam(params.get("page")));
  if (!result) return jsonError("등록 목록을 불러오지 못했습니다.", 502);
  return NextResponse.json(result);
}
