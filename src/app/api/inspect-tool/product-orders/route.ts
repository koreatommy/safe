import { createClient } from "@supabase/supabase-js";
import { NextResponse } from "next/server";
import { formatPhoneNumber, normalizePhoneNumber } from "@/lib/utils";

const EMAIL_RE = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
const MAX_NOTE_LEN = 5000;
const MAX_NAME_LEN = 200;
const MAX_ORG_LEN = 300;

type Body = {
  customerName?: unknown;
  organization?: unknown;
  phone?: unknown;
  email?: unknown;
  quantity?: unknown;
  requestNote?: unknown;
  privacyAgreed?: unknown;
};

function jsonError(message: string, status: number) {
  return NextResponse.json({ error: message }, { status });
}

export async function POST(request: Request) {
  const url = process.env.NEXT_PUBLIC_SUPABASE_URL;
  const anonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY;
  if (!url || !anonKey || url.includes("placeholder")) {
    return jsonError("서버 설정이 완료되지 않았습니다.", 503);
  }

  let body: Body;
  try {
    body = (await request.json()) as Body;
  } catch {
    return jsonError("잘못된 요청 형식입니다.", 400);
  }

  const customerName =
    typeof body.customerName === "string" ? body.customerName.trim() : "";
  const organization =
    typeof body.organization === "string" ? body.organization.trim() : "";
  const phoneRaw = typeof body.phone === "string" ? body.phone.trim() : "";
  const email = typeof body.email === "string" ? body.email.trim().toLowerCase() : "";
  const requestNote =
    typeof body.requestNote === "string" ? body.requestNote.trim() : "";

  if (!customerName) return jsonError("주문자 이름을 입력해 주세요.", 400);
  if (customerName.length > MAX_NAME_LEN) return jsonError("주문자 이름이 너무 깁니다.", 400);
  if (!organization) return jsonError("소속을 입력해 주세요.", 400);
  if (organization.length > MAX_ORG_LEN) return jsonError("소속이 너무 깁니다.", 400);
  if (!email) return jsonError("이메일을 입력해 주세요.", 400);
  if (!EMAIL_RE.test(email)) return jsonError("올바른 이메일 형식이 아닙니다.", 400);
  if (!phoneRaw) return jsonError("연락처를 입력해 주세요.", 400);

  const phoneDigits = normalizePhoneNumber(phoneRaw);
  if (!/^\d+$/.test(phoneDigits)) {
    return jsonError("올바른 연락처를 입력해 주세요.", 400);
  }
  // 휴대폰·유선(지역번호 0xx 등): 10~11자리, 0으로 시작 (formatPhoneNumber와 맞춤)
  if (phoneDigits.length < 10 || phoneDigits.length > 11 || !phoneDigits.startsWith("0")) {
    return jsonError("올바른 연락처를 입력해 주세요. (10~11자리)", 400);
  }
  const phone = formatPhoneNumber(phoneDigits);

  if (body.privacyAgreed !== true) {
    return jsonError("개인정보 수집 및 이용에 동의해 주세요.", 400);
  }

  let quantity: number;
  if (typeof body.quantity === "number" && Number.isFinite(body.quantity)) {
    quantity = Math.floor(body.quantity);
  } else if (typeof body.quantity === "string" && body.quantity.trim() !== "") {
    quantity = Math.floor(Number(body.quantity));
  } else {
    return jsonError("주문 수량을 입력해 주세요.", 400);
  }
  if (!Number.isFinite(quantity) || quantity < 1 || quantity > 9999) {
    return jsonError("주문 수량은 1~9999 사이여야 합니다.", 400);
  }

  if (requestNote.length > MAX_NOTE_LEN) {
    return jsonError("요청사항이 너무 깁니다.", 400);
  }

  const discountEligible = quantity >= 10;

  const supabase = createClient(url, anonKey);
  // SELECT RLS 없이 insert+returning 은 실패할 수 있어, insert 만 수행합니다.
  const { error } = await supabase.from("safe_inspect_tool_product_orders").insert({
    customer_name: customerName,
    organization,
    phone,
    email,
    quantity,
    discount_eligible: discountEligible,
    request_note: requestNote.length > 0 ? requestNote : null,
    privacy_agreed: true,
  });

  if (error) {
    console.error("[inspect-tool product-orders]", error.message, error.code);
    return jsonError("접수 저장에 실패했습니다. 잠시 후 다시 시도해 주세요.", 502);
  }

  return NextResponse.json({ ok: true }, { status: 201 });
}
