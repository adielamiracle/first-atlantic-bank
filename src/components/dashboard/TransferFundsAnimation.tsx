import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import {
  ArrowRight,
  ArrowDown,
  Building,
  CheckCircle2,
  Sparkles,
  ShieldCheck,
  Zap,
  RotateCcw,
  CreditCard,
  Layers,
  Landmark,
  Check,
  TrendingDown,
  TrendingUp,
  Globe
} from 'lucide-react';
import { BankAccount, CurrencyCode } from '../../types';

interface TransferFundsAnimationProps {
  sourceAccount?: BankAccount;
  destAccount?: BankAccount;
  destBankName?: string;
  destBeneficiaryName?: string;
  destAccountOrIban?: string;
  amountMinor: number;
  currency: CurrencyCode;
  destCurrency?: CurrencyCode;
  convertedAmountMinor?: number;
  clearingRail: string;
  transferType: 'INTERNAL' | 'DOMESTIC' | 'INTERNATIONAL';
  referenceNumber: string;
  onAnimationComplete?: () => void;
}

export const TransferFundsAnimation: React.FC<TransferFundsAnimationProps> = ({
  sourceAccount,
  destAccount,
  destBankName,
  destBeneficiaryName,
  destAccountOrIban,
  amountMinor,
  currency,
  destCurrency = currency,
  convertedAmountMinor,
  clearingRail,
  transferType,
  referenceNumber,
  onAnimationComplete
}) => {
  const [animationKey, setAnimationKey] = useState(0);
  const [phase, setPhase] = useState<'INITIAL' | 'DEBITING' | 'TRAVELING' | 'CREDITING' | 'COMPLETED'>('INITIAL');
  const [isVertical, setIsVertical] = useState(false);

  // Responsive layout check
  useEffect(() => {
    const handleResize = () => {
      setIsVertical(window.innerWidth < 768);
    };
    handleResize();
    window.addEventListener('resize', handleResize);
    return () => window.removeEventListener('resize', handleResize);
  }, []);

  // Run the sequential animation timeline
  useEffect(() => {
    setPhase('INITIAL');

    const t1 = setTimeout(() => {
      setPhase('DEBITING');
    }, 400);

    const t2 = setTimeout(() => {
      setPhase('TRAVELING');
    }, 1100);

    const t3 = setTimeout(() => {
      setPhase('CREDITING');
    }, 2400);

    const t4 = setTimeout(() => {
      setPhase('COMPLETED');
      if (onAnimationComplete) {
        onAnimationComplete();
      }
    }, 3200);

    return () => {
      clearTimeout(t1);
      clearTimeout(t2);
      clearTimeout(t3);
      clearTimeout(t4);
    };
  }, [animationKey]);

  const handleReplay = () => {
    setAnimationKey(prev => prev + 1);
  };

  const getCurrencySymbol = (curr: string) => {
    switch (curr) {
      case 'EUR': return '€';
      case 'GBP': return '£';
      default: return '$';
    }
  };

  const formattedAmount = (amountMinor / 100).toLocaleString('en-US', {
    minimumFractionDigits: 2,
    maximumFractionDigits: 2
  });

  const formattedConvertedAmount = convertedAmountMinor
    ? (convertedAmountMinor / 100).toLocaleString('en-US', {
        minimumFractionDigits: 2,
        maximumFractionDigits: 2
      })
    : formattedAmount;

  const sourceSymbol = getCurrencySymbol(currency);
  const destSymbol = getCurrencySymbol(destCurrency);

  const sourcePrevBalanceMinor = sourceAccount ? (sourceAccount.balanceMinor + (phase === 'INITIAL' ? 0 : amountMinor)) : 0;
  const sourceCurrentBalanceMinor = sourceAccount ? sourceAccount.balanceMinor : 0;

  return (
    <div className="relative overflow-hidden rounded-xl sm:rounded-2xl bg-gradient-to-br from-[#071324] via-[#0a192f] to-[#0c1f3a] p-3.5 sm:p-5 md:p-6 border border-[#c5a880]/30 shadow-xl text-white">
      {/* Background ambient lighting effects */}
      <div className="absolute -top-24 -left-24 w-72 h-72 bg-[#c5a880]/10 rounded-full blur-3xl pointer-events-none" />
      <div className="absolute -bottom-24 -right-24 w-72 h-72 bg-emerald-500/10 rounded-full blur-3xl pointer-events-none" />
      <div className="absolute inset-0 bg-[radial-gradient(#c5a880_1px,transparent_1px)] [background-size:24px_24px] opacity-5 pointer-events-none" />

      {/* Header bar of the animation stage */}
      <div className="relative z-10 flex flex-wrap items-center justify-between gap-2.5 pb-3.5 border-b border-white/10 mb-4 sm:mb-5">
        <div className="flex items-center gap-2">
          <div className="w-7 h-7 rounded-md bg-[#112a4a] border border-[#c5a880]/40 flex items-center justify-center text-[#d4af37] shrink-0">
            <Zap className="w-3.5 h-3.5" />
          </div>
          <div className="min-w-0">
            <div className="flex items-center gap-1.5">
              <span className="text-[11px] font-mono font-bold uppercase tracking-widest text-[#c5a880] truncate">
                Live Movement
              </span>
              <span className="inline-flex items-center gap-1 px-1.5 py-0.5 rounded-full text-[9px] font-mono font-bold bg-emerald-950/80 border border-emerald-500/40 text-emerald-400">
                <span className="w-1.5 h-1.5 rounded-full bg-emerald-400 animate-ping" />
                Settled
              </span>
            </div>
            <p className="text-[11px] text-slate-300 font-mono truncate">
              Ref: <span className="text-white font-bold">{referenceNumber}</span> • Rail: <span className="text-[#c5a880]">{clearingRail}</span>
            </p>
          </div>
        </div>

        <button
          type="button"
          onClick={handleReplay}
          className="inline-flex items-center gap-1 px-2.5 py-1 rounded-md sm:rounded-lg bg-white/5 hover:bg-white/10 border border-white/15 text-[11px] sm:text-xs font-semibold text-slate-200 hover:text-white transition-all cursor-pointer shadow-xs active:scale-95 ml-auto"
        >
          <RotateCcw className="w-3 h-3 text-[#d4af37]" />
          <span>Replay</span>
        </button>
      </div>

      {/* Main interactive animation pipeline */}
      <div className="relative z-10 grid grid-cols-1 md:grid-cols-11 gap-3 items-center">
        {/* ================= LEFT: SOURCE ACCOUNT CARD ================= */}
        <motion.div
          key={`source-${animationKey}`}
          initial={{ opacity: 0, x: -20, scale: 0.95 }}
          animate={{
            opacity: 1,
            x: 0,
            scale: phase === 'DEBITING' ? [1, 0.97, 1.02, 1] : 1,
            borderColor: phase === 'DEBITING' ? 'rgba(239, 68, 68, 0.7)' : 'rgba(197, 168, 128, 0.3)'
          }}
          transition={{ duration: 0.5, ease: 'easeOut' }}
          className="md:col-span-4 relative rounded-lg sm:rounded-xl p-3 sm:p-4 bg-gradient-to-b from-[#112a4a]/90 to-[#0c1f3a]/90 border border-[#c5a880]/30 shadow-md backdrop-blur-md overflow-hidden"
        >
          {/* Subtle debit glow pulse */}
          <AnimatePresence>
            {phase === 'DEBITING' && (
              <motion.div
                initial={{ opacity: 0, scale: 0.8 }}
                animate={{ opacity: [0, 0.5, 0], scale: 1.2 }}
                exit={{ opacity: 0 }}
                transition={{ duration: 0.8 }}
                className="absolute inset-0 bg-red-500/20 rounded-lg pointer-events-none"
              />
            )}
          </AnimatePresence>

          <div className="flex items-center justify-between pb-2 border-b border-white/10">
            <div className="flex items-center gap-1.5 min-w-0">
              <div className="w-6 h-6 rounded-md bg-[#0a192f] border border-[#c5a880]/30 flex items-center justify-center text-[#d4af37] shrink-0">
                <CreditCard className="w-3 h-3" />
              </div>
              <div className="min-w-0">
                <span className="text-[9px] font-mono uppercase tracking-wider text-slate-400 block leading-tight">Origin</span>
                <h4 className="text-xs font-bold font-serif text-white truncate max-w-[130px] sm:max-w-[160px]">
                  {sourceAccount?.name || 'Primary Checking Account'}
                </h4>
              </div>
            </div>
            <span className="text-[9px] font-mono px-1.5 py-0.5 rounded bg-white/5 border border-white/10 text-slate-300 shrink-0">
              {sourceAccount?.accountNumber || '•••• 2853'}
            </span>
          </div>

          <div className="pt-2.5 space-y-1.5">
            <div className="flex justify-between items-end">
              <div>
                <span className="text-[9px] uppercase font-mono text-slate-400 block leading-tight">Available</span>
                <div className="text-sm sm:text-base font-mono font-bold text-white flex items-center gap-1">
                  <span>{sourceSymbol}</span>
                  <span>{((sourceCurrentBalanceMinor || 0) / 100).toLocaleString('en-US', { minimumFractionDigits: 2 })}</span>
                  <span className="text-[10px] text-slate-400 font-normal">{currency}</span>
                </div>
              </div>

              {/* Debit Pill */}
              <motion.div
                initial={{ opacity: 0, y: -5 }}
                animate={{
                  opacity: phase !== 'INITIAL' ? 1 : 0.4,
                  y: 0,
                  scale: phase === 'DEBITING' ? 1.08 : 1
                }}
                className="inline-flex items-center gap-1 px-1.5 py-0.5 rounded bg-red-950/80 border border-red-500/40 text-red-300 text-[11px] font-mono font-bold"
              >
                <TrendingDown className="w-2.5 h-2.5 text-red-400" />
                <span>-{sourceSymbol}{formattedAmount}</span>
              </motion.div>
            </div>

            <div className="flex items-center justify-between text-[10px] text-slate-400 pt-0.5 font-mono">
              <span>Status: <strong className="text-emerald-400 font-semibold">Authorized</strong></span>
              <span>{sourceAccount?.region || 'Global'}</span>
            </div>
          </div>
        </motion.div>

        {/* ================= CENTER: ANIMATED FUNDS CONDUIT ================= */}
        <div className="md:col-span-3 relative flex flex-col items-center justify-center py-2 md:py-0">
          {/* Luminous track beam */}
          <div className="relative w-full flex items-center justify-center">
            {/* Horizontal Track for Desktop */}
            <div className="hidden md:block w-full h-1.5 bg-slate-800 rounded-full overflow-hidden relative shadow-inner">
              <motion.div
                initial={{ width: '0%' }}
                animate={{ width: phase === 'INITIAL' ? '0%' : phase === 'DEBITING' ? '30%' : phase === 'TRAVELING' ? '85%' : '100%' }}
                transition={{ duration: 0.8, ease: 'easeInOut' }}
                className="h-full bg-gradient-to-r from-red-500 via-[#d4af37] to-emerald-400 shadow-[0_0_12px_rgba(212,175,55,0.8)]"
              />
            </div>

            {/* Vertical Track for Mobile */}
            <div className="md:hidden h-10 w-1 bg-slate-800 rounded-full overflow-hidden relative shadow-inner">
              <motion.div
                initial={{ height: '0%' }}
                animate={{ height: phase === 'INITIAL' ? '0%' : phase === 'DEBITING' ? '30%' : phase === 'TRAVELING' ? '85%' : '100%' }}
                transition={{ duration: 0.8, ease: 'easeInOut' }}
                className="w-full bg-gradient-to-b from-red-500 via-[#d4af37] to-emerald-400 shadow-[0_0_12px_rgba(212,175,55,0.8)]"
              />
            </div>

            {/* Traveling Currency Capsule */}
            <motion.div
              key={`capsule-${animationKey}`}
              initial={isVertical ? { y: -20, opacity: 0, scale: 0.7 } : { x: -80, opacity: 0, scale: 0.7 }}
              animate={
                isVertical
                  ? {
                      y: phase === 'INITIAL' ? -20 : phase === 'DEBITING' ? -10 : phase === 'TRAVELING' ? 0 : 15,
                      opacity: 1,
                      scale: phase === 'TRAVELING' ? [1, 1.15, 1] : 1
                    }
                  : {
                      x: phase === 'INITIAL' ? -80 : phase === 'DEBITING' ? -30 : phase === 'TRAVELING' ? 0 : 75,
                      opacity: 1,
                      scale: phase === 'TRAVELING' ? [1, 1.15, 1] : 1
                    }
              }
              transition={{
                duration: 1.2,
                ease: 'easeInOut'
              }}
              className="absolute z-20 flex flex-col items-center"
            >
              <div className="relative px-2.5 py-1 rounded-full bg-gradient-to-r from-[#112a4a] via-[#1a3d68] to-[#112a4a] border border-[#d4af37] shadow-[0_0_15px_rgba(212,175,55,0.5)] flex items-center gap-1 backdrop-blur-md">
                <Sparkles className="w-3 h-3 text-[#d4af37] animate-spin" />
                <span className="font-mono font-bold text-xs text-white tracking-tight">
                  {sourceSymbol}{formattedAmount}
                </span>
                <motion.div
                  animate={{ x: [0, 3, 0] }}
                  transition={{ repeat: Infinity, duration: 0.8 }}
                >
                  <ArrowRight className="w-2.5 h-2.5 text-[#d4af37]" />
                </motion.div>
              </div>

              {/* Floating rail tag */}
              <motion.span
                initial={{ opacity: 0 }}
                animate={{ opacity: phase === 'TRAVELING' ? 1 : 0.7 }}
                className="text-[8px] font-mono text-[#c5a880] mt-0.5 bg-[#0a192f]/90 px-1 py-0.2 rounded border border-[#c5a880]/30 shadow-xs"
              >
                {clearingRail.split(' ')[0]}
              </motion.span>
            </motion.div>
          </div>

          {/* Flow pulse indicator chevrons */}
          <div className="flex items-center gap-1 text-[#c5a880] text-[9px] font-mono mt-2">
            <span className="animate-pulse">▶</span>
            <span className="animate-pulse delay-75">▶</span>
            <span className="animate-pulse delay-150">▶</span>
            <span className="text-slate-400 font-sans text-[10px] ml-0.5">
              {phase === 'COMPLETED' ? 'Settled' : 'Routing'}
            </span>
          </div>
        </div>

        {/* ================= RIGHT: DESTINATION ACCOUNT / INSTITUTION CARD ================= */}
        <motion.div
          key={`dest-${animationKey}`}
          initial={{ opacity: 0, x: 20, scale: 0.95 }}
          animate={{
            opacity: 1,
            x: 0,
            scale: phase === 'CREDITING' || phase === 'COMPLETED' ? [1, 1.04, 0.98, 1] : 1,
            borderColor: phase === 'CREDITING' || phase === 'COMPLETED' ? 'rgba(52, 211, 153, 0.8)' : 'rgba(197, 168, 128, 0.3)'
          }}
          transition={{ duration: 0.5, ease: 'easeOut' }}
          className="md:col-span-4 relative rounded-lg sm:rounded-xl p-3 sm:p-4 bg-gradient-to-b from-[#112a4a]/90 to-[#0c1f3a]/90 border border-[#c5a880]/30 shadow-md backdrop-blur-md overflow-hidden"
        >
          {/* Credit impact shockwave ring */}
          <AnimatePresence>
            {(phase === 'CREDITING' || phase === 'COMPLETED') && (
              <motion.div
                initial={{ opacity: 0.8, scale: 0.8 }}
                animate={{ opacity: 0, scale: 1.3 }}
                transition={{ duration: 1, ease: 'easeOut' }}
                className="absolute inset-0 bg-emerald-400/20 rounded-lg pointer-events-none"
              />
            )}
          </AnimatePresence>

          <div className="flex items-center justify-between pb-2 border-b border-white/10">
            <div className="flex items-center gap-1.5 min-w-0">
              <div className="w-6 h-6 rounded-md bg-[#0a192f] border border-[#c5a880]/30 flex items-center justify-center text-emerald-400 shrink-0">
                {transferType === 'INTERNAL' ? (
                  <Landmark className="w-3 h-3" />
                ) : (
                  <Building className="w-3 h-3" />
                )}
              </div>
              <div className="min-w-0">
                <span className="text-[9px] font-mono uppercase tracking-wider text-slate-400 block leading-tight">Destination</span>
                <h4 className="text-xs font-bold font-serif text-white truncate max-w-[130px] sm:max-w-[160px]">
                  {transferType === 'INTERNAL'
                    ? (destAccount?.name || 'Internal Savings Reserve')
                    : (destBeneficiaryName || destBankName || 'Beneficiary Institution')}
                </h4>
              </div>
            </div>
            <span className="text-[9px] font-mono px-1.5 py-0.5 rounded bg-emerald-950/80 border border-emerald-500/30 text-emerald-300 shrink-0">
              {transferType === 'INTERNAL' ? (destAccount?.accountNumber || '•••• 9104') : (destBankName || 'External Bank')}
            </span>
          </div>

          <div className="pt-2.5 space-y-1.5">
            <div className="flex justify-between items-end">
              <div>
                <span className="text-[9px] uppercase font-mono text-slate-400 block leading-tight">
                  {transferType === 'INTERNAL' ? 'Available Balance' : 'Amount Credited'}
                </span>
                <div className="text-sm sm:text-base font-mono font-bold text-white flex items-center gap-1">
                  <span>{destSymbol}</span>
                  {transferType === 'INTERNAL' ? (
                    <span>{((destAccount?.balanceMinor || 0) / 100).toLocaleString('en-US', { minimumFractionDigits: 2 })}</span>
                  ) : (
                    <span>{formattedConvertedAmount}</span>
                  )}
                  <span className="text-[10px] text-slate-400 font-normal">{destCurrency}</span>
                </div>
              </div>

              {/* Credit Pill */}
              <motion.div
                initial={{ opacity: 0, y: 5 }}
                animate={{
                  opacity: phase === 'CREDITING' || phase === 'COMPLETED' ? 1 : 0.3,
                  y: 0,
                  scale: phase === 'CREDITING' ? 1.08 : 1
                }}
                className="inline-flex items-center gap-1 px-1.5 py-0.5 rounded bg-emerald-950/80 border border-emerald-500/40 text-emerald-300 text-[11px] font-mono font-bold shadow-xs"
              >
                <TrendingUp className="w-2.5 h-2.5 text-emerald-400" />
                <span>+{destSymbol}{formattedConvertedAmount}</span>
              </motion.div>
            </div>

            <div className="flex items-center justify-between text-[10px] text-slate-400 pt-0.5 font-mono">
              <span className="flex items-center gap-1">
                <CheckCircle2 className="w-3 h-3 text-emerald-400" />
                <strong className="text-emerald-400 font-semibold">
                  {phase === 'COMPLETED' ? 'Settled' : 'Crediting...'}
                </strong>
              </span>
              <span className="truncate max-w-[110px]">{destAccountOrIban || 'Ledger Posted'}</span>
            </div>
          </div>
        </motion.div>
      </div>

      {/* Progress Timeline Stepper */}
      <div className="mt-3.5 sm:mt-4 pt-2.5 sm:pt-3 border-t border-white/10 grid grid-cols-3 gap-1.5 text-center font-mono text-[10px] sm:text-[11px]">
        <div className={`p-1.5 rounded-md transition-colors ${phase !== 'INITIAL' ? 'bg-white/10 text-emerald-300' : 'bg-white/5 text-slate-500'}`}>
          <div className="font-bold flex items-center justify-center gap-1">
            <Check className="w-2.5 h-2.5 text-emerald-400" /> 1. Debited
          </div>
          <span className="text-[9px] text-slate-400 truncate block">{sourceAccount?.name || 'Origin'}</span>
        </div>

        <div className={`p-1.5 rounded-md transition-colors ${phase === 'TRAVELING' || phase === 'CREDITING' || phase === 'COMPLETED' ? 'bg-white/10 text-amber-300' : 'bg-white/5 text-slate-500'}`}>
          <div className="font-bold flex items-center justify-center gap-1">
            <Sparkles className="w-2.5 h-2.5 text-[#d4af37]" /> 2. Dispatched
          </div>
          <span className="text-[9px] text-slate-400 truncate block">{clearingRail.split(' ')[0]}</span>
        </div>

        <div className={`p-1.5 rounded-md transition-colors ${phase === 'CREDITING' || phase === 'COMPLETED' ? 'bg-emerald-950/70 border border-emerald-500/30 text-emerald-300' : 'bg-white/5 text-slate-500'}`}>
          <div className="font-bold flex items-center justify-center gap-1">
            <CheckCircle2 className="w-2.5 h-2.5 text-emerald-400" /> 3. Credited
          </div>
          <span className="text-[9px] text-slate-400 truncate block">{destBeneficiaryName || destBankName || 'Settled'}</span>
        </div>
      </div>
    </div>
  );
};
