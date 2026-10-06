import "server-only";

import type { SupabaseClient } from "@supabase/supabase-js";
import { PLAYSAFE_BUCKETS, PLAYSAFE_TABLES } from "../constants";
import type { FacilityPhotoDto } from "../types";
import { signStoragePaths } from "./signStoragePaths";

/** 등록에 연결된 시설 전경사진을 slot 순서로, 원본·썸네일 서명 URL과 함께 불러온다. */
export async function loadFacilityPhotoView(
  supabase: SupabaseClient,
  registrationId: string,
): Promise<FacilityPhotoDto[]> {
  const { data } = await supabase
    .from(PLAYSAFE_TABLES.facilityPhotos)
    .select("id, slot, photo_path, thumb_path")
    .eq("registration_id", registrationId)
    .order("slot");
  const rows = data ?? [];
  const urls = await signStoragePaths(
    supabase,
    PLAYSAFE_BUCKETS.facility,
    rows.flatMap((row) => [row.photo_path as string, row.thumb_path as string | null]),
  );
  return rows.map((row) => {
    const url = urls.get(row.photo_path as string) ?? null;
    return {
      id: row.id as string,
      slot: row.slot as number,
      url,
      thumbUrl: urls.get(row.thumb_path as string) ?? url,
    };
  });
}
