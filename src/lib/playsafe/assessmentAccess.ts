import "server-only";

import { redirect } from "next/navigation";
import { isAssessmentRequest } from "@/lib/server/assessmentSession";
import { assessmentLoginHref } from "./assessmentNextPath";

/** 비밀번호 세션이 없으면 로그인 화면으로 보낸다. */
export async function requireAssessmentPageAccess(nextPath: string): Promise<void> {
  if (await isAssessmentRequest()) return;
  redirect(assessmentLoginHref(nextPath));
}
