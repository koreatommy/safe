import { createHmac, timingSafeEqual } from "node:crypto";
import { cookies } from "next/headers";

export const ADMIN_SESSION_COOKIE = "admin_session";
export const ADMIN_SESSION_MAX_AGE = 60 * 60 * 12;

const adminPassword = () => process.env.ADMIN_PASSWORD ?? "";

function safeEqual(a: string, b: string): boolean {
  const left = Buffer.from(a);
  const right = Buffer.from(b);
  return left.length === right.length && timingSafeEqual(left, right);
}

/** 서명 키를 비밀번호에서 파생하므로 비밀번호를 바꾸면 기존 세션이 모두 무효화된다. */
function sign(expiresAt: number, password: string): string {
  return createHmac("sha256", password).update(`admin-session:${expiresAt}`).digest("base64url");
}

export function isAdminPasswordValid(input: string): boolean {
  const password = adminPassword();
  return password.length > 0 && safeEqual(input, password);
}

export function createAdminSessionToken(): string {
  const expiresAt = Math.floor(Date.now() / 1000) + ADMIN_SESSION_MAX_AGE;
  return `${expiresAt}.${sign(expiresAt, adminPassword())}`;
}

function isTokenValid(token: string | undefined): boolean {
  const password = adminPassword();
  if (!token || !password) return false;
  const [rawExpiresAt, signature] = token.split(".");
  const expiresAt = Number(rawExpiresAt);
  if (!Number.isInteger(expiresAt) || !signature) return false;
  if (expiresAt < Math.floor(Date.now() / 1000)) return false;
  return safeEqual(signature, sign(expiresAt, password));
}

export async function isAdminRequest(): Promise<boolean> {
  const store = await cookies();
  return isTokenValid(store.get(ADMIN_SESSION_COOKIE)?.value);
}
