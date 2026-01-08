-- FIX ATTENDANCE RLS
-- The previous policy might be failing due to case sensitivity or complex join issues.
-- We will replace the SELECT policy with a more robust one.

DROP POLICY IF EXISTS "Employees view own attendance" ON attendance_logs;
DROP POLICY IF EXISTS "Employees mark attendance" ON attendance_logs;

-- Re-create with Lowercase Email Check
CREATE POLICY "Employees view own attendance" ON attendance_logs
    FOR SELECT
    TO authenticated
    USING (
        employee_id IN (
            SELECT id FROM employees 
            WHERE lower(email) = lower(auth.jwt() ->> 'email')
        )
    );

CREATE POLICY "Employees mark attendance" ON attendance_logs
    FOR INSERT
    TO authenticated
    WITH CHECK (
        employee_id IN (
            SELECT id FROM employees 
            WHERE lower(email) = lower(auth.jwt() ->> 'email')
        )
    );
