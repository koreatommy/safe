import type { DigitalCardDefinition } from "../types";

export const yujinCard: DigitalCardDefinition = {
  slug: "yujin",
  name: "이유진",
  familyName: "이",
  givenName: "유진",
  org: "(사)창의융합연구원",
  title: "원장",
  subtitles: [
    "행정안전부 안전관리지원기관",
    "전 KOLAS 공인검사기관 기술책임자",
  ],
  phone: "010-2327-1730",
  email: "hieugenelee@gmail.com",
  links: [
    {
      label: "Website",
      href: "https://www.kicon.kr",
      display: "www.kicon.kr",
      icon: "globe",
    },
  ],
  vcardNote:
    "행정안전부 안전관리지원기관 · 전 KOLAS 공인검사기관 기술책임자",
  vcardDownloadName: "이유진_창의융합연구원.vcf",
  footerLogo: "KICON",
  metaDescription:
    "(사)창의융합연구원 원장 이유진 디지털 명함 · 행정안전부 안전관리지원기관",
};
