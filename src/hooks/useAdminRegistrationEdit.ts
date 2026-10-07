"use client";

import { useEffect, useRef, useState } from "react";
import { MAX_FACILITY_PHOTOS, PLACE_ETC } from "@/data/playsafe/facility-registration";
import { playTypes } from "@/data/playsafe/play-types";
import type { FacilityManagerInfo } from "@/data/playsafe/types";
import type { AdminRegistrationDetail } from "@/lib/playsafe-workflow/adminTypes";
import {
  draftFromDetail,
  revokeDraftUrls,
  type AdminEditDraft,
  type EditEquipmentRow,
} from "@/lib/playsafe-workflow/client/adminEditDraft";
import { prepareAdminChecklistPhoto, prepareAdminPhoto } from "@/lib/playsafe-workflow/client/prepareAdminPhoto";
import { MAX_PHOTOS_PER_ITEM } from "@/lib/playsafe-workflow/constants";
import type { AnswerStatus } from "@/lib/playsafe-workflow/types";
import { saveAdminEdit } from "@/lib/playsafe-workflow/client/saveAdminEdit";
import { MAX_ADMIN_EQUIPMENT } from "@/lib/playsafe-workflow/validation/adminUpdate";

const messageOf = (error: unknown) => (error instanceof Error ? error.message : "사진을 읽지 못했습니다.");

export function useAdminRegistrationEdit(detail: AdminRegistrationDetail) {
  const [draft, setDraft] = useState<AdminEditDraft>(() => draftFromDetail(detail));
  const [photoError, setPhotoError] = useState<string | null>(null);
  const [saveError, setSaveError] = useState<string | null>(null);
  const [busy, setBusy] = useState(false);
  const [saving, setSaving] = useState(false);
  const draftRef = useRef(draft);
  draftRef.current = draft;

  useEffect(() => () => revokeDraftUrls(draftRef.current), []);

  const setInformation = <K extends keyof FacilityManagerInfo>(field: K, value: FacilityManagerInfo[K]) => {
    setDraft((current) => {
      const information = { ...current.information, [field]: value };
      if (field === "place" && value !== PLACE_ETC) information.placeEtc = "";
      return { ...current, information };
    });
  };

  const addFacilityPhotos = async (files: File[]) => {
    const room = MAX_FACILITY_PHOTOS - draftRef.current.facilityPhotos.length;
    if (room <= 0) {
      setPhotoError(`시설 전경사진은 최대 ${MAX_FACILITY_PHOTOS}장까지 등록할 수 있습니다.`);
      return;
    }
    const accepted = files.slice(0, room);
    setPhotoError(
      files.length > accepted.length ? `시설 전경사진은 최대 ${MAX_FACILITY_PHOTOS}장까지 등록할 수 있습니다.` : null,
    );
    const added: Extract<AdminEditDraft["facilityPhotos"][number], { kind: "new" }>[] = [];
    setBusy(true);
    try {
      for (const file of accepted) {
        const blob = await prepareAdminPhoto(file);
        added.push({ kind: "new", id: crypto.randomUUID(), blob, previewUrl: URL.createObjectURL(blob) });
      }
      setDraft((current) => ({ ...current, facilityPhotos: [...current.facilityPhotos, ...added] }));
    } catch (error) {
      added.forEach((photo) => URL.revokeObjectURL(photo.previewUrl));
      setPhotoError(messageOf(error));
    } finally {
      setBusy(false);
    }
  };

  const removeFacilityPhoto = (id: string) => {
    setPhotoError(null);
    setDraft((current) => {
      const photo = current.facilityPhotos.find((item) => item.id === id);
      if (photo?.kind === "new") URL.revokeObjectURL(photo.previewUrl);
      return { ...current, facilityPhotos: current.facilityPhotos.filter((item) => item.id !== id) };
    });
  };

  const addEquipment = () => {
    setDraft((current) => {
      if (current.equipment.length >= MAX_ADMIN_EQUIPMENT) return current;
      const row: EditEquipmentRow = {
        id: crypto.randomUUID(),
        typeCode: playTypes[0]?.slug ?? "etc",
        date: "",
        memo: "",
        photo: { kind: "none" },
      };
      return { ...current, equipment: [...current.equipment, row] };
    });
  };

  const removeEquipment = (id: string) => {
    setDraft((current) => {
      const row = current.equipment.find((item) => item.id === id);
      if (row?.photo.kind === "new") URL.revokeObjectURL(row.photo.previewUrl);
      return { ...current, equipment: current.equipment.filter((item) => item.id !== id) };
    });
  };

  const changeEquipment = (id: string, patch: Partial<Pick<EditEquipmentRow, "typeCode" | "date" | "memo">>) => {
    setDraft((current) => ({
      ...current,
      equipment: current.equipment.map((row) => (row.id === id ? { ...row, ...patch } : row)),
    }));
  };

  const pickEquipmentPhoto = async (id: string, file: File) => {
    setBusy(true);
    setPhotoError(null);
    try {
      const blob = await prepareAdminPhoto(file);
      const previewUrl = URL.createObjectURL(blob);
      setDraft((current) => ({
        ...current,
        equipment: current.equipment.map((row) => {
          if (row.id !== id) return row;
          if (row.photo.kind === "new") URL.revokeObjectURL(row.photo.previewUrl);
          return { ...row, photo: { kind: "new", blob, previewUrl } };
        }),
      }));
    } catch (error) {
      setPhotoError(messageOf(error));
    } finally {
      setBusy(false);
    }
  };

  const clearEquipmentPhoto = (id: string) => {
    setDraft((current) => ({
      ...current,
      equipment: current.equipment.map((row) => {
        if (row.id !== id) return row;
        if (row.photo.kind === "new") URL.revokeObjectURL(row.photo.previewUrl);
        return { ...row, photo: { kind: "none" } };
      }),
    }));
  };

  const setAssessor = (assessor: string) => {
    setDraft((current) => (current.assessment ? { ...current, assessment: { ...current.assessment, assessor } } : current));
  };

  const setEvalDate = (evalDate: string) => {
    setDraft((current) => (current.assessment ? { ...current, assessment: { ...current.assessment, evalDate } } : current));
  };

  const setAnswerStatus = (itemCode: string, status: AnswerStatus) => {
    setDraft((current) => {
      if (!current.assessment) return current;
      return {
        ...current,
        assessment: {
          ...current.assessment,
          answers: current.assessment.answers.map((answer) => {
            if (answer.itemCode !== itemCode) return answer;
            if (status !== "risk_found") {
              answer.photos.forEach((photo) => {
                if (photo.kind === "new") URL.revokeObjectURL(photo.previewUrl);
              });
              return { ...answer, status, photos: [] };
            }
            return { ...answer, status };
          }),
        },
      };
    });
  };

  const setAnswerMemo = (itemCode: string, memo: string) => {
    setDraft((current) => {
      if (!current.assessment) return current;
      return {
        ...current,
        assessment: {
          ...current.assessment,
          answers: current.assessment.answers.map((answer) => (answer.itemCode === itemCode ? { ...answer, memo } : answer)),
        },
      };
    });
  };

  const addRiskPhotos = async (itemCode: string, files: File[]) => {
    const answer = draftRef.current.assessment?.answers.find((row) => row.itemCode === itemCode);
    const room = MAX_PHOTOS_PER_ITEM - (answer?.photos.length ?? 0);
    if (room <= 0) {
      setPhotoError(`위험요소 사진은 항목당 ${MAX_PHOTOS_PER_ITEM}장까지 등록할 수 있습니다.`);
      return;
    }
    const accepted = files.slice(0, room);
    setPhotoError(files.length > accepted.length ? `위험요소 사진은 항목당 ${MAX_PHOTOS_PER_ITEM}장까지 등록할 수 있습니다.` : null);
    const added: Extract<AdminEditDraft["facilityPhotos"][number], { kind: "new" }>[] = [];
    setBusy(true);
    try {
      for (const file of accepted) {
        const blob = await prepareAdminChecklistPhoto(file);
        added.push({ kind: "new", id: crypto.randomUUID(), blob, previewUrl: URL.createObjectURL(blob) });
      }
      setDraft((current) => {
        if (!current.assessment) return current;
        return {
          ...current,
          assessment: {
            ...current.assessment,
            answers: current.assessment.answers.map((row) =>
              row.itemCode === itemCode ? { ...row, photos: [...row.photos, ...added].slice(0, MAX_PHOTOS_PER_ITEM) } : row,
            ),
          },
        };
      });
    } catch (error) {
      added.forEach((photo) => URL.revokeObjectURL(photo.previewUrl));
      setPhotoError(messageOf(error));
    } finally {
      setBusy(false);
    }
  };

  const removeRiskPhoto = (itemCode: string, photoId: string) => {
    setDraft((current) => {
      if (!current.assessment) return current;
      return {
        ...current,
        assessment: {
          ...current.assessment,
          answers: current.assessment.answers.map((answer) => {
            if (answer.itemCode !== itemCode) return answer;
            const photo = answer.photos.find((item) => item.id === photoId);
            if (photo?.kind === "new") URL.revokeObjectURL(photo.previewUrl);
            return { ...answer, photos: answer.photos.filter((item) => item.id !== photoId) };
          }),
        },
      };
    });
  };

  const save = async () => {
    setSaving(true);
    setSaveError(null);
    try {
      await saveAdminEdit(detail.registration.id, draftRef.current);
      return true;
    } catch (error) {
      setSaveError(error instanceof Error ? error.message : "수정하지 못했습니다.");
      return false;
    } finally {
      setSaving(false);
    }
  };

  return {
    draft,
    photoError,
    saveError,
    busy,
    saving,
    setSubmitterName: (submitterName: string) => setDraft((current) => ({ ...current, submitterName })),
    setSubmitterEmail: (submitterEmail: string) => setDraft((current) => ({ ...current, submitterEmail })),
    setInformation,
    addFacilityPhotos,
    removeFacilityPhoto,
    addEquipment,
    removeEquipment,
    changeEquipment,
    pickEquipmentPhoto,
    clearEquipmentPhoto,
    setAssessor,
    setEvalDate,
    setAnswerStatus,
    setAnswerMemo,
    addRiskPhotos,
    removeRiskPhoto,
    save,
  };
}
