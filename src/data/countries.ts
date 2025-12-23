// ISO 3166-1 alpha-2 country codes with common hiring countries first
export interface Country {
    code: string;
    name: string;
    flag: string;
}

// Popular hiring countries first, then alphabetical
export const COUNTRIES: Country[] = [
    // Top Global Markets
    { code: 'US', name: 'United States', flag: '🇺🇸' },
    { code: 'GB', name: 'United Kingdom', flag: '🇬🇧' },
    { code: 'CA', name: 'Canada', flag: '🇨🇦' },
    { code: 'AU', name: 'Australia', flag: '🇦🇺' },
    { code: 'DE', name: 'Germany', flag: '🇩🇪' },
    { code: 'FR', name: 'France', flag: '🇫🇷' },
    { code: 'NL', name: 'Netherlands', flag: '🇳🇱' },
    { code: 'SG', name: 'Singapore', flag: '🇸🇬' },
    { code: 'JP', name: 'Japan', flag: '🇯🇵' },
    { code: 'IN', name: 'India', flag: '🇮🇳' },

    // Southeast Asia
    { code: 'ID', name: 'Indonesia', flag: '🇮🇩' },
    { code: 'MY', name: 'Malaysia', flag: '🇲🇾' },
    { code: 'TH', name: 'Thailand', flag: '🇹🇭' },
    { code: 'VN', name: 'Vietnam', flag: '🇻🇳' },
    { code: 'PH', name: 'Philippines', flag: '🇵🇭' },

    // Middle East
    { code: 'AE', name: 'United Arab Emirates', flag: '🇦🇪' },
    { code: 'SA', name: 'Saudi Arabia', flag: '🇸🇦' },
    { code: 'QA', name: 'Qatar', flag: '🇶🇦' },

    // Europe
    { code: 'CH', name: 'Switzerland', flag: '🇨🇭' },
    { code: 'SE', name: 'Sweden', flag: '🇸🇪' },
    { code: 'IE', name: 'Ireland', flag: '🇮🇪' },
    { code: 'ES', name: 'Spain', flag: '🇪🇸' },
    { code: 'IT', name: 'Italy', flag: '🇮🇹' },
    { code: 'PL', name: 'Poland', flag: '🇵🇱' },
    { code: 'PT', name: 'Portugal', flag: '🇵🇹' },
    { code: 'BE', name: 'Belgium', flag: '🇧🇪' },
    { code: 'AT', name: 'Austria', flag: '🇦🇹' },
    { code: 'DK', name: 'Denmark', flag: '🇩🇰' },
    { code: 'NO', name: 'Norway', flag: '🇳🇴' },
    { code: 'FI', name: 'Finland', flag: '🇫🇮' },

    // Americas
    { code: 'BR', name: 'Brazil', flag: '🇧🇷' },
    { code: 'MX', name: 'Mexico', flag: '🇲🇽' },
    { code: 'AR', name: 'Argentina', flag: '🇦🇷' },
    { code: 'CO', name: 'Colombia', flag: '🇨🇴' },
    { code: 'CL', name: 'Chile', flag: '🇨🇱' },

    // Asia Pacific
    { code: 'CN', name: 'China', flag: '🇨🇳' },
    { code: 'KR', name: 'South Korea', flag: '🇰🇷' },
    { code: 'TW', name: 'Taiwan', flag: '🇹🇼' },
    { code: 'HK', name: 'Hong Kong', flag: '🇭🇰' },
    { code: 'NZ', name: 'New Zealand', flag: '🇳🇿' },

    // Africa
    { code: 'ZA', name: 'South Africa', flag: '🇿🇦' },
    { code: 'NG', name: 'Nigeria', flag: '🇳🇬' },
    { code: 'KE', name: 'Kenya', flag: '🇰🇪' },
    { code: 'EG', name: 'Egypt', flag: '🇪🇬' },
];

// Helper functions
export function getCountryByCode(code: string): Country | undefined {
    return COUNTRIES.find(c => c.code === code);
}

export function getCountryName(code: string): string {
    return getCountryByCode(code)?.name || code;
}

export function getCountryFlag(code: string): string {
    return getCountryByCode(code)?.flag || '🌍';
}

// Verification document types
export const VERIFICATION_CATEGORIES = {
    business_identity: {
        label: 'Business Identity',
        description: 'Proof of legal business registration',
        documentTypes: [
            { value: 'articles_of_incorporation', label: 'Articles of Incorporation / Certificate of Formation' },
            { value: 'business_license', label: 'Business License' },
            { value: 'tax_registration', label: 'Tax Registration (EIN, VAT, GST Certificate)' },
            { value: 'tax_returns', label: 'Tax Returns / Financial Statements' },
        ]
    },
    representative_auth: {
        label: 'Representative Authorization',
        description: 'Proof that you can act on behalf of the company',
        documentTypes: [
            { value: 'corporate_email', label: 'Corporate Email Verification' },
            { value: 'business_card', label: 'Business Card Scan' },
            { value: 'signatory_letter', label: 'Authorized Signatory Letter' },
        ]
    },
    personal_id: {
        label: 'Personal Identification',
        description: 'Government-issued ID of the account owner',
        documentTypes: [
            { value: 'passport', label: 'Passport' },
            { value: 'drivers_license', label: 'Driver\'s License' },
            { value: 'national_id', label: 'National ID Card' },
        ]
    }
};
