import React, { useState, useRef, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import {
  ArrowLeft,
  Lock,
  RefreshCw,
  AlertCircle,
  ShieldCheck,
  CheckCircle2,
  KeyRound,
  Sparkles
} from 'lucide-react';
import { useTransferStore } from '../../store/useTransferStore';

export const TransferAuthorizeScreen: React.FC = () => {
  const navigate = useNavigate();
  const {
    amount,
    senderName,
    beneficiaryName,
    beneficiaryAccount,
    beneficiaryBank,
    selectedAccount,
    cotCode,
    imfCode,
    taxCode,
    amlCode,
    pin,
    setPinDigit,
    setFullPin,
    clearPin,
    executeTransfer,
    isProcessing,
    error
  } = useTransferStore();

  const [localPin, setLocalPin] = useState<string[]>(pin || ['', '', '', '', '', '']);
  const [localError, setLocalError] = useState<string | null>(null);
  const inputRefs = useRef<(HTMLInputElement | null)[]>([]);

  useEffect(() => {
    // Focus first input box on mount
    if (inputRefs.current[0]) {
      inputRefs.current[0].focus();
    }
  }, []);

  const handleDigitChange = (index: number, val: string) => {
    const digit = val.replace(/[^0-9]/g, '').slice(-1);
    const updated = [...localPin];
    updated[index] = digit;
    setLocalPin(updated);
    setPinDigit(index, digit);
    setLocalError(null);

    // Auto-advance to next input if digit entered
    if (digit && index < 5) {
      inputRefs.current[index + 1]?.focus();
    }
  };

  const handleKeyDown = (index: number, e: React.KeyboardEvent<HTMLInputElement>) => {
    if (e.key === 'Backspace') {
      if (!localPin[index] && index > 0) {
        inputRefs.current[index - 1]?.focus();
      } else {
        const updated = [...localPin];
        updated[index] = '';
        setLocalPin(updated);
        setPinDigit(index, '');
      }
    } else if (e.key === 'ArrowLeft' && index > 0) {
      inputRefs.current[index - 1]?.focus();
    } else if (e.key === 'ArrowRight' && index < 5) {
      inputRefs.current[index + 1]?.focus();
    }
  };

  const handlePaste = (e: React.ClipboardEvent<HTMLInputElement>) => {
    e.preventDefault();
    const pasted = e.clipboardData.getData('text').replace(/[^0-9]/g, '').slice(0, 6);
    if (pasted.length > 0) {
      const updated = ['', '', '', '', '', ''];
      for (let i = 0; i < pasted.length; i++) {
        updated[i] = pasted[i];
      }
      setLocalPin(updated);
      setFullPin(updated);
      const focusIndex = Math.min(pasted.length, 5);
      inputRefs.current[focusIndex]?.focus();
    }
  };

  const handleUseDemoPin = () => {
    const demo = ['1', '2', '3', '4', '5', '6'];
    setLocalPin(demo);
    setFullPin(demo);
    setLocalError(null);
  };

  const handleConfirmAndSend = async () => {
    const enteredPin = localPin.join('');
    if (enteredPin.length < 6) {
      setLocalError('Please enter all 6 digits of your transaction PIN.');
      const firstEmpty = localPin.findIndex(d => !d);
      if (firstEmpty !== -1) {
        inputRefs.current[firstEmpty]?.focus();
      }
      return;
    }

    const result = await executeTransfer();
    if (result.success) {
      navigate('/transfer/success');
    } else {
      setLocalError(result.error || 'Payment authorization failed. Please try again.');
    }
  };

  const handleClear = () => {
    setLocalPin(['', '', '', '', '', '']);
    clearPin();
    setLocalError(null);
    inputRefs.current[0]?.focus();
  };

  const formattedAmount = `$${amount.toLocaleString('en-US', {
    minimumFractionDigits: 2,
    maximumFractionDigits: 2
  })}`;

  const isPinComplete = localPin.every(d => d !== '');

  return (
    <div className="w-full max-w-md mx-auto p-4 sm:p-6 flex flex-col min-h-[600px] justify-between text-slate-100 font-sans">
      <div>
        {/* Header */}
        <div className="flex items-center justify-between mb-4">
          <button
            type="button"
            onClick={() => navigate('/transfer/review')}
            className="p-2 -ml-2 rounded-full hover:bg-slate-800 text-slate-400 hover:text-white transition-colors cursor-pointer"
            aria-label="Back to review"
          >
            <ArrowLeft className="w-5 h-5" />
          </button>
          <span className="text-xs font-semibold uppercase tracking-wider text-slate-400">Final Step</span>
          <div className="w-7" />
        </div>

        {/* Lock Icon & Title */}
        <div className="text-center mb-6">
          <div className="w-14 h-14 bg-blue-950/60 border border-blue-600/40 rounded-2xl flex items-center justify-center mx-auto mb-3 text-blue-400 shadow-lg shadow-blue-950/50">
            <Lock className="w-6 h-6" />
          </div>
          <h1 className="text-2xl font-bold text-white mb-1 tracking-tight">Authorize &amp; Dispatch</h1>
          <p className="text-xs text-slate-400 max-w-xs mx-auto leading-relaxed">
            Enter your 6-digit transaction PIN to execute payment of{' '}
            <span className="font-semibold text-white font-mono">{formattedAmount}</span> to{' '}
            <span className="font-semibold text-white capitalize">{beneficiaryName || 'beneficiary'}</span>.
          </p>
        </div>

        {/* Clearance Verification Badge Summary */}
        <div className="mb-5 p-3 rounded-xl bg-slate-950/90 border border-slate-800 space-y-2">
          <div className="flex items-center justify-between text-[11px] pb-1.5 border-b border-slate-850">
            <span className="text-slate-400">Sender:</span>
            <span className="font-semibold text-white truncate max-w-[200px]">
              {senderName || 'Account Holder'} ({selectedAccount?.accountNumber ? `••••${selectedAccount.accountNumber.slice(-4)}` : '••••8821'})
            </span>
          </div>

          <div className="flex items-center justify-between text-[11px] pb-1.5 border-b border-slate-850">
            <span className="text-slate-400">Recipient:</span>
            <span className="font-semibold text-slate-200 truncate max-w-[200px]">
              {beneficiaryName} ({beneficiaryBank})
            </span>
          </div>

          <div className="pt-0.5 flex flex-wrap gap-1.5 items-center">
            <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-md text-[10px] font-mono font-semibold bg-emerald-950/60 text-emerald-300 border border-emerald-800/60">
              <CheckCircle2 className="w-2.5 h-2.5 text-emerald-400" />
              COT: {cotCode || 'COT-7849'}
            </span>
            <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-md text-[10px] font-mono font-semibold bg-emerald-950/60 text-emerald-300 border border-emerald-800/60">
              <CheckCircle2 className="w-2.5 h-2.5 text-emerald-400" />
              IMF: {imfCode || 'IMF-9921'}
            </span>
            <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-md text-[10px] font-mono font-semibold bg-emerald-950/60 text-emerald-300 border border-emerald-800/60">
              <CheckCircle2 className="w-2.5 h-2.5 text-emerald-400" />
              TAX: {taxCode || 'TAX-8842'}
            </span>
            <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-md text-[10px] font-mono font-semibold bg-emerald-950/60 text-emerald-300 border border-emerald-800/60">
              <CheckCircle2 className="w-2.5 h-2.5 text-emerald-400" />
              AML: {amlCode || 'AML-1094'}
            </span>
          </div>
        </div>

        {/* 6-Digit PIN Boxes */}
        <div className="my-4">
          <div className="flex justify-center items-center gap-2 sm:gap-3" onPaste={handlePaste}>
            {localPin.map((digit, idx) => (
              <input
                key={idx}
                ref={(el) => {
                  inputRefs.current[idx] = el;
                }}
                type="password"
                inputMode="numeric"
                maxLength={1}
                value={digit}
                onChange={(e) => handleDigitChange(idx, e.target.value)}
                onKeyDown={(e) => handleKeyDown(idx, e)}
                disabled={isProcessing}
                className={`w-11 h-13 sm:w-12 sm:h-14 text-center text-xl sm:text-2xl font-bold rounded-xl border bg-slate-900 outline-none transition-all font-mono ${
                  digit
                    ? 'border-blue-500 text-white bg-blue-950/40 shadow-sm'
                    : 'border-slate-700 text-slate-300 focus:border-blue-500'
                }`}
              />
            ))}
          </div>

          {/* Quick Helper Links: Clear & Use Demo PIN */}
          <div className="flex justify-center items-center gap-4 mt-3">
            <button
              type="button"
              onClick={handleUseDemoPin}
              disabled={isProcessing}
              className="text-xs text-blue-400 hover:text-blue-300 flex items-center gap-1 font-semibold transition-colors cursor-pointer"
            >
              <Sparkles className="w-3 h-3" />
              <span>Fill Default PIN (123456)</span>
            </button>
            <span className="text-slate-600">•</span>
            <button
              type="button"
              onClick={handleClear}
              disabled={isProcessing || localPin.every(d => !d)}
              className="text-xs text-slate-400 hover:text-white disabled:opacity-30 transition-colors cursor-pointer"
            >
              Clear
            </button>
          </div>

          {(localError || error) && (
            <div className="mt-3 flex items-center gap-1.5 text-xs text-rose-400 bg-rose-950/40 border border-rose-800/50 p-2.5 rounded-xl justify-center">
              <AlertCircle className="w-4 h-4 shrink-0" />
              <span>{localError || error}</span>
            </div>
          )}
        </div>
      </div>

      {/* Action Footer: [Cancel] [Confirm & Send] */}
      <div className="pt-4 border-t border-slate-800/80 flex items-center gap-3 mt-4">
        <button
          type="button"
          onClick={() => navigate('/transfer/review')}
          disabled={isProcessing}
          className="flex-1 py-3.5 px-4 rounded-xl font-medium text-slate-300 hover:bg-slate-800 border border-slate-700/80 transition-all text-center text-xs sm:text-sm cursor-pointer disabled:opacity-50"
        >
          Back
        </button>

        <button
          type="button"
          onClick={handleConfirmAndSend}
          disabled={isProcessing || !isPinComplete}
          className="flex-1 py-3.5 px-4 rounded-xl font-bold text-white bg-blue-600 hover:bg-blue-500 active:scale-[0.99] transition-all shadow-lg shadow-blue-600/25 text-center text-xs sm:text-sm cursor-pointer disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-2"
        >
          {isProcessing ? (
            <>
              <RefreshCw className="w-4 h-4 animate-spin" />
              <span>Dispatching Wire...</span>
            </>
          ) : (
            <>
              <Lock className="w-4 h-4" />
              <span>Confirm &amp; Send</span>
            </>
          )}
        </button>
      </div>
    </div>
  );
};

export default TransferAuthorizeScreen;
