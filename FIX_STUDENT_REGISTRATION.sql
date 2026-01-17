-- FINAL FIX FOR STUDENT REGISTRATION SCHEMA
-- This script ensures ALL required columns for the fellowship form exist in the students table.

-- 1. Ensure all columns exist with correct types
ALTER TABLE students 
ADD COLUMN IF NOT EXISTS aadhaar_no TEXT,
ADD COLUMN IF NOT EXISTS dob TEXT,
ADD COLUMN IF NOT EXISTS email TEXT,
ADD COLUMN IF NOT EXISTS phone TEXT,
ADD COLUMN IF NOT EXISTS student_id TEXT,
ADD COLUMN IF NOT EXISTS academic_year TEXT,
ADD COLUMN IF NOT EXISTS program TEXT,
ADD COLUMN IF NOT EXISTS acc_holder TEXT,
ADD COLUMN IF NOT EXISTS bank_name TEXT,
ADD COLUMN IF NOT EXISTS acc_no TEXT,
ADD COLUMN IF NOT EXISTS ifsc_code TEXT;

-- 2. Update existing rows if necessary (optional)
-- UPDATE students SET status = 'Active' WHERE status IS NULL;

-- 3. Update RLS policies to allow public enrollment
DROP POLICY IF EXISTS "Public student enrollment" ON students;
CREATE POLICY "Public student enrollment" 
ON students FOR INSERT 
TO anon, authenticated
WITH CHECK (true);

-- 4. Ensure admins have full management access
DROP POLICY IF EXISTS "Admins manage students" ON students;
CREATE POLICY "Admins manage students" 
ON students FOR ALL 
TO authenticated 
USING (
  EXISTS (
    SELECT 1 FROM profiles 
    WHERE (id = auth.uid() OR user_id = auth.uid()) 
    AND role_type IN ('Super Admin', 'Admin', 'Co-Admin')
  )
);
