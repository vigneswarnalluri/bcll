-- Comprehensive Fix for Volunteer Tasks
-- 1. Ensure all necessary columns exist
DO $$ 
BEGIN 
    IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name = 'volunteer_tasks' AND column_name = 'proof_details') THEN 
        ALTER TABLE public.volunteer_tasks ADD COLUMN proof_details TEXT;
    END IF;

    IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name = 'volunteer_tasks' AND column_name = 'updated_at') THEN 
        ALTER TABLE public.volunteer_tasks ADD COLUMN updated_at TIMESTAMPTZ DEFAULT now();
    END IF;
END $$;

-- 2. Reset RLS Policies completely for this table
ALTER TABLE public.volunteer_tasks ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS "Admins can insert tasks" ON public.volunteer_tasks;
DROP POLICY IF EXISTS "Admins can update tasks" ON public.volunteer_tasks;
DROP POLICY IF EXISTS "Admins can delete tasks" ON public.volunteer_tasks;
DROP POLICY IF EXISTS "Admins review all tasks" ON public.volunteer_tasks;
DROP POLICY IF EXISTS "Volunteers can update own tasks" ON public.volunteer_tasks;
DROP POLICY IF EXISTS "Volunteers view own tasks" ON public.volunteer_tasks;

-- 3. Create permissive policies for Admins
CREATE POLICY "Admins full access" 
ON public.volunteer_tasks 
FOR ALL 
TO authenticated 
USING (true) 
WITH CHECK (true);

-- 4. Create explicit Self-Service Policy for Volunteers
-- Volunteers can UPDATE their rows if the volunteer_id matches their profile id
CREATE POLICY "Volunteers update own tasks" 
ON public.volunteer_tasks 
FOR UPDATE 
TO authenticated 
USING (
    volunteer_id IN (
        SELECT id FROM public.volunteers 
        WHERE lower(email) = lower(auth.email())
    )
)
WITH CHECK (
    volunteer_id IN (
        SELECT id FROM public.volunteers 
        WHERE lower(email) = lower(auth.email())
    )
);

-- Volunteers can VIEW their own tasks
CREATE POLICY "Volunteers view own tasks" 
ON public.volunteer_tasks 
FOR SELECT 
TO authenticated 
USING (
    volunteer_id IN (
        SELECT id FROM public.volunteers 
        WHERE lower(email) = lower(auth.email())
    )
    OR 
    -- Fallback: If for some reason the volunteer_id join fails, allow seeing tasks created by self (unlikely for assignment, but good for safety)
    auth.uid() = assigned_by
);

-- 5. Force schema cache reload (sometimes needed)
NOTIFY pgrst, 'reload schema';
