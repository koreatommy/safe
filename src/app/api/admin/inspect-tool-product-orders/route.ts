import { createClient } from "@supabase/supabase-js";
import { NextResponse } from "next/server";

const TABLE = "safe_inspect_tool_product_orders";
const STATUSES = ["pending", "processing", "completed"] as const;
type OrderStatus = (typeof STATUSES)[number];

function adminPasswordOk(request: Request): boolean {
  const expected = process.env.NEXT_PUBLIC_ADMIN_PASSWORD ?? "";
  if (!expected) return false;
  const sent = request.headers.get("x-admin-password") ?? "";
  return sent === expected;
}

function serviceClient() {
  const url = process.env.NEXT_PUBLIC_SUPABASE_URL;
  const key = process.env.SUPABASE_SERVICE_ROLE_KEY;
  if (!url || !key) return null;
  return createClient(url, key);
}

function missingSupabaseServiceResponse() {
  const onVercel = Boolean(process.env.VERCEL);
  const error = onVercel
    ? "서버에 SUPABASE_SERVICE_ROLE_KEY가 설정되지 않았습니다. Vercel → 해당 프로젝트 → Settings → Environment Variables에서 이름 SUPABASE_SERVICE_ROLE_KEY로 Production(필요 시 Preview) 값을 넣고 재배포하세요. 값은 Supabase 대시보드 → Project Settings → API의 service_role 키입니다."
    : "서버에 SUPABASE_SERVICE_ROLE_KEY가 설정되지 않았습니다. .env.local에 service_role 키를 추가한 뒤 개발 서버를 재시작하세요.";
  return NextResponse.json({ error }, { status: 503 });
}

export async function GET(request: Request) {
  if (!adminPasswordOk(request)) {
    return NextResponse.json({ error: "인증이 필요합니다." }, { status: 401 });
  }
  const supabase = serviceClient();
  if (!supabase) {
    return missingSupabaseServiceResponse();
  }

  const { searchParams } = new URL(request.url);
  const statusParam = searchParams.get("status") ?? "all";
  let query = supabase.from(TABLE).select("*").order("created_at", { ascending: false });
  if (statusParam !== "all" && STATUSES.includes(statusParam as OrderStatus)) {
    query = query.eq("status", statusParam);
  }
  const { data, error } = await query;
  if (error) {
    console.error("[admin inspect-tool-product-orders GET]", error);
    return NextResponse.json({ error: "목록을 불러오지 못했습니다." }, { status: 502 });
  }
  return NextResponse.json({ orders: data ?? [] });
}

export async function PATCH(request: Request) {
  if (!adminPasswordOk(request)) {
    return NextResponse.json({ error: "인증이 필요합니다." }, { status: 401 });
  }
  const supabase = serviceClient();
  if (!supabase) {
    return missingSupabaseServiceResponse();
  }

  let body: { id?: unknown; status?: unknown };
  try {
    body = (await request.json()) as { id?: unknown; status?: unknown };
  } catch {
    return NextResponse.json({ error: "잘못된 요청 형식입니다." }, { status: 400 });
  }
  const id = typeof body.id === "string" ? body.id.trim() : "";
  const status = typeof body.status === "string" ? body.status.trim() : "";
  if (!id) return NextResponse.json({ error: "id가 필요합니다." }, { status: 400 });
  if (!STATUSES.includes(status as OrderStatus)) {
    return NextResponse.json({ error: "유효하지 않은 상태입니다." }, { status: 400 });
  }

  const { error } = await supabase.from(TABLE).update({ status }).eq("id", id);
  if (error) {
    console.error("[admin inspect-tool-product-orders PATCH]", error);
    return NextResponse.json({ error: "상태를 변경하지 못했습니다." }, { status: 502 });
  }
  return NextResponse.json({ ok: true });
}

export async function DELETE(request: Request) {
  if (!adminPasswordOk(request)) {
    return NextResponse.json({ error: "인증이 필요합니다." }, { status: 401 });
  }
  const supabase = serviceClient();
  if (!supabase) {
    return missingSupabaseServiceResponse();
  }

  let body: { id?: unknown };
  try {
    body = (await request.json()) as { id?: unknown };
  } catch {
    return NextResponse.json({ error: "잘못된 요청 형식입니다." }, { status: 400 });
  }
  const id = typeof body.id === "string" ? body.id.trim() : "";
  if (!id) return NextResponse.json({ error: "id가 필요합니다." }, { status: 400 });

  const { error, count } = await supabase.from(TABLE).delete({ count: "exact" }).eq("id", id);
  if (error) {
    console.error("[admin inspect-tool-product-orders DELETE]", error);
    return NextResponse.json({ error: "삭제하지 못했습니다." }, { status: 502 });
  }
  if ((count ?? 0) === 0) {
    return NextResponse.json({ error: "해당 주문을 찾을 수 없습니다." }, { status: 404 });
  }
  return NextResponse.json({ ok: true });
}
