import type { Metadata } from "next";

const title = "놀이는 자유롭게, 안전은 세심하게 | 안전관리 가이드";
const description = "신종·유사 어린이놀이시설 안전관리 가이드라인: 평가대상, 8개 위험유형, 18개 안전성평가 항목과 보호자 안전수칙.";

export const landingMetadata: Metadata = {
  title,
  description,
  keywords: ["신종놀이시설", "안전성평가", "무인키즈카페", "무인키즈풀", "키즈펜션", "어린이놀이시설 안전관리법"],
  openGraph: {
    title,
    description,
    type: "website",
    locale: "ko_KR",
  },
};

export const assessmentMetadata: Metadata = {
  title: "안전성평가 | 안전관리 가이드",
  description: "신종·유사 어린이놀이시설 안전성평가 18개 항목.",
};

export const facilityInfoMetadata: Metadata = {
  title: "시설정보입력 | 안전관리 가이드",
  description: "안전성평가 대상 신종·유사 어린이놀이시설의 기본 정보 입력.",
};
