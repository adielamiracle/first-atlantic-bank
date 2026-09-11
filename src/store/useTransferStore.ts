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
  amount: number;
  fee: string;
  total: number;
  currency: string;
  from: string;
  date: string;
  reference: string;
  estimatedDelivery: string;
  status: 'Completed';
  timestamp: string;
}

export interface TransferState {
  // Transfer Form Inputs
  amount: number;
  amountInput: string;
  availableBalance: number;
  
  // Beneficiary details
  beneficiaryName: string;
  beneficiaryAccount: string;
  beneficiaryBank: string;
  beneficiaryAvatarUrl: string;
  selectedBeneficiaryId: string | null;
  
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
  setBeneficiary: (beneficiary: { name: string; account: string; bank?: string; avatar_url?: string; id?: string }) => void;
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

const DEFAULT_ACCOUNTS: TransferAccount[] = [
  {
    id: 'acc_checking_01',
    name: 'Everyday Checking',
    accountNumber: '1092830397',
    last4: '0397',
    balance: 53030.00,
    currency: 'USD',
    type: 'Checking'
  },
  {
    id: 'acc_savings_02',
    name: 'Savings Account',
    accountNumber: '1092837461',
    last4: '7461',
    balance: 51574.00,
    currency: 'USD',
    type: 'Savings'
  }
];

const INITIAL_BENEFICIARIES: Beneficiary[] = [
  {
    id: 'ben_1',
    name: 'Johnny Mike',
    account: '4829104829',
    bank: 'Chase Bank',
    avatar_url: 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=150&auto=format&fit=crop&q=80'
  },
  {
    id: 'ben_2',
    name: 'Sarah Connor',
    account: '1092837461',
    bank: 'Bank of America',
    avatar_url: 'https://images.unsplash.com/photo-1494790108377-be9c29b29330?w=150&auto=format&fit=crop&q=80'
  },
  {
    id: 'ben_3',
    name: 'David Miller',
    account: '83920194',
    bank: 'Barclays Bank UK',
    avatar_url: 'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=150&auto=format&fit=crop&q=80'
  }
];

export const useTransferStore = create<TransferState>((set, get) => ({
  amount: 500,
  amountInput: '500.00',
  availableBalance: 53030.00,
  beneficiaryName: 'Johnny Mike',
  beneficiaryAccount: '4829104829',
  beneficiaryBank: 'Chase Bank',
  beneficiaryAvatarUrl: 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=150&auto=format&fit=crop&q=80',
  selectedBeneficiaryId: 'ben_1',
  beneficiaries: INITIAL_BENEFICIARIES,
  isLoadingBeneficiaries: false,
  selectedBank: EMBEDDED_BANKS[0],
  selectedAccountId: 'acc_checking_01',
  selectedAccount: DEFAULT_ACCOUNTS[0],
  accounts: DEFAULT_ACCOUNTS,
  reference: '',
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

  setBeneficiary: (beneficiary) => {
    set({
      beneficiaryName: beneficiary.name,
      beneficiaryAccount: beneficiary.account,
      beneficiaryBank: beneficiary.bank || get().beneficiaryBank || 'Destination Bank',
      beneficiaryAvatarUrl: beneficiary.avatar_url || '',
      selectedBeneficiaryId: beneficiary.id || null,
      error: null
    });
  },

  setSelectedBank: (bank) => {
    set({
      selectedBank: bank,
      beneficiaryBank: bank ? bank.name : get().beneficiaryBank
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
          : (typeof res.data.user?.balance === 'number' ? res.data.user.balance : 53030.00);

        const currentAcc = res.data.account;
        const acctNum = currentAcc?.account_number || '1092837461';
        const last4 = acctNum.slice(-4) || '7461';

        const updatedAccounts: TransferAccount[] = [
          {
            id: currentAcc?.id || 'acc_checking_01',
            name: currentAcc?.account_type ? `${currentAcc.account_type}` : 'Everyday Checking',
            accountNumber: acctNum,
            last4: last4,
            balance: liveBal,
            currency: currentAcc?.currency || 'USD',
            type: currentAcc?.account_type || 'Checking'
          },
          {
            id: 'acc_savings_02',
            name: 'Savings',
            accountNumber: '1092837461',
            last4: '7461',
            balance: 51574.00,
            currency: 'USD',
            type: 'Savings'
          }
        ];

        const selected = updatedAccounts[0];
        set({
          accounts: updatedAccounts,
          selectedAccountId: selected.id,
          selectedAccount: selected,
          availableBalance: liveBal
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
        : 'Savings ••••7461';

      const payload = {
        amount: state.amount,
        beneficiary_name: state.beneficiaryName || 'Johnny Mike',
        beneficiary_account: state.beneficiaryAccount || '4829104829',
        bankName: state.beneficiaryBank || 'Chase Bank',
        to_bank: state.beneficiaryBank || 'Chase Bank',
        sourceAccountId: state.selectedAccountId,
        reference: state.reference || 'Personal Transfer',
        notes: state.reference || 'Personal Transfer',
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
          recipient: state.beneficiaryName || 'Johnny Mike',
          recipientAccount: state.beneficiaryAccount || '4829104829',
          recipientBank: state.beneficiaryBank || 'Chase Bank',
          amount: state.amount,
          fee: '$0.00',
          total: state.amount,
          currency: 'USD',
          from: senderAccountStr,
          date: dateFormatted,
          reference: state.reference || txId,
          estimatedDelivery: 'Delivered',
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
    const defaultAcc = accounts[0] || DEFAULT_ACCOUNTS[0];
    set({
      amount: 500,
      amountInput: '500.00',
      beneficiaryName: 'Johnny Mike',
      beneficiaryAccount: '4829104829',
      beneficiaryBank: 'Chase Bank',
      beneficiaryAvatarUrl: 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=150&auto=format&fit=crop&q=80',
      selectedBeneficiaryId: 'ben_1',
      selectedAccountId: defaultAcc.id,
      selectedAccount: defaultAcc,
      availableBalance: defaultAcc.balance,
      reference: '',
      pin: ['', '', '', '', '', ''],
      isProcessing: false,
      error: null,
      completedTransaction: null
    });
  }
}));
