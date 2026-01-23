-- FORCE SYNC: Ensure board_members table has all required columns
-- This script uses ALTER TABLE to handle existing tables that might have different schemas.

DO $$ 
BEGIN 
    -- 1. Ensure Table Exists First (In case it was dropped or never created)
    CREATE TABLE IF NOT EXISTS public.board_members (
        id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
        full_name TEXT NOT NULL,
        designation TEXT NOT NULL DEFAULT 'Member',
        created_at TIMESTAMPTZ DEFAULT now()
    );

    -- 2. Add Missing Columns if they don't exist
    IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_schema='public' AND table_name='board_members' AND column_name='organization') THEN
        ALTER TABLE public.board_members ADD COLUMN organization TEXT;
    END IF;

    IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_schema='public' AND table_name='board_members' AND column_name='term_start') THEN
        ALTER TABLE public.board_members ADD COLUMN term_start DATE;
    END IF;

    IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_schema='public' AND table_name='board_members' AND column_name='tenure_end') THEN
        ALTER TABLE public.board_members ADD COLUMN tenure_end DATE;
    END IF;

    IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_schema='public' AND table_name='board_members' AND column_name='voting_rights') THEN
        ALTER TABLE public.board_members ADD COLUMN voting_rights BOOLEAN DEFAULT true;
    END IF;

    -- 3. Ensure created_at exists (common cause for sorting errors)
    IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_schema='public' AND table_name='board_members' AND column_name='created_at') THEN
        ALTER TABLE public.board_members ADD COLUMN created_at TIMESTAMPTZ DEFAULT now();
    END IF;

END $$;

-- 4. Enable RLS and Policies if not setup
ALTER TABLE public.board_members ENABLE ROW LEVEL SECURITY;

DO $$ 
BEGIN
    IF NOT EXISTS (SELECT 1 FROM pg_policy WHERE polname = 'Allow read for authenticated_board_members') THEN
        CREATE POLICY "Allow read for authenticated_board_members" ON public.board_members FOR SELECT TO authenticated USING (true);
    END IF;
    IF NOT EXISTS (SELECT 1 FROM pg_policy WHERE polname = 'Allow write for authenticated_board_members') THEN
        CREATE POLICY "Allow write for authenticated_board_members" ON public.board_members FOR ALL TO authenticated USING (true);
    END IF;
END $$;
