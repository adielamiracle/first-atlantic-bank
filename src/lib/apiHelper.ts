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
    const res = await fetch(input, init);
    const contentType = res.headers.get('content-type') || '';
    const text = await res.text();

    // Check if the response is actually HTML (e.g. 404/200 SPA fallback page on Vercel)
    if (text.trim().startsWith('<') || contentType.includes('text/html')) {
      return {
        ok: false,
        status: res.status,
        data: null,
        isHtml: true,
        errorMessage: 'Backend API returned HTML instead of JSON. Switching to local offline mode.'
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
      return {
        ok: false,
        status: res.status,
        data: null,
        isHtml: false,
        errorMessage: 'Unable to parse API response as JSON'
      };
    }
  } catch (err: any) {
    return {
      ok: false,
      status: 0,
      data: null,
      isHtml: false,
      errorMessage: err?.message || 'Network request failed'
    };
  }
}

// Default Fallback Demo Client User
export const DEMO_CLIENT_USER: UserProfile = {
  id: 'usr_sterling_01',
  email: 'j.sterling@atlantic-client.com',
  username: 'jsterling',
  firstName: 'Jonathan',
  lastName: 'Sterling',
  phone: '+1 (212) 849-2910',
  dialCode: '+1',
  dateOfBirth: '1984-04-16',
  nationality: 'American',
  passportNumber: 'US84920194A',
  passportPhoto: 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=500&auto=format&fit=crop&q=80',
  loginPin: '1234',
  ssnMasked: '•••-••-8492',
  nationalInsuranceMasked: 'QQ 12 34 56 A',
  region: 'US',
  approval_status: 'APPROVED',
  address: {
    line1: '740 Park Avenue, Penthouse B',
    city: 'New York',
    stateOrCounty: 'NY',
    postalCode: '10021',
    country: 'United States'
  },
  mfaEnabled: true,
  mfaMethod: 'AUTHENTICATOR',
  biometricsEnabled: true,
  kycTier: 'TIER_2_VERIFIED_PREMIER',
  securityScore: 94,
  notifications: {
    emailAlerts: true,
    smsAlerts: true,
    pushAlerts: true,
    largeTransactionThresholdMinor: 500000
  },
  lastLogin: new Date().toISOString()
};

// Default Fallback Accounts for Demo Client
export const DEMO_CLIENT_ACCOUNTS: BankAccount[] = [
  {
    id: 'acc_sterling_chk_01',
    userId: 'usr_sterling_01',
    accountNumber: '•••• •••• 8821',
    accountNumberFull: '8492018821',
    routingNumber: '021000021',
    swiftBic: 'FABKUS33NYC',
    name: 'Premier Private Wealth Checking',
    type: 'CHECKING_PREMIER',
    currency: 'USD',
    balanceMinor: 342050000, // $3,420,500.00
    availableBalanceMinor: 342050000,
    pendingHoldMinor: 0,
    interestRateAPY: 1.85,
    status: 'ACTIVE',
    region: 'US',
    openedDate: '2023-01-15',
    dailyTransferLimitMinor: 50000000,
    statementCycleDay: 1
  },
  {
    id: 'acc_sterling_sav_02',
    userId: 'usr_sterling_01',
    accountNumber: '•••• •••• 9940',
    accountNumberFull: '8492019940',
    routingNumber: '021000021',
    swiftBic: 'FABKUS33NYC',
    name: 'Sovereign High-Yield Vault',
    type: 'SAVINGS_HIGH_YIELD',
    currency: 'USD',
    balanceMinor: 500000000, // $5,000,000.00
    availableBalanceMinor: 500000000,
    pendingHoldMinor: 0,
    interestRateAPY: 4.85,
    status: 'ACTIVE',
    region: 'US',
    openedDate: '2023-02-01',
    dailyTransferLimitMinor: 100000000,
    statementCycleDay: 1
  }
];

export const DEMO_CLIENT_CARDS: BankCard[] = [
  {
    id: 'crd_sterling_01',
    accountId: 'acc_sterling_chk_01',
    userId: 'usr_sterling_01',
    cardNumberMasked: '•••• •••• •••• 4910',
    cardNumberFull: '4532 8920 1849 4910',
    cardHolderName: 'JONATHAN STERLING',
    expiryMonth: 8,
    expiryYear: 2028,
    cvv: '891',
    cardType: 'CREDIT_ATLANTIC_INFINITE',
    status: 'ACTIVE',
    isVirtual: false,
    contactlessEnabled: true,
    onlineTransactionsEnabled: true,
    internationalSpendEnabled: true,
    dailyAtmLimitMinor: 500000,
    dailySpendLimitMinor: 5000000,
    travelNotices: []
  }
];

export const DEMO_CLIENT_TRANSACTIONS: LedgerEntry[] = [
  {
    id: 'tx_demo_01',
    transactionId: 'TX-FAB-849201',
    accountId: 'acc_sterling_chk_01',
    direction: 'CREDIT',
    amountMinor: 2850000, // $28,500.00
    currency: 'USD',
    balanceAfterMinor: 342050000,
    description: 'Direct Clearing Distribution - Sterling Holdings Ltd',
    category: 'Income',
    counterparty: 'Sterling Global Capital Trust',
    status: 'SETTLED',
    channel: 'WIRE',
    referenceNumber: 'WIRE-US-9948201',
    createdTimestamp: new Date(Date.now() - 3600000 * 4).toISOString(),
    effectiveTimestamp: new Date(Date.now() - 3600000 * 4).toISOString(),
    settledTimestamp: new Date(Date.now() - 3600000 * 4).toISOString()
  },
  {
    id: 'tx_demo_02',
    transactionId: 'TX-FAB-849190',
    accountId: 'acc_sterling_chk_01',
    direction: 'DEBIT',
    amountMinor: 450000, // $4,500.00
    currency: 'USD',
    balanceAfterMinor: 339200000,
    description: 'Manhattan Skyway Terminal Concierge Services',
    category: 'Travel',
    counterparty: 'Private Aviation Charter Desk',
    status: 'SETTLED',
    channel: 'CARD_POS',
    referenceNumber: 'POS-NY-482019',
    createdTimestamp: new Date(Date.now() - 86400000).toISOString(),
    effectiveTimestamp: new Date(Date.now() - 86400000).toISOString(),
    settledTimestamp: new Date(Date.now() - 86400000).toISOString()
  }
];
