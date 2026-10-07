"use client";

import { useRouter } from "next/navigation";
import { useRef } from "react";
import { APPLICATION_REQUIRED_MESSAGE, NOT_ELIGIBLE_MESSAGE } from "@/data/playsafe/facility-registration";
import { assessmentRouteFor } from "@/lib/playsafe/routes";
import { scrollToStep } from "@/lib/playsafe/scrollToStep";
import { EquipmentAddPanel } from "./EquipmentAddPanel";
import { EquipmentList } from "./EquipmentList";
import { useEquipmentSave } from "./useEquipmentSave";
import type { useFacilityRegistration } from "./useFacilityRegistration";

type EquipmentStepProps = {
  state: ReturnType<typeof useFacilityRegistration>;
  /** 2단계에서 대상으로 저장되어야 기구를 추가하고 저장할 수 있다. */
  applicationSaved: boolean;
  onToast: (message: string) => void;
};

export function EquipmentStep({ state, applicationSaved, onToast }: EquipmentStepProps) {
  const addButtonRef = useRef<HTMLButtonElement>(null);
  const router = useRouter();
  const equipmentSave = useEquipmentSave(state, applicationSaved, onToast);
  const closed = !state.allEligible;

  const returnToToolbar = () => {
    requestAnimationFrame(() => {
      const button = addButtonRef.current;
      button?.scrollIntoView({ behavior: "smooth", block: "center" });
      button?.focus({ preventScroll: true });
    });
  };

  const openPanel = () => {
    if (applicationSaved) {
      state.openAddPanel();
      return;
    }
    onToast(APPLICATION_REQUIRED_MESSAGE);
    scrollToStep("step2");
  };

  const closePanel = () => {
    state.closeAddPanel();
    returnToToolbar();
  };

  const savePanel = () => {
    const result = state.saveDrafts();
    if (!result.ok) return;
    onToast(
      result.count
        ? `${result.count}개 기구를 목록에 추가했습니다. ‘저장’을 눌러 DB에 저장해 주세요.`
        : "기구 추가 없이 입력란을 닫았습니다.",
    );
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

  const startAssessment = async () => {
    if (closed) {
      onToast(NOT_ELIGIBLE_MESSAGE);
      scrollToStep("step2");
      return;
    }
    const registrationId =
      equipmentSave.saved && state.registrationId ? state.registrationId : await equipmentSave.save();
    if (registrationId) router.push(assessmentRouteFor(registrationId));
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
              : applicationSaved
                ? "놀이기구를 추가한 뒤 ‘저장’을 누르면 시설정보·등록신청정보와 함께 DB에 저장됩니다."
                : "신규설치 등록신청에서 ‘선택 확인’을 눌러 저장한 뒤 놀이기구를 추가할 수 있습니다."}
          </p>
        </div>
      </header>
      <EquipmentList
        rows={state.rows}
        closed={closed}
        adding={state.addPanelOpen}
        addButtonRef={addButtonRef}
        onToggleAdd={state.addPanelOpen ? closePanel : openPanel}
        onRemove={state.removeRow}
        onExport={exportRegistration}
        onSave={() => void equipmentSave.save()}
        onStartAssessment={() => void startAssessment()}
        saving={equipmentSave.busy}
        saved={equipmentSave.saved}
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
              onChangeDraftPhoto={state.updateDraftPhoto}
              onClose={closePanel}
              onSave={savePanel}
            />
          ) : null
        }
      />
    </article>
  );
}
