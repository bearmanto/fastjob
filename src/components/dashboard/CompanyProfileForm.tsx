'use client'

import { useState } from 'react';
import { updateCompanyProfile } from '@/app/dashboard/actions';
import styles from '@/app/profile/Profile.module.css'; // Reuse profile styles

import { INDUSTRIES, LOCATIONS } from '@/data/constants';

interface Company {
    name: string;
    location: string | null;
    website: string | null;
    industry: string | null;
    description: string | null;
}

export function CompanyProfileForm({ company }: { company: Company }) {
    const [loading, setLoading] = useState(false);
    const [message, setMessage] = useState<string | null>(null);

    // Initial State Parsing
    const initialLocation = company.location?.split(', ') || [];
    const initialCity = initialLocation[0] || '';
    const initialCountry = initialLocation[1] || 'Indonesia'; // Default to Indonesia if unknown

    const [country, setCountry] = useState(initialCountry);
    const [city, setCity] = useState(initialCity);
    const [industry, setIndustry] = useState(company.industry || INDUSTRIES[0]);

    const cities = LOCATIONS[country] || [];

    async function handleSubmit(formData: FormData) {
        setLoading(true);
        setMessage(null);

        // Construct combined location
        const fullLocation = `${city}, ${country}`;
        formData.set('location', fullLocation);
        formData.set('industry', industry); // Ensure industry is set from state

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

                {/* Location Split: Country & City */}
                <div className={styles.inputGroup}>
                    <label className={styles.label}>Country</label>
                    <select
                        value={country}
                        onChange={(e) => {
                            setCountry(e.target.value);
                            setCity(''); // Reset city when country changes
                        }}
                        className={styles.input}
                    >
                        {Object.keys(LOCATIONS).map(c => (
                            <option key={c} value={c}>{c}</option>
                        ))}
                    </select>
                </div>

                <div className={styles.inputGroup}>
                    <label className={styles.label}>City / Region</label>
                    <select
                        value={city}
                        onChange={(e) => setCity(e.target.value)}
                        className={styles.input}
                        disabled={!country}
                    >
                        <option value="">Select City...</option>
                        {cities.map(c => (
                            <option key={c} value={c}>{c}</option>
                        ))}
                    </select>
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
