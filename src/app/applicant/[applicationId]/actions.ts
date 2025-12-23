'use server'

import { createClient } from '@/utils/supabase/server';
import { revalidatePath } from 'next/cache';

type ApplicationStatus = 'applied' | 'viewed' | 'shortlisted' | 'interview' | 'processing' | 'hired' | 'rejected';

// Helper to verify hirer owns the application's job
// eslint-disable-next-line @typescript-eslint/no-explicit-any
async function verifyHirerOwnership(supabase: any, applicationId: string, userId: string) {
    const { data: application } = await supabase
        .from('applications')
        .select(`
            id,
            job:jobs!inner (
                company:companies!inner (
                    owner_id
                )
            )
        `)
        .eq('id', applicationId)
        .single();

    if (!application || application.job?.company?.owner_id !== userId) {
        return false;
    }
    return true;
}

// Re-use the centralized logic which handles emails
import { updateApplicationStatus } from '../../dashboard/actions';

// Wraps centralized action but ensures revalidation for this page
async function localUpdateStatus(applicationId: string, newStatus: ApplicationStatus) {
    const result = await updateApplicationStatus(applicationId, newStatus);
    if (result.success) {
        revalidatePath(`/applicant/${applicationId}`);
    }
    return result;
}

export async function shortlistApplicant(applicationId: string) {
    return localUpdateStatus(applicationId, 'shortlisted');
}

export async function markProcessing(applicationId: string) {
    return localUpdateStatus(applicationId, 'processing');
}

export async function hireApplicant(applicationId: string) {
    return localUpdateStatus(applicationId, 'hired');
}

export async function rejectApplicant(applicationId: string) {
    return localUpdateStatus(applicationId, 'rejected');
}

// Called when hirer opens applicant profile
export async function markViewed(applicationId: string) {
    // We can use localUpdateStatus here too, but we need to check current status first 
    // to avoid overwriting advanced statuses.
    // The previous implementation did this check.

    const supabase = await createClient();
    const { data: app } = await supabase
        .from('applications')
        .select('status')
        .eq('id', applicationId)
        .single();

    if (app?.status === 'applied') {
        return localUpdateStatus(applicationId, 'viewed');
    }
    return { success: true };
}

// Schedule interview - creates record, updates status, sends email
export async function scheduleInterview(
    applicationId: string,
    data: {
        scheduledAt: string;
        location?: string;
        meetingLink?: string;
        description?: string;
    }
) {
    const supabase = await createClient();
    const { data: { user } } = await supabase.auth.getUser();

    if (!user) {
        return { success: false, message: 'Not authenticated' };
    }

    const isOwner = await verifyHirerOwnership(supabase, applicationId, user.id);
    if (!isOwner) {
        return { success: false, message: 'Unauthorized' };
    }

    // Fetch application details for email
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

    // 1. Create interview record
    const { error: interviewError } = await supabase
        .from('interviews')
        .insert({
            application_id: applicationId,
            scheduled_at: data.scheduledAt,
            location: data.location || null,
            meeting_link: data.meetingLink || null,
            description: data.description || null
        });

    if (interviewError) {
        console.error('Interview creation error:', interviewError);
        return { success: false, message: 'Failed to schedule interview' };
    }

    // 2. Update application status
    const { error: statusError } = await supabase
        .from('applications')
        .update({
            status: 'interview',
            status_updated_at: new Date().toISOString()
        })
        .eq('id', applicationId);

    if (statusError) {
        console.error('Status update error:', statusError);
        return { success: false, message: 'Interview created but status update failed' };
    }

    // 3. Send email notification (non-blocking)
    if (application) {
        const { sendInterviewInvite } = await import('@/lib/email');

        // Cast types for nested relations
        const applicant = application.applicant as unknown as { full_name: string | null; email: string };
        const job = application.job as unknown as { title: string; company: { name: string } };

        if (applicant?.email) {
            sendInterviewInvite({
                applicantName: applicant.full_name || 'Candidate',
                applicantEmail: applicant.email,
                jobTitle: job?.title || 'Position',
                companyName: job?.company?.name || 'Company',
                scheduledAt: new Date(data.scheduledAt),
                location: data.location,
                meetingLink: data.meetingLink,
                description: data.description,
            }).catch(err => console.error('Email send failed:', err));
        }
    }

    revalidatePath('/dashboard');
    revalidatePath(`/applicant/${applicationId}`);
    return { success: true, message: 'Interview scheduled successfully' };
}
