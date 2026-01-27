-- ENHANCE ATTENDANCE SECURITY: LOCKING MECHANISM
-- Allows HR/Admin to lock daily attendance to prevent tampering after processing.

DO $$ 
BEGIN
    -- 1. Add is_locked column if not exists
    IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name='attendance' AND column_name='is_locked') THEN
        ALTER TABLE public.attendance ADD COLUMN is_locked BOOLEAN DEFAULT false;
    END IF;

    -- 2. Add locked_by and locked_at for traceability
    IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name='attendance' AND column_name='locked_by') THEN
        ALTER TABLE public.attendance ADD COLUMN locked_by UUID REFERENCES auth.users(id);
    END IF;

    IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name='attendance' AND column_name='locked_at') THEN
        ALTER TABLE public.attendance ADD COLUMN locked_at TIMESTAMPTZ;
    END IF;
END $$;

-- Reload schema
NOTIFY pgrst, 'reload schema';
