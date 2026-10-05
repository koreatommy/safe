import type { Metadata, Viewport } from "next";
import { BottomTabBar } from "@/components/playsafe/navigation/BottomTabBar";
import { fontVariables } from "@/lib/fonts";
import { landingMetadata } from "@/lib/playsafe/metadata";
import "./base.css";
import "./typography.css";

export const metadata: Metadata = landingMetadata;

export const viewport: Viewport = { viewportFit: "cover" };

type LayoutProps = Readonly<{
  children: React.ReactNode;
}>;

export default function HomeRootLayout({ children }: LayoutProps) {
  return (
    <html lang="ko">
      <body id="top" className={fontVariables}>
        {children}
        <BottomTabBar />
      </body>
    </html>
  );
}
