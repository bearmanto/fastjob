'use server';

import { createClient } from '@/utils/supabase/server';
import { revalidatePath } from 'next/cache';

export interface AlertPreferences {
    keywords: string[];
    locations: string[];
    categories: string[];
    job_types: string[];
    workplace_types: string[];
    salary_min: number | null;
    frequency: 'daily' | 'weekly' | 'instant' | 'off';
}

export async function getAlertPreferences(): Promise<AlertPreferences | null> {
    const supabase = await createClient();
    const { data: { user } } = await supabase.auth.getUser();

    if (!user) return null;

    const { data } = await supabase
        .from('job_alert_preferences')
        .select('*')
        .eq('user_id', user.id)
        .single();

    if (!data) return null;

    return {
        keywords: data.keywords || [],
        locations: data.locations || [],
        categories: data.categories || [],
        job_types: data.job_types || [],
        workplace_types: data.workplace_types || [],
        salary_min: data.salary_min,
        frequency: data.frequency || 'daily'
    };
}

export async function saveAlertPreferences(prefs: AlertPreferences) {
    const supabase = await createClient();
    const { data: { user } } = await supabase.auth.getUser();

    if (!user) {
        return { success: false, error: 'Not authenticated' };
    }

    // Check if preferences already exist
    const { data: existing } = await supabase
        .from('job_alert_preferences')
        .select('id')
        .eq('user_id', user.id)
        .single();

    const prefData = {
        user_id: user.id,
        keywords: prefs.keywords.length > 0 ? prefs.keywords : null,
        locations: prefs.locations.length > 0 ? prefs.locations : null,
        categories: prefs.categories.length > 0 ? prefs.categories : null,
        job_types: prefs.job_types.length > 0 ? prefs.job_types : null,
        workplace_types: prefs.workplace_types.length > 0 ? prefs.workplace_types : null,
        salary_min: prefs.salary_min,
        frequency: prefs.frequency,
        updated_at: new Date().toISOString()
    };

    let error;

    if (existing) {
        // Update existing
        const result = await supabase
            .from('job_alert_preferences')
            .update(prefData)
            .eq('user_id', user.id);
        error = result.error;
    } else {
        // Insert new
        const result = await supabase
            .from('job_alert_preferences')
            .insert(prefData);
        error = result.error;
    }

    if (error) {
        console.error('Error saving alert preferences:', error);
        return { success: false, error: error.message };
    }

    revalidatePath('/profile');
    return { success: true };
}

export async function disableAlerts() {
    const supabase = await createClient();
    const { data: { user } } = await supabase.auth.getUser();

    if (!user) {
        return { success: false, error: 'Not authenticated' };
    }

    const { error } = await supabase
        .from('job_alert_preferences')
        .update({ frequency: 'off' })
        .eq('user_id', user.id);

    if (error) {
        return { success: false, error: error.message };
    }

    revalidatePath('/profile');
    return { success: true };
}
