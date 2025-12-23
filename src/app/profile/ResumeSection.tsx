'use client'

import { useState, useRef } from 'react';
import { createClient } from '@/utils/supabase/client';
import styles from './Profile.module.css';
import { saveResume, deleteResume } from './actions';

interface Props {
    resumeUrl?: string | null;
    resumeDownloadUrl?: string | null;
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

export function ResumeSection({ resumeUrl, resumeDownloadUrl }: Props) {
    const [uploading, setUploading] = useState(false);
    const [activeModal, setActiveModal] = useState<'upload_success' | 'confirm_delete' | 'error' | null>(null);
    const [errorMessage, setErrorMessage] = useState<string>('');
    const fileInputRef = useRef<HTMLInputElement>(null);

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

            // 1. Upload to Storage (Client side is fine, or separate action if strict)
            const { error: uploadError } = await supabase.storage.from('resumes').upload(fileName, file);
            if (uploadError) throw uploadError;

            // 2. Save URL via Server Action (Handles DB + Revalidation)
            await saveResume(fileName);

            setActiveModal('upload_success');
        } catch (error) {
            const message = error instanceof Error ? error.message : 'Unknown error';
            setErrorMessage('Upload failed: ' + message);
            setActiveModal('error');
        } finally {
            setUploading(false);
        }
    };

    const handleDeleteCV = () => {
        setActiveModal('confirm_delete');
    };

    const executeDeleteCV = async () => {
        setActiveModal(null);
        setUploading(true);
        try {
            await deleteResume();
            window.location.reload();
        } catch {
            setErrorMessage('Failed to delete CV');
            setActiveModal('error');
        } finally {
            setUploading(false);
        }
    };

    return (
        <div className={styles.section}>
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
                    CV Uploaded Successfully!
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
                    Are you sure you want to delete your CV?
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

            <div className={styles.sectionHeader}>
                Resume / CV
            </div>

            <input
                type="file"
                ref={fileInputRef}
                className={styles.hiddenInput}
                accept=".pdf,.doc,.docx"
                onChange={handleFileUpload}
            />

            {resumeUrl ? (
                <div className={styles.resumeRow}>
                    <div>
                        <div className={styles.resumeInfoText}>
                            <span className={styles.resumeFileName}>
                                Resume on File
                            </span>
                        </div>
                        <div className={styles.resumeStatus}>
                            ✅ Ready for Easy Apply
                        </div>
                    </div>

                    <div className={styles.resumeActions}>
                        {resumeDownloadUrl && (
                            <a
                                href={resumeDownloadUrl}
                                target="_blank"
                                rel="noopener noreferrer"
                                className={styles.viewLink}
                            >
                                View
                            </a>
                        )}

                        <button
                            onClick={() => fileInputRef.current?.click()}
                            disabled={uploading}
                            className={styles.replaceButton}
                        >
                            Replace
                        </button>

                        <button
                            onClick={handleDeleteCV}
                            disabled={uploading}
                            className={styles.deleteButton}
                        >
                            Delete
                        </button>
                    </div>
                </div>
            ) : (
                <div className={styles.resumeEmptyState}>
                    <p className={styles.resumeEmptyText}>
                        Upload your CV to enable &quot;Easy Apply&quot; on job listings.
                    </p>
                    <button
                        onClick={() => fileInputRef.current?.click()}
                        disabled={uploading}
                        className={styles.saveButton}
                        style={{ marginTop: 0 }}
                    >
                        {uploading ? 'UPLOADING...' : 'UPLOAD RESUME'}
                    </button>
                </div>
            )}
        </div>
    );
}
