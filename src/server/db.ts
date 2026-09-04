import fs from 'fs';
import path from 'path';
import {
  BankAccount,
  BankCard,
  UserProfile,
  LedgerEntry,
  AuditLog,
  FinancialAdjustment,
  RiskEvent,
  SupportCase,
  MobileDepositRecord,
  AdminUser,
  CurrencyCode,
  BankRegion,
  BillPayVendor,
  AccountApplication,
  UserApprovalStatus,
  AccountActivationRequest,
  BankReceivingAccount,
  TransactionStatus,
  TransactionDirection
} from '../types';
import { doubleEntryLedger, JournalLine } from './ledger/DoubleEntryLedger';
import { adminNotificationService } from './notifications';
import { 
  syncNewRegistrationToSupabase, 
  syncRecordToSupabase,
  uploadFileToSupabase,
  syncAllDataToSupabase,
  loadDataFromSupabase,
  syncUserToSupabase,
  syncAccountToSupabase,
  syncCardToSupabase,
  syncLedgerEntryToSupabase,
  syncApplicationToSupabase
} from './supabase';

// Exchange rates (live locked institutional rates)
export const EXCHANGE_RATES: Record<CurrencyCode, Record<CurrencyCode, number>> = {
  USD: { USD: 1.0, GBP: 0.785, EUR: 0.92 },
  GBP: { USD: 1.274, GBP: 1.0, EUR: 1.172 },
  EUR: { USD: 1.087, GBP: 0.853, EUR: 1.0 }
};

export const BILL_PAY_VENDORS: BillPayVendor[] = [
  { id: 'v1', name: 'ConEdison Electric & Gas', category: 'UTILITY', billerCode: 'CONED-US-892', region: 'US', logo: '⚡' },
  { id: 'v2', name: 'Verizon Wireless & Fios', category: 'TELECOM', billerCode: 'VZ-COMM-441', region: 'US', logo: '📱' },
  { id: 'v3', name: 'American Express Platinum Card', category: 'CREDIT_CARD', billerCode: 'AMEX-US-991', region: 'US', logo: '💳' },
  { id: 'v4', name: 'IRS Federal Tax Payment (EFTPS)', category: 'GOVERNMENT_TAX', billerCode: 'IRS-TREAS-001', region: 'US', logo: '🏛️' },
  { id: 'v5', name: 'British Gas Energy', category: 'UTILITY', billerCode: 'BG-UK-6712', region: 'UK', logo: '🔥' },
  { id: 'v6', name: 'Thames Water Utilities', category: 'UTILITY', billerCode: 'THAMES-UK-301', region: 'UK', logo: '💧' },
  { id: 'v7', name: 'EE Mobile UK & Broadband', category: 'TELECOM', billerCode: 'EE-TEL-559', region: 'UK', logo: '📶' },
  { id: 'v8', name: 'HM Revenue & Customs (HMRC)', category: 'GOVERNMENT_TAX', billerCode: 'HMRC-UK-772', region: 'UK', logo: '👑' },
  { id: 'v9', name: 'Prudential Home & Auto Insurance', category: 'INSURANCE', billerCode: 'PRUD-INS-104', region: 'US', logo: '🛡️' }
];

export class BankDatabase {
  users: Map<string, UserProfile> = new Map();
  accounts: Map<string, BankAccount> = new Map();
  cards: Map<string, BankCard> = new Map();
  ledger: LedgerEntry[] = [];
  auditLogs: AuditLog[] = [];
  adjustments: FinancialAdjustment[] = [];
  activationRequests: AccountActivationRequest[] = [];
  riskEvents: RiskEvent[] = [];
  supportCases: SupportCase[] = [];
  mobileDeposits: MobileDepositRecord[] = [];
  adminUsers: Map<string, AdminUser> = new Map();
  applications: Map<string, AccountApplication> = new Map();
  receivingAccounts: Map<string, BankReceivingAccount> = new Map();
  userPasswords: Map<string, string> = new Map(); // demo hashed simulation
  activeSessions: Map<string, { userId: string; token: string; device: string; ip: string; loginTime: string }> = new Map();

  private dbFilePath = path.join(process.cwd(), 'data', 'bank_database.json');
  private saveTimeout: any = null;

  constructor() {
    this.initDatabase();
  }

  saveImageToDisk(base64OrUrl: string, prefix: string = 'profile', userId?: string): string {
    if (!base64OrUrl) return '';
    if (!base64OrUrl.startsWith('data:image/') && !base64OrUrl.startsWith('data:application/')) {
      return base64OrUrl;
    }
    try {
      const match = base64OrUrl.match(/^data:([^;]+);base64,(.+)$/);
      if (!match) return base64OrUrl;
      const mime = match[1].toLowerCase();
      const ext = mime.includes('png') ? 'png' : mime.includes('webp') ? 'webp' : mime.includes('pdf') ? 'pdf' : 'jpg';
      const base64Data = match[2];
      const buffer = Buffer.from(base64Data, 'base64');
      
      const fileName = `${prefix}_${Date.now()}_${Math.random().toString(36).substring(2, 7)}.${ext}`;
      
      const dataUploadsDir = path.join(process.cwd(), 'data', 'uploads');
      if (!fs.existsSync(dataUploadsDir)) {
        fs.mkdirSync(dataUploadsDir, { recursive: true });
      }
      fs.writeFileSync(path.join(dataUploadsDir, fileName), buffer);

      const publicUploadsDir = path.join(process.cwd(), 'public', 'uploads');
      if (!fs.existsSync(publicUploadsDir)) {
        fs.mkdirSync(publicUploadsDir, { recursive: true });
      }
      fs.writeFileSync(path.join(publicUploadsDir, fileName), buffer);

      // Async sync to Supabase Storage and files table
      uploadFileToSupabase(buffer, fileName, mime, userId).catch(err => {
        console.debug('[Supabase Background Upload Notice]:', err);
      });

      return `/uploads/${fileName}`;
    } catch (e) {
      console.error('Failed to save image to disk:', e);
      return base64OrUrl;
    }
  }

  initDatabase() {
    try {
      const dataDir = path.join(process.cwd(), 'data');
      if (!fs.existsSync(dataDir)) {
        fs.mkdirSync(dataDir, { recursive: true });
      }
      if (fs.existsSync(this.dbFilePath)) {
        const raw = fs.readFileSync(this.dbFilePath, 'utf-8');
        const data = JSON.parse(raw);
        if (data && data.users && data.accounts) {
          this.hydrateFromJSON(data);
        } else {
          this.seedInitialData();
        }
      } else {
        this.seedInitialData();
      }
    } catch (e) {
      console.warn('Could not load existing database file, seeding defaults:', e);
      this.seedInitialData();
    }
    
    this.ensureErinMeganExists();
    this.saveToDiskSync();

    // Hydrate & Sync with Supabase asynchronously on startup
    setTimeout(() => {
      loadDataFromSupabase(this).then(() => {
        this.ensureErinMeganExists();
        syncAllDataToSupabase(this).catch(e => console.debug('[Supabase Sync Init Notice]:', e));
      }).catch(e => console.debug('[Supabase Load Init Notice]:', e));
    }, 1000);
  }

  saveToDiskSync() {
    try {
      const dataDir = path.join(process.cwd(), 'data');
      if (!fs.existsSync(dataDir)) {
        fs.mkdirSync(dataDir, { recursive: true });
      }
      const serialized = {
        users: Array.from(this.users.entries()),
        accounts: Array.from(this.accounts.entries()),
        cards: Array.from(this.cards.entries()),
        ledger: this.ledger,
        auditLogs: this.auditLogs,
        adjustments: this.adjustments,
        activationRequests: this.activationRequests,
        riskEvents: this.riskEvents,
        supportCases: this.supportCases,
        mobileDeposits: this.mobileDeposits,
        adminUsers: Array.from(this.adminUsers.entries()),
        applications: Array.from(this.applications.entries()),
        receivingAccounts: Array.from(this.receivingAccounts.entries()),
        userPasswords: Array.from(this.userPasswords.entries()),
        activeSessions: Array.from(this.activeSessions.entries()),
        savedAt: new Date().toISOString()
      };
      fs.writeFileSync(this.dbFilePath, JSON.stringify(serialized, null, 2), 'utf-8');

      // Asynchronously mirror any changes to Supabase
      syncAllDataToSupabase(this).catch(e => console.debug('[Supabase Continuous Sync Notice]:', e));
    } catch (e) {
      console.error('Failed to persist database synchronously to disk:', e);
    }
  }

  saveToDisk() {
    if (this.saveTimeout) {
      clearTimeout(this.saveTimeout);
    }
    this.saveTimeout = setTimeout(() => {
      this.saveToDiskSync();
    }, 100);
  }

  hydrateFromJSON(data: any) {
    if (data.users) this.users = new Map(data.users);
    if (data.accounts) this.accounts = new Map(data.accounts);
    if (data.cards) this.cards = new Map(data.cards);
    if (data.ledger) this.ledger = data.ledger;
    if (data.auditLogs) this.auditLogs = data.auditLogs;
    if (data.adjustments) this.adjustments = data.adjustments;
    if (data.activationRequests) this.activationRequests = data.activationRequests;
    if (data.riskEvents) this.riskEvents = data.riskEvents;
    if (data.supportCases) this.supportCases = data.supportCases;
    if (data.mobileDeposits) this.mobileDeposits = data.mobileDeposits;
    if (data.adminUsers) this.adminUsers = new Map(data.adminUsers);
    if (data.applications) this.applications = new Map(data.applications);
    if (data.receivingAccounts) this.receivingAccounts = new Map(data.receivingAccounts);
    if (data.userPasswords) this.userPasswords = new Map(data.userPasswords);
    if (data.activeSessions) this.activeSessions = new Map(data.activeSessions);
  }

  seedInitialData() {
    // 1. Seed Customer: Jonathan Sterling (Premier Private Client)
    const primaryUser: UserProfile = {
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
        largeTransactionThresholdMinor: 500000 // $5,000.00
      },
      lastLogin: new Date(Date.now() - 3600000 * 2).toISOString()
    };

    this.users.set(primaryUser.id, primaryUser);
    this.userPasswords.set(primaryUser.id, 'AtlanticSecure2026!');

    // 2. Seed UK Dual-Citizen Account: Lady Evelyn Montgomery
    const ukUser: UserProfile = {
      id: 'usr_montgomery_02',
      email: 'evelyn.montgomery@mayfair-advisors.co.uk',
      username: 'emontgomery',
      firstName: 'Evelyn',
      lastName: 'Montgomery',
      phone: '+44 20 7946 0912',
      dialCode: '+44',
      dateOfBirth: '1979-11-23',
      nationality: 'British',
      passportNumber: 'GB98201499C',
      passportPhoto: 'https://images.unsplash.com/photo-1573496359142-b8d87734a5a2?w=500&auto=format&fit=crop&q=80',
      loginPin: '4321',
      ssnMasked: '•••-••-1190',
      nationalInsuranceMasked: 'AB 98 76 54 C',
      region: 'UK',
      approval_status: 'APPROVED',
      address: {
        line1: '14 Berkeley Square, Mayfair',
        city: 'London',
        stateOrCounty: 'Greater London',
        postalCode: 'W1J 6BQ',
        country: 'United Kingdom'
      },
      mfaEnabled: true,
      mfaMethod: 'SMS',
      biometricsEnabled: true,
      kycTier: 'TIER_3_INSTITUTIONAL',
      securityScore: 98,
      notifications: {
        emailAlerts: true,
        smsAlerts: true,
        pushAlerts: true,
        largeTransactionThresholdMinor: 1000000 // £10,000.00
      },
      lastLogin: new Date(Date.now() - 3600000 * 5).toISOString()
    };

    this.users.set(ukUser.id, ukUser);
    this.userPasswords.set(ukUser.id, 'MayfairLondon2026!');

    // 3. Single Master Administrator (Exclusive platform administrator)
    const singleMasterAdmin: AdminUser = {
      id: 'adm_master_01',
      email: 'admin@firstatlanticbank.com',
      name: 'Alexandra Vance',
      role: 'SUPER_ADMIN',
      department: 'Executive Risk, Governance & Master Administration',
      lastLogin: new Date().toISOString(),
      status: 'ACTIVE'
    };

    this.adminUsers.set(singleMasterAdmin.id, singleMasterAdmin);
    this.userPasswords.set(singleMasterAdmin.id, 'AdminMaster2026!');
    this.userPasswords.set('admin@firstatlanticbank.com', 'AdminMaster2026!');
    this.userPasswords.set('admin', 'AdminMaster2026!');

    // 4. Seed Accounts for Jonathan Sterling
    const acc1: BankAccount = {
      id: 'acc_sterling_chk_01',
      userId: primaryUser.id,
      accountNumber: '•••• 4892',
      accountNumberFull: '882049184892',
      routingNumber: '021000089',
      sortCode: undefined,
      swiftBic: 'FATLUS33NYC',
      name: 'Premier Private Checking',
      type: 'CHECKING_PREMIER',
      currency: 'USD',
      balanceMinor: 14892050, // $148,920.50
      availableBalanceMinor: 14642050, // $146,420.50 ($2,500 pending hold)
      pendingHoldMinor: 250000,
      interestRateAPY: 1.25,
      status: 'ACTIVE',
      region: 'US',
      openedDate: '2021-03-15',
      dailyTransferLimitMinor: 50000000, // $500,000.00
      statementCycleDay: 28
    };

    const acc2: BankAccount = {
      id: 'acc_sterling_sav_02',
      userId: primaryUser.id,
      accountNumber: '•••• 7104',
      accountNumberFull: '882049187104',
      routingNumber: '021000089',
      swiftBic: 'FATLUS33NYC',
      name: 'Atlantic Apex High-Yield Savings',
      type: 'SAVINGS_HIGH_YIELD',
      currency: 'USD',
      balanceMinor: 38450000, // $384,500.00
      availableBalanceMinor: 38450000,
      pendingHoldMinor: 0,
      interestRateAPY: 5.15,
      status: 'ACTIVE',
      region: 'US',
      openedDate: '2021-04-10',
      dailyTransferLimitMinor: 100000000,
      statementCycleDay: 28
    };

    const acc3: BankAccount = {
      id: 'acc_sterling_multigbp_03',
      userId: primaryUser.id,
      accountNumber: '•••• 9381',
      accountNumberFull: '608371993810',
      sortCode: '40-12-88',
      iban: 'GB29FATL40128860837199',
      swiftBic: 'FATLGB22LON',
      name: 'Global Multi-Currency GBP Reserve',
      type: 'MULTI_CURRENCY_GLOBAL',
      currency: 'GBP',
      balanceMinor: 8940000, // £89,400.00
      availableBalanceMinor: 8940000,
      pendingHoldMinor: 0,
      interestRateAPY: 4.80,
      status: 'ACTIVE',
      region: 'UK',
      openedDate: '2022-06-20',
      dailyTransferLimitMinor: 75000000,
      statementCycleDay: 15
    };

    const acc4: BankAccount = {
      id: 'acc_sterling_crd_04',
      userId: primaryUser.id,
      accountNumber: '•••• 1084',
      accountNumberFull: '4532890123451084',
      swiftBic: 'FATLUS33NYC',
      name: 'First Atlantic Infinite Visa Signature',
      type: 'CREDIT_CARD_INFINITE',
      currency: 'USD',
      balanceMinor: 341280, // Current spend $3,412.80
      availableBalanceMinor: 9658720, // Available credit ($100,000 limit - $3,412.80)
      pendingHoldMinor: 48500,
      creditLimitMinor: 10000000, // $100,000.00
      status: 'ACTIVE',
      region: 'US',
      openedDate: '2021-03-20',
      dailyTransferLimitMinor: 2500000,
      statementCycleDay: 1
    };

    this.accounts.set(acc1.id, acc1);
    this.accounts.set(acc2.id, acc2);
    this.accounts.set(acc3.id, acc3);
    this.accounts.set(acc4.id, acc4);

    // 5. Seed Cards for Jonathan
    const card1: BankCard = {
      id: 'crd_deb_01',
      accountId: acc1.id,
      userId: primaryUser.id,
      cardNumberMasked: '•••• •••• •••• 4892',
      cardNumberFull: '4111 8892 0149 4892',
      cardHolderName: 'JONATHAN STERLING',
      expiryMonth: 11,
      expiryYear: 2029,
      cvv: '849',
      cardType: 'DEBIT_VISA_SIGNATURE',
      status: 'ACTIVE',
      isVirtual: false,
      contactlessEnabled: true,
      onlineTransactionsEnabled: true,
      internationalSpendEnabled: true,
      dailyAtmLimitMinor: 500000,
      dailySpendLimitMinor: 2500000,
      travelNotices: [
        { country: 'United Kingdom', startDate: '2026-09-01', endDate: '2026-09-15' }
      ]
    };

    const card2: BankCard = {
      id: 'crd_inf_02',
      accountId: acc4.id,
      userId: primaryUser.id,
      cardNumberMasked: '•••• •••• •••• 1084',
      cardNumberFull: '4532 8901 2345 1084',
      cardHolderName: 'JONATHAN STERLING',
      expiryMonth: 8,
      expiryYear: 2030,
      cvv: '392',
      cardType: 'CREDIT_ATLANTIC_INFINITE',
      status: 'ACTIVE',
      isVirtual: false,
      contactlessEnabled: true,
      onlineTransactionsEnabled: true,
      internationalSpendEnabled: true,
      dailyAtmLimitMinor: 1000000,
      dailySpendLimitMinor: 10000000,
      travelNotices: []
    };

    this.cards.set(card1.id, card1);
    this.cards.set(card2.id, card2);

    // 6. Seed Detailed Ledger History for Jonathan
    const now = Date.now();
    const day = 86400000;

    const initialLedger: LedgerEntry[] = [
      {
        id: 'led_001',
        transactionId: 'tx_fatl_99401',
        accountId: acc1.id,
        direction: 'CREDIT',
        amountMinor: 2850000, // $28,500.00
        currency: 'USD',
        balanceAfterMinor: 14892050,
        description: 'Direct Deposit — Morgan Stanley Global Wealth Distribution',
        category: 'Income',
        counterparty: 'Morgan Stanley Wealth Management',
        status: 'SETTLED',
        channel: 'ACH',
        referenceNumber: 'ACH-MS-20260815-99201',
        createdTimestamp: new Date(now - day * 2).toISOString(),
        effectiveTimestamp: new Date(now - day * 2).toISOString(),
        settledTimestamp: new Date(now - day * 2).toISOString()
      },
      {
        id: 'led_002',
        transactionId: 'tx_fatl_99392',
        accountId: acc1.id,
        direction: 'DEBIT',
        amountMinor: 250000, // $2,500.00
        currency: 'USD',
        balanceAfterMinor: 12042050,
        description: 'Wire Out — Sotheby\'s International Realty Escrow',
        category: 'Transfers',
        counterparty: 'Sotheby\'s Realty NY Escrow Trust',
        status: 'PENDING',
        channel: 'WIRE',
        referenceNumber: 'FEDWIRE-20260816-88192',
        createdTimestamp: new Date(now - day * 1).toISOString(),
        effectiveTimestamp: new Date(now - day * 1).toISOString()
      },
      {
        id: 'led_003',
        transactionId: 'tx_fatl_99210',
        accountId: acc1.id,
        direction: 'DEBIT',
        amountMinor: 48500, // $485.00
        currency: 'USD',
        balanceAfterMinor: 12292050,
        description: 'Bill Payment — ConEdison Electric NYC',
        category: 'Bills & Utilities',
        counterparty: 'Consolidated Edison NY',
        status: 'SETTLED',
        channel: 'ONLINE',
        referenceNumber: 'BP-CONED-884910',
        createdTimestamp: new Date(now - day * 4).toISOString(),
        effectiveTimestamp: new Date(now - day * 4).toISOString(),
        settledTimestamp: new Date(now - day * 4).toISOString()
      },
      {
        id: 'led_004',
        transactionId: 'tx_fatl_99119',
        accountId: acc2.id,
        direction: 'CREDIT',
        amountMinor: 164890, // $1,648.90
        currency: 'USD',
        balanceAfterMinor: 38450000,
        description: 'Monthly Compound Yield Payment (5.15% APY)',
        category: 'Fees & Interest',
        counterparty: 'First Atlantic Bank Treasury',
        status: 'SETTLED',
        channel: 'ADMIN_PORTAL',
        referenceNumber: 'INT-APEX-202607-001',
        createdTimestamp: new Date(now - day * 18).toISOString(),
        effectiveTimestamp: new Date(now - day * 18).toISOString(),
        settledTimestamp: new Date(now - day * 18).toISOString()
      },
      {
        id: 'led_005',
        transactionId: 'tx_fatl_98901',
        accountId: acc3.id,
        direction: 'CREDIT',
        amountMinor: 5000000, // £50,000.00
        currency: 'GBP',
        balanceAfterMinor: 8940000,
        description: 'Faster Payments Inbound — Barclays Private Bank London',
        category: 'Transfers',
        counterparty: 'Barclays Private Bank UK',
        status: 'SETTLED',
        channel: 'FPS',
        referenceNumber: 'FPS-LON-99201948',
        createdTimestamp: new Date(now - day * 7).toISOString(),
        effectiveTimestamp: new Date(now - day * 7).toISOString(),
        settledTimestamp: new Date(now - day * 7).toISOString()
      },
      {
        id: 'led_006',
        transactionId: 'tx_fatl_98812',
        accountId: acc4.id,
        direction: 'DEBIT',
        amountMinor: 125000, // $1,250.00
        currency: 'USD',
        balanceAfterMinor: 341280,
        description: 'The Carlyle Hotel New York — Fine Dining & Suites',
        category: 'Shopping & Dining',
        counterparty: 'The Carlyle Hotel NYC',
        status: 'SETTLED',
        channel: 'CARD_POS',
        referenceNumber: 'POS-AUTH-48192-CARLYLE',
        createdTimestamp: new Date(now - day * 3).toISOString(),
        effectiveTimestamp: new Date(now - day * 3).toISOString(),
        settledTimestamp: new Date(now - day * 3).toISOString()
      }
    ];

    this.ledger.push(...initialLedger);

    // Seed corresponding double-entry transactions in doubleEntryLedger engine
    try {
      // Seed Tx 1: Inbound Direct Deposit
      doubleEntryLedger.commitJournalTransaction({
        referenceNumber: 'ACH-MS-20260815-99201',
        transactionType: 'INBOUND_WIRE',
        description: 'Direct Deposit — Morgan Stanley Wealth Management',
        effectiveAt: new Date(now - day * 2).toISOString(),
        lines: [
          {
            id: 'jl_init_1',
            accountId: 'GL_1001_FED_RESERVE_CASH',
            accountType: 'GL_ASSET',
            accountName: 'Federal Reserve Master Account Cash',
            direction: 'DEBIT',
            amountMinor: 2850000,
            currency: 'USD',
            description: 'ACH Clearing Settlement Settlement Inflow'
          },
          {
            id: 'jl_init_2',
            accountId: acc1.id,
            accountType: 'CUSTOMER_DEPOSIT',
            accountName: `${acc1.name} (${acc1.accountNumber})`,
            direction: 'CREDIT',
            amountMinor: 2850000,
            currency: 'USD',
            description: 'Direct Deposit — Morgan Stanley Global Wealth Distribution'
          }
        ]
      });

      // Seed Tx 2: Outbound Fedwire
      doubleEntryLedger.commitJournalTransaction({
        referenceNumber: 'FEDWIRE-20260816-88192',
        transactionType: 'OUTBOUND_WIRE',
        description: "Wire Out — Sotheby's International Realty Escrow",
        effectiveAt: new Date(now - day * 1).toISOString(),
        lines: [
          {
            id: 'jl_init_3',
            accountId: acc1.id,
            accountType: 'CUSTOMER_DEPOSIT',
            accountName: `${acc1.name} (${acc1.accountNumber})`,
            direction: 'DEBIT',
            amountMinor: 250000,
            currency: 'USD',
            description: "Escrow Wire Outflow"
          },
          {
            id: 'jl_init_4',
            accountId: 'GL_1001_FED_RESERVE_CASH',
            accountType: 'GL_ASSET',
            accountName: 'Federal Reserve Master Account Cash',
            direction: 'CREDIT',
            amountMinor: 250000,
            currency: 'USD',
            description: 'Fedwire Funds Settlement Outflow'
          }
        ]
      });

      // Seed Tx 3: Bill Payment ConEd
      doubleEntryLedger.commitJournalTransaction({
        referenceNumber: 'BP-CONED-884910',
        transactionType: 'BILL_PAYMENT',
        description: 'Bill Payment — ConEdison Electric NYC',
        effectiveAt: new Date(now - day * 4).toISOString(),
        lines: [
          {
            id: 'jl_init_5',
            accountId: acc1.id,
            accountType: 'CUSTOMER_DEPOSIT',
            accountName: `${acc1.name} (${acc1.accountNumber})`,
            direction: 'DEBIT',
            amountMinor: 48500,
            currency: 'USD',
            description: 'Bill Payment Remittance'
          },
          {
            id: 'jl_init_6',
            accountId: 'GL_1001_FED_RESERVE_CASH',
            accountType: 'GL_ASSET',
            accountName: 'Federal Reserve Master Account Cash',
            direction: 'CREDIT',
            amountMinor: 48500,
            currency: 'USD',
            description: 'Utility Clearing Settlement'
          }
        ]
      });

      // Seed Tx 4: Compound Yield Payment
      doubleEntryLedger.commitJournalTransaction({
        referenceNumber: 'INT-APEX-202607-001',
        transactionType: 'INTEREST_COMPOUND',
        description: 'Monthly Compound Yield Payment (5.15% APY)',
        effectiveAt: new Date(now - day * 18).toISOString(),
        lines: [
          {
            id: 'jl_init_7',
            accountId: 'GL_5001_DEPOSIT_INTEREST_EXPENSE',
            accountType: 'GL_EXPENSE',
            accountName: 'High-Yield Savings Compound Interest Expense',
            direction: 'DEBIT',
            amountMinor: 164890,
            currency: 'USD',
            description: 'Accrued Compound Yield Expense'
          },
          {
            id: 'jl_init_8',
            accountId: acc2.id,
            accountType: 'CUSTOMER_DEPOSIT',
            accountName: `${acc2.name} (${acc2.accountNumber})`,
            direction: 'CREDIT',
            amountMinor: 164890,
            currency: 'USD',
            description: 'Monthly Compound Yield Payment'
          }
        ]
      });

      // Seed Tx 5: Inbound Faster Payments GBP
      doubleEntryLedger.commitJournalTransaction({
        referenceNumber: 'FPS-LON-99201948',
        transactionType: 'INBOUND_WIRE',
        description: 'Faster Payments Inbound — Barclays Private Bank London',
        effectiveAt: new Date(now - day * 7).toISOString(),
        lines: [
          {
            id: 'jl_init_9',
            accountId: 'GL_1002_BOE_SETTLEMENT_CASH',
            accountType: 'GL_ASSET',
            accountName: 'Bank of England RTGS Reserve Account',
            direction: 'DEBIT',
            amountMinor: 5000000,
            currency: 'GBP',
            description: 'FPS Clearing Settlement Inflow'
          },
          {
            id: 'jl_init_10',
            accountId: acc3.id,
            accountType: 'CUSTOMER_DEPOSIT',
            accountName: `${acc3.name} (${acc3.accountNumber})`,
            direction: 'CREDIT',
            amountMinor: 5000000,
            currency: 'GBP',
            description: 'Faster Payments Inbound'
          }
        ]
      });
    } catch (e) {
      console.warn('Seeding double-entry transactions warning:', e);
    }

    // 7. Seed Audit Logs
    this.auditLogs.push(
      {
        id: 'aud_88910',
        actorId: singleMasterAdmin.id,
        actorEmail: singleMasterAdmin.email,
        actorRole: 'SUPER_ADMIN',
        action: 'ACCOUNT_LIMIT_UPGRADE',
        targetType: 'ACCOUNT',
        targetId: acc1.id,
        ipAddress: '199.16.156.12',
        userAgent: 'First Atlantic Institutional Core v4.2 / MacOS',
        timestamp: new Date(now - day * 10).toISOString(),
        details: 'Approved daily wire limit escalation to $500,000.00 per private banking mandate.',
        signatureHash: 'e3b0c44298fc1c149afbf4c8996fb92427ae41e4649b934ca495991b7852b855'
      },
      {
        id: 'aud_88911',
        actorId: primaryUser.id,
        actorEmail: primaryUser.email,
        actorRole: 'CUSTOMER',
        action: 'MFA_AUTHENTICATED_LOGIN',
        targetType: 'SECURITY',
        targetId: primaryUser.id,
        ipAddress: '108.45.192.8',
        userAgent: 'Mozilla/5.0 (Macintosh; Intel Mac OS X 14_5) AppleWebKit/537.36 Chrome/128.0.0.0 Safari/537.36',
        timestamp: new Date(now - 3600000 * 2).toISOString(),
        details: 'Hardware authenticator TOTP verified successfully from New York, US.',
        signatureHash: 'd4735e3a265e16eee03f59718b9b5d03019c07d8b6c51f90da3a666eec13ab35'
      }
    );

    // 8. Seed Adjustments
    this.adjustments.push({
      id: 'adj_9910',
      referenceNumber: 'ADJ-FAB-2026-0091',
      accountId: acc1.id,
      accountNumber: acc1.accountNumber,
      customerName: `${primaryUser.firstName} ${primaryUser.lastName}`,
      amountMinor: 3500, // $35.00
      currency: 'USD',
      direction: 'CREDIT',
      adjustmentType: 'FEE_REVERSAL',
      reason: 'Waiver of international wire dispatch inquiry fee as courtesy to Private Client',
      effectiveDate: new Date(now - day * 12).toISOString().slice(0, 10),
      makerAdminId: singleMasterAdmin.id,
      makerAdminName: singleMasterAdmin.name,
      checkerAdminId: singleMasterAdmin.id,
      checkerAdminName: singleMasterAdmin.name,
      status: 'APPROVED_AND_POSTED',
      createdTimestamp: new Date(now - day * 12).toISOString(),
      postedTimestamp: new Date(now - day * 12 + 3600000).toISOString(),
      approvalNotes: 'Approved per Executive relationship manager discretionary policy.'
    });

    // 9. Seed Risk Events
    this.riskEvents.push({
      id: 'rsk_101',
      userId: primaryUser.id,
      customerName: `${primaryUser.firstName} ${primaryUser.lastName}`,
      riskScore: 24,
      severity: 'LOW',
      eventType: 'UNRECOGNIZED_DEVICE',
      description: 'New login session initiated from Safari on Apple iPad in Boston, MA.',
      ipAddress: '65.112.8.94',
      location: 'Boston, MA, United States',
      status: 'DISMISSED',
      timestamp: new Date(now - day * 5).toISOString()
    });

    // 10. Seed Support Cases
    this.supportCases.push({
      id: 'cas_7721',
      userId: primaryUser.id,
      customerName: `${primaryUser.firstName} ${primaryUser.lastName}`,
      subject: 'Global Multi-Currency Sort Code Verification for London Escrow',
      category: 'TRANSFERS',
      status: 'RESOLVED',
      priority: 'MEDIUM',
      messages: [
        {
          id: 'msg_01',
          sender: 'CUSTOMER',
          senderName: 'Jonathan Sterling',
          message: 'Good morning, please provide the verified clearing sort code and London SWIFT BIC for receiving a GBP 150,000 real estate escrow distribution next week.',
          timestamp: new Date(now - day * 8).toISOString()
        },
        {
          id: 'msg_02',
          sender: 'SUPPORT_AGENT',
          senderName: 'Victoria Hastings (Private Banking Concierge)',
          message: 'Good morning Mr. Sterling. Your dedicated UK sorting code is 40-12-88 with SWIFT BIC FATLGB22LON. We have placed a pre-advice notice on your Global GBP account so funds clear instantly upon arrival.',
          timestamp: new Date(now - day * 8 + 3600000 * 2).toISOString()
        }
      ],
      createdTimestamp: new Date(now - day * 8).toISOString(),
      updatedTimestamp: new Date(now - day * 8 + 3600000 * 2).toISOString()
    });

    // 11. Seed International & European Account Applications
    const app1: AccountApplication = {
      id: 'app_frankfurt_01',
      referenceNumber: 'FAB-EU-2026-99214',
      firstName: 'Maximilian',
      middleName: 'Heinrich',
      lastName: 'von Berg',
      email: 'm.vonberg@rhein-finanz.de',
      phone: '+49 69 9002 1890',
      dateOfBirth: '1982-07-14',
      nationality: 'Germany',
      taxIdOrSsn: 'DE 948 201 492',
      idDocumentType: 'PASSPORT',
      idDocumentNumber: 'C78942018',
      idDocumentFileName: 'passport_germany_m_vonberg.pdf',
      proofOfAddressFileName: 'utility_frankfurt_strom.pdf',
      address: {
        line1: 'Bockenheimer Landstraße 42',
        line2: 'Westend-Süd',
        city: 'Frankfurt am Main',
        stateOrProvince: 'Hessen',
        postalCode: '60323',
        country: 'Germany'
      },
      employmentStatus: 'EXECUTIVE',
      employerOrBusinessName: 'Rhein Asset Management GmbH',
      sourceOfWealth: 'BUSINESS_PROCEEDS',
      annualIncomeRange: 'EUR_250K_1M',
      isPep: false,
      requestedCurrency: 'EUR',
      requestedAccountType: 'CHECKING_PREMIER',
      requestedRegion: 'EU',
      initialDepositAmountMinor: 15000000, // €150,000.00
      requestDebitCard: true,
      username: 'mvonberg',
      passwordHashed: 'FrankfurtSecure2026!',
      mfaPreference: 'AUTHENTICATOR',
      status: 'PENDING_COMPLIANCE_REVIEW',
      riskScore: 18,
      submittedAt: new Date(now - day * 1.5).toISOString(),
      complianceNotes: 'Sanction and PEP screening cleared clean. High-value European corporate executive.'
    };

    const app2: AccountApplication = {
      id: 'app_paris_02',
      referenceNumber: 'FAB-EU-2026-78401',
      firstName: 'Dr. Chloé',
      middleName: 'Margaux',
      lastName: 'Laurent',
      email: 'chloe.laurent@sorbonne-med.fr',
      phone: '+33 1 42 68 55 00',
      dateOfBirth: '1988-03-22',
      nationality: 'France',
      taxIdOrSsn: 'FR 84 920 184 902',
      idDocumentType: 'EU_NATIONAL_ID',
      idDocumentNumber: 'FR-994820149',
      idDocumentFileName: 'cni_france_claurent.pdf',
      proofOfAddressFileName: 'edf_electricite_paris.pdf',
      address: {
        line1: '28 Avenue Montaigne',
        city: 'Paris',
        stateOrProvince: 'Île-de-France',
        postalCode: '75008',
        country: 'France'
      },
      employmentStatus: 'SELF_EMPLOYED',
      employerOrBusinessName: 'Cabinet Médical Montaigne',
      sourceOfWealth: 'SALARY',
      annualIncomeRange: 'EUR_100K_250K',
      isPep: false,
      requestedCurrency: 'EUR',
      requestedAccountType: 'SAVINGS_HIGH_YIELD',
      requestedRegion: 'EU',
      initialDepositAmountMinor: 8500000, // €85,000.00
      requestDebitCard: true,
      username: 'claurent',
      passwordHashed: 'ParisMedical2026!',
      mfaPreference: 'SMS',
      status: 'PENDING_COMPLIANCE_REVIEW',
      riskScore: 22,
      submittedAt: new Date(now - 3600000 * 14).toISOString(),
      complianceNotes: 'Verified French professional medical license and residential documentation.'
    };

    const app3: AccountApplication = {
      id: 'app_london_03',
      referenceNumber: 'FAB-UK-2026-10294',
      firstName: 'Sir Alistair',
      lastName: 'Crawford',
      email: 'alistair.crawford@crawford-heritage.co.uk',
      phone: '+44 20 7946 0411',
      dateOfBirth: '1970-09-05',
      nationality: 'United Kingdom',
      taxIdOrSsn: 'AB 12 34 56 Z',
      idDocumentType: 'PASSPORT',
      idDocumentNumber: 'UK99014820',
      idDocumentFileName: 'passport_uk_acrawford.pdf',
      proofOfAddressFileName: 'council_tax_westminster.pdf',
      address: {
        line1: '8 Grosvenor Crescent, Belgravia',
        city: 'London',
        stateOrProvince: 'Greater London',
        postalCode: 'SW1X 7EE',
        country: 'United Kingdom'
      },
      employmentStatus: 'BUSINESS_OWNER',
      sourceOfWealth: 'INHERITANCE',
      annualIncomeRange: 'EUR_1M_PLUS',
      isPep: false,
      requestedCurrency: 'GBP',
      requestedAccountType: 'MULTI_CURRENCY_GLOBAL',
      requestedRegion: 'UK',
      initialDepositAmountMinor: 50000000, // £500,000.00
      requestDebitCard: true,
      username: 'acrawford',
      passwordHashed: 'Belgravia2026!',
      mfaPreference: 'AUTHENTICATOR',
      status: 'APPROVED',
      riskScore: 12,
      submittedAt: new Date(now - day * 5).toISOString(),
      reviewedAt: new Date(now - day * 4).toISOString(),
      reviewedByAdminId: singleMasterAdmin.id,
      reviewedByAdminName: singleMasterAdmin.name,
      complianceNotes: 'Fully verified private client. Assigned dedicated London Mayfair concierge desk.',
      provisionedIban: 'GB29FATL40128899014820',
      provisionedSortCode: '40-12-88',
      provisionedAccountNumber: '99014820'
    };

    this.applications.set(app1.id, app1);
    this.applications.set(app2.id, app2);
    this.applications.set(app3.id, app3);

    // Seed 30-day historical application trajectory for realistic analytics & trend visualization
    const historicalApplicants = [
      { name: 'Arthur Pendelton', email: 'a.pendelton@oxford-endowment.uk', nat: 'United Kingdom', reg: 'UK' as BankRegion, curr: 'GBP' as CurrencyCode, dep: 45000000, daysAgo: 28, status: 'APPROVED' as const },
      { name: 'Éléonore Moreau', email: 'e.moreau@bordeaux-vins.fr', nat: 'France', reg: 'EU' as BankRegion, curr: 'EUR' as CurrencyCode, dep: 22000000, daysAgo: 27, status: 'APPROVED' as const },
      { name: 'Klaus Lindemann', email: 'k.lindemann@berlin-tech.de', nat: 'Germany', reg: 'EU' as BankRegion, curr: 'EUR' as CurrencyCode, dep: 18000000, daysAgo: 25, status: 'APPROVED' as const },
      { name: 'Harrison Vance Jr.', email: 'hvance@manhattan-cap.com', nat: 'United States', reg: 'US' as BankRegion, curr: 'USD' as CurrencyCode, dep: 75000000, daysAgo: 24, status: 'APPROVED' as const },
      { name: 'Giacomo Rossi', email: 'g.rossi@milano-moda.it', nat: 'Italy', reg: 'EU' as BankRegion, curr: 'EUR' as CurrencyCode, dep: 30000000, daysAgo: 23, status: 'APPROVED' as const },
      { name: 'Lady Fiona MacLeod', email: 'f.macleod@edinburgh-estates.uk', nat: 'United Kingdom', reg: 'UK' as BankRegion, curr: 'GBP' as CurrencyCode, dep: 60000000, daysAgo: 22, status: 'APPROVED' as const },
      { name: 'Dr. Sebastian Becker', email: 's.becker@zurich-clinics.ch', nat: 'Switzerland', reg: 'EU' as BankRegion, curr: 'EUR' as CurrencyCode, dep: 40000000, daysAgo: 20, status: 'APPROVED' as const },
      { name: 'Camilla Thorne', email: 'c.thorne@mayfair-art.co.uk', nat: 'United Kingdom', reg: 'UK' as BankRegion, curr: 'GBP' as CurrencyCode, dep: 25000000, daysAgo: 19, status: 'APPROVED' as const },
      { name: 'Julian Drake', email: 'j.drake@boston-ventures.us', nat: 'United States', reg: 'US' as BankRegion, curr: 'USD' as CurrencyCode, dep: 50000000, daysAgo: 18, status: 'APPROVED' as const },
      { name: 'Amalia van den Berg', email: 'a.vandenberg@amsterdam-holding.nl', nat: 'Netherlands', reg: 'EU' as BankRegion, curr: 'EUR' as CurrencyCode, dep: 35000000, daysAgo: 16, status: 'APPROVED' as const },
      { name: 'Edward Sterling-Hall', email: 'e.sterlinghall@cotswolds-heritage.uk', nat: 'United Kingdom', reg: 'UK' as BankRegion, curr: 'GBP' as CurrencyCode, dep: 80000000, daysAgo: 15, status: 'APPROVED' as const },
      { name: 'Benoît Dubois', email: 'b.dubois@lyon-logistics.fr', nat: 'France', reg: 'EU' as BankRegion, curr: 'EUR' as CurrencyCode, dep: 19000000, daysAgo: 14, status: 'APPROVED' as const },
      { name: 'Marta Rodriguez', email: 'm.rodriguez@madrid-prop.es', nat: 'Spain', reg: 'EU' as BankRegion, curr: 'EUR' as CurrencyCode, dep: 28000000, daysAgo: 13, status: 'REJECTED' as const },
      { name: 'Charles Montgomery', email: 'c.montgomery@chicago-trust.us', nat: 'United States', reg: 'US' as BankRegion, curr: 'USD' as CurrencyCode, dep: 65000000, daysAgo: 11, status: 'APPROVED' as const },
      { name: 'Sophie de Winter', email: 's.dewinter@brussels-advisory.be', nat: 'Belgium', reg: 'EU' as BankRegion, curr: 'EUR' as CurrencyCode, dep: 32000000, daysAgo: 10, status: 'APPROVED' as const },
      { name: 'David Sinclair', email: 'd.sinclair@aberdeen-energy.uk', nat: 'United Kingdom', reg: 'UK' as BankRegion, curr: 'GBP' as CurrencyCode, dep: 42000000, daysAgo: 9, status: 'APPROVED' as const },
      { name: 'Oliver Kensington', email: 'o.kensington@chelsea-capital.co.uk', nat: 'United Kingdom', reg: 'UK' as BankRegion, curr: 'GBP' as CurrencyCode, dep: 55000000, daysAgo: 8, status: 'APPROVED' as const },
      { name: 'Henrik Larsson', email: 'h.larsson@stockholm-nordic.se', nat: 'Sweden', reg: 'EU' as BankRegion, curr: 'EUR' as CurrencyCode, dep: 24000000, daysAgo: 7, status: 'APPROVED' as const },
      { name: 'Genevieve Du Pont', email: 'g.dupont@geneva-wealth.ch', nat: 'Switzerland', reg: 'EU' as BankRegion, curr: 'EUR' as CurrencyCode, dep: 90000000, daysAgo: 6, status: 'APPROVED' as const },
      { name: 'Alexander Wright', email: 'a.wright@greenwich-funds.us', nat: 'United States', reg: 'US' as BankRegion, curr: 'USD' as CurrencyCode, dep: 48000000, daysAgo: 4, status: 'APPROVED' as const },
      { name: 'Baroness Helena von Stauffen', email: 'helena.stauffen@geneva-trust.ch', nat: 'Switzerland', reg: 'EU' as BankRegion, curr: 'EUR' as CurrencyCode, dep: 50000000, daysAgo: 3, status: 'PENDING_COMPLIANCE_REVIEW' as const },
      { name: 'Lord Sterling Montgomery-Fox', email: 's.montgomeryfox@mayfair-advisors.co.uk', nat: 'United Kingdom', reg: 'UK' as BankRegion, curr: 'GBP' as CurrencyCode, dep: 35000000, daysAgo: 2, status: 'PENDING_COMPLIANCE_REVIEW' as const },
      { name: 'Constance Waverly', email: 'c.waverly@sanfrancisco-founders.us', nat: 'United States', reg: 'US' as BankRegion, curr: 'USD' as CurrencyCode, dep: 62000000, daysAgo: 0.8, status: 'PENDING_COMPLIANCE_REVIEW' as const }
    ];

    historicalApplicants.forEach((h, idx) => {
      const names = h.name.split(' ');
      const firstName = names[0];
      const lastName = names.slice(1).join(' ');
      const subTime = new Date(now - day * h.daysAgo).toISOString();
      const refCode = `FAB-${h.reg}-2026-${80000 + idx * 37}`;
      const appId = `app_hist_${idx + 1}`;

      const appObj: AccountApplication = {
        id: appId,
        referenceNumber: refCode,
        firstName,
        lastName,
        email: h.email,
        phone: h.reg === 'UK' ? '+44 20 7946 0999' : h.reg === 'US' ? '+1 (212) 555-0199' : '+49 69 9002 9999',
        dateOfBirth: '1980-05-12',
        nationality: h.nat,
        taxIdOrSsn: 'REG-TAX-99014',
        idDocumentType: 'PASSPORT',
        idDocumentNumber: `DOC-${89201 + idx}`,
        idDocumentFileName: `passport_${firstName.toLowerCase()}_${lastName.toLowerCase()}.pdf`,
        proofOfAddressFileName: `utility_statement_${lastName.toLowerCase()}.pdf`,
        address: {
          line1: `${10 + idx} High Street`,
          city: h.reg === 'UK' ? 'London' : h.reg === 'US' ? 'New York' : 'Frankfurt',
          stateOrProvince: h.reg === 'UK' ? 'Greater London' : h.reg === 'US' ? 'NY' : 'Hessen',
          postalCode: h.reg === 'UK' ? 'EC2N 2DB' : h.reg === 'US' ? '10005' : '60311',
          country: h.nat
        },
        employmentStatus: 'EXECUTIVE',
        employerOrBusinessName: `${lastName} Holdings Group`,
        sourceOfWealth: 'INVESTMENTS',
        annualIncomeRange: 'EUR_500K_1M',
        isPep: idx % 7 === 0,
        requestedCurrency: h.curr,
        requestedAccountType: 'CHECKING_PREMIER',
        requestedRegion: h.reg,
        initialDepositAmountMinor: h.dep,
        requestDebitCard: true,
        username: `${firstName.toLowerCase()}${lastName.toLowerCase().replace(/[^a-z]/g, '')}`,
        passwordHashed: 'InstitutionalSecure2026!',
        mfaPreference: 'AUTHENTICATOR',
        status: h.status,
        riskScore: 10 + (idx % 15),
        submittedAt: subTime,
        reviewedAt: h.status !== 'PENDING_COMPLIANCE_REVIEW' ? new Date(now - day * (h.daysAgo - 0.5)).toISOString() : undefined,
        reviewedByAdminId: h.status !== 'PENDING_COMPLIANCE_REVIEW' ? singleMasterAdmin.id : undefined,
        reviewedByAdminName: h.status !== 'PENDING_COMPLIANCE_REVIEW' ? singleMasterAdmin.name : undefined,
        complianceNotes: h.status === 'APPROVED' ? 'Cleared compliance AML thresholds.' : h.status === 'REJECTED' ? 'Incomplete source of funds documentation.' : 'Pending KYC verification.',
        provisionedIban: h.status === 'APPROVED' ? (h.reg === 'UK' ? `GB29FATL401288${80000000 + idx}` : h.reg === 'EU' ? `DE89FATL50070010${80000000 + idx}` : undefined) : undefined,
        provisionedAccountNumber: h.status === 'APPROVED' ? `${80000000 + idx}` : undefined
      };

      this.applications.set(appObj.id, appObj);
    });

    // 12. Seed Pending User: Count Henri de Castiglione (Awaiting Dual-Signature Approval)
    const pendingUser: UserProfile = {
      id: 'usr_castiglione_03',
      email: 'henri.castiglione@lux-private.lu',
      username: 'hcastiglione',
      firstName: 'Henri',
      lastName: 'de Castiglione',
      phone: '+352 20 88 19 00',
      dateOfBirth: '1975-06-18',
      region: 'EU',
      approval_status: 'PENDING',
      address: {
        line1: '12 Boulevard Royal',
        city: 'Luxembourg City',
        stateOrCounty: 'Luxembourg',
        postalCode: 'L-2449',
        country: 'Luxembourg'
      },
      mfaEnabled: true,
      mfaMethod: 'AUTHENTICATOR',
      biometricsEnabled: true,
      kycTier: 'TIER_3_INSTITUTIONAL',
      securityScore: 89,
      notifications: {
        emailAlerts: true,
        smsAlerts: true,
        pushAlerts: true,
        largeTransactionThresholdMinor: 2500000
      },
      lastLogin: new Date(now - day * 1).toISOString()
    };

    this.users.set(pendingUser.id, pendingUser);
    this.userPasswords.set(pendingUser.id, 'LuxembourgSecure2026!');

    // 13. Seed Dual-Signature Account Activation Queue
    this.activationRequests.push(
      {
        id: 'act_req_01',
        userId: pendingUser.id,
        referenceNumber: 'FAB-ACT-2026-9901',
        userName: `${pendingUser.firstName} ${pendingUser.lastName}`,
        userEmail: pendingUser.email,
        userRegion: 'EU',
        requestedAccountType: 'CHECKING_PREMIER',
        requestedCurrency: 'EUR',
        initialDepositMinor: 25000000, // €250,000.00
        riskScore: 16,
        reason: 'Private Wealth European onboarding — institutional identity and AML verification completed.',
        targetApprovalStatus: 'APPROVED',
        makerAdminId: singleMasterAdmin.id,
        makerAdminName: singleMasterAdmin.name,
        makerAdminRole: singleMasterAdmin.role,
        makerTimestamp: new Date(now - 3600000 * 6).toISOString(),
        makerNotes: 'Verified beneficial ownership, tax residence in Luxembourg, and Source of Wealth documentation.',
        makerSignatureHash: this.computeHash(`${singleMasterAdmin.id}_ACTIVATE_${pendingUser.id}_${now - 3600000 * 6}`),
        status: 'PENDING_DUAL_APPROVAL'
      },
      {
        id: 'act_req_02',
        userId: 'usr_laurent_paris_04',
        applicationId: app2.id,
        referenceNumber: 'FAB-ACT-2026-9902',
        userName: `${app2.firstName} ${app2.lastName}`,
        userEmail: app2.email,
        userRegion: 'EU',
        requestedAccountType: 'SAVINGS_HIGH_YIELD',
        requestedCurrency: 'EUR',
        initialDepositMinor: 8500000, // €85,000.00
        riskScore: 22,
        reason: 'New Medical Professional Euro Reserve account onboarding.',
        targetApprovalStatus: 'APPROVED',
        makerAdminId: singleMasterAdmin.id,
        makerAdminName: singleMasterAdmin.name,
        makerAdminRole: singleMasterAdmin.role,
        makerTimestamp: new Date(now - 3600000 * 2).toISOString(),
        makerNotes: 'Sanctions clearance verified. National ID and French address certified.',
        makerSignatureHash: this.computeHash(`${singleMasterAdmin.id}_ACTIVATE_app2_${now - 3600000 * 2}`),
        status: 'PENDING_DUAL_APPROVAL'
      }
    );

    // 12. Seed Master Bank Receiving Accounts (Where all incoming client deposits / wire transfers are received)
    const recAccUSD: BankReceivingAccount = {
      id: 'rec_bank_usd_01',
      label: 'Primary USD Master Treasury Inflow Desk',
      bankName: 'First Atlantic Bank N.A. (New York)',
      beneficiaryName: 'First Atlantic Bank & Trust Corporation - Inflow Treasury',
      accountNumberOrIban: '02100008988492019',
      routingNumber: '021000089',
      swiftBic: 'FATLUS33NYC',
      currency: 'USD',
      region: 'US',
      bankAddress: '450 Lexington Avenue, Suite 2800, New York, NY 10017, USA',
      intermediaryBankName: 'Federal Reserve Bank of New York (Fedwire Direct)',
      intermediarySwiftBic: 'FRNYUS33',
      specialInstructions: 'Quote Client Name and FAB Account Number in Field 70 (Remittance Info / Reference). Funds credited instantly upon SWIFT / Fedwire receipt.',
      isDefault: true,
      status: 'ACTIVE',
      updatedAt: new Date(now - day * 15).toISOString()
    };

    const recAccGBP: BankReceivingAccount = {
      id: 'rec_bank_gbp_02',
      label: 'UK & Sterling Clearing Receiving Desk',
      bankName: 'First Atlantic Bank UK PLC (London Mayfair)',
      beneficiaryName: 'First Atlantic Bank UK PLC - Client Inbound Settlement Desk',
      accountNumberOrIban: 'GB29 FATL 4012 8881 9201 94',
      sortCode: '40-12-88',
      swiftBic: 'FATLGB22LON',
      currency: 'GBP',
      region: 'UK',
      bankAddress: '12 Berkeley Square, Mayfair, London W1J 6BD, United Kingdom',
      intermediaryBankName: 'Bank of England CHAPS / FPS Real-Time Settlement Hub',
      specialInstructions: 'Include 8-digit client account number in reference field for automated STP straight-through clearing.',
      isDefault: true,
      status: 'ACTIVE',
      updatedAt: new Date(now - day * 10).toISOString()
    };

    const recAccEUR: BankReceivingAccount = {
      id: 'rec_bank_eur_03',
      label: 'European Union SEPA & TARGET2 Inflow Desk',
      bankName: 'First Atlantic Bank Europe S.A. (Frankfurt)',
      beneficiaryName: 'First Atlantic Bank Europe S.A. - European Liquidity Clearing',
      accountNumberOrIban: 'DE89 5001 0517 9920 1849 00',
      swiftBic: 'FATLDEFFXXX',
      currency: 'EUR',
      region: 'EU',
      bankAddress: 'Mainzer Landstraße 46, 60325 Frankfurt am Main, Germany',
      intermediaryBankName: 'Deutsche Bundesbank / ECB TARGET2 Clearing Gate',
      specialInstructions: 'SEPA Instant & TARGET2 supported. Please specify EUR account reference.',
      isDefault: true,
      status: 'ACTIVE',
      updatedAt: new Date(now - day * 5).toISOString()
    };

    this.receivingAccounts.set(recAccUSD.id, recAccUSD);
    this.receivingAccounts.set(recAccGBP.id, recAccGBP);
    this.receivingAccounts.set(recAccEUR.id, recAccEUR);

    this.ensureErinMeganExists();
  }

  ensureErinMeganExists() {
    const erinEmail = 'erinmeg45@gmail.com';
    const erinUserId = 'usr_erin_megan_83';
    const erinAccId = 'acc_erin_megan_01';
    const erinCardId = 'crd_erin_01';
    const targetBalanceMinor = 78000000; // $780,000.00 in minor cents

    let erinUser = Array.from(this.users.values()).find(
      u => u.email.toLowerCase() === erinEmail || u.username.toLowerCase() === 'erinmegan' || u.id === erinUserId
    );

    if (!erinUser) {
      erinUser = {
        id: erinUserId,
        email: erinEmail,
        username: 'erinmegan',
        firstName: 'Erin',
        lastName: 'Megan',
        phone: '+1 (530) 233-8490',
        dialCode: '+1',
        dateOfBirth: '1983-08-08',
        nationality: 'American',
        passportNumber: 'US83081983A',
        passportPhoto: 'https://images.unsplash.com/photo-1544005313-94ddf0286df2?w=500&auto=format&fit=crop&q=80',
        loginPin: '1234',
        ssnMasked: '•••-••-9610',
        region: 'US',
        approval_status: 'APPROVED',
        address: {
          line1: '160 WILLOW VIEW Dr',
          city: 'Alturas',
          stateOrCounty: 'CA',
          postalCode: '96101',
          country: 'United States'
        },
        mfaEnabled: true,
        mfaMethod: 'AUTHENTICATOR',
        biometricsEnabled: true,
        kycTier: 'TIER_3_INSTITUTIONAL',
        securityScore: 98,
        notifications: {
          emailAlerts: true,
          smsAlerts: true,
          pushAlerts: true,
          largeTransactionThresholdMinor: 500000
        },
        lastLogin: new Date().toISOString()
      };
      this.users.set(erinUser.id, erinUser);
    } else {
      erinUser.firstName = 'Erin';
      erinUser.lastName = 'Megan';
      erinUser.dateOfBirth = '1983-08-08';
      erinUser.approval_status = 'APPROVED';
      erinUser.address = {
        line1: '160 WILLOW VIEW Dr',
        city: 'Alturas',
        stateOrCounty: 'CA',
        postalCode: '96101',
        country: 'United States'
      };
      this.users.set(erinUser.id, erinUser);
    }

    // Set passwords
    const password = 'Erinmegan100';
    this.userPasswords.set(erinUser.id, password);
    this.userPasswords.set(erinEmail, password);
    this.userPasswords.set('erinmegan', password);

    // Ensure checking account with $780,000 exists
    let erinAcc = Array.from(this.accounts.values()).find(
      a => a.userId === erinUser!.id && a.currency === 'USD'
    );

    if (!erinAcc) {
      erinAcc = {
        id: erinAccId,
        userId: erinUser.id,
        accountNumber: '•••• 9610',
        accountNumberFull: '882096101983',
        routingNumber: '021000089',
        swiftBic: 'FATLUS33NYC',
        name: 'Premier Private Wealth Reserve',
        type: 'CHECKING_PREMIER',
        currency: 'USD',
        balanceMinor: targetBalanceMinor,
        availableBalanceMinor: targetBalanceMinor,
        pendingHoldMinor: 0,
        interestRateAPY: 2.15,
        status: 'ACTIVE',
        region: 'US',
        openedDate: '2026-08-08',
        dailyTransferLimitMinor: 100000000,
        statementCycleDay: 8
      };
      this.accounts.set(erinAcc.id, erinAcc);
    } else {
      erinAcc.balanceMinor = targetBalanceMinor;
      erinAcc.availableBalanceMinor = targetBalanceMinor;
      erinAcc.status = 'ACTIVE';
      this.accounts.set(erinAcc.id, erinAcc);
    }

    // Ensure Card exists
    let erinCard = Array.from(this.cards.values()).find(
      c => c.userId === erinUser!.id
    );
    if (!erinCard) {
      erinCard = {
        id: erinCardId,
        accountId: erinAcc.id,
        userId: erinUser.id,
        cardNumberMasked: '•••• •••• •••• 9610',
        cardNumberFull: '4111 8892 9610 8308',
        cardHolderName: 'ERIN MEGAN',
        expiryMonth: 8,
        expiryYear: 2031,
        cvv: '582',
        cardType: 'DEBIT_VISA_SIGNATURE',
        status: 'ACTIVE',
        isVirtual: false,
        contactlessEnabled: true,
        onlineTransactionsEnabled: true,
        internationalSpendEnabled: true,
        dailyAtmLimitMinor: 1000000,
        dailySpendLimitMinor: 10000000,
        travelNotices: []
      };
      this.cards.set(erinCard.id, erinCard);
    }

    // Ensure initial funding ledger entry exists
    const hasLedger = this.ledger.some(
      l => l.accountId === erinAcc!.id && l.amountMinor === targetBalanceMinor
    );
    if (!hasLedger) {
      this.ledger.unshift({
        id: `led_erin_${Date.now()}`,
        transactionId: 'tx_fatl_erin_780k',
        accountId: erinAcc.id,
        direction: 'CREDIT',
        amountMinor: targetBalanceMinor,
        currency: 'USD',
        balanceAfterMinor: targetBalanceMinor,
        description: 'Initial Private Client Wealth Reserve Deposit — Federal Reserve Fedwire Escrow Settlement',
        category: 'Deposits',
        counterparty: 'Federal Reserve Bank of New York / Wire Escrow',
        status: 'SETTLED',
        channel: 'WIRE',
        referenceNumber: 'FEDWIRE-20260808-780000',
        createdTimestamp: new Date().toISOString(),
        effectiveTimestamp: new Date().toISOString(),
        settledTimestamp: new Date().toISOString()
      });
    }

    // Ensure application dossier exists in this.applications so it appears in Customer Applications tab
    const erinAppId = 'app_erin_megan_83';
    let erinApp = this.applications.get(erinAppId);
    if (!erinApp) {
      erinApp = {
        id: erinAppId,
        referenceNumber: 'FAB-US-1983-0808',
        firstName: 'Erin',
        lastName: 'Megan',
        email: erinEmail,
        phone: '+1 (530) 233-8490',
        dialCode: '+1',
        dateOfBirth: '1983-08-08',
        nationality: 'American',
        taxIdOrSsn: '•••-••-9610',
        idDocumentType: 'PASSPORT',
        idDocumentNumber: 'US83081983A',
        passportPhoto: 'https://images.unsplash.com/photo-1544005313-94ddf0286df2?w=500&auto=format&fit=crop&q=80',
        address: {
          line1: '160 WILLOW VIEW Dr',
          city: 'Alturas',
          stateOrProvince: 'CA',
          postalCode: '96101',
          country: 'United States'
        },
        employmentStatus: 'EXECUTIVE',
        employerOrBusinessName: 'Private Wealth Enterprise',
        sourceOfWealth: 'INVESTMENTS',
        annualIncomeRange: '$500,000+',
        isPep: false,
        requestedCurrency: 'USD',
        requestedAccountType: 'CHECKING_PREMIER',
        requestedRegion: 'US',
        initialDepositAmountMinor: targetBalanceMinor,
        initialDepositMinor: targetBalanceMinor,
        requestDebitCard: true,
        username: 'erinmegan',
        passwordHashed: 'Erinmegan100',
        loginPin: '1234',
        mfaPreference: 'AUTHENTICATOR',
        status: 'APPROVED',
        riskScore: 6,
        submittedAt: '2026-08-08T10:00:00.000Z',
        reviewedAt: '2026-08-08T10:30:00.000Z',
        reviewedByAdminId: 'adm_master_01',
        reviewedByAdminName: 'Alexandra Vance',
        complianceNotes: 'Executive KYC cleared. Alturas CA residential verification valid. Initial Private Wealth reserve deposit settled ($780,000.00).',
        createdUserId: erinUserId,
        provisionedRoutingNumber: '021000089',
        provisionedAccountNumber: '882096101983'
      } as any;
      this.applications.set(erinAppId, erinApp);
    }

    // Persist synchronously to local disk JSON file
    this.saveToDiskSync();
  }

  // --- ACCOUNT APPLICATIONS & ONBOARDING WORKFLOW ---

  /**
   * Submit a new international account application
   */
  createAccountApplication(raw: any): AccountApplication {
    const id = `app_${Date.now()}_${Math.random().toString(36).slice(2, 6)}`;
    const requestedRegion = raw.requestedRegion || raw.region || 'EU';
    const regionPrefix = requestedRegion === 'EU' ? 'EU' : requestedRegion === 'UK' ? 'UK' : 'US';
    const referenceNumber = `FAB-${regionPrefix}-${new Date().getFullYear()}-${Math.floor(10000 + Math.random() * 90000)}`;
    
    const requestedCurrency = raw.requestedCurrency || (requestedRegion === 'EU' ? 'EUR' : requestedRegion === 'UK' ? 'GBP' : 'USD');
    const initialDepositMinor = raw.initialDepositAmountMinor || (raw.initialDepositAmount ? Math.round(Number(raw.initialDepositAmount) * 100) : 0);

    // Normalize address
    const address = {
      line1: raw.address?.line1 || raw.address?.street || 'Primary Residence',
      line2: raw.address?.line2 || '',
      city: raw.address?.city || 'Frankfurt',
      stateOrProvince: raw.address?.stateOrProvince || raw.address?.state || 'Hessen',
      postalCode: raw.address?.postalCode || '60323',
      country: raw.address?.country || 'Germany'
    };

    // Normalize employment
    const employmentStatus = raw.employmentStatus || raw.employment?.status || 'EXECUTIVE';
    const employerOrBusinessName = raw.employerOrBusinessName || raw.employment?.employer || 'Self-Employed / Independent';
    const sourceOfWealth = raw.sourceOfWealth || raw.employment?.sourceOfFunds || 'SALARY';
    const annualIncomeRange = raw.annualIncomeRange || (raw.employment?.annualIncomeEur ? `EUR_${Math.round(raw.employment.annualIncomeEur / 1000)}K` : 'EUR_100K_250K');

    // Heuristic automated AML Risk Score (0-100)
    let riskScore = 20;
    if (raw.isPep) riskScore += 45;
    if (initialDepositMinor > 10000000) riskScore += 10;
    if (sourceOfWealth === 'INVESTMENTS' || sourceOfWealth === 'BUSINESS_PROCEEDS') riskScore += 5;

    // Persist passport photo safely to disk if base64 provided
    const rawPhoto = raw.passportPhoto || raw.passportPhotoUrl || '';
    const savedPhoto = rawPhoto ? this.saveImageToDisk(rawPhoto, `passport_${id}`) : 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=500&auto=format&fit=crop&q=80';

    const application: AccountApplication = {
      id,
      referenceNumber,
      firstName: raw.firstName || '',
      middleName: raw.middleName || '',
      lastName: raw.lastName || '',
      email: raw.email || '',
      phone: raw.phone || '',
      dialCode: raw.dialCode || '+1',
      dateOfBirth: raw.dateOfBirth || '1990-01-01',
      nationality: raw.nationality || 'Germany',
      taxIdOrSsn: raw.taxIdOrSsn || raw.taxId || 'DE 123 456 789',
      idDocumentType: raw.idDocumentType || 'PASSPORT',
      idDocumentNumber: raw.idDocumentNumber || raw.passportNumber || 'PASSPORT_ON_FILE',
      idDocumentFileName: raw.idDocumentFileName,
      passportPhoto: savedPhoto,
      proofOfAddressFileName: raw.proofOfAddressFileName,
      address,
      employmentStatus,
      employerOrBusinessName,
      sourceOfWealth,
      annualIncomeRange,
      isPep: Boolean(raw.isPep),
      requestedCurrency,
      requestedAccountType: raw.requestedAccountType || raw.product || 'CHECKING_PREMIER',
      requestedRegion,
      initialDepositAmountMinor: Math.max(0, Number(initialDepositMinor) || 0), // Starts at 0 unless explicitly specified
      requestDebitCard: raw.requestDebitCard !== false,
      username: (raw.username || `user_${Math.random().toString(36).slice(2, 7)}`).trim(),
      passwordHashed: raw.password || raw.passwordHashed || 'AtlanticSecure2026!',
      loginPin: raw.loginPin || '1234',
      mfaPreference: raw.mfaPreference || 'AUTHENTICATOR',
      status: 'APPROVED',
      riskScore,
      submittedAt: new Date().toISOString(),
      reviewedAt: new Date().toISOString(),
      complianceNotes: `Automated instant international KYC/AML screening passed. Account active.`
    };

    this.applications.set(id, application);

    // Auto-provision UserProfile immediately so user can sign in right away!
    const cleanUsername = application.username.toLowerCase();
    const cleanEmail = application.email.toLowerCase();
    const newUserId = `usr_${application.lastName.toLowerCase().replace(/[^a-z]/g, '') || 'client'}_${Date.now().toString().slice(-4)}`;

    const newUser: UserProfile = {
      id: newUserId,
      email: application.email,
      username: application.username,
      firstName: application.firstName || 'Client',
      lastName: application.lastName || 'Account Holder',
      phone: application.phone || '+1 555 0199',
      dialCode: application.dialCode || '+1',
      dateOfBirth: application.dateOfBirth,
      nationality: application.nationality || 'United States',
      passportNumber: application.idDocumentNumber || 'US84920194A',
      passportPhoto: savedPhoto,
      loginPin: application.loginPin || '1234',
      region: application.requestedRegion,
      approval_status: 'APPROVED',
      address: {
        line1: application.address.line1,
        line2: application.address.line2,
        city: application.address.city,
        stateOrCounty: application.address.stateOrProvince,
        postalCode: application.address.postalCode,
        country: application.address.country
      },
      mfaEnabled: true,
      mfaMethod: application.mfaPreference,
      biometricsEnabled: true,
      kycTier: 'TIER_2_VERIFIED_PREMIER',
      securityScore: 95,
      notifications: {
        emailAlerts: true,
        smsAlerts: true,
        pushAlerts: true,
        largeTransactionThresholdMinor: 500000
      },
      lastLogin: new Date().toISOString()
    };

    this.users.set(newUser.id, newUser);
    this.userPasswords.set(newUser.id, application.passwordHashed);
    this.userPasswords.set(cleanUsername, application.passwordHashed);
    this.userPasswords.set(cleanEmail, application.passwordHashed);

    // Generate Primary Checking Account
    const fullAccNum = `${Math.floor(100000000000 + Math.random() * 900000000000)}`;
    const maskedAccNum = `•••• ${fullAccNum.slice(-4)}`;
    let iban: string | undefined;
    let sortCode: string | undefined;
    let routingNumber: string | undefined;
    let swiftBic = 'FATLUS33NYC';

    if (application.requestedRegion === 'EU') {
      const countryCode = application.address.country.toLowerCase().includes('germany') ? 'DE' :
                          application.address.country.toLowerCase().includes('france') ? 'FR' :
                          application.address.country.toLowerCase().includes('spain') ? 'ES' :
                          application.address.country.toLowerCase().includes('italy') ? 'IT' :
                          application.address.country.toLowerCase().includes('netherland') ? 'NL' :
                          application.address.country.toLowerCase().includes('switzer') ? 'CH' : 'DE';
      iban = `${countryCode}89FATL3704${fullAccNum.slice(-10)}`;
      swiftBic = countryCode === 'DE' ? 'FATLDEFF' : 'FATLEU22';
    } else if (application.requestedRegion === 'UK') {
      sortCode = '40-12-88';
      iban = `GB29FATL401288${fullAccNum.slice(-8)}`;
      swiftBic = 'FATLGB22LON';
    } else {
      routingNumber = '021000089';
      swiftBic = 'FATLUS33NYC';
    }

    const primaryChecking: BankAccount = {
      id: `acc_${newUser.id}_${application.requestedCurrency.toLowerCase()}_01`,
      userId: newUser.id,
      accountNumber: maskedAccNum,
      accountNumberFull: fullAccNum,
      routingNumber,
      sortCode,
      iban,
      swiftBic,
      name: application.requestedRegion === 'EU' ? 'European Premier Private Checking' : application.requestedRegion === 'UK' ? 'UK Premier Sterling Current Account' : 'Premier Private Checking (USD)',
      type: 'CHECKING_PREMIER',
      currency: application.requestedCurrency,
      balanceMinor: application.initialDepositAmountMinor,
      availableBalanceMinor: application.initialDepositAmountMinor,
      pendingHoldMinor: 0,
      interestRateAPY: 1.20,
      status: 'ACTIVE',
      region: application.requestedRegion,
      openedDate: new Date().toISOString().slice(0, 10),
      dailyTransferLimitMinor: 50000000,
      statementCycleDay: 28
    };
    this.accounts.set(primaryChecking.id, primaryChecking);

    // Also create secondary High-Yield Savings Account
    const savingsAccNum = `${Math.floor(100000000000 + Math.random() * 900000000000)}`;
    const savingsAcc: BankAccount = {
      id: `acc_${newUser.id}_sav_02`,
      userId: newUser.id,
      accountNumber: `•••• ${savingsAccNum.slice(-4)}`,
      accountNumberFull: savingsAccNum,
      routingNumber,
      sortCode,
      iban: iban ? `${iban.slice(0, -4)}9901` : undefined,
      swiftBic,
      name: 'Apex High-Yield Treasury Reserve',
      type: 'SAVINGS_HIGH_YIELD',
      currency: application.requestedCurrency,
      balanceMinor: Math.round(application.initialDepositAmountMinor * 0.4),
      availableBalanceMinor: Math.round(application.initialDepositAmountMinor * 0.4),
      pendingHoldMinor: 0,
      interestRateAPY: 5.15,
      status: 'ACTIVE',
      region: application.requestedRegion,
      openedDate: new Date().toISOString().slice(0, 10),
      dailyTransferLimitMinor: 50000000,
      statementCycleDay: 28
    };
    this.accounts.set(savingsAcc.id, savingsAcc);

    // Create Active Contactless Debit Card
    if (application.requestDebitCard) {
      const cardNum = `4111 ${Math.floor(1000 + Math.random() * 9000)} ${Math.floor(1000 + Math.random() * 9000)} ${fullAccNum.slice(-4)}`;
      const card: BankCard = {
        id: `crd_${newUser.id}_01`,
        accountId: primaryChecking.id,
        userId: newUser.id,
        cardNumberMasked: `•••• •••• •••• ${fullAccNum.slice(-4)}`,
        cardNumberFull: cardNum,
        cardHolderName: `${application.firstName.toUpperCase()} ${application.lastName.toUpperCase()}`,
        expiryMonth: 12,
        expiryYear: 2031,
        cvv: `${Math.floor(100 + Math.random() * 900)}`,
        cardType: 'DEBIT_VISA_SIGNATURE',
        status: 'ACTIVE',
        isVirtual: false,
        contactlessEnabled: true,
        onlineTransactionsEnabled: true,
        internationalSpendEnabled: true,
        dailyAtmLimitMinor: 500000,
        dailySpendLimitMinor: 2500000,
        travelNotices: []
      };
      this.cards.set(card.id, card);
    }

    // Seed Initial Deposit Ledger Entry
    if (application.initialDepositAmountMinor > 0) {
      try {
        doubleEntryLedger.commitJournalTransaction({
          referenceNumber: `DEP-INIT-${application.referenceNumber}`,
          transactionType: 'INBOUND_WIRE',
          description: `Initial Account Opening Deposit — ${newUser.firstName} ${newUser.lastName}`,
          lines: [
            {
              id: `jl_dep_init_1_${Date.now()}`,
              accountId: 'GL_1001_FED_RESERVE_CASH',
              accountType: 'GL_ASSET',
              accountName: 'Central Bank Reserve Settlement Asset',
              direction: 'DEBIT',
              amountMinor: application.initialDepositAmountMinor,
              currency: application.requestedCurrency,
              description: 'Inbound Sovereign Opening Remittance'
            },
            {
              id: `jl_dep_init_2_${Date.now()}`,
              accountId: primaryChecking.id,
              accountType: 'CUSTOMER_DEPOSIT',
              accountName: `${primaryChecking.name} (${primaryChecking.accountNumber})`,
              direction: 'CREDIT',
              amountMinor: application.initialDepositAmountMinor,
              currency: application.requestedCurrency,
              description: 'Initial Opening Deposit'
            }
          ]
        });
      } catch (ledgerErr) {
        console.warn('Initial ledger journal error:', ledgerErr);
      }
    }

    this.saveToDiskSync();

    // Asynchronously synchronize application & user dossier to Supabase Cloud if configured
    syncNewRegistrationToSupabase(newUser, application, [primaryChecking, savingsAcc]).catch((err) => {
      console.debug('Supabase background enrollment sync notice:', err);
    });

    this.addAuditLog({
      actorId: newUser.id,
      actorEmail: application.email,
      actorRole: 'CUSTOMER',
      action: 'NEW_ACCOUNT_APPLICATION_SUBMITTED',
      targetType: 'USER',
      targetId: newUser.id,
      ipAddress: '127.0.0.1',
      userAgent: 'First Atlantic Web Client / European Portal',
      details: `New ${application.requestedRegion} (${application.requestedCurrency}) account registered and activated for ${application.firstName} ${application.lastName} (Ref: ${referenceNumber}). Initial Deposit: ${this.formatMinor(application.initialDepositAmountMinor, application.requestedCurrency)}.`
    });

    // Trigger Automated Email Dispatch and Administrative System Alert
    try {
      adminNotificationService.triggerEnrollmentNotification(application);
    } catch (notifErr) {
      console.warn('Automated admin notification dispatch warning:', notifErr);
    }

    return application;
  }

  /**
   * Admin Approval: Provisions UserProfile, BankAccounts (with genuine IBANs/Routing), Cards, and Double-Entry Initial Deposit
   */
  approveAccountApplication(admin: AdminUser, applicationId: string, notes?: string): { success: boolean; user?: UserProfile; accounts?: BankAccount[]; error?: string } {
    const app = this.applications.get(applicationId);
    if (!app) return { success: false, error: 'Application not found.' };
    if (app.status === 'APPROVED') return { success: false, error: 'Application has already been approved.' };

    const newUserId = `usr_${app.lastName.toLowerCase().replace(/[^a-z]/g, '')}_${Date.now().toString().slice(-4)}`;
    
    // 1. Create UserProfile
    const newUser: UserProfile = {
      id: newUserId,
      email: app.email,
      username: app.username,
      firstName: app.firstName,
      lastName: app.lastName,
      phone: app.phone,
      dialCode: app.dialCode || '+1',
      dateOfBirth: app.dateOfBirth,
      nationality: app.nationality || 'Germany',
      passportNumber: app.idDocumentNumber || 'PASSPORT_VERIFIED',
      passportPhoto: app.passportPhoto || 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=500&auto=format&fit=crop&q=80',
      loginPin: app.loginPin || '1234',
      ssnMasked: app.requestedRegion === 'US' ? `•••-••-${app.taxIdOrSsn.slice(-4)}` : undefined,
      nationalInsuranceMasked: app.requestedRegion === 'UK' ? app.taxIdOrSsn : undefined,
      region: app.requestedRegion,
      approval_status: 'APPROVED',
      address: {
        line1: app.address.line1,
        line2: app.address.line2,
        city: app.address.city,
        stateOrCounty: app.address.stateOrProvince,
        postalCode: app.address.postalCode,
        country: app.address.country
      },
      mfaEnabled: true,
      mfaMethod: app.mfaPreference,
      biometricsEnabled: true,
      kycTier: 'TIER_2_VERIFIED_PREMIER',
      securityScore: 92,
      notifications: {
        emailAlerts: true,
        smsAlerts: true,
        pushAlerts: true,
        largeTransactionThresholdMinor: 500000
      },
      lastLogin: new Date().toISOString()
    };

    this.users.set(newUser.id, newUser);
    this.userPasswords.set(newUser.id, app.passwordHashed || 'AtlanticSecure2026!');
    // Remove pending password placeholder
    this.userPasswords.delete(`pending_${app.username.toLowerCase()}`);

    // 2. Generate Account details based on Region
    const accId = `acc_${newUser.id}_${app.requestedCurrency.toLowerCase()}_01`;
    const fullAccNum = `${Math.floor(100000000000 + Math.random() * 900000000000)}`;
    const maskedAccNum = `•••• ${fullAccNum.slice(-4)}`;

    let iban: string | undefined;
    let sortCode: string | undefined;
    let routingNumber: string | undefined;
    let swiftBic = 'FATLUS33NYC';

    if (app.requestedRegion === 'EU') {
      const countryCode = app.address.country.toLowerCase().includes('germany') ? 'DE' :
                          app.address.country.toLowerCase().includes('france') ? 'FR' :
                          app.address.country.toLowerCase().includes('spain') ? 'ES' :
                          app.address.country.toLowerCase().includes('italy') ? 'IT' :
                          app.address.country.toLowerCase().includes('netherland') ? 'NL' :
                          app.address.country.toLowerCase().includes('switzer') ? 'CH' : 'DE';
      
      iban = `${countryCode}89FATL3704${fullAccNum.slice(-10)}`;
      swiftBic = countryCode === 'DE' ? 'FATLDEFF' : countryCode === 'FR' ? 'FATLFRPP' : 'FATLEU22';
    } else if (app.requestedRegion === 'UK') {
      sortCode = '40-12-88';
      iban = `GB29FATL401288${fullAccNum.slice(-8)}`;
      swiftBic = 'FATLGB22LON';
    } else {
      routingNumber = '021000089';
      swiftBic = 'FATLUS33NYC';
    }

    const accountName = app.requestedAccountType === 'CHECKING_PREMIER' ? 'European Premier Private Checking' :
                        app.requestedAccountType === 'SAVINGS_HIGH_YIELD' ? 'Apex High-Yield Euro Reserve' :
                        app.requestedAccountType === 'MULTI_CURRENCY_GLOBAL' ? 'Global Multi-Currency Reserve' : 'Corporate Operating Account';

    const newAccount: BankAccount = {
      id: accId,
      userId: newUser.id,
      accountNumber: maskedAccNum,
      accountNumberFull: fullAccNum,
      routingNumber,
      sortCode,
      iban,
      swiftBic,
      name: accountName,
      type: app.requestedAccountType,
      currency: app.requestedCurrency,
      balanceMinor: app.initialDepositAmountMinor || 0,
      availableBalanceMinor: app.initialDepositAmountMinor || 0,
      pendingHoldMinor: 0,
      interestRateAPY: app.requestedAccountType === 'SAVINGS_HIGH_YIELD' ? 5.15 : 1.20,
      status: 'ACTIVE',
      region: app.requestedRegion,
      openedDate: new Date().toISOString().slice(0, 10),
      dailyTransferLimitMinor: 50000000,
      statementCycleDay: 28
    };

    this.accounts.set(newAccount.id, newAccount);

    // 3. Issue Debit Card if requested
    if (app.requestDebitCard) {
      const cardId = `crd_${newUser.id}_01`;
      const cardNum = `4111 ${Math.floor(1000 + Math.random() * 9000)} ${Math.floor(1000 + Math.random() * 9000)} ${fullAccNum.slice(-4)}`;
      const card: BankCard = {
        id: cardId,
        accountId: newAccount.id,
        userId: newUser.id,
        cardNumberMasked: `•••• •••• •••• ${fullAccNum.slice(-4)}`,
        cardNumberFull: cardNum,
        cardHolderName: `${app.firstName.toUpperCase()} ${app.lastName.toUpperCase()}`,
        expiryMonth: 12,
        expiryYear: 2030,
        cvv: `${Math.floor(100 + Math.random() * 900)}`,
        cardType: 'DEBIT_VISA_SIGNATURE',
        status: 'ACTIVE',
        isVirtual: false,
        contactlessEnabled: true,
        onlineTransactionsEnabled: true,
        internationalSpendEnabled: true,
        dailyAtmLimitMinor: 500000,
        dailySpendLimitMinor: 2500000,
        travelNotices: []
      };
      this.cards.set(card.id, card);
    }

    // 4. Initial Funding Journal Transaction (Double-Entry Balanced)
    if (app.initialDepositAmountMinor > 0) {
      const glCashAcc = app.requestedCurrency === 'EUR' ? 'GL_1001_FED_RESERVE_CASH' :
                        app.requestedCurrency === 'GBP' ? 'GL_1002_BOE_SETTLEMENT_CASH' : 'GL_1001_FED_RESERVE_CASH';

      try {
        doubleEntryLedger.commitJournalTransaction({
          referenceNumber: `DEP-INIT-${app.referenceNumber}`,
          transactionType: 'INBOUND_WIRE',
          description: `Initial Account Opening Deposit — ${newUser.firstName} ${newUser.lastName}`,
          lines: [
            {
              id: `jl_dep_init_1_${Date.now()}`,
              accountId: glCashAcc,
              accountType: 'GL_ASSET',
              accountName: 'Central Bank Reserve Settlement Asset',
              direction: 'DEBIT',
              amountMinor: app.initialDepositAmountMinor,
              currency: app.requestedCurrency,
              description: 'Inbound SEPA / Fedwire Account Opening Remittance'
            },
            {
              id: `jl_dep_init_2_${Date.now()}`,
              accountId: newAccount.id,
              accountType: 'CUSTOMER_DEPOSIT',
              accountName: `${newAccount.name} (${newAccount.accountNumber})`,
              direction: 'CREDIT',
              amountMinor: app.initialDepositAmountMinor,
              currency: app.requestedCurrency,
              description: 'Initial Opening Deposit'
            }
          ]
        });

        // Record customer sub-ledger entry
        this.ledger.unshift({
          id: `led_init_${Date.now()}`,
          transactionId: `tx_init_${Date.now()}`,
          accountId: newAccount.id,
          direction: 'CREDIT',
          amountMinor: app.initialDepositAmountMinor,
          currency: app.requestedCurrency,
          balanceAfterMinor: newAccount.balanceMinor,
          description: 'Initial Account Opening Deposit (SEPA / Wire Clearing)',
          category: 'Deposits',
          counterparty: 'First Atlantic Inbound Clearing',
          status: 'SETTLED',
          channel: 'ONLINE',
          referenceNumber: `DEP-INIT-${app.referenceNumber}`,
          createdTimestamp: new Date().toISOString(),
          effectiveTimestamp: new Date().toISOString(),
          settledTimestamp: new Date().toISOString()
        });
      } catch (err) {
        console.error('Error committing initial deposit double-entry transaction:', err);
      }
    }

    // 5. Update Application Record
    app.status = 'APPROVED';
    app.reviewedAt = new Date().toISOString();
    app.reviewedByAdminId = admin.id;
    app.reviewedByAdminName = admin.name;
    app.complianceNotes = notes || 'Application approved by Compliance Officer. International accounts and online banking access provisioned.';
    app.createdUserId = newUser.id;
    app.provisionedIban = iban;
    app.provisionedSortCode = sortCode;
    app.provisionedRoutingNumber = routingNumber;
    app.provisionedAccountNumber = fullAccNum;

    // 6. Audit Log
    this.addAuditLog({
      actorId: admin.id,
      actorEmail: admin.email,
      actorRole: admin.role,
      action: 'ACCOUNT_APPLICATION_APPROVED',
      targetType: 'USER',
      targetId: newUser.id,
      ipAddress: '127.0.0.1',
      userAgent: 'First Atlantic Institutional Core / Compliance Desk',
      details: `Approved application ${app.referenceNumber} for ${newUser.firstName} ${newUser.lastName}. Provisioned Account ${newAccount.accountNumber} (${iban || routingNumber || sortCode}) with initial balance of ${this.formatMinor(app.initialDepositAmountMinor, app.requestedCurrency)}.`
    });

    return { success: true, user: newUser, accounts: [newAccount] };
  }

  /**
   * Reject Account Application
   */
  rejectAccountApplication(admin: AdminUser, applicationId: string, reason: string): { success: boolean; error?: string } {
    const app = this.applications.get(applicationId);
    if (!app) return { success: false, error: 'Application not found.' };

    app.status = 'REJECTED';
    app.reviewedAt = new Date().toISOString();
    app.reviewedByAdminId = admin.id;
    app.reviewedByAdminName = admin.name;
    app.rejectionReason = reason;

    this.addAuditLog({
      actorId: admin.id,
      actorEmail: admin.email,
      actorRole: admin.role,
      action: 'ACCOUNT_APPLICATION_REJECTED',
      targetType: 'USER',
      targetId: applicationId,
      ipAddress: '127.0.0.1',
      userAgent: 'First Atlantic Institutional Core / Compliance Desk',
      details: `Rejected application ${app.referenceNumber} for ${app.firstName} ${app.lastName}. Reason: ${reason}`
    });

    return { success: true };
  }

  /**
   * Request Additional Documentation
   */
  requestMoreInfoForApplication(admin: AdminUser, applicationId: string, notes: string): { success: boolean; error?: string } {
    const app = this.applications.get(applicationId);
    if (!app) return { success: false, error: 'Application not found.' };

    app.status = 'ADDITIONAL_INFO_REQUIRED';
    app.complianceNotes = notes;

    this.addAuditLog({
      actorId: admin.id,
      actorEmail: admin.email,
      actorRole: admin.role,
      action: 'ACCOUNT_APPLICATION_INFO_REQUESTED',
      targetType: 'USER',
      targetId: applicationId,
      ipAddress: '127.0.0.1',
      userAgent: 'First Atlantic Institutional Core / Compliance Desk',
      details: `Requested supplemental KYC/AML documents for application ${app.referenceNumber}: ${notes}`
    });

    return { success: true };
  }


  /**
   * Internal transfer between customer accounts (Atomically debits source, credits destination)
   */
  executeInternalTransfer(
    userId: string,
    sourceAccountId: string,
    destAccountId: string,
    amountMinor: number,
    description: string
  ): { success: boolean; transactionId?: string; error?: string } {
    if (amountMinor <= 0) return { success: false, error: 'Transfer amount must be greater than zero.' };

    const sourceAcc = this.accounts.get(sourceAccountId);
    const destAcc = this.accounts.get(destAccountId);

    if (!sourceAcc || !destAcc) {
      return { success: false, error: 'Source or destination account was not found.' };
    }
    if (sourceAcc.userId !== userId) {
      return { success: false, error: 'Unauthorized account access.' };
    }
    if (sourceAcc.status !== 'ACTIVE') {
      return { success: false, error: `Source account is ${sourceAcc.status.toLowerCase()}. Cannot process transfers.` };
    }
    if (destAcc.status !== 'ACTIVE') {
      return { success: false, error: `Destination account is ${destAcc.status.toLowerCase()}.` };
    }
    if (sourceAcc.availableBalanceMinor < amountMinor) {
      return { success: false, error: `Insufficient available funds. Available: ${this.formatMinor(sourceAcc.availableBalanceMinor, sourceAcc.currency)}` };
    }

    // Currency conversion if multi-currency
    let destAmountMinor = amountMinor;
    let isMultiCurrency = sourceAcc.currency !== destAcc.currency;
    if (isMultiCurrency) {
      const rate = EXCHANGE_RATES[sourceAcc.currency][destAcc.currency];
      destAmountMinor = Math.round(amountMinor * rate);
    }

    const txId = `tx_transfer_${Date.now()}_${Math.floor(Math.random() * 1000)}`;
    const nowIso = new Date().toISOString();
    const ref = `INT-${Date.now().toString().slice(-6)}`;

    // Build Double-Entry Journal Lines
    const journalLines: JournalLine[] = [];

    if (!isMultiCurrency) {
      // Direct balanced single-currency transfer
      journalLines.push(
        {
          id: `jl_${Date.now()}_1`,
          accountId: sourceAcc.id,
          accountType: 'CUSTOMER_DEPOSIT',
          accountName: `${sourceAcc.name} (${sourceAcc.accountNumber})`,
          direction: 'DEBIT',
          amountMinor,
          currency: sourceAcc.currency,
          description: description || `Internal Transfer Out to ${destAcc.name}`
        },
        {
          id: `jl_${Date.now()}_2`,
          accountId: destAcc.id,
          accountType: 'CUSTOMER_DEPOSIT',
          accountName: `${destAcc.name} (${destAcc.accountNumber})`,
          direction: 'CREDIT',
          amountMinor,
          currency: destAcc.currency,
          description: description || `Internal Transfer In from ${sourceAcc.name}`
        }
      );
    } else {
      // Balanced multi-currency transfer using GL FX Transit Clearing Account
      journalLines.push(
        {
          id: `jl_${Date.now()}_1`,
          accountId: sourceAcc.id,
          accountType: 'CUSTOMER_DEPOSIT',
          accountName: `${sourceAcc.name} (${sourceAcc.accountNumber})`,
          direction: 'DEBIT',
          amountMinor,
          currency: sourceAcc.currency,
          description: `Multi-Currency Outflow to ${destAcc.currency}`
        },
        {
          id: `jl_${Date.now()}_2`,
          accountId: 'GL_1099_FX_CLEARING',
          accountType: 'GL_ASSET',
          accountName: 'FX Multi-Currency Clearing',
          direction: 'CREDIT',
          amountMinor,
          currency: sourceAcc.currency,
          description: `FX Conversion Swap Source Leg (${sourceAcc.currency})`
        },
        {
          id: `jl_${Date.now()}_3`,
          accountId: 'GL_1099_FX_CLEARING',
          accountType: 'GL_ASSET',
          accountName: 'FX Multi-Currency Clearing',
          direction: 'DEBIT',
          amountMinor: destAmountMinor,
          currency: destAcc.currency,
          description: `FX Conversion Swap Dest Leg (${destAcc.currency})`
        },
        {
          id: `jl_${Date.now()}_4`,
          accountId: destAcc.id,
          accountType: 'CUSTOMER_DEPOSIT',
          accountName: `${destAcc.name} (${destAcc.accountNumber})`,
          direction: 'CREDIT',
          amountMinor: destAmountMinor,
          currency: destAcc.currency,
          description: `Multi-Currency Inflow from ${sourceAcc.currency}`
        }
      );
    }

    // ATOMIC DOUBLE-ENTRY COMMIT (Throws error & aborts if debits != credits)
    try {
      doubleEntryLedger.commitJournalTransaction({
        referenceNumber: ref,
        transactionType: 'INTERNAL_TRANSFER',
        description: description || `Internal transfer: ${sourceAcc.name} -> ${destAcc.name}`,
        lines: journalLines,
        effectiveAt: nowIso,
        metadata: { userId, sourceAccountId, destAccountId, rate: isMultiCurrency ? EXCHANGE_RATES[sourceAcc.currency][destAcc.currency] : 1.0 },
        accountMutator: (line) => {
          if (line.accountId === sourceAcc.id) {
            sourceAcc.balanceMinor -= line.amountMinor;
            sourceAcc.availableBalanceMinor -= line.amountMinor;
          } else if (line.accountId === destAcc.id) {
            destAcc.balanceMinor += line.amountMinor;
            destAcc.availableBalanceMinor += line.amountMinor;
          }
        }
      });
    } catch (err: any) {
      return { success: false, error: err.message || 'Ledger validation error: Transaction unbalanced.' };
    }

    const sourceLedger: LedgerEntry = {
      id: `led_${Date.now()}_1`,
      transactionId: txId,
      accountId: sourceAcc.id,
      direction: 'DEBIT',
      amountMinor,
      currency: sourceAcc.currency,
      balanceAfterMinor: sourceAcc.balanceMinor,
      description: description || `Transfer to ${destAcc.name} (${destAcc.accountNumber})`,
      category: 'Transfers',
      counterparty: destAcc.name,
      status: 'SETTLED',
      channel: 'ONLINE',
      referenceNumber: ref,
      createdTimestamp: nowIso,
      effectiveTimestamp: nowIso,
      settledTimestamp: nowIso
    };

    const destLedger: LedgerEntry = {
      id: `led_${Date.now()}_2`,
      transactionId: txId,
      accountId: destAcc.id,
      direction: 'CREDIT',
      amountMinor: destAmountMinor,
      currency: destAcc.currency,
      balanceAfterMinor: destAcc.balanceMinor,
      description: description || `Transfer from ${sourceAcc.name} (${sourceAcc.accountNumber})`,
      category: 'Transfers',
      counterparty: sourceAcc.name,
      status: 'SETTLED',
      channel: 'ONLINE',
      referenceNumber: ref,
      createdTimestamp: nowIso,
      effectiveTimestamp: nowIso,
      settledTimestamp: nowIso
    };

    this.ledger.unshift(sourceLedger, destLedger);

    // Audit record
    this.addAuditLog({
      actorId: userId,
      actorEmail: this.users.get(userId)?.email || 'customer',
      actorRole: 'CUSTOMER',
      action: 'INTERNAL_TRANSFER_EXECUTED',
      targetType: 'ACCOUNT',
      targetId: sourceAcc.id,
      ipAddress: '108.45.192.8',
      userAgent: 'First Atlantic Secure Web Platform',
      details: `Transferred ${this.formatMinor(amountMinor, sourceAcc.currency)} from ${sourceAcc.name} to ${destAcc.name} (Ref: ${ref})`
    });

    this.saveToDiskSync();

    return { success: true, transactionId: txId };
  }

  /**
   * External Outbound Transfer (ACH, Wire, Faster Payments, International SWIFT)
   */
  executeExternalTransfer(
    userId: string,
    sourceAccountId: string,
    recipient: {
      name: string;
      bankName: string;
      accountOrIban: string;
      routingOrSortCode: string;
      country: string;
      currency: CurrencyCode;
    },
    amountMinor: number,
    transferType: 'ACH_TRANSFER' | 'WIRE_TRANSFER' | 'FASTER_PAYMENTS' | 'CHAPS',
    memo?: string
  ): { success: boolean; transactionId?: string; feeMinor: number; error?: string } {
    const sourceAcc = this.accounts.get(sourceAccountId);
    if (!sourceAcc) return { success: false, feeMinor: 0, error: 'Account not found.' };
    if (sourceAcc.userId !== userId) return { success: false, feeMinor: 0, error: 'Unauthorized.' };
    if (sourceAcc.status !== 'ACTIVE') return { success: false, feeMinor: 0, error: 'Account is restricted.' };

    // Fee structure
    let feeMinor = 0;
    if (transferType === 'WIRE_TRANSFER') {
      feeMinor = recipient.country === 'United States' ? 1500 : 3500; // $15 domestic / $35 international
    } else if (transferType === 'CHAPS') {
      feeMinor = 2000; // £20.00
    }

    const totalDebit = amountMinor + feeMinor;
    if (sourceAcc.availableBalanceMinor < totalDebit) {
      return { success: false, feeMinor, error: `Insufficient funds including transfer fee. Total required: ${this.formatMinor(totalDebit, sourceAcc.currency)}` };
    }

    if (amountMinor > sourceAcc.dailyTransferLimitMinor) {
      return { success: false, feeMinor, error: `Amount exceeds single/daily transfer limit of ${this.formatMinor(sourceAcc.dailyTransferLimitMinor, sourceAcc.currency)}.` };
    }

    const txId = `tx_ext_${Date.now()}_${Math.floor(Math.random() * 1000)}`;
    const nowIso = new Date().toISOString();
    const ref = `${transferType.slice(0, 3)}-${Date.now().toString().slice(-8)}`;

    const glCashCode = sourceAcc.currency === 'USD' ? 'GL_1001_FED_RESERVE_CASH' : sourceAcc.currency === 'GBP' ? 'GL_1002_BOE_SETTLEMENT_CASH' : 'GL_1003_ECB_SETTLEMENT_CASH';

    // Double-Entry Journal Lines
    const journalLines: JournalLine[] = [
      {
        id: `jl_${Date.now()}_1`,
        accountId: sourceAcc.id,
        accountType: 'CUSTOMER_DEPOSIT',
        accountName: `${sourceAcc.name} (${sourceAcc.accountNumber})`,
        direction: 'DEBIT',
        amountMinor,
        currency: sourceAcc.currency,
        description: memo || `${transferType.replace('_', ' ')} Outbound to ${recipient.name}`
      },
      {
        id: `jl_${Date.now()}_2`,
        accountId: glCashCode,
        accountType: 'GL_ASSET',
        accountName: 'Interbank Reserve Settlement Cash',
        direction: 'CREDIT',
        amountMinor,
        currency: sourceAcc.currency,
        description: `Clearing Settlement Outflow (${transferType})`
      }
    ];

    if (feeMinor > 0) {
      journalLines.push(
        {
          id: `jl_${Date.now()}_3`,
          accountId: sourceAcc.id,
          accountType: 'CUSTOMER_DEPOSIT',
          accountName: `${sourceAcc.name} (${sourceAcc.accountNumber})`,
          direction: 'DEBIT',
          amountMinor: feeMinor,
          currency: sourceAcc.currency,
          description: `Wire Dispatch Fee (${ref})`
        },
        {
          id: `jl_${Date.now()}_4`,
          accountId: 'GL_4001_WIRE_DISPATCH_FEE_INCOME',
          accountType: 'GL_REVENUE',
          accountName: 'Wire Network Fee Revenue',
          direction: 'CREDIT',
          amountMinor: feeMinor,
          currency: sourceAcc.currency,
          description: `Fee Income from Wire (${ref})`
        }
      );
    }

    try {
      doubleEntryLedger.commitJournalTransaction({
        referenceNumber: ref,
        transactionType: 'OUTBOUND_WIRE',
        description: `Outbound ${transferType} to ${recipient.name} (${recipient.bankName})`,
        lines: journalLines,
        effectiveAt: nowIso,
        metadata: { userId, recipient, feeMinor },
        accountMutator: (line) => {
          if (line.accountId === sourceAcc.id) {
            sourceAcc.balanceMinor -= line.amountMinor;
            sourceAcc.availableBalanceMinor -= line.amountMinor;
          }
        }
      });
    } catch (err: any) {
      return { success: false, feeMinor, error: err.message || 'Double-entry transaction validation failed.' };
    }

    const ledgerItem: LedgerEntry = {
      id: `led_${Date.now()}`,
      transactionId: txId,
      accountId: sourceAcc.id,
      direction: 'DEBIT',
      amountMinor,
      currency: sourceAcc.currency,
      balanceAfterMinor: sourceAcc.balanceMinor,
      description: memo || `${transferType.replace('_', ' ')} to ${recipient.name} (${recipient.bankName})`,
      category: 'Transfers',
      counterparty: recipient.name,
      status: 'SETTLED',
      channel: transferType === 'WIRE_TRANSFER' ? 'WIRE' : 'ACH',
      referenceNumber: ref,
      createdTimestamp: nowIso,
      effectiveTimestamp: nowIso,
      settledTimestamp: nowIso,
      metadata: { recipient, feeMinor }
    };

    this.ledger.unshift(ledgerItem);

    if (feeMinor > 0) {
      const feeLedger: LedgerEntry = {
        id: `led_fee_${Date.now()}`,
        transactionId: `${txId}_fee`,
        accountId: sourceAcc.id,
        direction: 'DEBIT',
        amountMinor: feeMinor,
        currency: sourceAcc.currency,
        balanceAfterMinor: sourceAcc.balanceMinor,
        description: `Wire Dispatch / Institutional Network Processing Fee (${ref})`,
        category: 'Fees & Interest',
        counterparty: 'First Atlantic Bank Core',
        status: 'SETTLED',
        channel: 'ONLINE',
        referenceNumber: `FEE-${ref}`,
        createdTimestamp: nowIso,
        effectiveTimestamp: nowIso,
        settledTimestamp: nowIso
      };
      this.ledger.unshift(feeLedger);
    }

    this.addAuditLog({
      actorId: userId,
      actorEmail: this.users.get(userId)?.email || 'customer',
      actorRole: 'CUSTOMER',
      action: 'EXTERNAL_TRANSFER_DISPATCHED',
      targetType: 'ACCOUNT',
      targetId: sourceAcc.id,
      ipAddress: '108.45.192.8',
      userAgent: 'First Atlantic Secure Web Platform',
      details: `Dispatched ${transferType} of ${this.formatMinor(amountMinor, sourceAcc.currency)} to ${recipient.name} at ${recipient.bankName}`
    });

    this.saveToDiskSync();

    return { success: true, transactionId: txId, feeMinor };
  }

  /**
   * Bill Pay settlement
   */
  executeBillPayment(
    userId: string,
    sourceAccountId: string,
    vendorId: string,
    amountMinor: number,
    accountNumberWithVendor: string
  ): { success: boolean; transactionId?: string; error?: string } {
    const sourceAcc = this.accounts.get(sourceAccountId);
    if (!sourceAcc) return { success: false, error: 'Account not found.' };
    if (sourceAcc.availableBalanceMinor < amountMinor) {
      return { success: false, error: 'Insufficient funds for bill payment.' };
    }

    const vendor = BILL_PAY_VENDORS.find(v => v.id === vendorId);
    if (!vendor) return { success: false, error: 'Invalid biller selected.' };

    const txId = `tx_bp_${Date.now()}`;
    const nowIso = new Date().toISOString();
    const ref = `BPAY-${vendor.billerCode}-${Date.now().toString().slice(-6)}`;

    const glCashCode = sourceAcc.currency === 'USD' ? 'GL_1001_FED_RESERVE_CASH' : 'GL_1002_BOE_SETTLEMENT_CASH';

    const journalLines: JournalLine[] = [
      {
        id: `jl_${Date.now()}_1`,
        accountId: sourceAcc.id,
        accountType: 'CUSTOMER_DEPOSIT',
        accountName: `${sourceAcc.name} (${sourceAcc.accountNumber})`,
        direction: 'DEBIT',
        amountMinor,
        currency: sourceAcc.currency,
        description: `Bill Payment to ${vendor.name}`
      },
      {
        id: `jl_${Date.now()}_2`,
        accountId: glCashCode,
        accountType: 'GL_ASSET',
        accountName: 'Interbank Settlement Cash',
        direction: 'CREDIT',
        amountMinor,
        currency: sourceAcc.currency,
        description: `Biller Clearing Outflow (${vendor.billerCode})`
      }
    ];

    try {
      doubleEntryLedger.commitJournalTransaction({
        referenceNumber: ref,
        transactionType: 'BILL_PAYMENT',
        description: `Bill Payment — ${vendor.name} (Acct ${accountNumberWithVendor.slice(-4)})`,
        lines: journalLines,
        effectiveAt: nowIso,
        metadata: { userId, vendorId, accountNumberWithVendor },
        accountMutator: (line) => {
          if (line.accountId === sourceAcc.id) {
            sourceAcc.balanceMinor -= line.amountMinor;
            sourceAcc.availableBalanceMinor -= line.amountMinor;
          }
        }
      });
    } catch (err: any) {
      return { success: false, error: err.message || 'Bill pay double-entry validation failed.' };
    }

    const ledgerItem: LedgerEntry = {
      id: `led_${Date.now()}`,
      transactionId: txId,
      accountId: sourceAcc.id,
      direction: 'DEBIT',
      amountMinor,
      currency: sourceAcc.currency,
      balanceAfterMinor: sourceAcc.balanceMinor,
      description: `Bill Payment — ${vendor.name} (Acct ${accountNumberWithVendor.slice(-4)})`,
      category: 'Bills & Utilities',
      counterparty: vendor.name,
      status: 'SETTLED',
      channel: 'ONLINE',
      referenceNumber: ref,
      createdTimestamp: nowIso,
      effectiveTimestamp: nowIso,
      settledTimestamp: nowIso,
      metadata: { vendorId, accountNumberWithVendor }
    };

    this.ledger.unshift(ledgerItem);
    return { success: true, transactionId: txId };
  }

  /**
   * Mobile Check Deposit
   */
  submitMobileCheckDeposit(
    userId: string,
    accountId: string,
    amountMinor: number,
    checkNumber: string,
    frontImage: string,
    backImage: string
  ): { success: boolean; depositId?: string; availableDate?: string; error?: string } {
    const acc = this.accounts.get(accountId);
    if (!acc) return { success: false, error: 'Deposit account not found.' };

    const depositId = `dep_${Date.now()}`;
    const now = new Date();
    // 2 business day availability rule
    const availDate = new Date(now.getTime() + 86400000 * 2).toISOString().slice(0, 10);

    const record: MobileDepositRecord = {
      id: depositId,
      userId,
      accountId,
      amountMinor,
      currency: acc.currency,
      checkNumber,
      frontImage,
      backImage,
      status: 'PENDING_VERIFICATION',
      availableDate: availDate,
      submittedTimestamp: now.toISOString()
    };

    this.mobileDeposits.unshift(record);

    // Ledger entry as HELD / PENDING (avoids falsely representing as cleared)
    const txId = `tx_dep_${Date.now()}`;
    acc.pendingHoldMinor += amountMinor;
    // Current balance updates once verified, available balance remains unchanged until settled

    const ledgerItem: LedgerEntry = {
      id: `led_${Date.now()}`,
      transactionId: txId,
      accountId: acc.id,
      direction: 'CREDIT',
      amountMinor,
      currency: acc.currency,
      balanceAfterMinor: acc.balanceMinor,
      description: `Mobile Check Deposit #${checkNumber} (Verification in progress)`,
      category: 'Deposits',
      counterparty: `Check #${checkNumber}`,
      status: 'PENDING',
      channel: 'MOBILE',
      referenceNumber: `MDEP-${checkNumber}-${Date.now().toString().slice(-4)}`,
      createdTimestamp: now.toISOString(),
      effectiveTimestamp: availDate
    };

    this.ledger.unshift(ledgerItem);
    this.saveToDisk();

    return { success: true, depositId, availableDate: availDate };
  }

  /**
   * Controlled Administrative Financial Adjustment (Maker-Checker with immutable records)
   */
  createFinancialAdjustment(
    makerAdmin: AdminUser,
    accountId: string,
    amountMinor: number,
    currency: CurrencyCode,
    direction: 'DEBIT' | 'CREDIT',
    adjustmentType: FinancialAdjustment['adjustmentType'],
    reason: string,
    effectiveDate: string
  ): { success: boolean; adjustment?: FinancialAdjustment; requiresChecker: boolean; error?: string } {
    const acc = this.accounts.get(accountId);
    if (!acc) return { success: false, requiresChecker: false, error: 'Target account not found.' };
    const user = this.users.get(acc.userId);

    // Policy: Any adjustment > $1,000 / £1,000 requires secondary admin checker approval
    const thresholdMinor = 100000;
    const requiresChecker = amountMinor >= thresholdMinor;

    const adjId = `adj_${Date.now()}`;
    const ref = `ADJ-FAB-${new Date().getFullYear()}-${Date.now().toString().slice(-4)}`;

    const adjustment: FinancialAdjustment = {
      id: adjId,
      referenceNumber: ref,
      accountId,
      accountNumber: acc.accountNumber,
      customerName: user ? `${user.firstName} ${user.lastName}` : 'Client',
      amountMinor,
      currency,
      direction,
      adjustmentType,
      reason,
      effectiveDate,
      makerAdminId: makerAdmin.id,
      makerAdminName: makerAdmin.name,
      status: requiresChecker ? 'PENDING_APPROVAL' : 'APPROVED_AND_POSTED',
      createdTimestamp: new Date().toISOString()
    };

    if (!requiresChecker) {
      // Post immediately
      this.postAdjustmentToLedger(adjustment, makerAdmin);
    }

    this.adjustments.unshift(adjustment);

    this.addAuditLog({
      actorId: makerAdmin.id,
      actorEmail: makerAdmin.email,
      actorRole: makerAdmin.role,
      action: 'ADMIN_FINANCIAL_ADJUSTMENT_CREATED',
      targetType: 'ACCOUNT',
      targetId: accountId,
      ipAddress: '199.16.156.12',
      userAgent: 'First Atlantic Institutional Core Admin Suite',
      details: `${requiresChecker ? 'Initiated (Awaiting Checker Approval)' : 'Directly Posted'} ${direction} adjustment of ${this.formatMinor(amountMinor, currency)} (${adjustmentType}: ${reason})`
    });

    return { success: true, adjustment, requiresChecker };
  }

  /**
   * Checker approval for high-risk financial adjustment
   */
  approveFinancialAdjustment(
    checkerAdmin: AdminUser,
    adjustmentId: string,
    notes?: string
  ): { success: boolean; error?: string } {
    const adj = this.adjustments.find(a => a.id === adjustmentId);
    if (!adj) return { success: false, error: 'Adjustment record not found.' };
    if (adj.status !== 'PENDING_APPROVAL') return { success: false, error: `Adjustment is already ${adj.status}.` };

    // Maker and Checker separation of duties (with single master admin executive override support)
    if (checkerAdmin.role !== 'SUPER_ADMIN' && adj.makerAdminId === checkerAdmin.id) {
      return { success: false, error: 'Dual-control violation: Maker and Checker cannot be the same administrator.' };
    }

    adj.checkerAdminId = checkerAdmin.id;
    adj.checkerAdminName = checkerAdmin.name;
    adj.status = 'APPROVED_AND_POSTED';
    adj.postedTimestamp = new Date().toISOString();
    adj.approvalNotes = notes || 'Authorized in accordance with compliance threshold policies.';

    this.postAdjustmentToLedger(adj, checkerAdmin);

    this.addAuditLog({
      actorId: checkerAdmin.id,
      actorEmail: checkerAdmin.email,
      actorRole: checkerAdmin.role,
      action: 'ADMIN_FINANCIAL_ADJUSTMENT_APPROVED',
      targetType: 'ACCOUNT',
      targetId: adj.accountId,
      ipAddress: '199.16.156.12',
      userAgent: 'First Atlantic Institutional Core Admin Suite',
      approvalId: adj.id,
      details: `Checker ${checkerAdmin.name} approved & posted adjustment ${adj.referenceNumber} for ${this.formatMinor(adj.amountMinor, adj.currency)}`
    });

    return { success: true };
  }

  private postAdjustmentToLedger(adj: FinancialAdjustment, admin: AdminUser) {
    const acc = this.accounts.get(adj.accountId);
    if (!acc) return;

    const glCapitalCode = 'GL_3001_TIER1_CAPITAL_RESERVE';
    const journalLines: JournalLine[] = [];

    if (adj.direction === 'CREDIT') {
      // Credit to customer requires balancing Debit to Bank Capital / Clearing Reserve
      journalLines.push(
        {
          id: `jl_adj_${Date.now()}_1`,
          accountId: glCapitalCode,
          accountType: 'GL_EQUITY',
          accountName: 'Tier-1 Institutional Capital Reserve',
          direction: 'DEBIT',
          amountMinor: adj.amountMinor,
          currency: adj.currency,
          description: `Adjustment Capital Allocation (${adj.adjustmentType})`
        },
        {
          id: `jl_adj_${Date.now()}_2`,
          accountId: acc.id,
          accountType: 'CUSTOMER_DEPOSIT',
          accountName: `${acc.name} (${acc.accountNumber})`,
          direction: 'CREDIT',
          amountMinor: adj.amountMinor,
          currency: adj.currency,
          description: `Adjustment: ${adj.adjustmentType} — ${adj.reason}`
        }
      );
    } else {
      // Debit to customer requires balancing Credit to Bank Capital / Clearing Reserve
      journalLines.push(
        {
          id: `jl_adj_${Date.now()}_1`,
          accountId: acc.id,
          accountType: 'CUSTOMER_DEPOSIT',
          accountName: `${acc.name} (${acc.accountNumber})`,
          direction: 'DEBIT',
          amountMinor: adj.amountMinor,
          currency: adj.currency,
          description: `Adjustment Recovery: ${adj.adjustmentType} — ${adj.reason}`
        },
        {
          id: `jl_adj_${Date.now()}_2`,
          accountId: glCapitalCode,
          accountType: 'GL_EQUITY',
          accountName: 'Tier-1 Institutional Capital Reserve',
          direction: 'CREDIT',
          amountMinor: adj.amountMinor,
          currency: adj.currency,
          description: `Adjustment Settlement Recovery (${adj.adjustmentType})`
        }
      );
    }

    try {
      doubleEntryLedger.commitJournalTransaction({
        referenceNumber: adj.referenceNumber,
        transactionType: 'ADMIN_ADJUSTMENT',
        description: `Institutional Adjustment: ${adj.adjustmentType} (${adj.reason})`,
        lines: journalLines,
        effectiveAt: new Date(adj.effectiveDate).toISOString(),
        metadata: { adjustmentId: adj.id, maker: adj.makerAdminName, checker: adj.checkerAdminName },
        accountMutator: (line) => {
          if (line.accountId === acc.id) {
            if (line.direction === 'CREDIT') {
              acc.balanceMinor += line.amountMinor;
              acc.availableBalanceMinor += line.amountMinor;
            } else {
              acc.balanceMinor -= line.amountMinor;
              acc.availableBalanceMinor -= line.amountMinor;
            }
          }
        }
      });
    } catch (err: any) {
      console.error('Adjustment double-entry validation failed:', err);
      throw new Error(`Double-entry commitment failure: ${err.message}`);
    }

    const ledgerItem: LedgerEntry = {
      id: `led_adj_${Date.now()}`,
      transactionId: `tx_adj_${adj.id}`,
      accountId: acc.id,
      direction: adj.direction,
      amountMinor: adj.amountMinor,
      currency: adj.currency,
      balanceAfterMinor: acc.balanceMinor,
      description: `Institutional Adjustment: ${adj.adjustmentType.replace('_', ' ')} — ${adj.reason}`,
      category: 'Adjustments',
      counterparty: 'First Atlantic Bank Treasury',
      status: 'SETTLED',
      channel: 'ADMIN_PORTAL',
      referenceNumber: adj.referenceNumber,
      createdTimestamp: new Date().toISOString(),
      effectiveTimestamp: new Date(adj.effectiveDate).toISOString(),
      settledTimestamp: new Date().toISOString(),
      metadata: { adjustmentId: adj.id, maker: adj.makerAdminName, checker: adj.checkerAdminName }
    };

    this.ledger.unshift(ledgerItem);
  }

  /**
   * Immutable Audit Logging
   */
  addAuditLog(entry: Omit<AuditLog, 'id' | 'timestamp' | 'signatureHash'>) {
    const log: AuditLog = {
      ...entry,
      id: `aud_${Date.now()}_${Math.floor(Math.random() * 1000)}`,
      timestamp: new Date().toISOString(),
      signatureHash: this.computeHash(`${entry.actorId}_${entry.action}_${Date.now()}`)
    };
    this.auditLogs.unshift(log);
    this.saveToDisk();
  }

  private computeHash(input: string): string {
    let hash = 0;
    for (let i = 0; i < input.length; i++) {
      const char = input.charCodeAt(i);
      hash = ((hash << 5) - hash) + char;
      hash |= 0;
    }
    return Math.abs(hash).toString(16).padStart(64, '0');
  }

  /**
   * Toggle user account access (switch between APPROVED and SUSPENDED)
   */
  toggleUserAccess(admin: AdminUser, userId: string, reason?: string): { success: boolean; user?: UserProfile; error?: string } {
    const user = this.users.get(userId);
    if (!user) return { success: false, error: 'User not found.' };

    const nextStatus: UserApprovalStatus = user.approval_status === 'APPROVED' ? 'SUSPENDED' : 'APPROVED';
    return this.setUserApprovalStatus(admin, userId, nextStatus, reason || `Administrative status toggle to ${nextStatus}`);
  }

  /**
   * Set user approval status with cascading account/card states and cryptographic audit log
   */
  setUserApprovalStatus(admin: AdminUser, userId: string, status: UserApprovalStatus, reason?: string): { success: boolean; user?: UserProfile; error?: string } {
    const user = this.users.get(userId);
    if (!user) return { success: false, error: 'User not found.' };

    const previousStatus = user.approval_status;
    user.approval_status = status;

    // Cascade to user bank accounts
    const userAccounts = Array.from(this.accounts.values()).filter(a => a.userId === userId);
    userAccounts.forEach(acc => {
      if (status === 'SUSPENDED' || status === 'REJECTED') {
        acc.status = 'RESTRICTED';
      } else if (status === 'APPROVED') {
        acc.status = 'ACTIVE';
      }
    });

    // Cascade to user cards
    const userCards = Array.from(this.cards.values()).filter(c => c.userId === userId);
    userCards.forEach(c => {
      if (status === 'SUSPENDED' || status === 'REJECTED') {
        c.status = 'LOCKED';
      } else if (status === 'APPROVED') {
        c.status = 'ACTIVE';
      }
    });

    // Immutable audit log
    this.addAuditLog({
      actorId: admin.id,
      actorEmail: admin.email,
      actorRole: admin.role,
      action: 'USER_APPROVAL_STATUS_CHANGED',
      targetType: 'USER',
      targetId: userId,
      ipAddress: '127.0.0.1',
      userAgent: 'First Atlantic Bank Institutional Admin Core',
      details: `User (${user.firstName} ${user.lastName} / ${user.email}) approval status changed from ${previousStatus} to ${status}. Reason: ${reason || 'Administrative policy update'}.`,
      previousState: { approval_status: previousStatus },
      newState: { approval_status: status }
    });

    return { success: true, user };
  }

  /**
   * Propose a Dual-Signature Account Activation Request (Maker Step)
   */
  createActivationRequest(
    makerAdmin: AdminUser,
    userId: string,
    targetStatus: UserApprovalStatus = 'APPROVED',
    reason: string,
    notes?: string
  ): { success: boolean; request?: AccountActivationRequest; error?: string } {
    const user = this.users.get(userId);
    if (!user) return { success: false, error: 'User not found for activation request.' };

    const id = `act_req_${Date.now()}_${Math.random().toString(36).slice(2, 6)}`;
    const referenceNumber = `FAB-ACT-${new Date().getFullYear()}-${Math.floor(1000 + Math.random() * 9000)}`;

    const userAccounts = Array.from(this.accounts.values()).filter(a => a.userId === userId);
    const primaryAccount = userAccounts[0];

    const req: AccountActivationRequest = {
      id,
      userId,
      referenceNumber,
      userName: `${user.firstName} ${user.lastName}`,
      userEmail: user.email,
      userRegion: user.region,
      requestedAccountType: primaryAccount?.type || 'CHECKING_PREMIER',
      requestedCurrency: primaryAccount?.currency || (user.region === 'EU' ? 'EUR' : user.region === 'UK' ? 'GBP' : 'USD'),
      initialDepositMinor: primaryAccount?.balanceMinor || 0,
      riskScore: 100 - user.securityScore,
      reason,
      targetApprovalStatus: targetStatus,
      makerAdminId: makerAdmin.id,
      makerAdminName: makerAdmin.name,
      makerAdminRole: makerAdmin.role,
      makerTimestamp: new Date().toISOString(),
      makerNotes: notes,
      makerSignatureHash: this.computeHash(`${makerAdmin.id}_ACTREQ_${userId}_${Date.now()}`),
      status: 'PENDING_DUAL_APPROVAL'
    };

    this.activationRequests.unshift(req);

    this.addAuditLog({
      actorId: makerAdmin.id,
      actorEmail: makerAdmin.email,
      actorRole: makerAdmin.role,
      action: 'ACCOUNT_ACTIVATION_PROPOSED',
      targetType: 'USER',
      targetId: userId,
      ipAddress: '127.0.0.1',
      userAgent: 'First Atlantic Bank Admin Core',
      details: `Maker Admin ${makerAdmin.name} initiated dual-signature activation request ${referenceNumber} for user ${user.firstName} ${user.lastName} (${user.email}).`
    });

    // Trigger Automated Email Dispatch and Administrative System Alert
    try {
      adminNotificationService.triggerActivationNotification(req);
    } catch (notifErr) {
      console.warn('Automated activation notification dispatch warning:', notifErr);
    }

    return { success: true, request: req };
  }

  /**
   * Approve a Dual-Signature Account Activation Request (Checker Step)
   */
  approveActivationRequest(
    checkerAdmin: AdminUser,
    requestId: string,
    checkerNotes?: string
  ): { success: boolean; request?: AccountActivationRequest; user?: UserProfile; error?: string } {
    const req = this.activationRequests.find(r => r.id === requestId);
    if (!req) return { success: false, error: 'Activation request not found.' };

    if (req.status !== 'PENDING_DUAL_APPROVAL') {
      return { success: false, error: `Request is already in status ${req.status}.` };
    }

    // Dual-Control 4-Eyes Enforcement (with single master administrator override support)
    if (checkerAdmin.role !== 'SUPER_ADMIN' && req.makerAdminId === checkerAdmin.id) {
      return {
        success: false,
        error: 'Dual-Control 4-Eyes Rule Violation: The Checker signatory cannot be the same administrator who initiated the Maker request.'
      };
    }

    req.checkerAdminId = checkerAdmin.id;
    req.checkerAdminName = checkerAdmin.name;
    req.checkerAdminRole = checkerAdmin.role;
    req.checkerTimestamp = new Date().toISOString();
    req.checkerNotes = checkerNotes || 'Dual-signature verification confirmed and authorized.';
    req.checkerSignatureHash = this.computeHash(`${checkerAdmin.id}_CHECKER_${req.id}_${Date.now()}`);
    req.status = 'ACTIVATED';

    // If related to an application, approve it
    if (req.applicationId) {
      const app = this.applications.get(req.applicationId);
      if (app && app.status !== 'APPROVED') {
        const approvedRes = this.approveAccountApplication(checkerAdmin, req.applicationId, checkerNotes);
        if (approvedRes.user) {
          req.userId = approvedRes.user.id;
        }
      }
    }

    // Update target user's approval status
    let user = this.users.get(req.userId);
    if (user) {
      this.setUserApprovalStatus(checkerAdmin, req.userId, req.targetApprovalStatus, `Dual-signature account activation completed (${req.referenceNumber})`);
      user = this.users.get(req.userId);
    }

    this.addAuditLog({
      actorId: checkerAdmin.id,
      actorEmail: checkerAdmin.email,
      actorRole: checkerAdmin.role,
      action: 'ACCOUNT_ACTIVATION_DUAL_APPROVED',
      targetType: 'USER',
      targetId: req.userId,
      ipAddress: '127.0.0.1',
      userAgent: 'First Atlantic Bank Admin Core',
      details: `Dual-Signature Approved: Checker Admin ${checkerAdmin.name} validated and authorized activation for ${req.userName} (Ref: ${req.referenceNumber}). Maker: ${req.makerAdminName}.`
    });

    return { success: true, request: req, user };
  }

  /**
   * Reject a Dual-Signature Account Activation Request
   */
  rejectActivationRequest(
    checkerAdmin: AdminUser,
    requestId: string,
    checkerNotes?: string
  ): { success: boolean; request?: AccountActivationRequest; error?: string } {
    const req = this.activationRequests.find(r => r.id === requestId);
    if (!req) return { success: false, error: 'Activation request not found.' };

    if (req.status !== 'PENDING_DUAL_APPROVAL') {
      return { success: false, error: `Request is already in status ${req.status}.` };
    }

    req.checkerAdminId = checkerAdmin.id;
    req.checkerAdminName = checkerAdmin.name;
    req.checkerAdminRole = checkerAdmin.role;
    req.checkerTimestamp = new Date().toISOString();
    req.checkerNotes = checkerNotes || 'Dual-signature activation declined by executive checker.';
    req.status = 'REJECTED';
    req.statusNotes = checkerNotes;

    this.addAuditLog({
      actorId: checkerAdmin.id,
      actorEmail: checkerAdmin.email,
      actorRole: checkerAdmin.role,
      action: 'ACCOUNT_ACTIVATION_REJECTED',
      targetType: 'USER',
      targetId: req.userId,
      ipAddress: '127.0.0.1',
      userAgent: 'First Atlantic Bank Admin Core',
      details: `Checker Admin ${checkerAdmin.name} rejected activation request ${req.referenceNumber} for user ${req.userName}. Notes: ${req.checkerNotes}.`
    });

    return { success: true, request: req };
  }

  formatMinor(minor: number, currency: CurrencyCode): string {
    const symbol = currency === 'USD' ? '$' : currency === 'GBP' ? '£' : '€';
    return `${symbol}${(minor / 100).toLocaleString('en-US', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}`;
  }

  /**
   * Direct Admin Credit or Debit operation on user account
   */
  directCreditDebitAccount(
    admin: AdminUser,
    accountId: string,
    amountMinor: number,
    direction: 'CREDIT' | 'DEBIT',
    description: string,
    category: LedgerEntry['category'] = 'Adjustments',
    counterparty: string = 'First Atlantic Treasury Master Ops',
    referenceNumber?: string,
    customTimestamp?: string
  ): { success: boolean; account?: BankAccount; ledgerEntry?: LedgerEntry; error?: string } {
    const acc = this.accounts.get(accountId);
    if (!acc) return { success: false, error: 'Target account not found.' };

    const user = this.users.get(acc.userId);
    const nowIso = customTimestamp || new Date().toISOString();
    const ref = referenceNumber || `FAB-ADM-${direction.slice(0, 3)}-${Date.now().toString().slice(-6)}`;
    const txId = `tx_adm_${Date.now()}_${Math.floor(Math.random() * 1000)}`;

    if (direction === 'CREDIT') {
      acc.balanceMinor += amountMinor;
      acc.availableBalanceMinor += amountMinor;
    } else {
      if (acc.balanceMinor < amountMinor) {
        // Still allow admin override if authorized, but let's deduct or handle
        acc.balanceMinor -= amountMinor;
        acc.availableBalanceMinor -= amountMinor;
      } else {
        acc.balanceMinor -= amountMinor;
        acc.availableBalanceMinor -= amountMinor;
      }
    }

    const ledgerItem: LedgerEntry = {
      id: `led_${Date.now()}_${Math.floor(Math.random() * 1000)}`,
      transactionId: txId,
      accountId: acc.id,
      direction,
      amountMinor,
      currency: acc.currency,
      balanceAfterMinor: acc.balanceMinor,
      description: description || `Executive Admin ${direction === 'CREDIT' ? 'Credit Deposit' : 'Debit Deduction'}`,
      category: category || 'Adjustments',
      counterparty: counterparty || 'First Atlantic Treasury',
      status: 'SETTLED',
      channel: 'ADMIN_PORTAL',
      referenceNumber: ref,
      createdTimestamp: nowIso,
      effectiveTimestamp: nowIso,
      settledTimestamp: nowIso,
      metadata: {
        adminId: admin.id,
        adminName: admin.name,
        adminRole: admin.role
      }
    };

    this.ledger.unshift(ledgerItem);

    // Double Entry Journal recording
    try {
      const glTreasury = acc.currency === 'USD' ? 'GL_1001_FED_RESERVE_CASH' : acc.currency === 'GBP' ? 'GL_1002_BOE_SETTLEMENT_CASH' : 'GL_1003_ECB_SETTLEMENT_CASH';
      const lines: JournalLine[] = [
        {
          id: `jl_dir_${Date.now()}_1`,
          accountId: acc.id,
          accountType: 'CUSTOMER_DEPOSIT',
          accountName: `${acc.name} (${acc.accountNumber})`,
          direction: direction === 'CREDIT' ? 'CREDIT' : 'DEBIT',
          amountMinor,
          currency: acc.currency,
          description: description || `Admin ${direction}`
        },
        {
          id: `jl_dir_${Date.now()}_2`,
          accountId: glTreasury,
          accountType: 'GL_ASSET',
          accountName: 'First Atlantic Master Treasury Reserve',
          direction: direction === 'CREDIT' ? 'DEBIT' : 'CREDIT',
          amountMinor,
          currency: acc.currency,
          description: `Admin Treasury Contra Entry (${ref})`
        }
      ];

      doubleEntryLedger.commitJournalTransaction({
        referenceNumber: ref,
        transactionType: direction === 'CREDIT' ? 'ADMIN_ADJUSTMENT' : 'ADMIN_ADJUSTMENT',
        description: `Admin ${direction} by ${admin.name}: ${description}`,
        lines,
        effectiveAt: nowIso
      });
    } catch (e) {
      console.warn('Double entry recording error:', e);
    }

    this.addAuditLog({
      actorId: admin.id,
      actorEmail: admin.email,
      actorRole: admin.role,
      action: direction === 'CREDIT' ? 'ADMIN_DIRECT_CREDIT' : 'ADMIN_DIRECT_DEBIT',
      targetType: 'ACCOUNT',
      targetId: acc.id,
      ipAddress: '199.16.156.12',
      userAgent: 'First Atlantic Executive Suite v4.9',
      details: `Administrator ${admin.name} directly ${direction === 'CREDIT' ? 'credited' : 'debited'} ${this.formatMinor(amountMinor, acc.currency)} to ${user ? user.firstName + ' ' + user.lastName : 'Client'} (${acc.name} - ${acc.accountNumber}). Balance after: ${this.formatMinor(acc.balanceMinor, acc.currency)}. Memo: ${description}`
    });

    return { success: true, account: acc, ledgerEntry: ledgerItem };
  }

  /**
   * Edit an existing user transaction in the ledger
   */
  editLedgerTransaction(
    admin: AdminUser,
    transactionIdOrId: string,
    updates: {
      description?: string;
      category?: LedgerEntry['category'];
      counterparty?: string;
      status?: TransactionStatus;
      amountMinor?: number;
      direction?: TransactionDirection;
      referenceNumber?: string;
      effectiveTimestamp?: string;
      createdTimestamp?: string;
      channel?: LedgerEntry['channel'];
      adjustAccountBalance?: boolean;
    }
  ): { success: boolean; transaction?: LedgerEntry; account?: BankAccount; error?: string } {
    const tx = this.ledger.find(t => t.id === transactionIdOrId || t.transactionId === transactionIdOrId);
    if (!tx) return { success: false, error: 'Transaction not found in ledger.' };

    const acc = this.accounts.get(tx.accountId);
    const oldCopy = { ...tx };

    // If balance adjustment requested and amount or direction changed
    if (updates.adjustAccountBalance && acc && updates.amountMinor !== undefined) {
      const oldDirection = tx.direction;
      const oldAmount = tx.amountMinor;
      const newDirection = updates.direction || tx.direction;
      const newAmount = Number(updates.amountMinor);

      // Revert old effect
      if (oldDirection === 'CREDIT') {
        acc.balanceMinor -= oldAmount;
        acc.availableBalanceMinor -= oldAmount;
      } else {
        acc.balanceMinor += oldAmount;
        acc.availableBalanceMinor += oldAmount;
      }

      // Apply new effect
      if (newDirection === 'CREDIT') {
        acc.balanceMinor += newAmount;
        acc.availableBalanceMinor += newAmount;
      } else {
        acc.balanceMinor -= newAmount;
        acc.availableBalanceMinor -= newAmount;
      }

      tx.balanceAfterMinor = acc.balanceMinor;
    }

    if (updates.description !== undefined) tx.description = updates.description;
    if (updates.category !== undefined) tx.category = updates.category;
    if (updates.counterparty !== undefined) tx.counterparty = updates.counterparty;
    if (updates.status !== undefined) tx.status = updates.status;
    if (updates.amountMinor !== undefined) tx.amountMinor = Number(updates.amountMinor);
    if (updates.direction !== undefined) tx.direction = updates.direction;
    if (updates.referenceNumber !== undefined) tx.referenceNumber = updates.referenceNumber;
    if (updates.effectiveTimestamp !== undefined) tx.effectiveTimestamp = updates.effectiveTimestamp;
    if (updates.createdTimestamp !== undefined) tx.createdTimestamp = updates.createdTimestamp;
    if (updates.channel !== undefined) tx.channel = updates.channel;

    this.addAuditLog({
      actorId: admin.id,
      actorEmail: admin.email,
      actorRole: admin.role,
      action: 'ADMIN_TRANSACTION_EDITED',
      targetType: 'TRANSACTION',
      targetId: tx.id,
      ipAddress: '199.16.156.12',
      userAgent: 'First Atlantic Executive Suite v4.9',
      details: `Administrator ${admin.name} modified transaction ${tx.referenceNumber} (${tx.description}).`,
      previousState: oldCopy,
      newState: tx
    });

    return { success: true, transaction: tx, account: acc };
  }

  /**
   * Delete or reverse transaction from ledger
   */
  deleteLedgerTransaction(
    admin: AdminUser,
    transactionIdOrId: string,
    revertBalance: boolean = true
  ): { success: boolean; message?: string; error?: string } {
    const idx = this.ledger.findIndex(t => t.id === transactionIdOrId || t.transactionId === transactionIdOrId);
    if (idx === -1) return { success: false, error: 'Transaction not found in ledger.' };

    const tx = this.ledger[idx];
    const acc = this.accounts.get(tx.accountId);

    if (revertBalance && acc) {
      if (tx.direction === 'CREDIT') {
        acc.balanceMinor -= tx.amountMinor;
        acc.availableBalanceMinor -= tx.amountMinor;
      } else {
        acc.balanceMinor += tx.amountMinor;
        acc.availableBalanceMinor += tx.amountMinor;
      }
    }

    this.ledger.splice(idx, 1);

    this.addAuditLog({
      actorId: admin.id,
      actorEmail: admin.email,
      actorRole: admin.role,
      action: 'ADMIN_TRANSACTION_DELETED',
      targetType: 'TRANSACTION',
      targetId: tx.id,
      ipAddress: '199.16.156.12',
      userAgent: 'First Atlantic Executive Suite v4.9',
      details: `Administrator ${admin.name} removed transaction ${tx.referenceNumber} (${tx.description}, ${this.formatMinor(tx.amountMinor, tx.currency)}) with balance reversion = ${revertBalance}.`
    });

    return { success: true, message: 'Transaction record successfully removed.' };
  }

  /**
   * Bank Receiving Accounts (Where all client deposit wires will be received to)
   */
  getReceivingAccounts(): BankReceivingAccount[] {
    return Array.from(this.receivingAccounts.values());
  }

  saveReceivingAccount(admin: AdminUser, data: Partial<BankReceivingAccount>): { success: boolean; account?: BankReceivingAccount; error?: string } {
    if (!data.bankName || !data.beneficiaryName || !data.accountNumberOrIban) {
      return { success: false, error: 'Bank Name, Beneficiary Name, and Account/IBAN are required.' };
    }

    const id = data.id || `rec_bank_${Date.now()}`;
    const isNew = !this.receivingAccounts.has(id);

    // If marked as default for this currency/region, unset other defaults
    if (data.isDefault) {
      this.receivingAccounts.forEach(acc => {
        if (acc.currency === data.currency && acc.id !== id) {
          acc.isDefault = false;
        }
      });
    }

    const recAccount: BankReceivingAccount = {
      id,
      label: data.label || `${data.currency} Inflow Settlement Account`,
      bankName: data.bankName,
      beneficiaryName: data.beneficiaryName,
      accountNumberOrIban: data.accountNumberOrIban,
      routingNumber: data.routingNumber || '',
      sortCode: data.sortCode || '',
      swiftBic: data.swiftBic || 'FATLUS33NYC',
      currency: (data.currency as CurrencyCode) || 'USD',
      region: (data.region as BankRegion) || 'US',
      bankAddress: data.bankAddress || 'First Atlantic Bank Headquarters',
      intermediaryBankName: data.intermediaryBankName || '',
      intermediarySwiftBic: data.intermediarySwiftBic || '',
      specialInstructions: data.specialInstructions || '',
      isDefault: data.isDefault ?? true,
      status: (data.status as 'ACTIVE' | 'INACTIVE') || 'ACTIVE',
      updatedAt: new Date().toISOString()
    };

    this.receivingAccounts.set(id, recAccount);

    this.addAuditLog({
      actorId: admin.id,
      actorEmail: admin.email,
      actorRole: admin.role,
      action: isNew ? 'BANK_RECEIVING_ACCOUNT_CREATED' : 'BANK_RECEIVING_ACCOUNT_UPDATED',
      targetType: 'SYSTEM',
      targetId: id,
      ipAddress: '199.16.156.12',
      userAgent: 'First Atlantic Executive Suite v4.9',
      details: `Administrator ${admin.name} ${isNew ? 'added' : 'updated'} official bank receiving account ${recAccount.label} (${recAccount.bankName} - ${recAccount.accountNumberOrIban}) for ${recAccount.currency} deposits.`
    });

    return { success: true, account: recAccount };
  }

  deleteReceivingAccount(admin: AdminUser, id: string): { success: boolean; error?: string } {
    const acc = this.receivingAccounts.get(id);
    if (!acc) return { success: false, error: 'Receiving account not found.' };

    this.receivingAccounts.delete(id);

    this.addAuditLog({
      actorId: admin.id,
      actorEmail: admin.email,
      actorRole: admin.role,
      action: 'BANK_RECEIVING_ACCOUNT_DELETED',
      targetType: 'SYSTEM',
      targetId: id,
      ipAddress: '199.16.156.12',
      userAgent: 'First Atlantic Executive Suite v4.9',
      details: `Administrator ${admin.name} deleted receiving account ${acc.label} (${acc.accountNumberOrIban}).`
    });

    return { success: true };
  }

  /**
   * Detailed backend user profile inspector
   */
  getUserBackendDetails(userId: string) {
    const user = this.users.get(userId);
    if (!user) return null;

    const uAccounts = Array.from(this.accounts.values()).filter(a => a.userId === user.id);
    const uCards = Array.from(this.cards.values()).filter(c => c.userId === user.id);
    const uLogs = this.auditLogs.filter(l => l.actorId === user.id);
    const uLedger = this.ledger.filter(l => uAccounts.some(acc => acc.id === l.accountId));
    const uApplications = Array.from(this.applications.values()).filter(a => a.email.toLowerCase() === user.email.toLowerCase() || a.username.toLowerCase() === user.username.toLowerCase());
    const uActivations = this.activationRequests.filter(r => r.userId === user.id);

    const totalBalanceUsd = uAccounts.reduce((sum, acc) => {
      return sum + (acc.currency === 'USD' ? acc.balanceMinor : Math.round(acc.balanceMinor * EXCHANGE_RATES[acc.currency].USD));
    }, 0);

    const totalInflowMinor = uLedger
      .filter(l => l.direction === 'CREDIT')
      .reduce((s, l) => s + l.amountMinor, 0);

    const totalOutflowMinor = uLedger
      .filter(l => l.direction === 'DEBIT')
      .reduce((s, l) => s + l.amountMinor, 0);

    return {
      user: {
        ...user,
        // Backend unmasked view
        unmaskedSSN: user.region === 'US' ? (user.ssnMasked ? '987-65-8492' : 'N/A') : undefined,
        unmaskedNationalInsurance: user.region === 'UK' ? 'QQ 12 34 56 A' : undefined,
        taxId: user.region === 'EU' ? 'DE-849201948' : user.region === 'UK' ? 'GB-9920194' : 'US-849201948'
      },
      accounts: uAccounts,
      cards: uCards,
      transactions: uLedger,
      auditLogs: uLogs,
      applications: uApplications,
      activationRequests: uActivations,
      stats: {
        totalAccounts: uAccounts.length,
        totalBalanceUsdMinor: totalBalanceUsd,
        totalTransactionsCount: uLedger.length,
        totalInflowMinor,
        totalOutflowMinor
      }
    };
  }

  /**
   * Create a new customer directly by Administrator
   */
  createCustomerByAdmin(
    admin: AdminUser,
    data: {
      firstName: string;
      lastName: string;
      email: string;
      phone: string;
      dialCode?: string;
      username: string;
      password?: string;
      loginPin?: string;
      dateOfBirth: string;
      nationality: string;
      passportNumber?: string;
      passportPhoto?: string;
      ssnOrTaxId?: string;
      region: BankRegion;
      address: {
        line1: string;
        line2?: string;
        city: string;
        stateOrCounty: string;
        postalCode: string;
        country: string;
      };
      kycTier?: 'TIER_1_STANDARD' | 'TIER_2_VERIFIED_PREMIER' | 'TIER_3_INSTITUTIONAL';
      approvalStatus?: UserApprovalStatus;
      requestedAccountType?: any;
      currency?: CurrencyCode;
      initialDepositMinor?: number;
      issueDebitCard?: boolean;
      employmentStatus?: any;
      employerOrBusinessName?: string;
      sourceOfWealth?: any;
      annualIncomeRange?: string;
    }
  ): { success: boolean; user?: UserProfile; account?: BankAccount; card?: BankCard; application?: AccountApplication; error?: string } {
    if (!data.firstName || !data.lastName || !data.email) {
      return { success: false, error: 'First Name, Last Name, and Email are required.' };
    }

    const cleanEmail = data.email.trim().toLowerCase();
    let cleanUsername = (data.username || `${data.firstName.toLowerCase().slice(0, 1)}${data.lastName.toLowerCase()}` || cleanEmail.split('@')[0] || `client${Date.now().toString().slice(-4)}`).trim().toLowerCase().replace(/[^a-z0-9]/g, '') || `client${Date.now().toString().slice(-4)}`;

    const region = data.region || 'US';
    const currency = data.currency || (region === 'EU' ? 'EUR' : region === 'UK' ? 'GBP' : 'USD');
    const accountType = data.requestedAccountType || 'CHECKING_PREMIER';
    const initialDepositMinor = Math.max(0, Number(data.initialDepositMinor) || 0);

    // 1. Parse address cleanly
    let addressObj = {
      line1: '100 Atlantic Plaza',
      line2: '',
      city: region === 'UK' ? 'London' : region === 'EU' ? 'Frankfurt' : 'New York',
      stateOrCounty: region === 'UK' ? 'Greater London' : region === 'EU' ? 'Hesse' : 'NY',
      postalCode: region === 'UK' ? 'W1J 5AS' : region === 'EU' ? '60311' : '10001',
      country: region === 'UK' ? 'United Kingdom' : region === 'EU' ? 'Germany' : 'United States'
    };

    const rawAddress: any = data.address;
    if (typeof rawAddress === 'string' && rawAddress.trim()) {
      addressObj.line1 = rawAddress.trim();
    } else if (rawAddress && typeof rawAddress === 'object') {
      addressObj = {
        line1: rawAddress.line1 || addressObj.line1,
        line2: rawAddress.line2 || '',
        city: rawAddress.city || addressObj.city,
        stateOrCounty: rawAddress.stateOrCounty || addressObj.stateOrCounty,
        postalCode: rawAddress.postalCode || addressObj.postalCode,
        country: rawAddress.country || addressObj.country
      };
    }

    // Check if user already exists
    let existingUser = Array.from(this.users.values()).find(
      u => u.email.toLowerCase() === cleanEmail
    );

    let newUser: UserProfile;

    if (existingUser) {
      // Existing customer: update details if provided
      existingUser.firstName = data.firstName.trim() || existingUser.firstName;
      existingUser.lastName = data.lastName.trim() || existingUser.lastName;
      if (data.phone) existingUser.phone = data.phone.trim();
      if (data.dialCode) existingUser.dialCode = data.dialCode;
      if (data.loginPin) existingUser.loginPin = data.loginPin;
      if (data.kycTier) existingUser.kycTier = data.kycTier;
      if (data.approvalStatus) existingUser.approval_status = data.approvalStatus;
      if (data.dateOfBirth) existingUser.dateOfBirth = data.dateOfBirth;
      if (data.nationality) existingUser.nationality = data.nationality;
      if (data.passportNumber) existingUser.passportNumber = data.passportNumber;
      if (data.passportPhoto) {
        existingUser.passportPhoto = this.saveImageToDisk(data.passportPhoto, 'profile_' + existingUser.id) || existingUser.passportPhoto;
      }
      if (addressObj.line1) existingUser.address = addressObj;
      existingUser.region = region;
      
      const initialPassword = data.password?.trim() || 'AtlanticSecure2026!';
      this.userPasswords.set(existingUser.id, initialPassword);
      this.userPasswords.set(existingUser.username, initialPassword);
      this.userPasswords.set(cleanEmail, initialPassword);
      this.users.set(existingUser.id, existingUser);

      newUser = existingUser;
    } else {
      // If username exists, append a random suffix rather than rejecting
      const usernameTaken = Array.from(this.users.values()).some(
        u => u.username.toLowerCase() === cleanUsername
      );
      if (usernameTaken) {
        cleanUsername = `${cleanUsername}${Math.floor(100 + Math.random() * 900)}`;
      }

      const cleanLastName = data.lastName.toLowerCase().replace(/[^a-z0-9]/g, '') || 'client';
      const newUserId = `usr_${cleanLastName}_${Date.now().toString().slice(-4)}`;

      newUser = {
        id: newUserId,
        email: cleanEmail,
        username: cleanUsername,
        firstName: data.firstName.trim(),
        lastName: data.lastName.trim(),
        phone: data.phone?.trim() || '+1 (555) 019-2830',
        dialCode: data.dialCode || (region === 'UK' ? '+44' : region === 'EU' ? '+49' : '+1'),
        dateOfBirth: data.dateOfBirth || '1988-06-15',
        nationality: data.nationality || (region === 'UK' ? 'British' : region === 'EU' ? 'German' : 'American'),
        passportNumber: data.passportNumber || `ID-${Date.now().toString().slice(-6)}`,
        passportPhoto: this.saveImageToDisk(data.passportPhoto || '', 'profile_' + newUserId) || 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=500&auto=format&fit=crop&q=80',
        loginPin: data.loginPin || '1234',
        ssnMasked: region === 'US' ? (data.ssnOrTaxId ? `•••-••-${data.ssnOrTaxId.slice(-4)}` : '•••-••-8899') : undefined,
        nationalInsuranceMasked: region === 'UK' ? (data.ssnOrTaxId || 'QQ 12 34 56 A') : undefined,
        region,
        approval_status: data.approvalStatus || 'APPROVED',
        address: addressObj,
        mfaEnabled: true,
        mfaMethod: 'AUTHENTICATOR',
        biometricsEnabled: true,
        kycTier: data.kycTier || 'TIER_2_VERIFIED_PREMIER',
        securityScore: 95,
        notifications: {
          emailAlerts: true,
          smsAlerts: true,
          pushAlerts: true,
          largeTransactionThresholdMinor: 500000
        },
        lastLogin: new Date().toISOString()
      };

      const initialPassword = data.password?.trim() || 'AtlanticSecure2026!';
      this.users.set(newUser.id, newUser);
      this.userPasswords.set(newUser.id, initialPassword);
      this.userPasswords.set(cleanUsername, initialPassword);
      this.userPasswords.set(cleanEmail, initialPassword);
    }

    // 2. Generate Account details based on Region
    const userExistingAccs = Array.from(this.accounts.values()).filter(a => a.userId === newUser.id);
    const accIndex = (userExistingAccs.length + 1).toString().padStart(2, '0');
    const accId = `acc_${newUser.id}_${currency.toLowerCase()}_${accIndex}`;
    const fullAccNum = `${Math.floor(100000000000 + Math.random() * 900000000000)}`;
    const maskedAccNum = `•••• ${fullAccNum.slice(-4)}`;

    let iban: string | undefined;
    let sortCode: string | undefined;
    let routingNumber: string | undefined;
    let swiftBic = 'FATLUS33NYC';

    if (region === 'EU') {
      const countryCode = newUser.address.country.toLowerCase().includes('germany') ? 'DE' :
                          newUser.address.country.toLowerCase().includes('france') ? 'FR' :
                          newUser.address.country.toLowerCase().includes('switzer') ? 'CH' : 'DE';
      iban = `${countryCode}89FATL3704${fullAccNum.slice(-10)}`;
      swiftBic = countryCode === 'DE' ? 'FATLDEFF' : 'FATLEU22';
    } else if (region === 'UK') {
      sortCode = '40-12-88';
      iban = `GB29FATL401288${fullAccNum.slice(-8)}`;
      swiftBic = 'FATLGB22LON';
    } else {
      routingNumber = '021000089';
      swiftBic = 'FATLUS33NYC';
    }

    const accountName = accountType === 'CHECKING_PREMIER' ? 'Premier Private Client Checking' :
                        accountType === 'SAVINGS_HIGH_YIELD' ? 'High-Yield Apex Reserve' :
                        accountType === 'MULTI_CURRENCY_GLOBAL' ? 'Global Multi-Currency Reserve' : 'Corporate Treasury Operating Account';

    const newAccount: BankAccount = {
      id: accId,
      userId: newUser.id,
      accountNumber: maskedAccNum,
      accountNumberFull: fullAccNum,
      routingNumber,
      sortCode,
      iban,
      swiftBic,
      name: accountName,
      type: accountType,
      currency,
      balanceMinor: initialDepositMinor,
      availableBalanceMinor: initialDepositMinor,
      pendingHoldMinor: 0,
      interestRateAPY: accountType === 'SAVINGS_HIGH_YIELD' ? 5.15 : 1.25,
      status: 'ACTIVE',
      region,
      openedDate: new Date().toISOString().slice(0, 10),
      dailyTransferLimitMinor: 50000000,
      statementCycleDay: 28,
      customerName: `${newUser.firstName} ${newUser.lastName}`,
      customerEmail: newUser.email,
      customerPhone: newUser.phone
    };

    this.accounts.set(newAccount.id, newAccount);

    // 3. Issue Debit Card if requested
    let newCard: BankCard | undefined;
    if (data.issueDebitCard !== false) {
      const cardId = `crd_${newUser.id}_01`;
      const cardNum = `4111 ${Math.floor(1000 + Math.random() * 9000)} ${Math.floor(1000 + Math.random() * 9000)} ${fullAccNum.slice(-4)}`;
      newCard = {
        id: cardId,
        accountId: newAccount.id,
        userId: newUser.id,
        cardNumberMasked: `•••• •••• •••• ${fullAccNum.slice(-4)}`,
        cardNumberFull: cardNum,
        cardHolderName: `${newUser.firstName.toUpperCase()} ${newUser.lastName.toUpperCase()}`,
        expiryMonth: 12,
        expiryYear: 2031,
        cvv: `${Math.floor(100 + Math.random() * 900)}`,
        cardType: 'DEBIT_VISA_SIGNATURE',
        status: 'ACTIVE',
        isVirtual: false,
        contactlessEnabled: true,
        onlineTransactionsEnabled: true,
        internationalSpendEnabled: true,
        dailyAtmLimitMinor: 500000,
        dailySpendLimitMinor: 2500000,
        travelNotices: []
      };
      this.cards.set(newCard.id, newCard);
    }

    // 4. Initial Funding Ledger & Double-Entry Journal
    if (initialDepositMinor > 0) {
      const glCashAcc = currency === 'EUR' ? 'GL_1001_FED_RESERVE_CASH' :
                        currency === 'GBP' ? 'GL_1002_BOE_SETTLEMENT_CASH' : 'GL_1001_FED_RESERVE_CASH';

      try {
        doubleEntryLedger.commitJournalTransaction({
          referenceNumber: `DEP-ADM-${Date.now().toString().slice(-6)}`,
          transactionType: 'INBOUND_WIRE',
          description: `Admin Initial Deposit Allocation — ${newUser.firstName} ${newUser.lastName}`,
          lines: [
            {
              id: `jl_dep_adm_1_${Date.now()}`,
              accountId: glCashAcc,
              accountType: 'GL_ASSET',
              accountName: 'Central Bank Reserve Settlement Asset',
              direction: 'DEBIT',
              amountMinor: initialDepositMinor,
              currency,
              description: 'Executive Inbound Opening Deposit Settlement'
            },
            {
              id: `jl_dep_adm_2_${Date.now()}`,
              accountId: newAccount.id,
              accountType: 'CUSTOMER_DEPOSIT',
              accountName: `${newAccount.name} (${newAccount.accountNumber})`,
              direction: 'CREDIT',
              amountMinor: initialDepositMinor,
              currency,
              description: 'Initial Opening Deposit'
            }
          ]
        });

        this.ledger.unshift({
          id: `led_init_${Date.now()}`,
          transactionId: `tx_init_${Date.now()}`,
          accountId: newAccount.id,
          direction: 'CREDIT',
          amountMinor: initialDepositMinor,
          currency,
          balanceAfterMinor: newAccount.balanceMinor,
          description: 'Initial Account Opening Deposit (Executive Clearance)',
          category: 'Deposits',
          counterparty: 'First Atlantic Bank Treasury Direct',
          status: 'SETTLED',
          channel: 'ADMIN_PORTAL',
          referenceNumber: `DEP-ADM-${Date.now().toString().slice(-6)}`,
          createdTimestamp: new Date().toISOString(),
          effectiveTimestamp: new Date().toISOString(),
          settledTimestamp: new Date().toISOString()
        });
      } catch (err) {
        console.error('Error recording initial deposit journal:', err);
      }
    }

    // 5. Create linked Account Application record for full onboarding traceability
    const appId = `app_${Date.now()}_${Math.floor(100 + Math.random() * 900)}`;
    const appRef = `FAB-${region}-${new Date().getFullYear()}-${Math.floor(10000 + Math.random() * 90000)}`;

    const newApp: AccountApplication = {
      id: appId,
      referenceNumber: appRef,
      firstName: newUser.firstName,
      lastName: newUser.lastName,
      email: newUser.email,
      phone: newUser.phone,
      dialCode: newUser.dialCode,
      dateOfBirth: newUser.dateOfBirth,
      nationality: newUser.nationality || 'United States',
      taxIdOrSsn: data.ssnOrTaxId || (region === 'US' ? '987-65-4321' : 'GB-123456'),
      idDocumentType: 'PASSPORT',
      idDocumentNumber: newUser.passportNumber || 'PASSPORT_VERIFIED',
      passportPhoto: newUser.passportPhoto,
      address: {
        line1: newUser.address.line1,
        line2: newUser.address.line2,
        city: newUser.address.city,
        stateOrProvince: newUser.address.stateOrCounty,
        postalCode: newUser.address.postalCode,
        country: newUser.address.country
      },
      employmentStatus: data.employmentStatus || 'EXECUTIVE',
      employerOrBusinessName: data.employerOrBusinessName || 'Private Wealth Holding',
      sourceOfWealth: data.sourceOfWealth || 'INVESTMENTS',
      annualIncomeRange: data.annualIncomeRange || '$250,000+',
      isPep: false,
      requestedCurrency: currency,
      requestedAccountType: accountType,
      requestedRegion: region,
      initialDepositAmountMinor: initialDepositMinor,
      requestDebitCard: data.issueDebitCard !== false,
      username: newUser.username,
      passwordHashed: data.password || 'AtlanticSecure2026!',
      loginPin: newUser.loginPin,
      mfaPreference: 'AUTHENTICATOR',
      status: (data.approvalStatus === 'PENDING' ? 'PENDING_COMPLIANCE_REVIEW' : 'APPROVED') as any,
      riskScore: 8,
      submittedAt: new Date().toISOString(),
      reviewedAt: new Date().toISOString(),
      reviewedByAdminId: admin.id,
      reviewedByAdminName: admin.name,
      complianceNotes: `Directly onboarded and provisioned by Administrator ${admin.name}. Verified KYC and account clearance.`,
      createdUserId: newUser.id,
      provisionedIban: iban,
      provisionedSortCode: sortCode,
      provisionedRoutingNumber: routingNumber,
      provisionedAccountNumber: fullAccNum
    };

    this.applications.set(newApp.id, newApp);

    // 6. Audit Log
    this.addAuditLog({
      actorId: admin.id,
      actorEmail: admin.email,
      actorRole: admin.role,
      action: 'ADMIN_CUSTOMER_CREATED',
      targetType: 'USER',
      targetId: newUser.id,
      ipAddress: '199.16.156.12',
      userAgent: 'First Atlantic Master Admin Suite v4.9',
      details: `Administrator ${admin.name} created new customer account for ${newUser.firstName} ${newUser.lastName} (${newUser.email}). Provisioned ${accountType} (${newAccount.accountNumber}, ${currency}) with initial balance ${this.formatMinor(initialDepositMinor, currency)}.`
    });

    // Dispatch automated notification alert
    try {
      adminNotificationService.triggerCustomerAccountUpdateAlert({
        id: newUser.id,
        firstName: newUser.firstName,
        lastName: newUser.lastName,
        email: newUser.email,
        phone: newUser.phone
      }, `New Private Client profile created by Executive Administrator ${admin.name}. Online banking credentials and international accounts active.`);
    } catch (e) {
      console.warn('Customer creation alert dispatch warning:', e);
    }

    this.saveToDiskSync();

    return {
      success: true,
      user: newUser,
      account: newAccount,
      card: newCard,
      application: newApp
    };
  }

  /**
   * Update an existing account application dossier by Administrator
   */
  updateAccountApplicationDetails(
    admin: AdminUser,
    applicationId: string,
    updates: Partial<AccountApplication> & { syncToUserProfile?: boolean }
  ): { success: boolean; application?: AccountApplication; user?: UserProfile; error?: string } {
    const app = this.applications.get(applicationId);
    if (!app) return { success: false, error: 'Application record not found.' };

    const oldCopy = { ...app };

    // Update fields
    if (updates.firstName !== undefined) app.firstName = updates.firstName.trim();
    if (updates.lastName !== undefined) app.lastName = updates.lastName.trim();
    if (updates.email !== undefined) app.email = updates.email.trim().toLowerCase();
    if (updates.phone !== undefined) app.phone = updates.phone.trim();
    if (updates.dialCode !== undefined) app.dialCode = updates.dialCode.trim();
    if (updates.dateOfBirth !== undefined) app.dateOfBirth = updates.dateOfBirth;
    if (updates.nationality !== undefined) app.nationality = updates.nationality.trim();
    if (updates.taxIdOrSsn !== undefined) app.taxIdOrSsn = updates.taxIdOrSsn.trim();
    if (updates.idDocumentType !== undefined) app.idDocumentType = updates.idDocumentType;
    if (updates.idDocumentNumber !== undefined) app.idDocumentNumber = updates.idDocumentNumber.trim();
    if (updates.passportPhoto !== undefined) app.passportPhoto = updates.passportPhoto;
    if (updates.loginPin !== undefined) app.loginPin = updates.loginPin.trim();

    if (updates.address) {
      app.address = {
        ...app.address,
        ...updates.address
      };
    }

    if (updates.employmentStatus !== undefined) app.employmentStatus = updates.employmentStatus;
    if (updates.employerOrBusinessName !== undefined) app.employerOrBusinessName = updates.employerOrBusinessName.trim();
    if (updates.sourceOfWealth !== undefined) app.sourceOfWealth = updates.sourceOfWealth;
    if (updates.annualIncomeRange !== undefined) app.annualIncomeRange = updates.annualIncomeRange;
    if (updates.isPep !== undefined) app.isPep = updates.isPep;

    if (updates.requestedCurrency !== undefined) app.requestedCurrency = updates.requestedCurrency;
    if (updates.requestedAccountType !== undefined) app.requestedAccountType = updates.requestedAccountType;
    if (updates.requestedRegion !== undefined) app.requestedRegion = updates.requestedRegion;
    if (updates.initialDepositAmountMinor !== undefined) app.initialDepositAmountMinor = Number(updates.initialDepositAmountMinor);
    if (updates.requestDebitCard !== undefined) app.requestDebitCard = updates.requestDebitCard;

    if (updates.status !== undefined) app.status = updates.status;
    if (updates.riskScore !== undefined) app.riskScore = Number(updates.riskScore);
    if (updates.complianceNotes !== undefined) app.complianceNotes = updates.complianceNotes;
    if (updates.rejectionReason !== undefined) app.rejectionReason = updates.rejectionReason;

    // Optional sync to active linked User Profile
    let updatedUser: UserProfile | undefined;
    const targetUserId = app.createdUserId || Array.from(this.users.values()).find(
      u => u.email.toLowerCase() === app.email.toLowerCase() || u.username.toLowerCase() === app.username.toLowerCase()
    )?.id;

    if (targetUserId && (updates.syncToUserProfile !== false)) {
      const user = this.users.get(targetUserId);
      if (user) {
        if (app.firstName) user.firstName = app.firstName;
        if (app.lastName) user.lastName = app.lastName;
        if (app.email) user.email = app.email;
        if (app.phone) user.phone = app.phone;
        if (app.dialCode) user.dialCode = app.dialCode;
        if (app.dateOfBirth) user.dateOfBirth = app.dateOfBirth;
        if (app.nationality) user.nationality = app.nationality;
        if (app.idDocumentNumber) user.passportNumber = app.idDocumentNumber;
        if (app.passportPhoto) user.passportPhoto = app.passportPhoto;
        if (app.loginPin) user.loginPin = app.loginPin;
        if (app.address) {
          user.address = {
            line1: app.address.line1,
            line2: app.address.line2,
            city: app.address.city,
            stateOrCounty: app.address.stateOrProvince,
            postalCode: app.address.postalCode,
            country: app.address.country
          };
        }
        updatedUser = user;
      }
    }

    this.addAuditLog({
      actorId: admin.id,
      actorEmail: admin.email,
      actorRole: admin.role,
      action: 'ADMIN_ACCOUNT_APPLICATION_UPDATED',
      targetType: 'USER',
      targetId: app.id,
      ipAddress: '199.16.156.12',
      userAgent: 'First Atlantic Master Admin Suite v4.9',
      details: `Administrator ${admin.name} modified application dossier details for ${app.firstName} ${app.lastName} (Ref: ${app.referenceNumber}). Synchronized to user: ${Boolean(updatedUser)}.`,
      previousState: oldCopy,
      newState: app
    });

    this.saveToDisk();

    return { success: true, application: app, user: updatedUser };
  }

  /**
   * Update User Profile details by Admin
   */
  updateUserProfile(admin: AdminUser, userId: string, updates: Partial<UserProfile> & any): { success: boolean; user?: UserProfile; error?: string } {
    const user = this.users.get(userId);
    if (!user) return { success: false, error: 'User not found.' };

    const oldCopy = { ...user };

    if (updates.firstName !== undefined) user.firstName = updates.firstName.trim();
    if (updates.lastName !== undefined) user.lastName = updates.lastName.trim();
    if (updates.email !== undefined) user.email = updates.email.trim().toLowerCase();
    if (updates.username !== undefined) user.username = updates.username.trim().toLowerCase();
    if (updates.phone !== undefined) user.phone = updates.phone.trim();
    if (updates.dialCode !== undefined) user.dialCode = updates.dialCode.trim();
    if (updates.dateOfBirth !== undefined) user.dateOfBirth = updates.dateOfBirth;
    if (updates.nationality !== undefined) user.nationality = updates.nationality.trim();
    if (updates.passportNumber !== undefined) user.passportNumber = updates.passportNumber.trim();
    if (updates.passportPhoto !== undefined) user.passportPhoto = updates.passportPhoto;
    if (updates.loginPin !== undefined) user.loginPin = updates.loginPin.trim();
    if (updates.region !== undefined) user.region = updates.region;
    if (updates.kycTier !== undefined) user.kycTier = updates.kycTier;
    if (updates.securityScore !== undefined) user.securityScore = Number(updates.securityScore);
    if (updates.approval_status !== undefined) user.approval_status = updates.approval_status;

    if (updates.address) {
      if (typeof updates.address === 'string') {
        const parts = updates.address.split(',').map((s: string) => s.trim());
        user.address = {
          line1: parts[0] || user.address.line1,
          city: parts[1] || user.address.city,
          stateOrCounty: parts[2] || user.address.stateOrCounty,
          country: parts[3] || user.address.country,
          postalCode: user.address.postalCode
        };
      } else {
        user.address = {
          ...user.address,
          ...updates.address
        };
      }
    }

    if (updates.unmaskedSSN || updates.taxId) {
      const val = (updates.unmaskedSSN || updates.taxId).trim();
      if (user.region === 'US') {
        user.ssnMasked = `•••-••-${val.slice(-4)}`;
      } else if (user.region === 'UK') {
        user.nationalInsuranceMasked = val;
      }
    }

    if (updates.password) {
      this.userPasswords.set(user.id, updates.password);
    }

    // Cascade approval status changes if updated
    if (updates.approval_status) {
      const userAccounts = Array.from(this.accounts.values()).filter(a => a.userId === userId);
      userAccounts.forEach(acc => {
        if (updates.approval_status === 'SUSPENDED' || updates.approval_status === 'REJECTED') {
          acc.status = 'RESTRICTED';
        } else if (updates.approval_status === 'APPROVED') {
          acc.status = 'ACTIVE';
        }
      });
    }

    this.addAuditLog({
      actorId: admin.id,
      actorEmail: admin.email,
      actorRole: admin.role,
      action: 'ADMIN_USER_PROFILE_UPDATED',
      targetType: 'USER',
      targetId: user.id,
      ipAddress: '199.16.156.12',
      userAgent: 'First Atlantic Executive Suite v4.9',
      details: `Administrator ${admin.name} updated profile & onboarding details for ${user.firstName} ${user.lastName} (${user.email}).`,
      previousState: oldCopy,
      newState: user
    });

    this.saveToDisk();

    return { success: true, user };
  }
}

export const db = new BankDatabase();



