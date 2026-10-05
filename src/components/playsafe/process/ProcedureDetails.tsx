import { externalLinks } from "@/data/playsafe/links";
import { procedureRows } from "@/data/playsafe/process";

export function ProcedureDetails() {
  return (
    <details className="process-extra">
      <summary>설치·운영 단계의 절차와 시행 시점 보기</summary>
      <div className="table-scroll">
        <table>
          <thead>
            <tr>
              <th>단계</th>
              <th>주요 내용</th>
              <th>원문 표시·유의사항</th>
            </tr>
          </thead>
          <tbody>
            {procedureRows.map((row) => (
              <tr key={row.content}>
                <td>{row.stage}</td>
                <td>{row.content}</td>
                <td>
                  {row.badge && <span className="tag amber">{row.badge}</span>} {row.note}
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
      <p className="process-extra-note">
        2025년 첨부 가이드라인(PDF 4·7–8·14쪽)과 2026년 개정법을 함께 정리했습니다. 안전성평가 신설 규정은 2027년 2월 28일부터
        적용됩니다.{" "}
        <a href={externalLinks.revisedLaw} target="_blank" rel="noopener noreferrer">
          개정 법령 확인 ↗
        </a>
      </p>
    </details>
  );
}
