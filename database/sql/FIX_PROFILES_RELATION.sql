-- FIX PROFILE AND PERMISSION RLS
-- This ensures that Admins can always read and create profiles/controls.

DO $$ 
BEGIN
    -- 1. Profiles Table Policies
    IF NOT EXISTS (SELECT 1 FROM pg_policy WHERE polname = 'Admins can manage all profiles') THEN
        CREATE POLICY "Admins can manage all profiles" ON public.profiles FOR ALL TO authenticated USING (true);
    END IF;

    -- 2. Admin Controls Table Policies
    IF NOT EXISTS (SELECT 1 FROM pg_policy WHERE polname = 'Admins can manage all permissions') THEN
        CREATE POLICY "Admins can manage all permissions" ON public.admin_controls FOR ALL TO authenticated USING (true);
    END IF;

    -- 3. Ensure tables exist with correct relations (just in case)
    CREATE TABLE IF NOT EXISTS public.profiles (
        id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
        user_id UUID UNIQUE NOT NULL,
        full_name TEXT,
        email TEXT,
        role_type TEXT,
        department TEXT,
        mobile TEXT,
        dob DATE,
        emergency TEXT,
        username TEXT UNIQUE,
        created_at TIMESTAMPTZ DEFAULT now(),
        updated_at TIMESTAMPTZ DEFAULT now()
    );

    CREATE TABLE IF NOT EXISTS public.admin_controls (
        id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
        admin_profile_id UUID UNIQUE NOT NULL REFERENCES public.profiles(id) ON DELETE CASCADE,
        authority_level TEXT DEFAULT 'L3',
        -- Permissions
        perm_view_employees BOOLEAN DEFAULT true,
        perm_edit_employees BOOLEAN DEFAULT false,
        perm_approve_leaves BOOLEAN DEFAULT false,
        perm_process_salary BOOLEAN DEFAULT false,
        perm_bank_access BOOLEAN DEFAULT false,
        perm_volunteer_approval BOOLEAN DEFAULT false,
        perm_scholarship_verify BOOLEAN DEFAULT false,
        perm_manage_admins BOOLEAN DEFAULT false,
        perm_student_mgmt BOOLEAN DEFAULT false,
        perm_report_approval BOOLEAN DEFAULT false,
        perm_vault_access BOOLEAN DEFAULT false,
        perm_audit_logs BOOLEAN DEFAULT false,
        perm_org_master BOOLEAN DEFAULT false,
        -- Limits
        salary_approval_limit DECIMAL DEFAULT 0,
        expenditure_limit DECIMAL DEFAULT 0,
        fund_utilization_auth BOOLEAN DEFAULT false,
        fin_reports_auth BOOLEAN DEFAULT false,
        statutory_docs_auth BOOLEAN DEFAULT false,
        created_at TIMESTAMPTZ DEFAULT now(),
        updated_at TIMESTAMPTZ DEFAULT now()
    );

END $$;

ALTER TABLE public.profiles ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.admin_controls ENABLE ROW LEVEL SECURITY;

GRANT ALL ON public.profiles TO authenticated;
GRANT ALL ON public.admin_controls TO authenticated;
GRANT ALL ON public.profiles TO service_role;
GRANT ALL ON public.admin_controls TO service_role;

NOTIFY pgrst, 'reload schema';
