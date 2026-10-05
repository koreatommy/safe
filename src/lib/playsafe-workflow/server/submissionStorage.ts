import "server-only";

import type { SupabaseClient } from "@supabase/supabase-js";
import { PLAYSAFE_BUCKETS } from "../constants";
import type { PhotoMeta, PhotoUploads, SignedUpload, SubmissionInput, SubmissionUploads } from "../submissionTypes";

type FileKind = "equipment" | "checklist";
type FileVariant = "main" | "thumb";
type StoredFile = { kind: FileKind; variant: FileVariant; key: string; bucket: string; path: string };

const extFor = (mime: string) => (mime === "image/jpeg" ? "jpg" : "webp");

function photoFiles(kind: FileKind, key: string, bucket: string, base: string, meta: PhotoMeta): StoredFile[] {
  return [
    { kind, variant: "main", key, bucket, path: `${base}.${extFor(meta.mimeType)}` },
    { kind, variant: "thumb", key, bucket, path: `${base}.thumb.${extFor(meta.thumb.mimeType)}` },
  ];
}

/** 저장 경로는 클라이언트 값이 아니라 등록 요청 id와 사진 메타데이터로 서버가 정한다. */
export function submissionFiles(input: SubmissionInput): StoredFile[] {
  const equipment = input.equipment.flatMap((row) =>
    row.photo
      ? photoFiles("equipment", row.id, PLAYSAFE_BUCKETS.equipment, `${input.submissionId}/${row.id}`, row.photo)
      : [],
  );
  const checklist = input.checklist.photos.flatMap((photo) =>
    photoFiles(
      "checklist",
      photo.id,
      PLAYSAFE_BUCKETS.checklist,
      `${input.submissionId}/${photo.itemCode}/${photo.id}`,
      photo,
    ),
  );
  return [...equipment, ...checklist];
}

export function pathFor(files: StoredFile[], kind: FileKind, key: string, variant: FileVariant = "main"): string | null {
  return files.find((file) => file.kind === kind && file.key === key && file.variant === variant)?.path ?? null;
}

export async function createSubmissionUploads(
  admin: SupabaseClient,
  files: StoredFile[],
): Promise<SubmissionUploads | null> {
  const tickets = await Promise.all(
    files.map(async (file) => {
      const { data, error } = await admin.storage.from(file.bucket).createSignedUploadUrl(file.path, { upsert: true });
      if (error || !data) return null;
      const upload: SignedUpload = { bucket: file.bucket, path: data.path, token: data.token };
      return { file, upload };
    }),
  );
  if (tickets.some((ticket) => ticket === null)) return null;

  const uploads: SubmissionUploads = { equipment: {}, checklist: {} };
  for (const ticket of tickets) {
    const { file, upload } = ticket!;
    const pair = (uploads[file.kind][file.key] ??= {} as PhotoUploads);
    pair[file.variant] = upload;
  }
  return uploads;
}

export async function allUploaded(admin: SupabaseClient, files: StoredFile[]): Promise<boolean> {
  const results = await Promise.all(files.map((file) => admin.storage.from(file.bucket).exists(file.path)));
  return results.every((result) => result.data === true);
}

export async function removeSubmissionFiles(admin: SupabaseClient, files: StoredFile[]): Promise<void> {
  const byBucket = new Map<string, string[]>();
  files.forEach((file) => byBucket.set(file.bucket, [...(byBucket.get(file.bucket) ?? []), file.path]));
  await Promise.all(
    [...byBucket].map(([bucket, paths]) => admin.storage.from(bucket).remove(paths).catch(() => undefined)),
  );
}
