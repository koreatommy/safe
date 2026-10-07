"use client";

import { useEffect, useState } from "react";
import {
  assessmentRegistrationId,
  loadAssessmentRegistration,
  type AssessmentRegistration,
} from "@/lib/playsafe-workflow/client/assessmentRegistration";
import { clearAssessmentDraft } from "@/lib/playsafe/assessmentDraft";
import { ChecklistApp } from "../checklist/ChecklistApp";
import { RegistrationRequired } from "./RegistrationRequired";
import { RegistrationSummary } from "./RegistrationSummary";
import { SubmissionComplete } from "./SubmissionComplete";
import "./assessment-gate.css";

type GateState =
  | { status: "loading" }
  | { status: "empty"; message?: string }
  | ({ status: "ready" } & AssessmentRegistration)
  | { status: "submitted"; facilityName: string };

export function AssessmentGate() {
  const [gate, setGate] = useState<GateState>({ status: "loading" });

  useEffect(() => {
    const registrationId = assessmentRegistrationId();
    if (!registrationId) {
      // eslint-disable-next-line react-hooks/set-state-in-effect -- the URL is only readable after mount
      setGate({ status: "empty" });
      return;
    }
    let cancelled = false;
    void loadAssessmentRegistration(registrationId)
      .then((loaded) => {
        if (!cancelled) setGate({ status: "ready", ...loaded });
      })
      .catch((error: unknown) => {
        if (cancelled) return;
        setGate({ status: "empty", message: error instanceof Error ? error.message : undefined });
      });
    return () => {
      cancelled = true;
    };
  }, []);

  if (gate.status === "loading") return <div className="check-app check-app-loading" aria-busy="true" />;
  if (gate.status === "empty") {
    return (
      <RegistrationRequired>{gate.message ? <p className="assessment-required-error">{gate.message}</p> : null}</RegistrationRequired>
    );
  }
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
