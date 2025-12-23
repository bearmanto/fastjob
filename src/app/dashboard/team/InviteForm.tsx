'use client';

import { useActionState } from 'react';
import { inviteTeamMember } from './actions';
import styles from './Team.module.css';

interface InviteFormProps {
    companyId: string;
}

export function InviteForm({ companyId }: InviteFormProps) {
    const [state, formAction] = useActionState(inviteTeamMember, null);

    return (
        <div>
            {state && 'error' in state && (
                <div className={styles.error}>{state.error}</div>
            )}
            {state && 'success' in state && (
                <div className={styles.success}>Team member invited successfully!</div>
            )}

            <form action={formAction} className={styles.inviteForm}>
                <input type="hidden" name="companyId" value={companyId} />

                <input
                    type="email"
                    name="email"
                    placeholder="team@example.com"
                    className={styles.emailInput}
                    required
                />

                <select name="role" className={styles.roleSelect} defaultValue="recruiter">
                    <option value="admin">Admin</option>
                    <option value="recruiter">Recruiter</option>
                    <option value="viewer">Viewer</option>
                </select>

                <button type="submit" className={styles.inviteButton}>
                    Invite
                </button>
            </form>
        </div>
    );
}
