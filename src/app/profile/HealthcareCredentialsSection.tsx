'use client';

import { useState, useEffect } from 'react';
import styles from './HealthcareCredentials.module.css';
import {
    HEALTHCARE_COUNTRIES,
    VERIFICATION_STATUSES,
    getDaysUntilExpiry,
    isExpiringSoon,
    isExpired,
    getCategoryLabel
} from '@/data/healthcare-config';
import type {
    HealthcareCertification,
    ProfileCertification
} from '@/types/healthcare';

interface HealthcareCredentialsSectionProps {
    profileId: string;
    initialCredentials: ProfileCertification[];
}

export function HealthcareCredentialsSection({
    profileId,
    initialCredentials
}: HealthcareCredentialsSectionProps) {
    const [credentials, setCredentials] = useState<ProfileCertification[]>(initialCredentials);
    const [isAdding, setIsAdding] = useState(false);
    const [isLoading, setIsLoading] = useState(false);
    const [selectedCountry, setSelectedCountry] = useState('');
    const [availableCerts, setAvailableCerts] = useState<HealthcareCertification[]>([]);
    const [error, setError] = useState('');

    // Form state
    const [formData, setFormData] = useState({
        certification_id: '',
        license_number: '',
        issue_date: '',
        expiry_date: '',
        state_or_region: ''
    });

    // Fetch certifications when country changes
    useEffect(() => {
        if (selectedCountry) {
            fetchCertifications(selectedCountry);
        } else {
            setAvailableCerts([]);
        }
    }, [selectedCountry]);

    async function fetchCertifications(countryCode: string) {
        try {
            const response = await fetch(`/api/healthcare/certifications?country=${countryCode}`);
            if (response.ok) {
                const data = await response.json();
                setAvailableCerts(data);
            }
        } catch (err) {
            console.error('Error fetching certifications:', err);
        }
    }

    async function handleSubmit(e: React.FormEvent) {
        e.preventDefault();
        setIsLoading(true);
        setError('');

        try {
            const response = await fetch('/api/healthcare/profile-certifications', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({
                    profile_id: profileId,
                    ...formData
                })
            });

            if (response.ok) {
                const newCred = await response.json();
                setCredentials([newCred, ...credentials]);
                setIsAdding(false);
                resetForm();
            } else {
                const data = await response.json();
                setError(data.error || 'Failed to add credential');
            }
        } catch (err) {
            setError('An error occurred');
        } finally {
            setIsLoading(false);
        }
    }

    async function handleDelete(id: string) {
        if (!confirm('Are you sure you want to delete this credential?')) return;

        try {
            const response = await fetch(`/api/healthcare/profile-certifications/${id}`, {
                method: 'DELETE'
            });

            if (response.ok) {
                setCredentials(credentials.filter(c => c.id !== id));
            }
        } catch (err) {
            console.error('Error deleting credential:', err);
        }
    }

    function resetForm() {
        setFormData({
            certification_id: '',
            license_number: '',
            issue_date: '',
            expiry_date: '',
            state_or_region: ''
        });
        setSelectedCountry('');
    }

    function getStatusBadge(cred: ProfileCertification) {
        // Check expiry first
        if (cred.expiry_date && isExpired(cred.expiry_date)) {
            return <span className={`${styles.badge} ${styles.expired}`}>Expired</span>;
        }
        if (cred.expiry_date && isExpiringSoon(cred.expiry_date)) {
            const days = getDaysUntilExpiry(cred.expiry_date);
            return <span className={`${styles.badge} ${styles.expiring}`}>Expires in {days} days</span>;
        }

        // Then verification status
        const status = VERIFICATION_STATUSES.find(s => s.value === cred.verification_status);
        const statusClass = cred.verification_status === 'verified' ? styles.verified :
            cred.verification_status === 'rejected' ? styles.rejected :
                styles.pending;
        return <span className={`${styles.badge} ${statusClass}`}>{status?.label || 'Pending'}</span>;
    }

    const selectedCert = availableCerts.find(c => c.id === formData.certification_id);

    return (
        <section className={styles.section}>
            <div className={styles.sectionHeader}>
                <h2 className={styles.sectionTitle}>Healthcare Credentials</h2>
                {!isAdding && (
                    <button
                        className={styles.addButton}
                        onClick={() => setIsAdding(true)}
                    >
                        + Add Credential
                    </button>
                )}
            </div>

            {isAdding && (
                <form className={styles.form} onSubmit={handleSubmit}>
                    <h3 className={styles.formTitle}>Add Healthcare Credential</h3>

                    {error && <div className={styles.error}>{error}</div>}

                    <div className={styles.formRow}>
                        <label className={styles.label}>Country</label>
                        <select
                            className={styles.select}
                            value={selectedCountry}
                            onChange={(e) => setSelectedCountry(e.target.value)}
                            required
                        >
                            <option value="">Select country...</option>
                            {HEALTHCARE_COUNTRIES.map(c => (
                                <option key={c.code} value={c.code}>
                                    {c.flag} {c.name}
                                </option>
                            ))}
                        </select>
                    </div>

                    {selectedCountry && (
                        <div className={styles.formRow}>
                            <label className={styles.label}>Certification</label>
                            <select
                                className={styles.select}
                                value={formData.certification_id}
                                onChange={(e) => setFormData({ ...formData, certification_id: e.target.value })}
                                required
                            >
                                <option value="">Select certification...</option>
                                {availableCerts.map(cert => (
                                    <option key={cert.id} value={cert.id}>
                                        {cert.name} {cert.abbreviation ? `(${cert.abbreviation})` : ''}
                                    </option>
                                ))}
                            </select>
                        </div>
                    )}

                    {selectedCert?.requires_license_number && (
                        <div className={styles.formRow}>
                            <label className={styles.label}>License Number</label>
                            <input
                                type="text"
                                className={styles.input}
                                value={formData.license_number}
                                onChange={(e) => setFormData({ ...formData, license_number: e.target.value })}
                                placeholder="Enter license number"
                            />
                        </div>
                    )}

                    <div className={styles.formRow}>
                        <label className={styles.label}>Issue Date</label>
                        <input
                            type="date"
                            className={styles.input}
                            value={formData.issue_date}
                            onChange={(e) => setFormData({ ...formData, issue_date: e.target.value })}
                        />
                    </div>

                    {selectedCert?.requires_expiry && (
                        <div className={styles.formRow}>
                            <label className={styles.label}>Expiry Date</label>
                            <input
                                type="date"
                                className={styles.input}
                                value={formData.expiry_date}
                                onChange={(e) => setFormData({ ...formData, expiry_date: e.target.value })}
                            />
                        </div>
                    )}

                    <div className={styles.formRow}>
                        <label className={styles.label}>State/Region (Optional)</label>
                        <input
                            type="text"
                            className={styles.input}
                            value={formData.state_or_region}
                            onChange={(e) => setFormData({ ...formData, state_or_region: e.target.value })}
                            placeholder="e.g., Jakarta, Johor"
                        />
                    </div>

                    <div className={styles.formActions}>
                        <button
                            type="button"
                            className={styles.cancelButton}
                            onClick={() => { setIsAdding(false); resetForm(); }}
                            disabled={isLoading}
                        >
                            Cancel
                        </button>
                        <button
                            type="submit"
                            className={styles.submitButton}
                            disabled={isLoading || !formData.certification_id}
                        >
                            {isLoading ? 'Adding...' : 'Add Credential'}
                        </button>
                    </div>
                </form>
            )}

            {credentials.length === 0 && !isAdding ? (
                <div className={styles.empty}>
                    <p>No healthcare credentials added yet.</p>
                    <p className={styles.emptyHint}>
                        Add your nursing licenses, certifications, and other healthcare credentials.
                    </p>
                </div>
            ) : (
                <div className={styles.credentialsList}>
                    {credentials.map(cred => (
                        <div key={cred.id} className={styles.credentialCard}>
                            <div className={styles.credentialHeader}>
                                <div className={styles.credentialInfo}>
                                    <h4 className={styles.credentialName}>
                                        {cred.certification?.name}
                                        {cred.certification?.abbreviation && (
                                            <span className={styles.abbreviation}>
                                                ({cred.certification.abbreviation})
                                            </span>
                                        )}
                                    </h4>
                                    {cred.certification?.issuing_body && (
                                        <p className={styles.issuingBody}>
                                            {cred.certification.issuing_body}
                                        </p>
                                    )}
                                </div>
                                {getStatusBadge(cred)}
                            </div>

                            <div className={styles.credentialDetails}>
                                {cred.license_number && (
                                    <div className={styles.detailItem}>
                                        <span className={styles.detailLabel}>License #:</span>
                                        <span className={styles.detailValue}>{cred.license_number}</span>
                                    </div>
                                )}
                                {cred.issue_date && (
                                    <div className={styles.detailItem}>
                                        <span className={styles.detailLabel}>Issued:</span>
                                        <span className={styles.detailValue}>
                                            {new Date(cred.issue_date).toLocaleDateString()}
                                        </span>
                                    </div>
                                )}
                                {cred.expiry_date && (
                                    <div className={styles.detailItem}>
                                        <span className={styles.detailLabel}>Expires:</span>
                                        <span className={styles.detailValue}>
                                            {new Date(cred.expiry_date).toLocaleDateString()}
                                        </span>
                                    </div>
                                )}
                                {cred.state_or_region && (
                                    <div className={styles.detailItem}>
                                        <span className={styles.detailLabel}>Region:</span>
                                        <span className={styles.detailValue}>{cred.state_or_region}</span>
                                    </div>
                                )}
                            </div>

                            <button
                                className={styles.deleteButton}
                                onClick={() => handleDelete(cred.id)}
                                title="Delete credential"
                            >
                                ×
                            </button>
                        </div>
                    ))}
                </div>
            )}
        </section>
    );
}
