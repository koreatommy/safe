import "server-only";

import type { SupabaseClient } from "@supabase/supabase-js";
import { PLAYSAFE_TABLES } from "../constants";
import type { SavedRegistration, Submitter } from "../types";
import { sameSubmitter } from "../validation/submitter";
import { loadRegistrationView } from "./workspaceParts";

type LoadResult =
  | { ok: true; registration: SavedRegistration }
  | { ok: false; status: 404 | 409; message: string };

const NOT_FOUND = { ok: false, status: 404, message: "저장된 시설정보를 찾을 수 없습니다. 입력자 이름·이메일을 확인해 주세요." } as const;

/** 입력자 본인의 '평가 전(registered)' 등록만 사진 서명 URL과 함께 돌려준다. */
export async function loadSavedRegistration(
  admin: SupabaseClient,
  registrationId: string,
  submitter: Submitter,
): Promise<LoadResult> {
  const { data: owner } = await admin
    .from(PLAYSAFE_TABLES.registrations)
    .select("submitter_name, submitter_email, status")
    .eq("id", registrationId)
    .maybeSingle();
  if (!owner || !sameSubmitter(submitter, { name: owner.submitter_name ?? "", email: owner.submitter_email ?? "" })) {
    return NOT_FOUND;
  }
  if (owner.status === "submitted") {
    return { ok: false, status: 409, message: "이미 안전성평가 등록이 완료된 시설입니다." };
  }
  if (owner.status !== "registered") {
    return { ok: false, status: 409, message: "신규설치 등록신청 판단 기준을 만족하지 않아 종결된 시설입니다." };
  }

  const registration = await loadRegistrationView(admin, registrationId);
  if (!registration) return NOT_FOUND;
  if (registration.equipment.length === 0) {
    return { ok: false, status: 409, message: "놀이기구를 추가하고 ‘저장’을 누른 뒤 안전성평가를 시작해 주세요." };
  }
  return { ok: true, registration };
}
