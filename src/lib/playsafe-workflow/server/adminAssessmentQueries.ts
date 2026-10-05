import "server-only";

import type { SupabaseClient } from "@supabase/supabase-js";
import type { AdminAssessmentPage, AssessmentSearch, AssessmentSearchField } from "../adminTypes";
import { ADMIN_ASSESSMENT_PAGE_SIZE, PLAYSAFE_TABLES } from "../constants";
import type { AnswerStatus } from "../types";
import { escapeLike } from "./escapeLike";

type RegistrationEmbed = { facility_no: string; facility_name: string; submitter_name: string } | null;

const SEARCH_COLUMNS: Record<AssessmentSearchField, string> = {
  facility: "registration.facility_name",
  assessor: "assessor",
  submitter: "registration.submitter_name",
};

export async function listAssessments(
  supabase: SupabaseClient,
  { field, keyword, registrationId }: AssessmentSearch,
  page: number,
): Promise<AdminAssessmentPage | null> {
  const from = (page - 1) * ADMIN_ASSESSMENT_PAGE_SIZE;
  let query = supabase
    .from(PLAYSAFE_TABLES.assessments)
    .select(
      "id, registration_id, assessor, eval_date, submitted_at, created_at, registration:playsafe_registrations!inner(facility_no, facility_name, submitter_name), answers:playsafe_assessment_answers(status)",
      { count: "exact" },
    )
    .order("submitted_at", { ascending: false, nullsFirst: false })
    .order("created_at", { ascending: false })
    .range(from, from + ADMIN_ASSESSMENT_PAGE_SIZE - 1);
  if (registrationId) query = query.eq("registration_id", registrationId);
  if (keyword) query = query.ilike(SEARCH_COLUMNS[field], `%${escapeLike(keyword)}%`);

  const { data, error, count } = await query;
  if (error) return null;

  const assessments = (data ?? []).map((row) => {
    const registration = row.registration as unknown as RegistrationEmbed;
    const answers = (row.answers as Array<{ status: AnswerStatus }> | null) ?? [];
    return {
      id: row.id as string,
      registrationId: row.registration_id as string,
      facilityNo: registration?.facility_no ?? "",
      facilityName: registration?.facility_name ?? "",
      submitterName: registration?.submitter_name ?? "",
      assessor: (row.assessor as string | null) ?? "",
      evalDate: (row.eval_date as string | null) ?? "",
      submittedAt: ((row.submitted_at as string | null) ?? row.created_at) as string,
      riskItems: answers.filter((answer) => answer.status === "risk_found").length,
    };
  });
  return { assessments, total: count ?? 0, page, pageSize: ADMIN_ASSESSMENT_PAGE_SIZE };
}
