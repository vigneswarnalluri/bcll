-- LEGAL & COMPLIANCE SAFETY SCHEMA
-- (STRONG COMPLIANCE: 12A, 80G, CSR, NGO AUDIT)

-- 1. COMPLIANCE DOCUMENTS (Audit Vault)
CREATE TABLE IF NOT EXISTS public.compliance_docs (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    title TEXT NOT NULL,
    category TEXT CHECK (category IN ('12A', '80G', 'CSR-1', 'FCRA', 'Audit Report', 'IT Return', 'Trust Deed', 'Other')),
    document_url TEXT,
    expiry_date DATE,
    status TEXT CHECK (status IN ('Active', 'Expired', 'Pending Renewal')) DEFAULT 'Active',
    verified_by UUID REFERENCES auth.users(id),
    verified_at TIMESTAMPTZ,
    last_scrutiny_date TIMESTAMPTZ,
    notes TEXT,
    created_at TIMESTAMPTZ DEFAULT now(),
    updated_at TIMESTAMPTZ DEFAULT now()
);

-- 2. CSR PROJECT FUNDING & COMPLIANCE
CREATE TABLE IF NOT EXISTS public.csr_funding (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    company_name TEXT NOT NULL,
    project_name TEXT NOT NULL,
    financial_year TEXT NOT NULL, -- e.g. "2025-26"
    sanctioned_amount DECIMAL NOT NULL,
    received_amount DECIMAL DEFAULT 0,
    utilized_amount DECIMAL DEFAULT 0,
    csr_registration_number TEXT, -- CSR-1 reg
    mou_url TEXT,
    utilization_cert_url TEXT,
    status TEXT CHECK (status IN ('Ongoing', 'Completed', 'Audited')) DEFAULT 'Ongoing',
    created_at TIMESTAMPTZ DEFAULT now()
);

-- 3. DONATION TAX RECORDS (80G SCRUTINY PREP)
CREATE TABLE IF NOT EXISTS public.donation_tax_records (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    donor_name TEXT NOT NULL,
    donor_pan TEXT,
    donor_id_type TEXT CHECK (donor_id_type IN ('PAN', 'Aadhaar', 'Passport', 'VoterID')),
    donor_id_number TEXT,
    donation_amount DECIMAL NOT NULL,
    donation_date DATE NOT NULL,
    payment_mode TEXT CHECK (payment_mode IN ('Bank Transfer', 'Cheque', 'UPI', 'Cash')),
    receipt_number TEXT UNIQUE,
    is_80g_issued BOOLEAN DEFAULT false,
    form_10bd_filed BOOLEAN DEFAULT false,
    metadata JSONB, -- For extra scrutiny data
    created_at TIMESTAMPTZ DEFAULT now()
);

-- 4. COMPLIANCE CHECKLIST (TRACKER)
CREATE TABLE IF NOT EXISTS public.compliance_checklists (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    task_name TEXT NOT NULL,
    frequency TEXT CHECK (frequency IN ('Monthly', 'Quarterly', 'Annual', 'One-time')),
    due_date DATE,
    completion_date DATE,
    status TEXT CHECK (status IN ('Pending', 'Completed', 'Overdue')) DEFAULT 'Pending',
    responsible_person UUID REFERENCES auth.users(id),
    evidence_url TEXT,
    law_reference TEXT, -- e.g. "IT Act Section 12A"
    created_at TIMESTAMPTZ DEFAULT now()
);

-- 5. PERMISSIONS EXTENSION
ALTER TABLE public.admin_controls ADD COLUMN IF NOT EXISTS perm_compliance BOOLEAN DEFAULT false;

-- ENABLE RLS
ALTER TABLE public.compliance_docs ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.csr_funding ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.donation_tax_records ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.compliance_checklists ENABLE ROW LEVEL SECURITY;

-- Allow all authenticated users for now (standard for this project's current state)
DO $$ 
BEGIN
    IF NOT EXISTS (SELECT 1 FROM pg_policy WHERE polname = 'Allow all on compliance_docs') THEN
        CREATE POLICY "Allow all on compliance_docs" ON public.compliance_docs FOR ALL TO authenticated USING (true);
    END IF;
    IF NOT EXISTS (SELECT 1 FROM pg_policy WHERE polname = 'Allow all on csr_funding') THEN
        CREATE POLICY "Allow all on csr_funding" ON public.csr_funding FOR ALL TO authenticated USING (true);
    END IF;
    IF NOT EXISTS (SELECT 1 FROM pg_policy WHERE polname = 'Allow all on donation_tax_records') THEN
        CREATE POLICY "Allow all on donation_tax_records" ON public.donation_tax_records FOR ALL TO authenticated USING (true);
    END IF;
    IF NOT EXISTS (SELECT 1 FROM pg_policy WHERE polname = 'Allow all on compliance_checklists') THEN
        CREATE POLICY "Allow all on compliance_checklists" ON public.compliance_checklists FOR ALL TO authenticated USING (true);
    END IF;
END $$;

-- NOTIFY pgrst
NOTIFY pgrst, 'reload schema';
