-- Phase C: Universal Verification
-- New verification_documents table for 3-category document uploads

-- 1. Create verification_documents table
CREATE TABLE IF NOT EXISTS public.verification_documents (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    company_id UUID REFERENCES public.companies(id) ON DELETE CASCADE NOT NULL,
    document_category TEXT NOT NULL CHECK (document_category IN ('business_identity', 'representative_auth', 'personal_id')),
    document_subtype TEXT NOT NULL,
    document_url TEXT NOT NULL,
    uploaded_at TIMESTAMPTZ DEFAULT NOW(),
    review_status TEXT DEFAULT 'pending' CHECK (review_status IN ('pending', 'approved', 'rejected')),
    review_notes TEXT,
    reviewed_at TIMESTAMPTZ,
    reviewed_by UUID REFERENCES public.profiles(id)
);

-- 2. Enable RLS
ALTER TABLE public.verification_documents ENABLE ROW LEVEL SECURITY;

-- 3. Company owners can manage their documents
DROP POLICY IF EXISTS "Owners can view own documents" ON public.verification_documents;
CREATE POLICY "Owners can view own documents"
    ON public.verification_documents FOR SELECT
    USING (
        company_id IN (
            SELECT id FROM public.companies WHERE owner_id = auth.uid()
        )
    );

DROP POLICY IF EXISTS "Owners can insert documents" ON public.verification_documents;
CREATE POLICY "Owners can insert documents"
    ON public.verification_documents FOR INSERT
    WITH CHECK (
        company_id IN (
            SELECT id FROM public.companies WHERE owner_id = auth.uid()
        )
    );

DROP POLICY IF EXISTS "Owners can delete own documents" ON public.verification_documents;
CREATE POLICY "Owners can delete own documents"
    ON public.verification_documents FOR DELETE
    USING (
        company_id IN (
            SELECT id FROM public.companies WHERE owner_id = auth.uid()
        )
    );

-- 4. Admins can view all (for review)
DROP POLICY IF EXISTS "Admins can view all documents" ON public.verification_documents;
CREATE POLICY "Admins can view all documents"
    ON public.verification_documents FOR SELECT
    USING (
        auth.uid() IN (
            SELECT id FROM public.profiles WHERE role = 'admin'
        )
    );

DROP POLICY IF EXISTS "Admins can update documents" ON public.verification_documents;
CREATE POLICY "Admins can update documents"
    ON public.verification_documents FOR UPDATE
    USING (
        auth.uid() IN (
            SELECT id FROM public.profiles WHERE role = 'admin'
        )
    );

-- 5. Grant access
GRANT ALL ON public.verification_documents TO authenticated;

-- 6. Index for fast lookups
CREATE INDEX IF NOT EXISTS idx_verification_docs_company ON public.verification_documents(company_id);
CREATE INDEX IF NOT EXISTS idx_verification_docs_status ON public.verification_documents(review_status);
