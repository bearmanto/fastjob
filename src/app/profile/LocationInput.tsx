'use client';

// Dynamic import component: heavy dependency on country-state-city
import { useState, useMemo } from 'react';
import { Country, City, ICountry, ICity } from 'country-state-city';
import styles from './Profile.module.css';

export default function LocationInput({ defaultValue }: { defaultValue?: string }) {
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
