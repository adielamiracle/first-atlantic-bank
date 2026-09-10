import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { Check, CheckCircle2, Copy, Download, Share2 } from 'lucide-react';
import { useTransferStore } from '../../store/useTransferStore';
import { useBank } from '../../context/BankContext';

export const TransferSuccessScreen: React.FC = () => {
  const navigate = useNavigate();
  const { setCurrentView } = useBank();
  const {
    completedTransaction,
    amount,
    beneficiaryName,
    selectedAccount,
    reference,
    resetTransfer
  } = useTransferStore();

  const [copied, setCopied] = useState(false);

  // Fallback defaults if accessed directly or reloaded
  const now = new Date();
  const defaultDateFormatted = now.toLocaleDateString('en-US', {
    day: 'numeric',
    month: 'short',
    year: 'numeric'
  }) + ', ' + now.toLocaleTimeString('en-US', {
    hour: 'numeric',
    minute: '2-digit',
    hour12: true
  });

  const displayAmount = completedTransaction?.amount ?? amount;
  const formattedAmount = `$${displayAmount.toLocaleString('en-US', {
    minimumFractionDigits: 2,
    maximumFractionDigits: 2
  })}`;

  const recipientName = completedTransaction?.recipient || beneficiaryName || 'johnny';
  const fromAccount = completedTransaction?.from || (selectedAccount ? `${selectedAccount.name} ••••${selectedAccount.last4}` : 'Everyday Checking ••••0397');
  const dateDisplay = completedTransaction?.date || defaultDateFormatted;
  const refDisplay = completedTransaction?.reference || reference || 'Rent for March';
  const txId = completedTransaction?.id || `tx_${Date.now()}_${Math.floor(1000 + Math.random() * 9000)}`;

  const handleCopyTxId = () => {
    navigator.clipboard?.writeText(txId);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  const handleViewActivity = () => {
    resetTransfer();
    setCurrentView('DASHBOARD_STATEMENTS');
    navigate('/');
  };

  const handleDone = () => {
    resetTransfer();
    setCurrentView('DASHBOARD_OVERVIEW');
    navigate('/');
  };

  return (
    <div className="w-full max-w-md mx-auto p-4 sm:p-6 flex flex-col min-h-[580px] justify-between">
      {/* Top Content: Big Green Checkmark & Amount */}
      <div>
        <div className="text-center pt-2 pb-5">
          {/* Big Green Checkmark */}
          <div className="w-16 h-16 rounded-full bg-emerald-100 dark:bg-emerald-950/60 text-emerald-600 dark:text-emerald-400 mx-auto flex items-center justify-center mb-4 ring-8 ring-emerald-50 dark:ring-emerald-950/30">
            <CheckCircle2 className="w-10 h-10 stroke-[2.5]" />
          </div>

          <h1 className="text-xl font-extrabold text-slate-900 dark:text-white tracking-tight">
            Payment sent
          </h1>

          <div className="text-3xl sm:text-4xl font-extrabold text-slate-900 dark:text-white font-mono tracking-tight mt-1">
            {formattedAmount}
          </div>
        </div>

        {/* Details Table */}
        <div className="bg-white dark:bg-slate-900 rounded-2xl border border-slate-200 dark:border-slate-800 shadow-sm overflow-hidden divide-y divide-slate-100 dark:divide-slate-800/80">
          {/* Recipient */}
          <div className="flex items-center justify-between p-3.5 sm:p-4">
            <span className="text-xs text-slate-500 dark:text-slate-400 font-medium">
              Recipient:
            </span>
            <span className="text-xs sm:text-sm font-bold text-slate-900 dark:text-white capitalize">
              {recipientName}
            </span>
          </div>

          {/* Amount */}
          <div className="flex items-center justify-between p-3.5 sm:p-4">
            <span className="text-xs text-slate-500 dark:text-slate-400 font-medium">
              Amount:
            </span>
            <span className="text-xs sm:text-sm font-bold text-slate-900 dark:text-white font-mono">
              {formattedAmount}
            </span>
          </div>

          {/* Fee */}
          <div className="flex items-center justify-between p-3.5 sm:p-4">
            <span className="text-xs text-slate-500 dark:text-slate-400 font-medium">
              Fee:
            </span>
            <span className="text-xs sm:text-sm font-semibold text-emerald-600 dark:text-emerald-400">
              No fee
            </span>
          </div>

          {/* Currency */}
          <div className="flex items-center justify-between p-3.5 sm:p-4">
            <span className="text-xs text-slate-500 dark:text-slate-400 font-medium">
              Currency:
            </span>
            <span className="text-xs sm:text-sm font-bold text-slate-800 dark:text-slate-200">
              USD
            </span>
          </div>

          {/* From */}
          <div className="flex items-center justify-between p-3.5 sm:p-4">
            <span className="text-xs text-slate-500 dark:text-slate-400 font-medium">
              From:
            </span>
            <span className="text-xs sm:text-sm font-semibold text-slate-900 dark:text-white text-right">
              {fromAccount}
            </span>
          </div>

          {/* Date */}
          <div className="flex items-center justify-between p-3.5 sm:p-4">
            <span className="text-xs text-slate-500 dark:text-slate-400 font-medium">
              Date:
            </span>
            <span className="text-xs sm:text-sm font-medium text-slate-800 dark:text-slate-200 text-right">
              {dateDisplay}
            </span>
          </div>

          {/* Reference */}
          <div className="flex items-center justify-between p-3.5 sm:p-4">
            <span className="text-xs text-slate-500 dark:text-slate-400 font-medium">
              Reference:
            </span>
            <span className="text-xs sm:text-sm font-medium text-slate-800 dark:text-slate-200 text-right max-w-[180px] truncate">
              {refDisplay}
            </span>
          </div>

          {/* Estimated delivery */}
          <div className="flex items-center justify-between p-3.5 sm:p-4">
            <span className="text-xs text-slate-500 dark:text-slate-400 font-medium">
              Estimated delivery:
            </span>
            <span className="text-xs sm:text-sm font-semibold text-slate-700 dark:text-slate-300">
              Next business day
            </span>
          </div>

          {/* Status: Completed [green pill] */}
          <div className="flex items-center justify-between p-3.5 sm:p-4">
            <span className="text-xs text-slate-500 dark:text-slate-400 font-medium">
              Status:
            </span>
            <span className="inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded-full text-xs font-semibold bg-emerald-100 dark:bg-emerald-950/60 text-emerald-800 dark:text-emerald-300 border border-emerald-200 dark:border-emerald-800">
              <span className="w-1.5 h-1.5 rounded-full bg-emerald-500 animate-pulse" />
              <span>Completed</span>
            </span>
          </div>

          {/* Transaction ID */}
          <div className="flex items-center justify-between p-3.5 sm:p-4 bg-slate-50/60 dark:bg-slate-800/30">
            <span className="text-xs text-slate-500 dark:text-slate-400 font-medium">
              Transaction ID:
            </span>
            <div className="flex items-center gap-2">
              <span className="text-xs font-mono font-medium text-slate-700 dark:text-slate-300">
                {txId}
              </span>
              <button
                type="button"
                onClick={handleCopyTxId}
                className="p-1 text-slate-400 hover:text-slate-700 dark:hover:text-slate-200 rounded cursor-pointer"
                title="Copy Transaction ID"
              >
                {copied ? <Check className="w-3.5 h-3.5 text-emerald-500" /> : <Copy className="w-3.5 h-3.5" />}
              </button>
            </div>
          </div>
        </div>
      </div>

      {/* 2 Buttons: [View activity] [Done - red] */}
      <div className="grid grid-cols-2 gap-3 pt-6 border-t border-slate-200/80 dark:border-slate-800">
        <button
          type="button"
          onClick={handleViewActivity}
          className="py-3.5 px-4 rounded-xl bg-slate-100 hover:bg-slate-200 active:bg-slate-300 dark:bg-slate-800 dark:hover:bg-slate-700 text-slate-700 dark:text-slate-200 font-semibold text-sm transition-all flex items-center justify-center min-h-[48px] cursor-pointer"
        >
          View activity
        </button>
        <button
          type="button"
          onClick={handleDone}
          className="py-3.5 px-4 rounded-xl bg-red-600 hover:bg-red-700 active:bg-red-800 text-white font-bold text-sm shadow-md shadow-red-600/20 transition-all flex items-center justify-center min-h-[48px] cursor-pointer hover:brightness-105 active:scale-[0.98]"
        >
          Done
        </button>
      </div>
    </div>
  );
};

export default TransferSuccessScreen;
