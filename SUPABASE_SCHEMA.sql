-- Bharath Cares Life Line Foundation - Database Schema (Supabase/PostgreSQL)

-- 1. PROFILES & AUTH EXTENSION
-- This table links to Supabase Auth Users
CREATE TABLE profiles (
    id UUID REFERENCES auth.users ON DELETE CASCADE PRIMARY KEY,
    full_name TEXT NOT NULL,
    role_type TEXT CHECK (role_type IN ('Super Admin', 'Admin', 'Co-Admin', 'Employee')) DEFAULT 'Employee',
    last_login TIMESTAMP WITH TIME ZONE,
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- 2. EMPLOYEES (The 11 Categories)
CREATE TABLE employees (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    employee_id TEXT UNIQUE NOT NULL, -- e.g., BCLL-EMP-1024
    
    -- Category 1: Basic Info
    full_name TEXT NOT NULL,
    gender TEXT,
    dob DATE,
    marital_status TEXT,
    blood_group TEXT,
    mobile TEXT,
    email TEXT,
    current_address TEXT,
    permanent_address TEXT,
    
    -- Category 2: Identity & KYC (Sensitive - use column-level RLS if needed)
    aadhaar_masked TEXT, -- e.g., XXXX XXXX 1234
    pan_number TEXT,
    voter_id TEXT,
    passport_number TEXT,
    
    -- Category 3: Employment
    designation TEXT,
    department TEXT,
    date_of_joining DATE DEFAULT CURRENT_DATE,
    employment_type TEXT,
    reporting_manager_id UUID REFERENCES profiles(id),
    work_location TEXT,
    attendance_type TEXT,
    office_timings TEXT,
    
    -- Category 4: Payroll & Bank
    salary_amount NUMERIC(15, 2),
    bank_name TEXT,
    acc_holder_name TEXT,
    acc_number_encrypted TEXT,
    ifsc_code TEXT,
    upi_id TEXT,
    payment_mode TEXT,
    
    -- Category 9 & 10: Emergency & Performance
    emergency_name TEXT,
    emergency_relation TEXT,
    emergency_mobile TEXT,
    performance_rating TEXT,
    performance_remarks TEXT,
    warning_notices INTEGER DEFAULT 0,
    
    -- Category 11: Compliance
    signed_policy BOOLEAN DEFAULT FALSE,
    policy_signed_date TIMESTAMP WITH TIME ZONE,
    
    status TEXT DEFAULT 'Active' CHECK (status IN ('Active', 'Inactive', 'Suspended')),
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- 3. ADMINISTRATIVE CONTROL (9 Categories)
CREATE TABLE admin_controls (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    admin_profile_id UUID REFERENCES profiles(id) ON DELETE CASCADE,
    
    -- Category 4: Permissions (Boolean breakdown)
    perm_view_employees BOOLEAN DEFAULT FALSE,
    perm_edit_employees BOOLEAN DEFAULT FALSE,
    perm_approve_leaves BOOLEAN DEFAULT FALSE,
    perm_process_salary BOOLEAN DEFAULT FALSE,
    perm_bank_access BOOLEAN DEFAULT FALSE,
    perm_volunteer_approval BOOLEAN DEFAULT FALSE,
    perm_scholarship_verify BOOLEAN DEFAULT FALSE,
    perm_manage_admins BOOLEAN DEFAULT FALSE,
    
    -- Category 5: Financial Limits
    salary_approval_limit NUMERIC(15, 2) DEFAULT 0,
    fund_utilization_auth BOOLEAN DEFAULT FALSE,
    
    authority_level TEXT CHECK (authority_level IN ('L1', 'L2', 'L3', 'L4')),
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- 4. FORENSIC AUDIT TRAIL (Category 7)
CREATE TABLE audit_logs (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    actor_id UUID REFERENCES profiles(id),
    action TEXT NOT NULL,
    sub_system TEXT, -- HR, Finance, Operations
    target_id TEXT, -- ID of the record changed
    changes JSONB, -- Old vs New values
    ip_address TEXT,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- 5. DIGITAL FILING (EOffice & Category 8)
CREATE TABLE documents (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    owner_id UUID REFERENCES profiles(id),
    doc_type TEXT, -- Aadhaar, PAN, Appointment, Report
    file_path TEXT NOT NULL, -- Path in Supabase Storage
    is_verified BOOLEAN DEFAULT FALSE,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- RLS (Row Level Security) - Basic Setup
ALTER TABLE profiles ENABLE ROW LEVEL SECURITY;
ALTER TABLE employees ENABLE ROW LEVEL SECURITY;
ALTER TABLE audit_logs ENABLE ROW LEVEL SECURITY;

-- Policy: Admin can see everything
CREATE POLICY "Admins can view all profiles" ON profiles FOR SELECT TO authenticated
    USING (EXISTS (SELECT 1 FROM profiles WHERE id = auth.uid() AND role_type IN ('Super Admin', 'Admin')));

-- Policy: User can see their own profile
CREATE POLICY "Users can view own profile" ON profiles FOR SELECT TO authenticated
    USING (auth.uid() = id);
