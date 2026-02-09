-- 1. ENHANCE TABLES WITH APPROVAL SIGNATURE COLUMNS
-- This standardizes how approval details are captured across all major modules.

DO $$ 
BEGIN
    -- List of tables that require approval tracking
    DECLARE 
        tbl_names TEXT[] := ARRAY['volunteers', 'students', 'scholarships', 'leave_requests', 'employees', 'payroll_records', 'volunteer_tasks', 'field_reports', 'fellow_monthly_reports', 'stipend_disbursements', 'compliance_docs'];
        t TEXT;
    BEGIN
        FOREACH t IN ARRAY tbl_names
        LOOP
            -- Safety check: only proceed if table exists in public schema
            IF EXISTS (SELECT 1 FROM information_schema.tables WHERE table_schema = 'public' AND table_name = t) THEN
                EXECUTE format('ALTER TABLE public.%I ADD COLUMN IF NOT EXISTS approved_by_name TEXT', t);
                EXECUTE format('ALTER TABLE public.%I ADD COLUMN IF NOT EXISTS approved_by_designation TEXT', t);
                EXECUTE format('ALTER TABLE public.%I ADD COLUMN IF NOT EXISTS approved_by_dept TEXT', t);
                EXECUTE format('ALTER TABLE public.%I ADD COLUMN IF NOT EXISTS approved_at TIMESTAMPTZ', t);
                EXECUTE format('ALTER TABLE public.%I ADD COLUMN IF NOT EXISTS approval_remarks TEXT', t);
                EXECUTE format('ALTER TABLE public.%I ADD COLUMN IF NOT EXISTS approval_level TEXT', t);
            END IF;
        END LOOP;
    END;
END $$;

-- 2. REUSE OR ALIAS EXISTING COLUMNS FOR CONSISTENCY
-- If verified_by exists, it should be mapped or used in conjunction.
-- But the new columns will be the primary source for the "Approval Display" UI.

-- Update approval_requests table metadata for Level 1 and Final
ALTER TABLE public.approval_requests ADD COLUMN IF NOT EXISTS level_1_designation TEXT;
ALTER TABLE public.approval_requests ADD COLUMN IF NOT EXISTS level_1_dept TEXT;
ALTER TABLE public.approval_requests ADD COLUMN IF NOT EXISTS level_1_at TIMESTAMPTZ;
ALTER TABLE public.approval_requests ADD COLUMN IF NOT EXISTS level_1_remarks TEXT;

ALTER TABLE public.approval_requests ADD COLUMN IF NOT EXISTS level_2_status TEXT DEFAULT 'Pending';
ALTER TABLE public.approval_requests ADD COLUMN IF NOT EXISTS level_2_approver UUID;
ALTER TABLE public.approval_requests ADD COLUMN IF NOT EXISTS level_2_approver_name TEXT;
ALTER TABLE public.approval_requests ADD COLUMN IF NOT EXISTS level_2_designation TEXT;
ALTER TABLE public.approval_requests ADD COLUMN IF NOT EXISTS level_2_dept TEXT;
ALTER TABLE public.approval_requests ADD COLUMN IF NOT EXISTS level_2_at TIMESTAMPTZ;
ALTER TABLE public.approval_requests ADD COLUMN IF NOT EXISTS level_2_remarks TEXT;

ALTER TABLE public.approval_requests ADD COLUMN IF NOT EXISTS final_designation TEXT;
ALTER TABLE public.approval_requests ADD COLUMN IF NOT EXISTS final_dept TEXT;
ALTER TABLE public.approval_requests ADD COLUMN IF NOT EXISTS final_at TIMESTAMPTZ;
ALTER TABLE public.approval_requests ADD COLUMN IF NOT EXISTS final_remarks TEXT;

-- Reload schema
NOTIFY pgrst, 'reload schema';
