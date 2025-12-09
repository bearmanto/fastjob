import { notFound } from 'next/navigation';
import { Sidebar } from '@/components/layout/Sidebar';
import { Breadcrumbs } from '@/components/ui/Breadcrumbs';
import { CATEGORIES, JOBS, Job } from '@/data/mockData';
import styles from './Category.module.css';
import Link from 'next/link';

interface PageProps {
    params: Promise<{ slug: string }>;
}

export default async function CategoryPage({ params }: PageProps) {
    const { slug } = await params;
    const category = CATEGORIES.find((c) => c.slug === slug);

    if (!category) {
        notFound();
    }

    // Filter jobs (logic could be more complex later)
    const jobs = JOBS.filter(j => j.categorySlug === slug);

    return (
        <div className={styles.pageContainer}>
            <Sidebar />

            <div className={styles.content}>
                <Breadcrumbs
                    items={[
                        { label: 'Home', href: '/' },
                        { label: category.name }
                    ]}
                />

                <h1 className={styles.categoryTitle}>
                    {category.icon} {category.name}
                </h1>

                <table className={styles.jobTable}>
                    <thead>
                        <tr>
                            <th style={{ width: '40%' }}>Role Description</th>
                            <th style={{ width: '25%' }}>Company</th>
                            <th style={{ width: '15%' }}>Location</th>
                            <th style={{ width: '10%' }}>Salary</th>
                            <th style={{ width: '10%' }}>Posted</th>
                        </tr>
                    </thead>
                    <tbody>
                        {jobs.length > 0 ? (
                            jobs.map((job) => (
                                <tr key={job.id}>
                                    <td>
                                        <Link href={`/job/${job.id}`} className={styles.jobTitle}>
                                            {job.title}
                                        </Link>
                                        <div className={styles.jobSnippet}>{job.descriptionSnippet}</div>
                                    </td>
                                    <td>{job.company}</td>
                                    <td>{job.location}</td>
                                    <td>{job.salary}</td>
                                    <td>{job.postedAt}</td>
                                </tr>
                            ))
                        ) : (
                            <tr>
                                <td colSpan={5} style={{ padding: '20px', textAlign: 'center', fontStyle: 'italic' }}>
                                    No open positions in this category at the moment.
                                </td>
                            </tr>
                        )}
                    </tbody>
                </table>
            </div>
        </div>
    );
}
