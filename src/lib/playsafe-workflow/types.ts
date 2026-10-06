import type { EligibilityAnswer, FacilityManagerInfo } from "@/data/playsafe/types";
import type { ANSWER_STATUSES, ASSESSMENT_STATUSES, REGISTRATION_STATUSES } from "./constants";
import type { SubmissionFacilityPhoto } from "./submissionTypes";

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

export type CloseRegistrationInput = {
  id?: string;
  /** 종결 요청마다 새로 만드는 id. 시설 전경사진 저장 경로의 첫 폴더가 된다. */
  requestId: string;
  consentAt: string;
  eligibilityVersion: string;
  information: FacilityManagerInfo;
  facilityPhotos: SubmissionFacilityPhoto[];
  answers: EligibilityPair[];
};

export type CloseRegistrationResult = {
  registrationId: string;
  registrationRevision: number;
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
