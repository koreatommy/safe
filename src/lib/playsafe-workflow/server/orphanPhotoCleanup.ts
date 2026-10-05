import "server-only";

import type { SupabaseClient } from "@supabase/supabase-js";

const MIN_AGE = "24 hours";
const MAX_ROWS_PER_RUN = 1000;

type OrphanRow = { bucket_id: string; name: string };

/** 업로드 후 24시간이 지나도 어떤 등록에도 연결되지 않은 사진 파일을 지우고 삭제 개수를 돌려준다. */
export async function removeOrphanPhotos(admin: SupabaseClient): Promise<number | null> {
  const { data, error } = await admin.rpc("playsafe_orphan_storage_objects", {
    min_age: MIN_AGE,
    max_rows: MAX_ROWS_PER_RUN,
  });
  if (error) return null;

  const byBucket = new Map<string, string[]>();
  for (const row of (data ?? []) as OrphanRow[]) {
    byBucket.set(row.bucket_id, [...(byBucket.get(row.bucket_id) ?? []), row.name]);
  }

  let removed = 0;
  for (const [bucket, paths] of byBucket) {
    const { data: deleted, error: removeError } = await admin.storage.from(bucket).remove(paths);
    if (removeError) return null;
    removed += deleted?.length ?? 0;
  }
  return removed;
}
