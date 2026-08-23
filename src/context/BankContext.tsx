import React, { createContext, useContext, useState, useEffect, ReactNode } from 'react';
import {
  UserProfile,
  BankAccount,
  BankCard,
  LedgerEntry,
  CurrencyCode,
  BankRegion,
  AuditLog,
  FinancialAdjustment,
  RiskEvent,
  SupportCase,
  MobileDepositRecord,
  MakerCheckerRequest,
  AccountApplication,
  AccountActivationRequest,
  UserApprovalStatus,
  AdminNotification,
  EmailDispatchLog,
  BankReceivingAccount,
  BiometricSecurityState
} from '../types';

export type AppView = 
  | 'PUBLIC_HOME'
  | 'PUBLIC_PERSONAL'
  | 'PUBLIC_BUSINESS'
  | 'PUBLIC_WEALTH'
  | 'PUBLIC_INTERNATIONAL'
  | 'PUBLIC_LOCATIONS'
  | 'PUBLIC_SECURITY'
  | 'AUTH_LOGIN'
  | 'AUTH_ENROLL'
  | 'AUTH_FORGOT'
  | 'AUTH_ADMIN_LOGIN'
  | 'DASHBOARD_OVERVIEW'
  | 'DASHBOARD_ACCOUNT_DETAIL'
  | 'DASHBOARD_TRANSFERS'
  | 'DASHBOARD_BILLPAY'
  | 'DASHBOARD_CARDS'
  | 'DASHBOARD_DEPOSIT'
  | 'DASHBOARD_STATEMENTS'
  | 'DASHBOARD_SECURITY'
  | 'DASHBOARD_MESSAGES'
  | 'DASHBOARD_PROFILE'
  | 'ADMIN_DASHBOARD'
  | 'ADMIN_CUSTOMERS'
  | 'ADMIN_ADJUSTMENTS'
  | 'ADMIN_RISK_RADAR'
  | 'ADMIN_AUDIT_LOGS';

interface ToastMessage {
  id: string;
  type: 'SUCCESS' | 'ERROR' | 'INFO' | 'WARNING';
  title: string;
  message: string;
}

interface BankContextType {
  // Current user & auth
  currentUser: UserProfile | null;
  currentRole: 'CUSTOMER' | 'ADMIN' | 'GUEST';
  token: string | null;
  region: BankRegion;
  setRegion: (region: BankRegion) => void;
  currentView: AppView;
  setCurrentView: (view: AppView) => void;
  selectedAccountId: string | null;
  setSelectedAccountId: (id: string | null) => void;

  // Data
  accounts: BankAccount[];
  cards: BankCard[];
  recentTransactions: LedgerEntry[];
  totalNetWorthUsdMinor: number;
  rates: Record<CurrencyCode, Record<CurrencyCode, number>>;
  
  // Applications & Onboarding
  applications: AccountApplication[];
  fetchApplications: () => Promise<void>;
  submitAccountApplication: (formData: any) => Promise<{ success: boolean; application?: AccountApplication; referenceNumber?: string; error?: string }>;
  approveApplication: (appId: string, notes?: string) => Promise<{ success: boolean; error?: string }>;
  rejectApplication: (appId: string, reason: string) => Promise<{ success: boolean; error?: string }>;
  requestApplicationDocs: (appId: string, notes: string) => Promise<{ success: boolean; error?: string }>;

  // Admin & Maker-Checker State
  adminStats: any;
  fetchAdminStats: () => Promise<void>;
  pendingMakerCheckers: MakerCheckerRequest[];
  fetchPendingMakerCheckers: () => Promise<void>;
  approveMakerChecker: (id: string, notes?: string) => Promise<{ success: boolean; error?: string }>;
  rejectMakerChecker: (id: string, reason?: string) => Promise<{ success: boolean; error?: string }>;
  createMakerCheckerRequest: (data: any) => Promise<{ success: boolean; error?: string }>;
  activationQueue: AccountActivationRequest[];
  fetchActivationQueue: () => Promise<void>;
  createActivationRequest: (data: { userId: string; targetStatus?: UserApprovalStatus; reason: string; notes?: string }) => Promise<{ success: boolean; error?: string }>;
  approveActivationRequest: (requestId: string, notes?: string) => Promise<{ success: boolean; error?: string }>;
  rejectActivationRequest: (requestId: string, notes?: string) => Promise<{ success: boolean; error?: string }>;
  toggleUserAccess: (userId: string, reason?: string) => Promise<{ success: boolean; user?: UserProfile; error?: string }>;
  setUserApprovalStatus: (userId: string, status: UserApprovalStatus, reason?: string) => Promise<{ success: boolean; user?: UserProfile; error?: string }>;
  auditLogs: AuditLog[];
  fetchAuditLogs: () => Promise<void>;
  adminSessionRole: 'SUPER_ADMIN' | 'MAKER' | 'CHECKER' | 'COMPLIANCE_OFFICER';
  setAdminSessionRole: (role: 'SUPER_ADMIN' | 'MAKER' | 'CHECKER' | 'COMPLIANCE_OFFICER') => void;

  // Admin Notification Service & Email Alerts
  adminNotifications: AdminNotification[];
  emailDispatchLogs: EmailDispatchLog[];
  unreadNotificationsCount: number;
  fetchAdminNotifications: () => Promise<void>;
  markAdminNotificationRead: (id: string) => Promise<void>;
  markAllAdminNotificationsRead: () => Promise<void>;
  dismissAdminNotification: (id: string) => Promise<void>;
  triggerTestEnrollmentNotification: () => Promise<{ success: boolean; application?: AccountApplication; referenceNumber?: string }>;

  // Admin Direct Controls & Fund Operations
  creditDebitAccount: (data: {
    accountId: string;
    amountMinor: number;
    direction: 'CREDIT' | 'DEBIT';
    description: string;
    category?: any;
    counterparty?: string;
    referenceNumber?: string;
    customTimestamp?: string;
  }) => Promise<{ success: boolean; account?: BankAccount; ledgerEntry?: LedgerEntry; error?: string }>;
  fetchAdminTransactions: (params?: { search?: string; accountId?: string; userId?: string; status?: string; limit?: number }) => Promise<{ total: number; transactions: any[] }>;
  editAdminTransaction: (id: string, updates: any) => Promise<{ success: boolean; transaction?: LedgerEntry; account?: BankAccount; error?: string }>;
  deleteAdminTransaction: (id: string, revertBalance?: boolean) => Promise<{ success: boolean; message?: string; error?: string }>;
  fetchUserBackendDetails: (userId: string) => Promise<any>;
  updateUserProfile: (userId: string, updates: any) => Promise<{ success: boolean; user?: UserProfile; error?: string }>;

  // Bank Receiving Accounts (Treasury Wire Routing)
  bankReceivingAccounts: BankReceivingAccount[];
  fetchBankReceivingAccounts: () => Promise<void>;
  saveBankReceivingAccount: (data: Partial<BankReceivingAccount>) => Promise<{ success: boolean; account?: BankReceivingAccount; error?: string }>;
  deleteBankReceivingAccount: (id: string) => Promise<{ success: boolean; error?: string }>;

  // Loading & State
  isLoading: boolean;
  isInitialSplash: boolean;
  dismissSplash: () => void;
  toasts: ToastMessage[];
  showToast: (type: ToastMessage['type'], title: string, message: string) => void;
  removeToast: (id: string) => void;

  // Actions
  refreshData: () => Promise<void>;
  login: (token: string, user: UserProfile) => void;
  logout: () => void;
  switchDemoUser: (userId: string) => Promise<void>;
  switchToAdmin: () => void;
  
  // Financial Actions
  executeTransfer: (
    sourceAccountId: string,
    destAccountId: string,
    amountMinor: number,
    description: string
  ) => Promise<{ success: boolean; error?: string }>;
  executeExternalTransfer: (
    sourceAccountId: string,
    recipient: any,
    amountMinor: number,
    transferType: any,
    memo?: string
  ) => Promise<{ success: boolean; error?: string; feeMinor?: number }>;
  executeBillPay: (
    sourceAccountId: string,
    vendorId: string,
    amountMinor: number,
    accountNumberWithVendor: string
  ) => Promise<{ success: boolean; error?: string }>;
  submitDeposit: (
    accountId: string,
    amountMinor: number,
    checkNumber: string,
    frontImage?: string,
    backImage?: string
  ) => Promise<{ success: boolean; error?: string; availableDate?: string }>;
  toggleCardFreeze: (cardId: string) => Promise<void>;
  updateCardControls: (cardId: string, controls: any) => Promise<void>;

  // Auth helper
  isAuthenticated: boolean;

  // Dark Mode Theme
  darkMode: boolean;
  toggleDarkMode: () => void;
  setDarkMode: (enabled: boolean) => void;

  // Biometric Security & Hardware Enclave
  biometricState: BiometricSecurityState;
  toggleBiometrics: (forceEnable?: boolean) => Promise<{ success: boolean; message?: string }>;
  updateBiometricSettings: (settings: Partial<BiometricSecurityState>) => void;
  isBiometricModalOpen: boolean;
  biometricModalConfig: any;
  openBiometricPrompt: (config?: { mode?: 'ENROLL' | 'VERIFY'; title?: string; subtitle?: string; onComplete?: (success: boolean) => void }) => void;
  closeBiometricPrompt: () => void;
}

const BankContext = createContext<BankContextType | undefined>(undefined);

export const BankProvider: React.FC<{ children: ReactNode }> = ({ children }) => {
  const [currentUser, setCurrentUser] = useState<UserProfile | null>(null);
  const [currentRole, setCurrentRole] = useState<'CUSTOMER' | 'ADMIN' | 'GUEST'>('GUEST');
  const [token, setToken] = useState<string | null>(null);
  const [region, setRegion] = useState<BankRegion>('EU');
  const [currentView, setCurrentView] = useState<AppView>('PUBLIC_HOME');
  const [selectedAccountId, setSelectedAccountId] = useState<string | null>(null);

  const [accounts, setAccounts] = useState<BankAccount[]>([]);
  const [cards, setCards] = useState<BankCard[]>([]);
  const [recentTransactions, setRecentTransactions] = useState<LedgerEntry[]>([]);
  const [totalNetWorthUsdMinor, setTotalNetWorthUsdMinor] = useState<number>(0);
  const [rates, setRates] = useState<Record<CurrencyCode, Record<CurrencyCode, number>>>({
    USD: { USD: 1.0, GBP: 0.785, EUR: 0.92 },
    GBP: { USD: 1.274, GBP: 1.0, EUR: 1.172 },
    EUR: { USD: 1.087, GBP: 0.853, EUR: 1.0 }
  });

  // Admin & Applications State
  const [applications, setApplications] = useState<AccountApplication[]>([]);
  const [adminStats, setAdminStats] = useState<any>(null);
  const [pendingMakerCheckers, setPendingMakerCheckers] = useState<MakerCheckerRequest[]>([]);
  const [activationQueue, setActivationQueue] = useState<AccountActivationRequest[]>([]);
  const [auditLogs, setAuditLogs] = useState<AuditLog[]>([]);
  const [adminSessionRole, setAdminSessionRole] = useState<'SUPER_ADMIN' | 'MAKER' | 'CHECKER' | 'COMPLIANCE_OFFICER'>('SUPER_ADMIN');

  // Admin Notification Service & Email Alerts State
  const [adminNotifications, setAdminNotifications] = useState<AdminNotification[]>([]);
  const [emailDispatchLogs, setEmailDispatchLogs] = useState<EmailDispatchLog[]>([]);
  const [unreadNotificationsCount, setUnreadNotificationsCount] = useState<number>(0);
  const [bankReceivingAccounts, setBankReceivingAccounts] = useState<BankReceivingAccount[]>([]);

  const [isLoading, setIsLoading] = useState(false);
  const [isInitialSplash, setIsInitialSplash] = useState(false);
  const [toasts, setToasts] = useState<ToastMessage[]>([]);

  // Dark Mode Theme Setup & Persistence
  const [darkMode, setDarkModeState] = useState<boolean>(() => {
    try {
      const saved = localStorage.getItem('fab_dark_mode');
      if (saved !== null) {
        return saved === 'true';
      }
      return window.matchMedia && window.matchMedia('(prefers-color-scheme: dark)').matches;
    } catch {
      return false;
    }
  });

  const setDarkMode = (enabled: boolean) => {
    setDarkModeState(enabled);
    try {
      localStorage.setItem('fab_dark_mode', String(enabled));
    } catch {}
  };

  const toggleDarkMode = () => {
    setDarkMode(!darkMode);
  };

  useEffect(() => {
    if (darkMode) {
      document.documentElement.classList.add('dark');
    } else {
      document.documentElement.classList.remove('dark');
    }
  }, [darkMode]);

  // Biometric Security & Hardware Enclave State
  const [biometricState, setBiometricState] = useState<BiometricSecurityState>(() => {
    try {
      const saved = localStorage.getItem('fab_biometric_settings');
      if (saved) {
        return JSON.parse(saved);
      }
    } catch {}
    return {
      enabled: false,
      type: 'FACE_ID',
      credentialId: undefined,
      enrolledAt: undefined,
      lastUsedAt: undefined,
      requireForLogin: true,
      requireForWires: true,
      requireForCardUnfreeze: true,
      hardwareEnclaveVerified: true,
      deviceName: typeof navigator !== 'undefined' && navigator.userAgent.includes('Mac') 
        ? 'Apple Touch ID / Face ID Secure Enclave' 
        : 'Hardware TPM 2.0 WebAuthn Authenticator'
    };
  });

  const updateBiometricSettings = (updates: Partial<BiometricSecurityState>) => {
    setBiometricState(prev => {
      const next = { ...prev, ...updates };
      try {
        localStorage.setItem('fab_biometric_settings', JSON.stringify(next));
      } catch {}
      return next;
    });
  };

  const [isBiometricModalOpen, setIsBiometricModalOpen] = useState(false);
  const [biometricModalConfig, setBiometricModalConfig] = useState<any>({
    mode: 'VERIFY',
    title: '',
    subtitle: '',
    onComplete: null
  });

  const openBiometricPrompt = (config?: { mode?: 'ENROLL' | 'VERIFY'; title?: string; subtitle?: string; onComplete?: (success: boolean) => void }) => {
    setBiometricModalConfig(config || { mode: 'VERIFY' });
    setIsBiometricModalOpen(true);
  };

  const closeBiometricPrompt = () => {
    setIsBiometricModalOpen(false);
  };

  const toggleBiometrics = async (forceEnable?: boolean): Promise<{ success: boolean; message?: string }> => {
    const targetState = forceEnable !== undefined ? forceEnable : !biometricState.enabled;
    if (targetState) {
      return new Promise((resolve) => {
        openBiometricPrompt({
          mode: 'ENROLL',
          title: 'Register Biometric Hardware Key',
          subtitle: 'Scan your biometric sensor to securely bind your hardware enclave to First Atlantic Bank & Trust.',
          onComplete: (success) => {
            if (success) {
              const now = new Date().toISOString();
              updateBiometricSettings({
                enabled: true,
                enrolledAt: now,
                lastUsedAt: now,
                credentialId: `fido2_key_${Math.random().toString(36).substring(2, 10)}`
              });
              showToast('SUCCESS', 'Biometric Security Enrolled', 'Hardware biometric enclave bound to your account.');
              resolve({ success: true, message: 'Biometric security activated.' });
            } else {
              resolve({ success: false, message: 'Biometric registration cancelled.' });
            }
          }
        });
      });
    } else {
      updateBiometricSettings({ enabled: false, credentialId: undefined });
      showToast('INFO', 'Biometrics Disabled', 'Fallback authentication active with master password & SMS TOTP.');
      return { success: true, message: 'Biometrics disabled.' };
    }
  };

  const showToast = (type: ToastMessage['type'], title: string, message: string) => {
    const id = `toast_${Date.now()}_${Math.random().toString().slice(-4)}`;
    setToasts(prev => [...prev, { id, type, title, message }]);
    setTimeout(() => removeToast(id), 5000);
  };

  const removeToast = (id: string) => {
    setToasts(prev => prev.filter(t => t.id !== id));
  };

  const dismissSplash = () => {
    setIsInitialSplash(false);
  };

  const getAuthHeader = () => {
    if (token) return { Authorization: `Bearer ${token}` };
    if (currentUser) return { Authorization: `Bearer usr_${currentUser.id}` };
    return { Authorization: 'Bearer usr_sterling_01' };
  };

  const fetchApplications = async () => {
    try {
      const res = await fetch('/api/admin/applications', {
        headers: { Authorization: `Bearer adm_${adminSessionRole.toLowerCase()}` }
      });
      if (res.ok) {
        const data = await res.json();
        setApplications(data.applications || []);
      }
    } catch (e) {
      console.error('Error fetching account applications:', e);
    }
  };

  const fetchAdminStats = async () => {
    try {
      const res = await fetch('/api/admin/stats', {
        headers: { Authorization: `Bearer adm_${adminSessionRole.toLowerCase()}` }
      });
      if (res.ok) {
        const data = await res.json();
        setAdminStats(data);
      }
    } catch (e) {
      console.error('Error fetching admin stats:', e);
    }
  };

  const fetchPendingMakerCheckers = async () => {
    try {
      const res = await fetch('/api/admin/adjustments', {
        headers: { Authorization: `Bearer adm_${adminSessionRole.toLowerCase()}` }
      });
      if (res.ok) {
        const data = await res.json();
        const pending = (data.adjustments || []).map((adj: any) => ({
          id: adj.id,
          actionType: adj.adjustmentType,
          targetAccountId: adj.accountId,
          amountMinor: adj.amountMinor,
          direction: adj.direction,
          reason: adj.reason,
          makerUsername: adj.makerAdminName || 'admin_maker',
          checkerUsername: adj.checkerAdminName,
          status: adj.status === 'APPROVED_AND_POSTED' ? 'APPROVED' : adj.status === 'REJECTED' ? 'REJECTED' : 'PENDING',
          createdAt: adj.createdTimestamp,
          approvedAt: adj.postedTimestamp
        }));
        setPendingMakerCheckers(pending);
      }
    } catch (e) {
      console.error('Error fetching adjustments for maker-checker:', e);
    }
  };

  const fetchAuditLogs = async () => {
    try {
      const res = await fetch('/api/admin/audit-logs', {
        headers: { Authorization: `Bearer adm_${adminSessionRole.toLowerCase()}` }
      });
      if (res.ok) {
        const data = await res.json();
        setAuditLogs(data.logs || []);
      }
    } catch (e) {
      console.error('Error fetching audit logs:', e);
    }
  };

  const submitAccountApplication = async (formData: any) => {
    try {
      setIsLoading(true);
      const res = await fetch('/api/applications/apply', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(formData)
      });
      const data = await res.json();
      if (!res.ok) {
        showToast('ERROR', 'Application Submission Error', data.error || 'Failed to submit application.');
        return { success: false, error: data.error };
      }
      showToast('SUCCESS', 'Application Submitted', `Reference: ${data.referenceNumber}. Registered for Compliance Approval.`);
      await fetchApplications();
      return { success: true, application: data.application, referenceNumber: data.referenceNumber };
    } catch (err: any) {
      showToast('ERROR', 'Network Error', err.message);
      return { success: false, error: err.message };
    } finally {
      setIsLoading(false);
    }
  };

  const approveApplication = async (appId: string, notes?: string) => {
    try {
      setIsLoading(true);
      const res = await fetch(`/api/admin/applications/${appId}/approve`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer adm_${adminSessionRole.toLowerCase()}`
        },
        body: JSON.stringify({ notes })
      });
      const data = await res.json();
      if (!res.ok) {
        showToast('ERROR', 'Approval Failed', data.error || 'Could not approve application.');
        return { success: false, error: data.error };
      }
      showToast('SUCCESS', 'Account Onboarding Approved', data.message || 'International accounts provisioned.');
      await Promise.all([fetchApplications(), fetchAdminStats(), refreshData()]);
      return { success: true };
    } catch (err: any) {
      showToast('ERROR', 'Network Error', err.message);
      return { success: false, error: err.message };
    } finally {
      setIsLoading(false);
    }
  };

  const rejectApplication = async (appId: string, reason: string) => {
    try {
      setIsLoading(true);
      const res = await fetch(`/api/admin/applications/${appId}/reject`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer adm_${adminSessionRole.toLowerCase()}`
        },
        body: JSON.stringify({ reason })
      });
      const data = await res.json();
      if (!res.ok) {
        showToast('ERROR', 'Rejection Error', data.error || 'Could not reject application.');
        return { success: false, error: data.error };
      }
      showToast('WARNING', 'Application Declined', 'Application marked as declined.');
      await Promise.all([fetchApplications(), fetchAdminStats()]);
      return { success: true };
    } catch (err: any) {
      showToast('ERROR', 'Network Error', err.message);
      return { success: false, error: err.message };
    } finally {
      setIsLoading(false);
    }
  };

  const requestApplicationDocs = async (appId: string, notes: string) => {
    try {
      setIsLoading(true);
      const res = await fetch(`/api/admin/applications/${appId}/request-docs`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer adm_${adminSessionRole.toLowerCase()}`
        },
        body: JSON.stringify({ notes })
      });
      const data = await res.json();
      if (!res.ok) {
        showToast('ERROR', 'Action Failed', data.error);
        return { success: false, error: data.error };
      }
      showToast('INFO', 'KYC Documentation Requested', 'Applicant flagged for additional document verification.');
      await fetchApplications();
      return { success: true };
    } catch (err: any) {
      showToast('ERROR', 'Network Error', err.message);
      return { success: false, error: err.message };
    } finally {
      setIsLoading(false);
    }
  };

  const approveMakerChecker = async (id: string, notes?: string) => {
    try {
      const res = await fetch(`/api/admin/adjustments/${id}/approve`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer adm_${adminSessionRole.toLowerCase()}`
        },
        body: JSON.stringify({ notes: notes || 'Checker authorization approved.' })
      });
      const data = await res.json();
      if (!res.ok) {
        showToast('ERROR', 'Approval Failed', data.error || 'Checker verification failed.');
        return { success: false, error: data.error };
      }
      showToast('SUCCESS', 'Dual-Control Verified', 'Adjustment approved and posted to General Ledger.');
      await Promise.all([fetchPendingMakerCheckers(), fetchAdminStats(), refreshData()]);
      return { success: true };
    } catch (err: any) {
      showToast('ERROR', 'System Error', err.message);
      return { success: false, error: err.message };
    }
  };

  const rejectMakerChecker = async (id: string, reason?: string) => {
    showToast('INFO', 'Adjustment Rejected', 'Maker-checker request declined.');
    return { success: true };
  };

  const createMakerCheckerRequest = async (data: any) => {
    try {
      const res = await fetch('/api/admin/adjustments/create', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer adm_${adminSessionRole.toLowerCase()}`
        },
        body: JSON.stringify({
          accountId: data.targetAccountId,
          amountMinor: data.amountMinor,
          currency: 'USD',
          direction: data.direction,
          adjustmentType: data.actionType || 'FEE_REVERSAL',
          reason: data.reason,
          effectiveDate: new Date().toISOString().slice(0, 10)
        })
      });
      const resData = await res.json();
      if (!res.ok) {
        showToast('ERROR', 'Proposal Failed', resData.error);
        return { success: false, error: resData.error };
      }
      showToast('SUCCESS', 'Proposal Submitted', resData.message);
      await Promise.all([fetchPendingMakerCheckers(), fetchAdminStats()]);
      return { success: true };
    } catch (err: any) {
      showToast('ERROR', 'Error', err.message);
      return { success: false, error: err.message };
    }
  };

  const fetchActivationQueue = async () => {
    try {
      const res = await fetch('/api/admin/approval/activation-queue', {
        headers: {
          Authorization: `Bearer adm_${adminSessionRole.toLowerCase()}`,
          'x-admin-id': adminSessionRole === 'SUPER_ADMIN' ? 'adm_alexandra_99' : adminSessionRole === 'MAKER' ? 'adm_charles_88' : 'adm_priya_77'
        }
      });
      if (res.ok) {
        const data = await res.json();
        setActivationQueue(data.queue || []);
      }
    } catch (err) {
      console.warn('Failed fetching activation queue:', err);
    }
  };

  const createActivationRequest = async (data: { userId: string; targetStatus?: UserApprovalStatus; reason: string; notes?: string }) => {
    try {
      const res = await fetch('/api/admin/approval/activation-queue/create', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer adm_master_01`,
          'x-admin-id': 'adm_master_01'
        },
        body: JSON.stringify(data)
      });
      const resData = await res.json();
      if (!res.ok) {
        showToast('ERROR', 'Activation Request Failed', resData.error || 'Failed to submit activation proposal.');
        return { success: false, error: resData.error };
      }
      showToast('SUCCESS', 'Maker Step Complete', resData.message || 'Dual-signature activation request submitted.');
      await Promise.all([fetchActivationQueue(), fetchAdminStats(), fetchAuditLogs()]);
      return { success: true };
    } catch (err: any) {
      showToast('ERROR', 'System Error', err.message);
      return { success: false, error: err.message };
    }
  };

  const approveActivationRequest = async (requestId: string, notes?: string) => {
    try {
      const res = await fetch(`/api/admin/approval/activation-queue/${requestId}/approve`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer adm_master_01`,
          'x-admin-id': 'adm_master_01'
        },
        body: JSON.stringify({ notes: notes || 'Dual-signature verified and approved.' })
      });
      const resData = await res.json();
      if (!res.ok) {
        showToast('ERROR', 'Activation Approval Failed', resData.error || 'Checker verification rejected.');
        return { success: false, error: resData.error };
      }
      showToast('SUCCESS', 'Dual-Signature Verified', resData.message || 'Account activated successfully.');
      await Promise.all([fetchActivationQueue(), fetchAdminStats(), fetchApplications(), fetchAuditLogs()]);
      return { success: true };
    } catch (err: any) {
      showToast('ERROR', 'System Error', err.message);
      return { success: false, error: err.message };
    }
  };

  const rejectActivationRequest = async (requestId: string, notes?: string) => {
    try {
      const res = await fetch(`/api/admin/approval/activation-queue/${requestId}/reject`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer adm_master_01`,
          'x-admin-id': 'adm_master_01'
        },
        body: JSON.stringify({ notes: notes || 'Activation request declined.' })
      });
      const resData = await res.json();
      if (!res.ok) {
        showToast('ERROR', 'Decline Failed', resData.error);
        return { success: false, error: resData.error };
      }
      showToast('INFO', 'Activation Declined', 'Request has been rejected.');
      await Promise.all([fetchActivationQueue(), fetchAdminStats(), fetchAuditLogs()]);
      return { success: true };
    } catch (err: any) {
      showToast('ERROR', 'System Error', err.message);
      return { success: false, error: err.message };
    }
  };

  const toggleUserAccess = async (userId: string, reason?: string) => {
    try {
      const res = await fetch('/api/admin/approval/toggle-user', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer adm_master_01`,
          'x-admin-id': 'adm_master_01'
        },
        body: JSON.stringify({ userId, reason: reason || 'Administrative access status toggle' })
      });
      const resData = await res.json();
      if (!res.ok) {
        showToast('ERROR', 'Access Toggle Failed', resData.error || 'Could not update user status.');
        return { success: false, error: resData.error };
      }
      const newStatus = resData.user?.approval_status;
      showToast(newStatus === 'APPROVED' ? 'SUCCESS' : 'WARNING', 'User Access Updated', `Account status set to ${newStatus}.`);
      await Promise.all([fetchAdminStats(), fetchAuditLogs()]);
      return { success: true, user: resData.user };
    } catch (err: any) {
      showToast('ERROR', 'System Error', err.message);
      return { success: false, error: err.message };
    }
  };

  const setUserApprovalStatus = async (userId: string, status: UserApprovalStatus, reason?: string) => {
    try {
      const res = await fetch(`/api/admin/approval/users/${userId}/status`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer adm_master_01`,
          'x-admin-id': 'adm_master_01'
        },
        body: JSON.stringify({ status, reason: reason || `Administrative status update to ${status}` })
      });
      const resData = await res.json();
      if (!res.ok) {
        showToast('ERROR', 'Status Update Failed', resData.error || 'Failed to update approval status.');
        return { success: false, error: resData.error };
      }
      showToast('SUCCESS', 'Approval Status Saved', `User status updated to ${status}.`);
      await Promise.all([fetchAdminStats(), fetchAuditLogs()]);
      return { success: true, user: resData.user };
    } catch (err: any) {
      showToast('ERROR', 'System Error', err.message);
      return { success: false, error: err.message };
    }
  };

  // --- ADMIN NOTIFICATIONS & EMAIL ALERTS SERVICE ---
  const fetchAdminNotifications = async () => {
    try {
      const res = await fetch('/api/admin/notifications', {
        headers: {
          Authorization: 'Bearer adm_master_01',
          'x-admin-id': 'adm_master_01'
        }
      });
      if (res.ok) {
        const data = await res.json();
        setAdminNotifications(data.notifications || []);
        setEmailDispatchLogs(data.emailLogs || []);
        setUnreadNotificationsCount(data.unreadCount || 0);
      }
    } catch (err) {
      console.warn('Failed fetching admin notifications:', err);
    }
  };

  const markAdminNotificationRead = async (id: string) => {
    try {
      const res = await fetch(`/api/admin/notifications/${id}/read`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          Authorization: 'Bearer adm_master_01',
          'x-admin-id': 'adm_master_01'
        }
      });
      if (res.ok) {
        setAdminNotifications(prev =>
          prev.map(n => (n.id === id ? { ...n, status: 'READ' as const } : n))
        );
        const data = await res.json();
        setUnreadNotificationsCount(data.unreadCount ?? 0);
      }
    } catch (err) {
      console.error(err);
    }
  };

  const markAllAdminNotificationsRead = async () => {
    try {
      const res = await fetch('/api/admin/notifications/mark-all-read', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          Authorization: 'Bearer adm_master_01',
          'x-admin-id': 'adm_master_01'
        }
      });
      if (res.ok) {
        setAdminNotifications(prev =>
          prev.map(n => ({ ...n, status: 'READ' as const }))
        );
        setUnreadNotificationsCount(0);
        showToast('INFO', 'All Alerts Cleared', 'All administrative alerts marked as read.');
      }
    } catch (err) {
      console.error(err);
    }
  };

  const dismissAdminNotification = async (id: string) => {
    try {
      const res = await fetch(`/api/admin/notifications/${id}/dismiss`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          Authorization: 'Bearer adm_master_01',
          'x-admin-id': 'adm_master_01'
        }
      });
      if (res.ok) {
        setAdminNotifications(prev => prev.filter(n => n.id !== id));
        const data = await res.json();
        setUnreadNotificationsCount(data.unreadCount ?? 0);
      }
    } catch (err) {
      console.error(err);
    }
  };

  const triggerTestEnrollmentNotification = async () => {
    try {
      setIsLoading(true);
      const res = await fetch('/api/admin/notifications/test-dispatch', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          Authorization: 'Bearer adm_master_01',
          'x-admin-id': 'adm_master_01'
        }
      });
      const data = await res.json();
      if (!res.ok) {
        showToast('ERROR', 'Dispatch Test Failed', data.error || 'Unable to trigger test notification.');
        return { success: false };
      }
      showToast('SUCCESS', 'Notification & Email Dispatched', `New application alert (${data.referenceNumber}) sent to Master Admin.`);
      await Promise.all([fetchAdminNotifications(), fetchApplications(), fetchAdminStats(), fetchAuditLogs()]);
      return { success: true, application: data.application, referenceNumber: data.referenceNumber };
    } catch (err: any) {
      showToast('ERROR', 'System Exception', err.message);
      return { success: false };
    } finally {
      setIsLoading(false);
    }
  };

  const refreshData = async () => {
    if (!currentUser && currentRole !== 'ADMIN') return;

    try {
      setIsLoading(true);
      const headers = getAuthHeader();
      
      const [accRes, cardRes, rateRes] = await Promise.all([
        fetch('/api/accounts', { headers }),
        fetch('/api/cards', { headers }),
        fetch('/api/rates/exchange')
      ]);

      if (accRes.ok) {
        const accData = await accRes.json();
        setAccounts(accData.accounts || []);
        setTotalNetWorthUsdMinor(accData.totalNetWorthUsdMinor || 0);

        // Fetch ledger entries for primary account
        if (accData.accounts && accData.accounts.length > 0) {
          const firstAccId = selectedAccountId || accData.accounts[0]?.id;
          if (firstAccId) {
            const txRes = await fetch(`/api/accounts/${firstAccId}/transactions?limit=25`, { headers });
            if (txRes.ok) {
              const txData = await txRes.json();
              setRecentTransactions(txData.transactions || []);
            }
          }
        }
      }

      if (cardRes.ok) {
        const cardData = await cardRes.json();
        setCards(cardData.cards || []);
      }

      if (rateRes.ok) {
        const rateData = await rateRes.json();
        setRates(rateData.rates);
      }
    } catch (err) {
      console.error('Error refreshing bank core data:', err);
    } finally {
      setIsLoading(false);
    }
  };

  const login = (newToken: string, user: UserProfile) => {
    setToken(newToken);
    setCurrentUser(user);
    setCurrentRole('CUSTOMER');
    setRegion(user.region);
    setCurrentView('DASHBOARD_OVERVIEW');
    showToast('SUCCESS', 'Secure Session Established', `Welcome back, ${user.firstName}. You are authenticated with First Atlantic Bank.`);
  };

  const logout = () => {
    setToken(null);
    setCurrentUser(null);
    setCurrentRole('GUEST');
    setCurrentView('PUBLIC_HOME');
    showToast('INFO', 'Session Terminated', 'You have been safely signed out.');
  };

  const switchDemoUser = async (userId: string) => {
    try {
      setIsLoading(true);
      const res = await fetch('/api/auth/switch-demo-user', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ userId })
      });
      if (res.ok) {
        const data = await res.json();
        setToken(data.token);
        setCurrentUser(data.user);
        setCurrentRole('CUSTOMER');
        setRegion(data.user.region);
        setCurrentView('DASHBOARD_OVERVIEW');
        showToast('SUCCESS', 'Switched Persona', `Active client session: ${data.user.firstName} ${data.user.lastName} (${data.user.region})`);
      }
    } catch (e) {
      console.error(e);
    } finally {
      setIsLoading(false);
    }
  };

  const switchToAdmin = () => {
    setCurrentRole('ADMIN');
    setCurrentView('ADMIN_DASHBOARD');
    fetchAdminStats();
    fetchPendingMakerCheckers();
    fetchActivationQueue();
    fetchApplications();
    fetchAuditLogs();
    fetchAdminNotifications();
    showToast('INFO', 'Administrator Platform Access', 'Logged in to First Atlantic Core Institutional Admin Portal.');
  };

  // Financial actions
  const executeTransfer = async (
    sourceAccountId: string,
    destAccountId: string,
    amountMinor: number,
    description: string
  ) => {
    try {
      const res = await fetch('/api/transfers/internal', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json', ...getAuthHeader() },
        body: JSON.stringify({ sourceAccountId, destAccountId, amountMinor, description })
      });
      const data = await res.json();
      if (!res.ok) {
        showToast('ERROR', 'Transfer Failed', data.error || 'Unable to process transfer.');
        return { success: false, error: data.error };
      }
      showToast('SUCCESS', 'Transfer Settled', 'Funds moved instantly between your First Atlantic accounts.');
      await refreshData();
      return { success: true };
    } catch (err: any) {
      showToast('ERROR', 'Network Exception', err.message);
      return { success: false, error: err.message };
    }
  };

  const executeExternalTransfer = async (
    sourceAccountId: string,
    recipient: any,
    amountMinor: number,
    transferType: any,
    memo?: string
  ) => {
    try {
      const res = await fetch('/api/transfers/external', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json', ...getAuthHeader() },
        body: JSON.stringify({ sourceAccountId, recipient, amountMinor, transferType, memo })
      });
      const data = await res.json();
      if (!res.ok) {
        showToast('ERROR', 'Wire/ACH Rejected', data.error || 'Outbound payment declined.');
        return { success: false, error: data.error };
      }
      showToast('SUCCESS', 'Payment Transmitted', `Outbound ${transferType.replace('_', ' ')} dispatched successfully.`);
      await refreshData();
      return { success: true, feeMinor: data.feeMinor };
    } catch (err: any) {
      showToast('ERROR', 'System Error', err.message);
      return { success: false, error: err.message };
    }
  };

  const executeBillPay = async (
    sourceAccountId: string,
    vendorId: string,
    amountMinor: number,
    accountNumberWithVendor: string
  ) => {
    try {
      const res = await fetch('/api/payments/bill-pay', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json', ...getAuthHeader() },
        body: JSON.stringify({ sourceAccountId, vendorId, amountMinor, accountNumberWithVendor })
      });
      const data = await res.json();
      if (!res.ok) {
        showToast('ERROR', 'Bill Payment Error', data.error);
        return { success: false, error: data.error };
      }
      showToast('SUCCESS', 'Payment Executed', 'Electronic remittance submitted to vendor.');
      await refreshData();
      return { success: true };
    } catch (err: any) {
      showToast('ERROR', 'System Error', err.message);
      return { success: false, error: err.message };
    }
  };

  const submitDeposit = async (
    accountId: string,
    amountMinor: number,
    checkNumber: string,
    frontImage?: string,
    backImage?: string
  ) => {
    try {
      const res = await fetch('/api/deposits/mobile-check', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json', ...getAuthHeader() },
        body: JSON.stringify({ accountId, amountMinor, checkNumber, frontImage, backImage })
      });
      const data = await res.json();
      if (!res.ok) {
        showToast('ERROR', 'Check Capture Error', data.error);
        return { success: false, error: data.error };
      }
      showToast('SUCCESS', 'Check Submitted', `Captured check #${checkNumber}. Scheduled availability: ${data.availableDate}`);
      await refreshData();
      return { success: true, availableDate: data.availableDate };
    } catch (err: any) {
      showToast('ERROR', 'System Error', err.message);
      return { success: false, error: err.message };
    }
  };

  const toggleCardFreeze = async (cardId: string) => {
    try {
      const res = await fetch(`/api/cards/${cardId}/toggle-freeze`, {
        method: 'POST',
        headers: { ...getAuthHeader() }
      });
      const data = await res.json();
      if (res.ok) {
        const isFrozen = data.card.status === 'FROZEN';
        showToast(
          isFrozen ? 'WARNING' : 'SUCCESS',
          isFrozen ? 'Card Frozen' : 'Card Unfrozen',
          `Card ${data.card.cardNumberMasked} is now ${isFrozen ? 'temporarily locked from authorization.' : 'active for purchases.'}`
        );
        await refreshData();
      }
    } catch (err) {
      console.error(err);
    }
  };

  const updateCardControls = async (cardId: string, controls: any) => {
    try {
      const res = await fetch(`/api/cards/${cardId}/controls`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json', ...getAuthHeader() },
        body: JSON.stringify(controls)
      });
      if (res.ok) {
        showToast('SUCCESS', 'Card Controls Updated', 'Security rules and limits have been updated.');
        await refreshData();
      }
    } catch (err) {
      console.error(err);
    }
  };

  // --- ADMIN DIRECT FUND OPERATIONS (CREDIT / DEBIT) ---
  const creditDebitAccount = async (data: {
    accountId: string;
    amountMinor: number;
    direction: 'CREDIT' | 'DEBIT';
    description: string;
    category?: any;
    counterparty?: string;
    referenceNumber?: string;
    customTimestamp?: string;
  }) => {
    try {
      const res = await fetch('/api/admin/funds/credit-debit', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'x-admin-id': 'adm_master_01'
        },
        body: JSON.stringify(data)
      });
      const resData = await res.json();
      if (!res.ok) {
        showToast('ERROR', 'Fund Adjustment Failed', resData.error || 'Failed to process balance update.');
        return { success: false, error: resData.error };
      }

      showToast(
        'SUCCESS',
        `${data.direction === 'CREDIT' ? 'Funds Credited' : 'Funds Debited'}`,
        resData.message || `Successfully processed ${data.direction} on ${resData.account?.name}.`
      );
      await Promise.all([refreshData(), fetchAdminStats(), fetchAuditLogs()]);
      return { success: true, account: resData.account, ledgerEntry: resData.ledgerEntry };
    } catch (err: any) {
      showToast('ERROR', 'System Error', err.message);
      return { success: false, error: err.message };
    }
  };

  // --- ADMIN TRANSACTION HISTORY MANAGER & EDITOR ---
  const fetchAdminTransactions = async (params?: { search?: string; accountId?: string; userId?: string; status?: string; limit?: number }) => {
    try {
      const q = new URLSearchParams();
      if (params?.search) q.set('search', params.search);
      if (params?.accountId) q.set('accountId', params.accountId);
      if (params?.userId) q.set('userId', params.userId);
      if (params?.status && params.status !== 'ALL') q.set('status', params.status);
      if (params?.limit) q.set('limit', String(params.limit));

      const res = await fetch(`/api/admin/transactions?${q.toString()}`, {
        headers: { 'x-admin-id': 'adm_master_01' }
      });
      if (res.ok) {
        return await res.json();
      }
      return { total: 0, transactions: [] };
    } catch (err) {
      console.error('Error fetching admin transactions:', err);
      return { total: 0, transactions: [] };
    }
  };

  const editAdminTransaction = async (id: string, updates: any) => {
    try {
      const res = await fetch(`/api/admin/transactions/${id}`, {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
          'x-admin-id': 'adm_master_01'
        },
        body: JSON.stringify(updates)
      });
      const data = await res.json();
      if (!res.ok) {
        showToast('ERROR', 'Edit Failed', data.error || 'Failed to update transaction.');
        return { success: false, error: data.error };
      }

      showToast('SUCCESS', 'Transaction Updated', 'Transaction details updated in double-entry ledger.');
      await Promise.all([refreshData(), fetchAuditLogs()]);
      return { success: true, transaction: data.transaction, account: data.account };
    } catch (err: any) {
      showToast('ERROR', 'System Error', err.message);
      return { success: false, error: err.message };
    }
  };

  const deleteAdminTransaction = async (id: string, revertBalance: boolean = true) => {
    try {
      const res = await fetch(`/api/admin/transactions/${id}?revertBalance=${revertBalance}`, {
        method: 'DELETE',
        headers: { 'x-admin-id': 'adm_master_01' }
      });
      const data = await res.json();
      if (!res.ok) {
        showToast('ERROR', 'Delete Failed', data.error || 'Failed to remove transaction.');
        return { success: false, error: data.error };
      }

      showToast('SUCCESS', 'Transaction Removed', data.message || 'Transaction record removed from ledger.');
      await Promise.all([refreshData(), fetchAuditLogs()]);
      return { success: true, message: data.message };
    } catch (err: any) {
      showToast('ERROR', 'System Error', err.message);
      return { success: false, error: err.message };
    }
  };

  // --- ADMIN BACKEND USER DETAILS INSPECTOR & EDIT ---
  const fetchUserBackendDetails = async (userId: string) => {
    try {
      const res = await fetch(`/api/admin/users/${userId}/backend-details`, {
        headers: { 'x-admin-id': 'adm_master_01' }
      });
      if (res.ok) {
        return await res.json();
      }
      return null;
    } catch (err) {
      console.error('Error fetching backend user details:', err);
      return null;
    }
  };

  const updateUserProfile = async (userId: string, updates: any) => {
    try {
      const res = await fetch(`/api/admin/users/${userId}/update-profile`, {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
          'x-admin-id': 'adm_master_01'
        },
        body: JSON.stringify(updates)
      });
      const data = await res.json();
      if (!res.ok) {
        showToast('ERROR', 'Update Failed', data.error || 'Failed to update user profile.');
        return { success: false, error: data.error };
      }

      showToast('SUCCESS', 'Profile Updated', 'User profile and permissions successfully updated.');
      await refreshData();
      return { success: true, user: data.user };
    } catch (err: any) {
      showToast('ERROR', 'System Error', err.message);
      return { success: false, error: err.message };
    }
  };

  // --- BANK RECEIVING ACCOUNTS (TREASURY WIRE ROUTING) ---
  const fetchBankReceivingAccounts = async () => {
    try {
      const res = await fetch('/api/admin/bank-receiving-accounts', {
        headers: { 'x-admin-id': 'adm_master_01' }
      });
      if (res.ok) {
        const data = await res.json();
        setBankReceivingAccounts(data.receivingAccounts || []);
      }
    } catch (err) {
      console.error('Error fetching bank receiving accounts:', err);
    }
  };

  const saveBankReceivingAccount = async (data: Partial<BankReceivingAccount>) => {
    try {
      const res = await fetch('/api/admin/bank-receiving-accounts', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'x-admin-id': 'adm_master_01'
        },
        body: JSON.stringify(data)
      });
      const resData = await res.json();
      if (!res.ok) {
        showToast('ERROR', 'Save Failed', resData.error || 'Failed to save receiving account.');
        return { success: false, error: resData.error };
      }

      showToast('SUCCESS', 'Receiving Account Configured', 'Bank receiving details saved for customer deposits and wire routing.');
      await fetchBankReceivingAccounts();
      return { success: true, account: resData.account };
    } catch (err: any) {
      showToast('ERROR', 'System Error', err.message);
      return { success: false, error: err.message };
    }
  };

  const deleteBankReceivingAccount = async (id: string) => {
    try {
      const res = await fetch(`/api/admin/bank-receiving-accounts/${id}`, {
        method: 'DELETE',
        headers: { 'x-admin-id': 'adm_master_01' }
      });
      const resData = await res.json();
      if (!res.ok) {
        showToast('ERROR', 'Delete Failed', resData.error || 'Failed to remove receiving account.');
        return { success: false, error: resData.error };
      }

      showToast('SUCCESS', 'Account Removed', 'Bank receiving account removed.');
      await fetchBankReceivingAccounts();
      return { success: true };
    } catch (err: any) {
      showToast('ERROR', 'System Error', err.message);
      return { success: false, error: err.message };
    }
  };

  useEffect(() => {
    if (currentUser || currentRole === 'ADMIN') {
      refreshData();
    }
    if (currentRole === 'ADMIN') {
      fetchAdminStats();
      fetchPendingMakerCheckers();
      fetchActivationQueue();
      fetchApplications();
      fetchAuditLogs();
      fetchAdminNotifications();
      fetchBankReceivingAccounts();
    }
  }, [currentUser, currentRole, selectedAccountId, adminSessionRole]);

  return (
    <BankContext.Provider
      value={{
        currentUser,
        currentRole,
        token,
        region,
        setRegion,
        currentView,
        setCurrentView,
        selectedAccountId,
        setSelectedAccountId,
        accounts,
        cards,
        recentTransactions,
        totalNetWorthUsdMinor,
        rates,
        applications,
        fetchApplications,
        submitAccountApplication,
        approveApplication,
        rejectApplication,
        requestApplicationDocs,
        adminStats,
        fetchAdminStats,
        pendingMakerCheckers,
        fetchPendingMakerCheckers,
        approveMakerChecker,
        rejectMakerChecker,
        createMakerCheckerRequest,
        activationQueue,
        fetchActivationQueue,
        createActivationRequest,
        approveActivationRequest,
        rejectActivationRequest,
        toggleUserAccess,
        setUserApprovalStatus,
        auditLogs,
        fetchAuditLogs,
        adminSessionRole,
        setAdminSessionRole,
        adminNotifications,
        emailDispatchLogs,
        unreadNotificationsCount,
        fetchAdminNotifications,
        markAdminNotificationRead,
        markAllAdminNotificationsRead,
        dismissAdminNotification,
        triggerTestEnrollmentNotification,
        creditDebitAccount,
        fetchAdminTransactions,
        editAdminTransaction,
        deleteAdminTransaction,
        fetchUserBackendDetails,
        updateUserProfile,
        bankReceivingAccounts,
        fetchBankReceivingAccounts,
        saveBankReceivingAccount,
        deleteBankReceivingAccount,
        isLoading,
        isInitialSplash,
        dismissSplash,
        toasts,
        showToast,
        removeToast,
        refreshData,
        login,
        logout,
        switchDemoUser,
        switchToAdmin,
        executeTransfer,
        executeExternalTransfer,
        executeBillPay,
        submitDeposit,
        toggleCardFreeze,
        updateCardControls,
        isAuthenticated: !!currentUser && currentRole === 'CUSTOMER',
        darkMode,
        toggleDarkMode,
        setDarkMode,
        biometricState,
        toggleBiometrics,
        updateBiometricSettings,
        isBiometricModalOpen,
        biometricModalConfig,
        openBiometricPrompt,
        closeBiometricPrompt
      }}
    >
      {children}
    </BankContext.Provider>
  );
};

export const useBank = () => {
  const context = useContext(BankContext);
  if (!context) throw new Error('useBank must be used within BankProvider');
  return context;
};

