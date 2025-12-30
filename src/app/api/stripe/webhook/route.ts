import { NextRequest, NextResponse } from 'next/server';
import { headers } from 'next/headers';
import { stripe } from '@/lib/stripe';
import { addCredits } from '@/lib/subscription';
import { createClient } from '@supabase/supabase-js';
import Stripe from 'stripe';

// Use service role client for webhook (bypasses RLS)
const supabaseAdmin = createClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.SUPABASE_SERVICE_ROLE_KEY!
);

export async function POST(request: NextRequest) {
    const body = await request.text();
    const headersList = await headers();
    const signature = headersList.get('stripe-signature');

    if (!signature) {
        return NextResponse.json({ error: 'No signature' }, { status: 400 });
    }

    let event: Stripe.Event;

    try {
        event = stripe.webhooks.constructEvent(
            body,
            signature,
            process.env.STRIPE_WEBHOOK_SECRET!
        );
    } catch (err) {
        console.error('Webhook signature verification failed:', err);
        return NextResponse.json({ error: 'Invalid signature' }, { status: 400 });
    }

    try {
        switch (event.type) {
            case 'checkout.session.completed': {
                const session = event.data.object as Stripe.Checkout.Session;
                await handleCheckoutCompleted(session);
                break;
            }

            case 'customer.subscription.created':
            case 'customer.subscription.updated': {
                const subscription = event.data.object as Stripe.Subscription;
                await handleSubscriptionUpdated(subscription);
                break;
            }

            case 'customer.subscription.deleted': {
                const subscription = event.data.object as Stripe.Subscription;
                await handleSubscriptionDeleted(subscription);
                break;
            }

            case 'invoice.payment_succeeded': {
                const invoice = event.data.object as Stripe.Invoice;
                await handleInvoicePaymentSucceeded(invoice);
                break;
            }

            case 'invoice.payment_failed': {
                const invoice = event.data.object as Stripe.Invoice;
                await handleInvoicePaymentFailed(invoice);
                break;
            }

            default:
                console.log(`Unhandled event type: ${event.type}`);
        }

        return NextResponse.json({ received: true });

    } catch (error) {
        console.error('Webhook handler error:', error);
        return NextResponse.json(
            { error: 'Webhook handler failed' },
            { status: 500 }
        );
    }
}

/**
 * Handle completed checkout session
 */
async function handleCheckoutCompleted(session: Stripe.Checkout.Session) {
    console.log('=== CHECKOUT COMPLETED ===');
    console.log('Session ID:', session.id);
    console.log('Session mode:', session.mode);
    console.log('Session metadata:', JSON.stringify(session.metadata));

    const companyId = session.metadata?.companyId;
    if (!companyId) {
        console.error('❌ No companyId in session metadata');
        return;
    }

    // Handle credit purchase
    if (session.mode === 'payment') {
        const creditType = session.metadata?.creditType as 'job_post' | 'talent_search';
        const quantity = parseInt(session.metadata?.quantity || '0', 10);

        console.log('Credit Type:', creditType);
        console.log('Quantity:', quantity);
        console.log('Company ID:', companyId);

        if (creditType && quantity > 0) {
            console.log('>>> Calling addCredits...');
            const result = await addCredits(
                companyId,
                creditType,
                quantity,
                'purchase',
                session.payment_intent as string,
                supabaseAdmin // PASS ADMIN CLIENT
            );
            console.log('>>> addCredits result:', result);
            console.log(`✅ Added ${quantity} ${creditType} credits to company ${companyId}`);
        } else {
            console.log('⚠️ Missing creditType or quantity is 0');
        }
    } else {
        console.log('Mode is not "payment", skipping credit addition');
    }

    // Subscription is handled by subscription.created/updated events
}

/**
 * Handle subscription created or updated
 */
async function handleSubscriptionUpdated(subscription: Stripe.Subscription) {
    const companyId = subscription.metadata?.companyId;
    if (!companyId) {
        console.error('No companyId in subscription metadata');
        return;
    }

    // Determine plan from price
    const priceId = subscription.items.data[0]?.price.id;
    let plan: 'free' | 'pro' | 'enterprise' = 'free';

    if (priceId === process.env.STRIPE_PRICE_PRO_MONTHLY) {
        plan = 'pro';
    } else if (priceId === process.env.STRIPE_PRICE_ENTERPRISE_MONTHLY) {
        plan = 'enterprise';
    }

    // Map Stripe status to our status
    let status: 'active' | 'canceled' | 'past_due' | 'trialing' = 'active';
    switch (subscription.status) {
        case 'active':
            status = 'active';
            break;
        case 'past_due':
            status = 'past_due';
            break;
        case 'canceled':
        case 'unpaid':
            status = 'canceled';
            break;
        case 'trialing':
            status = 'trialing';
            break;
        default:
            status = 'active';
    }

    // Update subscription in database
    const { error } = await supabaseAdmin
        .from('subscriptions')
        .upsert({
            company_id: companyId,
            stripe_customer_id: subscription.customer as string,
            stripe_subscription_id: subscription.id,
            plan,
            status,
            current_period_start: new Date((subscription as unknown as { current_period_start: number }).current_period_start * 1000).toISOString(),
            current_period_end: new Date((subscription as unknown as { current_period_end: number }).current_period_end * 1000).toISOString(),
            updated_at: new Date().toISOString(),
        }, {
            onConflict: 'company_id',
        });

    if (error) {
        console.error('Failed to update subscription:', error);
        return;
    }

    console.log(`Updated subscription for company ${companyId}: ${plan} (${status})`);

    // Grant monthly talent search credits for Enterprise
    if (plan === 'enterprise' && status === 'active') {
        // This will be handled in invoice.payment_succeeded for renewals
    }
}

/**
 * Handle subscription deleted (canceled)
 */
async function handleSubscriptionDeleted(subscription: Stripe.Subscription) {
    const companyId = subscription.metadata?.companyId;
    if (!companyId) {
        console.error('No companyId in subscription metadata');
        return;
    }

    // Downgrade to free
    const { error } = await supabaseAdmin
        .from('subscriptions')
        .update({
            plan: 'free',
            status: 'canceled',
            stripe_subscription_id: null,
            updated_at: new Date().toISOString(),
        })
        .eq('company_id', companyId);

    if (error) {
        console.error('Failed to cancel subscription:', error);
        return;
    }

    console.log(`Canceled subscription for company ${companyId}`);
}

/**
 * Handle successful invoice payment (renewal)
 */
async function handleInvoicePaymentSucceeded(invoice: Stripe.Invoice) {
    // Only process subscription invoices
    const subscriptionId = (invoice as unknown as { subscription?: string | null }).subscription;
    if (!subscriptionId) return;

    const subscription = await stripe.subscriptions.retrieve(subscriptionId);
    const companyId = subscription.metadata?.companyId;

    if (!companyId) return;

    // Check if this is an Enterprise renewal
    const priceId = subscription.items.data[0]?.price.id;
    if (priceId === process.env.STRIPE_PRICE_ENTERPRISE_MONTHLY) {
        // Grant monthly talent search credits
        await addCredits(companyId, 'talent_search', 5, 'monthly_grant', undefined, supabaseAdmin); // PASS ADMIN CLIENT
        console.log(`Granted 5 talent search credits to company ${companyId} (monthly)`);
    }
}

/**
 * Handle failed invoice payment
 */
async function handleInvoicePaymentFailed(invoice: Stripe.Invoice) {
    const subscriptionId = (invoice as unknown as { subscription?: string | null }).subscription;
    if (!subscriptionId) return;

    const subscription = await stripe.subscriptions.retrieve(subscriptionId);
    const companyId = subscription.metadata?.companyId;

    if (!companyId) return;

    // Update status to past_due
    await supabaseAdmin
        .from('subscriptions')
        .update({
            status: 'past_due',
            updated_at: new Date().toISOString(),
        })
        .eq('company_id', companyId);

    console.log(`Payment failed for company ${companyId}`);
}
