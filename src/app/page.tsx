"use client";

import { useState } from "react";
import { HeroSection } from "@/components/sections/HeroSection";
import { WhySection } from "@/components/sections/WhySection";
import { TargetSection } from "@/components/sections/TargetSection";
import { ProcessSection } from "@/components/sections/ProcessSection";
import { ObligationSection } from "@/components/sections/ObligationSection";
import { ResultSection } from "@/components/sections/ResultSection";
import { EducationSection } from "@/components/sections/EducationSection";
import { InfoGraphicSection } from "@/components/sections/InfoGraphicSection";
import { CTASection } from "@/components/sections/CTASection";
import { ContactSection } from "@/components/sections/ContactSection";
import { Footer } from "@/components/footer/Footer";
import { TopNavigation } from "@/components/navigation/TopNavigation";
import { CertificateLookupModal } from "@/components/modals/CertificateLookupModal";
import { useSectionBackground } from "@/hooks/useSectionBackground";

export default function Home() {
  useSectionBackground();
  const [isCertificateModalOpen, setIsCertificateModalOpen] = useState(false);

  return (
    <main className="relative">
      <TopNavigation onCertificateClick={() => setIsCertificateModalOpen(true)} />
      <HeroSection />
      <WhySection />
      <TargetSection />
      <ProcessSection />
      <ObligationSection />
      <ResultSection />
      <EducationSection />
      <InfoGraphicSection />
      <CTASection />
      <ContactSection />
      <Footer />
      <CertificateLookupModal
        isOpen={isCertificateModalOpen}
        onClose={() => setIsCertificateModalOpen(false)}
      />
    </main>
  );
}
