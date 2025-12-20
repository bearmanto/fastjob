export interface Collection {
    slug: string;
    title: string;
    description: string;
    icon: string;
    color: string;
    filter: {
        type: 'category' | 'workplace' | 'salary' | 'job_type' | 'status';
        value: string | number;
        operator?: 'eq' | 'gte' | 'contains';
    };
}

export const COLLECTIONS: Collection[] = [
    {
        slug: 'remote-friendly',
        title: 'Remote Friendly',
        description: 'Work from anywhere with these remote-first opportunities.',
        icon: '🏠',
        color: 'bg-blue-100 text-blue-800',
        filter: { type: 'workplace', value: 'Remote' }
    },
    {
        slug: 'high-salary',
        title: 'High Salary',
        description: 'Positions offering competitive compensation packages.',
        icon: '💰',
        color: 'bg-green-100 text-green-800',
        filter: { type: 'salary', value: 15000000, operator: 'gte' }
    },
    {
        slug: 'engineering',
        title: 'Engineering & Tech',
        description: 'Software, hardware, and technical roles.',
        icon: '💻',
        color: 'bg-purple-100 text-purple-800',
        filter: { type: 'category', value: 'engineering' }
    },
    {
        slug: 'sales-marketing',
        title: 'Sales & Marketing',
        description: 'Drive growth and revenue for top companies.',
        icon: '📈',
        color: 'bg-orange-100 text-orange-800',
        filter: { type: 'category', value: 'sales' }
    },
    {
        slug: 'urgent-hires',
        title: 'Urgent Hires',
        description: 'Companies looking to fill these roles immediately.',
        icon: '🔥',
        color: 'bg-red-100 text-red-800',
        filter: { type: 'job_type', value: 'Contract' } // Using Contract as proxy for urgent for now
    },
    {
        slug: 'manufacturing',
        title: 'Manufacturing',
        description: 'Roles in production, operations, and logistics.',
        icon: '🏭',
        color: 'bg-slate-100 text-slate-800',
        filter: { type: 'category', value: 'manufacturing' }
    }
];
