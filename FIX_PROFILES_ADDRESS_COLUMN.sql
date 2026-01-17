-- FIX: ADD MISSING COLUMNS TO PROFILES TABLE AND REFRESH CACHE
-- This script ensures the 'address' and other necessary columns exist in the 'profiles' table.

ALTER TABLE profiles 
ADD COLUMN IF NOT EXISTS department TEXT,
ADD COLUMN IF NOT EXISTS mobile TEXT,
ADD COLUMN IF NOT EXISTS dob TEXT,
ADD COLUMN IF NOT EXISTS emergency TEXT,
ADD COLUMN IF NOT EXISTS gender TEXT,
ADD COLUMN IF NOT EXISTS address TEXT,
ADD COLUMN IF NOT EXISTS appointment_date TEXT;

-- Refresh the PostgREST schema cache to make new columns visible to the frontend
NOTIFY pgrst, 'reload schema';

-- Verification (Run this to check if columns exist)
-- SELECT column_name, data_type FROM information_schema.columns WHERE table_name = 'profiles';
