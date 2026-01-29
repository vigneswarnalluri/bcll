-- Migration to add detailed volunteer registration fields
ALTER TABLE public.volunteers 
ADD COLUMN IF NOT EXISTS photograph_url TEXT,
ADD COLUMN IF NOT EXISTS gender TEXT,
ADD COLUMN IF NOT EXISTS aadhaar_number TEXT,
ADD COLUMN IF NOT EXISTS organization_name TEXT,
ADD COLUMN IF NOT EXISTS preferred_location TEXT;

-- Update availability to be more descriptive if needed, though we already have it.
-- We'll assume availability is a text field.

COMMENT ON COLUMN public.volunteers.aadhaar_number IS 'Stored for verification purposes only';
