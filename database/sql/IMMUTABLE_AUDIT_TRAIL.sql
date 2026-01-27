-- IMMUTABLE AUDIT TRAIL GOVERNANCE (NON-NEGOTIABLE)
-- Ensures every administrative action is etched into history with no deletion path.

CREATE TABLE IF NOT EXISTS public.audit_logs (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    actor_id UUID, -- References auth.users(id) but kept loose for historical integrity
    actor_name TEXT,
    actor_role TEXT,
    action TEXT NOT NULL,
    sub_system TEXT, -- HR, Finance, Operations, etc.
    record_id TEXT, -- e.g. "SAL-2026-02-015"
    ip_address TEXT,
    device_info TEXT,
    old_value JSONB,
    new_value JSONB,
    created_at TIMESTAMPTZ DEFAULT now()
);

-- REINFORCE IMMUTABILITY
-- Even Super Admins/Directors cannot delete or update logs via triggers.
CREATE OR REPLACE FUNCTION public.block_audit_history_tampering() 
RETURNS TRIGGER AS $$
BEGIN
    RAISE EXCEPTION 'CRITICAL GOVERNANCE VIOLATION: Audit logs are immutable and cannot be modified or deleted.';
END;
$$ LANGUAGE plpgsql;

DROP TRIGGER IF EXISTS tr_block_audit_tampering ON public.audit_logs;
CREATE TRIGGER tr_block_audit_tampering
BEFORE UPDATE OR DELETE ON public.audit_logs
FOR EACH ROW EXECUTE FUNCTION public.block_audit_history_tampering();

-- Enable RLS
ALTER TABLE public.audit_logs ENABLE ROW LEVEL SECURITY;

-- Allow selection for authorized personnel
DO $$ 
BEGIN
    IF NOT EXISTS (SELECT 1 FROM pg_policy WHERE polname = 'Allow audit read for authenticated') THEN
        CREATE POLICY "Allow audit read for authenticated" ON public.audit_logs FOR SELECT TO authenticated USING (true);
    END IF;
    IF NOT EXISTS (SELECT 1 FROM pg_policy WHERE polname = 'Allow audit insert for authenticated') THEN
        CREATE POLICY "Allow audit insert for authenticated" ON public.audit_logs FOR INSERT TO authenticated WITH CHECK (true);
    END IF;
END $$;

-- Reload schema
NOTIFY pgrst, 'reload schema';
