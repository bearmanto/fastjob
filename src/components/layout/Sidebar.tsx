import Link from 'next/link';
import styles from './Sidebar.module.css';

export function Sidebar() {
    return (
        <aside className={styles.sidebar}>
            <div className={styles.section}>
                <h3 className={styles.header}>Job Type</h3>
                <ul className={styles.filterList}>
                    <li><label><input type="checkbox" /> Full Time</label></li>
                    <li><label><input type="checkbox" /> Contract</label></li>
                    <li><label><input type="checkbox" /> Remote</label></li>
                </ul>
            </div>

            <div className={styles.section}>
                <h3 className={styles.header}>Location</h3>
                <ul className={styles.filterList}>
                    <li><Link href="?loc=jkt">Jakarta (120)</Link></li>
                    <li><Link href="?loc=sby">Surabaya (45)</Link></li>
                    <li><Link href="?loc=bdg">Bandung (30)</Link></li>
                </ul>
            </div>

            <div className={styles.section}>
                <h3 className={styles.header}>Salary Range</h3>
                <ul className={styles.filterList}>
                    <li><Link href="?sal=10">Under 10mn</Link></li>
                    <li><Link href="?sal=10-20">10mn - 20mn</Link></li>
                    <li><Link href="?sal=20-50">20mn - 50mn</Link></li>
                    <li><Link href="?sal=50">50mn+</Link></li>
                </ul>
            </div>
        </aside>
    );
}
