-- Create the volunteer_tasks table if it doesn't represent
CREATE TABLE IF NOT EXISTS public.volunteer_tasks (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    volunteer_id UUID REFERENCES public.volunteers(id) ON DELETE CASCADE,
    title TEXT NOT NULL,
    description TEXT,
    priority TEXT DEFAULT 'Medium', -- High, Medium, Low
    deadline DATE,
    status TEXT DEFAULT 'Pending', -- Pending, Completed, Verified
    assigned_by UUID REFERENCES auth.users(id),
    created_at TIMESTAMPTZ DEFAULT now(),
    updated_at TIMESTAMPTZ DEFAULT now()
);

-- Enable Row Level Security
ALTER TABLE public.volunteer_tasks ENABLE ROW LEVEL SECURITY;

-- 1. Allow Admins (Authenticated Users) to INSERT tasks (Assign Missions)
DROP POLICY IF EXISTS "Admins can insert tasks" ON public.volunteer_tasks;
CREATE POLICY "Admins can insert tasks" 
ON public.volunteer_tasks 
FOR INSERT 
TO authenticated 
WITH CHECK (true);

-- 2. Allow Admins to UPDATE tasks (Edit/Verify Missions)
DROP POLICY IF EXISTS "Admins can update tasks" ON public.volunteer_tasks;
CREATE POLICY "Admins can update tasks" 
ON public.volunteer_tasks 
FOR UPDATE 
TO authenticated 
USING (true);

-- 3. Allow Admins to DELETE tasks (Cancel Missions)
DROP POLICY IF EXISTS "Admins can delete tasks" ON public.volunteer_tasks;
CREATE POLICY "Admins can delete tasks" 
ON public.volunteer_tasks 
FOR DELETE 
TO authenticated 
USING (true);

-- 4. Allow Everyone (Admins + Volunteers via email match logic if needed) to SELECT
-- Ideally, admins see all, volunteers see their own.
DROP POLICY IF EXISTS "Admins review all tasks" ON public.volunteer_tasks;
CREATE POLICY "Admins review all tasks" 
ON public.volunteer_tasks 
FOR SELECT 
TO authenticated 
USING (true);

-- 5. Allow Volunteers (via public access or specific login logic if they are not auth.users) to see their own?
-- Since volunteers login via a different mechanism or if they are also auth users:
-- If volunteers are NOT auth.users (they seem to be just in 'volunteers' table), and the dashboard 
-- fetches them using a public client or the same client, we might need a public read policy
-- OR if they login via auth, we map their email.

-- Assuming Volunteers are strictly managed by Admins for now based on the error "row-level security policy for table volunteer_tasks"
-- The error happened when an ADMIN tried to INSERT. The policy "Admins can insert tasks" above fixes this.
