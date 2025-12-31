'use server';

import { createClient } from '@/utils/supabase/server';
import { VerificationStatus } from '@/types/healthcare';

export interface PendingCertification {
    id: string;
    user_id: string;
    certification_id: string;
    country_code: string;
    license_number: string;
    issue_date: string;
    expiry_date: string | null;
    status: VerificationStatus;
    verification_url: string | null;
    document_url: string | null;
    created_at: string;
    profile: {
        full_name: string;
        email: string;
    };
    certification: {
        name: string;
        abbreviation: string | null;
        category: string;
    };
}

export async function getPendingCertifications(country?: string) {
    const supabase = await createClient();

    // Check if user is admin (simplified check - in real app would check role)
    const { data: { user } } = await supabase.auth.getUser();
    if (!user) throw new Error('Unauthorized');

    // Query pending certifications
    let query = supabase
        .from('profile_certifications')
        .select(`
            *,
            profile:profiles(full_name, email),
            certification:healthcare_certifications(name, abbreviation, category)
        `)
        .eq('status', 'pending')
        .order('created_at', { ascending: true });

    if (country) {
        query = query.eq('country_code', country);
    }

    const { data, error } = await query;

    if (error) {
        console.error('Error fetching pending certs:', error);
        throw new Error('Failed to fetch pending certifications');
    }

    return data as unknown as PendingCertification[];
}

export async function verifyCertification(certId: string, status: 'verified' | 'rejected', notes?: string) {
    const supabase = await createClient();

    // Check auth
    const { data: { user } } = await supabase.auth.getUser();
    if (!user) throw new Error('Unauthorized');

    const { error } = await supabase
        .from('profile_certifications')
        .update({
            status,
            verified_at: new Date().toISOString(),
            verified_by: user.id
            // In a real app, we'd add 'rejection_reason' column if rejected
        })
        .eq('id', certId);

    if (error) {
        console.error('Error updating verification:', error);
        throw new Error('Failed to update verification status');
    }

    return { success: true };
}

export async function getComplianceStats() {
    const supabase = await createClient();

    const { data, error } = await supabase
        .from('profile_certifications')
        .select('country_code, status');

    if (error) return {
        total: 0,
        pending: 0,
        verified: 0,
        byCountry: {} as Record<string, { total: number, pending: number }>
    };

    // Aggregate stats
    const stats = {
        total: data.length,
        pending: data.filter(c => c.status === 'pending').length,
        verified: data.filter(c => c.status === 'verified').length,
        byCountry: {} as Record<string, { total: number, pending: number }>
    };

    data.forEach(c => {
        if (!stats.byCountry[c.country_code]) {
            stats.byCountry[c.country_code] = { total: 0, pending: 0 };
        }
        stats.byCountry[c.country_code].total++;
        if (c.status === 'pending') {
            stats.byCountry[c.country_code].pending++;
        }
    });

    return stats;
}
