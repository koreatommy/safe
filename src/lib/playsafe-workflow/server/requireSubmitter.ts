import "server-only";

import type { SupabaseClient } from "@supabase/supabase-js";
import type { NextResponse } from "next/server";
import { isAssessmentRequest } from "@/lib/server/assessmentSession";
import { jsonError, serviceUnavailable } from "@/lib/server/http";
import { createServiceClient } from "@/lib/server/supabaseAdmin";
import { SUBMITTER_HEADERS } from "../constants";
import type { Submitter } from "../types";
import { normalizeSubmitter, validateSubmitter } from "../validation/submitter";

export type SubmitterContext = { admin: SupabaseClient; submitter: Submitter };

type SubmitterResult =
  | { ok: true; context: SubmitterContext }
  | { ok: false; response: NextResponse };

function decodeHeader(value: string | null): string {
  if (!value) return "";
  try {
    return decodeURIComponent(value);
  } catch {
    return "";
  }
}

export function readSubmitter(request: Request): Submitter {
  return normalizeSubmitter({
    name: decodeHeader(request.headers.get(SUBMITTER_HEADERS.name)),
    email: decodeHeader(request.headers.get(SUBMITTER_HEADERS.email)),
  });
}

/** 비밀번호 세션·입력자 헤더를 확인한 뒤 DB 접근은 service_role로만 한다. */
export async function requireSubmitter(request: Request): Promise<SubmitterResult> {
  if (!(await isAssessmentRequest())) {
    return { ok: false, response: jsonError("안전성평가 로그인이 필요합니다.", 401) };
  }
  const admin = createServiceClient();
  if (!admin) return { ok: false, response: serviceUnavailable() };
  const submitter = readSubmitter(request);
  const problem = validateSubmitter(submitter);
  if (problem) return { ok: false, response: jsonError(problem, 401) };
  return { ok: true, context: { admin, submitter } };
}
