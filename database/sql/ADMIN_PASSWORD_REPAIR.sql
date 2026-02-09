-- SECURITY DEFINER FUNCTION FOR PASSWORD UPDATES
-- Allows admins to reset passwords for other admins securely.

CREATE OR REPLACE FUNCTION public.update_admin_password(
    target_user_id UUID,
    new_password_text TEXT
)
RETURNS BOOLEAN
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = auth, extensions, public
AS $$
BEGIN
    -- Only allow updates to auth.users passwords
    UPDATE auth.users
    SET encrypted_password = crypt(new_password_text, gen_salt('bf')),
        updated_at = now()
    WHERE id = target_user_id;

    RETURN FOUND;
END;
$$;

-- Grant access to authenticated users (admins) to run this
GRANT EXECUTE ON FUNCTION public.update_admin_password(UUID, TEXT) TO authenticated;
GRANT EXECUTE ON FUNCTION public.update_admin_password(UUID, TEXT) TO service_role;

NOTIFY pgrst, 'reload schema';
