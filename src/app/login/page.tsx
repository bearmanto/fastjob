import Link from 'next/link';
import { login } from './actions';
import styles from './Auth.module.css';

export default function LoginPage() {
    return (
        <div className={styles.authContainer}>
            <h1 className={styles.authTitle}>Log In</h1>
            <form action={login}>
                <div className={styles.inputGroup}>
                    <label className={styles.inputLabel}>Email Address</label>
                    <input type="email" name="email" className={styles.authInput} required />
                </div>
                <div className={styles.inputGroup}>
                    <label className={styles.inputLabel}>Password</label>
                    <input type="password" name="password" className={styles.authInput} required />
                </div>
                <button type="submit" className={styles.authButton}>
                    SECURE LOGIN
                </button>
            </form>
            <Link href="/register" className={styles.switchLink}>
                Don&apos;t have an account? Register here.
            </Link>
        </div>
    );
}
