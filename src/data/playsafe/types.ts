export type QuizQuestion = {
  code: string;
  question: string;
  hint: string;
  excludedReason: string;
};

export type FailedCriterion = QuizQuestion & { number: number };

export type RiskType = {
  name: string;
  title: string;
  summary: string;
  actions: string[];
  sourcePages: number[];
};

export type CheckItem = {
  code: string;
  category: string;
  label: string;
};

export type CheckStatus = "미확인" | "위험요소 있음" | "위험요소 없음" | "해당 없음";

/** Metadata only — the image Blob lives in IndexedDB (later Supabase Storage) under `id`. */
export type CheckPhoto = {
  id: string;
  bytes: number;
  type: string;
};

export type CheckRecord = {
  status: CheckStatus;
  memo: string;
  photos: CheckPhoto[];
};

export type Facility = {
  image: string;
  alt: string;
  micro: string;
  title: string;
  description: string;
};

export type PlayType = {
  slug: string;
  title: string;
  description: string;
};

export type FaqItem = {
  question: string;
  answer: string;
  /** `label` must appear verbatim in `answer`; that text is rendered as an external link. */
  link?: { label: string; href: string };
};

export type LawItem = {
  label: string;
  title: string;
  description: string;
};

export type TargetScope = {
  title: string;
  description: string;
};

export type ProcessStep = {
  title: string;
  description: string;
  tag: string;
};

export type ScheduleItem = {
  title: string;
  description: string;
};

export type ProcedureRow = {
  stage: string;
  content: string;
  note: string;
  badge?: string;
};

export type FacilityManagerInfo = {
  managerName: string;
  phone: string;
  email: string;
  facilityName: string;
  facilityNo: string;
  place: string;
  placeEtc: string;
  postcode: string;
  address: string;
  detailAddress: string;
  water: string;
  indoor: string;
};

export type EligibilityAnswer = "yes" | "no";

export type EquipmentDraft = {
  type: string;
  quantity: number | "";
  date: string;
  memo: string;
  photo: string;
  photoName: string;
  photoBusy: boolean;
  photoError: string;
};

export type EquipmentRow = {
  id: string;
  type: string;
  date: string;
  memo: string;
  photo: string;
};

export type CompletedRegistration = {
  id?: string;
  information: FacilityManagerInfo;
  eligibility?: { code: string; answer: EligibilityAnswer }[];
  equipment: EquipmentRow[];
  completedAt: string;
  consentAt?: string;
};

export type RegistrationStep = "step1" | "step2" | "step3";

export type RegistrationProblem = {
  message: string;
  step: RegistrationStep;
};
