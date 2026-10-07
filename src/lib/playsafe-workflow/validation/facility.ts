import { PLAY_TYPE_SLUGS, playTypes } from "@/data/playsafe/play-types";
import { quizQuestions } from "@/data/playsafe/quiz";
import type { FacilityManagerInfo } from "@/data/playsafe/types";
import { ELIGIBILITY_VERSION, MAX_EQUIPMENT } from "../constants";
import type { EligibilityPair, EquipmentInput } from "../types";

const UUID_RE =
  /^[0-9a-f]{8}-[0-9a-f]{4}-[1-8][0-9a-f]{3}-[89ab][0-9a-f]{3}-[0-9a-f]{12}$/i;

export function isUuid(value: string): boolean {
  return UUID_RE.test(value);
}

export function typeCodeForTitle(title: string): string {
  return playTypes.find((type) => type.title === title)?.slug ?? "etc";
}

export function validateEligibility(answers: EligibilityPair[], version: string): string | null {
  if (version !== ELIGIBILITY_VERSION) return "자격 문항 버전이 오래되었습니다. 페이지를 새로고침해 주세요.";
  if (answers.length !== quizQuestions.length) return "자격 문항에 모두 답해 주세요.";
  const byCode = new Map(answers.map((item) => [item.code, item.answer]));
  for (const question of quizQuestions) {
    const answer = byCode.get(question.code);
    if (answer !== "yes" && answer !== "no") return "자격 답변이 올바르지 않습니다.";
  }
  return null;
}

export function allEligible(answers: EligibilityPair[]): boolean {
  return answers.every((item) => item.answer === "yes");
}

export function validateEquipment(equipment: EquipmentInput[]): string | null {
  if (equipment.length < 1) return "놀이기구를 1개 이상 등록해 주세요.";
  if (equipment.length > MAX_EQUIPMENT) return `놀이기구는 최대 ${MAX_EQUIPMENT}대까지 등록할 수 있습니다.`;
  const seen = new Set<string>();
  for (const row of equipment) {
    if (!isUuid(row.id)) return "기구 식별자가 올바르지 않습니다.";
    if (seen.has(row.id)) return "기구 식별자가 중복되었습니다.";
    seen.add(row.id);
    if (!row.type.trim() || !PLAY_TYPE_SLUGS.has(row.typeCode)) return "기구 유형을 확인해 주세요.";
  }
  return null;
}

export function validateFacilityInformation(info: FacilityManagerInfo): string | null {
  if (!info.facilityName.trim()) return "시설명을 입력해 주세요.";
  return null;
}

export function parseFacilityInformation(information: object): FacilityManagerInfo {
  const info = information as Record<string, unknown>;
  const text = (key: string) => (typeof info[key] === "string" ? info[key] : "");
  return {
    managerName: text("managerName"),
    phone: text("phone"),
    email: text("email"),
    facilityName: text("facilityName"),
    facilityNo: text("facilityNo"),
    place: text("place"),
    placeEtc: text("placeEtc"),
    postcode: text("postcode"),
    address: text("address"),
    detailAddress: text("detailAddress"),
    water: text("water"),
    indoor: text("indoor"),
  };
}

export function parseEligibilityAnswers(answers: unknown[]): EligibilityPair[] {
  return answers.flatMap((item) => {
    if (!item || typeof item !== "object") return [];
    const row = item as Record<string, unknown>;
    if (typeof row.code !== "string") return [];
    if (row.answer !== "yes" && row.answer !== "no") return [];
    return [{ code: row.code, answer: row.answer }];
  });
}

export function parseEquipmentInput(item: unknown): EquipmentInput | null {
  if (!item || typeof item !== "object") return null;
  const row = item as Record<string, unknown>;
  if (typeof row.id !== "string" || typeof row.type !== "string") return null;
  return {
    id: row.id,
    type: row.type,
    typeCode: typeof row.typeCode === "string" ? row.typeCode : typeCodeForTitle(row.type),
    date: typeof row.date === "string" ? row.date : "",
    memo: typeof row.memo === "string" ? row.memo : "",
  };
}
