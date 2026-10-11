import type { FacilityManagerInfo } from "@/data/playsafe/types";
import type { PhotoMeta, SubmissionChecklistPhoto, SubmissionFacilityPhoto } from "./submissionTypes";
import type { AnswerStatus, AssessmentWorkspace, RegistrationStatus, Submitter } from "./types";

export type TargetFilter = "all" | "target" | "not_target";

export type RegistrationSearch = {
  keyword: string;
  target: TargetFilter;
};

export type AdminRegistrationRow = {
  id: string;
  status: RegistrationStatus;
  submitterName: string;
  submitterEmail: string;
  facilityNo: string;
  facilityName: string;
  managerName: string;
  place: string;
  address: string;
  allEligible: boolean;
  equipmentCount: number;
  assessed: boolean;
  createdAt: string;
  submittedAt: string | null;
};

export type AdminRegistrationPage = {
  registrations: AdminRegistrationRow[];
  total: number;
  page: number;
  pageSize: number;
};

export type AssessmentSearchField = "facility" | "assessor" | "submitter";

export type AssessmentSearch = {
  field: AssessmentSearchField;
  keyword: string;
  registrationId?: string;
};

export type AdminAssessmentRow = {
  id: string;
  registrationId: string;
  facilityNo: string;
  facilityName: string;
  submitterName: string;
  assessor: string;
  evalDate: string;
  submittedAt: string;
  riskItems: number;
};

export type AdminAssessmentPage = {
  assessments: AdminAssessmentRow[];
  total: number;
  page: number;
  pageSize: number;
};

export type AssessmentView = AssessmentWorkspace["assessment"];

export type AdminRegistrationDetail = {
  registration: AssessmentWorkspace["registration"] & {
    allEligible: boolean;
  };
  assessment: AssessmentView | null;
};

export type AdminKeptPhoto = { action: "keep"; id: string };

export type AdminNewPhoto = PhotoMeta & { action: "new"; id: string };

export type AdminFacilityPhotoInput = AdminKeptPhoto | AdminNewPhoto;

export type AdminEquipmentPhotoInput = { action: "keep" } | { action: "clear" } | (PhotoMeta & { action: "new" });

export type AdminEquipmentInput = {
  id: string;
  typeCode: string;
  date: string;
  memo: string;
  photo: AdminEquipmentPhotoInput;
};

export type AdminChecklistPhotoInput =
  | { action: "keep"; id: string; itemCode: string }
  | (PhotoMeta & { action: "new"; id: string; itemCode: string });

/** 안전성평가 수정 내용. 저장된 평가가 없는 시설에 보내면 평가를 새로 등록한다. 평가를 다루지 않으면 null. */
export type AdminAssessmentUpdate = {
  assessor: string;
  evalDate: string;
  answers: Array<{ itemCode: string; status: AnswerStatus; memo: string }>;
  photos: AdminChecklistPhotoInput[];
};

/** 관리자 수정. 임시시설번호·평가대상 여부·판단 기준 답변은 바꾸지 않는다. */
export type AdminRegistrationUpdate = {
  requestId: string;
  submitter: Submitter;
  information: FacilityManagerInfo;
  facilityPhotos: AdminFacilityPhotoInput[];
  equipment: AdminEquipmentInput[];
  assessment: AdminAssessmentUpdate | null;
};

export type AdminUploadRequest = {
  requestId: string;
  facilityPhotos: SubmissionFacilityPhoto[];
  equipmentPhotos: Array<PhotoMeta & { id: string }>;
  checklistPhotos: SubmissionChecklistPhoto[];
};
