import Image from "next/image";
import { newSimilarPlayTypes } from "@/data/playsafe/play-types";
import { imagePath } from "@/lib/playsafe/assets";
import { SectionHead } from "../shared/SectionHead";
import "./play-types.css";

export function PlayTypesSection() {
  return (
    <section className="section" id="types">
      <div className="wrap">
        <SectionHead
          eyebrow="02 · PLAY TYPES"
          title="어떤 놀이를 하는 공간인가요?"
          description="기구의 이름보다 어린이가 하는 행동에 주목하세요. 원문은 8가지 놀이형태로 구분합니다."
          tag="원문 PDF 10쪽 · 실제 수록 이미지"
        />
        <div className="type-grid">
          {newSimilarPlayTypes.map((type, i) => (
            <article className="type-card reveal" key={type.slug}>
              <div className="type-pics">
                {[1, 2].map((n) => (
                  <Image
                    key={n}
                    src={imagePath(`type-${type.slug}-${n}`)}
                    alt={`${type.title} 원문 예시 ${n}`}
                    width={182}
                    height={137}
                    sizes="(max-width: 720px) 25vw, 140px"
                  />
                ))}
              </div>
              <div className="type-body">
                <span className="micro">TYPE {String(i + 1).padStart(2, "0")}</span>
                <h3>{type.title}</h3>
                <p>{type.description}</p>
              </div>
            </article>
          ))}
        </div>
      </div>
    </section>
  );
}
