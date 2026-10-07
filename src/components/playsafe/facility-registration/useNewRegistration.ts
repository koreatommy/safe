"use client";

import { useState } from "react";
import { clearAssessmentDraft } from "@/lib/playsafe/assessmentDraft";
import type { useApplicationSave } from "./useApplicationSave";
import type { useFacilityRegistration } from "./useFacilityRegistration";
import { useRegistrationDraftRestore } from "./useRegistrationDraftRestore";

const RESET_CONFIRM = "임시 저장된 시설정보와 사진, 등록한 기구 목록이 이 브라우저에서 삭제됩니다. 새로 입력할까요?";

/** 임시 저장본 복원 여부를 추적하고, 복원된 내용을 버리고 새로 입력하도록 초기화한다. */
export function useNewRegistration(
  state: ReturnType<typeof useFacilityRegistration>,
  application: ReturnType<typeof useApplicationSave>,
  onToast: (message: string) => void,
) {
  const [restoredName, setRestoredName] = useState<string | null>(null);

  useRegistrationDraftRestore(state.hydrate, (facilityName) => setRestoredName(facilityName));

  const startNew = async () => {
    if (!window.confirm(RESET_CONFIRM)) return;
    await clearAssessmentDraft();
    state.reset();
    application.reset();
    setRestoredName(null);
    onToast("입력 내용을 비웠습니다. 새 시설정보를 입력하세요.");
  };

  return { restoredName, startNew };
}
