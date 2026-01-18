-- FINAL SCHEMA & AUTH LOGIC SYNC
-- Ensuring all administrative roles have proper access and the schema cache is fresh.

-- 1. Update the is_admin() helper to recognize all new specialized roles
CREATE OR REPLACE FUNCTION public.is_admin()
RETURNS BOOLEAN
LANGUAGE plpgsql
SECURITY DEFINER
AS $$
BEGIN
  RETURN EXISTS (
    SELECT 1 FROM public.profiles
    WHERE (user_id = auth.uid() OR id = auth.uid())
    AND role_type IN ('Super Admin', 'Admin', 'Co-Admin', 'HR Manager', 'Finance Officer', 'Field Super')
  );
END;
$$;

-- 2. Ensure RLS policies are up to date with the new function
-- (The existing policies use is_admin(), so updating the function is enough)

-- 3. Force a full schema reload to clear "Database error querying schema"
NOTIFY pgrst, 'reload schema';
