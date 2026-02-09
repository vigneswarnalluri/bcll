-- Create a storage bucket for volunteer uploads if it doesn't exist
INSERT INTO storage.buckets (id, name, public)
VALUES ('volunteer-uploads', 'volunteer-uploads', true)
ON CONFLICT (id) DO NOTHING;

-- Policy to allow authenticated users (volunteers/admins) to upload files
DROP POLICY IF EXISTS "Allow authenticated uploads" ON storage.objects;
CREATE POLICY "Allow authenticated uploads"
ON storage.objects FOR INSERT
TO authenticated
WITH CHECK (bucket_id = 'volunteer-uploads');

-- Policy to allow anyone to view the uploaded files (since bucket is public)
DROP POLICY IF EXISTS "Allow public view" ON storage.objects;
CREATE POLICY "Allow public view"
ON storage.objects FOR SELECT
TO public
USING (bucket_id = 'volunteer-uploads');
