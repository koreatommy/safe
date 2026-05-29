import { CARD_ORIGIN } from "./config";
import { DIGITAL_CARDS } from "./cards";
import type { DigitalCardDefinition } from "./types";

const cardsBySlug = new Map(DIGITAL_CARDS.map((card) => [card.slug, card]));

export function listCards(): DigitalCardDefinition[] {
  return DIGITAL_CARDS;
}

export function getCard(slug: string): DigitalCardDefinition | undefined {
  return cardsBySlug.get(slug);
}

export function getPublicUrl(slug: string): string {
  return `${CARD_ORIGIN}/card/${slug}`;
}
