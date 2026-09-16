import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { Check, CheckCircle2, Copy, Download, ShieldCheck, FileCheck2, Building2, User } from 'lucide-react';
import { useTransferStore } from '../../store/useTransferStore';
import { useBank } from '../../context/BankContext';

export const TransferSuccessScreen: React.FC = () => {
  const navigate = useNavigate();
  const { setCurrentView } = useBank();
  const {
    completedTransaction,
    amount,
    senderName,
    beneficiaryName,
    beneficiaryBank,
    beneficiaryAccount,
    beneficiaryRouting,
    beneficiarySwift,
    selectedAccount,
    cotCode,
    imfCode,
    taxCode,
    amlCode,
    reference,
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

  const recipientName = completedTransaction?.recipient || beneficiaryName || 'Johnny Mike';
  const recipientBankName = completedTransaction?.recipientBank || beneficiaryBank || 'Chase Bank';
  const recipientAcct = completedTransaction?.recipientAccount || beneficiaryAccount || '4829104829';
  const recipientRoutingNum = completedTransaction?.recipientRouting || beneficiaryRouting || '021000021';
  const recipientSwiftCode = completedTransaction?.recipientSwift || beneficiarySwift || 'CHASUS33';
  const senderLegalName = completedTransaction?.senderName || senderName || 'Account Holder';
  const fromAccount = completedTransaction?.from || (selectedAccount ? `${selectedAccount.name} ••••${selectedAccount.last4}` : 'Primary Checking ••••8821');
  const dateDisplay = completedTransaction?.date || defaultDateFormatted;
  const txId = completedTransaction?.id || `TX-${Math.random().toString(36).substring(2, 9).toUpperCase()}`;

  const displayCot = completedTransaction?.cotCode || cotCode || 'COT-7849';
  const displayImf = completedTransaction?.imfCode || imfCode || 'IMF-9921';
  const displayTax = completedTransaction?.taxCode || taxCode || 'TAX-8842';
  const displayAml = completedTransaction?.amlCode || amlCode || 'AML-1094';

  const handleCopyTxId = () => {
    navigator.clipboard?.writeText(txId);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  const handleDownloadReceipt = () => {
    const receiptText = `
============================================================
              FIRST ATLANTIC BANK, N.A.
       OFFICIAL WIRE SETTLEMENT CERTIFICATE & RECEIPT
============================================================
Status:                COMPLETED & SETTLED
Transaction ID:        ${txId}
Fedwire Sequence:      FED-${txId.replace(/[^0-9A-Z]/g, '')}-NY
Execution Date:        ${dateDisplay}
Transfer Rail:         Fedwire / SWIFT MT103 Real-Time Network

---------------- SENDER ACCOUNT DETAILS ---------------------
Account Holder Name:   ${senderLegalName}
Originating Account:   ${fromAccount}
Originating Bank:      First Atlantic Bank, N.A. (Headquarters)
Routing Transit:       021000089

-------------- BENEFICIARY ACCOUNT DETAILS ------------------
Recipient Legal Name:  ${recipientName}
Destination Bank:      ${recipientBankName}
Account Number / IBAN: ${recipientAcct}
Routing / Sort Code:   ${recipientRoutingNum}
SWIFT / BIC Code:      ${recipientSwiftCode}

----------------- REGULATORY CLEARANCES ---------------------
COT Code:              ${displayCot} [VERIFIED]
IMF Code:              ${displayImf} [CLEARED]
Tax Clearance Code:    ${displayTax} [CERTIFIED]
AML Clearance Code:    ${displayAml} [PASSED]

----------------- SETTLEMENT BREAKDOWN ----------------------
Transfer Amount:       ${formattedAmount}
Institutional Fee:     $0.00 (VIP Waiver Applied)
Total Debited:         ${formattedAmount}
Memo / Reference:      ${reference || 'Personal Transfer & Settlement'}
============================================================
Authorized via 6-Digit Institutional Transaction PIN.
Thank you for banking with First Atlantic Bank.
============================================================
    `.trim();

    const element = document.createElement('a');
    const file = new Blob([receiptText], { type: 'text/plain' });
    element.href = URL.createObjectURL(file);
    element.download = `FirstAtlantic_Wire_Receipt_${txId}.txt`;
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
    <div className="w-full max-w-md mx-auto p-4 sm:p-6 flex flex-col min-h-[620px] justify-between text-slate-100 font-sans">
      <div>
        {/* Header with Green Check */}
        <div className="text-center pt-2 pb-4">
          <div className="w-16 h-16 rounded-full bg-emerald-950/60 border border-emerald-500/40 text-emerald-400 mx-auto flex items-center justify-center mb-2 shadow-lg shadow-emerald-950/50">
            <CheckCircle2 className="w-10 h-10 stroke-[2.5]" />
          </div>

          <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-[11px] font-bold bg-emerald-500/20 text-emerald-300 border border-emerald-500/40 mb-1.5">
            <ShieldCheck className="w-3.5 h-3.5 text-emerald-400" />
            Wire Dispatched &amp; Cleared
          </span>

          <h1 className="text-2xl font-bold text-white mb-0.5">
            Payment Sent {formattedAmount}
          </h1>
          <p className="text-xs text-slate-400">
            Funds debited and routed via Real-Time Sovereign Payment Network
          </p>
        </div>

        {/* Certificate Card */}
        <div className="bg-slate-950/90 border border-slate-800 rounded-2xl p-4 space-y-2.5 text-xs">
          {/* Recipient */}
          <div className="flex items-center justify-between py-1 border-b border-slate-800/80 pb-2">
            <span className="text-slate-400 flex items-center gap-1">
              <Building2 className="w-3 h-3 text-emerald-400" />
              Recipient:
            </span>
            <div className="text-right">
              <span className="font-semibold text-white block capitalize">{recipientName}</span>
              <span className="text-[10px] text-slate-400">{recipientBankName} • {recipientAcct}</span>
            </div>
          </div>

          {/* Sender */}
          <div className="flex items-center justify-between py-1 border-b border-slate-800/80 pb-2">
            <span className="text-slate-400 flex items-center gap-1">
              <User className="w-3 h-3 text-blue-400" />
              From Sender:
            </span>
            <div className="text-right">
              <span className="font-semibold text-slate-200 block">{senderLegalName}</span>
              <span className="text-[10px] text-slate-400">{fromAccount}</span>
            </div>
          </div>

          {/* Amount & Fee */}
          <div className="flex items-center justify-between py-1 border-b border-slate-800/80 pb-2">
            <span className="text-slate-400">Settled Amount:</span>
            <span className="font-bold text-white font-mono text-sm">
              {formattedAmount}
            </span>
          </div>

          <div className="flex items-center justify-between py-1 border-b border-slate-800/80 pb-2">
            <span className="text-slate-400">Wire Fee:</span>
            <span className="font-semibold text-emerald-400 font-mono">
              $0.00 (VIP Waiver)
            </span>
          </div>

          {/* Clearance Codes Stamps */}
          <div className="py-1.5 border-b border-slate-800/80">
            <span className="text-[10px] font-bold uppercase tracking-wider text-slate-400 block mb-1.5">
              Clearance &amp; Regulatory Stamps:
            </span>
            <div className="grid grid-cols-2 gap-1.5 text-[10px] font-mono">
              <div className="bg-slate-900 border border-slate-800 px-2 py-1 rounded flex items-center justify-between">
                <span className="text-slate-400">COT:</span>
                <span className="text-emerald-400 font-bold">{displayCot}</span>
              </div>
              <div className="bg-slate-900 border border-slate-800 px-2 py-1 rounded flex items-center justify-between">
                <span className="text-slate-400">IMF:</span>
                <span className="text-emerald-400 font-bold">{displayImf}</span>
              </div>
              <div className="bg-slate-900 border border-slate-800 px-2 py-1 rounded flex items-center justify-between">
                <span className="text-slate-400">TAX:</span>
                <span className="text-emerald-400 font-bold">{displayTax}</span>
              </div>
              <div className="bg-slate-900 border border-slate-800 px-2 py-1 rounded flex items-center justify-between">
                <span className="text-slate-400">AML:</span>
                <span className="text-emerald-400 font-bold">{displayAml}</span>
              </div>
            </div>
          </div>

          {/* Date & Status */}
          <div className="flex items-center justify-between py-1 border-b border-slate-800/80 pb-2">
            <span className="text-slate-400">Execution Date:</span>
            <span className="text-slate-300">
              {dateDisplay}
            </span>
          </div>

          <div className="flex items-center justify-between py-1 border-b border-slate-800/80 pb-2">
            <span className="text-slate-400">Status:</span>
            <span className="inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded-full text-[11px] font-semibold bg-emerald-950/60 text-emerald-300 border border-emerald-800">
              <span className="w-1.5 h-1.5 rounded-full bg-emerald-400 animate-pulse" />
              <span>Settled &amp; Delivered</span>
            </span>
          </div>

          {/* Transaction ID */}
          <div className="flex items-center justify-between pt-1">
            <span className="text-slate-400">Transaction ID:</span>
            <div className="flex items-center gap-2">
              <span className="font-mono font-medium text-slate-300 text-[11px]">
                {txId}
              </span>
              <button
                type="button"
                onClick={handleCopyTxId}
                className="p-1 text-slate-400 hover:text-white rounded transition-colors cursor-pointer"
                title="Copy Transaction ID"
              >
                {copied ? <Check className="w-3.5 h-3.5 text-emerald-400" /> : <Copy className="w-3.5 h-3.5" />}
              </button>
            </div>
          </div>
        </div>
      </div>

      {/* Buttons: [Download Receipt] [Done] */}
      <div className="grid grid-cols-2 gap-3 pt-4 border-t border-slate-800/80 mt-4">
        <button
          type="button"
          onClick={handleDownloadReceipt}
          className="py-3.5 px-4 rounded-xl bg-slate-800 hover:bg-slate-700 text-slate-200 font-semibold text-xs sm:text-sm border border-slate-700 transition-all flex items-center justify-center gap-2 cursor-pointer"
        >
          <Download className="w-4 h-4" />
          <span>Download Receipt</span>
        </button>
        <button
          type="button"
          onClick={handleDone}
          className="py-3.5 px-4 rounded-xl bg-blue-600 hover:bg-blue-500 text-white font-bold text-xs sm:text-sm transition-all shadow-lg shadow-blue-600/25 flex items-center justify-center cursor-pointer"
        >
          Done
        </button>
      </div>
    </div>
  );
};

export default TransferSuccessScreen;
