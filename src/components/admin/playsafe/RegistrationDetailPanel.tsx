"use client";

import { usePlaysafeAdminDetail } from "@/hooks/usePlaysafeAdminDetail";
import { EligibilityAnswersSection } from "./EligibilityAnswersSection";
import { EquipmentSection } from "./EquipmentSection";
import { FacilityInfoSection } from "./FacilityInfoSection";

type RegistrationDetailPanelProps = {
  registrationId: string;
  onOpenAssessment?: () => void;
};

export function RegistrationDetailPanel({ registrationId, onOpenAssessment }: RegistrationDetailPanelProps) {
  const { detail, error } = usePlaysafeAdminDetail(registrationId);

  if (error) return <p className="text-amber-200 text-sm">{error}</p>;
  if (!detail) return <p className="text-white/60 text-sm">불러오는 중...</p>;

  const { registration, assessment } = detail;
  const riskItems = assessment?.answers.filter((answer) => answer.status === "risk_found").length ?? 0;

  return (
    <div className="space-y-4 text-sm">
      <FacilityInfoSection registration={registration} />
      <EligibilityAnswersSection answers={registration.answers} />
      <EquipmentSection equipment={registration.equipment} closed={registration.status === "not_target"} />
      {assessment ? (
        <div className="flex flex-wrap items-center justify-between gap-2 rounded-lg border border-white/10 bg-white/[0.03] p-3">
          <p className="text-white/70">
            안전성평가 등록 완료 · 위험요소 {riskItems}건
          </p>
          {onOpenAssessment ? (
            <button
              type="button"
              onClick={onOpenAssessment}
              className="rounded-lg border border-[#00ff88]/50 bg-[#00ff88]/10 px-3 py-1.5 text-xs text-[#00ff88] hover:bg-[#00ff88]/20"
            >
              평가 결과 보기
            </button>
          ) : null}
        </div>
      ) : null}
    </div>
  );
}
