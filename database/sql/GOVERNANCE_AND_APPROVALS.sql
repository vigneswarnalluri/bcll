-- 1. Policies & SOPs
CREATE TABLE IF NOT EXISTS public.policies (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    title TEXT NOT NULL,
    version TEXT NOT NULL DEFAULT '1.0',
    effective_date DATE DEFAULT CURRENT_DATE,
    approved_by UUID REFERENCES auth.users(id),
    status TEXT CHECK (status IN ('Draft', 'Active', 'Archived')) DEFAULT 'Draft',
    content TEXT, -- Markdown or JSON content
    category TEXT, -- HR, Salary, Volunteer, Fellowship, Finance, etc.
    created_at TIMESTAMPTZ DEFAULT now(),
    updated_at TIMESTAMPTZ DEFAULT now()
);

-- 2. Board & Management
CREATE TABLE IF NOT EXISTS public.board_members (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    full_name TEXT NOT NULL,
    designation TEXT NOT NULL, -- Matched to MemberForm
    organization TEXT, -- Matched to MemberForm
    term_start DATE, -- Matched to MemberForm
    tenure_end DATE,
    voting_rights BOOLEAN DEFAULT true,
    created_at TIMESTAMPTZ DEFAULT now()
);

CREATE TABLE IF NOT EXISTS public.board_meetings (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    meeting_date TIMESTAMPTZ NOT NULL,
    agenda TEXT,
    minutes TEXT,
    resolution_text TEXT,
    status TEXT CHECK (status IN ('Scheduled', 'Drafting Minutes', 'Board Approval', 'Finalized', 'Locked')) DEFAULT 'Scheduled',
    created_at TIMESTAMPTZ DEFAULT now(),
    locked_at TIMESTAMPTZ
);

-- 3. Centralized Approval System
CREATE TABLE IF NOT EXISTS public.approval_requests (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    type TEXT NOT NULL, 
    requester_name TEXT,
    requester_id UUID, 
    amount DECIMAL, 
    level_1_status TEXT CHECK (level_1_status IN ('Pending', 'Approved', 'Declined')) DEFAULT 'Pending',
    level_1_approver UUID REFERENCES auth.users(id),
    final_status TEXT CHECK (final_status IN ('Pending', 'Approved', 'Declined')) DEFAULT 'Pending',
    final_approver UUID REFERENCES auth.users(id),
    decline_reason TEXT,
    details JSONB, 
    created_at TIMESTAMPTZ DEFAULT now(),
    updated_at TIMESTAMPTZ DEFAULT now()
);

-- Ensure RLS and Policies (Adding if not exist)
ALTER TABLE public.policies ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.board_members ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.board_meetings ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.approval_requests ENABLE ROW LEVEL SECURITY;

-- Dynamic Policy Creation (Check if policy exists before creating)
DO $$ 
BEGIN
    IF NOT EXISTS (SELECT 1 FROM pg_policy WHERE polname = 'Allow read for authenticated_policies') THEN
        CREATE POLICY "Allow read for authenticated_policies" ON public.policies FOR SELECT TO authenticated USING (true);
    END IF;
    IF NOT EXISTS (SELECT 1 FROM pg_policy WHERE polname = 'Allow write for authenticated_policies') THEN
        CREATE POLICY "Allow write for authenticated_policies" ON public.policies FOR ALL TO authenticated USING (true);
    END IF;

    IF NOT EXISTS (SELECT 1 FROM pg_policy WHERE polname = 'Allow read for authenticated_board_members') THEN
        CREATE POLICY "Allow read for authenticated_board_members" ON public.board_members FOR SELECT TO authenticated USING (true);
    END IF;
    IF NOT EXISTS (SELECT 1 FROM pg_policy WHERE polname = 'Allow write for authenticated_board_members') THEN
        CREATE POLICY "Allow write for authenticated_board_members" ON public.board_members FOR ALL TO authenticated USING (true);
    END IF;

    IF NOT EXISTS (SELECT 1 FROM pg_policy WHERE polname = 'Allow read for authenticated_board_meetings') THEN
        CREATE POLICY "Allow read for authenticated_board_meetings" ON public.board_meetings FOR SELECT TO authenticated USING (true);
    END IF;
    IF NOT EXISTS (SELECT 1 FROM pg_policy WHERE polname = 'Allow write for authenticated_board_meetings') THEN
        CREATE POLICY "Allow write for authenticated_board_meetings" ON public.board_meetings FOR ALL TO authenticated USING (true);
    END IF;

    IF NOT EXISTS (SELECT 1 FROM pg_policy WHERE polname = 'Allow read for authenticated_approval_requests') THEN
        CREATE POLICY "Allow read for authenticated_approval_requests" ON public.approval_requests FOR SELECT TO authenticated USING (true);
    END IF;
    IF NOT EXISTS (SELECT 1 FROM pg_policy WHERE polname = 'Allow write for authenticated_approval_requests') THEN
        CREATE POLICY "Allow write for authenticated_approval_requests" ON public.approval_requests FOR ALL TO authenticated USING (true);
    END IF;
END $$;
