'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import styles from './Header.module.css';

export function SearchForm() {
    const [query, setQuery] = useState('');
    const router = useRouter();

    const handleSubmit = (e: React.FormEvent) => {
        e.preventDefault();
        if (query.trim()) {
            router.push(`/?q=${encodeURIComponent(query.trim())}`);
        } else {
            router.push('/');
        }
    };

    return (
        <form onSubmit={handleSubmit} className={styles.searchContainer}>
            <input
                type="text"
                value={query}
                onChange={(e) => setQuery(e.target.value)}
                placeholder="Search for jobs, companies, skills..."
                className={styles.searchInput}
            />
            <button type="submit" className={styles.searchButton}>GO</button>
        </form>
    );
}
