import { describe, expect, it } from "vitest";
import { checkItems, NO_RISK_STATUS, RISK_FOUND_STATUS } from "@/data/playsafe/checks";
import { emptyFacilityInfo } from "@/data/playsafe/facility-registration";
import { quizQuestions } from "@/data/playsafe/quiz";
import type { CompletedRegistration } from "@/data/playsafe/types";
import { createEmptySnapshot } from "@/lib/playsafe/checklistStorage";
import { checklistItemCodes } from "./itemCodes";
import { toAnswerStatus, toCheckLabel } from "./statusLabels";
import { toSubmissionInput } from "./submissionMapper";
import { parseSubmissionInput, validateSubmissionInput } from "./validation/submission";
import { normalizeSubmitter, sameSubmitter, validateSubmitter } from "./validation/submitter";

const EQUIPMENT_ID = "11111111-1111-4111-8111-111111111111";
const PHOTO_ID = "22222222-2222-4222-8222-222222222222";
const SUBMISSION_ID = "33333333-3333-4333-8333-333333333333";

const registration = (noIndex: number | null = null): CompletedRegistration => ({
  information: { ...emptyFacilityInfo, facilityName: "테스트 시설" },
  eligibility: quizQuestions.map((question, index) => ({ code: question.code, answer: index === noIndex ? "no" : "yes" })),
  equipment: [{ id: EQUIPMENT_ID, type: "오르는놀이형", date: "", memo: "", photo: "" }],
  completedAt: new Date().toISOString(),
  consentAt: new Date().toISOString(),
});

function completedSnapshot() {
  const snapshot = createEmptySnapshot();
  snapshot.records = snapshot.records.map((record, index) =>
    index === 0
      ? { ...record, status: RISK_FOUND_STATUS, photos: [{ id: PHOTO_ID, bytes: 1000, type: "image/webp" }] }
      : { ...record, status: NO_RISK_STATUS },
  );
  return snapshot;
}

const PHOTO_META = { bytes: 1000, mimeType: "image/webp", thumb: { bytes: 200, mimeType: "image/webp" } };

const build = (snapshot = completedSnapshot(), source = registration()) =>
  toSubmissionInput({
    submissionId: SUBMISSION_ID,
    registration: source,
    snapshot,
    photoMeta: new Map([[PHOTO_ID, PHOTO_META]]),
  });

describe("playsafe workflow domain", () => {
  it("maps 18 checklist codes in stable v1 order", () => {
    const codes = checklistItemCodes();
    expect(codes).toHaveLength(18);
    expect(codes[0]).toBe("drowning-01");
    expect(codes[17]).toBe("escape-02");
  });

  it("normalizes and validates the submitter key", () => {
    expect(normalizeSubmitter({ name: " 홍길동 ", email: " A@Test.COM " })).toEqual({
      name: "홍길동",
      email: "a@test.com",
    });
    expect(validateSubmitter({ name: "", email: "a@test.com" })).toContain("이름");
    expect(validateSubmitter({ name: "홍길동", email: "not-an-email" })).toContain("이메일");
    expect(validateSubmitter({ name: "홍길동", email: "a@test.com" })).toBeNull();
    expect(sameSubmitter({ name: "홍길동", email: "A@test.com" }, { name: "홍길동 ", email: "a@test.com" })).toBe(true);
  });

  it("maps korean check labels to answer statuses", () => {
    expect(toAnswerStatus("위험요소 있음")).toBe("risk_found");
    expect(toCheckLabel("not_applicable")).toBe("해당 없음");
  });
});

describe("single submission", () => {
  it("accepts a fully recorded checklist and survives a JSON round trip", () => {
    const input = build();
    expect(input.checklist.answers).toHaveLength(checkItems.length);
    expect(input.checklist.photos).toEqual([
      { id: PHOTO_ID, itemCode: "drowning-01", slot: 1, ...PHOTO_META },
    ]);
    const parsed = parseSubmissionInput(JSON.parse(JSON.stringify(input)));
    expect(parsed).not.toBeNull();
    expect(validateSubmissionInput(parsed!)).toBeNull();
  });

  it("blocks registration while any item is unrecorded", () => {
    const snapshot = completedSnapshot();
    snapshot.records[5] = { ...snapshot.records[5], status: "미확인" };
    expect(validateSubmissionInput(build(snapshot))).toContain("모든 항목");
  });

  it("rejects ineligible facilities and missing consent", () => {
    expect(validateSubmissionInput(build(completedSnapshot(), registration(0)))).toContain("판단 기준");
    const input = build();
    expect(validateSubmissionInput({ ...input, consentAt: "" })).toContain("동의");
  });

  it("rejects photos on items that are not risk_found and unsupported photo formats", () => {
    const input = build();
    const wrongItem = { ...input.checklist.photos[0], itemCode: "drowning-02" };
    expect(validateSubmissionInput({ ...input, checklist: { ...input.checklist, photos: [wrongItem] } })).toContain(
      "위험요소 있음",
    );
    const png = { ...input.checklist.photos[0], mimeType: "image/png" };
    expect(validateSubmissionInput({ ...input, checklist: { ...input.checklist, photos: [png] } })).toContain("형식");
  });

  it("requires a storable thumbnail for every photo", () => {
    const input = build();
    const hugeThumb = { ...input.checklist.photos[0], thumb: { bytes: 500 * 1024, mimeType: "image/webp" } };
    expect(validateSubmissionInput({ ...input, checklist: { ...input.checklist, photos: [hugeThumb] } })).toContain(
      "썸네일",
    );
    const withoutThumb = { ...input.checklist.photos[0], thumb: undefined };
    const parsed = parseSubmissionInput(
      JSON.parse(JSON.stringify({ ...input, checklist: { ...input.checklist, photos: [withoutThumb] } })),
    );
    expect(parsed).toBeNull();
  });

  it("requires a valid submission id", () => {
    expect(validateSubmissionInput({ ...build(), submissionId: "nope" })).toContain("등록 요청");
  });
});
