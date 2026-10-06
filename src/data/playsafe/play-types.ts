import type { PlayType } from "./types";

export const playTypes: PlayType[] = [
  { slug: "climb", title: "오르는놀이형", description: "양손을 활용하여 오르내리는 놀이", group: "new_similar" },
  { slug: "cross", title: "건너는놀이형", description: "손으로 몸을 지탱하며 건너는 놀이", group: "new_similar" },
  { slug: "swing", title: "그네놀이형", description: "벽 또는 천정에 매달려 타는 놀이", group: "new_similar" },
  { slug: "slide", title: "미끄럼놀이형", description: "신체를 이용해 미끄러지는 놀이", group: "new_similar" },
  { slug: "rock", title: "흔들놀이형", description: "몸을 기대거나 움직여 흔드는 놀이", group: "new_similar" },
  { slug: "water", title: "물놀이형", description: "신체를 담그거나 물놀이를 체험하는 놀이", group: "new_similar" },
  { slug: "etc", title: "기타놀이형", description: "볼풀장·놀이집 등 정적인 신체 놀이", group: "new_similar" },
  { slug: "combo", title: "조합형", description: "두 가지 이상의 놀이형태가 결합된 구조물", group: "new_similar" },
  {
    slug: "unregistered",
    title: "미등록 놀이기구",
    description: "안전인증서가 없는 제품 (신종유사 유형과 별도 관리)",
    group: "unregistered",
  },
];

export const newSimilarPlayTypes = playTypes.filter((type) => type.group === "new_similar");

export const PLAY_TYPE_SLUGS = new Set(playTypes.map((type) => type.slug));

export function isUnregisteredTypeCode(code: string): boolean {
  return playTypes.some((type) => type.slug === code && type.group === "unregistered");
}
