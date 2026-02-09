-- Add verification columns to volunteer_tasks
DO $$ 
BEGIN 
    IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name = 'volunteer_tasks' AND column_name = 'verified_at') THEN 
        ALTER TABLE public.volunteer_tasks ADD COLUMN verified_at TIMESTAMPTZ;
    END IF;

    IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name = 'volunteer_tasks' AND column_name = 'verified_by') THEN 
        ALTER TABLE public.volunteer_tasks ADD COLUMN verified_by UUID REFERENCES auth.users(id);
    END IF;

     IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name = 'volunteer_tasks' AND column_name = 'decline_reason') THEN 
        ALTER TABLE public.volunteer_tasks ADD COLUMN decline_reason TEXT;
    END IF;
END $$;
