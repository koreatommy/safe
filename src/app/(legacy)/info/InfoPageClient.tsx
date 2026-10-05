"use client";

import { InfoNavigation } from "@/components/info/InfoNavigation";
import { InfoHeroSection } from "@/components/info/InfoHeroSection";
import { LegalObligationSection } from "@/components/info/LegalObligationSection";
import { ManualPdfViewer } from "@/components/info/ManualPdfViewer";
import { InfoFooter } from "@/components/info/InfoFooter";
import { MANUAL_CONFIG } from "@/data/legal-obligations";

export function InfoPageClient() {
  return (
    <main className="relative info-landing">
      <InfoNavigation />
      <InfoHeroSection />
      <LegalObligationSection />
      <ManualPdfViewer
        sectionId="safety-manual"
        title={MANUAL_CONFIG.safety.title}
        description={MANUAL_CONFIG.safety.description}
        fileUrl={MANUAL_CONFIG.safety.fileUrl}
        downloadLabel={MANUAL_CONFIG.safety.downloadLabel}
        viewLabel={MANUAL_CONFIG.safety.viewLabel}
      />
      <ManualPdfViewer
        sectionId="cpf-manual"
        title={MANUAL_CONFIG.cpf.title}
        description={MANUAL_CONFIG.cpf.description}
        fileUrl={MANUAL_CONFIG.cpf.fileUrl}
        downloadLabel={MANUAL_CONFIG.cpf.downloadLabel}
        viewLabel={MANUAL_CONFIG.cpf.viewLabel}
        externalUrl={MANUAL_CONFIG.cpf.externalUrl}
        externalLabel={MANUAL_CONFIG.cpf.externalLabel}
      />
      <InfoFooter />
    </main>
  );
}
