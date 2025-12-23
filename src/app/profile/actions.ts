'use server'

import { revalidatePath } from 'next/cache';
import { createClient } from '@/utils/supabase/server';

export async function updateBasicProfile(formData: FormData) {
    const supabase = await createClient();
    const { data: { user } } = await supabase.auth.getUser();

    if (!user) {
        throw new Error('Not authenticated');
    }

    const headline = formData.get('headline') as string;
    const location = formData.get('location') as string;
    const summary = formData.get('summary') as string;
    const phone = formData.get('phone') as string;
    const linkedin = formData.get('linkedin') as string;
    const full_name = formData.get('full_name') as string;
    const willing_to_relocate = formData.get('willing_to_relocate') === 'on';
    const country_code = formData.get('country_code') as string;

    const { error } = await supabase
        .from('profiles')
        .update({
            full_name,
            headline,
            location,
            summary,
            phone,
            linkedin,
            willing_to_relocate,
            country_code: country_code || null,
        })
        .eq('id', user.id);

    if (error) {
        console.error('Profile update error:', error);
        throw new Error('Failed to update profile');
    }

    if (error) {
        console.error('Profile update error:', error);
        throw new Error('Failed to update profile');
    }

    revalidatePath('/profile');
}

export async function saveResume(filePath: string) {
    const supabase = await createClient();
    const { data: { user } } = await supabase.auth.getUser();
    if (!user) throw new Error('Not authenticated');

    // 1. Check for existing resume to delete (Cleanup)
    const { data: profile } = await supabase
        .from('profiles')
        .select('resume_url')
        .eq('id', user.id)
        .single();

    if (profile?.resume_url) {
        const urlParts = profile.resume_url.split('/resumes/');
        if (urlParts.length > 1) {
            const oldPath = urlParts[1];
            await supabase.storage.from('resumes').remove([oldPath]);
        }
    }

    // 2. Get Public URL for new file
    const { data: { publicUrl } } = supabase.storage.from('resumes').getPublicUrl(filePath);

    // 3. Update DB
    const { error } = await supabase
        .from('profiles')
        .update({ resume_url: publicUrl })
        .eq('id', user.id);

    if (error) {
        console.error('Resume save error:', error);
        throw new Error('Failed to save resume URL');
    }
    revalidatePath('/profile');
}

export async function deleteResume() {
    const supabase = await createClient();
    const { data: { user } } = await supabase.auth.getUser();
    if (!user) throw new Error('Not authenticated');

    // 1. Get current resume URL
    const { data: profile } = await supabase
        .from('profiles')
        .select('resume_url')
        .eq('id', user.id)
        .single();

    if (profile?.resume_url) {
        // Extract file path from URL
        // URL format: .../storage/v1/object/public/resumes/userId/timestamp.pdf
        const urlParts = profile.resume_url.split('/resumes/');
        if (urlParts.length > 1) {
            const filePath = urlParts[1]; // e.g. "user-id/123456.pdf"

            // 2. Delete from Storage
            const { error: storageError } = await supabase
                .storage
                .from('resumes')
                .remove([filePath]);

            if (storageError) {
                console.error('Storage delete error:', storageError);
                // Continue to clear DB even if storage delete fails
            }
        }
    }

    // 3. Clear DB reference
    const { error } = await supabase
        .from('profiles')
        .update({ resume_url: null })
        .eq('id', user.id);

    if (error) {
        console.error('Resume delete error:', error);
        throw new Error('Failed to delete resume');
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
