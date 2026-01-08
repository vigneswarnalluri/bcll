-- EXPAND SCHEMA FOR FULL SYSTEM

-- 1. VOLUNTEERS TABLE
CREATE TABLE IF NOT EXISTS volunteers (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  full_name TEXT NOT NULL,
  email TEXT,
  phone TEXT,
  area_of_interest TEXT,
  status TEXT DEFAULT 'New', -- New, Approved, Rejected
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- 2. SCHOLARSHIPS TABLE
CREATE TABLE IF NOT EXISTS scholarships (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  applicant_name TEXT NOT NULL,
  application_id TEXT NOT NULL, -- e.g., SCH-2024-001
  income_status TEXT, -- e.g., "Below Poverty Line"
  academic_score TEXT, -- e.g., "9.8 CGPA"
  status TEXT DEFAULT 'Awaiting Approval',
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- 3. STUDENTS / EDUCATIONAL REGISTRATIONS
CREATE TABLE IF NOT EXISTS students (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  student_name TEXT NOT NULL,
  college_org TEXT,
  program TEXT,
  status TEXT DEFAULT 'Enrolled',
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- 4. FINANCE / DONATIONS LOG
CREATE TABLE IF NOT EXISTS finance_logs (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  transaction_date DATE DEFAULT CURRENT_DATE,
  type TEXT, -- 'Donation', 'Salary', 'Expense'
  context TEXT, -- 'Food Drive', 'Staff Payroll'
  amount NUMERIC,
  status TEXT DEFAULT 'Verified',
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- 5. LEAVE REQUESTS (For Employee-Admin Workflow)
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

-- 6. FIELD REPORTS
CREATE TABLE IF NOT EXISTS field_reports (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  title TEXT NOT NULL,
  category TEXT,
  report_date DATE DEFAULT CURRENT_DATE,
  file_url TEXT, -- Link to storage
  status TEXT DEFAULT 'Draft',
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- COMPREHENSIVE RLS POLICIES (Simplified for specific modules)

ALTER TABLE volunteers ENABLE ROW LEVEL SECURITY;
ALTER TABLE scholarships ENABLE ROW LEVEL SECURITY;
ALTER TABLE students ENABLE ROW LEVEL SECURITY;
ALTER TABLE finance_logs ENABLE ROW LEVEL SECURITY;
ALTER TABLE leave_requests ENABLE ROW LEVEL SECURITY;
ALTER TABLE field_reports ENABLE ROW LEVEL SECURITY;

-- Allow authenticated users (Admins/Employees) to view most data
CREATE POLICY "Auth users view volunteers" ON volunteers FOR SELECT TO authenticated USING (true);
CREATE POLICY "Auth users view scholarships" ON scholarships FOR SELECT TO authenticated USING (true);
CREATE POLICY "Auth users view students" ON students FOR SELECT TO authenticated USING (true);
CREATE POLICY "Auth users view finance" ON finance_logs FOR SELECT TO authenticated USING (true);
CREATE POLICY "Auth users view reports" ON field_reports FOR SELECT TO authenticated USING (true);

-- Allow Admins to INSERT/UPDATE/DELETE
-- Note: Reusing the secure is_admin() function we created earlier
CREATE POLICY "Admins manage volunteers" ON volunteers FOR ALL TO authenticated USING (is_admin());
CREATE POLICY "Admins manage scholarships" ON scholarships FOR ALL TO authenticated USING (is_admin());
CREATE POLICY "Admins manage students" ON students FOR ALL TO authenticated USING (is_admin());
CREATE POLICY "Admins manage finance" ON finance_logs FOR ALL TO authenticated USING (is_admin());
CREATE POLICY "Admins manage reports" ON field_reports FOR ALL TO authenticated USING (is_admin());

-- Employee Specific Policies for Leave Requests
CREATE POLICY "Employees view own leaves" ON leave_requests FOR SELECT TO authenticated USING (employee_id IN (SELECT id FROM employees WHERE email = auth.jwt() ->> 'email'));
CREATE POLICY "Employees insert leaves" ON leave_requests FOR INSERT TO authenticated WITH CHECK (employee_id IN (SELECT id FROM employees WHERE email = auth.jwt() ->> 'email'));
CREATE POLICY "Admins manage leaves" ON leave_requests FOR ALL TO authenticated USING (is_admin());
