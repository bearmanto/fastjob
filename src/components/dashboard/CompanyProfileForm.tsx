'use client'

import { useState } from 'react';
import { updateCompanyProfile } from '@/app/dashboard/actions';
import styles from '@/app/profile/Profile.module.css'; // Reuse profile styles

import { INDUSTRIES } from '@/data/constants';
import { COUNTRIES, getCountryFlag } from '@/data/countries';

interface Company {
    name: string;
    location: string | null;
    country_code: string | null;
    website: string | null;
    industry: string | null;
    description: string | null;
}

export function CompanyProfileForm({ company }: { company: Company }) {
    const [loading, setLoading] = useState(false);
    const [message, setMessage] = useState<string | null>(null);

    // Use country_code if available, otherwise try to parse from location
    const [countryCode, setCountryCode] = useState(company.country_code || 'ID');
    const [city, setCity] = useState(company.location || '');
    const [industry, setIndustry] = useState(company.industry || INDUSTRIES[0]);

    async function handleSubmit(formData: FormData) {
        setLoading(true);
        setMessage(null);

        // Set country code and city as location
        formData.set('country_code', countryCode);
        formData.set('location', city);
        formData.set('industry', industry);

        try {
            const result = await updateCompanyProfile(formData);
            setMessage(result.message);
        } catch {
            setMessage("Error updating profile.");
        } finally {
            setLoading(false);
        }
    }

    return (
        <div className={styles.section}>
            <h2 className={styles.sectionTitle}>Company Details</h2>
            {message && <div style={{ color: 'var(--hunter-green)', marginBottom: '10px', fontWeight: 'bold' }}>{message}</div>}

            <form action={handleSubmit} className={styles.formGrid}>
                <div className={styles.inputGroup}>
                    <label className={styles.label}>Company Name</label>
                    <input name="name" defaultValue={company.name} required className={styles.input} />
                </div>

                {/* Country Dropdown */}
                <div className={styles.inputGroup}>
                    <label className={styles.label}>Country</label>
                    <select
                        value={countryCode}
                        onChange={(e) => setCountryCode(e.target.value)}
                        className={styles.input}
                    >
                        {COUNTRIES.map(c => (
                            <option key={c.code} value={c.code}>
                                {c.flag} {c.name}
                            </option>
                        ))}
                    </select>
                </div>

                {/* City/Region Free Text */}
                <div className={styles.inputGroup}>
                    <label className={styles.label}>City / Region</label>
                    <input
                        value={city}
                        onChange={(e) => setCity(e.target.value)}
                        placeholder="e.g., Jakarta, London, New York"
                        className={styles.input}
                    />
                </div>

                <div className={styles.inputGroup}>
                    <label className={styles.label}>Industry</label>
                    <select
                        name="industry"
                        value={industry}
                        onChange={(e) => setIndustry(e.target.value)}
                        className={styles.input}
                    >
                        <option value="">Select Industry...</option>
                        {INDUSTRIES.map(ind => (
                            <option key={ind} value={ind}>{ind}</option>
                        ))}
                    </select>
                </div>

                <div className={styles.inputGroup}>
                    <label className={styles.label}>Website</label>
                    <input name="website" defaultValue={company.website || ''} placeholder="https://..." className={styles.input} />
                </div>

                <div className={`${styles.inputGroup} ${styles.fullWidth}`}>
                    <label className={styles.label}>Description (About Us)</label>
                    <textarea
                        name="description"
                        defaultValue={company.description || ''}
                        rows={6}
                        placeholder="Briefly describe your company..."
                        className={styles.textarea}
                    />
                </div>

                <div className={styles.fullWidth} style={{ marginTop: '10px' }}>
                    <button type="submit" className={styles.saveButton} disabled={loading}>
                        {loading ? 'Saving...' : 'Save Company Details'}
                    </button>
                </div>
            </form>
        </div>
    );
}
