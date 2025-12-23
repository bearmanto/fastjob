'use server'

import { createClient } from '@/utils/supabase/server';
import { revalidatePath } from 'next/cache';

export async function verifyCompany(companyId: string, action: 'approve' | 'reject', reason?: string) {
    const supabase = await createClient();

    // Check Admin Status
    const { data: { user } } = await supabase.auth.getUser();
    if (!user) throw new Error("Not authenticated");

    const { data: profile } = await supabase
        .from('profiles')
        .select('is_admin')
        .eq('id', user.id)
        .single();

    if (!profile?.is_admin) {
        throw new Error("Unauthorized: Admin access required.");
    }

    // Perform Update
    const updates: {
        verification_status: 'verified' | 'rejected';
        verified?: boolean;
        rejection_reason?: string;
    } = {
        verification_status: action === 'approve' ? 'verified' : 'rejected'
    };

    if (action === 'approve') {
        updates.verified = true;
    } else {
        updates.verified = false;
        updates.rejection_reason = reason || 'Requirements not met.';
    }

    const { error } = await supabase
        .from('companies')
        .update(updates)
        .eq('id', companyId);

    if (error) {
        console.error("Admin Verify Error:", error);
        return { success: false, message: "Failed to update company status." };
    }

    revalidatePath('/admin');
    return { success: true, message: `Company ${action}d successfully.` };
}
