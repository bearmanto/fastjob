import Link from 'next/link';
import { createClient } from '@/utils/supabase/server';
import { signout } from '@/app/login/actions';
import styles from './Header.module.css';
import { NavLink } from './NavLink';
import { SearchForm } from './SearchForm';
import { GoldBadge } from '@/components/ui/GoldBadge';
import { getCompanyPlan, isPro } from '@/lib/subscription';

export async function Header() {
    const supabase = await createClient();
    const { data: { user } } = await supabase.auth.getUser();

    // Fetch role and plan if user exists
    let role = null;
    let showGoldBadge = false;

    if (user) {
        // Get Profile
        const { data: profile } = await supabase
            .from('profiles')
            .select('role')
            .eq('id', user.id)
            .single();
        role = profile?.role;

        // If Hirer, Get Company (Plan fetching moved to Dashboard)
        if (role === 'hirer') {
            /* 
               Gold badge moved to Dashboard page as per user request.
               Logic removed from global header.
            */
        }
    }

    const isHirer = role === 'hirer';

    return (
        <header className={styles.header}>
            <div className={styles.mainRow}>
                <div className={`container ${styles.innerMainRow}`}>
                    <Link href="/" className={styles.logo}>
                        FAST<span className={styles.logoHighlight}>JOB</span>
                    </Link>

                    <SearchForm />

                    <div className={styles.rightActions}>
                        {user ? (
                            <div className={styles.userNav}>
                                {/* GoldBadge moved to Dashboard */}

                                <Link href="/dashboard" className={styles.dashboardLink}>
                                    Dashboard
                                </Link>

                                <span className={styles.divider}>/</span>

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
                    <NavLink href="/?collection=fresh">Fresh ⚡</NavLink>
                    <NavLink href="/?collection=remote">Remote 🏠</NavLink>
                    <NavLink href="/?collection=senior">Senior 💼</NavLink>
                </div>
            </div>
        </header>
    );
}
