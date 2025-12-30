import { createClient } from '@/utils/supabase/server';
import { PLANS, PlanType } from './plans';

/**
 * Get the current subscription plan for a company
 */
export async function getCompanyPlan(companyId: string): Promise<PlanType> {
    const supabase = await createClient();

    // 1. Try standard query first
    const { data, error } = await supabase
        .from('subscriptions')
        .select('plan, status')
        .eq('company_id', companyId)
        .single();

    // 2. If valid data found, return it
    if (data && !error && data.status === 'active') {
        return (data.plan as PlanType) || 'free';
    }

    // 3. Fallback: Try RPC if standard query fails (e.g. schema cache issues)
    if (error) {
        console.warn('Subscription table query failed, trying RPC fallback...', error.message);

        try {
            const { data: rpcData, error: rpcError } = await supabase.rpc('get_subscription_v2', {
                p_company_id: companyId
            });

            if (!rpcError && rpcData && rpcData.length > 0) {
                const sub = rpcData[0];
                if (sub.status === 'active') {
                    return (sub.plan as PlanType) || 'free';
                }
            }
        } catch (e) {
            console.error('RPC fallback failed:', e);
        }
    }

    return 'free';
}

/**
 * Check if company has Pro or higher
 */
export async function requirePro(companyId: string): Promise<boolean> {
    const plan = await getCompanyPlan(companyId);
    return plan === 'pro' || plan === 'enterprise';
}

/**
 * Check if company has Enterprise
 */
export async function requireEnterprise(companyId: string): Promise<boolean> {
    const plan = await getCompanyPlan(companyId);
    return plan === 'enterprise';
}

/**
 * Get credit balance for a company
 */
export async function getCreditBalance(companyId: string): Promise<{
    jobPostCredits: number;
    talentSearchCredits: number;
}> {
    const supabase = await createClient();

    // 1. Try standard query
    const { data, error } = await supabase
        .from('credit_balances')
        .select('job_post_credits, talent_search_credits')
        .eq('company_id', companyId)
        .single();

    if (data && !error) {
        return {
            jobPostCredits: data.job_post_credits ?? 0,
            talentSearchCredits: data.talent_search_credits ?? 0,
        };
    }

    // 2. Fallback: Try RPC (bypasses RLS)
    console.log('Direct credit_balances query failed, trying RPC fallback...', error?.message);
    try {
        const { data: rpcData, error: rpcError } = await supabase.rpc('get_credit_balance', {
            p_company_id: companyId
        });

        console.log('RPC get_credit_balance result:', { rpcData, rpcError });

        if (rpcError) {
            console.error('RPC Error:', rpcError.message, rpcError.code);
        }

        if (!rpcError && rpcData && rpcData.length > 0) {
            const credits = rpcData[0];
            console.log('Returning credits from RPC:', credits);
            return {
                jobPostCredits: credits.job_post_credits ?? 0,
                talentSearchCredits: credits.talent_search_credits ?? 0,
            };
        }
    } catch (e) {
        console.error('RPC credit fallback failed:', e);
    }

    console.log('All credit queries failed, returning 0');
    return {
        jobPostCredits: 0,
        talentSearchCredits: 0,
    };
}

/**
 * Use job post credit (deduct 1)
 */
export async function useJobPostCredit(companyId: string): Promise<boolean> {
    const supabase = await createClient();

    // Check current balance
    const balance = await getCreditBalance(companyId);
    if (balance.jobPostCredits <= 0) {
        return false;
    }

    // Deduct credit
    const { error } = await supabase
        .from('credit_balances')
        .update({
            job_post_credits: balance.jobPostCredits - 1,
            updated_at: new Date().toISOString()
        })
        .eq('company_id', companyId);

    if (error) {
        console.error('Failed to deduct job post credit:', error);
        return false;
    }

    // Log transaction
    await supabase.from('credit_transactions').insert({
        company_id: companyId,
        credit_type: 'job_post',
        amount: -1,
        reason: 'used',
    });

    return true;
}

/**
 * Use talent search credit (deduct 1)
 */
export async function useTalentSearchCredit(companyId: string): Promise<boolean> {
    const supabase = await createClient();

    // Check current balance
    const balance = await getCreditBalance(companyId);
    if (balance.talentSearchCredits <= 0) {
        return false;
    }

    // Deduct credit
    const { error } = await supabase
        .from('credit_balances')
        .update({
            talent_search_credits: balance.talentSearchCredits - 1,
            updated_at: new Date().toISOString()
        })
        .eq('company_id', companyId);

    if (error) {
        console.error('Failed to deduct talent search credit:', error);
        return false;
    }

    // Log transaction
    await supabase.from('credit_transactions').insert({
        company_id: companyId,
        credit_type: 'talent_search',
        amount: -1,
        reason: 'used',
    });

    return true;
}

/**
 * Add credits to a company (for purchases or monthly grants)
 */
export async function addCredits(
    companyId: string,
    creditType: 'job_post' | 'talent_search',
    amount: number,
    reason: string,
    stripePaymentIntentId?: string,
    supabaseClient?: any // Optional: Pass admin client for webhooks
): Promise<boolean> {
    const supabase = supabaseClient || await createClient();

    // READ balance using the same client (critical for webhook admin access)
    // We do NOT use getCreditBalance helper because we need to use 'supabase' client which might be admin
    const { data: balanceData, error: balanceError } = await supabase
        .from('credit_balances')
        .select('job_post_credits, talent_search_credits')
        .eq('company_id', companyId)
        .single();

    // Default to 0 if not found (or error)
    const currentJobPost = balanceData?.job_post_credits ?? 0;
    const currentTalentSearch = balanceData?.talent_search_credits ?? 0;

    // Use UPSERT instead of UPDATE to handle missing rows
    const { error } = await supabase
        .from('credit_balances')
        .upsert({
            company_id: companyId,
            job_post_credits: creditType === 'job_post' ? currentJobPost + amount : currentJobPost,
            talent_search_credits: creditType === 'talent_search' ? currentTalentSearch + amount : currentTalentSearch,
            updated_at: new Date().toISOString()
        }, {
            onConflict: 'company_id'
        });

    if (error) {
        console.error('Failed to add credits:', error);
        return false;
    }

    // Log transaction
    await supabase.from('credit_transactions').insert({
        company_id: companyId,
        credit_type: creditType,
        amount,
        reason,
        stripe_payment_intent_id: stripePaymentIntentId,
    });

    return true;
}

/**
 * Get subscription details for a company
 */
export async function getSubscription(companyId: string) {
    const supabase = await createClient();

    // 1. Try standard query
    const { data, error } = await supabase
        .from('subscriptions')
        .select('*')
        .eq('company_id', companyId)
        .single();

    if (data && !error) {
        return data;
    }

    // 2. Fallback: RPC (Use upgraded v2 for full object)
    if (error) {
        try {
            const { data: rpcData } = await supabase.rpc('get_subscription_v2', {
                p_company_id: companyId
            });

            if (rpcData && rpcData.length > 0) {
                return rpcData[0];
            }
        } catch (e) {
            console.error('RPC subscription fallback failed:', e);
        }
    }

    return null;
}

/**
 * Get plan features and limits
 */
export function getPlanDetails(plan: PlanType) {
    return PLANS[plan];
}

/**
 * Check if a feature is available for a plan
 */
export function isPro(plan: string): boolean {
    return plan === 'pro' || plan === 'enterprise';
}

export function isEnterprise(plan: string): boolean {
    return plan === 'enterprise';
}
