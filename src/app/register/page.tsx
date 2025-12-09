'use client'

import { useState } from 'react';
import Link from 'next/link';
import { signup } from '../login/actions';
import styles from '../login/Auth.module.css';

export default function RegisterPage() {
    return (
        <div className={styles.authContainer}>
            <h1 className={styles.authTitle}>Create Account</h1>
            <form action={signup}>
                <ClientFormContent />
            </form>
            <Link href="/login" className={styles.switchLink}>
                Already registered? Log in here.
            </Link>
        </div>
    );
}

function ClientFormContent() {
    const [role, setRole] = useState('seeker');

    return (
        <>
            <div className={styles.inputGroup}>
                <label className={styles.inputLabel}>I am a...</label>
                <select
                    name="role"
                    className={styles.authInput}
                    value={role}
                    onChange={(e) => setRole(e.target.value)}
                >
                    <option value="seeker">Job Seeker</option>
                    <option value="hirer">Company / Employer</option>
                </select>
            </div>

            {role === 'hirer' ? (
                <>
                    <div className={styles.inputGroup}>
                        <label className={styles.inputLabel}>Your Full Name</label>
                        <input type="text" name="name" className={styles.authInput} required placeholder="e.g. John Doe" />
                    </div>
                    <div className={styles.inputGroup}>
                        <label className={styles.inputLabel}>Company Name</label>
                        <input type="text" name="company_name" className={styles.authInput} required placeholder="e.g. Acme Corp" />
                    </div>
                </>
            ) : (
                <div className={styles.inputGroup}>
                    <label className={styles.inputLabel}>Full Name</label>
                    <input type="text" name="name" className={styles.authInput} required placeholder="e.g. Jane Smith" />
                </div>
            )}

            <div className={styles.inputGroup}>
                <label className={styles.inputLabel}>
                    {role === 'hirer' ? 'Company Email Address' : 'Email Address'}
                </label>
                <input type="email" name="email" className={styles.authInput} required />
            </div>
            <div className={styles.inputGroup}>
                <label className={styles.inputLabel}>Password</label>
                <input type="password" name="password" className={styles.authInput} required />
            </div>
            <button type="submit" className={styles.authButton}>
                REGISTER
            </button>
        </>
    );
}

