import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { Check, CheckCircle2, Copy, Download } from 'lucide-react';
import { useTransferStore } from '../../store/useTransferStore';
import { useBank } from '../../context/BankContext';

export const TransferSuccessScreen: React.FC = () => {
  const navigate = useNavigate();
  const { setCurrentView } = useBank();
  const {
    completedTransaction,
    amount,
    beneficiaryName,
    beneficiaryBank,
    selectedAccount,
    resetTransfer
  } = useTransferStore();

  const [copied, setCopied] = useState(false);

  // Fallback defaults
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

  const recipientName = completedTransaction?.recipient || beneficiaryName || 'johnny mike';
  const recipientBankName = completedTransaction?.recipientBank || beneficiaryBank || 'Chase Bank';
  const fromAccount = completedTransaction?.from || (selectedAccount ? `${selectedAccount.name} ••••${selectedAccount.last4}` : 'Savings ••••7461');
  const dateDisplay = completedTransaction?.date || defaultDateFormatted;
  const txId = completedTransaction?.id || `TX-${Math.random().toString(36).substring(2, 9).toUpperCase()}`;

  const handleCopyTxId = () => {
    navigator.clipboard?.writeText(txId);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  const handleDownloadReceipt = () => {
    const receiptText = `
========================================
       FIRST ATLANTIC BANK RECEIPT
========================================
Status: Completed
Transaction ID: ${txId}
Date: ${dateDisplay}

Recipient: ${recipientName} (${recipientBankName})
From Account: ${fromAccount}
Transfer Amount: ${formattedAmount}
Transfer Fee: $0.00
Total Settled: ${formattedAmount}

Rail: Real-Time Sovereign Payment Network
Authorization: Verified via 6-Digit Institutional PIN
========================================
Thank you for banking with First Atlantic Bank.
    `.trim();

    const element = document.createElement('a');
    const file = new Blob([receiptText], { type: 'text/plain' });
    element.href = URL.createObjectURL(file);
    element.download = `FirstAtlantic_Receipt_${txId}.txt`;
    document.body.appendChild(element);
    element.click();
    document.body.removeChild(element);
  };

  const handleDone = () => {
    resetTransfer();
    setCurrentView('DASHBOARD_OVERVIEW');
    navigate('/');
  };

  return (
    <div className="w-full max-w-md mx-auto p-5 sm:p-6 flex flex-col min-h-[580px] justify-between text-slate-100">
      <div>
        {/* Big Green Check & Header */}
        <div className="text-center pt-2 pb-5">
          <div className="w-16 h-16 rounded-full bg-emerald-950/60 border border-emerald-500/40 text-emerald-400 mx-auto flex items-center justify-center mb-3">
            <CheckCircle2 className="w-10 h-10 stroke-[2.5]" />
          </div>

          <h1 className="text-2xl font-bold text-white mb-1">
            Payment Sent {formattedAmount}
          </h1>
          <p className="text-xs text-slate-400">
            Funds have been debited and routed to recipient
          </p>
        </div>

        {/* Details Table Card */}
        <div className="bg-slate-800/80 border border-slate-700/80 rounded-2xl p-4 space-y-3">
          <div className="flex items-center justify-between py-1 border-b border-slate-700/60 pb-2.5">
            <span className="text-xs text-slate-400">To:</span>
            <span className="text-xs sm:text-sm font-semibold text-white text-right truncate max-w-[200px]">
              {recipientName} ({recipientBankName})
            </span>
          </div>

          <div className="flex items-center justify-between py-1 border-b border-slate-700/60 pb-2.5">
            <span className="text-xs text-slate-400">From:</span>
            <span className="text-xs sm:text-sm font-semibold text-slate-200">
              {fromAccount}
            </span>
          </div>

          <div className="flex items-center justify-between py-1 border-b border-slate-700/60 pb-2.5">
            <span className="text-xs text-slate-400">Amount:</span>
            <span className="text-xs sm:text-sm font-bold text-white font-mono">
              {formattedAmount}
            </span>
          </div>

          <div className="flex items-center justify-between py-1 border-b border-slate-700/60 pb-2.5">
            <span className="text-xs text-slate-400">Fee:</span>
            <span className="text-xs sm:text-sm font-semibold text-emerald-400 font-mono">
              $0.00
            </span>
          </div>

          <div className="flex items-center justify-between py-1 border-b border-slate-700/60 pb-2.5">
            <span className="text-xs text-slate-400">Date:</span>
            <span className="text-xs text-slate-300">
              {dateDisplay}
            </span>
          </div>

          <div className="flex items-center justify-between py-1 border-b border-slate-700/60 pb-2.5">
            <span className="text-xs text-slate-400">Status:</span>
            <span className="inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded-full text-xs font-semibold bg-emerald-950/60 text-emerald-300 border border-emerald-800">
              <span className="w-1.5 h-1.5 rounded-full bg-emerald-400" />
              <span>Completed</span>
            </span>
          </div>

          {/* Transaction ID */}
          <div className="flex items-center justify-between pt-1">
            <span className="text-xs text-slate-400">Transaction ID:</span>
            <div className="flex items-center gap-2">
              <span className="text-xs font-mono font-medium text-slate-300">
                {txId}
              </span>
              <button
                type="button"
                onClick={handleCopyTxId}
                className="p-1 text-slate-400 hover:text-white rounded transition-colors"
                title="Copy Transaction ID"
              >
                {copied ? <Check className="w-3.5 h-3.5 text-emerald-400" /> : <Copy className="w-3.5 h-3.5" />}
              </button>
            </div>
          </div>
        </div>
      </div>

      {/* Buttons: [Download Receipt] [Done] */}
      <div className="grid grid-cols-2 gap-3 pt-6 border-t border-slate-800/80 mt-4">
        <button
          type="button"
          onClick={handleDownloadReceipt}
          className="py-3.5 px-4 rounded-xl bg-slate-800 hover:bg-slate-700 text-slate-200 font-semibold text-xs sm:text-sm border border-slate-700 transition-all flex items-center justify-center gap-2"
        >
          <Download className="w-4 h-4" />
          <span>Download Receipt</span>
        </button>
        <button
          type="button"
          onClick={handleDone}
          className="py-3.5 px-4 rounded-xl bg-blue-600 hover:bg-blue-500 text-white font-bold text-xs sm:text-sm transition-all shadow-lg shadow-blue-600/25 flex items-center justify-center"
        >
          Done
        </button>
      </div>
    </div>
  );
};

export default TransferSuccessScreen;
