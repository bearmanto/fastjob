'use server'

import { revalidatePath } from 'next/cache';
import { createClient } from '@/utils/supabase/server';
import { redirect } from 'next/navigation';

export async function updateBasicProfile(formData: FormData) {
    const supabase = await createClient();
    const { data: { user } } = await supabase.auth.getUser();

    if (!user) {
        throw new Error('Not authenticated');
    }

    const headline = formData.get('headline') as string;
    const summary = formData.get('summary') as string;
    const phone = formData.get('phone') as string;
    const linkedin = formData.get('linkedin') as string;
    const full_name = formData.get('full_name') as string;
    const resumeFile = formData.get('resume') as File | null;

    let resumeUrl = formData.get('current_resume_url') as string;

    // Handle File Upload if a new file is provided
    if (resumeFile && resumeFile.size > 0) {
        // Validate File Size (e.g., 5MB) and Type
        if (resumeFile.size > 5 * 1024 * 1024) {
            // ideally return error state, but for now throwing
            throw new Error('File size too large. Max 5MB.');
        }
        if (resumeFile.type !== 'application/pdf') {
            throw new Error('Only PDF files are allowed.');
        }

        const filename = `${user.id}/${Date.now()}_${resumeFile.name}`;

        const { error: uploadError } = await supabase.storage
            .from('resumes')
            .upload(filename, resumeFile, {
                upsert: true,
            });

        if (uploadError) {
            console.error('Upload error:', uploadError);
            throw new Error('Failed to upload resume');
        }

        // Get Public URL (if bucket is public) or we store the path
        // For private buckets, we might just store the path and sign it on read.
        // But for simplicity in "Easy Apply", let's assume we want a downloadable link.
        // If the bucket is initialized as private, we need createSignedUrl logic on read.
        // For now, let's just store the path.
        resumeUrl = filename;
    }

    const { error } = await supabase
        .from('profiles')
        .update({
            full_name,
            headline,
            summary,
            phone,
            linkedin,
            resume_url: resumeUrl,
        })
        .eq('id', user.id);

    if (error) {
        console.error('Profile update error:', error);
        throw new Error('Failed to update profile');
    }

    revalidatePath('/profile');
}

export async function addExperience(formData: FormData) {
    const supabase = await createClient();
    const { data: { user } } = await supabase.auth.getUser();
    if (!user) throw new Error('Not authenticated');

    const title = formData.get('title') as string;
    const company = formData.get('company') as string;
    const location = formData.get('location') as string;
    const start_date = formData.get('start_date') as string;
    // End date can be empty if "Current"
    const end_date = formData.get('end_date') as string || null;
    const is_current = formData.get('is_current') === 'on';
    const description = formData.get('description') as string;

    const { error } = await supabase
        .from('profile_experience')
        .insert({
            profile_id: user.id,
            title,
            company,
            location,
            start_date: start_date || null, // Handle empty string
            end_date: end_date,
            is_current,
            description
        });

    if (error) {
        console.error(error);
        throw new Error('Failed to add experience');
    }
    revalidatePath('/profile');
}

export async function deleteExperience(id: string) {
    const supabase = await createClient();
    const { data: { user } } = await supabase.auth.getUser();
    if (!user) throw new Error('Not authenticated');

    const { error } = await supabase
        .from('profile_experience')
        .delete()
        .eq('id', id)
        .eq('profile_id', user.id); // Security check

    if (error) throw new Error('Failed to delete experience');
    revalidatePath('/profile');
}

export async function addEducation(formData: FormData) {
    const supabase = await createClient();
    const { data: { user } } = await supabase.auth.getUser();
    if (!user) throw new Error('Not authenticated');

    const school = formData.get('school') as string;
    const degree = formData.get('degree') as string;
    const field_of_study = formData.get('field_of_study') as string;
    const start_date = formData.get('start_date') as string;
    const end_date = formData.get('end_date') as string || null;

    const { error } = await supabase
        .from('profile_education')
        .insert({
            profile_id: user.id,
            school,
            degree,
            field_of_study,
            start_date: start_date || null,
            end_date,
        });

    if (error) {
        console.error(error);
        throw new Error('Failed to add education');
    }
    revalidatePath('/profile');
}

export async function deleteEducation(id: string) {
    const supabase = await createClient();
    const { data: { user } } = await supabase.auth.getUser();
    if (!user) throw new Error('Not authenticated');

    const { error } = await supabase
        .from('profile_education')
        .delete()
        .eq('id', id)
        .eq('profile_id', user.id);

    if (error) throw new Error('Failed to delete education');
    revalidatePath('/profile');
}
