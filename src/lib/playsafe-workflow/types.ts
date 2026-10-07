import type { EligibilityAnswer, FacilityManagerInfo } from "@/data/playsafe/types";
import type { ANSWER_STATUSES, ASSESSMENT_STATUSES, REGISTRATION_STATUSES } from "./constants";
import type { SubmissionEquipment, SubmissionFacilityPhoto } from "./submissionTypes";

export type RegistrationStatus = (typeof REGISTRATION_STATUSES)[number];
export type AssessmentStatus = (typeof ASSESSMENT_STATUSES)[number];
export type AnswerStatus = (typeof ANSWER_STATUSES)[number];

export type EligibilityPair = {
  code: string;
  answer: EligibilityAnswer;
};

export type Submitter = {
  name: string;
  email: string;
};

export type EquipmentInput = {
  id: string;
  type: string;
  typeCode: string;
  date: string;
  memo: string;
};

/**
 * 2단계 '선택 확인'은 시설정보·등록신청(자격 답변)·시설 전경사진을, 3단계 '저장'은 여기에 기구정보까지 저장한다.
 * `equipment`가 없으면 DB의 기존 기구를 그대로 두고, 있으면 그 목록으로 교체한다.
 */
export type ApplicationInput = {
  id?: string;
  /** 저장 요청마다 새로 만드는 id. 시설 전경사진·기구사진 저장 경로의 첫 폴더가 된다. */
  requestId: string;
  consentAt: string;
  eligibilityVersion: string;
  information: FacilityManagerInfo;
  facilityPhotos: SubmissionFacilityPhoto[];
  answers: EligibilityPair[];
  /** `photo`가 null인 기구는 이미 저장된 사진을 유지한다. */
  equipment?: SubmissionEquipment[];
};

export type ApplicationResult = {
  registrationId: string;
  registrationRevision: number;
  status: Extract<RegistrationStatus, "registered" | "not_target">;
  /** DB 트리거가 부여한 임시시설번호. */
  facilityNo: string;
};

export type AssessmentAnswerDto = {
  itemCode: string;
  status: AnswerStatus;
  memo: string;
};

export type AssessmentPhotoDto = {
  id: string;
  itemCode: string;
  slot: number;
  bytes: number;
  mimeType: string;
  url?: string | null;
  thumbUrl?: string | null;
};

export type FacilityPhotoDto = {
  id: string;
  slot: number;
  url: string | null;
  thumbUrl: string | null;
};

export type AssessmentWorkspace = {
  registration: {
    id: string;
    submitter: Submitter;
    status: RegistrationStatus;
    information: FacilityManagerInfo;
    facilityPhotos: FacilityPhotoDto[];
    answers: EligibilityPair[];
    equipment: Array<
      EquipmentInput & { photoPath: string | null; photoUrl?: string | null; photoThumbUrl?: string | null }
    >;
    consentAt: string;
  };
  assessment: {
    id: string;
    status: AssessmentStatus;
    assessor: string;
    evalDate: string;
    checklistVersion: string;
    answers: AssessmentAnswerDto[];
    photos: AssessmentPhotoDto[];
  };
};

/** 안전성평가 화면이 DB에서 불러오는 3단계 저장 결과(시설정보·등록신청·기구). */
export type SavedRegistration = AssessmentWorkspace["registration"];
