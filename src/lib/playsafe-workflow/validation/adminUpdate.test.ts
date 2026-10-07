import { describe, expect, it } from "vitest";
import { checkItems } from "@/data/playsafe/checks";
import { emptyFacilityInfo } from "@/data/playsafe/facility-registration";
import { prepareAdminUpdate, prepareAdminUpload } from "./adminUpdate";

const FACILITY_ID = "11111111-1111-4111-8111-111111111111";
const EQUIPMENT_ID = "22222222-2222-4222-8222-222222222222";
const REQUEST_ID = "33333333-3333-4333-8333-333333333333";

const photoMeta = {
  bytes: 1200,
  mimeType: "image/webp",
  thumb: { bytes: 400, mimeType: "image/webp" },
};

const validUpdate = () => ({
  requestId: REQUEST_ID,
  submitter: { name: " 홍길동 ", email: "Admin@Example.com " },
  information: { ...emptyFacilityInfo, facilityName: " 테스트 시설 ", place: "학교", placeEtc: "남길 값" },
  facilityPhotos: [{ action: "keep", id: FACILITY_ID }],
  equipment: [{ id: EQUIPMENT_ID, typeCode: "climb", date: "2026-10-07", memo: "메모", photo: { action: "clear" } }],
});

describe("prepareAdminUpdate", () => {
  it("trims submitter fields and drops placeEtc unless the place is 기타", () => {
    const prepared = prepareAdminUpdate(validUpdate());
    expect(prepared.ok).toBe(true);
    if (!prepared.ok) return;
    expect(prepared.value.submitter).toEqual({ name: "홍길동", email: "admin@example.com" });
    expect(prepared.value.information.facilityName).toBe("테스트 시설");
    expect(prepared.value.information.placeEtc).toBe("");
  });

  it("rejects a missing facility name and an invalid email", () => {
    expect(prepareAdminUpdate({ ...validUpdate(), information: emptyFacilityInfo }).ok).toBe(false);
    const badEmail = prepareAdminUpdate({ ...validUpdate(), submitter: { name: "홍길동", email: "not-an-email" } });
    expect(badEmail.ok).toBe(false);
    if (!badEmail.ok) expect(badEmail.message).toContain("이메일");
  });

  it("rejects more than two facility photos and an unknown equipment type", () => {
    const photos = [1, 2, 3].map((slot) => ({ action: "keep", id: `00000000-0000-4000-8000-00000000000${slot}` }));
    expect(prepareAdminUpdate({ ...validUpdate(), facilityPhotos: photos }).ok).toBe(false);
    const badType = prepareAdminUpdate({
      ...validUpdate(),
      equipment: [{ id: EQUIPMENT_ID, typeCode: "missing", date: "", memo: "", photo: { action: "keep" } }],
    });
    expect(badType.ok).toBe(false);
  });

  it("requires a request id when a new photo is included", () => {
    const prepared = prepareAdminUpdate({
      ...validUpdate(),
      requestId: "",
      facilityPhotos: [{ action: "new", id: FACILITY_ID, ...photoMeta }],
    });
    expect(prepared.ok).toBe(false);
  });
});

describe("prepareAdminUpdate assessment", () => {
  const answers = checkItems.map((item) => ({ itemCode: item.code, status: "no_risk" as const, memo: "" }));
  const riskPhotoId = "44444444-4444-4444-8444-444444444444";

  it("accepts all 18 recorded answers and a photo on a risk item", () => {
    const prepared = prepareAdminUpdate({
      ...validUpdate(),
      assessment: {
        assessor: " 평가자 ",
        evalDate: "2026-10-07",
        answers: answers.map((answer, index) => (index === 0 ? { ...answer, status: "risk_found", memo: "난간 보수" } : answer)),
        photos: [{ action: "keep", id: riskPhotoId, itemCode: checkItems[0].code }],
      },
    });
    expect(prepared.ok).toBe(true);
    if (!prepared.ok || !prepared.value.assessment) return;
    expect(prepared.value.assessment.assessor).toBe("평가자");
    expect(prepared.value.assessment.photos).toHaveLength(1);
  });

  it("rejects a photo attached to an item that is not marked as a risk", () => {
    const prepared = prepareAdminUpdate({
      ...validUpdate(),
      assessment: {
        assessor: "평가자",
        evalDate: "2026-10-07",
        answers,
        photos: [{ action: "keep", id: riskPhotoId, itemCode: checkItems[0].code }],
      },
    });
    expect(prepared.ok).toBe(false);
    if (!prepared.ok) expect(prepared.message).toContain("위험요소 있음");
  });
});

describe("prepareAdminUpload", () => {
  it("accepts new facility and equipment photo metadata", () => {
    const prepared = prepareAdminUpload({
      requestId: REQUEST_ID,
      facilityPhotos: [{ id: FACILITY_ID, slot: 1, ...photoMeta }],
      equipmentPhotos: [{ id: EQUIPMENT_ID, ...photoMeta }],
    });
    expect(prepared.ok).toBe(true);
  });
});
