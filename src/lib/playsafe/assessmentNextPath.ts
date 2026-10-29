import { playsafeRoutes } from "./routes";

const ASSESSMENT_PREFIX = "/assessment";

/** open redirect를 막기 위해 /assessment 하위 경로만 허용한다. */
export function safeAssessmentNextPath(next: string | null | undefined, fallback = playsafeRoutes.facilityInfo): string {
  if (!next || !next.startsWith(ASSESSMENT_PREFIX)) return fallback;
  if (next.startsWith("//") || next.includes("://")) return fallback;
  if (next === playsafeRoutes.assessmentLogin || next.startsWith(`${playsafeRoutes.assessmentLogin}?`)) {
    return fallback;
  }
  return next;
}

export function assessmentLoginHref(next?: string | null): string {
  const target = safeAssessmentNextPath(next);
  return `${playsafeRoutes.assessmentLogin}?next=${encodeURIComponent(target)}`;
}
