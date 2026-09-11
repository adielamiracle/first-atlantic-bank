import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { ArrowLeft, AlertCircle } from 'lucide-react';
import { useTransferStore } from '../../store/useTransferStore';
import { useBank } from '../../context/BankContext';

export const TransferAmountScreen: React.FC = () => {
  const navigate = useNavigate();
  const { setCurrentView } = useBank();
  const {
    amount,
    amountInput,
    availableBalance,
    setAmount,
    fetchAccountsAndBalance
  } = useTransferStore();

  const [localInput, setLocalInput] = useState(amountInput || (amount > 0 ? amount.toString() : '500.00'));
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
    navigate('/transfer/beneficiary');
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
    <div className="w-full max-w-md mx-auto p-5 sm:p-6 flex flex-col min-h-[560px] justify-between text-slate-100">
      {/* Top Header */}
      <div>
        <div className="flex items-center justify-between mb-6">
          <button
            onClick={handleBack}
            className="p-2 -ml-2 rounded-full hover:bg-slate-800 text-slate-400 hover:text-white transition-colors"
            aria-label="Back to dashboard"
          >
            <ArrowLeft className="w-5 h-5" />
          </button>
          <span className="text-xs font-semibold uppercase tracking-wider text-slate-400">Step 1 of 4</span>
          <div className="w-7" />
        </div>

        <h1 className="text-2xl font-bold text-white text-center mb-8">Send money</h1>

        {/* Big Centered Currency Input */}
        <div className="flex flex-col items-center justify-center my-6">
          <div className="relative flex items-center justify-center w-full">
            <span className="text-4xl sm:text-5xl font-semibold text-slate-300 mr-2 select-none">$</span>
            <input
              type="text"
              inputMode="decimal"
              placeholder="0.00"
              value={localInput}
              onChange={handleInputChange}
              autoFocus
              className="text-4xl sm:text-5xl font-extrabold text-white bg-transparent outline-none w-64 text-center tracking-tight placeholder-slate-600 focus:placeholder-transparent"
            />
          </div>

          <p className="mt-4 text-sm font-medium text-slate-400">
            Available <span className="text-emerald-400 font-semibold">${formattedBalance}</span>
          </p>

          {/* Quick presets */}
          <div className="flex items-center gap-2 mt-6">
            {[100, 250, 500, 1000].map((preset) => (
              <button
                key={preset}
                type="button"
                onClick={() => handleQuickAmount(preset)}
                className="px-3.5 py-1.5 rounded-full text-xs font-semibold bg-slate-800/80 hover:bg-slate-700 text-slate-300 border border-slate-700 transition-colors"
              >
                ${preset}
              </button>
            ))}
          </div>

          {errorMessage && (
            <div className="mt-4 flex items-center gap-1.5 text-xs text-rose-400 bg-rose-950/40 border border-rose-800/50 px-3 py-2 rounded-xl">
              <AlertCircle className="w-4 h-4 shrink-0" />
              <span>{errorMessage}</span>
            </div>
          )}
        </div>
      </div>

      {/* Action Buttons */}
      <div className="pt-6 mt-4 border-t border-slate-800/80 flex items-center gap-3">
        <button
          type="button"
          onClick={handleBack}
          className="flex-1 py-3.5 px-4 rounded-xl font-medium text-slate-300 hover:bg-slate-800 border border-slate-700/80 transition-all text-center"
        >
          Cancel
        </button>
        <button
          type="button"
          onClick={handleContinue}
          className="flex-1 py-3.5 px-4 rounded-xl font-semibold text-white bg-blue-600 hover:bg-blue-500 active:scale-[0.99] transition-all shadow-lg shadow-blue-600/25 text-center"
        >
          Continue
        </button>
      </div>
    </div>
  );
};

export default TransferAmountScreen;
