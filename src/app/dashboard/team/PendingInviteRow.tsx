'use client';

import { useActionState } from 'react';
import { revokePendingInvite } from './actions';
import styles from './Team.module.css';

interface PendingInviteRowProps {
    invite: {
        id: string;
        email: string;
        role: string;
        created_at: string;
        expires_at: string;
    };
    companyId: string;
}

export function PendingInviteRow({ invite, companyId }: PendingInviteRowProps) {
    const [state, revokeAction] = useActionState(revokePendingInvite, null);

    const isExpired = new Date(invite.expires_at) < new Date();

    const roleClass = {
        admin: styles.roleAdmin,
        recruiter: styles.roleRecruiter,
        viewer: styles.roleViewer
    }[invite.role] || styles.roleViewer;

    return (
        <tr className={isExpired ? styles.expiredRow : undefined}>
            <td>—</td>
            <td>{invite.email}</td>
            <td>
                <span className={`${styles.roleBadge} ${roleClass}`}>
                    {invite.role}
                </span>
            </td>
            <td>
                {isExpired ? (
                    <span className={styles.expiredBadge}>Expired</span>
                ) : (
                    <span className={styles.pendingBadge}>Pending</span>
                )}
            </td>
            <td className={styles.actions}>
                <form action={revokeAction}>
                    <input type="hidden" name="inviteId" value={invite.id} />
                    <input type="hidden" name="companyId" value={companyId} />
                    <button
                        type="submit"
                        className={`${styles.actionButton} ${styles.removeButton}`}
                        onClick={(e) => {
                            if (!confirm('Revoke this invitation?')) {
                                e.preventDefault();
                            }
                        }}
                    >
                        Revoke
                    </button>
                </form>
                {state && 'error' in state && (
                    <span className={styles.error} style={{ padding: 4 }}>
                        {state.error}
                    </span>
                )}
            </td>
        </tr>
    );
}
