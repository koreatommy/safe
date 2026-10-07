import "server-only";

import type { SupabaseClient } from "@supabase/supabase-js";
import { PLAYSAFE_BUCKETS, PLAYSAFE_TABLES } from "../constants";

type PathRow = Record<string, string | null>;

const pathsOf = (rows: PathRow[] | null, keys: string[]) =>
  (rows ?? []).flatMap((row) => keys.map((key) => row[key])).filter((path): path is string => Boolean(path));

async function collectPhotoPaths(admin: SupabaseClient, registrationId: string) {
  const [equipment, facility, assessments] = await Promise.all([
    admin.from(PLAYSAFE_TABLES.equipment).select("photo_path, thumb_path").eq("registration_id", registrationId),
    admin.from(PLAYSAFE_TABLES.facilityPhotos).select("photo_path, thumb_path").eq("registration_id", registrationId),
    admin.from(PLAYSAFE_TABLES.assessments).select("id").eq("registration_id", registrationId),
  ]);
  const assessmentIds = (assessments.data ?? []).map((row) => row.id as string);
  const checklist = assessmentIds.length
    ? await admin.from(PLAYSAFE_TABLES.photos).select("storage_path, thumb_path").in("assessment_id", assessmentIds)
    : { data: [] };

  return new Map<string, string[]>([
    [PLAYSAFE_BUCKETS.equipment, pathsOf(equipment.data, ["photo_path", "thumb_path"])],
    [PLAYSAFE_BUCKETS.facility, pathsOf(facility.data, ["photo_path", "thumb_path"])],
    [PLAYSAFE_BUCKETS.checklist, pathsOf(checklist.data, ["storage_path", "thumb_path"])],
  ]);
}

/**
 * 등록 행을 지우면 기구·전경사진·안전성평가·답변·평가사진 행은 FK cascade로 함께 지워진다.
 * Storage 파일은 cascade 대상이 아니므로 행 삭제 전에 경로를 모아 두었다가 지운다.
 */
export async function deleteRegistration(
  admin: SupabaseClient,
  registrationId: string,
): Promise<"deleted" | "not_found" | "failed"> {
  const photoPaths = await collectPhotoPaths(admin, registrationId);

  const { data, error } = await admin.from(PLAYSAFE_TABLES.registrations).delete().eq("id", registrationId).select("id");
  if (error) return "failed";
  if (!data?.length) return "not_found";

  await Promise.all(
    [...photoPaths]
      .filter(([, paths]) => paths.length > 0)
      .map(([bucket, paths]) => admin.storage.from(bucket).remove(paths).catch(() => undefined)),
  );
  return "deleted";
}
