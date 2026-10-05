import "server-only";

import type { SupabaseClient } from "@supabase/supabase-js";
import type { AdminRegistrationDetail } from "../adminTypes";
import { PLAYSAFE_TABLES } from "../constants";
import { loadAssessmentView, loadRegistrationView } from "./workspaceParts";

/** 평가가 없는 등록(대상 아님 종결 등)도 상세를 볼 수 있도록 평가는 선택으로 불러온다. */
export async function loadAdminDetail(
  supabase: SupabaseClient,
  registrationId: string,
): Promise<AdminRegistrationDetail | null> {
  const [registration, assessment, { data: eligibility }] = await Promise.all([
    loadRegistrationView(supabase, registrationId),
    loadAssessmentView(supabase, registrationId),
    supabase.from(PLAYSAFE_TABLES.registrations).select("all_eligible").eq("id", registrationId).maybeSingle(),
  ]);
  if (!registration) return null;
  return {
    registration: { ...registration, allEligible: Boolean(eligibility?.all_eligible) },
    assessment,
  };
}
