-- EXPAND ADMIN PERMISSIONS
-- Include 'Co-Admin' in the admin check, just in case.

CREATE OR REPLACE FUNCTION public.is_admin()
RETURNS BOOLEAN
LANGUAGE plpgsql
SECURITY DEFINER
AS $$
BEGIN
  RETURN EXISTS (
    SELECT 1 FROM public.profiles
    WHERE id = auth.uid()
    AND role_type IN ('Super Admin', 'Admin', 'Co-Admin')
  );
END;
$$;
