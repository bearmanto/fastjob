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
        } catch (error: any) {
            setErrorMessage('Upload failed: ' + error.message);
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
        } catch (e) {
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
                            style={{
                                background: '#005f4b', color: 'white', border: 'none',
                                padding: '8px 16px', fontWeight: 'bold', fontSize: '13px', cursor: 'pointer', borderRadius: '2px'
                            }}
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

            <div className={styles.sectionHeader}>
                Resume / CV
            </div>

            <input
                type="file"
                ref={fileInputRef}
                style={{ display: 'none' }}
                accept=".pdf,.doc,.docx"
                onChange={handleFileUpload}
            />

            {resumeUrl ? (
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                    <div>
                        <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                            <span style={{ fontSize: '13px', color: '#333', fontWeight: 'bold' }}>
                                Resume on File
                            </span>
                        </div>
                        <div style={{ fontSize: '11px', color: '#005f4b', marginTop: '4px' }}>
                            ✅ Ready for Easy Apply
                        </div>
                    </div>

                    <div style={{ display: 'flex', gap: '16px', alignItems: 'center' }}>
                        {resumeDownloadUrl && (
                            <a
                                href={resumeDownloadUrl}
                                target="_blank"
                                rel="noopener noreferrer"
                                style={{
                                    textDecoration: 'underline',
                                    cursor: 'pointer',
                                    color: '#005f4b',
                                    fontSize: '12px',
                                    fontWeight: 'bold'
                                }}
                            >
                                View
                            </a>
                        )}

                        <button
                            onClick={() => fileInputRef.current?.click()}
                            disabled={uploading}
                            style={{
                                background: 'none',
                                border: 'none',
                                textDecoration: 'underline',
                                cursor: 'pointer',
                                color: '#666',
                                fontSize: '12px'
                            }}
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
                <div style={{ textAlign: 'center', padding: '12px 0' }}>
                    <p style={{ fontSize: '13px', color: '#666', marginBottom: '12px' }}>
                        Upload your CV to enable "Easy Apply" on job listings.
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
