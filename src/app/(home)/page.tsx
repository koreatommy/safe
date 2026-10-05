import { AboutSection } from "@/components/playsafe/about/AboutSection";
import { AssessmentIntroSection } from "@/components/playsafe/assessment/AssessmentIntroSection";
import { ContextSection } from "@/components/playsafe/context/ContextSection";
import { FaqSection } from "@/components/playsafe/faq/FaqSection";
import { SiteFooter } from "@/components/playsafe/footer/SiteFooter";
import { HeroSection } from "@/components/playsafe/hero/HeroSection";
import { SiteNav } from "@/components/playsafe/navigation/SiteNav";
import { ParentsSection } from "@/components/playsafe/parents/ParentsSection";
import { PlayTypesSection } from "@/components/playsafe/play-types/PlayTypesSection";
import { ProcessSection } from "@/components/playsafe/process/ProcessSection";
import { ResourcesSection } from "@/components/playsafe/resources/ResourcesSection";
import { RisksSection } from "@/components/playsafe/risks/RisksSection";
import { RevealObserver } from "@/components/playsafe/shared/RevealObserver";
import { SourceViewerProvider } from "@/components/playsafe/source-viewer/SourceViewerProvider";

export default function HomePage() {
  return (
    <SourceViewerProvider>
      <a href="#main" className="btn skip-link">
        본문으로 건너뛰기
      </a>
      <SiteNav />
      <main id="main">
        <HeroSection />
        <ContextSection />
        <AboutSection />
        <PlayTypesSection />
        <ProcessSection />
        <RisksSection />
        <AssessmentIntroSection />
        <ParentsSection />
        <FaqSection />
        <ResourcesSection />
      </main>
      <SiteFooter />
      <RevealObserver />
      <noscript>
        <p className="wrap">위험유형 탭·원문 뷰어를 이용하려면 브라우저의 JavaScript를 활성화해 주세요.</p>
      </noscript>
    </SourceViewerProvider>
  );
}
