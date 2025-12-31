// Healthcare Module Types
// Types for the country-aware healthcare credential management system

export interface HealthcareCountryConfig {
    id: string;
    country_code: string;
    country_name: string;
    regulatory_body: string | null;
    verification_url: string | null;
    license_types: string[];
    is_active: boolean;
    created_at: string;
    updated_at: string;
}

export interface HealthcareCertification {
    id: string;
    country_code: string;
    name: string;
    abbreviation: string | null;
    category: 'nursing' | 'allied_health' | 'universal' | 'midwifery' | 'medical';
    role_level: 'entry' | 'licensed' | 'advanced' | 'specialist' | null;
    issuing_body: string | null;
    requires_license_number: boolean;
    requires_expiry: boolean;
    is_active: boolean;
    created_at: string;
    updated_at: string;
}

export interface ProfileCertification {
    id: string;
    profile_id: string;
    certification_id: string;
    license_number: string | null;
    issue_date: string | null;
    expiry_date: string | null;
    state_or_region: string | null;
    document_url: string | null;
    verification_status: 'pending' | 'verified' | 'expired' | 'rejected';
    verified_at: string | null;
    verified_by: string | null;
    notes: string | null;
    created_at: string;
    updated_at: string;
    // Joined data
    certification?: HealthcareCertification;
}

export interface JobRequiredCertification {
    id: string;
    job_id: string;
    certification_id: string;
    is_required: boolean;
    created_at: string;
    // Joined data
    certification?: HealthcareCertification;
}

// Form types for creating/updating
export interface ProfileCertificationInput {
    certification_id: string;
    license_number?: string;
    issue_date?: string;
    expiry_date?: string;
    state_or_region?: string;
    document_url?: string;
}

export interface JobCertificationInput {
    certification_id: string;
    is_required: boolean;
}

// Helper types
export type CertificationCategory = HealthcareCertification['category'];
export type CertificationRoleLevel = HealthcareCertification['role_level'];
export type VerificationStatus = ProfileCertification['verification_status'];

// Computed types for display
export interface CertificationWithStatus extends ProfileCertification {
    is_expiring_soon: boolean; // Within 90 days
    is_expired: boolean;
    days_until_expiry: number | null;
}

// Filter types
export interface CertificationFilter {
    country_code?: string;
    category?: CertificationCategory;
    role_level?: CertificationRoleLevel;
}
