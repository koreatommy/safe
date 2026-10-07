import { checkItems } from "@/data/playsafe/checks";
import type { FacilityManagerInfo } from "@/data/playsafe/types";
import type { AdminRegistrationDetail } from "../adminTypes";
import type { AnswerStatus } from "../types";

export type EditPhoto =
  | { kind: "keep"; id: string; previewUrl: string | null }
  | { kind: "new"; id: string; blob: Blob; previewUrl: string };

export type EditEquipmentPhoto =
  | { kind: "keep"; previewUrl: string | null }
  | { kind: "new"; blob: Blob; previewUrl: string }
  | { kind: "none" };

export type EditEquipmentRow = {
  id: string;
  typeCode: string;
  date: string;
  memo: string;
  photo: EditEquipmentPhoto;
};

export type EditChecklistAnswer = {
  itemCode: string;
  status: AnswerStatus;
  memo: string;
  photos: EditPhoto[];
};

export type EditAssessment = {
  assessor: string;
  evalDate: string;
  answers: EditChecklistAnswer[];
};

export type AdminEditDraft = {
  submitterName: string;
  submitterEmail: string;
  information: FacilityManagerInfo;
  facilityPhotos: EditPhoto[];
  equipment: EditEquipmentRow[];
  assessment: EditAssessment | null;
};

function assessmentDraft(detail: AdminRegistrationDetail): EditAssessment | null {
  const assessment = detail.assessment;
  if (!assessment) return null;
  return {
    assessor: assessment.assessor,
    evalDate: assessment.evalDate,
    answers: checkItems.map((item) => {
      const answer = assessment.answers.find((row) => row.itemCode === item.code);
      return {
        itemCode: item.code,
        status: answer?.status ?? "unrecorded",
        memo: answer?.memo ?? "",
        photos: assessment.photos
          .filter((photo) => photo.itemCode === item.code)
          .sort((left, right) => left.slot - right.slot)
          .map((photo) => ({ kind: "keep" as const, id: photo.id, previewUrl: photo.thumbUrl ?? photo.url ?? null })),
      };
    }),
  };
}

export function draftFromDetail(detail: AdminRegistrationDetail): AdminEditDraft {
  const { registration } = detail;
  return {
    submitterName: registration.submitter.name,
    submitterEmail: registration.submitter.email,
    information: { ...registration.information },
    facilityPhotos: registration.facilityPhotos.map((photo) => ({
      kind: "keep" as const,
      id: photo.id,
      previewUrl: photo.thumbUrl ?? photo.url,
    })),
    equipment: registration.equipment.map((row) => ({
      id: row.id,
      typeCode: row.typeCode,
      date: row.date,
      memo: row.memo,
      photo: row.photoPath
        ? { kind: "keep" as const, previewUrl: row.photoThumbUrl ?? row.photoUrl ?? null }
        : { kind: "none" as const },
    })),
    assessment: assessmentDraft(detail),
  };
}

export function revokeDraftUrls(draft: AdminEditDraft): void {
  for (const photo of draft.facilityPhotos) {
    if (photo.kind === "new") URL.revokeObjectURL(photo.previewUrl);
  }
  for (const row of draft.equipment) {
    if (row.photo.kind === "new") URL.revokeObjectURL(row.photo.previewUrl);
  }
  for (const answer of draft.assessment?.answers ?? []) {
    for (const photo of answer.photos) {
      if (photo.kind === "new") URL.revokeObjectURL(photo.previewUrl);
    }
  }
}
