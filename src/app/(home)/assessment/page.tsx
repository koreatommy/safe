import type { Metadata } from "next";
import { ChecklistSection } from "@/components/playsafe/checklist/ChecklistSection";
import { SiteFooter } from "@/components/playsafe/footer/SiteFooter";
import { SiteNav } from "@/components/playsafe/navigation/SiteNav";
import { SourceViewerProvider } from "@/components/playsafe/source-viewer/SourceViewerProvider";
import { requireAssessmentPageAccess } from "@/lib/playsafe/assessmentAccess";
import { assessmentMetadata } from "@/lib/playsafe/metadata";
import { playsafeRoutes } from "@/lib/playsafe/routes";

export const metadata: Metadata = assessmentMetadata;
export const dynamic = "force-dynamic";

export default async function AssessmentPage() {
  await requireAssessmentPageAccess(playsafeRoutes.assessment);

  return (
    <SourceViewerProvider>
      <a href="#main" className="btn skip-link">
        본문으로 건너뛰기
      </a>
      <SiteNav assessmentLoggedIn />
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
