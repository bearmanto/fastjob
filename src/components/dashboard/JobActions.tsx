'use client'

import { useState } from 'react';
import Link from 'next/link';
import { closeJob } from '@/app/dashboard/actions';

interface Props {
    jobId: string;
    jobStatus: string;
}

function Modal({ title, children, actions }: { title: string, children: React.ReactNode, actions: React.ReactNode }) {
    return (
        <div style={{
            position: 'fixed', top: 0, left: 0, right: 0, bottom: 0,
            backgroundColor: 'rgba(0,0,0,0.5)', zIndex: 9999,
            display: 'flex', alignItems: 'center', justifyContent: 'center'
        }}>
            <div style={{
                backgroundColor: 'white', padding: '24px', width: '320px',
                border: '1px solid #005f4b',
                boxShadow: '0 4px 6px rgba(0,0,0,0.1)'
            }}>
                <div style={{
                    fontWeight: 'bold', fontSize: '16px', color: '#005f4b',
                    marginBottom: '12px', borderBottom: '1px solid #eee', paddingBottom: '8px'
                }}>
                    {title}
                </div>
                <div style={{ fontSize: '13px', marginBottom: '24px', lineHeight: '1.5', color: '#333' }}>
                    {children}
                </div>
                <div style={{ display: 'flex', justifyContent: 'flex-end', gap: '16px', alignItems: 'center' }}>
                    {actions}
                </div>
            </div>
        </div>
    )
}

export function JobActions({ jobId, jobStatus }: Props) {
    const [showConfirm, setShowConfirm] = useState(false);
    const [loading, setLoading] = useState(false);

    const handleClose = async () => {
        setLoading(true);
        try {
            const result = await closeJob(jobId);
            if (!result.success) {
                alert(result.message || 'Failed to close job.');
            } else {
                setShowConfirm(false);
            }
        } catch (e) {
            alert('An unexpected error occurred.');
        } finally {
            setLoading(false);
        }
    };

    const isClosed = jobStatus === 'closed';

    return (
        <>
            {showConfirm && (
                <Modal
                    title="Close Job Posting?"
                    actions={
                        <>
                            <button
                                onClick={() => setShowConfirm(false)}
                                disabled={loading}
                                style={{
                                    border: 'none', background: 'none', color: '#666',
                                    cursor: 'pointer', textDecoration: 'underline', fontSize: '13px'
                                }}
                            >
                                Cancel
                            </button>
                            <button
                                onClick={handleClose}
                                disabled={loading}
                                style={{
                                    background: '#c62828', color: 'white', border: 'none',
                                    padding: '8px 16px', fontWeight: 'bold', fontSize: '13px', cursor: 'pointer', borderRadius: '2px'
                                }}
                            >
                                {loading ? 'Closing...' : 'Close Job'}
                            </button>
                        </>
                    }
                >
                    This action cannot be undone. The job will be removed from public listings and you will not be able to reopen it.
                </Modal>
            )}

            <div style={{ display: 'flex', gap: '8px' }}>
                <Link
                    href={`/job/${jobId}`}
                    style={{
                        fontSize: '11px',
                        background: '#fff',
                        padding: '4px 8px',
                        borderRadius: '3px',
                        textDecoration: 'none',
                        color: '#333',
                        border: '1px solid #ccc',
                        display: 'inline-block'
                    }}
                >
                    View
                </Link>

                {!isClosed && (
                    <button
                        onClick={() => setShowConfirm(true)}
                        style={{
                            fontSize: '11px',
                            background: '#fff',
                            padding: '4px 8px',
                            borderRadius: '3px',
                            cursor: 'pointer',
                            color: '#c62828',
                            border: '1px solid #c62828'
                        }}
                    >
                        Close
                    </button>
                )}
            </div>
        </>
    );
}
