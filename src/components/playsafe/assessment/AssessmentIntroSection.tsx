import Link from "next/link";
import { playsafeRoutes } from "@/lib/playsafe/routes";
import { SectionHead } from "../shared/SectionHead";

export function AssessmentIntroSection() {
  return (
    <section className="section white" id="assessment">
      <div className="wrap">
        <SectionHead
          eyebrow="05 · START YOUR CHECK"
          title="읽었다면, 우리 공간의 안전성평가를 시작해 보세요."
          description="18개 항목의 확인 상태와 조치 메모를 남기세요. 진행률은 안전등급이 아닌 기록 완료 비율입니다."
        />
        <Link className="btn primary" href={playsafeRoutes.facilityInfo}>
          안전성평가 <span>↗</span>
        </Link>
      </div>
    </section>
  );
}
