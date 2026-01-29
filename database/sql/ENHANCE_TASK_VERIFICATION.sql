-- Add name and designation columns for volunteer task verification to support ApprovalBadge
DO $$ 
BEGIN 
    IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name = 'volunteer_tasks' AND column_name = 'verifier_name') THEN 
        ALTER TABLE public.volunteer_tasks ADD COLUMN verifier_name TEXT;
    END IF;

    IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name = 'volunteer_tasks' AND column_name = 'verifier_designation') THEN 
        ALTER TABLE public.volunteer_tasks ADD COLUMN verifier_designation TEXT;
    END IF;
END $$;
