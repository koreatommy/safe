import type { Metadata } from "next";
import { Suspense } from "react";
import { FacilityRegistrationSection } from "@/components/playsafe/facility-registration/FacilityRegistrationSection";
import { SiteFooter } from "@/components/playsafe/footer/SiteFooter";
import { SiteNav } from "@/components/playsafe/navigation/SiteNav";
import { requireAssessmentPageAccess } from "@/lib/playsafe/assessmentAccess";
import { facilityInfoMetadata } from "@/lib/playsafe/metadata";
import { playsafeRoutes } from "@/lib/playsafe/routes";

export const metadata: Metadata = facilityInfoMetadata;
export const dynamic = "force-dynamic";

export default async function FacilityInfoPage() {
  await requireAssessmentPageAccess(playsafeRoutes.facilityInfo);

  return (
    <>
      <a href="#main" className="btn skip-link">
        본문으로 건너뛰기
      </a>
      <SiteNav assessmentLoggedIn />
      <main id="main">
        <Suspense fallback={<p className="wrap">시설정보를 불러오는 중입니다.</p>}>
          <FacilityRegistrationSection />
        </Suspense>
      </main>
      <SiteFooter />
    </>
  );
}
