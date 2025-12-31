'use client';

import { useState, useEffect, useRef } from 'react';
import styles from './PostJob.module.css';
import { HEALTHCARE_COUNTRIES } from '@/data/healthcare-config';
import type { HealthcareCertification } from '@/types/healthcare';

interface CertificationSelection {
    certification_id: string;
    name: string;
    abbreviation: string | null;
    is_required: boolean;
}

interface HealthcareCertificationSelectProps {
    onSelectionChange: (selections: CertificationSelection[]) => void;
    selectedCountryCode?: string;
}

export function HealthcareCertificationSelect({
    onSelectionChange,
    selectedCountryCode
}: HealthcareCertificationSelectProps) {
    const [isHealthcareJob, setIsHealthcareJob] = useState(false);
    const [healthcareCountry, setHealthcareCountry] = useState(selectedCountryCode || '');
    const [certifications, setCertifications] = useState<HealthcareCertification[]>([]);
    const [selectedCerts, setSelectedCerts] = useState<CertificationSelection[]>([]);
    const [isOpen, setIsOpen] = useState(false);
    const [search, setSearch] = useState('');
    const wrapperRef = useRef<HTMLDivElement>(null);

    // Check if current country supports healthcare certs
    const isCountrySupported = HEALTHCARE_COUNTRIES.some(c => c.code === healthcareCountry);

    // Fetch certifications when healthcare country changes
    useEffect(() => {
        if (isHealthcareJob && healthcareCountry) {
            fetchCertifications(healthcareCountry);
        } else {
            setCertifications([]);
        }
    }, [isHealthcareJob, healthcareCountry]);

    // Notify parent of changes
    useEffect(() => {
        onSelectionChange(isHealthcareJob ? selectedCerts : []);
    }, [selectedCerts, isHealthcareJob, onSelectionChange]);

    // Close dropdown on outside click
    useEffect(() => {
        function handleClickOutside(event: MouseEvent) {
            if (wrapperRef.current && !wrapperRef.current.contains(event.target as Node)) {
                setIsOpen(false);
            }
        }
        document.addEventListener("mousedown", handleClickOutside);
        return () => document.removeEventListener("mousedown", handleClickOutside);
    }, []);

    async function fetchCertifications(countryCode: string) {
        try {
            const response = await fetch(`/api/healthcare/certifications?country=${countryCode}`);
            if (response.ok) {
                const data = await response.json();
                setCertifications(data);
            }
        } catch (err) {
            console.error('Error fetching certifications:', err);
        }
    }

    function addCertification(cert: HealthcareCertification) {
        if (!selectedCerts.find(s => s.certification_id === cert.id)) {
            setSelectedCerts([...selectedCerts, {
                certification_id: cert.id,
                name: cert.name,
                abbreviation: cert.abbreviation,
                is_required: true
            }]);
        }
        setSearch('');
        setIsOpen(false);
    }

    function removeCertification(certId: string) {
        setSelectedCerts(selectedCerts.filter(c => c.certification_id !== certId));
    }

    function toggleRequired(certId: string) {
        setSelectedCerts(selectedCerts.map(c =>
            c.certification_id === certId
                ? { ...c, is_required: !c.is_required }
                : c
        ));
    }

    const filteredCerts = certifications.filter(c =>
        !selectedCerts.find(s => s.certification_id === c.id) &&
        (c.name.toLowerCase().includes(search.toLowerCase()) ||
            (c.abbreviation && c.abbreviation.toLowerCase().includes(search.toLowerCase())))
    );

    return (
        <div className={styles.healthcareSection}>
            <div className={styles.healthcareHeader}>
                <label className={styles.checkboxLabel}>
                    <input
                        type="checkbox"
                        checked={isHealthcareJob}
                        onChange={e => {
                            setIsHealthcareJob(e.target.checked);
                            if (!e.target.checked) {
                                setSelectedCerts([]);
                            }
                        }}
                    />
                    This is a healthcare position requiring specific credentials
                </label>
            </div>

            {isHealthcareJob && (
                <div className={styles.healthcareContent}>
                    <div className={styles.healthcareRow}>
                        <label className={styles.label}>Credential Country</label>
                        <select
                            className={styles.input}
                            value={healthcareCountry}
                            onChange={e => {
                                setHealthcareCountry(e.target.value);
                                setSelectedCerts([]); // Reset on country change
                            }}
                        >
                            <option value="">Select country for credentials...</option>
                            {HEALTHCARE_COUNTRIES.map(c => (
                                <option key={c.code} value={c.code}>
                                    {c.flag} {c.name}
                                </option>
                            ))}
                        </select>
                        <p className={styles.helpText}>
                            Currently supported: Singapore, Indonesia, Malaysia, Philippines
                        </p>
                    </div>

                    {healthcareCountry && isCountrySupported && (
                        <>
                            <div className={styles.healthcareRow}>
                                <label className={styles.label}>Required Certifications</label>

                                {/* Selected certifications */}
                                {selectedCerts.length > 0 && (
                                    <div className={styles.certList}>
                                        {selectedCerts.map(cert => (
                                            <div key={cert.certification_id} className={styles.certItem}>
                                                <span className={styles.certName}>
                                                    {cert.name}
                                                    {cert.abbreviation && <span className={styles.certAbbr}>({cert.abbreviation})</span>}
                                                </span>
                                                <div className={styles.certActions}>
                                                    <label className={styles.requiredToggle}>
                                                        <input
                                                            type="checkbox"
                                                            checked={cert.is_required}
                                                            onChange={() => toggleRequired(cert.certification_id)}
                                                        />
                                                        Required
                                                    </label>
                                                    <button
                                                        type="button"
                                                        className={styles.certRemove}
                                                        onClick={() => removeCertification(cert.certification_id)}
                                                    >
                                                        ×
                                                    </button>
                                                </div>
                                            </div>
                                        ))}
                                    </div>
                                )}

                                {/* Certification selector */}
                                <div ref={wrapperRef} className={styles.multiSelectWrapper}>
                                    <input
                                        type="text"
                                        className={styles.input}
                                        placeholder="Search and add certifications (RN, BLS, ACLS...)"
                                        value={search}
                                        onChange={e => setSearch(e.target.value)}
                                        onFocus={() => setIsOpen(true)}
                                    />

                                    {isOpen && (
                                        <div className={styles.dropdownMenu}>
                                            {filteredCerts.length > 0 ? (
                                                filteredCerts.map(cert => (
                                                    <div
                                                        key={cert.id}
                                                        className={styles.dropdownOption}
                                                        onClick={() => addCertification(cert)}
                                                    >
                                                        <strong>{cert.abbreviation || cert.name}</strong>
                                                        {cert.abbreviation && <span> - {cert.name}</span>}
                                                        <span className={styles.certCategory}>
                                                            {cert.category}
                                                        </span>
                                                    </div>
                                                ))
                                            ) : (
                                                <div className={styles.dropdownEmpty}>
                                                    No matching certifications found
                                                </div>
                                            )}
                                        </div>
                                    )}
                                </div>
                            </div>
                        </>
                    )}
                </div>
            )}
        </div>
    );
}
