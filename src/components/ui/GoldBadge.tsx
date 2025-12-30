'use client';

import styles from './GoldBadge.module.css';

interface Props {
    size?: 'small' | 'medium';
    showLabel?: boolean;
}

/**
 * Gold Recruiter Badge - Shown for Pro/Enterprise subscribers
 * Similar to LinkedIn Premium badge
 */
export function GoldBadge({ size = 'small', showLabel = false }: Props) {
    return (
        <span className={`${styles.badge} ${styles[size]}`} title="Pro Recruiter">
            <span className={styles.icon}>🏅</span>
            {showLabel && <span className={styles.label}>PRO</span>}
        </span>
    );
}
