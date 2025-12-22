-- Create contact_inquiries table
CREATE TABLE IF NOT EXISTS safe_contact_inquiries (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  name TEXT NOT NULL,
  phone TEXT NOT NULL,
  email TEXT NOT NULL,
  affiliation TEXT NOT NULL,
  inquiry TEXT NOT NULL,
  status TEXT NOT NULL DEFAULT 'pending' CHECK (status IN ('pending', 'processing', 'completed')),
  notes TEXT,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Add comments
COMMENT ON TABLE safe_contact_inquiries IS '문의사항 테이블';
COMMENT ON COLUMN safe_contact_inquiries.name IS '이름';
COMMENT ON COLUMN safe_contact_inquiries.phone IS '전화번호';
COMMENT ON COLUMN safe_contact_inquiries.email IS '이메일';
COMMENT ON COLUMN safe_contact_inquiries.affiliation IS '소속';
COMMENT ON COLUMN safe_contact_inquiries.inquiry IS '문의사항 내용';
COMMENT ON COLUMN safe_contact_inquiries.status IS '처리 상태 (pending: 대기, processing: 처리중, completed: 완료)';
COMMENT ON COLUMN safe_contact_inquiries.notes IS '관리자 메모';

-- Create index for status
CREATE INDEX IF NOT EXISTS idx_contact_inquiries_status ON safe_contact_inquiries(status);

-- Create index for created_at
CREATE INDEX IF NOT EXISTS idx_contact_inquiries_created_at ON safe_contact_inquiries(created_at DESC);

-- Create updated_at trigger function if not exists
CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = NOW();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- Create trigger for updated_at
DROP TRIGGER IF EXISTS update_contact_inquiries_updated_at ON safe_contact_inquiries;
CREATE TRIGGER update_contact_inquiries_updated_at
  BEFORE UPDATE ON safe_contact_inquiries
  FOR EACH ROW
  EXECUTE FUNCTION update_updated_at_column();

-- Enable RLS
ALTER TABLE safe_contact_inquiries ENABLE ROW LEVEL SECURITY;

-- RLS Policies
-- Allow all users to insert (for public inquiry form)
CREATE POLICY "Allow public insert on safe_contact_inquiries"
  ON safe_contact_inquiries
  FOR INSERT
  TO anon, authenticated
  WITH CHECK (true);

-- Allow all users to select (for admin dashboard)
CREATE POLICY "Allow public select on safe_contact_inquiries"
  ON safe_contact_inquiries
  FOR SELECT
  TO anon, authenticated
  USING (true);

-- Allow all users to update (for admin dashboard)
CREATE POLICY "Allow public update on safe_contact_inquiries"
  ON safe_contact_inquiries
  FOR UPDATE
  TO anon, authenticated
  USING (true)
  WITH CHECK (true);

-- Allow all users to delete (for admin dashboard)
CREATE POLICY "Allow public delete on safe_contact_inquiries"
  ON safe_contact_inquiries
  FOR DELETE
  TO anon, authenticated
  USING (true);

