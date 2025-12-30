import { NextRequest, NextResponse } from 'next/server';
import { createClient } from '@supabase/supabase-js';

// Use service role for upserts
const supabase = createClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.SUPABASE_SERVICE_ROLE_KEY!
);

export async function POST(request: NextRequest) {
    try {
        const { jobId, source = 'direct' } = await request.json();

        if (!jobId || !/^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i.test(jobId)) {
            return NextResponse.json({ error: 'Invalid jobId' }, { status: 400 });
        }

        const today = new Date().toISOString().split('T')[0];

        // 1. Record raw view
        await supabase.from('job_views').insert({
            job_id: jobId,
            source
        });

        // 2. Upsert daily aggregate
        const { data: existing } = await supabase
            .from('job_analytics_daily')
            .select('id, views')
            .eq('job_id', jobId)
            .eq('date', today)
            .single();

        if (existing) {
            // Update existing
            await supabase
                .from('job_analytics_daily')
                .update({ views: existing.views + 1 })
                .eq('id', existing.id);
        } else {
            // Insert new
            await supabase.from('job_analytics_daily').insert({
                job_id: jobId,
                date: today,
                views: 1
            });
        }

        return NextResponse.json({ success: true });
    } catch (error) {
        console.error('Track view error:', error);
        return NextResponse.json({ error: 'Internal error' }, { status: 500 });
    }
}
