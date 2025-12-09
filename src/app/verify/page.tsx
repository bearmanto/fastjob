import Link from 'next/link';
import { verifyOtp } from '../login/actions';
import styles from '../login/Auth.module.css';

interface PageProps {
    searchParams: Promise<{ [key: string]: string | string[] | undefined }>;
}

export default async function VerifyPage({ searchParams }: PageProps) {
    const { email, error } = await searchParams;
    const emailStr = typeof email === 'string' ? email : '';
    const errorStr = typeof error === 'string' ? error : '';

    return (
        <div className={styles.authContainer}>
            <h1 className={styles.authTitle}>Verify Account</h1>

            {errorStr && (
                <div style={{ background: '#ffaabb', padding: '8px', marginBottom: '16px', border: '1px solid red', fontSize: '13px' }}>
                    Error: {errorStr}
                </div>
            )}

            <p style={{ marginBottom: '16px', fontSize: '13px' }}>
                We have sent a 6-digit code to <strong>{emailStr}</strong>. Please enter it below.
            </p>

            <form action={verifyOtp}>
                <input type="hidden" name="email" value={emailStr} />

                <div className={styles.inputGroup}>
                    <label className={styles.inputLabel}>Verification Code</label>
                    <input
                        type="text"
                        name="code"
                        className={styles.authInput}
                        placeholder="123456"
                        required
                        style={{ fontSize: '18px', letterSpacing: '4px', textAlign: 'center' }}
                    />
                </div>

                <button type="submit" className={styles.authButton}>
                    VERIFY & LOGIN
                </button>
            </form>

            <Link href="/register" className={styles.switchLink}>
                Wrong email? Register again.
            </Link>
        </div>
    );
}
