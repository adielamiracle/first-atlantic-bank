import React, { useState, useMemo } from 'react';
import { useBank } from '../../context/BankContext';
import { CurrencyDisplay } from '../../components/common/CurrencyDisplay';
import { StatusBadge } from '../../components/common/StatusBadge';
import { GlassPanel } from '../../components/glass/GlassPanel';
import { GlassButton } from '../../components/glass/GlassButton';
import {
  Send,
  CreditCard,
  Camera,
  FileText,
  Receipt,
  Copy,
  CheckCircle2,
  ShieldCheck,
  Eye,
  EyeOff,
  ArrowUpRight,
  ArrowDownLeft,
  RefreshCw,
  Landmark,
  Globe2,
  Lock,
  Unlock,
  Wifi,
  ExternalLink,
  ChevronRight,
  UserCheck,
  Building,
  Upload,
  X,
  FileSpreadsheet,
  Clock,
  Sparkles
} from 'lucide-react';
import { BankAccount, LedgerEntry, BankCard } from '../../types';

export const DashboardOverview: React.FC = () => {
  const {
    currentUser,
    accounts,
    cards,
    recentTransactions,
    setCurrentView,
    setSelectedAccountId,
    showToast,
    refreshData,
    isLoading,
    updatePassportDetails
  } = useBank();

  // State
  const [hideBalance, setHideBalance] = useState(false);
  const [copiedField, setCopiedField] = useState<string | null>(null);
  const [isRefreshing, setIsRefreshing] = useState(false);
  const [txFilter, setTxFilter] = useState<'ALL' | 'INFLOW' | 'OUTFLOW'>('ALL');
  const [selectedTx, setSelectedTx] = useState<LedgerEntry | null>(null);
  const [showPassportModal, setShowPassportModal] = useState(false);
  const [showCvv, setShowCvv] = useState(false);
  const [cardLocked, setCardLocked] = useState(false);

  // Passport update form state
  const [newPassportPhoto, setNewPassportPhoto] = useState(currentUser?.passportPhoto || '');
  const [newPassportNumber, setNewPassportNumber] = useState(currentUser?.passportNumber || '');
  const [isSavingPassport, setIsSavingPassport] = useState(false);

  // Primary account
  const primaryAccount: BankAccount | undefined = accounts[0];

  // Primary card
  const primaryCard: BankCard | undefined = cards[0];

  // Total balance calculation
  const totalBalanceMinor = useMemo(() => {
    return accounts.reduce((acc, a) => acc + (a.balanceMinor || 0), 0);
  }, [accounts]);

  const availableBalanceMinor = useMemo(() => {
    return accounts.reduce((acc, a) => acc + (a.availableBalanceMinor || 0), 0);
  }, [accounts]);

  // Copy helper
  const handleCopy = (text: string, fieldKey: string, label: string) => {
    navigator.clipboard.writeText(text);
    setCopiedField(fieldKey);
    showToast('SUCCESS', 'Copied to Clipboard', `${label} copied successfully.`);
    setTimeout(() => setCopiedField(null), 2500);
  };

  // Manual refresh
  const handleManualRefresh = async () => {
    setIsRefreshing(true);
    try {
      await refreshData();
      showToast('SUCCESS', 'Data Synchronized', 'Accounts and live transactions refreshed.');
    } catch {
      showToast('INFO', 'Synchronized', 'Live ledger updated.');
    } finally {
      setIsRefreshing(false);
    }
  };

  // Filtered transactions for the primary account
  const filteredTransactions = useMemo(() => {
    return recentTransactions.filter((tx) => {
      if (txFilter === 'INFLOW') return tx.direction === 'CREDIT';
      if (txFilter === 'OUTFLOW') return tx.direction === 'DEBIT';
      return true;
    });
  }, [recentTransactions, txFilter]);

  // Handle saving new passport picture
  const handleSavePassport = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsSavingPassport(true);
    try {
      const res = await updatePassportDetails({
        passportPhoto: newPassportPhoto,
        passportNumber: newPassportNumber
      });
      if (res.success) {
        showToast('SUCCESS', 'Verification Updated', 'Passport details and photo saved.');
        setShowPassportModal(false);
      } else {
        showToast('ERROR', 'Update Failed', res.error || 'Could not save passport details.');
      }
    } catch {
      showToast('ERROR', 'Error', 'Failed to update passport.');
    } finally {
      setIsSavingPassport(false);
    }
  };

  const handlePassportFile = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    const reader = new FileReader();
    reader.onload = () => {
      if (typeof reader.result === 'string') {
        setNewPassportPhoto(reader.result);
      }
    };
    reader.readAsDataURL(file);
  };

  return (
    <div id="dashboard-overview-container" className="space-y-6 animate-in fade-in duration-300">
      {/* 1. Top Welcome & Regulatory Status Bar */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 bg-white/80 dark:bg-slate-900/80 backdrop-blur-md p-4 rounded-2xl border border-slate-200/80 dark:border-slate-800 shadow-sm">
        <div className="flex items-center gap-3.5">
          <div className="relative">
            <img
              src={
                currentUser?.passportPhoto ||
                'https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=150&auto=format&fit=crop&q=80'
              }
              alt="Profile"
              className="w-12 h-12 rounded-xl object-cover ring-2 ring-amber-500/20 shadow-sm cursor-pointer hover:opacity-90 transition-opacity"
              onClick={() => setShowPassportModal(true)}
              title="Click to view or change verification photo"
            />
            <span className="absolute -bottom-1 -right-1 w-3.5 h-3.5 bg-emerald-500 rounded-full border-2 border-white dark:border-slate-900" />
          </div>
          <div>
            <div className="flex items-center gap-2">
              <h1 className="text-lg sm:text-xl font-bold text-slate-900 dark:text-white tracking-tight">
                {currentUser ? `${currentUser.firstName} ${currentUser.lastName}` : 'Private Client'}
              </h1>
              <span className="inline-flex items-center gap-1 text-[11px] font-semibold bg-amber-500/10 text-amber-600 dark:text-amber-400 border border-amber-500/20 px-2 py-0.5 rounded-full">
                <ShieldCheck className="w-3 h-3" />
                {currentUser?.kycTier ? currentUser.kycTier.replace(/_/g, ' ') : 'TIER 2 VERIFIED'}
              </span>
            </div>
            <p className="text-xs text-slate-500 dark:text-slate-400 mt-0.5">
              Client ID: <span className="font-mono">{currentUser?.id || 'usr_client'}</span> • Private Wealth Desk
            </p>
          </div>
        </div>

        <div className="flex items-center gap-2 self-end sm:self-auto">
          <button
            id="refresh-dashboard-btn"
            onClick={handleManualRefresh}
            disabled={isRefreshing || isLoading}
            className="inline-flex items-center gap-1.5 px-3 py-1.5 text-xs font-medium text-slate-700 dark:text-slate-200 bg-slate-100 dark:bg-slate-800 hover:bg-slate-200 dark:hover:bg-slate-700 rounded-xl transition-all border border-slate-200 dark:border-slate-700 cursor-pointer disabled:opacity-50"
            title="Refresh accounts & ledger"
          >
            <RefreshCw className={`w-3.5 h-3.5 ${isRefreshing ? 'animate-spin text-amber-500' : ''}`} />
            <span>{isRefreshing ? 'Syncing...' : 'Refresh'}</span>
          </button>
          <div className="hidden sm:flex items-center gap-1.5 px-2.5 py-1 text-xs text-emerald-700 dark:text-emerald-400 bg-emerald-50 dark:bg-emerald-950/40 border border-emerald-200 dark:border-emerald-800/50 rounded-xl">
            <span className="w-2 h-2 rounded-full bg-emerald-500 animate-pulse" />
            <span className="font-medium text-[11px]">FDIC & Fedwire Cleared</span>
          </div>
        </div>
      </div>

      {/* 2. Main Portfolio Hero & Quick Actions */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
        {/* Wealth Card (8 cols) */}
        <div className="lg:col-span-8">
          <GlassPanel className="p-6 sm:p-7 relative overflow-hidden bg-gradient-to-br from-slate-900 via-[#0d1726] to-[#080d14] text-white border-slate-800 shadow-xl rounded-2xl">
            {/* Background luxury watermark */}
            <div className="absolute top-0 right-0 p-8 opacity-5 pointer-events-none">
              <Landmark className="w-64 h-64 text-white" />
            </div>

            <div className="relative z-10 flex flex-col justify-between h-full space-y-6">
              <div>
                <div className="flex items-center justify-between">
                  <span className="text-xs font-semibold uppercase tracking-wider text-slate-400">
                    Total Consolidated Liquid Assets
                  </span>
                  <button
                    onClick={() => setHideBalance(!hideBalance)}
                    className="p-1.5 text-slate-400 hover:text-white rounded-lg hover:bg-white/10 transition-colors cursor-pointer"
                    title={hideBalance ? 'Show balance' : 'Hide balance'}
                  >
                    {hideBalance ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                  </button>
                </div>

                <div className="mt-2 flex items-baseline gap-3">
                  {hideBalance ? (
                    <span className="text-3xl sm:text-4xl font-extrabold tracking-tight font-mono text-slate-300">
                      •••••••• USD
                    </span>
                  ) : (
                    <CurrencyDisplay
                      amountMinor={totalBalanceMinor}
                      currency="USD"
                      className="text-3xl sm:text-4xl font-extrabold tracking-tight text-white"
                    />
                  )}
                  <span className="text-xs font-semibold px-2 py-0.5 rounded-full bg-emerald-500/20 text-emerald-300 border border-emerald-500/30">
                    +1.25% APY Active
                  </span>
                </div>

                <div className="mt-2 flex items-center gap-4 text-xs text-slate-400">
                  <span>
                    Available to Wire:{' '}
                    <strong className="text-slate-200">
                      {hideBalance ? '••••••' : `$${(availableBalanceMinor / 100).toLocaleString('en-US', { minimumFractionDigits: 2 })}`}
                    </strong>
                  </span>
                  <span>•</span>
                  <span>
                    Hold: <strong className="text-slate-200">$0.00</strong>
                  </span>
                </div>
              </div>

              {/* Quick Action Navigation Grid */}
              <div className="grid grid-cols-2 sm:grid-cols-4 gap-2.5 pt-4 border-t border-white/10">
                <button
                  id="action-transfer-funds-btn"
                  onClick={() => setCurrentView('DASHBOARD_TRANSFERS')}
                  className="flex flex-col items-center justify-center p-3 rounded-xl bg-white/5 hover:bg-white/10 border border-white/10 transition-all group cursor-pointer text-center"
                >
                  <div className="w-9 h-9 rounded-lg bg-amber-500/20 text-amber-400 flex items-center justify-center mb-1.5 group-hover:scale-105 transition-transform">
                    <Send className="w-4 h-4 rotate-45" />
                  </div>
                  <span className="text-xs font-semibold text-white">Transfer Funds</span>
                  <span className="text-[10px] text-slate-400">Wire & ACH</span>
                </button>

                <button
                  id="action-deposit-check-btn"
                  onClick={() => setCurrentView('DASHBOARD_DEPOSIT')}
                  className="flex flex-col items-center justify-center p-3 rounded-xl bg-white/5 hover:bg-white/10 border border-white/10 transition-all group cursor-pointer text-center"
                >
                  <div className="w-9 h-9 rounded-lg bg-blue-500/20 text-blue-400 flex items-center justify-center mb-1.5 group-hover:scale-105 transition-transform">
                    <Camera className="w-4 h-4" />
                  </div>
                  <span className="text-xs font-semibold text-white">Deposit Check</span>
                  <span className="text-[10px] text-slate-400">Mobile Scanner</span>
                </button>

                <button
                  id="action-cards-btn"
                  onClick={() => setCurrentView('DASHBOARD_CARDS')}
                  className="flex flex-col items-center justify-center p-3 rounded-xl bg-white/5 hover:bg-white/10 border border-white/10 transition-all group cursor-pointer text-center"
                >
                  <div className="w-9 h-9 rounded-lg bg-purple-500/20 text-purple-400 flex items-center justify-center mb-1.5 group-hover:scale-105 transition-transform">
                    <CreditCard className="w-4 h-4" />
                  </div>
                  <span className="text-xs font-semibold text-white">Cards & Limits</span>
                  <span className="text-[10px] text-slate-400">Debit & Virtual</span>
                </button>

                <button
                  id="action-statements-btn"
                  onClick={() => setCurrentView('DASHBOARD_STATEMENTS')}
                  className="flex flex-col items-center justify-center p-3 rounded-xl bg-white/5 hover:bg-white/10 border border-white/10 transition-all group cursor-pointer text-center"
                >
                  <div className="w-9 h-9 rounded-lg bg-emerald-500/20 text-emerald-400 flex items-center justify-center mb-1.5 group-hover:scale-105 transition-transform">
                    <FileText className="w-4 h-4" />
                  </div>
                  <span className="text-xs font-semibold text-white">Statements</span>
                  <span className="text-[10px] text-slate-400">PDF & Tax Docs</span>
                </button>
              </div>
            </div>
          </GlassPanel>
        </div>

        {/* 3. Primary Card Visualizer (4 cols) */}
        <div className="lg:col-span-4 flex flex-col">
          <GlassPanel className="p-5 flex-1 flex flex-col justify-between rounded-2xl border-slate-200/80 dark:border-slate-800 bg-white/80 dark:bg-slate-900/80 shadow-sm">
            <div className="flex items-center justify-between pb-3 border-b border-slate-100 dark:border-slate-800">
              <span className="text-xs font-bold text-slate-900 dark:text-white flex items-center gap-1.5">
                <CreditCard className="w-4 h-4 text-amber-500" />
                Active Visa Debit
              </span>
              <span className="text-[11px] font-semibold text-emerald-600 dark:text-emerald-400 bg-emerald-50 dark:bg-emerald-950/50 px-2 py-0.5 rounded-full">
                {cardLocked ? 'LOCKED' : 'ACTIVE'}
              </span>
            </div>

            {/* Credit card cardface */}
            <div className="my-3 p-4 rounded-xl bg-gradient-to-tr from-slate-900 via-slate-800 to-indigo-950 text-white shadow-lg relative overflow-hidden">
              <div className="flex justify-between items-start">
                <span className="text-[10px] font-bold tracking-widest uppercase text-amber-400">
                  FIRST ATLANTIC
                </span>
                <Wifi className="w-4 h-4 text-slate-300" />
              </div>

              <div className="w-8 h-6 bg-gradient-to-r from-amber-300 to-amber-500 rounded-md my-4 opacity-90 shadow-sm" />

              <div className="space-y-1">
                <p className="font-mono text-sm tracking-wider text-slate-200">
                  {primaryCard ? primaryCard.cardNumberMasked : '•••• •••• •••• 6841'}
                </p>
                <div className="flex justify-between items-end pt-1">
                  <div>
                    <span className="text-[8px] uppercase text-slate-400 block">Cardholder</span>
                    <span className="text-xs font-semibold tracking-wide">
                      {primaryCard?.cardHolderName || (currentUser ? `${currentUser.firstName} ${currentUser.lastName}`.toUpperCase() : 'CREATOR USER')}
                    </span>
                  </div>
                  <div>
                    <span className="text-[8px] uppercase text-slate-400 block">Expires</span>
                    <span className="text-xs font-mono">
                      {primaryCard ? `${String(primaryCard.expiryMonth).padStart(2, '0')}/${String(primaryCard.expiryYear).slice(-2)}` : '12/31'}
                    </span>
                  </div>
                  <div>
                    <span className="text-[8px] uppercase text-slate-400 block">CVV</span>
                    <button
                      onClick={() => setShowCvv(!showCvv)}
                      className="text-xs font-mono text-amber-400 hover:underline cursor-pointer"
                    >
                      {showCvv ? (primaryCard?.cvv || '229') : '•••'}
                    </button>
                  </div>
                </div>
              </div>
            </div>

            {/* Quick Card Controls */}
            <div className="flex items-center justify-between gap-2 pt-2 text-xs">
              <button
                onClick={() => {
                  setCardLocked(!cardLocked);
                  showToast('INFO', cardLocked ? 'Card Unlocked' : 'Card Frozen', cardLocked ? 'Your Visa card is active for purchases.' : 'Card temporarily frozen.');
                }}
                className="flex-1 py-1.5 px-2.5 rounded-lg border border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-800/70 hover:bg-slate-100 dark:hover:bg-slate-800 text-slate-700 dark:text-slate-200 font-medium transition-colors flex items-center justify-center gap-1.5 cursor-pointer"
              >
                {cardLocked ? <Unlock className="w-3.5 h-3.5 text-emerald-500" /> : <Lock className="w-3.5 h-3.5 text-amber-500" />}
                <span>{cardLocked ? 'Unlock' : 'Freeze'}</span>
              </button>
              <button
                onClick={() => setCurrentView('DASHBOARD_CARDS')}
                className="flex-1 py-1.5 px-2.5 rounded-lg bg-amber-500/10 hover:bg-amber-500/20 text-amber-600 dark:text-amber-400 font-medium transition-colors flex items-center justify-center gap-1 cursor-pointer border border-amber-500/20"
              >
                <span>Full Limits</span>
                <ChevronRight className="w-3.5 h-3.5" />
              </button>
            </div>
          </GlassPanel>
        </div>
      </div>

      {/* 4. Wire Instructions & Primary Account Details Card */}
      {primaryAccount && (
        <GlassPanel className="p-6 rounded-2xl border-slate-200/80 dark:border-slate-800 bg-white/80 dark:bg-slate-900/80 shadow-sm">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 pb-4 border-b border-slate-100 dark:border-slate-800">
            <div>
              <h2 className="text-base font-bold text-slate-900 dark:text-white flex items-center gap-2">
                <Building className="w-4 h-4 text-amber-500" />
                {primaryAccount.name}
              </h2>
              <p className="text-xs text-slate-500 dark:text-slate-400 mt-0.5">
                Official Account & Wire Transfer Routing Coordinates (Domestic ACH & International SWIFT)
              </p>
            </div>
            <button
              onClick={() => {
                setSelectedAccountId(primaryAccount.id);
                setCurrentView('DASHBOARD_ACCOUNT_DETAIL');
              }}
              className="inline-flex items-center gap-1 text-xs font-semibold text-amber-600 dark:text-amber-400 hover:underline cursor-pointer self-start sm:self-auto"
            >
              <span>Manage Account</span>
              <ChevronRight className="w-4 h-4" />
            </button>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 mt-4">
            {/* Account Number */}
            <div className="p-3.5 rounded-xl bg-slate-50 dark:bg-slate-800/50 border border-slate-200/80 dark:border-slate-750 flex flex-col justify-between">
              <div>
                <span className="text-[11px] font-semibold text-slate-500 dark:text-slate-400 uppercase">
                  Account Number
                </span>
                <p className="text-sm font-mono font-bold text-slate-900 dark:text-white mt-1">
                  {primaryAccount.accountNumberFull || '695573246841'}
                </p>
              </div>
              <button
                onClick={() =>
                  handleCopy(
                    primaryAccount.accountNumberFull || '695573246841',
                    'accNum',
                    'Account Number'
                  )
                }
                className="mt-2.5 inline-flex items-center gap-1 text-xs font-medium text-slate-600 dark:text-slate-300 hover:text-amber-600 dark:hover:text-amber-400 transition-colors cursor-pointer"
              >
                {copiedField === 'accNum' ? (
                  <CheckCircle2 className="w-3.5 h-3.5 text-emerald-500" />
                ) : (
                  <Copy className="w-3.5 h-3.5" />
                )}
                <span>{copiedField === 'accNum' ? 'Copied' : 'Copy Number'}</span>
              </button>
            </div>

            {/* Routing Number (ABA) */}
            <div className="p-3.5 rounded-xl bg-slate-50 dark:bg-slate-800/50 border border-slate-200/80 dark:border-slate-750 flex flex-col justify-between">
              <div>
                <span className="text-[11px] font-semibold text-slate-500 dark:text-slate-400 uppercase">
                  Routing / ABA (Direct Deposit)
                </span>
                <p className="text-sm font-mono font-bold text-slate-900 dark:text-white mt-1">
                  {primaryAccount.routingNumber || '021000089'}
                </p>
              </div>
              <button
                onClick={() =>
                  handleCopy(
                    primaryAccount.routingNumber || '021000089',
                    'routing',
                    'Routing Number'
                  )
                }
                className="mt-2.5 inline-flex items-center gap-1 text-xs font-medium text-slate-600 dark:text-slate-300 hover:text-amber-600 dark:hover:text-amber-400 transition-colors cursor-pointer"
              >
                {copiedField === 'routing' ? (
                  <CheckCircle2 className="w-3.5 h-3.5 text-emerald-500" />
                ) : (
                  <Copy className="w-3.5 h-3.5" />
                )}
                <span>{copiedField === 'routing' ? 'Copied' : 'Copy Routing'}</span>
              </button>
            </div>

            {/* SWIFT / BIC */}
            <div className="p-3.5 rounded-xl bg-slate-50 dark:bg-slate-800/50 border border-slate-200/80 dark:border-slate-750 flex flex-col justify-between">
              <div>
                <span className="text-[11px] font-semibold text-slate-500 dark:text-slate-400 uppercase">
                  SWIFT / BIC (Wire Inflow)
                </span>
                <p className="text-sm font-mono font-bold text-slate-900 dark:text-white mt-1">
                  {primaryAccount.swiftBic || 'FATLUS33NYC'}
                </p>
              </div>
              <button
                onClick={() =>
                  handleCopy(
                    primaryAccount.swiftBic || 'FATLUS33NYC',
                    'swift',
                    'SWIFT Code'
                  )
                }
                className="mt-2.5 inline-flex items-center gap-1 text-xs font-medium text-slate-600 dark:text-slate-300 hover:text-amber-600 dark:hover:text-amber-400 transition-colors cursor-pointer"
              >
                {copiedField === 'swift' ? (
                  <CheckCircle2 className="w-3.5 h-3.5 text-emerald-500" />
                ) : (
                  <Copy className="w-3.5 h-3.5" />
                )}
                <span>{copiedField === 'swift' ? 'Copied' : 'Copy SWIFT'}</span>
              </button>
            </div>

            {/* Daily Wire Limit */}
            <div className="p-3.5 rounded-xl bg-slate-50 dark:bg-slate-800/50 border border-slate-200/80 dark:border-slate-750 flex flex-col justify-between">
              <div>
                <span className="text-[11px] font-semibold text-slate-500 dark:text-slate-400 uppercase">
                  Daily Transfer Limit
                </span>
                <p className="text-sm font-bold text-slate-900 dark:text-white mt-1">
                  ${((primaryAccount.dailyTransferLimitMinor || 50000000) / 100).toLocaleString('en-US')} USD
                </p>
              </div>
              <div className="mt-2.5 flex items-center gap-1 text-xs text-emerald-600 dark:text-emerald-400">
                <CheckCircle2 className="w-3.5 h-3.5" />
                <span>Unlimited Internal Transfers</span>
              </div>
            </div>
          </div>
        </GlassPanel>
      )}

      {/* 5. Live Ledger & Recent Activity */}
      <GlassPanel className="p-6 rounded-2xl border-slate-200/80 dark:border-slate-800 bg-white/80 dark:bg-slate-900/80 shadow-sm">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 pb-4 border-b border-slate-100 dark:border-slate-800">
          <div>
            <h2 className="text-base font-bold text-slate-900 dark:text-white flex items-center gap-2">
              <FileSpreadsheet className="w-4 h-4 text-amber-500" />
              Real-Time Ledger & Transaction History
            </h2>
            <p className="text-xs text-slate-500 dark:text-slate-400 mt-0.5">
              Live double-entry settled transactions and wire clearing logs
            </p>
          </div>

          {/* Filter tabs */}
          <div className="flex items-center gap-1 bg-slate-100 dark:bg-slate-800 p-1 rounded-xl">
            {(['ALL', 'INFLOW', 'OUTFLOW'] as const).map((filter) => (
              <button
                key={filter}
                onClick={() => setTxFilter(filter)}
                className={`px-3 py-1 rounded-lg text-xs font-semibold transition-all cursor-pointer ${
                  txFilter === filter
                    ? 'bg-white dark:bg-slate-700 text-slate-900 dark:text-white shadow-sm'
                    : 'text-slate-500 dark:text-slate-400 hover:text-slate-800 dark:hover:text-slate-200'
                }`}
              >
                {filter === 'ALL' ? 'All Activity' : filter === 'INFLOW' ? 'Deposits (+)' : 'Transfers (-)'}
              </button>
            ))}
          </div>
        </div>

        {/* Transactions list */}
        <div className="mt-4 divide-y divide-slate-100 dark:divide-slate-800">
          {filteredTransactions.length === 0 ? (
            <div className="py-12 text-center">
              <Landmark className="w-12 h-12 text-slate-300 dark:text-slate-600 mx-auto mb-3 opacity-60" />
              <p className="text-sm font-semibold text-slate-700 dark:text-slate-300">
                No recent transactions in this view
              </p>
              <p className="text-xs text-slate-500 dark:text-slate-400 mt-1 max-w-sm mx-auto">
                Inbound deposits and completed wire transfers will immediately record into this ledger.
              </p>
              <button
                onClick={() => setCurrentView('DASHBOARD_TRANSFERS')}
                className="mt-4 inline-flex items-center gap-1.5 px-4 py-2 rounded-xl text-xs font-semibold bg-amber-500 hover:bg-amber-600 text-slate-950 transition-colors cursor-pointer"
              >
                <Send className="w-3.5 h-3.5 rotate-45" />
                <span>Initiate First Wire</span>
              </button>
            </div>
          ) : (
            filteredTransactions.map((tx) => {
              const isCredit = tx.direction === 'CREDIT';
              return (
                <div
                  key={tx.id}
                  onClick={() => setSelectedTx(tx)}
                  className="py-3.5 px-2 -mx-2 rounded-xl hover:bg-slate-50 dark:hover:bg-slate-800/50 transition-colors flex items-center justify-between gap-3 cursor-pointer group"
                >
                  <div className="flex items-center gap-3">
                    <div
                      className={`w-10 h-10 rounded-xl flex items-center justify-center shrink-0 ${
                        isCredit
                          ? 'bg-emerald-50 dark:bg-emerald-950/60 text-emerald-600 dark:text-emerald-400 border border-emerald-200 dark:border-emerald-800/40'
                          : 'bg-rose-50 dark:bg-rose-950/60 text-rose-600 dark:text-rose-400 border border-rose-200 dark:border-rose-800/40'
                      }`}
                    >
                      {isCredit ? <ArrowDownLeft className="w-5 h-5" /> : <ArrowUpRight className="w-5 h-5" />}
                    </div>
                    <div>
                      <p className="text-sm font-semibold text-slate-900 dark:text-white group-hover:text-amber-600 dark:group-hover:text-amber-400 transition-colors">
                        {tx.description}
                      </p>
                      <div className="flex items-center gap-2 text-xs text-slate-500 dark:text-slate-400 mt-0.5">
                        <span>{new Date(tx.createdTimestamp).toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' })}</span>
                        <span>•</span>
                        <span>{tx.counterparty || 'First Atlantic Direct'}</span>
                        <span>•</span>
                        <span className="font-mono text-[10px]">{tx.referenceNumber}</span>
                      </div>
                    </div>
                  </div>

                  <div className="text-right shrink-0">
                    <p
                      className={`text-sm font-bold font-mono ${
                        isCredit ? 'text-emerald-600 dark:text-emerald-400' : 'text-slate-900 dark:text-white'
                      }`}
                    >
                      {isCredit ? '+' : '-'}${((tx.amountMinor || 0) / 100).toLocaleString('en-US', { minimumFractionDigits: 2 })}
                    </p>
                    <span className="inline-block text-[10px] uppercase font-bold text-slate-400 mt-0.5">
                      {tx.status}
                    </span>
                  </div>
                </div>
              );
            })
          )}
        </div>
      </GlassPanel>

      {/* 6. Transaction Receipt Modal */}
      {selectedTx && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-sm animate-in fade-in duration-200">
          <div className="w-full max-w-md bg-white dark:bg-slate-900 rounded-2xl border border-slate-200 dark:border-slate-800 p-6 shadow-2xl space-y-4">
            <div className="flex items-center justify-between pb-3 border-b border-slate-100 dark:border-slate-800">
              <span className="text-xs font-bold uppercase tracking-wider text-slate-400">
                Official Transaction Receipt
              </span>
              <button
                onClick={() => setSelectedTx(null)}
                className="p-1 rounded-lg text-slate-400 hover:text-slate-700 dark:hover:text-slate-200 cursor-pointer"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <div className="text-center py-3">
              <div
                className={`w-12 h-12 rounded-full mx-auto flex items-center justify-center mb-2 ${
                  selectedTx.direction === 'CREDIT'
                    ? 'bg-emerald-500/20 text-emerald-500'
                    : 'bg-rose-500/20 text-rose-500'
                }`}
              >
                {selectedTx.direction === 'CREDIT' ? (
                  <ArrowDownLeft className="w-6 h-6" />
                ) : (
                  <ArrowUpRight className="w-6 h-6" />
                )}
              </div>
              <h3 className="text-xl font-bold text-slate-900 dark:text-white">
                {selectedTx.direction === 'CREDIT' ? '+' : '-'}$
                {((selectedTx.amountMinor || 0) / 100).toLocaleString('en-US', { minimumFractionDigits: 2 })} USD
              </h3>
              <p className="text-xs text-slate-500 dark:text-slate-400 mt-1">{selectedTx.description}</p>
            </div>

            <div className="space-y-2 text-xs bg-slate-50 dark:bg-slate-800/50 p-4 rounded-xl border border-slate-200/80 dark:border-slate-700">
              <div className="flex justify-between">
                <span className="text-slate-400">Reference:</span>
                <span className="font-mono font-semibold text-slate-900 dark:text-white">{selectedTx.referenceNumber}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-slate-400">Counterparty:</span>
                <span className="font-semibold text-slate-900 dark:text-white">{selectedTx.counterparty}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-slate-400">Settlement Channel:</span>
                <span className="font-semibold text-slate-900 dark:text-white">{selectedTx.channel || 'WIRE'}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-slate-400">Status:</span>
                <span className="font-bold text-emerald-500">{selectedTx.status}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-slate-400">Effective Date:</span>
                <span className="text-slate-900 dark:text-white">
                  {new Date(selectedTx.effectiveTimestamp || selectedTx.createdTimestamp).toLocaleString()}
                </span>
              </div>
            </div>

            <div className="flex gap-2 pt-2">
              <button
                onClick={() => {
                  handleCopy(
                    `Transaction Ref: ${selectedTx.referenceNumber}\nAmount: $${(selectedTx.amountMinor / 100).toFixed(2)}\nCounterparty: ${selectedTx.counterparty}`,
                    'receipt',
                    'Receipt Text'
                  );
                }}
                className="flex-1 py-2 rounded-xl border border-slate-200 dark:border-slate-700 font-semibold text-xs text-slate-700 dark:text-slate-200 hover:bg-slate-100 dark:hover:bg-slate-800 transition-colors flex items-center justify-center gap-1.5 cursor-pointer"
              >
                <Copy className="w-3.5 h-3.5" />
                <span>Copy Summary</span>
              </button>
              <button
                onClick={() => setSelectedTx(null)}
                className="flex-1 py-2 rounded-xl bg-slate-900 dark:bg-white text-white dark:text-slate-950 font-semibold text-xs hover:opacity-90 transition-opacity cursor-pointer"
              >
                Close
              </button>
            </div>
          </div>
        </div>
      )}

      {/* 7. Verification / Passport Photo Update Modal */}
      {showPassportModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-sm animate-in fade-in duration-200">
          <div className="w-full max-w-md bg-white dark:bg-slate-900 rounded-2xl border border-slate-200 dark:border-slate-800 p-6 shadow-2xl space-y-4">
            <div className="flex items-center justify-between pb-3 border-b border-slate-100 dark:border-slate-800">
              <div className="flex items-center gap-2">
                <UserCheck className="w-5 h-5 text-amber-500" />
                <h3 className="text-sm font-bold text-slate-900 dark:text-white">
                  Client Passport & KYC Verification
                </h3>
              </div>
              <button
                onClick={() => setShowPassportModal(false)}
                className="p-1 rounded-lg text-slate-400 hover:text-slate-700 dark:hover:text-slate-200 cursor-pointer"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <form onSubmit={handleSavePassport} className="space-y-4">
              <div className="flex flex-col items-center justify-center gap-3 py-2">
                <img
                  src={
                    newPassportPhoto ||
                    'https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=150&auto=format&fit=crop&q=80'
                  }
                  alt="Passport Preview"
                  className="w-24 h-24 rounded-2xl object-cover ring-4 ring-amber-500/20 shadow-md"
                />
                <label className="cursor-pointer inline-flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-slate-100 dark:bg-slate-800 text-xs font-semibold text-slate-700 dark:text-slate-300 hover:bg-slate-200 dark:hover:bg-slate-700 border border-slate-200 dark:border-slate-700 transition-colors">
                  <Upload className="w-3.5 h-3.5" />
                  <span>Upload New Photo</span>
                  <input
                    type="file"
                    accept="image/*"
                    onChange={handlePassportFile}
                    className="hidden"
                  />
                </label>
              </div>

              <div>
                <label className="text-xs font-semibold text-slate-700 dark:text-slate-300 block mb-1">
                  Photo URL (optional direct link)
                </label>
                <input
                  type="text"
                  value={newPassportPhoto}
                  onChange={(e) => setNewPassportPhoto(e.target.value)}
                  placeholder="https://..."
                  className="w-full px-3 py-2 text-xs rounded-xl bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 focus:outline-none focus:ring-2 focus:ring-amber-500 text-slate-900 dark:text-white"
                />
              </div>

              <div>
                <label className="text-xs font-semibold text-slate-700 dark:text-slate-300 block mb-1">
                  Passport / Government ID Number
                </label>
                <input
                  type="text"
                  value={newPassportNumber}
                  onChange={(e) => setNewPassportNumber(e.target.value)}
                  placeholder="e.g. ID-755427"
                  className="w-full px-3 py-2 text-xs rounded-xl bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 focus:outline-none focus:ring-2 focus:ring-amber-500 text-slate-900 dark:text-white font-mono"
                />
              </div>

              <div className="flex gap-2 pt-2">
                <button
                  type="button"
                  onClick={() => setShowPassportModal(false)}
                  className="flex-1 py-2 rounded-xl border border-slate-200 dark:border-slate-700 font-semibold text-xs text-slate-700 dark:text-slate-200 hover:bg-slate-100 dark:hover:bg-slate-800 cursor-pointer"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={isSavingPassport}
                  className="flex-1 py-2 rounded-xl bg-amber-500 hover:bg-amber-600 text-slate-950 font-bold text-xs transition-colors cursor-pointer disabled:opacity-50"
                >
                  {isSavingPassport ? 'Saving...' : 'Save & Sync'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};

export default DashboardOverview;
