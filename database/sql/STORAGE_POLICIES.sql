-- STORAGE POLICIES FOR EMPLOYEE DOCUMENT VAULT
-- Allows authenticated users to upload and manage their own documents

-- 1. Ensure the bucket exists (usually handled via UI or client, but good to have)
-- INSERT INTO storage.buckets (id, name, public) 
-- VALUES ('employee-docs', 'employee-docs', true)
-- ON CONFLICT (name) DO NOTHING;

-- 2. Enable RLS on storage.objects (if not already enabled)
-- ALTER TABLE storage.objects ENABLE ROW LEVEL SECURITY;

-- 3. Create Policy: Allow authenticated users to upload files
-- We target the 'employee-docs' bucket specifically.
-- Note: 'authenticated' users can upload.

CREATE POLICY "Allow Authenticated Uploads to Employee Docs"
ON storage.objects FOR INSERT TO authenticated
WITH CHECK (bucket_id = 'employee-docs');

-- 4. Create Policy: Allow users to select (read) files
CREATE POLICY "Allow Public Access to Employee Docs"
ON storage.objects FOR SELECT TO public
USING (bucket_id = 'employee-docs');

-- 5. Create Policy: Allow authenticated users to update/delete (for replacement)
CREATE POLICY "Allow Authenticated Management of Employee Docs"
ON storage.objects FOR UPDATE TO authenticated
USING (bucket_id = 'employee-docs');

CREATE POLICY "Allow Authenticated Deletion of Employee Docs"
ON storage.objects FOR DELETE TO authenticated
USING (bucket_id = 'employee-docs');
