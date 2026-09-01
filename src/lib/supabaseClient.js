import { createClient } from '@supabase/supabase-js';

const rawUrl = (typeof import.meta !== 'undefined' && import.meta.env?.VITE_SUPABASE_URL) ? import.meta.env.VITE_SUPABASE_URL.trim() : '';
const rawKey = (typeof import.meta !== 'undefined' && import.meta.env?.VITE_SUPABASE_ANON_KEY) ? import.meta.env.VITE_SUPABASE_ANON_KEY.trim() : '';

// Detect if real, valid Supabase configuration is provided
export const isSupabaseConfigured = Boolean(
  rawUrl &&
  rawKey &&
  rawUrl.startsWith('https://') &&
  rawUrl.includes('.supabase.co') &&
  !rawUrl.includes('first-atlantic-bank.supabase.co') &&
  !rawKey.includes('mock_signature_key') &&
  rawKey.length > 20
);

let clientInstance;

if (isSupabaseConfigured) {
  try {
    clientInstance = createClient(rawUrl, rawKey, {
      auth: {
        persistSession: true,
        autoRefreshToken: true,
        detectSessionInUrl: false
      }
    });
    console.info('[First Atlantic Bank] Supabase Cloud Active Node Connected:', rawUrl);
  } catch (err) {
    console.warn('[First Atlantic Bank] Supabase initialization failed, enabling resilient fallback:', err);
    clientInstance = createFallbackClient();
  }
} else {
  clientInstance = createFallbackClient();
}

function createFallbackClient() {
  const localDb = {
    users: new Map(),
    tables: new Map(),
    storage: new Map()
  };

  return {
    isFallback: true,
    auth: {
      signUp: async ({ email, password, options = {} }) => {
        const id = `sb_${Date.now()}_${Math.random().toString(36).slice(2, 7)}`;
        const user = {
          id,
          email,
          user_metadata: options.data || {},
          created_at: new Date().toISOString()
        };
        localDb.users.set(email.toLowerCase(), { user, password });
        try {
          localStorage.setItem('sb_fallback_user_' + email.toLowerCase(), JSON.stringify(user));
        } catch {}
        return { data: { user, session: { access_token: `sb_tok_${id}`, user } }, error: null };
      },
      signInWithPassword: async ({ email, password }) => {
        const stored = localDb.users.get((email || '').toLowerCase());
        const id = stored?.user?.id || `sb_${Date.now()}`;
        const user = stored?.user || { id, email, created_at: new Date().toISOString() };
        return { data: { user, session: { access_token: `sb_tok_${id}`, user } }, error: null };
      },
      signOut: async () => ({ error: null }),
      getUser: async () => {
        return { data: { user: null }, error: null };
      },
      getSession: async () => {
        return { data: { session: null }, error: null };
      },
      onAuthStateChange: () => ({
        data: { subscription: { unsubscribe: () => {} } }
      })
    },
    from: (tableName) => ({
      select: (columns = '*') => ({
        eq: (col, val) => ({
          data: (localDb.tables.get(tableName) || []).filter(item => item[col] === val),
          error: null
        }),
        single: async () => ({
          data: (localDb.tables.get(tableName) || [])[0] || null,
          error: null
        }),
        then: (resolve) => resolve({ data: localDb.tables.get(tableName) || [], error: null })
      }),
      insert: async (records) => {
        const existing = localDb.tables.get(tableName) || [];
        const items = Array.isArray(records) ? records : [records];
        localDb.tables.set(tableName, [...existing, ...items]);
        return { data: items, error: null };
      },
      upsert: async (records) => {
        const existing = localDb.tables.get(tableName) || [];
        const items = Array.isArray(records) ? records : [records];
        localDb.tables.set(tableName, [...existing, ...items]);
        return { data: items, error: null };
      },
      delete: () => ({
        eq: (col, val) => {
          const existing = localDb.tables.get(tableName) || [];
          localDb.tables.set(tableName, existing.filter(i => i[col] !== val));
          return { data: null, error: null };
        }
      })
    }),
    storage: {
      from: (bucketName) => ({
        upload: async (filePath, file, options) => {
          let url = '';
          if (typeof file === 'string') {
            url = file;
          } else if (file instanceof Blob || file instanceof File) {
            url = URL.createObjectURL(file);
          }
          localDb.storage.set(`${bucketName}/${filePath}`, url);
          return { data: { path: filePath }, error: null };
        },
        getPublicUrl: (filePath) => {
          const stored = localDb.storage.get(`${bucketName}/${filePath}`);
          return { data: { publicUrl: stored || `/uploads/${filePath}` } };
        }
      })
    }
  };
}

export const supabase = clientInstance;

// Helper to safely execute Supabase operations with non-blocking timeout protection
export async function safeSupabaseOp(opPromise, timeoutMs = 2500, fallbackVal = undefined) {
  let timeoutId;
  const timeoutPromise = new Promise((resolve) => {
    timeoutId = setTimeout(() => resolve(fallbackVal), timeoutMs);
  });
  try {
    const result = await Promise.race([opPromise, timeoutPromise]);
    clearTimeout(timeoutId);
    return result;
  } catch (err) {
    clearTimeout(timeoutId);
    console.warn('[Supabase Operation Non-blocking Notice]:', err);
    return fallbackVal;
  }
}

// Seed standard demo credentials in Supabase if real active instance is configured
export async function ensureDemoUsersInSupabase() {
  if (!isSupabaseConfigured) {
    return;
  }
  try {
    const demoAccounts = [
      { email: 'j.sterling@atlantic-client.com', password: '1234', data: { name: 'Jonathan Sterling', role: 'client', pin: '1234' } },
      { email: 'admin@firstatlanticbank.com', password: 'AdminMaster2026!', data: { name: 'Alexandra Vance', role: 'admin', twoFactor: '994820' } }
    ];

    for (const acc of demoAccounts) {
      try {
        await safeSupabaseOp(
          supabase.auth.signUp({
            email: acc.email,
            password: acc.password,
            options: {
              data: acc.data
            }
          }),
          2000
        );
      } catch (e) {
        // User may already exist, ignore
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
