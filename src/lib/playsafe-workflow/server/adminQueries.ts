import "server-only";

import type { SupabaseClient } from "@supabase/supabase-js";
import type { AdminRegistrationPage, RegistrationSearch } from "../adminTypes";
import { ADMIN_REGISTRATION_PAGE_SIZE, PLAYSAFE_TABLES } from "../constants";
import type { RegistrationStatus } from "../types";
import { escapeLike } from "./escapeLike";

type CountEmbed = Array<{ count: number }> | null;

export async function listRegistrations(
  supabase: SupabaseClient,
  { keyword, target }: RegistrationSearch,
  page: number,
): Promise<AdminRegistrationPage | null> {
  const from = (page - 1) * ADMIN_REGISTRATION_PAGE_SIZE;
  let query = supabase
    .from(PLAYSAFE_TABLES.registrations)
    .select(
      "id, status, submitter_name, submitter_email, facility_no, facility_name, manager_name, place, address, all_eligible, created_at, submitted_at, equipment:playsafe_registration_equipment(count)",
      { count: "exact" },
    )
    .order("created_at", { ascending: false })
    .range(from, from + ADMIN_REGISTRATION_PAGE_SIZE - 1);
  if (target === "target") query = query.neq("status", "not_target");
  if (target === "not_target") query = query.eq("status", "not_target");
  if (keyword) query = query.ilike("facility_name", `%${escapeLike(keyword)}%`);

  const { data, error, count } = await query;
  if (error) return null;
  const registrations = (data ?? []).map((row) => ({
    id: row.id as string,
    status: row.status as RegistrationStatus,
    submitterName: row.submitter_name as string,
    submitterEmail: row.submitter_email as string,
    facilityNo: row.facility_no as string,
    facilityName: row.facility_name as string,
    managerName: row.manager_name as string,
    place: row.place as string,
    address: row.address as string,
    allEligible: row.all_eligible as boolean,
    equipmentCount: (row.equipment as CountEmbed)?.[0]?.count ?? 0,
    createdAt: row.created_at as string,
    submittedAt: (row.submitted_at as string | null) ?? null,
  }));
  return { registrations, total: count ?? 0, page, pageSize: ADMIN_REGISTRATION_PAGE_SIZE };
}
