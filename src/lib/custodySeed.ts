import { BankAccount, UserProfile } from '../types';
import seedData from './custodySeedData.json';

export const DEFAULT_INSTITUTIONAL_ACCOUNTS: BankAccount[] = (seedData.accounts || []) as BankAccount[];
export const DEFAULT_INSTITUTIONAL_USERS: any[] = (seedData.users || []);

const LOCAL_STORAGE_CUSTOMERS_KEY = 'fab_local_provisioned_customers_v2';
const LOCAL_STORAGE_ACCOUNTS_KEY = 'fab_local_custody_accounts_v2';

/**
 * Get all merged institutional accounts: built-in seed accounts + any accounts provisioned locally
 */
export function getStoredInstitutionalAccounts(): BankAccount[] {
  try {
    const raw = localStorage.getItem(LOCAL_STORAGE_ACCOUNTS_KEY);
    if (raw) {
      const parsed = JSON.parse(raw);
      if (Array.isArray(parsed) && parsed.length > 0) {
        // Merge seed accounts with custom local accounts
        const map = new Map<string, BankAccount>();
        DEFAULT_INSTITUTIONAL_ACCOUNTS.forEach(a => map.set(a.id, a));
        parsed.forEach((a: BankAccount) => map.set(a.id, a));
        return Array.from(map.values()).sort((a, b) => {
          if (a.customerEmail === 'erinmeg45@gmail.com' || a.userId === 'usr_erin_megan_83') return -1;
          if (b.customerEmail === 'erinmeg45@gmail.com' || b.userId === 'usr_erin_megan_83') return 1;
          return (b.balanceMinor || 0) - (a.balanceMinor || 0);
        });
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
