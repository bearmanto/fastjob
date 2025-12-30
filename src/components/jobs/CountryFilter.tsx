'use client';

import { useRouter, useSearchParams } from 'next/navigation';
import { COUNTRIES } from '@/data/countries';
import styles from '@/app/page.module.css';

export function CountryFilter() {
    const router = useRouter();
    const searchParams = useSearchParams();
    const currentCountry = searchParams.get('country') || '';

    const handleChange = (e: React.ChangeEvent<HTMLSelectElement>) => {
        const country = e.target.value;
        const params = new URLSearchParams(searchParams.toString());

        if (country) {
            params.set('country', country);
        } else {
            params.delete('country');
        }

        router.push(`/?${params.toString()}`);
    };

    return (
        <div className={styles.filterRow}>
            <label className={styles.filterLabel}>Hiring in:</label>
            <select
                value={currentCountry}
                onChange={handleChange}
                className={styles.countrySelect}
            >
                <option value="">All Countries</option>
                {COUNTRIES.map(c => (
                    <option key={c.code} value={c.code}>
                        {c.flag} {c.name}
                    </option>
                ))}
            </select>
        </div>
    );
}
