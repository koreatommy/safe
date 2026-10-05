"use client";

import { registrationSteps } from "@/data/playsafe/facility-registration";
import { useActiveStep } from "./useActiveStep";
import "./facility-steps.css";

const stepIds = registrationSteps.map((step) => step.id);

export function FacilitySteps() {
  const activeIndex = useActiveStep(stepIds);

  return (
    <nav className="facility-steps" aria-label="등록 단계">
      <ol>
        {registrationSteps.map((step, index) => {
          const status = index < activeIndex ? "done" : index === activeIndex ? "current" : "upcoming";
          return (
            <li key={step.id} className={`facility-step is-${status}`}>
              <a href={`#${step.id}`} aria-current={status === "current" ? "step" : undefined}>
                <span className="facility-step-badge" aria-hidden="true">
                  {status === "done" ? "✓" : index + 1}
                </span>
                <span className="facility-step-label">{step.label}</span>
                {status === "done" && <span className="facility-step-sr">(완료)</span>}
              </a>
            </li>
          );
        })}
      </ol>
    </nav>
  );
}
