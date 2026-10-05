"use client";

import { useState, type FormEvent } from "react";
import { INQUIRY_LIMITS } from "@/lib/eligibility-inquiry/constants";
import { submitEligibilityInquiry } from "@/lib/eligibility-inquiry/submitInquiry";
import { validateAttachmentFile, validateInquiryInput } from "@/lib/eligibility-inquiry/validation";
import { formatPhoneNumber } from "@/lib/utils";

export interface InquiryFields {
  title: string;
  content: string;
  name: string;
  email: string;
  phone: string;
  privacyAgreed: boolean;
}

const EMPTY: InquiryFields = { title: "", content: "", name: "", email: "", phone: "", privacyAgreed: false };

type Status = "idle" | "submitting" | "success";

export function useEligibilityInquiryForm() {
  const [fields, setFields] = useState<InquiryFields>(EMPTY);
  const [files, setFiles] = useState<File[]>([]);
  const [status, setStatus] = useState<Status>("idle");
  const [error, setError] = useState<string | null>(null);

  const setField = <K extends keyof InquiryFields>(key: K, value: InquiryFields[K]) => {
    setFields((prev) => ({ ...prev, [key]: key === "phone" ? formatPhoneNumber(String(value)) : value }));
  };

  const addFiles = (incoming: File[]) => {
    const fresh = incoming.filter((f) => !files.some((x) => x.name === f.name && x.size === f.size));
    const invalid = fresh.map(validateAttachmentFile).find(Boolean);
    if (invalid) return setError(invalid);
    if (files.length + fresh.length > INQUIRY_LIMITS.maxFiles) {
      return setError(`첨부파일은 최대 ${INQUIRY_LIMITS.maxFiles}개까지 가능합니다.`);
    }
    setError(null);
    setFiles([...files, ...fresh]);
  };

  const removeFile = (index: number) => setFiles(files.filter((_, i) => i !== index));

  const onSubmit = async (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    if (status === "submitting") return;

    const checked = validateInquiryInput({ ...fields, attachments: [] });
    if (!checked.ok) return setError(checked.error);

    setError(null);
    setStatus("submitting");
    const result = await submitEligibilityInquiry(fields, files);
    if (!result.ok) {
      setStatus("idle");
      return setError(result.error);
    }
    setFields(EMPTY);
    setFiles([]);
    setStatus("success");
  };

  const reset = () => setStatus("idle");

  return { fields, files, status, error, setField, addFiles, removeFile, onSubmit, reset };
}
