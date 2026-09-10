import React, { useState, useRef, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { ArrowLeft, Lock, RefreshCw, AlertCircle, ShieldCheck } from 'lucide-react';
import { useTransferStore } from '../../store/useTransferStore';

export const TransferAuthorizeScreen: React.FC = () => {
  const navigate = useNavigate();
  const {
    amount,
    beneficiaryName,
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

    // If last digit filled and all 6 present, optionally ready
    if (digit && index === 5 && updated.every(d => d !== '')) {
      // All 6 digits ready
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

  const handleConfirmAndSend = async () => {
    const enteredPin = localPin.join('');
    if (enteredPin.length < 6) {
      setLocalError('Please enter all 6 digits of your verification code.');
      // Focus first empty box
      const firstEmpty = localPin.findIndex(d => !d);
      if (firstEmpty !== -1) {
        inputRefs.current[firstEmpty]?.focus();
      }
      return;
    }

    // Logic: For demo, any 6 digits = success. Call /api/transfer
    const result = await executeTransfer();
    if (result.success) {
      navigate('/transfer/success');
    } else {
      setLocalError(result.error || 'Payment failed. Please try again.');
    }
  };

  const handleBack = () => {
    navigate('/transfer/review');
  };

  const formattedAmount = `$${amount.toLocaleString('en-US', {
    minimumFractionDigits: 2,
    maximumFractionDigits: 2
  })}`;

  const allFilled = localPin.every(d => d !== '');

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

        {/* Card: Authorise this payment */}
        <div className="bg-white dark:bg-slate-900 rounded-2xl border border-slate-200 dark:border-slate-800 p-6 sm:p-7 shadow-sm text-center">
          <div className="w-12 h-12 rounded-2xl bg-red-50 dark:bg-red-950/40 text-red-600 dark:text-red-400 mx-auto flex items-center justify-center mb-4 shadow-xs">
            <Lock className="w-6 h-6" />
          </div>

          <h2 className="text-xl font-extrabold text-slate-900 dark:text-white tracking-tight">
            Authorise this payment
          </h2>

          <p className="text-xs sm:text-sm text-slate-600 dark:text-slate-400 mt-2 leading-relaxed">
            Enter the 6 digit verification code to confirm <strong className="text-slate-900 dark:text-white font-mono">{formattedAmount}</strong> to <strong className="capitalize text-slate-900 dark:text-white">{beneficiaryName || 'johnny'}</strong>.
          </p>

          {/* 6 Boxes for PIN. Masked ****** */}
          <div className="flex items-center justify-center gap-2 sm:gap-3 my-7" onPaste={handlePaste}>
            {localPin.map((digit, idx) => (
              <input
                key={idx}
                ref={(el) => (inputRefs.current[idx] = el)}
                type="password"
                inputMode="numeric"
                maxLength={1}
                value={digit}
                onChange={(e) => handleDigitChange(idx, e.target.value)}
                onKeyDown={(e) => handleKeyDown(idx, e)}
                className={`w-11 h-13 sm:w-12 sm:h-14 text-center text-xl font-mono font-bold rounded-xl border transition-all focus:outline-none focus:ring-2 focus:ring-red-600 ${
                  digit
                    ? 'border-red-600 bg-red-50/30 dark:bg-red-950/20 text-slate-900 dark:text-white'
                    : 'border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-800/60 text-slate-900 dark:text-white'
                }`}
              />
            ))}
          </div>

          {/* Demo hint */}
          <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-slate-100 dark:bg-slate-800 text-[11px] text-slate-500 dark:text-slate-400 font-medium">
            <ShieldCheck className="w-3.5 h-3.5 text-emerald-500" />
            <span>Demo: Any 6 digits will authorize this payment</span>
          </div>

          {/* Error Message */}
          {(localError || error) && (
            <div className="mt-4 flex items-center justify-center gap-2 text-xs text-red-600 dark:text-red-400 bg-red-50 dark:bg-red-950/40 p-3 rounded-xl border border-red-200 dark:border-red-900/60 animate-in fade-in">
              <AlertCircle className="w-4 h-4 shrink-0" />
              <span>{localError || error}</span>
            </div>
          )}
        </div>
      </div>

      {/* Button: [Confirm and send] */}
      <div className="pt-6 border-t border-slate-200/80 dark:border-slate-800">
        <button
          type="button"
          onClick={handleConfirmAndSend}
          disabled={isProcessing}
          className="w-full py-3.5 px-6 rounded-xl bg-red-600 hover:bg-red-700 active:bg-red-800 text-white font-bold text-sm shadow-md shadow-red-600/25 transition-all flex items-center justify-center gap-2 min-h-[48px] cursor-pointer hover:brightness-105 active:scale-[0.98] disabled:opacity-75 disabled:cursor-not-allowed"
        >
          {isProcessing ? (
            <>
              <RefreshCw className="w-4 h-4 animate-spin text-white" />
              <span>Authorizing payment...</span>
            </>
          ) : (
            <span>Confirm and send</span>
          )}
        </button>
      </div>
    </div>
  );
};

export default TransferAuthorizeScreen;
