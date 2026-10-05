import type { SupabaseClient } from "@supabase/supabase-js";
import { ELIGIBILITY_INQUIRY_TABLE } from "./constants";
import type { EligibilityInquiryInput, InquiryAttachment, InquiryStatus, InquiryStatusFilter } from "./types";

export interface InquiryRow {
  id: string;
  title: string;
  content: string;
  name: string;
  email: string;
  phone: string;
  attachments: InquiryAttachment[] | null;
  status: InquiryStatus;
  admin_note: string | null;
  created_at: string;
}

export async function insertInquiry(supabase: SupabaseClient, input: EligibilityInquiryInput) {
  return supabase.from(ELIGIBILITY_INQUIRY_TABLE).insert({
    title: input.title,
    content: input.content,
    name: input.name,
    email: input.email,
    phone: input.phone,
    attachments: input.attachments,
    privacy_agreed: input.privacyAgreed,
  });
}

export async function listInquiries(supabase: SupabaseClient, status: InquiryStatusFilter) {
  let query = supabase
    .from(ELIGIBILITY_INQUIRY_TABLE)
    .select("id, title, content, name, email, phone, attachments, status, admin_note, created_at")
    .order("created_at", { ascending: false });
  if (status !== "all") query = query.eq("status", status);
  return query.overrideTypes<InquiryRow[], { merge: false }>();
}

export async function updateInquiry(
  supabase: SupabaseClient,
  id: string,
  patch: { status?: InquiryStatus; admin_note?: string | null },
) {
  return supabase.from(ELIGIBILITY_INQUIRY_TABLE).update(patch, { count: "exact" }).eq("id", id);
}

export async function deleteInquiry(supabase: SupabaseClient, id: string) {
  return supabase
    .from(ELIGIBILITY_INQUIRY_TABLE)
    .delete()
    .eq("id", id)
    .select("attachments")
    .overrideTypes<Pick<InquiryRow, "attachments">[], { merge: false }>();
}
