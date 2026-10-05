"use client";

import { useState } from "react";
import { ELIGIBILITY_VERSION } from "@/lib/playsafe-workflow/constants";
import { closeRegistration } from "@/lib/playsafe-workflow/client/api";
import { saveSubmitter } from "@/lib/playsafe-workflow/client/submitterStore";
import type { useFacilityRegistration } from "./useFacilityRegistration";

export function useRegistrationClose(state: ReturnType<typeof useFacilityRegistration>) {
  const [busy, setBusy] = useState(false);
  const [closedAt, setClosedAt] = useState<string | null>(null);

  const close = async () => {
    setBusy(true);
    try {
      saveSubmitter(state.submitter);
      const result = await closeRegistration({
        id: state.registrationId,
        consentAt: state.consentAt ?? new Date().toISOString(),
        eligibilityVersion: ELIGIBILITY_VERSION,
        information: state.info,
        answers: state.answers.map((answer, index) => ({
          code: state.eligibilityCodes[index],
          answer,
        })),
      });
      state.setRegistrationId(result.registrationId);
      setClosedAt(new Date().toISOString());
      return result;
    } finally {
      setBusy(false);
    }
  };

  return { busy, closedAt, close };
}
