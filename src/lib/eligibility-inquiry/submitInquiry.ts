import { getSupabaseClient } from "@/lib/supabase";
import { ELIGIBILITY_INQUIRY_BUCKET } from "./constants";
import type { EligibilityInquiryInput, InquiryAttachment, UploadTicket } from "./types";

type SubmitResult = { ok: true } | { ok: false; error: string };

async function postJson<T>(url: string, body: unknown): Promise<T> {
  const res = await fetch(url, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(body),
  });
  const data = (await res.json().catch(() => ({}))) as T & { error?: string };
  if (!res.ok) throw new Error(data.error ?? "요청에 실패했습니다.");
  return data;
}

async function uploadFiles(files: File[]): Promise<InquiryAttachment[]> {
  if (files.length === 0) return [];
  const { tickets } = await postJson<{ tickets: UploadTicket[] }>("/api/eligibility-inquiries/upload-urls", {
    files: files.map((f) => ({ name: f.name, size: f.size })),
  });

  const bucket = getSupabaseClient().storage.from(ELIGIBILITY_INQUIRY_BUCKET);
  return Promise.all(
    files.map(async (file, i) => {
      const ticket = tickets[i];
      const { error } = await bucket.uploadToSignedUrl(ticket.path, ticket.token, file, {
        contentType: ticket.contentType,
      });
      if (error) throw new Error(`${file.name} 업로드에 실패했습니다.`);
      return { path: ticket.path, name: file.name, size: file.size, contentType: ticket.contentType };
    }),
  );
}

export async function submitEligibilityInquiry(
  input: Omit<EligibilityInquiryInput, "attachments">,
  files: File[],
): Promise<SubmitResult> {
  try {
    const attachments = await uploadFiles(files);
    await postJson("/api/eligibility-inquiries", { ...input, attachments });
    return { ok: true };
  } catch (error) {
    return { ok: false, error: error instanceof Error ? error.message : "네트워크 오류가 발생했습니다." };
  }
}
