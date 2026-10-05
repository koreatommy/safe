import { formatPhoneNumber, normalizePhoneNumber } from "@/lib/utils";
import { ALLOWED_ATTACHMENT_TYPES, INQUIRY_LIMITS } from "./constants";
import type { EligibilityInquiryInput, InquiryAttachment, UploadFileMeta } from "./types";

const EMAIL_RE = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
const STORAGE_PATH_RE = /^\d{4}-\d{2}\/[0-9a-f-]{36}\/\d\.[a-z0-9]+$/;

type Result<T> = { ok: true; value: T } | { ok: false; error: string };

const fail = (error: string): { ok: false; error: string } => ({ ok: false, error });

function str(value: unknown): string {
  return typeof value === "string" ? value.trim() : "";
}

export function fileExtension(name: string): string {
  const dot = name.lastIndexOf(".");
  return dot >= 0 ? name.slice(dot + 1).toLowerCase() : "";
}

export function attachmentContentType(name: string): string | null {
  return ALLOWED_ATTACHMENT_TYPES[fileExtension(name)] ?? null;
}

export function validateAttachmentFile(file: UploadFileMeta): string | null {
  if (!attachmentContentType(file.name)) {
    return `${file.name}: 허용되지 않는 형식입니다. (PDF, 이미지, 문서, 한글, ZIP, TXT)`;
  }
  if (file.size <= 0) return `${file.name}: 빈 파일은 첨부할 수 없습니다.`;
  if (file.size > INQUIRY_LIMITS.maxFileBytes) return `${file.name}: 파일당 10MB 이하만 첨부할 수 있습니다.`;
  if (file.name.length > INQUIRY_LIMITS.fileName) return `${file.name}: 파일명이 너무 깁니다.`;
  return null;
}

export function validateUploadRequest(raw: unknown): Result<UploadFileMeta[]> {
  const files = (raw as { files?: unknown })?.files;
  if (!Array.isArray(files) || files.length === 0) return fail("첨부할 파일 정보가 없습니다.");
  if (files.length > INQUIRY_LIMITS.maxFiles) return fail(`첨부파일은 최대 ${INQUIRY_LIMITS.maxFiles}개입니다.`);

  const metas: UploadFileMeta[] = [];
  for (const f of files) {
    const meta = { name: str(f?.name), size: typeof f?.size === "number" ? f.size : 0 };
    const error = validateAttachmentFile(meta);
    if (error) return fail(error);
    metas.push(meta);
  }
  return { ok: true, value: metas };
}

function parseAttachments(raw: unknown): Result<InquiryAttachment[]> {
  if (raw === undefined || raw === null) return { ok: true, value: [] };
  if (!Array.isArray(raw) || raw.length > INQUIRY_LIMITS.maxFiles) return fail("첨부파일 정보가 올바르지 않습니다.");

  const list: InquiryAttachment[] = [];
  for (const item of raw) {
    const path = str(item?.path);
    const name = str(item?.name);
    const size = typeof item?.size === "number" ? item.size : 0;
    const contentType = attachmentContentType(name);
    if (!STORAGE_PATH_RE.test(path) || !contentType || validateAttachmentFile({ name, size })) {
      return fail("첨부파일 정보가 올바르지 않습니다.");
    }
    list.push({ path, name, size, contentType });
  }
  return { ok: true, value: list };
}

/** 클라이언트 제출 전·서버 저장 전 공통 검증 */
export function validateInquiryInput(raw: unknown): Result<EligibilityInquiryInput> {
  const body = (raw ?? {}) as Record<string, unknown>;
  const title = str(body.title);
  const content = str(body.content);
  const name = str(body.name);
  const email = str(body.email).toLowerCase();
  const phoneDigits = normalizePhoneNumber(str(body.phone));

  if (!title) return fail("제목을 입력해 주세요.");
  if (title.length > INQUIRY_LIMITS.title) return fail("제목이 너무 깁니다.");
  if (!content) return fail("문의 내용을 입력해 주세요.");
  if (content.length > INQUIRY_LIMITS.content) return fail(`문의 내용은 ${INQUIRY_LIMITS.content}자 이내로 입력해 주세요.`);
  if (!name) return fail("이름을 입력해 주세요.");
  if (name.length > INQUIRY_LIMITS.name) return fail("이름이 너무 깁니다.");
  if (!email) return fail("이메일을 입력해 주세요.");
  if (email.length > INQUIRY_LIMITS.email || !EMAIL_RE.test(email)) return fail("올바른 이메일 형식이 아닙니다.");
  if (phoneDigits.length < 10 || phoneDigits.length > 11 || !phoneDigits.startsWith("0")) {
    return fail("올바른 연락처를 입력해 주세요. (10~11자리)");
  }
  if (body.privacyAgreed !== true) return fail("개인정보 수집·이용에 동의해 주세요.");

  const attachments = parseAttachments(body.attachments);
  if (!attachments.ok) return attachments;

  return {
    ok: true,
    value: {
      title,
      content,
      name,
      email,
      phone: formatPhoneNumber(phoneDigits),
      privacyAgreed: true,
      attachments: attachments.value,
    },
  };
}
