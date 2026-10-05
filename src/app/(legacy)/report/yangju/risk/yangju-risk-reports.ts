export type YangjuRiskReport = {
  id: number;
  href: string;
  facility: string;
  subtitle: string;
  fileName: string;
};

export const YANGJU_RISK_REPORTS: YangjuRiskReport[] = [
  {
    id: 1,
    href: "/report/yangju/risk/report1",
    facility: "라온 워터파티룸",
    subtitle: "신종·유사 어린이놀이시설 위험성 평가",
    fileName: "위험성평가_보고서_라온워터파티룸.html",
  },
  {
    id: 2,
    href: "/report/yangju/risk/report2",
    facility: "베이정원",
    subtitle: "신종·유사 어린이놀이시설 위험성 평가",
    fileName: "위험성평가_보고서_베이정원.html",
  },
  {
    id: 3,
    href: "/report/yangju/risk/report3",
    facility: "폴앤풀",
    subtitle: "신종·유사 어린이놀이시설 위험성 평가",
    fileName: "위험성평가_보고서_폴앤풀.html",
  },
  {
    id: 4,
    href: "/report/yangju/risk/report4",
    facility: "하이러버덕",
    subtitle: "신종·유사 어린이놀이시설 위험성 평가",
    fileName: "위험성평가_보고서_하이러버덕.html",
  },
];

export function getYangjuRiskReportFileName(id: number): string | undefined {
  return YANGJU_RISK_REPORTS.find((report) => report.id === id)?.fileName;
}
