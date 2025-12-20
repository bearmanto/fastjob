'use client'

import { useState } from 'react';
import { verifyCompany } from './actions';
import { createClient } from '@/utils/supabase/client';
import tableStyles from '@/components/ui/Table.module.css';
import styles from './Admin.module.css';
import { useToast } from '@/components/ui/Toast';

interface Company {
    id: string;
    name: string;
    location: string;
    website: string;
    industry: string;
    npwp_number: string;
    npwp_url: string;
    business_doc_type: string;
    business_doc_url: string;
}

export function VerificationQueue({ companies }: { companies: Company[] }) {
    const [loading, setLoading] = useState<string | null>(null);
    const { showToast } = useToast();

    async function handleVerify(companyId: string, action: 'approve' | 'reject') {
        if (!confirm(`Are you sure you want to ${action} this company?`)) return;

        setLoading(companyId);
        try {
            const reason = action === 'reject' ? prompt("Reason for rejection:") : undefined;
            if (action === 'reject' && !reason) {
                setLoading(null);
                return;
            }

            const result = await verifyCompany(companyId, action, reason || undefined);
            showToast(result.message, result.success ? 'success' : 'error');
        } catch {
            showToast("Error verifying company.", 'error');
        } finally {
            setLoading(null);
        }
    }

    async function handleViewDoc(path: string) {
        if (!path) return;
        const supabase = createClient();
        const { data } = await supabase.storage
            .from('company_documents')
            .createSignedUrl(path, 3600);

        if (data?.signedUrl) {
            window.open(data.signedUrl, '_blank');
        } else {
            showToast("Could not Generate Link. Check permissions.", 'error');
        }
    }

    return (
        <div className={styles.tableWrapper}>
            <table className={tableStyles.jobTable}>
                <thead>
                    <tr>
                        <th>Company</th>
                        <th>Documents</th>
                        <th>Links</th>
                        <th>Actions</th>
                    </tr>
                </thead>
                <tbody>
                    {companies.map(c => (
                        <tr key={c.id}>
                            <td>
                                <div className={styles.companyName}>{c.name}</div>
                                <div className={styles.companyMeta}>
                                    {c.location} • {c.industry}
                                </div>
                                <div className={styles.companyMeta}>NPWP: {c.npwp_number}</div>
                            </td>
                            <td>
                                <button
                                    onClick={() => handleViewDoc(c.npwp_url)}
                                    className={styles.docLink}
                                >
                                    View NPWP
                                </button>
                                <button
                                    onClick={() => handleViewDoc(c.business_doc_url)}
                                    className={styles.docLink}
                                >
                                    View {c.business_doc_type?.toUpperCase()}
                                </button>
                            </td>
                            <td>
                                {c.website && (
                                    <a
                                        href={c.website.startsWith('http') ? c.website : `https://${c.website}`}
                                        target="_blank"
                                        rel="noopener noreferrer"
                                        className={styles.websiteLink}
                                    >
                                        Website
                                    </a>
                                )}
                            </td>
                            <td>
                                <div className={styles.actionRow}>
                                    <button
                                        onClick={() => handleVerify(c.id, 'approve')}
                                        disabled={loading === c.id}
                                        className={styles.approveButton}
                                    >
                                        Approve
                                    </button>
                                    <button
                                        onClick={() => handleVerify(c.id, 'reject')}
                                        disabled={loading === c.id}
                                        className={styles.rejectButton}
                                    >
                                        Reject
                                    </button>
                                </div>
                            </td>
                        </tr>
                    ))}
                </tbody>
            </table>
        </div>
    );
}
