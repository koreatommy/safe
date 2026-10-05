import type { CompletedRegistration } from "@/data/playsafe/types";
import { clearSnapshot } from "./checklistStorage";
import { blobToDataUrl, dataUrlToBlob } from "./dataUrl";
import { checklistPhotoStore, equipmentPhotoStore } from "./photoStore";
import { clearRegistration, loadRegistration, saveRegistration } from "./registrationStorage";

/** Saves facility info locally (photos to IndexedDB) until the assessment is registered. */
export async function saveRegistrationDraft(registration: CompletedRegistration): Promise<boolean> {
  try {
    await equipmentPhotoStore.clear();
    await Promise.all(
      registration.equipment.map(async (row) => {
        const blob = row.photo ? dataUrlToBlob(row.photo) : null;
        if (blob) await equipmentPhotoStore.put(row.id, blob);
      }),
    );
  } catch {
    return false;
  }
  return saveRegistration(registration);
}

/** Restores the local draft with equipment photos as data URLs. */
export async function loadRegistrationDraft(): Promise<CompletedRegistration | null> {
  const registration = loadRegistration();
  if (!registration) return null;
  const equipment = await Promise.all(
    registration.equipment.map(async (row) => {
      const blob = await equipmentPhotoStore.get(row.id).catch(() => undefined);
      return { ...row, photo: blob ? await blobToDataUrl(blob) : "" };
    }),
  );
  return { ...registration, equipment };
}

export async function clearAssessmentDraft(): Promise<void> {
  clearRegistration();
  clearSnapshot();
  await Promise.all([equipmentPhotoStore.clear(), checklistPhotoStore.clear()]).catch(() => undefined);
}
