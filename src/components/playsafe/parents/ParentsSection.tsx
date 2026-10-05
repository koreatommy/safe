import Image from "next/image";
import { imagePath } from "@/lib/playsafe/assets";
import { SectionHead } from "../shared/SectionHead";
import { SourcePageButton } from "../source-viewer/SourcePageButton";
import "./parents.css";

const POSTERS = [
  {
    image: "poster-kids-cafe",
    alt: "원문 무인키즈카페 보호자 안전수칙 포스터",
    title: "무인키즈카페",
    description: "놀이공간에서 보호자가 알아야 할 안전수칙을 안내합니다.",
    page: 37,
  },
  {
    image: "poster-kids-pool",
    alt: "원문 무인키즈풀 보호자 안전수칙 포스터",
    title: "무인키즈풀",
    description: "물놀이 중 관찰과 동반 보호, 이용 전 주의사항을 확인하세요.",
    page: 38,
  },
];

export function ParentsSection() {
  return (
    <section className="section" id="parents">
      <div className="wrap">
        <SectionHead
          eyebrow="06 · SHARE WITH PARENTS"
          title="보호자와 함께 만드는 안전."
          description="이용수칙은 눈에 잘 띄는 곳에. 연령과 놀이 특성에 맞춰 안내하세요."
          tag="원문 PDF 34–38쪽"
        />
        <div className="posters">
          {POSTERS.map((poster) => (
            <article className="poster reveal" key={poster.title}>
              <Image src={imagePath(poster.image)} alt={poster.alt} width={942} height={1241} sizes="(max-width: 720px) 115px, 160px" />
              <div>
                <h3>{poster.title}</h3>
                <p>{poster.description}</p>
                <SourcePageButton page={poster.page}>안전수칙 크게 보기 ↗</SourcePageButton>
              </div>
            </article>
          ))}
        </div>
        <details className="parents-details">
          <summary>어린이 연령별 행동 특성도 함께 확인하세요</summary>
          <p>
            어린이의 위험 인지와 운동 능력은 발달 단계마다 다릅니다. 원문은 어린이의 연령·신장 및 놀이행동을 고려한 지도·감독을
            안내합니다. 어린 연령에서는 보호자의 도움이 필요하며, 기어오를 수 있어도 내려오기는 어려운 시기 등 행동상의 차이가
            있습니다. 연령만으로 개별 어린이의 능력을 단정하지 않고 실제 놀이를 관찰하세요.
          </p>
          <SourcePageButton page={34}>연령별 특성 원문 보기 ↗</SourcePageButton>
        </details>
      </div>
    </section>
  );
}
