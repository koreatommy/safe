import { createClient } from "@supabase/supabase-js";
import { NextResponse } from "next/server";
import { Resend } from "resend";
import { buildQuoteEmailHtml } from "@/components/email/QuoteEmailTemplate";
import { computeQuoteLine, computeQuoteTotals } from "@/lib/quote";
import {
  getQuoteCompanyFromServerEnv,
  isQuoteCompanyConfigured,
  quoteCompanyWithPlaceholders,
} from "@/lib/quote-company-server";

const TABLE = "safe_inspect_tool_product_orders";

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

function formatQuoteDate(d: Date): string {
  return d.toLocaleDateString("ko-KR", {
    year: "numeric",
    month: "long",
    day: "numeric",
  });
}

type Body = {
  orderId?: unknown;
  quantity?: unknown;
  unitPrice?: unknown;
  quoteTitle?: unknown;
  itemName?: unknown;
  itemDetails?: unknown;
  /** 발송 후 주문 상태를 `processing`으로 변경 */
  setProcessing?: unknown;
  /** true면 이메일을 보내지 않고 HTML만 반환 */
  preview?: unknown;
  /** false면 세액 0·합계는 공급가만 */
  includeVat?: unknown;
};

export async function POST(request: Request) {
  if (!adminPasswordOk(request)) {
    return NextResponse.json({ error: "인증이 필요합니다." }, { status: 401 });
  }

  let body: Body;
  try {
    body = (await request.json()) as Body;
  } catch {
    return NextResponse.json({ error: "잘못된 요청 형식입니다." }, { status: 400 });
  }

  const orderId = typeof body.orderId === "string" ? body.orderId.trim() : "";
  if (!orderId) {
    return NextResponse.json({ error: "orderId가 필요합니다." }, { status: 400 });
  }

  let quantity: number;
  if (typeof body.quantity === "number" && Number.isFinite(body.quantity)) {
    quantity = Math.floor(body.quantity);
  } else if (typeof body.quantity === "string" && body.quantity.trim() !== "") {
    quantity = Math.floor(Number(body.quantity));
  } else {
    return NextResponse.json({ error: "수량이 필요합니다." }, { status: 400 });
  }

  let unitPrice: number;
  if (typeof body.unitPrice === "number" && Number.isFinite(body.unitPrice)) {
    unitPrice = Math.floor(body.unitPrice);
  } else if (typeof body.unitPrice === "string" && body.unitPrice.trim() !== "") {
    unitPrice = Math.floor(Number(body.unitPrice));
  } else {
    return NextResponse.json({ error: "단가가 필요합니다." }, { status: 400 });
  }

  if (quantity < 1 || quantity > 9999) {
    return NextResponse.json({ error: "수량은 1~9999 사이여야 합니다." }, { status: 400 });
  }
  if (unitPrice < 1 || unitPrice > 999_999_999) {
    return NextResponse.json({ error: "단가가 올바르지 않습니다." }, { status: 400 });
  }

  const quoteTitle =
    typeof body.quoteTitle === "string" && body.quoteTitle.trim()
      ? body.quoteTitle.trim().slice(0, 300)
      : "제품 구매 견적";
  const itemName =
    typeof body.itemName === "string" && body.itemName.trim()
      ? body.itemName.trim().slice(0, 200)
      : "놀이시설 안전점검 도구(세트)";
  const itemDetails =
    typeof body.itemDetails === "string" && body.itemDetails.trim()
      ? body.itemDetails.trim().slice(0, 5000)
      : "규격: 안전기준서 준수 ±0.1mm 공차";

  const previewOnly = body.preview === true;
  const setProcessing = body.setProcessing === true;
  const includeVat = body.includeVat !== false;

  const supabase = serviceClient();
  if (!supabase) {
    return NextResponse.json({ error: "서버 DB 설정이 없습니다." }, { status: 503 });
  }

  const { data: row, error: fetchErr } = await supabase
    .from(TABLE)
    .select("id,customer_name,organization,phone,email,status")
    .eq("id", orderId)
    .maybeSingle();

  if (fetchErr) {
    console.error("[send-quote] fetch", fetchErr);
    return NextResponse.json({ error: "주문을 불러오지 못했습니다." }, { status: 502 });
  }
  if (!row || typeof row.email !== "string") {
    return NextResponse.json({ error: "해당 주문을 찾을 수 없습니다." }, { status: 404 });
  }

  const rawCompany = getQuoteCompanyFromServerEnv();
  if (!previewOnly && !isQuoteCompanyConfigured(rawCompany)) {
    return NextResponse.json(
      {
        error:
          "견적 발신 회사 정보가 서버에 설정되지 않았습니다. COMPANY_NAME, COMPANY_CEO, COMPANY_BIZ_NO, COMPANY_PHONE, COMPANY_ADDRESS, COMPANY_EMAIL을 설정하세요.",
      },
      { status: 503 },
    );
  }

  const company = previewOnly ? quoteCompanyWithPlaceholders(rawCompany) : rawCompany;

  const line = computeQuoteLine(
    {
      item: itemName,
      details: itemDetails,
      quantity,
      unitPrice,
    },
    { includeVat },
  );
  const { supplySum, vatSum, grandTotal } = computeQuoteTotals([line]);

  const now = new Date();
  const payload = {
    recipientLabel: String(row.organization ?? "").trim() || String(row.customer_name ?? "").trim() || "귀하",
    quoteTitle,
    quoteDateLabel: formatQuoteDate(now),
    validityLabel: "견적일로부터 3개월",
    company,
    lines: [line],
    grandTotal,
    supplySum,
    vatSum,
    vatIncluded: includeVat,
  };

  const html = buildQuoteEmailHtml(payload);

  if (previewOnly) {
    return NextResponse.json({ ok: true, html, grandTotal, supplySum, vatSum });
  }

  const apiKey = process.env.RESEND_API_KEY?.trim();
  if (!apiKey) {
    return NextResponse.json({ error: "RESEND_API_KEY가 설정되지 않았습니다." }, { status: 503 });
  }

  const fromRaw = process.env.RESEND_FROM_EMAIL?.trim() || "onboarding@resend.dev";
  const from =
    process.env.RESEND_FROM_NAME?.trim() ? `${process.env.RESEND_FROM_NAME.trim()} <${fromRaw}>` : fromRaw;

  const resend = new Resend(apiKey);
  const to = row.email.trim().toLowerCase();
  const subject = `[견적서] ${quoteTitle}`;

  const { error: sendErr } = await resend.emails.send({
    from,
    to,
    subject,
    html,
  });

  if (sendErr) {
    console.error("[send-quote] resend", sendErr);
    const msg =
      typeof sendErr === "object" && sendErr !== null && "message" in sendErr
        ? String((sendErr as { message?: string }).message ?? "")
        : "";
    return NextResponse.json(
      { error: msg ? `이메일 발송 실패: ${msg}` : "이메일 발송에 실패했습니다." },
      { status: 502 },
    );
  }

  if (setProcessing && row.status === "pending") {
    const { error: patchErr } = await supabase.from(TABLE).update({ status: "processing" }).eq("id", orderId);
    if (patchErr) {
      console.error("[send-quote] status patch", patchErr);
    }
  }

  return NextResponse.json({ ok: true, sentTo: to });
}
