import { NextRequest, NextResponse } from 'next/server';
import { createClient } from '@/utils/supabase/server';

export async function GET(request: NextRequest) {
    const searchParams = request.nextUrl.searchParams;
    const countryCode = searchParams.get('country');

    if (!countryCode) {
        return NextResponse.json({ error: 'Country code required' }, { status: 400 });
    }

    const supabase = await createClient();

    const { data, error } = await supabase
        .from('healthcare_certifications')
        .select('*')
        .eq('country_code', countryCode)
        .eq('is_active', true)
        .order('category')
        .order('name');

    if (error) {
        console.error('Error fetching certifications:', error);
        return NextResponse.json({ error: error.message }, { status: 500 });
    }

    return NextResponse.json(data || []);
}
