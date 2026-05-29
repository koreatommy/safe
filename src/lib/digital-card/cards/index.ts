import type { DigitalCardDefinition } from "../types";
import { yeongilCard } from "./yeongil";
import { yujinCard } from "./yujin";

/** 새 명함 추가: cards/ 아래 파일 생성 후 이 배열에 등록 */
export const DIGITAL_CARDS: DigitalCardDefinition[] = [yujinCard, yeongilCard];
