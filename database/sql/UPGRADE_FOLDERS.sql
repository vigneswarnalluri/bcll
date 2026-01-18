-- DYNAMIC FOLDERS FOR E-OFFICE
-- 1. Create Categories table
CREATE TABLE IF NOT EXISTS organization_categories (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  name TEXT UNIQUE NOT NULL,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- 2. Add category_id to docs and migrate
ALTER TABLE organization_docs ADD COLUMN IF NOT EXISTS category_id UUID REFERENCES organization_categories(id);

-- 3. Enable RLS
ALTER TABLE organization_categories ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Admins manage categories" ON organization_categories FOR ALL TO authenticated USING (public.is_admin());

-- 4. Seed initial categories
INSERT INTO organization_categories (name) VALUES 
('Legal & Bye-laws'),
('Income Tax (12A/80G)'),
('Board Resolutions'),
('Personnel KYC Vault'),
('Program Audit Docs')
ON CONFLICT (name) DO NOTHING;

-- 5. Migration: Map existing category names to IDs
UPDATE organization_docs d
SET category_id = c.id
FROM organization_categories c
WHERE d.category = c.name;
