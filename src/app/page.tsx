"use client";

import { HeroSection } from "@/components/sections/HeroSection";
import { WhySection } from "@/components/sections/WhySection";
import { TargetSection } from "@/components/sections/TargetSection";
import { ProcessSection } from "@/components/sections/ProcessSection";
import { ObligationSection } from "@/components/sections/ObligationSection";
import { ResultSection } from "@/components/sections/ResultSection";
import { EducationSection } from "@/components/sections/EducationSection";
import { InfoGraphicSection } from "@/components/sections/InfoGraphicSection";
import { CTASection } from "@/components/sections/CTASection";
import { Footer } from "@/components/footer/Footer";
import { TopNavigation } from "@/components/navigation/TopNavigation";
import { useSectionBackground } from "@/hooks/useSectionBackground";

export default function Home() {
  useSectionBackground();

  return (
    <main className="relative">
      <TopNavigation />
      <HeroSection />
      <WhySection />
      <TargetSection />
      <ProcessSection />
      <ObligationSection />
      <ResultSection />
      <EducationSection />
      <InfoGraphicSection />
      <CTASection />
      <Footer />
    </main>
  );
}
