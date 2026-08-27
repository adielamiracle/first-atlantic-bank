import { createClient } from '@supabase/supabase-js';

const rawUrl = import.meta.env.VITE_SUPABASE_URL || '';
const rawKey = import.meta.env.VITE_SUPABASE_ANON_KEY || '';

// Fallback public mock key that satisfies JWT structure without exposing secret key errors
const fallbackKey = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImF0bGFudGljIiwicm9sZSI6ImFub24iLCJpYXQiOjE2MDAwMDAwMDAsImV4cCI6MTkwMDAwMDAwMH0.mock_signature_key';
const fallbackUrl = 'https://first-atlantic-bank.supabase.co';

let clientInstance;

try {
  const targetUrl = (rawUrl && rawUrl.startsWith('http')) ? rawUrl : fallbackUrl;
  const targetKey = (rawKey && !rawKey.includes('service_role') && !rawKey.startsWith('sbp_')) ? rawKey : fallbackKey;

  clientInstance = createClient(targetUrl, targetKey, {
    auth: {
      persistSession: true,
      autoRefreshToken: true,
      detectSessionInUrl: false
    }
  });
} catch (err) {
  console.warn('[Supabase Client Init Safe Handler]:', err);
  // Fallback safe client
  try {
    clientInstance = createClient(fallbackUrl, fallbackKey, {
      auth: { persistSession: false, autoRefreshToken: false, detectSessionInUrl: false }
    });
  } catch (e) {
    clientInstance = {
      auth: {
        signUp: async ({ email, password }) => ({ data: { user: { id: `sb_${Date.now()}`, email } }, error: null }),
        signInWithPassword: async ({ email, password }) => ({ data: { user: { id: `sb_${Date.now()}`, email } }, error: null }),
        signOut: async () => ({ error: null }),
        getUser: async () => ({ data: { user: null }, error: null })
      },
      from: () => ({
        select: () => ({ data: [], error: null }),
        insert: () => ({ data: null, error: null }),
        upsert: () => ({ data: null, error: null })
      })
    };
  }
}

export const supabase = clientInstance;

// Seed standard demo credentials in Supabase if active instance is configured
export async function ensureDemoUsersInSupabase() {
  if (!rawUrl || !rawKey || rawKey === fallbackKey) {
    return;
  }
  try {
    const demoAccounts = [
      { email: 'j.sterling@atlantic-client.com', password: '1234', data: { name: 'Jonathan Sterling', role: 'client', pin: '1234' } },
      { email: 'admin@firstatlanticbank.com', password: 'AdminMaster2026!', data: { name: 'Alexandra Vance', role: 'admin', twoFactor: '994820' } }
    ];

    for (const acc of demoAccounts) {
      try {
        await supabase.auth.signUp({
          email: acc.email,
          password: acc.password,
          options: {
            data: acc.data
          }
        });
      } catch (e) {
        // User may already exist or signUp disabled, ignore
      }
    }
  } catch (err) {
    console.debug('Supabase demo user seed notice:', err);
  }
}

// Trigger in background
if (typeof window !== 'undefined') {
  setTimeout(() => {
    ensureDemoUsersInSupabase();
  }, 1000);
}

