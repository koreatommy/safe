"use client";

import { useState } from "react";
import { APPLICATION_REQUIRED_MESSAGE, EQUIPMENT_SAVED_MESSAGE } from "@/data/playsafe/facility-registration";
import { saveApplication } from "@/lib/playsafe-workflow/client/saveApplication";
import { saveSubmitter } from "@/lib/playsafe-workflow/client/submitterStore";
import { scrollToStep } from "@/lib/playsafe/scrollToStep";
import { applicationSource, registrationChangeKey } from "./applicationSource";
import { facilityInputsReady } from "./facilityInputsReady";
import type { useFacilityRegistration } from "./useFacilityRegistration";

/** 3단계 '저장': 시설정보·등록신청·기구정보를 한 번에 DB에 저장하고, 이후 변경 여부를 추적한다. */
export function useEquipmentSave(
  state: ReturnType<typeof useFacilityRegistration>,
  applicationSaved: boolean,
  onToast: (message: string) => void,
) {
  const [busy, setBusy] = useState(false);
  const [savedKey, setSavedKey] = useState<string | null>(null);
  const [storedPhotoIds, setStoredPhotoIds] = useState<ReadonlySet<string>>(() => new Set());
  const changeKey = registrationChangeKey(state);
  const saved = Boolean(state.registrationId) && savedKey === changeKey;

  const ready = () => {
    if (!applicationSaved) {
      onToast(APPLICATION_REQUIRED_MESSAGE);
      scrollToStep("step2");
      return false;
    }
    if (!facilityInputsReady(state, onToast)) return false;
    const problem = state.completionProblem;
    if (problem) {
      onToast(problem.message);
      scrollToStep(problem.step);
      return false;
    }
    return true;
  };

  /** 저장된 등록 id를 돌려주고, 확인 실패·저장 실패 시 안내 후 null. */
  const save = async (): Promise<string | null> => {
    if (busy || !ready()) return null;
    setBusy(true);
    try {
      saveSubmitter(state.submitter);
      const result = await saveApplication({
        ...applicationSource(state),
        equipment: { rows: state.rows, storedPhotoIds },
      });
      state.setRegistrationId(result.registrationId);
      if (result.facilityNo) state.updateInfo("facilityNo", result.facilityNo);
      setStoredPhotoIds(new Set(state.rows.map((row) => row.id)));
      setSavedKey(changeKey);
      void state.saveLocalDraft();
      onToast(EQUIPMENT_SAVED_MESSAGE);
      return result.registrationId;
    } catch (error) {
      onToast(error instanceof Error ? error.message : "기구정보를 저장하지 못했습니다.");
      return null;
    } finally {
      setBusy(false);
    }
  };

  return { busy, saved, save };
}
