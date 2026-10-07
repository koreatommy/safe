import type { AnswerStatus, EquipmentInput } from "./types";

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

/** '안전성평가 완료 후 등록' 요청. 시설정보·기구는 3단계에서 DB에 저장된 값을 쓰고 평가만 보낸다. */
export type SubmissionInput = {
  submissionId: string;
  id: string;
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
