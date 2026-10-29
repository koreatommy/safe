import { createHmac, timingSafeEqual } from "node:crypto";
import { cookies } from "next/headers";

export const ASSESSMENT_SESSION_COOKIE = "assessment_session";
export const ASSESSMENT_SESSION_MAX_AGE = 60 * 60 * 12;

const assessmentPassword = () => process.env.ASSESSMENT_PASSWORD ?? "";

function safeEqual(a: string, b: string): boolean {
  const left = Buffer.from(a);
  const right = Buffer.from(b);
  return left.length === right.length && timingSafeEqual(left, right);
}

/** 서명 키를 비밀번호에서 파생하므로 비밀번호를 바꾸면 기존 세션이 모두 무효화된다. */
function sign(expiresAt: number, password: string): string {
  return createHmac("sha256", password).update(`assessment-session:${expiresAt}`).digest("base64url");
}

export function isAssessmentPasswordValid(input: string): boolean {
  const password = assessmentPassword();
  return password.length > 0 && safeEqual(input, password);
}

export function createAssessmentSessionToken(): string {
  const expiresAt = Math.floor(Date.now() / 1000) + ASSESSMENT_SESSION_MAX_AGE;
  return `${expiresAt}.${sign(expiresAt, assessmentPassword())}`;
}

function isTokenValid(token: string | undefined): boolean {
  const password = assessmentPassword();
  if (!token || !password) return false;
  const [rawExpiresAt, signature] = token.split(".");
  const expiresAt = Number(rawExpiresAt);
  if (!Number.isInteger(expiresAt) || !signature) return false;
  if (expiresAt < Math.floor(Date.now() / 1000)) return false;
  return safeEqual(signature, sign(expiresAt, password));
}

export async function isAssessmentRequest(): Promise<boolean> {
  const store = await cookies();
  return isTokenValid(store.get(ASSESSMENT_SESSION_COOKIE)?.value);
}
