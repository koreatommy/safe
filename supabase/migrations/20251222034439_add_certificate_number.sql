-- Add certificate_number column to safe_education_applications table
ALTER TABLE safe_education_applications
ADD COLUMN IF NOT EXISTS certificate_number TEXT;

-- Add comment to the column
COMMENT ON COLUMN safe_education_applications.certificate_number IS '수료증 번호 - 관리자가 발급하는 고유 번호';

