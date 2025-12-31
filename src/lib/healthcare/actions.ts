'use server';

import { createClient } from '@/utils/supabase/server';
import {
    HealthcareCountryConfig,
    HealthcareCertification,
    ProfileCertification,
    JobRequiredCertification,
    ProfileCertificationInput,
    JobCertificationInput
} from '@/types/healthcare';
import { revalidatePath } from 'next/cache';

// =============================================
// Country Config Functions
// =============================================

export async function getActiveCountries(): Promise<HealthcareCountryConfig[]> {
    const supabase = await createClient();
    const { data, error } = await supabase
        .from('healthcare_country_config')
        .select('*')
        .eq('is_active', true)
        .order('country_name');

    if (error) {
        console.error('Error fetching countries:', error);
        return [];
    }
    return data || [];
}

export async function getCountryConfig(countryCode: string): Promise<HealthcareCountryConfig | null> {
    const supabase = await createClient();
    const { data, error } = await supabase
        .from('healthcare_country_config')
        .select('*')
        .eq('country_code', countryCode)
        .single();

    if (error) return null;
    return data;
}

// =============================================
// Certification Functions
// =============================================

export async function getCertificationsByCountry(countryCode: string): Promise<HealthcareCertification[]> {
    const supabase = await createClient();
    const { data, error } = await supabase
        .from('healthcare_certifications')
        .select('*')
        .eq('country_code', countryCode)
        .eq('is_active', true)
        .order('category')
        .order('name');

    if (error) {
        console.error('Error fetching certifications:', error);
        return [];
    }
    return data || [];
}

export async function getCertificationById(id: string): Promise<HealthcareCertification | null> {
    const supabase = await createClient();
    const { data, error } = await supabase
        .from('healthcare_certifications')
        .select('*')
        .eq('id', id)
        .single();

    if (error) return null;
    return data;
}

export async function searchCertifications(
    countryCode?: string,
    category?: string
): Promise<HealthcareCertification[]> {
    const supabase = await createClient();
    let query = supabase
        .from('healthcare_certifications')
        .select('*')
        .eq('is_active', true);

    if (countryCode) {
        query = query.eq('country_code', countryCode);
    }
    if (category) {
        query = query.eq('category', category);
    }

    const { data, error } = await query.order('name');

    if (error) {
        console.error('Error searching certifications:', error);
        return [];
    }
    return data || [];
}

// =============================================
// Profile Certification Functions
// =============================================

export async function getProfileCertifications(profileId: string): Promise<ProfileCertification[]> {
    const supabase = await createClient();
    const { data, error } = await supabase
        .from('profile_certifications')
        .select(`
            *,
            certification:healthcare_certifications(*)
        `)
        .eq('profile_id', profileId)
        .order('created_at', { ascending: false });

    if (error) {
        console.error('Error fetching profile certifications:', error);
        return [];
    }
    return data || [];
}

export async function addProfileCertification(
    profileId: string,
    input: ProfileCertificationInput
): Promise<{ success: boolean; error?: string }> {
    const supabase = await createClient();

    const { error } = await supabase
        .from('profile_certifications')
        .insert({
            profile_id: profileId,
            certification_id: input.certification_id,
            license_number: input.license_number || null,
            issue_date: input.issue_date || null,
            expiry_date: input.expiry_date || null,
            state_or_region: input.state_or_region || null,
            document_url: input.document_url || null,
            verification_status: 'pending'
        });

    if (error) {
        console.error('Error adding certification:', error);
        return { success: false, error: error.message };
    }

    revalidatePath('/profile');
    return { success: true };
}

export async function updateProfileCertification(
    id: string,
    input: Partial<ProfileCertificationInput>
): Promise<{ success: boolean; error?: string }> {
    const supabase = await createClient();

    const { error } = await supabase
        .from('profile_certifications')
        .update({
            ...input,
            updated_at: new Date().toISOString()
        })
        .eq('id', id);

    if (error) {
        console.error('Error updating certification:', error);
        return { success: false, error: error.message };
    }

    revalidatePath('/profile');
    return { success: true };
}

export async function deleteProfileCertification(id: string): Promise<{ success: boolean; error?: string }> {
    const supabase = await createClient();

    const { error } = await supabase
        .from('profile_certifications')
        .delete()
        .eq('id', id);

    if (error) {
        console.error('Error deleting certification:', error);
        return { success: false, error: error.message };
    }

    revalidatePath('/profile');
    return { success: true };
}

// =============================================
// Job Certification Functions
// =============================================

export async function getJobCertifications(jobId: string): Promise<JobRequiredCertification[]> {
    const supabase = await createClient();
    const { data, error } = await supabase
        .from('job_required_certifications')
        .select(`
            *,
            certification:healthcare_certifications(*)
        `)
        .eq('job_id', jobId);

    if (error) {
        console.error('Error fetching job certifications:', error);
        return [];
    }
    return data || [];
}

export async function setJobCertifications(
    jobId: string,
    certifications: JobCertificationInput[]
): Promise<{ success: boolean; error?: string }> {
    const supabase = await createClient();

    // Delete existing certifications for this job
    const { error: deleteError } = await supabase
        .from('job_required_certifications')
        .delete()
        .eq('job_id', jobId);

    if (deleteError) {
        console.error('Error clearing job certifications:', deleteError);
        return { success: false, error: deleteError.message };
    }

    // Insert new certifications if any
    if (certifications.length > 0) {
        const { error: insertError } = await supabase
            .from('job_required_certifications')
            .insert(
                certifications.map(cert => ({
                    job_id: jobId,
                    certification_id: cert.certification_id,
                    is_required: cert.is_required
                }))
            );

        if (insertError) {
            console.error('Error adding job certifications:', insertError);
            return { success: false, error: insertError.message };
        }
    }

    return { success: true };
}

// =============================================
// Admin/Compliance Functions
// =============================================

export async function getExpiringCertifications(
    daysThreshold: number = 90
): Promise<ProfileCertification[]> {
    const supabase = await createClient();
    const thresholdDate = new Date();
    thresholdDate.setDate(thresholdDate.getDate() + daysThreshold);

    const { data, error } = await supabase
        .from('profile_certifications')
        .select(`
            *,
            certification:healthcare_certifications(*)
        `)
        .lte('expiry_date', thresholdDate.toISOString().split('T')[0])
        .neq('verification_status', 'expired')
        .order('expiry_date');

    if (error) {
        console.error('Error fetching expiring certifications:', error);
        return [];
    }
    return data || [];
}

export async function verifyCertification(
    id: string,
    verifierId: string,
    status: 'verified' | 'rejected',
    notes?: string
): Promise<{ success: boolean; error?: string }> {
    const supabase = await createClient();

    const { error } = await supabase
        .from('profile_certifications')
        .update({
            verification_status: status,
            verified_at: new Date().toISOString(),
            verified_by: verifierId,
            notes: notes || null,
            updated_at: new Date().toISOString()
        })
        .eq('id', id);

    if (error) {
        console.error('Error verifying certification:', error);
        return { success: false, error: error.message };
    }

    return { success: true };
}
