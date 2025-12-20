'use client'

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { submitVerification } from '@/app/dashboard/actions';
import { createClient } from '@/utils/supabase/client';
import styles from '@/app/profile/Profile.module.css';

interface Props {
    companyId: string;
}

export function VerificationForm({ companyId: _companyId }: Props) {
    const router = useRouter();
    const [loading, setLoading] = useState(false);
    const [message, setMessage] = useState<string | null>(null);
    const [docType, setDocType] = useState('nib');

    // File states
    const [npwpFile, setNpwpFile] = useState<File | null>(null);
    const [businessFile, setBusinessFile] = useState<File | null>(null);

    async function handleSubmit(e: React.FormEvent<HTMLFormElement>) {
        e.preventDefault();
        const form = e.currentTarget; // Capture form element immediately
        setLoading(true);
        setMessage(null);

        if (!npwpFile || !businessFile) {
            setMessage("Please upload both documents.");
            setLoading(false);
            return;
        }

        try {
            const supabase = createClient();
            const { data: { user } } = await supabase.auth.getUser();
            if (!user) throw new Error("Not authenticated");

            // 1. Upload NPWP
            const npwpPath = `${user.id}/npwp_${Date.now()}_${npwpFile.name}`;
            const { error: npwpError } = await supabase.storage
                .from('company_documents')
                .upload(npwpPath, npwpFile);

            if (npwpError) throw npwpError;

            // 2. Upload Business Doc
            const businessPath = `${user.id}/${docType}_${Date.now()}_${businessFile.name}`;
            const { error: docError } = await supabase.storage
                .from('company_documents')
                .upload(businessPath, businessFile);

            if (docError) throw docError;

            // 3. Submit Form Data
            const formData = new FormData(form);
            formData.set('npwp_url', npwpPath);
            formData.set('business_doc_url', businessPath);

            const result = await submitVerification(formData);
            setMessage(result.message);
            if (result.success) {
                // simple reload to show pending state
                router.refresh();
            }
        } catch (err: any) {
            console.error(err);
            setMessage(`Error: ${err.message}`);
        } finally {
            setLoading(false);
        }
    }

    return (
        <div className={styles.section}>
            <h2 className={styles.sectionTitle}>Company Verification</h2>
            <div className={styles.verificationIntro}>
                To prevent fraud, FastJob requires all companies to verify their identity before posting jobs.
            </div>

            {message && <div className={styles.verificationMessage}>{message}</div>}

            <form onSubmit={handleSubmit} className={styles.formGrid}>
                {/* NPWP Section */}
                <div className={styles.inputGroup}>
                    <label className={styles.label}>NPWP Number</label>
                    <input name="npwp_number" required className={styles.input} placeholder="e.g. 12.345.678.9-000.000" />
                </div>

                <div className={styles.inputGroup}>
                    <label className={styles.label}>Upload NPWP Document (PDF/Jpg)</label>
                    <input
                        type="file"
                        accept=".pdf,.jpg,.jpeg,.png"
                        required
                        onChange={(e) => setNpwpFile(e.target.files?.[0] || null)}
                        className={styles.fileInput}
                    />
                </div>

                <div className={styles.formDivider} />

                {/* Business Doc Section */}
                <div className={styles.inputGroup}>
                    <label className={styles.label}>Business Document Type</label>
                    <select
                        name="business_doc_type"
                        className={styles.input}
                        value={docType}
                        onChange={(e) => setDocType(e.target.value)}
                    >
                        <option value="nib">Nomor Induk Berusaha (NIB)</option>
                        <option value="siup">Surat Izin Usaha (SIUP)</option>
                        <option value="akta">Akta Pendirian</option>
                        <option value="sk_kemenhumkam">SK Kemenkumham</option>
                        <option value="skdp">Surat Keterangan Domisili</option>
                    </select>
                </div>

                <div className={styles.inputGroup}>
                    <label className={styles.label}>Upload Document</label>
                    <input
                        type="file"
                        accept=".pdf,.jpg,.jpeg,.png"
                        required
                        onChange={(e) => setBusinessFile(e.target.files?.[0] || null)}
                        className={styles.fileInput}
                    />
                </div>

                <div className={`${styles.fullWidth} ${styles.submitRow}`}>
                    <button type="submit" className={styles.saveButton} disabled={loading}>
                        {loading ? 'Uploading...' : 'Submit for Verification'}
                    </button>
                </div>
            </form>
        </div>
    );
}
