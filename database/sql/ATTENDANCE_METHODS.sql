-- ENHANCE ATTENDANCE TABLE WITH LOGGING METHODS
-- Support for Manual, Self, and Mobile entry methods.

ALTER TABLE public.attendance ADD COLUMN IF NOT EXISTS logging_method TEXT CHECK (logging_method IN ('Manual', 'Self', 'Mobile')) DEFAULT 'Manual';

-- Ensure employees table has user_id for self check-in mapping
-- This allows us to identify which employee is currently logged in.
ALTER TABLE public.employees ADD COLUMN IF NOT EXISTS user_id UUID REFERENCES auth.users(id);

-- Reload PostgREST
NOTIFY pgrst, 'reload schema';
