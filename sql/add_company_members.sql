-- Phase 1: Multi-User Team Access
-- Creates company_members table for team management

-- 1. Create company_members table
CREATE TABLE IF NOT EXISTS public.company_members (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    company_id UUID REFERENCES public.companies(id) ON DELETE CASCADE NOT NULL,
    user_id UUID REFERENCES public.profiles(id) ON DELETE CASCADE NOT NULL,
    role TEXT CHECK (role IN ('admin', 'recruiter', 'viewer')) DEFAULT 'recruiter',
    invited_by UUID REFERENCES public.profiles(id),
    invited_at TIMESTAMPTZ DEFAULT NOW(),
    accepted_at TIMESTAMPTZ,
    UNIQUE(company_id, user_id)
);

-- 2. Enable RLS
ALTER TABLE public.company_members ENABLE ROW LEVEL SECURITY;

-- 3. RLS Policies

-- Members can view their company's team
DROP POLICY IF EXISTS "Members can view team" ON public.company_members;
CREATE POLICY "Members can view team"
    ON public.company_members FOR SELECT
    USING (
        user_id = auth.uid() 
        OR 
        company_id IN (
            SELECT company_id FROM public.company_members WHERE user_id = auth.uid()
        )
        OR
        company_id IN (
            SELECT id FROM public.companies WHERE owner_id = auth.uid()
        )
    );

-- Company owners and admins can invite
DROP POLICY IF EXISTS "Admins can invite" ON public.company_members;
CREATE POLICY "Admins can invite"
    ON public.company_members FOR INSERT
    WITH CHECK (
        -- User is company owner
        EXISTS (
            SELECT 1 FROM public.companies 
            WHERE id = company_members.company_id 
            AND owner_id = auth.uid()
        )
        OR
        -- User is admin of this company
        EXISTS (
            SELECT 1 FROM public.company_members cm
            WHERE cm.company_id = company_members.company_id 
            AND cm.user_id = auth.uid() 
            AND cm.role = 'admin'
        )
    );

-- Admins can update roles
DROP POLICY IF EXISTS "Admins can update" ON public.company_members;
CREATE POLICY "Admins can update"
    ON public.company_members FOR UPDATE
    USING (
        EXISTS (
            SELECT 1 FROM public.companies 
            WHERE id = company_members.company_id 
            AND owner_id = auth.uid()
        )
        OR
        EXISTS (
            SELECT 1 FROM public.company_members cm
            WHERE cm.company_id = company_members.company_id 
            AND cm.user_id = auth.uid() 
            AND cm.role = 'admin'
        )
    );

-- Admins can remove members
DROP POLICY IF EXISTS "Admins can delete" ON public.company_members;
CREATE POLICY "Admins can delete"
    ON public.company_members FOR DELETE
    USING (
        EXISTS (
            SELECT 1 FROM public.companies 
            WHERE id = company_members.company_id 
            AND owner_id = auth.uid()
        )
        OR
        EXISTS (
            SELECT 1 FROM public.company_members cm
            WHERE cm.company_id = company_members.company_id 
            AND cm.user_id = auth.uid() 
            AND cm.role = 'admin'
        )
    );

-- 4. Grant access
GRANT ALL ON public.company_members TO authenticated;

-- 5. Create index for performance
CREATE INDEX IF NOT EXISTS idx_company_members_company ON public.company_members(company_id);
CREATE INDEX IF NOT EXISTS idx_company_members_user ON public.company_members(user_id);

-- 6. Auto-add company owner as admin (for existing companies)
INSERT INTO public.company_members (company_id, user_id, role, accepted_at)
SELECT id, owner_id, 'admin', NOW()
FROM public.companies
WHERE NOT EXISTS (
    SELECT 1 FROM public.company_members cm 
    WHERE cm.company_id = companies.id AND cm.user_id = companies.owner_id
)
ON CONFLICT (company_id, user_id) DO NOTHING;

-- 7. Trigger to auto-add owner as admin on new company creation
CREATE OR REPLACE FUNCTION public.add_owner_as_admin()
RETURNS TRIGGER
LANGUAGE plpgsql
SECURITY DEFINER
AS $$
BEGIN
    INSERT INTO public.company_members (company_id, user_id, role, accepted_at)
    VALUES (NEW.id, NEW.owner_id, 'admin', NOW())
    ON CONFLICT (company_id, user_id) DO NOTHING;
    RETURN NEW;
END;
$$;

DROP TRIGGER IF EXISTS on_company_created_add_owner ON public.companies;
CREATE TRIGGER on_company_created_add_owner
    AFTER INSERT ON public.companies
    FOR EACH ROW
    EXECUTE FUNCTION public.add_owner_as_admin();
