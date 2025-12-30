import { NextRequest, NextResponse } from 'next/server';
import { createClient } from '@/utils/supabase/server';
import { requirePro } from '@/lib/subscription';

export async function GET(request: NextRequest) {
    try {
        const supabase = await createClient();
        const { data: { user } } = await supabase.auth.getUser();

        if (!user) {
            return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
        }

        // Get company
        const { data: company } = await supabase
            .from('companies')
            .select('id')
            .eq('owner_id', user.id)
            .single();

        if (!company) {
            return NextResponse.json({ error: 'Company not found' }, { status: 404 });
        }

        // Check if user has Pro plan
        const hasPro = await requirePro(company.id);
        if (!hasPro) {
            return NextResponse.json(
                { error: 'CSV Export requires Pro plan' },
                { status: 403 }
            );
        }

        // Get optional job filter from query params
        const { searchParams } = new URL(request.url);
        const jobId = searchParams.get('jobId');
        const status = searchParams.get('status');

        // Fetch applications with related data
        let query = supabase
            .from('applications')
            .select(`
                id,
                status,
                created_at,
                updated_at,
                cover_letter,
                job:jobs!inner (
                    id,
                    title,
                    company_id
                ),
                profile:profiles (
                    id,
                    full_name,
                    email,
                    phone,
                    headline,
                    location,
                    resume_url
                )
            `)
            .eq('job.company_id', company.id)
            .order('created_at', { ascending: false });

        if (jobId) {
            query = query.eq('job_id', jobId);
        }

        if (status) {
            query = query.eq('status', status);
        }

        const { data: applications, error } = await query;

        if (error) {
            console.error('Error fetching applications:', error);
            return NextResponse.json({ error: 'Failed to fetch data' }, { status: 500 });
        }

        // Build CSV
        const headers = [
            'Applicant Name',
            'Email',
            'Phone',
            'Headline',
            'Location',
            'Job Title',
            'Status',
            'Applied Date',
            'Resume URL',
            'Cover Letter'
        ];

        const rows = (applications || []).map((app) => {
            const profile = app.profile as {
                full_name?: string;
                email?: string;
                phone?: string;
                headline?: string;
                location?: string;
                resume_url?: string;
            } | null;
            const job = app.job as { title?: string } | null;

            return [
                profile?.full_name || '',
                profile?.email || '',
                profile?.phone || '',
                profile?.headline || '',
                profile?.location || '',
                job?.title || '',
                app.status || '',
                app.created_at ? new Date(app.created_at).toLocaleDateString() : '',
                profile?.resume_url || '',
                (app.cover_letter || '').replace(/"/g, '""').replace(/\n/g, ' ') // Escape for CSV
            ];
        });

        // Generate CSV content
        const csvContent = [
            headers.join(','),
            ...rows.map(row => row.map(cell => `"${cell}"`).join(','))
        ].join('\n');

        // Return as downloadable CSV
        const filename = `applicants_${new Date().toISOString().split('T')[0]}.csv`;

        return new NextResponse(csvContent, {
            status: 200,
            headers: {
                'Content-Type': 'text/csv',
                'Content-Disposition': `attachment; filename="${filename}"`,
            },
        });

    } catch (error) {
        console.error('CSV export error:', error);
        return NextResponse.json({ error: 'Export failed' }, { status: 500 });
    }
}
