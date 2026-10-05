import { emptyFacilityInfo } from "@/data/playsafe/facility-registration";
import type { CompletedRegistration, EquipmentRow, FacilityManagerInfo } from "@/data/playsafe/types";

const STORAGE_KEY = "playsafe-facility-registration-v1";

type Eligibility = NonNullable<CompletedRegistration["eligibility"]>;

function toText(value: unknown): string {
  return typeof value === "string" ? value : "";
}

function toInformation(value: unknown): FacilityManagerInfo {
  const raw = (value ?? {}) as Record<string, unknown>;
  const info = { ...emptyFacilityInfo } as FacilityManagerInfo;
  for (const key of Object.keys(info) as (keyof FacilityManagerInfo)[]) info[key] = toText(raw[key]);
  return info;
}

function toRow(value: unknown): EquipmentRow {
  const raw = (value ?? {}) as Record<string, unknown>;
  return { id: toText(raw.id), type: toText(raw.type), date: toText(raw.date), memo: toText(raw.memo), photo: "" };
}

function toEligibility(value: unknown): Eligibility | undefined {
  if (!Array.isArray(value)) return undefined;
  return value.flatMap((item) => {
    const raw = (item ?? {}) as Record<string, unknown>;
    if (typeof raw.code !== "string" || (raw.answer !== "yes" && raw.answer !== "no")) return [];
    return [{ code: raw.code, answer: raw.answer }];
  });
}

/** Equipment photos are not part of this JSON; they live in IndexedDB keyed by equipment id. */
export function loadRegistration(): CompletedRegistration | null {
  try {
    const saved = JSON.parse(localStorage.getItem(STORAGE_KEY) || "null");
    if (!saved || !Array.isArray(saved.equipment)) return null;
    const registration: CompletedRegistration = {
      id: toText(saved.id) || undefined,
      information: toInformation(saved.information),
      eligibility: toEligibility(saved.eligibility),
      equipment: saved.equipment.map(toRow),
      completedAt: toText(saved.completedAt),
      consentAt: toText(saved.consentAt) || undefined,
    };
    const complete = registration.information.facilityName.trim() !== "" && registration.equipment.length > 0;
    return complete ? registration : null;
  } catch {
    return null;
  }
}

export function saveRegistration(registration: CompletedRegistration): boolean {
  const withoutPhotos = { ...registration, equipment: registration.equipment.map((row) => ({ ...row, photo: "" })) };
  try {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(withoutPhotos));
    return true;
  } catch {
    return false;
  }
}

export function clearRegistration(): void {
  try {
    localStorage.removeItem(STORAGE_KEY);
  } catch {
    // Storage may be blocked; nothing to clear.
  }
}
