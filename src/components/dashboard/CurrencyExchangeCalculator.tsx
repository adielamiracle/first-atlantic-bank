import React, { useState, useEffect, useMemo } from 'react';
import {
  Calculator,
  ArrowRightLeft,
  RefreshCw,
  TrendingUp,
  Sparkles,
  ShieldCheck,
  Zap,
  Clock,
  Check,
  ChevronDown,
  Info,
  Layers,
  ArrowUpRight
} from 'lucide-react';
import { CurrencyCode } from '../../types';
import { motion, AnimatePresence } from 'motion/react';

interface CurrencyExchangeCalculatorProps {
  rates?: Record<string, Record<string, number>>;
  onApplyToTransfer?: (params: {
    amount: string;
    sourceCurrency: CurrencyCode;
    targetCurrency: CurrencyCode;
  }) => void;
  defaultSourceCurrency?: CurrencyCode;
  defaultTargetCurrency?: CurrencyCode;
  defaultAmount?: string;
  className?: string;
}

interface CurrencyOption {
  code: CurrencyCode | string;
  name: string;
  symbol: string;
  flag: string;
  region: string;
  isCoreSupported?: boolean;
}

const EXTENDED_CURRENCIES: CurrencyOption[] = [
  { code: 'USD', name: 'US Dollar', symbol: '$', flag: '🇺🇸', region: 'Fedwire / ACH', isCoreSupported: true },
  { code: 'GBP', name: 'British Pound', symbol: '£', flag: '🇬🇧', region: 'FPS / CHAPS', isCoreSupported: true },
  { code: 'EUR', name: 'Euro', symbol: '€', flag: '🇪🇺', region: 'SEPA Instant', isCoreSupported: true },
  { code: 'CHF', name: 'Swiss Franc', symbol: 'CHF', flag: '🇨🇭', region: 'SIX SIC SWIFT', isCoreSupported: false },
  { code: 'CAD', name: 'Canadian Dollar', symbol: 'CA$', flag: '🇨🇦', region: 'Lynx Wire', isCoreSupported: false },
  { code: 'AUD', name: 'Australian Dollar', symbol: 'A$', flag: '🇦🇺', region: 'NPP / SWIFT', isCoreSupported: false },
  { code: 'JPY', name: 'Japanese Yen', symbol: '¥', flag: '🇯🇵', region: 'Zengin SWIFT', isCoreSupported: false },
  { code: 'SGD', name: 'Singapore Dollar', symbol: 'S$', flag: '🇸🇬', region: 'FAST / MEPS+', isCoreSupported: false },
  { code: 'AED', name: 'UAE Dirham', symbol: 'AED', flag: '🇦🇪', region: 'UAEFTS SWIFT', isCoreSupported: false }
];

// Fallback interbank spot rates matrix pegged to USD = 1.00
const BASE_RATES_TO_USD: Record<string, number> = {
  USD: 1.0,
  GBP: 1.274,
  EUR: 1.087,
  CHF: 1.135,
  CAD: 0.738,
  AUD: 0.655,
  JPY: 0.0066,
  SGD: 0.748,
  AED: 0.272
};

export const CurrencyExchangeCalculator: React.FC<CurrencyExchangeCalculatorProps> = ({
  rates,
  onApplyToTransfer,
  defaultSourceCurrency = 'USD',
  defaultTargetCurrency = 'EUR',
  defaultAmount = '10000',
  className = ''
}) => {
  const [sourceCurr, setSourceCurr] = useState<string>(defaultSourceCurrency);
  const [targetCurr, setTargetCurr] = useState<string>(defaultTargetCurrency);
  const [calcAmount, setCalcAmount] = useState<string>(defaultAmount);
  const [isRefreshing, setIsRefreshing] = useState(false);
  const [isApplied, setIsApplied] = useState(false);
  const [rateLockSeconds, setRateLockSeconds] = useState(58);
  const [showFeeBreakdown, setShowFeeBreakdown] = useState(false);

  // Synchronize when defaults change externally
  useEffect(() => {
    if (defaultSourceCurrency) setSourceCurr(defaultSourceCurrency);
  }, [defaultSourceCurrency]);

  useEffect(() => {
    if (defaultTargetCurrency) setTargetCurr(defaultTargetCurrency);
  }, [defaultTargetCurrency]);

  // Rate lock countdown ticker simulation
  useEffect(() => {
    const timer = setInterval(() => {
      setRateLockSeconds((prev) => {
        if (prev <= 1) {
          return 60;
        }
        return prev - 1;
      });
    }, 1000);
    return () => clearInterval(timer);
  }, []);

  // Compute exchange rate dynamically
  const spotRate = useMemo(() => {
    // 1. Check if rates passed from BankContext has direct mapping
    if (rates && rates[sourceCurr] && rates[sourceCurr][targetCurr]) {
      return rates[sourceCurr][targetCurr];
    }
    // 2. Compute via USD triangulation
    const sourceInUsd = BASE_RATES_TO_USD[sourceCurr] || 1.0;
    const targetInUsd = BASE_RATES_TO_USD[targetCurr] || 1.0;
    const computed = sourceInUsd / targetInUsd;
    return parseFloat(computed.toFixed(4));
  }, [sourceCurr, targetCurr, rates]);

  // Inverse rate
  const inverseRate = useMemo(() => {
    if (spotRate === 0) return 0;
    return parseFloat((1 / spotRate).toFixed(4));
  }, [spotRate]);

  // Clean numerical amount
  const parsedAmount = useMemo(() => {
    const clean = parseFloat(calcAmount.replace(/,/g, ''));
    return isNaN(clean) || clean < 0 ? 0 : clean;
  }, [calcAmount]);

  // Calculations
  const rawConverted = parsedAmount * spotRate;
  
  // Traditional bank margin comparison (traditional banks add 3.0% - 3.8% FX markup)
  const retailBankSpreadRate = spotRate * 0.965;
  const retailBankConverted = parsedAmount * retailBankSpreadRate;
  const estimatedSavings = Math.max(0, rawConverted - retailBankConverted);

  const sourceMeta = EXTENDED_CURRENCIES.find((c) => c.code === sourceCurr) || {
    code: sourceCurr,
    name: sourceCurr,
    symbol: '$',
    flag: '🌐',
    region: 'International'
  };

  const targetMeta = EXTENDED_CURRENCIES.find((c) => c.code === targetCurr) || {
    code: targetCurr,
    name: targetCurr,
    symbol: '€',
    flag: '🌐',
    region: 'International'
  };

  const handleSwap = () => {
    const temp = sourceCurr;
    setSourceCurr(targetCurr);
    setTargetCurr(temp);
  };

  const handleRefreshRates = () => {
    setIsRefreshing(true);
    setRateLockSeconds(60);
    setTimeout(() => {
      setIsRefreshing(false);
    }, 600);
  };

  const handleApply = () => {
    if (onApplyToTransfer) {
      const coreSource: CurrencyCode = (['USD', 'GBP', 'EUR'].includes(sourceCurr) ? sourceCurr : 'USD') as CurrencyCode;
      const coreTarget: CurrencyCode = (['USD', 'GBP', 'EUR'].includes(targetCurr) ? targetCurr : 'EUR') as CurrencyCode;
      onApplyToTransfer({
        amount: parsedAmount.toString(),
        sourceCurrency: coreSource,
        targetCurrency: coreTarget
      });
      setIsApplied(true);
      setTimeout(() => setIsApplied(false), 2500);
    }
  };

  return (
    <div
      id="fx-multi-currency-calculator"
      className={`rounded-xl sm:rounded-2xl bg-white dark:bg-[#0a192f] border border-slate-200 dark:border-[#1e3656] shadow-sm p-4 sm:p-6 space-y-4 transition-colors ${className}`}
    >
      {/* Widget Header */}
      <div className="flex flex-wrap items-center justify-between gap-3 pb-3 border-b border-slate-100 dark:border-slate-800">
        <div className="flex items-center gap-2 min-w-0">
          <div className="w-8 h-8 rounded-lg bg-amber-50 dark:bg-amber-950/60 border border-[#c5a880]/30 flex items-center justify-center text-[#8c6d37] dark:text-[#c5a880] shrink-0">
            <Calculator className="w-4 h-4" />
          </div>
          <div>
            <div className="flex items-center gap-2">
              <h3 className="text-sm sm:text-base font-bold font-serif text-slate-900 dark:text-white">
                Multi-Currency FX Calculator
              </h3>
              <span className="inline-flex items-center gap-1 px-1.5 py-0.5 rounded-full text-[9px] font-mono font-bold bg-emerald-50 dark:bg-emerald-950/80 text-emerald-600 dark:text-emerald-400 border border-emerald-200 dark:border-emerald-800">
                <span className="w-1.5 h-1.5 rounded-full bg-emerald-500 animate-pulse" />
                Live Spot Feed
              </span>
            </div>
            <p className="text-[11px] sm:text-xs text-slate-500 dark:text-slate-400">
              Real-time mid-market exchange pricing with institutional zero-markup rate lock.
            </p>
          </div>
        </div>

        <div className="flex items-center gap-2 ml-auto">
          {/* Rate Lock Timer Badge */}
          <div className="hidden sm:flex items-center gap-1 px-2.5 py-1 rounded-md bg-slate-100 dark:bg-slate-800/80 border border-slate-200 dark:border-slate-700 text-[11px] font-mono text-slate-600 dark:text-slate-300">
            <Clock className="w-3 h-3 text-[#c5a880]" />
            <span>Lock: <strong className="text-slate-900 dark:text-white">{rateLockSeconds}s</strong></span>
          </div>

          <button
            type="button"
            onClick={handleRefreshRates}
            title="Refresh Interbank Spot Feed"
            className="p-1.5 rounded-md hover:bg-slate-100 dark:hover:bg-slate-800 text-slate-500 dark:text-slate-400 hover:text-slate-900 dark:hover:text-white transition-colors cursor-pointer border border-transparent hover:border-slate-200 dark:hover:border-slate-700"
          >
            <RefreshCw className={`w-3.5 h-3.5 ${isRefreshing ? 'animate-spin text-[#c5a880]' : ''}`} />
          </button>
        </div>
      </div>

      {/* Main Conversion Matrix Input Area */}
      <div className="grid grid-cols-1 md:grid-cols-11 gap-3 items-center">
        {/* SOURCE CURRENCY CARD */}
        <div className="md:col-span-5 p-3 sm:p-4 rounded-xl bg-slate-50 dark:bg-slate-900/80 border border-slate-200 dark:border-slate-800 space-y-2">
          <div className="flex items-center justify-between text-xs text-slate-500 dark:text-slate-400">
            <span className="font-semibold uppercase tracking-wider text-[10px]">You Send (Origin)</span>
            <span className="text-[10px] font-mono text-slate-400">{sourceMeta.region}</span>
          </div>

          <div className="flex items-center gap-2">
            <div className="relative flex-1 min-w-0">
              <span className="absolute left-3 top-1/2 -translate-y-1/2 text-sm sm:text-base font-bold text-slate-400 font-mono">
                {sourceMeta.symbol}
              </span>
              <input
                type="text"
                value={calcAmount}
                onChange={(e) => setCalcAmount(e.target.value.replace(/[^0-9.]/g, ''))}
                placeholder="0.00"
                className="w-full pl-7 sm:pl-8 pr-2 py-1.5 sm:py-2 text-base sm:text-lg font-bold font-mono text-slate-900 dark:text-white bg-white dark:bg-slate-950 border border-slate-300 dark:border-slate-700 rounded-lg focus:outline-none focus:border-[#c5a880] focus:ring-1 focus:ring-[#c5a880]"
              />
            </div>

            {/* Currency Select dropdown */}
            <div className="relative shrink-0">
              <select
                value={sourceCurr}
                onChange={(e) => setSourceCurr(e.target.value)}
                className="appearance-none pl-2.5 pr-7 py-2 sm:py-2.5 bg-white dark:bg-[#112a4a] text-slate-900 dark:text-white font-bold text-xs sm:text-sm rounded-lg border border-slate-300 dark:border-[#c5a880]/30 shadow-xs focus:outline-none cursor-pointer"
              >
                {EXTENDED_CURRENCIES.map((c) => (
                  <option key={`src-${c.code}`} value={c.code}>
                    {c.flag} {c.code}
                  </option>
                ))}
              </select>
              <ChevronDown className="w-3.5 h-3.5 absolute right-2 top-1/2 -translate-y-1/2 text-slate-400 pointer-events-none" />
            </div>
          </div>

          {/* Quick Presets */}
          <div className="flex flex-wrap items-center gap-1 pt-1">
            <span className="text-[10px] text-slate-400 font-semibold mr-1">Quick:</span>
            {[1000, 5000, 10000, 25000, 50000].map((preset) => (
              <button
                key={preset}
                type="button"
                onClick={() => setCalcAmount(preset.toString())}
                className={`px-1.5 py-0.5 rounded text-[10px] font-mono font-medium transition-colors cursor-pointer ${
                  parsedAmount === preset
                    ? 'bg-[#0a192f] text-white dark:bg-[#c5a880] dark:text-[#0a192f] font-bold'
                    : 'bg-white dark:bg-slate-800 text-slate-600 dark:text-slate-300 border border-slate-200 dark:border-slate-700 hover:border-slate-300'
                }`}
              >
                ${preset >= 1000 ? `${preset / 1000}k` : preset}
              </button>
            ))}
          </div>
        </div>

        {/* SWAP BUTTON */}
        <div className="md:col-span-1 flex justify-center items-center py-1 md:py-0">
          <button
            type="button"
            onClick={handleSwap}
            title="Swap Origin & Destination Currencies"
            className="w-8 h-8 sm:w-9 sm:h-9 rounded-full bg-slate-100 dark:bg-[#112a4a] hover:bg-slate-200 dark:hover:bg-[#193a63] border border-slate-300 dark:border-[#c5a880]/40 text-[#8c6d37] dark:text-[#c5a880] flex items-center justify-center transition-transform hover:scale-105 active:scale-95 shadow-xs cursor-pointer"
          >
            <ArrowRightLeft className="w-3.5 h-3.5" />
          </button>
        </div>

        {/* TARGET CURRENCY CARD */}
        <div className="md:col-span-5 p-3 sm:p-4 rounded-xl bg-amber-50/60 dark:bg-amber-950/20 border border-amber-200/80 dark:border-amber-900/40 space-y-2">
          <div className="flex items-center justify-between text-xs text-amber-900 dark:text-amber-300">
            <span className="font-semibold uppercase tracking-wider text-[10px]">Recipient Gets (Estimated)</span>
            <span className="text-[10px] font-mono">{targetMeta.region}</span>
          </div>

          <div className="flex items-center gap-2">
            <div className="relative flex-1 min-w-0">
              <span className="absolute left-3 top-1/2 -translate-y-1/2 text-sm sm:text-base font-bold text-amber-700 dark:text-amber-400 font-mono">
                {targetMeta.symbol}
              </span>
              <div className="w-full pl-7 sm:pl-8 pr-2 py-1.5 sm:py-2 text-base sm:text-lg font-bold font-mono text-slate-900 dark:text-white bg-white dark:bg-slate-950 border border-amber-300 dark:border-amber-800/60 rounded-lg truncate select-all">
                {rawConverted.toLocaleString('en-US', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}
              </div>
            </div>

            {/* Currency Select dropdown */}
            <div className="relative shrink-0">
              <select
                value={targetCurr}
                onChange={(e) => setTargetCurr(e.target.value)}
                className="appearance-none pl-2.5 pr-7 py-2 sm:py-2.5 bg-white dark:bg-[#112a4a] text-slate-900 dark:text-white font-bold text-xs sm:text-sm rounded-lg border border-amber-300 dark:border-[#c5a880]/40 shadow-xs focus:outline-none cursor-pointer"
              >
                {EXTENDED_CURRENCIES.map((c) => (
                  <option key={`tgt-${c.code}`} value={c.code}>
                    {c.flag} {c.code}
                  </option>
                ))}
              </select>
              <ChevronDown className="w-3.5 h-3.5 absolute right-2 top-1/2 -translate-y-1/2 text-slate-400 pointer-events-none" />
            </div>
          </div>

          <div className="flex items-center justify-between text-[11px] text-slate-500 dark:text-slate-400 pt-1 font-mono">
            <span>Rate: 1 {sourceCurr} = <strong className="text-slate-900 dark:text-white">{spotRate} {targetCurr}</strong></span>
            <span className="text-[10px]">1 {targetCurr} = {inverseRate} {sourceCurr}</span>
          </div>
        </div>
      </div>

      {/* Spot Rate Highlights & Action Strip */}
      <div className="pt-2 flex flex-col sm:flex-row sm:items-center justify-between gap-3 text-xs">
        <div className="flex flex-wrap items-center gap-2">
          <div className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-lg bg-emerald-50 dark:bg-emerald-950/60 border border-emerald-200 dark:border-emerald-800 text-emerald-800 dark:text-emerald-300 font-mono text-[11px]">
            <TrendingUp className="w-3.5 h-3.5 text-emerald-500" />
            <span>Savings vs Retail Banks: <strong>~{targetMeta.symbol}{estimatedSavings.toLocaleString('en-US', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}</strong></span>
          </div>

          <button
            type="button"
            onClick={() => setShowFeeBreakdown(!showFeeBreakdown)}
            className="text-[11px] text-slate-500 hover:text-slate-800 dark:text-slate-400 dark:hover:text-slate-200 flex items-center gap-1 underline underline-offset-2 transition-colors cursor-pointer"
          >
            <Info className="w-3 h-3" />
            <span>{showFeeBreakdown ? 'Hide Details' : 'Fee Schedule & Rails'}</span>
          </button>
        </div>

        {/* Action button to populate the main Transfer Form */}
        {onApplyToTransfer && (
          <button
            type="button"
            onClick={handleApply}
            className={`inline-flex items-center justify-center gap-1.5 px-3.5 py-2 rounded-lg text-xs font-bold font-sans transition-all cursor-pointer shadow-xs ${
              isApplied
                ? 'bg-emerald-600 text-white'
                : 'bg-gradient-to-r from-[#0a192f] to-[#142d4f] hover:brightness-110 text-white dark:from-[#c5a880] dark:to-[#d4af37] dark:text-[#0a192f]'
            }`}
          >
            {isApplied ? (
              <>
                <Check className="w-3.5 h-3.5" />
                <span>Applied to Transfer Form</span>
              </>
            ) : (
              <>
                <Zap className="w-3.5 h-3.5 text-[#d4af37] dark:text-[#0a192f]" />
                <span>Apply to Transfer Form</span>
                <ArrowUpRight className="w-3 h-3 ml-0.5" />
              </>
            )}
          </button>
        )}
      </div>

      {/* Expandable Fee Breakdown & Settlement Route Information */}
      <AnimatePresence>
        {showFeeBreakdown && (
          <motion.div
            initial={{ opacity: 0, height: 0 }}
            animate={{ opacity: 1, height: 'auto' }}
            exit={{ opacity: 0, height: 0 }}
            className="overflow-hidden pt-2"
          >
            <div className="p-3 sm:p-4 rounded-xl bg-slate-50 dark:bg-slate-900/60 border border-slate-200 dark:border-slate-800 space-y-2 text-xs font-mono text-slate-600 dark:text-slate-300">
              <div className="flex justify-between pb-1.5 border-b border-slate-200 dark:border-slate-800">
                <span className="text-slate-500">Wholesale Interbank Mid-Market Rate</span>
                <span className="font-bold text-slate-900 dark:text-white">1.00 {sourceCurr} = {spotRate} {targetCurr}</span>
              </div>
              <div className="flex justify-between pb-1.5 border-b border-slate-200 dark:border-slate-800">
                <span className="text-slate-500">FX Markup / Spread Fee</span>
                <span className="font-bold text-emerald-600 dark:text-emerald-400">0.00% (First Atlantic Institutional Privilege)</span>
              </div>
              <div className="flex justify-between pb-1.5 border-b border-slate-200 dark:border-slate-800">
                <span className="text-slate-500">Settlement Rail Route</span>
                <span className="font-bold text-slate-900 dark:text-white">
                  {targetCurr === 'EUR' ? 'SEPA Instant / TARGET2' : targetCurr === 'GBP' ? 'FPS (Faster Payments) / CHAPS' : targetCurr === 'USD' ? 'Fedwire Real-Time' : 'SWIFT GPI Priority Wire'}
                </span>
              </div>
              <div className="flex justify-between text-[11px] text-slate-400 pt-0.5 font-sans">
                <span>⏱ Typical Dispatch SLA: <strong className="text-slate-700 dark:text-slate-300">Sub-minute to same-day execution</strong></span>
                <span>🔒 ISO 20022 XML End-to-End Encrypted</span>
              </div>
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
};
