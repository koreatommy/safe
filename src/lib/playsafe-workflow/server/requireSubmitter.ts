import "server-only";

import type { SupabaseClient } from "@supabase/supabase-js";
import type { NextResponse } from "next/server";
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

/** 사용자 라우트는 입력자 이름·이메일 헤더로 식별하고, DB 접근은 service_role로만 한다. */
export function requireSubmitter(request: Request): SubmitterResult {
  const admin = createServiceClient();
  if (!admin) return { ok: false, response: serviceUnavailable() };
  const submitter = readSubmitter(request);
  const problem = validateSubmitter(submitter);
  if (problem) return { ok: false, response: jsonError(problem, 401) };
  return { ok: true, context: { admin, submitter } };
}
