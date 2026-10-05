import Link from "next/link";
import { externalLinks } from "@/data/playsafe/links";
import { guidePdf } from "@/lib/playsafe/assets";
import { playsafeRoutes } from "@/lib/playsafe/routes";
import { SourcePageButton } from "../source-viewer/SourcePageButton";
import "./resources.css";

export function ResourcesSection() {
  return (
    <section className="section" id="resources">
      <div className="wrap">
        <div className="cta">
          <div>
            <h2>
              오늘의 안전성평가가,
              <br />
              내일의 안전한 놀이로.
            </h2>
            <p>위험을 발견했다면 조치하고, 조치했다면 다시 확인하세요.</p>
          </div>
          <Link className="btn" href={playsafeRoutes.facilityInfo}>
            18개 항목 안전성평가 시작 ↗
          </Link>
        </div>
        <div className="resources">
          <SourcePageButton page={1} className="resource">
            <strong>가이드라인 전체 보기 ↗</strong>
            <span>38쪽 전체 원문 · 모든 이미지 포함</span>
          </SourcePageButton>
          <SourcePageButton page={26} className="resource">
            <strong>보고서 서식·작성 예시 ↗</strong>
            <span>PDF 26–31쪽 · 결과 및 사진 증빙</span>
          </SourcePageButton>
          <a className="resource" href={guidePdf.href} download={guidePdf.fileName}>
            <strong>원본 PDF 내려받기 ↓</strong>
            <span>첨부된 가이드라인 원본</span>
          </a>
        </div>
        <p className="resources-note">
          외부 안내:{" "}
          <a href={externalLinks.safetySystem} target="_blank" rel="noopener noreferrer">
            어린이놀이시설 안전관리시스템 ↗
          </a>{" "}
          · 시설 분류와 관련 절차는 관할 시·군·구 확인
        </p>
      </div>
    </section>
  );
}
