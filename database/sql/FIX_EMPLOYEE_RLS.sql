-- FIX RLS FOR EMPLOYEES TABLE TO ALLOW ADMIN INSERTS

-- 1. Ensure RLS is enabled
ALTER TABLE employees ENABLE ROW LEVEL SECURITY;

-- 2. Drop existing policies if any (to avoid conflicts/duplicates)
DROP POLICY IF EXISTS "Admins manage employees" ON employees;
DROP POLICY IF EXISTS "Employees view self" ON employees;

-- 3. Create Policy: Admins can do ANYTHING (Select, Insert, Update, Delete)
CREATE POLICY "Admins manage employees"
ON employees
FOR ALL
TO authenticated
USING (
  -- Check if the user is an admin using our secure function
  is_admin()
);

-- 4. Create Policy: Employees can VIEW their own record
CREATE POLICY "Employees view self"
ON employees
FOR SELECT
TO authenticated
USING (
  email = auth.jwt() ->> 'email'
);
