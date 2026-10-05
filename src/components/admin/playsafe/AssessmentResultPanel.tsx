"use client";

import { usePlaysafeAdminDetail } from "@/hooks/usePlaysafeAdminDetail";
import { ChecklistResultList } from "./ChecklistResultList";
import { DetailSection, InfoGrid } from "./DetailSection";
import { EquipmentSection } from "./EquipmentSection";
import { orDash } from "./format";

export function AssessmentResultPanel({ registrationId }: { registrationId: string }) {
  const { detail, error } = usePlaysafeAdminDetail(registrationId);

  if (error) return <p className="text-amber-200 text-sm">{error}</p>;
  if (!detail) return <p className="text-white/60 text-sm">불러오는 중...</p>;

  const { registration, assessment } = detail;
  if (!assessment) return <p className="text-white/60 text-sm">안전성평가가 없습니다.</p>;

  const riskItems = assessment.answers.filter((answer) => answer.status === "risk_found").length;

  return (
    <div className="space-y-4 text-sm">
      <DetailSection title="평가 개요">
        <InfoGrid
          items={[
            ["시설명", registration.information.facilityName],
            ["입력자", `${registration.submitter.name} (${registration.submitter.email})`],
            ["평가자", orDash(assessment.assessor)],
            ["평가일", orDash(assessment.evalDate)],
            ["위험요소 있음", `${riskItems}건`],
          ]}
        />
      </DetailSection>
      <EquipmentSection equipment={registration.equipment} closed={false} />
      <ChecklistResultList assessment={assessment} />
    </div>
  );
}
