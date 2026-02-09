-- Table to track ad-hoc volunteer activities and logs
CREATE TABLE IF NOT EXISTS public.volunteer_activities (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    volunteer_id UUID REFERENCES public.volunteers(id) ON DELETE CASCADE,
    activity_type TEXT NOT NULL, -- e.g., 'Field Work', 'Event Support', 'Administrative', 'Other'
    description TEXT,
    hours_spent DECIMAL(5,2) NOT NULL DEFAULT 0,
    activity_date DATE DEFAULT CURRENT_DATE,
    status TEXT DEFAULT 'Pending', -- Pending, Approved, Rejected
    proof_url TEXT, -- Link to uploaded image/doc
    admin_feedback TEXT,
    created_at TIMESTAMPTZ DEFAULT now(),
    updated_at TIMESTAMPTZ DEFAULT now()
);

-- Enable RLS
ALTER TABLE public.volunteer_activities ENABLE ROW LEVEL SECURITY;

-- Policy: Volunteers can view their own activities
CREATE POLICY "Volunteers can view own activities" 
ON public.volunteer_activities 
FOR SELECT 
USING (auth.email() IN (SELECT email FROM public.volunteers WHERE id = volunteer_activities.volunteer_id));

-- Policy: Volunteers can insert their own activities
CREATE POLICY "Volunteers can log new activities" 
ON public.volunteer_activities 
FOR INSERT 
WITH CHECK (
    auth.email() IN (SELECT email FROM public.volunteers WHERE id = volunteer_id)
);

-- Policy: Admins can view all activities (Assuming admins have a way to bypass or have a specific role)
-- For simplicity in this setup, we'll allow authenticated users to read all if they are admins, 
-- but since we don't have a perfect "is_admin" check in RLS easily without complex queries,
-- we'll rely on the dashboard logic to filter, or add a broad "Admins read all" if we can.
-- A safe fallback is to allow "authenticated" to read all, but that lets volunteers see each other's if they guess IDs.
-- Better:
CREATE POLICY "Admins can view all activities" 
ON public.volunteer_activities 
FOR ALL 
USING (
    EXISTS (SELECT 1 FROM public.profiles WHERE user_id = auth.uid() AND role_type IN ('Super Admin', 'Admin', 'HR Manager', 'Supervisor'))
);
