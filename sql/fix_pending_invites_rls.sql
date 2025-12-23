-- Fix RLS policies for pending_team_invites
-- Avoids infinite recursion by only checking company ownership

-- Drop existing policies
DROP POLICY IF EXISTS "Admins can view pending invites" ON public.pending_team_invites;
DROP POLICY IF EXISTS "Admins can create pending invites" ON public.pending_team_invites;
DROP POLICY IF EXISTS "Admins can delete pending invites" ON public.pending_team_invites;
DROP POLICY IF EXISTS "Service can manage invites" ON public.pending_team_invites;

-- Simplified policies that only check company ownership (no recursion)
CREATE POLICY "Company owners can view pending invites"
    ON public.pending_team_invites FOR SELECT
    USING (
        company_id IN (
            SELECT id FROM public.companies WHERE owner_id = auth.uid()
        )
    );

CREATE POLICY "Company owners can create pending invites"
    ON public.pending_team_invites FOR INSERT
    WITH CHECK (
        company_id IN (
            SELECT id FROM public.companies WHERE owner_id = auth.uid()
        )
    );

CREATE POLICY "Company owners can delete pending invites"
    ON public.pending_team_invites FOR DELETE
    USING (
        company_id IN (
            SELECT id FROM public.companies WHERE owner_id = auth.uid()
        )
    );

-- Service role can do everything (for signup flow)
CREATE POLICY "Service can manage invites"
    ON public.pending_team_invites FOR ALL
    TO service_role
    USING (true)
    WITH CHECK (true);
