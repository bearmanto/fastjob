import { redirect } from 'next/navigation';
import { createClient } from '@/utils/supabase/server';
import { Breadcrumbs } from '@/components/ui/Breadcrumbs';
import { AnalyticsChart } from './AnalyticsChart';
import styles from './Analytics.module.css';
import Link from 'next/link';

export default async function AnalyticsPage() {
    const supabase = await createClient();
    const { data: { user } } = await supabase.auth.getUser();

    if (!user) {
        redirect('/login');
    }

    // Get user's company
    const { data: company } = await supabase
        .from('companies')
        .select('id, name')
        .eq('owner_id', user.id)
        .single();

    if (!company) {
        redirect('/dashboard');
    }

    // Get all jobs for this company
    const { data: jobs } = await supabase
        .from('jobs')
        .select('id, title, status, created_at')
        .eq('company_id', company.id)
        .order('created_at', { ascending: false });

    // Get analytics for last 30 days
    const thirtyDaysAgo = new Date();
    thirtyDaysAgo.setDate(thirtyDaysAgo.getDate() - 30);

    const jobIds = jobs?.map(j => j.id) || [];

    const { data: analytics } = await supabase
        .from('job_analytics_daily')
        .select('job_id, date, views')
        .in('job_id', jobIds.length > 0 ? jobIds : ['00000000-0000-0000-0000-000000000000'])
        .gte('date', thirtyDaysAgo.toISOString().split('T')[0])
        .order('date', { ascending: true });

    // Get total applications
    const { data: applications } = await supabase
        .from('applications')
        .select('job_id')
        .in('job_id', jobIds.length > 0 ? jobIds : ['00000000-0000-0000-0000-000000000000']);

    // Compute stats
    const totalViews = analytics?.reduce((sum, a) => sum + (a.views || 0), 0) || 0;
    const totalApplies = applications?.length || 0;
    const applyRate = totalViews > 0 ? ((totalApplies / totalViews) * 100).toFixed(1) : '0';

    // Aggregate views by date for chart
    const viewsByDate: Record<string, number> = {};
    analytics?.forEach(a => {
        viewsByDate[a.date] = (viewsByDate[a.date] || 0) + a.views;
    });

    const chartData = Object.entries(viewsByDate).map(([date, views]) => ({
        date,
        views
    }));

    // Aggregate views by job
    const viewsByJob: Record<string, number> = {};
    analytics?.forEach(a => {
        viewsByJob[a.job_id] = (viewsByJob[a.job_id] || 0) + a.views;
    });

    // Applications by job
    const appliesByJob: Record<string, number> = {};
    applications?.forEach(a => {
        appliesByJob[a.job_id] = (appliesByJob[a.job_id] || 0) + 1;
    });

    return (
        <div className={styles.container}>
            <Breadcrumbs items={[
                { label: 'Home', href: '/' },
                { label: 'Dashboard', href: '/dashboard' },
                { label: 'Analytics' }
            ]} />

            <div className={styles.header}>
                <h1 className={styles.title}>Analytics</h1>
                <span className={styles.period}>Last 30 days</span>
            </div>

            {/* Stats Cards */}
            <div className={styles.statsGrid}>
                <div className={styles.statCard}>
                    <div className={styles.statValue}>{totalViews.toLocaleString()}</div>
                    <div className={styles.statLabel}>Total Views</div>
                </div>
                <div className={styles.statCard}>
                    <div className={styles.statValue}>{totalApplies}</div>
                    <div className={styles.statLabel}>Applications</div>
                </div>
                <div className={styles.statCard}>
                    <div className={styles.statValue}>{applyRate}%</div>
                    <div className={styles.statLabel}>Apply Rate</div>
                </div>
                <div className={styles.statCard}>
                    <div className={styles.statValue}>{jobs?.filter(j => j.status === 'active').length || 0}</div>
                    <div className={styles.statLabel}>Active Jobs</div>
                </div>
            </div>

            {/* Chart */}
            <div className={styles.chartContainer}>
                <h2 className={styles.sectionTitle}>Views Over Time</h2>
                {chartData.length > 0 ? (
                    <AnalyticsChart data={chartData} />
                ) : (
                    <div className={styles.emptyChart}>No view data yet. Views will appear as people visit your job listings.</div>
                )}
            </div>

            {/* Jobs Table */}
            <div className={styles.tableContainer}>
                <h2 className={styles.sectionTitle}>Performance by Job</h2>
                <table className={styles.analyticsTable}>
                    <thead>
                        <tr>
                            <th>Job Title</th>
                            <th>Views</th>
                            <th>Applies</th>
                            <th>Rate</th>
                        </tr>
                    </thead>
                    <tbody>
                        {jobs && jobs.length > 0 ? jobs.map(job => {
                            const views = viewsByJob[job.id] || 0;
                            const applies = appliesByJob[job.id] || 0;
                            const rate = views > 0 ? ((applies / views) * 100).toFixed(1) : '0';
                            return (
                                <tr key={job.id}>
                                    <td>
                                        <Link href={`/job/${job.id}`} className={styles.jobLink}>
                                            {job.title}
                                        </Link>
                                    </td>
                                    <td>{views}</td>
                                    <td>{applies}</td>
                                    <td>{rate}%</td>
                                </tr>
                            );
                        }) : (
                            <tr>
                                <td colSpan={4} className={styles.emptyState}>
                                    No jobs found. Post a job to see analytics.
                                </td>
                            </tr>
                        )}
                    </tbody>
                </table>
            </div>
        </div>
    );
}
