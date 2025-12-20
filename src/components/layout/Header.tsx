import Link from 'next/link';
import { createClient } from '@/utils/supabase/server';
import { signout } from '@/app/login/actions';
import styles from './Header.module.css';
import { NavLink } from './NavLink';

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

                    <div className={styles.rightActions}>
                        {user ? (
                            <div className={styles.userNav}>
                                <Link href="/dashboard" className={styles.dashboardLink}>
                                    Dashboard
                                </Link>
                                <form action={signout} className={styles.inlineForm}>
                                    <button type="submit" className={styles.logoutButton}>
                                        Logout
                                    </button>
                                </form>
                            </div>
                        ) : (
                            <div className={styles.authLinks}>
                                <Link href="/login">Log in</Link>
                                <span className={styles.divider}>/</span>
                                <Link href="/register">Register</Link>
                            </div>
                        )}

                        {(!user || isHirer) && (
                            <Link href="/post-job" className={styles.postButton}>
                                POST A JOB
                            </Link>
                        )}
                    </div>
                </div>
            </div>

            <div className={styles.navBar}>
                <div className={`container ${styles.navContainer}`}>
                    <NavLink href="/">All Jobs</NavLink>
                    <NavLink href="/collections">Collections</NavLink>
                    {/* <NavLink href="/companies">Companies</NavLink> */}
                </div>
            </div>
        </header>
    );
}
