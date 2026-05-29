import type { DigitalCardDefinition } from "../types";

export const yeongilCard: DigitalCardDefinition = {
  slug: "yeongil",
  name: "이영일",
  familyName: "이",
  givenName: "영일",
  org: "(사)창의융합연구원",
  title: "본부장",
  subtitles: [
    "행정안전부 안전관리지원기관",
    "전 KOLAS 공인검사기관 기술책임자",
  ],
  phone: "010-9393-9264",
  email: "lyi@kakao.com",
  links: [
    {
      label: "SafePlay",
      href: "https://www.safeplay.co.kr",
      display: "www.safeplay.co.kr",
      icon: "globe",
    },
    {
      label: "Inspect",
      href: "https://inspect.safeplay.co.kr",
      display: "inspect.safeplay.co.kr",
      icon: "shield",
    },
    {
      label: "KICON",
      href: "https://www.kicon.kr",
      display: "kicon.kr",
      icon: "globe",
    },
  ],
  vcardNote:
    "행정안전부 안전관리지원기관 · 전 KOLAS 공인검사기관 기술책임자",
  vcardDownloadName: "이영일_창의융합연구원.vcf",
  footerLogo: "KICON",
  metaDescription:
    "(사)창의융합연구원 본부장 이영일 디지털 명함 · 행정안전부 안전관리지원기관",
};
