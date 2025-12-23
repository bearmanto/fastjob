'use server'

import { createClient } from '@/utils/supabase/server';
import { revalidatePath } from 'next/cache';

export async function updateCompanyProfile(formData: FormData) {
    const supabase = await createClient();
    const { data: { user } } = await supabase.auth.getUser();

    if (!user) {
        throw new Error('Not authenticated');
    }

    const companyName = formData.get('name') as string;
    const countryCode = formData.get('country_code') as string;
    const location = formData.get('location') as string;
    const website = formData.get('website') as string;
    const industry = formData.get('industry') as string;
    const description = formData.get('description') as string;

    // We assume the user is the owner of the company.
    // RLS policies should enforce this, but we can also look up the company ID first if needed.
    // simpler: update companies where owner_id = user.id

    const { error } = await supabase
        .from('companies')
        .update({
            name: companyName,
            country_code: countryCode,
            location: location,
            website: website,
            industry: industry,
            description: description,
        })
        .eq('owner_id', user.id);

    if (error) {
        console.error('Error updating company:', error);
        return { success: false, message: 'Failed to update company profile.' };
    }

    revalidatePath('/dashboard');
    return { success: true, message: 'Company profile updated!' };
}

export async function submitVerification(formData: FormData) {
    const supabase = await createClient();
    const { data: { user } } = await supabase.auth.getUser();

    if (!user) {
        throw new Error('Not authenticated');
    }

    const npwpNumber = formData.get('npwp_number') as string;
    const npwpUrl = formData.get('npwp_url') as string;
    const docType = formData.get('business_doc_type') as string;
    const docUrl = formData.get('business_doc_url') as string;

    const { error } = await supabase
        .from('companies')
        .update({
            npwp_number: npwpNumber,
            npwp_url: npwpUrl,
            business_doc_type: docType,
            business_doc_url: docUrl,
            verification_status: 'pending' // Move to pending state
        })
        .eq('owner_id', user.id);

    if (error) {
        console.error('Error submitting verification:', error);
        return { success: false, message: 'Failed to submit verification.' };
    }

    revalidatePath('/dashboard');
    revalidatePath('/company/profile');
    return { success: true, message: 'Verification requested! We will review your documents shortly.' };
}

// ============================================
// APPLICATION STATUS MANAGEMENT
// ============================================

type ApplicationStatus = 'applied' | 'viewed' | 'shortlisted' | 'interview' | 'processing' | 'hired' | 'rejected';

export async function updateApplicationStatus(applicationId: string, newStatus: ApplicationStatus) {
    const supabase = await createClient();
    const { data: { user } } = await supabase.auth.getUser();

    if (!user) {
        return { success: false, message: 'Not authenticated' };
    }

    // RLS policy ensures only hirers can update their own job applications
    const { error } = await supabase
        .from('applications')
        .update({
            status: newStatus,
            status_updated_at: new Date().toISOString()
        })
        .eq('id', applicationId);

    if (error) {
        console.error('Error updating application status:', error);
        return { success: false, message: 'Failed to update status.' };
    }

    // Send email notification for specific statuses
    if (newStatus === 'shortlisted' || newStatus === 'rejected') {
        const { data: application } = await supabase
            .from('applications')
            .select(`
                applicant:profiles!applications_applicant_id_fkey (
                    full_name,
                    email
                ),
                job:jobs!inner (
                    title,
                    company:companies!inner (
                        name
                    )
                )
            `)
            .eq('id', applicationId)
            .single();

        if (application) {
            const { sendApplicationStatusUpdate } = await import('@/lib/email');

            // Type casting for joined data
            const applicant = application.applicant as unknown as { full_name: string; email: string };
            const job = application.job as unknown as { title: string; company: { name: string } };

            if (applicant?.email) {
                await sendApplicationStatusUpdate({
                    recipientName: applicant.full_name || 'Candidate',
                    recipientEmail: applicant.email,
                    jobTitle: job.title,
                    companyName: job.company.name,
                    status: newStatus
                });
            }
        }
    }

    revalidatePath('/dashboard');
    return { success: true, message: `Status updated to ${newStatus}.` };
}

// ============================================
// JOB LIFECYCLE MANAGEMENT
// ============================================

export async function closeJob(jobId: string) {
    const supabase = await createClient();
    const { data: { user } } = await supabase.auth.getUser();

    if (!user) {
        return { success: false, message: 'Not authenticated' };
    }

    // Verify ownership through company
    const { data: company } = await supabase
        .from('companies')
        .select('id')
        .eq('owner_id', user.id)
        .single();

    if (!company) {
        return { success: false, message: 'No company found.' };
    }

    // Close the job (one-way, cannot reopen)
    const { error } = await supabase
        .from('jobs')
        .update({
            status: 'closed',
            closed_at: new Date().toISOString()
        })
        .eq('id', jobId)
        .eq('company_id', company.id);

    if (error) {
        console.error('Error closing job:', error);
        return { success: false, message: 'Failed to close job.' };
    }

    revalidatePath('/dashboard');
    return { success: true, message: 'Job closed successfully.' };
}
