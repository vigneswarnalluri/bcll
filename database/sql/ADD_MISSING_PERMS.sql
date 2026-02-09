
-- Add missing permission columns to admin_controls table
ALTER TABLE admin_controls 
ADD COLUMN IF NOT EXISTS perm_governance BOOLEAN DEFAULT FALSE,
ADD COLUMN IF NOT EXISTS perm_compliance BOOLEAN DEFAULT FALSE,
ADD COLUMN IF NOT EXISTS fin_reports_auth BOOLEAN DEFAULT FALSE;

-- Grant access to authenticated users if RLS needs it (usually implicitly handled for owners, but good to be safe)
-- COMMENTED OUT to avoid errors if policies don't exist, but typically:
-- GRANT UPDATE ON admin_controls TO authenticated;
