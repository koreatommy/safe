import { MAX_PHOTOS_PER_ITEM } from "@/data/playsafe/checklist-photos";
import { checkItems, checkStatuses, legacyStatusMap, UNRECORDED_STATUS } from "@/data/playsafe/checks";
import type { CheckPhoto, CheckRecord, CheckStatus } from "@/data/playsafe/types";

const STORAGE_KEY = "playsafe-guideline-v1";

export type ChecklistSnapshot = {
  facilityName: string;
  assessor: string;
  evalDate: string;
  records: CheckRecord[];
};

export function createEmptySnapshot(): ChecklistSnapshot {
  return {
    facilityName: "",
    assessor: "",
    evalDate: "",
    records: checkItems.map(() => ({ status: UNRECORDED_STATUS, memo: "", photos: [] })),
  };
}

function toStatus(value: unknown): CheckStatus {
  if (checkStatuses.includes(value as CheckStatus)) return value as CheckStatus;
  return (typeof value === "string" && legacyStatusMap[value]) || UNRECORDED_STATUS;
}

function isPhoto(value: unknown): value is CheckPhoto {
  const raw = (value ?? {}) as Partial<Record<keyof CheckPhoto, unknown>>;
  return typeof raw.id === "string" && typeof raw.bytes === "number" && typeof raw.type === "string";
}

function toPhotos(value: unknown): CheckPhoto[] {
  return Array.isArray(value) ? value.filter(isPhoto).slice(0, MAX_PHOTOS_PER_ITEM) : [];
}

function toRecord(value: unknown): CheckRecord {
  const raw = (value ?? {}) as Partial<Record<keyof CheckRecord, unknown>>;
  return {
    status: toStatus(raw.status),
    memo: typeof raw.memo === "string" ? raw.memo : "",
    photos: toPhotos(raw.photos),
  };
}

function toText(value: unknown): string {
  return typeof value === "string" ? value : "";
}

export function loadSnapshot(): ChecklistSnapshot {
  try {
    const saved = JSON.parse(localStorage.getItem(STORAGE_KEY) || "{}") ?? {};
    const records = Array.isArray(saved.records) ? saved.records : [];
    return {
      facilityName: toText(saved.facilityName),
      assessor: toText(saved.assessor),
      evalDate: toText(saved.evalDate),
      records: checkItems.map((_, i) => toRecord(records[i])),
    };
  } catch {
    return createEmptySnapshot();
  }
}

/** Returns false when the browser blocks storage (private mode, quota, etc.). */
export function saveSnapshot(snapshot: ChecklistSnapshot): boolean {
  try {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(snapshot));
    return true;
  } catch {
    return false;
  }
}

export function clearSnapshot(): void {
  try {
    localStorage.removeItem(STORAGE_KEY);
  } catch {
    // Storage may be blocked; nothing to clear.
  }
}
