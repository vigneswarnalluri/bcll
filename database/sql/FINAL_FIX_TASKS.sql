-- 1. Fix Database Structure (Add Missing Columns)
DO $$ 
BEGIN 
    -- Ensure 'assigned_by' column exists
    IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name = 'volunteer_tasks' AND column_name = 'assigned_by') THEN 
        ALTER TABLE public.volunteer_tasks ADD COLUMN assigned_by UUID REFERENCES auth.users(id);
    END IF;

    -- Ensure 'proof_details' column exists
    IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name = 'volunteer_tasks' AND column_name = 'proof_details') THEN 
        ALTER TABLE public.volunteer_tasks ADD COLUMN proof_details TEXT;
    END IF;

    -- Ensure 'updated_at' column exists
    IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name = 'volunteer_tasks' AND column_name = 'updated_at') THEN 
        ALTER TABLE public.volunteer_tasks ADD COLUMN updated_at TIMESTAMPTZ DEFAULT now();
    END IF;
END $$;

-- 2. Reset Permissions (RLS Policies)
ALTER TABLE public.volunteer_tasks ENABLE ROW LEVEL SECURITY;

-- Drop all potentially conflicting policies
DROP POLICY IF EXISTS "Admins can insert tasks" ON public.volunteer_tasks;
DROP POLICY IF EXISTS "Admins can update tasks" ON public.volunteer_tasks;
DROP POLICY IF EXISTS "Admins can delete tasks" ON public.volunteer_tasks;
DROP POLICY IF EXISTS "Admins review all tasks" ON public.volunteer_tasks;
DROP POLICY IF EXISTS "Volunteers can update own tasks" ON public.volunteer_tasks;
DROP POLICY IF EXISTS "Volunteers view own tasks" ON public.volunteer_tasks;
DROP POLICY IF EXISTS "Admins full access" ON public.volunteer_tasks;
DROP POLICY IF EXISTS "Volunteers update own tasks" ON public.volunteer_tasks;

-- 3. Create New Policies

-- Policy A: Admins get full access to everything
CREATE POLICY "Admins full access" 
ON public.volunteer_tasks 
FOR ALL 
TO authenticated 
USING (true) 
WITH CHECK (true);

-- Policy B: Volunteers can VIEW tasks assigned to them
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
    auth.uid() = assigned_by
);

-- Policy C: Volunteers can UPDATE tasks assigned to them (to submit proof)
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

-- 4. Reload Schema
NOTIFY pgrst, 'reload schema';
