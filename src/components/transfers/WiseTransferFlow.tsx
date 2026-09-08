import React, { useState, useEffect } from 'react';
import { useBank } from '../../context/BankContext';
import { Recipient, CurrencyCode, TransferRecord } from '../../types';
import {
  Globe,
  Building,
  Plus,
  ArrowRight,
  ShieldCheck,
  CheckCircle2,
  AlertCircle,
  Clock,
  Sparkles,
  Zap,
  Info,
  RefreshCw,
  Send,
  UserCheck,
  Receipt
} from 'lucide-react';
import { AddRecipientModal } from './AddRecipientModal';

interface Props {
  onTransferDispatched?: (transfer: TransferRecord) => void;
}

export const WiseTransferFlow: React.FC<Props> = ({ onTransferDispatched }) => {
  const {
    accounts,
    recipients,
    fetchRecipients,
    getWiseQuote,
    executeWiseTransfer,
    showToast
  } = useBank();

  const [sourceAccountId, setSourceAccountId] = useState(accounts[0]?.id || '');
  const [selectedRecipientId, setSelectedRecipientId] = useState(recipients[0]?.id || '');
  const [amountStr, setAmountStr] = useState('2500');
  const [memo, setMemo] = useState('');
  const [destCurrency, setDestCurrency] = useState<CurrencyCode>('GBP');

  const [isAddRecipientOpen, setIsAddRecipientOpen] = useState(false);
  const [isLoadingQuote, setIsLoadingQuote] = useState(false);
  const [quote, setQuote] = useState<any>(null);

  const [isSubmitting, setIsSubmitting] = useState(false);
  const [showConfirmModal, setShowConfirmModal] = useState(false);
  const [recentDispatchedTransfer, setRecentDispatchedTransfer] = useState<TransferRecord | null>(null);

  const sourceAccount = accounts.find(a => a.id === sourceAccountId) || accounts[0];
  const selectedRecipient = recipients.find(r => r.id === selectedRecipientId);

  // Auto-sync destination currency based on selected recipient region
  useEffect(() => {
    if (selectedRecipient) {
      if (selectedRecipient.region === 'UK') setDestCurrency('GBP');
      else if (selectedRecipient.region === 'US') setDestCurrency('USD');
      else if (selectedRecipient.region === 'EU') setDestCurrency('EUR');
    }
  }, [selectedRecipientId, recipients]);

  // Fetch real-time quote whenever source account, dest currency, or amount changes
  useEffect(() => {
    let active = true;
    const fetchQuote = async () => {
      const amountVal = parseFloat(amountStr || '0');
      if (isNaN(amountVal) || amountVal <= 0 || !sourceAccount) return;

      setIsLoadingQuote(true);
      const minor = Math.round(amountVal * 100);
      const q = await getWiseQuote(sourceAccount.currency, destCurrency, minor);
      if (active && q) {
        setQuote(q);
      }
      if (active) setIsLoadingQuote(false);
    };

    const timer = setTimeout(fetchQuote, 400);
    return () => {
      active = false;
      clearTimeout(timer);
    };
  }, [sourceAccountId, destCurrency, amountStr, sourceAccount?.currency]);

  const handleSendTransfer = async () => {
    if (!sourceAccount) {
      showToast('ERROR', 'Missing Account', 'Please select a funding account.');
      return;
    }
    if (!selectedRecipient) {
      showToast('ERROR', 'Missing Beneficiary', 'Please select or add a recipient in UK, US, or EU.');
      return;
    }

    const amountVal = parseFloat(amountStr || '0');
    if (isNaN(amountVal) || amountVal <= 0) {
      showToast('ERROR', 'Invalid Amount', 'Please enter a valid transfer amount.');
      return;
    }

    const amountMinor = Math.round(amountVal * 100);
    if (amountMinor > sourceAccount.balanceMinor) {
      showToast('ERROR', 'Insufficient Balance', 'Transfer amount exceeds your available account balance.');
      return;
    }

    setIsSubmitting(true);
    try {
      const res = await executeWiseTransfer(
        sourceAccount.id,
        selectedRecipient,
        amountMinor,
        memo || undefined,
        destCurrency
      );

      if (res.success && res.transfer) {
        setShowConfirmModal(false);
        setRecentDispatchedTransfer(res.transfer);
        onTransferDispatched?.(res.transfer);
      }
    } finally {
      setIsSubmitting(false);
    }
  };

  const formatMinor = (minor: number, currency: CurrencyCode) => {
    const symbol = currency === 'GBP' ? '£' : currency === 'EUR' ? '€' : '$';
    return `${symbol}${(minor / 100).toLocaleString('en-US', { minimumFractionDigits: 2 })}`;
  };

  return (
    <div className="space-y-6">
      {/* Top Banner */}
      <div className="p-4 sm:p-5 rounded-2xl bg-gradient-to-r from-[#004281] to-[#002b53] text-white flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 shadow-sm">
        <div className="flex items-center gap-3">
          <div className="w-11 h-11 rounded-2xl bg-white/10 flex items-center justify-center text-amber-300">
            <Globe className="w-6 h-6" />
          </div>
          <div>
            <div className="flex items-center gap-2">
              <span className="text-xs font-bold text-amber-300 uppercase tracking-wider">
                Wise Global Payment Rails
              </span>
              <span className="text-[10px] bg-emerald-500/20 text-emerald-300 px-2 py-0.5 rounded-full font-mono font-bold">
                Live Mid-Market Rates
              </span>
            </div>
            <h3 className="text-base sm:text-lg font-bold">Send to any bank in UK, USA, or Europe</h3>
          </div>
        </div>

        <button
          type="button"
          onClick={() => setIsAddRecipientOpen(true)}
          className="py-2.5 px-4 rounded-xl bg-white text-[#004281] hover:bg-amber-300 hover:text-slate-950 font-bold text-xs shadow-xs transition-all flex items-center gap-2 cursor-pointer whitespace-nowrap"
        >
          <Plus className="w-4 h-4" />
          <span>+ Add Recipient</span>
        </button>
      </div>

      {/* Main Grid: Form on Left, Live Wise Quote Breakdown on Right */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
        {/* Transfer Setup Form */}
        <div className="lg:col-span-7 bg-white dark:bg-[#0f172a] rounded-2xl p-5 sm:p-6 border border-slate-200 dark:border-slate-800 shadow-xs space-y-5">
          <h4 className="text-sm font-bold text-slate-900 dark:text-white pb-3 border-b border-slate-100 dark:border-slate-800 flex items-center gap-2">
            <Send className="w-4 h-4 text-[#004281] dark:text-sky-400" />
            <span>Transfer Specifications</span>
          </h4>

          {/* 1. Recipient Selector */}
          <div className="space-y-2">
            <div className="flex items-center justify-between">
              <label className="text-xs font-bold text-slate-700 dark:text-slate-300 uppercase tracking-wider">
                1. Select Beneficiary (UK / US / EU) *
              </label>
              <button
                type="button"
                onClick={() => setIsAddRecipientOpen(true)}
                className="text-xs text-[#004281] dark:text-sky-400 hover:underline font-bold flex items-center gap-1 cursor-pointer"
              >
                <Plus className="w-3.5 h-3.5" />
                <span>Add New</span>
              </button>
            </div>

            {recipients.length === 0 ? (
              <div className="p-4 rounded-xl border border-dashed border-slate-300 dark:border-slate-700 text-center space-y-2">
                <p className="text-xs text-slate-500">No beneficiaries registered yet.</p>
                <button
                  type="button"
                  onClick={() => setIsAddRecipientOpen(true)}
                  className="py-1.5 px-3 rounded-lg bg-[#004281] text-white text-xs font-bold cursor-pointer"
                >
                  + Add Recipient with Bank Details
                </button>
              </div>
            ) : (
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-2.5 max-h-56 overflow-y-auto pr-1">
                {recipients.map(r => {
                  const isSel = selectedRecipientId === r.id;
                  return (
                    <button
                      key={r.id}
                      type="button"
                      onClick={() => setSelectedRecipientId(r.id)}
                      className={`p-3 rounded-xl border text-left cursor-pointer transition-all flex items-start gap-2.5 ${
                        isSel
                          ? 'border-[#004281] bg-[#004281]/5 dark:bg-[#004281]/20 ring-1 ring-[#004281]'
                          : 'border-slate-200 dark:border-slate-700 hover:border-slate-300 dark:hover:border-slate-600 bg-white dark:bg-slate-900/60'
                      }`}
                    >
                      <span className="text-xl leading-none">
                        {r.region === 'UK' ? '🇬🇧' : r.region === 'US' ? '🇺🇸' : '🇪🇺'}
                      </span>
                      <div className="min-w-0 flex-1">
                        <div className="text-xs font-bold text-slate-900 dark:text-white truncate">
                          {r.name}
                        </div>
                        <div className="text-[11px] text-slate-500 truncate flex items-center gap-1">
                          <Building className="w-3 h-3 text-slate-400 shrink-0" />
                          <span>{r.bankName}</span>
                        </div>
                        <div className="text-[10px] font-mono text-slate-400 truncate mt-0.5">
                          {r.region === 'UK' && `Sort: ${r.sortCode || '20-04-15'} • Acc: ${r.accountNumberOrIban || r.accountNumberUk || '••••'}`}
                          {r.region === 'US' && `ABA: ${r.routingNumber || '021000021'} • Acc: ••••${String(r.accountNumberOrIban || r.accountNumberUs || '0000').slice(-4)}`}
                          {r.region === 'EU' && `IBAN: ••••${String(r.accountNumberOrIban || r.iban || '000000').slice(-6)}`}
                        </div>
                      </div>
                    </button>
                  );
                })}
              </div>
            )}
          </div>

          {/* 2. Funding Account Selector */}
          <div className="space-y-1.5">
            <label className="text-xs font-bold text-slate-700 dark:text-slate-300 uppercase tracking-wider">
              2. Funding Account (Source)
            </label>
            <select
              value={sourceAccountId}
              onChange={e => setSourceAccountId(e.target.value)}
              className="w-full px-3 py-3 sm:py-2.5 rounded-xl border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-900 text-slate-900 dark:text-white font-semibold text-xs focus:outline-hidden focus:ring-2 focus:ring-[#004281] min-h-[44px]"
            >
              {accounts.map(acc => (
                <option key={acc.id} value={acc.id}>
                  {acc.name} ({acc.accountNumber}) — Available: {formatMinor(acc.balanceMinor, acc.currency)}
                </option>
              ))}
            </select>
          </div>

          {/* 3. Amount & Currency */}
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
            <div className="sm:col-span-2 space-y-1.5">
              <label className="text-xs font-bold text-slate-700 dark:text-slate-300 uppercase tracking-wider">
                3. Amount to Send ({sourceAccount?.currency || 'USD'})
              </label>
              <div className="relative">
                <span className="absolute left-3.5 top-3 sm:top-2.5 font-bold text-slate-400 text-sm">
                  {sourceAccount?.currency === 'GBP' ? '£' : sourceAccount?.currency === 'EUR' ? '€' : '$'}
                </span>
                <input
                  type="text"
                  inputMode="decimal"
                  value={amountStr}
                  onChange={e => {
                    const cleanVal = e.target.value.replace(/[^0-9.]/g, '');
                    setAmountStr(cleanVal);
                  }}
                  placeholder="2500"
                  className="w-full pl-8 pr-3 py-2.5 sm:py-2 text-sm font-bold font-mono rounded-xl border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-900 text-slate-900 dark:text-white focus:outline-hidden focus:ring-2 focus:ring-[#004281] min-h-[44px]"
                />
              </div>
            </div>

            <div className="space-y-1.5">
              <label className="text-xs font-bold text-slate-700 dark:text-slate-300 uppercase tracking-wider">
                Payout Currency
              </label>
              <select
                value={destCurrency}
                onChange={e => setDestCurrency(e.target.value as CurrencyCode)}
                className="w-full px-3 py-2.5 sm:py-2 text-xs font-bold rounded-xl border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-900 text-slate-900 dark:text-white focus:outline-hidden focus:ring-2 focus:ring-[#004281] min-h-[44px]"
              >
                <option value="GBP">GBP (£ - UK Faster Payments)</option>
                <option value="USD">USD ($ - US Fedwire / ACH)</option>
                <option value="EUR">EUR (€ - Euro SEPA Instant)</option>
              </select>
            </div>
          </div>

          {/* 4. Payment Reference / Memo */}
          <div className="space-y-1.5">
            <label className="text-xs font-bold text-slate-700 dark:text-slate-300 uppercase tracking-wider">
              4. Transfer Reference / Remittance Note
            </label>
            <input
              type="text"
              value={memo}
              onChange={e => setMemo(e.target.value)}
              placeholder="e.g. Commercial advisory settlement / Property invoice #918"
              className="w-full px-3 py-2.5 sm:py-2 rounded-xl border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-900 text-slate-900 dark:text-white text-xs focus:outline-hidden focus:ring-2 focus:ring-[#004281] min-h-[44px]"
            />
          </div>

          {/* Submit Button */}
          <button
            type="button"
            onClick={() => setShowConfirmModal(true)}
            disabled={!selectedRecipient || !amountStr || parseFloat(amountStr) <= 0 || isSubmitting}
            className="w-full py-3.5 px-4 rounded-xl bg-[#004281] hover:bg-[#003366] text-white font-bold text-sm shadow-md transition-all flex items-center justify-center gap-2 cursor-pointer disabled:opacity-50 min-h-[48px]"
          >
            <Send className="w-4 h-4" />
            <span>Review &amp; Send Transfer</span>
          </button>
        </div>

        {/* Live Wise Quote & Fee Breakdown on Right */}
        <div className="lg:col-span-5 space-y-4">
          <div className="bg-white dark:bg-[#0f172a] rounded-2xl p-5 sm:p-6 border border-slate-200 dark:border-slate-800 shadow-xs space-y-4">
            <div className="flex items-center justify-between pb-3 border-b border-slate-100 dark:border-slate-800">
              <h4 className="text-xs font-bold uppercase tracking-wider text-slate-700 dark:text-slate-300 flex items-center gap-1.5">
                <Sparkles className="w-4 h-4 text-amber-500" />
                <span>Wise Guaranteed Quote</span>
              </h4>
              <span className="text-[10px] text-slate-400 font-mono">Real-time Rate</span>
            </div>

            {isLoadingQuote ? (
              <div className="py-12 text-center text-slate-400 space-y-2">
                <RefreshCw className="w-6 h-6 animate-spin mx-auto text-[#004281]" />
                <p className="text-xs">Fetching live mid-market exchange rate...</p>
              </div>
            ) : quote ? (
              <div className="space-y-4 text-xs">
                <div className="p-4 rounded-xl bg-slate-50 dark:bg-slate-800/60 border border-slate-100 dark:border-slate-800 space-y-3">
                  <div className="flex justify-between items-center text-slate-600 dark:text-slate-400">
                    <span>Transfer Amount:</span>
                    <span className="font-bold text-slate-900 dark:text-white font-mono">
                      ${quote.sourceAmount.toLocaleString('en-US', { minimumFractionDigits: 2 })} {quote.sourceCurrency}
                    </span>
                  </div>

                  <div className="flex justify-between items-center text-slate-600 dark:text-slate-400">
                    <span className="flex items-center gap-1">
                      <span>Wise Fixed Fee:</span>
                      <Info className="w-3.5 h-3.5 text-slate-400" />
                    </span>
                    <span className="font-bold text-slate-700 dark:text-slate-300 font-mono">
                      ${quote.fee.toFixed(2)} {quote.sourceCurrency}
                    </span>
                  </div>

                  <div className="flex justify-between items-center text-slate-600 dark:text-slate-400">
                    <span>Guaranteed Rate:</span>
                    <span className="font-bold text-amber-600 dark:text-amber-400 font-mono">
                      1 {quote.sourceCurrency} = {quote.rate} {quote.targetCurrency}
                    </span>
                  </div>

                  <div className="pt-2 border-t border-slate-200 dark:border-slate-700 flex justify-between items-baseline">
                    <span className="font-bold text-slate-900 dark:text-white">Recipient Receives:</span>
                    <span className="text-lg font-bold text-emerald-600 dark:text-emerald-400 font-mono">
                      {destCurrency === 'GBP' ? '£' : destCurrency === 'EUR' ? '€' : '$'}
                      {quote.targetAmount.toLocaleString('en-US', { minimumFractionDigits: 2 })} {quote.targetCurrency}
                    </span>
                  </div>
                </div>

                {/* Delivery arrival badge */}
                <div className="p-3 bg-emerald-50 dark:bg-emerald-950/40 border border-emerald-200 dark:border-emerald-800/60 rounded-xl flex items-center gap-2.5 text-xs text-emerald-800 dark:text-emerald-300">
                  <Zap className="w-4 h-4 text-emerald-600 shrink-0" />
                  <div>
                    <span className="font-bold block">Estimated Delivery</span>
                    <span className="text-[11px] text-emerald-700 dark:text-emerald-400">
                      {quote.formattedDelivery}
                    </span>
                  </div>
                </div>

                <div className="text-[11px] text-slate-400 space-y-1">
                  <p>• Zero hidden markups or intermediary wire bounce penalties.</p>
                  <p>• Faster Payments (UK), Fedwire (US), and SEPA Instant (EU) priority routing.</p>
                </div>
              </div>
            ) : (
              <div className="py-8 text-center text-slate-400 text-xs">
                Enter an amount to see live rates and delivery calculation.
              </div>
            )}
          </div>

          {/* Compliance & Security Guarantee */}
          <div className="p-4 rounded-2xl bg-slate-50 dark:bg-slate-900/60 border border-slate-200 dark:border-slate-800 text-xs space-y-2">
            <div className="flex items-center gap-2 text-slate-900 dark:text-white font-bold">
              <ShieldCheck className="w-4 h-4 text-emerald-500" />
              <span>Multi-Stage Transaction Assurance</span>
            </div>
            <p className="text-[11px] text-slate-500 dark:text-slate-400 leading-relaxed">
              Every transfer is assigned a dedicated tracking reference with real-time status updates (Pending Approval, Processing, Settled, or Cancelled). In the event of a beneficiary bank inquiry, funds are safely held in insured escrow.
            </p>
          </div>
        </div>
      </div>

      {/* CONFIRMATION MODAL */}
      {showConfirmModal && selectedRecipient && quote && (
        <div className="fixed inset-0 z-50 bg-slate-950/70 backdrop-blur-xs flex items-center justify-center p-3 sm:p-4 overflow-y-auto">
          <div className="bg-white dark:bg-[#0f172a] rounded-2xl max-w-md w-full p-4 sm:p-6 shadow-2xl border border-slate-200 dark:border-slate-800 space-y-4 sm:space-y-5 animate-in fade-in zoom-in-95 duration-150 my-auto max-h-[92vh] overflow-y-auto">
            <div className="flex items-center justify-between pb-3 border-b border-slate-100 dark:border-slate-800">
              <div>
                <span className="text-[10px] font-bold uppercase tracking-wider text-amber-500">
                  Transfer Authorization
                </span>
                <h3 className="text-base font-bold text-slate-900 dark:text-white">
                  Confirm Wire Dispatch
                </h3>
              </div>
              <button
                type="button"
                onClick={() => setShowConfirmModal(false)}
                className="p-2 rounded-lg text-slate-400 hover:text-slate-700 dark:hover:text-slate-200 cursor-pointer shrink-0"
              >
                &times;
              </button>
            </div>

            <div className="space-y-3 text-xs">
              <div className="p-3.5 sm:p-4 rounded-xl bg-slate-50 dark:bg-slate-800/60 space-y-2 border border-slate-100 dark:border-slate-800">
                <div className="flex justify-between">
                  <span className="text-slate-500">Funding Account:</span>
                  <span className="font-bold text-slate-900 dark:text-white">{sourceAccount?.name}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-slate-500">Beneficiary:</span>
                  <span className="font-bold text-slate-900 dark:text-white">{selectedRecipient.name}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-slate-500">Beneficiary Bank:</span>
                  <span className="font-semibold text-slate-900 dark:text-white">{selectedRecipient.bankName}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-slate-500">Routing / Account:</span>
                  <span className="font-mono text-slate-900 dark:text-white">
                    {selectedRecipient.sortCode || selectedRecipient.routingNumber || 'IBAN'} • {selectedRecipient.accountNumberOrIban || selectedRecipient.accountNumberUk || selectedRecipient.accountNumberUs || selectedRecipient.iban || '••••'}
                  </span>
                </div>
                <div className="flex justify-between pt-2 border-t border-slate-200 dark:border-slate-700">
                  <span className="text-slate-500">Total Debit:</span>
                  <span className="font-mono font-bold text-slate-900 dark:text-white">
                    ${(quote.sourceAmount + quote.fee).toLocaleString('en-US', { minimumFractionDigits: 2 })} {quote.sourceCurrency}
                  </span>
                </div>
                <div className="flex justify-between">
                  <span className="text-slate-500">Recipient Receives:</span>
                  <span className="font-mono font-bold text-emerald-600 dark:text-emerald-400 text-sm">
                    {destCurrency === 'GBP' ? '£' : destCurrency === 'EUR' ? '€' : '$'}
                    {quote.targetAmount.toLocaleString('en-US', { minimumFractionDigits: 2 })} {quote.targetCurrency}
                  </span>
                </div>
              </div>

              <div className="p-3 bg-amber-50 dark:bg-amber-950/40 border border-amber-200 dark:border-amber-800/60 rounded-xl text-[11px] text-amber-800 dark:text-amber-300">
                Note: Transfers are dispatched through the verified banking network. Your funds are secured and traceable.
              </div>
            </div>

            <div className="flex items-center justify-end gap-3 pt-2">
              <button
                type="button"
                onClick={() => setShowConfirmModal(false)}
                className="py-3 px-4 rounded-xl border border-slate-200 dark:border-slate-700 text-slate-600 dark:text-slate-400 font-bold hover:bg-slate-100 dark:hover:bg-slate-800 cursor-pointer min-h-[44px]"
              >
                Cancel
              </button>
              <button
                type="button"
                onClick={handleSendTransfer}
                disabled={isSubmitting}
                className="py-3 px-5 rounded-xl bg-[#004281] hover:bg-[#003366] text-white font-bold shadow-md flex items-center justify-center gap-2 cursor-pointer disabled:opacity-50 min-h-[44px]"
              >
                <Send className="w-4 h-4" />
                <span>{isSubmitting ? 'Dispatching...' : 'Authorize & Send'}</span>
              </button>
            </div>
          </div>
        </div>
      )}

      {/* RECENT DISPATCHED RECEIPT / STATUS MODAL */}
      {recentDispatchedTransfer && (
        <div className="fixed inset-0 z-50 bg-slate-950/60 backdrop-blur-xs flex items-center justify-center p-4">
          <div className="bg-white dark:bg-[#0f172a] rounded-2xl max-w-md w-full p-6 shadow-2xl border border-slate-200 dark:border-slate-800 space-y-5 animate-in fade-in zoom-in-95 duration-150 text-center">
            <div className="w-14 h-14 rounded-full bg-emerald-100 dark:bg-emerald-950/80 text-emerald-600 dark:text-emerald-400 flex items-center justify-center mx-auto">
              <CheckCircle2 className="w-8 h-8" />
            </div>

            <div className="space-y-1">
              <span className="text-[10px] font-bold uppercase tracking-wider text-emerald-600 dark:text-emerald-400">
                Instruction Logged &amp; In Flight
              </span>
              <h3 className="text-lg font-bold text-slate-900 dark:text-white">
                Transfer Dispatched Successfully
              </h3>
              <p className="text-xs text-slate-500 dark:text-slate-400">
                Ref: <span className="font-mono font-bold text-slate-900 dark:text-white">{recentDispatchedTransfer.reference}</span>
              </p>
            </div>

            <div className="p-4 rounded-xl bg-slate-50 dark:bg-slate-800/60 text-xs space-y-2 border border-slate-100 dark:border-slate-800 text-left">
              <div className="flex justify-between">
                <span className="text-slate-500">Status:</span>
                <span className="font-bold text-amber-600 dark:text-amber-400">
                  {recentDispatchedTransfer.status === 'PENDING' ? 'Pending Approval' : 'Processing'}
                </span>
              </div>
              <div className="flex justify-between">
                <span className="text-slate-500">Amount:</span>
                <span className="font-mono font-bold text-slate-900 dark:text-white">
                  {formatMinor(recentDispatchedTransfer.amountMinor, recentDispatchedTransfer.sourceCurrency)}
                </span>
              </div>
              <div className="flex justify-between">
                <span className="text-slate-500">Recipient:</span>
                <span className="font-bold text-slate-900 dark:text-white">{recentDispatchedTransfer.recipient.name}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-slate-500">Expected Delivery:</span>
                <span className="text-emerald-600 dark:text-emerald-400 font-medium">
                  {recentDispatchedTransfer.estimatedDelivery}
                </span>
              </div>
            </div>

            <button
              type="button"
              onClick={() => setRecentDispatchedTransfer(null)}
              className="w-full py-3 px-4 rounded-xl bg-[#004281] hover:bg-[#003366] text-white font-bold text-xs shadow-xs cursor-pointer"
            >
              Done &amp; View All Transfers
            </button>
          </div>
        </div>
      )}

      {/* Add Recipient Modal */}
      <AddRecipientModal
        isOpen={isAddRecipientOpen}
        onClose={() => setIsAddRecipientOpen(false)}
        onRecipientAdded={(rec) => {
          setSelectedRecipientId(rec.id);
          fetchRecipients();
        }}
      />
    </div>
  );
};
