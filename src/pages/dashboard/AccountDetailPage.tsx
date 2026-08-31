import React, { useState } from 'react';
import { useBank } from '../../context/BankContext';
import { CurrencyDisplay } from '../../components/common/CurrencyDisplay';
import { StatusBadge } from '../../components/common/StatusBadge';
import { GlassPanel } from '../../components/glass/GlassPanel';
import { GlassButton } from '../../components/glass/GlassButton';
import { GlassTabs } from '../../components/glass/GlassTabs';
import { GlassSearchBar } from '../../components/glass/GlassSearchBar';
import {
  Search,
  Filter,
  Download,
  ArrowUpRight,
  ArrowDownLeft,
  Calendar,
  Building2,
  FileSpreadsheet,
  CheckCircle2,
  Copy,
  Info,
  ShieldCheck,
  PlusCircle,
  Clock,
  Landmark,
  FileText,
  AlertCircle,
  Globe2,
  CreditCard,
  Briefcase,
  ChevronRight,
  UserCheck
} from 'lucide-react';
import { LedgerEntry, BankRegion } from '../../types';

export const AccountDetailPage: React.FC = () => {
  const {
    accounts,
    selectedAccountId,
    setSelectedAccountId,
    recentTransactions,
    setCurrentView,
    showToast,
    submitAccountApplication,
    region
  } = useBank();

  // Mode: View existing accounts vs. Open new account application
  const [activeTab, setActiveTab] = useState<'LEDGER' | 'APPLY'>('LEDGER');

  // Ledger state
  const [search, setSearch] = useState('');
  const [selectedCategory, setSelectedCategory] = useState('ALL');
  const [selectedTx, setSelectedTx] = useState<LedgerEntry | null>(null);

  // New Account Application Form State
  const [appForm, setAppForm] = useState({
    firstName: '',
    middleName: '',
    lastName: '',
    dateOfBirth: '',
    email: '',
    phone: '',
    countryCode: '+49',
    nationality: 'Germany',
    bookingRegion: 'EU' as BankRegion,
    accountType: 'CHECKING_PREMIER',
    currency: 'EUR',
    initialDepositAmount: '25000',
    requestDebitCard: true,
    streetAddress: '',
    apartment: '',
    city: '',
    stateOrProvince: '',
    postalCode: '',
    countryOfResidence: 'Germany',
    taxId: '',
    employmentStatus: 'EXECUTIVE',
    employerName: '',
    annualIncomeEur: '150000',
    sourceOfFunds: 'SALARY_AND_BONUS',
    isPep: false,
    termsAccepted: false,
    fatcaAccepted: false
  });

  const [isSubmitting, setIsSubmitting] = useState(false);
  const [formError, setFormError] = useState('');
  const [submittedRef, setSubmittedRef] = useState<string | null>(null);

  const currentAccount =
    accounts.find((a) => a.id === selectedAccountId) || accounts[0];

  const filteredTransactions = recentTransactions.filter((tx) => {
    const matchesSearch =
      tx.description.toLowerCase().includes(search.toLowerCase()) ||
      tx.counterparty.toLowerCase().includes(search.toLowerCase()) ||
      tx.referenceNumber.toLowerCase().includes(search.toLowerCase());

    const matchesCategory =
      selectedCategory === 'ALL' || tx.category === selectedCategory;

    return matchesSearch && matchesCategory;
  });

  const copyToClipboard = (text: string, label: string) => {
    navigator.clipboard.writeText(text);
    showToast('SUCCESS', 'Copied to Clipboard', `${label} copied: ${text}`);
  };

  const handleExport = (format: 'CSV' | 'PDF') => {
    showToast(
      'SUCCESS',
      `Export Generated (${format})`,
      `Official transaction statement for ${currentAccount?.name} has been compiled and downloaded.`
    );
  };

  const handleApplicationSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setFormError('');

    if (!appForm.firstName.trim() || !appForm.lastName.trim() || !appForm.email.trim() || !appForm.phone.trim()) {
      setFormError('Please complete all primary legal name and contact fields.');
      return;
    }

    if (!appForm.streetAddress.trim() || !appForm.city.trim() || !appForm.postalCode.trim() || !appForm.taxId.trim()) {
      setFormError('Please provide your complete residential address and Tax Identification Number.');
      return;
    }

    if (!appForm.termsAccepted || !appForm.fatcaAccepted) {
      setFormError('Please review and accept the statutory compliance agreements.');
      return;
    }

    setIsSubmitting(true);

    try {
      const fullPhone = `${appForm.countryCode} ${appForm.phone}`.trim();
      const payload = {
        firstName: appForm.firstName.trim(),
        middleName: appForm.middleName.trim(),
        lastName: appForm.lastName.trim(),
        email: appForm.email.trim().toLowerCase(),
        phone: fullPhone,
        dateOfBirth: appForm.dateOfBirth || '1988-04-12',
        nationality: appForm.nationality,
        region: appForm.bookingRegion,
        requestedAccountType: appForm.accountType,
        requestedCurrency: appForm.currency,
        initialDepositAmount: Number(appForm.initialDepositAmount) || 10000,
        requestDebitCard: appForm.requestDebitCard,
        address: {
          street: appForm.apartment ? `${appForm.streetAddress}, ${appForm.apartment}` : appForm.streetAddress,
          city: appForm.city,
          state: appForm.stateOrProvince || appForm.city,
          postalCode: appForm.postalCode,
          country: appForm.countryOfResidence
        },
        employment: {
          status: appForm.employmentStatus,
          employer: appForm.employerName || 'Independent Executive',
          annualIncomeEur: Number(appForm.annualIncomeEur) || 120000,
          sourceOfFunds: appForm.sourceOfFunds
        },
        taxId: appForm.taxId,
        isPep: appForm.isPep
      };

      const res = await submitAccountApplication(payload);

      if (res.success && res.referenceNumber) {
        setSubmittedRef(res.referenceNumber);
        showToast(
          'SUCCESS',
          'Application Submitted for Approval',
          `Application ${res.referenceNumber} has been received and routed to compliance officers for manual review.`
        );
      } else {
        setFormError(res.error || 'Failed to submit application. Please try again.');
      }
    } catch (err: any) {
      setFormError(err.message || 'An error occurred while submitting the account application.');
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="space-y-6 max-w-7xl mx-auto">
      {/* Top Header & Navigation Switcher */}
      <GlassPanel variant="standard" className="p-4 sm:p-6 flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
        <div>
          <h1 className="text-xl sm:text-2xl font-bold font-serif text-slate-900 dark:text-white">
            Account Management &amp; Banking Dossier
          </h1>
          <p className="text-xs text-slate-500 dark:text-slate-400 mt-0.5">
            Real-time IBAN ledger, clearing identifiers, and official account opening portal.
          </p>
        </div>

        <div className="flex items-center gap-2 bg-white/40 dark:bg-white/5 p-1 rounded-xl border border-white/40 dark:border-white/10 backdrop-blur-md self-stretch sm:self-auto">
          <button
            onClick={() => setActiveTab('LEDGER')}
            className={`flex-1 sm:flex-none px-4 py-2 rounded-lg text-xs font-bold transition-all flex items-center justify-center gap-1.5 cursor-pointer ${
              activeTab === 'LEDGER'
                ? 'bg-gradient-to-r from-amber-500 to-amber-600 text-slate-950 shadow-md shadow-amber-500/20'
                : 'text-slate-600 dark:text-slate-400 hover:text-slate-900 dark:hover:text-white'
            }`}
          >
            <Building2 className="w-3.5 h-3.5" />
            <span>Active Accounts &amp; Ledger</span>
          </button>
          <button
            onClick={() => {
              setActiveTab('APPLY');
              setSubmittedRef(null);
            }}
            className={`flex-1 sm:flex-none px-4 py-2 rounded-lg text-xs font-bold transition-all flex items-center justify-center gap-1.5 cursor-pointer ${
              activeTab === 'APPLY'
                ? 'bg-gradient-to-r from-amber-500 to-amber-600 text-slate-950 shadow-md shadow-amber-500/20'
                : 'text-slate-600 dark:text-slate-400 hover:text-slate-900 dark:hover:text-white'
            }`}
          >
            <PlusCircle className="w-3.5 h-3.5" />
            <span>Open New Account</span>
          </button>
        </div>
      </GlassPanel>

      {/* ========================================================================= */}
      {/* TAB 1: ACTIVE ACCOUNTS & DETAILED LEDGER */}
      {/* ========================================================================= */}
      {activeTab === 'LEDGER' && (
        <div className="space-y-6">
          {/* Account Selector Tabs */}
          {accounts.length > 0 ? (
            <div className="flex gap-2 overflow-x-auto pb-2 border-b border-white/20 dark:border-white/10 no-scrollbar">
              {accounts.map((acc) => {
                const isSelected = selectedAccountId === acc.id || (!selectedAccountId && acc.id === accounts[0]?.id);
                return (
                  <button
                    key={acc.id}
                    onClick={() => setSelectedAccountId(acc.id)}
                    className={`px-4 py-2.5 rounded-xl text-xs font-semibold whitespace-nowrap transition-all flex items-center gap-2 cursor-pointer backdrop-blur-md ${
                      isSelected
                        ? 'bg-gradient-to-r from-amber-500/20 to-amber-600/30 text-[#8c6d37] dark:text-[#f8c22d] border border-amber-400/50 shadow-sm'
                        : 'bg-white/60 dark:bg-white/5 text-slate-700 dark:text-slate-300 hover:bg-white/80 dark:hover:bg-white/10 border border-white/50 dark:border-white/10'
                    }`}
                  >
                    <span>{acc.name}</span>
                    <span className="font-mono text-[11px] opacity-80">{acc.accountNumber}</span>
                  </button>
                );
              })}
            </div>
          ) : (
            <GlassPanel variant="subtle" className="p-6 text-center space-y-3">
              <AlertCircle className="w-8 h-8 text-amber-500 mx-auto" />
              <h3 className="text-base font-bold text-slate-900 dark:text-white">No Active Accounts Provisioned</h3>
              <p className="text-xs text-slate-600 dark:text-slate-300 max-w-md mx-auto">
                You do not have any activated accounts. Please submit a new account application to initiate compliance review.
              </p>
              <GlassButton
                variant="primary-gold"
                size="sm"
                onClick={() => setActiveTab('APPLY')}
              >
                Apply for an Account &rarr;
              </GlassButton>
            </GlassPanel>
          )}

          {currentAccount && (
            <>
              {/* Account Overview Header Card */}
              <GlassPanel variant="standard" className="p-6 sm:p-8">
                <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 items-start">
                  <div className="lg:col-span-7 space-y-3">
                    <div className="flex items-center gap-3 flex-wrap">
                      <h2 className="text-2xl font-bold font-serif text-slate-900 dark:text-white">{currentAccount.name}</h2>
                      <StatusBadge status={currentAccount.status} />
                    </div>

                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 pt-2 text-xs text-slate-600 dark:text-slate-300">
                      <GlassPanel variant="subtle" className="p-3 space-y-1">
                        <div className="flex justify-between items-center text-slate-400 uppercase text-[10px] font-bold">
                          <span>Full Account Number</span>
                          <button
                            onClick={() => copyToClipboard(currentAccount.accountNumberFull, 'Account Number')}
                            className="text-[#8c6d37] dark:text-[#f8c22d] hover:brightness-125 cursor-pointer"
                            title="Copy Account Number"
                          >
                            <Copy className="w-3.5 h-3.5" />
                          </button>
                        </div>
                        <div className="font-mono font-bold text-slate-900 dark:text-white text-sm">{currentAccount.accountNumberFull}</div>
                      </GlassPanel>

                      <GlassPanel variant="subtle" className="p-3 space-y-1">
                        <div className="flex justify-between items-center text-slate-400 uppercase text-[10px] font-bold">
                          <span>{currentAccount.iban ? 'International IBAN & BIC' : 'Routing & Transit'}</span>
                          <button
                            onClick={() => copyToClipboard(currentAccount.iban || currentAccount.routingNumber || '', 'Identifier')}
                            className="text-[#8c6d37] dark:text-[#f8c22d] hover:brightness-125 cursor-pointer"
                            title="Copy Identifier"
                          >
                            <Copy className="w-3.5 h-3.5" />
                          </button>
                        </div>
                        <div className="font-mono font-bold text-slate-900 dark:text-white text-sm truncate">
                          {currentAccount.iban ? `${currentAccount.iban}` : currentAccount.routingNumber}
                        </div>
                      </GlassPanel>
                    </div>

                    <div className="flex items-center gap-4 text-xs text-slate-500 dark:text-slate-400 font-mono pt-1 flex-wrap">
                      <span>SWIFT BIC: <strong className="text-slate-800 dark:text-slate-200">{currentAccount.swiftBic}</strong></span>
                      {currentAccount.sortCode && (
                        <>
                          <span>•</span>
                          <span>Sort Code: <strong className="text-slate-800 dark:text-slate-200">{currentAccount.sortCode}</strong></span>
                        </>
                      )}
                      <span>•</span>
                      <span>Established: {new Date(currentAccount.openedDate).toLocaleDateString()}</span>
                      {currentAccount.interestRateAPY && (
                        <>
                          <span>•</span>
                          <span className="text-emerald-700 dark:text-emerald-400 font-bold font-sans">
                            {currentAccount.interestRateAPY}% Annual Yield
                          </span>
                        </>
                      )}
                    </div>
                  </div>

                  {/* Right Balances & Quick Transfer */}
                  <GlassPanel variant="elevated" glow className="lg:col-span-5 p-6 space-y-4">
                    <div className="flex justify-between items-start">
                      <div>
                        <span className="text-xs text-slate-500 dark:text-slate-400 uppercase tracking-wider block">Available Balance</span>
                        <CurrencyDisplay
                          amountMinor={currentAccount.availableBalanceMinor}
                          currency={currentAccount.currency}
                          size="2xl"
                          className="text-slate-900 dark:text-white"
                        />
                      </div>
                      <div className="text-right">
                        <span className="text-[11px] text-slate-500 dark:text-slate-400 block">Ledger Total</span>
                        <span className="text-sm font-bold font-mono text-slate-800 dark:text-slate-200">
                          {currentAccount.currency === 'EUR' ? '€' : currentAccount.currency === 'GBP' ? '£' : '$'}
                          {(currentAccount.balanceMinor / 100).toLocaleString('en-US', { minimumFractionDigits: 2 })}
                        </span>
                      </div>
                    </div>

                    <div className="flex gap-2 pt-2">
                      <GlassButton
                        variant="primary-gold"
                        size="md"
                        onClick={() => setCurrentView('DASHBOARD_TRANSFERS')}
                        className="flex-1 uppercase tracking-wider text-xs"
                      >
                        Transfer Funds
                      </GlassButton>
                      <GlassButton
                        variant="glass-default"
                        size="md"
                        onClick={() => handleExport('CSV')}
                        iconLeft={<FileSpreadsheet className="w-4 h-4" />}
                        title="Download CSV"
                      >
                        CSV
                      </GlassButton>
                      <GlassButton
                        variant="glass-default"
                        size="md"
                        onClick={() => handleExport('PDF')}
                        iconLeft={<Download className="w-4 h-4" />}
                        title="Download PDF Statement"
                      >
                        PDF
                      </GlassButton>
                    </div>
                  </GlassPanel>
                </div>
              </GlassPanel>

              {/* Transaction History & Filter Bar */}
              <GlassPanel variant="standard" className="overflow-hidden">
                <div className="p-4 sm:p-5 border-b border-white/20 dark:border-white/10 flex flex-col sm:flex-row gap-4 items-center justify-between">
                  <div className="w-full sm:w-80">
                    <GlassSearchBar
                      placeholder="Search description, ref #, payee"
                      value={search}
                      onChange={setSearch}
                      className="w-full text-xs"
                    />
                  </div>

                  <div className="flex items-center gap-2 w-full sm:w-auto overflow-x-auto no-scrollbar">
                    {['ALL', 'Income', 'Transfers', 'Bills & Utilities', 'Fees & Interest', 'Shopping & Dining'].map((cat) => (
                      <button
                        key={cat}
                        onClick={() => setSelectedCategory(cat)}
                        className={`px-3 py-1.5 rounded-xl text-xs font-semibold whitespace-nowrap transition-all cursor-pointer backdrop-blur-md ${
                          selectedCategory === cat
                            ? 'bg-gradient-to-r from-amber-500/20 to-amber-600/30 text-[#8c6d37] dark:text-[#f8c22d] border border-amber-400/40 shadow-xs'
                            : 'bg-white/40 dark:bg-white/5 text-slate-600 dark:text-slate-400 hover:bg-white/70 dark:hover:bg-white/10 border border-white/30 dark:border-white/5'
                        }`}
                      >
                        {cat}
                      </button>
                    ))}
                  </div>
                </div>

                {/* Ledger Table */}
                <div className="overflow-x-auto">
                  <table className="w-full text-left text-xs">
                    <thead className="bg-white/40 dark:bg-white/5 text-slate-500 dark:text-slate-400 font-serif uppercase tracking-wider text-[10px] border-b border-white/20 dark:border-white/10">
                      <tr>
                        <th className="py-3.5 px-4 font-bold">Posting Date</th>
                        <th className="py-3.5 px-4 font-bold">Description &amp; Payee</th>
                        <th className="py-3.5 px-4 font-bold">Category</th>
                        <th className="py-3.5 px-4 font-bold">Reference #</th>
                        <th className="py-3.5 px-4 font-bold text-right">Amount</th>
                        <th className="py-3.5 px-4 font-bold text-right">Running Balance</th>
                        <th className="py-3.5 px-4 font-bold text-center">Status</th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-white/10 dark:divide-white/5 font-sans">
                      {filteredTransactions.length === 0 ? (
                        <tr>
                          <td colSpan={7} className="py-8 text-center text-slate-400">
                            No transactions matching the selected criteria.
                          </td>
                        </tr>
                      ) : (
                        filteredTransactions.map((tx) => (
                          <tr
                            key={tx.id}
                            onClick={() => setSelectedTx(tx)}
                            className="hover:bg-white/40 dark:hover:bg-white/[0.04] transition-colors cursor-pointer"
                          >
                            <td className="py-3.5 px-4 font-mono text-slate-600 dark:text-slate-400 whitespace-nowrap">
                              {new Date(tx.effectiveTimestamp).toLocaleDateString('en-US', {
                                year: 'numeric',
                                month: 'short',
                                day: 'numeric'
                              })}
                            </td>
                            <td className="py-3.5 px-4">
                              <div className="font-bold text-slate-900 dark:text-white">{tx.description}</div>
                              <div className="text-[11px] text-slate-500 dark:text-slate-400">{tx.counterparty}</div>
                            </td>
                            <td className="py-3.5 px-4 text-slate-600 dark:text-slate-300 whitespace-nowrap">{tx.category}</td>
                            <td className="py-3.5 px-4 font-mono text-slate-500 dark:text-slate-400 text-[11px] whitespace-nowrap">
                              {tx.referenceNumber}
                            </td>
                            <td className="py-3.5 px-4 text-right whitespace-nowrap">
                              <CurrencyDisplay
                                amountMinor={tx.amountMinor}
                                currency={tx.currency}
                                showSign={true}
                                size="sm"
                                className={tx.direction === 'CREDIT' ? 'text-emerald-700 dark:text-emerald-400' : 'text-slate-900 dark:text-white'}
                              />
                            </td>
                            <td className="py-3.5 px-4 text-right font-mono font-bold text-slate-700 dark:text-slate-300 whitespace-nowrap">
                              {tx.currency === 'EUR' ? '€' : tx.currency === 'GBP' ? '£' : '$'}
                              {(tx.balanceAfterMinor / 100).toLocaleString('en-US', { minimumFractionDigits: 2 })}
                            </td>
                            <td className="py-3.5 px-4 text-center whitespace-nowrap">
                              <StatusBadge status={tx.status} size="sm" />
                            </td>
                          </tr>
                        ))
                      )}
                    </tbody>
                  </table>
                </div>
              </GlassPanel>
            </>
          )}
        </div>
      )}

      {/* ========================================================================= */}
      {/* TAB 2: CLEAN, PROFESSIONAL NEW USER & ACCOUNT APPLICATION FORM */}
      {/* ========================================================================= */}
      {activeTab === 'APPLY' && (
        <div className="space-y-6">
          {submittedRef ? (
            /* Confirmation State */
            <GlassPanel variant="elevated" glow className="p-8 sm:p-12 max-w-3xl mx-auto space-y-6 text-center">
              <div className="w-16 h-16 rounded-2xl bg-emerald-500/20 text-emerald-600 dark:text-emerald-400 border border-emerald-500/40 flex items-center justify-center mx-auto shadow-lg shadow-emerald-500/10">
                <CheckCircle2 className="w-10 h-10" />
              </div>

              <div className="space-y-2">
                <span className="text-xs uppercase tracking-widest text-[#8c6d37] dark:text-[#f8c22d] font-bold">
                  Compliance Dossier Transmitted
                </span>
                <h2 className="text-2xl sm:text-3xl font-bold font-serif text-slate-900 dark:text-white">
                  Application Under Administrative Review
                </h2>
                <p className="text-sm text-slate-600 dark:text-slate-300 max-w-lg mx-auto">
                  Your international account application has been submitted to the First Atlantic Institutional Compliance &amp; Onboarding Desk.
                </p>
              </div>

              {/* Summary Card */}
              <GlassPanel variant="subtle" className="p-5 text-left font-mono space-y-3 text-xs max-w-md mx-auto">
                <div className="flex justify-between items-center">
                  <span className="text-slate-500 dark:text-slate-400 font-sans">Official Tracking Ref:</span>
                  <span className="font-bold text-slate-950 dark:text-white text-sm">{submittedRef}</span>
                </div>
                <div className="flex justify-between items-center">
                  <span className="text-slate-500 dark:text-slate-400 font-sans">Applicant Legal Name:</span>
                  <span className="font-semibold text-slate-800 dark:text-slate-200 font-sans">{appForm.firstName} {appForm.lastName}</span>
                </div>
                <div className="flex justify-between items-center">
                  <span className="text-slate-500 dark:text-slate-400 font-sans">Booking Jurisdiction:</span>
                  <span className="font-semibold text-[#8c6d37] dark:text-[#f8c22d] font-sans">
                    {appForm.bookingRegion === 'EU' ? '🇪🇺 European Central Bank (Frankfurt Hub)' : appForm.bookingRegion === 'UK' ? '🇬🇧 London Mayfair (PRA Hub)' : '🇺🇸 New York (Fedwire Hub)'}
                  </span>
                </div>
                <div className="flex justify-between items-center">
                  <span className="text-slate-500 dark:text-slate-400 font-sans">Approval Workflow:</span>
                  <span className="px-2 py-0.5 rounded bg-amber-500/15 text-amber-800 dark:text-amber-300 font-bold font-sans text-[11px] border border-amber-400/30">
                    MANUAL ADMIN APPROVAL REQUIRED
                  </span>
                </div>
              </GlassPanel>

              {/* Regulatory Notice */}
              <div className="p-4 rounded-xl bg-blue-500/10 border border-blue-500/30 text-blue-900 dark:text-blue-300 text-xs text-left space-y-1.5 backdrop-blur-md">
                <div className="flex items-center gap-2 font-bold">
                  <ShieldCheck className="w-4 h-4 text-blue-600 dark:text-blue-400" />
                  <span>Regulatory Onboarding Mandate</span>
                </div>
                <p className="text-slate-700 dark:text-slate-300 leading-relaxed text-[11px]">
                  Under ECB Article 12 AML/CFT regulations, all new account dossiers require formal review and verification by authorized bank administrators before live IBAN generation and account activation.
                </p>
              </div>

              <div className="pt-4 flex flex-wrap justify-center gap-3">
                <GlassButton
                  variant="primary-gold"
                  size="md"
                  onClick={() => {
                    setActiveTab('LEDGER');
                    setSubmittedRef(null);
                  }}
                  className="uppercase tracking-wider text-xs"
                >
                  Return to Account Overview
                </GlassButton>
                <GlassButton
                  variant="glass-default"
                  size="md"
                  onClick={() => {
                    setSubmittedRef(null);
                    setAppForm(prev => ({ ...prev, firstName: '', lastName: '', streetAddress: '', taxId: '' }));
                  }}
                  className="uppercase tracking-wider text-xs"
                >
                  Submit Another Application
                </GlassButton>
              </div>
            </GlassPanel>
          ) : (
            /* Real Professional Account Application Form */
            <GlassPanel variant="standard" className="p-6 sm:p-10 max-w-4xl mx-auto">
              <form onSubmit={handleApplicationSubmit} className="space-y-8">
                {/* Form Banner */}
                <div className="border-b border-white/20 dark:border-white/10 pb-6 space-y-2">
                  <div className="flex items-center gap-2 text-xs font-bold uppercase tracking-widest text-[#8c6d37] dark:text-[#f8c22d]">
                    <ShieldCheck className="w-4 h-4 text-[#8c6d37] dark:text-[#f8c22d]" />
                    <span>Institutional Compliance &amp; KYC Gateway</span>
                  </div>
                  <h2 className="text-2xl font-bold font-serif text-slate-900 dark:text-white">
                    International Bank Account Application
                  </h2>
                  <p className="text-xs text-slate-600 dark:text-slate-300 leading-relaxed">
                    Apply for private, high-yield, or commercial bank accounts operating across the European Union (SEPA), United Kingdom, and international financial centers. All applications are reviewed by authorized compliance administrators.
                  </p>
                </div>

                {formError && (
                  <div className="p-4 rounded-xl bg-rose-500/10 border border-rose-500/30 text-rose-800 dark:text-rose-300 text-xs flex items-start gap-2.5 backdrop-blur-md">
                    <AlertCircle className="w-4 h-4 text-rose-600 dark:text-rose-400 shrink-0 mt-0.5" />
                    <span>{formError}</span>
                  </div>
                )}

                {/* Section 1: Account Product & Jurisdiction */}
                <div className="space-y-4">
                  <h3 className="text-sm font-bold uppercase tracking-wider text-slate-800 dark:text-slate-200 font-serif flex items-center gap-2">
                    <Landmark className="w-4 h-4 text-[#8c6d37] dark:text-[#f8c22d]" />
                    <span>1. Account Specification &amp; Jurisdiction</span>
                  </h3>

                  <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
                    <div>
                      <label className="block text-xs font-bold text-slate-700 dark:text-slate-300 uppercase tracking-wider mb-1.5">
                        Booking Jurisdiction *
                      </label>
                      <select
                        value={appForm.bookingRegion}
                        onChange={(e) => {
                          const newReg = e.target.value as BankRegion;
                          setAppForm(prev => ({
                            ...prev,
                            bookingRegion: newReg,
                            currency: newReg === 'EU' ? 'EUR' : newReg === 'UK' ? 'GBP' : 'USD'
                          }));
                        }}
                        className="w-full px-3.5 py-2.5 text-xs glass-input rounded-xl text-slate-900 dark:text-slate-100 font-medium focus:outline-none"
                      >
                        <option value="EU" className="bg-white dark:bg-[#0a192f] text-slate-900 dark:text-white">🇪🇺 European Union (Frankfurt ECB)</option>
                        <option value="UK" className="bg-white dark:bg-[#0a192f] text-slate-900 dark:text-white">🇬🇧 United Kingdom (London Mayfair)</option>
                        <option value="US" className="bg-white dark:bg-[#0a192f] text-slate-900 dark:text-white">🇺🇸 United States (New York Wall St)</option>
                      </select>
                    </div>

                    <div>
                      <label className="block text-xs font-bold text-slate-700 dark:text-slate-300 uppercase tracking-wider mb-1.5">
                        Account Type *
                      </label>
                      <select
                        value={appForm.accountType}
                        onChange={(e) => setAppForm(prev => ({ ...prev, accountType: e.target.value }))}
                        className="w-full px-3.5 py-2.5 text-xs glass-input rounded-xl text-slate-900 dark:text-slate-100 font-medium focus:outline-none"
                      >
                        <option value="CHECKING_PREMIER" className="bg-white dark:bg-[#0a192f] text-slate-900 dark:text-white">Premier Private Checking (SEPA / Wire)</option>
                        <option value="SAVINGS_HIGH_YIELD" className="bg-white dark:bg-[#0a192f] text-slate-900 dark:text-white">Apex High-Yield Reserve (5.15% APY)</option>
                        <option value="MULTI_CURRENCY_GLOBAL" className="bg-white dark:bg-[#0a192f] text-slate-900 dark:text-white">Global Multi-Currency Reserve (EUR/GBP/USD)</option>
                        <option value="COMMERCIAL_OPERATING" className="bg-white dark:bg-[#0a192f] text-slate-900 dark:text-white">Corporate Commercial Operating</option>
                      </select>
                    </div>

                    <div>
                      <label className="block text-xs font-bold text-slate-700 dark:text-slate-300 uppercase tracking-wider mb-1.5">
                        Base Currency *
                      </label>
                      <select
                        value={appForm.currency}
                        onChange={(e) => setAppForm(prev => ({ ...prev, currency: e.target.value }))}
                        className="w-full px-3.5 py-2.5 text-xs glass-input rounded-xl text-slate-900 dark:text-slate-100 font-medium focus:outline-none"
                      >
                        <option value="EUR" className="bg-white dark:bg-[#0a192f] text-slate-900 dark:text-white">EUR (€) - Eurozone SEPA</option>
                        <option value="GBP" className="bg-white dark:bg-[#0a192f] text-slate-900 dark:text-white">GBP (£) - British Pound</option>
                        <option value="USD" className="bg-white dark:bg-[#0a192f] text-slate-900 dark:text-white">USD ($) - US Dollar</option>
                        <option value="CHF" className="bg-white dark:bg-[#0a192f] text-slate-900 dark:text-white">CHF (Fr) - Swiss Franc</option>
                      </select>
                    </div>
                  </div>

                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 pt-2">
                    <div>
                      <label className="block text-xs font-bold text-slate-700 dark:text-slate-300 uppercase tracking-wider mb-1.5">
                        Planned Initial Deposit (Base Currency)
                      </label>
                      <input
                        type="number"
                        min="1000"
                        step="500"
                        value={appForm.initialDepositAmount}
                        onChange={(e) => setAppForm(prev => ({ ...prev, initialDepositAmount: e.target.value }))}
                        className="w-full px-3.5 py-2.5 text-xs font-mono font-bold glass-input rounded-xl text-slate-900 dark:text-slate-100 focus:outline-none"
                      />
                    </div>

                    <div className="flex items-center pt-6">
                      <label className="flex items-center gap-2.5 text-xs text-slate-700 dark:text-slate-300 cursor-pointer">
                        <input
                          type="checkbox"
                          checked={appForm.requestDebitCard}
                          onChange={(e) => setAppForm(prev => ({ ...prev, requestDebitCard: e.target.checked }))}
                          className="rounded border-white/40 text-amber-600 focus:ring-amber-500 w-4 h-4 cursor-pointer"
                        />
                        <span className="font-semibold">Issue Contactless Visa Infinite / MasterCard Debit Card</span>
                      </label>
                    </div>
                  </div>
                </div>

                {/* Section 2: Applicant Identity & Contact */}
                <div className="space-y-4 pt-4 border-t border-white/20 dark:border-white/10">
                  <h3 className="text-sm font-bold uppercase tracking-wider text-slate-800 dark:text-slate-200 font-serif flex items-center gap-2">
                    <UserCheck className="w-4 h-4 text-[#8c6d37] dark:text-[#f8c22d]" />
                    <span>2. Legal Identity &amp; Contact Details</span>
                  </h3>

                  <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
                    <div>
                      <label className="block text-xs font-bold text-slate-700 dark:text-slate-300 uppercase tracking-wider mb-1.5">
                        First Name *
                      </label>
                      <input
                        type="text"
                        required
                        placeholder="e.g. Henrik"
                        value={appForm.firstName}
                        onChange={(e) => setAppForm(prev => ({ ...prev, firstName: e.target.value }))}
                        className="w-full px-3.5 py-2.5 text-xs glass-input rounded-xl text-slate-900 dark:text-slate-100 focus:outline-none"
                      />
                    </div>

                    <div>
                      <label className="block text-xs font-bold text-slate-700 dark:text-slate-300 uppercase tracking-wider mb-1.5">
                        Middle Name (Optional)
                      </label>
                      <input
                        type="text"
                        placeholder="e.g. Christian"
                        value={appForm.middleName}
                        onChange={(e) => setAppForm(prev => ({ ...prev, middleName: e.target.value }))}
                        className="w-full px-3.5 py-2.5 text-xs glass-input rounded-xl text-slate-900 dark:text-slate-100 focus:outline-none"
                      />
                    </div>

                    <div>
                      <label className="block text-xs font-bold text-slate-700 dark:text-slate-300 uppercase tracking-wider mb-1.5">
                        Last Name *
                      </label>
                      <input
                        type="text"
                        required
                        placeholder="e.g. Weber"
                        value={appForm.lastName}
                        onChange={(e) => setAppForm(prev => ({ ...prev, lastName: e.target.value }))}
                        className="w-full px-3.5 py-2.5 text-xs glass-input rounded-xl text-slate-900 dark:text-slate-100 focus:outline-none"
                      />
                    </div>
                  </div>

                  <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
                    <div>
                      <label className="block text-xs font-bold text-slate-700 dark:text-slate-300 uppercase tracking-wider mb-1.5">
                        Date of Birth *
                      </label>
                      <input
                        type="date"
                        required
                        value={appForm.dateOfBirth}
                        onChange={(e) => setAppForm(prev => ({ ...prev, dateOfBirth: e.target.value }))}
                        className="w-full px-3.5 py-2.5 text-xs glass-input rounded-xl text-slate-900 dark:text-slate-100 focus:outline-none"
                      />
                    </div>

                    <div>
                      <label className="block text-xs font-bold text-slate-700 dark:text-slate-300 uppercase tracking-wider mb-1.5">
                        Email Address *
                      </label>
                      <input
                        type="email"
                        required
                        placeholder="h.weber@enterprise.eu"
                        value={appForm.email}
                        onChange={(e) => setAppForm(prev => ({ ...prev, email: e.target.value }))}
                        className="w-full px-3.5 py-2.5 text-xs glass-input rounded-xl text-slate-900 dark:text-slate-100 focus:outline-none"
                      />
                    </div>

                    <div>
                      <label className="block text-xs font-bold text-slate-700 dark:text-slate-300 uppercase tracking-wider mb-1.5">
                        Phone Number *
                      </label>
                      <div className="flex gap-2">
                        <select
                          value={appForm.countryCode}
                          onChange={(e) => setAppForm(prev => ({ ...prev, countryCode: e.target.value }))}
                          className="w-24 px-2 py-2.5 text-xs glass-input rounded-xl text-slate-900 dark:text-slate-100"
                        >
                          <option value="+49" className="bg-white dark:bg-[#0a192f] text-slate-900 dark:text-white">🇩🇪 +49</option>
                          <option value="+44" className="bg-white dark:bg-[#0a192f] text-slate-900 dark:text-white">🇬🇧 +44</option>
                          <option value="+1" className="bg-white dark:bg-[#0a192f] text-slate-900 dark:text-white">🇺🇸 +1</option>
                          <option value="+33" className="bg-white dark:bg-[#0a192f] text-slate-900 dark:text-white">🇫🇷 +33</option>
                          <option value="+41" className="bg-white dark:bg-[#0a192f] text-slate-900 dark:text-white">🇨🇭 +41</option>
                          <option value="+39" className="bg-white dark:bg-[#0a192f] text-slate-900 dark:text-white">🇮🇹 +39</option>
                          <option value="+34" className="bg-white dark:bg-[#0a192f] text-slate-900 dark:text-white">🇪🇸 +34</option>
                          <option value="+31" className="bg-white dark:bg-[#0a192f] text-slate-900 dark:text-white">🇳🇱 +31</option>
                        </select>
                        <input
                          type="tel"
                          required
                          placeholder="171 8920194"
                          value={appForm.phone}
                          onChange={(e) => setAppForm(prev => ({ ...prev, phone: e.target.value }))}
                          className="flex-1 px-3.5 py-2.5 text-xs glass-input rounded-xl text-slate-900 dark:text-slate-100 focus:outline-none"
                        />
                      </div>
                    </div>
                  </div>
                </div>

                {/* Section 3: Residential Address & Tax Compliance */}
                <div className="space-y-4 pt-4 border-t border-white/20 dark:border-white/10">
                  <h3 className="text-sm font-bold uppercase tracking-wider text-slate-800 dark:text-slate-200 font-serif flex items-center gap-2">
                    <Globe2 className="w-4 h-4 text-[#8c6d37] dark:text-[#f8c22d]" />
                    <span>3. Residential Address &amp; Tax Compliance</span>
                  </h3>

                  <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
                    <div className="sm:col-span-2">
                      <label className="block text-xs font-bold text-slate-700 dark:text-slate-300 uppercase tracking-wider mb-1.5">
                        Street Address *
                      </label>
                      <input
                        type="text"
                        required
                        placeholder="e.g. Taunusanlage 8"
                        value={appForm.streetAddress}
                        onChange={(e) => setAppForm(prev => ({ ...prev, streetAddress: e.target.value }))}
                        className="w-full px-3.5 py-2.5 text-xs glass-input rounded-xl text-slate-900 dark:text-slate-100 focus:outline-none"
                      />
                    </div>

                    <div>
                      <label className="block text-xs font-bold text-slate-700 dark:text-slate-300 uppercase tracking-wider mb-1.5">
                        Suite / Floor (Optional)
                      </label>
                      <input
                        type="text"
                        placeholder="Etage 14"
                        value={appForm.apartment}
                        onChange={(e) => setAppForm(prev => ({ ...prev, apartment: e.target.value }))}
                        className="w-full px-3.5 py-2.5 text-xs glass-input rounded-xl text-slate-900 dark:text-slate-100 focus:outline-none"
                      />
                    </div>
                  </div>

                  <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
                    <div>
                      <label className="block text-xs font-bold text-slate-700 dark:text-slate-300 uppercase tracking-wider mb-1.5">
                        City *
                      </label>
                      <input
                        type="text"
                        required
                        placeholder="Frankfurt am Main"
                        value={appForm.city}
                        onChange={(e) => setAppForm(prev => ({ ...prev, city: e.target.value }))}
                        className="w-full px-3.5 py-2.5 text-xs glass-input rounded-xl text-slate-900 dark:text-slate-100 focus:outline-none"
                      />
                    </div>

                    <div>
                      <label className="block text-xs font-bold text-slate-700 dark:text-slate-300 uppercase tracking-wider mb-1.5">
                        Postal Code *
                      </label>
                      <input
                        type="text"
                        required
                        placeholder="60329"
                        value={appForm.postalCode}
                        onChange={(e) => setAppForm(prev => ({ ...prev, postalCode: e.target.value }))}
                        className="w-full px-3.5 py-2.5 text-xs glass-input rounded-xl text-slate-900 dark:text-slate-100 focus:outline-none"
                      />
                    </div>

                    <div>
                      <label className="block text-xs font-bold text-slate-700 dark:text-slate-300 uppercase tracking-wider mb-1.5">
                        Country of Residence *
                      </label>
                      <select
                        value={appForm.countryOfResidence}
                        onChange={(e) => setAppForm(prev => ({ ...prev, countryOfResidence: e.target.value }))}
                        className="w-full px-3.5 py-2.5 text-xs glass-input rounded-xl text-slate-900 dark:text-slate-100 font-medium focus:outline-none"
                      >
                        <option value="Germany" className="bg-white dark:bg-[#0a192f] text-slate-900 dark:text-white">Germany</option>
                        <option value="United Kingdom" className="bg-white dark:bg-[#0a192f] text-slate-900 dark:text-white">United Kingdom</option>
                        <option value="France" className="bg-white dark:bg-[#0a192f] text-slate-900 dark:text-white">France</option>
                        <option value="Switzerland" className="bg-white dark:bg-[#0a192f] text-slate-900 dark:text-white">Switzerland</option>
                        <option value="Netherlands" className="bg-white dark:bg-[#0a192f] text-slate-900 dark:text-white">Netherlands</option>
                        <option value="Italy" className="bg-white dark:bg-[#0a192f] text-slate-900 dark:text-white">Italy</option>
                        <option value="Spain" className="bg-white dark:bg-[#0a192f] text-slate-900 dark:text-white">Spain</option>
                        <option value="United States" className="bg-white dark:bg-[#0a192f] text-slate-900 dark:text-white">United States</option>
                      </select>
                    </div>
                  </div>

                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 pt-2">
                    <div>
                      <label className="block text-xs font-bold text-slate-700 dark:text-slate-300 uppercase tracking-wider mb-1.5">
                        Tax Identification Number (TIN / Steuernummer / SSN) *
                      </label>
                      <input
                        type="text"
                        required
                        placeholder="e.g. DE 48 920 184 928"
                        value={appForm.taxId}
                        onChange={(e) => setAppForm(prev => ({ ...prev, taxId: e.target.value }))}
                        className="w-full px-3.5 py-2.5 text-xs glass-input rounded-xl text-slate-900 dark:text-slate-100 font-mono focus:outline-none"
                      />
                    </div>

                    <div>
                      <label className="block text-xs font-bold text-slate-700 dark:text-slate-300 uppercase tracking-wider mb-1.5">
                        Primary Citizenship / Nationality *
                      </label>
                      <select
                        value={appForm.nationality}
                        onChange={(e) => setAppForm(prev => ({ ...prev, nationality: e.target.value }))}
                        className="w-full px-3.5 py-2.5 text-xs glass-input rounded-xl text-slate-900 dark:text-slate-100 font-medium focus:outline-none"
                      >
                        <option value="Germany" className="bg-white dark:bg-[#0a192f] text-slate-900 dark:text-white">German Citizen</option>
                        <option value="United Kingdom" className="bg-white dark:bg-[#0a192f] text-slate-900 dark:text-white">British Citizen</option>
                        <option value="France" className="bg-white dark:bg-[#0a192f] text-slate-900 dark:text-white">French Citizen</option>
                        <option value="Switzerland" className="bg-white dark:bg-[#0a192f] text-slate-900 dark:text-white">Swiss Citizen</option>
                        <option value="United States" className="bg-white dark:bg-[#0a192f] text-slate-900 dark:text-white">United States Citizen</option>
                        <option value="Other International" className="bg-white dark:bg-[#0a192f] text-slate-900 dark:text-white">Other European / International</option>
                      </select>
                    </div>
                  </div>
                </div>

                {/* Section 4: Employment & Wealth Verification */}
                <div className="space-y-4 pt-4 border-t border-white/20 dark:border-white/10">
                  <h3 className="text-sm font-bold uppercase tracking-wider text-slate-800 dark:text-slate-200 font-serif flex items-center gap-2">
                    <Briefcase className="w-4 h-4 text-[#8c6d37] dark:text-[#f8c22d]" />
                    <span>4. Employment &amp; Source of Wealth</span>
                  </h3>

                  <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
                    <div>
                      <label className="block text-xs font-bold text-slate-700 dark:text-slate-300 uppercase tracking-wider mb-1.5">
                        Employment Status *
                      </label>
                      <select
                        value={appForm.employmentStatus}
                        onChange={(e) => setAppForm(prev => ({ ...prev, employmentStatus: e.target.value }))}
                        className="w-full px-3.5 py-2.5 text-xs glass-input rounded-xl text-slate-900 dark:text-slate-100 font-medium focus:outline-none"
                      >
                        <option value="EXECUTIVE" className="bg-white dark:bg-[#0a192f] text-slate-900 dark:text-white">Corporate Officer / Executive</option>
                        <option value="EMPLOYED" className="bg-white dark:bg-[#0a192f] text-slate-900 dark:text-white">Professional / Employed</option>
                        <option value="SELF_EMPLOYED" className="bg-white dark:bg-[#0a192f] text-slate-900 dark:text-white">Self-Employed / Entrepreneur</option>
                        <option value="RETIRED" className="bg-white dark:bg-[#0a192f] text-slate-900 dark:text-white">Private Investor / Retired</option>
                      </select>
                    </div>

                    <div>
                      <label className="block text-xs font-bold text-slate-700 dark:text-slate-300 uppercase tracking-wider mb-1.5">
                        Employer / Firm Name
                      </label>
                      <input
                        type="text"
                        placeholder="e.g. Frankfurt Financial Partners"
                        value={appForm.employerName}
                        onChange={(e) => setAppForm(prev => ({ ...prev, employerName: e.target.value }))}
                        className="w-full px-3.5 py-2.5 text-xs glass-input rounded-xl text-slate-900 dark:text-slate-100 focus:outline-none"
                      />
                    </div>

                    <div>
                      <label className="block text-xs font-bold text-slate-700 dark:text-slate-300 uppercase tracking-wider mb-1.5">
                        Source of Funds / Wealth *
                      </label>
                      <select
                        value={appForm.sourceOfFunds}
                        onChange={(e) => setAppForm(prev => ({ ...prev, sourceOfFunds: e.target.value }))}
                        className="w-full px-3.5 py-2.5 text-xs glass-input rounded-xl text-slate-900 dark:text-slate-100 font-medium focus:outline-none"
                      >
                        <option value="SALARY_AND_BONUS" className="bg-white dark:bg-[#0a192f] text-slate-900 dark:text-white">Executive Salary &amp; Bonus</option>
                        <option value="BUSINESS_PROCEEDS" className="bg-white dark:bg-[#0a192f] text-slate-900 dark:text-white">Commercial Operating Profits</option>
                        <option value="INVESTMENTS" className="bg-white dark:bg-[#0a192f] text-slate-900 dark:text-white">Capital Gains &amp; Dividends</option>
                        <option value="INHERITANCE" className="bg-white dark:bg-[#0a192f] text-slate-900 dark:text-white">Family Trust / Inheritance</option>
                        <option value="REAL_ESTATE" className="bg-white dark:bg-[#0a192f] text-slate-900 dark:text-white">Property Holdings &amp; Rental</option>
                      </select>
                    </div>
                  </div>
                </div>

                {/* Section 5: Regulatory Compliance & Manual Admin Approval Disclosures */}
                <div className="space-y-4 pt-4 border-t border-white/20 dark:border-white/10">
                  <h3 className="text-sm font-bold uppercase tracking-wider text-slate-800 dark:text-slate-200 font-serif flex items-center gap-2">
                    <ShieldCheck className="w-4 h-4 text-emerald-600 dark:text-emerald-400" />
                    <span>5. Regulatory Attestation &amp; Administrative Approval Mandate</span>
                  </h3>

                  <div className="p-4 rounded-xl bg-amber-500/10 border border-amber-400/30 text-xs text-amber-900 dark:text-amber-300 space-y-2 backdrop-blur-md">
                    <div className="flex items-center gap-2 font-bold text-amber-950 dark:text-amber-200">
                      <Clock className="w-4 h-4 text-amber-600 dark:text-amber-400" />
                      <span>Mandatory Administrative Approval Notice</span>
                    </div>
                    <p className="text-slate-700 dark:text-slate-300 leading-relaxed text-[11px]">
                      In strict accordance with international banking laws, European Central Bank regulations, and FATCA/CRS frameworks, submitting this form enters your dossier into the <strong>Administrative Compliance Review Queue</strong>. No automated or unverified accounts are created. Authorized compliance officers will perform identity verification, PEP/sanctions checks, and manual approval before account credentials, IBANs, and cards are issued.
                    </p>
                  </div>

                  <div className="space-y-3 pt-2">
                    <label className="flex items-start gap-3 text-xs text-slate-700 dark:text-slate-300 cursor-pointer">
                      <input
                        type="checkbox"
                        required
                        checked={appForm.termsAccepted}
                        onChange={(e) => setAppForm(prev => ({ ...prev, termsAccepted: e.target.checked }))}
                        className="rounded border-white/40 text-amber-600 focus:ring-amber-500 w-4 h-4 mt-0.5 cursor-pointer"
                      />
                      <span>
                        I certify that all information provided is true and accurate. I acknowledge that this application requires manual administrative approval by First Atlantic Bank compliance personnel.
                      </span>
                    </label>

                    <label className="flex items-start gap-3 text-xs text-slate-700 dark:text-slate-300 cursor-pointer">
                      <input
                        type="checkbox"
                        required
                        checked={appForm.fatcaAccepted}
                        onChange={(e) => setAppForm(prev => ({ ...prev, fatcaAccepted: e.target.checked }))}
                        className="rounded border-white/40 text-amber-600 focus:ring-amber-500 w-4 h-4 mt-0.5 cursor-pointer"
                      />
                      <span>
                        I consent to electronic FATCA/CRS tax residency disclosure, European Bank Secrecy standards, and anti-money laundering due diligence checks.
                      </span>
                    </label>
                  </div>
                </div>

                {/* Submit Actions */}
                <div className="pt-6 border-t border-white/20 dark:border-white/10 flex flex-col sm:flex-row items-center justify-between gap-4">
                  <button
                    type="button"
                    onClick={() => setActiveTab('LEDGER')}
                    className="text-xs text-slate-500 dark:text-slate-400 hover:text-slate-800 dark:hover:text-white font-semibold cursor-pointer"
                  >
                    &larr; Cancel and return to accounts
                  </button>

                  <GlassButton
                    type="submit"
                    variant="primary-gold"
                    size="lg"
                    loading={isSubmitting}
                    iconLeft={<ShieldCheck className="w-4 h-4" />}
                    className="w-full sm:w-auto uppercase tracking-widest text-xs"
                  >
                    {isSubmitting ? 'Routing to Compliance Desk...' : 'Submit Application for Administrative Approval'}
                  </GlassButton>
                </div>
              </form>
            </GlassPanel>
          )}
        </div>
      )}
    </div>
  );
};

