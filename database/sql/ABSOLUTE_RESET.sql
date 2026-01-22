-- 1. IDENTIFY THE SOURCE OF THE CONFLICT
-- This will tell us exactly where the "fake" users table is hiding.
SELECT table_schema, table_name, table_type 
FROM information_schema.tables 
WHERE table_name = 'users';

-- 2. FORCE TERMINATE ALL CONNECTIONS (CLEARS CACHE)
-- This restarts the internal map of the database.
SELECT pg_terminate_backend(pid) 
FROM pg_stat_activity 
WHERE datname = current_database() 
AND pid <> pg_backend_pid();

-- 3. THE ABSOLUTE RESET OF SEARCH_PATH
-- This is the only way to stop the "Scan error on column index 3".
-- We reset the database itself, not just the roles.
ALTER DATABASE postgres SET search_path TO auth, extensions;

-- 4. CLEANUP EVERY ROLE
ALTER ROLE postgres SET search_path TO auth, extensions;
ALTER ROLE authenticator SET search_path TO auth, extensions;
ALTER ROLE anon SET search_path TO auth, extensions;
ALTER ROLE authenticated SET search_path TO auth, extensions;

-- 5. RELOAD POSTGREST
NOTIFY pgrst, 'reload schema';
