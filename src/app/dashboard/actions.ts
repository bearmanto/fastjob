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
