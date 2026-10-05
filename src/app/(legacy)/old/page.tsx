import type { Metadata } from "next";
import { HomePageClient } from "../old_HomePageClient";

export const metadata: Metadata = {
  robots: { index: false, follow: false },
};

export default function OldHomePage() {
  return <HomePageClient />;
}
