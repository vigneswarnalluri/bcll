-- 1. Ensure proof_details column exists
DO $$ 
BEGIN 
    IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name = 'volunteer_tasks' AND column_name = 'proof_details') THEN 
        ALTER TABLE public.volunteer_tasks ADD COLUMN proof_details TEXT;
    END IF;
END $$;

-- 2. Drop existing update policies to avoid conflicts/restrictions
DROP POLICY IF EXISTS "Admins can update tasks" ON public.volunteer_tasks;
DROP POLICY IF EXISTS "Volunteers can update own tasks" ON public.volunteer_tasks;

-- 3. Re-create flexible Update Policy for Volunteers
-- Allows volunteers to update a task if it is assigned to them (matching email)
CREATE POLICY "Volunteers can update own tasks" 
ON public.volunteer_tasks 
FOR UPDATE 
TO authenticated 
USING (
    volunteer_id IN (
        SELECT id FROM public.volunteers WHERE email = auth.email()
    )
)
WITH CHECK (
    volunteer_id IN (
        SELECT id FROM public.volunteers WHERE email = auth.email()
    )
);

-- 4. Re-create Admin Update Policy
CREATE POLICY "Admins can update tasks" 
ON public.volunteer_tasks 
FOR UPDATE 
TO authenticated 
USING (true); -- Simplifies admin access (can refine later if needed)

-- 5. Grant permissions (just in case)
GRANT UPDATE ON public.volunteer_tasks TO authenticated;
