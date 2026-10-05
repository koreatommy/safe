"use client";

import { useEffect, useState } from "react";
import type { CompletedRegistration } from "@/data/playsafe/types";
import { loadSubmitter } from "@/lib/playsafe-workflow/client/submitterStore";
import type { Submitter } from "@/lib/playsafe-workflow/types";
import { clearAssessmentDraft, loadRegistrationDraft } from "@/lib/playsafe/assessmentDraft";
import { ChecklistApp } from "../checklist/ChecklistApp";
import { RegistrationRequired } from "./RegistrationRequired";
import { RegistrationSummary } from "./RegistrationSummary";
import { SubmissionComplete } from "./SubmissionComplete";
import "./assessment-gate.css";

type GateState =
  | { status: "loading" }
  | { status: "empty" }
  | { status: "ready"; registration: CompletedRegistration; submitter: Submitter | null }
  | { status: "submitted"; facilityName: string };

export function AssessmentGate() {
  const [gate, setGate] = useState<GateState>({ status: "loading" });

  useEffect(() => {
    void loadRegistrationDraft()
      .catch(() => null)
      .then((registration) =>
        setGate(registration ? { status: "ready", registration, submitter: loadSubmitter() } : { status: "empty" }),
      );
  }, []);

  if (gate.status === "loading") return <div className="check-app check-app-loading" aria-busy="true" />;
  if (gate.status === "empty") return <RegistrationRequired />;
  if (gate.status === "submitted") return <SubmissionComplete facilityName={gate.facilityName} />;

  const { registration, submitter } = gate;
  return (
    <>
      <RegistrationSummary registration={registration} submitter={submitter} />
      <ChecklistApp
        registration={registration}
        onSubmitted={() => {
          setGate({ status: "submitted", facilityName: registration.information.facilityName });
          void clearAssessmentDraft();
        }}
      />
    </>
  );
}
