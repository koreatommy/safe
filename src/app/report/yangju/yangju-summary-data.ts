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

export type RiskAssessmentBreakdown = {
  totalItems: number;
  riskIdentified: number;
  notApplicable: number;
  good: number;
};

export type YangjuRiskFacilitySummary = {
  id: string;
  facility: string;
  shortLabel: string;
  href: string;
  stats: RiskAssessmentBreakdown;
};

export type YangjuReportSummary = {
  id: string;
  shortLabel: string;
  title: string;
  href: string;
  judgment?: JudgmentBreakdown;
  waterPlay?: WaterPlayBreakdown;
  riskAssessment?: RiskAssessmentBreakdown;
  riskFacilities?: number;
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
  {
    id: "risk",
    shortLabel: "위험성평가",
    title: "신종유사놀이시설 위험성 평가 보고서",
    href: "/report/yangju/risk",
    riskFacilities: 4,
    riskAssessment: {
      totalItems: 72,
      riskIdentified: 18,
      notApplicable: 41,
      good: 13,
    },
  },
];

/** 각 위험성평가 HTML 보고서 stat-row 수치와 동기화 */
export const YANGJU_RISK_FACILITY_SUMMARIES: YangjuRiskFacilitySummary[] = [
  {
    id: "report1",
    facility: "라온 워터파티룸",
    shortLabel: "라온",
    href: "/report/yangju/risk/report1",
    stats: { totalItems: 18, riskIdentified: 3, notApplicable: 12, good: 3 },
  },
  {
    id: "report2",
    facility: "베이정원",
    shortLabel: "베이정원",
    href: "/report/yangju/risk/report2",
    stats: { totalItems: 18, riskIdentified: 6, notApplicable: 9, good: 3 },
  },
  {
    id: "report3",
    facility: "폴앤풀",
    shortLabel: "폴앤풀",
    href: "/report/yangju/risk/report3",
    stats: { totalItems: 18, riskIdentified: 5, notApplicable: 9, good: 4 },
  },
  {
    id: "report4",
    facility: "하이러버덕",
    shortLabel: "하이러버덕",
    href: "/report/yangju/risk/report4",
    stats: { totalItems: 18, riskIdentified: 4, notApplicable: 11, good: 3 },
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
