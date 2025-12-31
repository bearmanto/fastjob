'use client';

import { useState } from 'react';
import { PendingCertification, verifyCertification } from '@/lib/healthcare/admin-actions';
import { VerificationStatus } from '@/types/healthcare';
import styles from './AdminHealthcare.module.css';

export function CertificationVerificationRow({ cert }: { cert: PendingCertification }) {
    const [status, setStatus] = useState<VerificationStatus>(cert.status);
    const [loading, setLoading] = useState(false);

    const handleVerify = async () => {
        if (!confirm('Are you sure you want to verify this credential?')) return;
        setLoading(true);
        try {
            await verifyCertification(cert.id, 'verified');
            setStatus('verified');
        } catch (err) {
            alert('Failed to verify');
        } finally {
            setLoading(false);
        }
    };

    const handleReject = async () => {
        if (!confirm('Are you sure you want to REJECT this credential?')) return;
        setLoading(true);
        try {
            await verifyCertification(cert.id, 'rejected');
            setStatus('rejected');
        } catch (err) {
            alert('Failed to reject');
        } finally {
            setLoading(false);
        }
    };

    if (status !== 'pending') {
        return null; // Remove from list if processed
    }

    return (
        <tr className={styles.row}>
            <td>
                <div className={styles.applicantName}>{cert.profile?.full_name || 'Unknown'}</div>
                <div className={styles.applicantEmail}>{cert.profile?.email}</div>
            </td>
            <td>
                <div className={styles.certName}>{cert.certification?.name}</div>
                <div className={styles.certMeta}>
                    {cert.certification?.category} • {cert.country_code}
                </div>
            </td>
            <td>
                <div className={styles.licenseNumber}>{cert.license_number}</div>
                {cert.issue_date && <div className={styles.dates}>Issued: {cert.issue_date}</div>}
                {cert.expiry_date && <div className={styles.dates}>Expires: {cert.expiry_date}</div>}
            </td>
            <td>
                {cert.document_url ? (
                    <a href={cert.document_url} target="_blank" rel="noopener noreferrer" className={styles.docLink}>
                        View Doc
                    </a>
                ) : (
                    <span className={styles.noDoc}>No Doc</span>
                )}
            </td>
            <td className={styles.actions}>
                <button
                    onClick={handleVerify}
                    disabled={loading}
                    className={`${styles.btn} ${styles.btnVerify}`}
                >
                    Verify
                </button>
                <button
                    onClick={handleReject}
                    disabled={loading}
                    className={`${styles.btn} ${styles.btnReject}`}
                >
                    Reject
                </button>
            </td>
        </tr>
    );
}
