import "server-only";

import { createClient, type SupabaseClient } from "@supabase/supabase-js";

/** 서버 라우트 전용: service_role 키는 클라이언트 번들에 포함되면 안 된다. */
export function createServiceClient(): SupabaseClient | null {
  const url = process.env.NEXT_PUBLIC_SUPABASE_URL;
  const key = process.env.SUPABASE_SERVICE_ROLE_KEY;
  if (!url || !key || url.includes("placeholder")) return null;
  return createClient(url, key, { auth: { persistSession: false, autoRefreshToken: false } });
}
