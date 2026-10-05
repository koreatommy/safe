import type { AssessmentWorkspace, RegistrationStatus } from "./types";

export type TargetFilter = "all" | "target" | "not_target";

export type RegistrationSearch = {
  keyword: string;
  target: TargetFilter;
};

export type AdminRegistrationRow = {
  id: string;
  status: RegistrationStatus;
  submitterName: string;
  submitterEmail: string;
  facilityNo: string;
  facilityName: string;
  managerName: string;
  place: string;
  address: string;
  allEligible: boolean;
  equipmentCount: number;
  createdAt: string;
  submittedAt: string | null;
};

export type AdminRegistrationPage = {
  registrations: AdminRegistrationRow[];
  total: number;
  page: number;
  pageSize: number;
};

export type AssessmentSearchField = "facility" | "assessor" | "submitter";

export type AssessmentSearch = {
  field: AssessmentSearchField;
  keyword: string;
  registrationId?: string;
};

export type AdminAssessmentRow = {
  id: string;
  registrationId: string;
  facilityNo: string;
  facilityName: string;
  submitterName: string;
  assessor: string;
  evalDate: string;
  submittedAt: string;
  riskItems: number;
};

export type AdminAssessmentPage = {
  assessments: AdminAssessmentRow[];
  total: number;
  page: number;
  pageSize: number;
};

export type AssessmentView = AssessmentWorkspace["assessment"];

export type AdminRegistrationDetail = {
  registration: AssessmentWorkspace["registration"] & {
    allEligible: boolean;
  };
  assessment: AssessmentView | null;
};
