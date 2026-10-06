import type { CompletedRegistration } from "@/data/playsafe/types";
import { clearSnapshot } from "./checklistStorage";
import { blobToDataUrl, dataUrlToBlob } from "./dataUrl";
import { checklistPhotoStore, equipmentPhotoStore, facilityPhotoStore } from "./photoStore";
import { clearRegistration, loadRegistration, saveRegistration } from "./registrationStorage";

type PhotoStore = typeof equipmentPhotoStore;
type WithPhoto = { id: string; photo: string };

async function storePhotos(store: PhotoStore, rows: readonly WithPhoto[]): Promise<void> {
  await store.clear();
  await Promise.all(
    rows.map(async (row) => {
      const blob = row.photo ? dataUrlToBlob(row.photo) : null;
      if (blob) await store.put(row.id, blob);
    }),
  );
}

async function restorePhotos<T extends WithPhoto>(store: PhotoStore, rows: readonly T[]): Promise<T[]> {
  return Promise.all(
    rows.map(async (row) => {
      const blob = await store.get(row.id).catch(() => undefined);
      return { ...row, photo: blob ? await blobToDataUrl(blob) : "" };
    }),
  );
}

/** Saves facility info locally (photos to IndexedDB) until the assessment is registered. */
export async function saveRegistrationDraft(registration: CompletedRegistration): Promise<boolean> {
  try {
    await storePhotos(equipmentPhotoStore, registration.equipment);
    await storePhotos(facilityPhotoStore, registration.facilityPhotos ?? []);
  } catch {
    return false;
  }
  return saveRegistration(registration);
}

/** Restores the local draft with equipment and facility photos as data URLs. */
export async function loadRegistrationDraft(): Promise<CompletedRegistration | null> {
  const registration = loadRegistration();
  if (!registration) return null;
  const [equipment, facilityPhotos] = await Promise.all([
    restorePhotos(equipmentPhotoStore, registration.equipment),
    restorePhotos(facilityPhotoStore, registration.facilityPhotos ?? []),
  ]);
  return { ...registration, equipment, facilityPhotos: facilityPhotos.filter((row) => row.photo) };
}

export async function clearAssessmentDraft(): Promise<void> {
  clearRegistration();
  clearSnapshot();
  await Promise.all([equipmentPhotoStore.clear(), checklistPhotoStore.clear(), facilityPhotoStore.clear()]).catch(
    () => undefined,
  );
}
