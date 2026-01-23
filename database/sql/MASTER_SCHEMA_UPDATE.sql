-- 1. ENHANCED AUDIT LOGS (IMMUTABLE)
-- Add columns for old/new values and device info if not exists
DO $$ 
BEGIN 
    IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name='audit_logs' AND column_name='old_value') THEN
        ALTER TABLE public.audit_logs ADD COLUMN old_value JSONB;
    END IF;
    IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name='audit_logs' AND column_name='new_value') THEN
        ALTER TABLE public.audit_logs ADD COLUMN new_value JSONB;
    END IF;
    IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name='audit_logs' AND column_name='device_info') THEN
        ALTER TABLE public.audit_logs ADD COLUMN device_info TEXT;
    END IF;
END $$;

-- Prevent Deletion or Updates to Audit Logs
DO $$ 
BEGIN
    IF NOT EXISTS (SELECT 1 FROM pg_trigger WHERE tgname = 'prevent_audit_log_modification') THEN
        CREATE OR REPLACE FUNCTION public.block_audit_log_modification() RETURNS TRIGGER AS $body$
        BEGIN
            RAISE EXCEPTION 'Audit logs are immutable and cannot be modified or deleted.';
        END;
        $body$ LANGUAGE plpgsql;

        CREATE TRIGGER prevent_audit_log_modification
        BEFORE UPDATE OR DELETE ON public.audit_logs
        FOR EACH ROW EXECUTE FUNCTION public.block_audit_log_modification();
    END IF;
END $$;

-- 2. APPROVAL AUTHORITY REGISTRY
CREATE TABLE IF NOT EXISTS public.approval_registry (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    type TEXT NOT NULL, -- 'Salary', 'Fellowship Stipend', 'Volunteer Certificate', 'Expense Claim', 'Termination'
    requester_id UUID NOT NULL, -- Links to profiles.user_id or specific entity id (e.g. stipend_id)
    requester_name TEXT,
    req_amount DECIMAL,
    
    -- Multi-level Tracking
    level_1_status TEXT CHECK (level_1_status IN ('Pending', 'Approved', 'Declined')) DEFAULT 'Pending',
    level_1_approver UUID REFERENCES auth.users(id),
    level_1_remarks TEXT,
    
    final_status TEXT CHECK (final_status IN ('Pending', 'Approved', 'Declined')) DEFAULT 'Pending',
    final_approver UUID REFERENCES auth.users(id),
    final_remarks TEXT, -- Mandatory if declined
    
    metadata JSONB, -- Stores specific details like 'Attendance Mismatch' or 'Policy Violation'
    created_at TIMESTAMPTZ DEFAULT now(),
    updated_at TIMESTAMPTZ DEFAULT now()
);

-- 3. ENHANCED GOVERNANCE (LOCKING)
ALTER TABLE public.policies ADD COLUMN IF NOT EXISTS version TEXT DEFAULT '1.0';
ALTER TABLE public.policies ADD COLUMN IF NOT EXISTS effective_date DATE;
ALTER TABLE public.policies ADD COLUMN IF NOT EXISTS status TEXT CHECK (status IN ('Draft', 'Active', 'Archived')) DEFAULT 'Draft';

-- Add locking to board meetings
ALTER TABLE public.board_meetings ADD COLUMN IF NOT EXISTS is_locked BOOLEAN DEFAULT false;
ALTER TABLE public.board_meetings ADD COLUMN IF NOT EXISTS locked_at TIMESTAMPTZ;

-- Trigger to prevent editing locked resolutions
CREATE OR REPLACE FUNCTION public.check_meeting_lock() RETURNS TRIGGER AS $body$
BEGIN
    IF OLD.is_locked = true THEN
        RAISE EXCEPTION 'This resolution is FINALIZED and LOCKED. No further edits allowed.';
    END IF;
    RETURN NEW;
END;
$body$ LANGUAGE plpgsql;

DO $$ 
BEGIN
    IF NOT EXISTS (SELECT 1 FROM pg_trigger WHERE tgname = 'prevent_locked_meeting_edit') THEN
        CREATE TRIGGER prevent_locked_meeting_edit
        BEFORE UPDATE ON public.board_meetings
        FOR EACH ROW EXECUTE FUNCTION public.check_meeting_lock();
    END IF;
END $$;

-- 4. FELLOWSHIP & VOLUNTEER DISCIPLINE
-- Extend profiles or specific tables for discipline
ALTER TABLE public.volunteers ADD COLUMN IF NOT EXISTS discipline_level TEXT CHECK (discipline_level IN ('None', 'Warning', 'Final Warning', 'Temporary Block', 'Blacklist')) DEFAULT 'None';
ALTER TABLE public.volunteers ADD COLUMN IF NOT EXISTS discipline_reason TEXT;

-- DATA MIGRATION: Fix existing statuses before applying strict check
UPDATE public.students SET status = 'Active Fellow' WHERE status = 'Active';
UPDATE public.students SET status = 'Active Fellow' WHERE status = 'Approved';
UPDATE public.students SET status = 'Pending' WHERE status IS NULL;

-- Extend students for advanced status lifecycle
ALTER TABLE public.students DROP CONSTRAINT IF EXISTS students_status_check;
ALTER TABLE public.students ADD CONSTRAINT students_status_check CHECK (status IN ('Applied', 'Under Review', 'Shortlisted', 'Interview Scheduled', 'Interview Completed', 'Selected', 'Active Fellow', 'Completed', 'Terminated', 'Pending'));

-- 5. FELLOWSHIP REPORTS & STIPENDS
CREATE TABLE IF NOT EXISTS public.fellow_monthly_reports (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    fellow_id UUID REFERENCES public.students(id),
    month TEXT NOT NULL,
    report_url TEXT,
    status TEXT CHECK (status IN ('Pending', 'Approved', 'Declined')) DEFAULT 'Pending',
    supervisor_remarks TEXT,
    created_at TIMESTAMPTZ DEFAULT now()
);

-- Financial consistency trigger: Stipend release requires Report Approval
-- (Logic will be handled in the Admin handleApproval function, 
-- but we define the stipend table here for record keeping)
CREATE TABLE IF NOT EXISTS public.stipend_disbursements (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    fellow_id UUID REFERENCES public.students(id),
    month TEXT NOT NULL,
    amount DECIMAL NOT NULL,
    report_id UUID REFERENCES public.fellow_monthly_reports(id),
    status TEXT CHECK (status IN ('Pending Approval', 'Processing', 'Paid', 'Declined')) DEFAULT 'Pending Approval',
    created_at TIMESTAMPTZ DEFAULT now()
);

-- Force PostgREST to reload the schema to recognize new columns/tables
NOTIFY pgrst, 'reload schema';
