import type { Facility, TargetScope } from "./types";

export const facilities: Facility[] = [
  {
    image: "facility-kids-cafe",
    alt: "무인키즈카페 예시",
    micro: "KIDS CAFE",
    title: "무인키즈카페",
    description: "고정된 놀이구조물과 다양한 놀이활동 공간",
  },
  {
    image: "facility-kids-pool",
    alt: "무인키즈풀 예시",
    micro: "KIDS POOL",
    title: "무인키즈풀",
    description: "어린이 물놀이를 위한 욕조·풀과 주변 공간",
  },
  {
    image: "facility-kids-stay",
    alt: "키즈펜션·키즈풀빌라 예시",
    micro: "KIDS STAY",
    title: "키즈펜션·풀빌라",
    description: "키즈펜션·키즈풀빌라·민박 등 숙박형 키즈테마 공간",
  },
];

export const targetScopes: TargetScope[] = [
  {
    title: "인증대상 기구가 아닌 놀이용 구조물",
    description: "공산품 안전인증 대상 어린이놀이기구는 아니지만, 어린이의 놀이 목적으로 설치·사용되는 설비와 구조물",
  },
  {
    title: "놀이공간의 부가적 활용 구조물",
    description: "처음부터 놀이 목적으로 설치하지 않았더라도, 어린이가 놀이에 활용하는 공간 내 구조물",
  },
  {
    title: "물놀이·현장 시공 설치물",
    description: "어린이용 목욕조·물놀이 욕조와 공간에 맞춰 수작업으로 고정·설치한 비표준 구조물",
  },
];
