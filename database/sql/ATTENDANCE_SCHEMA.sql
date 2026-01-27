-- EMPLOYEE ATTENDANCE SYSTEM SCHEMA
-- Captures daily check-in/out and working hour metrics.

CREATE TABLE IF NOT EXISTS public.attendance (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    employee_id UUID REFERENCES public.employees(id) ON DELETE CASCADE,
    attendance_date DATE DEFAULT CURRENT_DATE,
    check_in TIMESTAMPTZ,
    check_out TIMESTAMPTZ,
    work_hours DECIMAL(4,2), -- Calculated hours (e.g., 8.50)
    status TEXT CHECK (status IN ('Present', 'Absent', 'Half Day', 'Official Duty', 'Leave Approved', 'Loss of Pay')) DEFAULT 'Present',
    remarks TEXT,
    location_metadata JSONB, -- Optional: GPS or IP tracking
    created_at TIMESTAMPTZ DEFAULT now(),
    updated_at TIMESTAMPTZ DEFAULT now(),
    
    -- Constraint: One entry per employee per day
    UNIQUE(employee_id, attendance_date)
);

-- Enable RLS
ALTER TABLE public.attendance ENABLE ROW LEVEL SECURITY;

-- Permissions
DO $$ 
BEGIN
    IF NOT EXISTS (SELECT 1 FROM pg_policy WHERE polname = 'Allow all on attendance') THEN
        CREATE POLICY "Allow all on attendance" ON public.attendance FOR ALL TO authenticated USING (true);
    END IF;
END $$;

-- Function to update total hours on check-out
CREATE OR REPLACE FUNCTION calculate_work_hours()
RETURNS TRIGGER AS $$
BEGIN
    IF NEW.check_in IS NOT NULL AND NEW.check_out IS NOT NULL THEN
        NEW.work_hours := EXTRACT(EPOCH FROM (NEW.check_out - NEW.check_in)) / 3600;
    END IF;
    RETURN NEW;
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER trg_calculate_work_hours
BEFORE INSERT OR UPDATE ON public.attendance
FOR EACH ROW EXECUTE FUNCTION calculate_work_hours();

-- Reload PostgREST
NOTIFY pgrst, 'reload schema';
