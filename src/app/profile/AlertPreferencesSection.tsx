'use client';

import { useState, useEffect } from 'react';
import { useToast } from '@/components/ui/Toast';
import {
    getAlertPreferences,
    saveAlertPreferences,
    AlertPreferences
} from '@/app/actions/alertPreferences';
import { JOB_TYPES, WORKPLACE_TYPES, CATEGORIES } from '@/data/constants';
import styles from './Profile.module.css';

export function AlertPreferencesSection() {
    const { showToast } = useToast();
    const [loading, setLoading] = useState(true);
    const [saving, setSaving] = useState(false);

    // Form state
    const [frequency, setFrequency] = useState<'daily' | 'weekly' | 'instant' | 'off'>('daily');
    const [selectedLocations, setSelectedLocations] = useState<string[]>([]);
    const [selectedCategories, setSelectedCategories] = useState<string[]>([]);
    const [selectedJobTypes, setSelectedJobTypes] = useState<string[]>([]);
    const [selectedWorkplaceTypes, setSelectedWorkplaceTypes] = useState<string[]>([]);
    const [salaryMin, setSalaryMin] = useState<string>('');
    const [keywords, setKeywords] = useState<string>('');

    // Load existing preferences
    useEffect(() => {
        async function loadPrefs() {
            const prefs = await getAlertPreferences();
            if (prefs) {
                setFrequency(prefs.frequency);
                setSelectedLocations(prefs.locations);
                setSelectedCategories(prefs.categories);
                setSelectedJobTypes(prefs.job_types);
                setSelectedWorkplaceTypes(prefs.workplace_types);
                setSalaryMin(prefs.salary_min?.toString() || '');
                setKeywords(prefs.keywords.join(', '));
            }
            setLoading(false);
        }
        loadPrefs();
    }, []);

    const handleSave = async () => {
        setSaving(true);

        const prefs: AlertPreferences = {
            frequency,
            locations: selectedLocations,
            categories: selectedCategories,
            job_types: selectedJobTypes,
            workplace_types: selectedWorkplaceTypes,
            salary_min: salaryMin ? parseFloat(salaryMin) : null,
            keywords: keywords.split(',').map(k => k.trim()).filter(k => k)
        };

        const result = await saveAlertPreferences(prefs);

        if (result.success) {
            showToast('Alert preferences saved!', 'success');
        } else {
            showToast(result.error || 'Failed to save preferences', 'error');
        }

        setSaving(false);
    };

    // Toggle helpers
    const toggleArrayItem = (
        arr: string[],
        setArr: (val: string[]) => void,
        item: string
    ) => {
        if (arr.includes(item)) {
            setArr(arr.filter(x => x !== item));
        } else {
            setArr([...arr, item]);
        }
    };

    if (loading) {
        return (
            <section className={styles.section} id="alerts">
                <h2 className={styles.sectionTitle}>🔔 Job Alerts</h2>
                <p>Loading preferences...</p>
            </section>
        );
    }



    return (
        <section className={styles.section} id="alerts">
            <h2 className={styles.sectionTitle}>🔔 Job Alerts</h2>
            <p className={styles.sectionDescription}>
                Get notified when new jobs match your preferences.
            </p>

            {/* Frequency */}
            <div className={styles.formGroup}>
                <label className={styles.label}>Alert Frequency</label>
                <select
                    value={frequency}
                    onChange={(e) => setFrequency(e.target.value as AlertPreferences['frequency'])}
                    className={styles.selectInput}
                >
                    <option value="daily">Daily Digest</option>
                    <option value="weekly">Weekly Summary</option>
                    <option value="off">Turn Off</option>
                </select>
            </div>

            {frequency !== 'off' && (
                <>
                    {/* Keywords */}
                    <div className={styles.formGroup}>
                        <label className={styles.label}>Keywords (comma separated)</label>
                        <input
                            type="text"
                            value={keywords}
                            onChange={(e) => setKeywords(e.target.value)}
                            placeholder="e.g., React, Frontend, Marketing"
                            className={styles.textInput}
                        />
                    </div>

                    {/* Locations */}
                    <div className={styles.formGroup}>
                        <label className={styles.label}>Preferred Locations (Cities or Countries)</label>
                        <p className={styles.helperText} style={{ fontSize: '12px', color: '#666', marginBottom: '8px' }}>
                            We accept worldwide locations. Type a city or country and press Enter to add.
                        </p>
                        <div className={styles.inputWithTags}>
                            <div className={styles.chipContainer} style={{ marginBottom: '8px' }}>
                                {selectedLocations.map(loc => (
                                    <button
                                        key={loc}
                                        type="button"
                                        className={`${styles.chip} ${styles.chipActive}`}
                                        onClick={() => toggleArrayItem(selectedLocations, setSelectedLocations, loc)}
                                    >
                                        {loc} ✕
                                    </button>
                                ))}
                            </div>
                            <input
                                type="text"
                                placeholder="Type location and press Enter..."
                                className={styles.textInput}
                                onKeyDown={(e) => {
                                    if (e.key === 'Enter') {
                                        e.preventDefault();
                                        const val = e.currentTarget.value.trim();
                                        if (val && !selectedLocations.includes(val)) {
                                            setSelectedLocations([...selectedLocations, val]);
                                            e.currentTarget.value = '';
                                        }
                                    }
                                }}
                            />
                        </div>
                    </div>

                    {/* Categories */}
                    <div className={styles.formGroup}>
                        <label className={styles.label}>Job Categories</label>
                        <div className={styles.chipContainer}>
                            {CATEGORIES.slice(0, 12).map(cat => (
                                <button
                                    key={cat.slug}
                                    type="button"
                                    className={`${styles.chip} ${selectedCategories.includes(cat.slug) ? styles.chipActive : ''}`}
                                    onClick={() => toggleArrayItem(selectedCategories, setSelectedCategories, cat.slug)}
                                >
                                    {cat.name}
                                </button>
                            ))}
                        </div>
                    </div>

                    {/* Job Types */}
                    <div className={styles.formGroup}>
                        <label className={styles.label}>Job Types</label>
                        <div className={styles.chipContainer}>
                            {JOB_TYPES.map(type => (
                                <button
                                    key={type.value}
                                    type="button"
                                    className={`${styles.chip} ${selectedJobTypes.includes(type.value) ? styles.chipActive : ''}`}
                                    onClick={() => toggleArrayItem(selectedJobTypes, setSelectedJobTypes, type.value)}
                                >
                                    {type.label}
                                </button>
                            ))}
                        </div>
                    </div>

                    {/* Workplace Types */}
                    <div className={styles.formGroup}>
                        <label className={styles.label}>Work Setting</label>
                        <div className={styles.chipContainer}>
                            {WORKPLACE_TYPES.map(type => (
                                <button
                                    key={type.value}
                                    type="button"
                                    className={`${styles.chip} ${selectedWorkplaceTypes.includes(type.value) ? styles.chipActive : ''}`}
                                    onClick={() => toggleArrayItem(selectedWorkplaceTypes, setSelectedWorkplaceTypes, type.value)}
                                >
                                    {type.label}
                                </button>
                            ))}
                        </div>
                    </div>

                    {/* Minimum Salary */}
                    <div className={styles.formGroup}>
                        <label className={styles.label}>Minimum Monthly Salary (IDR)</label>
                        <input
                            type="number"
                            value={salaryMin}
                            onChange={(e) => setSalaryMin(e.target.value)}
                            placeholder="e.g., 5000000"
                            className={styles.textInput}
                        />
                    </div>
                </>
            )}

            <button
                onClick={handleSave}
                disabled={saving}
                className={styles.saveButton}
            >
                {saving ? 'Saving...' : 'Save Alert Preferences'}
            </button>
        </section>
    );
}
