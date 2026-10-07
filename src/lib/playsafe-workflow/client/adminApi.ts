import type {
  AdminAssessmentPage,
  AdminRegistrationDetail,
  AdminRegistrationPage,
  AdminRegistrationUpdate,
  AdminUploadRequest,
  AssessmentSearch,
  RegistrationSearch,
} from "../adminTypes";
import type { SubmissionUploads } from "../submissionTypes";

const BASE = "/api/admin/playsafe";

async function adminJson<T>(path: string, init?: RequestInit): Promise<T> {
  const response = await fetch(`${BASE}${path}`, {
    ...init,
    headers: { "Content-Type": "application/json", ...init?.headers },
  });
  const data = (await response.json().catch(() => ({}))) as T & { error?: string };
  if (!response.ok) throw new Error(data.error ?? "요청에 실패했습니다.");
  return data;
}

export function fetchAdminRegistrations({ keyword, target }: RegistrationSearch, page: number) {
  const params = new URLSearchParams({ target, page: String(page) });
  if (keyword) params.set("q", keyword);
  return adminJson<AdminRegistrationPage>(`/registrations?${params}`);
}

export function fetchAdminAssessments({ field, keyword, registrationId }: AssessmentSearch, page: number) {
  const params = new URLSearchParams({ field, page: String(page) });
  if (keyword) params.set("q", keyword);
  if (registrationId) params.set("registrationId", registrationId);
  return adminJson<AdminAssessmentPage>(`/assessments?${params}`);
}

export function fetchAdminDetail(registrationId: string) {
  return adminJson<AdminRegistrationDetail>(`/registrations/${registrationId}`);
}

export function deleteAdminRegistration(registrationId: string) {
  return adminJson<{ ok: true }>(`/registrations/${registrationId}`, { method: "DELETE" });
}

export function fetchAdminUploadUrls(registrationId: string, body: AdminUploadRequest) {
  return adminJson<SubmissionUploads>(`/registrations/${registrationId}/upload-urls`, {
    method: "POST",
    body: JSON.stringify(body),
  });
}

export function updateAdminRegistration(registrationId: string, body: AdminRegistrationUpdate) {
  return adminJson<{ ok: true }>(`/registrations/${registrationId}`, {
    method: "PATCH",
    body: JSON.stringify(body),
  });
}
