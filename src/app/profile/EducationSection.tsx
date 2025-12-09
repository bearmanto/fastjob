'use client'

import { addEducation, deleteEducation } from './actions';
import styles from './Profile.module.css';

interface Props {
    education: any[];
}

export function EducationSection({ education }: Props) {
    return (
        <section className={styles.section}>
            <div className={styles.sectionHeader}>
                Education
            </div>

            {/* List Existing */}
            {education.map((edu) => (
                <div key={edu.id} className={styles.listItem}>
                    <div className={styles.itemHeader}>
                        <span>{edu.school}</span>
                        <button
                            className={styles.deleteButton}
                            onClick={() => deleteEducation(edu.id)}
                        >
                            Delete
                        </button>
                    </div>
                    <div className={styles.itemSub}>
                        {edu.degree} {edu.field_of_study ? `in ${edu.field_of_study}` : ''}
                    </div>
                    <div className={styles.itemSub}>
                        {edu.start_date} - {edu.end_date || 'Present'}
                    </div>
                </div>
            ))}

            {/* Add New */}
            <details>
                <summary className={styles.addButton}>+ Add Education</summary>
                <form action={addEducation} className={styles.formGrid} style={{ marginTop: '16px', borderTop: '1px solid #eee', paddingTop: '16px' }}>
                    <div className={`${styles.inputGroup} ${styles.fullWidth}`}>
                        <label className={styles.label}>School / University *</label>
                        <input className={styles.input} type="text" name="school" required placeholder="e.g. University of Toronto" />
                    </div>
                    <div className={styles.inputGroup}>
                        <label className={styles.label}>Degree</label>
                        <input className={styles.input} type="text" name="degree" placeholder="e.g. Bachelor of Science" />
                    </div>
                    <div className={styles.inputGroup}>
                        <label className={styles.label}>Field of Study</label>
                        <input className={styles.input} type="text" name="field_of_study" placeholder="e.g. Civil Engineering" />
                    </div>

                    <div className={styles.inputGroup}>
                        <label className={styles.label}>Start Date</label>
                        <input className={styles.input} type="date" name="start_date" />
                    </div>
                    <div className={styles.inputGroup}>
                        <label className={styles.label}>End Date</label>
                        <input className={styles.input} type="date" name="end_date" />
                    </div>

                    <div className={styles.fullWidth} style={{ textAlign: 'right' }}>
                        <button type="submit" className={styles.saveButton}>ADD EDUCATION</button>
                    </div>
                </form>
            </details>
        </section>
    );
}
