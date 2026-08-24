import React, { useState } from 'react';
import { useBank } from '../../context/BankContext';
import { CurrencyDisplay } from '../../components/common/CurrencyDisplay';
import { StatusBadge } from '../../components/common/StatusBadge';
import { motion, AnimatePresence } from 'motion/react';
import {
  ArrowLeftRight,
  Receipt,
  ArrowUpRight,
  ArrowDownLeft,
  Camera,
  CreditCard,
  FileText,
  ShieldCheck,
  TrendingUp,
  Landmark,
  Eye,
  EyeOff,
  ChevronRight,
  Calendar,
  Lock,
  ExternalLink,
  Search,
  Download,
  Fingerprint,
  Moon,
  Sun,
  Copy,
  Check,
  Zap,
  Sparkles,
  PieChart,
  Shield,
  KeyRound,
  FileCheck,
  UserCheck,
  Layers,
  BarChart3
} from 'lucide-react';
import { BankAccount, LedgerEntry } from '../../types';
import { ResponsiveContainer, AreaChart, Area, XAxis, YAxis, Tooltip, CartesianGrid, BarChart, Bar } from 'recharts';

export const DashboardOverview: React.FC = () => {
  const {
    currentUser,
    accounts,
    recentTransactions,
    totalNetWorthUsdMinor,
    setCurrentView,
    setSelectedAccountId,
    region,
    darkMode,
    biometricState
  } = useBank();

  const [activeTab, setActiveTab] = useState<'overview' | 'growth' | 'activity' | 'vault'>('overview');
  const [maskBalances, setMaskBalances] = useState(false);
  const [selectedTx, setSelectedTx] = useState<LedgerEntry | null>(null);
  const [copiedField, setCopiedField] = useState<string | null>(null);
  const [activityFilter, setActivityFilter] = useState<'ALL' | 'CREDIT' | 'DEBIT'>('ALL');
  const [searchQuery, setSearchQuery] = useState('');

  // 6-month liquidity performance trend data
  const chartData = [
    { month: 'Mar', balance: 420000, yield: 1800 },
    { month: 'Apr', balance: 445000, yield: 1910 },
    { month: 'May', balance: 472000, yield: 2025 },
    { month: 'Jun', balance: 495000, yield: 2125 },
    { month: 'Jul', balance: 510000, yield: 2190 },
    { month: 'Aug', balance: Math.round(totalNetWorthUsdMinor / 100), yield: 2280 }
  ];

  const primaryChecking = accounts.find(a => a.type === 'CHECKING_PREMIER') || accounts[0];
  const savingsAccount = accounts.find(a => a.type === 'SAVINGS_HIGH_YIELD');
  const creditCardAccount = accounts.find(a => a.type === 'CREDIT_CARD_INFINITE');

  const handleCopy = (text: string, label: string) => {
    navigator.clipboard.writeText(text);
    setCopiedField(label);
    setTimeout(() => setCopiedField(null), 2000);
  };

  const filteredTransactions = (recentTransactions || [])
    .filter((tx) => {
      if (activityFilter === 'CREDIT') return tx.direction === 'CREDIT';
      if (activityFilter === 'DEBIT') return tx.direction === 'DEBIT';
      return true;
    })
    .filter((tx) => {
      if (!searchQuery.trim()) return true;
      const q = searchQuery.toLowerCase();
      return (
        tx.description.toLowerCase().includes(q) ||
        tx.counterparty.toLowerCase().includes(q) ||
        tx.referenceNumber.toLowerCase().includes(q)
      );
    });

  return (
    <div className="space-y-6 max-w-7xl mx-auto pb-12">
      {/* Top Welcome & Net Liquidity Card */}
      <div className="bg-[#0a192f] text-white rounded-2xl sm:rounded-3xl p-6 sm:p-8 border border-slate-800 dark:border-[#1e3656] shadow-xl relative overflow-hidden transition-all">
        <div className="absolute right-0 top-0 w-96 h-96 bg-radial from-[#1e4470]/30 to-transparent blur-3xl pointer-events-none" />

        <div className="relative z-10 flex flex-col md:flex-row md:items-center justify-between gap-6">
          <div className="space-y-1.5">
            <div className="flex flex-wrap items-center gap-2 text-xs font-semibold text-[#c5a880] uppercase tracking-wider font-mono">
              <span>{region === 'US' ? 'First Atlantic Private Banking (New York)' : 'First Atlantic UK Private Client (London)'}</span>
              <span className="w-1.5 h-1.5 rounded-full bg-emerald-400" />
              <span className="text-emerald-400 font-sans normal-case">Direct Clearing Active</span>
            </div>

            <h1 className="text-2xl sm:text-4xl font-bold font-serif text-white tracking-tight">
              Good {new Date().getHours() < 12 ? 'morning' : new Date().getHours() < 18 ? 'afternoon' : 'evening'}, {currentUser?.firstName || 'Client'}
            </h1>
            <div className="flex flex-wrap items-center gap-2 sm:gap-3 text-xs text-slate-300 pt-0.5">
              <span>Relationship Tier: <span className="text-[#e5ca95] font-semibold">{currentUser?.kycTier ? String(currentUser.kycTier).replace(/_/g, ' ') : 'Private Wealth'}</span></span>
              <span className="hidden sm:inline">•</span>
              <span>Client ID: <span className="font-mono bg-slate-800/80 px-2 py-0.5 rounded text-[#c5a880]">{currentUser?.username || 'jsterling'}</span></span>
              {currentUser?.hasPassportImage && (
                <>
                  <span className="hidden sm:inline">•</span>
                  <span className="inline-flex items-center gap-1 text-emerald-400 font-medium">
                    <UserCheck className="w-3.5 h-3.5" /> Passport Verified
                  </span>
                </>
              )}
            </div>
          </div>

          <div className="flex flex-wrap items-center gap-2.5 sm:gap-3">
            <button
              onClick={() => setMaskBalances(!maskBalances)}
              className="p-2.5 sm:px-3.5 sm:py-2.5 rounded-xl bg-[#112d50] hover:bg-[#183c6b] text-slate-300 hover:text-white border border-slate-700 text-xs flex items-center gap-2 transition-all cursor-pointer shadow-sm active:scale-95"
              title="Toggle Privacy Mask"
            >
              {maskBalances ? <EyeOff className="w-4 h-4 text-[#c5a880]" /> : <Eye className="w-4 h-4 text-[#c5a880]" />}
              <span className="text-xs font-semibold">{maskBalances ? 'Show Balances' : 'Mask Balances'}</span>
            </button>

            <button
              onClick={() => setCurrentView('DASHBOARD_TRANSFERS')}
              className="px-4 sm:px-5 py-2.5 rounded-xl bg-gradient-to-r from-[#c5a880] to-[#b39366] text-slate-950 font-bold text-xs uppercase tracking-wider shadow-md hover:brightness-105 transition-all flex items-center gap-2 cursor-pointer font-sans active:scale-95"
            >
              <ArrowUpRight className="w-4 h-4" />
              <span>Transfer / Wire</span>
            </button>
          </div>
        </div>

        {/* Big Balance Breakdown */}
        <div className="mt-8 pt-6 border-t border-slate-800/80 grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
          <div className="p-3 rounded-2xl bg-white/5 border border-white/10 backdrop-blur-xs">
            <span className="text-xs text-slate-400 uppercase tracking-wider font-medium block mb-1">
              Total Liquid Portfolio (USD)
            </span>
            {maskBalances ? (
              <span className="text-2xl font-bold font-mono tracking-widest text-slate-400">••••••••••</span>
            ) : (
              <CurrencyDisplay
                amountMinor={totalNetWorthUsdMinor}
                currency="USD"
                size="2xl"
                className="text-white"
              />
            )}
            <span className="text-[11px] text-emerald-400 flex items-center gap-1 mt-1 font-medium">
              <TrendingUp className="w-3 h-3" /> +5.15% APY compounding daily
            </span>
          </div>

          <div className="p-3 rounded-2xl bg-white/5 border border-white/10 backdrop-blur-xs">
            <span className="text-xs text-slate-400 uppercase tracking-wider font-medium block mb-1">
              Checking Available Funds
            </span>
            {maskBalances ? (
              <span className="text-xl font-bold font-mono text-slate-400">••••••••</span>
            ) : (
              <CurrencyDisplay
                amountMinor={primaryChecking?.availableBalanceMinor || 0}
                currency={primaryChecking?.currency || 'USD'}
                size="xl"
                className="text-white"
              />
            )}
            <span className="text-[11px] text-slate-400 block mt-1 font-mono">
              ABA: {primaryChecking?.routingNumber || '021000021'}
            </span>
          </div>

          <div className="p-3 rounded-2xl bg-white/5 border border-white/10 backdrop-blur-xs">
            <span className="text-xs text-slate-400 uppercase tracking-wider font-medium block mb-1">
              Apex High-Yield Savings
            </span>
            {maskBalances ? (
              <span className="text-xl font-bold font-mono text-slate-400">••••••••</span>
            ) : (
              <CurrencyDisplay
                amountMinor={savingsAccount?.balanceMinor || 0}
                currency={savingsAccount?.currency || 'USD'}
                size="xl"
                className="text-emerald-400"
              />
            )}
            <span className="text-[11px] text-emerald-400/90 block mt-1 font-mono">
              5.15% APY Daily Compound
            </span>
          </div>

          <div className="p-3 rounded-2xl bg-white/5 border border-white/10 backdrop-blur-xs">
            <span className="text-xs text-slate-400 uppercase tracking-wider font-medium block mb-1">
              Infinite Credit Card Limit
            </span>
            {maskBalances ? (
              <span className="text-xl font-bold font-mono text-slate-400">••••••••</span>
            ) : (
              <CurrencyDisplay
                amountMinor={creditCardAccount?.balanceMinor || 0}
                currency="USD"
                size="xl"
                className="text-amber-200"
              />
            )}
            <span className="text-[11px] text-slate-400 block mt-1">
              Available: $96,587.20 / $100k
            </span>
          </div>
        </div>
      </div>

      {/* Quick Action Navigation Grid */}
      <div className="grid grid-cols-3 sm:grid-cols-6 gap-2.5 sm:gap-3">
        <button
          onClick={() => setCurrentView('DASHBOARD_TRANSFERS')}
          className="p-3 sm:p-4 rounded-2xl bg-white dark:bg-[#0a192f] hover:bg-slate-50 dark:hover:bg-[#112a4a] border border-slate-200 dark:border-[#1e3656] shadow-2xs flex flex-col items-center text-center gap-1.5 sm:gap-2 transition-all active:scale-95 group cursor-pointer"
        >
          <div className="w-10 h-10 rounded-xl bg-[#0a192f] dark:bg-[#112a4a] text-[#d4af37] flex items-center justify-center group-hover:scale-105 transition-transform border border-[#c5a880]/30 shadow-xs">
            <ArrowLeftRight className="w-4 h-4 sm:w-5 sm:h-5" />
          </div>
          <span className="text-[11px] sm:text-xs font-bold text-slate-800 dark:text-slate-200">Transfer / Wire</span>
        </button>

        <button
          onClick={() => setCurrentView('DASHBOARD_BILLPAY')}
          className="p-3 sm:p-4 rounded-2xl bg-white dark:bg-[#0a192f] hover:bg-slate-50 dark:hover:bg-[#112a4a] border border-slate-200 dark:border-[#1e3656] shadow-2xs flex flex-col items-center text-center gap-1.5 sm:gap-2 transition-all active:scale-95 group cursor-pointer"
        >
          <div className="w-10 h-10 rounded-xl bg-[#0a192f] dark:bg-[#112a4a] text-[#d4af37] flex items-center justify-center group-hover:scale-105 transition-transform border border-[#c5a880]/30 shadow-xs">
            <Receipt className="w-4 h-4 sm:w-5 sm:h-5" />
          </div>
          <span className="text-[11px] sm:text-xs font-bold text-slate-800 dark:text-slate-200">Pay Bills</span>
        </button>

        <button
          onClick={() => setCurrentView('DASHBOARD_DEPOSIT')}
          className="p-3 sm:p-4 rounded-2xl bg-white dark:bg-[#0a192f] hover:bg-slate-50 dark:hover:bg-[#112a4a] border border-slate-200 dark:border-[#1e3656] shadow-2xs flex flex-col items-center text-center gap-1.5 sm:gap-2 transition-all active:scale-95 group cursor-pointer"
        >
          <div className="w-10 h-10 rounded-xl bg-[#0a192f] dark:bg-[#112a4a] text-[#d4af37] flex items-center justify-center group-hover:scale-105 transition-transform border border-[#c5a880]/30 shadow-xs">
            <Camera className="w-4 h-4 sm:w-5 sm:h-5" />
          </div>
          <span className="text-[11px] sm:text-xs font-bold text-slate-800 dark:text-slate-200">Deposit Check</span>
        </button>

        <button
          onClick={() => setCurrentView('DASHBOARD_CARDS')}
          className="p-3 sm:p-4 rounded-2xl bg-white dark:bg-[#0a192f] hover:bg-slate-50 dark:hover:bg-[#112a4a] border border-slate-200 dark:border-[#1e3656] shadow-2xs flex flex-col items-center text-center gap-1.5 sm:gap-2 transition-all active:scale-95 group cursor-pointer"
        >
          <div className="w-10 h-10 rounded-xl bg-[#0a192f] dark:bg-[#112a4a] text-[#d4af37] flex items-center justify-center group-hover:scale-105 transition-transform border border-[#c5a880]/30 shadow-xs">
            <CreditCard className="w-4 h-4 sm:w-5 sm:h-5" />
          </div>
          <span className="text-[11px] sm:text-xs font-bold text-slate-800 dark:text-slate-200">Titanium Card</span>
        </button>

        <button
          onClick={() => setCurrentView('DASHBOARD_STATEMENTS')}
          className="p-3 sm:p-4 rounded-2xl bg-white dark:bg-[#0a192f] hover:bg-slate-50 dark:hover:bg-[#112a4a] border border-slate-200 dark:border-[#1e3656] shadow-2xs flex flex-col items-center text-center gap-1.5 sm:gap-2 transition-all active:scale-95 group cursor-pointer"
        >
          <div className="w-10 h-10 rounded-xl bg-[#0a192f] dark:bg-[#112a4a] text-[#d4af37] flex items-center justify-center group-hover:scale-105 transition-transform border border-[#c5a880]/30 shadow-xs">
            <FileText className="w-4 h-4 sm:w-5 sm:h-5" />
          </div>
          <span className="text-[11px] sm:text-xs font-bold text-slate-800 dark:text-slate-200">Statements</span>
        </button>

        <button
          onClick={() => setCurrentView('DASHBOARD_SECURITY')}
          className="p-3 sm:p-4 rounded-2xl bg-white dark:bg-[#0a192f] hover:bg-slate-50 dark:hover:bg-[#112a4a] border border-slate-200 dark:border-[#1e3656] shadow-2xs flex flex-col items-center text-center gap-1.5 sm:gap-2 transition-all active:scale-95 group cursor-pointer"
        >
          <div className="w-10 h-10 rounded-xl bg-[#0a192f] dark:bg-[#112a4a] text-[#d4af37] flex items-center justify-center group-hover:scale-105 transition-transform border border-[#c5a880]/30 shadow-xs">
            <ShieldCheck className="w-4 h-4 sm:w-5 sm:h-5" />
          </div>
          <span className="text-[11px] sm:text-xs font-bold text-slate-800 dark:text-slate-200">Security Vault</span>
        </button>
      </div>

      {/* Sleek Interactive Tab Switcher with Motion Indicator */}
      <div className="flex items-center justify-between border-b border-slate-200 dark:border-slate-800 pb-2 overflow-x-auto no-scrollbar gap-2">
        <div className="flex items-center gap-1.5 sm:gap-2 p-1 bg-slate-100 dark:bg-[#0a192f] rounded-2xl border border-slate-200 dark:border-[#1e3656]">
          {[
            { id: 'overview', label: 'Portfolio & Accounts', icon: Landmark },
            { id: 'growth', label: 'Growth & Analytics', icon: BarChart3 },
            { id: 'activity', label: 'Live Clearing Activity', icon: ArrowLeftRight },
            { id: 'vault', label: 'Security & Passport Audit', icon: ShieldCheck }
          ].map((tab) => {
            const Icon = tab.icon;
            const isSelected = activeTab === tab.id;
            return (
              <button
                key={tab.id}
                onClick={() => setActiveTab(tab.id as any)}
                className={`relative px-3.5 py-2 rounded-xl text-xs font-bold transition-all flex items-center gap-2 cursor-pointer whitespace-nowrap ${
                  isSelected
                    ? 'text-slate-900 dark:text-white'
                    : 'text-slate-600 dark:text-slate-400 hover:text-slate-900 dark:hover:text-white'
                }`}
              >
                {isSelected && (
                  <motion.div
                    layoutId="dashboardTab"
                    className="absolute inset-0 bg-white dark:bg-[#112d50] rounded-xl shadow-xs border border-slate-200/80 dark:border-[#c5a880]/40"
                    transition={{ type: 'spring', stiffness: 450, damping: 35 }}
                  />
                )}
                <span className="relative z-10 flex items-center gap-1.5">
                  <Icon className={`w-3.5 h-3.5 ${isSelected ? 'text-[#8c6d37] dark:text-[#c5a880]' : ''}`} />
                  <span>{tab.label}</span>
                </span>
              </button>
            );
          })}
        </div>

        <div className="hidden sm:flex items-center gap-2 text-xs font-mono text-slate-500">
          <span className="w-2 h-2 rounded-full bg-emerald-500 animate-pulse" />
          <span>Continuous Ledger Sync</span>
        </div>
      </div>

      {/* Tab Content Display */}
      <AnimatePresence mode="wait">
        {activeTab === 'overview' && (
          <motion.div
            key="overview"
            initial={{ opacity: 0, y: 8 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -8 }}
            transition={{ duration: 0.2 }}
            className="grid grid-cols-1 lg:grid-cols-12 gap-6"
          >
            {/* Left Column: Account Cards List */}
            <div className="lg:col-span-7 space-y-4">
              <div className="flex items-center justify-between">
                <h2 className="text-sm font-bold uppercase tracking-wider text-slate-800 dark:text-slate-200 font-serif">
                  Institutional Deposit &amp; Card Accounts
                </h2>
                <button
                  onClick={() => setCurrentView('DASHBOARD_ACCOUNT_DETAIL')}
                  className="text-xs font-semibold text-[#8c6d37] dark:text-[#c5a880] hover:underline flex items-center gap-1 cursor-pointer"
                >
                  <span>Routing Details</span>
                  <ChevronRight className="w-3.5 h-3.5" />
                </button>
              </div>

              <div className="space-y-3">
                {accounts.map((acc) => (
                  <div
                    key={acc.id}
                    onClick={() => {
                      setSelectedAccountId(acc.id);
                      setCurrentView('DASHBOARD_ACCOUNT_DETAIL');
                    }}
                    className="bg-white dark:bg-[#0a192f] rounded-2xl p-5 border border-slate-200 dark:border-[#1e3656] hover:border-[#c5a880]/70 dark:hover:border-[#c5a880] shadow-2xs hover:shadow-md transition-all cursor-pointer flex flex-col sm:flex-row sm:items-center justify-between gap-4 group"
                  >
                    <div className="space-y-1.5">
                      <div className="flex items-center gap-2">
                        <span className="text-sm font-bold text-slate-900 dark:text-white group-hover:text-[#8c6d37] dark:group-hover:text-[#c5a880] transition-colors">
                          {acc.name}
                        </span>
                        <StatusBadge status={acc.status} size="sm" />
                      </div>
                      <div className="flex flex-wrap items-center gap-2 text-xs text-slate-500 dark:text-slate-400 font-mono">
                        <span className="bg-slate-100 dark:bg-slate-800 px-2 py-0.5 rounded text-slate-700 dark:text-slate-300">
                          {acc.accountNumber}
                        </span>
                        <span>•</span>
                        <span>{acc.routingNumber ? `ABA: ${acc.routingNumber}` : `Sort: ${acc.sortCode}`}</span>
                        {acc.interestRateAPY && (
                          <>
                            <span>•</span>
                            <span className="text-emerald-700 dark:text-emerald-400 font-bold font-sans">{acc.interestRateAPY}% APY</span>
                          </>
                        )}
                      </div>
                    </div>

                    <div className="flex items-center justify-between sm:flex-col sm:items-end gap-1">
                      <div className="text-left sm:text-right space-y-0.5">
                        <div className="text-[11px] text-slate-400 font-medium">Available Balance</div>
                        {maskBalances ? (
                          <span className="text-lg font-bold font-mono text-slate-400">••••••••</span>
                        ) : (
                          <CurrencyDisplay
                            amountMinor={acc.availableBalanceMinor}
                            currency={acc.currency}
                            size="lg"
                            className="text-slate-900 dark:text-white"
                          />
                        )}
                      </div>

                      <div className="flex items-center gap-1.5 text-xs text-[#8c6d37] dark:text-[#c5a880] font-semibold opacity-0 group-hover:opacity-100 transition-opacity">
                        <span>Details</span>
                        <ChevronRight className="w-3.5 h-3.5" />
                      </div>
                    </div>
                  </div>
                ))}
              </div>

              {/* Instant Copy Card for Wire Ingress */}
              <div className="p-4 rounded-2xl bg-slate-50 dark:bg-[#071322] border border-slate-200 dark:border-slate-800 flex flex-col sm:flex-row sm:items-center justify-between gap-3 text-xs">
                <div className="space-y-0.5">
                  <span className="font-bold text-slate-900 dark:text-white flex items-center gap-1.5">
                    <Copy className="w-3.5 h-3.5 text-[#8c6d37] dark:text-[#c5a880]" />
                    Direct Fedwire / Swift Wire Ingress
                  </span>
                  <p className="text-slate-500 dark:text-slate-400 text-[11px]">
                    ABA Routing: <strong className="font-mono text-slate-700 dark:text-slate-300">021000021</strong> | SWIFT: <strong className="font-mono text-slate-700 dark:text-slate-300">FABUS33NYC</strong>
                  </p>
                </div>
                <button
                  onClick={() => handleCopy('ABA: 021000021 | SWIFT: FABUS33NYC', 'wire')}
                  className="px-3 py-1.5 rounded-lg bg-white dark:bg-[#112a4a] border border-slate-200 dark:border-slate-700 text-slate-800 dark:text-slate-200 font-semibold hover:bg-slate-100 dark:hover:bg-[#183c6b] transition-all flex items-center justify-center gap-1.5 cursor-pointer shrink-0"
                >
                  {copiedField === 'wire' ? <Check className="w-3.5 h-3.5 text-emerald-500" /> : <Copy className="w-3.5 h-3.5" />}
                  <span>{copiedField === 'wire' ? 'Copied' : 'Copy Wire Info'}</span>
                </button>
              </div>
            </div>

            {/* Right Column: Recent Authoritative Ledger */}
            <div className="lg:col-span-5 space-y-4">
              <div className="flex items-center justify-between">
                <h2 className="text-sm font-bold uppercase tracking-wider text-slate-800 dark:text-slate-200 font-serif">
                  Recent Ledger Entries
                </h2>
                <button
                  onClick={() => setActiveTab('activity')}
                  className="text-xs font-semibold text-[#8c6d37] dark:text-[#c5a880] hover:underline cursor-pointer"
                >
                  View All &rarr;
                </button>
              </div>

              <div className="bg-white dark:bg-[#0a192f] rounded-2xl border border-slate-200 dark:border-[#1e3656] shadow-2xs divide-y divide-slate-100 dark:divide-slate-800 overflow-hidden transition-colors">
                {(recentTransactions || []).slice(0, 5).map((tx) => (
                  <div
                    key={tx.id}
                    onClick={() => setSelectedTx(tx)}
                    className="p-3.5 hover:bg-slate-50 dark:hover:bg-slate-800/40 transition-colors cursor-pointer flex items-center justify-between gap-3"
                  >
                    <div className="flex items-center gap-3 min-w-0">
                      <div
                        className={`w-9 h-9 rounded-xl flex items-center justify-center shrink-0 ${
                          tx.direction === 'CREDIT'
                            ? 'bg-emerald-50 dark:bg-emerald-950/60 text-emerald-700 dark:text-emerald-400 border border-emerald-200 dark:border-emerald-800'
                            : 'bg-slate-100 dark:bg-slate-800 text-slate-700 dark:text-slate-300 border border-slate-200 dark:border-slate-700'
                        }`}
                      >
                        {tx.direction === 'CREDIT' ? (
                          <ArrowDownLeft className="w-4 h-4" />
                        ) : (
                          <ArrowUpRight className="w-4 h-4" />
                        )}
                      </div>
                      <div className="min-w-0">
                        <p className="text-xs font-bold text-slate-900 dark:text-white truncate">
                          {tx.description}
                        </p>
                        <div className="flex items-center gap-2 text-[10px] text-slate-500 dark:text-slate-400 font-mono">
                          <span>{new Date(tx.effectiveTimestamp).toLocaleDateString()}</span>
                          <span>•</span>
                          <span>{tx.category}</span>
                        </div>
                      </div>
                    </div>

                    <div className="text-right shrink-0">
                      <CurrencyDisplay
                        amountMinor={tx.amountMinor}
                        currency={tx.currency}
                        showSign={true}
                        size="sm"
                        className={tx.direction === 'CREDIT' ? 'text-emerald-700 dark:text-emerald-400' : 'text-slate-900 dark:text-white'}
                      />
                      <div className="mt-0.5">
                        <StatusBadge status={tx.status} size="sm" />
                      </div>
                    </div>
                  </div>
                ))}
              </div>

              {/* Quick Security Score Mini Card */}
              <div className="bg-gradient-to-br from-[#0a192f] to-[#112d50] text-white rounded-2xl p-5 border border-slate-800 dark:border-[#1e3656] space-y-3">
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-2">
                    <ShieldCheck className="w-5 h-5 text-[#d4af37]" />
                    <h4 className="text-xs font-bold uppercase tracking-wider text-white">
                      Security &amp; Device Integrity
                    </h4>
                  </div>
                  <span className="text-[11px] font-mono text-emerald-400 font-semibold bg-emerald-950/60 px-2 py-0.5 rounded border border-emerald-800">
                    98/100 SECURE
                  </span>
                </div>

                <p className="text-xs text-slate-300 leading-relaxed">
                  Cryptographic passkey and biometric audit validated. Master double-entry ledger is locked with FIPS 140-2 HSM protection.
                </p>

                <button
                  onClick={() => setActiveTab('vault')}
                  className="w-full py-2 bg-slate-800/80 hover:bg-slate-700 text-xs font-semibold text-slate-200 rounded-lg transition-colors text-center cursor-pointer border border-slate-700"
                >
                  Inspect Security &amp; Passport Credentials &rarr;
                </button>
              </div>
            </div>
          </motion.div>
        )}

        {activeTab === 'growth' && (
          <motion.div
            key="growth"
            initial={{ opacity: 0, y: 8 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -8 }}
            transition={{ duration: 0.2 }}
            className="space-y-6"
          >
            <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
              <div className="lg:col-span-8 bg-white dark:bg-[#0a192f] rounded-2xl sm:rounded-3xl p-6 sm:p-8 border border-slate-200 dark:border-[#1e3656] shadow-sm space-y-4">
                <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2">
                  <div>
                    <h3 className="text-lg font-bold font-serif text-slate-900 dark:text-white">
                      6-Month Portfolio Liquidity &amp; Yield Trajectory
                    </h3>
                    <p className="text-xs text-slate-500 dark:text-slate-400">
                      Compounded interest distributions vs net capital deposits
                    </p>
                  </div>
                  <span className="text-xs font-bold text-emerald-600 dark:text-emerald-400 bg-emerald-50 dark:bg-emerald-950/60 px-3 py-1 rounded-xl border border-emerald-200 dark:border-emerald-800 self-start">
                    +27.0% Net YTD
                  </span>
                </div>

                <div className="h-64 sm:h-72 w-full pt-4">
                  <ResponsiveContainer width="100%" height="100%">
                    <AreaChart data={chartData}>
                      <defs>
                        <linearGradient id="liquidityGrad" x1="0" y1="0" x2="0" y2="1">
                          <stop offset="5%" stopColor="#c5a880" stopOpacity={0.4} />
                          <stop offset="95%" stopColor="#c5a880" stopOpacity={0.0} />
                        </linearGradient>
                      </defs>
                      <CartesianGrid strokeDasharray="3 3" stroke={darkMode ? '#1e3656' : '#f1f5f9'} />
                      <XAxis dataKey="month" stroke={darkMode ? '#64748b' : '#94a3b8'} fontSize={12} />
                      <YAxis
                        stroke={darkMode ? '#64748b' : '#94a3b8'}
                        fontSize={12}
                        tickFormatter={(v) => `$${(v / 1000).toFixed(0)}k`}
                      />
                      <Tooltip
                        contentStyle={{
                          backgroundColor: darkMode ? '#0a192f' : '#ffffff',
                          borderColor: darkMode ? '#1e3656' : '#e2e8f0',
                          color: darkMode ? '#ffffff' : '#0f172a',
                          borderRadius: '0.75rem'
                        }}
                        formatter={(value: any) => [`$${Number(value).toLocaleString()}`, 'Portfolio Total']}
                      />
                      <Area
                        type="monotone"
                        dataKey="balance"
                        stroke="#c5a880"
                        strokeWidth={3}
                        fillOpacity={1}
                        fill="url(#liquidityGrad)"
                      />
                    </AreaChart>
                  </ResponsiveContainer>
                </div>
              </div>

              <div className="lg:col-span-4 space-y-4">
                <div className="bg-white dark:bg-[#0a192f] rounded-2xl sm:rounded-3xl p-6 border border-slate-200 dark:border-[#1e3656] shadow-sm space-y-4">
                  <h4 className="text-sm font-bold font-serif text-slate-900 dark:text-white uppercase tracking-wider">
                    Asset Allocation
                  </h4>
                  <div className="space-y-3 text-xs">
                    <div>
                      <div className="flex justify-between font-semibold mb-1">
                        <span className="text-slate-700 dark:text-slate-300">Apex High-Yield (5.15% APY)</span>
                        <span className="text-emerald-500 font-mono">68%</span>
                      </div>
                      <div className="w-full h-2 rounded-full bg-slate-100 dark:bg-slate-800 overflow-hidden">
                        <div className="h-full bg-emerald-500 rounded-full" style={{ width: '68%' }} />
                      </div>
                    </div>

                    <div>
                      <div className="flex justify-between font-semibold mb-1">
                        <span className="text-slate-700 dark:text-slate-300">Premier Checking (Liquidity)</span>
                        <span className="text-[#c5a880] font-mono">24%</span>
                      </div>
                      <div className="w-full h-2 rounded-full bg-slate-100 dark:bg-slate-800 overflow-hidden">
                        <div className="h-full bg-[#c5a880] rounded-full" style={{ width: '24%' }} />
                      </div>
                    </div>

                    <div>
                      <div className="flex justify-between font-semibold mb-1">
                        <span className="text-slate-700 dark:text-slate-300">Credit Reserve &amp; Escrow</span>
                        <span className="text-blue-400 font-mono">8%</span>
                      </div>
                      <div className="w-full h-2 rounded-full bg-slate-100 dark:bg-slate-800 overflow-hidden">
                        <div className="h-full bg-blue-400 rounded-full" style={{ width: '8%' }} />
                      </div>
                    </div>
                  </div>

                  <div className="pt-3 border-t border-slate-100 dark:border-slate-800 text-[11px] text-slate-500 dark:text-slate-400 leading-relaxed">
                    All balances are sovereignly protected under institutional FDIC / FSCS indemnification frameworks.
                  </div>
                </div>

                <div className="p-5 rounded-2xl bg-emerald-500/10 border border-emerald-500/30 text-xs text-emerald-800 dark:text-emerald-300 space-y-2">
                  <div className="flex items-center gap-2 font-bold">
                    <Sparkles className="w-4 h-4 text-emerald-500" />
                    <span>Projected Monthly Passive Yield</span>
                  </div>
                  <div className="text-2xl font-bold font-mono text-emerald-600 dark:text-emerald-400">
                    +$2,280.45 <span className="text-xs font-normal opacity-80">/ month</span>
                  </div>
                  <p className="text-[11px] opacity-90">
                    Daily compound yield credited on the 1st of every calendar month.
                  </p>
                </div>
              </div>
            </div>
          </motion.div>
        )}

        {activeTab === 'activity' && (
          <motion.div
            key="activity"
            initial={{ opacity: 0, y: 8 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -8 }}
            transition={{ duration: 0.2 }}
            className="bg-white dark:bg-[#0a192f] rounded-2xl sm:rounded-3xl p-6 sm:p-8 border border-slate-200 dark:border-[#1e3656] shadow-sm space-y-6"
          >
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
              <div>
                <h3 className="text-lg font-bold font-serif text-slate-900 dark:text-white">
                  Real-Time Authoritative Clearing Ledger
                </h3>
                <p className="text-xs text-slate-500 dark:text-slate-400">
                  Cryptographically hashed dual-entry transaction flow
                </p>
              </div>

              {/* Filters & Search */}
              <div className="flex flex-wrap items-center gap-2">
                <div className="relative">
                  <Search className="w-3.5 h-3.5 absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" />
                  <input
                    type="text"
                    value={searchQuery}
                    onChange={(e) => setSearchQuery(e.target.value)}
                    placeholder="Search ledger..."
                    className="pl-8 pr-3 py-1.5 rounded-xl bg-slate-100 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 text-xs text-slate-900 dark:text-white focus:outline-none focus:border-[#c5a880]"
                  />
                </div>

                <div className="flex items-center gap-1 p-1 bg-slate-100 dark:bg-slate-800 rounded-xl">
                  {['ALL', 'CREDIT', 'DEBIT'].map((f) => (
                    <button
                      key={f}
                      onClick={() => setActivityFilter(f as any)}
                      className={`px-3 py-1 rounded-lg text-xs font-bold transition-all cursor-pointer ${
                        activityFilter === f
                          ? 'bg-white dark:bg-[#112a4a] text-slate-900 dark:text-[#c5a880] shadow-xs'
                          : 'text-slate-500 dark:text-slate-400 hover:text-slate-800 dark:hover:text-white'
                      }`}
                    >
                      {f}
                    </button>
                  ))}
                </div>
              </div>
            </div>

            {/* Transactions Table / List */}
            <div className="divide-y divide-slate-100 dark:divide-slate-800">
              {filteredTransactions.map((tx) => (
                <div
                  key={tx.id}
                  onClick={() => setSelectedTx(tx)}
                  className="py-4 hover:bg-slate-50 dark:hover:bg-slate-800/30 px-3 rounded-xl transition-colors cursor-pointer flex flex-col sm:flex-row sm:items-center justify-between gap-3"
                >
                  <div className="flex items-center gap-3.5 min-w-0">
                    <div
                      className={`w-10 h-10 rounded-xl flex items-center justify-center shrink-0 ${
                        tx.direction === 'CREDIT'
                          ? 'bg-emerald-50 dark:bg-emerald-950/60 text-emerald-700 dark:text-emerald-400 border border-emerald-200 dark:border-emerald-800'
                          : 'bg-slate-100 dark:bg-slate-800 text-slate-700 dark:text-slate-300 border border-slate-200 dark:border-slate-700'
                      }`}
                    >
                      {tx.direction === 'CREDIT' ? (
                        <ArrowDownLeft className="w-5 h-5" />
                      ) : (
                        <ArrowUpRight className="w-5 h-5" />
                      )}
                    </div>

                    <div className="min-w-0 space-y-0.5">
                      <div className="flex items-center gap-2">
                        <span className="text-sm font-bold text-slate-900 dark:text-white truncate">
                          {tx.description}
                        </span>
                        <StatusBadge status={tx.status} size="sm" />
                      </div>
                      <div className="flex flex-wrap items-center gap-2 text-xs text-slate-500 dark:text-slate-400 font-mono">
                        <span>Ref: {tx.referenceNumber}</span>
                        <span>•</span>
                        <span>{tx.counterparty}</span>
                        <span>•</span>
                        <span>{new Date(tx.effectiveTimestamp).toLocaleString()}</span>
                      </div>
                    </div>
                  </div>

                  <div className="text-left sm:text-right shrink-0">
                    <CurrencyDisplay
                      amountMinor={tx.amountMinor}
                      currency={tx.currency}
                      showSign={true}
                      size="lg"
                      className={tx.direction === 'CREDIT' ? 'text-emerald-700 dark:text-emerald-400' : 'text-slate-900 dark:text-white'}
                    />
                    <div className="text-[11px] text-slate-400 font-mono mt-0.5">
                      Bal: ${(tx.balanceAfterMinor / 100).toLocaleString('en-US', { minimumFractionDigits: 2 })}
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </motion.div>
        )}

        {activeTab === 'vault' && (
          <motion.div
            key="vault"
            initial={{ opacity: 0, y: 8 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -8 }}
            transition={{ duration: 0.2 }}
            className="space-y-6"
          >
            <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
              {/* Sovereign Passport & Identity Verification Card */}
              <div className="lg:col-span-6 bg-white dark:bg-[#0a192f] rounded-2xl sm:rounded-3xl p-6 sm:p-8 border border-slate-200 dark:border-[#1e3656] shadow-sm space-y-5">
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-3">
                    <div className="w-12 h-12 rounded-2xl bg-emerald-50 dark:bg-emerald-950/60 text-emerald-600 dark:text-emerald-400 flex items-center justify-center border border-emerald-200 dark:border-emerald-800">
                      <UserCheck className="w-6 h-6" />
                    </div>
                    <div>
                      <h4 className="text-base font-bold font-serif text-slate-900 dark:text-white">
                        Sovereign Passport &amp; Identification
                      </h4>
                      <span className="text-xs font-mono text-emerald-600 dark:text-emerald-400 font-semibold">
                        VERIFIED &amp; BIOMETRICALLY LINKED
                      </span>
                    </div>
                  </div>
                  <span className="px-2.5 py-1 rounded-full bg-emerald-100 dark:bg-emerald-900/60 text-emerald-800 dark:text-emerald-200 text-[10px] font-bold font-mono">
                    TIER 3 KYC
                  </span>
                </div>

                <div className="p-4 rounded-2xl bg-slate-50 dark:bg-slate-900/60 border border-slate-200 dark:border-slate-800 space-y-3 text-xs">
                  <div className="flex justify-between">
                    <span className="text-slate-500">Legal Name:</span>
                    <span className="font-bold text-slate-900 dark:text-white">{currentUser?.firstName} {currentUser?.lastName}</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-slate-500">Declared Nationality:</span>
                    <span className="font-bold text-slate-900 dark:text-white">{currentUser?.nationality || 'United States'}</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-slate-500">Passport Number Hash:</span>
                    <span className="font-mono text-[#8c6d37] dark:text-[#c5a880] font-bold">
                      {currentUser?.passportNumber ? `••••${currentUser.passportNumber.slice(-4)}` : 'US-PASSPORT-••••4829'}
                    </span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-slate-500">Passport Expiry:</span>
                    <span className="font-mono text-slate-700 dark:text-slate-300">{currentUser?.passportExpiry || '2034-10-18'}</span>
                  </div>
                </div>

                <button
                  onClick={() => setCurrentView('DASHBOARD_PROFILE')}
                  className="w-full py-2.5 rounded-xl bg-slate-100 dark:bg-[#112a4a] hover:bg-slate-200 dark:hover:bg-[#183c6b] text-slate-800 dark:text-slate-200 font-semibold text-xs transition-colors flex items-center justify-center gap-2 cursor-pointer"
                >
                  <FileCheck className="w-4 h-4 text-[#8c6d37] dark:text-[#c5a880]" />
                  <span>Update KYC Passport Document</span>
                </button>
              </div>

              {/* 4-Digit Private Banking PIN Card */}
              <div className="lg:col-span-6 bg-white dark:bg-[#0a192f] rounded-2xl sm:rounded-3xl p-6 sm:p-8 border border-slate-200 dark:border-[#1e3656] shadow-sm space-y-5">
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-3">
                    <div className="w-12 h-12 rounded-2xl bg-[#0a192f] dark:bg-[#112a4a] text-[#d4af37] flex items-center justify-center border border-[#c5a880]/30">
                      <KeyRound className="w-6 h-6" />
                    </div>
                    <div>
                      <h4 className="text-base font-bold font-serif text-slate-900 dark:text-white">
                        4-Digit Private Banking PIN
                      </h4>
                      <span className="text-xs font-mono text-emerald-600 dark:text-emerald-400 font-semibold">
                        SECURITY STATUS: ACTIVE
                      </span>
                    </div>
                  </div>
                  <span className="px-2.5 py-1 rounded-full bg-slate-100 dark:bg-slate-800 text-slate-700 dark:text-slate-300 text-[10px] font-bold font-mono">
                    DUAL-AUTH
                  </span>
                </div>

                <p className="text-xs text-slate-600 dark:text-slate-300 leading-relaxed">
                  Your 4-digit PIN secures your passport verification checkpoint at login and authorizes high-value outgoing wires, wire templates, and card limit adjustments.
                </p>

                <div className="p-4 rounded-2xl bg-slate-50 dark:bg-slate-900/60 border border-slate-200 dark:border-slate-800 flex items-center justify-between text-xs font-mono">
                  <span className="text-slate-500">PIN Authorization Status:</span>
                  <span className="text-emerald-600 dark:text-emerald-400 font-bold">● ● ● ● (ENROLLED)</span>
                </div>

                <button
                  onClick={() => setCurrentView('DASHBOARD_PROFILE')}
                  className="w-full py-2.5 rounded-xl bg-[#0a192f] dark:bg-[#112a4a] hover:bg-[#153459] text-white font-semibold text-xs transition-colors flex items-center justify-center gap-2 cursor-pointer border border-[#c5a880]/30"
                >
                  <Lock className="w-4 h-4 text-[#c5a880]" />
                  <span>Change 4-Digit Banking PIN</span>
                </button>
              </div>
            </div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Transaction Detail Modal / Drawer */}
      {selectedTx && (
        <div className="fixed inset-0 z-50 bg-slate-950/80 backdrop-blur-xs flex items-center justify-center p-4">
          <div className="bg-white dark:bg-[#0a192f] rounded-2xl sm:rounded-3xl max-w-lg w-full p-6 sm:p-8 shadow-2xl border border-slate-200 dark:border-[#1e3656] space-y-5 animate-in fade-in zoom-in-95 duration-200 text-slate-900 dark:text-slate-100">
            <div className="flex items-center justify-between pb-3 border-b border-slate-100 dark:border-slate-800">
              <div>
                <span className="text-[10px] uppercase font-bold tracking-widest text-[#8c6d37] dark:text-[#c5a880]">
                  Authoritative Ledger Record
                </span>
                <h3 className="text-base font-bold text-slate-900 dark:text-white font-serif">
                  Transaction Receipt &amp; Cryptographic Proof
                </h3>
              </div>
              <button
                onClick={() => setSelectedTx(null)}
                className="text-slate-400 hover:text-slate-700 dark:hover:text-white text-xl font-bold p-1 cursor-pointer"
              >
                &times;
              </button>
            </div>

            <div className="text-center py-2 space-y-1">
              <div className="text-xs text-slate-500 dark:text-slate-400 font-medium">Transaction Amount</div>
              <CurrencyDisplay
                amountMinor={selectedTx.amountMinor}
                currency={selectedTx.currency}
                showSign={true}
                size="2xl"
                className={selectedTx.direction === 'CREDIT' ? 'text-emerald-700 dark:text-emerald-400' : 'text-slate-900 dark:text-white'}
              />
              <div className="pt-1">
                <StatusBadge status={selectedTx.status} />
              </div>
            </div>

            <div className="bg-slate-50 dark:bg-slate-900/70 rounded-xl p-4 border border-slate-200 dark:border-slate-800 space-y-2.5 text-xs text-slate-700 dark:text-slate-300 font-mono">
              <div className="flex justify-between">
                <span className="text-slate-500 dark:text-slate-400 font-sans">Reference Number:</span>
                <span className="font-bold text-[#c5a880]">{selectedTx.referenceNumber}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-slate-500 dark:text-slate-400 font-sans">Description:</span>
                <span className="font-sans font-medium text-slate-900 dark:text-white">{selectedTx.description}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-slate-500 dark:text-slate-400 font-sans">Counterparty:</span>
                <span className="font-sans font-medium text-slate-900 dark:text-white">{selectedTx.counterparty}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-slate-500 dark:text-slate-400 font-sans">Channel / Rail:</span>
                <span className="font-bold">{selectedTx.channel}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-slate-500 dark:text-slate-400 font-sans">Effective Date:</span>
                <span>{new Date(selectedTx.effectiveTimestamp).toLocaleString()}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-slate-500 dark:text-slate-400 font-sans">Balance After Entry:</span>
                <span className="font-bold">${(selectedTx.balanceAfterMinor / 100).toLocaleString('en-US', { minimumFractionDigits: 2 })}</span>
              </div>
            </div>

            <div className="flex gap-3">
              <button
                onClick={() => {
                  window.print();
                }}
                className="flex-1 py-2.5 rounded-xl border border-slate-300 dark:border-slate-700 text-slate-700 dark:text-slate-200 font-semibold text-xs flex items-center justify-center gap-1.5 hover:bg-slate-50 dark:hover:bg-slate-800 cursor-pointer"
              >
                <Download className="w-3.5 h-3.5" />
                <span>Export Proof (PDF)</span>
              </button>
              <button
                onClick={() => setSelectedTx(null)}
                className="flex-1 py-2.5 rounded-xl bg-[#0a192f] dark:bg-[#112a4a] text-white font-bold text-xs uppercase tracking-wider hover:bg-[#132d52] cursor-pointer border border-[#c5a880]/30"
              >
                Close
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
