'use client';

import { useState, useRef, useEffect, useActionState } from 'react';
import styles from './PostJob.module.css';
import { JOB_TYPES, WORKPLACE_TYPES, COMMON_SKILLS, COMMON_BENEFITS, INDUSTRIES, LOCATIONS } from '@/data/constants';
import { createJob } from './actions';

// Helper for multi-select dropdown
function MultiSelect({
    options,
    selected,
    onChange,
    placeholder
}: {
    options: string[],
    selected: string[],
    onChange: (s: string[]) => void,
    placeholder: string
}) {
    const [isOpen, setIsOpen] = useState(false);
    const [search, setSearch] = useState('');
    const wrapperRef = useRef<HTMLDivElement>(null);

    useEffect(() => {
        function handleClickOutside(event: MouseEvent) {
            if (wrapperRef.current && !wrapperRef.current.contains(event.target as Node)) {
                setIsOpen(false);
            }
        }
        document.addEventListener("mousedown", handleClickOutside);
        return () => document.removeEventListener("mousedown", handleClickOutside);
    }, []);

    const filteredOptions = options.filter(o =>
        !selected.includes(o) &&
        o.toLowerCase().includes(search.toLowerCase())
    );

    const toggleOption = (option: string) => {
        if (selected.includes(option)) {
            onChange(selected.filter(s => s !== option));
        } else {
            onChange([...selected, option]);
            setSearch(''); // Reset search after add
        }
    };

    return (
        <div ref={wrapperRef} className={styles.multiSelectWrapper}>
            {/* Selected Chips */}
            <div className={styles.chipContainer}>
                {selected.map(item => (
                    <span key={item} className={styles.chip}>
                        {item}
                        <button type="button" onClick={() => toggleOption(item)} className={styles.chipRemove}>×</button>
                    </span>
                ))}
            </div>

            {/* Input / Dropdown Trigger */}
            <input
                type="text"
                className={styles.input}
                placeholder={selected.length === 0 ? placeholder : "Add more..."}
                value={search}
                onChange={e => setSearch(e.target.value)}
                onFocus={() => setIsOpen(true)}
            />

            {/* Dropdown Menu */}
            {isOpen && (
                <div className={styles.dropdownMenu}>
                    {filteredOptions.length > 0 ? filteredOptions.map(option => (
                        <div
                            key={option}
                            onClick={() => toggleOption(option)}
                            className={styles.dropdownOption}
                        >
                            {option}
                        </div>
                    )) : (
                        <div className={styles.dropdownEmpty}>
                            No matching options found.
                        </div>
                    )}
                </div>
            )}
        </div>
    );
}

export default function PostJobPage() {
    const [selectedSkills, setSelectedSkills] = useState<string[]>([]);
    const [selectedBenefits, setSelectedBenefits] = useState<string[]>([]);
    const [country, setCountry] = useState('');
    const [city, setCity] = useState(''); // Corrected line: removed typo

    // Server Action State - Updated for React 19/Next 15
    const [state, formAction] = useActionState(createJob, null);

    const toggleItem = (item: string, list: string[], setList: (l: string[]) => void) => {
        if (list.includes(item)) {
            setList(list.filter(i => i !== item));
        } else {
            setList([...list, item]);
        }
    };

    return (
        <div className={styles.container}>
            <h1 className={styles.title}>Post a New Job Listing</h1>

            <form action={formAction} className={styles.formGrid}>

                {/* Error Message */}
                {state?.error && (
                    <div className={styles.errorMessage}>
                        ⚠️ {state.error}
                    </div>
                )}

                <div className={styles.sectionHeader}>1. Job Identification</div>

                <label className={styles.label}>Job Title</label>
                <input name="title" type="text" className={styles.input} placeholder="e.g. Senior Mechanical Engineer" required />


                <label className={styles.label}>Category</label>
                <select name="category" className={styles.input} required>
                    <option value="">Select Category...</option>
                    {INDUSTRIES.map(i => <option key={i} value={i}>{i}</option>)}
                </select>

                <label className={styles.label}>Workplace Type</label>
                <select name="workplace_type" className={styles.input} required>
                    {WORKPLACE_TYPES.map(t => <option key={t.value} value={t.value}>{t.label}</option>)}
                </select>

                <label className={styles.label}>Job Type</label>
                <select name="job_type" className={styles.input} required>
                    {JOB_TYPES.map(t => <option key={t.value} value={t.value}>{t.label}</option>)}
                </select>

                <label className={styles.label}>Location</label>
                <div className={styles.locationGrid}>
                    <select
                        name="country"
                        className={styles.input}
                        value={country}
                        onChange={e => { setCountry(e.target.value); setCity(''); }}
                        required
                    >
                        <option value="">Select Country...</option>
                        {Object.keys(LOCATIONS).map(c => <option key={c} value={c}>{c}</option>)}
                    </select>

                    <select
                        name="city"
                        className={styles.input}
                        value={city}
                        onChange={e => setCity(e.target.value)}
                        disabled={!country}
                        required
                    >
                        <option value="">Select City...</option>
                        {country && LOCATIONS[country]?.map(c => <option key={c} value={c}>{c}</option>)}
                    </select>
                </div>
                <input type="hidden" name="location" value={country && city ? `${city}, ${country}` : ''} />

                <div className={styles.sectionHeader}>2. Compensation & Specifications</div>

                <label className={styles.label}>Salary Range (Monthly)</label>
                <div className={styles.salaryRow}>
                    <span className={styles.salaryLabel}>IDR</span>
                    <input name="salary_min" type="number" className={`${styles.input} ${styles.salaryInput}`} placeholder="Min" />
                    <span className={styles.salaryLabel}>-</span>
                    <input name="salary_max" type="number" className={`${styles.input} ${styles.salaryInput}`} placeholder="Max" />
                </div>

                <label className={styles.label}>Experience Level</label>
                <select name="experience_level" className={styles.input}>
                    <option>Entry Level</option>
                    <option>Mid Level (2-5 yrs)</option>
                    <option>Senior (5+ yrs)</option>
                    <option>Managerial</option>
                </select>

                <div className={styles.sectionHeader}>3. Requirements & Benefits</div>

                <label className={`${styles.label} ${styles.labelTop}`}>
                    Required Skills
                    <div className={styles.helpText}>Type to search and select</div>
                </label>

                {/* Replaced Checkbox Grid with MultiSelect */}
                <MultiSelect
                    options={COMMON_SKILLS}
                    selected={selectedSkills}
                    onChange={setSelectedSkills}
                    placeholder="e.g. AutoCAD, SAP, Forklift..."
                />

                {/* Hidden input to submit skills */}
                <input type="hidden" name="skills" value={JSON.stringify(selectedSkills)} />

                <label className={`${styles.label} ${styles.labelTopLarge}`}>
                    Benefits Offered
                    <div className={styles.helpText}>Type to search and select</div>
                </label>

                <div className={styles.benefitsGrid}>
                    {COMMON_BENEFITS.map(benefit => (
                        <label key={benefit} className={styles.benefitLabel}>
                            <input
                                type="checkbox"
                                checked={selectedBenefits.includes(benefit)}
                                onChange={() => toggleItem(benefit, selectedBenefits, setSelectedBenefits)}
                            />
                            {benefit}
                        </label>
                    ))}
                </div>
                <input type="hidden" name="benefits" value={JSON.stringify(selectedBenefits)} />

                <label className={`${styles.label} ${styles.labelTopLarge}`}>Requirements</label>
                <textarea name="requirements" className={styles.textarea} placeholder="List specific requirements..." rows={4}></textarea>

                <label className={`${styles.label} ${styles.labelTopLarge}`}>Job Description</label>
                <textarea name="description" className={styles.textarea} placeholder="Describe the role responsibilities..." rows={6}></textarea>

                <div className={styles.sectionHeader}>4. Listing Options</div>

                <label className={styles.label}>
                    Auto-Close Date (Optional)
                    <div className={styles.helpText}>Job will be automatically closed on this date</div>
                </label>
                <input
                    name="closes_at"
                    type="date"
                    className={`${styles.input} ${styles.closesAtInput}`}
                    min={new Date().toISOString().split('T')[0]}
                />

                <div className={styles.submitRow}>
                    <button type="submit" className={styles.submitButton}>
                        SUBMIT LISTING
                    </button>
                </div>

            </form>
        </div>
    );
}
