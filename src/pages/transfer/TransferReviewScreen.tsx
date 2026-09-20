import React from 'react';
import { useNavigate } from 'react-router-dom';
import {
  ArrowLeft,
  ShieldCheck,
  Building2,
  User,
  KeyRound,
  FileText,
  CheckCircle2,
  Sparkles,
  Lock
} from 'lucide-react';
import { useTransferStore } from '../../store/useTransferStore';

export const TransferReviewScreen: React.FC = () => {
  const navigate = useNavigate();
  const {
    amount,
    senderName,
    selectedAccount,
    beneficiaryName,
    beneficiaryBank,
    beneficiaryAccount,
    beneficiaryRouting,
    beneficiarySwift,
    beneficiaryCountry,
    cotCode,
    imfCode,
    taxCode,
    amlCode,
    reference
  } = useTransferStore();

  const handleContinue = () => {
    navigate('/transfer/authorize');
  };

  const handleBack = () => {
    navigate('/transfer/codes');
  };

  const formattedAmount = `$${amount.toLocaleString('en-US', {
    minimumFractionDigits: 2,
    maximumFractionDigits: 2
  })}`;

  const fromAccountDisplay = selectedAccount
    ? `${selectedAccount.name} (${selectedAccount.accountNumber || `••••${selectedAccount.last4}`})`
    : 'Everyday Checking (••••7461)';

  return (
    <div className="w-full max-w-md mx-auto p-4 sm:p-6 flex flex-col min-h-[620px] justify-between text-slate-100 font-sans">
      <div>
        {/* Header */}
        <div className="flex items-center justify-between mb-4">
          <button
            type="button"
            onClick={handleBack}
            className="p-2 -ml-2 rounded-full hover:bg-slate-800 text-slate-400 hover:text-white transition-colors cursor-pointer"
            aria-label="Back"
          >
            <ArrowLeft className="w-5 h-5" />
          </button>
          <span className="text-xs font-semibold uppercase tracking-wider text-slate-400">Step 5 of 5</span>
          <div className="w-7" />
        </div>

        <h1 className="text-2xl font-bold text-white mb-1 tracking-tight">Review transfer &amp; clearance</h1>
        <p className="text-xs text-slate-400 mb-4">
          Verify sender, recipient, and security clearance authorization before dispatch
        </p>

        {/* Large Summary Card */}
        <div className="space-y-3">
          {/* Amount Badge Card */}
          <div className="p-4 rounded-2xl bg-blue-950/40 border border-blue-600/30 text-center">
            <span className="text-[11px] font-bold uppercase tracking-wider text-blue-300">Total Settlement Amount</span>
            <div className="text-3xl font-extrabold text-white font-mono mt-0.5 tracking-tight">
              {formattedAmount}
            </div>
            <div className="mt-1 flex items-center justify-center gap-2 text-[11px] text-blue-300/90">
              <span>Zero Wire Fee ($0.00 VIP)</span>
              <span>•</span>
              <span className="text-emerald-400 font-medium">Instant Fedwire Delivery</span>
            </div>
          </div>

          {/* Section 1: User & Sender Account Details */}
          <div className="bg-slate-950/80 border border-slate-800 rounded-2xl p-3.5 space-y-2.5">
            <div className="flex items-center justify-between border-b border-slate-800 pb-2">
              <span className="text-xs font-bold uppercase tracking-wider text-slate-300 flex items-center gap-1.5">
                <User className="w-3.5 h-3.5 text-blue-400" />
                Sender Account Details
              </span>
              <span className="text-[10px] text-emerald-400 font-medium flex items-center gap-1">
                <CheckCircle2 className="w-3 h-3" />
                Origin Cleared
              </span>
            </div>

            <div className="flex items-center justify-between text-xs">
              <span className="text-slate-400">Sender Legal Name:</span>
              <span className="font-semibold text-white">{senderName || 'Account Holder'}</span>
            </div>

            <div className="flex items-center justify-between text-xs">
              <span className="text-slate-400">Debit Account:</span>
              <span className="font-semibold text-slate-200">{fromAccountDisplay}</span>
            </div>

            <div className="flex items-center justify-between text-xs">
              <span className="text-slate-400">Bank Depository:</span>
              <span className="text-slate-300">First Atlantic Bank, N.A.</span>
            </div>

            {reference && (
              <div className="flex items-center justify-between text-xs pt-1 border-t border-slate-900">
                <span className="text-slate-400">Transfer Memo:</span>
                <span className="text-slate-300 italic truncate max-w-[180px]">{reference}</span>
              </div>
            )}
          </div>

          {/* Section 2: Beneficiary Account Details & Name */}
          <div className="bg-slate-950/80 border border-slate-800 rounded-2xl p-3.5 space-y-2.5">
            <div className="flex items-center justify-between border-b border-slate-800 pb-2">
              <span className="text-xs font-bold uppercase tracking-wider text-slate-300 flex items-center gap-1.5">
                <Building2 className="w-3.5 h-3.5 text-emerald-400" />
                Beneficiary Account Details
              </span>
              <span className="text-[10px] text-blue-400 font-semibold">{beneficiaryBank || 'Chase Bank'}</span>
            </div>

            <div className="flex items-center justify-between text-xs">
              <span className="text-slate-400">Recipient Full Name:</span>
              <span className="font-semibold text-white capitalize">{beneficiaryName || 'Recipient'}</span>
            </div>

            <div className="flex items-center justify-between text-xs">
              <span className="text-slate-400">Account Number / IBAN:</span>
              <span className="font-mono text-white font-semibold">{beneficiaryAccount || '4829104829'}</span>
            </div>

            <div className="flex items-center justify-between text-xs">
              <span className="text-slate-400">Routing / Sort Code:</span>
              <span className="font-mono text-slate-300">{beneficiaryRouting || '021000021'}</span>
            </div>

            <div className="flex items-center justify-between text-xs">
              <span className="text-slate-400">SWIFT / BIC:</span>
              <span className="font-mono text-slate-300">{beneficiarySwift || 'CHASUS33'}</span>
            </div>

            <div className="flex items-center justify-between text-xs">
              <span className="text-slate-400">Jurisdiction:</span>
              <span className="text-slate-300">{beneficiaryCountry || 'United States'}</span>
            </div>
          </div>

          {/* Section 3: Clearance Codes Verified */}
          <div className="bg-slate-950/80 border border-slate-800 rounded-2xl p-3.5 space-y-2">
            <div className="flex items-center justify-between border-b border-slate-800 pb-2">
              <span className="text-xs font-bold uppercase tracking-wider text-slate-300 flex items-center gap-1.5">
                <KeyRound className="w-3.5 h-3.5 text-amber-400" />
                Wire Clearance Verification
              </span>
              <span className="text-[10px] text-amber-400 font-bold uppercase">Authorized</span>
            </div>

            <div className="grid grid-cols-2 gap-2 text-[11px]">
              <div className="p-2 rounded-lg bg-slate-900 border border-slate-800 flex items-center justify-between">
                <div>
                  <span className="text-slate-400 block text-[10px]">COT Code:</span>
                  <span className="font-mono font-bold text-white">{cotCode || 'COT-7849'}</span>
                </div>
                <CheckCircle2 className="w-3.5 h-3.5 text-emerald-400" />
              </div>

              <div className="p-2 rounded-lg bg-slate-900 border border-slate-800 flex items-center justify-between">
                <div>
                  <span className="text-slate-400 block text-[10px]">IMF Code:</span>
                  <span className="font-mono font-bold text-white">{imfCode || 'IMF-9921'}</span>
                </div>
                <CheckCircle2 className="w-3.5 h-3.5 text-emerald-400" />
              </div>

              <div className="p-2 rounded-lg bg-slate-900 border border-slate-800 flex items-center justify-between">
                <div>
                  <span className="text-slate-400 block text-[10px]">Tax Clearance:</span>
                  <span className="font-mono font-bold text-white">{taxCode || 'TAX-8842'}</span>
                </div>
                <CheckCircle2 className="w-3.5 h-3.5 text-emerald-400" />
              </div>

              <div className="p-2 rounded-lg bg-slate-900 border border-slate-800 flex items-center justify-between">
                <div>
                  <span className="text-slate-400 block text-[10px]">AML Clearance:</span>
                  <span className="font-mono font-bold text-white">{amlCode || 'AML-1094'}</span>
                </div>
                <CheckCircle2 className="w-3.5 h-3.5 text-emerald-400" />
              </div>
            </div>
          </div>
        </div>

        <div className="mt-4 flex items-center gap-2 text-xs text-slate-400 justify-center">
          <ShieldCheck className="w-4 h-4 text-emerald-400 shrink-0" />
          <span>Secured by First Atlantic 256-bit institutional encryption</span>
        </div>
      </div>

      {/* Action Buttons */}
      <div className="pt-4 mt-4 border-t border-slate-800/80 flex items-center gap-3">
        <button
          type="button"
          onClick={handleBack}
          className="flex-1 py-3.5 px-4 rounded-xl font-medium text-slate-300 hover:bg-slate-800 border border-slate-700/80 transition-all text-center text-xs sm:text-sm cursor-pointer"
        >
          Back to Codes
        </button>
        <button
          type="button"
          onClick={handleContinue}
          className="flex-1 py-3.5 px-4 rounded-xl font-bold text-white bg-blue-600 hover:bg-blue-500 active:scale-[0.99] transition-all shadow-lg shadow-blue-600/25 text-center text-xs sm:text-sm cursor-pointer flex items-center justify-center gap-1.5"
        >
          <Lock className="w-4 h-4" />
          <span>Authorize with PIN</span>
        </button>
      </div>
    </div>
  );
};

export default TransferReviewScreen;
