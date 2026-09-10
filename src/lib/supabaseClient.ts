import { createClient } from '@supabase/supabase-js';

const getEnvVar = (name: string): string => {
  if (typeof import.meta !== 'undefined' && (import.meta as any).env && (import.meta as any).env[name]) {
    return String((import.meta as any).env[name]).trim();
  }
  if (typeof process !== 'undefined' && process.env && process.env[name]) {
    return String(process.env[name]).trim();
  }
  if (typeof window !== 'undefined' && (window as any).__ENV__ && (window as any).__ENV__[name]) {
    return String((window as any).__ENV__[name]).trim();
  }
  return '';
};

const candidateUrls = [
  getEnvVar('VITE_SUPABASE_URL'),
  getEnvVar('NEXT_PUBLIC_SUPABASE_URL'),
  getEnvVar('SUPABASE_URL')
];

const candidateKeys = [
  getEnvVar('VITE_SUPABASE_ANON_KEY'),
  getEnvVar('SUPABASE_SERVICE_ROLE_KEY'),
  getEnvVar('SUPABASE_ANON_KEY'),
  getEnvVar('NEXT_PUBLIC_SUPABASE_ANON_KEY')
];

export function isValidSupabaseKey(key: string): boolean {
  if (!key || typeof key !== 'string') return false;
  const trimmed = key.trim();
  if (trimmed.length < 20) return false;
  for (let i = 0; i < trimmed.length; i++) {
    if (trimmed.charCodeAt(i) > 127) return false;
  }
  if (
    trimmed.includes('••••') ||
    trimmed.includes('****') ||
    trimmed.includes('mock_signature_key') ||
    trimmed.includes('your-supabase-key') ||
    trimmed.includes('placeholder')
  ) {
    return false;
  }
  return /^[A-Za-z0-9_\-\.]+$/.test(trimmed);
}

export function isValidSupabaseUrl(url: string): boolean {
  if (!url || typeof url !== 'string') return false;
  const trimmed = url.trim();
  if (!trimmed.startsWith('https://') && !trimmed.startsWith('http://localhost')) return false;
  for (let i = 0; i < trimmed.length; i++) {
    if (trimmed.charCodeAt(i) > 127) return false;
  }
  if (
    trimmed.includes('••••') ||
    trimmed.includes('****') ||
    trimmed.includes('first-atlantic-bank.supabase.co') ||
    trimmed.includes('your-project-id.supabase.co') ||
    trimmed.includes('placeholder')
  ) {
    return false;
  }
  return true;
}

const rawUrl = (candidateUrls.find(u => isValidSupabaseUrl(u)) || '').trim();
const rawKey = (candidateKeys.find(k => isValidSupabaseKey(k)) || '').trim();

// Detect if real, valid Supabase configuration is provided
export const isSupabaseConfigured = Boolean(
  isValidSupabaseUrl(rawUrl) && isValidSupabaseKey(rawKey)
);

let clientInstance: any;

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
  const getStoredTable = (table: string) => {
    try {
      const raw = localStorage.getItem(`sb_table_${table}`);
      return raw ? JSON.parse(raw) : [];
    } catch {
      return [];
    }
  };

  const saveStoredTable = (table: string, items: any[]) => {
    try {
      localStorage.setItem(`sb_table_${table}`, JSON.stringify(items));
    } catch {}
  };

  return {
    isFallback: true,
    auth: {
      signUp: async ({ email, password, options = {} }: any) => {
        const id = `sb_${Date.now()}_${Math.random().toString(36).slice(2, 7)}`;
        const user = {
          id,
          email,
          user_metadata: options.data || {},
          created_at: new Date().toISOString()
        };
        try {
          localStorage.setItem('sb_fallback_user_' + (email || '').toLowerCase(), JSON.stringify({ user, password }));
        } catch {}
        return { data: { user, session: { access_token: `sb_tok_${id}`, user } }, error: null };
      },
      signInWithPassword: async ({ email, password }: any) => {
        let storedUser: any = null;
        try {
          const raw = localStorage.getItem('sb_fallback_user_' + (email || '').toLowerCase());
          if (raw) storedUser = JSON.parse(raw);
        } catch {}
        const id = storedUser?.user?.id || `sb_${Date.now()}`;
        const user = storedUser?.user || { id, email, created_at: new Date().toISOString() };
        return { data: { user, session: { access_token: `sb_tok_${id}`, user } }, error: null };
      },
      resetPasswordForEmail: async (_email: string) => {
        return { data: {}, error: null };
      },
      updateUser: async (attributes: any) => {
        return { data: { user: attributes }, error: null };
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
    from: (tableName: string) => {
      const executeQuery = (filterFn: any, sortFn: any, limitVal: any) => {
        let items = getStoredTable(tableName);
        if (filterFn) items = items.filter(filterFn);
        if (sortFn) items = [...items].sort(sortFn);
        if (typeof limitVal === 'number') items = items.slice(0, limitVal);
        return items;
      };

      const createQueryBuilder = (filterFn: any = null, sortFn: any = null, limitVal: any = null) => {
        const builder: any = {
          data: executeQuery(filterFn, sortFn, limitVal),
          error: null,
          eq: (col: string, val: any) => {
            const nextFilter = (item: any) => (filterFn ? filterFn(item) : true) && String(item[col]) === String(val);
            return createQueryBuilder(nextFilter, sortFn, limitVal);
          },
          order: (col: string, { ascending = true }: any = {}) => {
            const nextSort = (a: any, b: any) => {
              if (a[col] < b[col]) return ascending ? -1 : 1;
              if (a[col] > b[col]) return ascending ? 1 : -1;
              return 0;
            };
            return createQueryBuilder(filterFn, nextSort, limitVal);
          },
          limit: (n: number) => {
            return createQueryBuilder(filterFn, sortFn, n);
          },
          single: async () => {
            const items = executeQuery(filterFn, sortFn, limitVal);
            return { data: items[0] || null, error: null };
          },
          then: (resolve: any) => {
            const items = executeQuery(filterFn, sortFn, limitVal);
            return Promise.resolve(resolve({ data: items, error: null }));
          }
        };
        return builder;
      };

      return {
        select: (_columns = '*') => createQueryBuilder(),
        insert: async (records: any) => {
          const existing = getStoredTable(tableName);
          const items = (Array.isArray(records) ? records : [records]).map(rec => ({
            id: rec.id || `tx_${Date.now()}_${Math.random().toString(36).slice(2, 7)}`,
            created_at: rec.created_at || new Date().toISOString(),
            ...rec
          }));
          const updated = [...items, ...existing];
          saveStoredTable(tableName, updated);
          return { data: items, error: null };
        },
        upsert: async (records: any) => {
          const existing = getStoredTable(tableName);
          const items = Array.isArray(records) ? records : [records];
          const updated = [...items, ...existing];
          saveStoredTable(tableName, updated);
          return { data: items, error: null };
        },
        delete: () => ({
          eq: (col: string, val: any) => {
            const existing = getStoredTable(tableName);
            const filtered = existing.filter(i => String(i[col]) !== String(val));
            saveStoredTable(tableName, filtered);
            return { data: null, error: null };
          }
        })
      };
    },
    storage: {
      from: (bucketName: string) => ({
        upload: async (filePath: string, file: any, _options?: any) => {
          let url = '';
          if (typeof file === 'string') {
            url = file;
          } else if (file instanceof Blob || file instanceof File) {
            url = URL.createObjectURL(file);
          }
          try {
            localStorage.setItem(`sb_storage_${bucketName}_${filePath}`, url);
          } catch {}
          return { data: { path: filePath }, error: null };
        },
        getPublicUrl: (filePath: string) => {
          let stored = null;
          try {
            stored = localStorage.getItem(`sb_storage_${bucketName}_${filePath}`);
          } catch {}
          return { data: { publicUrl: stored || `/uploads/${filePath}` } };
        }
      })
    }
  };
}

export const supabase = clientInstance;

// Helper to safely execute Supabase operations with non-blocking timeout protection
export async function safeSupabaseOp<T>(opPromise: Promise<T>, timeoutMs = 2500, fallbackVal?: T): Promise<T | undefined> {
  let timeoutId: any;
  const timeoutPromise = new Promise<T | undefined>((resolve) => {
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
export async function ensureDemoUsersInSupabase(): Promise<void> {
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
      } catch (_e) {
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
