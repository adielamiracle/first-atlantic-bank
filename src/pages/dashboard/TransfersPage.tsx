import React, { useState, useMemo } from 'react';
import { useBank } from '../../context/BankContext';
import { CurrencyDisplay } from '../../components/common/CurrencyDisplay';
import {
  ArrowLeftRight,
  Globe,
  Building,
  ShieldCheck,
  CheckCircle2,
  AlertCircle,
  HelpCircle,
  RefreshCw,
  Lock,
  ArrowRight,
  Search,
  Check,
  Smartphone,
  Mail,
  Send,
  Download,
  Copy,
  Clock,
  Sparkles,
  Zap,
  ChevronDown,
  Info,
  ExternalLink,
  Receipt,
  FileCheck2,
  Calculator
} from 'lucide-react';
import { CurrencyCode } from '../../types';
import { REGISTERED_BANKS, RegisteredBank, OTHER_CUSTOM_BANK_ID, DispatchNotificationRecord } from '../../data/banksData';
import { motion, AnimatePresence } from 'motion/react';
import { TransferFundsAnimation } from '../../components/dashboard/TransferFundsAnimation';
import { CurrencyExchangeCalculator } from '../../components/dashboard/CurrencyExchangeCalculator';

export const TransfersPage: React.FC = () => {
  const {
    currentUser,
    accounts,
    executeTransfer,
    executeExternalTransfer,
    rates,
    showToast,
    region
  } = useBank();

  // Mode: INTERNAL (Between accounts), DOMESTIC (US / UK Clearing), INTERNATIONAL (Global SWIFT FX)
  const [transferMode, setTransferMode] = useState<'INTERNAL' | 'DOMESTIC' | 'INTERNATIONAL'>('DOMESTIC');
  const [sourceAccountId, setSourceAccountId] = useState(accounts[0]?.id || '');
  const [destAccountId, setDestAccountId] = useState(accounts[1]?.id || '');
  const [amountStr, setAmountStr] = useState('5000');
  const [description, setDescription] = useState('');
  const [isProcessing, setIsProcessing] = useState(false);
  const [showConfirmModal, setShowConfirmModal] = useState(false);
  const [transferSuccess, setTransferSuccess] = useState<any>(null);
  const [showCalculator, setShowCalculator] = useState(true);

  // Bank Selection State
  const [bankSearchQuery, setBankSearchQuery] = useState('');
  const [bankCountryFilter, setBankCountryFilter] = useState<'ALL' | 'US' | 'UK' | 'EU' | 'GLOBAL'>('ALL');
  const [selectedBankId, setSelectedBankId] = useState<string>('us_jpmorgan_chase');
  const [isCustomBank, setIsCustomBank] = useState(false);

  // Beneficiary details
  const [recipientName, setRecipientName] = useState('Morgan Stanley Global Wealth Management');
  const [customBankName, setCustomBankName] = useState('');
  const [recipientRouting, setRecipientRouting] = useState('021000021');
  const [recipientSwift, setRecipientSwift] = useState('CHASUS33');
  const [recipientAccount, setRecipientAccount] = useState('991048201948');
  const [recipientCountry, setRecipientCountry] = useState('United States');
  const [recipientPhone, setRecipientPhone] = useState('+1 (555) 839-2041');
  const [recipientEmail, setRecipientEmail] = useState('beneficiary.wires@morganstanley.com');
  const [destCurrency, setDestCurrency] = useState<CurrencyCode>('USD');
  const [notifySms, setNotifySms] = useState(true);
  const [notifyEmail, setNotifyEmail] = useState(true);

  // Receipt Modal / Tab view
  const [receiptActiveTab, setReceiptActiveTab] = useState<'VOUCHER' | 'SMS' | 'EMAIL'>('VOUCHER');
  const [copiedReceipt, setCopiedReceipt] = useState(false);

  const sourceAccount = accounts.find((a) => a.id === sourceAccountId) || accounts[0];
  const destAccount = accounts.find((a) => a.id === destAccountId) || accounts[1];

  const amountMinor = Math.round(parseFloat(amountStr || '0') * 100);

  // Fee schedule: 0 for internal, 15.00 for domestic wire, 35.00 for SWIFT
  const wireFeeMinor = transferMode === 'DOMESTIC' ? 1500 : transferMode === 'INTERNATIONAL' ? 3500 : 0;
  const rate = (sourceAccount && rates?.[sourceAccount.currency]?.[destCurrency]) ?? 1.0;
  const estimatedConvertedAmount = Math.round(amountMinor * rate);

  // Filter registered banks
  const filteredBanks = useMemo(() => {
    return REGISTERED_BANKS.filter(b => {
      if (bankCountryFilter !== 'ALL' && b.country !== bankCountryFilter) return false;
      if (!bankSearchQuery.trim()) return true;
      const q = bankSearchQuery.toLowerCase();
      return (
        b.name.toLowerCase().includes(q) ||
        b.shortName.toLowerCase().includes(q) ||
        b.routingOrSortCode.toLowerCase().includes(q) ||
        b.swiftBic.toLowerCase().includes(q) ||
        b.countryName.toLowerCase().includes(q)
      );
    });
  }, [bankCountryFilter, bankSearchQuery]);

  // When a registered bank is clicked
  const handleSelectBank = (bank: RegisteredBank) => {
    setSelectedBankId(bank.id);
    setIsCustomBank(false);
    setCustomBankName(bank.name);
    setRecipientRouting(bank.routingOrSortCode);
    setRecipientSwift(bank.swiftBic);
    setRecipientCountry(bank.countryName);

    if (bank.country === 'UK') {
      setDestCurrency('GBP');
    } else if (bank.country === 'EU') {
      setDestCurrency('EUR');
    } else {
      setDestCurrency('USD');
    }
  };

  const handleSelectCustomBank = () => {
    setSelectedBankId(OTHER_CUSTOM_BANK_ID);
    setIsCustomBank(true);
    setCustomBankName('');
    setRecipientRouting('');
    setRecipientSwift('');
  };

  const handleReview = (e: React.FormEvent) => {
    e.preventDefault();
    if (amountMinor <= 0) {
      showToast('ERROR', 'Invalid Amount', 'Please enter a valid transfer amount greater than zero.');
      return;
    }
    if (sourceAccount && sourceAccount.availableBalanceMinor < amountMinor + wireFeeMinor) {
      showToast('ERROR', 'Insufficient Funds', 'Transfer amount plus institutional clearing fee exceeds available balance.');
      return;
    }
    if (transferMode !== 'INTERNAL') {
      if (!recipientName.trim()) {
        showToast('ERROR', 'Missing Beneficiary', 'Please provide the legal beneficiary name.');
        return;
      }
      const finalBankName = isCustomBank ? customBankName : (REGISTERED_BANKS.find(b => b.id === selectedBankId)?.name || customBankName);
      if (!finalBankName.trim()) {
        showToast('ERROR', 'Missing Bank Name', 'Please select or enter the destination bank name.');
        return;
      }
      if (!recipientAccount.trim()) {
        showToast('ERROR', 'Missing Account/IBAN', 'Please enter the beneficiary account number or IBAN.');
        return;
      }
    }
    setShowConfirmModal(true);
  };

  const handleExecuteTransfer = async () => {
    setIsProcessing(true);
    try {
      const activeBank = REGISTERED_BANKS.find(b => b.id === selectedBankId);
      const bankTitle = isCustomBank ? customBankName : (activeBank?.name || customBankName || 'External Commercial Bank');
      const rail = transferMode === 'INTERNAL'
        ? 'First Atlantic Authoritative Ledger'
        : activeBank?.clearingRail || (transferMode === 'DOMESTIC' ? 'Fedwire / Faster Payments Direct' : 'SWIFT GPI Cross-Border');

      const txRef = `FAB-WIRE-${Date.now().toString().slice(-8)}`;

      if (transferMode === 'INTERNAL') {
        const res = await executeTransfer(
          sourceAccountId,
          destAccountId,
          amountMinor,
          description || `Transfer to ${destAccount?.name}`
        );
        if (res.success) {
          const successObj = {
            type: 'INTERNAL',
            referenceNumber: txRef,
            amountMinor,
            currency: sourceAccount?.currency || 'USD',
            sourceAccount,
            destAccount,
            timestamp: new Date().toLocaleString(),
            clearingRail: rail,
            userEmail: currentUser?.email || 'client.private@firstatlantic.com',
            userPhone: currentUser?.phone || '+1 (212) 555-0199',
            beneficiaryName: destAccount?.name || 'Internal Account'
          };
          setTransferSuccess(successObj);
          setShowConfirmModal(false);
          showToast('SUCCESS', 'Transfer Posted', 'Funds credited to destination account immediately.');
        }
      } else {
        const res = await executeExternalTransfer(
          sourceAccountId,
          {
            name: recipientName,
            bankName: bankTitle,
            routingOrSortCode: recipientRouting,
            accountOrIban: recipientAccount,
            country: recipientCountry,
            currency: destCurrency
          },
          amountMinor,
          'WIRE_TRANSFER',
          description || `Institutional wire to ${recipientName}`
        );
        if (res.success) {
          const successObj = {
            type: transferMode,
            referenceNumber: txRef,
            amountMinor,
            currency: sourceAccount?.currency || 'USD',
            destCurrency,
            convertedAmountMinor: estimatedConvertedAmount,
            sourceAccount,
            recipientName,
            bankName: bankTitle,
            accountOrIban: recipientAccount,
            routingOrSortCode: recipientRouting,
            swiftBic: recipientSwift,
            country: recipientCountry,
            feeMinor: res.feeMinor || wireFeeMinor,
            timestamp: new Date().toLocaleString(),
            clearingRail: rail,
            userEmail: currentUser?.email || 'client.private@firstatlantic.com',
            userPhone: currentUser?.phone || '+1 (212) 555-0199',
            notifyEmail,
            notifySms
          };
          setTransferSuccess(successObj);
          setShowConfirmModal(false);
          showToast('SUCCESS', 'Wire Dispatched', `Cleared via ${rail}. SMS & Email alerts generated.`);
        }
      }
    } finally {
      setIsProcessing(false);
    }
  };

  const handleCopyText = (text: string) => {
    navigator.clipboard.writeText(text);
    setCopiedReceipt(true);
    setTimeout(() => setCopiedReceipt(false), 2000);
    showToast('INFO', 'Copied to Clipboard', text);
  };

  const handleApplyFxCalculation = ({
    amount,
    sourceCurrency,
    targetCurrency
  }: {
    amount: string;
    sourceCurrency: CurrencyCode;
    targetCurrency: CurrencyCode;
  }) => {
    setAmountStr(amount);
    setDestCurrency(targetCurrency);
    if (transferMode !== 'INTERNATIONAL' && sourceCurrency !== targetCurrency) {
      setTransferMode('INTERNATIONAL');
    }
    const matchingSourceAccount = accounts.find((a) => a.currency === sourceCurrency);
    if (matchingSourceAccount) {
      setSourceAccountId(matchingSourceAccount.id);
    }
    showToast(
      'INFO',
      'FX Estimation Applied',
      `Set transfer amount to ${amount} and target currency to ${targetCurrency}.`
    );
  };

  return (
    <div className="max-w-5xl mx-auto space-y-6 pb-12 font-sans">
      {/* Header & Mode Switcher (Glassmorphic) */}
      <div className="glass-panel-elevated rounded-2xl p-5 sm:p-7 space-y-5">
        <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-4">
          <div className="space-y-1.5 min-w-0">
            <div className="flex items-center gap-2 text-[11px] sm:text-xs font-bold text-[#d97706] dark:text-[#f8c22d] tracking-wider uppercase font-mono">
              <Sparkles className="w-3.5 h-3.5 text-[#d4af37] shrink-0" />
              <span className="truncate">Universal Instant Wire &amp; Bank Transfer Engine</span>
            </div>
            <h1 className="text-xl sm:text-2xl md:text-3xl font-extrabold tracking-tight text-slate-900 dark:text-white">
              Transfer &amp; Remittance Hub
            </h1>
            <p className="text-xs sm:text-sm text-slate-600 dark:text-slate-300 max-w-2xl leading-relaxed">
              Dispatch funds instantly to all registered UK, USA, European, and Worldwide institutions, or route to any custom bank globally with real-time SMS &amp; Email alerts.
            </p>
          </div>

          <div className="flex flex-col sm:flex-row items-stretch sm:items-center gap-2.5">
            {/* Currency Calculator Toggle */}
            <button
              type="button"
              onClick={() => setShowCalculator(!showCalculator)}
              className={`px-3.5 py-2 rounded-xl text-xs font-semibold flex items-center justify-center gap-1.5 transition-all cursor-pointer backdrop-blur-md ${
                showCalculator
                  ? 'bg-gradient-to-r from-[#d4af37]/20 to-[#f8c22d]/20 text-[#926500] dark:text-[#f8c22d] border border-amber-400/40 font-bold shadow-xs'
                  : 'bg-white/60 dark:bg-white/5 text-slate-700 dark:text-slate-300 border border-white/60 dark:border-white/10 hover:bg-white dark:hover:bg-white/10'
              }`}
            >
              <Calculator className="w-3.5 h-3.5 text-[#8c6d37] dark:text-[#f8c22d]" />
              <span>{showCalculator ? 'Hide FX Estimator' : 'FX Rate Estimator'}</span>
            </button>

            {/* Mode Switcher Tabs */}
            <div className="grid grid-cols-3 sm:flex sm:flex-wrap bg-white/40 dark:bg-white/5 backdrop-blur-xl p-1 rounded-xl border border-white/60 dark:border-white/10 text-xs font-semibold self-stretch sm:self-start lg:self-auto gap-1">
              <button
                type="button"
                onClick={() => {
                  setTransferMode('DOMESTIC');
                  setTransferSuccess(null);
                }}
                className={`px-3 sm:px-3.5 py-1.5 sm:py-2 rounded-lg transition-all cursor-pointer flex items-center justify-center gap-1.5 text-center ${
                  transferMode === 'DOMESTIC'
                    ? 'bg-white dark:bg-white/20 text-slate-950 dark:text-white shadow-xs font-bold border border-white/60 dark:border-white/20'
                    : 'text-slate-600 dark:text-slate-400 hover:text-slate-900 dark:hover:text-white'
                }`}
              >
                <Building className="w-3.5 h-3.5 text-[#d97706] dark:text-[#f8c22d] shrink-0" />
                <span className="truncate">UK/US Banks</span>
              </button>

              <button
                type="button"
                onClick={() => {
                  setTransferMode('INTERNATIONAL');
                  setTransferSuccess(null);
                  setShowCalculator(true);
                }}
                className={`px-3 sm:px-3.5 py-1.5 sm:py-2 rounded-lg transition-all cursor-pointer flex items-center justify-center gap-1.5 text-center ${
                  transferMode === 'INTERNATIONAL'
                    ? 'bg-white dark:bg-white/20 text-slate-950 dark:text-white shadow-xs font-bold border border-white/60 dark:border-white/20'
                    : 'text-slate-600 dark:text-slate-400 hover:text-slate-900 dark:hover:text-white'
                }`}
              >
                <Globe className="w-3.5 h-3.5 text-[#d97706] dark:text-[#f8c22d] shrink-0" />
                <span className="truncate">SWIFT FX</span>
              </button>

              <button
                type="button"
                onClick={() => {
                  setTransferMode('INTERNAL');
                  setTransferSuccess(null);
                }}
                className={`px-3 sm:px-3.5 py-1.5 sm:py-2 rounded-lg transition-all cursor-pointer flex items-center justify-center gap-1.5 text-center ${
                  transferMode === 'INTERNAL'
                    ? 'bg-white dark:bg-white/20 text-slate-950 dark:text-white shadow-xs font-bold border border-white/60 dark:border-white/20'
                    : 'text-slate-600 dark:text-slate-400 hover:text-slate-900 dark:hover:text-white'
                }`}
              >
                <ArrowLeftRight className="w-3.5 h-3.5 text-[#d97706] dark:text-[#f8c22d] shrink-0" />
                <span className="truncate">My Accounts</span>
              </button>
            </div>
          </div>
        </div>
      </div>

      {/* Real-time Multi-Currency Calculator Widget */}
      <AnimatePresence>
        {showCalculator && !transferSuccess && (
          <motion.div
            initial={{ opacity: 0, y: -10 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -10 }}
            transition={{ duration: 0.25 }}
          >
            <CurrencyExchangeCalculator
              rates={rates}
              defaultSourceCurrency={sourceAccount?.currency || 'USD'}
              defaultTargetCurrency={destCurrency}
              defaultAmount={amountStr || '5000'}
              onApplyToTransfer={handleApplyFxCalculation}
            />
          </motion.div>
        )}
      </AnimatePresence>

      {transferSuccess ? (
        /* ==================== POST-TRANSFER SUCCESS & REAL-TIME ALERTS VIEW ==================== */
        <motion.div
          initial={{ opacity: 0, scale: 0.98 }}
          animate={{ opacity: 1, scale: 1 }}
          className="bg-white dark:bg-[#0a192f] rounded-2xl p-6 sm:p-9 border border-emerald-300 dark:border-emerald-800/80 shadow-xl space-y-7"
        >
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-5 border-b border-slate-200 dark:border-slate-800">
            <div className="flex items-center gap-3.5">
              <div className="w-14 h-14 rounded-2xl bg-emerald-50 dark:bg-emerald-950/70 text-emerald-600 dark:text-emerald-400 flex items-center justify-center border border-emerald-200 dark:border-emerald-800 shrink-0 shadow-sm">
                <CheckCircle2 className="w-8 h-8" />
              </div>
              <div>
                <span className="text-xs font-mono font-bold text-emerald-600 dark:text-emerald-400 uppercase tracking-widest block">
                  Authoritative Clearing Confirmed
                </span>
                <h2 className="text-xl sm:text-2xl font-bold font-serif text-slate-900 dark:text-white">
                  Transfer Executed &amp; Dispatched
                </h2>
                <p className="text-xs sm:text-sm text-slate-500 dark:text-slate-400 font-mono">
                  Ref: <span className="font-bold text-slate-800 dark:text-slate-200">{transferSuccess.referenceNumber}</span> • {transferSuccess.timestamp}
                </p>
              </div>
            </div>

            {/* Notification Badges */}
            <div className="flex flex-wrap items-center gap-2">
              <span className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-full bg-emerald-100 dark:bg-emerald-950/80 text-emerald-800 dark:text-emerald-300 text-xs font-bold border border-emerald-300 dark:border-emerald-700">
                <Mail className="w-3.5 h-3.5" /> Email Alert Delivered
              </span>
              <span className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-full bg-blue-100 dark:bg-blue-950/80 text-blue-800 dark:text-blue-300 text-xs font-bold border border-blue-300 dark:border-blue-700">
                <Smartphone className="w-3.5 h-3.5" /> Mobile SMS Pushed
              </span>
            </div>
          </div>

          {/* Frame-Motion Card-to-Card Animated Funds Conduit */}
          <TransferFundsAnimation
            sourceAccount={transferSuccess.sourceAccount}
            destAccount={transferSuccess.destAccount}
            destBankName={transferSuccess.bankName}
            destBeneficiaryName={transferSuccess.type === 'INTERNAL' ? transferSuccess.destAccount?.name : transferSuccess.recipientName}
            destAccountOrIban={transferSuccess.accountOrIban || transferSuccess.destAccount?.accountNumber}
            amountMinor={transferSuccess.amountMinor}
            currency={transferSuccess.currency}
            destCurrency={transferSuccess.destCurrency || transferSuccess.currency}
            convertedAmountMinor={transferSuccess.convertedAmountMinor}
            clearingRail={transferSuccess.clearingRail}
            transferType={transferSuccess.type}
            referenceNumber={transferSuccess.referenceNumber}
          />

          {/* Receipt View Tabs */}
          <div className="flex bg-slate-100 dark:bg-slate-900 p-1.5 rounded-xl border border-slate-200 dark:border-slate-800 text-xs sm:text-sm font-semibold max-w-md">
            <button
              onClick={() => setReceiptActiveTab('VOUCHER')}
              className={`flex-1 py-2 rounded-lg transition-all cursor-pointer flex items-center justify-center gap-1.5 ${
                receiptActiveTab === 'VOUCHER'
                  ? 'bg-white dark:bg-[#112a4a] text-slate-900 dark:text-white shadow-xs font-bold'
                  : 'text-slate-600 dark:text-slate-400'
              }`}
            >
              <Receipt className="w-4 h-4" /> Official Voucher
            </button>
            <button
              onClick={() => setReceiptActiveTab('EMAIL')}
              className={`flex-1 py-2 rounded-lg transition-all cursor-pointer flex items-center justify-center gap-1.5 ${
                receiptActiveTab === 'EMAIL'
                  ? 'bg-white dark:bg-[#112a4a] text-slate-900 dark:text-white shadow-xs font-bold'
                  : 'text-slate-600 dark:text-slate-400'
              }`}
            >
              <Mail className="w-4 h-4" /> Email Receipt
            </button>
            <button
              onClick={() => setReceiptActiveTab('SMS')}
              className={`flex-1 py-2 rounded-lg transition-all cursor-pointer flex items-center justify-center gap-1.5 ${
                receiptActiveTab === 'SMS'
                  ? 'bg-white dark:bg-[#112a4a] text-slate-900 dark:text-white shadow-xs font-bold'
                  : 'text-slate-600 dark:text-slate-400'
              }`}
            >
              <Smartphone className="w-4 h-4" /> Mobile SMS Alert
            </button>
          </div>

          {/* Tab 1: Official Ledger Voucher */}
          {receiptActiveTab === 'VOUCHER' && (
            <div className="bg-slate-50 dark:bg-slate-900/80 rounded-2xl p-6 border border-slate-200 dark:border-slate-800 space-y-4">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-xs sm:text-sm">
                <div className="space-y-3 bg-white dark:bg-[#0a192f] p-4 rounded-xl border border-slate-200 dark:border-slate-800">
                  <span className="text-xs font-bold uppercase tracking-wider text-slate-400 block">Transaction Summary</span>
                  <div className="flex justify-between items-center py-1 border-b border-slate-100 dark:border-slate-800">
                    <span className="text-slate-500 dark:text-slate-400">Transferred Amount:</span>
                    <CurrencyDisplay
                      amountMinor={transferSuccess.amountMinor}
                      currency={transferSuccess.currency}
                      size="lg"
                      className="text-slate-900 dark:text-white font-bold"
                    />
                  </div>
                  {transferSuccess.feeMinor > 0 && (
                    <div className="flex justify-between py-1 border-b border-slate-100 dark:border-slate-800">
                      <span className="text-slate-500 dark:text-slate-400">Institutional Dispatch Fee:</span>
                      <span className="font-mono font-semibold text-slate-800 dark:text-slate-200">${(transferSuccess.feeMinor / 100).toFixed(2)} USD</span>
                    </div>
                  )}
                  <div className="flex justify-between py-1 border-b border-slate-100 dark:border-slate-800">
                    <span className="text-slate-500 dark:text-slate-400">Funding Account:</span>
                    <span className="font-semibold text-slate-900 dark:text-white">{transferSuccess.sourceAccount?.name}</span>
                  </div>
                  <div className="flex justify-between py-1">
                    <span className="text-slate-500 dark:text-slate-400">Clearing Network:</span>
                    <span className="font-bold text-emerald-600 dark:text-emerald-400">{transferSuccess.clearingRail}</span>
                  </div>
                </div>

                <div className="space-y-3 bg-white dark:bg-[#0a192f] p-4 rounded-xl border border-slate-200 dark:border-slate-800">
                  <span className="text-xs font-bold uppercase tracking-wider text-slate-400 block">Beneficiary Information</span>
                  <div className="flex justify-between py-1 border-b border-slate-100 dark:border-slate-800">
                    <span className="text-slate-500 dark:text-slate-400">Recipient Name:</span>
                    <span className="font-bold text-slate-900 dark:text-white">
                      {transferSuccess.type === 'INTERNAL' ? transferSuccess.destAccount?.name : transferSuccess.recipientName}
                    </span>
                  </div>
                  {transferSuccess.bankName && (
                    <div className="flex justify-between py-1 border-b border-slate-100 dark:border-slate-800">
                      <span className="text-slate-500 dark:text-slate-400">Receiving Bank:</span>
                      <span className="font-semibold text-slate-900 dark:text-white">{transferSuccess.bankName}</span>
                    </div>
                  )}
                  {transferSuccess.accountOrIban && (
                    <div className="flex justify-between py-1 border-b border-slate-100 dark:border-slate-800">
                      <span className="text-slate-500 dark:text-slate-400">Account / IBAN:</span>
                      <span className="font-mono text-slate-900 dark:text-white">{transferSuccess.accountOrIban}</span>
                    </div>
                  )}
                  <div className="flex justify-between py-1">
                    <span className="text-slate-500 dark:text-slate-400">Tracking Status:</span>
                    <span className="font-bold text-emerald-600 dark:text-emerald-400 flex items-center gap-1">
                      <Check className="w-4 h-4" /> Settled / Dispatched
                    </span>
                  </div>
                </div>
              </div>
            </div>
          )}

          {/* Tab 2: Email Receipt Simulation */}
          {receiptActiveTab === 'EMAIL' && (
            <div className="bg-white dark:bg-[#07101e] rounded-2xl p-5 sm:p-7 border border-slate-200 dark:border-slate-800 shadow-inner space-y-4">
              <div className="flex items-center justify-between pb-3 border-b border-slate-200 dark:border-slate-800 text-xs sm:text-sm">
                <div>
                  <p className="font-bold text-slate-900 dark:text-white">From: <span className="font-mono font-normal text-slate-600 dark:text-slate-300">alerts@firstatlanticbank.com</span></p>
                  <p className="font-bold text-slate-900 dark:text-white">To: <span className="font-mono font-normal text-slate-600 dark:text-slate-300">{transferSuccess.userEmail}</span></p>
                  <p className="font-bold text-slate-900 dark:text-white">Subject: <span className="font-normal text-[#8c6d37] dark:text-[#e5ca95]">Transaction Notification: Official Wire Transfer #{transferSuccess.referenceNumber}</span></p>
                </div>
                <span className="text-[11px] bg-emerald-100 text-emerald-800 dark:bg-emerald-950 dark:text-emerald-300 px-2.5 py-1 rounded-full font-bold">
                  Delivered
                </span>
              </div>

              <div className="p-5 bg-slate-50 dark:bg-slate-900/60 rounded-xl space-y-3 text-xs sm:text-sm leading-relaxed text-slate-700 dark:text-slate-300 font-sans border border-slate-200 dark:border-slate-800">
                <p className="font-semibold text-slate-900 dark:text-white">
                  Dear {currentUser?.firstName || 'Valued'} {currentUser?.lastName || 'Client'},
                </p>
                <p>
                  This is an automated confirmation that a transfer of <strong>{transferSuccess.currency === 'GBP' ? '£' : transferSuccess.currency === 'EUR' ? '€' : '$'}{(transferSuccess.amountMinor / 100).toLocaleString('en-US', { minimumFractionDigits: 2 })} {transferSuccess.currency}</strong> was successfully debited from your account <strong>{transferSuccess.sourceAccount?.name}</strong> and dispatched to <strong>{transferSuccess.type === 'INTERNAL' ? transferSuccess.destAccount?.name : transferSuccess.recipientName}</strong> ({transferSuccess.bankName || 'Internal First Atlantic Account'}).
                </p>
                <div className="p-3 bg-white dark:bg-[#0a192f] rounded-lg border border-slate-200 dark:border-slate-700 font-mono text-xs space-y-1">
                  <div>Reference Number: <span className="font-bold text-slate-900 dark:text-white">{transferSuccess.referenceNumber}</span></div>
                  <div>Settlement Rail: <span className="text-emerald-600 dark:text-emerald-400 font-bold">{transferSuccess.clearingRail}</span></div>
                  <div>Timestamp: {transferSuccess.timestamp}</div>
                </div>
                <p className="text-xs text-slate-500 dark:text-slate-400">
                  If you did not authorize this transaction, contact your 24/7 First Atlantic Wealth Concierge immediately at +1 (800) 555-FAB-USA or via FIRST ATLANTIC BANK ASSISTANT AI.
                </p>
              </div>
            </div>
          )}

          {/* Tab 3: Mobile Phone SMS Alert Simulation */}
          {receiptActiveTab === 'SMS' && (
            <div className="max-w-sm mx-auto bg-slate-950 text-white rounded-3xl p-5 border-4 border-slate-800 shadow-2xl space-y-4">
              <div className="flex items-center justify-between text-xs text-slate-400 pb-2 border-b border-slate-800">
                <span className="font-mono">9:41 AM</span>
                <span className="font-bold text-slate-200">FAB-ALERT SMS</span>
                <span>5G 100%</span>
              </div>

              <div className="bg-slate-900 rounded-2xl p-4 border border-slate-800 text-xs sm:text-sm space-y-2">
                <div className="flex items-center gap-2 text-emerald-400 font-bold text-xs">
                  <ShieldCheck className="w-4 h-4" />
                  <span>FIRST ATLANTIC BANK ALERT</span>
                </div>
                <p className="text-slate-200 leading-relaxed text-xs">
                  FAB Alert: Debit of {transferSuccess.currency === 'GBP' ? '£' : transferSuccess.currency === 'EUR' ? '€' : '$'}{(transferSuccess.amountMinor / 100).toLocaleString('en-US', { minimumFractionDigits: 2 })} on {transferSuccess.sourceAccount?.name}. Beneficiary: {transferSuccess.type === 'INTERNAL' ? transferSuccess.destAccount?.name : transferSuccess.recipientName} at {transferSuccess.bankName || 'FAB'}. Ref: {transferSuccess.referenceNumber}.
                </p>
                <div className="text-[10px] text-slate-500 font-mono pt-1">
                  Sent to {transferSuccess.userPhone} • Delivered worldwide
                </div>
              </div>
            </div>
          )}

          {/* Action Buttons */}
          <div className="flex flex-wrap items-center justify-between gap-3 pt-3 border-t border-slate-200 dark:border-slate-800">
            <button
              onClick={() => handleCopyText(transferSuccess.referenceNumber)}
              className="px-4 py-2.5 rounded-xl border border-slate-300 dark:border-slate-700 text-slate-700 dark:text-slate-300 font-semibold text-xs sm:text-sm flex items-center gap-2 hover:bg-slate-50 dark:hover:bg-slate-800 transition-colors cursor-pointer"
            >
              {copiedReceipt ? <Check className="w-4 h-4 text-emerald-500" /> : <Copy className="w-4 h-4" />}
              <span>{copiedReceipt ? 'Reference Copied!' : 'Copy Wire Reference'}</span>
            </button>

            <button
              onClick={() => {
                setTransferSuccess(null);
                setAmountStr('5000');
              }}
              className="px-6 py-2.5 rounded-xl bg-[#0a192f] dark:bg-[#112a4a] hover:bg-[#132d52] text-white font-bold text-xs sm:text-sm uppercase tracking-wider transition-all cursor-pointer border border-[#c5a880]/30 shadow-md"
            >
              Start Another Transfer
            </button>
          </div>
        </motion.div>
      ) : (
        /* ==================== TRANSFER INITIATION FORM (GLASSMORPHIC) ==================== */
        <form onSubmit={handleReview} className="glass-panel-elevated rounded-2xl p-5 sm:p-7 space-y-5 sm:space-y-6 transition-all">
          {/* Step 1: Source Account of Funds */}
          <div className="space-y-2">
            <label className="block text-xs font-bold uppercase tracking-wider text-slate-700 dark:text-slate-300">
              1. Source Account (Funds Origin)
            </label>
            <select
              value={sourceAccountId}
              onChange={(e) => setSourceAccountId(e.target.value)}
              className="glass-input w-full px-4 py-3 text-xs sm:text-sm rounded-xl text-slate-900 dark:text-slate-100 font-semibold focus:outline-none focus:ring-2 focus:ring-[#f8c22d]"
            >
              {accounts.map((acc) => (
                <option key={acc.id} value={acc.id} className="bg-white dark:bg-slate-900 text-slate-900 dark:text-white">
                  {acc.name} ({acc.accountNumber}) — Available: ${((acc.availableBalanceMinor || 0) / 100).toLocaleString('en-US', { minimumFractionDigits: 2 })} {acc.currency}
                </option>
              ))}
            </select>

            {sourceAccount && (
              <div className="p-3.5 rounded-xl bg-white/60 dark:bg-white/5 border border-white/60 dark:border-white/10 flex items-center justify-between gap-2 min-w-0 backdrop-blur-md">
                <div className="flex items-center gap-3 min-w-0">
                  <div className="w-8 h-8 rounded-xl bg-gradient-to-tr from-[#d4af37] to-[#f8c22d] text-slate-950 flex items-center justify-center font-bold text-xs shrink-0 shadow-xs">
                    {sourceAccount.currency === 'EUR' ? '€' : sourceAccount.currency === 'GBP' ? '£' : '$'}
                  </div>
                  <div className="min-w-0">
                    <span className="text-xs font-bold text-slate-900 dark:text-white truncate block max-w-[160px] sm:max-w-xs">{sourceAccount.name}</span>
                    <span className="text-[10px] sm:text-[11px] text-slate-500 font-mono truncate block">Acct: {sourceAccount.accountNumber} • {sourceAccount.region}</span>
                  </div>
                </div>
                <div className="text-right shrink-0">
                  <span className="text-[9px] sm:text-[10px] uppercase font-mono text-slate-400 block leading-tight">Available</span>
                  <span className="text-xs sm:text-sm font-mono font-bold text-emerald-600 dark:text-emerald-400 whitespace-nowrap">
                    {sourceAccount.currency === 'EUR' ? '€' : sourceAccount.currency === 'GBP' ? '£' : '$'}{((sourceAccount.availableBalanceMinor || 0) / 100).toLocaleString('en-US', { minimumFractionDigits: 2 })}
                  </span>
                </div>
              </div>
            )}
          </div>

          {/* Step 2: Destination Configuration */}
          {transferMode === 'INTERNAL' ? (
            <div className="space-y-2">
              <label className="block text-xs font-bold uppercase tracking-wider text-slate-700 dark:text-slate-300">
                2. Destination Account (Internal First Atlantic)
              </label>
              <select
                value={destAccountId}
                onChange={(e) => setDestAccountId(e.target.value)}
                className="glass-input w-full px-4 py-3 text-xs sm:text-sm rounded-xl text-slate-900 dark:text-slate-100 font-semibold focus:outline-none focus:ring-2 focus:ring-[#f8c22d]"
              >
                {accounts
                  .filter((a) => a.id !== sourceAccountId)
                  .map((acc) => (
                    <option key={acc.id} value={acc.id} className="bg-white dark:bg-slate-900 text-slate-900 dark:text-white">
                      {acc.name} ({acc.accountNumber}) — {acc.currency}
                    </option>
                  ))}
              </select>

              {destAccount && (
                <div className="p-3.5 rounded-xl bg-white/60 dark:bg-white/5 border border-white/60 dark:border-white/10 flex items-center justify-between gap-2 min-w-0 backdrop-blur-md">
                  <div className="flex items-center gap-3 min-w-0">
                    <div className="w-8 h-8 rounded-xl bg-emerald-500/20 text-emerald-400 border border-emerald-500/30 flex items-center justify-center font-bold text-xs shrink-0 shadow-xs">
                      {destAccount.currency === 'EUR' ? '€' : destAccount.currency === 'GBP' ? '£' : '$'}
                    </div>
                    <div className="min-w-0">
                      <span className="text-xs font-bold text-slate-900 dark:text-white truncate block max-w-[160px] sm:max-w-xs">{destAccount.name}</span>
                      <span className="text-[10px] sm:text-[11px] text-slate-500 font-mono truncate block">Acct: {destAccount.accountNumber} • {destAccount.region}</span>
                    </div>
                  </div>
                  <div className="text-right shrink-0">
                    <span className="text-[9px] sm:text-[10px] uppercase font-mono text-slate-400 block leading-tight">Balance</span>
                    <span className="text-xs sm:text-sm font-mono font-bold text-slate-900 dark:text-white whitespace-nowrap">
                      {destAccount.currency === 'EUR' ? '€' : destAccount.currency === 'GBP' ? '£' : '$'}{((destAccount.balanceMinor || 0) / 100).toLocaleString('en-US', { minimumFractionDigits: 2 })}
                    </span>
                  </div>
                </div>
              )}
            </div>
          ) : (
            <div className="space-y-4 p-4 sm:p-5 bg-white/40 dark:bg-white/5 rounded-2xl border border-white/60 dark:border-white/10 backdrop-blur-md">
              <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2">
                <h3 className="text-xs sm:text-sm font-bold uppercase tracking-wider text-slate-900 dark:text-white flex items-center gap-1.5">
                  <Building className="w-3.5 h-3.5 text-[#d97706] dark:text-[#f8c22d] shrink-0" />
                  <span>2. Destination Bank &amp; Beneficiary Details</span>
                </h3>
              </div>

              {/* Country / Bank Region Filter Tabs */}
              <div className="flex flex-wrap items-center gap-1.5">
                <span className="text-[11px] font-semibold text-slate-500 dark:text-slate-400 mr-1">Filter:</span>
                {[
                  { id: 'ALL', label: 'All' },
                  { id: 'US', label: '🇺🇸 US' },
                  { id: 'UK', label: '🇬🇧 UK' },
                  { id: 'EU', label: '🇪🇺 EU' },
                  { id: 'GLOBAL', label: '🌐 Global' }
                ].map((tab) => (
                  <button
                    key={tab.id}
                    type="button"
                    onClick={() => {
                      setBankCountryFilter(tab.id as any);
                    }}
                    className={`px-3 py-1 rounded-lg text-[11px] sm:text-xs font-semibold transition-all cursor-pointer backdrop-blur-md ${
                      bankCountryFilter === tab.id
                        ? 'bg-slate-950 text-white dark:bg-white dark:text-slate-950 font-bold shadow-xs'
                        : 'bg-white/60 dark:bg-white/5 text-slate-700 dark:text-slate-300 border border-white/60 dark:border-white/10 hover:bg-white dark:hover:bg-white/15'
                    }`}
                  >
                    {tab.label}
                  </button>
                ))}
              </div>

              {/* Bank Search Input */}
              <div className="relative">
                <Search className="w-3.5 h-3.5 absolute left-3.5 top-1/2 -translate-y-1/2 text-slate-400" />
                <input
                  type="text"
                  placeholder="Search registered UK/US banks by name, sort code, or SWIFT..."
                  value={bankSearchQuery}
                  onChange={(e) => setBankSearchQuery(e.target.value)}
                  className="glass-input w-full pl-9 pr-4 py-2.5 text-xs sm:text-sm rounded-xl text-slate-900 dark:text-slate-100 focus:outline-none focus:ring-2 focus:ring-[#f8c22d]"
                />
              </div>

              {/* Grid of Registered Banks */}
              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-2.5 max-h-48 sm:max-h-56 overflow-y-auto pr-1">
                {filteredBanks.map((bank) => {
                  const isSelected = !isCustomBank && selectedBankId === bank.id;
                  return (
                    <button
                      key={bank.id}
                      type="button"
                      onClick={() => handleSelectBank(bank)}
                      className={`p-2.5 rounded-xl text-left transition-all cursor-pointer flex items-start justify-between gap-1.5 backdrop-blur-md ${
                        isSelected
                          ? 'bg-[#f8c22d]/15 border-2 border-[#f8c22d] shadow-xs'
                          : 'bg-white/70 dark:bg-white/5 border border-white/70 dark:border-white/10 hover:border-[#f8c22d]/60'
                      }`}
                    >
                      <div className="space-y-0.5 min-w-0">
                        <div className="flex items-center gap-1">
                          <span className="text-xs">
                            {bank.country === 'US' ? '🇺🇸' : bank.country === 'UK' ? '🇬🇧' : bank.country === 'EU' ? '🇪🇺' : '🌐'}
                          </span>
                          <span className="font-bold text-xs text-slate-900 dark:text-white truncate block">
                            {bank.shortName}
                          </span>
                        </div>
                        <p className="text-[10px] text-slate-500 dark:text-slate-400 truncate">
                          {bank.codeType}: <span className="font-mono font-semibold text-slate-700 dark:text-slate-300">{bank.routingOrSortCode}</span>
                        </p>
                        <span className="text-[9px] text-emerald-600 dark:text-emerald-400 font-mono block font-semibold">
                          {bank.clearingRail}
                        </span>
                      </div>
                      {isSelected && <Check className="w-4 h-4 text-[#d97706] dark:text-[#f8c22d] shrink-0 stroke-[2.5]" />}
                    </button>
                  );
                })}

                {/* Option for Unregistered / Custom Bank */}
                <button
                  type="button"
                  onClick={handleSelectCustomBank}
                  className={`p-2.5 rounded-xl text-left transition-all cursor-pointer flex items-start justify-between gap-1.5 backdrop-blur-md ${
                    isCustomBank
                      ? 'bg-[#f8c22d]/15 border-2 border-[#f8c22d] shadow-xs'
                      : 'bg-white/40 dark:bg-white/5 border border-dashed border-slate-300 dark:border-white/20 hover:border-[#f8c22d]/60'
                  }`}
                >
                  <div className="space-y-0.5">
                    <div className="flex items-center gap-1 text-xs font-bold text-slate-900 dark:text-white">
                      <span>➕ Custom Bank</span>
                    </div>
                    <p className="text-[10px] text-slate-500 dark:text-slate-400">
                      Input bank details manually
                    </p>
                  </div>
                  {isCustomBank && <Check className="w-4 h-4 text-[#d97706] dark:text-[#f8c22d] shrink-0 stroke-[2.5]" />}
                </button>
              </div>

              {/* Beneficiary Details Inputs */}
              <div className="pt-3 border-t border-white/60 dark:border-white/10 space-y-3">
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                  <div>
                    <label className="block text-xs font-bold text-slate-700 dark:text-slate-300 mb-1">
                      Beneficiary Legal Name *
                    </label>
                    <input
                      type="text"
                      required
                      value={recipientName}
                      onChange={(e) => setRecipientName(e.target.value)}
                      placeholder="e.g. Jonathan Vance"
                      className="glass-input w-full px-3.5 py-2.5 text-xs sm:text-sm rounded-xl text-slate-900 dark:text-slate-100 font-medium"
                    />
                  </div>

                  <div>
                    <label className="block text-xs font-bold text-slate-700 dark:text-slate-300 mb-1">
                      Beneficiary Bank Name *
                    </label>
                    <input
                      type="text"
                      required
                      value={isCustomBank ? customBankName : (REGISTERED_BANKS.find(b => b.id === selectedBankId)?.name || customBankName)}
                      onChange={(e) => {
                        setCustomBankName(e.target.value);
                        setIsCustomBank(true);
                      }}
                      placeholder="e.g. Barclays Bank UK PLC"
                      className="glass-input w-full px-3.5 py-2.5 text-xs sm:text-sm rounded-xl text-slate-900 dark:text-slate-100 font-medium"
                    />
                  </div>
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                  <div>
                    <label className="block text-xs font-bold text-slate-700 dark:text-slate-300 mb-1">
                      {transferMode === 'DOMESTIC' ? 'ABA Routing / UK Sort Code *' : 'SWIFT / BIC Code *'}
                    </label>
                    <input
                      type="text"
                      required
                      value={recipientRouting}
                      onChange={(e) => setRecipientRouting(e.target.value)}
                      placeholder="9-digit ABA or 6-digit Sort Code"
                      className="glass-input w-full px-3.5 py-2.5 text-xs sm:text-sm rounded-xl text-slate-900 dark:text-slate-100 font-mono font-semibold"
                    />
                  </div>

                  <div>
                    <label className="block text-xs font-bold text-slate-700 dark:text-slate-300 mb-1">
                      Account # / IBAN *
                    </label>
                    <input
                      type="text"
                      required
                      value={recipientAccount}
                      onChange={(e) => setRecipientAccount(e.target.value)}
                      placeholder="Account Number or IBAN"
                      className="glass-input w-full px-3.5 py-2.5 text-xs sm:text-sm rounded-xl text-slate-900 dark:text-slate-100 font-mono font-semibold"
                    />
                  </div>
                </div>

                {/* Country & Currency selector for international */}
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                  <div>
                    <label className="block text-xs font-bold text-slate-700 dark:text-slate-300 mb-1">
                      Destination Currency
                    </label>
                    <select
                      value={destCurrency}
                      onChange={(e) => setDestCurrency(e.target.value as CurrencyCode)}
                      className="glass-input w-full px-3.5 py-2.5 text-xs sm:text-sm rounded-xl text-slate-900 dark:text-slate-100 font-medium"
                    >
                      <option value="USD" className="bg-white dark:bg-slate-900">USD — US Dollar ($)</option>
                      <option value="GBP" className="bg-white dark:bg-slate-900">GBP — British Pound Sterling (£)</option>
                      <option value="EUR" className="bg-white dark:bg-slate-900">EUR — European Euro (€)</option>
                    </select>
                  </div>

                  <div>
                    <label className="block text-xs font-bold text-slate-700 dark:text-slate-300 mb-1">
                      Beneficiary Country
                    </label>
                    <input
                      type="text"
                      value={recipientCountry}
                      onChange={(e) => setRecipientCountry(e.target.value)}
                      placeholder="e.g. United States, United Kingdom"
                      className="glass-input w-full px-3.5 py-2.5 text-xs sm:text-sm rounded-xl text-slate-900 dark:text-slate-100 font-medium"
                    />
                  </div>
                </div>
              </div>
            </div>
          )}

          {/* Step 3: Transfer Amount & Presets */}
          <div className="space-y-3">
            <div className="flex items-center justify-between">
              <label className="block text-xs font-bold uppercase tracking-wider text-slate-700 dark:text-slate-300">
                3. Transfer Amount ({sourceAccount?.currency})
              </label>
              <span className="text-[11px] sm:text-xs text-slate-500 dark:text-slate-400 font-mono">
                Avail: ${((sourceAccount?.availableBalanceMinor || 0) / 100).toLocaleString('en-US', { minimumFractionDigits: 2 })}
              </span>
            </div>

            <div className="relative">
              <span className="absolute left-4 top-1/2 -translate-y-1/2 text-xl font-bold text-slate-500">
                {sourceAccount?.currency === 'USD' ? '$' : sourceAccount?.currency === 'GBP' ? '£' : '€'}
              </span>
              <input
                type="number"
                step="0.01"
                required
                value={amountStr}
                onChange={(e) => setAmountStr(e.target.value)}
                placeholder="0.00"
                className="glass-input w-full pl-10 pr-4 py-3.5 text-xl font-mono font-bold rounded-2xl text-slate-900 dark:text-white"
              />
            </div>

            {/* Fast Transfer Preset Buttons */}
            <div className="flex flex-wrap items-center gap-1.5 pt-0.5">
              <span className="text-[11px] font-semibold text-slate-500 dark:text-slate-400 mr-1">Quick:</span>
              {[1000, 5000, 10000, 25000, 50000, 100000].map((preset) => (
                <button
                  key={preset}
                  type="button"
                  onClick={() => setAmountStr(preset.toString())}
                  className="px-3 py-1.5 rounded-xl bg-white/60 hover:bg-white dark:bg-white/5 dark:hover:bg-white/15 text-[11px] sm:text-xs font-mono font-bold text-slate-800 dark:text-slate-200 border border-white/60 dark:border-white/10 transition-all cursor-pointer backdrop-blur-md active:scale-95 shadow-2xs"
                >
                  +${preset >= 1000 ? `${preset / 1000}k` : preset}
                </button>
              ))}
            </div>
          </div>

          {/* Step 4: Memo & Notifications */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 pt-1">
            <div>
              <label className="block text-xs font-bold uppercase tracking-wider text-slate-700 dark:text-slate-300 mb-1">
                Memo / Reference (Optional)
              </label>
              <input
                type="text"
                value={description}
                onChange={(e) => setDescription(e.target.value)}
                placeholder="e.g. Escrow completion"
                className="glass-input w-full px-3.5 py-3 text-xs sm:text-sm rounded-xl text-slate-900 dark:text-white"
              />
            </div>

            {/* Notification Checkboxes */}
            <div className="space-y-1.5 p-3 bg-white/50 dark:bg-white/5 rounded-xl border border-white/60 dark:border-white/10 backdrop-blur-md">
              <span className="text-[11px] sm:text-xs font-bold uppercase tracking-wider text-slate-700 dark:text-slate-300 block">
                Instant Notification Dispatch
              </span>
              <div className="flex flex-col gap-1.5 pt-0.5">
                <label className="flex items-center gap-2 text-xs text-slate-700 dark:text-slate-300 font-medium cursor-pointer">
                  <input
                    type="checkbox"
                    checked={notifyEmail}
                    onChange={(e) => setNotifyEmail(e.target.checked)}
                    className="rounded text-[#f8c22d] focus:ring-[#f8c22d]"
                  />
                  <span>Email Clearance Receipt</span>
                </label>
                <label className="flex items-center gap-2 text-xs text-slate-700 dark:text-slate-300 font-medium cursor-pointer">
                  <input
                    type="checkbox"
                    checked={notifySms}
                    onChange={(e) => setNotifySms(e.target.checked)}
                    className="rounded text-[#f8c22d] focus:ring-[#f8c22d]"
                  />
                  <span>Mobile SMS Alert (Worldwide)</span>
                </label>
              </div>
            </div>
          </div>

          {/* Live FX Calculation breakdown if applicable */}
          {sourceAccount && sourceAccount.currency !== destCurrency && transferMode !== 'INTERNAL' && (
            <div className="p-4 rounded-xl bg-amber-500/10 border border-amber-500/20 text-xs sm:text-sm text-amber-950 dark:text-amber-300 space-y-1.5 font-mono backdrop-blur-md">
              <div className="flex justify-between">
                <span>Locked Spot Rate:</span>
                <span className="font-bold">1 {sourceAccount.currency} = {rate} {destCurrency}</span>
              </div>
              <div className="flex justify-between">
                <span>Recipient Receives:</span>
                <span className="font-bold">{destCurrency === 'GBP' ? '£' : destCurrency === 'EUR' ? '€' : '$'}{(estimatedConvertedAmount / 100).toLocaleString('en-US', { minimumFractionDigits: 2 })} {destCurrency}</span>
              </div>
              <div className="flex justify-between text-slate-500 dark:text-slate-400 text-[11px]">
                <span>Wire Dispatch Fee:</span>
                <span>${(wireFeeMinor / 100).toFixed(2)} USD</span>
              </div>
            </div>
          )}

          {/* Submit Button */}
          <button
            type="submit"
            className="w-full py-3.5 sm:py-4 rounded-2xl bg-gradient-to-r from-[#d4af37] via-[#f8c22d] to-[#deb02c] hover:brightness-105 text-slate-950 font-extrabold text-xs sm:text-sm uppercase tracking-widest transition-all shadow-lg flex items-center justify-center gap-2 cursor-pointer border border-white/40 active:scale-[0.99]"
          >
            <Lock className="w-4 h-4 text-slate-950 stroke-[2.5]" />
            <span>Review &amp; Authorize Transfer</span>
          </button>
        </form>
      )}

      {/* Confirmation Modal (Glass) */}
      {showConfirmModal && (
        <div className="fixed inset-0 z-50 bg-slate-950/70 backdrop-blur-md flex items-center justify-center p-4 font-sans">
          <div className="bg-white/90 dark:bg-[#0f172a]/90 backdrop-blur-2xl rounded-3xl max-w-lg w-full p-6 sm:p-7 shadow-2xl border border-white/60 dark:border-white/15 space-y-5 text-slate-900 dark:text-slate-100 animate-in fade-in zoom-in-95 duration-150">
            <div className="flex items-center justify-between pb-3 border-b border-slate-200/60 dark:border-white/10">
              <div className="flex items-center gap-2.5">
                <div className="w-8 h-8 rounded-full bg-emerald-500/20 text-emerald-500 flex items-center justify-center">
                  <ShieldCheck className="w-5 h-5 stroke-[2.5]" />
                </div>
                <h3 className="text-base sm:text-lg font-bold text-slate-900 dark:text-white">
                  Authorize Transfer &amp; Wire
                </h3>
              </div>
              <button
                onClick={() => setShowConfirmModal(false)}
                className="p-1 rounded-full text-slate-400 hover:text-slate-700 dark:hover:text-white text-xl font-bold cursor-pointer"
              >
                &times;
              </button>
            </div>

            <div className="space-y-1.5 text-center py-2 bg-white/60 dark:bg-white/5 rounded-2xl p-4 border border-white/60 dark:border-white/10 backdrop-blur-md">
              <span className="text-xs text-slate-500 dark:text-slate-400 uppercase font-bold tracking-wider">Debit Total</span>
              <CurrencyDisplay
                amountMinor={amountMinor}
                currency={sourceAccount?.currency || 'USD'}
                size="2xl"
                className="text-slate-900 dark:text-white font-bold"
              />
              {wireFeeMinor > 0 && (
                <span className="text-xs text-slate-500 dark:text-slate-400 block font-mono">
                  + ${(wireFeeMinor / 100).toFixed(2)} USD clearing fee
                </span>
              )}
            </div>

            <div className="bg-white/60 dark:bg-white/5 rounded-2xl p-4 border border-white/60 dark:border-white/10 text-xs sm:text-sm text-slate-700 dark:text-slate-300 space-y-2.5 font-mono backdrop-blur-md">
              <div className="flex justify-between">
                <span className="text-slate-500 dark:text-slate-400 font-sans">Origin:</span>
                <span className="font-bold text-slate-900 dark:text-white">{sourceAccount?.name}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-slate-500 dark:text-slate-400 font-sans">Beneficiary:</span>
                <span className="font-bold font-sans text-slate-900 dark:text-white">
                  {transferMode === 'INTERNAL' ? destAccount?.name : recipientName}
                </span>
              </div>
              {transferMode !== 'INTERNAL' && (
                <div className="flex justify-between">
                  <span className="text-slate-500 dark:text-slate-400 font-sans">Bank:</span>
                  <span className="font-bold font-sans text-slate-900 dark:text-white">
                    {isCustomBank ? customBankName : (REGISTERED_BANKS.find(b => b.id === selectedBankId)?.name || customBankName)}
                  </span>
                </div>
              )}
              <div className="flex justify-between">
                <span className="text-slate-500 dark:text-slate-400 font-sans">Alert Dispatch:</span>
                <span className="font-bold text-emerald-600 dark:text-emerald-400 font-sans">
                  Email ({currentUser?.email}) &amp; Mobile SMS
                </span>
              </div>
            </div>

            <div className="flex gap-3 pt-2">
              <button
                type="button"
                onClick={() => setShowConfirmModal(false)}
                className="flex-1 py-3 rounded-xl border border-slate-300 dark:border-white/15 text-slate-700 dark:text-slate-300 font-semibold text-xs sm:text-sm cursor-pointer hover:bg-white/80 dark:hover:bg-white/10 transition-colors"
              >
                Cancel
              </button>
              <button
                type="button"
                disabled={isProcessing}
                onClick={handleExecuteTransfer}
                className="flex-1 py-3 rounded-xl bg-gradient-to-r from-[#d4af37] to-[#f8c22d] text-slate-950 font-bold text-xs sm:text-sm uppercase tracking-wider flex items-center justify-center gap-2 shadow-md cursor-pointer border border-white/40 active:scale-95"
              >
                {isProcessing ? (
                  <RefreshCw className="w-4 h-4 animate-spin text-slate-950" />
                ) : (
                  <>
                    <Lock className="w-4 h-4 text-slate-950 stroke-[2.5]" />
                    <span>Authorize &amp; Execute</span>
                  </>
                )}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
