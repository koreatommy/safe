import { describe, expect, it } from "vitest";
import { checkItems, NO_RISK_STATUS, RISK_FOUND_STATUS } from "@/data/playsafe/checks";
import { emptyFacilityInfo } from "@/data/playsafe/facility-registration";
import { quizQuestions } from "@/data/playsafe/quiz";
import { createEmptySnapshot } from "@/lib/playsafe/checklistStorage";
import { ELIGIBILITY_VERSION } from "./constants";
import { checklistItemCodes } from "./itemCodes";
import { toAnswerStatus, toCheckLabel } from "./statusLabels";
import { toSubmissionInput } from "./submissionMapper";
import type { ApplicationInput } from "./types";
import { parseApplicationInput, validateApplicationInput } from "./validation/application";
import { typeCodeForTitle } from "./validation/facility";
import { parseSubmissionInput, validateSubmissionInput } from "./validation/submission";
import { normalizeSubmitter, sameSubmitter, validateSubmitter } from "./validation/submitter";

const EQUIPMENT_ID = "11111111-1111-4111-8111-111111111111";
const PHOTO_ID = "22222222-2222-4222-8222-222222222222";
const SUBMISSION_ID = "33333333-3333-4333-8333-333333333333";
const REGISTRATION_ID = "77777777-7777-4777-8777-777777777777";
const REQUEST_ID = "88888888-8888-4888-8888-888888888888";

const PHOTO_META = { bytes: 1000, mimeType: "image/webp", thumb: { bytes: 200, mimeType: "image/webp" } };

function completedSnapshot() {
  const snapshot = createEmptySnapshot();
  snapshot.records = snapshot.records.map((record, index) =>
    index === 0
      ? { ...record, status: RISK_FOUND_STATUS, photos: [{ id: PHOTO_ID, bytes: 1000, type: "image/webp" }] }
      : { ...record, status: NO_RISK_STATUS },
  );
  return snapshot;
}

const build = (snapshot = completedSnapshot()) =>
  toSubmissionInput({
    submissionId: SUBMISSION_ID,
    registrationId: REGISTRATION_ID,
    snapshot,
    photoMeta: new Map([[PHOTO_ID, PHOTO_META]]),
  });

const application = (noIndex: number | null = null): ApplicationInput => ({
  id: REGISTRATION_ID,
  requestId: REQUEST_ID,
  consentAt: new Date().toISOString(),
  eligibilityVersion: ELIGIBILITY_VERSION,
  information: { ...emptyFacilityInfo, facilityName: "테스트 시설" },
  facilityPhotos: [],
  answers: quizQuestions.map((question, index) => ({ code: question.code, answer: index === noIndex ? "no" : "yes" })),
  equipment: [
    { id: EQUIPMENT_ID, type: "오르는놀이형", typeCode: typeCodeForTitle("오르는놀이형"), date: "", memo: "", photo: PHOTO_META },
  ],
});

const roundTrip = <T,>(value: T): unknown => JSON.parse(JSON.stringify(value));

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

describe("assessment submission", () => {
  it("accepts a fully recorded checklist for a saved registration and survives a JSON round trip", () => {
    const input = build();
    expect(input.id).toBe(REGISTRATION_ID);
    expect(input.checklist.answers).toHaveLength(checkItems.length);
    expect(input.checklist.photos).toEqual([{ id: PHOTO_ID, itemCode: "drowning-01", slot: 1, ...PHOTO_META }]);
    const parsed = parseSubmissionInput(roundTrip(input));
    expect(parsed).toEqual(input);
    expect(validateSubmissionInput(parsed!)).toBeNull();
  });

  it("blocks registration while any item is unrecorded", () => {
    const snapshot = completedSnapshot();
    snapshot.records[5] = { ...snapshot.records[5], status: "미확인" };
    expect(validateSubmissionInput(build(snapshot))).toContain("모든 항목");
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
    expect(parseSubmissionInput(roundTrip({ ...input, checklist: { ...input.checklist, photos: [withoutThumb] } }))).toBeNull();
  });

  it("requires valid submission and registration ids", () => {
    expect(validateSubmissionInput({ ...build(), submissionId: "nope" })).toContain("등록 요청");
    expect(validateSubmissionInput({ ...build(), id: "" })).toContain("저장된 시설정보");
  });
});

describe("application save with equipment", () => {
  it("accepts facility, application and equipment together and survives a JSON round trip", () => {
    const parsed = parseApplicationInput(roundTrip(application()));
    expect(parsed?.equipment).toHaveLength(1);
    expect(validateApplicationInput(parsed!)).toBeNull();
  });

  it("keeps equipment out of the step 2 save and allows kept photos", () => {
    const stepTwo = { ...application(), equipment: undefined };
    expect(parseApplicationInput(roundTrip(stepTwo))?.equipment).toBeUndefined();
    const kept = { ...application(), equipment: application().equipment!.map((row) => ({ ...row, photo: null })) };
    expect(validateApplicationInput(parseApplicationInput(roundTrip(kept))!)).toBeNull();
  });

  it("rejects equipment for ineligible facilities and empty equipment lists", () => {
    expect(validateApplicationInput(application(0))).toContain("판단 기준");
    expect(validateApplicationInput({ ...application(), equipment: [] })).toContain("1개 이상");
  });

  it("maps the separately managed unregistered type and rejects unknown type codes", () => {
    expect(typeCodeForTitle("미등록 놀이기구")).toBe("unregistered");
    const input = application();
    const unknown = { ...input.equipment![0], typeCode: "unknown" };
    expect(validateApplicationInput({ ...input, equipment: [unknown] })).toContain("기구 유형");
  });

  it("limits facility photos to two", () => {
    const ids = [
      "44444444-4444-4444-8444-444444444444",
      "55555555-5555-4555-8555-555555555555",
      "66666666-6666-4666-8666-666666666666",
    ];
    const photos = (count: number) => ids.slice(0, count).map((id, index) => ({ id, slot: index + 1, ...PHOTO_META }));
    expect(validateApplicationInput({ ...application(), facilityPhotos: photos(2) })).toBeNull();
    expect(validateApplicationInput({ ...application(), facilityPhotos: photos(3) })).toContain("최대 2장");
  });
});
