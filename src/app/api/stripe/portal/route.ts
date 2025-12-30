import { NextRequest, NextResponse } from 'next/server';
import { createClient } from '@/utils/supabase/server';
import { createPortalSession } from '@/lib/stripe';

export async function POST(request: NextRequest) {
    try {
        const supabase = await createClient();
        const { data: { user } } = await supabase.auth.getUser();

        if (!user) {
            return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
        }

        // Get subscription with Stripe customer ID
        const { data: company } = await supabase
            .from('companies')
            .select('id')
            .eq('owner_id', user.id)
            .single();

        if (!company) {
            return NextResponse.json({ error: 'Company not found' }, { status: 404 });
        }

        const { data: subscription } = await supabase
            .from('subscriptions')
            .select('stripe_customer_id')
            .eq('company_id', company.id)
            .single();

        if (!subscription?.stripe_customer_id) {
            return NextResponse.json(
                { error: 'No billing account found. Please subscribe first.' },
                { status: 400 }
            );
        }

        const baseUrl = process.env.NEXT_PUBLIC_APP_URL || 'http://localhost:3000';

        const session = await createPortalSession({
            customerId: subscription.stripe_customer_id,
            returnUrl: `${baseUrl}/dashboard/billing`,
        });

        return NextResponse.json({ url: session.url });

    } catch (error) {
        console.error('Portal error:', error);
        return NextResponse.json(
            { error: 'Failed to create portal session' },
            { status: 500 }
        );
    }
}
