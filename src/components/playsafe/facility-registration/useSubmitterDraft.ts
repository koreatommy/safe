"use client";

import { useEffect, useState } from "react";
import { loadSubmitter } from "@/lib/playsafe-workflow/client/submitterStore";
import type { Submitter } from "@/lib/playsafe-workflow/types";

export function useSubmitterDraft() {
  const [submitter, setSubmitter] = useState<Submitter>({ name: "", email: "" });

  useEffect(() => {
    const stored = loadSubmitter();
    // eslint-disable-next-line react-hooks/set-state-in-effect -- localStorage is only readable after hydration
    if (stored) setSubmitter(stored);
  }, []);

  const updateSubmitter = (field: keyof Submitter, value: string) => {
    setSubmitter((current) => ({ ...current, [field]: value }));
  };

  return { submitter, setSubmitter, updateSubmitter };
}
