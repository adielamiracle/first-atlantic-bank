import React, { useState, useEffect } from 'react';
import { useBank } from '../../context/BankContext';
import { CurrencyDisplay } from '../../components/common/CurrencyDisplay';
import { StatusBadge } from '../../components/common/StatusBadge';
import {
  DollarSign,
  Users,
  FileText,
  Landmark,
  FileCheck2,
  Bell,
  ShieldCheck,
  RefreshCw,
  Search,
  CheckCircle2,
  XCircle,
  AlertTriangle,
  Lock,
  ArrowRight,
  ShieldAlert,
  Layers,
  ChevronRight,
  Menu,
  X,
  Sliders,
  Send,
  Building,
  KeyRound,
  FileCode,
  Shield
} from 'lucide-react';
import { DirectFundsManager } from './DirectFundsManager';
import { TransactionHistoryManager } from './TransactionHistoryManager';
import { UserDetailsInspector } from './UserDetailsInspector';
import { TreasuryReceivingAccountsTab } from './TreasuryReceivingAccountsTab';
import { AccountActivationTab } from './AccountActivationTab';
import { AdminNotificationsTab } from './AdminNotificationsTab';
import { EnrollmentTrendWidget } from './EnrollmentTrendWidget';
import { AccountApplication, formatAddress } from '../../types';

export const AdminDashboard: React.FC = () => {
  const {
    adminStats,
    fetchAdminStats,
    applications,
    fetchApplications,
    approveApplication,
    rejectApplication,
    requestApplicationDocs,
    auditLogs,
    fetchAuditLogs,
    unreadNotificationsCount,
    fetchAdminNotifications,
    accounts,
    setCurrentView,
    showToast,
    adminSessionRole,
    setAdminSessionRole
  } = useBank();

  const [activeTab, setActiveTab] = useState<
    'FUNDS' | 'USERS' | 'TRANSACTIONS' | 'RECEIVING_ACCOUNTS' | 'APPLICATIONS' | 'NOTIFICATIONS' | 'AUDIT_LOGS'
  >('FUNDS');

  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);

  // Application Dossier Review State
  const [selectedAppDossier, setSelectedAppDossier] = useState<AccountApplication | null>(null);
  const [appFilter, setAppFilter] = useState<'ALL' | 'PENDING' | 'APPROVED' | 'REJECTED'>('ALL');
  const [appSearch, setAppSearch] = useState('');
  const [approvalNotes, setApprovalNotes] = useState('Identity verified. Multicurrency IBAN and risk profile compliant.');
  const [rejectionReason, setRejectionReason] = useState('Compliance review did not meet AML thresholds.');
  const [isProcessingApp, setIsProcessingApp] = useState(false);

  // Audit Search
  const [auditSearch, setAuditSearch] = useState('');

  useEffect(() => {
    fetchAdminStats();
    fetchApplications();
    fetchAuditLogs();
    fetchAdminNotifications();
  }, []);

  const filteredApps = applications.filter(app => {
    const matchesFilter = appFilter === 'ALL' || app.status === appFilter;
    const matchesSearch =
      `${app.firstName} ${app.lastName}`.toLowerCase().includes(appSearch.toLowerCase()) ||
      app.email.toLowerCase().includes(appSearch.toLowerCase()) ||
      app.referenceNumber.toLowerCase().includes(appSearch.toLowerCase());
    return matchesFilter && matchesSearch;
  });

  const handleApproveApp = async (appId: string) => {
    setIsProcessingApp(true);
    try {
      const res = await approveApplication(appId, approvalNotes);
      if (res.success) {
        setSelectedAppDossier(null);
        await Promise.all([fetchApplications(), fetchAdminStats()]);
      }
    } catch (err: any) {
      showToast('ERROR', 'Approval Failed', err.message);
    } finally {
      setIsProcessingApp(false);
    }
  };

  const handleRejectApp = async (appId: string) => {
    setIsProcessingApp(true);
    try {
      const res = await rejectApplication(appId, rejectionReason);
      if (res.success) {
        setSelectedAppDossier(null);
        await Promise.all([fetchApplications(), fetchAdminStats()]);
      }
    } catch (err: any) {
      showToast('ERROR', 'Rejection Failed', err.message);
    } finally {
      setIsProcessingApp(false);
    }
  };

  const navItems = [
    {
      id: 'FUNDS',
      label: 'Add & Debit Funds',
      icon: DollarSign,
      badge: null
    },
    {
      id: 'USERS',
      label: 'User Details & KYC',
      icon: Users,
      badge: null
    },
    {
      id: 'TRANSACTIONS',
      label: 'Transaction History',
      icon: FileText,
      badge: null
    },
    {
      id: 'RECEIVING_ACCOUNTS',
      label: 'Bank Receiving Accounts',
      icon: Landmark,
      badge: 'Treasury'
    },
    {
      id: 'APPLICATIONS',
      label: 'Applications',
      icon: FileCheck2,
      badge: adminStats ? `${adminStats.pendingApplicationsCount}` : null
    },
    {
      id: 'NOTIFICATIONS',
      label: 'Alerts & Emails',
      icon: Bell,
      badge: unreadNotificationsCount > 0 ? `${unreadNotificationsCount}` : null
    },
    {
      id: 'AUDIT_LOGS',
      label: 'Security Audit Logs',
      icon: ShieldCheck,
      badge: null
    }
  ];

  return (
    <div className="min-h-screen bg-[#061222] text-slate-100 pb-16">
      {/* Top Admin Navigation Bar */}
      <header className="sticky top-0 z-40 bg-[#091b33]/95 backdrop-blur-md border-b border-slate-800 shadow-md">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 py-3 flex items-center justify-between gap-4">
          {/* Brand & Title */}
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-[#c5a880] to-[#8c6d37] text-slate-950 flex items-center justify-center font-bold font-serif shadow-sm">
              FA
            </div>
            <div>
              <div className="flex items-center gap-2">
                <h1 className="text-base sm:text-lg font-bold font-serif text-white tracking-wide">
                  First Atlantic Executive Portal
                </h1>
                <span className="hidden sm:inline-block text-[10px] font-bold px-2 py-0.5 rounded bg-emerald-500/20 text-emerald-300 border border-emerald-500/30 font-mono">
                  LIVE SECURE
                </span>
              </div>
              <p className="text-[11px] text-slate-400 font-mono">
                Admin Console • Super Admin Authority
              </p>
            </div>
          </div>

          {/* Right Controls */}
          <div className="flex items-center gap-2 sm:gap-3">
            <button
              onClick={() => {
                fetchAdminStats();
                fetchApplications();
                fetchAuditLogs();
                fetchAdminNotifications();
                showToast('INFO', 'Data Refreshed', 'Admin console state synchronized.');
              }}
              className="p-2 rounded-xl bg-slate-800 hover:bg-slate-700 text-slate-300 transition-colors"
              title="Synchronize Live Ledger Data"
            >
              <RefreshCw className="w-4 h-4" />
            </button>

            <button
              onClick={() => setCurrentView('AUTH_LOGIN')}
              className="px-3 py-1.5 rounded-xl bg-[#c5a880] hover:bg-[#d4af37] text-slate-950 font-bold text-xs uppercase tracking-wider transition-all shadow-sm flex items-center gap-1.5"
            >
              <Lock className="w-3.5 h-3.5" />
              <span className="hidden sm:inline">Exit Admin</span>
            </button>

            {/* Mobile Hamburger Button */}
            <button
              onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
              className="lg:hidden p-2 rounded-xl bg-slate-800 text-white"
            >
              {mobileMenuOpen ? <X className="w-5 h-5" /> : <Menu className="w-5 h-5" />}
            </button>
          </div>
        </div>

        {/* Mobile Navigation Drawer */}
        {mobileMenuOpen && (
          <div className="lg:hidden bg-[#0a1f3d] border-t border-slate-800 p-4 space-y-1.5 animate-in slide-in-from-top-2 duration-150">
            {navItems.map(item => {
              const Icon = item.icon;
              const isActive = activeTab === item.id;
              return (
                <button
                  key={item.id}
                  onClick={() => {
                    setActiveTab(item.id as any);
                    setMobileMenuOpen(false);
                  }}
                  className={`w-full flex items-center justify-between px-3.5 py-2.5 rounded-xl text-xs font-bold transition-all cursor-pointer ${
                    isActive
                      ? 'bg-[#c5a880] text-slate-950 shadow-sm'
                      : 'text-slate-300 hover:bg-slate-800/80 hover:text-white'
                  }`}
                >
                  <div className="flex items-center gap-2.5">
                    <Icon className="w-4 h-4" />
                    <span>{item.label}</span>
                  </div>
                  {item.badge && (
                    <span
                      className={`text-[10px] font-bold px-2 py-0.5 rounded-full font-mono ${
                        isActive ? 'bg-slate-950 text-white' : 'bg-slate-700 text-slate-200'
                      }`}
                    >
                      {item.badge}
                    </span>
                  )}
                </button>
              );
            })}
          </div>
        )}
      </header>

      {/* Main Container */}
      <main className="max-w-7xl mx-auto px-4 sm:px-6 pt-6 space-y-6">
        {/* Quick Executive Stats Grid */}
        <div className="grid grid-cols-2 sm:grid-cols-2 lg:grid-cols-4 gap-3 sm:gap-4">
          <div className="p-4 rounded-2xl bg-[#091b33] border border-slate-800 shadow-sm space-y-1">
            <span className="text-[10px] font-bold text-slate-400 uppercase tracking-wider block">
              Total Managed Vault Capital
            </span>
            <div className="text-lg sm:text-2xl font-bold font-mono text-[#d4af37]">
              <CurrencyDisplay
                amountMinor={adminStats?.totalManagedAssetsUsdMinor || 148200000}
                currency="USD"
                size="lg"
                className="font-bold text-[#d4af37] font-mono"
              />
            </div>
            <span className="text-[10px] text-emerald-400 font-mono block">&uarr; Real-time Ledger Reserve</span>
          </div>

          <div className="p-4 rounded-2xl bg-[#091b33] border border-slate-800 shadow-sm space-y-1">
            <span className="text-[10px] font-bold text-slate-400 uppercase tracking-wider block">
              Total Customer Accounts
            </span>
            <div className="text-lg sm:text-2xl font-bold font-mono text-white">
              {accounts.length} Accounts
            </div>
            <span className="text-[10px] text-slate-400 font-mono block">Across US / UK / EU Vaults</span>
          </div>

          <div className="p-4 rounded-2xl bg-[#091b33] border border-slate-800 shadow-sm space-y-1">
            <span className="text-[10px] font-bold text-slate-400 uppercase tracking-wider block">
              Pending Onboarding
            </span>
            <div className="text-lg sm:text-2xl font-bold font-mono text-amber-400">
              {adminStats?.pendingApplicationsCount || 0} In Review
            </div>
            <span className="text-[10px] text-amber-300/80 font-mono block">KYC &amp; AML Verification</span>
          </div>

          <div className="p-4 rounded-2xl bg-[#091b33] border border-slate-800 shadow-sm space-y-1">
            <span className="text-[10px] font-bold text-slate-400 uppercase tracking-wider block">
              System Inbound Desks
            </span>
            <div className="text-lg sm:text-2xl font-bold font-mono text-emerald-400">
              Active Routing
            </div>
            <span className="text-[10px] text-slate-400 font-mono block">Fedwire • CHAPS • SEPA</span>
          </div>
        </div>

        {/* Desktop Horizontal Navigation Tabs (Scrollable on small screens) */}
        <div className="hidden lg:flex items-center gap-1.5 p-1.5 rounded-2xl bg-[#091b33] border border-slate-800 overflow-x-auto">
          {navItems.map(item => {
            const Icon = item.icon;
            const isActive = activeTab === item.id;
            return (
              <button
                key={item.id}
                onClick={() => setActiveTab(item.id as any)}
                className={`flex items-center gap-2 px-4 py-2.5 rounded-xl text-xs font-bold transition-all whitespace-nowrap cursor-pointer ${
                  isActive
                    ? 'bg-[#c5a880] text-slate-950 shadow-sm'
                    : 'text-slate-300 hover:text-white hover:bg-slate-800/60'
                }`}
              >
                <Icon className="w-4 h-4" />
                <span>{item.label}</span>
                {item.badge && (
                  <span
                    className={`text-[10px] font-bold px-1.5 py-0.5 rounded-full font-mono ${
                      isActive ? 'bg-slate-950 text-white' : 'bg-slate-800 text-slate-300'
                    }`}
                  >
                    {item.badge}
                  </span>
                )}
              </button>
            );
          })}
        </div>

        {/* Mobile Horizontal Pill Bar */}
        <div className="flex lg:hidden items-center gap-2 overflow-x-auto pb-1 no-scrollbar">
          {navItems.map(item => {
            const Icon = item.icon;
            const isActive = activeTab === item.id;
            return (
              <button
                key={item.id}
                onClick={() => setActiveTab(item.id as any)}
                className={`flex items-center gap-1.5 px-3 py-2 rounded-xl text-xs font-bold shrink-0 transition-all cursor-pointer ${
                  isActive
                    ? 'bg-[#c5a880] text-slate-950 font-extrabold shadow-sm'
                    : 'bg-[#091b33] text-slate-300 border border-slate-800'
                }`}
              >
                <Icon className="w-3.5 h-3.5" />
                <span>{item.label}</span>
                {item.badge && (
                  <span className="text-[9px] px-1 py-0.2 rounded-full bg-slate-900 text-white font-mono">
                    {item.badge}
                  </span>
                )}
              </button>
            );
          })}
        </div>

        {/* TAB CONTENT VIEWS */}
        <div className="animate-in fade-in duration-150">
          {/* TAB 1: DIRECT FUNDS MANAGER (ADD & DEBIT MONEY) */}
          {activeTab === 'FUNDS' && (
            <div className="space-y-6">
              <DirectFundsManager />
            </div>
          )}

          {/* TAB 2: USER DETAILS & BACKEND RECORD INSPECTOR */}
          {activeTab === 'USERS' && <UserDetailsInspector />}

          {/* TAB 3: TRANSACTION HISTORY & LEDGER EDITOR */}
          {activeTab === 'TRANSACTIONS' && <TransactionHistoryManager />}

          {/* TAB 4: BANK RECEIVING ACCOUNTS */}
          {activeTab === 'RECEIVING_ACCOUNTS' && <TreasuryReceivingAccountsTab />}

          {/* TAB 5: APPLICATIONS & KYC APPROVALS */}
          {activeTab === 'APPLICATIONS' && (
            <div className="space-y-6">
              <div className="bg-white rounded-2xl border border-slate-200 p-4 sm:p-6 shadow-sm text-slate-800 space-y-4">
                <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
                  <div>
                    <h2 className="text-lg font-bold font-serif text-slate-900 flex items-center gap-2">
                      <FileCheck2 className="w-5 h-5 text-[#c5a880]" />
                      <span>Account Application &amp; KYC Verification Dossiers</span>
                    </h2>
                    <p className="text-xs text-slate-500">
                      Inspect client identity submissions, regulatory risk rating, and issue verified IBAN clearance
                    </p>
                  </div>

                  <div className="flex items-center gap-2">
                    <select
                      value={appFilter}
                      onChange={e => setAppFilter(e.target.value as any)}
                      className="px-3 py-1.5 text-xs rounded-xl border border-slate-200 bg-slate-50 font-bold text-slate-800"
                    >
                      <option value="ALL">All Applications</option>
                      <option value="PENDING">Pending Review</option>
                      <option value="APPROVED">Approved</option>
                      <option value="REJECTED">Rejected</option>
                    </select>
                  </div>
                </div>

                {/* Applications Table / Cards */}
                <div className="divide-y divide-slate-100">
                  {filteredApps.length === 0 ? (
                    <div className="p-8 text-center text-slate-400 text-xs">
                      No applications found matching your criteria.
                    </div>
                  ) : (
                    filteredApps.map(app => (
                      <div
                        key={app.id}
                        className="py-4 flex flex-col sm:flex-row sm:items-center justify-between gap-3 hover:bg-slate-50 p-3 rounded-xl transition-colors"
                      >
                        <div className="space-y-1">
                          <div className="flex items-center gap-2">
                            <span className="text-xs font-bold text-slate-900">
                              {app.firstName} {app.lastName}
                            </span>
                            <span className="text-[10px] font-bold px-1.5 py-0.5 rounded bg-slate-100 text-slate-700 font-mono">
                              {app.accountTypeRequested} ({app.currency})
                            </span>
                            <StatusBadge status={app.status} size="xs" />
                          </div>
                          <div className="text-[11px] text-slate-500 font-mono">
                            {app.email} • Ref: {app.referenceNumber} • Deposit: ${((app.initialDepositMinor || 0) / 100).toLocaleString()}
                          </div>
                        </div>

                        <div className="flex items-center gap-2">
                          <button
                            onClick={() => setSelectedAppDossier(app)}
                            className="px-3 py-1.5 rounded-lg bg-[#0a192f] hover:bg-[#153459] text-white text-xs font-bold transition-colors cursor-pointer"
                          >
                            Review Dossier
                          </button>
                        </div>
                      </div>
                    ))
                  )}
                </div>
              </div>
            </div>
          )}

          {/* TAB 6: NOTIFICATIONS & ALERTS */}
          {activeTab === 'NOTIFICATIONS' && <AdminNotificationsTab />}

          {/* TAB 7: SECURITY AUDIT LOGS */}
          {activeTab === 'AUDIT_LOGS' && (
            <div className="bg-white rounded-2xl border border-slate-200 p-4 sm:p-6 shadow-sm text-slate-800 space-y-4">
              <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
                <div>
                  <h2 className="text-lg font-bold font-serif text-slate-900 flex items-center gap-2">
                    <ShieldCheck className="w-5 h-5 text-[#c5a880]" />
                    <span>Cryptographic Security &amp; Audit Journal</span>
                  </h2>
                  <p className="text-xs text-slate-500">
                    Immutable records of all administrative actions, fund transfers, and ledger movements
                  </p>
                </div>

                <div className="relative w-full sm:w-64">
                  <Search className="w-4 h-4 text-slate-400 absolute left-3 top-2.5" />
                  <input
                    type="text"
                    placeholder="Search logs..."
                    value={auditSearch}
                    onChange={e => setAuditSearch(e.target.value)}
                    className="w-full pl-9 pr-3 py-1.5 text-xs rounded-xl border border-slate-200 bg-slate-50"
                  />
                </div>
              </div>

              <div className="divide-y divide-slate-100 max-h-[600px] overflow-y-auto">
                {auditLogs
                  .filter(l =>
                    (l.action || '').toLowerCase().includes(auditSearch.toLowerCase()) ||
                    (l.details || '').toLowerCase().includes(auditSearch.toLowerCase()) ||
                    (l.actorEmail || l.actorUsername || l.actorId || (l as any).adminId || '').toLowerCase().includes(auditSearch.toLowerCase())
                  )
                  .map(log => (
                    <div key={log.id} className="py-3 text-xs flex items-start gap-3">
                      <div className="p-1.5 rounded-lg bg-slate-100 text-slate-700 shrink-0 mt-0.5">
                        <FileCode className="w-3.5 h-3.5" />
                      </div>
                      <div className="min-w-0 flex-1">
                        <div className="flex items-center justify-between gap-2">
                          <span className="font-bold text-slate-900 font-mono">{log.action}</span>
                          <span className="text-[10px] text-slate-400 font-mono">
                            {log.timestamp ? `${new Date(log.timestamp).toLocaleTimeString()} • ${new Date(log.timestamp).toLocaleDateString()}` : 'Recent'}
                          </span>
                        </div>
                        <p className="text-slate-600 text-[11px] mt-0.5">{log.details}</p>
                        <div className="text-[10px] text-slate-400 font-mono mt-1">
                          Actor: {log.actorEmail || log.actorUsername || log.actorId || (log as any).adminId || 'System'} • IP: {log.ipAddress || '127.0.0.1'} • Hash: {(log.signatureHash || (log as any).checksumHash || (log as any).checksum || log.id || '').slice(0, 16)}...
                        </div>
                      </div>
                    </div>
                  ))}
              </div>
            </div>
          )}
        </div>
      </main>

      {/* APPLICATION REVIEW DOSSIER MODAL */}
      {selectedAppDossier && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/70 backdrop-blur-xs">
          <div className="bg-white rounded-2xl max-w-2xl w-full overflow-hidden shadow-2xl border border-slate-200 text-slate-800">
            <div className="p-5 bg-[#0a192f] text-white flex items-center justify-between">
              <div>
                <h3 className="text-base font-bold font-serif">Customer Onboarding Dossier</h3>
                <p className="text-[11px] text-slate-300 font-mono">Ref: {selectedAppDossier.referenceNumber}</p>
              </div>
              <button
                onClick={() => setSelectedAppDossier(null)}
                className="text-slate-400 hover:text-white"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <div className="p-6 space-y-4 max-h-[80vh] overflow-y-auto text-xs">
              <div className="grid grid-cols-2 gap-4">
                <div className="p-3 rounded-xl bg-slate-50 border border-slate-200/60">
                  <span className="text-[10px] text-slate-400 font-bold uppercase block">Applicant Name</span>
                  <div className="font-bold text-slate-900 text-sm mt-0.5">
                    {selectedAppDossier.firstName} {selectedAppDossier.lastName}
                  </div>
                </div>

                <div className="p-3 rounded-xl bg-slate-50 border border-slate-200/60">
                  <span className="text-[10px] text-slate-400 font-bold uppercase block">Email &amp; Phone</span>
                  <div className="font-semibold text-slate-800 mt-0.5">
                    {selectedAppDossier.email}<br />{selectedAppDossier.phone}
                  </div>
                </div>

                <div className="p-3 rounded-xl bg-slate-50 border border-slate-200/60">
                  <span className="text-[10px] text-slate-400 font-bold uppercase block">Account Requested</span>
                  <div className="font-bold text-slate-900 mt-0.5">
                    {selectedAppDossier.accountTypeRequested} ({selectedAppDossier.currency})
                  </div>
                </div>

                <div className="p-3 rounded-xl bg-slate-50 border border-slate-200/60">
                  <span className="text-[10px] text-slate-400 font-bold uppercase block">Declared Net Worth / Income</span>
                  <div className="font-bold text-emerald-700 mt-0.5">
                    {selectedAppDossier.annualIncome || '$250,000+'} • Net Worth: {selectedAppDossier.estimatedNetWorth || '$1.5M+'}
                  </div>
                </div>

                <div className="p-3 rounded-xl bg-slate-50 border border-slate-200/60 col-span-2">
                  <span className="text-[10px] text-slate-400 font-bold uppercase block">Residential Address</span>
                  <div className="text-slate-800 mt-0.5">
                    {formatAddress(selectedAppDossier.address) || `${selectedAppDossier.city || ''}, ${selectedAppDossier.country || ''}`}
                  </div>
                </div>
              </div>

              {selectedAppDossier.status === 'PENDING' && (
                <div className="space-y-3 pt-3 border-t border-slate-200">
                  <div className="space-y-1">
                    <label className="font-bold text-slate-700">Approval Compliance Memo</label>
                    <input
                      type="text"
                      value={approvalNotes}
                      onChange={e => setApprovalNotes(e.target.value)}
                      className="w-full px-3 py-2 rounded-xl border border-slate-300"
                    />
                  </div>

                  <div className="flex items-center justify-end gap-3 pt-2">
                    <button
                      type="button"
                      onClick={() => handleRejectApp(selectedAppDossier.id)}
                      disabled={isProcessingApp}
                      className="px-4 py-2 rounded-xl bg-rose-50 hover:bg-rose-100 text-rose-700 font-bold border border-rose-200 transition-colors"
                    >
                      Reject Application
                    </button>
                    <button
                      type="button"
                      onClick={() => handleApproveApp(selectedAppDossier.id)}
                      disabled={isProcessingApp}
                      className="px-5 py-2 rounded-xl bg-emerald-600 hover:bg-emerald-700 text-white font-bold flex items-center gap-1.5 shadow-md transition-colors"
                    >
                      {isProcessingApp ? (
                        <RefreshCw className="w-3.5 h-3.5 animate-spin" />
                      ) : (
                        <CheckCircle2 className="w-3.5 h-3.5" />
                      )}
                      <span>Approve &amp; Issue Live Account</span>
                    </button>
                  </div>
                </div>
              )}
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
