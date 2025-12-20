'use client';

import { useEffect } from 'react';
import { markViewed } from './actions';

interface ViewTrackerProps {
    applicationId: string;
    status: string;
}

export function ViewTracker({ applicationId, status }: ViewTrackerProps) {
    useEffect(() => {
        if (status === 'applied') {
            markViewed(applicationId).catch(console.error);
        }
    }, [applicationId, status]);

    return null;
}
