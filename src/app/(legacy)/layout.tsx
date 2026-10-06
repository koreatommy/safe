import type { Metadata } from "next";
import { InsightChatWidget } from "@/components/embeds/InsightChatWidget";
import { fontVariables } from "@/lib/fonts";
import { siteMetadata } from "@/lib/siteMetadata";
import "./globals.css";

export const metadata: Metadata = siteMetadata;

type LayoutProps = Readonly<{
  children: React.ReactNode;
}>;

export default function LegacyRootLayout({ children }: LayoutProps) {
  return (
    <html lang="ko">
      <body className={`${fontVariables} antialiased`}>
        {children}
        <InsightChatWidget />
      </body>
    </html>
  );
}
