export interface Category {
    id: string;
    name: string;
    slug: string;
    icon?: string; // Emoji for now
    subcategories: string[];
}

export const CATEGORIES: Category[] = [
    {
        id: 'eng',
        name: 'Engineering & Technical',
        slug: 'engineering',
        icon: '⚙️',
        subcategories: ['Mechanical', 'Electrical', 'Civil', 'Chemical', 'Industrial Design', 'Project Management'],
    },
    {
        id: 'mfg',
        name: 'Manufacturing & Operations',
        slug: 'manufacturing',
        icon: '🏭',
        subcategories: ['Plant Management', 'Quality Control', 'Logistics', 'Supply Chain', 'Machine Operator', 'Safety Manager'],
    },
    {
        id: 'it',
        name: 'Information Technology',
        slug: 'it',
        icon: '💻',
        subcategories: ['Software Development', 'System Administration', 'Data Science', 'Product Management', 'Cybersecurity', 'IT Support'],
    },
    {
        id: 'sales',
        name: 'Sales & Marketing',
        slug: 'sales',
        icon: '📈',
        subcategories: ['B2B Sales', 'Account Management', 'Digital Marketing', 'Content Strategy', 'Sales Operations'],
    },
    {
        id: 'admin',
        name: 'Admin & Finance',
        slug: 'admin',
        icon: 'gd',
        subcategories: ['Accounting', 'HR & Recruiting', 'Office Administration', 'Legal', 'Executive Assistant'],
    },
    {
        id: 'const',
        name: 'Construction & Facilities',
        slug: 'construction',
        icon: '🏗️',
        subcategories: ['Site Manager', 'Architect', 'Electrician', 'Plumber', 'HVAC Technician'],
    }
];

export interface Job {
    id: string;
    title: string;
    company: string;
    location: string;
    salary: string;
    postedAt: string;
    categorySlug: string;
    descriptionSnippet: string;
}

export const JOBS: Job[] = [
    { id: '20000000-0000-0000-0000-000000000001', title: 'Senior Mechanical Engineer', company: 'Apex Heavy Industries', location: 'Jakarta', salary: 'IDR 25mn', postedAt: '2h ago', categorySlug: 'engineering', descriptionSnippet: 'Lead design of hydraulic systems for heavy machinery.' },
    { id: '20000000-0000-0000-0000-000000000002', title: 'Production Supervisor', company: 'Global Mfg Corp', location: 'Cikarang', salary: 'IDR 12mn', postedAt: '5h ago', categorySlug: 'manufacturing', descriptionSnippet: 'Oversee shift operations and ensure safety compliance.' },
    { id: '20000000-0000-0000-0000-000000000003', title: 'Backend Developer (Go)', company: 'FinTech Fast', location: 'Remote', salary: 'IDR 30mn', postedAt: '1d ago', categorySlug: 'it', descriptionSnippet: 'Build high-performance APIs for payment processing.' },
    { id: '20000000-0000-0000-0000-000000000004', title: 'Technical Sales Engineer', company: 'Pump Systems Ltd', location: 'Surabaya', salary: 'IDR 15mn', postedAt: '2d ago', categorySlug: 'sales', descriptionSnippet: 'Sell industrial pumps to manufacturing clients.' },
    { id: '20000000-0000-0000-0000-000000000005', title: 'Safety Officer (K3)', company: 'ConstructCo', location: 'Balikpapan', salary: 'IDR 10mn', postedAt: '3d ago', categorySlug: 'construction', descriptionSnippet: 'Manage site safety and compliance.' },
    // ... more jobs could be generated programmatically if needed
];
