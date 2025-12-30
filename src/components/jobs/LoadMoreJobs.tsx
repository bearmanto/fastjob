'use client';

import { useState } from 'react';
import { JobListing, JobStreamItem } from './JobStreamItem';
import { fetchMoreJobs } from './actions';
import styles from '@/app/page.module.css';

export function LoadMoreJobs({ initialOffset }: { initialOffset: number }) {
    const [jobs, setJobs] = useState<JobListing[]>([]);
    const [offset, setOffset] = useState(initialOffset);
    const [isLoading, setIsLoading] = useState(false);
    const [hasMore, setHasMore] = useState(true);

    const loadMore = async () => {
        setIsLoading(true);
        try {
            const newJobs = await fetchMoreJobs(offset);
            if (newJobs.length === 0) {
                setHasMore(false);
            } else {
                setJobs(prev => [...prev, ...newJobs]);
                setOffset(prev => prev + 20);
            }
        } catch (error) {
            console.error('Failed to load jobs', error);
        } finally {
            setIsLoading(false);
        }
    };

    return (
        <>
            {jobs.map(job => (
                <JobStreamItem key={job.id} job={job} />
            ))}

            {hasMore && (
                <div style={{ textAlign: 'center', marginTop: '20px' }}>
                    <button
                        onClick={loadMore}
                        className={styles.applyButton}
                        style={{ width: 'auto', padding: '10px 32px', display: 'inline-block' }}
                        disabled={isLoading}
                    >
                        {isLoading ? 'Loading...' : 'Load More Jobs'}
                    </button>
                </div>
            )}
        </>
    );
}
