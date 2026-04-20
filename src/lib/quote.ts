/** 견적 품목 1행 (금액·세액은 공급가·부가세 분리 표기, 합계는 부가세 포함) */

export type QuoteLineInput = {
  item: string;
  details: string;
  quantity: number;
  unitPrice: number;
};

export type QuoteLineComputed = QuoteLineInput & {
  /** 수량 × 단가 (공급가) */
  supplyAmount: number;
  /** 공급가의 10% (원 단위 반올림) */
  vatAmount: number;
  /** 공급가 + 세액 */
  lineTotal: number;
};

const NUM = ["영", "일", "이", "삼", "사", "오", "육", "칠", "팔", "구"] as const;

/** 1~9999 구간을 한글로 (천·백·십 규칙). `만` 앞·뒤 덩어리에 사용 */
export function readUnderTenThousand(n: number): string {
  if (!Number.isFinite(n) || n <= 0 || n >= 10000) {
    throw new RangeError("readUnderTenThousand: 1~9999만 허용");
  }
  const thousands = Math.floor(n / 1000);
  const hundreds = Math.floor((n % 1000) / 100);
  const tens = Math.floor((n % 100) / 10);
  const ones = n % 10;
  let out = "";
  if (thousands) out += thousands === 1 ? "천" : `${NUM[thousands]}천`;
  if (hundreds) out += hundreds === 1 ? "백" : `${NUM[hundreds]}백`;
  if (tens) out += tens === 1 ? "십" : `${NUM[tens]}십`;
  if (ones) out += NUM[ones];
  return out;
}

/** 0 이상 정수 원화 금액을 한글 금액 문자열로 (예: 1234567 → 일백이십삼만사천오백육십칠) */
export function wonToKoreanText(amount: number): string {
  if (!Number.isFinite(amount) || amount < 0) return "";
  const n = Math.floor(amount);
  if (n === 0) return "영";
  const MAX = 999_999_999_999;
  if (n > MAX) return "금액범위초과";

  const EOK = 100_000_000;
  const MAN = 10_000;

  const eok = Math.floor(n / EOK);
  let rest = n % EOK;
  const manChunk = Math.floor(rest / MAN);
  const underMan = rest % MAN;

  const parts: string[] = [];
  if (eok > 0) parts.push(`${readUnderTenThousand(eok)}억`);
  if (manChunk > 0) parts.push(`${readUnderTenThousand(manChunk)}만`);
  if (underMan > 0) parts.push(readUnderTenThousand(underMan));
  if (parts.length === 0) parts.push("영");

  return parts.join("");
}

export function formatKRW(amount: number): string {
  if (!Number.isFinite(amount)) return "0";
  return new Intl.NumberFormat("ko-KR").format(Math.round(amount));
}

export type ComputeQuoteLineOptions = {
  /** false면 세액 0, 합계는 공급가만 */
  includeVat?: boolean;
};

export function computeQuoteLine(line: QuoteLineInput, opts?: ComputeQuoteLineOptions): QuoteLineComputed {
  const q = Math.floor(line.quantity);
  const u = Math.floor(line.unitPrice);
  const supplyAmount = q * u;
  const includeVat = opts?.includeVat !== false;
  const vatAmount = includeVat ? Math.round(supplyAmount * 0.1) : 0;
  const lineTotal = supplyAmount + vatAmount;
  return {
    ...line,
    quantity: q,
    unitPrice: u,
    supplyAmount,
    vatAmount,
    lineTotal,
  };
}

export function computeQuoteTotals(lines: QuoteLineComputed[]) {
  const supplySum = lines.reduce((a, l) => a + l.supplyAmount, 0);
  const vatSum = lines.reduce((a, l) => a + l.vatAmount, 0);
  const grandTotal = supplySum + vatSum;
  return { supplySum, vatSum, grandTotal };
}

export function escapeHtml(s: string): string {
  return s
    .replace(/&/g, "&amp;")
    .replace(/</g, "&lt;")
    .replace(/>/g, "&gt;")
    .replace(/"/g, "&quot;")
    .replace(/'/g, "&#39;");
}
