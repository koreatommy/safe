-- Enable RLS if not already enabled
ALTER TABLE safe_contact_inquiries ENABLE ROW LEVEL SECURITY;

-- Drop existing policies if they exist
DROP POLICY IF EXISTS "Allow public insert on safe_contact_inquiries" ON safe_contact_inquiries;
DROP POLICY IF EXISTS "Allow public select on safe_contact_inquiries" ON safe_contact_inquiries;
DROP POLICY IF EXISTS "Allow public update on safe_contact_inquiries" ON safe_contact_inquiries;
DROP POLICY IF EXISTS "Allow public delete on safe_contact_inquiries" ON safe_contact_inquiries;

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

