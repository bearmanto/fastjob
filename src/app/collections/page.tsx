import Link from 'next/link';
import { COLLECTIONS } from '@/data/collections';
import { Sidebar } from '@/components/layout/Sidebar';
import { Breadcrumbs } from '@/components/ui/Breadcrumbs';
import styles from './Collections.module.css';

export default function CollectionsPage() {
    return (
        <div className={styles.pageContainer}>
            <Sidebar />

            <div className={styles.content}>
                <Breadcrumbs
                    items={[
                        { label: 'Home', href: '/' },
                        { label: 'Collections' }
                    ]}
                />

                <div className={styles.header}>
                    <h1 className={styles.title}>Browse Collections</h1>
                    <p className={styles.subtitle}>
                        Curated lists of jobs tailored to your career goals and preferences.
                    </p>
                </div>

                <div className={styles.grid}>
                    {COLLECTIONS.map((collection) => (
                        <Link
                            key={collection.slug}
                            href={`/collection/${collection.slug}`}
                            className={styles.card}
                        >
                            <div className={styles.cardHeader}>
                                <span className={styles.icon}>{collection.icon}</span>
                                <h2 className={styles.cardTitle}>{collection.title}</h2>
                            </div>
                            <p className={styles.cardDescription}>{collection.description}</p>
                            <div className={styles.cardFooter}>
                                View Jobs &rarr;
                            </div>
                        </Link>
                    ))}
                </div>
            </div>
        </div>
    );
}
