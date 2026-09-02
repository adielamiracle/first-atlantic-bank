import React, { useState } from 'react';
import { useBank } from '../../context/BankContext';
import {
  PlusCircle,
  MinusCircle,
  ArrowUpRight,
  ArrowDownLeft,
  DollarSign,
  Landmark,
  User,
  CheckCircle2,
  AlertTriangle,
  FileText,
  Clock,
  Sparkles,
  RefreshCw,
  Search
} from 'lucide-react';
import { CurrencyDisplay } from '../../components/common/CurrencyDisplay';

interface DirectFundsManagerProps {
  onSuccess?: () => void;
  preselectedUserId?: string;
  preselectedAccountId?: string;
}

export const DirectFundsManager: React.FC<DirectFundsManagerProps> = ({
  onSuccess,
  preselectedUserId,
  preselectedAccountId
}) => {
  const { accounts, creditDebitAccount, showToast, refreshData } = useBank();

  const [selectedAccId, setSelectedAccId] = useState<string>(
    preselectedAccountId || accounts[0]?.id || ''
  );
  const [direction, setDirection] = useState<'CREDIT' | 'DEBIT'>('CREDIT');
  const [amountStr, setAmountStr] = useState<string>('5000.00');
  const [category, setCategory] = useState<string>('Wire Inflow');
  const [description, setDescription] = useState<string>('Executive Treasury Deposit Credit');
  const [counterparty, setCounterparty] = useState<string>('Federal Reserve Wire Settlement');
  const [referenceNumber, setReferenceNumber] = useState<string>(
    `FAB-DIR-${Math.floor(100000 + Math.random() * 900000)}`
  );
  const [customDate, setCustomDate] = useState<string>(
    new Date().toISOString().slice(0, 16)
  );
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [accountSearch, setAccountSearch] = useState('');

  const targetAccount = accounts.find(a => a.id === selectedAccId) || accounts[0];

  const filteredAccounts = accounts.filter(a =>
    a.name.toLowerCase().includes(accountSearch.toLowerCase()) ||
    a.accountNumber.toLowerCase().includes(accountSearch.toLowerCase()) ||
    (a.iban && a.iban.toLowerCase().includes(accountSearch.toLowerCase()))
  );

  const handleExecute = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!targetAccount) {
      showToast('ERROR', 'No Account Selected', 'Please choose a valid user account.');
      return;
    }

    const numAmount = parseFloat(amountStr);
    if (isNaN(numAmount) || numAmount <= 0) {
      showToast('ERROR', 'Invalid Amount', 'Please enter a valid numeric amount greater than zero.');
      return;
    }

    const minorAmount = Math.round(numAmount * 100);

    setIsSubmitting(true);
    try {
      const res = await creditDebitAccount({
        accountId: targetAccount.id,
        amountMinor: minorAmount,
        direction,
        description: description.trim() || `Admin ${direction === 'CREDIT' ? 'Credit' : 'Debit'}`,
        category: (category as any) || 'Adjustments',
        counterparty: counterparty.trim() || 'First Atlantic Treasury Ops',
        referenceNumber: referenceNumber.trim() || undefined,
        customTimestamp: customDate ? new Date(customDate).toISOString() : undefined
      });

      if (res.success) {
        // Generate a new reference number for subsequent transactions
        setReferenceNumber(`FAB-DIR-${Math.floor(100000 + Math.random() * 900000)}`);
        if (onSuccess) onSuccess();
      }
    } catch (err: any) {
      showToast('ERROR', 'Execution Failed', err.message);
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="bg-white rounded-2xl border border-slate-200 shadow-sm overflow-hidden">
      {/* Header */}
      <div className="p-4 sm:p-6 bg-gradient-to-r from-[#0a192f] to-[#122846] text-white flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <div className="flex items-center gap-2">
            <div className="p-2 rounded-lg bg-[#d4af37]/20 text-[#d4af37]">
              <DollarSign className="w-5 h-5" />
            </div>
            <div>
              <h2 className="text-lg font-bold font-serif">Direct Fund Adjustments &amp; Balance Control</h2>
              <p className="text-xs text-slate-300">
                Instantly credit or debit user balances with real-time double-entry ledger settlement
              </p>
            </div>
          </div>
        </div>

        {/* Direction Switcher Pill */}
        <div className="flex items-center bg-slate-900/80 p-1 rounded-xl border border-slate-700/80 self-start sm:self-auto">
          <button
            type="button"
            onClick={() => {
              setDirection('CREDIT');
              if (description.includes('Debit')) setDescription('Executive Treasury Deposit Credit');
            }}
            className={`flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-bold transition-all cursor-pointer ${
              direction === 'CREDIT'
                ? 'bg-emerald-600 text-white shadow-sm'
                : 'text-slate-400 hover:text-white'
            }`}
          >
            <PlusCircle className="w-3.5 h-3.5" />
            <span>Credit / Add Money</span>
          </button>
          <button
            type="button"
            onClick={() => {
              setDirection('DEBIT');
              if (description.includes('Credit')) setDescription('Executive Treasury Account Debit');
            }}
            className={`flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-bold transition-all cursor-pointer ${
              direction === 'DEBIT'
                ? 'bg-rose-600 text-white shadow-sm'
                : 'text-slate-400 hover:text-white'
            }`}
          >
            <MinusCircle className="w-3.5 h-3.5" />
            <span>Debit / Deduct Money</span>
          </button>
        </div>
      </div>

      <form noValidate onSubmit={handleExecute} className="p-4 sm:p-6 space-y-6">
        {/* Account Selector Card */}
        <div className="space-y-2">
          <label className="block text-xs font-bold uppercase tracking-wider text-slate-700">
            Target User Account
          </label>

          {/* Quick filter input if multiple accounts */}
          {accounts.length > 3 && (
            <div className="relative mb-2">
              <Search className="w-4 h-4 text-slate-400 absolute left-3 top-2.5" />
              <input
                type="text"
                placeholder="Search account name, number or IBAN..."
                value={accountSearch}
                onChange={e => setAccountSearch(e.target.value)}
                className="w-full pl-9 pr-3 py-1.5 text-xs rounded-lg border border-slate-200 focus:outline-none focus:ring-2 focus:ring-[#0a192f]"
              />
            </div>
          )}

          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3 max-h-56 overflow-y-auto pr-1">
            {filteredAccounts.map(acc => {
              const isSelected = selectedAccId === acc.id || (!selectedAccId && acc === accounts[0]);
              return (
                <div
                  key={acc.id}
                  onClick={() => setSelectedAccId(acc.id)}
                  className={`p-3 rounded-xl border cursor-pointer transition-all ${
                    isSelected
                      ? 'border-[#0a192f] bg-[#f0f4f9] ring-2 ring-[#0a192f]/20 shadow-xs'
                      : 'border-slate-200 hover:border-slate-300 bg-white'
                  }`}
                >
                  <div className="flex items-center justify-between">
                    <span className="text-xs font-bold text-slate-900 truncate max-w-[140px]">
                      {acc.name}
                    </span>
                    <span className="text-[10px] font-bold px-1.5 py-0.5 rounded bg-slate-100 text-slate-700 font-mono">
                      {acc.currency}
                    </span>
                  </div>
                  <div className="text-[11px] text-slate-500 font-mono mt-0.5">
                    {acc.accountNumber}
                  </div>
                  <div className="mt-2 pt-2 border-t border-slate-200/60 flex items-center justify-between">
                    <span className="text-[10px] text-slate-500">Current Balance:</span>
                    <CurrencyDisplay
                      amountMinor={acc.balanceMinor}
                      currency={acc.currency}
                      size="xs"
                      className="font-bold text-slate-900 font-mono"
                    />
                  </div>
                </div>
              );
            })}
          </div>
        </div>

        {/* Transaction Parameters Grid */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
          {/* Amount */}
          <div className="space-y-1.5 sm:col-span-1">
            <label className="block text-xs font-bold uppercase tracking-wider text-slate-700">
              Amount ({targetAccount?.currency || 'USD'})
            </label>
            <div className="relative">
              <span className="absolute left-3 top-2.5 text-base font-bold text-slate-500 font-mono">
                {targetAccount?.currency === 'USD' ? '$' : targetAccount?.currency === 'GBP' ? '£' : '€'}
              </span>
              <input
                type="number"
                step="0.01"
                min="0.01"
                required
                value={amountStr}
                onChange={e => setAmountStr(e.target.value)}
                placeholder="0.00"
                className="w-full pl-8 pr-4 py-2 text-lg font-bold font-mono rounded-xl border border-slate-300 focus:outline-none focus:ring-2 focus:ring-[#0a192f] bg-white text-slate-900"
              />
            </div>
            <div className="flex gap-1.5 pt-1">
              {[1000, 5000, 25000, 100000].map(val => (
                <button
                  type="button"
                  key={val}
                  onClick={() => setAmountStr(val.toFixed(2))}
                  className="px-2 py-0.5 rounded bg-slate-100 hover:bg-slate-200 text-[10px] font-mono text-slate-700 transition-colors"
                >
                  +{val.toLocaleString()}
                </button>
              ))}
            </div>
          </div>

          {/* Category */}
          <div className="space-y-1.5">
            <label className="block text-xs font-bold uppercase tracking-wider text-slate-700">
              Transaction Category
            </label>
            <select
              value={category}
              onChange={e => setCategory(e.target.value)}
              className="w-full px-3 py-2 text-xs rounded-xl border border-slate-300 focus:outline-none focus:ring-2 focus:ring-[#0a192f] bg-white text-slate-800"
            >
              <option value="Wire Inflow">Wire Inflow (SWIFT/Fedwire/CHAPS)</option>
              <option value="Wire Outflow">Wire Outflow / Remittance</option>
              <option value="Direct Deposit">Direct Deposit / Payroll</option>
              <option value="Investments">Investments / Securities Yield</option>
              <option value="Adjustments">Admin Treasury Adjustment</option>
              <option value="Internal Transfer">Internal Vault Transfer</option>
              <option value="Commercial Lending">Commercial Loan Disbursement</option>
              <option value="Interest">Interest Capitalization</option>
              <option value="Fee Reversal">Fee Refund / Reversal</option>
            </select>
          </div>

          {/* Custom Date / Timestamp */}
          <div className="space-y-1.5">
            <label className="block text-xs font-bold uppercase tracking-wider text-slate-700">
              Effective Date &amp; Time
            </label>
            <input
              type="datetime-local"
              value={customDate}
              onChange={e => setCustomDate(e.target.value)}
              className="w-full px-3 py-2 text-xs rounded-xl border border-slate-300 focus:outline-none focus:ring-2 focus:ring-[#0a192f] bg-white text-slate-800 font-mono"
            />
          </div>

          {/* Counterparty */}
          <div className="space-y-1.5">
            <label className="block text-xs font-bold uppercase tracking-wider text-slate-700">
              Counterparty / Sending Entity
            </label>
            <input
              type="text"
              required
              value={counterparty}
              onChange={e => setCounterparty(e.target.value)}
              placeholder="e.g. JPMorgan Chase NY, London Clearing House"
              className="w-full px-3 py-2 text-xs rounded-xl border border-slate-300 focus:outline-none focus:ring-2 focus:ring-[#0a192f] bg-white text-slate-800"
            />
          </div>

          {/* Reference Number */}
          <div className="space-y-1.5">
            <label className="block text-xs font-bold uppercase tracking-wider text-slate-700">
              Reference / Tracking Number
            </label>
            <div className="flex gap-2">
              <input
                type="text"
                required
                value={referenceNumber}
                onChange={e => setReferenceNumber(e.target.value)}
                className="w-full px-3 py-2 text-xs rounded-xl border border-slate-300 focus:outline-none focus:ring-2 focus:ring-[#0a192f] bg-white text-slate-800 font-mono"
              />
              <button
                type="button"
                onClick={() => setReferenceNumber(`FAB-DIR-${Math.floor(100000 + Math.random() * 900000)}`)}
                title="Regenerate Reference"
                className="px-2.5 py-2 rounded-xl bg-slate-100 hover:bg-slate-200 text-slate-600 text-xs transition-colors"
              >
                <RefreshCw className="w-3.5 h-3.5" />
              </button>
            </div>
          </div>

          {/* Description / Memo */}
          <div className="space-y-1.5 sm:col-span-2 lg:col-span-1">
            <label className="block text-xs font-bold uppercase tracking-wider text-slate-700">
              Transaction Memo / Statement Description
            </label>
            <input
              type="text"
              required
              value={description}
              onChange={e => setDescription(e.target.value)}
              placeholder="Visible on customer statement & activity feed"
              className="w-full px-3 py-2 text-xs rounded-xl border border-slate-300 focus:outline-none focus:ring-2 focus:ring-[#0a192f] bg-white text-slate-800"
            />
          </div>
        </div>

        {/* Summary Projection Box */}
        {targetAccount && (
          <div className="p-4 rounded-xl bg-slate-50 border border-slate-200 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3">
            <div className="space-y-0.5">
              <span className="text-[11px] font-bold text-slate-500 uppercase tracking-wider">
                Impact Preview on {targetAccount.name}
              </span>
              <div className="flex items-center gap-3 text-xs">
                <span>
                  Current: <strong className="font-mono">{(targetAccount.balanceMinor / 100).toLocaleString('en-US', { minimumFractionDigits: 2 })} {targetAccount.currency}</strong>
                </span>
                <span>&rarr;</span>
                <span className={direction === 'CREDIT' ? 'text-emerald-700 font-bold' : 'text-rose-700 font-bold'}>
                  New Balance:{' '}
                  <strong className="font-mono">
                    {(
                      (targetAccount.balanceMinor + (direction === 'CREDIT' ? 1 : -1) * (parseFloat(amountStr) || 0) * 100) /
                      100
                    ).toLocaleString('en-US', { minimumFractionDigits: 2 })}{' '}
                    {targetAccount.currency}
                  </strong>
                </span>
              </div>
            </div>

            <button
              type="submit"
              disabled={isSubmitting}
              className={`w-full sm:w-auto px-6 py-3 rounded-xl font-bold text-xs uppercase tracking-wider transition-all flex items-center justify-center gap-2 shadow-md cursor-pointer ${
                direction === 'CREDIT'
                  ? 'bg-emerald-600 hover:bg-emerald-700 text-white'
                  : 'bg-rose-600 hover:bg-rose-700 text-white'
              } disabled:opacity-50`}
            >
              {isSubmitting ? (
                <>
                  <RefreshCw className="w-4 h-4 animate-spin" />
                  <span>Processing Settlement...</span>
                </>
              ) : (
                <>
                  {direction === 'CREDIT' ? <ArrowUpRight className="w-4 h-4" /> : <ArrowDownLeft className="w-4 h-4" />}
                  <span>
                    Execute {direction === 'CREDIT' ? 'Credit Deposit' : 'Debit Deduction'} Now
                  </span>
                </>
              )}
            </button>
          </div>
        )}
      </form>
    </div>
  );
};
