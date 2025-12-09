import styles from './PostJob.module.css';

export default function PostJobPage() {
    return (
        <div className={styles.container}>
            <h1 className={styles.title}>Post a New Job Listing</h1>

            <form className={styles.formGrid}>

                <div className={styles.sectionHeader}>1. Job Identification</div>

                <label className={styles.label}>Job Title</label>
                <input type="text" className={styles.input} placeholder="e.g. Senior Mechanical Engineer" />

                <label className={styles.label}>Category</label>
                <select className={styles.input}>
                    <option>Select Category...</option>
                    <option>Engineering & Technical</option>
                    <option>Manufacturing & Operations</option>
                    <option>Information Technology</option>
                </select>

                <label className={styles.label}>Location</label>
                <input type="text" className={styles.input} placeholder="City, Region" />

                <div className={styles.sectionHeader}>2. Compensation & Specifications</div>

                <label className={styles.label}>Salary Range (Monthly)</label>
                <div style={{ display: 'flex', gap: '8px', alignItems: 'center' }}>
                    <span style={{ fontSize: '13px' }}>IDR</span>
                    <input type="number" className={styles.input} style={{ width: '120px' }} placeholder="Min" />
                    <span style={{ fontSize: '13px' }}>-</span>
                    <input type="number" className={styles.input} style={{ width: '120px' }} placeholder="Max" />
                </div>

                <label className={styles.label}>Experience Level</label>
                <select className={styles.input}>
                    <option>Entry Level</option>
                    <option>Mid Level (2-5 yrs)</option>
                    <option>Senior (5+ yrs)</option>
                    <option>Managerial</option>
                </select>

                <div className={styles.sectionHeader}>3. Description & Requirements</div>

                <label className={styles.label} style={{ alignSelf: 'start', marginTop: '8px' }}>Job Description</label>
                <textarea className={styles.textarea} placeholder="Describe the role responsibilities..."></textarea>

                <label className={styles.label} style={{ alignSelf: 'start', marginTop: '8px' }}>Requirements</label>
                <textarea className={styles.textarea} placeholder="List required skills and qualifications..."></textarea>

                <div className={styles.submitRow}>
                    <button type="submit" className={styles.submitButton}>
                        SUBMIT LISTING
                    </button>
                </div>

            </form>
        </div>
    );
}
