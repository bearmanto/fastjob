import { NextResponse } from 'next/server';
import { createClient } from '@supabase/supabase-js';

// DEBUG ENDPOINT - uses service role to bypass RLS
// Access at: /api/debug/subscriptions
export async function GET() {
    const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL!;
    const serviceRoleKey = process.env.SUPABASE_SERVICE_ROLE_KEY!;

    if (!serviceRoleKey) {
        return NextResponse.json({ error: 'No service role key' }, { status: 500 });
    }

    // Create admin client that bypasses RLS
    const supabase = createClient(supabaseUrl, serviceRoleKey);

    // Get all companies
    const { data: companies, error: compError } = await supabase
        .from('companies')
        .select('id, name, owner_id, verified');

    // Get all subscriptions
    const { data: subscriptions, error: subError } = await supabase
        .from('subscriptions')
        .select('*');

    // Get all credit_balances
    const { data: credits, error: credError } = await supabase
        .from('credit_balances')
        .select('*');

    return NextResponse.json({
        companies: { data: companies, error: compError },
        subscriptions: { data: subscriptions, error: subError },
        credits: { data: credits, error: credError }
    });
}
