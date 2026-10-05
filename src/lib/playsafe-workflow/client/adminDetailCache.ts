import type { AdminRegistrationDetail } from "../adminTypes";
import { SIGNED_URL_TTL_SECONDS } from "../constants";

const EXPIRY_MARGIN_SECONDS = 10 * 60;
const CACHE_TTL_MS = (SIGNED_URL_TTL_SECONDS - EXPIRY_MARGIN_SECONDS) * 1000;

const cache = new Map<string, { detail: AdminRegistrationDetail; expiresAt: number }>();

/** 서명 URL이 바뀌면 브라우저 캐시가 무효가 되므로, URL이 유효한 동안 같은 상세 응답을 재사용한다. */
export function readCachedDetail(registrationId: string): AdminRegistrationDetail | null {
  const entry = cache.get(registrationId);
  if (!entry) return null;
  if (entry.expiresAt > Date.now()) return entry.detail;
  cache.delete(registrationId);
  return null;
}

export function writeCachedDetail(registrationId: string, detail: AdminRegistrationDetail): void {
  cache.set(registrationId, { detail, expiresAt: Date.now() + CACHE_TTL_MS });
}
