import Link from 'next/link';
import { Breadcrumbs } from '@/components/ui/Breadcrumbs';
import styles from '@/app/dashboard/Dashboard.module.css';
import tableStyles from '@/app/category/[slug]/Category.module.css';


import { VerificationForm } from './VerificationForm';

interface Props {
    company: any;
}

export function HirerDashboard({ company }: Props) {
    const isVerified = company?.verification_status === 'verified';
    const isPending = company?.verification_status === 'pending';
    const isUnverified = !company?.verification_status || company?.verification_status === 'unverified' || company?.verification_status === 'rejected';

    return (
        <div className={styles.dashboardContainer}>
            <Breadcrumbs items={[{ label: 'Home', href: '/' }, { label: 'Dashboard' }]} />
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '24px' }}>
                <h1 className={styles.heading} style={{ marginBottom: 0 }}>
                    My Dashboard (Hirer)
                </h1>
                {/* Status Badge */}
                <div style={{
                    padding: '6px 12px',
                    borderRadius: '4px',
                    fontWeight: 'bold',
                    fontSize: '12px',
                    background: isVerified ? '#e6f4ea' : isPending ? '#fff8e1' : '#fce8e6',
                    color: isVerified ? 'green' : isPending ? '#f57f17' : '#c62828',
                    border: '1px solid currentColor'
                }}>
                    Status: {company?.verification_status?.toUpperCase() || 'UNVERIFIED'}
                </div>
            </div>

            {/* Verification Warning / Form */}
            {isUnverified && (
                <div style={{ marginBottom: '40px', border: '1px solid #c62828', padding: '20px', borderRadius: '4px', background: '#fff' }}>
                    <h3 style={{ color: '#c62828', marginTop: 0 }}>Action Required: Verify Your Company</h3>
                    <p style={{ fontSize: '13px', marginBottom: '16px' }}>
                        You cannot post jobs until your company is verified. Please submit your business documents below.
                    </p>
                    <VerificationForm companyId={company.id} />
                </div>
            )}

            {isPending && (
                <div style={{ marginBottom: '40px', padding: '20px', background: '#fff8e1', border: '1px solid #ffe082', borderRadius: '4px' }}>
                    <h3 style={{ marginTop: 0, color: '#f57f17' }}>Verification Pending</h3>
                    <p style={{ fontSize: '13px', margin: 0 }}>
                        We are currently reviewing your documents. This process usually takes 24-48 hours. You will be able to post jobs once approved.
                    </p>
                </div>
            )}

            {/* Company Profile Section */}
            {company && (
                <div style={{
                    marginBottom: '40px',
                    padding: '24px',
                    border: '1px solid #ddd',
                    background: '#f9f9f9',
                    display: 'flex',
                    justifyContent: 'space-between',
                    alignItems: 'center'
                }}>
                    <div>
                        <h2 style={{ fontSize: '18px', marginBottom: '8px', color: 'var(--hunter-green)' }}>{company.name}</h2>
                        <div style={{ fontSize: '13px', color: '#666' }}>
                            {company.location || 'Location not set'} • {company.industry || 'Industry not set'}
                        </div>
                    </div>
                    <Link href="/company/profile" style={{
                        textDecoration: 'none',
                        background: '#fff',
                        border: '1px solid #ccc',
                        padding: '6px 12px',
                        fontSize: '12px',
                        fontWeight: 'bold',
                        color: '#333'
                    }}>
                        Edit Profile
                    </Link>
                </div>
            )}

            <div style={{ marginBottom: '40px' }}>
                <h3 className={styles.subHeading}>
                    Active Job Listings
                </h3>
                ...
                <div className={styles.tableContainer}>
                    <table className={tableStyles.jobTable}>
                        <thead>
                            <tr>
                                <th>Job Title</th>
                                <th>Category</th>
                                <th>Views</th>
                                <th>Applications</th>
                                <th>Status</th>
                                <th>Action</th>
                            </tr>
                        </thead>
                        <tbody>
                            <tr>
                                <td className={tableStyles.jobTitle}>Senior Mechanical Engineer</td>
                                <td>Engineering</td>
                                <td>1,240</td>
                                <td>12</td>
                                <td style={{ color: 'green', fontWeight: 'bold' }}>Live</td>
                                <td><button style={{ fontSize: '11px' }}>Manage</button></td>
                            </tr>
                            <tr>
                                <td className={tableStyles.jobTitle}>Production Supervisor</td>
                                <td>Manufacturing</td>
                                <td>850</td>
                                <td>45</td>
                                <td style={{ color: 'green', fontWeight: 'bold' }}>Live</td>
                                <td><button style={{ fontSize: '11px' }}>Manage</button></td>
                            </tr>
                        </tbody>
                    </table>
                </div>
            </div>

            <div>
                <h3 className={styles.subHeading}>
                    Recent Applications
                </h3>
                <div className={styles.tableContainer}>
                    <table className={tableStyles.jobTable}>
                        <thead>
                            <tr>
                                <th>Candidate Name</th>
                                <th>Applied For</th>
                                <th>Date</th>
                                <th>Status</th>
                                <th>Action</th>
                            </tr>
                        </thead>
                        <tbody>
                            <tr>
                                <td className={tableStyles.jobTitle}>Budi Santoso</td>
                                <td>Senior Mechanical Engineer</td>
                                <td>2 hours ago</td>
                                <td>New</td>
                                <td><button style={{ fontSize: '11px' }}>View CV</button></td>
                            </tr>
                            <tr>
                                <td className={tableStyles.jobTitle}>Siti Aminah</td>
                                <td>Production Supervisor</td>
                                <td>5 hours ago</td>
                                <td>Reviewed</td>
                                <td><button style={{ fontSize: '11px' }}>View CV</button></td>
                            </tr>
                        </tbody>
                    </table>
                </div>
            </div>
        </div>
    );
}
