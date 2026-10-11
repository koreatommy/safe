"use client";

import { useEffect, useRef } from "react";
import type { useAdminRegistrationEdit } from "@/hooks/useAdminRegistrationEdit";
import type { RegistrationStatus } from "@/lib/playsafe-workflow/types";
import { EditAssessmentForm } from "./EditAssessmentForm";

type AssessmentEditSectionProps = {
  edit: ReturnType<typeof useAdminRegistrationEdit>;
  status: RegistrationStatus;
  hasSavedAssessment: boolean;
  scrollOnMount?: boolean;
  disabled: boolean;
};

const noticeClass = "rounded-lg border border-white/10 bg-white/[0.03] px-3 py-2 text-xs text-white/55";
const buttonClass = "rounded-lg border px-3 py-1.5 text-xs disabled:opacity-40";

export function AssessmentEditSection({
  edit,
  status,
  hasSavedAssessment,
  scrollOnMount = false,
  disabled,
}: AssessmentEditSectionProps) {
  const assessment = edit.draft.assessment;
  const sectionRef = useRef<HTMLElement>(null);

  useEffect(() => {
    if (scrollOnMount) sectionRef.current?.scrollIntoView({ block: "start" });
  }, [scrollOnMount]);

  return (
    <section ref={sectionRef} className="space-y-3">
      <div className="flex items-center justify-between gap-2">
        <h3 className="text-sm font-semibold text-white/85">안전성평가</h3>
        {assessment && !hasSavedAssessment ? (
          <button
            type="button"
            disabled={disabled}
            onClick={edit.cancelNewAssessment}
            className={`${buttonClass} border-white/20 text-white/70 hover:bg-white/10`}
          >
            등록 취소
          </button>
        ) : null}
      </div>
      {assessment ? (
        <>
          {!hasSavedAssessment ? (
            <p className={noticeClass}>
              기구를 1대 이상 등록하고 18개 항목을 모두 확인한 뒤 저장하면 안전성평가가 등록되고, 시설은 &lsquo;안전성평가 등록 완료&rsquo; 상태가 됩니다.
            </p>
          ) : null}
          <EditAssessmentForm
            assessment={assessment}
            disabled={disabled}
            onAssessor={edit.setAssessor}
            onEvalDate={edit.setEvalDate}
            onStatus={edit.setAnswerStatus}
            onMemo={edit.setAnswerMemo}
            onAddPhotos={(itemCode, files) => void edit.addRiskPhotos(itemCode, files)}
            onRemovePhoto={edit.removeRiskPhoto}
          />
        </>
      ) : status === "not_target" ? (
        <p className={noticeClass}>평가대상이 아닌 시설이라 안전성평가를 등록할 수 없습니다.</p>
      ) : (
        <div className={`${noticeClass} flex flex-wrap items-center justify-between gap-2`}>
          <span>안전성평가가 아직 등록되지 않았습니다.</span>
          <button
            type="button"
            disabled={disabled}
            onClick={edit.startAssessment}
            className={`${buttonClass} border-[#00ff88]/50 bg-[#00ff88]/15 text-[#00ff88] hover:bg-[#00ff88]/25`}
          >
            안전성평가 등록
          </button>
        </div>
      )}
    </section>
  );
}
