'use server';

import { createClient } from '@/utils/supabase/server';
import { revalidatePath } from 'next/cache';
import { getUserCompanyRole, canPerformAction } from '@/utils/access';

type ActionState = { error: string } | { success: boolean; pending?: boolean } | null;

// Generate a random token
function generateToken(): string {
    return Array.from(crypto.getRandomValues(new Uint8Array(32)))
        .map(b => b.toString(16).padStart(2, '0'))
        .join('');
}

/**
 * Invite a new team member by email
 */
export async function inviteTeamMember(_prevState: ActionState, formData: FormData): Promise<ActionState> {
    const supabase = await createClient();
    const { data: { user } } = await supabase.auth.getUser();

    if (!user) {
        return { error: 'Not authenticated' };
    }

    const email = formData.get('email') as string;
    const role = formData.get('role') as string;
    const companyId = formData.get('companyId') as string;

    if (!email || !role || !companyId) {
        return { error: 'Missing required fields' };
    }

    // Check if current user can manage team
    const userRole = await getUserCompanyRole(user.id, companyId);
    if (!canPerformAction(userRole, 'manage')) {
        return { error: 'You do not have permission to invite team members' };
    }

    // Get company name for email

    // Find user by email
    const { data: invitee } = await supabase
        .from('profiles')
        .select('id, email')
        .eq('email', email)
        .single();

    if (!invitee) {
        // User doesn't exist - create pending invite

        // Check if already has pending invite
        const { data: existingPending } = await supabase
            .from('pending_team_invites')
            .select('id')
            .eq('email', email)
            .eq('company_id', companyId)
            .single();

        if (existingPending) {
            return { error: 'An invite is already pending for this email' };
        }

        // Create pending invite
        const token = generateToken();
        const { error: insertError } = await supabase
            .from('pending_team_invites')
            .insert({
                email,
                company_id: companyId,
                role,
                invited_by: user.id,
                token
            });

        if (insertError) {
            console.error('Pending invite error:', insertError);
            return { error: `Failed to create invite: ${insertError.message}` };
        }

        // Log invite URL (email disabled for now - requires domain verification)
        const baseUrl = process.env.NEXT_PUBLIC_BASE_URL || 'http://localhost:3000';
        const inviteUrl = `${baseUrl}/register?invite=${token}`;
        console.log('=== TEAM INVITE ===');
        console.log(`Email: ${email}`);
        console.log(`Role: ${role}`);
        console.log(`Invite URL: ${inviteUrl}`);
        console.log('===================');

        revalidatePath('/dashboard/team');
        return { success: true, pending: true };
    }

    // User exists - check if already a member
    const { data: existing } = await supabase
        .from('company_members')
        .select('id')
        .eq('company_id', companyId)
        .eq('user_id', invitee.id)
        .single();

    if (existing) {
        return { error: 'This user is already a team member' };
    }

    // Add member directly
    const { error } = await supabase
        .from('company_members')
        .insert({
            company_id: companyId,
            user_id: invitee.id,
            role: role,
            invited_by: user.id,
            accepted_at: new Date().toISOString()
        });

    if (error) {
        console.error('Invite error:', error);
        return { error: 'Failed to invite team member' };
    }

    revalidatePath('/dashboard/team');
    return { success: true };
}

/**
 * Remove a team member
 */
export async function removeTeamMember(_prevState: ActionState, formData: FormData): Promise<ActionState> {
    const supabase = await createClient();
    const { data: { user } } = await supabase.auth.getUser();

    if (!user) {
        return { error: 'Not authenticated' };
    }

    const memberId = formData.get('memberId') as string;
    const companyId = formData.get('companyId') as string;

    if (!memberId || !companyId) {
        return { error: 'Missing required fields' };
    }

    // Check permissions
    const userRole = await getUserCompanyRole(user.id, companyId);
    if (!canPerformAction(userRole, 'manage')) {
        return { error: 'You do not have permission to remove team members' };
    }

    // Get member details
    const { data: member } = await supabase
        .from('company_members')
        .select('user_id, role')
        .eq('id', memberId)
        .single();

    if (!member) {
        return { error: 'Member not found' };
    }

    // Prevent self-removal
    if (member.user_id === user.id) {
        return { error: 'You cannot remove yourself' };
    }

    // Prevent removing the last admin (check company owner)
    const { data: company } = await supabase
        .from('companies')
        .select('owner_id')
        .eq('id', companyId)
        .single();

    if (member.user_id === company?.owner_id) {
        return { error: 'Cannot remove the company owner' };
    }

    const { error } = await supabase
        .from('company_members')
        .delete()
        .eq('id', memberId);

    if (error) {
        console.error('Remove error:', error);
        return { error: 'Failed to remove team member' };
    }

    revalidatePath('/dashboard/team');
    return { success: true };
}

/**
 * Update a team member's role
 */
export async function updateMemberRole(_prevState: ActionState, formData: FormData): Promise<ActionState> {
    const supabase = await createClient();
    const { data: { user } } = await supabase.auth.getUser();

    if (!user) {
        return { error: 'Not authenticated' };
    }

    const memberId = formData.get('memberId') as string;
    const companyId = formData.get('companyId') as string;
    const newRole = formData.get('role') as string;

    if (!memberId || !companyId || !newRole) {
        return { error: 'Missing required fields' };
    }

    // Check permissions
    const userRole = await getUserCompanyRole(user.id, companyId);
    if (!canPerformAction(userRole, 'manage')) {
        return { error: 'You do not have permission to update roles' };
    }

    const { error } = await supabase
        .from('company_members')
        .update({ role: newRole })
        .eq('id', memberId);

    if (error) {
        console.error('Update role error:', error);
        return { error: 'Failed to update role' };
    }

    revalidatePath('/dashboard/team');
    return { success: true };
}

/**
 * Revoke a pending invite
 */
export async function revokePendingInvite(_prevState: ActionState, formData: FormData): Promise<ActionState> {
    const supabase = await createClient();
    const { data: { user } } = await supabase.auth.getUser();

    if (!user) {
        return { error: 'Not authenticated' };
    }

    const inviteId = formData.get('inviteId') as string;
    const companyId = formData.get('companyId') as string;

    if (!inviteId || !companyId) {
        return { error: 'Missing required fields' };
    }

    // Check permissions
    const userRole = await getUserCompanyRole(user.id, companyId);
    if (!canPerformAction(userRole, 'manage')) {
        return { error: 'You do not have permission to revoke invites' };
    }

    const { error } = await supabase
        .from('pending_team_invites')
        .delete()
        .eq('id', inviteId);

    if (error) {
        console.error('Revoke invite error:', error);
        return { error: 'Failed to revoke invite' };
    }

    revalidatePath('/dashboard/team');
    return { success: true };
}
