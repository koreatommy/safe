"use client";

import { useMemo, useState } from "react";
import { emptyFacilityInfo } from "@/data/playsafe/facility-registration";
import { quizQuestions } from "@/data/playsafe/quiz";
import type {
  EligibilityAnswer,
  EquipmentDraft,
  EquipmentDraftField,
  EquipmentDraftPhoto,
  EquipmentRow,
  FacilityManagerInfo,
  FacilityPhoto,
  FailedCriterion,
} from "@/data/playsafe/types";
import { patchDraftPhoto, resizeDraftPhotos } from "@/lib/playsafe/equipmentDraftPhotos";
import {
  buildExportPayload,
  buildRows,
  createEquipmentDraft,
  downloadRegistrationJson,
  photoSlotCount,
  registrationProblem,
  totalQuantity,
  validateDrafts,
} from "@/lib/playsafe/facilityRegistration";
import { saveRegistrationDraft } from "@/lib/playsafe/assessmentDraft";
import type { Submitter } from "@/lib/playsafe-workflow/types";
import { useSubmitterDraft } from "./useSubmitterDraft";

const defaultAnswers = (): EligibilityAnswer[] => quizQuestions.map(() => "yes");

export function useFacilityRegistration() {
  const submitterDraft = useSubmitterDraft();
  const [registrationId, setRegistrationId] = useState<string | undefined>();
  const [consentAt, setConsentAt] = useState<string | null>(null);
  const [info, setInfo] = useState<FacilityManagerInfo>({ ...emptyFacilityInfo });
  const [facilityPhotos, setFacilityPhotos] = useState<FacilityPhoto[]>([]);
  const [answers, setAnswers] = useState<EligibilityAnswer[]>(defaultAnswers);
  const [rows, setRows] = useState<EquipmentRow[]>([]);
  const [sequence, setSequence] = useState(0);
  const [drafts, setDrafts] = useState<Record<string, EquipmentDraft>>({});
  const [selectedTypes, setSelectedTypes] = useState<string[]>([]);
  const [addPanelOpen, setAddPanelOpen] = useState(false);

  const activeDrafts = useMemo(
    () => selectedTypes.map((type) => drafts[type]).filter(Boolean),
    [drafts, selectedTypes],
  );

  const draftProblem = validateDrafts(activeDrafts);
  const draftTotal = totalQuantity(activeDrafts);

  const updateInfo = <K extends keyof FacilityManagerInfo>(field: K, value: FacilityManagerInfo[K]) => {
    setInfo((current) => ({ ...current, [field]: value }));
  };

  const closeAddPanel = () => {
    setSelectedTypes([]);
    setDrafts({});
    setAddPanelOpen(false);
  };

  const setAnswer = (index: number, value: EligibilityAnswer) => {
    setAnswers((current) => current.map((answer, i) => (i === index ? value : answer)));
    if (value === "no") closeAddPanel();
  };

  const failedCriteria: FailedCriterion[] = quizQuestions.flatMap((question, index) =>
    answers[index] === "no" ? [{ ...question, number: index + 1 }] : [],
  );
  const allEligible = failedCriteria.length === 0;

  const toggleType = (type: string, checked: boolean) => {
    if (checked) {
      setSelectedTypes((current) => (current.includes(type) ? current : [...current, type]));
      setDrafts((current) => (current[type] ? current : { ...current, [type]: createEquipmentDraft(type) }));
      return true;
    }

    setSelectedTypes((current) => current.filter((item) => item !== type));
    return true;
  };

  const updateDraft = <K extends EquipmentDraftField>(type: string, field: K, value: EquipmentDraft[K]) => {
    setDrafts((current) => {
      const draft = current[type] ?? createEquipmentDraft(type);
      const next = { ...draft, [field]: value };
      if (field === "quantity") next.photos = resizeDraftPhotos(draft.photos, photoSlotCount(next.quantity));
      return { ...current, [type]: next };
    });
  };

  const updateDraftPhoto = (type: string, index: number, patch: Partial<EquipmentDraftPhoto>) => {
    setDrafts((current) => {
      const draft = current[type];
      if (!draft) return current;
      return { ...current, [type]: { ...draft, photos: patchDraftPhoto(draft.photos, index, patch) } };
    });
  };

  const saveDrafts = () => {
    if (draftProblem) return { ok: false as const, count: 0 };
    const batch = buildRows(activeDrafts, sequence);
    if (batch.length !== totalQuantity(activeDrafts)) return { ok: false as const, count: 0 };
    setRows((current) => [...current, ...batch]);
    setSequence((current) => current + batch.length);
    closeAddPanel();
    return { ok: true as const, count: batch.length };
  };

  const removeRow = (id: string) => {
    setRows((current) => current.filter((row) => row.id !== id));
  };

  const exportJson = () => {
    const payload = buildExportPayload(
      info,
      answers.map((answer) => (answer === "yes" ? "네" : "아니요")),
      rows,
    );
    downloadRegistrationJson(payload);
  };

  const completionProblem = registrationProblem(info, allEligible, rows);

  const hydrate = (payload: {
    id?: string;
    submitter?: Submitter;
    consentAt: string | null;
    information: FacilityManagerInfo;
    facilityPhotos: FacilityPhoto[];
    answers: EligibilityAnswer[];
    equipment: EquipmentRow[];
  }) => {
    setRegistrationId(payload.id);
    if (payload.submitter) submitterDraft.setSubmitter(payload.submitter);
    setConsentAt(payload.consentAt);
    setInfo(payload.information);
    setFacilityPhotos(payload.facilityPhotos);
    setAnswers(payload.answers.length === quizQuestions.length ? payload.answers : defaultAnswers());
    setRows(payload.equipment);
  };

  /** 입력자 정보는 유지하고 시설·판단·기구 입력을 처음 상태로 되돌린다. */
  const reset = () => {
    setRegistrationId(undefined);
    setConsentAt(null);
    setInfo({ ...emptyFacilityInfo });
    setFacilityPhotos([]);
    setAnswers(defaultAnswers());
    setRows([]);
    setSequence(0);
    closeAddPanel();
  };

  const saveForAssessment = () =>
    saveRegistrationDraft({
      id: registrationId,
      information: info,
      facilityPhotos,
      eligibility: quizQuestions.map((question, index) => ({ code: question.code, answer: answers[index] })),
      equipment: rows,
      completedAt: new Date().toISOString(),
      consentAt: consentAt ?? undefined,
    });

  return {
    submitter: submitterDraft.submitter,
    updateSubmitter: submitterDraft.updateSubmitter,
    registrationId,
    setRegistrationId,
    consentAt,
    setConsentAt,
    hydrate,
    reset,
    eligibilityCodes: quizQuestions.map((question) => question.code),
    info,
    updateInfo,
    facilityPhotos,
    setFacilityPhotos,
    answers,
    setAnswer,
    allEligible,
    failedCriteria,
    rows,
    removeRow,
    addPanelOpen,
    openAddPanel: () => setAddPanelOpen(true),
    closeAddPanel,
    selectedTypes,
    toggleType,
    drafts,
    updateDraft,
    updateDraftPhoto,
    activeDrafts,
    draftProblem,
    draftTotal,
    saveDrafts,
    exportJson,
    completionProblem,
    saveForAssessment,
  };
}
