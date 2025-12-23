'use client'

import { useState, useEffect } from 'react';
import { verifyCompany } from './actions';
import { createClient } from '@/utils/supabase/client';
import tableStyles from '@/components/ui/Table.module.css';
import styles from './Admin.module.css';
import { useToast } from '@/components/ui/Toast';
import { VERIFICATION_CATEGORIES } from '@/data/countries';

interface VerificationDocument {
    id: string;
    document_category: string;
    document_subtype: string;
    document_url: string;
    review_status: string;
}

interface Company {
    id: string;
    name: string;
    location: string;
    country_code: string;
    website: string;
    industry: string;
    // Legacy fields for backwards compatibility
    npwp_number?: string;
    npwp_url?: string;
    business_doc_type?: string;
    business_doc_url?: string;
}

export function VerificationQueue({ companies }: { companies: Company[] }) {
    const [loading, setLoading] = useState<string | null>(null);
    const [documents, setDocuments] = useState<Record<string, VerificationDocument[]>>({});
    const { showToast } = useToast();

    // Fetch documents for all companies
    useEffect(() => {
        async function fetchDocuments() {
            const supabase = createClient();
            const companyIds = companies.map(c => c.id);

            const { data } = await supabase
                .from('verification_documents')
                .select('*')
                .in('company_id', companyIds);

            if (data) {
                const grouped: Record<string, VerificationDocument[]> = {};
                data.forEach(doc => {
                    if (!grouped[doc.company_id]) grouped[doc.company_id] = [];
                    grouped[doc.company_id].push(doc);
                });
                setDocuments(grouped);
            }
        }

        if (companies.length > 0) {
            fetchDocuments();
        }
    }, [companies]);

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

    async function handleViewDoc(url: string) {
        if (!url) return;
        // If it's already a full URL, open directly
        if (url.startsWith('http')) {
            window.open(url, '_blank');
            return;
        }
        // Otherwise, create signed URL
        const supabase = createClient();
        const { data } = await supabase.storage
            .from('company_documents')
            .createSignedUrl(url, 3600);

        if (data?.signedUrl) {
            window.open(data.signedUrl, '_blank');
        } else {
            showToast("Could not generate link. Check permissions.", 'error');
        }
    }

    const getDocLabel = (doc: VerificationDocument) => {
        const category = VERIFICATION_CATEGORIES[doc.document_category as keyof typeof VERIFICATION_CATEGORIES];
        const docType = category?.documentTypes.find(dt => dt.value === doc.document_subtype);
        return docType?.label || doc.document_subtype;
    };

    const getCategoryLabel = (categoryKey: string) => {
        const category = VERIFICATION_CATEGORIES[categoryKey as keyof typeof VERIFICATION_CATEGORIES];
        return category?.label || categoryKey;
    };

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
                    {companies.map(c => {
                        const companyDocs = documents[c.id] || [];
                        // Group by category
                        const docsByCategory: Record<string, VerificationDocument[]> = {};
                        companyDocs.forEach(d => {
                            if (!docsByCategory[d.document_category]) docsByCategory[d.document_category] = [];
                            docsByCategory[d.document_category].push(d);
                        });

                        return (
                            <tr key={c.id}>
                                <td>
                                    <div className={styles.companyName}>{c.name}</div>
                                    <div className={styles.companyMeta}>
                                        {c.country_code} • {c.location} • {c.industry}
                                    </div>
                                </td>
                                <td>
                                    {companyDocs.length > 0 ? (
                                        <div className={styles.docList}>
                                            {Object.entries(docsByCategory).map(([cat, docs]) => (
                                                <div key={cat} className={styles.docCategory}>
                                                    <strong>{getCategoryLabel(cat)}:</strong>
                                                    {docs.map(doc => (
                                                        <button
                                                            key={doc.id}
                                                            onClick={() => handleViewDoc(doc.document_url)}
                                                            className={styles.docLink}
                                                        >
                                                            {getDocLabel(doc)}
                                                        </button>
                                                    ))}
                                                </div>
                                            ))}
                                        </div>
                                    ) : (
                                        // Legacy fallback
                                        <>
                                            {c.npwp_url && (
                                                <button
                                                    onClick={() => handleViewDoc(c.npwp_url!)}
                                                    className={styles.docLink}
                                                >
                                                    NPWP
                                                </button>
                                            )}
                                            {c.business_doc_url && (
                                                <button
                                                    onClick={() => handleViewDoc(c.business_doc_url!)}
                                                    className={styles.docLink}
                                                >
                                                    {c.business_doc_type?.toUpperCase() || 'Doc'}
                                                </button>
                                            )}
                                        </>
                                    )}
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
                        );
                    })}
                </tbody>
            </table>
        </div>
    );
}
