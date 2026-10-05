import Image from "next/image";
import type { RiskType } from "@/data/playsafe/types";
import { GUIDE_PAGE_SIZE, guidePagePath } from "@/lib/playsafe/assets";
import { SourcePageButton } from "../source-viewer/SourcePageButton";
import "./risk-guide.css";

type RiskGuideContentProps = {
  risk: RiskType;
  titleAs?: "h3" | "h4";
};

export function RiskGuideContent({ risk, titleAs: Title = "h3" }: RiskGuideContentProps) {
  return (
    <>
      <div className="risk-copy">
        <span className="micro">{risk.name} 예방</span>
        <Title>{risk.title}</Title>
        <p>{risk.summary}</p>
        <ul>
          {risk.actions.map((action) => (
            <li key={action}>{action}</li>
          ))}
        </ul>
        <div className="risk-source">
          원문 PDF {risk.sourcePages.join("·")}쪽 · 이미지를 누르면 세부기준과 사례를 확대합니다.
        </div>
      </div>
      <div className="risk-images">
        {risk.sourcePages.map((page) => (
          <SourcePageButton key={page} page={page} className="" ariaLabel={`${risk.name} 원문 ${page}쪽 확대`}>
            <Image
              src={guidePagePath(page)}
              alt={`${risk.name} 평가 기준 및 사진 원문 ${page}쪽`}
              width={GUIDE_PAGE_SIZE.width}
              height={GUIDE_PAGE_SIZE.height}
              sizes="(max-width: 720px) 90px, 190px"
            />
          </SourcePageButton>
        ))}
      </div>
    </>
  );
}
