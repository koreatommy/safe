"use client";

import { useState } from "react";
import { saveApplication } from "@/lib/playsafe-workflow/client/saveApplication";
import { saveSubmitter } from "@/lib/playsafe-workflow/client/submitterStore";
import type { ApplicationResult } from "@/lib/playsafe-workflow/types";
import { applicationSource } from "./applicationSource";
import type { useFacilityRegistration } from "./useFacilityRegistration";

type SavedApplication = { status: ApplicationResult["status"]; answersKey: string };

export function useApplicationSave(state: ReturnType<typeof useFacilityRegistration>) {
  const [busy, setBusy] = useState(false);
  const [saved, setSaved] = useState<SavedApplication | null>(null);
  /** 대상 아님으로 저장되면 DB 기구가 삭제되므로, 3단계가 이전 저장 상태를 버리도록 올린다. */
  const [equipmentEpoch, setEquipmentEpoch] = useState(0);
  const answersKey = state.answers.join(",");

  /** 2단계에서 대상으로 저장한 뒤 답을 바꾸지 않았거나, 저장된 등록을 브라우저 임시 저장에서 불러온 경우. */
  const registered =
    state.allEligible &&
    (saved ? saved.status === "registered" && saved.answersKey === answersKey : Boolean(state.registrationId));

  const save = async () => {
    setBusy(true);
    try {
      saveSubmitter(state.submitter);
      const result = await saveApplication(applicationSource(state));
      state.setRegistrationId(result.registrationId);
      if (result.facilityNo) state.updateInfo("facilityNo", result.facilityNo);
      setSaved({ status: result.status, answersKey });
      if (result.status === "not_target") setEquipmentEpoch((epoch) => epoch + 1);
      return result;
    } finally {
      setBusy(false);
    }
  };

  return { busy, registered, equipmentEpoch, save, reset: () => setSaved(null) };
}
