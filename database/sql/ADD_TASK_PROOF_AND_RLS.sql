-- Add proof column to volunteer_tasks if it doesn't exist
DO $$ 
BEGIN 
    IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name = 'volunteer_tasks' AND column_name = 'proof_details') THEN 
        ALTER TABLE public.volunteer_tasks ADD COLUMN proof_details TEXT;
    END IF;
END $$;

-- Update RLS to allow volunteers to UPDATE their own tasks (to submit proof)
CREATE POLICY "Volunteers can update own tasks" 
ON public.volunteer_tasks 
FOR UPDATE 
TO authenticated 
USING (
    volunteer_id IN (SELECT id FROM public.volunteers WHERE email = auth.email())
)
WITH CHECK (
    volunteer_id IN (SELECT id FROM public.volunteers WHERE email = auth.email())
);
