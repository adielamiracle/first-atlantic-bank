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
  'acc_usr_user_5427_usd_01', 'acc_usr_supabaseuser_1034_usd_01', 'acc_usr_balance_4532_usd_01',
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
 * Clear all cache storages and local cache for instant UI refresh
 */
export async function purgeAllAppCaches(): Promise<void> {
  try {
    if (typeof window !== 'undefined' && 'caches' in window) {
      const cacheKeys = await window.caches.keys();
      await Promise.all(cacheKeys.map(k => window.caches.delete(k)));
    }
    // Also clear session storage and temporary network caches
    sessionStorage.clear();
    console.info('[First Atlantic Bank] Cache Storage successfully purged.');
  } catch (err) {
    console.warn('[Cache Purge Warning]:', err);
  }
}
