import React, { useState, useEffect, useCallback } from 'react';
import { useNavigate } from 'react-router-dom';
import {
  Send,
  Plus,
  ArrowUpRight,
  ArrowDownLeft,
  Receipt,
  FileText,
  Headphones,
  Eye,
  EyeOff,
  Copy,
  Check,
  Building2,
  ShieldCheck,
  X,
  Sparkles,
  RefreshCw
} from 'lucide-react';
import { useBank } from '../context/BankContext';
import { supabase, isSupabaseConfigured } from '../lib/supabaseClient';

export const Dashboard = () => {
  const navigate = useNavigate();
  const {
    currentUser,
    accounts,
    recentTransactions,
    setCurrentView,
    showToast
  } = useBank();

  // State
  const [liveBalance, setLiveBalance] = useState(0);
  const [isLoadingBalance, setIsLoadingBalance] = useState(true);
  const [hideBalance, setHideBalance] = useState(false);
  const [copied, setCopied] = useState(false);
  const [showAddMoneyModal, setShowAddMoneyModal] = useState(false);
  const [accountNumber, setAccountNumber] = useState('1092837461');
  const [accountType, setAccountType] = useState('Checking');

  // FETCH LIVE BALANCE FROM SUPABASE VIA /api/user/me
  const fetchLiveBalance = useCallback(async (quiet = false) => {
    if (!quiet) setIsLoadingBalance(true);
    try {
      const token = localStorage.getItem('fab_session_token') || localStorage.getItem('token') || currentUser?.id;
      const headers = {};
      if (token) headers['Authorization'] = `Bearer ${token}`;
      if (currentUser?.id) headers['x-user-id'] = currentUser.id;

      const res = await fetch('/api/user/me', { headers });
      if (res.ok) {
        const data = await res.json();
        const bal = typeof data.balance === 'number'
          ? data.balance
          : (typeof data.user?.balance === 'number' ? data.user.balance : 0);

        setLiveBalance(bal);

        if (data.account) {
          if (data.account.account_number) setAccountNumber(data.account.account_number);
          if (data.account.account_type) setAccountType(data.account.account_type);
        } else if (accounts?.[0]) {
          setAccountNumber(accounts[0].accountNumberFull || accounts[0].accountNumber);
          setAccountType(accounts[0].name || 'Checking');
        }
      }
    } catch (err) {
      console.warn('[Dashboard] Notice fetching live balance from Supabase:', err);
    } finally {
      if (!quiet) setIsLoadingBalance(false);
    }
  }, [currentUser?.id, accounts]);

  // Initial fetch on mount + Realtime Subscription + Periodic Polling
  useEffect(() => {
    fetchLiveBalance();

    // Setup Supabase Realtime Subscription for instant database balance reflection
    let channel = null;
    if (isSupabaseConfigured && supabase) {
      try {
        channel = supabase
          .channel('realtime_dashboard_balance')
          .on(
            'postgres_changes',
            { event: '*', schema: 'public', table: 'accounts' },
            (payload) => {
              console.info('[Supabase Realtime] Balance table change detected:', payload);
              fetchLiveBalance(true);
            }
          )
          .on(
            'postgres_changes',
            { event: '*', schema: 'public', table: 'users' },
            () => {
              fetchLiveBalance(true);
            }
          )
          .subscribe();
      } catch (subErr) {
        console.warn('Realtime subscription setup notice:', subErr);
      }
    }

    // Resilient fallback polling every 10 seconds for seamless sync
    const interval = setInterval(() => {
      fetchLiveBalance(true);
    }, 10000);

    return () => {
      if (channel && supabase) {
        supabase.removeChannel(channel);
      }
      clearInterval(interval);
    };
  }, [fetchLiveBalance]);

  // Format currency
  const formatBalance = (amount) => {
    return Number(amount || 0).toLocaleString('en-US', {
      minimumFractionDigits: 2,
      maximumFractionDigits: 2
    });
  };

  const copyToClipboard = (text) => {
    navigator.clipboard.writeText(text);
    setCopied(true);
    if (showToast) showToast('INFO', 'Copied', 'Account number copied to clipboard.');
    setTimeout(() => setCopied(false), 2000);
  };

  // Activity: Last 3 transactions only
  const last3Transactions = (recentTransactions || []).slice(0, 3);

  return (
    <div className="min-h-screen bg-white dark:bg-slate-950 text-slate-900 dark:text-slate-100 font-sans p-4 sm:p-6">
      <div className="max-w-xl mx-auto space-y-6">

        {/* Top Header */}
        <div className="flex items-center justify-between pt-2">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-full bg-[#004281] text-white flex items-center justify-center font-bold text-sm shadow-xs">
              {(currentUser?.firstName?.[0] || 'C')}
            </div>
            <div>
              <div className="text-xs text-slate-500 dark:text-slate-400">Welcome,</div>
              <h1 className="text-base font-bold text-slate-900 dark:text-white leading-tight">
                {currentUser ? `${currentUser.firstName} ${currentUser.lastName}` : 'First Atlantic Client'}
              </h1>
            </div>
          </div>

          <div className="flex items-center gap-1.5 px-2.5 py-1 rounded-full bg-emerald-50 dark:bg-emerald-950/40 border border-emerald-200 dark:border-emerald-800 text-[11px] text-emerald-700 dark:text-emerald-300 font-medium">
            <span className="w-1.5 h-1.5 rounded-full bg-emerald-500 animate-pulse"></span>
            <span>Live Connected</span>
          </div>
        </div>

        {/* SECTION 1: BALANCE CARD */}
        {/* Only 1 card. Big font. "Available Balance $0.00". Under it 2 big buttons: [Send Money] [Add Money] */}
        <div className="w-full rounded-2xl bg-gradient-to-br from-[#003366] via-[#004281] to-[#0a2540] text-white p-6 shadow-lg relative overflow-hidden">
          {/* Subtle background glow */}
          <div className="absolute -right-12 -top-12 w-40 h-40 bg-blue-400/10 rounded-full blur-2xl pointer-events-none"></div>

          {/* Balance Header with Toggle */}
          <div className="flex items-center justify-between mb-2">
            <div className="flex items-center gap-2">
              <span className="text-xs font-semibold text-blue-100/90 tracking-wide uppercase">
                Available Balance
              </span>
              <button
                type="button"
                onClick={() => setHideBalance(!hideBalance)}
                className="p-1 text-blue-200 hover:text-white transition-colors cursor-pointer"
                title={hideBalance ? "Show balance" : "Hide balance"}
                aria-label="Toggle balance visibility"
              >
                {hideBalance ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
              </button>
            </div>

            <button
              type="button"
              onClick={() => fetchLiveBalance()}
              className="text-blue-200 hover:text-white p-1 transition-colors cursor-pointer"
              title="Refresh live balance from Supabase"
            >
              <RefreshCw className={`w-3.5 h-3.5 ${isLoadingBalance ? 'animate-spin' : ''}`} />
            </button>
          </div>

          {/* Big Balance Display */}
          <div className="py-2">
            <div className="text-3xl sm:text-4xl font-extrabold tracking-tight">
              {hideBalance ? '••••••••' : `$${formatBalance(liveBalance)}`}
            </div>
          </div>

          {/* Account Number & Copy */}
          <div className="flex items-center gap-2 pt-1 pb-6 text-xs text-blue-100/80">
            <span>Acct: {accountNumber}</span>
            <span>•</span>
            <span>{accountType}</span>
            <button
              type="button"
              onClick={() => copyToClipboard(accountNumber)}
              className="inline-flex items-center gap-1 text-[11px] text-blue-200 hover:text-white bg-white/10 hover:bg-white/20 px-2 py-0.5 rounded-md transition-colors cursor-pointer"
            >
              {copied ? <Check className="w-3 h-3 text-emerald-300" /> : <Copy className="w-3 h-3" />}
              <span>{copied ? 'Copied' : 'Copy'}</span>
            </button>
          </div>

          {/* Under it 2 big buttons: [Send Money] [Add Money] */}
          <div className="grid grid-cols-2 gap-3 pt-2">
            <button
              id="dashboard-send-money-btn"
              type="button"
              onClick={() => {
                setCurrentView('DASHBOARD_TRANSFERS');
                navigate('/transfer/amount');
              }}
              className="py-3 px-4 rounded-xl bg-white text-[#003366] hover:bg-slate-100 active:bg-slate-200 font-bold text-sm shadow-md transition-all flex items-center justify-center gap-2 min-h-[48px] cursor-pointer"
            >
              <Send className="w-4 h-4 text-[#003366]" />
              <span>Send Money</span>
            </button>

            <button
              id="dashboard-add-money-btn"
              type="button"
              onClick={() => setShowAddMoneyModal(true)}
              className="py-3 px-4 rounded-xl bg-white/15 hover:bg-white/25 active:bg-white/30 text-white font-bold text-sm border border-white/20 transition-all flex items-center justify-center gap-2 min-h-[48px] cursor-pointer"
            >
              <Plus className="w-4 h-4 text-white" />
              <span>Add Money</span>
            </button>
          </div>
        </div>

        {/* SECTION 2: QUICK ACTIONS */}
        {/* 4 icons: Transfer, Pay Bills, Statements, Support */}
        <div>
          <h2 className="text-xs font-bold text-slate-500 dark:text-slate-400 uppercase tracking-wider mb-3">
            Quick Actions
          </h2>
          <div className="grid grid-cols-4 gap-2.5 sm:gap-3">
            {/* Action 1: Transfer */}
            <button
              type="button"
              onClick={() => {
                setCurrentView('DASHBOARD_TRANSFERS');
                navigate('/transfer/amount');
              }}
              className="flex flex-col items-center justify-center p-3 rounded-2xl border border-slate-200/80 dark:border-slate-800 bg-white dark:bg-slate-900 hover:bg-slate-50 dark:hover:bg-slate-850 active:scale-98 transition-all min-h-[82px] cursor-pointer group"
            >
              <div className="w-11 h-11 rounded-full bg-blue-50 dark:bg-blue-950/60 text-[#004281] dark:text-blue-400 flex items-center justify-center mb-1.5 group-hover:scale-105 transition-transform">
                <Send className="w-5 h-5" />
              </div>
              <span className="text-xs font-semibold text-slate-800 dark:text-slate-200">Transfer</span>
            </button>

            {/* Action 2: Pay Bills */}
            <button
              type="button"
              onClick={() => setCurrentView('DASHBOARD_BILLPAY')}
              className="flex flex-col items-center justify-center p-3 rounded-2xl border border-slate-200/80 dark:border-slate-800 bg-white dark:bg-slate-900 hover:bg-slate-50 dark:hover:bg-slate-850 active:scale-98 transition-all min-h-[82px] cursor-pointer group"
            >
              <div className="w-11 h-11 rounded-full bg-amber-50 dark:bg-amber-950/60 text-amber-600 dark:text-amber-400 flex items-center justify-center mb-1.5 group-hover:scale-105 transition-transform">
                <Receipt className="w-5 h-5" />
              </div>
              <span className="text-xs font-semibold text-slate-800 dark:text-slate-200">Pay Bills</span>
            </button>

            {/* Action 3: Statements */}
            <button
              type="button"
              onClick={() => setCurrentView('DASHBOARD_STATEMENTS')}
              className="flex flex-col items-center justify-center p-3 rounded-2xl border border-slate-200/80 dark:border-slate-800 bg-white dark:bg-slate-900 hover:bg-slate-50 dark:hover:bg-slate-850 active:scale-98 transition-all min-h-[82px] cursor-pointer group"
            >
              <div className="w-11 h-11 rounded-full bg-emerald-50 dark:bg-emerald-950/60 text-emerald-600 dark:text-emerald-400 flex items-center justify-center mb-1.5 group-hover:scale-105 transition-transform">
                <FileText className="w-5 h-5" />
              </div>
              <span className="text-xs font-semibold text-slate-800 dark:text-slate-200">Statements</span>
            </button>

            {/* Action 4: Support */}
            <button
              type="button"
              onClick={() => setCurrentView('DASHBOARD_MESSAGES')}
              className="flex flex-col items-center justify-center p-3 rounded-2xl border border-slate-200/80 dark:border-slate-800 bg-white dark:bg-slate-900 hover:bg-slate-50 dark:hover:bg-slate-850 active:scale-98 transition-all min-h-[82px] cursor-pointer group"
            >
              <div className="w-11 h-11 rounded-full bg-purple-50 dark:bg-purple-950/60 text-purple-600 dark:text-purple-400 flex items-center justify-center mb-1.5 group-hover:scale-105 transition-transform">
                <Headphones className="w-5 h-5" />
              </div>
              <span className="text-xs font-semibold text-slate-800 dark:text-slate-200">Support</span>
            </button>
          </div>
        </div>

        {/* SECTION 3: ACTIVITY */}
        {/* Last 3 transactions only. Title + Amount + Date. "See All" link. */}
        <div>
          <div className="flex items-center justify-between mb-3">
            <h2 className="text-xs font-bold text-slate-500 dark:text-slate-400 uppercase tracking-wider">
              Activity
            </h2>
            <button
              type="button"
              onClick={() => setCurrentView('DASHBOARD_TRANSACTIONS')}
              className="text-xs font-semibold text-[#004281] dark:text-blue-400 hover:underline cursor-pointer"
            >
              See All
            </button>
          </div>

          <div className="rounded-2xl border border-slate-200/80 dark:border-slate-800 bg-white dark:bg-slate-900 divide-y divide-slate-100 dark:divide-slate-800/80 shadow-xs overflow-hidden">
            {last3Transactions.length > 0 ? (
              last3Transactions.map((tx) => {
                const isCredit = tx.direction === 'CREDIT';
                const formattedAmt = ((tx.amountMinor || 0) / 100).toLocaleString('en-US', {
                  minimumFractionDigits: 2,
                  maximumFractionDigits: 2
                });
                const txDate = tx.createdTimestamp
                  ? new Date(tx.createdTimestamp).toLocaleDateString('en-US', {
                      month: 'short',
                      day: 'numeric',
                      year: 'numeric'
                    })
                  : 'Recent';

                return (
                  <div key={tx.id} className="p-4 flex items-center justify-between hover:bg-slate-50/60 dark:hover:bg-slate-800/40 transition-colors">
                    <div className="flex items-center gap-3">
                      <div className={`w-10 h-10 rounded-full flex items-center justify-center shrink-0 ${
                        isCredit
                          ? 'bg-emerald-50 dark:bg-emerald-950/60 text-emerald-600 dark:text-emerald-400'
                          : 'bg-slate-100 dark:bg-slate-800 text-slate-600 dark:text-slate-300'
                      }`}>
                        {isCredit ? <ArrowDownLeft className="w-5 h-5" /> : <ArrowUpRight className="w-5 h-5" />}
                      </div>
                      <div>
                        <div className="text-sm font-semibold text-slate-900 dark:text-white line-clamp-1">
                          {tx.counterparty || tx.description || 'Bank Wire Transfer'}
                        </div>
                        <div className="text-xs text-slate-400 dark:text-slate-500">
                          {txDate}
                        </div>
                      </div>
                    </div>

                    <div className="text-right">
                      <div className={`text-sm font-bold ${
                        isCredit ? 'text-emerald-600 dark:text-emerald-400' : 'text-slate-900 dark:text-white'
                      }`}>
                        {isCredit ? '+' : '-'}${formattedAmt}
                      </div>
                      <div className="text-[10px] text-slate-400 capitalize">
                        {tx.status?.toLowerCase() || 'completed'}
                      </div>
                    </div>
                  </div>
                );
              })
            ) : (
              <div className="p-8 text-center text-slate-400 space-y-1">
                <FileText className="w-7 h-7 mx-auto text-slate-300 dark:text-slate-600" />
                <p className="text-xs font-medium">No transactions yet</p>
                <p className="text-[11px] text-slate-400">Transactions will appear here as you transfer funds.</p>
              </div>
            )}
          </div>
        </div>

      </div>

      {/* ADD MONEY MODAL */}
      {showAddMoneyModal && (
        <div className="fixed inset-0 z-50 bg-black/60 backdrop-blur-xs flex items-center justify-center p-4">
          <div className="bg-white dark:bg-slate-900 w-full max-w-md rounded-2xl shadow-2xl border border-slate-200 dark:border-slate-800 p-6 space-y-5 animate-in fade-in zoom-in-95 duration-200">
            <div className="flex items-center justify-between">
              <h3 className="text-base font-bold text-slate-900 dark:text-white flex items-center gap-2">
                <Building2 className="w-5 h-5 text-[#004281] dark:text-blue-400" />
                <span>Deposit &amp; Wire Details</span>
              </h3>
              <button
                type="button"
                onClick={() => setShowAddMoneyModal(false)}
                className="p-1 text-slate-400 hover:text-slate-700 dark:hover:text-slate-200 cursor-pointer"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <p className="text-xs text-slate-500 dark:text-slate-400">
              Use these live account coordinates for ACH payments, domestic wires, and direct client deposits.
            </p>

            <div className="space-y-3 text-xs">
              <div className="p-3 bg-slate-50 dark:bg-slate-800/60 rounded-xl flex items-center justify-between">
                <div>
                  <div className="text-[10px] uppercase text-slate-400 font-semibold">Account Number</div>
                  <div className="text-sm font-bold text-slate-900 dark:text-white">{accountNumber}</div>
                </div>
                <button
                  type="button"
                  onClick={() => copyToClipboard(accountNumber)}
                  className="px-2.5 py-1 rounded-lg bg-white dark:bg-slate-700 text-[11px] font-semibold text-slate-700 dark:text-slate-200 border border-slate-200 dark:border-slate-600 hover:bg-slate-100"
                >
                  Copy
                </button>
              </div>

              <div className="p-3 bg-slate-50 dark:bg-slate-800/60 rounded-xl flex items-center justify-between">
                <div>
                  <div className="text-[10px] uppercase text-slate-400 font-semibold">Routing Number (ABA)</div>
                  <div className="text-sm font-bold text-slate-900 dark:text-white">021000021</div>
                </div>
                <button
                  type="button"
                  onClick={() => copyToClipboard('021000021')}
                  className="px-2.5 py-1 rounded-lg bg-white dark:bg-slate-700 text-[11px] font-semibold text-slate-700 dark:text-slate-200 border border-slate-200 dark:border-slate-600 hover:bg-slate-100"
                >
                  Copy
                </button>
              </div>

              <div className="p-3 bg-slate-50 dark:bg-slate-800/60 rounded-xl flex items-center justify-between">
                <div>
                  <div className="text-[10px] uppercase text-slate-400 font-semibold">SWIFT / BIC</div>
                  <div className="text-sm font-bold text-slate-900 dark:text-white">FABKUS33NYC</div>
                </div>
                <button
                  type="button"
                  onClick={() => copyToClipboard('FABKUS33NYC')}
                  className="px-2.5 py-1 rounded-lg bg-white dark:bg-slate-700 text-[11px] font-semibold text-slate-700 dark:text-slate-200 border border-slate-200 dark:border-slate-600 hover:bg-slate-100"
                >
                  Copy
                </button>
              </div>

              <div className="p-3 bg-slate-50 dark:bg-slate-800/60 rounded-xl">
                <div className="text-[10px] uppercase text-slate-400 font-semibold">Bank Name &amp; Address</div>
                <div className="font-semibold text-slate-800 dark:text-slate-200">First Atlantic Bank, N.A.</div>
                <div className="text-slate-500 dark:text-slate-400">One Financial Square, Wall Street, New York, NY 10005</div>
              </div>
            </div>

            <button
              type="button"
              onClick={() => setShowAddMoneyModal(false)}
              className="w-full py-3 rounded-xl bg-[#004281] hover:bg-[#003366] text-white font-bold text-xs shadow-md transition-all cursor-pointer min-h-[44px]"
            >
              Done
            </button>
          </div>
        </div>
      )}
    </div>
  );
};

export default Dashboard;
