'use client'

import { useState, useMemo } from 'react';
import { updateBasicProfile } from './actions';
import styles from './Profile.module.css';
import { Country, City, ICountry, ICity } from 'country-state-city';
import { COUNTRIES } from '@/data/countries';

// Simple country select for eligibility
function CountrySelect({ defaultValue }: { defaultValue: string }) {
    return (
        <select name="country_code" className={styles.input} defaultValue={defaultValue}>
            <option value="">Select your country...</option>
            {COUNTRIES.map(c => (
                <option key={c.code} value={c.code}>{c.flag} {c.name}</option>
            ))}
        </select>
    );
}

interface Props {
    profile: {
        full_name?: string | null;
        headline?: string | null;
        summary?: string | null;
        phone?: string | null;
        linkedin?: string | null;
        location?: string | null;
        willing_to_relocate?: boolean | null;
        country_code?: string | null;
    };
}

function LocationInput({ defaultValue }: { defaultValue?: string }) {
    // Lazy initialization function to avoid setState in useEffect
    const getInitialState = () => {
        const allCountries = Country.getAllCountries();
        let initialCountryCode = '';
        let initialCityCode = '';
        let initialCities: ICity[] = [];

        if (defaultValue) {
            const parts = defaultValue.split(', ');
            let countryName = '';
            let cityName = '';

            if (parts.length === 2) {
                cityName = parts[0];
                countryName = parts[1];
            } else {
                countryName = defaultValue;
            }

            const foundCountry = allCountries.find(c => c.name === countryName);
            if (foundCountry) {
                initialCountryCode = foundCountry.isoCode;

                const countryCities = City.getCitiesOfCountry(foundCountry.isoCode);
                const uniqueCitiesMap = new Map<string, ICity>();
                countryCities?.forEach(city => {
                    if (!uniqueCitiesMap.has(city.name)) {
                        uniqueCitiesMap.set(city.name, city);
                    }
                });
                initialCities = Array.from(uniqueCitiesMap.values());

                if (cityName) {
                    const foundCity = initialCities.find(c => c.name === cityName);
                    if (foundCity) {
                        initialCityCode = foundCity.name;
                    }
                }
            }
        }

        return { allCountries, initialCountryCode, initialCityCode, initialCities };
    };

    // Use lazy initialization to avoid useEffect + setState pattern
    const [initialData] = useState(getInitialState);
    const [countries] = useState<ICountry[]>(initialData.allCountries);
    const [cities, setCities] = useState<ICity[]>(initialData.initialCities);
    const [selectedCountryCode, setSelectedCountryCode] = useState(initialData.initialCountryCode);
    const [selectedCityCode, setSelectedCityCode] = useState(initialData.initialCityCode);

    // Handle country change
    const handleCountryChange = (e: React.ChangeEvent<HTMLSelectElement>) => {
        const code = e.target.value;
        setSelectedCountryCode(code);

        if (!code) {
            setCities([]);
            setSelectedCityCode('');
            return;
        }

        const countryCities = City.getCitiesOfCountry(code);
        const uniqueCitiesMap = new Map<string, ICity>();
        countryCities?.forEach(city => {
            if (!uniqueCitiesMap.has(city.name)) {
                uniqueCitiesMap.set(city.name, city);
            }
        });
        const uniqueCities = Array.from(uniqueCitiesMap.values());
        setCities(uniqueCities);
        setSelectedCityCode('');
    };

    // Compute final value using useMemo instead of useEffect + setState
    const finalValue = useMemo(() => {
        if (!selectedCountryCode) return defaultValue || '';

        const country = countries.find(c => c.isoCode === selectedCountryCode);
        if (!country) return defaultValue || '';

        if (selectedCityCode) {
            const city = cities.find(c => c.name === selectedCityCode);
            if (city) {
                return `${city.name}, ${country.name}`;
            }
        }
        return country.name;
    }, [selectedCountryCode, selectedCityCode, countries, cities, defaultValue]);

    return (
        <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '10px' }}>
            <input type="hidden" name="location" value={finalValue} />

            <select
                className={styles.input}
                value={selectedCountryCode}
                onChange={handleCountryChange}
            >
                <option value="">Select Country</option>
                {countries.map((c) => (
                    <option key={c.isoCode} value={c.isoCode}>{c.name}</option>
                ))}
            </select>

            <select
                className={styles.input}
                value={selectedCityCode}
                onChange={(e) => setSelectedCityCode(e.target.value)}
                disabled={!selectedCountryCode}
                style={{ opacity: !selectedCountryCode ? 0.5 : 1 }}
            >
                <option value="">Select City</option>
                {cities.map((c) => (
                    <option key={c.name} value={c.name}>{c.name}</option>
                ))}
            </select>
        </div>
    );
}

export function BasicInfoForm({ profile }: Props) {
    return (
        <form action={updateBasicProfile} className={styles.section}>
            <div className={styles.sectionHeader}>
                Basic Information
            </div>

            <div className={styles.formGrid}>
                <div className={styles.inputGroup}>
                    <label className={styles.label}>Full Name</label>
                    <input
                        className={styles.input}
                        type="text"
                        name="full_name"
                        defaultValue={profile.full_name || ''}
                        placeholder="Your Full Name"
                    />
                </div>

                <div className={styles.inputGroup}>
                    <label className={styles.label}>Professional Headline</label>
                    <input
                        className={styles.input}
                        type="text"
                        name="headline"
                        defaultValue={profile.headline || ''}
                        placeholder="e.g. Senior Mechanical Engineer"
                    />
                </div>

                <div className={styles.inputGroup}>
                    <label className={styles.label}>Location</label>
                    <LocationInput defaultValue={profile.location || undefined} />
                </div>

                <div className={styles.inputGroup}>
                    <label className={styles.label}>Country (for job eligibility)</label>
                    <CountrySelect defaultValue={profile.country_code || ''} />
                </div>

                <div className={`${styles.inputGroup} ${styles.fullWidth}`}>
                    <label className={styles.label}>Professional Summary</label>
                    <textarea
                        className={styles.textarea}
                        name="summary"
                        defaultValue={profile.summary || ''}
                        placeholder="Brief overview of your experience and goals..."
                    />
                </div>

                <div className={styles.inputGroup}>
                    <label className={styles.label}>Phone Number</label>
                    <input
                        className={styles.input}
                        type="tel"
                        name="phone"
                        defaultValue={profile.phone || ''}
                    />
                </div>

                <div className={styles.inputGroup}>
                    <label className={styles.label}>LinkedIn URL</label>
                    <input
                        className={styles.input}
                        type="text"
                        name="linkedin"
                        defaultValue={profile.linkedin || ''}
                    />
                </div>

                <div className={`${styles.inputGroup} ${styles.fullWidth}`}>
                    <label className={styles.checkboxLabel}>
                        <input
                            type="checkbox"
                            name="willing_to_relocate"
                            defaultChecked={profile.willing_to_relocate || false}
                        />
                        Willing to Relocate for the Right Opportunity
                    </label>
                </div>

                {/* Resume Section has been moved to a standalone component */}
            </div>

            <div style={{ textAlign: 'right' }}>
                <button type="submit" className={styles.saveButton}>SAVE CHANGES</button>
            </div>
        </form>
    );
}
