'use client';

import { useActionState } from 'react';
import { removeTeamMember, updateMemberRole } from './actions';
import styles from './Team.module.css';

interface TeamMemberRowProps {
    member: {
        id: string;
        role: string;
        accepted_at: string | null;
        user: {
            id: string;
            email: string;
            full_name: string | null;
        } | null;
    };
    companyId: string;
    isOwner: boolean;
    canManage: boolean;
}

export function TeamMemberRow({ member, companyId, isOwner, canManage }: TeamMemberRowProps) {
    const [removeState, removeAction] = useActionState(removeTeamMember, null);
    const [updateState, updateAction] = useActionState(updateMemberRole, null);

    const roleClass = {
        admin: styles.roleAdmin,
        recruiter: styles.roleRecruiter,
        viewer: styles.roleViewer
    }[member.role] || styles.roleViewer;

    return (
        <tr>
            <td>
                {member.user?.full_name || 'Unknown'}
                {isOwner && <span className={styles.ownerBadge}> (Owner)</span>}
            </td>
            <td>{member.user?.email || '-'}</td>
            <td>
                {canManage && !isOwner ? (
                    <form action={updateAction} style={{ display: 'inline' }}>
                        <input type="hidden" name="memberId" value={member.id} />
                        <input type="hidden" name="companyId" value={companyId} />
                        <select
                            name="role"
                            defaultValue={member.role}
                            className={styles.roleSelect}
                            onChange={(e) => e.target.form?.requestSubmit()}
                        >
                            <option value="admin">Admin</option>
                            <option value="recruiter">Recruiter</option>
                            <option value="viewer">Viewer</option>
                        </select>
                    </form>
                ) : (
                    <span className={`${styles.roleBadge} ${roleClass}`}>
                        {member.role}
                    </span>
                )}
                {updateState && 'error' in updateState && (
                    <span className={styles.error} style={{ marginLeft: 8, padding: 4 }}>
                        {updateState.error}
                    </span>
                )}
            </td>
            <td>
                <span className={styles.activeBadge}>Active</span>
            </td>
            {canManage && (
                <td className={styles.actions}>
                    {!isOwner && (
                        <form action={removeAction}>
                            <input type="hidden" name="memberId" value={member.id} />
                            <input type="hidden" name="companyId" value={companyId} />
                            <button
                                type="submit"
                                className={`${styles.actionButton} ${styles.removeButton}`}
                                onClick={(e) => {
                                    if (!confirm('Remove this team member?')) {
                                        e.preventDefault();
                                    }
                                }}
                            >
                                Remove
                            </button>
                        </form>
                    )}
                    {removeState && 'error' in removeState && (
                        <span className={styles.error} style={{ padding: 4 }}>
                            {removeState.error}
                        </span>
                    )}
                </td>
            )}
        </tr>
    );
}
