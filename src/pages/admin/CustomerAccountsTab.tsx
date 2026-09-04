import React, { useState } from 'react';
import { useBank } from '../../context/BankContext';
import {
  Landmark,
  Search,
  Copy,
  Check,
  ShieldCheck,
  DollarSign,
  CreditCard,
  Users,
  RefreshCw,
  Eye,
  EyeOff,
  Sparkles,
  ArrowUpRight,
  TrendingUp,
  Building2,
  CheckCircle2
} from 'lucide-react';
import { CurrencyDisplay } from '../../components/common/CurrencyDisplay';
import { StatusBadge } from '../../components/common/StatusBadge';
import { BankAccount } from '../../types';

interface CustomerAccountsTabProps {
  onNavigateToFunds?: (accountId: string) => void;
  onInspectCustomer?: (userId: string) => void;
  onOpenCreateCustomer?: () => void;
}

export const CustomerAccountsTab: React.FC<CustomerAccountsTabProps> = ({
  onNavigateToFunds,
  onInspectCustomer,
  onOpenCreateCustomer
}) => {
  const { accounts, fetchAdminStats, showToast } = useBank();

  const [searchQuery, setSearchQuery] = useState('');
  const [currencyFilter, setCurrencyFilter] = useState<'ALL' | 'USD' | 'EUR' | 'GBP'>('ALL');
  const [copiedId, setCopiedId] = useState<string | null>(null);
  const [revealedAccIds, setRevealedAccIds] = useState<Record<string, boolean>>({});
  const [isRefreshing, setIsRefreshing] = useState(false);

  const handleCopy = (text: string, id: string, label: string) => {
    navigator.clipboard.writeText(text);
    setCopiedId(id);
    showToast('INFO', 'Copied to Clipboard', `${label}: ${text}`);
    setTimeout(() => setCopiedId(null), 2000);
  };

  const toggleRevealAccount = (id: string) => {
    setRevealedAccIds(prev => ({
      ...prev,
      [id]: !prev[id]
    }));
  };

  const handleRefresh = async () => {
    setIsRefreshing(true);
    try {
      await fetchAdminStats();
      showToast('SUCCESS', 'Accounts Refreshed', 'Custody accounts updated from core ledger.');
    } catch (e) {
      showToast('ERROR', 'Refresh Error', 'Unable to sync custody accounts.');
    } finally {
      setIsRefreshing(false);
    }
  };

  // Filter accounts
  const filteredAccounts = accounts.filter(acc => {
    const matchesCurrency = currencyFilter === 'ALL' || acc.currency === currencyFilter;
    const query = searchQuery.toLowerCase().trim();
    if (!query) return matchesCurrency;

    const matchesName = (acc.name || '').toLowerCase().includes(query);
    const matchesCustName = (acc.customerName || '').toLowerCase().includes(query);
    const matchesCustEmail = (acc.customerEmail || '').toLowerCase().includes(query);
    const matchesAccNum = (acc.accountNumber || '').toLowerCase().includes(query);
    const matchesFullAcc = (acc.accountNumberFull || '').toLowerCase().includes(query);
    const matchesRouting = (acc.routingNumber || '').toLowerCase().includes(query);
    const matchesIban = (acc.iban || '').toLowerCase().includes(query);
    const matchesSwift = (acc.swiftBic || '').toLowerCase().includes(query);

    return matchesCurrency && (
      matchesName ||
      matchesCustName ||
      matchesCustEmail ||
      matchesAccNum ||
      matchesFullAcc ||
      matchesRouting ||
      matchesIban ||
      matchesSwift
    );
  });

  // Calculate totals
  const totalBalanceUsd = accounts.reduce((sum, acc) => {
    if (acc.currency === 'USD') return sum + acc.balanceMinor;
    if (acc.currency === 'GBP') return sum + Math.round(acc.balanceMinor * 1.28);
    if (acc.currency === 'EUR') return sum + Math.round(acc.balanceMinor * 1.09);
    return sum + acc.balanceMinor;
  }, 0);

  // Identify newest/prominent account (e.g. Erin Megan $780k)
  const erinAccount = accounts.find(
    a => a.customerEmail?.toLowerCase() === 'erinmeg45@gmail.com' || a.userId === 'usr_erin_megan_83'
  );

  return (
    <div className="space-y-5">
      {/* 1. Header with Live Actions */}
      <div className="bg-white dark:bg-[#0f172a] rounded-2xl border border-slate-200/80 dark:border-slate-800 p-4 sm:p-6 shadow-xs flex flex-col lg:flex-row lg:items-center justify-between gap-4">
        <div className="space-y-1">
          <div className="flex items-center gap-2">
            <div className="p-2 rounded-xl bg-[#004281]/10 dark:bg-blue-500/20 text-[#004281] dark:text-blue-400">
              <Landmark className="w-5 h-5" />
            </div>
            <div>
              <h2 className="text-base sm:text-lg font-bold text-slate-900 dark:text-white tracking-tight flex items-center gap-2">
                <span>Customer Accounts &amp; Custody Balances</span>
                <span className="text-xs px-2 py-0.5 rounded-full bg-emerald-50 text-emerald-700 dark:bg-emerald-950/60 dark:text-emerald-300 font-mono font-bold">
                  {accounts.length} Active Accounts
                </span>
              </h2>
              <p className="text-xs text-slate-500 dark:text-slate-400">
                Institutional overview of all client checking, high-yield reserve, and multi-currency accounts
              </p>
            </div>
          </div>
        </div>

        <div className="flex items-center gap-2.5 flex-wrap">
          <button
            onClick={handleRefresh}
            disabled={isRefreshing}
            className="px-3 py-2 text-xs font-semibold rounded-xl bg-slate-100 hover:bg-slate-200 dark:bg-slate-800 dark:hover:bg-slate-700 text-slate-700 dark:text-slate-300 flex items-center gap-1.5 transition-colors cursor-pointer"
            title="Reload live account balances"
          >
            <RefreshCw className={`w-3.5 h-3.5 ${isRefreshing ? 'animate-spin' : ''}`} />
            <span>Sync Balances</span>
          </button>

          {onOpenCreateCustomer && (
            <button
              onClick={onOpenCreateCustomer}
              className="px-3.5 py-2 text-xs font-bold rounded-xl bg-[#00A651] hover:bg-[#008f45] text-white flex items-center gap-1.5 shadow-xs transition-colors cursor-pointer"
            >
              <Users className="w-3.5 h-3.5" />
              <span>+ New Customer Account</span>
            </button>
          )}
        </div>
      </div>

      {/* 2. Spotlight Banner for Newly Created Accounts (e.g. Erin Megan $780k) */}
      {erinAccount && (
        <div className="bg-gradient-to-r from-[#004281] via-[#0b3866] to-[#0a2342] text-white rounded-2xl p-4 sm:p-5 shadow-sm border border-blue-900/40 relative overflow-hidden">
          <div className="absolute right-0 top-0 translate-x-12 -translate-y-6 w-56 h-56 bg-emerald-500/10 rounded-full blur-3xl pointer-events-none" />
          <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 relative z-10">
            <div className="space-y-1">
              <div className="flex items-center gap-2">
                <span className="px-2 py-0.5 rounded-full bg-emerald-500/20 text-emerald-300 text-[10px] font-bold uppercase tracking-wider border border-emerald-500/30 flex items-center gap-1">
                  <Sparkles className="w-3 h-3 text-emerald-300" />
                  Verified Active Custody Account
                </span>
                <span className="text-xs text-blue-200 font-mono">
                  {erinAccount.region} Jurisdiction
                </span>
              </div>
              <h3 className="text-lg font-bold tracking-tight text-white flex items-center gap-2">
                <span>{erinAccount.customerName || 'Erin Megan'}</span>
                <span className="text-xs text-slate-300 font-normal">({erinAccount.customerEmail})</span>
              </h3>
              <div className="flex items-center gap-3 text-xs text-blue-100/80 font-mono flex-wrap">
                <span>Acc: <strong className="text-white">{erinAccount.accountNumberFull || erinAccount.accountNumber}</strong></span>
                <span>•</span>
                <span>Routing: <strong className="text-white">{erinAccount.routingNumber || '021000089'}</strong></span>
                <span>•</span>
                <span>SWIFT: <strong className="text-white">{erinAccount.swiftBic || 'FATLUS33NYC'}</strong></span>
              </div>
            </div>

            <div className="flex items-center gap-3 self-start md:self-auto">
              <div className="text-right">
                <span className="text-[10px] font-semibold text-blue-200 uppercase tracking-wider block">
                  Current Liquidity
                </span>
                <div className="text-xl sm:text-2xl font-bold font-mono text-emerald-400">
                  <CurrencyDisplay
                    amountMinor={erinAccount.balanceMinor}
                    currency={erinAccount.currency}
                    size="lg"
                    className="text-emerald-400 font-bold font-mono"
                  />
                </div>
              </div>

              <div className="flex flex-col sm:flex-row gap-2">
                {onNavigateToFunds && (
                  <button
                    onClick={() => onNavigateToFunds(erinAccount.id)}
                    className="px-3 py-2 rounded-xl bg-white text-[#004281] hover:bg-slate-100 text-xs font-bold transition-all shadow-xs flex items-center gap-1 cursor-pointer whitespace-nowrap"
                  >
                    <DollarSign className="w-3.5 h-3.5" />
                    <span>Credit / Debit</span>
                  </button>
                )}
                {onInspectCustomer && (
                  <button
                    onClick={() => onInspectCustomer(erinAccount.userId)}
                    className="px-3 py-2 rounded-xl bg-blue-700/60 hover:bg-blue-700 text-white text-xs font-bold transition-all border border-blue-400/30 flex items-center gap-1 cursor-pointer whitespace-nowrap"
                  >
                    <Users className="w-3.5 h-3.5" />
                    <span>View Profile</span>
                  </button>
                )}
              </div>
            </div>
          </div>
        </div>
      )}

      {/* 3. Search and Currency Filters */}
      <div className="bg-white dark:bg-[#0f172a] rounded-2xl border border-slate-200/80 dark:border-slate-800 p-4 shadow-xs flex flex-col sm:flex-row sm:items-center justify-between gap-3">
        <div className="relative flex-1 max-w-md">
          <Search className="w-4 h-4 text-slate-400 absolute left-3.5 top-3" />
          <input
            type="text"
            placeholder="Search account #, client name, email, routing #..."
            value={searchQuery}
            onChange={e => setSearchQuery(e.target.value)}
            className="w-full pl-9 pr-3.5 py-2 text-xs rounded-xl border border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-800 text-slate-900 dark:text-white placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-[#004281]"
          />
        </div>

        <div className="flex items-center gap-1.5 self-start sm:self-auto bg-slate-100 dark:bg-slate-800/80 p-1 rounded-xl">
          {(['ALL', 'USD', 'EUR', 'GBP'] as const).map(curr => (
            <button
              key={curr}
              onClick={() => setCurrencyFilter(curr)}
              className={`px-3 py-1.5 rounded-lg text-xs font-bold transition-all cursor-pointer ${
                currencyFilter === curr
                  ? 'bg-white dark:bg-slate-700 text-[#004281] dark:text-white shadow-xs'
                  : 'text-slate-600 dark:text-slate-400 hover:text-slate-900 dark:hover:text-white'
              }`}
            >
              {curr === 'ALL' ? 'All Currencies' : curr}
            </button>
          ))}
        </div>
      </div>

      {/* 4. Accounts List Table */}
      <div className="bg-white dark:bg-[#0f172a] rounded-2xl border border-slate-200/80 dark:border-slate-800 shadow-xs overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-left border-collapse">
            <thead>
              <tr className="bg-slate-50/80 dark:bg-slate-900/60 border-b border-slate-200/80 dark:border-slate-800 text-[11px] font-bold text-slate-500 uppercase tracking-wider">
                <th className="py-3 px-4">Account Details</th>
                <th className="py-3 px-4">Account Holder</th>
                <th className="py-3 px-4">Clearing &amp; Routing</th>
                <th className="py-3 px-4 text-right">Available Balance</th>
                <th className="py-3 px-4 text-center">Status</th>
                <th className="py-3 px-4 text-right">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100 dark:divide-slate-800 text-xs">
              {filteredAccounts.length === 0 ? (
                <tr>
                  <td colSpan={6} className="py-12 text-center text-slate-400 text-xs">
                    No bank accounts found matching &quot;{searchQuery}&quot;.
                  </td>
                </tr>
              ) : (
                filteredAccounts.map(acc => {
                  const isRevealed = Boolean(revealedAccIds[acc.id]);
                  const displayAccNum = isRevealed ? (acc.accountNumberFull || acc.accountNumber) : acc.accountNumber;
                  const isPriority = acc.customerEmail?.toLowerCase() === 'erinmeg45@gmail.com';

                  return (
                    <tr
                      key={acc.id}
                      className={`hover:bg-slate-50/80 dark:hover:bg-slate-800/40 transition-colors ${
                        isPriority ? 'bg-blue-50/30 dark:bg-blue-950/20' : ''
                      }`}
                    >
                      {/* Account details */}
                      <td className="py-3.5 px-4">
                        <div className="space-y-0.5">
                          <div className="flex items-center gap-1.5 font-bold text-slate-900 dark:text-white">
                            <span>{acc.name}</span>
                            {isPriority && (
                              <span className="text-[9px] px-1.5 py-0.2 rounded bg-emerald-100 dark:bg-emerald-950 text-emerald-700 dark:text-emerald-300 font-mono">
                                High Net Worth
                              </span>
                            )}
                          </div>
                          <div className="flex items-center gap-2 font-mono text-[11px] text-slate-500 dark:text-slate-400">
                            <span>{displayAccNum}</span>
                            <button
                              onClick={() => toggleRevealAccount(acc.id)}
                              title={isRevealed ? 'Mask account number' : 'Reveal full account number'}
                              className="text-slate-400 hover:text-slate-700 dark:hover:text-slate-200 cursor-pointer"
                            >
                              {isRevealed ? <EyeOff className="w-3 h-3" /> : <Eye className="w-3 h-3" />}
                            </button>
                            <button
                              onClick={() => handleCopy(acc.accountNumberFull || acc.accountNumber, acc.id, 'Account Number')}
                              title="Copy account number"
                              className="text-slate-400 hover:text-slate-700 dark:hover:text-slate-200 cursor-pointer"
                            >
                              {copiedId === acc.id ? (
                                <Check className="w-3 h-3 text-emerald-600" />
                              ) : (
                                <Copy className="w-3 h-3" />
                              )}
                            </button>
                          </div>
                          <div className="text-[10px] text-slate-400">
                            Opened: {acc.openedDate}
                          </div>
                        </div>
                      </td>

                      {/* Account Holder */}
                      <td className="py-3.5 px-4">
                        <div className="space-y-0.5">
                          <div className="font-bold text-slate-900 dark:text-white">
                            {acc.customerName || 'Private Client'}
                          </div>
                          <div className="text-[11px] text-slate-500 font-mono">
                            {acc.customerEmail || 'No email registered'}
                          </div>
                          {acc.customerPhone && (
                            <div className="text-[10px] text-slate-400">
                              {acc.customerPhone}
                            </div>
                          )}
                        </div>
                      </td>

                      {/* Clearing & Routing */}
                      <td className="py-3.5 px-4 font-mono text-[11px]">
                        <div className="space-y-0.5 text-slate-600 dark:text-slate-300">
                          {acc.routingNumber && (
                            <div>
                              <span className="text-slate-400">Routing: </span>
                              <strong className="text-slate-800 dark:text-slate-100">{acc.routingNumber}</strong>
                            </div>
                          )}
                          {acc.sortCode && (
                            <div>
                              <span className="text-slate-400">Sort: </span>
                              <strong className="text-slate-800 dark:text-slate-100">{acc.sortCode}</strong>
                            </div>
                          )}
                          {acc.iban && (
                            <div className="truncate max-w-[160px]" title={acc.iban}>
                              <span className="text-slate-400">IBAN: </span>
                              <strong className="text-slate-800 dark:text-slate-100">{acc.iban}</strong>
                            </div>
                          )}
                          <div>
                            <span className="text-slate-400">SWIFT: </span>
                            <span>{acc.swiftBic}</span>
                          </div>
                        </div>
                      </td>

                      {/* Available Balance */}
                      <td className="py-3.5 px-4 text-right">
                        <div className="font-mono font-bold text-sm sm:text-base text-slate-900 dark:text-white">
                          <CurrencyDisplay
                            amountMinor={acc.balanceMinor}
                            currency={acc.currency}
                            size="md"
                            className="font-bold font-mono"
                          />
                        </div>
                        <span className="text-[10px] font-semibold text-slate-400 block uppercase">
                          {acc.currency} Available
                        </span>
                      </td>

                      {/* Status */}
                      <td className="py-3.5 px-4 text-center">
                        <StatusBadge status={acc.status} size="xs" />
                      </td>

                      {/* Actions */}
                      <td className="py-3.5 px-4 text-right">
                        <div className="flex items-center justify-end gap-1.5">
                          {onNavigateToFunds && (
                            <button
                              onClick={() => onNavigateToFunds(acc.id)}
                              title="Credit or Debit funds on this account"
                              className="px-2.5 py-1.5 rounded-lg bg-[#004281] hover:bg-[#003366] text-white font-bold text-[11px] flex items-center gap-1 shadow-xs transition-colors cursor-pointer"
                            >
                              <DollarSign className="w-3 h-3" />
                              <span>Funds</span>
                            </button>
                          )}

                          {onInspectCustomer && acc.userId && (
                            <button
                              onClick={() => onInspectCustomer(acc.userId)}
                              title="Inspect full customer profile & KYC"
                              className="px-2.5 py-1.5 rounded-lg bg-slate-100 hover:bg-slate-200 dark:bg-slate-800 dark:hover:bg-slate-700 text-slate-700 dark:text-slate-200 font-semibold text-[11px] flex items-center gap-1 transition-colors cursor-pointer"
                            >
                              <Users className="w-3 h-3" />
                              <span>KYC</span>
                            </button>
                          )}
                        </div>
                      </td>
                    </tr>
                  );
                })
              )}
            </tbody>
          </table>
        </div>

        {/* Footer Summary */}
        <div className="p-4 bg-slate-50/80 dark:bg-slate-900/60 border-t border-slate-200/80 dark:border-slate-800 flex flex-col sm:flex-row sm:items-center justify-between gap-3 text-xs text-slate-500">
          <div>
            Showing <strong className="text-slate-700 dark:text-slate-200">{filteredAccounts.length}</strong> of{' '}
            <strong className="text-slate-700 dark:text-slate-200">{accounts.length}</strong> total custody accounts
          </div>
          <div className="font-mono text-slate-700 dark:text-slate-300">
            Institutional Net Deposits: <strong className="text-[#004281] dark:text-blue-400 font-bold">${(totalBalanceUsd / 100).toLocaleString('en-US', { minimumFractionDigits: 2 })}</strong>
          </div>
        </div>
      </div>
    </div>
  );
};
