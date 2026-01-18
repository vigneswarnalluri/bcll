-- Create ATTENDANCE LOGS Table
CREATE TABLE IF NOT EXISTS attendance_logs (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    employee_id UUID REFERENCES employees(id) ON DELETE CASCADE,
    date DATE DEFAULT CURRENT_DATE,
    status TEXT DEFAULT 'Present', -- Present, Absent, Half-Day, Late
    check_in_time TIMESTAMPTZ DEFAULT NOW(),
    check_out_time TIMESTAMPTZ,
    created_at TIMESTAMPTZ DEFAULT NOW(),
    UNIQUE(employee_id, date) -- One entry per day per employee
);

-- Enable RLS
ALTER TABLE attendance_logs ENABLE ROW LEVEL SECURITY;

-- 1. Employees can view their own attendance
CREATE POLICY "Employees view own attendance" ON attendance_logs
    FOR SELECT
    TO authenticated
    USING (
        employee_id IN (
            SELECT id FROM employees WHERE email = auth.jwt() ->> 'email'
        )
    );

-- 2. Employees can mark their own attendance (INSERT)
CREATE POLICY "Employees mark attendance" ON attendance_logs
    FOR INSERT
    TO authenticated
    WITH CHECK (
        employee_id IN (
            SELECT id FROM employees WHERE email = auth.jwt() ->> 'email'
        )
    );

-- 3. Admins can view and manage all attendance
CREATE POLICY "Admins manage attendance" ON attendance_logs
    FOR ALL
    TO authenticated
    USING (
        EXISTS (
            SELECT 1 FROM profiles
            WHERE id = auth.uid() AND (role_type = 'Admin' OR role_type = 'Super Admin')
        )
    );
