import { NextResponse } from "next/server";
import { insertInquiry } from "@/lib/eligibility-inquiry/repository";
import { createServiceClient, jsonError, readJson, serviceUnavailable } from "@/lib/eligibility-inquiry/server";
import { attachmentsExist } from "@/lib/eligibility-inquiry/storage";
import { validateInquiryInput } from "@/lib/eligibility-inquiry/validation";

export async function POST(request: Request) {
  const supabase = createServiceClient();
  if (!supabase) return serviceUnavailable();

  const parsed = validateInquiryInput(await readJson(request));
  if (!parsed.ok) return jsonError(parsed.error, 400);

  if (!(await attachmentsExist(supabase, parsed.value.attachments))) {
    return jsonError("첨부파일 업로드가 완료되지 않았습니다. 다시 시도해 주세요.", 400);
  }

  const { error } = await insertInquiry(supabase, parsed.value);
  if (error) {
    console.error("[eligibility-inquiries POST]", error.message, error.code);
    return jsonError("문의 저장에 실패했습니다. 잠시 후 다시 시도해 주세요.", 502);
  }
  return NextResponse.json({ ok: true }, { status: 201 });
}
