'use server'

import { createClient } from '@/utils/supabase/server';
import { revalidatePath } from 'next/cache';

export async function applyForJob(jobId: string) {
    const supabase = await createClient();
    const { data: { user } } = await supabase.auth.getUser();

    if (!user) {
        throw new Error('You must be logged in to apply.');
    }

    // 1. Check if already applied
    const { data: existing } = await supabase
        .from('applications')
        .select('id')
        .eq('job_id', jobId)
        .eq('applicant_id', user.id)
        .single();

    if (existing) {
        return { success: false, message: 'You have already applied to this job.' };
    }

    // 2. Create Application
    const { error } = await supabase
        .from('applications')
        .insert({
            job_id: jobId,
            applicant_id: user.id,
            status: 'new'
        });

    if (error) {
        console.error('Application error:', error);
        return { success: false, message: 'Failed to submit application.' };
    }

    revalidatePath(`/job/${jobId}`);
    return { success: true, message: 'Application submitted successfully!' };
}
