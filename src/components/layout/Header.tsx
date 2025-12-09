import Link from 'next/link';
import { createClient } from '@/utils/supabase/server';
import { signout } from '@/app/login/actions';
import styles from './Header.module.css';

export async function Header() {
    const supabase = await createClient();
    const { data: { user } } = await supabase.auth.getUser();

    // Fetch role if user exists
    let role = null;
    if (user) {
        const { data: profile } = await supabase
            .from('profiles')
            .select('role')
            .eq('id', user.id)
            .single();
        role = profile?.role;
    }

    const isHirer = role === 'hirer';

    return (
        <header className={styles.header}>
            <div className={styles.topRow}>
                <div className="container" style={{ display: 'flex', justifyContent: 'flex-end', width: '100%', alignItems: 'center' }}>
                    {/* Jargon removed as requested */}
                    <div className={styles.utilityLinks}>
                        {user ? (
                            <>
                                {/* Both roles go to Dashboard now. Dashboard will link to Profile for Seekers. */}
                                <Link href="/dashboard">Dashboard</Link>
                                <span className={styles.divider}>|</span>
                                <form action={signout} style={{ display: 'inline' }}>
                                    <button type="submit" style={{
                                        background: 'none',
                                        border: 'none',
                                        color: 'var(--hunter-green)',
                                        fontWeight: 'bold',
                                        cursor: 'pointer',
                                        padding: 0,
                                        fontSize: 'inherit'
                                    }}>
                                        Logout
                                    </button>
                                </form>
                            </>
                        ) : (
                            <>
                                <Link href="/login">Log in</Link>
                                <span className={styles.divider}>|</span>
                                <Link href="/register">Register</Link>
                            </>
                        )}
                    </div>
                </div>
            </div>

            <div className={styles.mainRow}>
                <div className={`container ${styles.innerMainRow}`}>
                    <Link href="/" className={styles.logo}>
                        FAST<span className={styles.logoHighlight}>JOB</span>
                    </Link>

                    <div className={styles.searchContainer}>
                        <input
                            type="text"
                            placeholder="Search for jobs, companies, skills..."
                            className={styles.searchInput}
                        />
                        <button className={styles.searchButton}>GO</button>
                    </div>

                    <div className={styles.postJob}>
                        {/* Only show Post Job if NOT logged in, or if logged in as HIRER */}
                        {(!user || isHirer) && (
                            <Link href="/post-job" className={styles.postButton}>
                                POST A JOB
                            </Link>
                        )}
                    </div>
                </div>
            </div>

            <div className={styles.navBar}>
                <div className="container" style={{ display: 'flex', gap: '20px', width: '100%' }}>
                    <Link href="/">All Jobs</Link>
                    <Link href="/categories">Browse Categories</Link>
                    {/* <Link href="/companies">Companies</Link> */}
                </div>
            </div>
        </header>
    );
}
