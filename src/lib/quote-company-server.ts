import type { QuoteCompanyBlock } from "@/components/email/QuoteEmailTemplate";

/** 서버(API 라우트)에서만 사용 — 견적서 발신처 정보 */
export function getQuoteCompanyFromServerEnv(): QuoteCompanyBlock {
  return {
    name: process.env.COMPANY_NAME ?? "",
    ceo: process.env.COMPANY_CEO ?? "",
    bizNo: process.env.COMPANY_BIZ_NO ?? "",
    phone: process.env.COMPANY_PHONE ?? "",
    address: process.env.COMPANY_ADDRESS ?? "",
    email: process.env.COMPANY_EMAIL ?? "",
  };
}

export function isQuoteCompanyConfigured(c: QuoteCompanyBlock): boolean {
  return Boolean(
    c.name.trim() &&
      c.ceo.trim() &&
      c.bizNo.trim() &&
      c.phone.trim() &&
      c.address.trim() &&
      c.email.trim(),
  );
}

const PLACEHOLDER = "— 미설정 —";

/** 미리보기용: 비어 있는 항목은 표시용 placeholder로 채움 */
export function quoteCompanyWithPlaceholders(c: QuoteCompanyBlock): QuoteCompanyBlock {
  return {
    name: c.name.trim() || PLACEHOLDER,
    ceo: c.ceo.trim() || PLACEHOLDER,
    bizNo: c.bizNo.trim() || PLACEHOLDER,
    phone: c.phone.trim() || PLACEHOLDER,
    address: c.address.trim() || PLACEHOLDER,
    email: c.email.trim() || PLACEHOLDER,
  };
}
