-- UPGRADE ATTENDANCE FOR INSTITUTIONAL APPROVAL FLOW (4.4)
-- Adds multi-stage verification (Supervisor -> HR -> Locked)

DO $$ 
BEGIN
    -- 1. ADD APPROVAL STATUS
    IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name='attendance' AND column_name='approval_status') THEN
        ALTER TABLE public.attendance ADD COLUMN approval_status TEXT CHECK (approval_status IN ('Submitted', 'Supervisor Reviewed', 'HR Verified', 'Locked')) DEFAULT 'Submitted';
    END IF;

    -- 2. SUPERVISOR STAGE
    IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name='attendance' AND column_name='supervisor_id') THEN
        ALTER TABLE public.attendance ADD COLUMN supervisor_id UUID REFERENCES auth.users(id);
    END IF;
    IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name='attendance' AND column_name='supervisor_at') THEN
        ALTER TABLE public.attendance ADD COLUMN supervisor_at TIMESTAMPTZ;
    END IF;

    -- 3. HR STAGE
    IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name='attendance' AND column_name='hr_id') THEN
        ALTER TABLE public.attendance ADD COLUMN hr_id UUID REFERENCES auth.users(id);
    END IF;
    IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name='attendance' AND column_name='hr_at') THEN
        ALTER TABLE public.attendance ADD COLUMN hr_at TIMESTAMPTZ;
    END IF;

    -- 4. LOCKING STAGE (Ensuring columns exist from previous step)
    IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name='attendance' AND column_name='is_locked') THEN
        ALTER TABLE public.attendance ADD COLUMN is_locked BOOLEAN DEFAULT false;
    END IF;
    IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name='attendance' AND column_name='locked_by') THEN
        ALTER TABLE public.attendance ADD COLUMN locked_by UUID REFERENCES auth.users(id);
    END IF;
    IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name='attendance' AND column_name='locked_at') THEN
        ALTER TABLE public.attendance ADD COLUMN locked_at TIMESTAMPTZ;
    END IF;

END $$;

-- Reload schema
NOTIFY pgrst, 'reload schema';
