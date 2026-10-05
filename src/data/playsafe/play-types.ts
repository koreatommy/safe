import type { PlayType } from "./types";

export const playTypes: PlayType[] = [
  { slug: "climb", title: "오르는놀이형", description: "양손을 활용하여 오르내리는 놀이" },
  { slug: "cross", title: "건너는놀이형", description: "손으로 몸을 지탱하며 건너는 놀이" },
  { slug: "swing", title: "그네놀이형", description: "벽 또는 천정에 매달려 타는 놀이" },
  { slug: "slide", title: "미끄럼놀이형", description: "신체를 이용해 미끄러지는 놀이" },
  { slug: "rock", title: "흔들놀이형", description: "몸을 기대거나 움직여 흔드는 놀이" },
  { slug: "water", title: "물놀이형", description: "신체를 담그거나 물놀이를 체험하는 놀이" },
  { slug: "etc", title: "기타놀이형", description: "볼풀장·놀이집 등 정적인 신체 놀이" },
  { slug: "combo", title: "조합형", description: "두 가지 이상의 놀이형태가 결합된 구조물" },
];
