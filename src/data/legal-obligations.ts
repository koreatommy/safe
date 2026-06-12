export interface LegalObligationItem {
  subtitle: string;
  content: string[];
  badges?: string[];
}

export interface LegalObligation {
  id: string;
  title: string;
  badges?: string[];
  items: LegalObligationItem[];
}

export const LEGAL_OBLIGATION_INTRO =
  "「어린이놀이시설 안전관리법」에 따라 어린이놀이시설 관리주체는 설치검사 확인, 정기시설검사, 안전관리자 지정, 안전교육 이수, 자체 안전점검, 보험 가입, 중대사고 보고 등 법정 의무를 이행해야 합니다.";

export const LEGAL_PENALTY_NOTICE =
  "법적 의무사항을 이행하지 않을 경우 최대 500만원 이하의 과태료 또는 관계 법령에 따른 벌칙이 적용될 수 있으므로, 관리주체는 정기검사, 안전교육, 월간점검, 보험가입, 사고보고 의무를 반드시 확인해야 합니다.";

export const LEGAL_CHECKLIST_ITEMS = [
  "설치검사 합격 여부를 확인했는가?",
  "정기시설검사 유효기간을 확인했는가?",
  "안전관리자를 지정하고 15일 이내 통보했는가?",
  "안전관리자 교육 유효기간을 확인했는가?",
  "월 1회 자체 안전점검을 실시하고 있는가?",
  "안전점검대장을 3년간 보관하고 있는가?",
  "사고배상책임보험이 유효한가?",
  "중대사고 보고 절차를 알고 있는가?",
];

export const legalObligations: LegalObligation[] = [
  {
    id: "inspection",
    title: "설치 및 안전검사 관련 의무",
    badges: ["2년에 1회"],
    items: [
      {
        subtitle: "설치검사 확인 및 인도",
        content: [
          "설치자는 어린이놀이시설을 관리주체에게 인도하기 전에 설치검사를 받아야 합니다.",
          "관리주체는 시설을 인수할 때 설치검사 합격 여부를 반드시 확인해야 합니다.",
        ],
      },
      {
        subtitle: "정기시설검사",
        badges: ["2년에 1회"],
        content: [
          "관리주체는 설치검사를 받은 어린이놀이시설이 안전기준에 적합하게 유지되고 있는지 확인하기 위해 2년에 1회 이상 정기시설검사를 받아야 합니다.",
        ],
      },
      {
        subtitle: "불합격 시설의 조치",
        content: [
          "설치검사 또는 정기시설검사에서 불합격한 경우 관리주체는 다음 조치를 이행해야 합니다.",
          "지체 없이 해당 시설 이용금지 조치",
          "관리감독기관의 장에게 통보",
          "통보받은 날부터 2개월 이내 시설개선계획서 제출",
          "수리, 보수 등 필요한 개선 조치 이행",
        ],
        badges: ["2개월 이내"],
      },
    ],
  },
  {
    id: "manager-education",
    title: "안전관리자 지정 및 교육 의무",
    badges: ["15일 이내", "2년 1회", "4시간 이상"],
    items: [
      {
        subtitle: "안전관리자 지정 및 통보",
        badges: ["15일 이내"],
        content: [
          "관리주체는 어린이놀이시설의 안전관리를 담당할 안전관리자를 지정해야 합니다.",
          "지정된 날부터 15일 이내에 어린이놀이시설 안전관리시스템을 통해 관리감독기관에 통보해야 합니다.",
        ],
      },
      {
        subtitle: "안전교육 이수",
        badges: ["2년 1회", "4시간 이상"],
        content: [
          "안전관리자는 2년에 1회, 4시간 이상 안전교육을 이수해야 합니다.",
          "시설을 인도받은 날부터 3개월 이내",
          "안전관리자가 변경된 날부터 3개월 이내",
          "교육 유효기간이 만료되는 경우 만료일 전 3개월 이내",
        ],
      },
    ],
  },
  {
    id: "self-inspection",
    title: "자체 안전점검 및 유지관리 의무",
    badges: ["월 1회 이상", "3년 보관"],
    items: [
      {
        subtitle: "월간 안전점검",
        badges: ["월 1회 이상"],
        content: [
          "관리주체는 어린이놀이시설의 기능 및 안전성 유지를 위해 월 1회 이상 자체 안전점검을 실시해야 합니다.",
        ],
      },
      {
        subtitle: "기록 및 보관",
        badges: ["3년 보관"],
        content: [
          "안전점검 또는 안전진단 결과에 대하여 안전점검실시대장 등을 작성하고, 최종 기재일부터 3년간 보관해야 합니다.",
        ],
      },
      {
        subtitle: "안전진단 신청",
        badges: ["1개월 이내"],
        content: [
          "안전점검 결과 어린이에게 위해를 가할 우려가 있다고 판단되는 경우 관리주체는 다음 조치를 이행해야 합니다.",
          "해당 시설 이용금지 조치",
          "1개월 이내 안전검사기관에 안전진단 신청",
        ],
      },
    ],
  },
  {
    id: "insurance-report",
    title: "보험 가입 및 사고 보고 의무",
    badges: ["30일 이내"],
    items: [
      {
        subtitle: "사고배상책임보험 가입",
        badges: ["30일 이내"],
        content: [
          "관리주체는 어린이놀이시설 사고로 인한 손해배상을 보장하기 위해 시설을 인도받은 날부터 30일 이내에 사고배상책임보험에 가입해야 합니다.",
          "보험은 유효기간이 끊기지 않도록 지속적으로 갱신해야 합니다.",
        ],
      },
      {
        subtitle: "중대사고 발생 시 조치 및 보고",
        content: [
          "중대한 사고가 발생한 경우 관리주체는 즉시 사용중지 등 필요한 조치를 취하고, 해당 관리감독기관의 장에게 통보해야 합니다.",
          "중대사고 예시: 사망, 골절, 48시간 이상 입원, 그 밖에 중대한 인명 피해가 발생한 사고",
        ],
      },
    ],
  },
  {
    id: "special-facilities",
    title: "기타 특수 시설 및 행위 제한 관리",
    items: [
      {
        subtitle: "물놀이형 시설 관리",
        content: [
          "물을 활용하는 어린이놀이시설은 운영 기간 동안 자격 요건을 갖춘 안전요원을 배치해야 합니다.",
          "이용 시 주의사항, 안전수칙, 비상연락처 등을 담은 안내 표지를 설치해야 합니다.",
        ],
      },
      {
        subtitle: "행위 제한 관리",
        content: [
          "관리주체는 어린이놀이시설 내에서 안전에 방해가 되는 행위가 발생하지 않도록 관리해야 합니다.",
          "관리 대상 행위: 시설 훼손, 야영, 취사, 상행위, 자동차 출입, 그 밖에 어린이 안전을 저해하는 행위",
        ],
      },
    ],
  },
];

export const INFO_NAV_ITEMS = [
  { id: "hero", label: "홈" },
  { id: "legal", label: "법적의무사항 알림" },
  { id: "safety-manual", label: "관리주체 안전매뉴얼" },
  { id: "cpf-manual", label: "CPF 사용자 매뉴얼" },
] as const;

export const INFO_EXTERNAL_NAV_ITEMS = [
  {
    label: "지도점검 보고서",
    href: "/report/yangju",
  },
] as const;

export const HERO_BADGES = [
  "법정의무교육",
  "2년 1회",
  "4시간 이상",
  "월 1회 자체점검",
  "CPF 사용 안내",
] as const;

export const MANUAL_CONFIG = {
  safety: {
    title: "관리주체 안전관리 매뉴얼",
    description:
      "어린이놀이시설 관리주체가 시설 안전관리, 자체점검, 사고예방, 유지관리 절차를 확인할 수 있는 매뉴얼입니다.",
    fileUrl: "/manuals/yangju-safety-management-manual.pdf",
    downloadLabel: "안전관리 매뉴얼 다운로드",
    viewLabel: "PDF 바로보기",
  },
  cpf: {
    title: "CPF 사용자 매뉴얼",
    description:
      "어린이놀이시설 안전관리시스템 CPF에서 안전관리자 지정, 안전교육 확인, 월간 안전점검 등록, 보험정보 확인 등 주요 업무를 처리하는 방법을 안내하는 사용자 매뉴얼입니다.",
    fileUrl: "/manuals/cpf-user-manual.pdf",
    downloadLabel: "CPF 사용자 매뉴얼 다운로드",
    viewLabel: "CPF 매뉴얼 바로보기",
    externalUrl: "https://cpf.go.kr",
    externalLabel: "CPF 사이트 바로가기",
  },
} as const;
