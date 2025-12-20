'use client'

import { useState } from 'react';
import { toggleSavedJob } from '@/app/actions/savedJobs';
import { useToast } from '@/components/ui/Toast';

interface Props {
    jobId: string;
    initialSaved: boolean;
    withText?: boolean;
    className?: string;
}

export function BookmarkButton({ jobId, initialSaved, withText = false, className = '' }: Props) {
    const [saved, setSaved] = useState(initialSaved);
    const [loading, setLoading] = useState(false);
    const { showToast } = useToast();

    const handleClick = async (e: React.MouseEvent) => {
        e.preventDefault(); // Prevent navigating if inside a link
        e.stopPropagation();

        setLoading(true);
        // Optimistic update
        const newState = !saved;
        setSaved(newState);

        try {
            const result = await toggleSavedJob(jobId);
            if (result.saved !== newState) {
                // Revert if server response differs (unlikely)
                setSaved(result.saved);
            }
            showToast(result.message, 'success');
        } catch {
            setSaved(!newState); // Revert
            showToast('Failed to update saved status. Please try again.', 'error');
        } finally {
            setLoading(false);
        }
    };

    // Style for the "Button" version (with text)
    const buttonStyle: React.CSSProperties = withText ? {
        display: 'flex',
        alignItems: 'center',
        gap: '8px',
        padding: '8px 16px',
        borderRadius: '4px',
        border: `1px solid ${saved ? '#005f4b' : '#ccc'}`, // Green border if saved, gray if not
        background: saved ? '#e6f0ee' : 'white', // Light green bg if saved
        color: saved ? '#005f4b' : '#666',
        fontSize: '13px',
        fontWeight: 'bold',
        cursor: 'pointer',
        transition: 'all 0.2s',
        whiteSpace: 'nowrap'
    } : {
        // Icon only style
        background: 'none',
        border: 'none',
        cursor: 'pointer',
        padding: '4px',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        color: saved ? '#005f4b' : '#999',
        transition: 'transform 0.1s'
    };

    return (
        <button
            onClick={handleClick}
            disabled={loading}
            className={className}
            title={saved ? "Unsave Job" : "Save Job"}
            style={buttonStyle}
        >
            {saved ? (
                // Filled Bookmark Icon
                <svg xmlns="http://www.w3.org/2000/svg" width={withText ? 16 : 20} height={withText ? 16 : 20} viewBox="0 0 24 24" fill="currentColor" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                    <path d="M19 21l-7-5-7 5V5a2 2 0 0 1 2-2h10a2 2 0 0 1 2 2z"></path>
                </svg>
            ) : (
                // Outline Bookmark Icon
                <svg xmlns="http://www.w3.org/2000/svg" width={withText ? 16 : 20} height={withText ? 16 : 20} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                    <path d="M19 21l-7-5-7 5V5a2 2 0 0 1 2-2h10a2 2 0 0 1 2 2z"></path>
                </svg>
            )}
            {withText && (
                <span>{saved ? 'Saved' : 'Save Job'}</span>
            )}
        </button>
    );
}
