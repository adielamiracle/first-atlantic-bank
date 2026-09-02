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
  Plus,
  ArrowUpRight,
  ArrowDownLeft,
  Building2,
  Check,
  TrendingUp,
  FileCode,
  SlidersHorizontal,
  LogOut,
  Sparkles,
  BarChart2,
  Calendar,
  Clock
} from 'lucide-react';
import { DirectFundsManager } from './DirectFundsManager';
import { TransactionHistoryManager } from './TransactionHistoryManager';
import { UserDetailsInspector } from './UserDetailsInspector';
import { TreasuryReceivingAccountsTab } from './TreasuryReceivingAccountsTab';
import { AccountActivationTab } from './AccountActivationTab';
import { AdminNotificationsTab } from './AdminNotificationsTab';
import { EnrollmentTrendWidget } from './EnrollmentTrendWidget';
import { CreateCustomerModal } from './CreateCustomerModal';
import { EditApplicationModal } from './EditApplicationModal';
import { SupabaseStatusChecker } from '../../components/common/SupabaseStatusChecker';
import { AccountApplication, formatAddress, formatDateTime } from '../../types';

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
    adminSessionRole
  } = useBank();

  const [activeTab, setActiveTab] = useState<
    'FUNDS' | 'USERS' | 'TRANSACTIONS' | 'RECEIVING_ACCOUNTS' | 'APPLICATIONS' | 'NOTIFICATIONS' | 'AUDIT_LOGS'
  >('FUNDS');

  const [sidebarOpen, setSidebarOpen] = useState(false);
  const [isCreateCustomerOpen, setIsCreateCustomerOpen] = useState(false);
  const [editingApplication, setEditingApplication] = useState<AccountApplication | null>(null);
  const [dashboardRefreshKey, setDashboardRefreshKey] = useState(0);

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

  const navGroups = [
    {
      title: 'CORE BANKING',
      items: [
        { id: 'FUNDS', label: 'Add & Debit Funds', icon: DollarSign, badge: null },
        { id: 'USERS', label: 'Customers & KYC', icon: Users, badge: null },
        { id: 'TRANSACTIONS', label: 'Transaction Ledger', icon: FileText, badge: null }
      ]
    },
    {
      title: 'TREASURY & ONBOARDING',
      items: [
        { id: 'RECEIVING_ACCOUNTS', label: 'Treasury Accounts', icon: Landmark, badge: 'Active' },
        {
          id: 'APPLICATIONS',
          label: 'Customer Applications',
          icon: FileCheck2,
          badge: adminStats?.pendingApplicationsCount ? `${adminStats.pendingApplicationsCount}` : null
        }
      ]
    },
    {
      title: 'SYSTEM & SECURITY',
      items: [
        {
          id: 'NOTIFICATIONS',
          label: 'Alerts & Messages',
          icon: Bell,
          badge: unreadNotificationsCount > 0 ? `${unreadNotificationsCount}` : null
        },
        { id: 'AUDIT_LOGS', label: 'Audit & Compliance', icon: ShieldCheck, badge: null }
      ]
    }
  ];

  return (
    <div className="min-h-screen bg-slate-50 dark:bg-[#09111e] text-slate-900 dark:text-slate-100 flex flex-col lg:flex-row">
      {/* 1. PAYSTACK / FLUTTERWAVE STYLE SIDEBAR NAVIGATION */}
      {/* Mobile Backdrop */}
      {sidebarOpen && (
        <div
          onClick={() => setSidebarOpen(false)}
          className="fixed inset-0 z-40 bg-slate-950/60 backdrop-blur-xs lg:hidden"
        />
      )}

      {/* Sidebar Container */}
      <aside
        className={`fixed lg:sticky top-0 left-0 z-50 h-screen w-64 bg-white dark:bg-[#0f172a] border-r border-slate-200/80 dark:border-slate-800 flex flex-col justify-between transition-transform duration-200 ease-in-out ${
          sidebarOpen ? 'translate-x-0' : '-translate-x-full lg:translate-x-0'
        }`}
      >
        {/* Top Brand / Logo */}
        <div>
          <div className="h-16 px-6 flex items-center justify-between border-b border-slate-100 dark:border-slate-800">
            <div className="flex items-center gap-2.5">
              <div className="w-8 h-8 rounded-lg bg-[#004281] text-white flex items-center justify-center font-bold text-sm shadow-xs">
                FA
              </div>
              <div>
                <span className="font-bold text-sm text-[#004281] dark:text-white tracking-tight block">
                  First Atlantic
                </span>
                <span className="text-[10px] font-semibold text-slate-400 uppercase tracking-wider block">
                  Admin Console
                </span>
              </div>
            </div>

            <button
              onClick={() => setSidebarOpen(false)}
              className="p-1 rounded-lg text-slate-400 hover:text-slate-700 lg:hidden cursor-pointer"
            >
              <X className="w-5 h-5" />
            </button>
          </div>

          {/* Quick Create Action in Sidebar */}
          <div className="p-4">
            <button
              onClick={() => {
                setIsCreateCustomerOpen(true);
                setSidebarOpen(false);
              }}
              className="w-full py-2.5 px-3.5 rounded-xl bg-[#00A651] hover:bg-[#008f45] text-white font-bold text-xs shadow-xs transition-all flex items-center justify-center gap-2 cursor-pointer"
            >
              <Plus className="w-4 h-4" />
              <span>+ Create Customer</span>
            </button>
          </div>

          {/* Navigation Items Grouped */}
          <nav className="px-3 space-y-5 overflow-y-auto max-h-[calc(100vh-210px)]">
            {navGroups.map((group, gIdx) => (
              <div key={gIdx} className="space-y-1">
                <div className="px-3 text-[10px] font-bold uppercase tracking-wider text-slate-400 mb-1">
                  {group.title}
                </div>
                {group.items.map((item) => {
                  const Icon = item.icon;
                  const isActive = activeTab === item.id;
                  return (
                    <button
                      key={item.id}
                      onClick={() => {
                        setActiveTab(item.id as any);
                        setSidebarOpen(false);
                      }}
                      className={`w-full flex items-center justify-between px-3 py-2 rounded-xl text-xs font-semibold transition-all cursor-pointer ${
                        isActive
                          ? 'bg-[#004281] text-white shadow-xs'
                          : 'text-slate-600 dark:text-slate-400 hover:bg-slate-100 dark:hover:bg-slate-800/60 hover:text-slate-900 dark:hover:text-white'
                      }`}
                    >
                      <div className="flex items-center gap-2.5">
                        <Icon className={`w-4 h-4 ${isActive ? 'text-white' : 'text-slate-400'}`} />
                        <span>{item.label}</span>
                      </div>
                      {item.badge && (
                        <span
                          className={`text-[10px] font-bold px-2 py-0.5 rounded-full font-mono ${
                            isActive
                              ? 'bg-white text-[#004281]'
                              : 'bg-emerald-50 text-[#00A651] dark:bg-emerald-950/60 dark:text-emerald-300'
                          }`}
                        >
                          {item.badge}
                        </span>
                      )}
                    </button>
                  );
                })}
              </div>
            ))}
          </nav>
        </div>

        {/* Sidebar Footer: Super Admin Profile & Exit */}
        <div className="p-4 border-t border-slate-100 dark:border-slate-800 bg-slate-50/50 dark:bg-slate-900/40">
          <div className="flex items-center justify-between gap-2">
            <div className="flex items-center gap-2 min-w-0">
              <div className="w-8 h-8 rounded-full bg-[#004281]/10 dark:bg-blue-500/20 text-[#004281] dark:text-blue-400 flex items-center justify-center font-bold text-xs shrink-0">
                SA
              </div>
              <div className="min-w-0">
                <p className="text-xs font-bold text-slate-800 dark:text-slate-200 truncate">
                  Executive Admin
                </p>
                <p className="text-[10px] text-emerald-600 dark:text-emerald-400 font-mono truncate">
                  Super Authority
                </p>
              </div>
            </div>

            <button
              onClick={() => setCurrentView('AUTH_LOGIN')}
              title="Exit Admin Console"
              className="p-1.5 rounded-lg text-slate-400 hover:text-rose-600 hover:bg-rose-50 dark:hover:bg-rose-950/40 transition-colors cursor-pointer"
            >
              <LogOut className="w-4 h-4" />
            </button>
          </div>
        </div>
      </aside>

      {/* 2. MAIN CONTENT AREA */}
      <div className="flex-1 flex flex-col min-w-0">
        {/* Top Header Bar */}
        <header className="sticky top-0 z-30 h-16 bg-white/90 dark:bg-[#0f172a]/90 backdrop-blur-md border-b border-slate-200/80 dark:border-slate-800 px-4 sm:px-8 flex items-center justify-between gap-4">
          <div className="flex items-center gap-3">
            <button
              onClick={() => setSidebarOpen(true)}
              className="p-2 rounded-lg text-slate-600 dark:text-slate-300 hover:bg-slate-100 dark:hover:bg-slate-800 lg:hidden cursor-pointer"
            >
              <Menu className="w-5 h-5" />
            </button>
            <div>
              <h1 className="text-base sm:text-lg font-bold text-slate-900 dark:text-white tracking-tight">
                {navGroups.flatMap(g => g.items).find(i => i.id === activeTab)?.label || 'Admin Portal'}
              </h1>
              <span className="text-[11px] text-slate-400 hidden sm:inline">
                Live Clearing &amp; Institutional Ledger Controls
              </span>
            </div>
          </div>

          <div className="flex items-center gap-2 sm:gap-3">
            <div className="hidden md:block">
              <SupabaseStatusChecker compact showCard />
            </div>

            <button
              onClick={() => {
                fetchAdminStats();
                fetchApplications();
                fetchAuditLogs();
                fetchAdminNotifications();
                showToast('INFO', 'Synchronized', 'Live ledger data updated.');
              }}
              className="px-3 py-1.5 rounded-lg bg-slate-100 dark:bg-slate-800 hover:bg-slate-200 dark:hover:bg-slate-700 text-slate-700 dark:text-slate-300 text-xs font-semibold flex items-center gap-1.5 transition-colors cursor-pointer"
              title="Refresh Live Data"
            >
              <RefreshCw className="w-3.5 h-3.5" />
              <span className="hidden sm:inline">Sync Data</span>
            </button>

            <button
              onClick={() => setIsCreateCustomerOpen(true)}
              className="px-3.5 py-1.5 rounded-lg bg-[#00A651] hover:bg-[#008f45] text-white font-bold text-xs flex items-center gap-1.5 shadow-xs transition-colors cursor-pointer"
            >
              <Plus className="w-3.5 h-3.5" />
              <span>+ New Customer</span>
            </button>
          </div>
        </header>

        {/* Main Content Body */}
        <main className="p-3 sm:p-6 lg:p-8 space-y-4 sm:space-y-6 max-w-7xl">
          {/* 3. 4 STAT CARDS ON TOP (Compact, Fit, Mobile-First) */}
          <section className="grid grid-cols-2 lg:grid-cols-4 gap-2.5 sm:gap-3.5">
            {/* Stat Card 1: Total Managed Liquidity */}
            <div className="bg-white dark:bg-[#0f172a] rounded-xl p-3 sm:p-3.5 border border-slate-200/80 dark:border-slate-800 shadow-xs space-y-0.5 sm:space-y-1">
              <span className="text-[10px] sm:text-[11px] font-semibold text-slate-400 uppercase tracking-wider block truncate">
                Managed Assets
              </span>
              <div className="text-sm sm:text-base md:text-lg font-bold font-mono text-[#004281] dark:text-blue-400 truncate">
                <CurrencyDisplay
                  amountMinor={adminStats?.totalManagedAssetsUsdMinor || 148200000}
                  currency="USD"
                  size="md"
                  className="font-bold text-[#004281] dark:text-blue-400 font-mono text-xs sm:text-sm md:text-base"
                />
              </div>
              <div className="flex items-center gap-1 text-[10px] text-[#00A651] font-semibold truncate">
                <TrendingUp className="w-3 h-3 shrink-0" />
                <span>+14.2% Growth</span>
              </div>
            </div>

            {/* Stat Card 2: Customer Accounts */}
            <div className="bg-white dark:bg-[#0f172a] rounded-xl p-3 sm:p-3.5 border border-slate-200/80 dark:border-slate-800 shadow-xs space-y-0.5 sm:space-y-1">
              <span className="text-[10px] sm:text-[11px] font-semibold text-slate-400 uppercase tracking-wider block truncate">
                Accounts
              </span>
              <div className="text-sm sm:text-base md:text-lg font-bold font-mono text-slate-900 dark:text-white truncate">
                {accounts.length} Custody
              </div>
              <div className="flex items-center gap-1 text-[10px] text-slate-500 font-mono truncate">
                <span className="w-1.5 h-1.5 rounded-full bg-[#00A651] shrink-0" />
                <span>US • UK • EU</span>
              </div>
            </div>

            {/* Stat Card 3: Pending KYC Onboarding */}
            <div className="bg-white dark:bg-[#0f172a] rounded-xl p-3 sm:p-3.5 border border-slate-200/80 dark:border-slate-800 shadow-xs space-y-0.5 sm:space-y-1">
              <span className="text-[10px] sm:text-[11px] font-semibold text-slate-400 uppercase tracking-wider block truncate">
                Pending KYC
              </span>
              <div className="text-sm sm:text-base md:text-lg font-bold font-mono text-[#004281] dark:text-blue-400 truncate">
                {adminStats?.pendingApplicationsCount || 0} In Review
              </div>
              <div className="flex items-center gap-1 text-[10px] text-amber-600 dark:text-amber-400 font-semibold truncate">
                <ShieldCheck className="w-3 h-3 shrink-0" />
                <span>AML Clearance</span>
              </div>
            </div>

            {/* Stat Card 4: Clearing Desks */}
            <div className="bg-white dark:bg-[#0f172a] rounded-xl p-3 sm:p-3.5 border border-slate-200/80 dark:border-slate-800 shadow-xs space-y-0.5 sm:space-y-1">
              <span className="text-[10px] sm:text-[11px] font-semibold text-slate-400 uppercase tracking-wider block truncate">
                Clearing Desks
              </span>
              <div className="text-sm sm:text-base md:text-lg font-bold font-mono text-[#00A651] dark:text-emerald-400 truncate">
                Active &amp; Ready
              </div>
              <div className="flex items-center gap-1 text-[10px] text-slate-500 font-mono truncate">
                <span>Fedwire • SEPA</span>
              </div>
            </div>
          </section>

          {/* 4. MAIN TAB VIEWS (Clean Tables, Grouped, More Whitespace) */}
          <div className="animate-in fade-in duration-150">
            {/* TAB 1: DIRECT FUNDS MANAGER */}
            {activeTab === 'FUNDS' && (
              <div className="space-y-6">
                <DirectFundsManager />
              </div>
            )}

            {/* TAB 2: USER DETAILS & KYC */}
            {activeTab === 'USERS' && <UserDetailsInspector key={`inspector_${dashboardRefreshKey}`} />}

            {/* TAB 3: TRANSACTION HISTORY & LEDGER */}
            {activeTab === 'TRANSACTIONS' && <TransactionHistoryManager />}

            {/* TAB 4: BANK RECEIVING ACCOUNTS */}
            {activeTab === 'RECEIVING_ACCOUNTS' && <TreasuryReceivingAccountsTab />}

            {/* TAB 5: APPLICATIONS & KYC APPROVALS */}
            {activeTab === 'APPLICATIONS' && (
              <div className="bg-white dark:bg-[#0f172a] rounded-2xl border border-slate-200/80 dark:border-slate-800 p-6 shadow-2xs space-y-5">
                <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
                  <div>
                    <h2 className="text-base font-bold text-slate-900 dark:text-white flex items-center gap-2">
                      <FileCheck2 className="w-5 h-5 text-[#004281] dark:text-blue-400" />
                      <span>Account Applications &amp; KYC Verification Dossiers</span>
                    </h2>
                    <p className="text-xs text-slate-500">
                      Inspect client identity submissions, regulatory risk rating, and issue verified IBAN clearance
                    </p>
                  </div>

                  <div className="flex items-center gap-2">
                    <select
                      value={appFilter}
                      onChange={e => setAppFilter(e.target.value as any)}
                      className="px-3 py-1.5 text-xs rounded-xl border border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-800 font-semibold text-slate-800 dark:text-slate-200"
                    >
                      <option value="ALL">All Applications</option>
                      <option value="PENDING">Pending Review</option>
                      <option value="APPROVED">Approved</option>
                      <option value="REJECTED">Rejected</option>
                    </select>
                  </div>
                </div>

                {/* Applications Clean Table */}
                <div className="divide-y divide-slate-100 dark:divide-slate-800">
                  {filteredApps.length === 0 ? (
                    <div className="p-8 text-center text-slate-400 text-xs">
                      No applications found matching your criteria.
                    </div>
                  ) : (
                    filteredApps.map(app => (
                      <div
                        key={app.id}
                        className="py-4 flex flex-col lg:flex-row lg:items-center justify-between gap-3 hover:bg-slate-50/80 dark:hover:bg-slate-800/40 p-3.5 rounded-xl transition-colors border border-transparent hover:border-slate-200/50 dark:hover:border-slate-700/50"
                      >
                        <div className="space-y-1.5 min-w-0">
                          <div className="flex items-center gap-2 flex-wrap">
                            <span className="text-xs font-bold text-slate-900 dark:text-white">
                              {app.firstName} {app.lastName}
                            </span>
                            <span className="text-[10px] font-bold px-2 py-0.5 rounded bg-slate-100 dark:bg-slate-800 text-slate-700 dark:text-slate-300 font-mono">
                              {app.accountTypeRequested || (app as any).requestedAccountType} ({app.currency || (app as any).requestedCurrency})
                            </span>
                            <StatusBadge status={app.status} size="xs" />
                          </div>
                          <div className="flex items-center gap-2.5 text-[11px] text-slate-500 dark:text-slate-400 font-mono flex-wrap">
                            <span>{app.email}</span>
                            <span>•</span>
                            <span>Ref: <strong className="text-slate-700 dark:text-slate-300">{app.referenceNumber}</strong></span>
                            <span>•</span>
                            <span>Deposit: ${(((app.initialDepositMinor || (app as any).initialDepositAmountMinor || 0)) / 100).toLocaleString()}</span>
                            <span>•</span>
                            <span className="inline-flex items-center gap-1.5 text-slate-700 dark:text-slate-200 bg-slate-100 dark:bg-slate-800/90 px-2.5 py-0.5 rounded-md text-[10.5px] font-sans border border-slate-200/80 dark:border-slate-700/80">
                              <Calendar className="w-3 h-3 text-[#004281] dark:text-sky-400 shrink-0" />
                              <span className="text-slate-500 dark:text-slate-400">Submitted:</span>
                              <span className="font-semibold text-slate-900 dark:text-slate-100 font-mono">{formatDateTime(app.submittedAt || (app as any).createdAt)}</span>
                            </span>
                            {app.reviewedAt && (
                              <span className="inline-flex items-center gap-1.5 text-emerald-700 dark:text-emerald-300 bg-emerald-50 dark:bg-emerald-950/60 px-2 py-0.5 rounded-md text-[10.5px] font-sans border border-emerald-200 dark:border-emerald-800/70">
                                <Clock className="w-3 h-3 text-emerald-600 dark:text-emerald-400 shrink-0" />
                                <span className="text-emerald-600/75 dark:text-emerald-400/75">Reviewed:</span>
                                <span className="font-semibold font-mono">{formatDateTime(app.reviewedAt)}</span>
                              </span>
                            )}
                          </div>
                        </div>

                        <div className="flex items-center gap-2 shrink-0">
                          <button
                            onClick={() => setEditingApplication(app)}
                            className="px-3 py-1.5 rounded-lg border border-slate-200 dark:border-slate-700 hover:bg-slate-100 dark:hover:bg-slate-800 text-slate-700 dark:text-slate-200 text-xs font-semibold transition-colors cursor-pointer"
                          >
                            Edit Dossier
                          </button>
                          <button
                            onClick={() => setSelectedAppDossier(app)}
                            className="px-3.5 py-1.5 rounded-lg bg-[#004281] hover:bg-[#003366] text-white text-xs font-semibold transition-colors cursor-pointer"
                          >
                            Review Dossier
                          </button>
                        </div>
                      </div>
                    ))
                  )}
                </div>
              </div>
            )}

            {/* TAB 6: NOTIFICATIONS */}
            {activeTab === 'NOTIFICATIONS' && <AdminNotificationsTab />}

            {/* TAB 7: SECURITY AUDIT LOGS & CLOUD DIAGNOSTICS */}
            {activeTab === 'AUDIT_LOGS' && (
              <div className="space-y-6">
                <SupabaseStatusChecker autoCheck showCard />

                <div className="bg-white dark:bg-[#0f172a] rounded-2xl border border-slate-200/80 dark:border-slate-800 p-6 shadow-2xs space-y-4">
                  <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
                    <div>
                      <h2 className="text-base font-bold text-slate-900 dark:text-white flex items-center gap-2">
                        <ShieldCheck className="w-5 h-5 text-[#004281] dark:text-blue-400" />
                        <span>Security &amp; Audit Journal</span>
                      </h2>
                      <p className="text-xs text-slate-500">
                        Authoritative cryptographic log of administrative and ledger changes
                      </p>
                    </div>

                    <div className="relative w-full sm:w-64">
                      <Search className="w-4 h-4 text-slate-400 absolute left-3 top-2.5" />
                      <input
                        type="text"
                        placeholder="Search audit logs..."
                        value={auditSearch}
                        onChange={e => setAuditSearch(e.target.value)}
                        className="w-full pl-9 pr-3 py-1.5 text-xs rounded-xl border border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-800 text-slate-900 dark:text-white"
                      />
                    </div>
                  </div>

                  <div className="divide-y divide-slate-100 dark:divide-slate-800 max-h-[600px] overflow-y-auto">
                    {auditLogs
                      .filter(l =>
                        (l.action || '').toLowerCase().includes(auditSearch.toLowerCase()) ||
                        (l.details || '').toLowerCase().includes(auditSearch.toLowerCase()) ||
                        (l.actorEmail || l.actorUsername || l.actorId || (l as any).adminId || '').toLowerCase().includes(auditSearch.toLowerCase())
                      )
                      .map(log => (
                        <div key={log.id} className="py-3 text-xs flex items-start gap-3">
                          <div className="p-2 rounded-xl bg-slate-100 dark:bg-slate-800 text-[#004281] dark:text-blue-400 shrink-0 mt-0.5">
                            <FileCode className="w-4 h-4" />
                          </div>
                          <div className="min-w-0 flex-1">
                            <div className="flex items-center justify-between gap-2">
                              <span className="font-bold text-slate-900 dark:text-white font-mono">{log.action}</span>
                              <span className="text-[10px] text-slate-400 font-mono">
                                {log.timestamp ? `${new Date(log.timestamp).toLocaleTimeString()} • ${new Date(log.timestamp).toLocaleDateString()}` : 'Recent'}
                              </span>
                            </div>
                            <p className="text-slate-600 dark:text-slate-300 text-[11px] mt-0.5">{log.details}</p>
                            <div className="text-[10px] text-slate-400 font-mono mt-1">
                              Actor: {log.actorEmail || log.actorUsername || log.actorId || (log as any).adminId || 'System'} • IP: {log.ipAddress || '127.0.0.1'} • Hash: {(log.signatureHash || (log as any).checksumHash || (log as any).checksum || log.id || '').slice(0, 16)}...
                            </div>
                          </div>
                        </div>
                      ))}
                  </div>
                </div>
              </div>
            )}
          </div>
        </main>
      </div>

      {/* APPLICATION REVIEW DOSSIER MODAL */}
      {selectedAppDossier && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/70 backdrop-blur-xs">
          <div className="bg-white dark:bg-[#0f172a] rounded-2xl max-w-2xl w-full overflow-hidden shadow-2xl border border-slate-200 dark:border-slate-800 text-slate-800 dark:text-slate-200">
            <div className="p-5 bg-[#004281] text-white flex items-center justify-between">
              <div>
                <div className="flex items-center gap-2">
                  <h3 className="text-base font-bold">Customer Onboarding Dossier</h3>
                  <StatusBadge status={selectedAppDossier.status} size="xs" />
                </div>
                <div className="flex items-center gap-2.5 text-[11px] text-blue-100 font-mono mt-1 flex-wrap">
                  <span>Ref: {selectedAppDossier.referenceNumber}</span>
                  <span>•</span>
                  <span className="inline-flex items-center gap-1 text-sky-200">
                    <Calendar className="w-3.5 h-3.5" />
                    <span>Submitted: {formatDateTime(selectedAppDossier.submittedAt || (selectedAppDossier as any).createdAt)}</span>
                  </span>
                  {selectedAppDossier.reviewedAt && (
                    <>
                      <span>•</span>
                      <span className="inline-flex items-center gap-1 text-emerald-300">
                        <Clock className="w-3.5 h-3.5" />
                        <span>Reviewed: {formatDateTime(selectedAppDossier.reviewedAt)}</span>
                      </span>
                    </>
                  )}
                </div>
              </div>
              <div className="flex items-center gap-2">
                <button
                  onClick={() => {
                    const app = selectedAppDossier;
                    setSelectedAppDossier(null);
                    setEditingApplication(app);
                  }}
                  className="px-3 py-1 rounded-lg bg-white/20 hover:bg-white/30 text-white text-xs font-semibold transition-colors cursor-pointer"
                >
                  Edit Details
                </button>
                <button
                  onClick={() => setSelectedAppDossier(null)}
                  className="text-white/80 hover:text-white cursor-pointer"
                >
                  <X className="w-5 h-5" />
                </button>
              </div>
            </div>

            <div className="p-6 space-y-4 max-h-[80vh] overflow-y-auto text-xs">
              <div className="grid grid-cols-2 gap-4">
                {/* 1. Date and Time Submission & Audit Box */}
                <div className="p-3.5 rounded-xl bg-slate-50 dark:bg-slate-900 border border-slate-200/80 dark:border-slate-800 col-span-2 shadow-2xs">
                  <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
                    <div className="space-y-1">
                      <span className="text-[10px] text-slate-500 dark:text-slate-400 font-bold uppercase tracking-wider block flex items-center gap-1.5">
                        <Calendar className="w-3.5 h-3.5 text-[#004281] dark:text-sky-400" />
                        Application Submission Date &amp; Time
                      </span>
                      <div className="font-bold text-slate-900 dark:text-white text-xs sm:text-sm font-mono flex items-center gap-2">
                        <span>{formatDateTime(selectedAppDossier.submittedAt || (selectedAppDossier as any).createdAt)}</span>
                        <span className="text-[10px] font-sans font-medium px-2 py-0.5 rounded bg-slate-200/80 dark:bg-slate-800 text-slate-600 dark:text-slate-300">
                          UTC Logged
                        </span>
                      </div>
                    </div>

                    <div className="space-y-1 sm:text-right">
                      <span className="text-[10px] text-slate-500 dark:text-slate-400 font-bold uppercase tracking-wider block flex sm:justify-end items-center gap-1.5">
                        <Clock className="w-3.5 h-3.5 text-emerald-600 dark:text-emerald-400" />
                        KYC Compliance Review Timestamp
                      </span>
                      {selectedAppDossier.reviewedAt ? (
                        <div className="font-bold text-emerald-700 dark:text-emerald-400 text-xs sm:text-sm font-mono">
                          {formatDateTime(selectedAppDossier.reviewedAt)}
                          {selectedAppDossier.reviewedByAdminName && (
                            <span className="block text-[10px] font-sans text-slate-500 dark:text-slate-400 font-normal">
                              Officer: {selectedAppDossier.reviewedByAdminName}
                            </span>
                          )}
                        </div>
                      ) : (
                        <div className="inline-flex items-center gap-1 px-2.5 py-1 rounded-lg bg-amber-500/10 border border-amber-500/20 text-amber-700 dark:text-amber-300 font-semibold text-[11px]">
                          <Clock className="w-3 h-3 text-amber-500" />
                          <span>Awaiting Compliance Review</span>
                        </div>
                      )}
                    </div>
                  </div>
                </div>

                <div className="p-3.5 rounded-xl bg-slate-50 dark:bg-slate-900 border border-slate-200/60 dark:border-slate-800">
                  <span className="text-[10px] text-slate-400 font-bold uppercase block">Applicant Name</span>
                  <div className="font-bold text-slate-900 dark:text-white text-sm mt-0.5">
                    {selectedAppDossier.firstName} {selectedAppDossier.lastName}
                  </div>
                </div>

                <div className="p-3.5 rounded-xl bg-slate-50 dark:bg-slate-900 border border-slate-200/60 dark:border-slate-800">
                  <span className="text-[10px] text-slate-400 font-bold uppercase block">Email &amp; Phone</span>
                  <div className="font-semibold text-slate-800 dark:text-slate-200 mt-0.5">
                    {selectedAppDossier.email}<br />{selectedAppDossier.phone}
                  </div>
                </div>

                <div className="p-3.5 rounded-xl bg-slate-50 dark:bg-slate-900 border border-slate-200/60 dark:border-slate-800">
                  <span className="text-[10px] text-slate-400 font-bold uppercase block">Account Requested</span>
                  <div className="font-bold text-slate-900 dark:text-white mt-0.5">
                    {selectedAppDossier.accountTypeRequested || (selectedAppDossier as any).requestedAccountType} ({selectedAppDossier.currency || (selectedAppDossier as any).requestedCurrency})
                  </div>
                </div>

                <div className="p-3.5 rounded-xl bg-slate-50 dark:bg-slate-900 border border-slate-200/60 dark:border-slate-800">
                  <span className="text-[10px] text-slate-400 font-bold uppercase block">Declared Net Worth / Income</span>
                  <div className="font-bold text-[#00A651] mt-0.5">
                    {selectedAppDossier.annualIncome || '$250,000+'} • Net Worth: {selectedAppDossier.estimatedNetWorth || '$1.5M+'}
                  </div>
                </div>

                <div className="p-3.5 rounded-xl bg-slate-50 dark:bg-slate-900 border border-slate-200/60 dark:border-slate-800 col-span-2">
                  <span className="text-[10px] text-slate-400 font-bold uppercase block">Residential Address</span>
                  <div className="text-slate-800 dark:text-slate-200 mt-0.5">
                    {formatAddress(selectedAppDossier.address) || `${selectedAppDossier.city || ''}, ${selectedAppDossier.country || ''}`}
                  </div>
                </div>
              </div>

              {selectedAppDossier.status === 'PENDING' && (
                <div className="space-y-3 pt-3 border-t border-slate-200 dark:border-slate-800">
                  <div className="space-y-1">
                    <label className="font-bold text-slate-700 dark:text-slate-300">Approval Compliance Memo</label>
                    <input
                      type="text"
                      value={approvalNotes}
                      onChange={e => setApprovalNotes(e.target.value)}
                      className="w-full px-3 py-2 rounded-xl border border-slate-300 dark:border-slate-700 bg-white dark:bg-slate-800 text-slate-900 dark:text-white"
                    />
                  </div>

                  <div className="flex items-center justify-end gap-3 pt-2">
                    <button
                      type="button"
                      onClick={() => handleRejectApp(selectedAppDossier.id)}
                      disabled={isProcessingApp}
                      className="px-4 py-2 rounded-xl bg-rose-50 dark:bg-rose-950/60 hover:bg-rose-100 text-rose-700 dark:text-rose-400 font-bold border border-rose-200 dark:border-rose-800 transition-colors"
                    >
                      Reject Application
                    </button>
                    <button
                      type="button"
                      onClick={() => handleApproveApp(selectedAppDossier.id)}
                      disabled={isProcessingApp}
                      className="px-5 py-2 rounded-xl bg-[#00A651] hover:bg-[#008f45] text-white font-bold flex items-center gap-1.5 shadow-md transition-colors"
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

      {/* CREATE NEW CUSTOMER MODAL */}
      <CreateCustomerModal
        isOpen={isCreateCustomerOpen}
        onClose={() => setIsCreateCustomerOpen(false)}
        onSuccess={async () => {
          setDashboardRefreshKey(k => k + 1);
          await Promise.all([fetchApplications(), fetchAdminStats()]);
        }}
      />

      {/* EDIT APPLICATION DOSSIER MODAL */}
      <EditApplicationModal
        isOpen={!!editingApplication}
        application={editingApplication}
        onClose={() => setEditingApplication(null)}
        onSuccess={async () => {
          await Promise.all([fetchApplications(), fetchAdminStats()]);
        }}
      />
    </div>
  );
};

