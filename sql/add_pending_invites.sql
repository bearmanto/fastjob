-- Pending Team Invites
-- Allows inviting users who don't have accounts yet

-- 1. Create pending_team_invites table
CREATE TABLE IF NOT EXISTS public.pending_team_invites (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    email TEXT NOT NULL,
    company_id UUID REFERENCES public.companies(id) ON DELETE CASCADE NOT NULL,
    role TEXT CHECK (role IN ('admin', 'recruiter', 'viewer')) DEFAULT 'recruiter',
    invited_by UUID REFERENCES public.profiles(id),
    token TEXT UNIQUE NOT NULL,
    expires_at TIMESTAMPTZ DEFAULT NOW() + INTERVAL '7 days',
    created_at TIMESTAMPTZ DEFAULT NOW()
);

-- 2. Enable RLS
ALTER TABLE public.pending_team_invites ENABLE ROW LEVEL SECURITY;

-- 3. RLS Policies

-- Company admins can view pending invites
DROP POLICY IF EXISTS "Admins can view pending invites" ON public.pending_team_invites;
CREATE POLICY "Admins can view pending invites"
    ON public.pending_team_invites FOR SELECT
    USING (
        company_id IN (
            SELECT id FROM public.companies WHERE owner_id = auth.uid()
        )
        OR
        company_id IN (
            SELECT company_id FROM public.company_members 
            WHERE user_id = auth.uid() AND role = 'admin'
        )
    );

-- Admins can create pending invites
DROP POLICY IF EXISTS "Admins can create pending invites" ON public.pending_team_invites;
CREATE POLICY "Admins can create pending invites"
    ON public.pending_team_invites FOR INSERT
    WITH CHECK (
        company_id IN (
            SELECT id FROM public.companies WHERE owner_id = auth.uid()
        )
        OR
        company_id IN (
            SELECT company_id FROM public.company_members 
            WHERE user_id = auth.uid() AND role = 'admin'
        )
    );

-- Admins can delete pending invites
DROP POLICY IF EXISTS "Admins can delete pending invites" ON public.pending_team_invites;
CREATE POLICY "Admins can delete pending invites"
    ON public.pending_team_invites FOR DELETE
    USING (
        company_id IN (
            SELECT id FROM public.companies WHERE owner_id = auth.uid()
        )
        OR
        company_id IN (
            SELECT company_id FROM public.company_members 
            WHERE user_id = auth.uid() AND role = 'admin'
        )
    );

-- Service role can read/delete for signup flow
DROP POLICY IF EXISTS "Service can manage invites" ON public.pending_team_invites;
CREATE POLICY "Service can manage invites"
    ON public.pending_team_invites FOR ALL
    TO service_role
    USING (true)
    WITH CHECK (true);

-- 4. Grant access
GRANT ALL ON public.pending_team_invites TO authenticated;
GRANT ALL ON public.pending_team_invites TO service_role;

-- 5. Index for fast email lookup
CREATE INDEX IF NOT EXISTS idx_pending_invites_email ON public.pending_team_invites(email);
CREATE INDEX IF NOT EXISTS idx_pending_invites_token ON public.pending_team_invites(token);
