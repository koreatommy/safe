import { describe, expect, it } from "vitest";
import { emptyFacilityInfo } from "@/data/playsafe/facility-registration";
import { quizQuestions } from "@/data/playsafe/quiz";
import { ELIGIBILITY_VERSION } from "./constants";
import { parseCloseInput, validateCloseInput } from "./validation/closeRegistration";

const answersWith = (noIndex: number | null) =>
  quizQuestions.map((question, index) => ({
    code: question.code,
    answer: (index === noIndex ? "no" : "yes") as "yes" | "no",
  }));

const baseInput = (noIndex: number | null) => ({
  consentAt: new Date().toISOString(),
  eligibilityVersion: ELIGIBILITY_VERSION,
  information: { ...emptyFacilityInfo, facilityName: "테스트 시설" },
  answers: answersWith(noIndex),
});

describe("close registration validation", () => {
  it("accepts facility info and answers without equipment when any answer is no", () => {
    const parsed = parseCloseInput(baseInput(2));
    expect(parsed).not.toBeNull();
    expect(parsed).not.toHaveProperty("equipment");
    expect(validateCloseInput(parsed!)).toBeNull();
  });

  it("rejects closing when every answer is yes", () => {
    const parsed = parseCloseInput(baseInput(null));
    expect(validateCloseInput(parsed!)).toContain("종결할 수 없습니다");
  });

  it("requires consent and facility name", () => {
    const parsed = parseCloseInput({ ...baseInput(0), consentAt: "" });
    expect(validateCloseInput(parsed!)).toContain("동의");
    const unnamed = parseCloseInput({ ...baseInput(0), information: emptyFacilityInfo });
    expect(validateCloseInput(unnamed!)).toContain("시설명");
  });

  it("rejects payloads without answers", () => {
    expect(parseCloseInput({ information: emptyFacilityInfo })).toBeNull();
  });
});
