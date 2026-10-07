"use client";

import { useEffect, useRef } from "react";
import type { EquipmentDraft, EquipmentDraftChange, EquipmentDraftPhotoChange } from "@/data/playsafe/types";
import { EquipmentDraftFields } from "./EquipmentDraftFields";
import { EquipmentTypePicker } from "./EquipmentTypePicker";
import "./equipment-add-panel.css";

export const EQUIPMENT_PANEL_ID = "equipment-add-panel";

type EquipmentAddPanelProps = {
  selectedTypes: readonly string[];
  drafts: readonly EquipmentDraft[];
  draftTotal: number;
  draftProblem: string;
  onToggleType: (type: string, checked: boolean) => boolean;
  onLimit: () => void;
  onChangeDraft: EquipmentDraftChange;
  onChangeDraftPhoto: EquipmentDraftPhotoChange;
  onClose: () => void;
  onSave: () => void;
};

export function EquipmentAddPanel({
  selectedTypes,
  drafts,
  draftTotal,
  draftProblem,
  onToggleType,
  onLimit,
  onChangeDraft,
  onChangeDraftPhoto,
  onClose,
  onSave,
}: EquipmentAddPanelProps) {
  const panelRef = useRef<HTMLElement>(null);
  const titleRef = useRef<HTMLHeadingElement>(null);

  useEffect(() => {
    panelRef.current?.scrollIntoView({ behavior: "smooth", block: "start" });
    titleRef.current?.focus({ preventScroll: true });
  }, []);

  return (
    <section ref={panelRef} id={EQUIPMENT_PANEL_ID} className="equipment-panel" aria-labelledby="equipment-panel-title">
      <div className="equipment-panel-head">
        <h3 id="equipment-panel-title" ref={titleRef} tabIndex={-1}>
          유사 놀이기구 추가
        </h3>
      </div>
      <form
        className="equipment-panel-body"
        onSubmit={(event) => {
          event.preventDefault();
          onSave();
        }}
      >
        <EquipmentTypePicker selectedTypes={selectedTypes} onToggle={onToggleType} onLimit={onLimit} />
        <p className="facility-type-summary">
          선택 {selectedTypes.length}개 유형 / 총 등록수량 {draftTotal}개 (유형별 수량 합계)
        </p>
        <EquipmentDraftFields drafts={drafts} onChange={onChangeDraft} onChangePhoto={onChangeDraftPhoto} />
        {draftProblem ? <p className="facility-error">{draftProblem}</p> : null}
        <div className="equipment-panel-foot">
          <button type="button" className="btn" onClick={onClose}>
            취소
          </button>
          <button type="submit" className="btn primary" disabled={Boolean(draftProblem)}>
            목록에 추가
          </button>
        </div>
      </form>
    </section>
  );
}
