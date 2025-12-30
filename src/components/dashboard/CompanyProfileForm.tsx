'use client'

import { useState } from 'react';
import { updateCompanyProfile } from '@/app/dashboard/actions';
import styles from './CompanyProfileForm.module.css';

import { INDUSTRIES } from '@/data/constants';
import { COUNTRIES } from '@/data/countries';

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

    const [countryCode, setCountryCode] = useState(company.country_code || 'ID');
    const [city, setCity] = useState(company.location || '');
    const [industry, setIndustry] = useState(company.industry || INDUSTRIES[0]);

    async function handleSubmit(formData: FormData) {
        setLoading(true);
        setMessage(null);

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
        <div className={styles.profileCard}>
            <h2 className={styles.sectionTitle}>Company Details</h2>

            <form action={handleSubmit} className={styles.formGrid}>
                {message && (
                    <div className={styles.successMessage}>{message}</div>
                )}

                {/* Row 1: Name + Country */}
                <div className={styles.inputGroup}>
                    <label className={styles.label}>Company Name</label>
                    <input
                        name="name"
                        defaultValue={company.name}
                        required
                        className={styles.input}
                    />
                </div>

                <div className={styles.inputGroup}>
                    <label className={styles.label}>Country</label>
                    <select
                        value={countryCode}
                        onChange={(e) => setCountryCode(e.target.value)}
                        className={styles.select}
                    >
                        {COUNTRIES.map(c => (
                            <option key={c.code} value={c.code}>
                                {c.flag} {c.name}
                            </option>
                        ))}
                    </select>
                </div>

                {/* Row 2: City + Industry */}
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
                        className={styles.select}
                    >
                        <option value="">Select Industry...</option>
                        {INDUSTRIES.map(ind => (
                            <option key={ind} value={ind}>{ind}</option>
                        ))}
                    </select>
                </div>

                {/* Row 3: Website (full width) */}
                <div className={`${styles.inputGroup} ${styles.fullWidth}`}>
                    <label className={styles.label}>Website</label>
                    <input
                        name="website"
                        defaultValue={company.website || ''}
                        placeholder="https://yourcompany.com"
                        className={styles.input}
                    />
                </div>

                {/* Row 4: Description (full width) */}
                <div className={`${styles.inputGroup} ${styles.fullWidth}`}>
                    <label className={styles.label}>Description (About Us)</label>
                    <textarea
                        name="description"
                        defaultValue={company.description || ''}
                        rows={6}
                        placeholder="Tell candidates about your company, culture, and what makes it a great place to work..."
                        className={styles.textarea}
                    />
                </div>

                {/* Submit */}
                <div className={styles.submitRow}>
                    <button type="submit" className={styles.saveButton} disabled={loading}>
                        {loading ? 'Saving...' : 'Save Changes'}
                    </button>
                </div>
            </form>
        </div>
    );
}
