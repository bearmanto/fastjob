'use client';

import { useEffect } from 'react';

interface ViewTrackerProps {
    jobId: string;
    source?: string;
}

export function ViewTracker({ jobId, source = 'direct' }: ViewTrackerProps) {
    useEffect(() => {
        // Track view on mount
        fetch('/api/track-view', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ jobId, source })
        }).catch(err => {
            console.error('Track view failed:', err);
        });
    }, [jobId, source]);

    // This component doesn't render anything
    return null;
}
