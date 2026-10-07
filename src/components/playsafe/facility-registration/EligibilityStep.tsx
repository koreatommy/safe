"use client";

import { useState } from "react";
import { APPLICATION_SAVED_MESSAGE } from "@/data/playsafe/facility-registration";
import { scrollToStep } from "@/lib/playsafe/scrollToStep";
import { EligibilityQuestions } from "./EligibilityQuestions";
import { facilityInputsReady } from "./facilityInputsReady";
import { NotTargetDialog } from "./NotTargetDialog";
import type { useApplicationSave } from "./useApplicationSave";
import type { useFacilityRegistration } from "./useFacilityRegistration";

type EligibilityStepProps = {
  state: ReturnType<typeof useFacilityRegistration>;
  application: ReturnType<typeof useApplicationSave>;
  onToast: (message: string) => void;
};

/** 2단계: 답변 확인 시 시설정보·등록신청을 DB에 저장하고, 대상 아님이면 종결 팝업을 띄운다. */
export function EligibilityStep({ state, application, onToast }: EligibilityStepProps) {
  const [notTargetOpen, setNotTargetOpen] = useState(false);

  const confirm = () => {
    if (application.busy || !facilityInputsReady(state, onToast)) return;
    void application
      .save()
      .then((result) => {
        if (result.status === "not_target") {
          setNotTargetOpen(true);
          return;
        }
        onToast(APPLICATION_SAVED_MESSAGE);
        scrollToStep("step3");
      })
      .catch((error: unknown) => {
        onToast(error instanceof Error ? error.message : "시설정보와 등록신청정보를 저장하지 못했습니다.");
      });
  };

  return (
    <article className="facility-block" id="step2">
      <header className="facility-block-title">
        <span className="facility-number">2</span>
        <div>
          <h2>신규설치 등록신청 화면</h2>
          <p>각 질문에 네 또는 아니요를 선택합니다. 선택 확인을 누르면 시설정보와 등록신청 내용이 저장됩니다.</p>
        </div>
      </header>
      <EligibilityQuestions
        answers={state.answers}
        failedCriteria={state.failedCriteria}
        saving={application.busy}
        onAnswer={state.setAnswer}
        onBack={() => scrollToStep("step1")}
        onNext={confirm}
      />
      {application.registered ? (
        <p className="facility-saved" role="status">
          {APPLICATION_SAVED_MESSAGE}
        </p>
      ) : null}
      <NotTargetDialog
        open={notTargetOpen}
        criteria={state.failedCriteria}
        onClose={() => setNotTargetOpen(false)}
        onConfirm={() => {
          setNotTargetOpen(false);
          scrollToStep("step3");
        }}
        onReview={() => setNotTargetOpen(false)}
      />
    </article>
  );
}
