import { describe, expect, it } from "vitest";
import { assessmentLoginHref, safeAssessmentNextPath } from "./assessmentNextPath";

describe("safeAssessmentNextPath", () => {
  it("allows assessment paths and rejects open redirects", () => {
    expect(safeAssessmentNextPath("/assessment")).toBe("/assessment");
    expect(safeAssessmentNextPath("/assessment/facility")).toBe("/assessment/facility");
    expect(safeAssessmentNextPath("/admin")).toBe("/assessment/facility");
    expect(safeAssessmentNextPath("//evil.example")).toBe("/assessment/facility");
    expect(safeAssessmentNextPath("https://evil.example")).toBe("/assessment/facility");
    expect(safeAssessmentNextPath("/assessment/login")).toBe("/assessment/facility");
  });

  it("builds login href with encoded next", () => {
    expect(assessmentLoginHref("/assessment")).toBe("/assessment/login?next=%2Fassessment");
  });
});
