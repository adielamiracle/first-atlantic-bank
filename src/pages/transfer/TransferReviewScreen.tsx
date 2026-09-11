import React from 'react';
import { useNavigate } from 'react-router-dom';
import { ArrowLeft, ShieldCheck } from 'lucide-react';
import { useTransferStore } from '../../store/useTransferStore';

export const TransferReviewScreen: React.FC = () => {
  const navigate = useNavigate();
  const {
    amount,
    beneficiaryName,
    beneficiaryBank,
    selectedAccount
  } = useTransferStore();

  const handleContinue = () => {
    navigate('/transfer/authorize');
  };

  const handleBack = () => {
    navigate('/transfer/beneficiary');
  };

  const formattedAmount = `$${amount.toLocaleString('en-US', {
    minimumFractionDigits: 0,
    maximumFractionDigits: 2
  })}`;

  const fromAccountDisplay = selectedAccount
    ? `${selectedAccount.name} ••••${selectedAccount.last4}`
    : 'Savings ••••7461';

  const toDisplay = `${beneficiaryName || 'johnny mike'} - ${beneficiaryBank || 'Chase Bank'}`;

  return (
    <div className="w-full max-w-md mx-auto p-5 sm:p-6 flex flex-col min-h-[560px] justify-between text-slate-100">
      <div>
        {/* Header */}
        <div className="flex items-center justify-between mb-5">
          <button
            type="button"
            onClick={handleBack}
            className="p-2 -ml-2 rounded-full hover:bg-slate-800 text-slate-400 hover:text-white transition-colors"
            aria-label="Back"
          >
            <ArrowLeft className="w-5 h-5" />
          </button>
          <span className="text-xs font-semibold uppercase tracking-wider text-slate-400">Step 3 of 4</span>
          <div className="w-7" />
        </div>

        <h1 className="text-2xl font-bold text-white mb-1">Review transfer</h1>
        <p className="text-xs text-slate-400 mb-6">Confirm payment details before authorizing</p>

        {/* Large summary card */}
        <div className="bg-slate-800/80 border border-slate-700/80 rounded-2xl p-5 space-y-4">
          <div className="flex items-center justify-between py-1 border-b border-slate-700/60 pb-3">
            <span className="text-xs font-medium text-slate-400">To:</span>
            <span className="text-sm font-semibold text-white text-right truncate max-w-[220px]">
              {toDisplay}
            </span>
          </div>

          <div className="flex items-center justify-between py-1 border-b border-slate-700/60 pb-3">
            <span className="text-xs font-medium text-slate-400">Amount:</span>
            <span className="text-sm font-bold text-white font-mono">{formattedAmount}</span>
          </div>

          <div className="flex items-center justify-between py-1 border-b border-slate-700/60 pb-3">
            <span className="text-xs font-medium text-slate-400">Fee:</span>
            <span className="text-sm font-semibold text-emerald-400 font-mono">$0</span>
          </div>

          <div className="flex items-center justify-between py-1 border-b border-slate-700/60 pb-3">
            <span className="text-xs font-medium text-slate-400">Total:</span>
            <span className="text-base font-extrabold text-white font-mono">{formattedAmount}</span>
          </div>

          <div className="flex items-center justify-between py-1">
            <span className="text-xs font-medium text-slate-400">From:</span>
            <span className="text-sm font-semibold text-slate-200">{fromAccountDisplay}</span>
          </div>
        </div>

        <div className="mt-6 flex items-center gap-2 text-xs text-slate-400 justify-center">
          <ShieldCheck className="w-4 h-4 text-emerald-400 shrink-0" />
          <span>Protected with end-to-end institutional encryption</span>
        </div>
      </div>

      {/* Action Buttons */}
      <div className="pt-6 mt-4 border-t border-slate-800/80 flex items-center gap-3">
        <button
          type="button"
          onClick={handleBack}
          className="flex-1 py-3.5 px-4 rounded-xl font-medium text-slate-300 hover:bg-slate-800 border border-slate-700/80 transition-all text-center"
        >
          Back
        </button>
        <button
          type="button"
          onClick={handleContinue}
          className="flex-1 py-3.5 px-4 rounded-xl font-semibold text-white bg-blue-600 hover:bg-blue-500 active:scale-[0.99] transition-all shadow-lg shadow-blue-600/25 text-center"
        >
          Continue to Authorize
        </button>
      </div>
    </div>
  );
};

export default TransferReviewScreen;
