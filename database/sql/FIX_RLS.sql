-- FIX INFINITE RECURSION IN RLS

-- 1. Drop the problematic policy
DROP POLICY "Admins can view all profiles" ON profiles;

-- 2. Create a secure function to check admin status
-- This bypasses RLS (SECURITY DEFINER) to safely check roles without recursion
CREATE OR REPLACE FUNCTION is_admin()
RETURNS BOOLEAN AS $$
BEGIN
  RETURN EXISTS (
    SELECT 1 
    FROM profiles 
    WHERE id = auth.uid() 
    AND role_type IN ('Super Admin', 'Admin')
  );
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- 3. Re-create the policy using the clean function
CREATE POLICY "Admins can view all profiles" ON profiles
    FOR SELECT TO authenticated
    USING (is_admin());
