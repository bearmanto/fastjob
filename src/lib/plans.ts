// Plan metadata - shared between client and server
export const PLANS = {
    free: {
        name: 'Free',
        price: 0,
        teamLimit: 1,
        features: ['Basic posting', 'Applicant management'],
    },
    pro: {
        name: 'Pro',
        price: 20,
        teamLimit: 3,
        features: [
            'Gold Recruiter Badge',
            'Analytics Dashboard',
            'Team Access (3 users)',
            'CSV Export',
            'Candidate Notes',
            'Custom Email Templates',
            'Featured Job Boost',
            'Extended Visibility (60 days)',
        ],
    },
    enterprise: {
        name: 'Enterprise',
        price: 50,
        teamLimit: 10,
        monthlyTalentCredits: 5,
        features: [
            'All Pro features',
            'Talent Search (5 credits/mo)',
            'Team Access (5+ users)',
            'Headhunting Pipeline',
        ],
    },
} as const;

export type PlanType = keyof typeof PLANS;
