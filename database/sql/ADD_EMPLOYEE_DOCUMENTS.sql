-- ADD DOCUMENT VAULT COLUMNS TO EMPLOYEES
-- Enables digital document storage for HR artifacts

ALTER TABLE public.employees ADD COLUMN IF NOT EXISTS doc_id_card TEXT;
ALTER TABLE public.employees ADD COLUMN IF NOT EXISTS doc_appointment_letter TEXT;
ALTER TABLE public.employees ADD COLUMN IF NOT EXISTS doc_bank_passbook TEXT;
ALTER TABLE public.employees ADD COLUMN IF NOT EXISTS doc_education_certs TEXT;

-- Reload schema
NOTIFY pgrst, 'reload schema';
