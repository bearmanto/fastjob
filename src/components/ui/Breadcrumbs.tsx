import Link from 'next/link';
import styles from './Breadcrumbs.module.css';

export interface BreadcrumbItem {
    label: string;
    href?: string;
}

interface BreadcrumbsProps {
    items: BreadcrumbItem[];
}

export function Breadcrumbs({ items }: BreadcrumbsProps) {
    return (
        <nav className={styles.breadcrumbs} aria-label="Breadcrumb">
            {items.map((item, index) => {
                const isLast = index === items.length - 1;

                return (
                    <span key={index} className={styles.item}>
                        {item.href && !isLast ? (
                            <Link href={item.href} className={styles.link}>{item.label}</Link>
                        ) : (
                            <span className={styles.label}>{item.label}</span>
                        )}
                        {!isLast && <span className={styles.separator}>&gt;</span>}
                    </span>
                );
            })}
        </nav>
    );
}
