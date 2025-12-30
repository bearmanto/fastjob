import { createClient } from '@supabase/supabase-js';
import { NextResponse } from 'next/server';

export async function GET() {
    // 1. Init Service Role Client (Bypasses RLS)
    const supabase = createClient(
        process.env.NEXT_PUBLIC_SUPABASE_URL!,
        process.env.SUPABASE_SERVICE_ROLE_KEY!
    );

    const log: string[] = [];
    const addLog = (msg: string) => {
        console.log(msg);
        log.push(msg);
    };

    addLog('Starting In-App Database Fix...');
    addLog(`Target Project URL: ${process.env.NEXT_PUBLIC_SUPABASE_URL}`);

    try {
        // 2. Find the target company being used by the App
        // We look for the one that the dashboard is likely loading
        const { data: companies, error: companyError } = await supabase
            .from('companies')
            .select('*')
            .ilike('name', '%Sumber Sukses%');

        if (companyError) throw companyError;

        // Test the new RPC function
        addLog('🔎 Testing get_credit_balance RPC...');
        const testCompanyId = '248f8a51-fc8e-4894-a454-8c1f657e8caf';

        const { data: creditRpcData, error: creditRpcError } = await supabase.rpc('get_credit_balance', {
            p_company_id: testCompanyId
        });

        if (creditRpcError) {
            addLog(`❌ RPC Error: ${creditRpcError.message}`);
            addLog(`   MAKE SURE you ran the SQL in the CORRECT PROJECT!`);
        } else if (creditRpcData && creditRpcData.length > 0) {
            addLog(`✅ RPC Success! Credits: job=${creditRpcData[0].job_post_credits}, talent=${creditRpcData[0].talent_search_credits}`);
        } else {
            addLog(`⚠️ RPC returned empty - no rows found`);
        }

        if (!companies || companies.length === 0) {
            addLog('❌ No company found matching "Sumber Sukses"');
            return NextResponse.json({ log });
        }

        addLog(`✅ Found ${companies.length} companies.`);

        // 3. Fix EACH found company
        for (const company of companies) {
            addLog(`🔧 Fixing Company: ${company.name} (ID: ${company.id})`);

            // A. Upsert Subscription
            const { error: subError } = await supabase
                .from('subscriptions')
                .upsert({
                    company_id: company.id,
                    plan: 'enterprise',
                    status: 'active',
                    created_at: new Date().toISOString(),
                    updated_at: new Date().toISOString()
                }, { onConflict: 'company_id' });

            if (subError) {
                addLog(`   ❌ Failed to update subscription: ${subError.message}`);
                // Try delete and insert if upsert fails oddly
                await supabase.from('subscriptions').delete().eq('company_id', company.id);
                const { error: retryError } = await supabase.from('subscriptions').insert({
                    company_id: company.id,
                    plan: 'enterprise',
                    status: 'active'
                });
                if (retryError) addLog(`   ❌ Retry failed: ${retryError.message}`);
                else addLog(`   ✅ Retry insert success`);
            } else {
                addLog(`   ✅ Subscription updated to Enterprise`);
            }

            // B. Upsert Credits
            const { error: credError } = await supabase
                .from('credit_balances')
                .upsert({
                    company_id: company.id,
                    job_post_credits: 5,
                    talent_search_credits: 5,
                    updated_at: new Date().toISOString()
                }, { onConflict: 'company_id' });

            if (credError) {
                addLog(`   ❌ Failed to update credits: ${credError.message}`);
            } else {
                addLog(`   ✅ Credits set to 5/5`);
            }
        }
        addLog('🎉 Fix Complete!');

        // 4. VERIFY RPC EXISTENCE
        addLog('🔎 Verifying RPC Function...');
        const targetCompany = companies[0]; // Use the first found company
        const { data: rpcData, error: rpcError } = await supabase.rpc('get_subscription_v2', {
            p_company_id: targetCompany.id
        });

        if (rpcError) {
            addLog(`❌ RPC Test Failed: ${rpcError.message}`);
            addLog(`   Hint: Did you run the SQL script in the correct project?`);
        } else {
            addLog(`✅ RPC Test Success! Returned: ${JSON.stringify(rpcData)}`);
        }

        return NextResponse.json({ success: true, log });
        addLog('🎉 Fix Complete!');
        return NextResponse.json({ success: true, log });

    } catch (e: any) {
        addLog(`❌ CRITICAL ERROR: ${e.message}`);
        return NextResponse.json({ success: false, log, error: e.message }, { status: 500 });
    }
}
