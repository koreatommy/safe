import type { CheckItem } from "@/data/playsafe/types";

export type ChecklistGroupData = {
  category: string;
  indices: number[];
};

/** Groups item indices by category, preserving first-appearance order. */
export function groupCheckIndices(items: readonly CheckItem[]): ChecklistGroupData[] {
  const groups = new Map<string, number[]>();
  items.forEach((item, index) => {
    const indices = groups.get(item.category) ?? [];
    indices.push(index);
    groups.set(item.category, indices);
  });
  return [...groups].map(([category, indices]) => ({ category, indices }));
}
