-- Tables for Fellow Dashboard (Explicitly in public schema)
CREATE TABLE IF NOT EXISTS public.fellow_reports (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    student_id UUID REFERENCES public.students(id) ON DELETE CASCADE,
    period TEXT NOT NULL, -- e.g. "January 2026"
    content TEXT,
    status TEXT DEFAULT 'Submitted', -- Submitted, Approved, Needs Revision
    feedback TEXT,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

CREATE TABLE IF NOT EXISTS public.stipends (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    student_id UUID REFERENCES public.students(id) ON DELETE CASCADE,
    month TEXT NOT NULL,
    amount DECIMAL NOT NULL,
    status TEXT DEFAULT 'Pending', -- Pending, Processing, Paid
    utr_ref TEXT,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Tables for Volunteer Dashboard
CREATE TABLE IF NOT EXISTS public.volunteer_tasks (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    volunteer_id UUID REFERENCES public.volunteers(id) ON DELETE CASCADE,
    title TEXT NOT NULL,
    description TEXT,
    priority TEXT DEFAULT 'Medium', -- Low, Medium, High, Urgent
    deadline DATE,
    status TEXT DEFAULT 'Assigned', -- Assigned, In Progress, Submitted, Completed
    proof_url TEXT,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Enable RLS for security
ALTER TABLE public.fellow_reports ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.stipends ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.volunteer_tasks ENABLE ROW LEVEL SECURITY;
