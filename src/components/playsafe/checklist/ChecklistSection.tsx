import { SectionHead } from "../shared/SectionHead";
import { SourcePageButton } from "../source-viewer/SourcePageButton";
import { ChecklistLoader } from "./ChecklistLoader";
import { ChecklistStorageNotice } from "./ChecklistStorageNotice";
import "./checklist.css";

export function ChecklistSection() {
  return (
    <section className="section white" id="assessment-record">
      <div className="wrap">
        <SectionHead
          eyebrow="SAFETY ASSESSMENT"
          title="안전성평가"
          description={
            <>
              18개 항목의 확인 상태와 조치 메모를 남기세요. 진행률은 안전등급이 아닌 기록 완료 비율입니다.
              <br />
              시설정보입력에서 저장한 시설·기구 정보를 불러오며, 모든 항목을 확인한 뒤 ‘안전성평가 완료 후 등록’을 누르면
              평가 결과가 등록됩니다.
            </>
          }
          tag="원문 PDF 26–27쪽 기반"
        />
        <ChecklistStorageNotice />
        <div className="print-head">
          <h2>안전성평가 기록</h2>
          <p>첨부 가이드라인 기반 보조 기록 · 공식 결과보고서 대체 서식 아님</p>
        </div>
        <ChecklistLoader />
        <p className="check-footnote">
          ‘위험요소 있음’으로 표시한 항목은 조치 메모에 개선 내용과 조치일을 남기세요. 공식 서식·작성 예시는{" "}
          <SourcePageButton page={26} className="check-source-link">
            원문 PDF 26–31쪽 ↗
          </SourcePageButton>
          에서 확인할 수 있습니다.
        </p>
      </div>
    </section>
  );
}
