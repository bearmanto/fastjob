'use client';

import { useState } from 'react';
import styles from '@/app/job/[id]/Job.module.css';

export function ShareButton({ jobTitle }: { jobTitle: string }) {
    const [copied, setCopied] = useState(false);

    const handleShare = async () => {
        const url = window.location.href;

        // Try native share first (mobile)
        if (navigator.share) {
            try {
                await navigator.share({
                    title: jobTitle,
                    text: `Check out this job: ${jobTitle}`,
                    url: url,
                });
                return;
            } catch (err) {
                // User cancelled or share failed, fall through to clipboard
            }
        }

        // Fallback to clipboard
        try {
            await navigator.clipboard.writeText(url);
            setCopied(true);
            setTimeout(() => setCopied(false), 2000);
        } catch (err) {
            console.error('Failed to copy:', err);
        }
    };

    return (
        <button onClick={handleShare} className={styles.shareButton}>
            {copied ? '✓ Copied!' : '🔗 Share'}
        </button>
    );
}
