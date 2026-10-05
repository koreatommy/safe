import { NextResponse } from "next/server";
import { INQUIRY_LIMITS, INQUIRY_STATUSES } from "@/lib/eligibility-inquiry/constants";
import { deleteInquiry, listInquiries, updateInquiry } from "@/lib/eligibility-inquiry/repository";
import { createServiceClient, jsonError, readJson, serviceUnavailable } from "@/lib/eligibility-inquiry/server";
import { removeAttachments, signAttachments } from "@/lib/eligibility-inquiry/storage";
import { isAdminRequest } from "@/lib/server/adminSession";
import type { EligibilityInquiry, InquiryStatus, InquiryStatusFilter } from "@/lib/eligibility-inquiry/types";

const isStatus = (v: unknown): v is InquiryStatus => INQUIRY_STATUSES.includes(v as InquiryStatus);

async function guard() {
  if (!(await isAdminRequest())) return { response: jsonError("관리자 인증이 필요합니다.", 401) } as const;
  const supabase = createServiceClient();
  if (!supabase) return { response: serviceUnavailable() } as const;
  return { supabase } as const;
}

export async function GET(request: Request) {
  const g = await guard();
  if ("response" in g) return g.response;

  const statusParam = new URL(request.url).searchParams.get("status");
  const filter: InquiryStatusFilter = isStatus(statusParam) ? statusParam : "all";

  const { data, error } = await listInquiries(g.supabase, filter);
  if (error) {
    console.error("[admin eligibility-inquiries GET]", error.message);
    return jsonError("목록을 불러오지 못했습니다.", 502);
  }

  const inquiries: EligibilityInquiry[] = await Promise.all(
    (data ?? []).map(async (row) => ({ ...row, attachments: await signAttachments(g.supabase, row.attachments ?? []) })),
  );
  return NextResponse.json({ inquiries });
}

export async function PATCH(request: Request) {
  const g = await guard();
  if ("response" in g) return g.response;

  const body = ((await readJson(request)) ?? {}) as { id?: unknown; status?: unknown; adminNote?: unknown };
  const id = typeof body.id === "string" ? body.id.trim() : "";
  if (!id) return jsonError("id가 필요합니다.", 400);

  const patch: { status?: InquiryStatus; admin_note?: string | null } = {};
  if (body.status !== undefined) {
    if (!isStatus(body.status)) return jsonError("유효하지 않은 상태입니다.", 400);
    patch.status = body.status;
  }
  if (body.adminNote !== undefined) {
    const note = typeof body.adminNote === "string" ? body.adminNote.trim() : "";
    if (note.length > INQUIRY_LIMITS.adminNote) return jsonError("메모가 너무 깁니다.", 400);
    patch.admin_note = note || null;
  }
  if (Object.keys(patch).length === 0) return jsonError("변경할 항목이 없습니다.", 400);

  const { error, count } = await updateInquiry(g.supabase, id, patch);
  if (error) {
    console.error("[admin eligibility-inquiries PATCH]", error.message);
    return jsonError("변경하지 못했습니다.", 502);
  }
  if (!count) return jsonError("해당 문의를 찾을 수 없습니다.", 404);
  return NextResponse.json({ ok: true });
}

export async function DELETE(request: Request) {
  const g = await guard();
  if ("response" in g) return g.response;

  const body = ((await readJson(request)) ?? {}) as { id?: unknown };
  const id = typeof body.id === "string" ? body.id.trim() : "";
  if (!id) return jsonError("id가 필요합니다.", 400);

  const { data, error } = await deleteInquiry(g.supabase, id);
  if (error) {
    console.error("[admin eligibility-inquiries DELETE]", error.message);
    return jsonError("삭제하지 못했습니다.", 502);
  }
  if (!data?.length) return jsonError("해당 문의를 찾을 수 없습니다.", 404);

  await removeAttachments(g.supabase, data[0].attachments ?? []);
  return NextResponse.json({ ok: true });
}
