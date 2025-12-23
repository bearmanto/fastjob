import Link from 'next/link';
import styles from './TestHome.module.css';

export default function TestHomepage() {
    return (
        <div className={styles.container}>
            {/* Clean Header */}
            <header className={styles.header}>
                <div className={styles.logo}>
                    FAST<span className={styles.highlight}>JOB</span>
                </div>
                <p className={styles.tagline}>No fluff. Just jobs.</p>
            </header>

            <main className={styles.splitContent}>

                {/* HIRER SECTION (Left) */}
                <section className={`${styles.section} ${styles.hirerSection}`}>
                    <span className={styles.label}>For Employers</span>
                    <h1 className={styles.headline}>Post. Review. Hire.</h1>
                    <p className={styles.subtext}>
                        Skip the complexity. Post in 2 minutes, get real applicants, and hire—without the enterprise price tag.
                    </p>

                    <ul className={styles.uspList}>
                        <li><span className={styles.check}>✓</span> <strong>Dirt cheap</strong> — fraction of LinkedIn cost</li>
                        <li><span className={styles.check}>✓</span> <strong>Simple dashboard</strong> — review apps in one place</li>
                        <li><span className={styles.check}>✓</span> <strong>Verified badge</strong> — candidates trust you</li>
                        <li><span className={styles.check}>✓</span> <strong>No hidden fees</strong> — pay only when you post</li>
                    </ul>

                    <Link href="/post-job" className={`${styles.ctaButton} ${styles.hirerButton}`}>
                        Post a Job →
                    </Link>
                </section>

                {/* SEEKER SECTION (Right) */}
                <section className={`${styles.section} ${styles.seekerSection}`}>
                    <span className={styles.label}>For Job Seekers</span>
                    <h1 className={styles.headline}>Apply. Track. Land it.</h1>
                    <p className={styles.subtext}>
                        No more copy-pasting your resume into 50 forms. One profile. One click. Real jobs from verified employers.
                    </p>

                    <ul className={styles.uspList}>
                        <li><span className={styles.check}>✓</span> <strong>Verified employers only</strong> — no scams</li>
                        <li><span className={styles.check}>✓</span> <strong>One-click apply</strong> — your profile does the talking</li>
                        <li><span className={styles.check}>✓</span> <strong>Track your applications</strong> — know where you stand</li>
                        <li><span className={styles.check}>✓</span> <strong>Fresh listings daily</strong> — no stale postings</li>
                    </ul>

                    <Link href="/" className={`${styles.ctaButton} ${styles.seekerButton}`}>
                        Browse Jobs →
                    </Link>
                </section>

            </main>

            {/* Minimal Footer */}
            <footer className={styles.footer}>
                <div className={styles.footerLinks}>
                    <Link href="/login">Log In</Link>
                    <Link href="/register">Create Account</Link>
                </div>
                <div className={styles.copyright}>
                    © 2024 FastJob. No BS. Just jobs.
                </div>
            </footer>
        </div>
    );
}
