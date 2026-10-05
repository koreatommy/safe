import type { CheckPhoto, CheckRecord } from "@/data/playsafe/types";

export type ChecklistRecordActions = {
  onChange: (index: number, patch: Partial<Omit<CheckRecord, "photos">>) => void;
  onAddPhoto: (index: number, photo: CheckPhoto) => void;
  onRemovePhoto: (index: number, id: string) => void;
};
