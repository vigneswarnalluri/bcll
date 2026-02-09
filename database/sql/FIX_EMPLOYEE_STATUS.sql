-- REPAIR EMPLOYEE STATUS LIFECYCLE (V2 - DATA MIGRATION INCLUDED)
-- Fixes the check constraint violation by normalizing data first.

DO $$ 
BEGIN
    -- 1. DROP the existing restrictive constraint
    ALTER TABLE public.employees DROP CONSTRAINT IF EXISTS employees_status_check;

    -- 2. DATA NORMALIZATION: Map legacy statuses to the new institutional lifecycle
    -- This ensures that any rows with 'Approved', 'Pending', or NULL are converted 
    -- to 'Active' before the strict constraint is applied.
    UPDATE public.employees 
    SET status = 'Active' 
    WHERE status NOT IN ('New', 'HR Verified', 'Admin Approved', 'Active', 'Rejected', 'Suspended', 'Terminated') 
       OR status IS NULL;

    -- 3. ADD the enhanced constraint with all lifecycle stages
    ALTER TABLE public.employees ADD CONSTRAINT employees_status_check 
    CHECK (status IN ('New', 'HR Verified', 'Admin Approved', 'Active', 'Rejected', 'Suspended', 'Terminated'));

    -- 4. ENSURE audit columns exist for governance
    IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name='employees' AND column_name='decline_reason') THEN
        ALTER TABLE public.employees ADD COLUMN decline_reason TEXT;
    END IF;
END $$;

-- Reload PostgREST to apply changes immediately
NOTIFY pgrst, 'reload schema';
