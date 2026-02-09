-- Ensure required extensions are active
CREATE EXTENSION IF NOT EXISTS pgcrypto;
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";

-- SECURITY DEFINER FUNCTION FOR ADMIN PROVISIONING
-- This allows a logged-in admin to create a new auth account without logging out.
-- MUST be run in the Supabase SQL Editor.

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
    -- 1. Check if user already exists
    IF EXISTS (SELECT 1 FROM auth.users WHERE email = email_text) THEN
        RAISE EXCEPTION 'A user with this email already exists in the authentication registry.';
    END IF;

    -- 2. Create the user in auth.users
    INSERT INTO auth.users (
        instance_id,
        id,
        aud,
        role,
        email,
        encrypted_password,
        email_confirmed_at,
        raw_app_meta_data,
        raw_user_meta_data,
        is_super_admin,
        created_at,
        updated_at,
        confirmation_token,
        email_change_token_new,
        recovery_token
    )
    VALUES (
        '00000000-0000-0000-0000-000000000000',
        gen_random_uuid(),
        'authenticated',
        'authenticated',
        email_text,
        crypt(password_text, gen_salt('bf')),
        now(),
        jsonb_build_object('provider', 'email', 'providers', array['email']),
        jsonb_build_object('full_name', full_name_text, 'role', role_text),
        false,
        now(),
        now(),
        '',
        '',
        ''
    )
    RETURNING id INTO new_user_id;

    -- 3. Create the identity
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
        jsonb_build_object('sub', new_user_id::text, 'email', email_text),
        'email',
        email_text,
        now(),
        now(),
        now()
    );

    RETURN new_user_id;
END;
$$;

-- Grant access to authenticated users (admins) to run this
GRANT EXECUTE ON FUNCTION public.provision_admin_auth(TEXT, TEXT, TEXT, TEXT) TO authenticated;
GRANT EXECUTE ON FUNCTION public.provision_admin_auth(TEXT, TEXT, TEXT, TEXT) TO service_role;
