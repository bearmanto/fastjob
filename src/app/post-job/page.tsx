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
        <div ref={wrapperRef} style={{ position: 'relative' }}>
            {/* Selected Chips */}
            <div style={{ display: 'flex', flexWrap: 'wrap', gap: '8px', marginBottom: '8px' }}>
                {selected.map(item => (
                    <span key={item} style={{
                        background: '#e0f2f1',
                        color: '#00695c',
                        border: '1px solid #b2dfdb',
                        borderRadius: '4px',
                        padding: '4px 8px',
                        fontSize: '13px',
                        display: 'flex',
                        alignItems: 'center',
                        gap: '6px'
                    }}>
                        {item}
                        <button type="button" onClick={() => toggleOption(item)} style={{
                            background: 'none', border: 'none', cursor: 'pointer', color: '#004d40', fontWeight: 'bold', fontSize: '14px', lineHeight: 1
                        }}>×</button>
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
                <div style={{
                    position: 'absolute',
                    top: '100%',
                    left: 0,
                    right: 0,
                    maxHeight: '200px',
                    overflowY: 'auto',
                    background: 'white',
                    border: '1px solid #ccc',
                    borderRadius: '4px',
                    zIndex: 100,
                    boxShadow: '0 4px 6px rgba(0,0,0,0.1)'
                }}>
                    {filteredOptions.length > 0 ? filteredOptions.map(option => (
                        <div
                            key={option}
                            onClick={() => toggleOption(option)}
                            style={{
                                padding: '8px 12px',
                                cursor: 'pointer',
                                fontSize: '13px',
                                borderBottom: '1px solid #eee'
                            }}
                            onMouseEnter={e => e.currentTarget.style.background = '#f5f5f5'}
                            onMouseLeave={e => e.currentTarget.style.background = 'white'}
                        >
                            {option}
                        </div>
                    )) : (
                        <div style={{ padding: '8px 12px', color: '#999', fontSize: '13px' }}>
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
                    <div style={{
                        gridColumn: '1 / -1',
                        background: '#ffebee',
                        color: '#c62828',
                        padding: '12px',
                        borderRadius: '4px',
                        border: '1px solid #ffcdd2',
                        fontSize: '14px',
                        fontWeight: 500
                    }}>
                        ⚠️ {state.error}
                        {/* Debugging info if needed */}
                        {/* <pre>{JSON.stringify(state, null, 2)}</pre> */}
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
                <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '8px', maxWidth: '400px' }}>
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
                <div style={{ display: 'flex', gap: '8px', alignItems: 'center' }}>
                    <span style={{ fontSize: '13px' }}>IDR</span>
                    <input name="salary_min" type="number" className={styles.input} style={{ width: '120px' }} placeholder="Min" />
                    <span style={{ fontSize: '13px' }}>-</span>
                    <input name="salary_max" type="number" className={styles.input} style={{ width: '120px' }} placeholder="Max" />
                </div>

                <label className={styles.label}>Experience Level</label>
                <select name="experience_level" className={styles.input}>
                    <option>Entry Level</option>
                    <option>Mid Level (2-5 yrs)</option>
                    <option>Senior (5+ yrs)</option>
                    <option>Managerial</option>
                </select>

                <div className={styles.sectionHeader}>3. Requirements & Benefits</div>

                <label className={styles.label} style={{ alignSelf: 'start', marginTop: '8px' }}>
                    Required Skills
                    <div style={{ fontSize: '11px', color: '#666', fontWeight: 'normal' }}>Type to search and select</div>
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

                <label className={styles.label} style={{ alignSelf: 'start', marginTop: '16px' }}>
                    Benefits Offered
                    <div style={{ fontSize: '11px', color: '#666', fontWeight: 'normal' }}>Type to search and select</div>
                </label>

                <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '8px' }}>
                    {COMMON_BENEFITS.map(benefit => (
                        <label key={benefit} style={{ display: 'flex', alignItems: 'center', gap: '8px', fontSize: '13px', cursor: 'pointer' }}>
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

                <label className={styles.label} style={{ alignSelf: 'start', marginTop: '16px' }}>Requirements</label>
                <textarea name="requirements" className={styles.textarea} placeholder="List specific requirements..." rows={4}></textarea>

                <label className={styles.label} style={{ alignSelf: 'start', marginTop: '16px' }}>Job Description</label>
                <textarea name="description" className={styles.textarea} placeholder="Describe the role responsibilities..." rows={6}></textarea>

                <div className={styles.sectionHeader}>4. Listing Options</div>

                <label className={styles.label}>
                    Auto-Close Date (Optional)
                    <div style={{ fontSize: '11px', color: '#666', fontWeight: 'normal' }}>Job will be automatically closed on this date</div>
                </label>
                <input
                    name="closes_at"
                    type="date"
                    className={styles.input}
                    style={{ maxWidth: '200px' }}
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
