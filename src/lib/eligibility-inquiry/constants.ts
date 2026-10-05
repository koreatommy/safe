export const ELIGIBILITY_INQUIRY_TABLE = "safe_eligibility_inquiries";
export const ELIGIBILITY_INQUIRY_BUCKET = "eligibility-inquiry-attachments";

export const INQUIRY_LIMITS = {
  title: 200,
  content: 5000,
  name: 100,
  email: 254,
  adminNote: 5000,
  fileName: 200,
  maxFiles: 3,
  maxFileBytes: 10 * 1024 * 1024,
} as const;

/** 확장자 → 업로드 Content-Type (HWP 등은 브라우저가 MIME을 비워 보내므로 확장자 기준으로 판정) */
export const ALLOWED_ATTACHMENT_TYPES: Readonly<Record<string, string>> = {
  pdf: "application/pdf",
  png: "image/png",
  jpg: "image/jpeg",
  jpeg: "image/jpeg",
  gif: "image/gif",
  webp: "image/webp",
  doc: "application/msword",
  docx: "application/vnd.openxmlformats-officedocument.wordprocessingml.document",
  xls: "application/vnd.ms-excel",
  xlsx: "application/vnd.openxmlformats-officedocument.spreadsheetml.sheet",
  hwp: "application/x-hwp",
  hwpx: "application/vnd.hancom.hwpx",
  zip: "application/zip",
  txt: "text/plain",
};

export const INQUIRY_STATUSES = ["pending", "processing", "completed"] as const;

export const INQUIRY_STATUS_LABELS: Readonly<Record<(typeof INQUIRY_STATUSES)[number], string>> = {
  pending: "대기",
  processing: "처리중",
  completed: "답변완료",
};

/** 서명 다운로드 URL 유효 시간(초) */
export const ATTACHMENT_URL_TTL_SECONDS = 60 * 60;
