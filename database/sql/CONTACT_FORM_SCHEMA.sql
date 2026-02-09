CREATE TABLE IF NOT EXISTS public.contact_messages (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    name TEXT NOT NULL,
    mobile TEXT NOT NULL,
    email TEXT NOT NULL,
    subject TEXT,
    message TEXT NOT NULL,
    status TEXT DEFAULT 'New', -- New, Read, Responded
    created_at TIMESTAMPTZ DEFAULT now()
);

ALTER TABLE public.contact_messages ENABLE ROW LEVEL SECURITY;

-- Allow anyone (public) to submit a contact form
DROP POLICY IF EXISTS "Allow public inserts for contact_messages" ON public.contact_messages;
CREATE POLICY "Allow public inserts for contact_messages" 
ON public.contact_messages 
FOR INSERT 
TO anon, authenticated 
WITH CHECK (true);

-- Allow authenticated users (Admins) to view messages
DROP POLICY IF EXISTS "Allow read for authenticated contact_messages" ON public.contact_messages;
CREATE POLICY "Allow read for authenticated contact_messages" 
ON public.contact_messages 
FOR SELECT 
TO authenticated 
USING (true);
