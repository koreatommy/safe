import type { Metadata } from "next";
import { fontVariables } from "@/lib/fonts";
import { landingMetadata } from "@/lib/playsafe/metadata";
import "./base.css";

export const metadata: Metadata = landingMetadata;

type LayoutProps = Readonly<{
  children: React.ReactNode;
}>;

export default function HomeRootLayout({ children }: LayoutProps) {
  return (
    <html lang="ko">
      <body id="top" className={fontVariables}>
        {children}
      </body>
    </html>
  );
}
