import "server-only";

import type { SupabaseClient } from "@supabase/supabase-js";
import type { NextResponse } from "next/server";
import { isAdminRequest } from "@/lib/server/adminSession";
import { jsonError, serviceUnavailable } from "@/lib/server/http";
import { createServiceClient } from "@/lib/server/supabaseAdmin";

type AdminGuard = { ok: true; supabase: SupabaseClient } | { ok: false; response: NextResponse };

/** /admin 비밀번호 세션을 확인한 뒤 service_role 클라이언트를 돌려준다. */
export async function requireAdminSession(): Promise<AdminGuard> {
  if (!(await isAdminRequest())) return { ok: false, response: jsonError("관리자 인증이 필요합니다.", 401) };
  const supabase = createServiceClient();
  if (!supabase) return { ok: false, response: serviceUnavailable() };
  return { ok: true, supabase };
}
