import type { CheckItem, CheckStatus } from "./types";

export const UNRECORDED_STATUS = "미확인" satisfies CheckStatus;
export const RISK_FOUND_STATUS = "위험요소 있음" satisfies CheckStatus;
export const NO_RISK_STATUS = "위험요소 없음" satisfies CheckStatus;
export const NOT_APPLICABLE_STATUS = "해당 없음" satisfies CheckStatus;

/** Statuses an assessor can pick; `UNRECORDED_STATUS` is the initial, not-yet-assessed state. */
export const selectableStatuses: CheckStatus[] = [RISK_FOUND_STATUS, NO_RISK_STATUS, NOT_APPLICABLE_STATUS];
export const checkStatuses: CheckStatus[] = [UNRECORDED_STATUS, ...selectableStatuses];

/** Maps statuses saved by the previous 4-option form to the current options. */
export const legacyStatusMap: Record<string, CheckStatus> = {
  "개선 필요": RISK_FOUND_STATUS,
  "확인 완료": NO_RISK_STATUS,
};

export const checkItems: CheckItem[] = [
  { code: "drowning-01", category: "익수", label: "시설물의 사용연령 및 인원과 함께 안전한 이용수칙의 표시 및 안내 여부" },
  { code: "drowning-02", category: "익수", label: "시설물의 사용으로 발생될 수 있는 위험에 대한 사전 안내 여부" },
  { code: "drowning-03", category: "익수", label: "익수 위험 방지를 위한 시설물 관리: 수심 표시, 감시 사각지대, 마개 여부" },
  { code: "fall-01", category: "추락", label: "오르거나 매달리는 것을 유도하는 시설 및 놀이 중 추락 위험 여부" },
  { code: "fall-02", category: "추락", label: "사용 연령·인원 및 영유아 사용 위험 안내 여부" },
  { code: "fall-03", category: "추락", label: "추락방지 보호 조치: 난간, 울타리, 안전공간 여부" },
  { code: "electric-01", category: "감전", label: "전기·조명·기타 관리용 설비에 대한 어린이 접근 위험 여부" },
  { code: "collision-01", category: "충돌", label: "그네·미끄럼틀·회전 등 강제적 움직임이 발생하는 공간의 장애물 여부" },
  { code: "collision-02", category: "충돌", label: "동선 겹침 또는 잘못된 배치로 인한 충돌 위험 여부" },
  { code: "collision-03", category: "충돌", label: "어두운 조명 및 놀이행위를 관찰할 수 없는 사각공간 여부" },
  { code: "slip-01", category: "미끄러짐·넘어짐", label: "계단·경사로의 습기, 물기, 미고정 물체 여부" },
  { code: "slip-02", category: "미끄러짐·넘어짐", label: "이용 동선 및 비상구의 걸림·미끄러짐 위험 여부" },
  { code: "entrapment-01", category: "얽매임·짓눌림", label: "추락할 수 있는 높이에서 머리 등 신체 끼임 위험 여부" },
  { code: "entrapment-02", category: "얽매임·짓눌림", label: "어린이 눈높이 틈새의 손가락 끼임 위험 여부" },
  { code: "entrapment-03", category: "얽매임·짓눌림", label: "움직이는 놀이요소·부품 사이의 짓눌림 위험 여부" },
  { code: "puncture-01", category: "찔림·긁힘", label: "낮은 천정 또는 날카로운 시설물 마감에 의한 부상 위험 여부" },
  { code: "escape-01", category: "비상탈출", label: "폐쇄형 공간의 출입구 배치 및 크기 여부" },
  { code: "escape-02", category: "비상탈출", label: "비상통로·비상출입구 확보 및 장애물 여부" },
];
