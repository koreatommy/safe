import type { QuoteLineComputed } from "@/lib/quote";
import { escapeHtml, formatKRW, wonToKoreanText } from "@/lib/quote";

export type QuoteCompanyBlock = {
  name: string;
  ceo: string;
  bizNo: string;
  phone: string;
  address: string;
  email: string;
};

export type QuoteEmailPayload = {
  recipientLabel: string;
  quoteTitle: string;
  quoteDateLabel: string;
  validityLabel: string;
  company: QuoteCompanyBlock;
  lines: QuoteLineComputed[];
  grandTotal: number;
  supplySum: number;
  vatSum: number;
  /** false면 견적금액·하단 문구를 부가세 미포함으로 표시 */
  vatIncluded: boolean;
};

const tableStyle =
  "border-collapse:collapse;width:100%;font-size:13px;color:#111;font-family:'Malgun Gothic','Apple SD Gothic Neo',sans-serif;";
const cellBorder = "border:1px solid #222;padding:8px 10px;vertical-align:middle;";
const thStyle = `${cellBorder}background:#f5f5f5;font-weight:600;text-align:center;`;

/** 이메일 클라이언트 호환용 인라인 스타일 HTML 견적서 */
export function buildQuoteEmailHtml(p: QuoteEmailPayload): string {
  const vatIncluded = p.vatIncluded !== false;
  const totalNote = vatIncluded ? "※ 부가세포함" : "※ 부가세 별도 (세액 0원)";
  const footerNote = vatIncluded
    ? "본 견적서는 발행일 기준 유효기간 내에 한해 효력이 있으며, 금액은 부가가치세가 포함된 금액입니다."
    : "본 견적서는 발행일 기준 유효기간 내에 한해 효력이 있으며, 금액은 부가가치세가 제외된 공급가 기준입니다.";
  const koreanTotal = wonToKoreanText(Math.floor(p.grandTotal));
  const rowsHtml = p.lines
    .map((line) => {
      const item = escapeHtml(line.item);
      const details = escapeHtml(line.details).replace(/\n/g, "<br/>");
      return `<tr>
  <td style="${cellBorder}">${item}</td>
  <td style="${cellBorder}">${details}</td>
  <td style="${cellBorder}text-align:right;">${formatKRW(line.quantity)}</td>
  <td style="${cellBorder}text-align:right;">${formatKRW(line.unitPrice)}</td>
  <td style="${cellBorder}text-align:right;">${formatKRW(line.supplyAmount)}</td>
  <td style="${cellBorder}text-align:right;">${formatKRW(line.vatAmount)}</td>
</tr>`;
    })
    .join("\n");

  const fillerRows = Math.max(0, 8 - p.lines.length);
  const emptyRows = Array.from({ length: fillerRows }, () => `<tr>
  <td style="${cellBorder}">&nbsp;</td>
  <td style="${cellBorder}">&nbsp;</td>
  <td style="${cellBorder}">&nbsp;</td>
  <td style="${cellBorder}">&nbsp;</td>
  <td style="${cellBorder}">&nbsp;</td>
  <td style="${cellBorder}">&nbsp;</td>
</tr>`).join("\n");

  return `<!DOCTYPE html>
<html lang="ko">
<head>
  <meta charset="utf-8" />
  <meta name="viewport" content="width=device-width, initial-scale=1" />
  <title>${escapeHtml(p.quoteTitle)}</title>
</head>
<body style="margin:0;padding:24px;background:#eee;">
  <div style="max-width:720px;margin:0 auto;background:#fff;padding:28px 32px;border:1px solid #ddd;">
    <h1 style="margin:0 0 20px;font-size:22px;font-weight:700;color:#000;letter-spacing:0.05em;">견적서</h1>

    <table style="width:100%;border-collapse:collapse;margin-bottom:16px;font-size:13px;">
      <tr>
        <td style="width:50%;vertical-align:top;padding:0 8px 0 0;">
          <table style="width:100%;border-collapse:collapse;">
            <tr><td style="${cellBorder}width:28%;background:#fafafa;font-weight:600;">수 신</td><td style="${cellBorder}">${escapeHtml(p.recipientLabel)}</td></tr>
            <tr><td style="${cellBorder}background:#fafafa;font-weight:600;">견적명</td><td style="${cellBorder}">${escapeHtml(p.quoteTitle)}</td></tr>
            <tr><td style="${cellBorder}background:#fafafa;font-weight:600;">견적날짜</td><td style="${cellBorder}">${escapeHtml(p.quoteDateLabel)}</td></tr>
            <tr><td style="${cellBorder}background:#fafafa;font-weight:600;">유효기간</td><td style="${cellBorder}">${escapeHtml(p.validityLabel)}</td></tr>
          </table>
        </td>
        <td style="width:50%;vertical-align:top;padding:0 0 0 8px;">
          <table style="width:100%;border-collapse:collapse;">
            <tr>
              <td style="${cellBorder}width:22%;background:#fafafa;font-weight:600;">상 호</td>
              <td style="${cellBorder}">${escapeHtml(p.company.name)}</td>
              <td style="${cellBorder}width:18%;background:#fafafa;font-weight:600;">대 표</td>
              <td style="${cellBorder}">${escapeHtml(p.company.ceo)}</td>
            </tr>
            <tr>
              <td style="${cellBorder}background:#fafafa;font-weight:600;">사업자번호</td>
              <td style="${cellBorder}">${escapeHtml(p.company.bizNo)}</td>
              <td style="${cellBorder}background:#fafafa;font-weight:600;">전화번호</td>
              <td style="${cellBorder}">${escapeHtml(p.company.phone)}</td>
            </tr>
            <tr><td style="${cellBorder}background:#fafafa;font-weight:600;">주 소</td><td colspan="3" style="${cellBorder}">${escapeHtml(p.company.address)}</td></tr>
            <tr><td style="${cellBorder}background:#fafafa;font-weight:600;">E-mail</td><td colspan="3" style="${cellBorder}">${escapeHtml(p.company.email)}</td></tr>
          </table>
        </td>
      </tr>
    </table>

    <div style="border:2px solid #111;padding:14px 16px;margin-bottom:18px;text-align:center;font-size:15px;font-weight:600;">
      <span style="margin-right:12px;">견적금액</span>
      <span>일금 <span style="border-bottom:1px solid #333;padding:0 4px 2px;">${escapeHtml(koreanTotal)}</span> 원</span>
      <span style="margin-left:10px;">( ₩${formatKRW(p.grandTotal)} )</span>
      <span style="display:block;margin-top:8px;font-size:12px;font-weight:400;color:#333;">${escapeHtml(totalNote)}</span>
    </div>

    <table style="${tableStyle}">
      <thead>
        <tr>
          <th style="${thStyle}width:14%;">항 목</th>
          <th style="${thStyle}">세 부 내 용</th>
          <th style="${thStyle}width:9%;">수 량</th>
          <th style="${thStyle}width:11%;">단 가</th>
          <th style="${thStyle}width:11%;">금 액</th>
          <th style="${thStyle}width:11%;">세 액</th>
        </tr>
      </thead>
      <tbody>
        ${rowsHtml}
        ${emptyRows}
      </tbody>
    </table>

    <p style="margin:20px 0 0;font-size:11px;color:#666;line-height:1.5;">
      ${escapeHtml(footerNote)}<br/>
      문의사항은 상단 연락처로 부탁드립니다.
    </p>
  </div>
</body>
</html>`;
}
