"use client";

import { useMemo, useState } from "react";
import { emptyFacilityInfo } from "@/data/playsafe/facility-registration";
import { quizQuestions } from "@/data/playsafe/quiz";
import type {
  EligibilityAnswer,
  EquipmentDraft,
  EquipmentRow,
  FacilityManagerInfo,
  FailedCriterion,
} from "@/data/playsafe/types";
import {
  buildExportPayload,
  buildRows,
  createEquipmentDraft,
  downloadRegistrationJson,
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

  const updateDraft = <K extends keyof EquipmentDraft>(type: string, field: K, value: EquipmentDraft[K]) => {
    setDrafts((current) => {
      const draft = current[type] ?? createEquipmentDraft(type);
      return { ...current, [type]: { ...draft, [field]: value } };
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
    answers: EligibilityAnswer[];
    equipment: EquipmentRow[];
  }) => {
    setRegistrationId(payload.id);
    if (payload.submitter) submitterDraft.setSubmitter(payload.submitter);
    setConsentAt(payload.consentAt);
    setInfo(payload.information);
    setAnswers(payload.answers.length === quizQuestions.length ? payload.answers : defaultAnswers());
    setRows(payload.equipment);
  };

  const saveForAssessment = () =>
    saveRegistrationDraft({
      id: registrationId,
      information: info,
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
    eligibilityCodes: quizQuestions.map((question) => question.code),
    info,
    updateInfo,
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
    activeDrafts,
    draftProblem,
    draftTotal,
    saveDrafts,
    exportJson,
    completionProblem,
    saveForAssessment,
  };
}
