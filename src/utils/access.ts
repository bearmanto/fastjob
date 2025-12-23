import { createClient } from '@/utils/supabase/server';

export type CompanyRole = 'admin' | 'recruiter' | 'viewer';

/**
 * Check if a user can access a company (either as owner or team member)
 */
export async function canAccessCompany(userId: string, companyId: string): Promise<boolean> {
    const supabase = await createClient();

    // Check if user is owner
    const { data: company } = await supabase
        .from('companies')
        .select('owner_id')
        .eq('id', companyId)
        .single();

    if (company?.owner_id === userId) {
        return true;
    }

    // Check if user is a team member
    const { data: member } = await supabase
        .from('company_members')
        .select('id')
        .eq('company_id', companyId)
        .eq('user_id', userId)
        .not('accepted_at', 'is', null)
        .single();

    return !!member;
}

/**
 * Get user's role in a company
 * Returns null if user has no access
 */
export async function getUserCompanyRole(userId: string, companyId: string): Promise<CompanyRole | null> {
    const supabase = await createClient();

    // Check if user is owner (owner = admin)
    const { data: company } = await supabase
        .from('companies')
        .select('owner_id')
        .eq('id', companyId)
        .single();

    if (company?.owner_id === userId) {
        return 'admin';
    }

    // Check team membership
    const { data: member } = await supabase
        .from('company_members')
        .select('role')
        .eq('company_id', companyId)
        .eq('user_id', userId)
        .not('accepted_at', 'is', null)
        .single();

    return (member?.role as CompanyRole) || null;
}

/**
 * Check if user can perform a specific action
 */
export function canPerformAction(role: CompanyRole | null, action: 'view' | 'edit' | 'manage'): boolean {
    if (!role) return false;

    switch (action) {
        case 'view':
            return ['admin', 'recruiter', 'viewer'].includes(role);
        case 'edit':
            return ['admin', 'recruiter'].includes(role);
        case 'manage':
            return role === 'admin';
        default:
            return false;
    }
}

/**
 * Get all companies a user has access to
 */
export async function getUserCompanies(userId: string) {
    const supabase = await createClient();

    // Get companies user owns
    const { data: ownedCompanies } = await supabase
        .from('companies')
        .select('id, name, verified')
        .eq('owner_id', userId);

    // Get companies user is member of
    const { data: memberOf } = await supabase
        .from('company_members')
        .select(`
            role,
            company:companies (
                id,
                name,
                verified
            )
        `)
        .eq('user_id', userId)
        .not('accepted_at', 'is', null);

    // Combine and deduplicate
    const companies = new Map();

    (ownedCompanies || []).forEach(c => {
        companies.set(c.id, { ...c, role: 'admin' as CompanyRole, isOwner: true });
    });

    (memberOf || []).forEach(m => {
        const company = Array.isArray(m.company) ? m.company[0] : m.company;
        if (company && !companies.has(company.id)) {
            companies.set(company.id, { ...company, role: m.role as CompanyRole, isOwner: false });
        }
    });

    return Array.from(companies.values());
}
