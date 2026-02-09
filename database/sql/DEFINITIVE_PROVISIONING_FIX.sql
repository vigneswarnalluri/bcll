-- FINAL DEFINITIVE FIX FOR ADMIN PROVISIONING
-- Run this in Supabase SQL Editor to fix all reference and identity errors.

-- 1. Ensure Required Extensions
CREATE EXTENSION IF NOT EXISTS pgcrypto;
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";

-- 2. Repair Profiles & admin_controls Structure
DO $$ 
BEGIN
    -- Ensure Profiles Table
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

    -- Ensure Admin Controls Table
    CREATE TABLE IF NOT EXISTS public.admin_controls (
        id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
        admin_profile_id UUID UNIQUE NOT NULL REFERENCES public.profiles(id) ON DELETE CASCADE,
        authority_level TEXT DEFAULT 'L3',
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
        salary_approval_limit DECIMAL DEFAULT 0,
        expenditure_limit DECIMAL DEFAULT 0,
        fund_utilization_auth BOOLEAN DEFAULT false,
        fin_reports_auth BOOLEAN DEFAULT false,
        statutory_docs_auth BOOLEAN DEFAULT false,
        created_at TIMESTAMPTZ DEFAULT now(),
        updated_at TIMESTAMPTZ DEFAULT now()
    );

    -- Upgrade existing columns if they are missing (for safety during re-runs)
    IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name='admin_controls' AND column_name='salary_approval_limit') THEN
        ALTER TABLE public.admin_controls ADD COLUMN salary_approval_limit DECIMAL DEFAULT 0;
    END IF;
END $$;

-- 3. Provisioning Core Function (The Bridge)
CREATE OR REPLACE FUNCTION public.provision_admin_auth(
    email_text TEXT,
    full_name_text TEXT,
    password_text TEXT,
    role_text TEXT
)
RETURNS UUID
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = auth, extensions, public
AS $$
DECLARE
    new_user_id UUID;
BEGIN
    -- Check if user already exists
    IF EXISTS (SELECT 1 FROM auth.users WHERE email = email_text) THEN
        RAISE EXCEPTION 'A user with this email already exists in the authentication registry.';
    END IF;

    -- Insert into auth.users
    INSERT INTO auth.users (
        instance_id, id, aud, role, email, encrypted_password, email_confirmed_at,
        raw_app_meta_data, raw_user_meta_data, is_super_admin, created_at, updated_at,
        confirmation_token, email_change_token_new, recovery_token
    )
    VALUES (
        '00000000-0000-0000-0000-000000000000', gen_random_uuid(), 'authenticated', 'authenticated',
        email_text, crypt(password_text, gen_salt('bf')), now(),
        jsonb_build_object('provider', 'email', 'providers', array['email']),
        jsonb_build_object('full_name', full_name_text, 'role', role_text),
        false, now(), now(), '', '', ''
    )
    RETURNING id INTO new_user_id;

    -- Link Identity
    INSERT INTO auth.identities (
        id, user_id, identity_data, provider, provider_id, last_sign_in_at, created_at, updated_at
    )
    VALUES (
        gen_random_uuid(), new_user_id, jsonb_build_object('sub', new_user_id::text, 'email', email_text),
        'email', email_text, now(), now(), now()
    );

    RETURN new_user_id;
END;
$$;

-- 4. Set Permissions & Security
ALTER TABLE public.profiles ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.admin_controls ENABLE ROW LEVEL SECURITY;

-- Grant broad but authenticated access for Admin management
DROP POLICY IF EXISTS "Admins can manage all profiles" ON public.profiles;
CREATE POLICY "Admins can manage all profiles" ON public.profiles FOR ALL TO authenticated USING (true);

DROP POLICY IF EXISTS "Admins can manage all permissions" ON public.admin_controls;
CREATE POLICY "Admins can manage all permissions" ON public.admin_controls FOR ALL TO authenticated USING (true);

GRANT ALL ON public.profiles TO authenticated;
GRANT ALL ON public.admin_controls TO authenticated;
GRANT ALL ON public.profiles TO service_role;
GRANT ALL ON public.admin_controls TO service_role;
GRANT EXECUTE ON FUNCTION public.provision_admin_auth(TEXT, TEXT, TEXT, TEXT) TO authenticated;

NOTIFY pgrst, 'reload schema';
