"use client";

import { useState } from "react";
import { saveSubmitter } from "@/lib/playsafe-workflow/client/submitterStore";
import type { useFacilityRegistration } from "./useFacilityRegistration";

/** '안전성평가 시작'은 서버에 저장하지 않고 이 브라우저에 임시 저장만 한다. */
export function useAssessmentStart(state: ReturnType<typeof useFacilityRegistration>) {
  const [busy, setBusy] = useState(false);

  const start = async (): Promise<boolean> => {
    setBusy(true);
    try {
      saveSubmitter(state.submitter);
      return await state.saveForAssessment();
    } finally {
      setBusy(false);
    }
  };

  return { busy, start };
}
