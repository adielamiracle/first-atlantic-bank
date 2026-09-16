import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import {
  ArrowLeft,
  ShieldCheck,
  KeyRound,
  FileCheck2,
  Sparkles,
  AlertCircle,
  HelpCircle,
  Info,
  CheckCircle2
} from 'lucide-react';
import { useTransferStore } from '../../store/useTransferStore';

export const TransferCodesScreen: React.FC = () => {
  const navigate = useNavigate();
  const {
    cotCode,
    imfCode,
    taxCode,
    amlCode,
    setClearanceCodes,
    autoFillDemoCodes,
    beneficiaryName,
    amount
  } = useTransferStore();

  const [localCot, setLocalCot] = useState(cotCode || 'COT-7849');
  const [localImf, setLocalImf] = useState(imfCode || 'IMF-9921');
  const [localTax, setLocalTax] = useState(taxCode || 'TAX-8842');
  const [localAml, setLocalAml] = useState(amlCode || 'AML-1094');
  const [error, setError] = useState<string | null>(null);
  const [showTooltip, setShowTooltip] = useState<string | null>(null);

  const handleAutoFill = () => {
    setLocalCot('COT-7849');
    setLocalImf('IMF-9921');
    setLocalTax('TAX-8842');
    setLocalAml('AML-1094');
    autoFillDemoCodes();
    setError(null);
  };

  const handleContinue = () => {
    if (!localCot.trim()) {
      setError('Please enter the Cost of Transfer (COT) Code.');
      return;
    }
    if (!localImf.trim()) {
      setError('Please enter the International Monetary Fund (IMF) Code.');
      return;
    }
    if (!localTax.trim()) {
      setError('Please enter the Tax Clearance Code (TCC).');
      return;
    }

    setClearanceCodes({
      cotCode: localCot.trim(),
      imfCode: localImf.trim(),
      taxCode: localTax.trim(),
      amlCode: localAml.trim() || 'AML-1094'
    });

    navigate('/transfer/review');
  };

  const handleBack = () => {
    navigate('/transfer/account');
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
            aria-label="Back"
          >
            <ArrowLeft className="w-5 h-5" />
          </button>
          <span className="text-xs font-semibold uppercase tracking-wider text-slate-400">Step 4 of 5</span>
          <div className="w-7" />
        </div>

        <div className="flex items-center justify-between mb-2">
          <h1 className="text-2xl font-bold text-white tracking-tight">Clearance Codes</h1>
          <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-[10px] font-bold bg-amber-500/20 text-amber-300 border border-amber-500/40">
            <ShieldCheck className="w-3 h-3 text-amber-400" />
            Clearance Protocol
          </span>
        </div>

        <p className="text-xs text-slate-400 mb-4 leading-relaxed">
          Federal Reserve &amp; SWIFT international protocols mandate security clearance codes for wire transfers of{' '}
          <span className="font-semibold text-white font-mono">${amount.toLocaleString('en-US', { minimumFractionDigits: 2 })}</span> to{' '}
          <span className="font-semibold text-white capitalize">{beneficiaryName || 'beneficiary'}</span>.
        </p>

        {/* Quick Pre-fill / Auto-Generate Helper Box */}
        <div className="mb-4 p-3 rounded-xl bg-blue-950/40 border border-blue-600/30 flex items-center justify-between gap-2">
          <div className="flex items-center gap-2">
            <div className="w-7 h-7 rounded-lg bg-blue-600/30 flex items-center justify-center text-blue-400 shrink-0">
              <Sparkles className="w-3.5 h-3.5" />
            </div>
            <div className="text-[11px]">
              <div className="font-semibold text-blue-200">Institutional Demo Mode</div>
              <div className="text-blue-300/80 text-[10px]">Auto-generate valid security codes with 1 click</div>
            </div>
          </div>
          <button
            type="button"
            onClick={handleAutoFill}
            className="px-2.5 py-1.5 rounded-lg bg-blue-600 hover:bg-blue-500 text-white font-bold text-[11px] shadow-sm transition-all shrink-0 cursor-pointer"
          >
            Pre-Fill Codes
          </button>
        </div>

        {/* Clearance Codes Input Fields */}
        <div className="space-y-3">
          {/* 1. COT Code */}
          <div className="p-3 bg-slate-950/80 rounded-xl border border-slate-800">
            <div className="flex items-center justify-between mb-1.5">
              <label className="text-xs font-semibold text-slate-200 flex items-center gap-1.5">
                <KeyRound className="w-3.5 h-3.5 text-blue-400" />
                <span>COT Code (Cost of Transfer)</span>
              </label>
              <button
                type="button"
                onClick={() => setShowTooltip(showTooltip === 'COT' ? null : 'COT')}
                className="text-[10px] text-slate-400 hover:text-slate-200 cursor-pointer flex items-center gap-0.5"
              >
                <HelpCircle className="w-3 h-3" />
                <span>What is this?</span>
              </button>
            </div>
            {showTooltip === 'COT' && (
              <div className="mb-2 p-2 rounded-lg bg-slate-900 border border-slate-700 text-[10px] text-slate-300">
                The Cost of Transfer (COT) Code certifies that transaction levies and routing surcharges have been satisfied by the sending depository.
              </div>
            )}
            <div className="relative">
              <input
                type="text"
                placeholder="e.g. COT-7849"
                value={localCot}
                onChange={(e) => setLocalCot(e.target.value.toUpperCase())}
                className="w-full px-3.5 py-2.5 bg-slate-900 border border-slate-700 rounded-xl text-xs sm:text-sm font-mono text-white placeholder-slate-500 outline-none focus:border-blue-500 focus:ring-1 focus:ring-blue-500 tracking-wider"
              />
              {localCot.length >= 4 && (
                <CheckCircle2 className="w-4 h-4 text-emerald-400 absolute right-3 top-3" />
              )}
            </div>
          </div>

          {/* 2. IMF Code */}
          <div className="p-3 bg-slate-950/80 rounded-xl border border-slate-800">
            <div className="flex items-center justify-between mb-1.5">
              <label className="text-xs font-semibold text-slate-200 flex items-center gap-1.5">
                <FileCheck2 className="w-3.5 h-3.5 text-emerald-400" />
                <span>IMF Code (International Monetary Fund)</span>
              </label>
              <button
                type="button"
                onClick={() => setShowTooltip(showTooltip === 'IMF' ? null : 'IMF')}
                className="text-[10px] text-slate-400 hover:text-slate-200 cursor-pointer flex items-center gap-0.5"
              >
                <HelpCircle className="w-3 h-3" />
                <span>What is this?</span>
              </button>
            </div>
            {showTooltip === 'IMF' && (
              <div className="mb-2 p-2 rounded-lg bg-slate-900 border border-slate-700 text-[10px] text-slate-300">
                The International Monetary Fund (IMF) Clearance Code confirms global liquidity clearance and anti-inflationary remittance compliance.
              </div>
            )}
            <div className="relative">
              <input
                type="text"
                placeholder="e.g. IMF-9921"
                value={localImf}
                onChange={(e) => setLocalImf(e.target.value.toUpperCase())}
                className="w-full px-3.5 py-2.5 bg-slate-900 border border-slate-700 rounded-xl text-xs sm:text-sm font-mono text-white placeholder-slate-500 outline-none focus:border-blue-500 focus:ring-1 focus:ring-blue-500 tracking-wider"
              />
              {localImf.length >= 4 && (
                <CheckCircle2 className="w-4 h-4 text-emerald-400 absolute right-3 top-3" />
              )}
            </div>
          </div>

          {/* 3. Tax Clearance Code (TCC) */}
          <div className="p-3 bg-slate-950/80 rounded-xl border border-slate-800">
            <div className="flex items-center justify-between mb-1.5">
              <label className="text-xs font-semibold text-slate-200 flex items-center gap-1.5">
                <ShieldCheck className="w-3.5 h-3.5 text-amber-400" />
                <span>Tax Clearance Code (TCC / Tax Certificate)</span>
              </label>
              <button
                type="button"
                onClick={() => setShowTooltip(showTooltip === 'TAX' ? null : 'TAX')}
                className="text-[10px] text-slate-400 hover:text-slate-200 cursor-pointer flex items-center gap-0.5"
              >
                <HelpCircle className="w-3 h-3" />
                <span>What is this?</span>
              </button>
            </div>
            {showTooltip === 'TAX' && (
              <div className="mb-2 p-2 rounded-lg bg-slate-900 border border-slate-700 text-[10px] text-slate-300">
                Verifies capital source withholding and inland tax compliance clearance under federal banking statutes.
              </div>
            )}
            <div className="relative">
              <input
                type="text"
                placeholder="e.g. TAX-8842"
                value={localTax}
                onChange={(e) => setLocalTax(e.target.value.toUpperCase())}
                className="w-full px-3.5 py-2.5 bg-slate-900 border border-slate-700 rounded-xl text-xs sm:text-sm font-mono text-white placeholder-slate-500 outline-none focus:border-blue-500 focus:ring-1 focus:ring-blue-500 tracking-wider"
              />
              {localTax.length >= 4 && (
                <CheckCircle2 className="w-4 h-4 text-emerald-400 absolute right-3 top-3" />
              )}
            </div>
          </div>

          {/* 4. AML / Anti-Terrorism Clearance Code */}
          <div className="p-3 bg-slate-950/80 rounded-xl border border-slate-800">
            <div className="flex items-center justify-between mb-1.5">
              <label className="text-xs font-semibold text-slate-200 flex items-center gap-1.5">
                <KeyRound className="w-3.5 h-3.5 text-indigo-400" />
                <span>AML Clearance Code (Anti-Money Laundering)</span>
              </label>
              <span className="text-[10px] text-slate-400">Institutional Tier 1</span>
            </div>
            <div className="relative">
              <input
                type="text"
                placeholder="e.g. AML-1094"
                value={localAml}
                onChange={(e) => setLocalAml(e.target.value.toUpperCase())}
                className="w-full px-3.5 py-2.5 bg-slate-900 border border-slate-700 rounded-xl text-xs sm:text-sm font-mono text-white placeholder-slate-500 outline-none focus:border-blue-500 focus:ring-1 focus:ring-blue-500 tracking-wider"
              />
              {localAml.length >= 4 && (
                <CheckCircle2 className="w-4 h-4 text-emerald-400 absolute right-3 top-3" />
              )}
            </div>
          </div>
        </div>

        {error && (
          <div className="mt-3 p-2.5 rounded-xl bg-rose-950/50 border border-rose-800/60 flex items-center gap-2 text-rose-300 text-xs">
            <AlertCircle className="w-4 h-4 shrink-0" />
            <span>{error}</span>
          </div>
        )}
      </div>

      {/* Navigation Buttons: [Back] [Continue to Review] */}
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
          Validate &amp; Review
        </button>
      </div>
    </div>
  );
};

export default TransferCodesScreen;
