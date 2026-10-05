import { checkItems } from "@/data/playsafe/checks";
import type { ChecklistSnapshot } from "./checklistStorage";

const EXPORT_FILE_NAME = "안전성평가-기록.txt";

function buildReportText(snapshot: ChecklistSnapshot): string {
  const lines = [
    "어린이놀이시설 안전성평가 기록",
    "첨부 가이드라인 기반 보조 기록 (공식 결과보고서 대체 서식 아님)",
    `시설명: ${snapshot.facilityName}`,
    `평가자: ${snapshot.assessor}`,
    `평가일: ${snapshot.evalDate}`,
    "",
    ...checkItems.flatMap((item, i) => [
      `${i + 1}. [${item.category}] ${item.label}`,
      `상태: ${snapshot.records[i].status}`,
      `조치 메모: ${snapshot.records[i].memo}`,
      ...(snapshot.records[i].photos.length ? [`첨부 사진: ${snapshot.records[i].photos.length}장`] : []),
      "",
    ]),
  ];
  return "\uFEFF" + lines.join("\n");
}

export function downloadChecklistReport(snapshot: ChecklistSnapshot): void {
  const blob = new Blob([buildReportText(snapshot)], { type: "text/plain;charset=utf-8" });
  const url = URL.createObjectURL(blob);
  const anchor = document.createElement("a");
  anchor.href = url;
  anchor.download = EXPORT_FILE_NAME;
  document.body.append(anchor);
  anchor.click();
  anchor.remove();
  setTimeout(() => URL.revokeObjectURL(url), 10_000);
}
