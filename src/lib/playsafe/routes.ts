export const playsafeRoutes = {
  home: "/",
  assessment: "/assessment",
  facilityInfo: "/assessment/facility",
} as const;

export const ASSESSMENT_REGISTRATION_PARAM = "registration";

/** 3단계에서 DB에 저장한 등록을 불러오는 안전성평가 주소. */
export function assessmentRouteFor(registrationId: string): string {
  return `${playsafeRoutes.assessment}?${ASSESSMENT_REGISTRATION_PARAM}=${encodeURIComponent(registrationId)}`;
}
