-- 1. Ensure 'username' column exists on profiles
ALTER TABLE public.profiles ADD COLUMN IF NOT EXISTS username TEXT UNIQUE;

-- 2. Resolve the "Database error querying schema"
-- This gives the login system permission to see the database structure
GRANT USAGE ON SCHEMA public TO anon, authenticated, authenticator;
GRANT USAGE ON SCHEMA auth TO anon, authenticated, authenticator;
GRANT SELECT ON public.profiles TO anon, authenticated, authenticator;

-- 3. Add Security Policy for 'anon' (Guest) lookup
-- This allows the Login screen to find an email using a username
DROP POLICY IF EXISTS "Allow anon to lookup emails by username" ON public.profiles;
CREATE POLICY "Allow anon to lookup emails by username" 
ON public.profiles 
FOR SELECT 
TO anon 
USING (true);

-- 4. Fix the Search Path (Correct GPS for the database)
ALTER ROLE authenticator SET search_path TO public, auth, extensions;
ALTER ROLE anon SET search_path TO public, extensions;
ALTER ROLE authenticated SET search_path TO public, extensions;

-- 5. Force update 'sai' profile if it exists but username is empty
-- This ensures 'sai' can log in immediately
UPDATE public.profiles 
SET username = 'sai' 
WHERE (full_name = 'sai' OR email = 'sai@gmail.com') 
AND (username IS NULL OR username = '');

-- 6. Refresh Registry
NOTIFY pgrst, 'reload schema';
