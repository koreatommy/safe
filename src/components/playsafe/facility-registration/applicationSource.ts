import { ELIGIBILITY_VERSION } from "@/lib/playsafe-workflow/constants";
import type { useFacilityRegistration } from "./useFacilityRegistration";

type RegistrationState = ReturnType<typeof useFacilityRegistration>;

/** 2단계 '선택 확인'과 3단계 '저장'이 함께 보내는 시설정보·등록신청·시설 전경사진. */
export function applicationSource(state: RegistrationState) {
  return {
    id: state.registrationId,
    consentAt: state.consentAt ?? new Date().toISOString(),
    eligibilityVersion: ELIGIBILITY_VERSION,
    information: state.info,
    facilityPhotos: state.facilityPhotos,
    answers: state.answers.map((answer, index) => ({ code: state.eligibilityCodes[index], answer })),
  };
}

/** 마지막 저장 이후 바뀐 내용이 있는지 비교하는 키. 임시시설번호는 DB가 부여하므로 제외한다. */
export function registrationChangeKey(state: RegistrationState): string {
  return JSON.stringify({
    submitter: state.submitter,
    consented: Boolean(state.consentAt),
    information: { ...state.info, facilityNo: "" },
    answers: state.answers,
    facilityPhotoIds: state.facilityPhotos.map((photo) => photo.id),
    equipmentIds: state.rows.map((row) => row.id),
  });
}
