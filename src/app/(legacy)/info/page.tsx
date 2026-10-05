import type { Metadata } from "next";
import { InfoPageClient } from "./InfoPageClient";

export const metadata: Metadata = {
  title: "양주시 어린이놀이시설 안전관리자 교육",
  description:
    "양주시 어린이놀이시설 관리주체와 안전관리자를 위한 법적의무사항, 안전관리 매뉴얼, CPF 사용자 매뉴얼 안내 페이지입니다.",
  keywords: [
    "양주시 어린이놀이시설",
    "어린이놀이시설 안전관리자 교육",
    "관리주체 안전관리",
    "CPF 사용자 매뉴얼",
    "어린이놀이시설 안전관리법",
  ],
  openGraph: {
    title: "양주시 어린이놀이시설 안전관리자 교육",
    description:
      "양주시 어린이놀이시설 관리주체와 안전관리자를 위한 법적의무사항, 안전관리 매뉴얼, CPF 사용자 매뉴얼 안내 페이지입니다.",
    type: "website",
    locale: "ko_KR",
  },
};

export default function InfoPage() {
  return <InfoPageClient />;
}
