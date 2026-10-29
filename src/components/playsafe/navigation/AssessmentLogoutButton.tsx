"use client";

import { useRouter } from "next/navigation";
import { useState } from "react";
import { logoutAssessment } from "@/lib/assessmentAuth";
import { playsafeRoutes } from "@/lib/playsafe/routes";

type AssessmentLogoutButtonProps = {
  className?: string;
  onDone?: () => void;
};

export function AssessmentLogoutButton({ className, onDone }: AssessmentLogoutButtonProps) {
  const router = useRouter();
  const [busy, setBusy] = useState(false);

  const handleClick = async () => {
    if (busy) return;
    setBusy(true);
    await logoutAssessment();
    onDone?.();
    router.replace(playsafeRoutes.assessmentLogin);
    router.refresh();
  };

  return (
    <button type="button" className={className} onClick={handleClick} disabled={busy}>
      {busy ? "로그아웃 중…" : "로그아웃"}
    </button>
  );
}
