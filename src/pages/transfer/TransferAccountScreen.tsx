import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import {
  ArrowLeft,
  CheckCircle2,
  Circle,
  Building2,
  Wallet,
  UserCheck,
  FileText,
  ShieldCheck,
  Sparkles
} from 'lucide-react';
import { useTransferStore, TransferAccount } from '../../store/useTransferStore';

export const TransferAccountScreen: React.FC = () => {
  const navigate = useNavigate();
  const {
    accounts,
    selectedAccountId,
    setSelectedAccountId,
    senderName,
    setSenderName,
    reference,
    setReference,
    amount,
    beneficiaryName
  } = useTransferStore();

  const [localSenderName, setLocalSenderName] = useState(senderName || '');
  const [localRef, setLocalRef] = useState(reference || 'Personal Transfer & Settlement');
  const [error, setError] = useState<string | null>(null);

  const handleSelect = (accId: string) => {
    setSelectedAccountId(accId);
    setError(null);
  };

  const handleContinue = () => {
    if (!localSenderName.trim()) {
      setError('Please provide the sender account holder name.');
      return;
    }

    setSenderName(localSenderName.trim());
    setReference(localRef.trim() || 'Wire Transfer');
    navigate('/transfer/codes');
  };

  const handleBack = () => {
    navigate('/transfer/beneficiary');
  };

  const getAccountIcon = (type: string) => {
    switch (type.toLowerCase()) {
      case 'checking':
        return <Wallet className="w-5 h-5 text-blue-400" />;
      case 'savings':
        return <Building2 className="w-5 h-5 text-emerald-400" />;
      default:
        return <Building2 className="w-5 h-5 text-indigo-400" />;
    }
  };

  return (
    <div className="w-full max-w-md mx-auto p-4 sm:p-6 flex flex-col min-h-[600px] justify-between text-slate-100 font-sans">
      <div>
        {/* Top Header */}
        <div className="flex items-center justify-between mb-4">
          <button
            type="button"
            onClick={handleBack}
            className="p-2 -ml-2 rounded-full hover:bg-slate-800 text-slate-400 hover:text-white transition-colors cursor-pointer"
            aria-label="Back to recipient"
          >
            <ArrowLeft className="w-5 h-5" />
          </button>
          <span className="text-xs font-semibold uppercase tracking-wider text-slate-400">Step 3 of 5</span>
          <div className="w-7" />
        </div>

        <h1 className="text-2xl font-bold text-white mb-1 tracking-tight">Sender details &amp; account</h1>
        <p className="text-xs text-slate-400 mb-4">
          Confirm your sending account details and transfer memo for sending{' '}
          <span className="font-semibold text-white font-mono">${amount.toFixed(2)}</span> to{' '}
          <span className="font-semibold text-white capitalize">{beneficiaryName || 'beneficiary'}</span>.
        </p>

        {/* Sender Name Card */}
        <div className="bg-slate-950/80 border border-slate-800 rounded-2xl p-3.5 mb-4 space-y-3">
          <div className="flex items-center justify-between border-b border-slate-800/80 pb-2">
            <span className="text-xs font-semibold uppercase tracking-wider text-slate-300 flex items-center gap-1.5">
              <UserCheck className="w-3.5 h-3.5 text-blue-400" />
              Account Holder Name
            </span>
            <span className="inline-flex items-center gap-1 text-[10px] text-emerald-400 font-medium">
              <ShieldCheck className="w-3 h-3" />
              Verified Origin
            </span>
          </div>

          <div>
            <label className="block text-xs font-medium text-slate-300 mb-1">
              Sender Legal Name
            </label>
            <input
              type="text"
              placeholder="e.g. Legal Account Holder Name"
              value={localSenderName}
              onChange={(e) => setLocalSenderName(e.target.value)}
              className="w-full px-3.5 py-2.5 bg-slate-900 border border-slate-700/80 rounded-xl text-xs sm:text-sm text-white placeholder-slate-500 outline-none focus:border-blue-500 focus:ring-1 focus:ring-blue-500 transition-colors"
            />
          </div>

          <div>
            <label className="block text-xs font-medium text-slate-300 mb-1 flex items-center gap-1.5">
              <FileText className="w-3.5 h-3.5 text-slate-400" />
              <span>Transfer Purpose / Memo</span>
            </label>
            <input
              type="text"
              placeholder="e.g. Personal Transfer, Investment Capital, Invoice Settlement"
              value={localRef}
              onChange={(e) => setLocalRef(e.target.value)}
              className="w-full px-3.5 py-2.5 bg-slate-900 border border-slate-700/80 rounded-xl text-xs sm:text-sm text-white placeholder-slate-500 outline-none focus:border-blue-500 focus:ring-1 focus:ring-blue-500 transition-colors"
            />
          </div>
        </div>

        {/* Source Account Selection */}
        <div className="mb-2">
          <h2 className="text-xs font-bold uppercase tracking-wider text-slate-300 mb-2">
            Select Source Account to Debit
          </h2>

          <div className="space-y-2.5">
            {accounts.map((acc: TransferAccount) => {
              const isSelected = acc.id === selectedAccountId;
              const hasSufficient = acc.balance >= amount;

              return (
                <div
                  key={acc.id}
                  onClick={() => handleSelect(acc.id)}
                  className={`p-3.5 rounded-2xl border transition-all cursor-pointer flex items-center justify-between gap-3 ${
                    isSelected
                      ? 'border-blue-500 bg-blue-950/30 shadow-md shadow-blue-950/40'
                      : 'border-slate-800 bg-slate-950/60 hover:border-slate-700 hover:bg-slate-900/60'
                  }`}
                >
                  <div className="flex items-center gap-3 min-w-0">
                    <div className="w-10 h-10 rounded-xl bg-slate-900 border border-slate-800 flex items-center justify-center shrink-0">
                      {getAccountIcon(acc.type)}
                    </div>
                    <div className="min-w-0">
                      <div className="text-xs sm:text-sm font-bold text-white truncate">
                        {acc.name}
                      </div>
                      <div className="text-[11px] text-slate-400 font-mono">
                        Account: <span className="text-slate-200">{acc.accountNumber || `••••${acc.last4}`}</span>
                      </div>
                    </div>
                  </div>

                  <div className="flex items-center gap-2.5 shrink-0">
                    <div className="text-right">
                      <div className="text-xs sm:text-sm font-bold text-white font-mono">
                        ${acc.balance.toLocaleString('en-US', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}
                      </div>
                      {!hasSufficient ? (
                        <div className="text-[10px] text-amber-400 font-medium">
                          Insufficient
                        </div>
                      ) : (
                        <div className="text-[10px] text-emerald-400 font-medium">
                          Available
                        </div>
                      )}
                    </div>

                    <div className="shrink-0">
                      {isSelected ? (
                        <CheckCircle2 className="w-5 h-5 text-blue-500 fill-blue-500 text-slate-950" />
                      ) : (
                        <Circle className="w-5 h-5 text-slate-600" />
                      )}
                    </div>
                  </div>
                </div>
              );
            })}
          </div>
        </div>

        {error && (
          <p className="text-xs text-rose-400 bg-rose-950/40 border border-rose-900/50 p-2.5 rounded-xl mt-3">
            {error}
          </p>
        )}
      </div>

      {/* Navigation Footer */}
      <div className="pt-4 border-t border-slate-800/80 flex items-center gap-3 mt-4">
        <button
          type="button"
          onClick={handleBack}
          className="flex-1 py-3.5 px-4 rounded-xl font-medium text-slate-300 hover:bg-slate-800 border border-slate-700 transition-all text-center text-xs sm:text-sm cursor-pointer"
        >
          Back
        </button>
        <button
          type="button"
          onClick={handleContinue}
          className="flex-1 py-3.5 px-4 rounded-xl font-bold text-white bg-blue-600 hover:bg-blue-500 active:scale-[0.99] transition-all shadow-lg shadow-blue-600/25 text-center text-xs sm:text-sm cursor-pointer"
        >
          Continue to Clearance Codes
        </button>
      </div>
    </div>
  );
};

export default TransferAccountScreen;
