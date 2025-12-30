'use client';

import { useState } from 'react';
import styles from './Billing.module.css';
import { PLANS } from '@/lib/plans';

interface Props {
    subscription: {
        plan: string;
        status: string;
        current_period_end: string | null;
        stripe_customer_id: string | null;
    } | null;
    credits: {
        jobPostCredits: number;
        talentSearchCredits: number;
    } | null;
    companyName: string;
}

export function BillingClient({ subscription, credits, companyName }: Props) {
    const [loading, setLoading] = useState<string | null>(null);

    const currentPlan = subscription?.plan || 'free';
    const isActive = subscription?.status === 'active';

    async function handleCheckout(type: 'subscription' | 'credits', plan?: string, creditPack?: string) {
        setLoading(plan || creditPack || 'loading');

        try {
            const response = await fetch('/api/stripe/checkout', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ type, plan, creditPack }),
            });

            const data = await response.json();

            if (data.url) {
                window.location.href = data.url;
            } else {
                alert(data.error || 'Failed to start checkout');
            }
        } catch (error) {
            console.error('Checkout error:', error);
            alert('Failed to start checkout');
        } finally {
            setLoading(null);
        }
    }

    async function handleManageBilling() {
        setLoading('portal');

        try {
            const response = await fetch('/api/stripe/portal', {
                method: 'POST',
            });

            const data = await response.json();

            if (data.url) {
                window.location.href = data.url;
            } else {
                alert(data.error || 'Failed to open billing portal');
            }
        } catch (error) {
            console.error('Portal error:', error);
            alert('Failed to open billing portal');
        } finally {
            setLoading(null);
        }
    }

    return (
        <div className={styles.container}>
            {/* Overview Stats - Stripe-style */}
            <div className={styles.overviewGrid}>
                <div className={styles.statCard}>
                    <span className={styles.statLabel}>Current Plan</span>
                    <span className={styles.statValue}>
                        {currentPlan.charAt(0).toUpperCase() + currentPlan.slice(1)}
                    </span>
                    <div className={styles.statBadge}>
                        <span className={styles.badge} data-plan={currentPlan}>
                            {currentPlan.toUpperCase()}
                        </span>
                        {isActive && (
                            <span className={styles.badge} data-status="active">
                                Active
                            </span>
                        )}
                    </div>
                </div>

                <div className={styles.statCard}>
                    <span className={styles.statLabel}>Job Post Credits</span>
                    <span className={styles.statValue}>{credits?.jobPostCredits || 0}</span>
                    <span className={styles.statSubtext}>Available to use</span>
                </div>

                {currentPlan === 'enterprise' && (
                    <div className={styles.statCard}>
                        <span className={styles.statLabel}>Talent Search Credits</span>
                        <span className={styles.statValue}>{credits?.talentSearchCredits || 0}</span>
                        <span className={styles.statSubtext}>Available to use</span>
                    </div>
                )}

                <div className={styles.statCard}>
                    <span className={styles.statLabel}>Monthly Cost</span>
                    <span className={styles.statValue}>
                        ${PLANS[currentPlan as keyof typeof PLANS]?.price || 0}
                    </span>
                    {subscription?.current_period_end && (
                        <span className={styles.statSubtext}>
                            {isActive ? 'Renews' : 'Expires'} {new Date(subscription.current_period_end).toLocaleDateString()}
                        </span>
                    )}
                </div>
            </div>

            {/* Subscription Plans */}
            <section className={styles.section}>
                <div className={styles.sectionHeader}>
                    <h2 className={styles.sectionTitle}>Subscription Plans</h2>
                    {subscription?.stripe_customer_id && (
                        <button
                            onClick={handleManageBilling}
                            className={styles.sectionAction}
                            disabled={loading === 'portal'}
                        >
                            {loading === 'portal' ? 'Loading...' : 'Manage Billing →'}
                        </button>
                    )}
                </div>
                <div className={styles.sectionContent}>
                    <div className={styles.plansGrid}>
                        {/* Free */}
                        <div className={`${styles.planCard} ${currentPlan === 'free' ? styles.current : ''}`}>
                            <div className={styles.planHeader}>
                                <h3 className={styles.planName}>Free</h3>
                                <p className={styles.planPrice}>$0<span>/month</span></p>
                            </div>
                            <ul className={styles.featureList}>
                                <li><span className={styles.featureIcon}>✓</span> Basic job posting</li>
                                <li><span className={styles.featureIcon}>✓</span> Applicant management</li>
                                <li><span className={styles.featureIcon}>✓</span> 1 team member</li>
                                <li><span className={styles.featureIcon}>✓</span> Email support</li>
                            </ul>
                            <div className={styles.planAction}>
                                {currentPlan === 'free' ? (
                                    <div className={styles.currentPlanLabel}>Current Plan</div>
                                ) : (
                                    <div className={styles.currentPlanLabel}>—</div>
                                )}
                            </div>
                        </div>

                        {/* Pro */}
                        <div className={`${styles.planCard} ${styles.highlighted} ${currentPlan === 'pro' ? styles.current : ''}`}>
                            <span className={styles.popularTag}>Popular</span>
                            <div className={styles.planHeader}>
                                <h3 className={styles.planName}>Pro</h3>
                                <p className={styles.planPrice}>$20<span>/month</span></p>
                            </div>
                            <ul className={styles.featureList}>
                                <li><span className={styles.featureIcon}>🏅</span> Gold Recruiter Badge</li>
                                <li><span className={styles.featureIcon}>📊</span> Analytics Dashboard</li>
                                <li><span className={styles.featureIcon}>👥</span> 3 Team Members</li>
                                <li><span className={styles.featureIcon}>📥</span> CSV Export</li>
                                <li><span className={styles.featureIcon}>📝</span> Candidate Notes</li>
                                <li><span className={styles.featureIcon}>✉️</span> Email Templates</li>
                            </ul>
                            <div className={styles.planAction}>
                                {currentPlan === 'pro' ? (
                                    <div className={styles.currentPlanLabel}>Current Plan</div>
                                ) : currentPlan === 'free' ? (
                                    <button
                                        onClick={() => handleCheckout('subscription', 'pro')}
                                        className={styles.upgradeButton}
                                        disabled={loading === 'pro'}
                                    >
                                        {loading === 'pro' ? 'Loading...' : 'Upgrade to Pro'}
                                    </button>
                                ) : (
                                    <div className={styles.currentPlanLabel}>—</div>
                                )}
                            </div>
                        </div>

                        {/* Enterprise */}
                        <div className={`${styles.planCard} ${currentPlan === 'enterprise' ? styles.current : ''}`}>
                            <div className={styles.planHeader}>
                                <h3 className={styles.planName}>Enterprise</h3>
                                <p className={styles.planPrice}>$50<span>/month</span></p>
                            </div>
                            <ul className={styles.featureList}>
                                <li><span className={styles.featureIcon}>✓</span> Everything in Pro</li>
                                <li><span className={styles.featureIcon}>🔍</span> Talent Search (5/mo)</li>
                                <li><span className={styles.featureIcon}>👥</span> 5+ Team Members</li>
                                <li><span className={styles.featureIcon}>🎯</span> Headhunting Pipeline</li>
                                <li><span className={styles.featureIcon}>⚡</span> Priority Support</li>
                            </ul>
                            <div className={styles.planAction}>
                                {currentPlan === 'enterprise' ? (
                                    <div className={styles.currentPlanLabel}>Current Plan</div>
                                ) : (
                                    <button
                                        onClick={() => handleCheckout('subscription', 'enterprise')}
                                        className={styles.upgradeButton}
                                        disabled={loading === 'enterprise'}
                                    >
                                        {loading === 'enterprise' ? 'Loading...' : 'Upgrade to Enterprise'}
                                    </button>
                                )}
                            </div>
                        </div>
                    </div>
                </div>
            </section>

            {/* Buy Job Post Credits */}
            <section className={styles.section}>
                <div className={styles.sectionHeader}>
                    <h2 className={styles.sectionTitle}>Buy Job Post Credits</h2>
                </div>
                <div className={styles.sectionContent}>
                    <div className={styles.creditPacksGrid}>
                        <button
                            onClick={() => handleCheckout('credits', undefined, 'job_post_1')}
                            className={styles.creditPackCard}
                            disabled={loading === 'job_post_1'}
                        >
                            <div className={styles.packQuantity}>1 Credit</div>
                            <div className={styles.packPrice}>$2</div>
                        </button>
                        <button
                            onClick={() => handleCheckout('credits', undefined, 'job_post_5')}
                            className={styles.creditPackCard}
                            disabled={loading === 'job_post_5'}
                        >
                            <span className={styles.packSavings}>10% off</span>
                            <div className={styles.packQuantity}>5 Credits</div>
                            <div className={styles.packPrice}>$9</div>
                        </button>
                        <button
                            onClick={() => handleCheckout('credits', undefined, 'job_post_10')}
                            className={styles.creditPackCard}
                            disabled={loading === 'job_post_10'}
                        >
                            <span className={styles.packSavings}>20% off</span>
                            <div className={styles.packQuantity}>10 Credits</div>
                            <div className={styles.packPrice}>$16</div>
                        </button>
                    </div>
                </div>
            </section>

            {/* Talent Search Credits (Enterprise only) */}
            {currentPlan === 'enterprise' && (
                <section className={styles.section}>
                    <div className={styles.sectionHeader}>
                        <h2 className={styles.sectionTitle}>Buy Talent Search Credits</h2>
                    </div>
                    <div className={styles.sectionContent}>
                        <div className={styles.creditPacksGrid}>
                            <button
                                onClick={() => handleCheckout('credits', undefined, 'talent_search_1')}
                                className={styles.creditPackCard}
                                disabled={loading === 'talent_search_1'}
                            >
                                <div className={styles.packQuantity}>1 Credit</div>
                                <div className={styles.packPrice}>$8</div>
                            </button>
                            <button
                                onClick={() => handleCheckout('credits', undefined, 'talent_search_5')}
                                className={styles.creditPackCard}
                                disabled={loading === 'talent_search_5'}
                            >
                                <span className={styles.packSavings}>12% off</span>
                                <div className={styles.packQuantity}>5 Credits</div>
                                <div className={styles.packPrice}>$35</div>
                            </button>
                            <button
                                onClick={() => handleCheckout('credits', undefined, 'talent_search_10')}
                                className={styles.creditPackCard}
                                disabled={loading === 'talent_search_10'}
                            >
                                <span className={styles.packSavings}>25% off</span>
                                <div className={styles.packQuantity}>10 Credits</div>
                                <div className={styles.packPrice}>$60</div>
                            </button>
                        </div>
                    </div>
                </section>
            )}
        </div>
    );
}
