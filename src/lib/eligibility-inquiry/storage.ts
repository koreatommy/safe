import type { SupabaseClient } from "@supabase/supabase-js";
import { ATTACHMENT_URL_TTL_SECONDS, ELIGIBILITY_INQUIRY_BUCKET } from "./constants";
import type { InquiryAttachment, InquiryAttachmentWithUrl, UploadFileMeta, UploadTicket } from "./types";
import { attachmentContentType, fileExtension } from "./validation";

function monthFolder(date = new Date()): string {
  return `${date.getFullYear()}-${String(date.getMonth() + 1).padStart(2, "0")}`;
}

/** 스토리지 키는 ASCII만 허용되므로 원본 파일명 대신 `월/uuid/순번.확장자`로 저장한다. */
export async function createUploadTickets(
  supabase: SupabaseClient,
  files: UploadFileMeta[],
): Promise<UploadTicket[]> {
  const folder = `${monthFolder()}/${crypto.randomUUID()}`;
  const bucket = supabase.storage.from(ELIGIBILITY_INQUIRY_BUCKET);

  return Promise.all(
    files.map(async (file, index) => {
      const path = `${folder}/${index}.${fileExtension(file.name)}`;
      const { data, error } = await bucket.createSignedUploadUrl(path);
      if (error || !data) throw new Error(error?.message ?? "signed upload url failed");
      return { path: data.path, token: data.token, contentType: attachmentContentType(file.name) ?? "application/octet-stream" };
    }),
  );
}

export async function attachmentsExist(supabase: SupabaseClient, attachments: InquiryAttachment[]): Promise<boolean> {
  const bucket = supabase.storage.from(ELIGIBILITY_INQUIRY_BUCKET);
  const results = await Promise.all(attachments.map((a) => bucket.exists(a.path)));
  return results.every((r) => r.data === true);
}

export async function signAttachments(
  supabase: SupabaseClient,
  attachments: InquiryAttachment[],
): Promise<InquiryAttachmentWithUrl[]> {
  if (attachments.length === 0) return [];
  const { data } = await supabase.storage
    .from(ELIGIBILITY_INQUIRY_BUCKET)
    .createSignedUrls(attachments.map((a) => a.path), ATTACHMENT_URL_TTL_SECONDS);
  return attachments.map((a, i) => ({ ...a, url: data?.[i]?.signedUrl ?? null }));
}

export async function removeAttachments(supabase: SupabaseClient, attachments: InquiryAttachment[]) {
  if (attachments.length === 0) return;
  const { error } = await supabase.storage.from(ELIGIBILITY_INQUIRY_BUCKET).remove(attachments.map((a) => a.path));
  if (error) console.error("[eligibility-inquiries] attachment cleanup failed", error.message);
}
