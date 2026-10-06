import { checkItems, RISK_FOUND_STATUS } from "@/data/playsafe/checks";
import type { CompletedRegistration } from "@/data/playsafe/types";
import type { ChecklistSnapshot } from "@/lib/playsafe/checklistStorage";
import { CHECKLIST_VERSION, ELIGIBILITY_VERSION } from "./constants";
import { toAnswerStatus } from "./statusLabels";
import type { PhotoMeta, SubmissionChecklistPhoto, SubmissionInput } from "./submissionTypes";
import { typeCodeForTitle } from "./validation/facility";

type SubmissionSource = {
  submissionId: string;
  registration: CompletedRegistration;
  snapshot: ChecklistSnapshot;
  /** 브라우저에 저장된 사진 Blob의 실제 크기·형식. key는 시설 전경사진·기구·평가 사진 id. */
  photoMeta: ReadonlyMap<string, PhotoMeta>;
};

function checklistPhotos(snapshot: ChecklistSnapshot, photoMeta: SubmissionSource["photoMeta"]) {
  return checkItems.flatMap((item, index): SubmissionChecklistPhoto[] => {
    const record = snapshot.records[index];
    if (record?.status !== RISK_FOUND_STATUS) return [];
    return record.photos.map((photo, order) => {
      const meta = photoMeta.get(photo.id);
      if (!meta) throw new Error("위험요소 사진 정보를 찾지 못했습니다. 해당 사진을 지우고 다시 추가해 주세요.");
      return { id: photo.id, itemCode: item.code, slot: order + 1, ...meta };
    });
  });
}

/** 브라우저 임시 저장본(시설정보 + 체크리스트)을 최종 등록 요청으로 바꾼다. */
export function toSubmissionInput({ submissionId, registration, snapshot, photoMeta }: SubmissionSource): SubmissionInput {
  return {
    submissionId,
    id: registration.id,
    consentAt: registration.consentAt ?? "",
    eligibilityVersion: ELIGIBILITY_VERSION,
    information: registration.information,
    facilityPhotos: (registration.facilityPhotos ?? []).flatMap((photo, index) => {
      const meta = photoMeta.get(photo.id);
      return meta ? [{ id: photo.id, slot: index + 1, ...meta }] : [];
    }),
    answers: registration.eligibility ?? [],
    equipment: registration.equipment.map((row) => ({
      id: row.id,
      type: row.type,
      typeCode: typeCodeForTitle(row.type),
      date: row.date,
      memo: row.memo,
      photo: photoMeta.get(row.id) ?? null,
    })),
    checklist: {
      version: CHECKLIST_VERSION,
      assessor: snapshot.assessor,
      evalDate: snapshot.evalDate,
      answers: checkItems.map((item, index) => ({
        itemCode: item.code,
        status: toAnswerStatus(snapshot.records[index].status),
        memo: snapshot.records[index].memo,
      })),
      photos: checklistPhotos(snapshot, photoMeta),
    },
  };
}
