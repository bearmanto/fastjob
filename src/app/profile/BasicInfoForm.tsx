'use client'

import { updateBasicProfile } from './actions';
import styles from './Profile.module.css';

interface Props {
    profile: any;
    resumeDownloadUrl?: string | null;
}

export function BasicInfoForm({ profile, resumeDownloadUrl }: Props) {
    return (
        <form action={updateBasicProfile} className={styles.section}>
            <div className={styles.sectionHeader}>
                Basic Information
            </div>

            <div className={styles.formGrid}>
                {/* ... fields ... */}
                <div className={styles.inputGroup}>
                    <label className={styles.label}>Full Name</label>
                    <input
                        className={styles.input}
                        type="text"
                        name="full_name"
                        defaultValue={profile.full_name || ''}
                        placeholder="Your Full Name"
                    />
                </div>

                <div className={styles.inputGroup}>
                    <label className={styles.label}>Professional Headline</label>
                    <input
                        className={styles.input}
                        type="text"
                        name="headline"
                        defaultValue={profile.headline || ''}
                        placeholder="e.g. Senior Mechanical Engineer"
                    />
                </div>

                <div className={`${styles.inputGroup} ${styles.fullWidth}`}>
                    <label className={styles.label}>Professional Summary</label>
                    <textarea
                        className={styles.textarea}
                        name="summary"
                        defaultValue={profile.summary || ''}
                        placeholder="Brief overview of your experience and goals..."
                    />
                </div>

                <div className={styles.inputGroup}>
                    <label className={styles.label}>Phone Number</label>
                    <input
                        className={styles.input}
                        type="tel"
                        name="phone"
                        defaultValue={profile.phone || ''}
                    />
                </div>

                <div className={styles.inputGroup}>
                    <label className={styles.label}>LinkedIn URL</label>
                    <input
                        className={styles.input}
                        type="text"
                        name="linkedin"
                        defaultValue={profile.linkedin || ''}
                    />
                </div>

                <div className={`${styles.inputGroup} ${styles.fullWidth}`}>
                    <label className={styles.label}>Resume (PDF, Max 5MB)</label>
                    <input
                        className={styles.fileInput}
                        type="file"
                        name="resume"
                        accept="application/pdf"
                    />
                    {profile.resume_url && (
                        <div style={{ marginTop: '8px' }}>
                            <span style={{ fontSize: '11px', color: '#666' }}>Current: </span>
                            {resumeDownloadUrl ? (
                                <a
                                    href={resumeDownloadUrl}
                                    target="_blank"
                                    rel="noopener noreferrer"
                                    className={styles.resumeLink}
                                    style={{ textDecoration: 'underline', cursor: 'pointer' }}
                                >
                                    Download Uploaded Resume
                                </a>
                            ) : (
                                <span className={styles.resumeLink}>Uploaded Resume (Processing...)</span>
                            )}
                            <input type="hidden" name="current_resume_url" value={profile.resume_url} />
                        </div>
                    )}
                </div>
            </div>

            <div style={{ textAlign: 'right' }}>
                <button type="submit" className={styles.saveButton}>SAVE CHANGES</button>
            </div>
        </form>
    );
}
