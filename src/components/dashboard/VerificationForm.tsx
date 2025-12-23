'use client'

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { createClient } from '@/utils/supabase/client';
import { VERIFICATION_CATEGORIES } from '@/data/countries';
import styles from '@/app/profile/Profile.module.css';

interface Props {
    companyId: string;
}

interface DocumentUpload {
    category: string;
    subtype: string;
    file: File | null;
}

export function VerificationForm({ companyId }: Props) {
    const router = useRouter();
    const [loading, setLoading] = useState(false);
    const [message, setMessage] = useState<string | null>(null);

    // Document state for each category
    const [documents, setDocuments] = useState<DocumentUpload[]>([
        { category: 'business_identity', subtype: '', file: null },
        { category: 'representative_auth', subtype: '', file: null },
        { category: 'personal_id', subtype: '', file: null },
    ]);

    const updateDocument = (index: number, field: 'subtype' | 'file', value: string | File | null) => {
        setDocuments(prev => {
            const updated = [...prev];
            if (field === 'file') {
                updated[index] = { ...updated[index], file: value as File | null };
            } else {
                updated[index] = { ...updated[index], subtype: value as string };
            }
            return updated;
        });
    };

    async function handleSubmit(e: React.FormEvent<HTMLFormElement>) {
        e.preventDefault();
        setLoading(true);
        setMessage(null);

        // Validate all documents are selected
        const missingDocs = documents.filter(d => !d.file || !d.subtype);
        if (missingDocs.length > 0) {
            setMessage("Please upload a document for each category.");
            setLoading(false);
            return;
        }

        try {
            const supabase = createClient();
            const { data: { user } } = await supabase.auth.getUser();
            if (!user) throw new Error("Not authenticated");

            // Upload each document
            for (const doc of documents) {
                if (!doc.file) continue;

                const filePath = `${user.id}/${doc.category}_${Date.now()}_${doc.file.name}`;

                const { error: uploadError } = await supabase.storage
                    .from('company_documents')
                    .upload(filePath, doc.file);

                if (uploadError) throw uploadError;

                // Get public URL
                const { data: { publicUrl } } = supabase.storage
                    .from('company_documents')
                    .getPublicUrl(filePath);

                // Insert document record
                const { error: insertError } = await supabase
                    .from('verification_documents')
                    .insert({
                        company_id: companyId,
                        document_category: doc.category,
                        document_subtype: doc.subtype,
                        document_url: publicUrl
                    });

                if (insertError) throw insertError;
            }

            // Update company status to pending
            const { error: updateError } = await supabase
                .from('companies')
                .update({ verification_status: 'pending' })
                .eq('id', companyId);

            if (updateError) throw updateError;

            setMessage("Verification documents submitted! We will review them shortly.");
            router.refresh();

        } catch (err) {
            const errorMsg = err instanceof Error ? err.message : 'Unknown error';
            console.error(err);
            setMessage(`Error: ${errorMsg}`);
        } finally {
            setLoading(false);
        }
    }

    return (
        <div className={styles.section}>
            <h2 className={styles.sectionTitle}>Company Verification</h2>
            <div className={styles.verificationIntro}>
                To prevent fraud, FastJob requires all companies to verify their identity before posting jobs.
                Please upload one document from each category below.
            </div>

            {message && (
                <div className={styles.verificationMessage} style={{
                    background: message.startsWith('Error') ? '#ffe0e0' : '#e0ffe0',
                    padding: '12px',
                    marginBottom: '16px',
                    border: message.startsWith('Error') ? '1px solid #ff6b6b' : '1px solid #52796f'
                }}>
                    {message}
                </div>
            )}

            <form onSubmit={handleSubmit}>
                {Object.entries(VERIFICATION_CATEGORIES).map(([key, category], index) => (
                    <div key={key} className={styles.verificationCategory}>
                        <h3 className={styles.categoryTitle}>
                            {index + 1}. {category.label}
                        </h3>
                        <p className={styles.categoryDescription}>
                            {category.description}
                        </p>

                        <div className={styles.inputGroup}>
                            <label className={styles.label}>Document Type</label>
                            <select
                                className={styles.input}
                                value={documents[index].subtype}
                                onChange={(e) => updateDocument(index, 'subtype', e.target.value)}
                                required
                            >
                                <option value="">Select document type...</option>
                                {category.documentTypes.map(dt => (
                                    <option key={dt.value} value={dt.value}>
                                        {dt.label}
                                    </option>
                                ))}
                            </select>
                        </div>

                        <div className={styles.inputGroup}>
                            <label className={styles.label}>Upload Document (PDF/JPG/PNG)</label>
                            <input
                                type="file"
                                accept=".pdf,.jpg,.jpeg,.png"
                                required
                                onChange={(e) => updateDocument(index, 'file', e.target.files?.[0] || null)}
                                className={styles.fileInput}
                            />
                        </div>

                        {index < 2 && <div className={styles.formDivider} />}
                    </div>
                ))}

                <div className={`${styles.fullWidth} ${styles.submitRow}`} style={{ marginTop: '20px' }}>
                    <button type="submit" className={styles.saveButton} disabled={loading}>
                        {loading ? 'Uploading...' : 'Submit for Verification'}
                    </button>
                </div>
            </form>
        </div>
    );
}
