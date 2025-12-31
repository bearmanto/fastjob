'use client';

import { useState, useRef, useEffect, useActionState, useCallback } from 'react';
import styles from './PostJob.module.css';
import { JOB_TYPES, WORKPLACE_TYPES, COMMON_SKILLS, COMMON_BENEFITS, INDUSTRIES, CURRENCIES, SALARY_PERIODS } from '@/data/constants';
import { COUNTRIES } from '@/data/countries';
import { createJob } from './actions';
import { HealthcareCertificationSelect } from './HealthcareCertificationSelect';

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
    const [countryCode, setCountryCode] = useState('');
    const [city, setCity] = useState('');
    const [isRemote, setIsRemote] = useState(false);
    const [healthcareCerts, setHealthcareCerts] = useState<{
        certification_id: string;
        name: string;
        abbreviation: string | null;
        is_required: boolean;
    }[]>([]);

    // Server Action State - Updated for React 19/Next 15
    const [state, formAction] = useActionState(createJob, null);

    const toggleItem = (item: string, list: string[], setList: (l: string[]) => void) => {
        if (list.includes(item)) {
            setList(list.filter(i => i !== item));
        } else {
            setList([...list, item]);
        }
    };

    const handleHealthcareCertsChange = useCallback((certs: typeof healthcareCerts) => {
        setHealthcareCerts(certs);
    }, []);

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

                <label className={styles.label}>Hiring Location</label>
                <div className={styles.locationGrid}>
                    <select
                        name="country_code"
                        className={styles.input}
                        value={countryCode}
                        onChange={e => setCountryCode(e.target.value)}
                        required
                    >
                        <option value="">Select Country...</option>
                        {COUNTRIES.map(c => (
                            <option key={c.code} value={c.code}>{c.flag} {c.name}</option>
                        ))}
                    </select>

                    <input
                        name="location"
                        type="text"
                        className={styles.input}
                        value={city}
                        onChange={e => setCity(e.target.value)}
                        placeholder="City / Region (e.g., London, NYC)"
                    />
                </div>

                <label className={styles.checkboxLabel}>
                    <input
                        type="checkbox"
                        name="is_remote"
                        checked={isRemote}
                        onChange={e => setIsRemote(e.target.checked)}
                    />
                    Remote / Work from anywhere
                </label>

                <div className={styles.eligibilitySection}>
                    <label className={styles.label}>Applicant Eligibility</label>
                    <select name="accepts_worldwide" className={styles.input} defaultValue="local">
                        <option value="local">Local candidates only (must be eligible to work in selected country)</option>
                        <option value="worldwide">Worldwide applicants welcome (visa sponsorship available)</option>
                    </select>
                    <p className={styles.helpText}>
                        Local-only jobs will only accept applications from candidates located in the job&apos;s country.
                    </p>
                </div>

                <div className={styles.sectionHeader}>2. Compensation & Specifications</div>

                <label className={styles.label}>Payment Terms</label>
                <div className={styles.row}>
                    <div style={{ flex: 1 }}>
                        <select name="salary_currency" className={styles.input} defaultValue="USD">
                            {CURRENCIES.map(c => <option key={c.value} value={c.value}>{c.label}</option>)}
                        </select>
                    </div>
                    <div style={{ flex: 1 }}>
                        <select name="salary_period" className={styles.input} defaultValue="monthly">
                            {SALARY_PERIODS.map(p => <option key={p.value} value={p.value}>{p.label}</option>)}
                        </select>
                    </div>
                </div>

                <label className={styles.label}>Salary Range</label>
                <div className={styles.salaryRow}>
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

                {/* Healthcare Certification Section */}
                <HealthcareCertificationSelect
                    onSelectionChange={handleHealthcareCertsChange}
                    selectedCountryCode={countryCode}
                />
                <input type="hidden" name="healthcare_certifications" value={JSON.stringify(healthcareCerts)} />

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
