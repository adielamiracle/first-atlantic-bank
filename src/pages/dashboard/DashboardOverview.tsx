import React, { useState } from 'react';
import { useBank } from '../../context/BankContext';
import { CurrencyDisplay } from '../../components/common/CurrencyDisplay';
import { StatusBadge } from '../../components/common/StatusBadge';
import {
  Send,
  Plus,
  ArrowUpRight,
  ArrowDownLeft,
  Receipt,
  Eye,
  EyeOff,
  ChevronRight,
  Bot,
  TrendingUp,
  CreditCard,
  Wallet,
  Building2,
  Check,
  Copy,
  Download,
  CheckCircle2,
  Sparkles,
  ShieldCheck,
  Landmark
} from 'lucide-react';
import { LedgerEntry } from '../../types';

export const DashboardOverview: React.FC = () => {
  const {
    currentUser,
    accounts,
    recentTransactions,
    totalNetWorthUsdMinor,
    setCurrentView,
    setSelectedAccountId
  } = useBank();

  const [maskBalances, setMaskBalances] = useState(false);
  const [selectedTx, setSelectedTx] = useState<LedgerEntry | null>(null);
  const [copiedField, setCopiedField] = useState<string | null>(null);
  const [showAiModal, setShowAiModal] = useState(false);
  const [showAccountDetailsModal, setShowAccountDetailsModal] = useState(false);
  const [showRequestModal, setShowRequestModal] = useState(false);

  const primaryChecking = accounts.find((a) => a.type === 'CHECKING_PREMIER') || accounts[0];

  // Dynamic formatted date e.g. "Friday, August 28, 2026"
  const todayFormatted = new Date().toLocaleDateString('en-US', {
    weekday: 'long',
    month: 'long',
    day: 'numeric',
    year: 'numeric'
  });

  // Dynamic greeting
  const hour = new Date().getHours();
  const greetingTime = hour < 12 ? 'Good morning' : hour < 18 ? 'Good afternoon' : 'Good evening';
  const userName = currentUser 
    ? (currentUser.role === 'ADMIN' ? 'First Atlantic Admin' : `${currentUser.firstName} ${currentUser.lastName}`)
    : 'First Atlantic Admin';

  const handleCopy = (text: string, label: string) => {
    navigator.clipboard.writeText(text);
    setCopiedField(label);
    setTimeout(() => setCopiedField(null), 2000);
  };

  // Spending categories breakdown for "Spending this month"
  const spendingCategories = [
    { name: 'Wire & Outgoing Transfers', spent: '$12,450.00', pct: 65, color: 'bg-[#FFC300]' },
    { name: 'Bills, Utilities & Subscriptions', spent: '$3,820.00', pct: 20, color: 'bg-blue-500' },
    { name: 'Merchant & Travel Spending', spent: '$2,100.00', pct: 15, color: 'bg-[#10B981]' },
  ];

  return (
    <div className="w-full max-w-md mx-auto sm:max-w-lg md:max-w-xl px-2 sm:px-3 py-2 space-y-6 pb-28 text-black dark:text-white font-sans">
      {/* 1. DATE & GREETING */}
      <div className="space-y-1 pt-1">
        <p className="text-[14px] font-normal text-[#6B7280] dark:text-slate-400">
          {todayFormatted}
        </p>
        <h1 className="text-[22px] sm:text-[25px] font-bold tracking-tight text-black dark:text-white leading-tight">
          {greetingTime}, {userName}
        </h1>
      </div>

      {/* 2. HERO TOTAL AVAILABLE CARD (#FFC300, 24px radius, 24px padding) */}
      <section className="bg-[#FFC300] rounded-[24px] p-6 text-black shadow-xs relative overflow-hidden transition-all">
        {/* Top: Total available with Eye icon right beside it */}
        <div className="flex items-center justify-between mb-1">
          <button
            onClick={() => setMaskBalances(!maskBalances)}
            className="flex items-center gap-1.5 text-[14px] font-medium text-black cursor-pointer select-none hover:opacity-85 transition-opacity"
            title="Toggle Privacy Mask"
          >
            <span>Total available</span>
            {maskBalances ? (
              <EyeOff className="w-4 h-4 text-black stroke-[2]" />
            ) : (
              <Eye className="w-4 h-4 text-black stroke-[2]" />
            )}
          </button>
        </div>

        {/* Balance Amount: Inter 700 40px */}
        <div className="my-2">
          {maskBalances ? (
            <div className="text-[38px] sm:text-[42px] font-bold tracking-tight text-black">
              $••••••••
            </div>
          ) : (
            <div className="text-[38px] sm:text-[42px] font-bold tracking-tight text-black leading-tight font-sans">
              <CurrencyDisplay
                amountMinor={totalNetWorthUsdMinor}
                currency="USD"
                size="2xl"
                className="text-black font-bold"
              />
            </div>
          )}
        </div>

        {/* Subtitle: "Across your accounts" in black 80% */}
        <p className="text-[14px] font-normal text-black/80 mb-6">
          Across your accounts
        </p>

        {/* Action Buttons: Black "Send money" + Outline "Details" */}
        <div className="flex items-center gap-3">
          {/* Black Send money button */}
          <button
            onClick={() => setCurrentView('DASHBOARD_TRANSFERS')}
            className="bg-black hover:bg-neutral-900 text-white px-5 py-2.5 rounded-full flex items-center gap-2 text-[14px] font-semibold shadow-xs transition-all cursor-pointer active:scale-95"
          >
            <Send className="w-4 h-4 rotate-45 stroke-[2.5]" />
            <span>Send money</span>
          </button>

          {/* Outline Details button */}
          <button
            onClick={() => setShowAccountDetailsModal(true)}
            className="bg-transparent hover:bg-black/5 border border-black text-black px-6 py-2.5 rounded-full text-[14px] font-semibold transition-colors cursor-pointer active:scale-95"
          >
            <span>Details</span>
          </button>
        </div>
      </section>

      {/* 3. QUICK ACTIONS (4 WHITE CARDS WITH #FFC300 CIRCLES) */}
      <section className="space-y-3">
        <h2 className="text-[16px] font-bold text-black dark:text-white">
          Quick actions
        </h2>

        <div className="grid grid-cols-4 gap-2 sm:gap-3">
          {/* 1. Send */}
          <button
            onClick={() => setCurrentView('DASHBOARD_TRANSFERS')}
            className="bg-white dark:bg-[#1a1a1a] rounded-[18px] sm:rounded-[20px] px-1 py-3 sm:px-3 sm:py-3.5 flex flex-col items-center justify-center text-center shadow-xs hover:shadow-md transition-all cursor-pointer group active:scale-95 border border-slate-100 dark:border-slate-800"
          >
            <div className="w-10 h-10 sm:w-11 sm:h-11 rounded-full bg-[#FFC300] text-black flex items-center justify-center mb-2 shadow-xs group-hover:scale-105 transition-transform shrink-0">
              <ArrowUpRight className="w-5 h-5 sm:w-5.5 sm:h-5.5 stroke-[2.5]" />
            </div>
            <span className="text-[12px] sm:text-[13px] font-semibold text-black dark:text-white whitespace-nowrap text-center">
              Send
            </span>
          </button>

          {/* 2. Request */}
          <button
            onClick={() => setShowRequestModal(true)}
            className="bg-white dark:bg-[#1a1a1a] rounded-[18px] sm:rounded-[20px] px-1 py-3 sm:px-3 sm:py-3.5 flex flex-col items-center justify-center text-center shadow-xs hover:shadow-md transition-all cursor-pointer group active:scale-95 border border-slate-100 dark:border-slate-800"
          >
            <div className="w-10 h-10 sm:w-11 sm:h-11 rounded-full bg-[#FFC300] text-black flex items-center justify-center mb-2 shadow-xs group-hover:scale-105 transition-transform shrink-0">
              <ArrowDownLeft className="w-5 h-5 sm:w-5.5 sm:h-5.5 stroke-[2.5]" />
            </div>
            <span className="text-[12px] sm:text-[13px] font-semibold text-black dark:text-white whitespace-nowrap text-center">
              Request
            </span>
          </button>

          {/* 3. Add money */}
          <button
            onClick={() => setCurrentView('DASHBOARD_DEPOSIT')}
            className="bg-white dark:bg-[#1a1a1a] rounded-[18px] sm:rounded-[20px] px-1 py-3 sm:px-3 sm:py-3.5 flex flex-col items-center justify-center text-center shadow-xs hover:shadow-md transition-all cursor-pointer group active:scale-95 border border-slate-100 dark:border-slate-800"
          >
            <div className="w-10 h-10 sm:w-11 sm:h-11 rounded-full bg-[#FFC300] text-black flex items-center justify-center mb-2 shadow-xs group-hover:scale-105 transition-transform shrink-0">
              <Plus className="w-5 h-5 sm:w-5.5 sm:h-5.5 stroke-[2.5]" />
            </div>
            <span className="text-[12px] sm:text-[13px] font-semibold text-black dark:text-white whitespace-nowrap text-center">
              Add money
            </span>
          </button>

          {/* 4. Pay bills */}
          <button
            onClick={() => setCurrentView('DASHBOARD_BILLPAY')}
            className="bg-white dark:bg-[#1a1a1a] rounded-[18px] sm:rounded-[20px] px-1 py-3 sm:px-3 sm:py-3.5 flex flex-col items-center justify-center text-center shadow-xs hover:shadow-md transition-all cursor-pointer group active:scale-95 border border-slate-100 dark:border-slate-800"
          >
            <div className="w-10 h-10 sm:w-11 sm:h-11 rounded-full bg-[#FFC300] text-black flex items-center justify-center mb-2 shadow-xs group-hover:scale-105 transition-transform shrink-0">
              <CreditCard className="w-4.5 h-4.5 sm:w-5 sm:h-5 stroke-[2.2]" />
            </div>
            <span className="text-[12px] sm:text-[13px] font-semibold text-black dark:text-white whitespace-nowrap text-center">
              Pay bills
            </span>
          </button>
        </div>
      </section>

      {/* 4. YOUR ACCOUNTS WITH "VIEW ALL >" */}
      <section className="space-y-3">
        <div className="flex items-center justify-between">
          <h2 className="text-[16px] font-bold text-black dark:text-white">
            Your accounts
          </h2>
          <button
            onClick={() => setCurrentView('DASHBOARD_ACCOUNT_DETAIL')}
            className="text-[14px] font-medium text-[#6B7280] hover:text-black dark:hover:text-white flex items-center gap-0.5 cursor-pointer transition-colors"
          >
            <span>View all</span>
            <ChevronRight className="w-4 h-4 stroke-[2]" />
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
              className="bg-white dark:bg-[#1a1a1a] rounded-[18px] p-3.5 sm:p-4 flex items-center justify-between gap-3 shadow-xs hover:shadow-md border border-slate-100 dark:border-slate-800 cursor-pointer transition-all active:scale-99"
            >
              <div className="flex items-center gap-3 min-w-0">
                <div className="w-10 h-10 rounded-full bg-[#F8F9FA] dark:bg-slate-800 text-black dark:text-[#FFC300] flex items-center justify-center shrink-0 border border-slate-200/70 dark:border-slate-700">
                  {acc.type === 'CREDIT_CARD_INFINITE' ? (
                    <CreditCard className="w-5 h-5 stroke-[2]" />
                  ) : acc.type === 'SAVINGS_HIGH_YIELD' ? (
                    <TrendingUp className="w-5 h-5 text-[#10B981] stroke-[2]" />
                  ) : (
                    <Wallet className="w-5 h-5 stroke-[2]" />
                  )}
                </div>

                <div className="space-y-0.5 min-w-0">
                  <div className="flex items-center gap-1.5 flex-wrap">
                    <span className="text-[14px] sm:text-[15px] font-bold text-black dark:text-white truncate">
                      {acc.name}
                    </span>
                    <StatusBadge status={acc.status} size="sm" />
                  </div>
                  <div className="flex items-center gap-1.5 text-[12px] text-[#6B7280] dark:text-slate-400 truncate">
                    <span className="font-medium">{acc.accountNumber}</span>
                    {acc.interestRateAPY && (
                      <>
                        <span>•</span>
                        <span className="text-[#10B981] font-semibold">
                          {acc.interestRateAPY}% APY
                        </span>
                      </>
                    )}
                  </div>
                </div>
              </div>

              <div className="flex flex-col items-end text-right shrink-0">
                <span className="text-[11px] text-[#6B7280] dark:text-slate-400 font-medium">Available</span>
                <div className="text-[15px] sm:text-[16px] font-bold text-black dark:text-white leading-tight mt-0.5">
                  {maskBalances ? (
                    <span className="text-[#6B7280]">••••••••</span>
                  ) : (
                    <CurrencyDisplay
                      amountMinor={acc.availableBalanceMinor}
                      currency={acc.currency}
                      size="md"
                      className="text-black dark:text-white font-bold"
                    />
                  )}
                </div>
              </div>
            </div>
          ))}
        </div>
      </section>

      {/* 5. SPENDING THIS MONTH WITH CATEGORIES & FIRST ATLANTIC AI BUTTON */}
      <section className="space-y-3">
        <div className="flex items-center justify-between">
          <h2 className="text-[16px] font-bold text-black dark:text-white">
            Spending this month
          </h2>

          {/* First Atlantic AI Yellow Pill Button - Compact Mobile First */}
          <button
            onClick={() => setShowAiModal(true)}
            className="bg-[#FFC300] hover:bg-[#f5b800] text-black font-bold px-2.5 py-1 sm:px-3.5 sm:py-1.5 rounded-full text-[11px] sm:text-[12px] flex items-center gap-1 sm:gap-1.5 shadow-xs transition-transform active:scale-95 cursor-pointer whitespace-nowrap shrink-0"
          >
            <Bot className="w-3.5 h-3.5 text-black stroke-[2.5] shrink-0" />
            <span className="truncate">First Atlantic AI</span>
            <ChevronRight className="w-3 h-3 stroke-[2.5] shrink-0" />
          </button>
        </div>

        {/* White Card with Monthly Spending Details */}
        <div className="bg-white dark:bg-[#1a1a1a] rounded-[18px] p-5 shadow-xs border border-slate-100 dark:border-slate-800 space-y-4">
          <div className="flex items-center justify-between pb-1 border-b border-slate-100 dark:border-slate-800">
            <span className="text-[13px] font-medium text-[#6B7280]">Total Outflows This Cycle</span>
            <span className="text-[16px] font-bold text-black dark:text-white font-sans">$18,370.00</span>
          </div>

          <div className="space-y-3">
            {spendingCategories.map((cat, idx) => (
              <div key={idx} className="space-y-1.5">
                <div className="flex items-center justify-between text-[13px]">
                  <span className="font-semibold text-slate-800 dark:text-slate-200">{cat.name}</span>
                  <span className="font-bold text-black dark:text-white">{cat.spent}</span>
                </div>
                <div className="w-full h-2.5 rounded-full bg-slate-100 dark:bg-slate-800 overflow-hidden">
                  <div className={`h-full ${cat.color} rounded-full transition-all duration-500`} style={{ width: `${cat.pct}%` }} />
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* 6. RECENT ACTIVITY */}
      <section className="space-y-3">
        <div className="flex items-center justify-between">
          <h2 className="text-[16px] sm:text-[17px] font-bold text-black dark:text-white">
            Recent activity
          </h2>
          <button
            onClick={() => setCurrentView('DASHBOARD_STATEMENTS')}
            className="text-[14px] font-medium text-[#6B7280] hover:text-black dark:hover:text-white flex items-center gap-0.5 cursor-pointer transition-colors"
          >
            <span>View all</span>
            <ChevronRight className="w-4 h-4 stroke-[2]" />
          </button>
        </div>

        <div className="bg-white dark:bg-[#1a1a1a] rounded-[16px] shadow-xs border border-slate-100 dark:border-slate-800 divide-y divide-slate-100 dark:divide-slate-800 overflow-hidden">
          {(recentTransactions || []).slice(0, 4).map((tx) => (
            <div
              key={tx.id}
              onClick={() => setSelectedTx(tx)}
              className="p-3.5 sm:p-4 hover:bg-slate-50 dark:hover:bg-slate-800/50 transition-colors cursor-pointer flex items-center justify-between gap-3"
            >
              <div className="flex items-center gap-3 min-w-0">
                <div
                  className={`w-9 h-9 rounded-full flex items-center justify-center shrink-0 ${
                    tx.direction === 'CREDIT'
                      ? 'bg-emerald-50 text-[#10B981]'
                      : 'bg-slate-100 text-black dark:bg-slate-800 dark:text-white'
                  }`}
                >
                  {tx.direction === 'CREDIT' ? (
                    <ArrowDownLeft className="w-4 h-4 stroke-[2.5]" />
                  ) : (
                    <ArrowUpRight className="w-4 h-4 stroke-[2.5]" />
                  )}
                </div>
                <div className="min-w-0 space-y-0.5">
                  <p className="text-[13px] sm:text-[14px] font-semibold text-black dark:text-white truncate">
                    {tx.description}
                  </p>
                  <div className="flex items-center gap-1.5 text-[11px] text-[#6B7280] font-sans">
                    <span>{new Date(tx.effectiveTimestamp).toLocaleDateString()}</span>
                    <span>•</span>
                    <span className="truncate">{tx.category}</span>
                  </div>
                </div>
              </div>

              <div className="flex flex-col items-end text-right shrink-0">
                <CurrencyDisplay
                  amountMinor={tx.amountMinor}
                  currency={tx.currency}
                  showSign={true}
                  size="sm"
                  className={tx.direction === 'CREDIT' ? 'text-[#10B981] font-bold font-sans' : 'text-black dark:text-white font-bold font-sans'}
                />
                <div className="mt-0.5">
                  <StatusBadge status={tx.status} size="sm" />
                </div>
              </div>
            </div>
          ))}
        </div>
      </section>

      {/* 7. WIRE INGRESS & CLEARING CARD */}
      <div className="p-4 rounded-[16px] bg-white dark:bg-[#1a1a1a] border border-slate-200 dark:border-slate-800 shadow-xs flex flex-col sm:flex-row sm:items-center justify-between gap-3 text-xs">
        <div className="space-y-0.5">
          <span className="font-bold text-black dark:text-white flex items-center gap-1.5 text-xs">
            <Building2 className="w-4 h-4 text-[#FFC300] shrink-0" />
            Direct Fedwire &amp; SWIFT Wire Ingress
          </span>
          <p className="text-[#6B7280] text-[12px]">
            ABA Routing: <strong className="font-mono text-black dark:text-white">021000021</strong> • SWIFT: <strong className="font-mono text-black dark:text-white">FABUS33NYC</strong>
          </p>
        </div>
        <button
          onClick={() => handleCopy('ABA: 021000021 | SWIFT: FABUS33NYC', 'wire')}
          className="px-3.5 py-1.5 rounded-full bg-slate-100 dark:bg-slate-800 hover:bg-slate-200 dark:hover:bg-slate-700 text-black dark:text-white font-semibold text-xs transition-colors flex items-center justify-center gap-1.5 cursor-pointer shrink-0"
        >
          {copiedField === 'wire' ? <Check className="w-3.5 h-3.5 text-[#10B981]" /> : <Copy className="w-3.5 h-3.5 text-[#6B7280]" />}
          <span>{copiedField === 'wire' ? 'Copied' : 'Copy Wire Codes'}</span>
        </button>
      </div>

      {/* FLOATING ACTION PILL (Fixed on Mobile Bottom Right) */}
      <div className="fixed bottom-20 right-4 sm:hidden z-30">
        <button
          onClick={() => setShowAiModal(true)}
          className="bg-[#FFC300] hover:bg-[#f5b800] text-black font-bold px-4 py-2.5 rounded-full text-[13px] flex items-center gap-2 shadow-xl border border-black/10 transition-transform active:scale-95 cursor-pointer"
        >
          <Bot className="w-4 h-4 text-black stroke-[2.5]" />
          <span>First Atlantic AI</span>
        </button>
      </div>

      {/* MODAL 1: First Atlantic AI Assistant */}
      {showAiModal && (
        <div className="fixed inset-0 z-50 bg-black/60 backdrop-blur-xs flex items-center justify-center p-4">
          <div className="bg-white dark:bg-[#1a1a1a] rounded-[24px] max-w-md w-full p-6 shadow-2xl border border-slate-100 dark:border-slate-800 space-y-4 animate-in fade-in zoom-in-95 duration-150 text-black dark:text-white">
            <div className="flex items-center justify-between pb-3 border-b border-slate-100 dark:border-slate-800">
              <div className="flex items-center gap-2.5">
                <div className="w-9 h-9 rounded-full bg-[#FFC300] text-black flex items-center justify-center font-bold shadow-xs">
                  <Bot className="w-4 h-4 stroke-[2.5]" />
                </div>
                <div>
                  <h3 className="text-base font-bold text-black dark:text-white">
                    First Atlantic Financial AI
                  </h3>
                  <span className="text-[11px] text-[#10B981] font-semibold">
                    Real-Time Financial Intelligence
                  </span>
                </div>
              </div>
              <button
                onClick={() => setShowAiModal(false)}
                className="p-1.5 rounded-full bg-slate-100 dark:bg-slate-800 text-[#6B7280] hover:text-black dark:hover:text-white cursor-pointer"
              >
                &times;
              </button>
            </div>

            <div className="p-4 rounded-2xl bg-slate-50 dark:bg-slate-800/50 space-y-2 text-xs">
              <p className="font-semibold text-black dark:text-white">
                Hi {currentUser?.firstName || 'Admin'}! Here is your August liquidity overview:
              </p>
              <ul className="space-y-1.5 text-[#6B7280] dark:text-slate-300 list-disc pl-4">
                <li>Total portfolio liquidity is fully reconciled with <strong className="text-[#10B981] font-mono">+5.15% APY</strong> yielding passive daily interest.</li>
                <li>Your spending is 14% lower than last month, putting you on track to save an extra <strong className="font-mono text-black dark:text-white">$3,200</strong> this cycle.</li>
                <li>No suspicious card transactions detected; 4-digit PIN and biometrics are active.</li>
              </ul>
            </div>

            <button
              onClick={() => {
                setShowAiModal(false);
                setCurrentView('DASHBOARD_MESSAGES');
              }}
              className="w-full py-3 rounded-full bg-[#FFC300] text-black font-bold text-xs transition-transform flex items-center justify-center gap-2 cursor-pointer shadow-md active:scale-95"
            >
              <Bot className="w-4 h-4" />
              <span>Open Concierge Chat</span>
            </button>
          </div>
        </div>
      )}

      {/* MODAL 2: Account Details Breakdown */}
      {showAccountDetailsModal && (
        <div className="fixed inset-0 z-50 bg-black/60 backdrop-blur-xs flex items-center justify-center p-4">
          <div className="bg-white dark:bg-[#1a1a1a] rounded-[24px] max-w-md w-full p-6 shadow-2xl border border-slate-100 dark:border-slate-800 space-y-4 animate-in fade-in zoom-in-95 duration-150 text-black dark:text-white">
            <div className="flex items-center justify-between pb-3 border-b border-slate-100 dark:border-slate-800">
              <div>
                <span className="text-[10px] uppercase font-bold tracking-widest text-[#FFC300]">
                  Portfolio Liquidity
                </span>
                <h3 className="text-base font-bold text-black dark:text-white">
                  Balance Breakdown
                </h3>
              </div>
              <button
                onClick={() => setShowAccountDetailsModal(false)}
                className="p-1.5 rounded-full bg-slate-100 dark:bg-slate-800 text-[#6B7280] hover:text-black dark:hover:text-white cursor-pointer"
              >
                &times;
              </button>
            </div>

            <div className="space-y-2.5 text-xs">
              {accounts.map((acc) => (
                <div key={acc.id} className="p-3.5 rounded-2xl bg-slate-50 dark:bg-slate-800/50 flex items-center justify-between border border-slate-100 dark:border-slate-800">
                  <div>
                    <div className="font-bold text-black dark:text-white">{acc.name}</div>
                    <div className="text-[11px] text-[#6B7280] font-mono">{acc.accountNumber}</div>
                  </div>
                  <div className="text-right font-bold font-mono text-black dark:text-white">
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
                className="w-full py-3 rounded-full bg-black text-white font-bold text-xs transition-colors cursor-pointer shadow-md"
              >
                Manage Full Ledger
              </button>
            </div>
          </div>
        </div>
      )}

      {/* MODAL 3: Request Modal */}
      {showRequestModal && (
        <div className="fixed inset-0 z-50 bg-black/60 backdrop-blur-xs flex items-center justify-center p-4">
          <div className="bg-white dark:bg-[#1a1a1a] rounded-[24px] max-w-md w-full p-6 shadow-2xl border border-slate-100 dark:border-slate-800 space-y-4 animate-in fade-in zoom-in-95 duration-150 text-black dark:text-white">
            <div className="flex items-center justify-between pb-3 border-b border-slate-100 dark:border-slate-800">
              <div>
                <span className="text-[10px] uppercase font-bold tracking-widest text-[#FFC300]">
                  Receive &amp; Request
                </span>
                <h3 className="text-base font-bold text-black dark:text-white">
                  Payment Request &amp; Wire Ingress
                </h3>
              </div>
              <button
                onClick={() => setShowRequestModal(false)}
                className="p-1.5 rounded-full bg-slate-100 dark:bg-slate-800 text-[#6B7280] hover:text-black dark:hover:text-white cursor-pointer"
              >
                &times;
              </button>
            </div>

            <div className="p-4 rounded-2xl bg-slate-50 dark:bg-slate-800/50 space-y-2.5 text-xs font-mono">
              <div className="flex justify-between">
                <span className="text-[#6B7280] font-sans">Beneficiary:</span>
                <span className="font-bold text-black dark:text-white">{currentUser?.firstName} {currentUser?.lastName}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-[#6B7280] font-sans">Account:</span>
                <span className="font-bold text-black dark:text-white">{primaryChecking?.accountNumber}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-[#6B7280] font-sans">ABA Routing:</span>
                <span className="font-bold text-black dark:text-white">021000021</span>
              </div>
              <div className="flex justify-between">
                <span className="text-[#6B7280] font-sans">SWIFT / BIC:</span>
                <span className="font-bold text-black dark:text-white">FABUS33NYC</span>
              </div>
            </div>

            <div className="flex gap-2">
              <button
                onClick={() => handleCopy(`Beneficiary: ${currentUser?.firstName} ${currentUser?.lastName} | Account: ${primaryChecking?.accountNumber} | ABA: 021000021 | SWIFT: FABUS33NYC`, 'req')}
                className="flex-1 py-3 rounded-full bg-[#FFC300] text-black font-bold text-xs flex items-center justify-center gap-1.5 cursor-pointer shadow-sm active:scale-95"
              >
                {copiedField === 'req' ? <Check className="w-4 h-4 text-[#10B981]" /> : <Copy className="w-4 h-4" />}
                <span>{copiedField === 'req' ? 'Copied Details' : 'Copy All Details'}</span>
              </button>
              <button
                onClick={() => setShowRequestModal(false)}
                className="px-5 py-3 rounded-full bg-slate-100 dark:bg-slate-800 text-black dark:text-white font-bold text-xs cursor-pointer hover:bg-slate-200 dark:hover:bg-slate-700 transition-colors"
              >
                Close
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Transaction Detail Modal */}
      {selectedTx && (
        <div className="fixed inset-0 z-50 bg-black/60 backdrop-blur-xs flex items-center justify-center p-4">
          <div className="bg-white dark:bg-[#1a1a1a] rounded-[24px] max-w-md w-full p-6 shadow-2xl border border-slate-100 dark:border-slate-800 space-y-4 animate-in fade-in zoom-in-95 duration-150 text-black dark:text-white">
            <div className="flex items-center justify-between pb-3 border-b border-slate-100 dark:border-slate-800">
              <div>
                <span className="text-[10px] uppercase font-bold tracking-widest text-[#FFC300]">
                  Ledger Record
                </span>
                <h3 className="text-base font-bold text-black dark:text-white">
                  Transaction Receipt
                </h3>
              </div>
              <button
                onClick={() => setSelectedTx(null)}
                className="p-1.5 rounded-full bg-slate-100 dark:bg-slate-800 text-[#6B7280] hover:text-black dark:hover:text-white cursor-pointer"
              >
                &times;
              </button>
            </div>

            <div className="text-center py-2 space-y-1">
              <div className="text-xs text-[#6B7280] font-medium">Transaction Amount</div>
              <CurrencyDisplay
                amountMinor={selectedTx.amountMinor}
                currency={selectedTx.currency}
                showSign={true}
                size="xl"
                className={selectedTx.direction === 'CREDIT' ? 'text-[#10B981] font-bold font-mono' : 'text-black dark:text-white font-bold font-mono'}
              />
              <div className="pt-1">
                <StatusBadge status={selectedTx.status} />
              </div>
            </div>

            <div className="bg-slate-50 dark:bg-slate-800/50 rounded-2xl p-4 space-y-2.5 text-xs text-[#6B7280] dark:text-slate-300 font-mono">
              <div className="flex justify-between">
                <span className="text-[#6B7280] font-sans">Reference:</span>
                <span className="font-bold text-black dark:text-white">{selectedTx.referenceNumber}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-[#6B7280] font-sans">Description:</span>
                <span className="font-sans font-medium text-black dark:text-white">{selectedTx.description}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-[#6B7280] font-sans">Counterparty:</span>
                <span className="font-sans font-medium text-black dark:text-white">{selectedTx.counterparty}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-[#6B7280] font-sans">Effective Date:</span>
                <span>{new Date(selectedTx.effectiveTimestamp).toLocaleString()}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-[#6B7280] font-sans">Balance After:</span>
                <span className="font-bold text-black dark:text-white">${(selectedTx.balanceAfterMinor / 100).toLocaleString('en-US', { minimumFractionDigits: 2 })}</span>
              </div>
            </div>

            <div className="flex gap-2.5 pt-1">
              <button
                onClick={() => window.print()}
                className="flex-1 py-2.5 rounded-full border border-slate-200 dark:border-slate-700 text-black dark:text-white font-semibold text-xs flex items-center justify-center gap-1.5 hover:bg-slate-50 dark:hover:bg-slate-800 transition-colors cursor-pointer"
              >
                <Download className="w-4 h-4" />
                <span>Export PDF</span>
              </button>
              <button
                onClick={() => setSelectedTx(null)}
                className="flex-1 py-2.5 rounded-full bg-black text-white font-semibold text-xs cursor-pointer shadow-md"
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
