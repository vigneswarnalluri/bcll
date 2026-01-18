-- FIX VOLUNTEER SUBMISSION ISSUES

-- 1. Add missing columns to volunteers table to match registration form
ALTER TABLE volunteers 
ADD COLUMN IF NOT EXISTS dob DATE,
ADD COLUMN IF NOT EXISTS blood_group TEXT,
ADD COLUMN IF NOT EXISTS address TEXT;

-- 2. Add RLS policy to allow public submissions (anonymous inserts)
-- This allows anyone on the website to sign up as a volunteer
DROP POLICY IF EXISTS "Allow public volunteer registration" ON volunteers;
CREATE POLICY "Allow public volunteer registration" 
ON volunteers FOR INSERT 
TO anon, authenticated
WITH CHECK (true);

-- 3. Ensure admins can still see and manage them
DROP POLICY IF EXISTS "Admins manage volunteers" ON volunteers;
CREATE POLICY "Admins manage volunteers" 
ON volunteers FOR ALL 
TO authenticated 
USING (is_admin());
