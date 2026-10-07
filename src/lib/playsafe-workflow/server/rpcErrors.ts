const RPC_MESSAGES: Record<string, string> = {
  submission_required: "등록 요청 정보가 올바르지 않습니다. 페이지를 새로고침해 주세요.",
  submitter_required: "입력자 이름과 이메일을 입력해 주세요.",
  submitter_key_conflict: "같은 입력자 이름·이메일로 이미 등록된 시설명입니다. 다른 시설명을 입력해 주세요.",
  consent_required: "개인정보 수집 동의 후 저장할 수 있습니다.",
  checklist_version_mismatch: "안전성평가 항목 버전이 오래되었습니다. 페이지를 새로고침해 주세요.",
  facility_name_required: "시설명을 입력해 주세요.",
  not_eligible: "판단 기준을 모두 충족해야 안전성평가를 등록할 수 있습니다.",
  equipment_count_invalid: "놀이기구는 1~5대까지 등록할 수 있습니다.",
  equipment_id_conflict: "기구 정보가 올바르지 않습니다. 시설정보입력에서 기구를 다시 추가해 주세요.",
  facility_photo_count_invalid: "시설 전경사진은 최대 2장까지 등록할 수 있습니다.",
  facility_photo_conflict: "시설 전경사진 정보가 올바르지 않습니다. 사진을 지우고 다시 추가해 주세요.",
  unrecorded_items: "모든 항목을 확인한 뒤 등록해 주세요.",
  photo_item_invalid: "사진은 '위험요소 있음' 항목에만 첨부할 수 있습니다.",
  registration_not_editable: "이미 안전성평가 등록이 완료된 시설입니다. 같은 입력자·시설명으로 다시 등록할 수 없습니다.",
  registration_not_found: "등록 정보를 찾을 수 없습니다.",
  eligibility_required: "신규설치 등록신청 문항에 모두 답해 주세요.",
  registration_has_assessment: "이미 안전성평가를 등록한 시설은 등록신청 내용을 다시 저장할 수 없습니다.",
  too_many_pending_registrations: "안전성평가 전 저장된 등록이 너무 많습니다. 관리자에게 문의해 주세요.",
};

export function rpcErrorMessage(error: { message?: string; code?: string } | null): string {
  const raw = error?.message ?? "";
  for (const [code, message] of Object.entries(RPC_MESSAGES)) {
    if (raw.includes(code)) return message;
  }
  return "요청을 처리하지 못했습니다. 잠시 후 다시 시도해 주세요.";
}
