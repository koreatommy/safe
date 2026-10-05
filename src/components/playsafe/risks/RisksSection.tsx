import { SectionHead } from "../shared/SectionHead";
import { RiskTabs } from "./RiskTabs";
import "./risks.css";

export function RisksSection() {
  return (
    <section className="section" id="risks">
      <div className="wrap">
        <SectionHead
          eyebrow="04 · SPOT THE RISK"
          title="8가지 위험, 하나씩 살펴보기."
          description="위험유형을 선택하면 핵심 조치와 원문 사례를 함께 볼 수 있습니다."
          tag="원문 PDF 16–25쪽"
        />
        <RiskTabs />
        <div className="notice">
          세부평가방법의 수치와 조치는 원문에서 제시한 <b>설치·유지관리 참고용 권고 기준</b>입니다. 개별 시설의 적합 여부는
          구조·이용조건을 함께 고려해야 합니다.
        </div>
      </div>
    </section>
  );
}
