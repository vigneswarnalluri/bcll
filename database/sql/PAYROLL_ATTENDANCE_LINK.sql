-- ENHANCE PAYROLL WITH ATTENDANCE LINKAGE (4.5)
-- Connects attendance metrics directly to salary calculation.

DO $$ 
BEGIN
    -- 1. ADD ATTENDANCE METRICS TO PAYROLL
    IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name='payroll_records' AND column_name='total_working_days') THEN
        ALTER TABLE public.payroll_records ADD COLUMN total_working_days INTEGER DEFAULT 0;
    END IF;

    IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name='payroll_records' AND column_name='present_days') THEN
        ALTER TABLE public.payroll_records ADD COLUMN present_days INTEGER DEFAULT 0;
    END IF;

    IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name='payroll_records' AND column_name='leave_days') THEN
        ALTER TABLE public.payroll_records ADD COLUMN leave_days INTEGER DEFAULT 0;
    END IF;

    IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name='payroll_records' AND column_name='lop_days') THEN
        ALTER TABLE public.payroll_records ADD COLUMN lop_days INTEGER DEFAULT 0;
    END IF;

    -- 2. ADD RE-OPENING PROTECTION FOR LOCKED RECORDS
    -- Changes after locking need Director approval
    IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name='payroll_records' AND column_name='is_reopened') THEN
        ALTER TABLE public.payroll_records ADD COLUMN is_reopened BOOLEAN DEFAULT false;
    END IF;

    IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name='payroll_records' AND column_name='reopen_request_by') THEN
        ALTER TABLE public.payroll_records ADD COLUMN reopen_request_by UUID REFERENCES auth.users(id);
    END IF;

    IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name='payroll_records' AND column_name='reopen_reason') THEN
        ALTER TABLE public.payroll_records ADD COLUMN reopen_reason TEXT;
    END IF;

END $$;

-- Reload schema
NOTIFY pgrst, 'reload schema';
