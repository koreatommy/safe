import type { INQUIRY_STATUSES } from "./constants";

export type InquiryStatus = (typeof INQUIRY_STATUSES)[number];
export type InquiryStatusFilter = "all" | InquiryStatus;

export interface InquiryAttachment {
  path: string;
  name: string;
  size: number;
  contentType: string;
}

/** 관리자 조회 시 서명 URL이 붙은 첨부파일 */
export interface InquiryAttachmentWithUrl extends InquiryAttachment {
  url: string | null;
}

export interface EligibilityInquiryInput {
  title: string;
  content: string;
  name: string;
  email: string;
  phone: string;
  privacyAgreed: boolean;
  attachments: InquiryAttachment[];
}

export interface EligibilityInquiry {
  id: string;
  title: string;
  content: string;
  name: string;
  email: string;
  phone: string;
  attachments: InquiryAttachmentWithUrl[];
  status: InquiryStatus;
  admin_note: string | null;
  created_at: string;
}

export interface UploadFileMeta {
  name: string;
  size: number;
}

export interface UploadTicket {
  path: string;
  token: string;
  contentType: string;
}
