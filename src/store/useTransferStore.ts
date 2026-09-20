import { create } from 'zustand';
import axios from 'axios';
import { BankOption, EMBEDDED_BANKS } from '../data/banks';

export interface Beneficiary {
  id: string;
  user_id?: string;
  name: string;
  account: string;
  bank: string;
  avatar_url?: string;
  created_at?: string;
}

export interface TransferAccount {
  id: string;
  name: string;
  accountNumber: string;
  last4: string;
  balance: number;
  currency: string;
  type: string;
}

export interface CompletedTransaction {
  id: string;
  recipient: string;
  recipientAccount?: string;
  recipientBank?: string;
  recipientRouting?: string;
  recipientSwift?: string;
  recipientCountry?: string;
  senderName?: string;
  senderAccount?: string;
  amount: number;
  fee: string;
  total: number;
  currency: string;
  from: string;
  date: string;
  reference: string;
  estimatedDelivery: string;
  cotCode?: string;
  imfCode?: string;
  taxCode?: string;
  amlCode?: string;
  status: 'Completed';
  timestamp: string;
}

export interface TransferState {
  // Transfer Form Inputs
  amount: number;
  amountInput: string;
  availableBalance: number;
  
  // Sender (User) details
  senderName: string;
  senderAccountDisplay: string;
  
  // Beneficiary details (Account details and Name)
  beneficiaryName: string;
  beneficiaryAccount: string;
  beneficiaryBank: string;
  beneficiaryRouting: string;
  beneficiarySwift: string;
  beneficiaryCountry: string;
  beneficiaryAvatarUrl: string;
  selectedBeneficiaryId: string | null;
  
  // Regulatory & Security Clearance Codes before sending money
  cotCode: string;   // Cost of Transfer Code
  imfCode: string;   // International Monetary Fund Code
  taxCode: string;   // Tax Clearance Code (TCC)
  amlCode: string;   // Anti-Money Laundering Clearance Code
  codesValidated: boolean;
  
  // Saved beneficiaries list
  beneficiaries: Beneficiary[];
  isLoadingBeneficiaries: boolean;
  
  // Embedded banks selection
  selectedBank: BankOption | null;
  
  // Source account
  selectedAccountId: string;
  selectedAccount: TransferAccount | null;
  accounts: TransferAccount[];
  
  // Reference / Note & PIN
  reference: string;
  pin: string[];

  // Processing & Receipt States
  isProcessing: boolean;
  error: string | null;
  completedTransaction: CompletedTransaction | null;

  // Actions
  setAmount: (amount: number, inputStr?: string) => void;
  setSenderName: (name: string) => void;
  setBeneficiary: (beneficiary: {
    name: string;
    account: string;
    bank?: string;
    routing?: string;
    swift?: string;
    country?: string;
    avatar_url?: string;
    id?: string;
  }) => void;
  setClearanceCodes: (codes: {
    cotCode?: string;
    imfCode?: string;
    taxCode?: string;
    amlCode?: string;
  }) => void;
  autoFillDemoCodes: () => void;
  setSelectedBank: (bank: BankOption | null) => void;
  setSelectedAccountId: (accountId: string) => void;
  setReference: (reference: string) => void;
  setPinDigit: (index: number, digit: string) => void;
  setFullPin: (pin: string[]) => void;
  clearPin: () => void;
  fetchBeneficiaries: () => Promise<void>;
  addBeneficiary: (beneficiaryData: { name: string; account: string; bank: string; avatar_url?: string }) => Promise<Beneficiary | null>;
  fetchAccountsAndBalance: () => Promise<void>;
  executeTransfer: () => Promise<{ success: boolean; error?: string; transaction?: CompletedTransaction }>;
  resetTransfer: () => void;
}

const DEFAULT_ACCOUNTS: TransferAccount[] = [];

const INITIAL_BENEFICIARIES: Beneficiary[] = [];

export const useTransferStore = create<TransferState>((set, get) => ({
  amount: 0,
  amountInput: '',
  availableBalance: 0.00,

  // User / Sender Details
  senderName: '',
  senderAccountDisplay: 'Primary Account',

  // Beneficiary Details
  beneficiaryName: '',
  beneficiaryAccount: '',
  beneficiaryBank: '',
  beneficiaryRouting: '',
  beneficiarySwift: '',
  beneficiaryCountry: '',
  beneficiaryAvatarUrl: '',
  selectedBeneficiaryId: null,

  // Regulatory & Security Clearance Codes
  cotCode: 'COT-7849',
  imfCode: 'IMF-9921',
  taxCode: 'TAX-8842',
  amlCode: 'AML-1094',
  codesValidated: true,

  beneficiaries: INITIAL_BENEFICIARIES,
  isLoadingBeneficiaries: false,
  selectedBank: EMBEDDED_BANKS[0],
  selectedAccountId: null,
  selectedAccount: null,
  accounts: [],
  reference: 'Personal Transfer & Settlement',
  pin: ['', '', '', '', '', ''],
  isProcessing: false,
  error: null,
  completedTransaction: null,

  setAmount: (amount: number, inputStr?: string) => {
    set({
      amount: Math.max(0, amount),
      amountInput: inputStr !== undefined ? inputStr : amount > 0 ? amount.toFixed(2) : '',
      error: null
    });
  },

  setSenderName: (name: string) => {
    set({ senderName: name });
  },

  setBeneficiary: (beneficiary) => {
    set({
      beneficiaryName: beneficiary.name,
      beneficiaryAccount: beneficiary.account,
      beneficiaryBank: beneficiary.bank || get().beneficiaryBank || 'Destination Bank',
      beneficiaryRouting: beneficiary.routing || get().beneficiaryRouting || '021000021',
      beneficiarySwift: beneficiary.swift || get().beneficiarySwift || 'SWIFT-REGISTERED',
      beneficiaryCountry: beneficiary.country || get().beneficiaryCountry || 'United States',
      beneficiaryAvatarUrl: beneficiary.avatar_url || '',
      selectedBeneficiaryId: beneficiary.id || null,
      error: null
    });
  },

  setClearanceCodes: (codes) => {
    set(prev => ({
      cotCode: codes.cotCode !== undefined ? codes.cotCode : prev.cotCode,
      imfCode: codes.imfCode !== undefined ? codes.imfCode : prev.imfCode,
      taxCode: codes.taxCode !== undefined ? codes.taxCode : prev.taxCode,
      amlCode: codes.amlCode !== undefined ? codes.amlCode : prev.amlCode,
      codesValidated: true,
      error: null
    }));
  },

  autoFillDemoCodes: () => {
    set({
      cotCode: 'COT-7849',
      imfCode: 'IMF-9921',
      taxCode: 'TAX-8842',
      amlCode: 'AML-1094',
      codesValidated: true,
      error: null
    });
  },

  setSelectedBank: (bank) => {
    set({
      selectedBank: bank,
      beneficiaryBank: bank ? bank.name : get().beneficiaryBank,
      beneficiarySwift: bank ? (bank.code || bank.swiftBic || 'SWIFT-REG') : get().beneficiarySwift,
      beneficiaryCountry: bank ? bank.country : get().beneficiaryCountry
    });
  },

  setSelectedAccountId: (accountId: string) => {
    const acc = get().accounts.find(a => a.id === accountId) || get().accounts[0] || null;
    set({
      selectedAccountId: accountId,
      selectedAccount: acc,
      availableBalance: acc ? acc.balance : get().availableBalance
    });
  },

  setReference: (reference: string) => {
    set({ reference, error: null });
  },

  setPinDigit: (index: number, digit: string) => {
    const newPin = [...get().pin];
    newPin[index] = digit ? digit.slice(-1) : '';
    set({ pin: newPin, error: null });
  },

  setFullPin: (pin: string[]) => {
    set({ pin: pin.slice(0, 6), error: null });
  },

  clearPin: () => {
    set({ pin: ['', '', '', '', '', ''], error: null });
  },

  fetchBeneficiaries: async () => {
    set({ isLoadingBeneficiaries: true });
    try {
      const token = localStorage.getItem('fab_session_token') || localStorage.getItem('token') || '';
      const headers: Record<string, string> = {};
      if (token) headers['Authorization'] = `Bearer ${token}`;

      const res = await axios.get('/api/beneficiaries', { headers });
      if (res.data?.beneficiaries && Array.isArray(res.data.beneficiaries)) {
        if (res.data.beneficiaries.length > 0) {
          set({ beneficiaries: res.data.beneficiaries });
        }
      }
    } catch (err) {
      console.warn('Notice fetching beneficiaries from API:', err);
    } finally {
      set({ isLoadingBeneficiaries: false });
    }
  },

  addBeneficiary: async (data) => {
    try {
      const token = localStorage.getItem('fab_session_token') || localStorage.getItem('token') || '';
      const headers: Record<string, string> = {};
      if (token) headers['Authorization'] = `Bearer ${token}`;

      const res = await axios.post('/api/beneficiaries', data, { headers });
      if (res.data?.success && res.data?.beneficiary) {
        const newBen = res.data.beneficiary;
        set(prev => ({
          beneficiaries: [newBen, ...prev.beneficiaries.filter(b => b.id !== newBen.id)],
          beneficiaryName: newBen.name,
          beneficiaryAccount: newBen.account,
          beneficiaryBank: newBen.bank,
          beneficiaryAvatarUrl: newBen.avatar_url || '',
          selectedBeneficiaryId: newBen.id
        }));
        return newBen;
      }
    } catch (err) {
      console.warn('Notice saving beneficiary to API:', err);
      // Fallback local persistence
      const localBen: Beneficiary = {
        id: `ben_${Date.now()}`,
        name: data.name,
        account: data.account,
        bank: data.bank,
        avatar_url: data.avatar_url || `https://ui-avatars.com/api/?name=${encodeURIComponent(data.name)}&background=1e293b&color=fff`
      };
      set(prev => ({
        beneficiaries: [localBen, ...prev.beneficiaries],
        beneficiaryName: localBen.name,
        beneficiaryAccount: localBen.account,
        beneficiaryBank: localBen.bank,
        beneficiaryAvatarUrl: localBen.avatar_url || '',
        selectedBeneficiaryId: localBen.id
      }));
      return localBen;
    }
    return null;
  },

  fetchAccountsAndBalance: async () => {
    try {
      const token = localStorage.getItem('fab_session_token') || localStorage.getItem('token') || '';
      const headers: Record<string, string> = {};
      if (token) headers['Authorization'] = `Bearer ${token}`;

      const res = await axios.get('/api/user/me', { headers });
      if (res.data?.success) {
        const liveBal = typeof res.data.balance === 'number'
          ? res.data.balance
          : (typeof res.data.user?.balance === 'number' ? res.data.user.balance : 0.00);

        const currentAcc = res.data.account;
        const acctNum = currentAcc?.accountNumber || currentAcc?.account_number || '••••8821';
        const last4 = acctNum.slice(-4) || '8821';
        const accName = currentAcc?.name || currentAcc?.account_type || 'Primary Checking';

        const updatedAccounts: TransferAccount[] = currentAcc ? [
          {
            id: currentAcc?.id || 'acc_primary',
            name: accName,
            accountNumber: acctNum,
            last4: last4,
            balance: liveBal,
            currency: currentAcc?.currency || 'USD',
            type: currentAcc?.type || currentAcc?.account_type || 'Checking'
          }
        ] : [];

        const selected = updatedAccounts[0] || null;
        const u = res.data.user;
        const sender = u ? (u.fullName || (u.firstName ? `${u.firstName} ${u.lastName}` : (u.name || 'Account Holder'))) : 'Account Holder';

        set({
          accounts: updatedAccounts,
          selectedAccountId: selected ? selected.id : null,
          selectedAccount: selected,
          availableBalance: liveBal,
          senderName: sender,
          senderAccountDisplay: selected ? `${selected.name} ••••${selected.last4}` : 'Primary Account'
        });
      }
    } catch (err) {
      console.warn('Notice fetching accounts in useTransferStore:', err);
    }
  },

  executeTransfer: async () => {
    const state = get();
    set({ isProcessing: true, error: null });

    try {
      const token = localStorage.getItem('fab_session_token') || localStorage.getItem('token') || '';
      const headers: Record<string, string> = {};
      if (token) headers['Authorization'] = `Bearer ${token}`;

      const senderAccountStr = state.selectedAccount
        ? `${state.selectedAccount.name} ••••${state.selectedAccount.last4}`
        : 'Checking ••••8821';

      const payload = {
        amount: state.amount,
        beneficiary_name: state.beneficiaryName,
        beneficiary_account: state.beneficiaryAccount,
        bankName: state.beneficiaryBank,
        to_bank: state.beneficiaryBank,
        routing: state.beneficiaryRouting,
        swift: state.beneficiarySwift,
        country: state.beneficiaryCountry,
        senderName: state.senderName || 'Account Holder',
        sourceAccountId: state.selectedAccountId,
        reference: state.reference || 'Personal Transfer',
        notes: state.reference || 'Personal Transfer',
        cotCode: state.cotCode,
        imfCode: state.imfCode,
        taxCode: state.taxCode,
        amlCode: state.amlCode,
        pin: state.pin.join('') || '123456'
      };

      const res = await axios.post('/api/transfer', payload, { headers });

      if (res.data?.success) {
        const now = new Date();
        const dateFormatted = now.toLocaleDateString('en-US', {
          day: 'numeric',
          month: 'short',
          year: 'numeric'
        }) + ', ' + now.toLocaleTimeString('en-US', {
          hour: 'numeric',
          minute: '2-digit',
          hour12: true
        });

        const txId = res.data.transaction?.id || `TX-${Math.random().toString(36).substring(2, 9).toUpperCase()}`;

        const completedTx: CompletedTransaction = {
          id: txId,
          recipient: state.beneficiaryName,
          recipientAccount: state.beneficiaryAccount,
          recipientBank: state.beneficiaryBank,
          recipientRouting: state.beneficiaryRouting,
          recipientSwift: state.beneficiarySwift,
          recipientCountry: state.beneficiaryCountry,
          senderName: state.senderName || 'Account Holder',
          senderAccount: senderAccountStr,
          amount: state.amount,
          fee: '$0.00',
          total: state.amount,
          currency: 'USD',
          from: senderAccountStr,
          date: dateFormatted,
          reference: state.reference || txId,
          estimatedDelivery: 'Delivered',
          cotCode: state.cotCode,
          imfCode: state.imfCode,
          taxCode: state.taxCode,
          amlCode: state.amlCode,
          status: 'Completed',
          timestamp: now.toISOString()
        };

        const newBalance = typeof res.data.newBalance === 'number'
          ? res.data.newBalance
          : Math.max(0, state.availableBalance - state.amount);

        set(prev => ({
          isProcessing: false,
          completedTransaction: completedTx,
          availableBalance: newBalance,
          accounts: prev.accounts.map(a =>
            a.id === state.selectedAccountId ? { ...a, balance: newBalance } : a
          )
        }));

        return { success: true, transaction: completedTx };
      } else {
        const errMsg = res.data?.error || 'Transfer failed. Please check details and retry.';
        set({ isProcessing: false, error: errMsg });
        return { success: false, error: errMsg };
      }
    } catch (err: any) {
      const errMsg = err.response?.data?.error || err.message || 'Transfer failed. Please check connection.';
      set({ isProcessing: false, error: errMsg });
      return { success: false, error: errMsg };
    }
  },

  resetTransfer: () => {
    const accounts = get().accounts;
    const defaultAcc = accounts[0] || null;
    set({
      amount: 0,
      amountInput: '',
      beneficiaryName: '',
      beneficiaryAccount: '',
      beneficiaryBank: '',
      beneficiaryRouting: '',
      beneficiarySwift: '',
      beneficiaryCountry: '',
      beneficiaryAvatarUrl: '',
      selectedBeneficiaryId: null,
      cotCode: '',
      imfCode: '',
      taxCode: '',
      amlCode: '',
      codesValidated: true,
      selectedAccountId: defaultAcc ? defaultAcc.id : null,
      selectedAccount: defaultAcc,
      availableBalance: defaultAcc ? defaultAcc.balance : 0.00,
      reference: 'Personal Transfer & Settlement',
      pin: ['', '', '', '', '', ''],
      isProcessing: false,
      error: null,
      completedTransaction: null
    });
  }
}));
