export const PLAYSAFE_TABLES = {
  registrations: "playsafe_registrations",
  equipment: "playsafe_registration_equipment",
  facilityPhotos: "playsafe_registration_photos",
  templates: "playsafe_checklist_templates",
  templateItems: "playsafe_checklist_template_items",
  assessments: "playsafe_assessments",
  answers: "playsafe_assessment_answers",
  photos: "playsafe_assessment_photos",
} as const;

export const PLAYSAFE_BUCKETS = {
  equipment: "playsafe-equipment-photos",
  checklist: "playsafe-checklist-photos",
  facility: "playsafe-facility-photos",
} as const;

export const SUBMITTER_HEADERS = {
  name: "x-playsafe-submitter-name",
  email: "x-playsafe-submitter-email",
} as const;

export const CHECKLIST_VERSION = "v1";
export const ELIGIBILITY_VERSION = "v1";
export const MAX_EQUIPMENT = 5;
export const MAX_PHOTOS_PER_ITEM = 3;
export const EQUIPMENT_PHOTO_MAX_BYTES = 2 * 1024 * 1024;
export const FACILITY_PHOTO_MAX_BYTES = 2 * 1024 * 1024;
export const CHECKLIST_PHOTO_MAX_BYTES = 300 * 1024;
export const THUMBNAIL_MAX_BYTES = 100 * 1024;
export const THUMBNAIL_MAX_EDGE = 320;
export const THUMBNAIL_QUALITY = 0.7;
export const PHOTO_CACHE_CONTROL_SECONDS = 60 * 60 * 24 * 365;
export const PHOTO_MIME_TYPES = ["image/webp", "image/jpeg"] as const;
export const MAX_ASSESSOR_LENGTH = 100;
export const MAX_MEMO_LENGTH = 2000;
export const SIGNED_URL_TTL_SECONDS = 60 * 60;

export const REGISTRATION_STATUSES = ["submitted", "not_target"] as const;

export const ASSESSMENT_STATUSES = ["submitted"] as const;

export const ANSWER_STATUSES = ["unrecorded", "risk_found", "no_risk", "not_applicable"] as const;

export const ADMIN_REGISTRATION_PAGE_SIZE = 20;
export const ADMIN_ASSESSMENT_PAGE_SIZE = 20;
