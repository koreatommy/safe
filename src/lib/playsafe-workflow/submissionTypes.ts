import type { FacilityManagerInfo } from "@/data/playsafe/types";
import type { AnswerStatus, EligibilityPair, EquipmentInput } from "./types";

export type FileMeta = {
  bytes: number;
  mimeType: string;
};

export type PhotoMeta = FileMeta & { thumb: FileMeta };

export type SubmissionEquipment = EquipmentInput & { photo: PhotoMeta | null };

export type SubmissionFacilityPhoto = PhotoMeta & {
  id: string;
  slot: number;
};

export type SubmissionChecklistPhoto = PhotoMeta & {
  id: string;
  itemCode: string;
  slot: number;
};

export type SubmissionChecklist = {
  version: string;
  assessor: string;
  evalDate: string;
  answers: Array<{ itemCode: string; status: AnswerStatus; memo: string }>;
  photos: SubmissionChecklistPhoto[];
};

/** '안전성평가 완료 후 등록' 한 번에 보내는 시설정보·기구·평가 전체. */
export type SubmissionInput = {
  submissionId: string;
  id?: string;
  consentAt: string;
  eligibilityVersion: string;
  information: FacilityManagerInfo;
  facilityPhotos: SubmissionFacilityPhoto[];
  answers: EligibilityPair[];
  equipment: SubmissionEquipment[];
  checklist: SubmissionChecklist;
};

export type SignedUpload = { bucket: string; path: string; token: string };

export type PhotoUploads = { main: SignedUpload; thumb: SignedUpload };

export type SubmissionUploads = {
  equipment: Record<string, PhotoUploads>;
  checklist: Record<string, PhotoUploads>;
  facility: Record<string, PhotoUploads>;
};

export type SubmissionResult = {
  registrationId: string;
  idempotent: boolean;
};
