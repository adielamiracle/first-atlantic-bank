import { createClient, SupabaseClient } from '@supabase/supabase-js';

const sbUrl = (process.env.NEXT_PUBLIC_SUPABASE_URL || process.env.SUPABASE_URL || '').trim();
const sbKey = (process.env.SUPABASE_SERVICE_ROLE_KEY || process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY || process.env.SUPABASE_ANON_KEY || '').trim();

export const isServerSupabaseConfigured = Boolean(
  sbUrl &&
  sbKey &&
  sbUrl.startsWith('https://') &&
  sbUrl.includes('.supabase.co') &&
  !sbUrl.includes('first-atlantic-bank.supabase.co') &&
  !sbKey.includes('mock_signature_key') &&
  sbKey.length > 20
);

let serverSupabaseClient: SupabaseClient | null = null;

if (isServerSupabaseConfigured) {
  try {
    serverSupabaseClient = createClient(sbUrl, sbKey, {
      auth: {
        persistSession: false,
        autoRefreshToken: false
      }
    });
    console.info('[First Atlantic Bank Backend] Supabase Cloud Gateway Connected:', sbUrl);
  } catch (e) {
    console.warn('[First Atlantic Bank Backend] Supabase initialization notice:', e);
    serverSupabaseClient = null;
  }
}

export function getServerSupabase(): SupabaseClient | null {
  return serverSupabaseClient;
}

/**
 * Non-blocking safe sync to Supabase table
 */
export async function syncRecordToSupabase(tableName: string, record: any): Promise<boolean> {
  if (!serverSupabaseClient || !record) return false;
  try {
    const item = Array.isArray(record) ? record : [record];
    const { error } = await serverSupabaseClient
      .from(tableName)
      .upsert(item, { onConflict: 'id' });

    if (error) {
      console.debug(`[Supabase Table Sync ${tableName}]:`, error.message);
      return false;
    }
    return true;
  } catch (err: any) {
    console.debug(`[Supabase Sync Catch ${tableName}]:`, err?.message || err);
    return false;
  }
}

/**
 * Helper to sync full user and application dossier to Supabase if connected
 */
export async function syncNewRegistrationToSupabase(user: any, application: any, accounts: any[] = []) {
  if (!serverSupabaseClient) return;

  try {
    // 1. Sync Application
    if (application) {
      await syncRecordToSupabase('applications', {
        id: application.id,
        reference_number: application.referenceNumber,
        first_name: application.firstName,
        last_name: application.lastName,
        email: application.email,
        phone: application.phone,
        region: application.requestedRegion,
        currency: application.requestedCurrency,
        status: application.status,
        submitted_at: application.submittedAt,
        data: application
      });
    }

    // 2. Sync User Profile
    if (user) {
      await syncRecordToSupabase('users', {
        id: user.id,
        username: user.username,
        email: user.email,
        first_name: user.firstName,
        last_name: user.lastName,
        phone: user.phone,
        region: user.region,
        approval_status: user.approval_status,
        kyc_tier: user.kycTier,
        created_at: new Date().toISOString(),
        profile_data: user
      });
    }

    // 3. Sync Accounts
    for (const acc of accounts) {
      await syncRecordToSupabase('accounts', {
        id: acc.id,
        user_id: acc.userId,
        account_number: acc.accountNumber,
        account_number_full: acc.accountNumberFull,
        name: acc.name,
        type: acc.type,
        currency: acc.currency,
        balance_minor: acc.balanceMinor,
        status: acc.status,
        region: acc.region,
        created_at: new Date().toISOString()
      });
    }
  } catch (e) {
    console.debug('[Supabase Sync Background Notice]:', e);
  }
}
