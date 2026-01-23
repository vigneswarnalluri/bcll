-- Add decline_reason to existing tables with explicit schema qualification
DO $$ 
BEGIN 
    -- 1. Students Table
    IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_schema='public' AND table_name='students' AND column_name='decline_reason') THEN
        ALTER TABLE public.students ADD COLUMN decline_reason TEXT;
    END IF;

    -- 2. Volunteers Table
    IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_schema='public' AND table_name='volunteers' AND column_name='decline_reason') THEN
        ALTER TABLE public.volunteers ADD COLUMN decline_reason TEXT;
    END IF;

    -- 3. Scholarships Table
    IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_schema='public' AND table_name='scholarships' AND column_name='decline_reason') THEN
        ALTER TABLE public.scholarships ADD COLUMN decline_reason TEXT;
    END IF;

    -- 4. Leave Requests Table
    IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_schema='public' AND table_name='leave_requests' AND column_name='decline_reason') THEN
        ALTER TABLE public.leave_requests ADD COLUMN decline_reason TEXT;
    END IF;
END $$;
