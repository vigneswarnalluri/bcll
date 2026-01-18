-- Bharath Cares Life Line Foundation - MASTER BACKEND SETUP
-- Consolidate all modules and fixes for the Admin Dashboard

-- 1. SECURITY HELPER
CREATE OR REPLACE FUNCTION is_admin()
RETURNS BOOLEAN AS $$
BEGIN
  RETURN EXISTS (
    SELECT 1 
    FROM profiles 
    WHERE (user_id = auth.uid() OR id = auth.uid()) -- Support both old and new schema
    AND role_type IN ('Super Admin', 'Admin', 'Co-Admin')
  );
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- 2. CORE TABLES
CREATE TABLE IF NOT EXISTS profiles (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    user_id UUID REFERENCES auth.users ON DELETE CASCADE UNIQUE, 
    full_name TEXT NOT NULL,
    role_type TEXT CHECK (role_type IN ('Super Admin', 'Admin', 'Co-Admin', 'Employee')) DEFAULT 'Employee',
    email TEXT UNIQUE,
    mobile TEXT,
    dob DATE,
    gender TEXT,
    address TEXT,
    emergency TEXT,
    appointment_date DATE DEFAULT CURRENT_DATE,
    last_login TIMESTAMP WITH TIME ZONE,
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Migration for profiles (if table exists)
CREATE EXTENSION IF NOT EXISTS "pgcrypto";
ALTER TABLE profiles ALTER COLUMN id SET DEFAULT gen_random_uuid();

-- NEW: Drop legacy auth reference on id if it exists (violates decoupled provisioning)
ALTER TABLE profiles DROP CONSTRAINT IF EXISTS profiles_id_fkey;

ALTER TABLE profiles ADD COLUMN IF NOT EXISTS user_id UUID REFERENCES auth.users ON DELETE CASCADE UNIQUE;
-- If id was the old auth link, copy it to user_id where user_id is null
UPDATE profiles SET user_id = id WHERE user_id IS NULL AND id IN (SELECT id FROM auth.users);

ALTER TABLE profiles ADD COLUMN IF NOT EXISTS email TEXT;
ALTER TABLE profiles DROP CONSTRAINT IF EXISTS profiles_email_key;
ALTER TABLE profiles ADD CONSTRAINT profiles_email_key UNIQUE (email);
ALTER TABLE profiles ADD COLUMN IF NOT EXISTS mobile TEXT;
ALTER TABLE profiles ADD COLUMN IF NOT EXISTS dob DATE;
ALTER TABLE profiles ADD COLUMN IF NOT EXISTS gender TEXT;
ALTER TABLE profiles ADD COLUMN IF NOT EXISTS address TEXT;
ALTER TABLE profiles ADD COLUMN IF NOT EXISTS emergency TEXT;
ALTER TABLE profiles ADD COLUMN IF NOT EXISTS appointment_date DATE;

-- Migration for employees (if table exists)
ALTER TABLE employees ALTER COLUMN id SET DEFAULT gen_random_uuid();

CREATE TABLE IF NOT EXISTS employees (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    employee_id TEXT UNIQUE NOT NULL,
    full_name TEXT NOT NULL,
    gender TEXT,
    dob DATE,
    marital_status TEXT,
    blood_group TEXT,
    mobile TEXT,
    email TEXT,
    current_address TEXT,
    permanent_address TEXT,
    aadhaar_masked TEXT,
    pan_number TEXT,
    voter_id TEXT,
    passport_number TEXT,
    designation TEXT,
    department TEXT,
    date_of_joining DATE DEFAULT CURRENT_DATE,
    employment_type TEXT,
    reporting_manager_id UUID REFERENCES profiles(id),
    work_location TEXT,
    attendance_type TEXT,
    office_timings TEXT,
    salary_amount NUMERIC(15, 2),
    bank_name TEXT,
    acc_holder_name TEXT,
    acc_number_encrypted TEXT,
    ifsc_code TEXT,
    upi_id TEXT,
    payment_mode TEXT,
    emergency_name TEXT,
    emergency_relation TEXT,
    emergency_mobile TEXT,
    performance_rating TEXT,
    performance_remarks TEXT,
    warning_notices INTEGER DEFAULT 0,
    signed_policy BOOLEAN DEFAULT FALSE,
    policy_signed_date TIMESTAMP WITH TIME ZONE,
    status TEXT DEFAULT 'Active' CHECK (status IN ('Active', 'Inactive', 'Suspended')),
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

CREATE TABLE IF NOT EXISTS admin_controls (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    admin_profile_id UUID REFERENCES profiles(id) ON DELETE CASCADE UNIQUE,
    perm_view_employees BOOLEAN DEFAULT FALSE,
    perm_edit_employees BOOLEAN DEFAULT FALSE,
    perm_approve_leaves BOOLEAN DEFAULT FALSE,
    perm_process_salary BOOLEAN DEFAULT FALSE,
    perm_bank_access BOOLEAN DEFAULT FALSE,
    perm_volunteer_approval BOOLEAN DEFAULT FALSE,
    perm_scholarship_verify BOOLEAN DEFAULT FALSE,
    perm_manage_admins BOOLEAN DEFAULT FALSE,
    salary_approval_limit NUMERIC(15, 2) DEFAULT 0,
    fund_utilization_auth BOOLEAN DEFAULT FALSE,
    authority_level TEXT CHECK (authority_level IN ('L1', 'L2', 'L3', 'L4')),
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Migration for admin_controls (if table exists)
ALTER TABLE admin_controls ALTER COLUMN id SET DEFAULT gen_random_uuid();

-- Ensure unique constraint on admin_profile_id for existing tables
DO $$ 
BEGIN 
    IF NOT EXISTS (SELECT 1 FROM information_schema.table_constraints WHERE table_name='admin_controls' AND constraint_type='UNIQUE' AND table_schema='public') THEN
        ALTER TABLE admin_controls ADD CONSTRAINT admin_controls_admin_profile_id_key UNIQUE (admin_profile_id);
    END IF;
END $$;

-- 3. OPERATIONAL TABLES
CREATE TABLE IF NOT EXISTS volunteers (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  full_name TEXT NOT NULL,
  email TEXT,
  phone TEXT,
  area_of_interest TEXT,
  dob DATE,
  blood_group TEXT,
  address TEXT,
  status TEXT DEFAULT 'New',
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- Migration for volunteers
ALTER TABLE volunteers ADD COLUMN IF NOT EXISTS dob DATE;
ALTER TABLE volunteers ADD COLUMN IF NOT EXISTS blood_group TEXT;
ALTER TABLE volunteers ADD COLUMN IF NOT EXISTS address TEXT;

CREATE TABLE IF NOT EXISTS scholarships (
-- ... (rest of the file follows)
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  applicant_name TEXT NOT NULL,
  application_id TEXT NOT NULL,
  income_status TEXT,
  academic_score TEXT,
  status TEXT DEFAULT 'Awaiting Approval',
  created_at TIMESTAMPTZ DEFAULT NOW()
);

CREATE TABLE IF NOT EXISTS students (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  student_name TEXT NOT NULL,
  college_org TEXT,
  program TEXT,
  status TEXT DEFAULT 'Enrolled',
  created_at TIMESTAMPTZ DEFAULT NOW()
);

CREATE TABLE IF NOT EXISTS finance_logs (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  transaction_date DATE DEFAULT CURRENT_DATE,
  type TEXT,
  category_context TEXT,
  amount NUMERIC,
  status TEXT DEFAULT 'Verified',
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- Handle already existing tables with old schema
DO $$ 
BEGIN 
    -- 1. Rename 'context' to 'category_context' if it exists
    IF EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name='finance_logs' AND column_name='context') THEN
        ALTER TABLE finance_logs RENAME COLUMN context TO category_context;
    END IF;

    -- 2. Add 'category_context' if it still doesn't exist (safety check)
    IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name='finance_logs' AND column_name='category_context') THEN
        ALTER TABLE finance_logs ADD COLUMN category_context TEXT;
    END IF;
END $$;

CREATE TABLE IF NOT EXISTS leave_requests (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  employee_id UUID REFERENCES employees(id),
  leave_type TEXT,
  start_date DATE,
  end_date DATE,
  reason TEXT,
  status TEXT DEFAULT 'Pending',
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- 4. DIGITAL FILING (E-OFFICE)
CREATE TABLE IF NOT EXISTS organization_categories (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  name TEXT UNIQUE NOT NULL,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

CREATE TABLE IF NOT EXISTS organization_docs (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  name TEXT NOT NULL,
  category_id UUID REFERENCES organization_categories(id),
  file_url TEXT,
  size TEXT DEFAULT '1.2 MB',
  verified BOOLEAN DEFAULT TRUE,
  uploaded_by UUID REFERENCES profiles(id),
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- Migration for organization_docs
ALTER TABLE organization_docs ADD COLUMN IF NOT EXISTS category_id UUID REFERENCES organization_categories(id);

CREATE TABLE IF NOT EXISTS audit_logs (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    actor_id UUID REFERENCES profiles(id),
    action TEXT NOT NULL,
    sub_system TEXT,
    target_id TEXT,
    changes JSONB,
    ip_address TEXT,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Migration for all operational tables (ensuring ID defaults)
ALTER TABLE volunteers ALTER COLUMN id SET DEFAULT gen_random_uuid();
ALTER TABLE scholarships ALTER COLUMN id SET DEFAULT gen_random_uuid();
ALTER TABLE students ALTER COLUMN id SET DEFAULT gen_random_uuid();
ALTER TABLE finance_logs ALTER COLUMN id SET DEFAULT gen_random_uuid();
ALTER TABLE leave_requests ALTER COLUMN id SET DEFAULT gen_random_uuid();
ALTER TABLE organization_categories ALTER COLUMN id SET DEFAULT gen_random_uuid();
ALTER TABLE organization_docs ALTER COLUMN id SET DEFAULT gen_random_uuid();
ALTER TABLE audit_logs ALTER COLUMN id SET DEFAULT gen_random_uuid();

-- 5. RLS POLICIES
ALTER TABLE profiles ENABLE ROW LEVEL SECURITY;
ALTER TABLE employees ENABLE ROW LEVEL SECURITY;
ALTER TABLE admin_controls ENABLE ROW LEVEL SECURITY;
ALTER TABLE volunteers ENABLE ROW LEVEL SECURITY;
ALTER TABLE scholarships ENABLE ROW LEVEL SECURITY;
ALTER TABLE students ENABLE ROW LEVEL SECURITY;
ALTER TABLE finance_logs ENABLE ROW LEVEL SECURITY;
ALTER TABLE leave_requests ENABLE ROW LEVEL SECURITY;
ALTER TABLE organization_categories ENABLE ROW LEVEL SECURITY;
ALTER TABLE organization_docs ENABLE ROW LEVEL SECURITY;
ALTER TABLE audit_logs ENABLE ROW LEVEL SECURITY;

-- Drop existing policies to allow re-running the script
DROP POLICY IF EXISTS "Admins full access profiles" ON profiles;
DROP POLICY IF EXISTS "Admins full access employees" ON employees;
DROP POLICY IF EXISTS "Admins full access controls" ON admin_controls;
DROP POLICY IF EXISTS "Admins full access volunteers" ON volunteers;
DROP POLICY IF EXISTS "Admins full access scholarships" ON scholarships;
DROP POLICY IF EXISTS "Admins full access students" ON students;
DROP POLICY IF EXISTS "Admins full access finance" ON finance_logs;
DROP POLICY IF EXISTS "Admins full access leaves" ON leave_requests;
DROP POLICY IF EXISTS "Admins full access categories" ON organization_categories;
DROP POLICY IF EXISTS "Admins full access docs" ON organization_docs;
DROP POLICY IF EXISTS "Admins full access logs" ON audit_logs;
DROP POLICY IF EXISTS "Public volunteer registration" ON volunteers;

-- Admins: Global Access (Unique names per table)
CREATE POLICY "Admins full access profiles" ON profiles FOR ALL TO authenticated USING (is_admin());
CREATE POLICY "Admins full access employees" ON employees FOR ALL TO authenticated USING (is_admin());
CREATE POLICY "Admins full access controls" ON admin_controls FOR ALL TO authenticated USING (is_admin());
CREATE POLICY "Admins full access volunteers" ON volunteers FOR ALL TO authenticated USING (is_admin());
CREATE POLICY "Admins full access scholarships" ON scholarships FOR ALL TO authenticated USING (is_admin());
CREATE POLICY "Admins full access students" ON students FOR ALL TO authenticated USING (is_admin());
CREATE POLICY "Admins full access finance" ON finance_logs FOR ALL TO authenticated USING (is_admin());
CREATE POLICY "Admins full access leaves" ON leave_requests FOR ALL TO authenticated USING (is_admin());
CREATE POLICY "Admins full access categories" ON organization_categories FOR ALL TO authenticated USING (is_admin());
CREATE POLICY "Admins full access docs" ON organization_docs FOR ALL TO authenticated USING (is_admin());
CREATE POLICY "Admins full access logs" ON audit_logs FOR ALL TO authenticated USING (is_admin());

-- Public: Volunteer Signup
CREATE POLICY "Public volunteer registration" ON volunteers FOR INSERT TO anon, authenticated WITH CHECK (true);

-- 6. SEED DATA
INSERT INTO organization_categories (name) VALUES 
('Legal & Bye-laws'), ('Income Tax (12A/80G)'), ('Board Resolutions'), ('Personnel KYC Vault'), ('Program Audit Docs')
ON CONFLICT (name) DO NOTHING;

INSERT INTO finance_logs (type, category_context, amount, status) VALUES 
('Donation', 'General Fund', 50000, 'Verified'),
('Salary', 'Staff Payroll', 25000, 'Verified');

INSERT INTO volunteers (full_name, area_of_interest, status) VALUES 
('John Doe', 'Community Health', 'New'),
('Jane Smith', 'Education Support', 'Approved');
