export type GimpoRiskReport = {
  id: number;
  href: string;
  facility: string;
  subtitle: string;
  keywords: string;
};

export const GIMPO_RISK_REPORTS: GimpoRiskReport[] = [
  {
    id: 1,
    href: "/report/gimpo/risk/report1",
    facility: "하이채채 키즈풀",
    subtitle: "신종·유사 어린이놀이시설 위험성평가",
    keywords: "하이채채 키즈풀 신종 유사",
  },
  {
    id: 2,
    href: "/report/gimpo/risk/report2",
    facility: "안녕 오아시스 키즈풀",
    subtitle: "위험성평가 보고서",
    keywords: "안녕 오아시스 키즈풀",
  },
  {
    id: 3,
    href: "/report/gimpo/risk/report3",
    facility: "리버풀 (River Pool)",
    subtitle: "위험성평가 보고서",
    keywords: "리버풀 river pool",
  },
  {
    id: 4,
    href: "/report/gimpo/risk/report4",
    facility: "김포 플레이맘 워터룸",
    subtitle: "위험성평가 보고서",
    keywords: "플레이맘 워터룸",
  },
  {
    id: 5,
    href: "/report/gimpo/risk/report5",
    facility: "데이메르 풀파티 김포본점",
    subtitle: "위험성평가 보고서",
    keywords: "데이메르 풀파티 김포본점",
  },
  {
    id: 6,
    href: "/report/gimpo/risk/report6",
    facility: "앳더모먼트키즈풀",
    subtitle: "위험성평가 보고서",
    keywords: "앳더모먼트 키즈풀",
  },
  {
    id: 7,
    href: "/report/gimpo/risk/report7",
    facility: "플롭 키즈풀 플레이룸",
    subtitle: "위험성평가 보고서",
    keywords: "플롭 키즈풀 플레이룸",
  },
];
