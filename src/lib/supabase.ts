import { createClient, SupabaseClient } from '@supabase/supabase-js';

// Read Supabase environmental variables across Vite and node
const getEnv = (key: string): string => {
  if (typeof import.meta !== 'undefined' && (import.meta as any)?.env?.[key]) {
    return String((import.meta as any).env[key]).trim();
  }
  if (typeof process !== 'undefined' && process.env?.[key]) {
    return String(process.env[key]).trim();
  }
  if (typeof window !== 'undefined' && (window as any).__ENV__?.[key]) {
    return String((window as any).__ENV__[key]).trim();
  }
  return '';
};

const candidateUrls = [
  getEnv('VITE_SUPABASE_URL'),
  getEnv('NEXT_PUBLIC_SUPABASE_URL'),
  getEnv('SUPABASE_URL')
];

const candidateKeys = [
  getEnv('VITE_SUPABASE_ANON_KEY'),
  getEnv('SUPABASE_SERVICE_ROLE_KEY'),
  getEnv('SUPABASE_ANON_KEY'),
  getEnv('NEXT_PUBLIC_SUPABASE_ANON_KEY')
];

export function isValidSupabaseKey(key?: string | null): boolean {
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
  if (!/^[A-Za-z0-9_\-\.]+$/.test(trimmed)) {
    return false;
  }

  // Check if JWT is future-dated
  if (trimmed.includes('.')) {
    const parts = trimmed.split('.');
    if (parts.length === 3) {
      try {
        const payloadStr = typeof atob === 'function'
          ? atob(parts[1].replace(/-/g, '+').replace(/_/g, '/'))
          : (typeof Buffer !== 'undefined' ? Buffer.from(parts[1], 'base64').toString('utf8') : '');
        if (payloadStr) {
          const payload = JSON.parse(payloadStr);
          const nowSec = Math.floor(Date.now() / 1000);
          if (payload.iat && payload.iat > nowSec + 30) {
            return false;
          }
        }
      } catch {}
    }
  }

  return true;
}

export function isValidSupabaseUrl(url?: string | null): boolean {
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

const supabaseUrl = (candidateUrls.find(u => isValidSupabaseUrl(u)) || '').trim();
const validKeys = candidateKeys
  .map(k => (k || '').trim())
  .filter(k => isValidSupabaseKey(k));

const supabaseAnonKey = (
  validKeys.find(k => k.startsWith('sb_secret_')) ||
  validKeys.find(k => !k.includes('.')) ||
  validKeys[0] ||
  ''
).trim();

let supabaseInstance: SupabaseClient | null = null;

if (isValidSupabaseUrl(supabaseUrl) && isValidSupabaseKey(supabaseAnonKey)) {
  try {
    supabaseInstance = createClient(supabaseUrl.trim(), supabaseAnonKey.trim(), {
      auth: {
        persistSession: true,
        autoRefreshToken: true,
      },
    });
    console.info('[First Atlantic Bank] Sovereign Supabase Cloud Node Active.');
  } catch (err) {
    console.warn('[First Atlantic Bank] Supabase initialization fallback to high-availability local storage:', err);
    supabaseInstance = null;
  }
}

/**
 * Returns the active Supabase client or null if not configured
 */
export const getSupabase = (): SupabaseClient | null => {
  return supabaseInstance;
};

/**
 * Helper to test or sync bank data state with Supabase cloud tables if present
 */
export async function syncTableToSupabase(tableName: string, data: any[]): Promise<boolean> {
  if (!supabaseInstance) return false;
  try {
    const { error } = await supabaseInstance
      .from(tableName)
      .upsert(data, { onConflict: 'id' });
    if (error) {
      console.warn(`[Supabase Sync] ${tableName} note:`, error.message);
      return false;
    }
    return true;
  } catch (e) {
    return false;
  }
}

/**
 * Helper to upload KYC Passport / ID document to Supabase Storage or returns base64 fallback
 */
export async function uploadPassportDocument(userId: string, file: File): Promise<{ url: string; error?: string }> {
  if (supabaseInstance) {
    try {
      const fileExt = file.name.split('.').pop();
      const filePath = `passports/${userId}_${Date.now()}.${fileExt}`;
      const { data, error } = await supabaseInstance.storage
        .from('kyc-documents')
        .upload(filePath, file, { upsert: true });

      if (!error && data) {
        const { data: publicUrlData } = supabaseInstance.storage
          .from('kyc-documents')
          .getPublicUrl(filePath);
        return { url: publicUrlData.publicUrl };
      }
    } catch (e: any) {
      console.warn('[Supabase Storage Fallback to local buffer]:', e.message);
    }
  }

  // Local fallback: convert to base64 Data URL
  return new Promise((resolve) => {
    const reader = new FileReader();
    reader.onloadend = () => {
      resolve({ url: reader.result as string });
    };
    reader.onerror = () => {
      resolve({ url: '', error: 'Failed to read passport document' });
    };
    reader.readAsDataURL(file);
  });
}
