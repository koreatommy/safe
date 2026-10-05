"use client";

import { useEffect } from "react";
import { quizQuestions } from "@/data/playsafe/quiz";
import { loadSubmitter } from "@/lib/playsafe-workflow/client/submitterStore";
import { loadRegistrationDraft } from "@/lib/playsafe/assessmentDraft";
import type { useFacilityRegistration } from "./useFacilityRegistration";

/** 등록 전 이 브라우저에 임시 저장된 시설정보가 있으면 처음 한 번 복원한다. */
export function useRegistrationDraftRestore(
  hydrate: ReturnType<typeof useFacilityRegistration>["hydrate"],
  onRestored: () => void,
) {
  useEffect(() => {
    let cancelled = false;
    void loadRegistrationDraft()
      .then((draft) => {
        if (!draft || cancelled) return;
        hydrate({
          id: draft.id,
          submitter: loadSubmitter() ?? undefined,
          consentAt: draft.consentAt ?? null,
          information: draft.information,
          answers: quizQuestions.map(
            (question) => draft.eligibility?.find((item) => item.code === question.code)?.answer ?? "yes",
          ),
          equipment: draft.equipment,
        });
        onRestored();
      })
      .catch(() => undefined);
    return () => {
      cancelled = true;
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps -- restore only once on mount
  }, []);
}
