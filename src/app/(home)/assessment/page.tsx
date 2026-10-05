import type { Metadata } from "next";
import { ChecklistSection } from "@/components/playsafe/checklist/ChecklistSection";
import { SiteFooter } from "@/components/playsafe/footer/SiteFooter";
import { SiteNav } from "@/components/playsafe/navigation/SiteNav";
import { SourceViewerProvider } from "@/components/playsafe/source-viewer/SourceViewerProvider";
import { assessmentMetadata } from "@/lib/playsafe/metadata";

export const metadata: Metadata = assessmentMetadata;

export default function AssessmentPage() {
  return (
    <SourceViewerProvider>
      <a href="#main" className="btn skip-link">
        본문으로 건너뛰기
      </a>
      <SiteNav />
      <main id="main">
        <ChecklistSection />
      </main>
      <SiteFooter />
      <noscript>
        <p className="wrap">안전성평가 기록 양식을 이용하려면 브라우저의 JavaScript를 활성화해 주세요.</p>
      </noscript>
    </SourceViewerProvider>
  );
}
