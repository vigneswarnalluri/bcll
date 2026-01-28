-- CRITICAL FIX: Missing 'username' column in profiles table
-- This allows admins to login using their system username instead of email.

DO $$ 
BEGIN
    -- 1. Add username column if missing
    IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_schema='public' AND table_name='profiles' AND column_name='username') THEN
        ALTER TABLE public.profiles ADD COLUMN username TEXT UNIQUE;
    END IF;
END $$;

-- 2. Force Notify PostgREST to reload
NOTIFY pgrst, 'reload schema';
