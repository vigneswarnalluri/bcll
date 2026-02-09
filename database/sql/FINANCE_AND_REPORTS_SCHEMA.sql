-- FINANCE, PAYROLL & FIELD REPORTS SCHEMA
-- This script ensures missing operational tables exist with correct relationships.

-- 1. PAYROLL RECORDS (Institutional Salary Tracker)
CREATE TABLE IF NOT EXISTS public.payroll_records (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    employee_id UUID REFERENCES public.employees(id) ON DELETE CASCADE,
    month TEXT NOT NULL, -- e.g. "January 2026"
    basic_salary DECIMAL NOT NULL DEFAULT 0,
    allowances DECIMAL DEFAULT 0,
    deductions DECIMAL DEFAULT 0,
    net_salary DECIMAL NOT NULL DEFAULT 0,
    status TEXT CHECK (status IN ('Draft', 'Attendance Locked', 'HR Verified', 'Finance Computed', 'Director Approved', 'Funds Disbursed', 'Cycle Complete', 'Rejected')) DEFAULT 'Draft',
    payment_date DATE,
    utr_reference TEXT,
    created_at TIMESTAMPTZ DEFAULT now(),
    updated_at TIMESTAMPTZ DEFAULT now(),
    
    -- Approval Signatures (Forensic Trail)
    approved_by_name TEXT,
    approved_by_designation TEXT,
    approved_by_dept TEXT,
    approved_at TIMESTAMPTZ,
    approval_remarks TEXT,
    approval_level TEXT
);

-- 2. FIELD REPORTS (Mission Activity Logging)
CREATE TABLE IF NOT EXISTS public.field_reports (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    title TEXT NOT NULL,
    category TEXT NOT NULL, -- e.g. "Education", "Healthcare", "Disaster Relief"
    content TEXT,
    file_url TEXT,
    status TEXT CHECK (status IN ('Draft', 'Submitted', 'Approved', 'Needs Revision')) DEFAULT 'Draft',
    posted_by UUID REFERENCES auth.users(id),
    created_at TIMESTAMPTZ DEFAULT now(),
    updated_at TIMESTAMPTZ DEFAULT now(),
    
    -- Approval Signatures
    approved_by_name TEXT,
    approved_by_designation TEXT,
    approved_by_dept TEXT,
    approved_at TIMESTAMPTZ,
    approval_remarks TEXT
);

-- 3. FINANCE LOGS (Double Entry Style Logging)
CREATE TABLE IF NOT EXISTS public.finance_logs (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    type TEXT CHECK (type IN ('Income', 'Expense', 'Internal Transfer')) NOT NULL,
    category_context TEXT, -- e.g. "Scholarship Fund", "Office Rent", "Donation"
    amount DECIMAL NOT NULL,
    transaction_date DATE DEFAULT CURRENT_DATE,
    status TEXT CHECK (status IN ('Pending', 'Cleared', 'Failed')) DEFAULT 'Cleared',
    reference_id TEXT, -- e.g. Receipt No or UTR
    notes TEXT,
    created_at TIMESTAMPTZ DEFAULT now()
);

-- Enable RLS
ALTER TABLE public.payroll_records ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.field_reports ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.finance_logs ENABLE ROW LEVEL SECURITY;

-- Permissions
DO $$ 
BEGIN
    IF NOT EXISTS (SELECT 1 FROM pg_policy WHERE polname = 'Allow all on payroll_records') THEN
        CREATE POLICY "Allow all on payroll_records" ON public.payroll_records FOR ALL TO authenticated USING (true);
    END IF;
    IF NOT EXISTS (SELECT 1 FROM pg_policy WHERE polname = 'Allow all on field_reports') THEN
        CREATE POLICY "Allow all on field_reports" ON public.field_reports FOR ALL TO authenticated USING (true);
    END IF;
    IF NOT EXISTS (SELECT 1 FROM pg_policy WHERE polname = 'Allow all on finance_logs') THEN
        CREATE POLICY "Allow all on finance_logs" ON public.finance_logs FOR ALL TO authenticated USING (true);
    END IF;
END $$;

-- Reload PostgREST
NOTIFY pgrst, 'reload schema';
