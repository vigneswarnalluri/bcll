-- FIX LEAVE REQUEST RLS
-- Ensure robust policies for Approving/Rejecting leaves

-- 1. Ensure Table Exists
CREATE TABLE IF NOT EXISTS leave_requests (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  employee_id UUID REFERENCES employees(id),
  leave_type TEXT,
  start_date DATE,
  end_date DATE,
  reason TEXT,
  status TEXT DEFAULT 'Pending', -- Pending, Approved, Rejected
  created_at TIMESTAMPTZ DEFAULT NOW()
);

ALTER TABLE leave_requests ENABLE ROW LEVEL SECURITY;

-- 2. Drop potential conflicts
DROP POLICY IF EXISTS "Employees view own leaves" ON leave_requests;
DROP POLICY IF EXISTS "Employees insert leaves" ON leave_requests;
DROP POLICY IF EXISTS "Admins manage leaves" ON leave_requests;

-- 3. EMPLOYEE POLICIES
-- View Own
CREATE POLICY "Employees view own leaves" ON leave_requests
    FOR SELECT
    TO authenticated
    USING (
        employee_id IN (
            SELECT id FROM employees WHERE lower(email) = lower(auth.jwt() ->> 'email')
        )
    );

-- Insert Own
CREATE POLICY "Employees insert leaves" ON leave_requests
    FOR INSERT
    TO authenticated
    WITH CHECK (
        employee_id IN (
            SELECT id FROM employees WHERE lower(email) = lower(auth.jwt() ->> 'email')
        )
    );

-- 4. ADMIN POLICIES (FULL ACCESS)
CREATE POLICY "Admins manage leaves" ON leave_requests
    FOR ALL
    TO authenticated
    USING (
        EXISTS (
            SELECT 1 FROM profiles
            WHERE id = auth.uid() AND (role_type = 'Admin' OR role_type = 'Super Admin')
        )
    );
