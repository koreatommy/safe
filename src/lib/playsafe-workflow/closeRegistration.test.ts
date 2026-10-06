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
    const parsed = parseCloseInput({ ...baseInput(1), requestId, facilityPhotos: photos });
    expect(parsed?.facilityPhotos).toHaveLength(2);
    expect(validateCloseInput(parsed!)).toBeNull();

    const withoutRequest = parseCloseInput({ ...baseInput(1), facilityPhotos: photos });
    expect(validateCloseInput(withoutRequest!)).toContain("등록 요청");
    const tooMany = parseCloseInput({
      ...baseInput(1),
      requestId,
      facilityPhotos: [...photos, photo("77777777-7777-4777-8777-777777777777", 3)],
    });
    expect(validateCloseInput(tooMany!)).toContain("최대 2장");
  });
});
