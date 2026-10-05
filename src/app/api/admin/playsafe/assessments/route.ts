import { NextResponse } from "next/server";
import { jsonError } from "@/lib/server/http";
import type { AssessmentSearchField } from "@/lib/playsafe-workflow/adminTypes";
import { listAssessments } from "@/lib/playsafe-workflow/server/adminAssessmentQueries";
import { requireAdminSession } from "@/lib/playsafe-workflow/server/requireAdminSession";

const KEYWORD_MAX_LENGTH = 100;
const SEARCH_FIELDS: readonly AssessmentSearchField[] = ["facility", "assessor", "submitter"];
const UUID_PATTERN = /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i;

const fieldParam = (value: string | null): AssessmentSearchField =>
  SEARCH_FIELDS.includes(value as AssessmentSearchField) ? (value as AssessmentSearchField) : "facility";

const registrationParam = (value: string | null) => (value && UUID_PATTERN.test(value) ? value : undefined);

function pageParam(value: string | null): number {
  const page = Number(value);
  return Number.isInteger(page) && page > 0 ? page : 1;
}

export async function GET(request: Request) {
  const guard = await requireAdminSession();
  if (!guard.ok) return guard.response;

  const params = new URL(request.url).searchParams;
  const search = {
    field: fieldParam(params.get("field")),
    keyword: (params.get("q") ?? "").trim().slice(0, KEYWORD_MAX_LENGTH),
    registrationId: registrationParam(params.get("registrationId")),
  };
  const result = await listAssessments(guard.supabase, search, pageParam(params.get("page")));
  if (!result) return jsonError("안전성평가 목록을 불러오지 못했습니다.", 502);
  return NextResponse.json(result);
}
