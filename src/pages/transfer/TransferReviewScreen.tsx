import React from 'react';
import { useNavigate } from 'react-router-dom';
import { ArrowLeft, ShieldCheck, Clock, CheckCircle2 } from 'lucide-react';
import { useTransferStore } from '../../store/useTransferStore';

export const TransferReviewScreen: React.FC = () => {
  const navigate = useNavigate();
  const {
    amount,
    beneficiaryName,
    selectedAccount,
    reference
  } = useTransferStore();

  const handleContinue = () => {
    navigate('/transfer/authorize');
  };

  const handleBack = () => {
    navigate('/transfer/reference');
  };

  const formattedAmount = `$${amount.toLocaleString('en-US', {
    minimumFractionDigits: 2,
    maximumFractionDigits: 2
  })}`;

  const fromAccountDisplay = selectedAccount
    ? `${selectedAccount.name} ••••${selectedAccount.last4}`
    : 'Everyday Checking ••••0397';

  const referenceDisplay = reference.trim() || 'Payment';

  return (
    <div className="w-full max-w-md mx-auto p-4 sm:p-6 flex flex-col min-h-[580px] justify-between">
      {/* Top Header */}
      <div>
        <div className="flex items-center justify-between mb-6">
          <button
            type="button"
            onClick={handleBack}
            className="p-2 -ml-2 text-slate-600 dark:text-slate-300 hover:text-slate-900 dark:hover:text-white rounded-full hover:bg-slate-100 dark:hover:bg-slate-800 transition-colors cursor-pointer"
            aria-label="Back"
          >
            <ArrowLeft className="w-5 h-5" />
          </button>
          <h1 className="text-lg font-bold text-slate-900 dark:text-white tracking-tight">
            Send money
          </h1>
          <div className="w-8" />
        </div>

        {/* Section: Review */}
        <div className="mb-4">
          <h2 className="text-xl font-extrabold text-slate-900 dark:text-white tracking-tight">
            Review
          </h2>
          <p className="text-xs text-slate-500 dark:text-slate-400 mt-1">
            Check the payment details before authorizing
          </p>
        </div>

        {/* Review Card with Structured Rows */}
        <div className="bg-white dark:bg-slate-900 rounded-2xl border border-slate-200 dark:border-slate-800 shadow-sm overflow-hidden divide-y divide-slate-100 dark:divide-slate-800/80">
          {/* Row 1: To */}
          <div className="flex items-center justify-between p-4">
            <span className="text-xs sm:text-sm text-slate-500 dark:text-slate-400 font-medium">
              To:
            </span>
            <div className="flex items-center gap-2">
              <div className="w-5 h-5 rounded-full bg-red-600 text-white flex items-center justify-center font-bold text-[10px] uppercase">
                {beneficiaryName ? beneficiaryName.charAt(0) : 'J'}
              </div>
              <span className="text-sm sm:text-base font-bold text-slate-900 dark:text-white capitalize">
                {beneficiaryName || 'johnny'}
              </span>
            </div>
          </div>

          {/* Row 2: Amount */}
          <div className="flex items-center justify-between p-4">
            <span className="text-xs sm:text-sm text-slate-500 dark:text-slate-400 font-medium">
              Amount:
            </span>
            <span className="text-sm sm:text-base font-bold text-slate-900 dark:text-white font-mono">
              {formattedAmount}
            </span>
          </div>

          {/* Row 3: Fee */}
          <div className="flex items-center justify-between p-4">
            <span className="text-xs sm:text-sm text-slate-500 dark:text-slate-400 font-medium">
              Fee:
            </span>
            <span className="text-xs sm:text-sm font-semibold text-emerald-600 dark:text-emerald-400 flex items-center gap-1">
              <CheckCircle2 className="w-3.5 h-3.5" />
              <span>No fee</span>
            </span>
          </div>

          {/* Row 4: Total */}
          <div className="flex items-center justify-between p-4 bg-slate-50/60 dark:bg-slate-800/30">
            <span className="text-xs sm:text-sm text-slate-700 dark:text-slate-300 font-bold">
              Total:
            </span>
            <span className="text-base sm:text-lg font-extrabold text-slate-900 dark:text-white font-mono">
              {formattedAmount}
            </span>
          </div>

          {/* Row 5: Currency */}
          <div className="flex items-center justify-between p-4">
            <span className="text-xs sm:text-sm text-slate-500 dark:text-slate-400 font-medium">
              Currency:
            </span>
            <span className="text-xs sm:text-sm font-bold text-slate-800 dark:text-slate-200">
              USD
            </span>
          </div>

          {/* Row 6: From */}
          <div className="flex items-center justify-between p-4">
            <span className="text-xs sm:text-sm text-slate-500 dark:text-slate-400 font-medium">
              From:
            </span>
            <span className="text-xs sm:text-sm font-semibold text-slate-900 dark:text-white text-right">
              {fromAccountDisplay}
            </span>
          </div>

          {/* Row 7: Reference */}
          <div className="flex items-center justify-between p-4">
            <span className="text-xs sm:text-sm text-slate-500 dark:text-slate-400 font-medium">
              Reference:
            </span>
            <span className="text-xs sm:text-sm font-semibold text-slate-800 dark:text-slate-200 text-right max-w-[200px] truncate">
              {referenceDisplay}
            </span>
          </div>

          {/* Row 8: Arrives */}
          <div className="flex items-center justify-between p-4">
            <span className="text-xs sm:text-sm text-slate-500 dark:text-slate-400 font-medium">
              Arrives:
            </span>
            <span className="text-xs sm:text-sm font-semibold text-slate-700 dark:text-slate-300 flex items-center gap-1.5">
              <Clock className="w-3.5 h-3.5 text-blue-500" />
              <span>Next business day</span>
            </span>
          </div>
        </div>

        {/* Security badge note */}
        <div className="mt-4 flex items-center justify-center gap-1.5 text-xs text-slate-500 dark:text-slate-400">
          <ShieldCheck className="w-4 h-4 text-emerald-500" />
          <span>Protected by 256-bit institutional encryption</span>
        </div>
      </div>

      {/* Button: [Continue to authorize - red] */}
      <div className="pt-6 border-t border-slate-200/80 dark:border-slate-800 space-y-2">
        <button
          type="button"
          onClick={handleContinue}
          className="w-full py-3.5 px-6 rounded-xl bg-red-600 hover:bg-red-700 active:bg-red-800 text-white font-bold text-sm shadow-md shadow-red-600/25 transition-all flex items-center justify-center min-h-[48px] cursor-pointer hover:brightness-105 active:scale-[0.98]"
        >
          Continue to authorize
        </button>
        <button
          type="button"
          onClick={handleBack}
          className="w-full py-2.5 text-xs text-slate-500 hover:text-slate-800 dark:hover:text-slate-300 transition-colors font-medium text-center cursor-pointer"
        >
          Edit details
        </button>
      </div>
    </div>
  );
};

export default TransferReviewScreen;
