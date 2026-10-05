import { facilities } from "./facilities";

export const MAX_EQUIPMENT_TYPES = 5;
export const MAX_EQUIPMENT_QUANTITY = 5;
export const MAX_PHOTO_BYTES = 10 * 1024 * 1024;
export const PHOTO_MAX_EDGE = 1600;
export const PHOTO_QUALITY = 0.8;
export const MAX_MEMO_LENGTH = 500;

export const registrationSteps = [
  { id: "step1", label: "관리주체·시설정보" },
  { id: "step2", label: "신규설치 등록신청" },
  { id: "step3", label: "기구정보 등록" },
] as const;

export const NOT_ELIGIBLE_MESSAGE = "모든 판단 기준에 부합하는 경우에만 등록신청이 가능합니다.";

export const NOT_TARGET_TITLE = "안전성평가 대상 시설이 아닙니다";

export const NOT_TARGET_SUMMARY =
  "신규설치 등록신청 판단 기준을 모두 만족하지 않아 신종·유사 놀이시설 등록 및 안전성평가 대상에 해당하지 않습니다.";

export const EQUIPMENT_CLOSED_MESSAGE = "놀이기구 없음 · 등록신청 판단 기준 미충족으로 기구정보 등록이 종결되었습니다.";

export const FACILITY_NO_LENGTH = 5;

export const PLACE_ETC = "기타";

export const placeOptions = ["신종유사", ...facilities.map((facility) => facility.title), PLACE_ETC] as const;

export const waterOptions = ["포함", "미포함"] as const;

export const indoorOptions = ["실내", "실외", "실내외"] as const;

export const emptyFacilityInfo = {
  managerName: "",
  phone: "",
  email: "",
  facilityName: "",
  facilityNo: "",
  place: "",
  placeEtc: "",
  postcode: "",
  address: "",
  detailAddress: "",
  water: "",
  indoor: "",
} as const;
