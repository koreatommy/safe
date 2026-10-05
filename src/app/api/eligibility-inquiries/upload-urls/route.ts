import { NextResponse } from "next/server";
import { createServiceClient, jsonError, readJson, serviceUnavailable } from "@/lib/eligibility-inquiry/server";
import { createUploadTickets } from "@/lib/eligibility-inquiry/storage";
import { validateUploadRequest } from "@/lib/eligibility-inquiry/validation";

/** 첨부파일을 브라우저에서 스토리지로 직접 올리기 위한 1회용 서명 업로드 URL 발급 */
export async function POST(request: Request) {
  const supabase = createServiceClient();
  if (!supabase) return serviceUnavailable();

  const parsed = validateUploadRequest(await readJson(request));
  if (!parsed.ok) return jsonError(parsed.error, 400);

  try {
    const tickets = await createUploadTickets(supabase, parsed.value);
    return NextResponse.json({ tickets });
  } catch (error) {
    console.error("[eligibility-inquiries upload-urls]", error);
    return jsonError("첨부파일 업로드를 준비하지 못했습니다. 잠시 후 다시 시도해 주세요.", 502);
  }
}
