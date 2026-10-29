import type { Metadata } from "next";
import { redirect } from "next/navigation";
import { Suspense } from "react";
import { AssessmentLoginForm } from "@/components/playsafe/assessment/AssessmentLoginForm";
import { SiteFooter } from "@/components/playsafe/footer/SiteFooter";
import { SiteNav } from "@/components/playsafe/navigation/SiteNav";
import { safeAssessmentNextPath } from "@/lib/playsafe/assessmentNextPath";
import { isAssessmentRequest } from "@/lib/server/assessmentSession";

export const metadata: Metadata = {
  title: "안전성평가 로그인 | 안전관리 가이드",
  description: "비밀번호 확인 후 안전성평가를 시작합니다.",
};

export const dynamic = "force-dynamic";

type LoginPageProps = {
  searchParams: Promise<{ next?: string | string[] }>;
};

export default async function AssessmentLoginPage({ searchParams }: LoginPageProps) {
  const params = await searchParams;
  const rawNext = Array.isArray(params.next) ? params.next[0] : params.next;
  const nextPath = safeAssessmentNextPath(rawNext);

  if (await isAssessmentRequest()) redirect(nextPath);

  return (
    <>
      <a href="#main" className="btn skip-link">
        본문으로 건너뛰기
      </a>
      <SiteNav />
      <main id="main">
        <Suspense fallback={<p className="wrap">로그인 화면을 불러오는 중입니다.</p>}>
          <AssessmentLoginForm />
        </Suspense>
      </main>
      <SiteFooter />
    </>
  );
}
