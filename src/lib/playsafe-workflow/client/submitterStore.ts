import { SUBMITTER_HEADERS } from "../constants";
import type { Submitter } from "../types";
import { normalizeSubmitter, validateSubmitter } from "../validation/submitter";

const STORAGE_KEY = "playsafe:submitter";

export function loadSubmitter(): Submitter | null {
  if (typeof window === "undefined") return null;
  try {
    const raw = JSON.parse(window.localStorage.getItem(STORAGE_KEY) ?? "null") as Partial<Submitter> | null;
    if (typeof raw?.name !== "string" || typeof raw?.email !== "string") return null;
    const submitter = normalizeSubmitter({ name: raw.name, email: raw.email });
    return validateSubmitter(submitter) ? null : submitter;
  } catch {
    return null;
  }
}

export function saveSubmitter(value: Submitter) {
  if (typeof window === "undefined") return;
  window.localStorage.setItem(STORAGE_KEY, JSON.stringify(normalizeSubmitter(value)));
}

export function submitterHeaders(): Record<string, string> {
  const submitter = loadSubmitter();
  if (!submitter) return {};
  return {
    [SUBMITTER_HEADERS.name]: encodeURIComponent(submitter.name),
    [SUBMITTER_HEADERS.email]: encodeURIComponent(submitter.email),
  };
}
