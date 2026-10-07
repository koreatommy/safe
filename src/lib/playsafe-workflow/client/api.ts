import type { SubmissionInput, SubmissionResult, SubmissionUploads } from "../submissionTypes";
import type { ApplicationInput, ApplicationResult } from "../types";
import { submitterHeaders } from "./submitterStore";

async function requestJson<T>(input: RequestInfo, init?: RequestInit): Promise<T> {
  const response = await fetch(input, {
    ...init,
    headers: { "Content-Type": "application/json", ...submitterHeaders(), ...init?.headers },
  });
  const data = (await response.json().catch(() => ({}))) as T & { error?: string };
  if (!response.ok) throw new Error(data.error ?? "요청에 실패했습니다.");
  return data;
}

export function postApplication(input: ApplicationInput) {
  return requestJson<ApplicationResult>("/api/playsafe/applications", {
    method: "POST",
    body: JSON.stringify(input),
  });
}

export function requestApplicationUploads(input: ApplicationInput) {
  return requestJson<SubmissionUploads>("/api/playsafe/applications/upload-urls", {
    method: "POST",
    body: JSON.stringify(input),
  });
}

export function requestSubmissionUploads(input: SubmissionInput) {
  return requestJson<SubmissionUploads>("/api/playsafe/submissions/upload-urls", {
    method: "POST",
    body: JSON.stringify(input),
  });
}

export function submitRegistration(input: SubmissionInput) {
  return requestJson<SubmissionResult>("/api/playsafe/submissions", {
    method: "POST",
    body: JSON.stringify(input),
  });
}
