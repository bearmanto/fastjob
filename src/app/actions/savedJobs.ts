'use server'

import { createClient } from '@/utils/supabase/server';
import { revalidatePath } from 'next/cache';

export async function toggleSavedJob(jobId: string) {
    const supabase = await createClient();
    const { data: { user } } = await supabase.auth.getUser();

    if (!user) {
        throw new Error('You must be logged in to save jobs.');
    }

    // Check if already saved
    const { data: existing } = await supabase
        .from('saved_jobs')
        .select('id')
        .eq('user_id', user.id)
        .eq('job_id', jobId)
        .single();

    if (existing) {
        // Unsave
        const { error } = await supabase
            .from('saved_jobs')
            .delete()
            .eq('id', existing.id);

        if (error) throw new Error('Failed to unsave job.');
        return { saved: false, message: 'Job removed from saved items.' };
    } else {
        // Save
        const { error } = await supabase
            .from('saved_jobs')
            .insert({ user_id: user.id, job_id: jobId });

        if (error) throw new Error('Failed to save job.');
        return { saved: true, message: 'Job saved successfully!' };
    }
}

export async function getSavedJobs() {
    const supabase = await createClient();
    const { data: { user } } = await supabase.auth.getUser();

    if (!user) return [];

    const { data, error } = await supabase
        .from('saved_jobs')
        .select(`
            id,
            created_at,
            job:jobs (
                id,
                title,
                location,
                salary_min,
                salary_max,
                company:companies(name, verified),
                status
            )
        `)
        .eq('user_id', user.id)
        .order('created_at', { ascending: false });

    if (error) {
        console.error('Error fetching saved jobs:', error);
        return [];
    }

    return data.map(item => ({
        ...item,
        // Flatten the job structure slightly if needed for the UI, 
        // or just return as is.
        // Handling the array return from Supabase for relations if necessary
        job: Array.isArray(item.job) ? item.job[0] : item.job
    }));
}

export async function checkIsJobSaved(jobId: string) {
    const supabase = await createClient();
    const { data: { user } } = await supabase.auth.getUser();

    if (!user) return false;

    const { data } = await supabase
        .from('saved_jobs')
        .select('id')
        .eq('user_id', user.id)
        .eq('job_id', jobId)
        .single();

    return !!data;
}
