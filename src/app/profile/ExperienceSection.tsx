'use client'

import { addExperience, deleteExperience } from './actions';
import styles from './Profile.module.css';

interface Props {
    experiences: any[];
}

export function ExperienceSection({ experiences }: Props) {
    return (
        <section className={styles.section}>
            <div className={styles.sectionHeader}>
                Work Experience
            </div>

            {/* List Existing */}
            {experiences.map((exp) => (
                <div key={exp.id} className={styles.listItem}>
                    <div className={styles.itemHeader}>
                        <span>{exp.title} at {exp.company}</span>
                        <button
                            className={styles.deleteButton}
                            onClick={() => deleteExperience(exp.id)}
                        >
                            Delete
                        </button>
                    </div>
                    <div className={styles.itemSub}>
                        {exp.start_date} - {exp.is_current ? 'Present' : exp.end_date} | {exp.location}
                    </div>
                    {exp.description && (
                        <div style={{ marginTop: '4px', fontSize: '12px' }}>{exp.description}</div>
                    )}
                </div>
            ))}

            {/* Add New */}
            <details>
                <summary className={styles.addButton}>+ Add Position</summary>
                <form action={addExperience} className={styles.formGrid} style={{ marginTop: '16px', borderTop: '1px solid #eee', paddingTop: '16px' }}>
                    <div className={styles.inputGroup}>
                        <label className={styles.label}>Job Title *</label>
                        <input className={styles.input} type="text" name="title" required placeholder="e.g. Mechanical Engineer" />
                    </div>
                    <div className={styles.inputGroup}>
                        <label className={styles.label}>Company *</label>
                        <input className={styles.input} type="text" name="company" required placeholder="e.g. Acme Corp" />
                    </div>
                    <div className={styles.inputGroup}>
                        <label className={styles.label}>Location</label>
                        <input className={styles.input} type="text" name="location" placeholder="City, Country" />
                    </div>
                    <div className={styles.inputGroup}>
                        {/* Empty for grid alignment or use for is_current */}
                        <label className={styles.label}>
                            <input type="checkbox" name="is_current" /> This is my current role
                        </label>
                    </div>

                    <div className={styles.inputGroup}>
                        <label className={styles.label}>Start Date</label>
                        <input className={styles.input} type="date" name="start_date" required />
                    </div>
                    <div className={styles.inputGroup}>
                        <label className={styles.label}>End Date</label>
                        <input className={styles.input} type="date" name="end_date" />
                    </div>

                    <div className={`${styles.inputGroup} ${styles.fullWidth}`}>
                        <label className={styles.label}>Description</label>
                        <textarea className={styles.textarea} name="description" placeholder="Describe your responsibilities..." />
                    </div>

                    <div className={styles.fullWidth} style={{ textAlign: 'right' }}>
                        <button type="submit" className={styles.saveButton}>ADD EXPERIENCE</button>
                    </div>
                </form>
            </details>
        </section>
    );
}
