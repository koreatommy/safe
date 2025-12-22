-- Add certificate_file_url column to safe_education_applications table
ALTER TABLE safe_education_applications
ADD COLUMN IF NOT EXISTS certificate_file_url TEXT;

-- Add comment to the column
COMMENT ON COLUMN safe_education_applications.certificate_file_url IS '수료증 PDF 파일 URL - Supabase Storage에 저장된 파일 경로';

