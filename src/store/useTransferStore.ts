import { create } from 'zustand';
import axios from 'axios';

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
  beneficiaryName: string;
  beneficiaryAccount: string;
  selectedAccountId: string;
  selectedAccount: TransferAccount | null;
  accounts: TransferAccount[];
  reference: string;
  pin: string[];

  // Processing & Receipt States
  isProcessing: boolean;
  error: string | null;
  completedTransaction: CompletedTransaction | null;

  // Actions
  setAmount: (amount: number, inputStr?: string) => void;
  setBeneficiary: (name: string, account?: string) => void;
  setSelectedAccountId: (accountId: string) => void;
  setReference: (reference: string) => void;
  setPinDigit: (index: number, digit: string) => void;
  setFullPin: (pin: string[]) => void;
  clearPin: () => void;
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
    balance: 2456.00,
    currency: 'USD',
    type: 'Checking'
  },
  {
    id: 'acc_savings_02',
    name: 'Premier High-Yield Savings',
    accountNumber: '1092837461',
    last4: '7461',
    balance: 51574.00,
    currency: 'USD',
    type: 'Savings'
  },
  {
    id: 'acc_reserve_03',
    name: 'Global Currency Reserve',
    accountNumber: '1092839102',
    last4: '9102',
    balance: 15000.00,
    currency: 'USD',
    type: 'Treasury'
  }
];

export const useTransferStore = create<TransferState>((set, get) => ({
  amount: 500,
  amountInput: '500.00',
  availableBalance: 12450.00,
  beneficiaryName: 'johnny',
  beneficiaryAccount: 'US9920194827',
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

  setBeneficiary: (name: string, account?: string) => {
    set({
      beneficiaryName: name || 'johnny',
      beneficiaryAccount: account || 'US9920194827'
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

  fetchAccountsAndBalance: async () => {
    try {
      const token = localStorage.getItem('fab_session_token') || localStorage.getItem('token') || '';
      const headers: Record<string, string> = {};
      if (token) headers['Authorization'] = `Bearer ${token}`;

      const res = await axios.get('/api/user/me', { headers });
      if (res.data?.success) {
        const liveBal = typeof res.data.balance === 'number'
          ? res.data.balance
          : (typeof res.data.user?.balance === 'number' ? res.data.user.balance : 54030);

        const currentAcc = res.data.account;
        const acctNum = currentAcc?.account_number || '1092830397';
        const last4 = acctNum.slice(-4) || '0397';

        const updatedAccounts: TransferAccount[] = [
          {
            id: currentAcc?.id || 'acc_checking_01',
            name: currentAcc?.account_type ? `${currentAcc.account_type} Checking` : 'Everyday Checking',
            accountNumber: acctNum,
            last4: last4,
            balance: liveBal,
            currency: currentAcc?.currency || 'USD',
            type: currentAcc?.account_type || 'Checking'
          },
          {
            id: 'acc_savings_demo',
            name: 'Premier High-Yield Savings',
            accountNumber: '1092837461',
            last4: '7461',
            balance: 51574.00,
            currency: 'USD',
            type: 'Savings'
          },
          {
            id: 'acc_reserve_demo',
            name: 'Global Currency Reserve',
            accountNumber: '1092839102',
            last4: '9102',
            balance: 15000.00,
            currency: 'USD',
            type: 'Treasury'
          }
        ];

        const selected = updatedAccounts[0];
        set({
          accounts: updatedAccounts,
          selectedAccountId: selected.id,
          selectedAccount: selected,
          availableBalance: selected.balance
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
        : 'Everyday Checking ••••0397';

      const payload = {
        amount: state.amount,
        beneficiary_name: state.beneficiaryName || 'johnny',
        beneficiary_account: state.beneficiaryAccount || 'US9920194827',
        sourceAccountId: state.selectedAccountId,
        reference: state.reference || 'Rent for March',
        notes: state.reference || 'Rent for March',
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

        const txId = res.data.transaction?.id || `tx_${Date.now()}_${Math.floor(1000 + Math.random() * 9000)}`;

        const receipt: CompletedTransaction = {
          id: txId,
          recipient: state.beneficiaryName || 'johnny',
          amount: state.amount,
          fee: 'No fee',
          total: state.amount,
          currency: 'USD',
          from: senderAccountStr,
          date: dateFormatted,
          reference: state.reference || 'Rent for March',
          estimatedDelivery: 'Next business day',
          status: 'Completed',
          timestamp: now.toISOString()
        };

        // Deduct from current active balance in store
        const newBal = typeof res.data.newBalance === 'number'
          ? res.data.newBalance
          : Math.max(0, state.availableBalance - state.amount);

        const updatedAccounts = state.accounts.map(acc => {
          if (acc.id === state.selectedAccountId) {
            return { ...acc, balance: newBal };
          }
          return acc;
        });

        set({
          isProcessing: false,
          completedTransaction: receipt,
          availableBalance: newBal,
          accounts: updatedAccounts,
          selectedAccount: updatedAccounts.find(a => a.id === state.selectedAccountId) || null
        });

        return { success: true, transaction: receipt };
      } else {
        const errMsg = res.data?.error || 'Transfer could not be completed.';
        set({ isProcessing: false, error: errMsg });
        return { success: false, error: errMsg };
      }
    } catch (err: any) {
      console.error('executeTransfer error:', err);
      const errMsg = err.response?.data?.error || err.message || 'Payment processing error.';
      set({ isProcessing: false, error: errMsg });
      return { success: false, error: errMsg };
    }
  },

  resetTransfer: () => {
    set({
      amount: 500,
      amountInput: '500.00',
      reference: '',
      pin: ['', '', '', '', '', ''],
      isProcessing: false,
      error: null,
      completedTransaction: null
    });
  }
}));
