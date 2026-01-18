-- EXPANDING ROLE TYPES IN PROFILES TABLE
-- Allowing for more granular administrative and managerial roles

-- 1. Drop the existing constraint if it exists
-- We first need to find the constraint name. It is usually 'profiles_role_type_check' 
-- but let's do a safe drop.
ALTER TABLE profiles DROP CONSTRAINT IF EXISTS profiles_role_type_check;

-- 2. Add the expanded constraint
ALTER TABLE profiles ADD CONSTRAINT profiles_role_type_check 
CHECK (role_type IN (
    'Super Admin', 
    'Admin', 
    'Co-Admin', 
    'HR Manager', 
    'Finance Officer', 
    'Field Super', 
    'Employee', 
    'Volunteer'
));

-- 3. Also update any existing roles if needed (optional)
-- UPDATE profiles SET role_type = 'Admin' WHERE role_type IS NULL;

-- Refresh schema cache
NOTIFY pgrst, 'reload schema';
