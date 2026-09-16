import { BankAccount, BankCard, LedgerEntry, UserProfile } from '../types';

export interface SafeFetchResult<T = any> {
  ok: boolean;
  status: number;
  data: T | null;
  isHtml: boolean;
  errorMessage?: string;
}

export async function safeFetchJson<T = any>(
  input: RequestInfo | URL,
  init?: RequestInit
): Promise<SafeFetchResult<T>> {
  try {
    const options: RequestInit = { ...(init || {}) };
    const headers = new Headers(options.headers || {});
    if (!headers.has('Authorization')) {
      const storedToken = 
        (typeof localStorage !== 'undefined' && (
          localStorage.getItem('token') || 
          localStorage.getItem('fab_session_token') || 
          localStorage.getItem('admin_token')
        )) || null;
      if (storedToken) {
        headers.set('Authorization', `Bearer ${storedToken}`);
      }
    }
    options.headers = headers;

    const res = await fetch(input, options);
    const contentType = res.headers.get('content-type') || '';
    const rawText = await res.text();
    const text = (rawText || '').trim();

    // Check if the response is empty
    if (!text) {
      if (res.ok) {
        return {
          ok: true,
          status: res.status,
          data: {} as T,
          isHtml: false
        };
      }
      return {
        ok: false,
        status: res.status,
        data: null,
        isHtml: false,
        errorMessage: res.status === 401 
          ? 'Invalid credentials. Please verify your username/email and password.' 
          : res.status === 403 
          ? 'Access restricted. Please contact Private Client Concierge.'
          : 'Service temporarily unavailable.'
      };
    }

    // Check if the response is HTML (e.g. 404/200 SPA fallback page on Vercel or proxy error)
    if (
      text.startsWith('<') || 
      contentType.includes('text/html') || 
      text.includes('<!DOCTYPE') || 
      text.includes('<html') || 
      text.includes('<head')
    ) {
      return {
        ok: false,
        status: res.status,
        data: null,
        isHtml: true,
        errorMessage: 'Core banking service currently running in client vault mode.'
      };
    }

    try {
      const data = JSON.parse(text);
      return {
        ok: res.ok,
        status: res.status,
        data: data as T,
        isHtml: false,
        errorMessage: !res.ok ? (data?.message || data?.error || `Request failed with status ${res.status}`) : undefined
      };
    } catch {
      // Fallback if response text is not valid JSON
      let fallbackMsg = 'Authentication service temporarily unavailable.';
      if (res.status === 401) {
        fallbackMsg = 'Invalid credentials. Please check your username/email and password.';
      } else if (res.status === 403) {
        fallbackMsg = 'Account access restricted. Please contact Private Client Concierge.';
      } else if (res.status >= 500) {
        fallbackMsg = 'Banking server is momentarily unreachable. Switching to offline vault.';
      } else {
        const cleanMsg = text.replace(/<[^>]*>?/gm, '').trim();
        if (cleanMsg.length > 0 && cleanMsg.length < 120 && !cleanMsg.includes('\n')) {
          if (cleanMsg.includes('Cannot POST') || cleanMsg.includes('Cannot GET')) {
            fallbackMsg = 'Service endpoint unavailable. Switching to offline vault.';
          } else {
            fallbackMsg = cleanMsg;
          }
        }
      }

      return {
        ok: false,
        status: res.status,
        data: null,
        isHtml: false,
        errorMessage: fallbackMsg
      };
    }
  } catch (err: any) {
    const isNetwork = 
      (typeof navigator !== 'undefined' && !navigator.onLine) ||
      err?.name === 'TypeError' ||
      err?.message?.includes('fetch') ||
      err?.message?.includes('network') ||
      err?.message?.includes('Network') ||
      err?.message?.includes('Failed to fetch') ||
      err?.message?.includes('abort') ||
      err?.message?.includes('timeout');

    return {
      ok: false,
      status: 0,
      data: null,
      isHtml: false,
      errorMessage: isNetwork ? 'Network error, please check internet' : (err?.message || 'Network error, please check internet')
    };
  }
}

// Default Fallback Client User
export const DEMO_CLIENT_USER: UserProfile = {
  id: 'usr_client_default',
  email: 'client@atlantic-client.com',
  username: 'client',
  firstName: 'Private',
  lastName: 'Client',
  phone: '+1 (555) 019-2830',
  dialCode: '+1',
  dateOfBirth: '1990-01-01',
  nationality: 'American',
  passportNumber: 'US84920194A',
  passportPhoto: 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=500&auto=format&fit=crop&q=80',
  loginPin: '1234',
  region: 'US',
  approval_status: 'APPROVED',
  address: {
    line1: '100 Atlantic Plaza',
    city: 'New York',
    stateOrCounty: 'NY',
    postalCode: '10001',
    country: 'United States'
  },
  mfaEnabled: true,
  mfaMethod: 'AUTHENTICATOR',
  biometricsEnabled: true,
  kycTier: 'TIER_2_VERIFIED_PREMIER',
  securityScore: 90,
  notifications: {
    emailAlerts: true,
    smsAlerts: true,
    pushAlerts: true,
    largeTransactionThresholdMinor: 500000
  },
  lastLogin: new Date().toISOString()
};

// Clean default accounts - Real balances are loaded live from database
export const DEMO_CLIENT_ACCOUNTS: BankAccount[] = [];
export const DEMO_CLIENT_CARDS: BankCard[] = [];
export const DEMO_CLIENT_TRANSACTIONS: LedgerEntry[] = [];
