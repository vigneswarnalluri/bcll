-- EMERGENCY SCHEMA REPAIR SCRIPT
-- This script fixes the "relation not found" and "permission denied" errors 
-- caused by the database search_path being changed.

-- 1. Reset Global Search Path to include public
ALTER DATABASE postgres SET search_path TO public, auth, extensions;

-- 2. Reset Role-specific Search Paths (Force sync)
ALTER ROLE postgres SET search_path TO public, auth, extensions;
ALTER ROLE authenticator SET search_path TO public, auth, extensions;
ALTER ROLE anon SET search_path TO public, auth, extensions;
ALTER ROLE authenticated SET search_path TO public, auth, extensions;

-- 3. Verify
SHOW search_path;

-- NOTE: After running this, the "students" and "volunteers" tables 
-- in the public schema will be visible again.
