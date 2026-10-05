import { evaluationScope, existingLimits, lawItems } from "@/data/playsafe/law";
import { externalLinks } from "@/data/playsafe/links";
import { ContextCard } from "./ContextCard";
import "./context.css";

export function ContextSection() {
  return (
    <>
      <section className="section context-section" id="why-evaluation" aria-labelledby="context-title">
        <div className="wrap">
          <div className="context-intro reveal">
            <span className="eyebrow">새로운 놀이공간, 새로운 안전관리</span>
            <h2 id="context-title">
              보이지 않는 위험까지 살피는
              <br />
              <em>신종 놀이시설 안전성평가</em>
            </h2>
            <p>
              무인키즈풀·무인키즈카페처럼 어린이놀이기구가 없어도 놀이를 제공하는 공간이 늘었습니다. 2026년 개정법은 이 같은
              신종·유사 놀이시설을 어린이놀이시설의 범위에 포함하고, 2027년 2월 28일부터 안전성평가 규정을 시행합니다.
            </p>
          </div>

          <div className="law-summary reveal" aria-label="개정 법령 핵심 사항">
            {lawItems.map((item) => (
              <div className="law-item" key={item.label}>
                <span>{item.label}</span>
                <strong>{item.title}</strong>
                <p>{item.description}</p>
              </div>
            ))}
          </div>
          <p className="law-sources">
            2027. 2. 28. 시행 예정 ·{" "}
            <a href={externalLinks.revisedLaw} target="_blank" rel="noopener noreferrer">
              개정 「어린이놀이시설 안전관리법」 ↗
            </a>
          </p>

          <div className="context-columns">
            <ContextCard
              variant="challenge"
              index="01"
              micro="WHY NOW"
              title="기존 관리 방식만으로 살피기 어려운 부분"
              description="기존의 정량화된 안전기준과 법정 검사는 표준화된 어린이놀이기구 관리에 활용됩니다. 형태가 다양한 신종 놀이공간에서는 다음과 같은 위험까지 살펴볼 필요가 있습니다."
              items={existingLimits}
            />
            <ContextCard
              variant="solution"
              index="02"
              micro="WHAT IT COVERS"
              title="안전성평가가 함께 확인하는 것"
              description="놀이기구의 상태에 더해 실제 놀이에서 생길 수 있는 위험과 공간의 운영 방식을 종합적으로 살핍니다."
              items={evaluationScope}
            />
          </div>

          <div className="context-takeaway reveal">
            <span className="context-mark" aria-hidden="true">
              ✳
            </span>
            <p>
              <strong>핵심은 위험의 발견과 개선입니다.</strong> 관리주체가 시설·환경·이용자 행동을 살피고, 확인된 위험을 줄인 뒤
              다시 안전성평가하는 정성적·종합적 위험관리 과정입니다.
            </p>
            <a href="#process">
              평가 절차 살펴보기 <span aria-hidden="true">↗</span>
            </a>
          </div>
        </div>
      </section>
      <div className="wrap source-note">
        읽기 안내 · 평가 방법과 이미지는 2025년 행정안전부 가이드라인을 재구성했습니다. 시행일·의무·과태료는 2026년 개정법과
        지자체 개정 안내를 반영했습니다. 가이드라인의 과거 ‘권고·도입 예정’ 표기는 현행 개정법과 구분해 읽어주세요. PDF 쪽수는
        첨부 파일 기준입니다.
      </div>
    </>
  );
}
