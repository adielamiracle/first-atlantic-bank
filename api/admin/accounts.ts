import { createClient } from '@supabase/supabase-js';
import custodySeed from '../../src/lib/custodySeedData.json';

const sbUrl = (
  process.env.VITE_SUPABASE_URL ||
  process.env.NEXT_PUBLIC_SUPABASE_URL ||
  process.env.SUPABASE_URL ||
  ''
).trim();

const sbKey = (
  process.env.SUPABASE_SERVICE_ROLE_KEY ||
  process.env.VITE_SUPABASE_ANON_KEY ||
  process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY ||
  process.env.SUPABASE_ANON_KEY ||
  ''
).trim();

const supabase = sbUrl && sbKey ? createClient(sbUrl, sbKey) : null;

export default async function handler(req: any, res: any) {
  res.setHeader('Content-Type', 'application/json');

  try {
    let accounts = (custodySeed.accounts || []) as any[];

    if (supabase) {
      try {
        const { data, error } = await supabase.from('accounts').select('*');
        if (!error && data && data.length > 0) {
          const accMap = new Map<string, any>();
          accounts.forEach(a => accMap.set(a.id, a));
          data.forEach(dbAcc => {
            const mapped = {
              id: dbAcc.id,
              userId: dbAcc.user_id,
              accountNumber: dbAcc.account_number,
              accountNumberFull: dbAcc.account_number_full || dbAcc.account_number,
              routingNumber: dbAcc.routing_number || '021000089',
              iban: dbAcc.iban,
              swiftBic: dbAcc.swift_bic || 'FATLUS33NYC',
              name: dbAcc.name,
              type: dbAcc.type || 'CHECKING_PREMIER',
              currency: dbAcc.currency || 'USD',
              balanceMinor: Number(dbAcc.balance_minor || 0),
              availableBalanceMinor: Number(dbAcc.available_balance_minor || dbAcc.balance_minor || 0),
              pendingHoldMinor: 0,
              interestRateAPY: Number(dbAcc.interest_rate_apy || 1.25),
              status: dbAcc.status || 'ACTIVE',
              region: dbAcc.region || 'US',
              openedDate: dbAcc.created_at ? dbAcc.created_at.split('T')[0] : '2026-01-01',
              customerName: dbAcc.customer_name || 'Private Client'
            };
            accMap.set(mapped.id, { ...(accMap.get(mapped.id) || {}), ...mapped });
          });
          accounts = Array.from(accMap.values());
        }
      } catch (sbErr) {
        console.warn('Supabase accounts query notice:', sbErr);
      }
    }

    const totalNetWorthUsdMinor = accounts.reduce((sum, a) => {
      if (a.currency === 'USD') return sum + (a.balanceMinor || 0);
      if (a.currency === 'GBP') return sum + Math.round((a.balanceMinor || 0) * 1.274);
      if (a.currency === 'EUR') return sum + Math.round((a.balanceMinor || 0) * 1.087);
      return sum + (a.balanceMinor || 0);
    }, 0);

    return res.status(200).json({
      success: true,
      totalCount: accounts.length,
      accounts,
      totalNetWorthUsdMinor
    });
  } catch (err: any) {
    console.error('Fetch accounts error:', err);
    return res.status(500).json({ error: err?.message || 'Failed to fetch accounts' });
  }
}
