export type YangjuReport = {
  id: string;
  href: string;
  title: string;
  subtitle: string;
  fileName: string;
  isNew?: boolean;
};

export const YANGJU_REPORTS: YangjuReport[] = [
  {
    id: "school-opening",
    href: "/report/yangju/school-opening",
    title: "개학기 지도·점검 종합보고서",
    subtitle: "2026년 개학기 어린이놀이시설 지도점검",
    fileName: "yangju_report.html",
  },
  {
    id: "water-play202606",
    href: "/report/yangju/water-play202606",
    title: "물놀이형 어린이놀이시설 점검 결과 보고서",
    subtitle: "2026년 여름철 물가동 전 전수점검",
    fileName: "yangju_water_play202606.html",
  },
  {
    id: "report2",
    href: "/report/yangju/report2",
    title: "개학기 지도·점검 종합보고서 (상세)",
    subtitle: "시설별 상세 점검 결과 포함",
    fileName: "yanju_report2.html",
    isNew: true,
  },
];

export function getYangjuReportFileName(id: string): string | undefined {
  return YANGJU_REPORTS.find((report) => report.id === id)?.fileName;
}
