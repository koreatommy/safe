"use client";

import { useEffect, useState } from "react";
import { RISK_FOUND_STATUS } from "@/data/playsafe/checks";
import type { CheckPhoto, CheckRecord, CheckStatus } from "@/data/playsafe/types";
import { loadSnapshot, saveSnapshot, type ChecklistSnapshot } from "@/lib/playsafe/checklistStorage";
import { checklistPhotoStore } from "@/lib/playsafe/photoStore";

type InfoField = "assessor" | "evalDate";

const photoIds = (records: CheckRecord[]) => records.flatMap((r) => r.photos.map((p) => p.id));

export function useChecklistState(facilityName: string) {
  const [snapshot, setSnapshot] = useState<ChecklistSnapshot>(() => ({ ...loadSnapshot(), facilityName }));
  const [storageAvailable, setStorageAvailable] = useState(true);

  useEffect(() => {
    // eslint-disable-next-line react-hooks/set-state-in-effect -- storage availability is only known after writing
    if (!saveSnapshot(snapshot)) setStorageAvailable(false);
  }, [snapshot]);

  const mapRecord = (index: number, update: (record: CheckRecord) => CheckRecord) =>
    setSnapshot((prev) => ({
      ...prev,
      records: prev.records.map((record, i) => (i === index ? update(record) : record)),
    }));

  const setInfo = (field: InfoField, value: string) => setSnapshot((prev) => ({ ...prev, [field]: value }));

  const updateRecord = (index: number, patch: Partial<Omit<CheckRecord, "photos">>) => {
    const leavesRisk = patch.status !== undefined && patch.status !== RISK_FOUND_STATUS;
    if (leavesRisk) void checklistPhotoStore.remove(photoIds([snapshot.records[index]])).catch(() => undefined);
    mapRecord(index, (record) => ({ ...record, ...patch, photos: leavesRisk ? [] : record.photos }));
  };

  const addPhoto = (index: number, photo: CheckPhoto) =>
    mapRecord(index, (record) => ({ ...record, photos: [...record.photos, photo] }));

  const removePhoto = (index: number, id: string) => {
    void checklistPhotoStore.remove([id]).catch(() => undefined);
    mapRecord(index, (record) => ({ ...record, photos: record.photos.filter((p) => p.id !== id) }));
  };

  const setAllStatuses = (status: CheckStatus) => {
    void checklistPhotoStore.remove(photoIds(snapshot.records)).catch(() => undefined);
    setSnapshot((prev) => ({ ...prev, records: prev.records.map((record) => ({ ...record, status, photos: [] })) }));
  };

  return { snapshot, storageAvailable, setInfo, updateRecord, addPhoto, removePhoto, setAllStatuses };
}
