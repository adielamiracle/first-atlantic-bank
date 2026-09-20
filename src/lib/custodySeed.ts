import { BankAccount, UserProfile } from '../types';
import seedData from './custodySeedData.json';

export const DEFAULT_INSTITUTIONAL_ACCOUNTS: BankAccount[] = ((seedData.accounts || []) as BankAccount[]).filter(
  a => a.userId !== 'usr_sterling_01' && !a.name?.toLowerCase().includes('sterling')
);
export const DEFAULT_INSTITUTIONAL_USERS: any[] = (seedData.users || []).filter(
  u => u.id !== 'usr_sterling_01' && u.username !== 'jsterling' && !u.email?.includes('j.sterling')
);

const LOCAL_STORAGE_CUSTOMERS_KEY = 'fab_local_provisioned_customers_v2';
const LOCAL_STORAGE_ACCOUNTS_KEY = 'fab_local_custody_accounts_v2';

const LEGACY_MOCK_ACCOUNT_IDS = new Set([
  'acc_sterling_chk_01', 'acc_sterling_sav_02', 'acc_sterling_multigbp_03', 'acc_sterling_crd_04',
  'acc_usr_supabaseuser_1034_usd_01', 'acc_usr_balance_4532_usd_01',
  'acc_usr_vance_1810_usd_01', 'acc_usr_hayes_7681_usd_01', 'acc_usr_tester_6242_usd_01',
  'acc_usr_jenkins_6699_usd_01', 'acc_usr_morgan_2054_usd_01', 'acc_usr_rostova_6059_usd_01',
  'acc_usr_sterling_9948_usd_01', 'acc_usr_sterling_9948_gbp_02', 'acc_erin_megan_01',
  'acc_usr_provision_8886_usd_01', 'acc_usr_verification_3745_usd_01', 'acc_usr_doe_9099_usd_01'
]);

/**
 * Get all merged institutional accounts: built-in seed accounts + any accounts provisioned locally
 */
export function getStoredInstitutionalAccounts(): BankAccount[] {
  try {
    const raw = localStorage.getItem(LOCAL_STORAGE_ACCOUNTS_KEY);
    if (raw) {
      const parsed = JSON.parse(raw);
      if (Array.isArray(parsed)) {
        // Merge seed accounts with custom local accounts, filtering out deleted mock seed entries
        const map = new Map<string, BankAccount>();
        DEFAULT_INSTITUTIONAL_ACCOUNTS.forEach(a => {
          if (!LEGACY_MOCK_ACCOUNT_IDS.has(a.id)) map.set(a.id, a);
        });
        parsed.forEach((a: BankAccount) => {
          if (a && a.id && !LEGACY_MOCK_ACCOUNT_IDS.has(a.id)) {
            map.set(a.id, a);
          }
        });
        const filtered = Array.from(map.values()).sort((a, b) => {
          return (b.balanceMinor || 0) - (a.balanceMinor || 0);
        });
        // Resave cleaned list
        localStorage.setItem(LOCAL_STORAGE_ACCOUNTS_KEY, JSON.stringify(filtered));
        return filtered;
      }
    }
  } catch (e) {
    console.debug('Error reading local custody accounts:', e);
  }
  return DEFAULT_INSTITUTIONAL_ACCOUNTS;
}

/**
 * Save new or updated accounts to persistent localStorage
 */
export function saveStoredInstitutionalAccounts(accounts: BankAccount[]) {
  try {
    localStorage.setItem(LOCAL_STORAGE_ACCOUNTS_KEY, JSON.stringify(accounts));
  } catch (e) {
    console.debug('Error saving local custody accounts:', e);
  }
}

/**
 * Get all merged registered users
 */
export function getStoredInstitutionalUsers(): any[] {
  try {
    const raw = localStorage.getItem(LOCAL_STORAGE_CUSTOMERS_KEY);
    if (raw) {
      const parsed = JSON.parse(raw);
      if (Array.isArray(parsed) && parsed.length > 0) {
        const map = new Map<string, any>();
        DEFAULT_INSTITUTIONAL_USERS.forEach(u => map.set(u.id, u));
        parsed.forEach((u: any) => map.set(u.id, u));
        return Array.from(map.values());
      }
    }
  } catch (e) {
    console.debug('Error reading local custody users:', e);
  }
  return DEFAULT_INSTITUTIONAL_USERS;
}

/**
 * Save new or updated registered users
 */
export function saveStoredInstitutionalUsers(users: any[]) {
  try {
    localStorage.setItem(LOCAL_STORAGE_CUSTOMERS_KEY, JSON.stringify(users));
  } catch (e) {
    console.debug('Error saving local custody users:', e);
  }
}

/**
 * Save user password and PIN for seamless authentication
 */
const LOCAL_STORAGE_CREDS_KEY = 'fab_user_credentials_vault_v2';

export function saveStoredUserCredentials(
  userId: string,
  username: string,
  email: string,
  password?: string,
  loginPin?: string
) {
  try {
    const raw = localStorage.getItem(LOCAL_STORAGE_CREDS_KEY);
    const map: Record<string, { password?: string; loginPin?: string; userId?: string }> = raw ? JSON.parse(raw) : {};
    const cred = { 
      password: password || 'AtlanticSecure2026!', 
      loginPin: loginPin || '1234',
      userId 
    };
    if (userId) map[userId.toLowerCase().trim()] = cred;
    if (username) map[username.toLowerCase().trim()] = cred;
    if (email) map[email.toLowerCase().trim()] = cred;
    localStorage.setItem(LOCAL_STORAGE_CREDS_KEY, JSON.stringify(map));
  } catch (e) {
    console.debug('Error saving local user credentials:', e);
  }
}

export function getStoredUserCredentials(identifier: string): { password?: string; loginPin?: string; userId?: string } | null {
  try {
    const raw = localStorage.getItem(LOCAL_STORAGE_CREDS_KEY);
    if (!raw) return null;
    const map = JSON.parse(raw);
    const key = (identifier || '').toLowerCase().trim();
    return map[key] || null;
  } catch (e) {
    return null;
  }
}

/**
 * Clear all cache storages, obsolete service workers, and stale mock local caches for instant UI refresh
 */
export async function purgeAllAppCaches(): Promise<void> {
  try {
    if (typeof window === 'undefined') return;

    // 1. Clear CacheStorage (service worker / HTTP caches)
    if ('caches' in window) {
      try {
        const cacheKeys = await window.caches.keys();
        await Promise.all(cacheKeys.map(k => window.caches.delete(k)));
      } catch (e) {
        console.debug('CacheStorage clear notice:', e);
      }
    }

    // 2. Unregister any stale service workers
    if ('serviceWorker' in navigator) {
      try {
        const registrations = await navigator.serviceWorker.getRegistrations();
        for (const registration of registrations) {
          await registration.unregister();
        }
      } catch (e) {
        console.debug('ServiceWorker unregister notice:', e);
      }
    }

    // 3. Clear session storage
    try {
      sessionStorage.clear();
    } catch {}

    // 4. Purge legacy mock localStorage keys that cause old mock data to reload
    try {
      const stalePrefixes = [
        'fab_local_custody_accounts',
        'fab_local_provisioned_customers',
        'sb_table_',
        'sb_fallback_user_',
        'sb_storage_',
        'fab_cached_',
        'mock_',
        'demo_mock'
      ];

      const keysToRemove: string[] = [];
      for (let i = 0; i < localStorage.length; i++) {
        const key = localStorage.key(i);
        if (key) {
          if (stalePrefixes.some(prefix => key.startsWith(prefix))) {
            keysToRemove.push(key);
          }
          if (key === 'fab_current_user') {
            try {
              const u = JSON.parse(localStorage.getItem(key) || '{}');
              if (
                u.id === 'usr_sterling_01' ||
                u.email?.includes('j.sterling') ||
                u.username === 'jsterling' ||
                u.id?.includes('sterling')
              ) {
                keysToRemove.push(key, 'fab_session_token', 'token', 'fab_token');
              }
            } catch {}
          }
          if (key === 'last_registered_username') {
            const val = localStorage.getItem(key);
            if (val && (val.includes('sterling') || val.includes('jsterling'))) {
              keysToRemove.push(key);
            }
          }
        }
      }

      keysToRemove.forEach(k => {
        try {
          localStorage.removeItem(k);
        } catch {}
      });
    } catch (e) {
      console.debug('LocalStorage stale keys purge notice:', e);
    }

    console.info('[First Atlantic Bank] Cache Storage, Service Workers, and Stale Mocks successfully purged.');
  } catch (err) {
    console.warn('[Cache Purge Warning]:', err);
  }
}
