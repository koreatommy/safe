import { describe, expect, it } from "vitest";
import { emptyFacilityInfo } from "@/data/playsafe/facility-registration";
import { quizQuestions } from "@/data/playsafe/quiz";
import { ELIGIBILITY_VERSION } from "./constants";
import { parseApplicationInput, validateApplicationInput } from "./validation/application";

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

describe("application (facility info + eligibility) validation", () => {
  it("accepts facility info and answers without equipment when any answer is no", () => {
    const parsed = parseApplicationInput(baseInput(2));
    expect(parsed).not.toBeNull();
    expect(parsed).not.toHaveProperty("equipment");
    expect(validateApplicationInput(parsed!)).toBeNull();
  });

  it("accepts eligible applications so they can be saved before equipment registration", () => {
    const parsed = parseApplicationInput(baseInput(null));
    expect(validateApplicationInput(parsed!)).toBeNull();
  });

  it("requires every eligibility question to be answered", () => {
    const parsed = parseApplicationInput({ ...baseInput(null), answers: answersWith(null).slice(1) });
    expect(validateApplicationInput(parsed!)).toContain("모두 답해");
  });

  it("requires consent and facility name", () => {
    const parsed = parseApplicationInput({ ...baseInput(0), consentAt: "" });
    expect(validateApplicationInput(parsed!)).toContain("동의");
    const unnamed = parseApplicationInput({ ...baseInput(0), information: emptyFacilityInfo });
    expect(validateApplicationInput(unnamed!)).toContain("시설명");
  });

  it("rejects payloads without answers", () => {
    expect(parseApplicationInput({ information: emptyFacilityInfo })).toBeNull();
  });

  it("accepts up to two facility photos with a request id", () => {
    const photo = (id: string, slot: number) => ({
      id,
      slot,
      bytes: 1000,
      mimeType: "image/webp",
      thumb: { bytes: 200, mimeType: "image/webp" },
    });
    const photos = [
      photo("44444444-4444-4444-8444-444444444444", 1),
      photo("55555555-5555-4555-8555-555555555555", 2),
    ];
    const requestId = "66666666-6666-4666-8666-666666666666";
    const parsed = parseApplicationInput({ ...baseInput(1), requestId, facilityPhotos: photos });
    expect(parsed?.facilityPhotos).toHaveLength(2);
    expect(validateApplicationInput(parsed!)).toBeNull();

    const withoutRequest = parseApplicationInput({ ...baseInput(1), facilityPhotos: photos });
    expect(validateApplicationInput(withoutRequest!)).toContain("등록 요청");
    const tooMany = parseApplicationInput({
      ...baseInput(1),
      requestId,
      facilityPhotos: [...photos, photo("77777777-7777-4777-8777-777777777777", 3)],
    });
    expect(validateApplicationInput(tooMany!)).toContain("최대 2장");
  });
});
