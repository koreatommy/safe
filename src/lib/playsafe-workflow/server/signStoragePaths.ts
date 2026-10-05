import "server-only";

import type { SupabaseClient } from "@supabase/supabase-js";
import { SIGNED_URL_TTL_SECONDS } from "../constants";

/** 한 번의 요청으로 여러 경로의 서명 URL을 만든다. 실패한 경로는 결과에 없다. */
export async function signStoragePaths(
  supabase: SupabaseClient,
  bucket: string,
  paths: Array<string | null | undefined>,
): Promise<Map<string, string>> {
  const unique = [...new Set(paths.filter((path): path is string => Boolean(path)))];
  if (unique.length === 0) return new Map();
  const { data } = await supabase.storage.from(bucket).createSignedUrls(unique, SIGNED_URL_TTL_SECONDS);
  return new Map(
    (data ?? []).flatMap((row) => (row.path && row.signedUrl && !row.error ? [[row.path, row.signedUrl] as const] : [])),
  );
}
