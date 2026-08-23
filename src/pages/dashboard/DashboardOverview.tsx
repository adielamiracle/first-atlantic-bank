import React, { useState } from 'react';
import { useBank } from '../../context/BankContext';
import { CurrencyDisplay } from '../../components/common/CurrencyDisplay';
import { StatusBadge } from '../../components/common/StatusBadge';
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
  Sun
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
    rates,
    darkMode,
    toggleDarkMode,
    biometricState
  } = useBank();

  const [maskBalances, setMaskBalances] = useState(false);
  const [selectedTx, setSelectedTx] = useState<LedgerEntry | null>(null);

  // 6-month liquidity performance trend data
  const chartData = [
    { month: 'Mar', balance: 420000 },
    { month: 'Apr', balance: 445000 },
    { month: 'May', balance: 472000 },
    { month: 'Jun', balance: 495000 },
    { month: 'Jul', balance: 510000 },
    { month: 'Aug', balance: Math.round(totalNetWorthUsdMinor / 100) }
  ];

  const primaryChecking = accounts.find(a => a.type === 'CHECKING_PREMIER') || accounts[0];
  const savingsAccount = accounts.find(a => a.type === 'SAVINGS_HIGH_YIELD');
  const creditCardAccount = accounts.find(a => a.type === 'CREDIT_CARD_INFINITE');

  return (
    <div className="space-y-6">
      {/* Top Welcome & Net Liquidity Card */}
      <div className="bg-[#0a192f] text-white rounded-2xl p-6 sm:p-8 border border-slate-800 dark:border-[#1e3656] shadow-xl relative overflow-hidden transition-colors">
        <div className="absolute right-0 top-0 w-80 h-80 bg-radial from-[#1e4470]/30 to-transparent blur-3xl pointer-events-none" />

        <div className="relative z-10 flex flex-col md:flex-row md:items-center justify-between gap-6">
          <div className="space-y-1.5">
            <div className="flex items-center gap-2 text-xs font-semibold text-[#c5a880] uppercase tracking-wider font-mono">
              <span>{region === 'US' ? 'First Atlantic Private Banking (New York)' : 'First Atlantic UK Private Client (London)'}</span>
              <span className="w-1.5 h-1.5 rounded-full bg-emerald-400" />
            </div>

            <h1 className="text-2xl sm:text-3xl font-bold font-serif text-white">
              Good {new Date().getHours() < 12 ? 'morning' : new Date().getHours() < 18 ? 'afternoon' : 'evening'}, {currentUser?.firstName || 'Client'}
            </h1>
            <div className="flex flex-wrap items-center gap-3 text-xs text-slate-300">
              <span>Relationship Tier: <span className="text-[#e5ca95] font-semibold">{currentUser?.kycTier ? String(currentUser.kycTier).replace(/_/g, ' ') : 'Private Wealth'}</span></span>
              <span>•</span>
              <span>Client ID: <span className="font-mono">{currentUser?.username || 'jsterling'}</span></span>
              {biometricState.enabled && (
                <>
                  <span>•</span>
                  <span className="inline-flex items-center gap-1 text-emerald-400 font-medium">
                    <Fingerprint className="w-3.5 h-3.5" /> Hardware Biometric Active
                  </span>
                </>
              )}
            </div>
          </div>

          <div className="flex items-center gap-3">
            <button
              onClick={() => setMaskBalances(!maskBalances)}
              className="p-2.5 rounded-xl bg-[#112d50] hover:bg-[#183c6b] text-slate-300 hover:text-white border border-slate-700 text-xs flex items-center gap-2 transition-colors cursor-pointer"
              title="Toggle Privacy Mask"
            >
              {maskBalances ? <EyeOff className="w-4 h-4 text-[#c5a880]" /> : <Eye className="w-4 h-4 text-[#c5a880]" />}
              <span className="hidden sm:inline">{maskBalances ? 'Show Balances' : 'Mask Balances'}</span>
            </button>

            <button
              onClick={() => setCurrentView('DASHBOARD_TRANSFERS')}
              className="px-5 py-2.5 rounded-xl bg-gradient-to-r from-[#c5a880] to-[#b39366] text-slate-950 font-bold text-xs uppercase tracking-wider shadow-md hover:brightness-105 transition-all flex items-center gap-2 cursor-pointer font-sans"
            >
              <ArrowUpRight className="w-4 h-4" />
              <span>Transfer / Wire</span>
            </button>
          </div>
        </div>

        {/* Big Balance Breakdown */}
        <div className="mt-8 pt-6 border-t border-slate-800/80 grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
          <div>
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

          <div>
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
            <span className="text-[11px] text-slate-400 block mt-1">
              Pending Holds: {maskBalances ? '••••' : primaryChecking?.pendingHoldMinor ? `$${(primaryChecking.pendingHoldMinor / 100).toLocaleString()}` : '$0.00'}
            </span>
          </div>

          <div>
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
            <span className="text-[11px] text-slate-400 block mt-1">
              Est. Monthly Yield: +$1,648.90
            </span>
          </div>

          <div>
            <span className="text-xs text-slate-400 uppercase tracking-wider font-medium block mb-1">
              Infinite Credit Card Spend
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
              Available Credit: $96,587.20
            </span>
          </div>
        </div>
      </div>

      {/* Quick Action Navigation Buttons */}
      <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-6 gap-3">
        <button
          onClick={() => setCurrentView('DASHBOARD_TRANSFERS')}
          className="p-4 rounded-xl bg-white dark:bg-[#0a192f] hover:bg-slate-50 dark:hover:bg-[#112a4a] border border-slate-200 dark:border-[#1e3656] shadow-2xs flex flex-col items-center text-center gap-2 transition-colors group cursor-pointer"
        >
          <div className="w-10 h-10 rounded-xl bg-[#0a192f] dark:bg-[#112a4a] text-[#d4af37] flex items-center justify-center group-hover:scale-105 transition-transform border border-[#c5a880]/30">
            <ArrowLeftRight className="w-5 h-5" />
          </div>
          <span className="text-xs font-bold text-slate-800 dark:text-slate-200">Transfer &amp; Wire</span>
        </button>

        <button
          onClick={() => setCurrentView('DASHBOARD_BILLPAY')}
          className="p-4 rounded-xl bg-white dark:bg-[#0a192f] hover:bg-slate-50 dark:hover:bg-[#112a4a] border border-slate-200 dark:border-[#1e3656] shadow-2xs flex flex-col items-center text-center gap-2 transition-colors group cursor-pointer"
        >
          <div className="w-10 h-10 rounded-xl bg-[#0a192f] dark:bg-[#112a4a] text-[#d4af37] flex items-center justify-center group-hover:scale-105 transition-transform border border-[#c5a880]/30">
            <Receipt className="w-5 h-5" />
          </div>
          <span className="text-xs font-bold text-slate-800 dark:text-slate-200">Pay Bills</span>
        </button>

        <button
          onClick={() => setCurrentView('DASHBOARD_DEPOSIT')}
          className="p-4 rounded-xl bg-white dark:bg-[#0a192f] hover:bg-slate-50 dark:hover:bg-[#112a4a] border border-slate-200 dark:border-[#1e3656] shadow-2xs flex flex-col items-center text-center gap-2 transition-colors group cursor-pointer"
        >
          <div className="w-10 h-10 rounded-xl bg-[#0a192f] dark:bg-[#112a4a] text-[#d4af37] flex items-center justify-center group-hover:scale-105 transition-transform border border-[#c5a880]/30">
            <Camera className="w-5 h-5" />
          </div>
          <span className="text-xs font-bold text-slate-800 dark:text-slate-200">Deposit Check</span>
        </button>

        <button
          onClick={() => setCurrentView('DASHBOARD_CARDS')}
          className="p-4 rounded-xl bg-white dark:bg-[#0a192f] hover:bg-slate-50 dark:hover:bg-[#112a4a] border border-slate-200 dark:border-[#1e3656] shadow-2xs flex flex-col items-center text-center gap-2 transition-colors group cursor-pointer"
        >
          <div className="w-10 h-10 rounded-xl bg-[#0a192f] dark:bg-[#112a4a] text-[#d4af37] flex items-center justify-center group-hover:scale-105 transition-transform border border-[#c5a880]/30">
            <CreditCard className="w-5 h-5" />
          </div>
          <span className="text-xs font-bold text-slate-800 dark:text-slate-200">Card Controls</span>
        </button>

        <button
          onClick={() => setCurrentView('DASHBOARD_STATEMENTS')}
          className="p-4 rounded-xl bg-white dark:bg-[#0a192f] hover:bg-slate-50 dark:hover:bg-[#112a4a] border border-slate-200 dark:border-[#1e3656] shadow-2xs flex flex-col items-center text-center gap-2 transition-colors group cursor-pointer"
        >
          <div className="w-10 h-10 rounded-xl bg-[#0a192f] dark:bg-[#112a4a] text-[#d4af37] flex items-center justify-center group-hover:scale-105 transition-transform border border-[#c5a880]/30">
            <FileText className="w-5 h-5" />
          </div>
          <span className="text-xs font-bold text-slate-800 dark:text-slate-200">Statements</span>
        </button>

        <button
          onClick={() => setCurrentView('DASHBOARD_SECURITY')}
          className="p-4 rounded-xl bg-white dark:bg-[#0a192f] hover:bg-slate-50 dark:hover:bg-[#112a4a] border border-slate-200 dark:border-[#1e3656] shadow-2xs flex flex-col items-center text-center gap-2 transition-colors group cursor-pointer"
        >
          <div className="w-10 h-10 rounded-xl bg-[#0a192f] dark:bg-[#112a4a] text-[#d4af37] flex items-center justify-center group-hover:scale-105 transition-transform border border-[#c5a880]/30">
            <ShieldCheck className="w-5 h-5" />
          </div>
          <span className="text-xs font-bold text-slate-800 dark:text-slate-200">Security Score</span>
        </button>
      </div>

      {/* Main Two-Column Grid: Accounts & Ledger */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
        {/* Left Column: Account Cards List */}
        <div className="lg:col-span-7 space-y-4">
          <div className="flex items-center justify-between">
            <h2 className="text-sm font-bold uppercase tracking-wider text-slate-800 dark:text-slate-200 font-serif">
              Deposit &amp; Credit Accounts
            </h2>
            <button
              onClick={() => setCurrentView('DASHBOARD_ACCOUNT_DETAIL')}
              className="text-xs font-semibold text-[#8c6d37] dark:text-[#c5a880] hover:underline flex items-center gap-1 cursor-pointer"
            >
              <span>View All Accounts &amp; Routing</span>
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
                <div className="space-y-1">
                  <div className="flex items-center gap-2">
                    <span className="text-sm font-bold text-slate-900 dark:text-white group-hover:text-[#8c6d37] dark:group-hover:text-[#c5a880] transition-colors">
                      {acc.name}
                    </span>
                    <StatusBadge status={acc.status} size="sm" />
                  </div>
                  <div className="flex items-center gap-3 text-xs text-slate-500 dark:text-slate-400 font-mono">
                    <span>{acc.accountNumber}</span>
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

                <div className="text-left sm:text-right space-y-0.5">
                  <div className="text-xs text-slate-400 font-medium">Available Balance</div>
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
                  {acc.pendingHoldMinor > 0 && !maskBalances && (
                    <div className="text-[10px] text-amber-700 dark:text-amber-400 font-mono">
                      Hold: ${(acc.pendingHoldMinor / 100).toFixed(2)}
                    </div>
                  )}
                </div>
              </div>
            ))}
          </div>

          {/* Portfolio Performance Chart */}
          <div className="bg-white dark:bg-[#0a192f] rounded-2xl p-6 border border-slate-200 dark:border-[#1e3656] shadow-2xs space-y-3 transition-colors">
            <div className="flex items-center justify-between">
              <div>
                <h3 className="text-xs font-bold uppercase tracking-wider text-slate-700 dark:text-slate-300 font-serif">
                  6-Month Portfolio Liquidity Growth
                </h3>
                <p className="text-[11px] text-slate-500 dark:text-slate-400">Verified double-entry cash flow trajectory</p>
              </div>
              <span className="text-xs font-bold text-emerald-600 dark:text-emerald-400 bg-emerald-50 dark:bg-emerald-950/60 px-2.5 py-1 rounded-md border border-emerald-200 dark:border-emerald-800">
                +27.0% YTD
              </span>
            </div>

            <div className="h-44 w-full pt-2">
              <ResponsiveContainer width="100%" height="100%">
                <AreaChart data={chartData}>
                  <defs>
                    <linearGradient id="liquidityGrad" x1="0" y1="0" x2="0" y2="1">
                      <stop offset="5%" stopColor="#c5a880" stopOpacity={0.4} />
                      <stop offset="95%" stopColor="#c5a880" stopOpacity={0.0} />
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
                      borderRadius: '0.75rem'
                    }}
                    formatter={(value: any) => [`$${Number(value).toLocaleString()}`, 'Portfolio']}
                  />
                  <Area
                    type="monotone"
                    dataKey="balance"
                    stroke="#c5a880"
                    strokeWidth={2.5}
                    fillOpacity={1}
                    fill="url(#liquidityGrad)"
                  />
                </AreaChart>
              </ResponsiveContainer>
            </div>
          </div>
        </div>

        {/* Right Column: Recent Authoritative Ledger */}
        <div className="lg:col-span-5 space-y-4">
          <div className="flex items-center justify-between">
            <h2 className="text-sm font-bold uppercase tracking-wider text-slate-800 dark:text-slate-200 font-serif">
              Recent Activity &amp; Ledger
            </h2>
            <button
              onClick={() => setCurrentView('DASHBOARD_ACCOUNT_DETAIL')}
              className="text-xs font-semibold text-[#8c6d37] dark:text-[#c5a880] hover:underline cursor-pointer"
            >
              Full Ledger &rarr;
            </button>
          </div>

          <div className="bg-white dark:bg-[#0a192f] rounded-2xl border border-slate-200 dark:border-[#1e3656] shadow-2xs divide-y divide-slate-100 dark:divide-slate-800 overflow-hidden transition-colors">
            {(recentTransactions || []).slice(0, 6).map((tx) => (
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

          {/* Security Summary Card */}
          <div className="bg-gradient-to-br from-[#0a192f] to-[#112d50] text-white rounded-2xl p-5 border border-slate-800 dark:border-[#1e3656] space-y-3">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2">
                <ShieldCheck className="w-5 h-5 text-[#d4af37]" />
                <h4 className="text-xs font-bold uppercase tracking-wider text-white">
                  Security &amp; Device Integrity
                </h4>
              </div>
              <span className="text-[11px] font-mono text-emerald-400 font-semibold">
                SCORE: {biometricState.enabled ? '98/100' : '88/100'}
              </span>
            </div>

            <p className="text-xs text-slate-300 leading-relaxed">
              Your session is secured by Hardware TOTP and encrypted TLS 1.3. {biometricState.enabled ? 'Hardware biometric key is securely enrolled and active.' : 'Enable mobile biometrics in profile settings to reach 98/100 security rating.'}
            </p>

            <button
              onClick={() => setCurrentView('DASHBOARD_SECURITY')}
              className="w-full py-2 bg-slate-800/80 hover:bg-slate-700 text-xs font-semibold text-slate-200 rounded-lg transition-colors text-center cursor-pointer border border-slate-700"
            >
              Open Security Center &rarr;
            </button>
          </div>
        </div>
      </div>

      {/* Transaction Detail Modal / Drawer */}
      {selectedTx && (
        <div className="fixed inset-0 z-50 bg-slate-950/80 backdrop-blur-xs flex items-center justify-center p-4">
          <div className="bg-white dark:bg-[#0a192f] rounded-2xl max-w-lg w-full p-6 sm:p-7 shadow-2xl border border-slate-200 dark:border-[#1e3656] space-y-5 animate-in fade-in zoom-in-95 duration-200 text-slate-900 dark:text-slate-100">
            <div className="flex items-center justify-between pb-3 border-b border-slate-100 dark:border-slate-800">
              <div>
                <span className="text-[10px] uppercase font-bold tracking-widest text-[#8c6d37] dark:text-[#c5a880]">
                  Authoritative Ledger Record
                </span>
                <h3 className="text-base font-bold text-slate-900 dark:text-white font-serif">
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
