-- UPDATING PROFILES TABLE FOR ADMIN HQ
-- Adding institutional and personal fields to the administrative profiles

ALTER TABLE profiles 
ADD COLUMN IF NOT EXISTS department TEXT,
ADD COLUMN IF NOT EXISTS mobile TEXT,
ADD COLUMN IF NOT EXISTS dob TEXT,
ADD COLUMN IF NOT EXISTS emergency TEXT,
ADD COLUMN IF NOT EXISTS gender TEXT,
ADD COLUMN IF NOT EXISTS address TEXT,
ADD COLUMN IF NOT EXISTS appointment_date TEXT;

-- Refreshing the schema cache for PostgREST
NOTIFY pgrst, 'reload schema';
