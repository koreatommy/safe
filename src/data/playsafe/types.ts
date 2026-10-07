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

/** `unregistered`는 신종유사 놀이형태에 속하지 않고 별도 관리되는 기구다. */
export type PlayTypeGroup = "new_similar" | "unregistered";

export type PlayType = {
  slug: string;
  title: string;
  description: string;
  group: PlayTypeGroup;
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

/** 등록수량 1개당 사진 칸 1개. `photo`는 압축된 data URL이다. */
export type EquipmentDraftPhoto = {
  photo: string;
  name: string;
  busy: boolean;
  error: string;
};

export type EquipmentDraft = {
  type: string;
  quantity: number | "";
  date: string;
  memo: string;
  /** 길이는 항상 등록수량과 같다. */
  photos: EquipmentDraftPhoto[];
};

/** 사진 칸은 칸 단위 갱신으로만 바꾼다. */
export type EquipmentDraftField = Exclude<keyof EquipmentDraft, "type" | "photos">;

export type EquipmentDraftChange = <K extends EquipmentDraftField>(
  type: string,
  field: K,
  value: EquipmentDraft[K],
) => void;

export type EquipmentDraftPhotoChange = (type: string, index: number, patch: Partial<EquipmentDraftPhoto>) => void;

export type EquipmentRow = {
  id: string;
  type: string;
  date: string;
  memo: string;
  photo: string;
};

/** 시설 전경사진. `photo`는 압축된 data URL이며, 임시 저장 시 이미지는 IndexedDB에 `id`로 보관한다. */
export type FacilityPhoto = {
  id: string;
  photo: string;
};

export type CompletedRegistration = {
  id?: string;
  information: FacilityManagerInfo;
  facilityPhotos?: FacilityPhoto[];
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
