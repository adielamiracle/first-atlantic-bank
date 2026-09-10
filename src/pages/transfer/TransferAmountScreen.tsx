import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { ArrowLeft, AlertCircle, User, ShieldCheck } from 'lucide-react';
import { useTransferStore } from '../../store/useTransferStore';
import { useBank } from '../../context/BankContext';

export const TransferAmountScreen: React.FC = () => {
  const navigate = useNavigate();
  const { setCurrentView } = useBank();
  const {
    amount,
    amountInput,
    availableBalance,
    beneficiaryName,
    setAmount,
    fetchAccountsAndBalance
  } = useTransferStore();

  const [localInput, setLocalInput] = useState(amountInput || (amount > 0 ? amount.toString() : ''));
  const [errorMessage, setErrorMessage] = useState<string | null>(null);

  useEffect(() => {
    fetchAccountsAndBalance();
  }, [fetchAccountsAndBalance]);

  // Synchronize local input if amount changed in store
  useEffect(() => {
    if (amountInput) {
      setLocalInput(amountInput);
    }
  }, [amountInput]);

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    let val = e.target.value;
    // Allow digits and single decimal point only
    val = val.replace(/[^0-9.]/g, '');
    const parts = val.split('.');
    if (parts.length > 2) {
      val = parts[0] + '.' + parts.slice(1).join('');
    }
    if (parts[1] && parts[1].length > 2) {
      val = parts[0] + '.' + parts[1].slice(0, 2);
    }

    setLocalInput(val);
    const parsed = parseFloat(val);

    if (val === '' || isNaN(parsed)) {
      setAmount(0, val);
      setErrorMessage(null);
    } else {
      setAmount(parsed, val);
      if (parsed > availableBalance) {
        setErrorMessage(`Amount exceeds available balance ($${availableBalance.toLocaleString('en-US', { minimumFractionDigits: 2, maximumFractionDigits: 2 })})`);
      } else {
        setErrorMessage(null);
      }
    }
  };

  const handleQuickAmount = (val: number) => {
    const str = val.toFixed(2);
    setLocalInput(str);
    setAmount(val, str);
    if (val > availableBalance) {
      setErrorMessage(`Amount exceeds available balance ($${availableBalance.toLocaleString('en-US', { minimumFractionDigits: 2, maximumFractionDigits: 2 })})`);
    } else {
      setErrorMessage(null);
    }
  };

  const handleContinue = () => {
    const num = parseFloat(localInput);
    if (!localInput || isNaN(num) || num <= 0) {
      setErrorMessage('Please enter a valid transfer amount.');
      return;
    }
    if (num > availableBalance) {
      setErrorMessage(`Amount exceeds available balance ($${availableBalance.toLocaleString('en-US', { minimumFractionDigits: 2, maximumFractionDigits: 2 })})`);
      return;
    }

    setAmount(num, num.toFixed(2));
    navigate('/transfer/account');
  };

  const handleBack = () => {
    setCurrentView('DASHBOARD_OVERVIEW');
    navigate('/');
  };

  const formattedBalance = availableBalance.toLocaleString('en-US', {
    minimumFractionDigits: 2,
    maximumFractionDigits: 2
  });

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

        {/* Recipient Pill / Chip */}
        <div className="flex items-center justify-center mb-8">
          <div className="inline-flex items-center gap-2 px-3.5 py-1.5 rounded-full bg-slate-100 dark:bg-slate-800/80 border border-slate-200 dark:border-slate-700 text-xs font-medium text-slate-700 dark:text-slate-200">
            <div className="w-5 h-5 rounded-full bg-red-600 text-white flex items-center justify-center font-bold text-[10px] uppercase">
              {beneficiaryName ? beneficiaryName.charAt(0) : 'J'}
            </div>
            <span>To: <strong className="capitalize">{beneficiaryName || 'johnny'}</strong></span>
          </div>
        </div>

        {/* Centered Big Amount Input */}
        <div className="flex flex-col items-center justify-center my-6">
          <div className="relative flex items-center justify-center w-full">
            <span className="text-3xl sm:text-4xl font-extrabold text-slate-400 dark:text-slate-500 mr-2 select-none">
              $
            </span>
            <input
              type="text"
              inputMode="decimal"
              autoFocus
              placeholder="0.00"
              value={localInput}
              onChange={handleInputChange}
              className="text-4xl sm:text-5xl font-extrabold text-slate-900 dark:text-white tracking-tight text-center bg-transparent border-none outline-none focus:ring-0 w-full max-w-[280px]"
            />
          </div>

          {/* Subtext: Available balance */}
          <div className="mt-3 text-xs sm:text-sm text-slate-500 dark:text-slate-400 font-medium flex items-center gap-1.5">
            <ShieldCheck className="w-4 h-4 text-emerald-500" />
            <span>${formattedBalance} available</span>
          </div>

          {/* Error Message */}
          {errorMessage && (
            <div className="mt-4 flex items-center gap-2 text-xs text-red-600 dark:text-red-400 bg-red-50 dark:bg-red-950/40 px-3 py-2 rounded-xl border border-red-200 dark:border-red-900/60 animate-in fade-in">
              <AlertCircle className="w-4 h-4 shrink-0" />
              <span>{errorMessage}</span>
            </div>
          )}

          {/* Quick preset amount chips */}
          <div className="flex items-center gap-2 mt-8">
            {[50, 100, 500, 1000].map((preset) => (
              <button
                key={preset}
                type="button"
                onClick={() => handleQuickAmount(preset)}
                className="px-3 py-1.5 text-xs font-semibold rounded-lg bg-slate-100 hover:bg-slate-200 dark:bg-slate-800 dark:hover:bg-slate-700 text-slate-700 dark:text-slate-200 transition-colors cursor-pointer"
              >
                ${preset}
              </button>
            ))}
          </div>
        </div>
      </div>

      {/* 2 Buttons: [Back] [Continue - red] */}
      <div className="grid grid-cols-2 gap-3 pt-6 border-t border-slate-200/80 dark:border-slate-800">
        <button
          type="button"
          onClick={handleBack}
          className="py-3.5 px-4 rounded-xl bg-slate-100 hover:bg-slate-200 active:bg-slate-300 dark:bg-slate-800 dark:hover:bg-slate-700 text-slate-700 dark:text-slate-200 font-semibold text-sm transition-all flex items-center justify-center min-h-[48px] cursor-pointer"
        >
          Back
        </button>
        <button
          type="button"
          onClick={handleContinue}
          className="py-3.5 px-4 rounded-xl bg-red-600 hover:bg-red-700 active:bg-red-800 text-white font-bold text-sm shadow-md shadow-red-600/20 transition-all flex items-center justify-center min-h-[48px] cursor-pointer hover:brightness-105 active:scale-[0.98]"
        >
          Continue
        </button>
      </div>
    </div>
  );
};

export default TransferAmountScreen;
