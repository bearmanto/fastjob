import Link from 'next/link';
import { CATEGORIES } from '@/data/mockData';
import styles from '../page.module.css'; // Reuse homepage styles or create new ones

export default function CategoriesPage() {
    return (
        <div className={styles.container}>
            <h1 className={styles.pageTitle}>Job Categories</h1>
            <p className={styles.introText}>
                Select a category to browse open positions.
            </p>

            <div className={styles.categoryGrid}>
                {CATEGORIES.map((cat) => (
                    <div key={cat.id} className={styles.categoryCard}>
                        <div className={styles.categoryHeader}>
                            {cat.icon && <span className={styles.icon}>{cat.icon}</span>}
                            <Link href={`/category/${cat.slug}`} className={styles.categoryLink}>
                                {cat.name}
                            </Link>
                        </div>
                        <ul className={styles.subList}>
                            {cat.subcategories.map((sub) => (
                                <li key={sub}>
                                    <Link href={`/category/${cat.slug}?sub=${sub}`}>{sub}</Link>
                                </li>
                            ))}
                        </ul>
                    </div>
                ))}
            </div>
        </div>
    );
}
