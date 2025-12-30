import { NextRequest, NextResponse } from 'next/server';
import { createClient } from '@/utils/supabase/server';
import {
    stripe,
    createCheckoutSession,
    createCreditCheckoutSession,
    getOrCreateCustomer,
    STRIPE_PRICES
} from '@/lib/stripe';

export async function POST(request: NextRequest) {
    try {
        const supabase = await createClient();
        const { data: { user } } = await supabase.auth.getUser();

        if (!user) {
            return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
        }

        const body = await request.json();
        const { type, plan, creditPack } = body;

        // Get company for this user
        const { data: company } = await supabase
            .from('companies')
            .select('id, name, owner_id')
            .eq('owner_id', user.id)
            .single();

        if (!company) {
            return NextResponse.json({ error: 'Company not found' }, { status: 404 });
        }

        // Get or create Stripe customer
        const customer = await getOrCreateCustomer({
            companyId: company.id,
            email: user.email!,
            name: company.name,
        });

        // Update subscription with Stripe customer ID
        await supabase
            .from('subscriptions')
            .update({ stripe_customer_id: customer.id })
            .eq('company_id', company.id);

        const baseUrl = process.env.NEXT_PUBLIC_APP_URL || 'http://localhost:3000';
        const successUrl = `${baseUrl}/dashboard/billing?success=true`;
        const cancelUrl = `${baseUrl}/dashboard/billing?canceled=true`;

        // Handle subscription checkout
        if (type === 'subscription') {
            const priceId = plan === 'pro'
                ? STRIPE_PRICES.PRO_MONTHLY
                : STRIPE_PRICES.ENTERPRISE_MONTHLY;

            const session = await createCheckoutSession({
                companyId: company.id,
                customerId: customer.id,
                priceId,
                successUrl,
                cancelUrl,
            });

            return NextResponse.json({ url: session.url });
        }

        // Handle credit purchase
        if (type === 'credits') {
            let priceId: string;
            let quantity: number;
            let creditType: 'job_post' | 'talent_search';

            switch (creditPack) {
                case 'job_post_1':
                    priceId = STRIPE_PRICES.JOB_POST_1;
                    quantity = 1;
                    creditType = 'job_post';
                    break;
                case 'job_post_5':
                    priceId = STRIPE_PRICES.JOB_POST_5;
                    quantity = 5;
                    creditType = 'job_post';
                    break;
                case 'job_post_10':
                    priceId = STRIPE_PRICES.JOB_POST_10;
                    quantity = 10;
                    creditType = 'job_post';
                    break;
                case 'talent_search_1':
                    priceId = STRIPE_PRICES.TALENT_SEARCH_1;
                    quantity = 1;
                    creditType = 'talent_search';
                    break;
                case 'talent_search_5':
                    priceId = STRIPE_PRICES.TALENT_SEARCH_5;
                    quantity = 5;
                    creditType = 'talent_search';
                    break;
                case 'talent_search_10':
                    priceId = STRIPE_PRICES.TALENT_SEARCH_10;
                    quantity = 10;
                    creditType = 'talent_search';
                    break;
                default:
                    return NextResponse.json({ error: 'Invalid credit pack' }, { status: 400 });
            }

            const session = await createCreditCheckoutSession({
                companyId: company.id,
                customerId: customer.id,
                priceId,
                quantity, // Use the actual quantity from the pack!
                creditType,
                successUrl,
                cancelUrl,
            });

            return NextResponse.json({ url: session.url });
        }

        return NextResponse.json({ error: 'Invalid checkout type' }, { status: 400 });

    } catch (error) {
        console.error('Checkout error:', error);
        return NextResponse.json(
            { error: 'Failed to create checkout session' },
            { status: 500 }
        );
    }
}
