'use server'

import { createClient } from '@/utils/supabase/server';
import { redirect } from 'next/navigation';
import { JOBS } from '@/data/mockData'; // Fallback if DB fails? No, we must use DB.

// We need to define the state type for useFormState/useActionState
export type State = {
    message?: string;
    error?: string;
    success?: boolean;
} | null;

export async function createJob(prevState: State | null, formData: FormData): Promise<State> {
    const supabase = await createClient();

    // 1. Auth Check
    const { data: { user } } = await supabase.auth.getUser();
    if (!user) {
        return { error: 'You must be logged in to post a job.' };
    }

    // 2. Company Check (Hirer)
    const { data: company } = await supabase
        .from('companies')
        .select('id, name')
        .eq('owner_id', user.id)
        .single();

    if (!company) {
        return { error: 'No company profile found. Please register as a Hirer and create a company.' };
    }

    // 3. Extract Data
    const title = formData.get('title') as string;
    const category = formData.get('category') as string; // slug?
    const workplace_type = formData.get('workplace_type') as string;
    const job_type = formData.get('job_type') as string;
    const description = formData.get('description') as string;
    const requirements = formData.get('requirements') as string;
    const location = formData.get('location') as string; // "City, Country"

    const salary_min = Number(formData.get('salary_min'));
    const salary_max = Number(formData.get('salary_max'));

    // Parse JSON arrays
    let skills: string[] = [];
    let benefits: string[] = [];
    try {
        skills = JSON.parse(formData.get('skills') as string || '[]');
        benefits = JSON.parse(formData.get('benefits') as string || '[]');
    } catch (e) {
        return { error: 'Invalid data format for skills or benefits.' };
    }

    // 4. Validation (Basic)
    if (!title || !location || !description) {
        return { error: 'Please fill in all required fields.' };
    }

    // Parse optional closes_at date
    const closesAtRaw = formData.get('closes_at') as string;
    const closes_at = closesAtRaw ? new Date(closesAtRaw).toISOString() : null;

    // 5. Insert into DB
    const { data: job, error } = await supabase
        .from('jobs')
        .insert({
            title,
            company_id: company.id,
            category_slug: category, // Assuming slug based on value
            workplace_type,
            job_type,
            location,
            salary_min,
            salary_max,
            description_snippet: description.substring(0, 150) + '...',
            description,
            requirements,
            skills,
            benefits,
            status: 'active',
            closes_at
        })
        .select()
        .single();

    if (error) {
        console.error('Job Create Error:', error);
        // If error is "column description does not exist", I'll know.
        return { error: `Failed to create job: ${error.message}` };
    }

    // 6. Redirect
    redirect(`/job/${job.id}`);
}
