import type { Metadata } from "next";
import { Geist, Geist_Mono, Noto_Sans_KR } from "next/font/google";
import "./globals.css";

const geistSans = Geist({
  variable: "--font-geist-sans",
  subsets: ["latin"],
});

const geistMono = Geist_Mono({
  variable: "--font-geist-mono",
  subsets: ["latin"],
});

const notoSansKR = Noto_Sans_KR({
  variable: "--font-noto-sans-kr",
  subsets: ["latin"],
  weight: ["100", "200", "300", "400", "500", "600", "700", "800", "900"],
  display: "swap",
});

export const metadata: Metadata = {
  title: "신종놀이시설 안전성평가 | 안전한 놀이 환경을 위한 새로운 기준",
  description: "보이지 않는 위험까지 관리하는 새로운 안전 기준, 신종놀이시설 안전성평가. 무인키즈풀·무인키즈카페·키즈펜션 등 신종 어린이 놀이공간의 안전을 위한 종합적 위험 관리 체계.",
  keywords: ["신종놀이시설", "안전성평가", "무인키즈카페", "무인키즈풀", "키즈펜션", "어린이 안전", "놀이시설 안전"],
  openGraph: {
    title: "신종놀이시설 안전성평가 | 안전한 놀이 환경을 위한 새로운 기준",
    description: "보이지 않는 위험까지 관리하는 새로운 안전 기준, 신종놀이시설 안전성평가",
    type: "website",
    locale: "ko_KR",
  },
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="ko">
      <body
        className={`${geistSans.variable} ${geistMono.variable} ${notoSansKR.variable} antialiased`}
      >
        {children}
      </body>
    </html>
  );
}
