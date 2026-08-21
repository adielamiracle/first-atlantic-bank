import React, { useState } from 'react';
import { useBank } from '../../context/BankContext';
import { CurrencyDisplay } from '../../components/common/CurrencyDisplay';
import {
  ArrowDownLeft,
  ArrowUpRight,
  DollarSign,
  Send,
  Sparkles,
  CheckCircle2,
  AlertCircle,
  HelpCircle,
  Clock,
  ShieldCheck,
  RefreshCw,
  Wallet,
  Building2,
  Calendar,
  Tag,
  Hash
} from 'lucide-react';
import { BankAccount, CurrencyCode } from '../../types';

export const AdminFundCreditDebitTab: React.FC = () => {
  const { accounts, creditDebitAccount, showToast, rates } = useBank();

  const [selectedAccountId, setSelectedAccountId] = useState<string>(accounts[0]?.id || '');
  const [direction, setDirection] = useState<'CREDIT' | 'DEBIT'>('CREDIT');
  const [amountStr, setAmountStr] = useState<string>('5000.00');
  const [description, setDescription] = useState<string>('Direct Account Balance Adjustment');
  const [category, setCategory] = useState<string>('DEPOSIT');
  const [counterparty, setCounterparty] = useState<string>('First Atlantic Treasury Operations');
  const [referenceNumber, setReferenceNumber] = useState<string>(`MAN-${Math.floor(100000 + Math.random() * 900000)}`);
  const [customDate, setCustomDate] = useState<string>(new Date().toISOString().slice(0, 16));
  const [isSubmitting, setIsSubmitting] = useState<boolean>(false);

  const selectedAccount = accounts.find(a => a.id === selectedAccountId) || accounts[0];

  const parsedAmount = parseFloat(amountStr) || 0;
  const amountMinor = Math.round(parsedAmount * 100);

  const currentBalanceMinor = selectedAccount ? selectedAccount.balanceMinor : 0;
  const projectedBalanceMinor = selectedAccount
    ? direction === 'CREDIT'
      ? currentBalanceMinor + amountMinor
      : Math.max(0, currentBalanceMinor - amountMinor)
    : 0;

  const quickAmounts = [500, 1000, 5000, 25000, 100000, 500000];

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!selectedAccount) {
      showToast('ERROR', 'Selection Required', 'Please select an active target account.');
      return;
    }
    if (parsedAmount <= 0) {
      showToast('ERROR', 'Invalid Amount', 'Please enter an amount greater than 0.');
      return;
    }

    setIsSubmitting(true);
    try {
      const res = await creditDebitAccount({
        accountId: selectedAccount.id,
        amountMinor,
        direction,
        description: description.trim() || `${direction === 'CREDIT' ? 'Credit' : 'Debit'} Adjustment`,
        category,
        counterparty: counterparty.trim() || 'First Atlantic Treasury Operations',
        referenceNumber: referenceNumber.trim() || `MAN-${Date.now()}`,
        customTimestamp: customDate ? new Date(customDate).toISOString() : new Date().toISOString()
      });

      if (res.success) {
        // Regenerate reference for next transaction
        setReferenceNumber(`MAN-${Math.floor(100000 + Math.random() * 900000)}`);
      }
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="space-y-6 max-w-5xl mx-auto">
      {/* Header Banner */}
      <div className="bg-gradient-to-r from-[#0a192f] via-[#0d213f] to-[#122b52] p-5 sm:p-6 rounded-2xl border border-slate-700/80 shadow-xl text-white">
        <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
          <div>
            <div className="flex items-center gap-2 text-[#c5a880] text-xs font-semibold uppercase tracking-wider">
              <DollarSign className="w-4 h-4" />
              <span>Direct Capital &amp; Balance Console</span>
            </div>
            <h2 className="text-xl sm:text-2xl font-serif font-bold text-white mt-1">
              Add (Credit) &amp; Deduct (Debit) User Money
            </h2>
            <p className="text-xs sm:text-sm text-slate-300 mt-1 max-w-2xl">
              Execute immediate manual balance adjustments, deposit funding, wire injections, or fee debits across any customer account with instant double-entry synchronization.
            </p>
          </div>
          <div className="bg-slate-900/80 border border-[#c5a880]/40 px-4 py-3 rounded-xl text-right shrink-0">
            <span className="text-[10px] uppercase tracking-wider text-slate-400 font-medium block">Total Managed Accounts</span>
            <span className="text-lg font-bold text-[#c5a880] font-mono">{accounts.length} Accounts</span>
          </div>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
        {/* Main Form */}
        <form onSubmit={handleSubmit} className="lg:col-span-7 bg-slate-900/90 border border-slate-800 rounded-2xl p-5 sm:p-6 shadow-xl space-y-5">
          {/* Action Direction Switcher */}
          <div>
            <label className="block text-xs font-semibold text-slate-400 uppercase tracking-wider mb-2">
              Action Type
            </label>
            <div className="grid grid-cols-2 gap-3">
              <button
                type="button"
                onClick={() => {
                  setDirection('CREDIT');
                  setDescription('Direct Account Balance Credit');
                  setCategory('DEPOSIT');
                }}
                className={`flex items-center justify-center gap-2 py-3 px-4 rounded-xl border text-sm font-bold transition-all ${
                  direction === 'CREDIT'
                    ? 'bg-emerald-600 text-white border-emerald-500 shadow-lg shadow-emerald-900/40 ring-2 ring-emerald-400/30'
                    : 'bg-slate-800/60 text-slate-400 border-slate-700 hover:bg-slate-800 hover:text-white'
                }`}
              >
                <ArrowDownLeft className="w-4 h-4 text-emerald-300" />
                <span>+ ADD / CREDIT MONEY</span>
              </button>
              <button
                type="button"
                onClick={() => {
                  setDirection('DEBIT');
                  setDescription('Direct Account Balance Debit');
                  setCategory('FEE_ADJUSTMENT');
                }}
                className={`flex items-center justify-center gap-2 py-3 px-4 rounded-xl border text-sm font-bold transition-all ${
                  direction === 'DEBIT'
                    ? 'bg-rose-600 text-white border-rose-500 shadow-lg shadow-rose-900/40 ring-2 ring-rose-400/30'
                    : 'bg-slate-800/60 text-slate-400 border-slate-700 hover:bg-slate-800 hover:text-white'
                }`}
              >
                <ArrowUpRight className="w-4 h-4 text-rose-300" />
                <span>- DEDUCT / DEBIT MONEY</span>
              </button>
            </div>
          </div>

          {/* Account Selector */}
          <div>
            <label className="block text-xs font-semibold text-slate-400 uppercase tracking-wider mb-2">
              Select Customer Account
            </label>
            <select
              value={selectedAccountId}
              onChange={(e) => setSelectedAccountId(e.target.value)}
              className="w-full bg-slate-950 border border-slate-700 text-white rounded-xl px-4 py-3 text-sm focus:outline-none focus:border-[#c5a880] focus:ring-1 focus:ring-[#c5a880]"
            >
              {accounts.map((acc) => (
                <option key={acc.id} value={acc.id}>
                  {acc.name} ({acc.accountNumber}) — {acc.currency} {(acc.balanceMinor / 100).toLocaleString('en-US', { minimumFractionDigits: 2 })}
                </option>
              ))}
            </select>
          </div>

          {/* Amount Input & Presets */}
          <div>
            <label className="block text-xs font-semibold text-slate-400 uppercase tracking-wider mb-2">
              Amount ({selectedAccount?.currency || 'USD'})
            </label>
            <div className="relative">
              <span className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-400 font-mono text-lg font-bold">
                {selectedAccount?.currency === 'EUR' ? '€' : selectedAccount?.currency === 'GBP' ? '£' : '$'}
              </span>
              <input
                type="number"
                step="0.01"
                min="0.01"
                value={amountStr}
                onChange={(e) => setAmountStr(e.target.value)}
                placeholder="0.00"
                className="w-full bg-slate-950 border border-slate-700 text-white font-mono text-xl font-bold rounded-xl pl-9 pr-4 py-3 focus:outline-none focus:border-[#c5a880] focus:ring-1 focus:ring-[#c5a880]"
              />
            </div>

            {/* Quick Presets */}
            <div className="flex flex-wrap gap-2 mt-2.5">
              {quickAmounts.map((q) => (
                <button
                  key={q}
                  type="button"
                  onClick={() => setAmountStr(q.toFixed(2))}
                  className="px-2.5 py-1 text-xs font-mono font-medium rounded-lg bg-slate-800 hover:bg-slate-700 text-slate-300 hover:text-white border border-slate-700/80 transition-colors"
                >
                  +{q.toLocaleString()}
                </button>
              ))}
            </div>
          </div>

          {/* Category & Counterparty */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div>
              <label className="block text-xs font-semibold text-slate-400 uppercase tracking-wider mb-2">
                Category
              </label>
              <select
                value={category}
                onChange={(e) => setCategory(e.target.value)}
                className="w-full bg-slate-950 border border-slate-700 text-white rounded-xl px-4 py-2.5 text-sm focus:outline-none focus:border-[#c5a880]"
              >
                <option value="DEPOSIT">Direct Deposit</option>
                <option value="WIRE_TRANSFER">Wire Transfer Inbound/Outbound</option>
                <option value="SALARY">Payroll / Salary Deposit</option>
                <option value="INTEREST_CREDIT">Interest / Yield Payout</option>
                <option value="FEE_ADJUSTMENT">Fee Assessment / Waiver</option>
                <option value="CORRECTION">Ledger Balance Correction</option>
                <option value="TRANSFER">Internal Reserve Transfer</option>
                <option value="SETTLEMENT">Institutional Settlement</option>
              </select>
            </div>

            <div>
              <label className="block text-xs font-semibold text-slate-400 uppercase tracking-wider mb-2">
                Counterparty / Source
              </label>
              <input
                type="text"
                value={counterparty}
                onChange={(e) => setCounterparty(e.target.value)}
                placeholder="e.g. JPMorgan Chase Wire or FAB Treasury"
                className="w-full bg-slate-950 border border-slate-700 text-white rounded-xl px-4 py-2.5 text-sm focus:outline-none focus:border-[#c5a880]"
              />
            </div>
          </div>

          {/* Description & Reference */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div>
              <label className="block text-xs font-semibold text-slate-400 uppercase tracking-wider mb-2">
                Transaction Description
              </label>
              <input
                type="text"
                value={description}
                onChange={(e) => setDescription(e.target.value)}
                placeholder="Description shown to customer"
                className="w-full bg-slate-950 border border-slate-700 text-white rounded-xl px-4 py-2.5 text-sm focus:outline-none focus:border-[#c5a880]"
              />
            </div>

            <div>
              <label className="block text-xs font-semibold text-slate-400 uppercase tracking-wider mb-2">
                Reference Number
              </label>
              <input
                type="text"
                value={referenceNumber}
                onChange={(e) => setReferenceNumber(e.target.value)}
                placeholder="e.g. MAN-928371"
                className="w-full bg-slate-950 border border-slate-700 text-white font-mono text-sm rounded-xl px-4 py-2.5 focus:outline-none focus:border-[#c5a880]"
              />
            </div>
          </div>

          {/* Posting Date / Custom Timestamp */}
          <div>
            <label className="block text-xs font-semibold text-slate-400 uppercase tracking-wider mb-2">
              Effective Date &amp; Time
            </label>
            <input
              type="datetime-local"
              value={customDate}
              onChange={(e) => setCustomDate(e.target.value)}
              className="w-full bg-slate-950 border border-slate-700 text-white rounded-xl px-4 py-2.5 text-sm focus:outline-none focus:border-[#c5a880]"
            />
          </div>

          {/* Submit Button */}
          <button
            type="submit"
            disabled={isSubmitting || parsedAmount <= 0}
            className={`w-full py-3.5 px-6 rounded-xl font-bold text-sm uppercase tracking-wider flex items-center justify-center gap-2 shadow-lg transition-all ${
              direction === 'CREDIT'
                ? 'bg-gradient-to-r from-emerald-600 to-teal-600 hover:from-emerald-500 hover:to-teal-500 text-white shadow-emerald-900/30'
                : 'bg-gradient-to-r from-rose-600 to-red-600 hover:from-rose-500 hover:to-red-500 text-white shadow-rose-900/30'
            } disabled:opacity-50 disabled:cursor-not-allowed`}
          >
            {isSubmitting ? (
              <>
                <RefreshCw className="w-4 h-4 animate-spin" />
                <span>Posting to Ledger...</span>
              </>
            ) : (
              <>
                <Send className="w-4 h-4" />
                <span>
                  Execute {direction === 'CREDIT' ? 'Credit' : 'Debit'} (
                  {selectedAccount ? `${selectedAccount.currency} ${parsedAmount.toLocaleString('en-US', { minimumFractionDigits: 2 })}` : '$0.00'}
                  )
                </span>
              </>
            )}
          </button>
        </form>

        {/* Live Calculation & Account Dossier */}
        <div className="lg:col-span-5 space-y-5">
          {/* Calculation Card */}
          <div className="bg-slate-900/90 border border-slate-800 rounded-2xl p-5 sm:p-6 shadow-xl space-y-4">
            <h3 className="text-sm font-semibold text-white uppercase tracking-wider flex items-center gap-2">
              <Sparkles className="w-4 h-4 text-[#c5a880]" />
              <span>Live Balance Preview</span>
            </h3>

            {selectedAccount ? (
              <div className="space-y-3">
                <div className="bg-slate-950 p-4 rounded-xl border border-slate-800">
                  <div className="text-xs text-slate-400 mb-1">Target Account</div>
                  <div className="font-bold text-white text-base">{selectedAccount.name}</div>
                  <div className="text-xs font-mono text-slate-400">{selectedAccount.accountNumber} • {selectedAccount.currency}</div>
                </div>

                <div className="bg-slate-950/80 p-4 rounded-xl border border-slate-800 space-y-3">
                  <div className="flex justify-between items-center text-sm">
                    <span className="text-slate-400">Current Balance:</span>
                    <span className="font-mono font-semibold text-white">
                      <CurrencyDisplay amountMinor={currentBalanceMinor} currency={selectedAccount.currency} />
                    </span>
                  </div>

                  <div className="flex justify-between items-center text-sm">
                    <span className="text-slate-400">
                      {direction === 'CREDIT' ? 'Credit Adjustment (+):' : 'Debit Adjustment (-):'}
                    </span>
                    <span className={`font-mono font-bold ${direction === 'CREDIT' ? 'text-emerald-400' : 'text-rose-400'}`}>
                      {direction === 'CREDIT' ? '+' : '-'}{selectedAccount.currency} {parsedAmount.toLocaleString('en-US', { minimumFractionDigits: 2 })}
                    </span>
                  </div>

                  <div className="pt-3 border-t border-slate-800 flex justify-between items-center">
                    <span className="text-xs uppercase tracking-wider font-semibold text-slate-300">New Projected Balance:</span>
                    <span className="font-mono text-lg font-bold text-[#c5a880]">
                      <CurrencyDisplay amountMinor={projectedBalanceMinor} currency={selectedAccount.currency} />
                    </span>
                  </div>
                </div>

                <div className="bg-amber-950/20 border border-amber-800/40 rounded-xl p-3.5 text-xs text-amber-200/90 flex items-start gap-2.5">
                  <ShieldCheck className="w-4 h-4 text-amber-400 shrink-0 mt-0.5" />
                  <span>
                    <strong>Instant Execution:</strong> This action updates the user's available balance and records an immutable entry into the double-entry general ledger.
                  </span>
                </div>
              </div>
            ) : (
              <div className="text-center py-8 text-slate-500 text-sm">
                Select an account to view live calculation.
              </div>
            )}
          </div>

          {/* Quick Account Switcher List */}
          <div className="bg-slate-900/90 border border-slate-800 rounded-2xl p-5 shadow-xl">
            <h3 className="text-xs font-semibold text-slate-400 uppercase tracking-wider mb-3">
              All User Accounts ({accounts.length})
            </h3>
            <div className="space-y-2 max-h-64 overflow-y-auto pr-1">
              {accounts.map((acc) => (
                <button
                  key={acc.id}
                  type="button"
                  onClick={() => setSelectedAccountId(acc.id)}
                  className={`w-full text-left p-3 rounded-xl border transition-all flex items-center justify-between ${
                    selectedAccountId === acc.id
                      ? 'bg-slate-800 border-[#c5a880] ring-1 ring-[#c5a880]/40'
                      : 'bg-slate-950/60 border-slate-800 hover:bg-slate-800/60'
                  }`}
                >
                  <div>
                    <div className="text-xs font-bold text-white">{acc.name}</div>
                    <div className="text-[11px] font-mono text-slate-400">{acc.accountNumber}</div>
                  </div>
                  <div className="text-right font-mono text-xs font-bold text-[#c5a880]">
                    <CurrencyDisplay amountMinor={acc.balanceMinor} currency={acc.currency} />
                  </div>
                </button>
              ))}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};
