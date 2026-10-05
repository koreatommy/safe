"use client";

import dynamic from "next/dynamic";

const Gate = dynamic(() => import("../assessment/AssessmentGate").then((mod) => mod.AssessmentGate), {
  ssr: false,
  loading: () => <div className="check-app check-app-loading" aria-busy="true" />,
});

export function ChecklistLoader() {
  return <Gate />;
}
