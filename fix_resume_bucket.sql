-- Force the resumes bucket to be public
-- This fixes the "Bucket not found" error when accessing via /storage/v1/object/public/
UPDATE storage.buckets
SET public = true
WHERE id = 'resumes';

-- Verify policies again just in case
DROP POLICY IF EXISTS "Auth Users Can Upload Resumes" ON storage.objects;
CREATE POLICY "Auth Users Can Upload Resumes"
ON storage.objects FOR INSERT
TO authenticated
WITH CHECK ( bucket_id = 'resumes' );

DROP POLICY IF EXISTS "Public Read Resumes" ON storage.objects;
CREATE POLICY "Public Read Resumes"
ON storage.objects FOR SELECT
TO public
USING ( bucket_id = 'resumes' );
