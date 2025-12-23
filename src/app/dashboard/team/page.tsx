import { redirect } from 'next/navigation';
import { createClient } from '@/utils/supabase/server';
import { Breadcrumbs } from '@/components/ui/Breadcrumbs';
import { getUserCompanyRole, canPerformAction } from '@/utils/access';
import { TeamMemberRow } from './TeamMemberRow';
import { PendingInviteRow } from './PendingInviteRow';
import { InviteForm } from './InviteForm';
import styles from './Team.module.css';

export default async function TeamPage() {
    const supabase = await createClient();
    const { data: { user } } = await supabase.auth.getUser();

    if (!user) {
        redirect('/login');
    }

    // Get user's company
    const { data: company } = await supabase
        .from('companies')
        .select('id, name, owner_id')
        .eq('owner_id', user.id)
        .single();

    if (!company) {
        redirect('/dashboard');
    }

    // Check if user can manage team
    const userRole = await getUserCompanyRole(user.id, company.id);
    const canManage = canPerformAction(userRole, 'manage');

    // Get team members
    const { data: members } = await supabase
        .from('company_members')
        .select(`
            id,
            role,
            invited_at,
            accepted_at,
            user:profiles!company_members_user_id_fkey (
                id,
                email,
                full_name
            )
        `)
        .eq('company_id', company.id)
        .order('invited_at', { ascending: true });

    // Get pending invites
    const { data: pendingInvites } = await supabase
        .from('pending_team_invites')
        .select('id, email, role, created_at, expires_at')
        .eq('company_id', company.id)
        .order('created_at', { ascending: true });

    return (
        <div className={styles.container}>
            <Breadcrumbs items={[
                { label: 'Home', href: '/' },
                { label: 'Dashboard', href: '/dashboard' },
                { label: 'Team' }
            ]} />

            <div className={styles.header}>
                <h1 className={styles.title}>Team Management</h1>
            </div>

            {canManage && (
                <InviteForm companyId={company.id} />
            )}

            <table className={styles.teamTable}>
                <thead>
                    <tr>
                        <th>Name</th>
                        <th>Email</th>
                        <th>Role</th>
                        <th>Status</th>
                        {canManage && <th>Actions</th>}
                    </tr>
                </thead>
                <tbody>
                    {/* Active members */}
                    {members && members.length > 0 && (
                        members.map((member) => {
                            const memberUser = Array.isArray(member.user) ? member.user[0] : member.user;
                            const isOwner = memberUser?.id === company.owner_id;

                            return (
                                <TeamMemberRow
                                    key={member.id}
                                    member={{
                                        id: member.id,
                                        role: member.role,
                                        accepted_at: member.accepted_at,
                                        user: memberUser
                                    }}
                                    companyId={company.id}
                                    isOwner={isOwner}
                                    canManage={canManage}
                                />
                            );
                        })
                    )}

                    {/* Pending invites */}
                    {canManage && pendingInvites && pendingInvites.length > 0 && (
                        pendingInvites.map((invite) => (
                            <PendingInviteRow
                                key={invite.id}
                                invite={invite}
                                companyId={company.id}
                            />
                        ))
                    )}

                    {/* Empty state */}
                    {(!members || members.length === 0) && (!pendingInvites || pendingInvites.length === 0) && (
                        <tr>
                            <td colSpan={canManage ? 5 : 4} className={styles.emptyState}>
                                No team members yet. Invite your first team member above.
                            </td>
                        </tr>
                    )}
                </tbody>
            </table>
        </div>
    );
}
