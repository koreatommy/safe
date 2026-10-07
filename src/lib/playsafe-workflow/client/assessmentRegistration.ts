import type { CompletedRegistration } from "@/data/playsafe/types";
import { loadRegistration } from "@/lib/playsafe/registrationStorage";
import { ASSESSMENT_REGISTRATION_PARAM } from "@/lib/playsafe/routes";
import type { SavedRegistration, Submitter } from "../types";
import { fetchSavedRegistration } from "./api";

export type AssessmentRegistration = {
  registration: CompletedRegistration & { id: string };
  submitter: Submitter;
};

/** 주소의 등록 id를 우선하고, 없으면 이 브라우저에서 마지막으로 저장한 등록 id를 쓴다. */
export function assessmentRegistrationId(): string | null {
  const fromUrl = new URLSearchParams(window.location.search).get(ASSESSMENT_REGISTRATION_PARAM);
  return fromUrl || loadRegistration()?.id || null;
}

function toCompletedRegistration(saved: SavedRegistration): AssessmentRegistration["registration"] {
  return {
    id: saved.id,
    information: saved.information,
    facilityPhotos: saved.facilityPhotos.flatMap((photo) => {
      const url = photo.thumbUrl ?? photo.url;
      return url ? [{ id: photo.id, photo: url }] : [];
    }),
    eligibility: saved.answers,
    equipment: saved.equipment.map((row) => ({
      id: row.id,
      type: row.type,
      date: row.date,
      memo: row.memo,
      photo: row.photoThumbUrl ?? row.photoUrl ?? "",
    })),
    completedAt: "",
    consentAt: saved.consentAt,
  };
}

/** 3단계에서 DB에 저장한 시설정보·등록신청·기구정보를 불러온다. 사진은 서명 URL이다. */
export async function loadAssessmentRegistration(registrationId: string): Promise<AssessmentRegistration> {
  const saved = await fetchSavedRegistration(registrationId);
  return { registration: toCompletedRegistration(saved), submitter: saved.submitter };
}
