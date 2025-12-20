import { NextResponse } from 'next/server';
import { createClient } from '@supabase/supabase-js';
import { sendJobAlertDigest } from '@/lib/email';

// Vercel Cron: runs daily at 8am UTC
export const runtime = 'nodejs';
export const dynamic = 'force-dynamic';

interface MatchedJob {
    job_id: string;
    title: string;
    company_name: string;
    location: string;
    salary_min: number | null;
    salary_max: number | null;
    match_score: number;
}

interface UserWithPrefs {
    user_id: string;
    profiles: {
        email: string;
        full_name: string;
    } | null;
}

export async function GET(request: Request) {
    // Verify cron secret (Vercel sends this header)
    const authHeader = request.headers.get('authorization');
    if (authHeader !== `Bearer ${process.env.CRON_SECRET}`) {
        // Also allow manual trigger in development
        if (process.env.NODE_ENV !== 'development') {
            return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
        }
    }

    // Use service role for admin operations
    const supabase = createClient(
        process.env.NEXT_PUBLIC_SUPABASE_URL!,
        process.env.SUPABASE_SERVICE_ROLE_KEY!
    );

    // Get users with daily alerts enabled
    const { data: users, error: usersError } = await supabase
        .from('job_alert_preferences')
        .select('user_id, profiles(email, full_name)')
        .eq('frequency', 'daily');

    if (usersError) {
        console.error('Error fetching users:', usersError);
        return NextResponse.json({ error: 'Failed to fetch users' }, { status: 500 });
    }

    let sentCount = 0;
    const errors: string[] = [];

    for (const user of (users || []) as unknown as UserWithPrefs[]) {
        try {
            // Get matching jobs using the PostgreSQL function
            const { data: jobs, error: jobsError } = await supabase.rpc('match_jobs_for_alerts', {
                p_user_id: user.user_id
            });

            if (jobsError) {
                console.error(`Error matching jobs for ${user.user_id}:`, jobsError);
                errors.push(`User ${user.user_id}: ${jobsError.message}`);
                continue;
            }

            const matchedJobs = jobs as MatchedJob[];

            if (matchedJobs && matchedJobs.length > 0 && user.profiles?.email) {
                // Format salary for display
                const formatSalary = (min: number | null, max: number | null) => {
                    if (!min && !max) return 'Negotiable';
                    if (min && max) return `IDR ${(min / 1000000).toFixed(0)}M - ${(max / 1000000).toFixed(0)}M`;
                    if (min) return `IDR ${(min / 1000000).toFixed(0)}M+`;
                    return 'Negotiable';
                };

                // Send email digest
                const emailResult = await sendJobAlertDigest({
                    recipientName: user.profiles.full_name || '',
                    recipientEmail: user.profiles.email,
                    jobs: matchedJobs.map(j => ({
                        id: j.job_id,
                        title: j.title,
                        company: j.company_name,
                        location: j.location || 'Remote',
                        salary: formatSalary(j.salary_min, j.salary_max),
                        matchScore: j.match_score
                    }))
                });

                if (emailResult.success) {
                    // Record sent jobs to prevent duplicates
                    const historyRecords = matchedJobs.map(j => ({
                        user_id: user.user_id,
                        job_id: j.job_id
                    }));

                    await supabase.from('job_alert_history').insert(historyRecords);

                    // Update last_sent_at
                    await supabase
                        .from('job_alert_preferences')
                        .update({ last_sent_at: new Date().toISOString() })
                        .eq('user_id', user.user_id);

                    sentCount++;
                } else {
                    errors.push(`User ${user.user_id}: Email send failed`);
                }
            }
        } catch (error) {
            console.error(`Error processing user ${user.user_id}:`, error);
            errors.push(`User ${user.user_id}: ${error}`);
        }
    }

    return NextResponse.json({
        success: true,
        message: `Sent alerts to ${sentCount} users`,
        totalUsers: users?.length || 0,
        sentCount,
        errors: errors.length > 0 ? errors : undefined
    });
}
