-- 관리자 메모 수정일시 (메모 저장/수정 시에만 기록)
ALTER TABLE safe_contact_inquiries
  ADD COLUMN IF NOT EXISTS notes_updated_at TIMESTAMPTZ DEFAULT NULL;

COMMENT ON COLUMN safe_contact_inquiries.notes_updated_at IS '관리자 메모 최종 수정 일시';
