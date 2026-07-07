export type JudgmentBreakdown = {
  total: number;
  good: number;
  caution: number;
  repair: number;
};

export type WaterPlayBreakdown = {
  facilities: number;
  issues: number;
  corrected: number;
  scheduled: number;
};

export type YangjuReportSummary = {
  id: string;
  shortLabel: string;
  title: string;
  href: string;
  judgment?: JudgmentBreakdown;
  waterPlay?: WaterPlayBreakdown;
};

/** 각 HTML 보고서 종합 현황 섹션 수치와 동기화 */
export const YANGJU_REPORT_SUMMARIES: YangjuReportSummary[] = [
  {
    id: "school-opening",
    shortLabel: "개학기",
    title: "개학기 지도·점검 종합보고서",
    href: "/report/yangju/school-opening",
    judgment: { total: 20, good: 3, caution: 8, repair: 9 },
  },
  {
    id: "water-play202607",
    shortLabel: "물놀이형",
    title: "물놀이형 어린이놀이시설 점검 결과 보고서",
    href: "/report/yangju/water-play202607",
    judgment: { total: 20, good: 7, caution: 0, repair: 13 },
    waterPlay: { facilities: 20, issues: 16, corrected: 0, scheduled: 16 },
  },
  {
    id: "report2",
    shortLabel: "상반기",
    title: "어린이 놀이시설 지도·점검 종합보고서 (상세)",
    href: "/report/yangju/report2",
    judgment: { total: 93, good: 51, caution: 27, repair: 15 },
  },
];

export const YANGJU_TOTAL_FACILITIES = YANGJU_REPORT_SUMMARIES.reduce((sum, report) => {
  return sum + (report.judgment?.total ?? report.waterPlay?.facilities ?? 0);
}, 0);

export const YANGJU_COMBINED_JUDGMENT = YANGJU_REPORT_SUMMARIES.reduce(
  (acc, report) => {
    if (!report.judgment) return acc;
    acc.good += report.judgment.good;
    acc.caution += report.judgment.caution;
    acc.repair += report.judgment.repair;
    acc.total += report.judgment.total;
    return acc;
  },
  { total: 0, good: 0, caution: 0, repair: 0 },
);
