-- DIGITAL FILING SYSTEM (E-Office)
-- Table to store regulatory and organization documents

CREATE TABLE IF NOT EXISTS organization_docs (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  name TEXT NOT NULL,
  category TEXT NOT NULL CHECK (category IN ('Legal & Bye-laws', 'Income Tax (12A/80G)', 'Board Resolutions', 'Personnel KYC Vault', 'Program Audit Docs')),
  file_url TEXT, -- In a real app, this points to Storage. Here text/link.
  size TEXT DEFAULT '1.2 MB',
  verified BOOLEAN DEFAULT TRUE,
  uploaded_by UUID REFERENCES profiles(id),
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- Enable RLS
ALTER TABLE organization_docs ENABLE ROW LEVEL SECURITY;

-- Admins have Full Access
CREATE POLICY "Admins manage docs" ON organization_docs
    FOR ALL
    TO authenticated
    USING (public.is_admin());

-- Employees might view only (Optional, for now strict Admin)

-- Seed some initial data so it's not empty
INSERT INTO organization_docs (name, category, size, created_at) VALUES 
('Certificate_of_Incorporation.pdf', 'Legal & Bye-laws', '2.4 MB', NOW() - INTERVAL '200 days'),
('Trust_Deed_Signed.pdf', 'Legal & Bye-laws', '5.1 MB', NOW() - INTERVAL '150 days'),
('12A_Registration.pdf', 'Income Tax (12A/80G)', '1.2 MB', NOW() - INTERVAL '100 days'),
('Annual_Mom_2025.pdf', 'Board Resolutions', '0.5 MB', NOW() - INTERVAL '10 days');
