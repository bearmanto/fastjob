'use client'

import { useState } from 'react';
import { updateCompanyProfile } from '@/app/dashboard/actions';
import styles from './CompanyProfileForm.module.css';

import { INDUSTRIES, COMPANY_SIZES } from '@/data/constants';
import { COUNTRIES } from '@/data/countries';

interface Company {
    name: string;
    location: string | null;
    country_code: string | null;
    website: string | null;
    industry: string | null;
    description: string | null;
    company_size: string | null;
    founded_year: number | null;
}

export function CompanyProfileForm({ company }: { company: Company }) {
    const [loading, setLoading] = useState(false);
    const [message, setMessage] = useState<string | null>(null);

    const [countryCode, setCountryCode] = useState(company.country_code || 'ID');
    const [city, setCity] = useState(company.location || '');
    const [industry, setIndustry] = useState(company.industry || INDUSTRIES[0]);
    const [name, setName] = useState(company.name || '');
    const [size, setSize] = useState(company.company_size || '');
    const [year, setYear] = useState(company.founded_year?.toString() || '');

    async function handleSubmit(formData: FormData) {
        setLoading(true);
        setMessage(null);

        formData.set('name', name);
        formData.set('country_code', countryCode);
        formData.set('location', city);
        formData.set('industry', industry);
        formData.set('company_size', size);
        formData.set('founded_year', year);

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
            {/* Premium Header Section */}
            <div className={styles.coverSection}>
                {/* Future: Add "Change Cover" button */}
            </div>

            <div className={styles.logoSection}>
                <div className={styles.logoPlaceholder}>
                    {name ? name.charAt(0).toUpperCase() : '?'}
                </div>
                <div className={styles.companyIdentity}>
                    <div className={styles.companyNameDisplay}>
                        {name}
                    </div>
                    <div className={styles.companyMeta}>
                        <span>{city || company.location || 'Location not set'}</span>
                        <span>•</span>
                        <span>{industry || company.industry || 'Industry not set'}</span>
                        {size && (
                            <>
                                <span>•</span>
                                <span>{size}</span>
                            </>
                        )}
                        {year && (
                            <>
                                <span>•</span>
                                <span>Est. {year}</span>
                            </>
                        )}
                    </div>
                </div>
            </div>

            <h2 className={styles.sectionTitle}>Edit Company Details</h2>

            <form action={handleSubmit} className={styles.formGrid}>
                {message && (
                    <div className={styles.successMessage}>{message}</div>
                )}

                {/* Row 1: Name + Country */}
                <div className={styles.inputGroup}>
                    <label className={styles.label}>Company Name</label>
                    <input
                        name="name"
                        value={name}
                        onChange={(e) => setName(e.target.value)}
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

                {/* Row 3: Size + Year */}
                <div className={styles.inputGroup}>
                    <label className={styles.label}>Company Size</label>
                    <select
                        name="company_size"
                        value={size}
                        onChange={(e) => setSize(e.target.value)}
                        className={styles.select}
                    >
                        <option value="">Select Size...</option>
                        {COMPANY_SIZES.map(s => (
                            <option key={s.value} value={s.value}>{s.label}</option>
                        ))}
                    </select>
                </div>

                <div className={styles.inputGroup}>
                    <label className={styles.label}>Founded Year</label>
                    <input
                        name="founded_year"
                        type="number"
                        min="1800"
                        max={new Date().getFullYear()}
                        value={year}
                        onChange={(e) => setYear(e.target.value)}
                        placeholder="e.g. 2010"
                        className={styles.input}
                    />
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
                        {loading ? 'Saving...' : (
                            <>
                                <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                                    <path d="M19 21H5a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h11l5 5v11a2 2 0 0 1-2 2z"></path>
                                    <polyline points="17 21 17 13 7 13 7 21"></polyline>
                                    <polyline points="7 3 7 8 15 8"></polyline>
                                </svg>
                                Save Changes
                            </>
                        )}
                    </button>
                </div>
            </form>
        </div>
    );
}
