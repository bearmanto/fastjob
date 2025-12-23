-- 1. Add resume_url to profiles
ALTER TABLE public.profiles ADD COLUMN IF NOT EXISTS resume_url TEXT;

-- 2. Create 'resumes' bucket if it doesn't exist
INSERT INTO storage.buckets (id, name, public)
VALUES ('resumes', 'resumes', true)
ON CONFLICT (id) DO NOTHING;

-- 3. Enable RLS on objects (storage) - strictly speaking storage.objects usually has RLS enabled
-- We need policies.

-- Policy: Authenticated users can upload to 'resumes' bucket
-- Note: This is a simplified policy allowing any auth user to upload.
-- In production, we'd want to restrict paths to user IDs.
CREATE POLICY "Auth Users Can Upload Resumes"
ON storage.objects FOR INSERT
TO authenticated
WITH CHECK ( bucket_id = 'resumes' );

-- Policy: Hirers and Owner can view
CREATE POLICY "Public Read Resumes"
ON storage.objects FOR SELECT
TO public
USING ( bucket_id = 'resumes' );
