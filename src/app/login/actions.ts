'use server'

import { revalidatePath } from 'next/cache';
import { redirect } from 'next/navigation';
import { createClient } from '@/utils/supabase/server';

export async function login(formData: FormData) {
    const supabase = await createClient();

    const email = formData.get('email') as string;
    const password = formData.get('password') as string;

    const { error } = await supabase.auth.signInWithPassword({
        email,
        password,
    });

    if (error) {
        redirect('/login?error=Invalid credentials');
    }

    revalidatePath('/', 'layout');
    redirect('/dashboard');
}

export async function signup(formData: FormData) {
    const supabase = await createClient();

    const email = formData.get('email') as string;
    const password = formData.get('password') as string;
    const role = formData.get('role') as string;
    const name = formData.get('name') as string;
    const companyName = formData.get('company_name') as string; // Optional, might be null for seekers

    const { error } = await supabase.auth.signUp({
        email,
        password,
        options: {
            data: {
                full_name: name,
                role: role,
                company_name: companyName || null,
            },
            // IMPORTANT: We want Supabase to send the OTP, but we don't need a redirect URL for OTP.
        }
    });

    if (error) {
        redirect('/register?error=' + error.message);
    }

    // Redirect to verification page with email pre-filled (via query param)
    redirect(`/verify?email=${encodeURIComponent(email)}`);
}

export async function verifyOtp(formData: FormData) {
    const supabase = await createClient();
    const email = formData.get('email') as string;
    const token = formData.get('code') as string;

    const { data, error } = await supabase.auth.verifyOtp({
        email,
        token,
        type: 'signup',
    });

    if (error) {
        redirect(`/verify?email=${encodeURIComponent(email)}&error=${error.message}`);
    }

    // Check for pending team invites and auto-join
    if (data.user) {
        const { data: pendingInvites } = await supabase
            .from('pending_team_invites')
            .select('id, company_id, role')
            .eq('email', email)
            .gt('expires_at', new Date().toISOString());

        if (pendingInvites && pendingInvites.length > 0) {
            for (const invite of pendingInvites) {
                // Add user to company_members
                await supabase.from('company_members').insert({
                    company_id: invite.company_id,
                    user_id: data.user.id,
                    role: invite.role,
                    invited_by: null, // Could track this from the invite
                    accepted_at: new Date().toISOString()
                });

                // Delete the pending invite
                await supabase
                    .from('pending_team_invites')
                    .delete()
                    .eq('id', invite.id);
            }
        }
    }

    revalidatePath('/', 'layout');
    redirect('/dashboard');
}

export async function signout() {
    const supabase = await createClient();
    await supabase.auth.signOut();
    revalidatePath('/', 'layout');
    redirect('/');
}
