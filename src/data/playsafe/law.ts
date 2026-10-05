import type { LawItem } from "./types";

export const lawItems: LawItem[] = [
  {
    label: "01 · 개정 배경",
    title: "안전관리 대상 확대",
    description: "기구가 없는 무인 키즈카페·키즈풀 등 놀이공간의 안전 사각지대를 줄입니다.",
  },
  {
    label: "02 · 평가 의무",
    title: "월 1회 이상 평가·결과 보관",
    description: "설치자는 인도 전, 관리주체는 운영 중 정기적으로 익수·추락·충돌 등 위험을 찾아 개선합니다.",
  },
  {
    label: "03 · 위반 시",
    title: "300만 원 이하 과태료",
    description: "안전성평가를 실시하지 않거나 평가 결과를 기록·보관하지 않는 경우 등 법 위반에 적용될 수 있습니다.",
  },
];

export const existingLimits: string[] = [
  "비표준·비정형 구조물의 놀이 활동",
  "놀이에 쓰이는 공간 전체의 다양한 위험요소",
  "무인 운영과 관리 인력 부재에 따른 관찰의 어려움",
  "관리주체의 안전관리 역량에 따른 위험관리 수준의 차이",
];

export const evaluationScope: string[] = [
  "시설과 구조물의 안전성",
  "충돌·추락·익수 등 사고 위험",
  "이동 동선과 조명·전기 등 주변 환경",
  "운영자의 안전관리 체계",
  "관리자의 대응 역량과 비상조치 계획",
];
