import { NextRequest, NextResponse } from 'next/server';
import { createClient } from '@/utils/supabase/server';

export async function GET(request: NextRequest) {
    const supabase = await createClient();

    const { data: { user } } = await supabase.auth.getUser();
    if (!user) {
        return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const { data, error } = await supabase
        .from('profile_certifications')
        .select(`
            *,
            certification:healthcare_certifications(*)
        `)
        .eq('profile_id', user.id)
        .order('created_at', { ascending: false });

    if (error) {
        console.error('Error fetching profile certifications:', error);
        return NextResponse.json({ error: error.message }, { status: 500 });
    }

    return NextResponse.json(data || []);
}

export async function POST(request: NextRequest) {
    const supabase = await createClient();

    const { data: { user } } = await supabase.auth.getUser();
    if (!user) {
        return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    try {
        const body = await request.json();

        const { data, error } = await supabase
            .from('profile_certifications')
            .insert({
                profile_id: user.id,
                certification_id: body.certification_id,
                license_number: body.license_number || null,
                issue_date: body.issue_date || null,
                expiry_date: body.expiry_date || null,
                state_or_region: body.state_or_region || null,
                document_url: body.document_url || null,
                verification_status: 'pending'
            })
            .select(`
                *,
                certification:healthcare_certifications(*)
            `)
            .single();

        if (error) {
            console.error('Error adding certification:', error);
            return NextResponse.json({ error: error.message }, { status: 500 });
        }

        return NextResponse.json(data);
    } catch (err) {
        console.error('Error parsing request:', err);
        return NextResponse.json({ error: 'Invalid request' }, { status: 400 });
    }
}
