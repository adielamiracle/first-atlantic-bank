import React, { useState } from 'react';
import { useBank } from '../../context/BankContext';
import { CurrencyDisplay } from '../../components/common/CurrencyDisplay';
import { StatusBadge } from '../../components/common/StatusBadge';
import { motion, AnimatePresence } from 'motion/react';
import {
  Send,
  PlusCircle,
  ArrowLeftRight,
  History,
  FileText,
  CreditCard,
  Camera,
  Receipt,
  ShieldCheck,
  TrendingUp,
  Landmark,
  Eye,
  EyeOff,
  ChevronRight,
  Search,
  Download,
  Copy,
  Check,
  Sparkles,
  UserCheck,
  KeyRound,
  FileCheck,
  BarChart3,
  ArrowUpRight,
  ArrowDownLeft,
  Wallet,
  Building2,
  CheckCircle2,
  Clock
} from 'lucide-react';
import { BankAccount, LedgerEntry } from '../../types';
import { ResponsiveContainer, AreaChart, Area, XAxis, YAxis, Tooltip, CartesianGrid } from 'recharts';

export const DashboardOverview: React.FC = () => {
  const {
    currentUser,
    accounts,
    recentTransactions,
    totalNetWorthUsdMinor,
    setCurrentView,
    setSelectedAccountId,
    region,
    darkMode
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

  // Total available checking balance
  const primaryAvailableMinor = primaryChecking?.availableBalanceMinor ?? totalNetWorthUsdMinor ?? 0;

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
      {/* 1. TOP BIG WHITE BALANCE CARD WITH BLUE 004281 TEXT (Bank of America / European Standard) */}
      <section className="bg-white dark:bg-[#0f172a] rounded-2xl p-6 sm:p-8 border border-slate-200/90 dark:border-slate-800 shadow-sm relative overflow-hidden transition-all">
        {/* Subtle Bank Blue Top Accent */}
        <div className="h-1.5 bg-[#004281] absolute top-0 inset-x-0" />

        {/* Top Header Row within Card: Welcome, User Status & Privacy Mask Toggle */}
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 pb-4 border-b border-slate-100 dark:border-slate-800/80">
          <div className="flex flex-wrap items-center gap-2.5">
            <span className="text-xs font-semibold text-slate-500 dark:text-slate-400">
              {region === 'US' ? 'First Atlantic Bank • US Direct Clearing' : 'First Atlantic Bank • UK & Europe Direct Clearing'}
            </span>
            <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-[11px] font-semibold bg-emerald-50 dark:bg-emerald-950/60 text-[#00A651] dark:text-emerald-400 border border-emerald-200 dark:border-emerald-800">
              <span className="w-1.5 h-1.5 rounded-full bg-[#00A651]" />
              Direct Clearing Active
            </span>
          </div>

          <div className="flex items-center gap-2">
            <button
              onClick={() => setMaskBalances(!maskBalances)}
              className="px-3 py-1.5 rounded-lg bg-slate-50 dark:bg-slate-800 hover:bg-slate-100 dark:hover:bg-slate-700 text-slate-600 dark:text-slate-300 border border-slate-200 dark:border-slate-700 text-xs font-medium flex items-center gap-1.5 transition-colors cursor-pointer"
              title="Toggle Privacy Mask"
            >
              {maskBalances ? <EyeOff className="w-3.5 h-3.5 text-[#004281] dark:text-blue-400" /> : <Eye className="w-3.5 h-3.5 text-[#004281] dark:text-blue-400" />}
              <span>{maskBalances ? 'Show Balance' : 'Hide Balance'}</span>
            </button>
          </div>
        </div>

        {/* Main BIG Balance Display */}
        <div className="pt-6 pb-2">
          <div className="flex flex-col md:flex-row md:items-end justify-between gap-4">
            <div className="space-y-1.5">
              <div className="flex items-center gap-2">
                <span className="text-xs sm:text-sm font-semibold tracking-wider text-slate-500 dark:text-slate-400 uppercase">
                  Available Balance
                </span>
                <span className="text-xs font-medium text-slate-400">
                  ({primaryChecking?.name || 'Primary Checking'} ••{primaryChecking?.accountNumber ? primaryChecking.accountNumber.slice(-4) : '4892'})
                </span>
              </div>

              {/* HUGE BLUE TEXT 004281 */}
              <div className="text-3xl sm:text-5xl lg:text-6xl font-bold font-mono tracking-tight text-[#004281] dark:text-blue-400">
                {maskBalances ? (
                  <span className="text-slate-400 font-mono tracking-widest">••••••••</span>
                ) : (
                  <CurrencyDisplay
                    amountMinor={primaryAvailableMinor}
                    currency={primaryChecking?.currency || 'USD'}
                    size="xl"
                    className="text-[#004281] dark:text-blue-400 font-bold"
                  />
                )}
              </div>

              <div className="flex flex-wrap items-center gap-3 pt-1 text-xs text-slate-500 dark:text-slate-400">
                <span className="inline-flex items-center gap-1 text-[#00A651] font-semibold">
                  <TrendingUp className="w-3.5 h-3.5" /> +5.15% APY Daily Yield
                </span>
                <span className="text-slate-300 dark:text-slate-700">•</span>
                <span>ABA Routing: <strong className="font-mono text-slate-700 dark:text-slate-300">021000021</strong></span>
                <span className="text-slate-300 dark:text-slate-700">•</span>
                <span>SWIFT: <strong className="font-mono text-slate-700 dark:text-slate-300">FABUS33NYC</strong></span>
              </div>
            </div>

            {/* Quick Secondary Portfolios Breakdown (Clean whitespace, no boxes inside boxes) */}
            <div className="flex items-center gap-6 sm:gap-8 pt-4 md:pt-0 border-t md:border-t-0 md:border-l border-slate-100 dark:border-slate-800 md:pl-8">
              <div>
                <span className="text-[11px] font-medium text-slate-400 uppercase tracking-wider block">
                  Total Net Assets
                </span>
                <div className="text-base sm:text-lg font-bold font-mono text-slate-900 dark:text-white mt-0.5">
                  {maskBalances ? '••••••••' : (
                    <CurrencyDisplay
                      amountMinor={totalNetWorthUsdMinor}
                      currency="USD"
                      size="md"
                      className="text-slate-900 dark:text-white font-bold"
                    />
                  )}
                </div>
                <span className="text-[10px] text-emerald-600 dark:text-emerald-400 font-medium">
                  3 Active Vaults
                </span>
              </div>

              <div>
                <span className="text-[11px] font-medium text-slate-400 uppercase tracking-wider block">
                  High-Yield Savings
                </span>
                <div className="text-base sm:text-lg font-bold font-mono text-[#00A651] mt-0.5">
                  {maskBalances ? '••••••••' : (
                    <CurrencyDisplay
                      amountMinor={savingsAccount?.balanceMinor || 0}
                      currency={savingsAccount?.currency || 'USD'}
                      size="md"
                      className="text-[#00A651] font-bold"
                    />
                  )}
                </div>
                <span className="text-[10px] text-slate-400 font-medium">
                  Compounded Monthly
                </span>
              </div>
            </div>
          </div>
        </div>

        {/* 2. BIG PROMINENT ACTION BUTTONS (BIG ICONS, NOT SMALL TEXT LINKS) */}
        <div className="mt-6 pt-6 border-t border-slate-100 dark:border-slate-800">
          <div className="grid grid-cols-2 sm:grid-cols-5 gap-3 sm:gap-4">
            {/* ACTION 1: SEND MONEY */}
            <button
              onClick={() => setCurrentView('DASHBOARD_TRANSFERS')}
              className="group flex flex-col items-center justify-center p-4 sm:p-5 rounded-xl bg-slate-50/80 dark:bg-slate-800/60 hover:bg-[#004281] hover:text-white dark:hover:bg-[#004281] border border-slate-200/80 dark:border-slate-700/60 transition-all duration-200 shadow-2xs hover:shadow-md cursor-pointer text-center"
            >
              <div className="w-12 h-12 sm:w-14 sm:h-14 rounded-2xl bg-white dark:bg-slate-700 text-[#004281] dark:text-blue-400 group-hover:bg-white group-hover:text-[#004281] flex items-center justify-center mb-2.5 transition-transform group-hover:scale-110 shadow-xs border border-slate-100 dark:border-slate-600">
                <Send className="w-6 h-6 sm:w-7 sm:h-7" />
              </div>
              <span className="text-xs sm:text-sm font-bold text-slate-800 dark:text-slate-200 group-hover:text-white transition-colors">
                Send Money
              </span>
              <span className="text-[10px] text-slate-400 group-hover:text-blue-100 hidden sm:block mt-0.5">
                Wire &amp; ACH
              </span>
            </button>

            {/* ACTION 2: FUND WALLET */}
            <button
              onClick={() => setCurrentView('DASHBOARD_DEPOSIT')}
              className="group flex flex-col items-center justify-center p-4 sm:p-5 rounded-xl bg-slate-50/80 dark:bg-slate-800/60 hover:bg-[#00A651] hover:text-white dark:hover:bg-[#00A651] border border-slate-200/80 dark:border-slate-700/60 transition-all duration-200 shadow-2xs hover:shadow-md cursor-pointer text-center"
            >
              <div className="w-12 h-12 sm:w-14 sm:h-14 rounded-2xl bg-white dark:bg-slate-700 text-[#00A651] dark:text-emerald-400 group-hover:bg-white group-hover:text-[#00A651] flex items-center justify-center mb-2.5 transition-transform group-hover:scale-110 shadow-xs border border-slate-100 dark:border-slate-600">
                <PlusCircle className="w-6 h-6 sm:w-7 sm:h-7" />
              </div>
              <span className="text-xs sm:text-sm font-bold text-slate-800 dark:text-slate-200 group-hover:text-white transition-colors">
                Fund Wallet
              </span>
              <span className="text-[10px] text-slate-400 group-hover:text-emerald-100 hidden sm:block mt-0.5">
                Deposit &amp; Ingress
              </span>
            </button>

            {/* ACTION 3: TRANSFER */}
            <button
              onClick={() => setCurrentView('DASHBOARD_TRANSFERS')}
              className="group flex flex-col items-center justify-center p-4 sm:p-5 rounded-xl bg-slate-50/80 dark:bg-slate-800/60 hover:bg-[#004281] hover:text-white dark:hover:bg-[#004281] border border-slate-200/80 dark:border-slate-700/60 transition-all duration-200 shadow-2xs hover:shadow-md cursor-pointer text-center"
            >
              <div className="w-12 h-12 sm:w-14 sm:h-14 rounded-2xl bg-white dark:bg-slate-700 text-[#004281] dark:text-blue-400 group-hover:bg-white group-hover:text-[#004281] flex items-center justify-center mb-2.5 transition-transform group-hover:scale-110 shadow-xs border border-slate-100 dark:border-slate-600">
                <ArrowLeftRight className="w-6 h-6 sm:w-7 sm:h-7" />
              </div>
              <span className="text-xs sm:text-sm font-bold text-slate-800 dark:text-slate-200 group-hover:text-white transition-colors">
                Transfer
              </span>
              <span className="text-[10px] text-slate-400 group-hover:text-blue-100 hidden sm:block mt-0.5">
                Between Accounts
              </span>
            </button>

            {/* ACTION 4: HISTORY */}
            <button
              onClick={() => setActiveTab('activity')}
              className="group flex flex-col items-center justify-center p-4 sm:p-5 rounded-xl bg-slate-50/80 dark:bg-slate-800/60 hover:bg-[#004281] hover:text-white dark:hover:bg-[#004281] border border-slate-200/80 dark:border-slate-700/60 transition-all duration-200 shadow-2xs hover:shadow-md cursor-pointer text-center"
            >
              <div className="w-12 h-12 sm:w-14 sm:h-14 rounded-2xl bg-white dark:bg-slate-700 text-[#004281] dark:text-blue-400 group-hover:bg-white group-hover:text-[#004281] flex items-center justify-center mb-2.5 transition-transform group-hover:scale-110 shadow-xs border border-slate-100 dark:border-slate-600">
                <History className="w-6 h-6 sm:w-7 sm:h-7" />
              </div>
              <span className="text-xs sm:text-sm font-bold text-slate-800 dark:text-slate-200 group-hover:text-white transition-colors">
                History
              </span>
              <span className="text-[10px] text-slate-400 group-hover:text-blue-100 hidden sm:block mt-0.5">
                Transactions
              </span>
            </button>

            {/* ACTION 5: STATEMENTS */}
            <button
              onClick={() => setCurrentView('DASHBOARD_STATEMENTS')}
              className="col-span-2 sm:col-span-1 group flex flex-col items-center justify-center p-4 sm:p-5 rounded-xl bg-slate-50/80 dark:bg-slate-800/60 hover:bg-[#004281] hover:text-white dark:hover:bg-[#004281] border border-slate-200/80 dark:border-slate-700/60 transition-all duration-200 shadow-2xs hover:shadow-md cursor-pointer text-center"
            >
              <div className="w-12 h-12 sm:w-14 sm:h-14 rounded-2xl bg-white dark:bg-slate-700 text-[#004281] dark:text-blue-400 group-hover:bg-white group-hover:text-[#004281] flex items-center justify-center mb-2.5 transition-transform group-hover:scale-110 shadow-xs border border-slate-100 dark:border-slate-600">
                <FileText className="w-6 h-6 sm:w-7 sm:h-7" />
              </div>
              <span className="text-xs sm:text-sm font-bold text-slate-800 dark:text-slate-200 group-hover:text-white transition-colors">
                Statements
              </span>
              <span className="text-[10px] text-slate-400 group-hover:text-blue-100 hidden sm:block mt-0.5">
                PDF &amp; Tax Reports
              </span>
            </button>
          </div>
        </div>
      </section>

      {/* 3. CLEAN NAVIGATION TABS (SHADCN / EUROPEAN FINTECH STYLE) */}
      <div className="flex items-center justify-between border-b border-slate-200 dark:border-slate-800 pb-3">
        <div className="flex items-center gap-1 p-1 bg-slate-100/90 dark:bg-slate-900 rounded-xl">
          {[
            { id: 'overview', label: 'My Accounts', icon: Landmark },
            { id: 'activity', label: 'Activity & Ledger', icon: Clock },
            { id: 'growth', label: 'Analytics & Yield', icon: BarChart3 },
            { id: 'vault', label: 'Security & Passport', icon: ShieldCheck }
          ].map((tab) => {
            const Icon = tab.icon;
            const isSelected = activeTab === tab.id;
            return (
              <button
                key={tab.id}
                onClick={() => setActiveTab(tab.id as any)}
                className={`relative px-3.5 py-2 rounded-lg text-xs font-semibold transition-all flex items-center gap-2 cursor-pointer whitespace-nowrap ${
                  isSelected
                    ? 'text-[#004281] dark:text-white bg-white dark:bg-slate-800 shadow-xs'
                    : 'text-slate-500 dark:text-slate-400 hover:text-slate-900 dark:hover:text-white'
                }`}
              >
                <Icon className={`w-4 h-4 ${isSelected ? 'text-[#004281] dark:text-blue-400' : 'text-slate-400'}`} />
                <span>{tab.label}</span>
              </button>
            );
          })}
        </div>

        <div className="hidden sm:flex items-center gap-2 text-xs font-mono text-slate-500 dark:text-slate-400">
          <span className="w-2 h-2 rounded-full bg-[#00A651] animate-pulse" />
          <span>Real-Time Ledger Synced</span>
        </div>
      </div>

      {/* 4. MAIN CONTENT TABS */}
      <AnimatePresence mode="wait">
        {activeTab === 'overview' && (
          <motion.div
            key="overview"
            initial={{ opacity: 0, y: 6 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -6 }}
            transition={{ duration: 0.15 }}
            className="grid grid-cols-1 lg:grid-cols-12 gap-6"
          >
            {/* Left Column: Grouped Accounts List */}
            <div className="lg:col-span-7 space-y-4">
              <div className="flex items-center justify-between">
                <h2 className="text-sm font-bold text-slate-900 dark:text-white tracking-tight">
                  Your Banking Accounts
                </h2>
                <button
                  onClick={() => setCurrentView('DASHBOARD_ACCOUNT_DETAIL')}
                  className="text-xs font-semibold text-[#004281] dark:text-blue-400 hover:underline flex items-center gap-1 cursor-pointer"
                >
                  <span>Manage Details</span>
                  <ChevronRight className="w-3.5 h-3.5" />
                </button>
              </div>

              {/* Accounts List (Clean white cards, generous spacing) */}
              <div className="space-y-3">
                {accounts.map((acc) => (
                  <div
                    key={acc.id}
                    onClick={() => {
                      setSelectedAccountId(acc.id);
                      setCurrentView('DASHBOARD_ACCOUNT_DETAIL');
                    }}
                    className="bg-white dark:bg-[#0f172a] rounded-xl p-5 border border-slate-200/80 dark:border-slate-800 hover:border-[#004281] dark:hover:border-blue-500 shadow-2xs hover:shadow-xs transition-all cursor-pointer flex flex-col sm:flex-row sm:items-center justify-between gap-4 group"
                  >
                    <div className="flex items-center gap-3.5">
                      <div className="w-11 h-11 rounded-xl bg-slate-50 dark:bg-slate-800 text-[#004281] dark:text-blue-400 flex items-center justify-center group-hover:bg-[#004281] group-hover:text-white transition-colors border border-slate-100 dark:border-slate-700">
                        {acc.type === 'CREDIT_CARD_INFINITE' ? (
                          <CreditCard className="w-5 h-5" />
                        ) : acc.type === 'SAVINGS_HIGH_YIELD' ? (
                          <TrendingUp className="w-5 h-5" />
                        ) : (
                          <Wallet className="w-5 h-5" />
                        )}
                      </div>
                      <div className="space-y-1">
                        <div className="flex items-center gap-2">
                          <span className="text-sm font-bold text-slate-900 dark:text-white group-hover:text-[#004281] dark:group-hover:text-blue-400 transition-colors">
                            {acc.name}
                          </span>
                          <StatusBadge status={acc.status} size="sm" />
                        </div>
                        <div className="flex flex-wrap items-center gap-2 text-xs text-slate-500 dark:text-slate-400 font-mono">
                          <span>{acc.accountNumber}</span>
                          <span>•</span>
                          <span>{acc.routingNumber ? `ABA: ${acc.routingNumber}` : `Sort: ${acc.sortCode}`}</span>
                          {acc.interestRateAPY && (
                            <>
                              <span>•</span>
                              <span className="text-[#00A651] font-bold font-sans">{acc.interestRateAPY}% APY</span>
                            </>
                          )}
                        </div>
                      </div>
                    </div>

                    <div className="text-left sm:text-right border-t sm:border-t-0 pt-2 sm:pt-0 border-slate-100 dark:border-slate-800">
                      <div className="text-[10px] text-slate-400 font-medium uppercase tracking-wider">Available</div>
                      <div className="text-lg font-bold font-mono text-slate-900 dark:text-white">
                        {maskBalances ? (
                          <span className="text-slate-400">••••••••</span>
                        ) : (
                          <CurrencyDisplay
                            amountMinor={acc.availableBalanceMinor}
                            currency={acc.currency}
                            size="lg"
                            className="text-slate-900 dark:text-white font-bold"
                          />
                        )}
                      </div>
                    </div>
                  </div>
                ))}
              </div>

              {/* Instant Copy Ingress Bar (Minimalist Single Bar) */}
              <div className="p-4 rounded-xl bg-slate-50 dark:bg-slate-900/60 border border-slate-200/80 dark:border-slate-800 flex flex-col sm:flex-row sm:items-center justify-between gap-3 text-xs">
                <div className="space-y-0.5">
                  <span className="font-bold text-slate-900 dark:text-white flex items-center gap-1.5">
                    <Building2 className="w-4 h-4 text-[#004281] dark:text-blue-400" />
                    Direct Fedwire / Swift Wire Ingress
                  </span>
                  <p className="text-slate-500 dark:text-slate-400 text-[11px]">
                    ABA Routing: <strong className="font-mono text-slate-700 dark:text-slate-300">021000021</strong> • SWIFT: <strong className="font-mono text-slate-700 dark:text-slate-300">FABUS33NYC</strong>
                  </p>
                </div>
                <button
                  onClick={() => handleCopy('ABA: 021000021 | SWIFT: FABUS33NYC', 'wire')}
                  className="px-3 py-1.5 rounded-lg bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 text-slate-800 dark:text-slate-200 font-medium text-xs hover:bg-slate-100 transition-all flex items-center justify-center gap-1.5 cursor-pointer shrink-0"
                >
                  {copiedField === 'wire' ? <Check className="w-3.5 h-3.5 text-[#00A651]" /> : <Copy className="w-3.5 h-3.5" />}
                  <span>{copiedField === 'wire' ? 'Copied' : 'Copy Wire Codes'}</span>
                </button>
              </div>
            </div>

            {/* Right Column: Recent Activity (Flutterwave / Paystack clean row styling) */}
            <div className="lg:col-span-5 space-y-4">
              <div className="flex items-center justify-between">
                <h2 className="text-sm font-bold text-slate-900 dark:text-white tracking-tight">
                  Recent Activity
                </h2>
                <button
                  onClick={() => setActiveTab('activity')}
                  className="text-xs font-semibold text-[#004281] dark:text-blue-400 hover:underline cursor-pointer"
                >
                  View All &rarr;
                </button>
              </div>

              <div className="bg-white dark:bg-[#0f172a] rounded-xl border border-slate-200/80 dark:border-slate-800 shadow-2xs divide-y divide-slate-100 dark:divide-slate-800/80 overflow-hidden">
                {(recentTransactions || []).slice(0, 5).map((tx) => (
                  <div
                    key={tx.id}
                    onClick={() => setSelectedTx(tx)}
                    className="p-4 hover:bg-slate-50/80 dark:hover:bg-slate-800/40 transition-colors cursor-pointer flex items-center justify-between gap-3"
                  >
                    <div className="flex items-center gap-3 min-w-0">
                      <div
                        className={`w-9 h-9 rounded-xl flex items-center justify-center shrink-0 ${
                          tx.direction === 'CREDIT'
                            ? 'bg-emerald-50 dark:bg-emerald-950/60 text-[#00A651] dark:text-emerald-400 border border-emerald-200 dark:border-emerald-800'
                            : 'bg-slate-100 dark:bg-slate-800 text-[#004281] dark:text-blue-400 border border-slate-200 dark:border-slate-700'
                        }`}
                      >
                        {tx.direction === 'CREDIT' ? (
                          <ArrowDownLeft className="w-4 h-4" />
                        ) : (
                          <ArrowUpRight className="w-4 h-4" />
                        )}
                      </div>
                      <div className="min-w-0 space-y-0.5">
                        <p className="text-xs font-semibold text-slate-900 dark:text-white truncate">
                          {tx.description}
                        </p>
                        <div className="flex items-center gap-1.5 text-[11px] text-slate-500 dark:text-slate-400 font-mono">
                          <span>{new Date(tx.effectiveTimestamp).toLocaleDateString()}</span>
                          <span>•</span>
                          <span className="truncate">{tx.category}</span>
                        </div>
                      </div>
                    </div>

                    <div className="text-right shrink-0">
                      <CurrencyDisplay
                        amountMinor={tx.amountMinor}
                        currency={tx.currency}
                        showSign={true}
                        size="sm"
                        className={tx.direction === 'CREDIT' ? 'text-[#00A651] dark:text-emerald-400 font-bold font-mono' : 'text-slate-900 dark:text-white font-bold font-mono'}
                      />
                      <div className="mt-0.5">
                        <StatusBadge status={tx.status} size="sm" />
                      </div>
                    </div>
                  </div>
                ))}
              </div>

              {/* Security Status Snippet */}
              <div className="p-4 rounded-xl bg-slate-50 dark:bg-slate-900/60 border border-slate-200/80 dark:border-slate-800 flex items-center justify-between gap-3">
                <div className="flex items-center gap-2.5">
                  <ShieldCheck className="w-5 h-5 text-[#00A651]" />
                  <div>
                    <div className="text-xs font-bold text-slate-900 dark:text-white">Security &amp; Device Protected</div>
                    <div className="text-[11px] text-slate-500">Biometric HSM &amp; 4-Digit PIN Active</div>
                  </div>
                </div>
                <button
                  onClick={() => setActiveTab('vault')}
                  className="text-xs font-semibold text-[#004281] dark:text-blue-400 hover:underline cursor-pointer"
                >
                  Manage &rarr;
                </button>
              </div>
            </div>
          </motion.div>
        )}

        {/* Tab 2: Activity & Ledger */}
        {activeTab === 'activity' && (
          <motion.div
            key="activity"
            initial={{ opacity: 0, y: 6 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -6 }}
            transition={{ duration: 0.15 }}
            className="bg-white dark:bg-[#0f172a] rounded-2xl p-5 sm:p-6 border border-slate-200/80 dark:border-slate-800 shadow-sm space-y-5"
          >
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
              <div>
                <h3 className="text-base font-bold text-slate-900 dark:text-white">
                  Real-Time Authoritative Clearing Ledger
                </h3>
                <p className="text-xs text-slate-500 dark:text-slate-400">
                  Cryptographically hashed dual-entry transaction flow
                </p>
              </div>

              {/* Search & Filter pills */}
              <div className="flex flex-wrap items-center gap-2">
                <div className="relative">
                  <Search className="w-3.5 h-3.5 absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" />
                  <input
                    type="text"
                    value={searchQuery}
                    onChange={(e) => setSearchQuery(e.target.value)}
                    placeholder="Search transactions..."
                    className="pl-8 pr-3 py-1.5 rounded-lg bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 text-xs text-slate-900 dark:text-white focus:outline-none focus:border-[#004281]"
                  />
                </div>

                <div className="flex items-center gap-1 p-1 bg-slate-100 dark:bg-slate-800 rounded-lg">
                  {['ALL', 'CREDIT', 'DEBIT'].map((f) => (
                    <button
                      key={f}
                      onClick={() => setActivityFilter(f as any)}
                      className={`px-3 py-1 rounded-md text-xs font-semibold transition-all cursor-pointer ${
                        activityFilter === f
                          ? 'bg-white dark:bg-slate-700 text-slate-900 dark:text-white shadow-2xs'
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
                  className="py-3.5 hover:bg-slate-50/80 dark:hover:bg-slate-800/30 px-3 rounded-lg transition-colors cursor-pointer flex flex-col sm:flex-row sm:items-center justify-between gap-3"
                >
                  <div className="flex items-center gap-3 min-w-0">
                    <div
                      className={`w-9 h-9 rounded-xl flex items-center justify-center shrink-0 ${
                        tx.direction === 'CREDIT'
                          ? 'bg-emerald-50 dark:bg-emerald-950/60 text-[#00A651] dark:text-emerald-400 border border-emerald-200 dark:border-emerald-800'
                          : 'bg-slate-100 dark:bg-slate-800 text-[#004281] dark:text-blue-400 border border-slate-200 dark:border-slate-700'
                      }`}
                    >
                      {tx.direction === 'CREDIT' ? (
                        <ArrowDownLeft className="w-4 h-4" />
                      ) : (
                        <ArrowUpRight className="w-4 h-4" />
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
                      className={tx.direction === 'CREDIT' ? 'text-[#00A651] dark:text-emerald-400 font-bold font-mono' : 'text-slate-900 dark:text-white font-bold font-mono'}
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

        {/* Tab 3: Analytics & Growth */}
        {activeTab === 'growth' && (
          <motion.div
            key="growth"
            initial={{ opacity: 0, y: 6 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -6 }}
            transition={{ duration: 0.15 }}
            className="space-y-6"
          >
            <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
              <div className="lg:col-span-8 bg-white dark:bg-[#0f172a] rounded-2xl p-6 border border-slate-200/80 dark:border-slate-800 shadow-sm space-y-4">
                <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2">
                  <div>
                    <h3 className="text-base font-bold text-slate-900 dark:text-white">
                      6-Month Portfolio Liquidity &amp; Yield Trajectory
                    </h3>
                    <p className="text-xs text-slate-500 dark:text-slate-400">
                      Compounded interest distributions vs net capital deposits
                    </p>
                  </div>
                  <span className="text-xs font-semibold text-[#00A651] dark:text-emerald-400 bg-emerald-50 dark:bg-emerald-950/60 px-3 py-1 rounded-full border border-emerald-200 dark:border-emerald-800 self-start">
                    +27.0% Net YTD
                  </span>
                </div>

                <div className="h-64 w-full pt-2">
                  <ResponsiveContainer width="100%" height="100%">
                    <AreaChart data={chartData}>
                      <defs>
                        <linearGradient id="liquidityGrad" x1="0" y1="0" x2="0" y2="1">
                          <stop offset="5%" stopColor="#004281" stopOpacity={0.3} />
                          <stop offset="95%" stopColor="#004281" stopOpacity={0.0} />
                        </linearGradient>
                      </defs>
                      <CartesianGrid strokeDasharray="3 3" stroke={darkMode ? '#1e293b' : '#f1f5f9'} />
                      <XAxis dataKey="month" stroke={darkMode ? '#64748b' : '#94a3b8'} fontSize={12} />
                      <YAxis
                        stroke={darkMode ? '#64748b' : '#94a3b8'}
                        fontSize={12}
                        tickFormatter={(v) => `$${(v / 1000).toFixed(0)}k`}
                      />
                      <Tooltip
                        contentStyle={{
                          backgroundColor: darkMode ? '#0f172a' : '#ffffff',
                          borderColor: darkMode ? '#1e293b' : '#e2e8f0',
                          color: darkMode ? '#ffffff' : '#0f172a',
                          borderRadius: '0.5rem',
                          fontSize: '12px'
                        }}
                        formatter={(value: any) => [`$${Number(value).toLocaleString()}`, 'Portfolio Total']}
                      />
                      <Area
                        type="monotone"
                        dataKey="balance"
                        stroke="#004281"
                        strokeWidth={2.5}
                        fillOpacity={1}
                        fill="url(#liquidityGrad)"
                      />
                    </AreaChart>
                  </ResponsiveContainer>
                </div>
              </div>

              <div className="lg:col-span-4 space-y-4">
                <div className="bg-white dark:bg-[#0f172a] rounded-2xl p-6 border border-slate-200/80 dark:border-slate-800 shadow-sm space-y-4">
                  <h4 className="text-sm font-bold text-slate-900 dark:text-white">
                    Asset Allocation
                  </h4>

                  <div className="space-y-3 text-xs">
                    <div>
                      <div className="flex justify-between font-medium mb-1">
                        <span className="text-slate-700 dark:text-slate-300">High-Yield Savings (5.15% APY)</span>
                        <span className="text-[#00A651] font-mono font-semibold">68%</span>
                      </div>
                      <div className="w-full h-2 rounded-full bg-slate-100 dark:bg-slate-800 overflow-hidden">
                        <div className="h-full bg-[#00A651] rounded-full" style={{ width: '68%' }} />
                      </div>
                    </div>

                    <div>
                      <div className="flex justify-between font-medium mb-1">
                        <span className="text-slate-700 dark:text-slate-300">Premier Checking (Liquidity)</span>
                        <span className="text-[#004281] dark:text-blue-400 font-mono font-semibold">24%</span>
                      </div>
                      <div className="w-full h-2 rounded-full bg-slate-100 dark:bg-slate-800 overflow-hidden">
                        <div className="h-full bg-[#004281] dark:bg-blue-500 rounded-full" style={{ width: '24%' }} />
                      </div>
                    </div>

                    <div>
                      <div className="flex justify-between font-medium mb-1">
                        <span className="text-slate-700 dark:text-slate-300">Credit Reserve &amp; Escrow</span>
                        <span className="text-blue-500 font-mono font-semibold">8%</span>
                      </div>
                      <div className="w-full h-2 rounded-full bg-slate-100 dark:bg-slate-800 overflow-hidden">
                        <div className="h-full bg-blue-500 rounded-full" style={{ width: '8%' }} />
                      </div>
                    </div>
                  </div>
                </div>

                <div className="p-5 rounded-2xl bg-emerald-500/10 border border-emerald-500/20 text-xs text-emerald-900 dark:text-emerald-300 space-y-2">
                  <div className="flex items-center gap-2 font-bold">
                    <Sparkles className="w-4 h-4 text-[#00A651]" />
                    <span>Projected Monthly Passive Yield</span>
                  </div>
                  <div className="text-2xl font-bold font-mono text-[#00A651]">
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

        {/* Tab 4: Security & Passport Credentials */}
        {activeTab === 'vault' && (
          <motion.div
            key="vault"
            initial={{ opacity: 0, y: 6 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -6 }}
            transition={{ duration: 0.15 }}
            className="grid grid-cols-1 lg:grid-cols-12 gap-6"
          >
            {/* Passport & KYC Credentials */}
            <div className="lg:col-span-6 bg-white dark:bg-[#0f172a] rounded-2xl p-6 border border-slate-200/80 dark:border-slate-800 shadow-sm space-y-4">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-3">
                  <div className="w-10 h-10 rounded-xl bg-emerald-50 dark:bg-emerald-950/60 text-[#00A651] dark:text-emerald-400 flex items-center justify-center border border-emerald-200 dark:border-emerald-800">
                    <UserCheck className="w-5 h-5" />
                  </div>
                  <div>
                    <h4 className="text-sm font-bold text-slate-900 dark:text-white">
                      Passport &amp; Identity Credentials
                    </h4>
                    <span className="text-[11px] font-mono text-[#00A651] font-semibold">
                      VERIFIED &amp; BIOMETRICALLY LINKED
                    </span>
                  </div>
                </div>
                <span className="px-2.5 py-1 rounded-full bg-emerald-100 dark:bg-emerald-900/60 text-emerald-800 dark:text-emerald-200 text-[10px] font-bold font-mono">
                  TIER 3 KYC
                </span>
              </div>

              <div className="p-4 rounded-xl bg-slate-50 dark:bg-slate-900/60 border border-slate-200/80 dark:border-slate-800 space-y-2.5 text-xs">
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
                  <span className="font-mono text-[#004281] dark:text-blue-400 font-semibold">
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
                className="w-full py-2.5 rounded-xl bg-slate-100 dark:bg-slate-800 hover:bg-slate-200 dark:hover:bg-slate-700 text-slate-800 dark:text-slate-200 font-semibold text-xs transition-colors flex items-center justify-center gap-2 cursor-pointer"
              >
                <FileCheck className="w-4 h-4 text-[#004281] dark:text-blue-400" />
                <span>Update KYC Passport Document</span>
              </button>
            </div>

            {/* 4-Digit Security PIN */}
            <div className="lg:col-span-6 bg-white dark:bg-[#0f172a] rounded-2xl p-6 border border-slate-200/80 dark:border-slate-800 shadow-sm space-y-4">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-3">
                  <div className="w-10 h-10 rounded-xl bg-[#004281] text-white flex items-center justify-center">
                    <KeyRound className="w-5 h-5" />
                  </div>
                  <div>
                    <h4 className="text-sm font-bold text-slate-900 dark:text-white">
                      4-Digit Banking PIN
                    </h4>
                    <span className="text-[11px] font-mono text-[#00A651] font-semibold">
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

              <div className="p-4 rounded-xl bg-slate-50 dark:bg-slate-900/60 border border-slate-200/80 dark:border-slate-800 flex items-center justify-between text-xs font-mono">
                <span className="text-slate-500">PIN Status:</span>
                <span className="text-[#00A651] font-bold">● ● ● ● (ENROLLED)</span>
              </div>

              <button
                onClick={() => setCurrentView('DASHBOARD_PROFILE')}
                className="w-full py-2.5 rounded-xl bg-[#004281] hover:bg-[#003366] text-white font-semibold text-xs transition-colors flex items-center justify-center gap-2 cursor-pointer"
              >
                <span>Change 4-Digit Banking PIN</span>
              </button>
            </div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Transaction Detail Receipt Modal */}
      {selectedTx && (
        <div className="fixed inset-0 z-50 bg-slate-950/60 backdrop-blur-xs flex items-center justify-center p-4">
          <div className="bg-white dark:bg-[#0f172a] rounded-2xl max-w-md w-full p-6 shadow-2xl border border-slate-200 dark:border-slate-800 space-y-5 animate-in fade-in zoom-in-95 duration-150 text-slate-900 dark:text-slate-100">
            <div className="flex items-center justify-between pb-3 border-b border-slate-100 dark:border-slate-800">
              <div>
                <span className="text-[10px] uppercase font-bold tracking-widest text-[#004281] dark:text-blue-400">
                  Authoritative Ledger Record
                </span>
                <h3 className="text-base font-bold text-slate-900 dark:text-white">
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

            <div className="text-center py-2 space-y-1">
              <div className="text-xs text-slate-500 dark:text-slate-400 font-medium">Transaction Amount</div>
              <CurrencyDisplay
                amountMinor={selectedTx.amountMinor}
                currency={selectedTx.currency}
                showSign={true}
                size="xl"
                className={selectedTx.direction === 'CREDIT' ? 'text-[#00A651] font-bold font-mono' : 'text-slate-900 dark:text-white font-bold font-mono'}
              />
              <div className="pt-2">
                <StatusBadge status={selectedTx.status} />
              </div>
            </div>

            <div className="bg-slate-50 dark:bg-slate-900/70 rounded-xl p-4 border border-slate-200/80 dark:border-slate-800 space-y-2.5 text-xs text-slate-700 dark:text-slate-300 font-mono">
              <div className="flex justify-between">
                <span className="text-slate-500 font-sans">Reference:</span>
                <span className="font-bold text-[#004281] dark:text-blue-400">{selectedTx.referenceNumber}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-slate-500 font-sans">Description:</span>
                <span className="font-sans font-medium text-slate-900 dark:text-white">{selectedTx.description}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-slate-500 font-sans">Counterparty:</span>
                <span className="font-sans font-medium text-slate-900 dark:text-white">{selectedTx.counterparty}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-slate-500 font-sans">Channel / Rail:</span>
                <span className="font-bold">{selectedTx.channel}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-slate-500 font-sans">Effective Date:</span>
                <span>{new Date(selectedTx.effectiveTimestamp).toLocaleString()}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-slate-500 font-sans">Balance After:</span>
                <span className="font-bold">${(selectedTx.balanceAfterMinor / 100).toLocaleString('en-US', { minimumFractionDigits: 2 })}</span>
              </div>
            </div>

            <div className="flex gap-3 pt-1">
              <button
                onClick={() => {
                  window.print();
                }}
                className="flex-1 py-2.5 rounded-xl border border-slate-300 dark:border-slate-700 text-slate-700 dark:text-slate-200 font-semibold text-xs flex items-center justify-center gap-1.5 hover:bg-slate-50 dark:hover:bg-slate-800 cursor-pointer"
              >
                <Download className="w-4 h-4" />
                <span>Export PDF</span>
              </button>
              <button
                onClick={() => setSelectedTx(null)}
                className="flex-1 py-2.5 rounded-xl bg-[#004281] text-white font-semibold text-xs hover:bg-[#003366] cursor-pointer"
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
