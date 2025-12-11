export interface Company {
    id: string;
    name: string;
    location: string | null;
    website: string | null;
    industry: string | null;
    description: string | null;
    logo_url: string | null;
    verification_status: 'unverified' | 'pending' | 'verified' | 'rejected';
    owner_id: string;
}

export interface Job {
    id: string;
    title: string;
    company_id: string;
    category_slug: string;
    location: string | null;
    salary_min: number | null;
    salary_max: number | null;
    description?: string | null;
    description_snippet?: string | null;
    requirements?: string | null;
    job_type?: string;
    workplace_type?: string;
    skills?: string[];
    benefits?: string[];
    status: 'active' | 'closed' | 'draft';
    closes_at?: string | null;
    closed_at?: string | null;
    created_at: string;
    // Joins
    company?: Company;
}

export interface Application {
    id: string;
    job_id: string;
    applicant_id: string;
    status: 'applied' | 'viewed' | 'shortlisted' | 'interview' | 'processing' | 'hired' | 'rejected';
    status_updated_at?: string;
    created_at: string;
    // Joins
    job?: Job;
    company?: Company;
}

export interface Profile {
    id: string;
    email: string;
    full_name: string | null;
    role: 'seeker' | 'hirer';
    is_admin: boolean;
    headline?: string;
    summary?: string;
    resume_url?: string;
}
