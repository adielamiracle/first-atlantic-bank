import React, { useState } from 'react';
import { useBank } from '../../context/BankContext';
import { CurrencyDisplay } from '../../components/common/CurrencyDisplay';
import {
  ArrowLeftRight,
  Globe,
  Building,
  ShieldCheck,
  CheckCircle2,
  AlertCircle,
  HelpCircle,
  RefreshCw,
  Lock,
  ArrowRight
} from 'lucide-react';
import { CurrencyCode } from '../../types';

export const TransfersPage: React.FC = () => {
  const {
    accounts,
    executeTransfer,
    executeExternalTransfer,
    rates,
    showToast,
    region
  } = useBank();

  const [transferMode, setTransferMode] = useState<'INTERNAL' | 'DOMESTIC' | 'INTERNATIONAL'>('INTERNAL');
  const [sourceAccountId, setSourceAccountId] = useState(accounts[0]?.id || '');
  const [destAccountId, setDestAccountId] = useState(accounts[1]?.id || '');
  const [amountStr, setAmountStr] = useState('5000');
  const [description, setDescription] = useState('');
  const [isProcessing, setIsProcessing] = useState(false);
  const [showConfirmModal, setShowConfirmModal] = useState(false);
  const [transferSuccess, setTransferSuccess] = useState<any>(null);

  // External Wire Recipient state
  const [recipientName, setRecipientName] = useState('Morgan Stanley Global Trust');
  const [recipientBank, setRecipientBank] = useState('JPMorgan Chase Bank, N.A.');
  const [recipientRouting, setRecipientRouting] = useState('021000021');
  const [recipientAccount, setRecipientAccount] = useState('991048201948');
  const [recipientCountry, setRecipientCountry] = useState('United States');
  const [destCurrency, setDestCurrency] = useState<CurrencyCode>('USD');

  const sourceAccount = accounts.find((a) => a.id === sourceAccountId) || accounts[0];
  const destAccount = accounts.find((a) => a.id === destAccountId) || accounts[1];

  const amountMinor = Math.round(parseFloat(amountStr || '0') * 100);

  // Calculate fees & conversion
  const wireFeeMinor = transferMode === 'DOMESTIC' ? 1500 : transferMode === 'INTERNATIONAL' ? 3500 : 0;
  const rate = (sourceAccount && rates?.[sourceAccount.currency]?.[destCurrency]) ?? 1.0;
  const estimatedConvertedAmount = Math.round(amountMinor * rate);

  const handleReview = (e: React.FormEvent) => {
    e.preventDefault();
    if (amountMinor <= 0) {
      showToast('ERROR', 'Invalid Amount', 'Please enter a valid transfer amount greater than zero.');
      return;
    }
    if (sourceAccount && sourceAccount.availableBalanceMinor < amountMinor + wireFeeMinor) {
      showToast('ERROR', 'Insufficient Funds', 'Transfer amount plus fees exceeds available balance.');
      return;
    }
    setShowConfirmModal(true);
  };

  const handleExecuteTransfer = async () => {
    setIsProcessing(true);
    try {
      if (transferMode === 'INTERNAL') {
        const res = await executeTransfer(
          sourceAccountId,
          destAccountId,
          amountMinor,
          description || `Transfer to ${destAccount?.name}`
        );
        if (res.success) {
          setTransferSuccess({
            type: 'INTERNAL',
            amountMinor,
            sourceAccount,
            destAccount
          });
          setShowConfirmModal(false);
        }
      } else {
        const res = await executeExternalTransfer(
          sourceAccountId,
          {
            name: recipientName,
            bankName: recipientBank,
            routingOrSortCode: recipientRouting,
            accountOrIban: recipientAccount,
            country: recipientCountry,
            currency: destCurrency
          },
          amountMinor,
          transferMode === 'DOMESTIC' ? 'WIRE_TRANSFER' : 'WIRE_TRANSFER',
          description
        );
        if (res.success) {
          setTransferSuccess({
            type: transferMode,
            amountMinor,
            sourceAccount,
            recipientName,
            feeMinor: res.feeMinor
          });
          setShowConfirmModal(false);
        }
      }
    } finally {
      setIsProcessing(false);
    }
  };

  return (
    <div className="max-w-4xl mx-auto space-y-6">
      {/* Title & Mode Switcher */}
      <div className="bg-white dark:bg-[#0a192f] rounded-2xl p-6 border border-slate-200 dark:border-[#1e3656] shadow-sm space-y-4 transition-colors">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
          <div>
            <h1 className="text-xl font-bold font-serif text-slate-900 dark:text-white">
              Payment &amp; Transfer Hub
            </h1>
            <p className="text-xs text-slate-500 dark:text-slate-400">
              Instant double-entry account transfers, domestic wires, and multi-currency international remittance.
            </p>
          </div>

          {/* Mode Tabs */}
          <div className="flex bg-slate-100 dark:bg-slate-800/80 p-1 rounded-xl border border-slate-200 dark:border-slate-700 text-xs font-semibold">
            <button
              onClick={() => {
                setTransferMode('INTERNAL');
                setTransferSuccess(null);
              }}
              className={`px-3 py-1.5 rounded-lg transition-all cursor-pointer ${
                transferMode === 'INTERNAL'
                  ? 'bg-white dark:bg-[#112a4a] text-slate-900 dark:text-white shadow-xs border border-transparent dark:border-[#c5a880]/30'
                  : 'text-slate-600 dark:text-slate-400 hover:text-slate-900 dark:hover:text-white'
              }`}
            >
              Between My Accounts
            </button>
            <button
              onClick={() => {
                setTransferMode('DOMESTIC');
                setTransferSuccess(null);
              }}
              className={`px-3 py-1.5 rounded-lg transition-all cursor-pointer ${
                transferMode === 'DOMESTIC'
                  ? 'bg-white dark:bg-[#112a4a] text-slate-900 dark:text-white shadow-xs border border-transparent dark:border-[#c5a880]/30'
                  : 'text-slate-600 dark:text-slate-400 hover:text-slate-900 dark:hover:text-white'
              }`}
            >
              Domestic Wire / ACH
            </button>
            <button
              onClick={() => {
                setTransferMode('INTERNATIONAL');
                setTransferSuccess(null);
              }}
              className={`px-3 py-1.5 rounded-lg transition-all cursor-pointer ${
                transferMode === 'INTERNATIONAL'
                  ? 'bg-white dark:bg-[#112a4a] text-slate-900 dark:text-white shadow-xs border border-transparent dark:border-[#c5a880]/30'
                  : 'text-slate-600 dark:text-slate-400 hover:text-slate-900 dark:hover:text-white'
              }`}
            >
              International SWIFT FX
            </button>
          </div>
        </div>
      </div>

      {transferSuccess ? (
        /* Success State */
        <div className="bg-white dark:bg-[#0a192f] rounded-2xl p-8 border border-emerald-200 dark:border-emerald-900/60 shadow-md text-center space-y-5 animate-in fade-in zoom-in-95 duration-200">
          <div className="w-16 h-16 rounded-full bg-emerald-50 dark:bg-emerald-950/60 text-emerald-600 dark:text-emerald-400 flex items-center justify-center mx-auto border border-emerald-200 dark:border-emerald-800">
            <CheckCircle2 className="w-10 h-10" />
          </div>

          <div className="space-y-1">
            <h2 className="text-xl font-bold font-serif text-slate-900 dark:text-white">Transfer Confirmed &amp; Dispatched</h2>
            <p className="text-xs text-slate-600 dark:text-slate-300">
              The transaction has been posted to your authoritative ledger and dispatched to the clearing network.
            </p>
          </div>

          <div className="max-w-md mx-auto bg-slate-50 dark:bg-slate-900/70 rounded-xl p-4 border border-slate-200 dark:border-slate-800 space-y-2 text-xs text-slate-700 dark:text-slate-300">
            <div className="flex justify-between">
              <span className="text-slate-500 dark:text-slate-400">Amount Sent:</span>
              <CurrencyDisplay
                amountMinor={transferSuccess.amountMinor}
                currency={sourceAccount?.currency || 'USD'}
                size="md"
                className="text-slate-900 dark:text-white"
              />
            </div>
            <div className="flex justify-between">
              <span className="text-slate-500 dark:text-slate-400">Source Account:</span>
              <span className="font-semibold text-slate-900 dark:text-white">{transferSuccess.sourceAccount?.name}</span>
            </div>
            <div className="flex justify-between">
              <span className="text-slate-500 dark:text-slate-400">Destination:</span>
              <span className="font-semibold text-slate-900 dark:text-white">
                {transferSuccess.type === 'INTERNAL'
                  ? transferSuccess.destAccount?.name
                  : transferSuccess.recipientName}
              </span>
            </div>
            <div className="flex justify-between">
              <span className="text-slate-500 dark:text-slate-400">Effective Date:</span>
              <span className="font-mono text-slate-900 dark:text-white">{new Date().toLocaleString()}</span>
            </div>
          </div>

          <button
            onClick={() => {
              setTransferSuccess(null);
              setAmountStr('');
            }}
            className="px-6 py-2.5 rounded-xl bg-[#0a192f] dark:bg-[#112a4a] text-white font-bold text-xs uppercase tracking-wider cursor-pointer border border-[#c5a880]/30"
          >
            Start Another Transfer
          </button>
        </div>
      ) : (
        /* Form */
        <form onSubmit={handleReview} className="bg-white dark:bg-[#0a192f] rounded-2xl p-7 border border-slate-200 dark:border-[#1e3656] shadow-sm space-y-6 transition-colors">
          {/* Source Account Selection */}
          <div className="space-y-2">
            <label className="block text-xs font-bold uppercase tracking-wider text-slate-700 dark:text-slate-300">
              From Account (Source of Funds)
            </label>
            <select
              value={sourceAccountId}
              onChange={(e) => setSourceAccountId(e.target.value)}
              className="w-full px-4 py-3 text-sm bg-slate-50 dark:bg-slate-900 border border-slate-300 dark:border-slate-700 rounded-xl text-slate-900 dark:text-slate-100 font-medium focus:bg-white dark:focus:bg-slate-900 focus:outline-none focus:border-[#c5a880]"
            >
              {accounts.map((acc) => (
                <option key={acc.id} value={acc.id}>
                  {acc.name} ({acc.accountNumber}) — Available: ${((acc.availableBalanceMinor || 0) / 100).toLocaleString('en-US', { minimumFractionDigits: 2 })} {acc.currency}
                </option>
              ))}
            </select>
          </div>

          {/* Destination Selection */}
          {transferMode === 'INTERNAL' ? (
            <div className="space-y-2">
              <label className="block text-xs font-bold uppercase tracking-wider text-slate-700 dark:text-slate-300">
                To Account (Internal First Atlantic Account)
              </label>
              <select
                value={destAccountId}
                onChange={(e) => setDestAccountId(e.target.value)}
                className="w-full px-4 py-3 text-sm bg-slate-50 dark:bg-slate-900 border border-slate-300 dark:border-slate-700 rounded-xl text-slate-900 dark:text-slate-100 font-medium focus:bg-white dark:focus:bg-slate-900 focus:outline-none focus:border-[#c5a880]"
              >
                {accounts
                  .filter((a) => a.id !== sourceAccountId)
                  .map((acc) => (
                    <option key={acc.id} value={acc.id}>
                      {acc.name} ({acc.accountNumber}) — {acc.currency}
                    </option>
                  ))}
              </select>
            </div>
          ) : (
            <div className="space-y-4 p-5 bg-slate-50 dark:bg-slate-900/60 rounded-xl border border-slate-200 dark:border-slate-800">
              <h3 className="text-xs font-bold uppercase tracking-wider text-slate-800 dark:text-slate-200 font-serif">
                External Beneficiary Details
              </h3>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div>
                  <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1">Beneficiary Legal Name</label>
                  <input
                    type="text"
                    required
                    value={recipientName}
                    onChange={(e) => setRecipientName(e.target.value)}
                    className="w-full px-3.5 py-2 text-xs bg-white dark:bg-slate-900 border border-slate-300 dark:border-slate-700 rounded-lg text-slate-900 dark:text-slate-100 focus:outline-none focus:border-[#c5a880]"
                  />
                </div>
                <div>
                  <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1">Beneficiary Bank Name</label>
                  <input
                    type="text"
                    required
                    value={recipientBank}
                    onChange={(e) => setRecipientBank(e.target.value)}
                    className="w-full px-3.5 py-2 text-xs bg-white dark:bg-slate-900 border border-slate-300 dark:border-slate-700 rounded-lg text-slate-900 dark:text-slate-100 focus:outline-none focus:border-[#c5a880]"
                  />
                </div>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div>
                  <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1">
                    {transferMode === 'DOMESTIC' ? 'ABA Routing Number (9 Digits)' : 'SWIFT / BIC Code'}
                  </label>
                  <input
                    type="text"
                    required
                    value={recipientRouting}
                    onChange={(e) => setRecipientRouting(e.target.value)}
                    className="w-full px-3.5 py-2 text-xs bg-white dark:bg-slate-900 border border-slate-300 dark:border-slate-700 rounded-lg text-slate-900 dark:text-slate-100 font-mono focus:outline-none focus:border-[#c5a880]"
                  />
                </div>
                <div>
                  <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1">
                    {transferMode === 'DOMESTIC' ? 'Account Number' : 'IBAN or International Account #'}
                  </label>
                  <input
                    type="text"
                    required
                    value={recipientAccount}
                    onChange={(e) => setRecipientAccount(e.target.value)}
                    className="w-full px-3.5 py-2 text-xs bg-white dark:bg-slate-900 border border-slate-300 dark:border-slate-700 rounded-lg text-slate-900 dark:text-slate-100 font-mono focus:outline-none focus:border-[#c5a880]"
                  />
                </div>
              </div>

              {transferMode === 'INTERNATIONAL' && (
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  <div>
                    <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1">Destination Currency</label>
                    <select
                      value={destCurrency}
                      onChange={(e) => setDestCurrency(e.target.value as CurrencyCode)}
                      className="w-full px-3.5 py-2 text-xs bg-white dark:bg-slate-900 border border-slate-300 dark:border-slate-700 rounded-lg text-slate-900 dark:text-slate-100 focus:outline-none focus:border-[#c5a880]"
                    >
                      <option value="USD">USD — US Dollar</option>
                      <option value="GBP">GBP — British Pound</option>
                      <option value="EUR">EUR — Euro</option>
                    </select>
                  </div>
                  <div>
                    <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1">Destination Country</label>
                    <input
                      type="text"
                      value={recipientCountry}
                      onChange={(e) => setRecipientCountry(e.target.value)}
                      className="w-full px-3.5 py-2 text-xs bg-white dark:bg-slate-900 border border-slate-300 dark:border-slate-700 rounded-lg text-slate-900 dark:text-slate-100 focus:outline-none focus:border-[#c5a880]"
                    />
                  </div>
                </div>
              )}
            </div>
          )}

          {/* Amount & Memo */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div>
              <label className="block text-xs font-bold uppercase tracking-wider text-slate-700 dark:text-slate-300 mb-1">
                Transfer Amount ({sourceAccount?.currency})
              </label>
              <div className="relative">
                <span className="absolute left-3.5 top-1/2 -translate-y-1/2 font-bold text-slate-500 font-serif">
                  {sourceAccount?.currency === 'USD' ? '$' : sourceAccount?.currency === 'GBP' ? '£' : '€'}
                </span>
                <input
                  type="number"
                  step="0.01"
                  required
                  value={amountStr}
                  onChange={(e) => setAmountStr(e.target.value)}
                  placeholder="0.00"
                  className="w-full pl-8 pr-4 py-2.5 text-base font-mono font-bold bg-slate-50 dark:bg-slate-900 border border-slate-300 dark:border-slate-700 rounded-xl text-slate-900 dark:text-white focus:bg-white dark:focus:bg-slate-900 focus:outline-none focus:border-[#c5a880]"
                />
              </div>
            </div>

            <div>
              <label className="block text-xs font-bold uppercase tracking-wider text-slate-700 dark:text-slate-300 mb-1">
                Memo / Reference (Optional)
              </label>
              <input
                type="text"
                value={description}
                onChange={(e) => setDescription(e.target.value)}
                placeholder="e.g. Escrow disbursement, family support"
                className="w-full px-3.5 py-2.5 text-xs bg-slate-50 dark:bg-slate-900 border border-slate-300 dark:border-slate-700 rounded-xl text-slate-900 dark:text-white focus:bg-white dark:focus:bg-slate-900 focus:outline-none focus:border-[#c5a880]"
              />
            </div>
          </div>

          {/* Live FX Calculation breakdown if applicable */}
          {transferMode === 'INTERNATIONAL' && sourceAccount && sourceAccount.currency !== destCurrency && (
            <div className="p-4 rounded-xl bg-amber-50/80 dark:bg-amber-950/40 border border-amber-200 dark:border-amber-900/60 text-xs text-amber-900 dark:text-amber-300 space-y-1.5 font-mono">
              <div className="flex justify-between">
                <span>Locked Spot Exchange Rate:</span>
                <span className="font-bold">1 {sourceAccount.currency} = {rate} {destCurrency}</span>
              </div>
              <div className="flex justify-between">
                <span>Estimated Recipient Receives:</span>
                <span className="font-bold">{destCurrency === 'GBP' ? '£' : destCurrency === 'EUR' ? '€' : '$'}{(estimatedConvertedAmount / 100).toLocaleString('en-US', { minimumFractionDigits: 2 })}</span>
              </div>
              <div className="flex justify-between text-slate-500 dark:text-slate-400 text-[11px]">
                <span>Institutional Wire Dispatch Fee:</span>
                <span>${(wireFeeMinor / 100).toFixed(2)} USD</span>
              </div>
            </div>
          )}

          <button
            type="submit"
            className="w-full py-3.5 rounded-xl bg-[#0a192f] dark:bg-[#112a4a] hover:bg-[#132d52] text-white font-bold text-xs uppercase tracking-widest transition-all shadow-md flex items-center justify-center gap-2 cursor-pointer border border-[#c5a880]/30"
          >
            <Lock className="w-3.5 h-3.5 text-[#d4af37]" />
            <span>Review &amp; Authorize Transfer</span>
          </button>
        </form>
      )}

      {/* Confirmation Modal */}
      {showConfirmModal && (
        <div className="fixed inset-0 z-50 bg-slate-900/70 backdrop-blur-xs flex items-center justify-center p-4">
          <div className="bg-white dark:bg-[#0a192f] rounded-2xl max-w-lg w-full p-6 sm:p-7 shadow-2xl border border-slate-200 dark:border-[#1e3656] space-y-5 animate-in fade-in zoom-in-95 duration-200 text-slate-900 dark:text-slate-100">
            <div className="flex items-center justify-between pb-3 border-b border-slate-100 dark:border-slate-800">
              <h3 className="text-base font-bold text-slate-900 dark:text-white font-serif">
                Authorize Financial Operation
              </h3>
              <button
                onClick={() => setShowConfirmModal(false)}
                className="text-slate-400 hover:text-slate-700 dark:hover:text-white text-xl font-bold p-1 cursor-pointer"
              >
                &times;
              </button>
            </div>

            <div className="space-y-2 text-center py-2">
              <span className="text-xs text-slate-500 dark:text-slate-400 uppercase font-bold tracking-wider">Total Debit Amount</span>
              <CurrencyDisplay
                amountMinor={amountMinor}
                currency={sourceAccount?.currency || 'USD'}
                size="2xl"
                className="text-slate-900 dark:text-white"
              />
              {wireFeeMinor > 0 && (
                <span className="text-xs text-slate-500 dark:text-slate-400 block">
                  + ${(wireFeeMinor / 100).toFixed(2)} institutional wire dispatch fee
                </span>
              )}
            </div>

            <div className="bg-slate-50 dark:bg-slate-900/70 rounded-xl p-4 border border-slate-200 dark:border-slate-800 text-xs text-slate-700 dark:text-slate-300 space-y-2 font-mono">
              <div className="flex justify-between">
                <span className="text-slate-500 dark:text-slate-400 font-sans">Debit Account:</span>
                <span className="font-bold text-slate-900 dark:text-white">{sourceAccount?.name}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-slate-500 dark:text-slate-400 font-sans">Credit Destination:</span>
                <span className="font-bold font-sans text-slate-900 dark:text-white">
                  {transferMode === 'INTERNAL' ? destAccount?.name : recipientName}
                </span>
              </div>
              <div className="flex justify-between">
                <span className="text-slate-500 dark:text-slate-400 font-sans">Clearing Rail:</span>
                <span className="font-bold text-slate-900 dark:text-white">
                  {transferMode === 'INTERNAL' ? 'FAB Internal Ledger' : region === 'US' ? 'Fedwire Real-Time' : 'CHAPS / Faster Payments'}
                </span>
              </div>
            </div>

            <div className="flex gap-3 pt-2">
              <button
                type="button"
                onClick={() => setShowConfirmModal(false)}
                className="flex-1 py-2.5 rounded-xl border border-slate-300 dark:border-slate-700 text-slate-700 dark:text-slate-300 font-semibold text-xs cursor-pointer hover:bg-slate-50 dark:hover:bg-slate-800"
              >
                Cancel
              </button>
              <button
                type="button"
                disabled={isProcessing}
                onClick={handleExecuteTransfer}
                className="flex-1 py-2.5 rounded-xl bg-[#0a192f] dark:bg-[#112a4a] hover:bg-[#132d52] text-white font-bold text-xs uppercase tracking-wider flex items-center justify-center gap-2 shadow-md cursor-pointer border border-[#c5a880]/30"
              >
                {isProcessing ? (
                  <RefreshCw className="w-4 h-4 animate-spin text-[#d4af37]" />
                ) : (
                  <>
                    <Lock className="w-3.5 h-3.5 text-[#d4af37]" />
                    <span>Authorize &amp; Execute</span>
                  </>
                )}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
