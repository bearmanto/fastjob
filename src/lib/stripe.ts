import Stripe from 'stripe';

// Re-export shared types
export { PLANS, type PlanType } from './plans';

// Initialize Stripe with secret key (SERVER ONLY)
export const stripe = new Stripe(process.env.STRIPE_SECRET_KEY!, {
    typescript: true,
});

// Stripe Price IDs (set in Stripe Dashboard)
export const STRIPE_PRICES = {
    PRO_MONTHLY: process.env.STRIPE_PRICE_PRO_MONTHLY!,
    ENTERPRISE_MONTHLY: process.env.STRIPE_PRICE_ENTERPRISE_MONTHLY!,
    JOB_POST_1: process.env.STRIPE_PRICE_JOB_POST_1!,
    JOB_POST_5: process.env.STRIPE_PRICE_JOB_POST_5!,
    JOB_POST_10: process.env.STRIPE_PRICE_JOB_POST_10!,
    TALENT_SEARCH_1: process.env.STRIPE_PRICE_TALENT_SEARCH_1!,
    TALENT_SEARCH_5: process.env.STRIPE_PRICE_TALENT_SEARCH_5!,
    TALENT_SEARCH_10: process.env.STRIPE_PRICE_TALENT_SEARCH_10!,
} as const;



/**
 * Create a Stripe Checkout session for subscription
 */
export async function createCheckoutSession({
    companyId,
    customerId,
    priceId,
    successUrl,
    cancelUrl,
}: {
    companyId: string;
    customerId?: string;
    priceId: string;
    successUrl: string;
    cancelUrl: string;
}) {
    const session = await stripe.checkout.sessions.create({
        customer: customerId,
        mode: 'subscription',
        payment_method_types: ['card'],
        line_items: [{ price: priceId, quantity: 1 }],
        success_url: successUrl,
        cancel_url: cancelUrl,
        metadata: {
            companyId,
        },
        subscription_data: {
            metadata: {
                companyId,
            },
        },
    });

    return session;
}

/**
 * Create a Stripe Checkout session for one-time credit purchase
 */
export async function createCreditCheckoutSession({
    companyId,
    customerId,
    priceId,
    quantity,
    creditType,
    successUrl,
    cancelUrl,
}: {
    companyId: string;
    customerId?: string;
    priceId: string;
    quantity: number;
    creditType: 'job_post' | 'talent_search';
    successUrl: string;
    cancelUrl: string;
}) {
    const session = await stripe.checkout.sessions.create({
        customer: customerId,
        mode: 'payment',
        payment_method_types: ['card'],
        line_items: [{ price: priceId, quantity }],
        success_url: successUrl,
        cancel_url: cancelUrl,
        metadata: {
            companyId,
            creditType,
            quantity: quantity.toString(),
        },
    });

    return session;
}

/**
 * Create a Stripe Customer Portal session
 */
export async function createPortalSession({
    customerId,
    returnUrl,
}: {
    customerId: string;
    returnUrl: string;
}) {
    const session = await stripe.billingPortal.sessions.create({
        customer: customerId,
        return_url: returnUrl,
    });

    return session;
}

/**
 * Get or create a Stripe customer for a company
 */
export async function getOrCreateCustomer({
    companyId,
    email,
    name,
}: {
    companyId: string;
    email: string;
    name: string;
}) {
    // Search for existing customer by metadata
    const existingCustomers = await stripe.customers.list({
        email,
        limit: 1,
    });

    if (existingCustomers.data.length > 0) {
        return existingCustomers.data[0];
    }

    // Create new customer
    const customer = await stripe.customers.create({
        email,
        name,
        metadata: {
            companyId,
        },
    });

    return customer;
}
