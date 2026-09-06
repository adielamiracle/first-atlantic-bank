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
    let users = (custodySeed.users || []) as any[];

    if (supabase) {
      try {
        const { data, error } = await supabase.from('users').select('*');
        if (!error && data && data.length > 0) {
          const userMap = new Map<string, any>();
          users.forEach(u => userMap.set(u.id, u));
          data.forEach(dbUser => {
            const mapped = {
              id: dbUser.id,
              firstName: dbUser.first_name || dbUser.firstName || 'Client',
              lastName: dbUser.last_name || dbUser.lastName || '',
              email: dbUser.email,
              username: dbUser.username || dbUser.email?.split('@')[0],
              phone: dbUser.phone || '+1 555-0199',
              region: dbUser.region || 'US',
              approval_status: dbUser.approval_status || 'APPROVED',
              kycTier: dbUser.kyc_tier || 'TIER_2_VERIFIED_PREMIER',
              created_at: dbUser.created_at
            };
            userMap.set(mapped.id, { ...(userMap.get(mapped.id) || {}), ...mapped });
          });
          users = Array.from(userMap.values());
        }
      } catch (sbErr) {
        console.warn('Supabase users query notice:', sbErr);
      }
    }

    return res.status(200).json({
      success: true,
      count: users.length,
      users
    });
  } catch (err: any) {
    console.error('Fetch users error:', err);
    return res.status(500).json({ error: err?.message || 'Failed to fetch users' });
  }
}
