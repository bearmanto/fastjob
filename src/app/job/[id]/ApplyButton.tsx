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
        <div className={styles.modalOverlay}>
            <div className={styles.modalContent}>
                <div className={styles.modalTitle}>
                    {title}
                </div>
                <div className={styles.modalBody}>
                    {children}
                </div>
                <div className={styles.modalActions}>
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
            <button className={`${styles.applyButton} ${styles.appliedButton}`} disabled>
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
        } catch {
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

        } catch (error: unknown) {
            const errorMsg = error instanceof Error ? error.message : 'Unknown error';
            setErrorMessage('Upload failed: ' + errorMsg);
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
        } catch {
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
                                className={styles.cancelButton}
                            >
                                Cancel
                            </button>
                            <button
                                onClick={executeApply}
                                className={styles.primaryButton}
                            >
                                Confirm Apply
                            </button>
                        </>
                    }
                >
                    You are about to Easy Apply with your FastJob Profile.
                    <br /><br />
                    <span className={styles.modalNote}>Your resume and profile details will be sent to the employer.</span>
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
                                className={styles.cancelButtonDanger}
                            >
                                Cancel
                            </button>
                            <button
                                onClick={() => { setActiveModal(null); fileInputRef.current?.click(); }}
                                className={styles.primaryButton}
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
                            className={styles.primaryButton}
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
                                className={styles.cancelButton}
                            >
                                Cancel
                            </button>
                            <button
                                onClick={executeDeleteCV}
                                className={styles.dangerButton}
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
                            className={styles.primaryButton}
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
                className={styles.hiddenInput}
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
                <div className={styles.cvInfoContainer}>
                    <div className={styles.cvStatus}>CV On File ✅</div>
                    <button
                        onClick={() => fileInputRef.current?.click()}
                        disabled={uploading}
                        className={styles.cvLinkButton}
                    >
                        Replace
                    </button>
                    <button
                        onClick={handleDeleteCV}
                        disabled={uploading}
                        className={styles.cvDeleteButton}
                    >
                        Delete
                    </button>
                </div>
            )}
        </div>
    );
}
