"use client";

import { useRouter } from "next/navigation";
import { useRef, useState } from "react";
import { NOT_ELIGIBLE_MESSAGE } from "@/data/playsafe/facility-registration";
import { playsafeRoutes } from "@/lib/playsafe/routes";
import { validateSubmitter } from "@/lib/playsafe-workflow/validation/submitter";
import { scrollToStep } from "@/lib/playsafe/scrollToStep";
import { useAssessmentStart } from "./useAssessmentStart";
import { useRegistrationClose } from "./useRegistrationClose";
import { EquipmentAddPanel } from "./EquipmentAddPanel";
import { EquipmentList } from "./EquipmentList";
import { NotTargetDialog } from "./NotTargetDialog";
import type { useFacilityRegistration } from "./useFacilityRegistration";

type EquipmentStepProps = {
  state: ReturnType<typeof useFacilityRegistration>;
  onToast: (message: string) => void;
};

export function EquipmentStep({ state, onToast }: EquipmentStepProps) {
  const addButtonRef = useRef<HTMLButtonElement>(null);
  const router = useRouter();
  const [notTargetOpen, setNotTargetOpen] = useState(false);
  const starter = useAssessmentStart(state);
  const closure = useRegistrationClose(state);
  const closed = !state.allEligible;

  const returnToToolbar = () => {
    requestAnimationFrame(() => {
      const button = addButtonRef.current;
      button?.scrollIntoView({ behavior: "smooth", block: "center" });
      button?.focus({ preventScroll: true });
    });
  };

  const closePanel = () => {
    state.closeAddPanel();
    returnToToolbar();
  };

  const savePanel = () => {
    const result = state.saveDrafts();
    if (!result.ok) return;
    onToast(result.count ? `${result.count}개 기구의 개별 정보가 추가되었습니다.` : "기구 추가 없이 입력란을 닫았습니다.");
    returnToToolbar();
  };

  const exportRegistration = () => {
    const form = document.querySelector<HTMLFormElement>(".facility-form");
    if (form && !form.reportValidity()) {
      scrollToStep("step1");
      return;
    }
    if (!state.allEligible) {
      onToast(NOT_ELIGIBLE_MESSAGE);
      scrollToStep("step2");
      return;
    }
    state.exportJson();
    onToast("입력한 등록정보를 JSON 파일로 다운로드했습니다.");
  };

  const facilityInputsReady = () => {
    const form = document.querySelector<HTMLFormElement>(".facility-form");
    if (form && !form.reportValidity()) {
      scrollToStep("step1");
      return false;
    }
    const problem = !state.info.facilityName.trim()
      ? "시설명을 입력해 주세요."
      : !state.consentAt
        ? "개인정보 수집 동의 후 진행해 주세요."
        : validateSubmitter(state.submitter);
    if (problem) {
      onToast(problem);
      scrollToStep("step1");
      return false;
    }
    return true;
  };

  const saveClosure = () => {
    if (closure.busy) return;
    setNotTargetOpen(false);
    if (!facilityInputsReady()) return;
    void closure
      .close()
      .then(() => {
        setNotTargetOpen(true);
        onToast("시설정보와 판단 기준 답변을 대상 아님으로 저장했습니다.");
      })
      .catch((error: unknown) => {
        onToast(error instanceof Error ? error.message : "종결 정보를 저장하지 못했습니다.");
      });
  };

  const startAssessment = () => {
    if (starter.busy) return;
    if (closed) {
      setNotTargetOpen(true);
      return;
    }
    if (!facilityInputsReady()) return;
    const problem = state.completionProblem;
    if (problem) {
      onToast(problem.message);
      scrollToStep(problem.step);
      return;
    }
    void starter.start().then((saved) => {
      if (!saved) {
        onToast("브라우저 저장 공간이 부족해 시설정보를 임시 저장하지 못했습니다.");
        return;
      }
      router.push(playsafeRoutes.assessment);
    });
  };

  return (
    <article className="facility-block" id="step3">
      <header className="facility-block-title">
        <span className="facility-number">3</span>
        <div>
          <h2>기구정보 등록</h2>
          <p>
            {closed
              ? "신규설치 등록신청 판단 기준을 만족하지 않아 놀이기구 없음으로 종결되었습니다."
              : "놀이기구를 추가하고 등록 정보를 확인합니다."}
          </p>
        </div>
      </header>
      <EquipmentList
        rows={state.rows}
        closed={closed}
        adding={state.addPanelOpen}
        addButtonRef={addButtonRef}
        onToggleAdd={state.addPanelOpen ? closePanel : state.openAddPanel}
        onRemove={state.removeRow}
        onExport={exportRegistration}
        onStartAssessment={startAssessment}
        startBusy={starter.busy}
        addPanel={
          state.addPanelOpen ? (
            <EquipmentAddPanel
              selectedTypes={state.selectedTypes}
              drafts={state.activeDrafts}
              draftTotal={state.draftTotal}
              draftProblem={state.draftProblem}
              onToggleType={state.toggleType}
              onLimit={() => onToast("선택 가능한 유형은 최대 5개입니다.")}
              onChangeDraft={state.updateDraft}
              onClose={closePanel}
              onSave={savePanel}
            />
          ) : null
        }
      />
      <NotTargetDialog
        open={notTargetOpen}
        criteria={state.failedCriteria}
        saving={closure.busy}
        saved={Boolean(closure.closedAt)}
        onSave={saveClosure}
        onClose={() => setNotTargetOpen(false)}
        onReview={() => {
          setNotTargetOpen(false);
          scrollToStep("step2");
        }}
      />
    </article>
  );
}
