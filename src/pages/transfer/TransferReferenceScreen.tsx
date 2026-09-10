import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { ArrowLeft, Tag } from 'lucide-react';
import { useTransferStore } from '../../store/useTransferStore';

const QUICK_TAGS = ['Rent for March', 'Dinner & drinks', 'Consulting invoice', 'Birthday gift', 'Groceries'];

export const TransferReferenceScreen: React.FC = () => {
  const navigate = useNavigate();
  const { reference, setReference, amount, beneficiaryName } = useTransferStore();
  const [localRef, setLocalRef] = useState(reference);

  const handleContinue = () => {
    setReference(localRef.trim());
    navigate('/transfer/review');
  };

  const handleBack = () => {
    setReference(localRef.trim());
    navigate('/transfer/account');
  };

  const handleSelectTag = (tag: string) => {
    setLocalRef(tag);
    setReference(tag);
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

        {/* Section Label & Subtext */}
        <div className="mb-5">
          <h2 className="text-base font-bold text-slate-900 dark:text-white">
            Add a reference
          </h2>
          <p className="text-xs text-slate-500 dark:text-slate-400 mt-1">
            Optional note for you and on the recipient's statement
          </p>
        </div>

        {/* Textarea */}
        <div className="space-y-3">
          <div className="relative">
            <textarea
              rows={4}
              maxLength={120}
              autoFocus
              placeholder="e.g. Rent for March"
              value={localRef}
              onChange={(e) => setLocalRef(e.target.value)}
              className="w-full p-4 rounded-2xl border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900 text-slate-900 dark:text-white placeholder:text-slate-400 dark:placeholder:text-slate-500 text-sm focus:outline-none focus:ring-2 focus:ring-red-600 focus:border-transparent resize-none shadow-xs"
            />
            <div className="absolute bottom-3 right-3 text-[11px] text-slate-400 font-mono select-none">
              {localRef.length}/120
            </div>
          </div>

          {/* Quick suggestions */}
          <div className="pt-2">
            <div className="text-[11px] font-semibold uppercase text-slate-400 dark:text-slate-500 tracking-wider mb-2 flex items-center gap-1.5">
              <Tag className="w-3 h-3" />
              <span>Quick suggestions</span>
            </div>
            <div className="flex flex-wrap gap-2">
              {QUICK_TAGS.map((tag) => (
                <button
                  key={tag}
                  type="button"
                  onClick={() => handleSelectTag(tag)}
                  className={`text-xs px-3 py-1.5 rounded-lg border transition-colors cursor-pointer ${
                    localRef === tag
                      ? 'border-red-600 bg-red-50 dark:bg-red-950/30 text-red-700 dark:text-red-300 font-medium'
                      : 'border-slate-200 dark:border-slate-800 bg-slate-50 dark:bg-slate-800/60 text-slate-700 dark:text-slate-300 hover:bg-slate-100 dark:hover:bg-slate-800'
                  }`}
                >
                  {tag}
                </button>
              ))}
            </div>
          </div>
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

export default TransferReferenceScreen;
