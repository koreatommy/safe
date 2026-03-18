-- Add attachment_urls column to contact_inquiries table
ALTER TABLE safe_contact_inquiries ADD COLUMN IF NOT EXISTS attachment_urls JSONB DEFAULT '[]'::jsonb;

COMMENT ON COLUMN safe_contact_inquiries.attachment_urls IS '첨부파일 URL 목록 (JSON 배열)';

-- Create contact-attachments storage bucket
INSERT INTO storage.buckets (id, name, public, file_size_limit, allowed_mime_types)
VALUES (
  'contact-attachments',
  'contact-attachments',
  true,
  20971520,
  ARRAY[
    'application/pdf',
    'image/png','image/jpeg','image/gif','image/webp',
    'application/msword',
    'application/vnd.openxmlformats-officedocument.wordprocessingml.document',
    'application/vnd.ms-excel',
    'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet',
    'application/zip',
    'text/plain'
  ]
)
ON CONFLICT (id) DO NOTHING;

-- Storage policies
CREATE POLICY "Allow public upload to contact-attachments"
  ON storage.objects FOR INSERT TO anon, authenticated
  WITH CHECK (bucket_id = 'contact-attachments');

CREATE POLICY "Allow public read from contact-attachments"
  ON storage.objects FOR SELECT TO anon, authenticated
  USING (bucket_id = 'contact-attachments');

CREATE POLICY "Allow public delete from contact-attachments"
  ON storage.objects FOR DELETE TO anon, authenticated
  USING (bucket_id = 'contact-attachments');
