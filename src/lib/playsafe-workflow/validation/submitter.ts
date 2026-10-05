import type { Submitter } from "../types";

const EMAIL_RE = /^[^@\s]+@[^@\s]+\.[^@\s]+$/;
const MAX_NAME = 50;
const MAX_EMAIL = 254;

export function normalizeSubmitter(value: Submitter): Submitter {
  return { name: value.name.trim(), email: value.email.trim().toLowerCase() };
}

export function validateSubmitter(value: Submitter): string | null {
  const { name, email } = normalizeSubmitter(value);
  if (!name) return "입력자 이름을 입력해 주세요.";
  if (name.length > MAX_NAME) return `입력자 이름은 ${MAX_NAME}자 이내로 입력해 주세요.`;
  if (!email) return "입력자 이메일을 입력해 주세요.";
  if (email.length > MAX_EMAIL || !EMAIL_RE.test(email)) return "입력자 이메일 형식을 확인해 주세요.";
  return null;
}

export function sameSubmitter(a: Submitter, b: Submitter): boolean {
  const left = normalizeSubmitter(a);
  const right = normalizeSubmitter(b);
  return left.name === right.name && left.email === right.email;
}
