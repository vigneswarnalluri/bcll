-- AUTH PROVISIONING HELPER
-- This script enables administrators to create authentication logins directly from the dashboard securely.

-- 1. Enable pgcrypto for password hashing
CREATE EXTENSION IF NOT EXISTS "pgcrypto";

-- 2. Create the Provisioning Function
-- This function runs with SECURITY DEFINER to bypass client-side limitations
CREATE OR REPLACE FUNCTION provision_admin_auth(
    email_text TEXT,
    password_text TEXT,
    full_name_text TEXT,
    role_text TEXT
) RETURNS UUID AS $$
DECLARE
    new_user_id UUID;
BEGIN
    -- Check if user already exists
    IF EXISTS (SELECT 1 FROM auth.users WHERE email = email_text) THEN
        RETURN (SELECT id FROM auth.users WHERE email = email_text);
    END IF;

    -- 1. Create User in Auth.Users table directly
    INSERT INTO auth.users (
        instance_id,
        id,
        aud,
        role,
        email,
        encrypted_password,
        email_confirmed_at,
        last_sign_in_at,
        raw_app_meta_data,
        raw_user_meta_data,
        is_super_admin,
        created_at,
        updated_at
    )
    VALUES (
        '00000000-0000-0000-0000-000000000000',
        gen_random_uuid(),
        'authenticated',
        'authenticated',
        email_text,
        crypt(password_text, gen_salt('bf')),
        now(),
        now(),
        '{"provider":"email","providers":["email"]}',
        jsonb_build_object('full_name', full_name_text, 'role', role_text),
        false,
        now(),
        now()
    )
    RETURNING id INTO new_user_id;

    -- 2. Create Identity (Required for Supabase Auth to detect the user correctly)
    INSERT INTO auth.identities (
        id,
        user_id,
        identity_data,
        provider,
        provider_id,
        last_sign_in_at,
        created_at,
        updated_at
    )
    VALUES (
        gen_random_uuid(),
        new_user_id,
        jsonb_build_object('sub', new_user_id, 'email', email_text),
        'email',
        email_text,
        now(),
        now(),
        now()
    );

    RETURN new_user_id;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;
