import React from 'react';
import { useNavigate } from 'react-router-dom';
import { ArrowLeft, CheckCircle2, Circle, CreditCard, Building2, Wallet } from 'lucide-react';
import { useTransferStore, TransferAccount } from '../../store/useTransferStore';

export const TransferAccountScreen: React.FC = () => {
  const navigate = useNavigate();
  const {
    accounts,
    selectedAccountId,
    setSelectedAccountId,
    amount
  } = useTransferStore();

  const handleSelect = (accId: string) => {
    setSelectedAccountId(accId);
  };

  const handleContinue = () => {
    navigate('/transfer/reference');
  };

  const handleBack = () => {
    navigate('/transfer/amount');
  };

  const getAccountIcon = (type: string) => {
    switch (type.toLowerCase()) {
      case 'checking':
        return <Wallet className="w-5 h-5 text-red-600 dark:text-red-400" />;
      case 'savings':
        return <Building2 className="w-5 h-5 text-emerald-600 dark:text-emerald-400" />;
      default:
        return <CreditCard className="w-5 h-5 text-blue-600 dark:text-blue-400" />;
    }
  };

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

        {/* Section Label */}
        <div className="mb-4">
          <h2 className="text-base font-bold text-slate-900 dark:text-white">
            Pay from
          </h2>
          <p className="text-xs text-slate-500 dark:text-slate-400 mt-0.5">
            Choose an account to debit for ${amount > 0 ? amount.toFixed(2) : '0.00'}
          </p>
        </div>

        {/* Account List with Radio Selection */}
        <div className="space-y-3 mt-4">
          {accounts.map((acc: TransferAccount) => {
            const isSelected = acc.id === selectedAccountId;
            const hasSufficient = acc.balance >= amount;

            return (
              <div
                key={acc.id}
                onClick={() => handleSelect(acc.id)}
                className={`p-4 rounded-2xl border transition-all cursor-pointer flex items-center justify-between gap-3 ${
                  isSelected
                    ? 'border-red-600 bg-red-50/40 dark:bg-red-950/20 shadow-sm'
                    : 'border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900 hover:border-slate-300 dark:hover:border-slate-700'
                }`}
              >
                <div className="flex items-center gap-3.5 min-w-0">
                  <div className="w-10 h-10 rounded-xl bg-slate-100 dark:bg-slate-800 flex items-center justify-center shrink-0">
                    {getAccountIcon(acc.type)}
                  </div>
                  <div className="min-w-0">
                    <div className="text-sm font-bold text-slate-900 dark:text-white truncate">
                      {acc.name}
                    </div>
                    <div className="text-xs text-slate-500 dark:text-slate-400 font-mono">
                      ••••{acc.last4}
                    </div>
                  </div>
                </div>

                <div className="flex items-center gap-3 shrink-0">
                  <div className="text-right">
                    <div className="text-sm font-bold text-slate-900 dark:text-white font-mono">
                      ${acc.balance.toLocaleString('en-US', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}
                    </div>
                    {!hasSufficient && (
                      <div className="text-[10px] text-amber-600 dark:text-amber-400 font-medium">
                        Low balance
                      </div>
                    )}
                  </div>

                  {/* Radio select */}
                  <div className="shrink-0">
                    {isSelected ? (
                      <CheckCircle2 className="w-5 h-5 text-red-600 fill-red-600 text-white" />
                    ) : (
                      <Circle className="w-5 h-5 text-slate-300 dark:text-slate-600" />
                    )}
                  </div>
                </div>
              </div>
            );
          })}
        </div>
      </div>

      {/* Buttons: [Back] [Continue - red] */}
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

export default TransferAccountScreen;
