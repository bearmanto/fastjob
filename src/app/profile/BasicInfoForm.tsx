'use client'

import { useState, useEffect } from 'react';
import { updateBasicProfile } from './actions';
import styles from './Profile.module.css';
import { Country, City } from 'country-state-city';

interface Props {
    profile: any;
}

function LocationInput({ defaultValue }: { defaultValue?: string }) {
    const [mounted, setMounted] = useState(false);
    const [countries, setCountries] = useState<any[]>([]);
    const [cities, setCities] = useState<any[]>([]);

    // State for ISO codes
    const [selectedCountryCode, setSelectedCountryCode] = useState('');
    const [selectedCityCode, setSelectedCityCode] = useState(''); // City name is unique enough generally, but lib uses name as ID often or custom code

    // Final string value to submit
    const [finalValue, setFinalValue] = useState(defaultValue || '');

    useEffect(() => {
        setMounted(true);
        const allCountries = Country.getAllCountries();
        setCountries(allCountries);

        // Try to parse existing value to restore state
        if (defaultValue) {
            // Check for "City, Country" format first
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
                setSelectedCountryCode(foundCountry.isoCode);

                // Load cities for this country immediately so we can select one
                const countryCities = City.getCitiesOfCountry(foundCountry.isoCode);

                // Deduplicate cities
                const uniqueCitiesMap = new Map();
                countryCities?.forEach(city => {
                    if (!uniqueCitiesMap.has(city.name)) {
                        uniqueCitiesMap.set(city.name, city);
                    }
                });
                const uniqueCities = Array.from(uniqueCitiesMap.values());
                setCities(uniqueCities || []);

                // If we have a city, find match
                if (cityName) {
                    const foundCity = uniqueCities?.find(c => c.name === cityName);
                    if (foundCity) {
                        setSelectedCityCode(foundCity.name);
                    }
                }
            }
        }
    }, [defaultValue]);

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

        // Deduplicate
        const uniqueCitiesMap = new Map();
        countryCities?.forEach(city => {
            if (!uniqueCitiesMap.has(city.name)) {
                uniqueCitiesMap.set(city.name, city);
            }
        });
        const uniqueCities = Array.from(uniqueCitiesMap.values());

        setCities(uniqueCities || []);
        setSelectedCityCode(''); // Reset city on manual change
    };

    // Effect to update hidden input value
    useEffect(() => {
        if (!mounted) return;

        // If user hasn't touched controls yet, keep default (unless they cleared it)
        // Actually, we want to construct from selection IF selection exists
        if (selectedCountryCode) {
            const country = countries.find(c => c.isoCode === selectedCountryCode);
            // Case 1: Country + City
            if (selectedCityCode && selectedCountryCode) {
                const city = cities.find(c => c.name === selectedCityCode); // City doesn't have isoCode usually, uses name
                if (city && country) {
                    setFinalValue(`${city.name}, ${country.name}`); // e.g. "San Francisco, United States"
                }
            }
            // Case 2: Country only
            else if (country) {
                setFinalValue(country.name);
            }
        }
    }, [selectedCountryCode, selectedCityCode, countries, cities, mounted]);

    if (!mounted) return <div className={styles.input}>Loading...</div>;

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
                    <LocationInput defaultValue={profile.location} />
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

                {/* Resume Section has been moved to a standalone component */}
            </div>

            <div style={{ textAlign: 'right' }}>
                <button type="submit" className={styles.saveButton}>SAVE CHANGES</button>
            </div>
        </form>
    );
}
