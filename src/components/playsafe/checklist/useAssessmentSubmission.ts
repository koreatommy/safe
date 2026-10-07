"use client";

import { useRef, useState } from "react";
import { submitAssessment } from "@/lib/playsafe-workflow/client/submitAssessment";
import type { ChecklistSnapshot } from "@/lib/playsafe/checklistStorage";

export function useAssessmentSubmission(registrationId: string, snapshot: ChecklistSnapshot) {
  const submissionId = useRef<string | null>(null);
  const [busy, setBusy] = useState(false);
  const [progress, setProgress] = useState("");

  const submit = async () => {
    submissionId.current ??= crypto.randomUUID();
    setBusy(true);
    setProgress("등록 준비 중…");
    try {
      return await submitAssessment({
        submissionId: submissionId.current,
        registrationId,
        snapshot,
        onProgress: (done, total) => setProgress(`사진 업로드 중 ${done}/${total}`),
      });
    } finally {
      setBusy(false);
      setProgress("");
    }
  };

  return { busy, progress, submit };
}
