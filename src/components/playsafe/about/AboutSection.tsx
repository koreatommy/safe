import Image from "next/image";
import { facilities, targetScopes } from "@/data/playsafe/facilities";
import { imagePath } from "@/lib/playsafe/assets";
import { SectionHead } from "../shared/SectionHead";
import { EligibilityQuiz } from "./EligibilityQuiz";
import { EligibilityInquiryForm } from "./inquiry/EligibilityInquiryForm";
import "./about.css";

export function AboutSection() {
  return (
    <section className="section white" id="about">
      <div className="wrap">
        <SectionHead
          eyebrow="01 · WHO IS IT FOR"
          title="우리 공간도 평가 대상일까요?"
          description="어린이의 놀이에 활용되지만 기존 법령에 따른 안전관리가 이루어지지 않는 신종·유사 놀이공간을 살펴봅니다."
          descriptionClassName="sub"
          tag="원문 PDF 2–9쪽"
        />

        <div className="grid3">
          {facilities.map((facility) => (
            <article className="facility reveal" key={facility.title}>
              <Image src={imagePath(facility.image)} alt={facility.alt} width={430} height={264} sizes="(max-width: 720px) 125px, 380px" />
              <div>
                <span className="micro">{facility.micro}</span>
                <h3>{facility.title}</h3>
                <p>{facility.description}</p>
              </div>
            </article>
          ))}
        </div>

        <div className="target-scope reveal" aria-labelledby="target-scope-title">
          <div className="target-scope-heading">
            <span className="micro">평가 대상 시설 · 이미지 내용 정리</span>
            <h3 id="target-scope-title">시설명뿐 아니라, 실제로 놀이에 쓰이는 설치물까지</h3>
            <p>무인 키즈카페·무인 키즈풀과 키즈펜션·풀빌라 등 숙박형 공간의 놀이 요소를 확인합니다.</p>
          </div>
          <div className="target-scope-grid">
            {targetScopes.map((scope, i) => (
              <article key={scope.title}>
                <span className="scope-index">{String(i + 1).padStart(2, "0")}</span>
                <h4>{scope.title}</h4>
                <p>{scope.description}</p>
              </article>
            ))}
          </div>
          <p className="target-scope-note">
            적용 전제: 해당 놀이공간이 어린이놀이시설법·관광진흥법 등 다른 법령에 따라 이미 안전관리되는 시설인지 확인해야 합니다.
            부가적 활용 구조물은 안전성평가 대상이어도 유사 놀이기구의 상세 등록 대상과는 구분됩니다.
          </p>
        </div>

        <div className="split about-split">
          <div className="panel soft">
            <h3>업종 이름보다, 실제 놀이공간을 확인하세요.</h3>
            <p>평가 범위는 시설의 구조와 사용 목적, 기존 법령에 따른 관리 여부에 따라 달라집니다.</p>
            <ul>
              <li>놀이목적으로 설치된 유사놀이기구: 원문상 신고·등록 및 안전성평가 대상</li>
              <li>놀이공간 안에서 부가적으로 놀이에 활용되는 구조물: 상세 등록 대상은 아니어도 평가 범위에 포함</li>
            </ul>
            <details>
              <summary>원문에서 제외하는 시설</summary>
              <p>
                성인 휴식공간, 놀이 목적이 아닌 취식공간·체험시설, 고정된 놀이설치물이 없는 완구방 등, 이미 어린이놀이시설·유기기구
                관련 법령에 따른 안전관리 대상인 시설입니다.
              </p>
            </details>
            <EligibilityInquiryForm />
          </div>
          <div className="panel">
            <EligibilityQuiz />
          </div>
        </div>
      </div>
    </section>
  );
}
