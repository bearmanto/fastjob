'use client'

import { useState, useRef } from 'react';
import { applyForJob } from './actions';
import styles from './Job.module.css';
import { createClient } from '@/utils/supabase/client';

interface Props {
    jobId: string;
    hasApplied: boolean;
    isSeeker: boolean;
    resumeUrl?: string | null;
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
                border: '1px solid #005f4b', // Hunter Green
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

export function ApplyButton({ jobId, hasApplied, isSeeker, resumeUrl }: Props) {
    const [loading, setLoading] = useState(false);
    const [message, setMessage] = useState<string | null>(hasApplied ? 'Applied' : null);
    const [uploading, setUploading] = useState(false);

    // Modal State
    const [activeModal, setActiveModal] = useState<'upload_required' | 'upload_success' | 'confirm_apply' | 'confirm_delete' | 'error' | null>(null);
    const [errorMessage, setErrorMessage] = useState<string>('');

    const fileInputRef = useRef<HTMLInputElement>(null);

    if (!isSeeker) return null;

    if (message === 'Applied') {
        return (
            <button className={styles.applyButton} disabled style={{ background: '#ccc', cursor: 'not-allowed' }}>
                APPLIED ✅
            </button>
        );
    }

    const handleApply = () => {
        // 1. Check Resume
        if (!resumeUrl) {
            setActiveModal('upload_required');
            return;
        }
        setActiveModal('confirm_apply');
    };

    const executeApply = async () => {
        setLoading(true);
        setActiveModal(null);
        try {
            const result = await applyForJob(jobId);
            if (result.success) {
                setMessage('Applied');
            } else {
                setErrorMessage(result.message || 'Application failed.');
                setActiveModal('error');
            }
        } catch (e) {
            setErrorMessage('Something went wrong.');
            setActiveModal('error');
        } finally {
            setLoading(false);
        }
    };

    const handleFileUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
        const file = e.target.files?.[0];
        if (!file) return;

        setUploading(true);
        try {
            const supabase = createClient();
            const { data: { user } } = await supabase.auth.getUser();
            if (!user) throw new Error('No user');

            const fileExt = file.name.split('.').pop();
            const fileName = `${user.id}/${Date.now()}.${fileExt}`;

            const { error: uploadError } = await supabase.storage.from('resumes').upload(fileName, file);
            if (uploadError) throw uploadError;

            const { data: { publicUrl } } = supabase.storage.from('resumes').getPublicUrl(fileName);

            const { error: updateError } = await supabase.from('profiles').update({ resume_url: publicUrl }).eq('id', user.id);
            if (updateError) throw updateError;

            // Show Success Modal instead of Alert
            setActiveModal('upload_success');

        } catch (error: any) {
            setErrorMessage('Upload failed: ' + error.message);
            setActiveModal('error');
        } finally {
            setUploading(false);
        }
    };

    const handleDeleteCV = async () => {
        setActiveModal('confirm_delete');
    };

    const executeDeleteCV = async () => {
        setActiveModal(null);
        setUploading(true);
        try {
            const supabase = createClient();
            const { data: { user } } = await supabase.auth.getUser();
            if (user) {
                await supabase.from('profiles').update({ resume_url: null }).eq('id', user.id);
                window.location.reload();
            }
        } catch (e) {
            setErrorMessage('Failed to delete CV');
            setActiveModal('error');
        } finally {
            setUploading(false);
        }
    };

    return (
        <div>
            {/* Confirm Apply Modal */}
            {activeModal === 'confirm_apply' && (
                <Modal
                    title="Confirm Application"
                    actions={
                        <>
                            <button
                                onClick={() => setActiveModal(null)}
                                style={{
                                    border: 'none', background: 'none', color: '#666',
                                    cursor: 'pointer', textDecoration: 'underline', fontSize: '13px'
                                }}
                            >
                                Cancel
                            </button>
                            <button
                                onClick={executeApply}
                                style={{
                                    background: '#005f4b', color: 'white', border: 'none',
                                    padding: '8px 16px', fontWeight: 'bold', fontSize: '13px', cursor: 'pointer', borderRadius: '2px'
                                }}
                            >
                                Confirm Apply
                            </button>
                        </>
                    }
                >
                    You are about to Easy Apply with your FastJob Profile.
                    <br /><br />
                    <span style={{ fontSize: '12px', color: '#666' }}>Your resume and profile details will be sent to the employer.</span>
                </Modal>
            )}

            {/* Upload Required Modal */}
            {activeModal === 'upload_required' && (
                <Modal
                    title="Resume Required"
                    actions={
                        <>
                            <button
                                onClick={() => setActiveModal(null)}
                                style={{
                                    border: 'none', background: 'none', color: '#cc0000',
                                    cursor: 'pointer', textDecoration: 'underline', fontSize: '13px'
                                }}
                            >
                                Cancel
                            </button>
                            <button
                                onClick={() => { setActiveModal(null); fileInputRef.current?.click(); }}
                                style={{
                                    background: '#005f4b', color: 'white', border: 'none',
                                    padding: '8px 16px', fontWeight: 'bold', fontSize: '13px', cursor: 'pointer', borderRadius: '2px'
                                }}
                            >
                                Upload Now
                            </button>
                        </>
                    }
                >
                    You must upload a CV / Resume to use <strong>Easy Apply</strong>.
                </Modal>
            )}

            {/* Upload Success Modal */}
            {activeModal === 'upload_success' && (
                <Modal
                    title="Upload Complete"
                    actions={
                        <button
                            onClick={() => window.location.reload()}
                            style={{
                                background: '#005f4b', color: 'white', border: 'none',
                                padding: '8px 16px', fontWeight: 'bold', fontSize: '13px', cursor: 'pointer', borderRadius: '2px'
                            }}
                        >
                            OK
                        </button>
                    }
                >
                    CV Uploaded Successfully! You can now use Easy Apply.
                </Modal>
            )}

            {/* Confirm Delete Modal */}
            {activeModal === 'confirm_delete' && (
                <Modal
                    title="Delete CV?"
                    actions={
                        <>
                            <button
                                onClick={() => setActiveModal(null)}
                                style={{
                                    border: 'none', background: 'none', color: '#666',
                                    cursor: 'pointer', textDecoration: 'underline', fontSize: '13px'
                                }}
                            >
                                Cancel
                            </button>
                            <button
                                onClick={executeDeleteCV}
                                style={{
                                    background: '#d32f2f', color: 'white', border: 'none',
                                    padding: '8px 16px', fontWeight: 'bold', fontSize: '13px', cursor: 'pointer', borderRadius: '2px'
                                }}
                            >
                                Delete
                            </button>
                        </>
                    }
                >
                    Are you sure you want to delete your saved CV?
                </Modal>
            )}

            {/* Error Modal */}
            {activeModal === 'error' && (
                <Modal
                    title="Error"
                    actions={
                        <button
                            onClick={() => setActiveModal(null)}
                            style={{
                                background: '#005f4b', color: 'white', border: 'none',
                                padding: '8px 16px', fontWeight: 'bold', fontSize: '13px', cursor: 'pointer', borderRadius: '2px'
                            }}
                        >
                            OK
                        </button>
                    }
                >
                    {errorMessage}
                </Modal>
            )}

            <input
                type="file"
                ref={fileInputRef}
                style={{ display: 'none' }}
                accept=".pdf,.doc,.docx"
                onChange={handleFileUpload}
            />
            <button
                onClick={handleApply}
                disabled={loading || uploading}
                className={styles.applyButton}
            >
                {uploading ? 'PROCESSING...' : loading ? 'SENDING...' : 'EASY APPLY'}
            </button>

            {resumeUrl && (
                <div style={{ marginTop: '8px', fontSize: '11px', textAlign: 'center', color: '#666' }}>
                    <div style={{ marginBottom: '4px' }}>CV On File ✅</div>
                    <button
                        onClick={() => fileInputRef.current?.click()}
                        disabled={uploading}
                        style={{ border: 'none', background: 'none', textDecoration: 'underline', cursor: 'pointer', marginRight: '12px', color: '#555' }}
                    >
                        Replace
                    </button>
                    <button
                        onClick={handleDeleteCV}
                        disabled={uploading}
                        style={{ border: 'none', background: 'none', textDecoration: 'underline', cursor: 'pointer', color: '#d32f2f' }}
                    >
                        Delete
                    </button>
                </div>
            )}
        </div>
    );
}
