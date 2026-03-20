-- 관리자 메모 댓글 형식: 문의당 여러 메모 저장
CREATE TABLE IF NOT EXISTS safe_contact_inquiry_notes (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  inquiry_id UUID NOT NULL REFERENCES safe_contact_inquiries(id) ON DELETE CASCADE,
  body TEXT NOT NULL,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

COMMENT ON TABLE safe_contact_inquiry_notes IS '문의별 관리자 메모(댓글 형식)';
COMMENT ON COLUMN safe_contact_inquiry_notes.inquiry_id IS '문의 ID';
COMMENT ON COLUMN safe_contact_inquiry_notes.body IS '메모 내용';
COMMENT ON COLUMN safe_contact_inquiry_notes.created_at IS '작성 일시';

CREATE INDEX IF NOT EXISTS idx_contact_inquiry_notes_inquiry_id
  ON safe_contact_inquiry_notes(inquiry_id);

CREATE INDEX IF NOT EXISTS idx_contact_inquiry_notes_created_at
  ON safe_contact_inquiry_notes(created_at ASC);

ALTER TABLE safe_contact_inquiry_notes ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Allow public select on safe_contact_inquiry_notes"
  ON safe_contact_inquiry_notes FOR SELECT TO anon, authenticated USING (true);

CREATE POLICY "Allow public insert on safe_contact_inquiry_notes"
  ON safe_contact_inquiry_notes FOR INSERT TO anon, authenticated WITH CHECK (true);

CREATE POLICY "Allow public update on safe_contact_inquiry_notes"
  ON safe_contact_inquiry_notes FOR UPDATE TO anon, authenticated USING (true) WITH CHECK (true);

CREATE POLICY "Allow public delete on safe_contact_inquiry_notes"
  ON safe_contact_inquiry_notes FOR DELETE TO anon, authenticated USING (true);

-- 기존 단일 메모(notes)를 첫 번째 댓글로 이전
INSERT INTO safe_contact_inquiry_notes (inquiry_id, body, created_at)
SELECT id, notes, COALESCE(notes_updated_at, updated_at)
FROM safe_contact_inquiries
WHERE notes IS NOT NULL AND TRIM(notes) <> '';
