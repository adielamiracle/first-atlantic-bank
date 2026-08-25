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
    <div className="space-y-4 sm:space-y-5 max-w-7xl mx-auto pb-8 font-boa">
      {/* Top Welcome & Net Liquidity Card */}
      <div className="bg-[#012169] text-white rounded-lg p-4 sm:p-6 border border-[#00174a] shadow-xs relative overflow-hidden transition-all">
        <div className="h-1 bg-[#d4001a] absolute top-0 inset-x-0" />

        <div className="relative z-10 flex flex-col md:flex-row md:items-center justify-between gap-4 pt-1">
          <div className="space-y-1">
            <div className="flex flex-wrap items-center gap-2 text-xs font-semibold text-slate-200">
              <span>{region === 'US' ? 'First Atlantic Private Banking (New York)' : 'First Atlantic UK Private Client (London)'}</span>
              <span className="w-1.5 h-1.5 rounded-full bg-emerald-400" />
              <span className="text-emerald-300 font-sans text-[11px]">Direct Clearing Active</span>
            </div>

            <h1 className="text-xl sm:text-2xl font-bold text-white tracking-tight">
              Good {new Date().getHours() < 12 ? 'morning' : new Date().getHours() < 18 ? 'afternoon' : 'evening'}, {currentUser?.firstName || 'Client'}
            </h1>
            <div className="flex flex-wrap items-center gap-2 text-xs text-slate-200 pt-0.5">
              <span>Relationship Tier: <strong className="text-white font-medium">{currentUser?.kycTier ? String(currentUser.kycTier).replace(/_/g, ' ') : 'Preferred Rewards'}</strong></span>
              <span className="hidden sm:inline opacity-60">•</span>
              <span>Online ID: <strong className="font-mono text-white">{currentUser?.username || 'jsterling'}</strong></span>
              {currentUser?.hasPassportImage && (
                <>
                  <span className="hidden sm:inline opacity-60">•</span>
                  <span className="inline-flex items-center gap-1 text-emerald-300 font-medium">
                    <UserCheck className="w-3.5 h-3.5" /> Passport Verified
                  </span>
                </>
              )}
            </div>
          </div>

          <div className="flex flex-wrap items-center gap-2">
            <button
              onClick={() => setMaskBalances(!maskBalances)}
              className="px-3 py-1.5 rounded bg-[#00174a] hover:bg-[#001138] text-white border border-white/20 text-xs font-medium flex items-center gap-1.5 transition-colors cursor-pointer"
              title="Toggle Privacy Mask"
            >
              {maskBalances ? <EyeOff className="w-3.5 h-3.5 text-white" /> : <Eye className="w-3.5 h-3.5 text-white" />}
              <span>{maskBalances ? 'Show Balances' : 'Mask Balances'}</span>
            </button>

            <button
              onClick={() => setCurrentView('DASHBOARD_TRANSFERS')}
              className="px-3.5 py-1.5 rounded bg-[#d4001a] hover:bg-[#b30016] text-white font-semibold text-xs uppercase tracking-wider shadow-xs transition-colors flex items-center gap-1.5 cursor-pointer"
            >
              <ArrowUpRight className="w-3.5 h-3.5" />
              <span>Transfer / Wire</span>
            </button>
          </div>
        </div>

        {/* Balance Breakdown Grid */}
        <div className="mt-5 pt-4 border-t border-white/15 grid grid-cols-2 lg:grid-cols-4 gap-3 sm:gap-4">
          <div className="p-2.5 sm:p-3 rounded-lg bg-white/10 border border-white/10">
            <span className="text-[11px] text-slate-300 uppercase tracking-wider font-medium block mb-0.5">
              Total Portfolio (USD)
            </span>
            {maskBalances ? (
              <span className="text-xl font-bold font-mono tracking-widest text-slate-300">••••••••</span>
            ) : (
              <CurrencyDisplay
                amountMinor={totalNetWorthUsdMinor}
                currency="USD"
                size="xl"
                className="text-white"
              />
            )}
            <span className="text-[10px] text-emerald-300 flex items-center gap-1 mt-0.5 font-medium">
              <TrendingUp className="w-3 h-3" /> +5.15% APY Daily
            </span>
          </div>

          <div className="p-2.5 sm:p-3 rounded-lg bg-white/10 border border-white/10">
            <span className="text-[11px] text-slate-300 uppercase tracking-wider font-medium block mb-0.5">
              Checking Available
            </span>
            {maskBalances ? (
              <span className="text-lg font-bold font-mono text-slate-300">••••••••</span>
            ) : (
              <CurrencyDisplay
                amountMinor={primaryChecking?.availableBalanceMinor || 0}
                currency={primaryChecking?.currency || 'USD'}
                size="lg"
                className="text-white"
              />
            )}
            <span className="text-[10px] text-slate-300 block mt-0.5 font-mono">
              ABA: {primaryChecking?.routingNumber || '021000021'}
            </span>
          </div>

          <div className="p-2.5 sm:p-3 rounded-lg bg-white/10 border border-white/10">
            <span className="text-[11px] text-slate-300 uppercase tracking-wider font-medium block mb-0.5">
              High-Yield Savings
            </span>
            {maskBalances ? (
              <span className="text-lg font-bold font-mono text-slate-300">••••••••</span>
            ) : (
              <CurrencyDisplay
                amountMinor={savingsAccount?.balanceMinor || 0}
                currency={savingsAccount?.currency || 'USD'}
                size="lg"
                className="text-emerald-300"
              />
            )}
            <span className="text-[10px] text-emerald-300 block mt-0.5 font-mono">
              5.15% APY Compounded
            </span>
          </div>

          <div className="p-2.5 sm:p-3 rounded-lg bg-white/10 border border-white/10">
            <span className="text-[11px] text-slate-300 uppercase tracking-wider font-medium block mb-0.5">
              Infinite Credit Card
            </span>
            {maskBalances ? (
              <span className="text-lg font-bold font-mono text-slate-300">••••••••</span>
            ) : (
              <CurrencyDisplay
                amountMinor={creditCardAccount?.balanceMinor || 0}
                currency="USD"
                size="lg"
                className="text-amber-200"
              />
            )}
            <span className="text-[10px] text-slate-300 block mt-0.5">
              Limit: $100,000.00
            </span>
          </div>
        </div>
      </div>

      {/* Quick Action Navigation Grid */}
      <div className="grid grid-cols-3 sm:grid-cols-6 gap-2 sm:gap-2.5">
        <button
          onClick={() => setCurrentView('DASHBOARD_TRANSFERS')}
          className="p-2.5 sm:p-3 rounded-lg bg-white dark:bg-[#0a192f] hover:bg-slate-50 dark:hover:bg-[#112a4a] border border-slate-200 dark:border-slate-800 shadow-2xs flex flex-col items-center text-center gap-1.5 transition-all active:scale-95 group cursor-pointer"
        >
          <div className="w-8 h-8 rounded-lg bg-[#012169] text-white flex items-center justify-center group-hover:scale-105 transition-transform shadow-xs">
            <ArrowLeftRight className="w-4 h-4" />
          </div>
          <span className="text-[11px] font-semibold text-slate-800 dark:text-slate-200">Transfer / Wire</span>
        </button>

        <button
          onClick={() => setCurrentView('DASHBOARD_BILLPAY')}
          className="p-2.5 sm:p-3 rounded-lg bg-white dark:bg-[#0a192f] hover:bg-slate-50 dark:hover:bg-[#112a4a] border border-slate-200 dark:border-slate-800 shadow-2xs flex flex-col items-center text-center gap-1.5 transition-all active:scale-95 group cursor-pointer"
        >
          <div className="w-8 h-8 rounded-lg bg-[#012169] text-white flex items-center justify-center group-hover:scale-105 transition-transform shadow-xs">
            <Receipt className="w-4 h-4" />
          </div>
          <span className="text-[11px] font-semibold text-slate-800 dark:text-slate-200">Pay Bills</span>
        </button>

        <button
          onClick={() => setCurrentView('DASHBOARD_DEPOSIT')}
          className="p-2.5 sm:p-3 rounded-lg bg-white dark:bg-[#0a192f] hover:bg-slate-50 dark:hover:bg-[#112a4a] border border-slate-200 dark:border-slate-800 shadow-2xs flex flex-col items-center text-center gap-1.5 transition-all active:scale-95 group cursor-pointer"
        >
          <div className="w-8 h-8 rounded-lg bg-[#012169] text-white flex items-center justify-center group-hover:scale-105 transition-transform shadow-xs">
            <Camera className="w-4 h-4" />
          </div>
          <span className="text-[11px] font-semibold text-slate-800 dark:text-slate-200">Deposit Check</span>
        </button>

        <button
          onClick={() => setCurrentView('DASHBOARD_CARDS')}
          className="p-2.5 sm:p-3 rounded-lg bg-white dark:bg-[#0a192f] hover:bg-slate-50 dark:hover:bg-[#112a4a] border border-slate-200 dark:border-slate-800 shadow-2xs flex flex-col items-center text-center gap-1.5 transition-all active:scale-95 group cursor-pointer"
        >
          <div className="w-8 h-8 rounded-lg bg-[#012169] text-white flex items-center justify-center group-hover:scale-105 transition-transform shadow-xs">
            <CreditCard className="w-4 h-4" />
          </div>
          <span className="text-[11px] font-semibold text-slate-800 dark:text-slate-200">Cards</span>
        </button>

        <button
          onClick={() => setCurrentView('DASHBOARD_STATEMENTS')}
          className="p-2.5 sm:p-3 rounded-lg bg-white dark:bg-[#0a192f] hover:bg-slate-50 dark:hover:bg-[#112a4a] border border-slate-200 dark:border-slate-800 shadow-2xs flex flex-col items-center text-center gap-1.5 transition-all active:scale-95 group cursor-pointer"
        >
          <div className="w-8 h-8 rounded-lg bg-[#012169] text-white flex items-center justify-center group-hover:scale-105 transition-transform shadow-xs">
            <FileText className="w-4 h-4" />
          </div>
          <span className="text-[11px] font-semibold text-slate-800 dark:text-slate-200">Statements</span>
        </button>

        <button
          onClick={() => setCurrentView('DASHBOARD_SECURITY')}
          className="p-2.5 sm:p-3 rounded-lg bg-white dark:bg-[#0a192f] hover:bg-slate-50 dark:hover:bg-[#112a4a] border border-slate-200 dark:border-slate-800 shadow-2xs flex flex-col items-center text-center gap-1.5 transition-all active:scale-95 group cursor-pointer"
        >
          <div className="w-8 h-8 rounded-lg bg-[#012169] text-white flex items-center justify-center group-hover:scale-105 transition-transform shadow-xs">
            <ShieldCheck className="w-4 h-4" />
          </div>
          <span className="text-[11px] font-semibold text-slate-800 dark:text-slate-200">Security Vault</span>
        </button>
      </div>

      {/* Interactive Tab Switcher */}
      <div className="flex items-center justify-between border-b border-slate-200 dark:border-slate-800 pb-2 overflow-x-auto no-scrollbar gap-2">
        <div className="flex items-center gap-1 p-1 bg-slate-100 dark:bg-[#0a192f] rounded-lg border border-slate-200 dark:border-slate-800">
          {[
            { id: 'overview', label: 'Accounts', icon: Landmark },
            { id: 'growth', label: 'Analytics', icon: BarChart3 },
            { id: 'activity', label: 'Activity', icon: ArrowLeftRight },
            { id: 'vault', label: 'Security & Passport', icon: ShieldCheck }
          ].map((tab) => {
            const Icon = tab.icon;
            const isSelected = activeTab === tab.id;
            return (
              <button
                key={tab.id}
                onClick={() => setActiveTab(tab.id as any)}
                className={`relative px-3 py-1.5 rounded-md text-xs font-semibold transition-all flex items-center gap-1.5 cursor-pointer whitespace-nowrap ${
                  isSelected
                    ? 'text-slate-900 dark:text-white'
                    : 'text-slate-600 dark:text-slate-400 hover:text-slate-900 dark:hover:text-white'
                }`}
              >
                {isSelected && (
                  <motion.div
                    layoutId="dashboardTab"
                    className="absolute inset-0 bg-white dark:bg-[#112d50] rounded-md shadow-xs border border-slate-200/80 dark:border-slate-700"
                    transition={{ type: 'spring', stiffness: 450, damping: 35 }}
                  />
                )}
                <span className="relative z-10 flex items-center gap-1.5">
                  <Icon className={`w-3.5 h-3.5 ${isSelected ? 'text-[#012169] dark:text-blue-400' : ''}`} />
                  <span>{tab.label}</span>
                </span>
              </button>
            );
          })}
        </div>

        <div className="hidden sm:flex items-center gap-1.5 text-xs font-mono text-slate-500">
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
            className="grid grid-cols-1 lg:grid-cols-12 gap-4 sm:gap-6"
          >
            {/* Left Column: Account Cards List */}
            <div className="lg:col-span-7 space-y-3 sm:space-y-4">
              <div className="flex items-center justify-between">
                <h2 className="text-xs sm:text-sm font-bold uppercase tracking-wider text-slate-800 dark:text-slate-200">
                  Institutional Deposit &amp; Card Accounts
                </h2>
                <button
                  onClick={() => setCurrentView('DASHBOARD_ACCOUNT_DETAIL')}
                  className="text-xs font-semibold text-[#0052c2] dark:text-blue-400 hover:underline flex items-center gap-1 cursor-pointer"
                >
                  <span>Routing Details</span>
                  <ChevronRight className="w-3.5 h-3.5" />
                </button>
              </div>

              <div className="space-y-2.5">
                {accounts.map((acc) => (
                  <div
                    key={acc.id}
                    onClick={() => {
                      setSelectedAccountId(acc.id);
                      setCurrentView('DASHBOARD_ACCOUNT_DETAIL');
                    }}
                    className="bg-white dark:bg-[#0a192f] rounded-lg p-3.5 sm:p-4 border border-slate-200 dark:border-slate-800 hover:border-[#0052c2]/60 dark:hover:border-blue-500 shadow-2xs hover:shadow-xs transition-all cursor-pointer flex flex-col sm:flex-row sm:items-center justify-between gap-3 group"
                  >
                    <div className="space-y-1">
                      <div className="flex items-center gap-2">
                        <span className="text-sm font-bold text-slate-900 dark:text-white group-hover:text-[#0052c2] dark:group-hover:text-blue-400 transition-colors">
                          {acc.name}
                        </span>
                        <StatusBadge status={acc.status} size="sm" />
                      </div>
                      <div className="flex flex-wrap items-center gap-2 text-xs text-slate-500 dark:text-slate-400 font-mono">
                        <span className="bg-slate-100 dark:bg-slate-800 px-1.5 py-0.5 rounded text-slate-700 dark:text-slate-300 text-[11px]">
                          {acc.accountNumber}
                        </span>
                        <span>•</span>
                        <span className="text-[11px]">{acc.routingNumber ? `ABA: ${acc.routingNumber}` : `Sort: ${acc.sortCode}`}</span>
                        {acc.interestRateAPY && (
                          <>
                            <span>•</span>
                            <span className="text-emerald-600 dark:text-emerald-400 font-bold font-sans text-[11px]">{acc.interestRateAPY}% APY</span>
                          </>
                        )}
                      </div>
                    </div>

                    <div className="flex items-center justify-between sm:flex-col sm:items-end gap-1">
                      <div className="text-left sm:text-right space-y-0.5">
                        <div className="text-[10px] text-slate-400 font-medium uppercase tracking-wider">Available Balance</div>
                        {maskBalances ? (
                          <span className="text-base font-bold font-mono text-slate-400">••••••••</span>
                        ) : (
                          <CurrencyDisplay
                            amountMinor={acc.availableBalanceMinor}
                            currency={acc.currency}
                            size="md"
                            className="text-slate-900 dark:text-white font-bold"
                          />
                        )}
                      </div>

                      <div className="flex items-center gap-1 text-xs text-[#0052c2] dark:text-blue-400 font-medium opacity-0 group-hover:opacity-100 transition-opacity">
                        <span>Details</span>
                        <ChevronRight className="w-3.5 h-3.5" />
                      </div>
                    </div>
                  </div>
                ))}
              </div>

              {/* Instant Copy Card for Wire Ingress */}
              <div className="p-3 sm:p-3.5 rounded-lg bg-slate-50 dark:bg-[#071322] border border-slate-200 dark:border-slate-800 flex flex-col sm:flex-row sm:items-center justify-between gap-2.5 text-xs">
                <div className="space-y-0.5">
                  <span className="font-bold text-slate-900 dark:text-white flex items-center gap-1.5 text-xs">
                    <Copy className="w-3.5 h-3.5 text-[#0052c2] dark:text-blue-400" />
                    Direct Fedwire / Swift Wire Ingress
                  </span>
                  <p className="text-slate-500 dark:text-slate-400 text-[11px]">
                    ABA Routing: <strong className="font-mono text-slate-700 dark:text-slate-300">021000021</strong> | SWIFT: <strong className="font-mono text-slate-700 dark:text-slate-300">FABUS33NYC</strong>
                  </p>
                </div>
                <button
                  onClick={() => handleCopy('ABA: 021000021 | SWIFT: FABUS33NYC', 'wire')}
                  className="px-2.5 py-1 rounded bg-white dark:bg-[#112a4a] border border-slate-200 dark:border-slate-700 text-slate-800 dark:text-slate-200 font-medium text-xs hover:bg-slate-100 dark:hover:bg-[#183c6b] transition-all flex items-center justify-center gap-1.5 cursor-pointer shrink-0"
                >
                  {copiedField === 'wire' ? <Check className="w-3.5 h-3.5 text-emerald-500" /> : <Copy className="w-3.5 h-3.5" />}
                  <span>{copiedField === 'wire' ? 'Copied' : 'Copy Wire Info'}</span>
                </button>
              </div>
            </div>

            {/* Right Column: Recent Authoritative Ledger */}
            <div className="lg:col-span-5 space-y-3 sm:space-y-4">
              <div className="flex items-center justify-between">
                <h2 className="text-xs sm:text-sm font-bold uppercase tracking-wider text-slate-800 dark:text-slate-200">
                  Recent Activity
                </h2>
                <button
                  onClick={() => setActiveTab('activity')}
                  className="text-xs font-semibold text-[#0052c2] dark:text-blue-400 hover:underline cursor-pointer"
                >
                  View All &rarr;
                </button>
              </div>

              <div className="bg-white dark:bg-[#0a192f] rounded-lg border border-slate-200 dark:border-slate-800 shadow-2xs divide-y divide-slate-100 dark:divide-slate-800 overflow-hidden transition-colors">
                {(recentTransactions || []).slice(0, 5).map((tx) => (
                  <div
                    key={tx.id}
                    onClick={() => setSelectedTx(tx)}
                    className="p-3 hover:bg-slate-50 dark:hover:bg-slate-800/40 transition-colors cursor-pointer flex items-center justify-between gap-2.5"
                  >
                    <div className="flex items-center gap-2.5 min-w-0">
                      <div
                        className={`w-8 h-8 rounded-md flex items-center justify-center shrink-0 ${
                          tx.direction === 'CREDIT'
                            ? 'bg-emerald-50 dark:bg-emerald-950/60 text-emerald-700 dark:text-emerald-400 border border-emerald-200 dark:border-emerald-800'
                            : 'bg-slate-100 dark:bg-slate-800 text-slate-700 dark:text-slate-300 border border-slate-200 dark:border-slate-700'
                        }`}
                      >
                        {tx.direction === 'CREDIT' ? (
                          <ArrowDownLeft className="w-3.5 h-3.5" />
                        ) : (
                          <ArrowUpRight className="w-3.5 h-3.5" />
                        )}
                      </div>
                      <div className="min-w-0">
                        <p className="text-xs font-semibold text-slate-900 dark:text-white truncate">
                          {tx.description}
                        </p>
                        <div className="flex items-center gap-1.5 text-[10px] text-slate-500 dark:text-slate-400 font-mono">
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
                        className={tx.direction === 'CREDIT' ? 'text-emerald-700 dark:text-emerald-400 font-semibold' : 'text-slate-900 dark:text-white font-semibold'}
                      />
                      <div className="mt-0.5">
                        <StatusBadge status={tx.status} size="sm" />
                      </div>
                    </div>
                  </div>
                ))}
              </div>

              {/* Quick Security Score Mini Card */}
              <div className="bg-[#012169] text-white rounded-lg p-3.5 sm:p-4 border border-[#00174a] space-y-2.5 shadow-xs">
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-2">
                    <ShieldCheck className="w-4 h-4 text-white" />
                    <h4 className="text-xs font-semibold uppercase tracking-wider text-white">
                      Security &amp; Device Integrity
                    </h4>
                  </div>
                  <span className="text-[10px] font-mono text-emerald-300 font-semibold bg-emerald-950/60 px-1.5 py-0.5 rounded border border-emerald-800">
                    98/100 SECURE
                  </span>
                </div>

                <p className="text-[11px] text-slate-200 leading-relaxed">
                  Cryptographic passkey and biometric audit validated. Master double-entry ledger is locked with hardware HSM protection.
                </p>

                <button
                  onClick={() => setActiveTab('vault')}
                  className="w-full py-1.5 bg-white/10 hover:bg-white/15 text-xs font-semibold text-white rounded transition-colors text-center cursor-pointer border border-white/20"
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
            className="space-y-4 sm:space-y-5"
          >
            <div className="grid grid-cols-1 lg:grid-cols-12 gap-4 sm:gap-6">
              <div className="lg:col-span-8 bg-white dark:bg-[#0a192f] rounded-lg p-4 sm:p-5 border border-slate-200 dark:border-slate-800 shadow-2xs space-y-3">
                <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2">
                  <div>
                    <h3 className="text-sm sm:text-base font-bold text-slate-900 dark:text-white">
                      6-Month Portfolio Liquidity &amp; Yield Trajectory
                    </h3>
                    <p className="text-xs text-slate-500 dark:text-slate-400">
                      Compounded interest distributions vs net capital deposits
                    </p>
                  </div>
                  <span className="text-xs font-semibold text-emerald-700 dark:text-emerald-400 bg-emerald-50 dark:bg-emerald-950/60 px-2.5 py-0.5 rounded border border-emerald-200 dark:border-emerald-800 self-start">
                    +27.0% Net YTD
                  </span>
                </div>

                <div className="h-56 sm:h-64 w-full pt-2">
                  <ResponsiveContainer width="100%" height="100%">
                    <AreaChart data={chartData}>
                      <defs>
                        <linearGradient id="liquidityGrad" x1="0" y1="0" x2="0" y2="1">
                          <stop offset="5%" stopColor="#012169" stopOpacity={0.3} />
                          <stop offset="95%" stopColor="#012169" stopOpacity={0.0} />
                        </linearGradient>
                      </defs>
                      <CartesianGrid strokeDasharray="3 3" stroke={darkMode ? '#1e3656' : '#f1f5f9'} />
                      <XAxis dataKey="month" stroke={darkMode ? '#64748b' : '#94a3b8'} fontSize={11} />
                      <YAxis
                        stroke={darkMode ? '#64748b' : '#94a3b8'}
                        fontSize={11}
                        tickFormatter={(v) => `$${(v / 1000).toFixed(0)}k`}
                      />
                      <Tooltip
                        contentStyle={{
                          backgroundColor: darkMode ? '#0a192f' : '#ffffff',
                          borderColor: darkMode ? '#1e3656' : '#e2e8f0',
                          color: darkMode ? '#ffffff' : '#0f172a',
                          borderRadius: '0.375rem',
                          fontSize: '12px'
                        }}
                        formatter={(value: any) => [`$${Number(value).toLocaleString()}`, 'Portfolio Total']}
                      />
                      <Area
                        type="monotone"
                        dataKey="balance"
                        stroke="#012169"
                        strokeWidth={2}
                        fillOpacity={1}
                        fill="url(#liquidityGrad)"
                      />
                    </AreaChart>
                  </ResponsiveContainer>
                </div>
              </div>

              <div className="lg:col-span-4 space-y-3 sm:space-y-4">
                <div className="bg-white dark:bg-[#0a192f] rounded-lg p-4 sm:p-5 border border-slate-200 dark:border-slate-800 shadow-2xs space-y-3">
                  <h4 className="text-xs font-bold uppercase tracking-wider text-slate-900 dark:text-white">
                    Asset Allocation
                  </h4>
                  <div className="space-y-2.5 text-xs">
                    <div>
                      <div className="flex justify-between font-medium mb-1">
                        <span className="text-slate-700 dark:text-slate-300">High-Yield Savings (5.15% APY)</span>
                        <span className="text-emerald-600 font-mono font-semibold">68%</span>
                      </div>
                      <div className="w-full h-1.5 rounded-full bg-slate-100 dark:bg-slate-800 overflow-hidden">
                        <div className="h-full bg-emerald-500 rounded-full" style={{ width: '68%' }} />
                      </div>
                    </div>

                    <div>
                      <div className="flex justify-between font-medium mb-1">
                        <span className="text-slate-700 dark:text-slate-300">Premier Checking (Liquidity)</span>
                        <span className="text-[#012169] dark:text-blue-400 font-mono font-semibold">24%</span>
                      </div>
                      <div className="w-full h-1.5 rounded-full bg-slate-100 dark:bg-slate-800 overflow-hidden">
                        <div className="h-full bg-[#012169] dark:bg-blue-500 rounded-full" style={{ width: '24%' }} />
                      </div>
                    </div>

                    <div>
                      <div className="flex justify-between font-medium mb-1">
                        <span className="text-slate-700 dark:text-slate-300">Credit Reserve &amp; Escrow</span>
                        <span className="text-blue-500 font-mono font-semibold">8%</span>
                      </div>
                      <div className="w-full h-1.5 rounded-full bg-slate-100 dark:bg-slate-800 overflow-hidden">
                        <div className="h-full bg-blue-500 rounded-full" style={{ width: '8%' }} />
                      </div>
                    </div>
                  </div>

                  <div className="pt-2.5 border-t border-slate-100 dark:border-slate-800 text-[11px] text-slate-500 dark:text-slate-400 leading-relaxed">
                    All balances are protected under institutional FDIC / FSCS indemnification frameworks.
                  </div>
                </div>

                <div className="p-4 rounded-lg bg-emerald-500/10 border border-emerald-500/20 text-xs text-emerald-900 dark:text-emerald-300 space-y-1.5">
                  <div className="flex items-center gap-1.5 font-bold">
                    <Sparkles className="w-3.5 h-3.5 text-emerald-600 dark:text-emerald-400" />
                    <span>Projected Monthly Passive Yield</span>
                  </div>
                  <div className="text-xl font-bold font-mono text-emerald-700 dark:text-emerald-400">
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
            className="bg-white dark:bg-[#0a192f] rounded-lg p-4 sm:p-5 border border-slate-200 dark:border-slate-800 shadow-2xs space-y-4"
          >
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
              <div>
                <h3 className="text-sm sm:text-base font-bold text-slate-900 dark:text-white">
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
                    className="pl-8 pr-3 py-1 rounded-md bg-slate-100 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 text-xs text-slate-900 dark:text-white focus:outline-none focus:border-[#012169]"
                  />
                </div>

                <div className="flex items-center gap-1 p-0.5 bg-slate-100 dark:bg-slate-800 rounded-md">
                  {['ALL', 'CREDIT', 'DEBIT'].map((f) => (
                    <button
                      key={f}
                      onClick={() => setActivityFilter(f as any)}
                      className={`px-2.5 py-1 rounded text-xs font-semibold transition-all cursor-pointer ${
                        activityFilter === f
                          ? 'bg-white dark:bg-[#112a4a] text-slate-900 dark:text-white shadow-2xs'
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
                  className="py-3 hover:bg-slate-50 dark:hover:bg-slate-800/30 px-2.5 rounded-md transition-colors cursor-pointer flex flex-col sm:flex-row sm:items-center justify-between gap-2.5"
                >
                  <div className="flex items-center gap-3 min-w-0">
                    <div
                      className={`w-8 h-8 rounded-md flex items-center justify-center shrink-0 ${
                        tx.direction === 'CREDIT'
                          ? 'bg-emerald-50 dark:bg-emerald-950/60 text-emerald-700 dark:text-emerald-400 border border-emerald-200 dark:border-emerald-800'
                          : 'bg-slate-100 dark:bg-slate-800 text-slate-700 dark:text-slate-300 border border-slate-200 dark:border-slate-700'
                      }`}
                    >
                      {tx.direction === 'CREDIT' ? (
                        <ArrowDownLeft className="w-3.5 h-3.5" />
                      ) : (
                        <ArrowUpRight className="w-3.5 h-3.5" />
                      )}
                    </div>

                    <div className="min-w-0 space-y-0.5">
                      <div className="flex items-center gap-2">
                        <span className="text-xs sm:text-sm font-semibold text-slate-900 dark:text-white truncate">
                          {tx.description}
                        </span>
                        <StatusBadge status={tx.status} size="sm" />
                      </div>
                      <div className="flex flex-wrap items-center gap-2 text-[11px] text-slate-500 dark:text-slate-400 font-mono">
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
                      size="md"
                      className={tx.direction === 'CREDIT' ? 'text-emerald-700 dark:text-emerald-400 font-semibold' : 'text-slate-900 dark:text-white font-semibold'}
                    />
                    <div className="text-[10px] text-slate-400 font-mono">
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
            className="space-y-4 sm:space-y-5"
          >
            <div className="grid grid-cols-1 lg:grid-cols-12 gap-4 sm:gap-6">
              {/* Sovereign Passport & Identity Verification Card */}
              <div className="lg:col-span-6 bg-white dark:bg-[#0a192f] rounded-lg p-4 sm:p-5 border border-slate-200 dark:border-slate-800 shadow-2xs space-y-4">
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-2.5">
                    <div className="w-9 h-9 rounded-md bg-emerald-50 dark:bg-emerald-950/60 text-emerald-600 dark:text-emerald-400 flex items-center justify-center border border-emerald-200 dark:border-emerald-800">
                      <UserCheck className="w-4 h-4" />
                    </div>
                    <div>
                      <h4 className="text-sm font-bold text-slate-900 dark:text-white">
                        Passport &amp; Identity Credentials
                      </h4>
                      <span className="text-[11px] font-mono text-emerald-600 dark:text-emerald-400 font-semibold">
                        VERIFIED &amp; BIOMETRICALLY LINKED
                      </span>
                    </div>
                  </div>
                  <span className="px-2 py-0.5 rounded bg-emerald-100 dark:bg-emerald-900/60 text-emerald-800 dark:text-emerald-200 text-[10px] font-bold font-mono">
                    TIER 3 KYC
                  </span>
                </div>

                <div className="p-3 rounded-md bg-slate-50 dark:bg-slate-900/60 border border-slate-200 dark:border-slate-800 space-y-2 text-xs">
                  <div className="flex justify-between">
                    <span className="text-slate-500">Legal Name:</span>
                    <span className="font-semibold text-slate-900 dark:text-white">{currentUser?.firstName} {currentUser?.lastName}</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-slate-500">Declared Nationality:</span>
                    <span className="font-semibold text-slate-900 dark:text-white">{currentUser?.nationality || 'United States'}</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-slate-500">Passport Number:</span>
                    <span className="font-mono text-[#012169] dark:text-blue-400 font-semibold">
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
                  className="w-full py-2 rounded bg-slate-100 dark:bg-[#112a4a] hover:bg-slate-200 dark:hover:bg-[#183c6b] text-slate-800 dark:text-slate-200 font-semibold text-xs transition-colors flex items-center justify-center gap-1.5 cursor-pointer"
                >
                  <FileCheck className="w-3.5 h-3.5 text-[#012169] dark:text-blue-400" />
                  <span>Update KYC Passport Document</span>
                </button>
              </div>

              {/* 4-Digit Private Banking PIN Card */}
              <div className="lg:col-span-6 bg-white dark:bg-[#0a192f] rounded-lg p-4 sm:p-5 border border-slate-200 dark:border-slate-800 shadow-2xs space-y-4">
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-2.5">
                    <div className="w-9 h-9 rounded-md bg-[#012169] text-white flex items-center justify-center">
                      <KeyRound className="w-4 h-4" />
                    </div>
                    <div>
                      <h4 className="text-sm font-bold text-slate-900 dark:text-white">
                        4-Digit Private Banking PIN
                      </h4>
                      <span className="text-[11px] font-mono text-emerald-600 dark:text-emerald-400 font-semibold">
                        SECURITY STATUS: ACTIVE
                      </span>
                    </div>
                  </div>
                  <span className="px-2 py-0.5 rounded bg-slate-100 dark:bg-slate-800 text-slate-700 dark:text-slate-300 text-[10px] font-bold font-mono">
                    DUAL-AUTH
                  </span>
                </div>

                <p className="text-xs text-slate-600 dark:text-slate-300 leading-relaxed">
                  Your 4-digit PIN secures your passport verification checkpoint at login and authorizes high-value outgoing wires, wire templates, and card limit adjustments.
                </p>

                <div className="p-3 rounded-md bg-slate-50 dark:bg-slate-900/60 border border-slate-200 dark:border-slate-800 flex items-center justify-between text-xs font-mono">
                  <span className="text-slate-500">PIN Status:</span>
                  <span className="text-emerald-600 dark:text-emerald-400 font-bold">● ● ● ● (ENROLLED)</span>
                </div>

                <button
                  onClick={() => setCurrentView('DASHBOARD_PROFILE')}
                  className="w-full py-2 rounded bg-[#012169] hover:bg-[#00174a] text-white font-semibold text-xs transition-colors flex items-center justify-center gap-1.5 cursor-pointer"
                >
                  <Lock className="w-3.5 h-3.5" />
                  <span>Change 4-Digit Banking PIN</span>
                </button>
              </div>
            </div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Transaction Detail Modal / Drawer */}
      {selectedTx && (
        <div className="fixed inset-0 z-50 bg-slate-950/70 backdrop-blur-2xs flex items-center justify-center p-4">
          <div className="bg-white dark:bg-[#0a192f] rounded-lg max-w-md w-full p-4 sm:p-5 shadow-xl border border-slate-200 dark:border-slate-800 space-y-4 animate-in fade-in zoom-in-95 duration-150 text-slate-900 dark:text-slate-100">
            <div className="flex items-center justify-between pb-2.5 border-b border-slate-100 dark:border-slate-800">
              <div>
                <span className="text-[10px] uppercase font-bold tracking-widest text-[#012169] dark:text-blue-400">
                  Authoritative Ledger Record
                </span>
                <h3 className="text-sm sm:text-base font-bold text-slate-900 dark:text-white">
                  Transaction Receipt &amp; Proof
                </h3>
              </div>
              <button
                onClick={() => setSelectedTx(null)}
                className="text-slate-400 hover:text-slate-700 dark:hover:text-white text-xl font-bold p-1 cursor-pointer"
              >
                &times;
              </button>
            </div>

            <div className="text-center py-1 space-y-0.5">
              <div className="text-xs text-slate-500 dark:text-slate-400 font-medium">Transaction Amount</div>
              <CurrencyDisplay
                amountMinor={selectedTx.amountMinor}
                currency={selectedTx.currency}
                showSign={true}
                size="xl"
                className={selectedTx.direction === 'CREDIT' ? 'text-emerald-700 dark:text-emerald-400 font-bold' : 'text-slate-900 dark:text-white font-bold'}
              />
              <div className="pt-1">
                <StatusBadge status={selectedTx.status} />
              </div>
            </div>

            <div className="bg-slate-50 dark:bg-slate-900/70 rounded-md p-3 border border-slate-200 dark:border-slate-800 space-y-2 text-xs text-slate-700 dark:text-slate-300 font-mono">
              <div className="flex justify-between">
                <span className="text-slate-500 dark:text-slate-400 font-sans">Reference:</span>
                <span className="font-bold text-[#012169] dark:text-blue-400">{selectedTx.referenceNumber}</span>
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
                <span className="text-slate-500 dark:text-slate-400 font-sans">Balance After:</span>
                <span className="font-bold">${(selectedTx.balanceAfterMinor / 100).toLocaleString('en-US', { minimumFractionDigits: 2 })}</span>
              </div>
            </div>

            <div className="flex gap-2 pt-1">
              <button
                onClick={() => {
                  window.print();
                }}
                className="flex-1 py-2 rounded border border-slate-300 dark:border-slate-700 text-slate-700 dark:text-slate-200 font-medium text-xs flex items-center justify-center gap-1.5 hover:bg-slate-50 dark:hover:bg-slate-800 cursor-pointer"
              >
                <Download className="w-3.5 h-3.5" />
                <span>Export Proof (PDF)</span>
              </button>
              <button
                onClick={() => setSelectedTx(null)}
                className="flex-1 py-2 rounded bg-[#012169] text-white font-semibold text-xs uppercase tracking-wider hover:bg-[#00174a] cursor-pointer"
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
