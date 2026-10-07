import { checkItems, RISK_FOUND_STATUS } from "@/data/playsafe/checks";
import type { ChecklistSnapshot } from "@/lib/playsafe/checklistStorage";
import { CHECKLIST_VERSION } from "./constants";
import { toAnswerStatus } from "./statusLabels";
import type { PhotoMeta, SubmissionChecklistPhoto, SubmissionInput } from "./submissionTypes";

type SubmissionSource = {
  submissionId: string;
  registrationId: string;
  snapshot: ChecklistSnapshot;
  /** 브라우저에 저장된 위험요소 사진 Blob의 실제 크기·형식. key는 평가 사진 id. */
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

/** 체크리스트 임시 저장본을 DB에 저장된 등록에 붙일 안전성평가 등록 요청으로 바꾼다. */
export function toSubmissionInput({ submissionId, registrationId, snapshot, photoMeta }: SubmissionSource): SubmissionInput {
  return {
    submissionId,
    id: registrationId,
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
