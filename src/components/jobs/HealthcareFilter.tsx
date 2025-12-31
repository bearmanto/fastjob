'use client';

import { useRouter, useSearchParams } from 'next/navigation';
import { useEffect, useState } from 'react';
import styles from '@/app/page.module.css';

interface Certification {
    id: string;
    name: string;
    abbreviation: string | null;
    country_code: string;
}

export function HealthcareFilter() {
    const router = useRouter();
    const searchParams = useSearchParams();
    const currentCert = searchParams.get('certification') || '';
    const currentCountry = searchParams.get('country');

    const [certifications, setCertifications] = useState<Certification[]>([]);
    const [loading, setLoading] = useState(false);

    useEffect(() => {
        async function fetchCerts() {
            setLoading(true);
            try {
                // If a country is selected, filter certs by that country
                const url = currentCountry
                    ? `/api/healthcare/certifications?country=${currentCountry}`
                    : `/api/healthcare/certifications`; // Need to update API to support no-country param or fetch all

                // For now, if no country selected, we might want to hide or show generic ones.
                // Let's modify the API to allow fetching all if needed, or just handle client side 
                // But wait, the API I wrote requires country code. 
                // Let's just only show this filter if a country is selected OR update API.

                if (currentCountry) {
                    const res = await fetch(url);
                    if (res.ok) {
                        const data = await res.json();
                        setCertifications(data);
                    }
                } else {
                    setCertifications([]);
                }
            } catch (err) {
                console.error('Error fetching certs for filter:', err);
            } finally {
                setLoading(false);
            }
        }

        fetchCerts();
    }, [currentCountry]);

    const handleChange = (e: React.ChangeEvent<HTMLSelectElement>) => {
        const certId = e.target.value;
        const params = new URLSearchParams(searchParams.toString());

        if (certId) {
            params.set('certification', certId);
        } else {
            params.delete('certification');
        }

        router.push(`/?${params.toString()}`);
    };

    // Only show if we have certifications to filter by (implies country is selected)
    if (certifications.length === 0 && !loading) return null;

    return (
        <div className={styles.filterRow} style={{ marginLeft: '16px' }}>
            <label className={styles.filterLabel}>Certification:</label>
            <select
                value={currentCert}
                onChange={handleChange}
                className={styles.countrySelect}
                disabled={loading}
            >
                <option value="">Any</option>
                {certifications.map(c => (
                    <option key={c.id} value={c.id}>
                        {c.abbreviation || c.name}
                    </option>
                ))}
            </select>
        </div>
    );
}
