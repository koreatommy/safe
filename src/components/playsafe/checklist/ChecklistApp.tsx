"use client";

import { checkItems, RISK_FOUND_STATUS, UNRECORDED_STATUS } from "@/data/playsafe/checks";
import type { CompletedRegistration } from "@/data/playsafe/types";
import { downloadChecklistReport } from "@/lib/playsafe/checklistExport";
import { groupCheckIndices } from "@/lib/playsafe/checklistGroups";
import { Toast } from "../shared/Toast";
import { ChecklistBulkActions } from "./ChecklistBulkActions";
import { ChecklistGroup } from "./ChecklistGroup";
import { ChecklistSubmitBar } from "./ChecklistSubmitBar";
import { useAssessmentSubmission } from "./useAssessmentSubmission";
import { useChecklistState } from "./useChecklistState";
import { useToast } from "./useToast";

const TOTAL = checkItems.length;
const CHECK_GROUPS = groupCheckIndices(checkItems);
const SUBMIT_CONFIRM = "등록 후에는 수정할 수 없습니다. 필요하면 먼저 ‘기록 내려받기’로 사본을 보관해 주세요.\n안전성평가를 등록할까요?";

type ChecklistAppProps = {
  registration: CompletedRegistration;
  onSubmitted: () => void;
};

export function ChecklistApp({ registration, onSubmitted }: ChecklistAppProps) {
  const local = useChecklistState(registration.information.facilityName);
  const { snapshot } = local;
  const submission = useAssessmentSubmission(registration, snapshot);
  const toast = useToast();
  const recorded = snapshot.records.filter((row) => row.status !== UNRECORDED_STATUS).length;
  const riskFound = snapshot.records.filter((row) => row.status === RISK_FOUND_STATUS).length;
  const photoCount = snapshot.records.flatMap((row) => row.photos).length;

  const exportRecords = () => {
    downloadChecklistReport(snapshot);
    toast.show("안전성평가 기록을 내려받았습니다.");
  };

  const submit = () => {
    if (submission.busy || !window.confirm(SUBMIT_CONFIRM)) return;
    void submission
      .submit()
      .then(onSubmitted)
      .catch((cause: unknown) => toast.show(cause instanceof Error ? cause.message : "등록에 실패했습니다."));
  };

  return (
    <div className="check-app">
      <div className="check-top">
        <div>
          <strong aria-live="polite">
            {recorded} / {TOTAL} 안전성평가 항목
          </strong>
          <div className="meter">
            <span style={{ width: `${(recorded / TOTAL) * 100}%` }} />
          </div>
          <p>
            미확인 {TOTAL - recorded} · 위험요소 있음 {riskFound} · 사진 {photoCount}장
          </p>
        </div>
        <div className="row">
          <button type="button" className="btn" onClick={exportRecords}>
            기록 내려받기 ↓
          </button>
          <button type="button" className="btn primary" onClick={() => window.print()}>
            안전성평가표 인쇄 ↗
          </button>
        </div>
      </div>

      <div className="check-fields">
        <label>
          시설명
          <input className="field" value={snapshot.facilityName} readOnly aria-describedby="check-facility-hint" />
          <span id="check-facility-hint" className="check-field-hint">
            시설정보입력에서 등록한 시설명입니다.
          </span>
        </label>
        <label>
          평가자
          <input
            className="field"
            placeholder="성명 또는 담당자"
            value={snapshot.assessor}
            disabled={submission.busy}
            onChange={(event) => local.setInfo("assessor", event.target.value)}
          />
        </label>
        <label>
          평가일
          <input
            className="field"
            type="date"
            value={snapshot.evalDate}
            disabled={submission.busy}
            onChange={(event) => local.setInfo("evalDate", event.target.value)}
          />
        </label>
      </div>

      <ChecklistBulkActions records={snapshot.records} onSetAll={local.setAllStatuses} />

      <div>
        {CHECK_GROUPS.map((group, order) => (
          <ChecklistGroup
            key={group.category}
            order={order + 1}
            group={group}
            records={snapshot.records}
            actions={{ onChange: local.updateRecord, onAddPhoto: local.addPhoto, onRemovePhoto: local.removePhoto }}
          />
        ))}
      </div>

      <ChecklistSubmitBar
        unrecorded={TOTAL - recorded}
        busy={submission.busy}
        progress={submission.progress}
        onSubmit={submit}
      />

      <Toast message={toast.message} />
    </div>
  );
}
