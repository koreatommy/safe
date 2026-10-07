"use client";

import { useState } from "react";
import { ELIGIBILITY_VERSION } from "@/lib/playsafe-workflow/constants";
import { saveApplication } from "@/lib/playsafe-workflow/client/saveApplication";
import { saveSubmitter } from "@/lib/playsafe-workflow/client/submitterStore";
import type { ApplicationResult } from "@/lib/playsafe-workflow/types";
import type { useFacilityRegistration } from "./useFacilityRegistration";

type SavedApplication = { status: ApplicationResult["status"]; answersKey: string };

export function useApplicationSave(state: ReturnType<typeof useFacilityRegistration>) {
  const [busy, setBusy] = useState(false);
  const [saved, setSaved] = useState<SavedApplication | null>(null);
  const answersKey = state.answers.join(",");

  /** 2단계에서 대상으로 저장한 뒤 답을 바꾸지 않았거나, 저장된 등록을 브라우저 임시 저장에서 불러온 경우. */
  const registered =
    state.allEligible &&
    (saved ? saved.status === "registered" && saved.answersKey === answersKey : Boolean(state.registrationId));

  const save = async () => {
    setBusy(true);
    try {
      saveSubmitter(state.submitter);
      const result = await saveApplication({
        id: state.registrationId,
        consentAt: state.consentAt ?? new Date().toISOString(),
        eligibilityVersion: ELIGIBILITY_VERSION,
        information: state.info,
        facilityPhotos: state.facilityPhotos,
        answers: state.answers.map((answer, index) => ({
          code: state.eligibilityCodes[index],
          answer,
        })),
      });
      state.setRegistrationId(result.registrationId);
      setSaved({ status: result.status, answersKey });
      return result;
    } finally {
      setBusy(false);
    }
  };

  return { busy, registered, save };
}
