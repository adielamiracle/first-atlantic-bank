import React, { useState } from 'react';
import { useBank } from '../../context/BankContext';
import { CurrencyDisplay } from '../../components/common/CurrencyDisplay';
import { StatusBadge } from '../../components/common/StatusBadge';
import { motion, AnimatePresence } from 'motion/react';
import {
  Send,
  Plus,
  ArrowUpRight,
  ArrowDownLeft,
  Receipt,
  Eye,
  EyeOff,
  ChevronRight,
  Search,
  Download,
  Copy,
  Check,
  Sparkles,
  Bot,
  TrendingUp,
  CreditCard,
  Wallet,
  Building2,
  CheckCircle2,
  Clock,
  ShieldCheck,
  FileText,
  KeyRound,
  UserCheck,
  BarChart3,
  Landmark
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

  const [activeTab, setActiveTab] = useState<'overview' | 'activity' | 'growth' | 'vault'>('overview');
  const [maskBalances, setMaskBalances] = useState(false);
  const [selectedTx, setSelectedTx] = useState<LedgerEntry | null>(null);
  const [copiedField, setCopiedField] = useState<string | null>(null);
  const [activityFilter, setActivityFilter] = useState<'ALL' | 'CREDIT' | 'DEBIT'>('ALL');
  const [searchQuery, setSearchQuery] = useState('');
  const [showAiModal, setShowAiModal] = useState(false);
  const [showAccountDetailsModal, setShowAccountDetailsModal] = useState(false);
  const [showRequestModal, setShowRequestModal] = useState(false);

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

  // Formatted date (e.g., "Sunday, August 23, 2026")
  const todayFormatted = new Date().toLocaleDateString('en-US', {
    weekday: 'long',
    month: 'long',
    day: 'numeric',
    year: 'numeric'
  });

  // Greeting based on time of day
  const hour = new Date().getHours();
  const greetingTime = hour < 12 ? 'Good morning' : hour < 18 ? 'Good afternoon' : 'Good evening';
  const userName = currentUser ? `${currentUser.firstName} ${currentUser.lastName}` : 'First Atlantic Admin';

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

  // Spending categories for "Spending this month"
  const spendingCategories = [
    { name: 'Wire & Outgoing Transfers', spent: '$12,450.00', pct: 65, color: 'bg-[#f8c22d]' },
    { name: 'Card Settlements & Bills', spent: '$3,820.00', pct: 20, color: 'bg-blue-500' },
    { name: 'Merchant & Travel Spending', spent: '$2,100.00', pct: 15, color: 'bg-emerald-500' },
  ];

  return (
    <div className="space-y-5 max-w-4xl mx-auto pb-16">
      {/* 1. DATE & GREETING HEADER */}
      <div className="space-y-1 pt-1">
        <p className="text-xs sm:text-sm font-medium text-slate-500 dark:text-slate-400">
          {todayFormatted}
        </p>
        <h1 className="text-xl sm:text-2xl lg:text-3xl font-extrabold tracking-tight text-slate-900 dark:text-white">
          {greetingTime}, {userName}
        </h1>
      </div>

      {/* 2. THE HERO YELLOW TOTAL AVAILABLE CARD */}
      <section className="bg-[#f8c22d] text-slate-950 rounded-3xl p-5 sm:p-6 shadow-md border border-amber-300/40 relative overflow-hidden transition-all">
        {/* Top row inside card: "Total available" + Eye icon */}
        <div className="flex items-center justify-between mb-2">
          <button
            onClick={() => setMaskBalances(!maskBalances)}
            className="flex items-center gap-1.5 text-xs sm:text-sm font-semibold text-slate-950/90 hover:text-slate-950 cursor-pointer select-none"
            title="Toggle Privacy Mask"
          >
            <span>Total available</span>
            {maskBalances ? (
              <EyeOff className="w-4 h-4 text-slate-950" />
            ) : (
              <Eye className="w-4 h-4 text-slate-950" />
            )}
          </button>
        </div>

        {/* Big Bold Amount */}
        <div className="my-1">
          {maskBalances ? (
            <div className="text-3xl sm:text-4xl lg:text-5xl font-extrabold tracking-tight font-mono text-slate-950">
              ••••••••
            </div>
          ) : (
            <div className="text-3xl sm:text-4xl lg:text-5xl font-extrabold tracking-tight font-sans text-slate-950">
              <CurrencyDisplay
                amountMinor={totalNetWorthUsdMinor}
                currency="USD"
                size="xl"
                className="text-slate-950 font-extrabold"
              />
            </div>
          )}
        </div>

        {/* Subtitle: "Across your accounts" */}
        <p className="text-xs sm:text-sm font-medium text-slate-900/80 mb-5">
          Across your accounts
        </p>

        {/* Card Action Buttons (Pills at bottom of card) */}
        <div className="flex items-center gap-2.5 pt-1">
          {/* Send money pill */}
          <button
            onClick={() => setCurrentView('DASHBOARD_TRANSFERS')}
            className="bg-slate-950 hover:bg-slate-900 text-white px-4 py-2.5 rounded-full flex items-center gap-2 text-xs sm:text-sm font-semibold shadow-xs transition-all cursor-pointer active:scale-95"
          >
            <Send className="w-3.5 h-3.5 rotate-45" />
            <span>Send money</span>
          </button>

          {/* Details pill */}
          <button
            onClick={() => setShowAccountDetailsModal(true)}
            className="bg-black/5 hover:bg-black/10 border border-black/15 text-slate-950 px-4 py-2.5 rounded-full flex items-center gap-1.5 text-xs sm:text-sm font-semibold transition-all cursor-pointer active:scale-95"
          >
            <span>Details</span>
          </button>
        </div>
      </section>

      {/* 3. QUICK ACTIONS (4 WHITE CARDS WITH YELLOW CIRCULAR BADGES) */}
      <section className="space-y-2.5">
        <h2 className="text-sm sm:text-base font-bold text-slate-900 dark:text-white">
          Quick actions
        </h2>

        <div className="grid grid-cols-4 gap-2 sm:gap-3.5">
          {/* Action 1: Send */}
          <button
            onClick={() => setCurrentView('DASHBOARD_TRANSFERS')}
            className="bg-white dark:bg-[#0f172a] rounded-2xl p-3 sm:p-4 border border-slate-100 dark:border-slate-800/80 shadow-xs hover:shadow-md hover:border-amber-400 dark:hover:border-amber-400/50 transition-all flex flex-col items-center justify-center gap-2 text-center cursor-pointer group active:scale-95"
          >
            <div className="w-10 h-10 sm:w-11 sm:h-11 rounded-full bg-[#f8c22d] text-slate-950 flex items-center justify-center font-bold shadow-2xs group-hover:scale-105 transition-transform">
              <ArrowUpRight className="w-5 h-5 stroke-[2.5]" />
            </div>
            <span className="text-xs sm:text-sm font-semibold text-slate-900 dark:text-slate-100 truncate w-full">
              Send
            </span>
          </button>

          {/* Action 2: Request */}
          <button
            onClick={() => setShowRequestModal(true)}
            className="bg-white dark:bg-[#0f172a] rounded-2xl p-3 sm:p-4 border border-slate-100 dark:border-slate-800/80 shadow-xs hover:shadow-md hover:border-amber-400 dark:hover:border-amber-400/50 transition-all flex flex-col items-center justify-center gap-2 text-center cursor-pointer group active:scale-95"
          >
            <div className="w-10 h-10 sm:w-11 sm:h-11 rounded-full bg-[#f8c22d] text-slate-950 flex items-center justify-center font-bold shadow-2xs group-hover:scale-105 transition-transform">
              <ArrowDownLeft className="w-5 h-5 stroke-[2.5]" />
            </div>
            <span className="text-xs sm:text-sm font-semibold text-slate-900 dark:text-slate-100 truncate w-full">
              Request
            </span>
          </button>

          {/* Action 3: Add money */}
          <button
            onClick={() => setCurrentView('DASHBOARD_DEPOSIT')}
            className="bg-white dark:bg-[#0f172a] rounded-2xl p-3 sm:p-4 border border-slate-100 dark:border-slate-800/80 shadow-xs hover:shadow-md hover:border-amber-400 dark:hover:border-amber-400/50 transition-all flex flex-col items-center justify-center gap-2 text-center cursor-pointer group active:scale-95"
          >
            <div className="w-10 h-10 sm:w-11 sm:h-11 rounded-full bg-[#f8c22d] text-slate-950 flex items-center justify-center font-bold shadow-2xs group-hover:scale-105 transition-transform">
              <Plus className="w-5 h-5 stroke-[2.5]" />
            </div>
            <span className="text-xs sm:text-sm font-semibold text-slate-900 dark:text-slate-100 truncate w-full">
              Add money
            </span>
          </button>

          {/* Action 4: Pay bills */}
          <button
            onClick={() => setCurrentView('DASHBOARD_BILLPAY')}
            className="bg-white dark:bg-[#0f172a] rounded-2xl p-3 sm:p-4 border border-slate-100 dark:border-slate-800/80 shadow-xs hover:shadow-md hover:border-amber-400 dark:hover:border-amber-400/50 transition-all flex flex-col items-center justify-center gap-2 text-center cursor-pointer group active:scale-95"
          >
            <div className="w-10 h-10 sm:w-11 sm:h-11 rounded-full bg-[#f8c22d] text-slate-950 flex items-center justify-center font-bold shadow-2xs group-hover:scale-105 transition-transform">
              <Receipt className="w-5 h-5 stroke-[2.2]" />
            </div>
            <span className="text-xs sm:text-sm font-semibold text-slate-900 dark:text-slate-100 truncate w-full">
              Pay bills
            </span>
          </button>
        </div>
      </section>

      {/* 4. YOUR ACCOUNTS SECTION */}
      <section className="space-y-3">
        <div className="flex items-center justify-between">
          <h2 className="text-sm sm:text-base font-bold text-slate-900 dark:text-white">
            Your accounts
          </h2>
          <button
            onClick={() => setCurrentView('DASHBOARD_ACCOUNT_DETAIL')}
            className="text-xs sm:text-sm font-semibold text-slate-600 dark:text-slate-400 hover:text-[#d97706] dark:hover:text-[#f8c22d] flex items-center gap-1 cursor-pointer transition-colors"
          >
            <span>View all</span>
            <ChevronRight className="w-4 h-4" />
          </button>
        </div>

        {/* Account Cards */}
        <div className="space-y-2.5">
          {accounts.map((acc) => (
            <div
              key={acc.id}
              onClick={() => {
                setSelectedAccountId(acc.id);
                setCurrentView('DASHBOARD_ACCOUNT_DETAIL');
              }}
              className="bg-white dark:bg-[#0f172a] rounded-2xl p-4 sm:p-5 border border-slate-200/80 dark:border-slate-800/90 shadow-2xs hover:shadow-sm hover:border-[#f8c22d] dark:hover:border-amber-400/60 transition-all cursor-pointer flex flex-col sm:flex-row sm:items-center justify-between gap-3 group"
            >
              <div className="flex items-center gap-3.5 min-w-0">
                <div className="w-10 h-10 sm:w-11 sm:h-11 rounded-xl bg-amber-50 dark:bg-amber-950/40 text-slate-900 dark:text-amber-300 flex items-center justify-center border border-amber-200/60 dark:border-amber-900/40 shrink-0 group-hover:bg-[#f8c22d] group-hover:text-slate-950 transition-colors">
                  {acc.type === 'CREDIT_CARD_INFINITE' ? (
                    <CreditCard className="w-5 h-5" />
                  ) : acc.type === 'SAVINGS_HIGH_YIELD' ? (
                    <TrendingUp className="w-5 h-5 text-emerald-600 dark:text-emerald-400 group-hover:text-slate-950" />
                  ) : (
                    <Wallet className="w-5 h-5" />
                  )}
                </div>

                <div className="space-y-0.5 min-w-0">
                  <div className="flex items-center gap-2">
                    <span className="text-xs sm:text-sm font-bold text-slate-900 dark:text-white truncate">
                      {acc.name}
                    </span>
                    <StatusBadge status={acc.status} size="sm" />
                  </div>
                  <div className="flex flex-wrap items-center gap-1.5 text-[11px] sm:text-xs text-slate-500 dark:text-slate-400 font-mono">
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

              <div className="text-left sm:text-right border-t sm:border-t-0 pt-2 sm:pt-0 border-slate-100 dark:border-slate-800/80 flex sm:flex-col justify-between sm:justify-start items-center sm:items-end">
                <div className="text-[10px] text-slate-400 font-medium uppercase tracking-wider">Available</div>
                <div className="text-base sm:text-lg font-bold font-mono text-slate-900 dark:text-white">
                  {maskBalances ? (
                    <span className="text-slate-400">••••••••</span>
                  ) : (
                    <CurrencyDisplay
                      amountMinor={acc.availableBalanceMinor}
                      currency={acc.currency}
                      size="md"
                      className="text-slate-900 dark:text-white font-bold"
                    />
                  )}
                </div>
              </div>
            </div>
          ))}
        </div>
      </section>

      {/* 5. SPENDING THIS MONTH & AI PILL WIDGET */}
      <section className="bg-white dark:bg-[#0f172a] rounded-3xl p-5 border border-slate-200/80 dark:border-slate-800/90 shadow-2xs space-y-4">
        <div className="flex items-center justify-between">
          <h2 className="text-sm sm:text-base font-bold text-slate-900 dark:text-white">
            Spending this month
          </h2>

          {/* Yellow First Atlantic AI Pill Button */}
          <button
            onClick={() => setShowAiModal(true)}
            className="bg-[#f8c22d] hover:bg-[#fabc22] text-slate-950 font-bold px-3.5 py-1.5 rounded-full text-xs flex items-center gap-1.5 shadow-2xs transition-transform active:scale-95 cursor-pointer"
          >
            <Bot className="w-3.5 h-3.5 text-slate-950 stroke-[2.5]" />
            <span>First Atlantic AI</span>
            <ChevronRight className="w-3.5 h-3.5" />
          </button>
        </div>

        {/* Visual Category Breakdown */}
        <div className="space-y-3 pt-1">
          {spendingCategories.map((cat, idx) => (
            <div key={idx} className="space-y-1">
              <div className="flex items-center justify-between text-xs">
                <span className="font-semibold text-slate-700 dark:text-slate-300">{cat.name}</span>
                <span className="font-mono font-bold text-slate-900 dark:text-white">{cat.spent}</span>
              </div>
              <div className="w-full h-2 rounded-full bg-slate-100 dark:bg-slate-800 overflow-hidden">
                <div className={`h-full ${cat.color} rounded-full`} style={{ width: `${cat.pct}%` }} />
              </div>
            </div>
          ))}
        </div>
      </section>

      {/* 6. RECENT ACTIVITY & TRANSACTIONS */}
      <section className="space-y-3">
        <div className="flex items-center justify-between">
          <h2 className="text-sm sm:text-base font-bold text-slate-900 dark:text-white">
            Recent activity
          </h2>
          <button
            onClick={() => setCurrentView('DASHBOARD_STATEMENTS')}
            className="text-xs sm:text-sm font-semibold text-slate-600 dark:text-slate-400 hover:text-[#d97706] dark:hover:text-[#f8c22d] flex items-center gap-1 cursor-pointer transition-colors"
          >
            <span>View all</span>
            <ChevronRight className="w-4 h-4" />
          </button>
        </div>

        <div className="bg-white dark:bg-[#0f172a] rounded-2xl border border-slate-200/80 dark:border-slate-800 shadow-2xs divide-y divide-slate-100 dark:divide-slate-800/80 overflow-hidden">
          {(recentTransactions || []).slice(0, 5).map((tx) => (
            <div
              key={tx.id}
              onClick={() => setSelectedTx(tx)}
              className="p-3.5 sm:p-4 hover:bg-slate-50/80 dark:hover:bg-slate-800/40 transition-colors cursor-pointer flex items-center justify-between gap-3"
            >
              <div className="flex items-center gap-3 min-w-0">
                <div
                  className={`w-9 h-9 rounded-xl flex items-center justify-center shrink-0 ${
                    tx.direction === 'CREDIT'
                      ? 'bg-emerald-50 dark:bg-emerald-950/60 text-[#00A651] dark:text-emerald-400 border border-emerald-200 dark:border-emerald-800'
                      : 'bg-slate-100 dark:bg-slate-800 text-slate-900 dark:text-slate-100 border border-slate-200 dark:border-slate-700'
                  }`}
                >
                  {tx.direction === 'CREDIT' ? (
                    <ArrowDownLeft className="w-4 h-4" />
                  ) : (
                    <ArrowUpRight className="w-4 h-4" />
                  )}
                </div>
                <div className="min-w-0 space-y-0.5">
                  <p className="text-xs sm:text-sm font-semibold text-slate-900 dark:text-white truncate">
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
      </section>

      {/* 7. INSTANT WIRE INGRESS & CLEARING BAR */}
      <div className="p-3.5 sm:p-4 rounded-2xl bg-amber-50/70 dark:bg-amber-950/20 border border-amber-200/60 dark:border-amber-900/40 flex flex-col sm:flex-row sm:items-center justify-between gap-3 text-xs">
        <div className="space-y-0.5">
          <span className="font-bold text-slate-900 dark:text-white flex items-center gap-1.5 text-xs">
            <Building2 className="w-4 h-4 text-amber-600 dark:text-amber-400 shrink-0" />
            Direct Fedwire &amp; SWIFT Wire Ingress
          </span>
          <p className="text-slate-600 dark:text-slate-400 text-[11px]">
            ABA Routing: <strong className="font-mono text-slate-800 dark:text-slate-200">021000021</strong> • SWIFT: <strong className="font-mono text-slate-800 dark:text-slate-200">FABUS33NYC</strong>
          </p>
        </div>
        <button
          onClick={() => handleCopy('ABA: 021000021 | SWIFT: FABUS33NYC', 'wire')}
          className="px-3 py-1.5 rounded-full bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 text-slate-800 dark:text-slate-200 font-semibold text-xs hover:bg-slate-100 transition-all flex items-center justify-center gap-1.5 cursor-pointer shrink-0 shadow-2xs"
        >
          {copiedField === 'wire' ? <Check className="w-3.5 h-3.5 text-emerald-600" /> : <Copy className="w-3.5 h-3.5 text-slate-500" />}
          <span>{copiedField === 'wire' ? 'Copied' : 'Copy Wire Codes'}</span>
        </button>
      </div>

      {/* MODAL 1: First Atlantic AI Assistant Modal */}
      {showAiModal && (
        <div className="fixed inset-0 z-50 bg-slate-950/60 backdrop-blur-xs flex items-center justify-center p-4">
          <div className="bg-white dark:bg-[#0f172a] rounded-3xl max-w-md w-full p-6 shadow-2xl border border-slate-200 dark:border-slate-800 space-y-4 animate-in fade-in zoom-in-95 duration-150 text-slate-900 dark:text-slate-100">
            <div className="flex items-center justify-between pb-3 border-b border-slate-100 dark:border-slate-800">
              <div className="flex items-center gap-2">
                <div className="w-8 h-8 rounded-full bg-[#f8c22d] text-slate-950 flex items-center justify-center font-bold">
                  <Bot className="w-4 h-4 stroke-[2.5]" />
                </div>
                <div>
                  <h3 className="text-base font-bold text-slate-900 dark:text-white">
                    First Atlantic Financial AI
                  </h3>
                  <span className="text-[10px] text-emerald-600 dark:text-emerald-400 font-semibold">
                    Real-Time Financial Intelligence
                  </span>
                </div>
              </div>
              <button
                onClick={() => setShowAiModal(false)}
                className="text-slate-400 hover:text-slate-700 dark:hover:text-white text-xl font-bold p-1 cursor-pointer"
              >
                &times;
              </button>
            </div>

            <div className="p-4 rounded-2xl bg-slate-50 dark:bg-slate-900/60 border border-slate-200/80 dark:border-slate-800 space-y-2 text-xs">
              <p className="font-semibold text-slate-800 dark:text-slate-200">
                Hi {currentUser?.firstName || 'there'}! Here is your August financial summary:
              </p>
              <ul className="space-y-1.5 text-slate-600 dark:text-slate-300 list-disc pl-4">
                <li>Total liquidity is steady with <strong className="text-emerald-600 font-mono">+5.15% APY</strong> yielding passive daily interest.</li>
                <li>Your spending is 14% lower than last month, putting you on track to save an extra <strong className="font-mono text-slate-900 dark:text-white">$3,200</strong> this cycle.</li>
                <li>No suspicious card transactions detected; 4-digit PIN and biometrics are active.</li>
              </ul>
            </div>

            <button
              onClick={() => {
                setShowAiModal(false);
                setCurrentView('DASHBOARD_MESSAGES');
              }}
              className="w-full py-3 rounded-full bg-[#f8c22d] hover:bg-[#fabc22] text-slate-950 font-bold text-xs transition-colors flex items-center justify-center gap-2 cursor-pointer shadow-xs"
            >
              <Bot className="w-4 h-4" />
              <span>Open Concierge Chat</span>
            </button>
          </div>
        </div>
      )}

      {/* MODAL 2: Account Details Breakdown Modal */}
      {showAccountDetailsModal && (
        <div className="fixed inset-0 z-50 bg-slate-950/60 backdrop-blur-xs flex items-center justify-center p-4">
          <div className="bg-white dark:bg-[#0f172a] rounded-3xl max-w-md w-full p-6 shadow-2xl border border-slate-200 dark:border-slate-800 space-y-4 animate-in fade-in zoom-in-95 duration-150 text-slate-900 dark:text-slate-100">
            <div className="flex items-center justify-between pb-3 border-b border-slate-100 dark:border-slate-800">
              <div>
                <span className="text-[10px] uppercase font-bold tracking-widest text-[#d97706] dark:text-[#f8c22d]">
                  Portfolio Liquidity
                </span>
                <h3 className="text-base font-bold text-slate-900 dark:text-white">
                  Balance Breakdown
                </h3>
              </div>
              <button
                onClick={() => setShowAccountDetailsModal(false)}
                className="text-slate-400 hover:text-slate-700 dark:hover:text-white text-xl font-bold p-1 cursor-pointer"
              >
                &times;
              </button>
            </div>

            <div className="space-y-2.5 text-xs">
              {accounts.map((acc) => (
                <div key={acc.id} className="p-3 rounded-xl bg-slate-50 dark:bg-slate-900 border border-slate-200/80 dark:border-slate-800 flex items-center justify-between">
                  <div>
                    <div className="font-bold text-slate-900 dark:text-white">{acc.name}</div>
                    <div className="text-[11px] text-slate-400 font-mono">{acc.accountNumber}</div>
                  </div>
                  <div className="text-right font-bold font-mono text-slate-900 dark:text-white">
                    <CurrencyDisplay amountMinor={acc.availableBalanceMinor} currency={acc.currency} size="sm" />
                  </div>
                </div>
              ))}
            </div>

            <div className="pt-2">
              <button
                onClick={() => {
                  setShowAccountDetailsModal(false);
                  setCurrentView('DASHBOARD_ACCOUNT_DETAIL');
                }}
                className="w-full py-3 rounded-full bg-slate-950 dark:bg-white text-white dark:text-slate-950 font-bold text-xs transition-colors cursor-pointer"
              >
                Manage Full Ledger
              </button>
            </div>
          </div>
        </div>
      )}

      {/* MODAL 3: Request / Ingress Details Modal */}
      {showRequestModal && (
        <div className="fixed inset-0 z-50 bg-slate-950/60 backdrop-blur-xs flex items-center justify-center p-4">
          <div className="bg-white dark:bg-[#0f172a] rounded-3xl max-w-md w-full p-6 shadow-2xl border border-slate-200 dark:border-slate-800 space-y-4 animate-in fade-in zoom-in-95 duration-150 text-slate-900 dark:text-slate-100">
            <div className="flex items-center justify-between pb-3 border-b border-slate-100 dark:border-slate-800">
              <div>
                <span className="text-[10px] uppercase font-bold tracking-widest text-[#d97706] dark:text-[#f8c22d]">
                  Receive &amp; Request
                </span>
                <h3 className="text-base font-bold text-slate-900 dark:text-white">
                  Payment Request &amp; Wire Ingress
                </h3>
              </div>
              <button
                onClick={() => setShowRequestModal(false)}
                className="text-slate-400 hover:text-slate-700 dark:hover:text-white text-xl font-bold p-1 cursor-pointer"
              >
                &times;
              </button>
            </div>

            <div className="p-4 rounded-2xl bg-slate-50 dark:bg-slate-900 space-y-2.5 text-xs font-mono">
              <div className="flex justify-between">
                <span className="text-slate-500">Beneficiary:</span>
                <span className="font-bold text-slate-900 dark:text-white">{currentUser?.firstName} {currentUser?.lastName}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-slate-500">Account:</span>
                <span className="font-bold text-slate-900 dark:text-white">{primaryChecking?.accountNumber}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-slate-500">ABA Routing:</span>
                <span className="font-bold text-amber-600 dark:text-amber-400">021000021</span>
              </div>
              <div className="flex justify-between">
                <span className="text-slate-500">SWIFT / BIC:</span>
                <span className="font-bold text-amber-600 dark:text-amber-400">FABUS33NYC</span>
              </div>
            </div>

            <div className="flex gap-2">
              <button
                onClick={() => handleCopy(`Beneficiary: ${currentUser?.firstName} ${currentUser?.lastName} | Account: ${primaryChecking?.accountNumber} | ABA: 021000021 | SWIFT: FABUS33NYC`, 'req')}
                className="flex-1 py-3 rounded-full bg-[#f8c22d] text-slate-950 font-bold text-xs flex items-center justify-center gap-1.5 cursor-pointer shadow-xs"
              >
                {copiedField === 'req' ? <Check className="w-4 h-4 text-emerald-700" /> : <Copy className="w-4 h-4" />}
                <span>{copiedField === 'req' ? 'Copied Details' : 'Copy All Details'}</span>
              </button>
              <button
                onClick={() => setShowRequestModal(false)}
                className="px-5 py-3 rounded-full bg-slate-100 dark:bg-slate-800 text-slate-800 dark:text-slate-200 font-bold text-xs cursor-pointer"
              >
                Close
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Transaction Detail Receipt Modal */}
      {selectedTx && (
        <div className="fixed inset-0 z-50 bg-slate-950/60 backdrop-blur-xs flex items-center justify-center p-4">
          <div className="bg-white dark:bg-[#0f172a] rounded-3xl max-w-md w-full p-6 shadow-2xl border border-slate-200 dark:border-slate-800 space-y-4 animate-in fade-in zoom-in-95 duration-150 text-slate-900 dark:text-slate-100">
            <div className="flex items-center justify-between pb-3 border-b border-slate-100 dark:border-slate-800">
              <div>
                <span className="text-[10px] uppercase font-bold tracking-widest text-[#d97706] dark:text-[#f8c22d]">
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
              <div className="pt-1">
                <StatusBadge status={selectedTx.status} />
              </div>
            </div>

            <div className="bg-slate-50 dark:bg-slate-900/70 rounded-2xl p-4 border border-slate-200/80 dark:border-slate-800 space-y-2.5 text-xs text-slate-700 dark:text-slate-300 font-mono">
              <div className="flex justify-between">
                <span className="text-slate-500 font-sans">Reference:</span>
                <span className="font-bold text-slate-900 dark:text-white">{selectedTx.referenceNumber}</span>
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
                <span className="text-slate-500 font-sans">Effective Date:</span>
                <span>{new Date(selectedTx.effectiveTimestamp).toLocaleString()}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-slate-500 font-sans">Balance After:</span>
                <span className="font-bold">${(selectedTx.balanceAfterMinor / 100).toLocaleString('en-US', { minimumFractionDigits: 2 })}</span>
              </div>
            </div>

            <div className="flex gap-2.5 pt-1">
              <button
                onClick={() => window.print()}
                className="flex-1 py-2.5 rounded-full border border-slate-300 dark:border-slate-700 text-slate-700 dark:text-slate-200 font-semibold text-xs flex items-center justify-center gap-1.5 hover:bg-slate-50 dark:hover:bg-slate-800 cursor-pointer"
              >
                <Download className="w-4 h-4" />
                <span>Export PDF</span>
              </button>
              <button
                onClick={() => setSelectedTx(null)}
                className="flex-1 py-2.5 rounded-full bg-slate-950 text-white dark:bg-white dark:text-slate-950 font-semibold text-xs cursor-pointer"
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

