-- DIGITAL FILING & E-OFFICE SYSTEM SETUP
-- Organization: Bharath Cares Life Line Foundation (NGO)

-- 1. Organization Master Table
CREATE TABLE IF NOT EXISTS org_master (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    org_name TEXT NOT NULL,
    reg_type TEXT, -- Trust / Society / Section 8
    reg_number TEXT,
    reg_date DATE,
    reg_address TEXT,
    operating_address TEXT,
    district TEXT,
    state TEXT,
    pin_code TEXT,
    pan_number TEXT,
    tan_number TEXT,
    reg_12a TEXT,
    reg_80g TEXT,
    csr_1 TEXT,
    ngo_darpan_id TEXT,
    bank_name TEXT,
    bank_branch TEXT,
    account_number TEXT,
    ifsc_code TEXT,
    auth_signatory_name TEXT,
    auth_signatory_designation TEXT,
    official_email TEXT,
    official_phone TEXT,
    org_seal_url TEXT,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- 2. e-File System Table
CREATE TABLE IF NOT EXISTS efiles (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    file_number TEXT UNIQUE NOT NULL, -- Auto-generated logic
    category TEXT,
    subject TEXT NOT NULL,
    description TEXT,
    department_name TEXT,
    priority_level TEXT DEFAULT 'Normal', -- Normal / Urgent / Confidential
    confidentiality_level TEXT DEFAULT 'Public',
    created_by UUID REFERENCES auth.users(id),
    status TEXT DEFAULT 'Open', -- Open / In Progress / Closed / Archived
    linked_reference_files TEXT[],
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- 3. File Movement / History
CREATE TABLE IF NOT EXISTS efile_movements (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    file_id UUID REFERENCES efiles(id) ON DELETE CASCADE,
    from_user_id UUID REFERENCES auth.users(id),
    to_user_id UUID REFERENCES auth.users(id),
    action TEXT, -- Forwarded / Approved / Rejected
    remarks TEXT,
    moved_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- 4. Digital Notes Sheet (Linked to efiles)
CREATE TABLE IF NOT EXISTS efile_notes (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    file_id UUID REFERENCES efiles(id) ON DELETE CASCADE,
    author_id UUID REFERENCES auth.users(id),
    note_content TEXT NOT NULL,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- 5. Attachments / Artifacts (Linked to efiles)
-- We already have organization_docs, but we might want to link it to efiles
ALTER TABLE organization_docs ADD COLUMN IF NOT EXISTS efile_id UUID REFERENCES efiles(id) ON DELETE SET NULL;
ALTER TABLE organization_docs ADD COLUMN IF NOT EXISTS priority_level TEXT DEFAULT 'Normal';
ALTER TABLE organization_docs ADD COLUMN IF NOT EXISTS confidentiality TEXT DEFAULT 'Internal';

-- 6. Default Categories for the Filing System
-- This is just for seeding or reference
-- Administration, HR, Finance, Fundraising, Programs, Scholarships, Volunteers, Rehab, Legal

-- 7. Governance & Auditing Logs (Integrated with custom audit_logs already)

-- Add some seed data for categories if needed
INSERT INTO organization_categories (name) VALUES 
('Administration'),
('Human Resources (HR)'),
('Finance & Accounts'),
('Fundraising & Donations'),
('Social Welfare / Programs'),
('Scholarships Dept'),
('Volunteers Management'),
('Rise & Rebuild (NGO)'),
('Legal & Compliance'),
('Communication & Correspondence'),
('Meetings & Decisions'),
('Asset & Inventory')
ON CONFLICT (name) DO NOTHING;
