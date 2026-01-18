-- ENFORCING DATA INTEGRITY FOR ADMIN CONTROLS
-- This ensures each admin profile has exactly one set of permissions.

-- 1. Clean up potential duplicates (Keep the most recent)
DELETE FROM admin_controls a
WHERE a.id NOT IN (
    SELECT id FROM (
        SELECT id, ROW_NUMBER() OVER (PARTITION BY admin_profile_id ORDER BY created_at DESC) as rn
        FROM admin_controls
    ) tmp WHERE rn = 1
);

-- 2. Add Unique Constraint to admin_profile_id
-- This is critical for the 'upsert' command in the dashboard to work correctly.
ALTER TABLE admin_controls 
DROP CONSTRAINT IF EXISTS admin_controls_admin_profile_id_key;

ALTER TABLE admin_controls 
ADD CONSTRAINT admin_controls_admin_profile_id_key UNIQUE (admin_profile_id);

-- 3. Verify RLS for admin_controls
-- Super Admins must be able to manage this table
ALTER TABLE admin_controls ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS "Admins full access controls" ON admin_controls;
CREATE POLICY "Admins full access controls" ON admin_controls 
FOR ALL TO authenticated 
USING (public.is_admin());

-- Refresh schema cache
NOTIFY pgrst, 'reload schema';
