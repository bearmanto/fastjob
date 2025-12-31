// Healthcare Data Constants
// Country-specific configuration for the healthcare module

export const HEALTHCARE_COUNTRIES = [
    { code: 'SG', name: 'Singapore', flag: '🇸🇬' },
    { code: 'ID', name: 'Indonesia', flag: '🇮🇩' },
    { code: 'MY', name: 'Malaysia', flag: '🇲🇾' },
    { code: 'PH', name: 'Philippines', flag: '🇵🇭' },
] as const;

export const CERTIFICATION_CATEGORIES = [
    { value: 'medical', label: 'Medical Practitioner (Doctor)' },
    { value: 'nursing', label: 'Nursing' },
    { value: 'midwifery', label: 'Midwifery' },
    { value: 'allied_health', label: 'Allied Health' },
    { value: 'universal', label: 'Universal Certifications' },
] as const;

export const ROLE_LEVELS = [
    { value: 'entry', label: 'Entry Level' },
    { value: 'licensed', label: 'Licensed Professional' },
    { value: 'advanced', label: 'Advanced Practice' },
    { value: 'specialist', label: 'Specialist' },
] as const;

export const VERIFICATION_STATUSES = [
    { value: 'pending', label: 'Pending Verification', color: 'var(--warning-color, #f59e0b)' },
    { value: 'verified', label: 'Verified', color: 'var(--success-color, #10b981)' },
    { value: 'expired', label: 'Expired', color: 'var(--error-color, #ef4444)' },
    { value: 'rejected', label: 'Rejected', color: 'var(--error-color, #ef4444)' },
] as const;

// Expiry warning thresholds (in days)
export const EXPIRY_WARNING_DAYS = 90;
export const EXPIRY_CRITICAL_DAYS = 30;

// Helper functions
export function getCountryByCode(code: string) {
    return HEALTHCARE_COUNTRIES.find(c => c.code === code);
}

export function getCategoryLabel(category: string) {
    return CERTIFICATION_CATEGORIES.find(c => c.value === category)?.label || category;
}

export function getRoleLevelLabel(level: string) {
    return ROLE_LEVELS.find(l => l.value === level)?.label || level;
}

export function getVerificationStatus(status: string) {
    return VERIFICATION_STATUSES.find(s => s.value === status);
}

export function getDaysUntilExpiry(expiryDate: string | null): number | null {
    if (!expiryDate) return null;
    const expiry = new Date(expiryDate);
    const today = new Date();
    const diffTime = expiry.getTime() - today.getTime();
    return Math.ceil(diffTime / (1000 * 60 * 60 * 24));
}

export function isExpiringSoon(expiryDate: string | null): boolean {
    const days = getDaysUntilExpiry(expiryDate);
    return days !== null && days > 0 && days <= EXPIRY_WARNING_DAYS;
}

export function isExpired(expiryDate: string | null): boolean {
    const days = getDaysUntilExpiry(expiryDate);
    return days !== null && days <= 0;
}
