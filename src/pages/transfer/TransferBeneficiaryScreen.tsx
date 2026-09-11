import React, { useState, useEffect, useMemo } from 'react';
import { useNavigate } from 'react-router-dom';
import {
  ArrowLeft,
  Search,
  Check,
  Building2,
  Globe,
  Sparkles,
  X,
  Users,
  ExternalLink,
  ShieldCheck,
  ChevronRight
} from 'lucide-react';
import { useTransferStore, Beneficiary } from '../../store/useTransferStore';
import { EMBEDDED_BANKS, BankOption, searchWorldwideBanks } from '../../data/banks';

type BankRegionTab = 'ALL' | 'US' | 'UK' | 'EU' | 'GLOBAL';

export const TransferBeneficiaryScreen: React.FC = () => {
  const navigate = useNavigate();
  const {
    beneficiaries,
    beneficiaryName,
    beneficiaryAccount,
    beneficiaryBank,
    selectedBeneficiaryId,
    setBeneficiary,
    addBeneficiary,
    fetchBeneficiaries
  } = useTransferStore();

  // Search & Navigation States
  const [searchQuery, setSearchQuery] = useState('');
  const [activeTab, setActiveTab] = useState<'BANKS' | 'SAVED'>('BANKS');
  const [selectedRegion, setSelectedRegion] = useState<BankRegionTab>('ALL');

  // Selected Bank State
  const [chosenBank, setChosenBank] = useState<BankOption | null>(() => {
    if (beneficiaryBank) {
      const match = EMBEDDED_BANKS.find(
        b => b.name.toLowerCase() === beneficiaryBank.toLowerCase()
      );
      if (match) return match;
    }
    return EMBEDDED_BANKS[0]; // Default to JPMorgan Chase
  });
  const [customBankTyped, setCustomBankTyped] = useState<string>('');

  // Beneficiary Input Fields
  const [recipientName, setRecipientName] = useState(beneficiaryName || '');
  const [accountNumber, setAccountNumber] = useState(beneficiaryAccount || '');
  const [selectedSavedId, setSelectedSavedId] = useState<string | null>(selectedBeneficiaryId || null);
  const [formError, setFormError] = useState<string | null>(null);
  const [isSaving, setIsSaving] = useState(false);

  useEffect(() => {
    fetchBeneficiaries();
  }, [fetchBeneficiaries]);

  // Compute matched worldwide banks from embedded database
  const matchedBanks = useMemo(() => {
    return searchWorldwideBanks(searchQuery, selectedRegion);
  }, [searchQuery, selectedRegion]);

  // Compute filtered saved beneficiaries
  const filteredSavedBeneficiaries = useMemo(() => {
    const q = searchQuery.toLowerCase().trim();
    if (!q) return beneficiaries;
    return beneficiaries.filter(
      b =>
        b.name.toLowerCase().includes(q) ||
        b.bank.toLowerCase().includes(q) ||
        b.account.toLowerCase().includes(q)
    );
  }, [beneficiaries, searchQuery]);

  // Handle selecting an embedded bank
  const handleSelectBank = (bank: BankOption) => {
    setChosenBank(bank);
    setCustomBankTyped('');
    setFormError(null);
  };

  // Handle selecting a custom typed worldwide bank
  const handleSelectCustomBank = (bankName: string) => {
    const customBank: BankOption = {
      id: `custom_${Date.now()}`,
      name: bankName.trim(),
      region: 'GLOBAL',
      country: 'Worldwide (International)',
      countryCode: 'INT',
      flag: '🌐',
      swiftBic: 'SWIFT-REGISTERED',
      logoText: bankName.slice(0, 3).toUpperCase(),
      color: '#3B82F6',
      accountFormatLabel: 'Account Number or IBAN',
      accountPlaceholder: 'Enter recipient account or IBAN'
    };
    setChosenBank(customBank);
    setCustomBankTyped('');
    setSearchQuery('');
    setFormError(null);
  };

  // Handle picking a saved beneficiary
  const handleSelectSavedBeneficiary = (b: Beneficiary) => {
    setSelectedSavedId(b.id);
    setRecipientName(b.name);
    setAccountNumber(b.account);

    const matchingBank = EMBEDDED_BANKS.find(
      bank => bank.name.toLowerCase() === b.bank.toLowerCase()
    );
    if (matchingBank) {
      setChosenBank(matchingBank);
    } else {
      setChosenBank({
        id: `ben_bank_${b.id}`,
        name: b.bank,
        region: 'GLOBAL',
        country: 'Registered Bank',
        countryCode: 'INT',
        flag: '🏦',
        logoText: b.bank.slice(0, 3).toUpperCase(),
        color: '#2563EB',
        accountFormatLabel: 'Account Number',
        accountPlaceholder: 'e.g. 1092837461'
      });
    }

    setBeneficiary({
      name: b.name,
      account: b.account,
      bank: b.bank,
      avatar_url: b.avatar_url,
      id: b.id
    });
  };

  // Submit and proceed to review
  const handleContinue = async () => {
    setFormError(null);

    const finalBankName = chosenBank?.name || customBankTyped.trim();
    if (!finalBankName) {
      setFormError('Please select or search for a destination bank.');
      return;
    }

    if (!recipientName.trim()) {
      setFormError('Please enter recipient full name.');
      return;
    }

    if (!accountNumber.trim()) {
      setFormError('Please enter recipient account number or IBAN.');
      return;
    }

    setIsSaving(true);
    try {
      // Save or update in transfer store
      const avatarUrl = `https://ui-avatars.com/api/?name=${encodeURIComponent(recipientName.trim())}&background=1e293b&color=fff&bold=true`;
      
      // Also register into beneficiaries list for convenience if not already saved
      const existing = beneficiaries.find(
        b => b.name.toLowerCase() === recipientName.trim().toLowerCase() && b.account === accountNumber.trim()
      );

      if (!existing && !selectedSavedId) {
        await addBeneficiary({
          name: recipientName.trim(),
          account: accountNumber.trim(),
          bank: finalBankName,
          avatar_url: avatarUrl
        });
      }

      setBeneficiary({
        name: recipientName.trim(),
        account: accountNumber.trim(),
        bank: finalBankName,
        avatar_url: avatarUrl,
        id: selectedSavedId || undefined
      });

      navigate('/transfer/review');
    } catch (err: any) {
      setFormError(err.message || 'Unable to proceed with transfer details.');
    } finally {
      setIsSaving(false);
    }
  };

  const isExactBankMatch = matchedBanks.some(
    b => b.name.toLowerCase() === searchQuery.trim().toLowerCase()
  );

  return (
    <div className="w-full max-w-md mx-auto p-4 sm:p-6 flex flex-col min-h-[620px] justify-between text-slate-100 font-sans">
      <div>
        {/* Header */}
        <div className="flex items-center justify-between mb-4">
          <button
            type="button"
            onClick={() => navigate('/transfer/amount')}
            className="p-2 -ml-2 rounded-full hover:bg-slate-800 text-slate-400 hover:text-white transition-colors"
            aria-label="Back to amount"
          >
            <ArrowLeft className="w-5 h-5" />
          </button>
          <span className="text-xs font-semibold uppercase tracking-wider text-slate-400">Step 2 of 4</span>
          <div className="w-7" />
        </div>

        <h1 className="text-2xl font-bold text-white mb-1">Select recipient & bank</h1>
        <p className="text-xs text-slate-400 mb-4">
          Search registered banks in UK, US, Europe & Worldwide or pick a saved payee
        </p>

        {/* Top-Level Mode Selector (Worldwide Banks vs Saved Payees) */}
        <div className="grid grid-cols-2 gap-2 mb-4 p-1 bg-slate-950/80 rounded-xl border border-slate-800">
          <button
            type="button"
            onClick={() => setActiveTab('BANKS')}
            className={`py-2 px-3 rounded-lg text-xs font-semibold flex items-center justify-center gap-1.5 transition-all ${
              activeTab === 'BANKS'
                ? 'bg-blue-600 text-white shadow-md shadow-blue-600/20'
                : 'text-slate-400 hover:text-slate-200'
            }`}
          >
            <Globe className="w-3.5 h-3.5" />
            <span>Worldwide Banks</span>
          </button>

          <button
            type="button"
            onClick={() => setActiveTab('SAVED')}
            className={`py-2 px-3 rounded-lg text-xs font-semibold flex items-center justify-center gap-1.5 transition-all ${
              activeTab === 'SAVED'
                ? 'bg-blue-600 text-white shadow-md shadow-blue-600/20'
                : 'text-slate-400 hover:text-slate-200'
            }`}
          >
            <Users className="w-3.5 h-3.5" />
            <span>Saved Payees ({beneficiaries.length})</span>
          </button>
        </div>

        {/* 
          SELECTED ELEMENT TARGET: Search Bar Input
          Enhanced styling with prominent border, focus-ring, search icon, clear button, and global badge 
        */}
        <div className="relative mb-3">
          <div className="absolute left-3.5 top-1/2 -translate-y-1/2 flex items-center gap-1 text-slate-400 pointer-events-none">
            <Search className="w-4 h-4 text-blue-400" />
          </div>
          <input
            type="text"
            placeholder={
              activeTab === 'BANKS'
                ? 'Type bank name, country, SWIFT or routing...'
                : 'Search saved payees by name, account or bank...'
            }
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="w-full pl-10 pr-10 py-3 bg-slate-900/90 border border-slate-700/80 rounded-xl text-sm font-medium text-white placeholder-slate-400 outline-none focus:border-blue-500 focus:ring-2 focus:ring-blue-500/25 focus:bg-slate-900 transition-all shadow-inner"
            autoComplete="off"
            spellCheck="false"
          />
          {searchQuery ? (
            <button
              type="button"
              onClick={() => setSearchQuery('')}
              className="absolute right-3 top-1/2 -translate-y-1/2 p-1 text-slate-400 hover:text-white rounded-full transition-colors"
              title="Clear search"
            >
              <X className="w-4 h-4" />
            </button>
          ) : (
            <span className="absolute right-3.5 top-1/2 -translate-y-1/2 text-[10px] font-semibold text-slate-500 bg-slate-800 px-1.5 py-0.5 rounded uppercase tracking-wider pointer-events-none">
              Global
            </span>
          )}
        </div>

        {/* REGION FILTER TABS (US, UK, EUROPE, WORLDWIDE, ALL) */}
        {activeTab === 'BANKS' && (
          <div className="flex items-center gap-1.5 overflow-x-auto pb-2 mb-3 scrollbar-none text-xs">
            {(
              [
                { key: 'ALL', label: 'All Banks', count: EMBEDDED_BANKS.length },
                { key: 'US', label: '🇺🇸 US', count: 17 },
                { key: 'UK', label: '🇬🇧 UK', count: 15 },
                { key: 'EU', label: '🇪🇺 Europe', count: 17 },
                { key: 'GLOBAL', label: '🌐 Worldwide', count: 18 }
              ] as const
            ).map((tab) => (
              <button
                key={tab.key}
                type="button"
                onClick={() => setSelectedRegion(tab.key)}
                className={`px-2.5 py-1.5 rounded-lg font-medium whitespace-nowrap transition-all flex items-center gap-1 shrink-0 ${
                  selectedRegion === tab.key
                    ? 'bg-blue-600/30 border border-blue-500 text-blue-300 shadow-xs'
                    : 'bg-slate-900 border border-slate-800 text-slate-400 hover:text-slate-200 hover:bg-slate-850'
                }`}
              >
                <span>{tab.label}</span>
                <span className="text-[10px] opacity-70 bg-slate-800 px-1 py-0.2 rounded font-mono">
                  {tab.count}
                </span>
              </button>
            ))}
          </div>
        )}

        {/* CHOSEN DESTINATION BANK CARD BANNER */}
        {chosenBank && (
          <div className="mb-4 p-3 bg-blue-950/25 border border-blue-600/40 rounded-2xl flex items-center justify-between shadow-xs">
            <div className="flex items-center gap-2.5 min-w-0">
              <span
                className="w-9 h-9 rounded-xl flex items-center justify-center text-xs font-bold text-white shrink-0 shadow-xs"
                style={{ backgroundColor: chosenBank.color || '#2563EB' }}
              >
                {chosenBank.logoText || 'BK'}
              </span>
              <div className="min-w-0">
                <div className="flex items-center gap-1.5">
                  <span className="text-sm font-semibold text-white truncate">
                    {chosenBank.name}
                  </span>
                  <span className="text-xs shrink-0">{chosenBank.flag}</span>
                </div>
                <p className="text-[11px] text-blue-300/80 truncate">
                  {chosenBank.country} • {chosenBank.code || chosenBank.swiftBic || 'SWIFT Verified'}
                </p>
              </div>
            </div>

            <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-[10px] font-semibold bg-emerald-950/60 text-emerald-400 border border-emerald-800/60 shrink-0">
              <ShieldCheck className="w-3 h-3" />
              <span>Verified</span>
            </span>
          </div>
        )}

        {/* TAB 1: WORLDWIDE EMBEDDED BANKS DIRECTORY & SEARCH RESULTS */}
        {activeTab === 'BANKS' && (
          <div className="space-y-2 mb-4">
            <div className="flex items-center justify-between text-xs text-slate-400 px-0.5 mb-1">
              <span>
                {searchQuery
                  ? `Search results for "${searchQuery}" (${matchedBanks.length})`
                  : `Select Bank (${matchedBanks.length} registered)`}
              </span>
              <span className="text-[11px] text-blue-400 font-medium">Click to select</span>
            </div>

            <div className="max-h-52 overflow-y-auto space-y-1.5 pr-1 divide-y-0 rounded-2xl">
              {/* If user typed a custom query not in bank list, provide Worldwide Custom Bank selection */}
              {searchQuery.trim().length > 1 && !isExactBankMatch && (
                <div
                  onClick={() => handleSelectCustomBank(searchQuery)}
                  className="p-3 rounded-xl bg-blue-900/20 hover:bg-blue-900/40 border border-blue-500/50 cursor-pointer transition-all flex items-center justify-between text-left group"
                >
                  <div className="flex items-center gap-2.5 min-w-0">
                    <div className="w-8 h-8 rounded-lg bg-blue-600 text-white flex items-center justify-center font-bold text-xs shrink-0">
                      🌐
                    </div>
                    <div className="min-w-0">
                      <p className="text-xs font-bold text-blue-200 group-hover:text-white truncate">
                        Select &quot;{searchQuery.trim()}&quot;
                      </p>
                      <p className="text-[11px] text-blue-300/70">
                        Worldwide Registered Institution (SWIFT / BIC Network)
                      </p>
                    </div>
                  </div>
                  <ChevronRight className="w-4 h-4 text-blue-400 shrink-0 group-hover:translate-x-0.5 transition-transform" />
                </div>
              )}

              {/* Matched Banks List */}
              {matchedBanks.map((bank) => {
                const isSelected = chosenBank?.id === bank.id;
                return (
                  <div
                    key={bank.id}
                    onClick={() => handleSelectBank(bank)}
                    className={`p-2.5 rounded-xl border transition-all cursor-pointer flex items-center justify-between ${
                      isSelected
                        ? 'bg-blue-900/30 border-blue-500 shadow-xs'
                        : 'bg-slate-900/80 hover:bg-slate-800/90 border-slate-800'
                    }`}
                  >
                    <div className="flex items-center gap-3 min-w-0">
                      <div
                        className="w-8 h-8 rounded-lg flex items-center justify-center text-[10px] font-bold text-white shrink-0 shadow-xs"
                        style={{ backgroundColor: bank.color }}
                      >
                        {bank.logoText}
                      </div>

                      <div className="min-w-0">
                        <div className="flex items-center gap-1.5">
                          <p className="text-xs font-semibold text-white truncate">
                            {bank.name}
                          </p>
                          <span className="text-xs shrink-0">{bank.flag}</span>
                        </div>
                        <p className="text-[11px] text-slate-400 truncate">
                          {bank.country} •{' '}
                          <span className="font-mono text-slate-300">
                            {bank.code || bank.swiftBic}
                          </span>
                        </p>
                      </div>
                    </div>

                    <div
                      className={`w-5 h-5 rounded-full flex items-center justify-center border shrink-0 transition-colors ${
                        isSelected
                          ? 'bg-blue-600 border-blue-600 text-white'
                          : 'border-slate-700 bg-slate-850'
                      }`}
                    >
                      {isSelected && <Check className="w-3 h-3 stroke-[3]" />}
                    </div>
                  </div>
                );
              })}

              {matchedBanks.length === 0 && !searchQuery && (
                <div className="text-center py-6 text-xs text-slate-400 bg-slate-900/50 rounded-xl border border-slate-800">
                  No banks found in this region.
                </div>
              )}
            </div>
          </div>
        )}

        {/* TAB 2: SAVED BENEFICIARIES LIST */}
        {activeTab === 'SAVED' && (
          <div className="space-y-2 mb-4">
            <div className="flex items-center justify-between text-xs text-slate-400 px-0.5 mb-1">
              <span>Saved Payees ({filteredSavedBeneficiaries.length})</span>
              <button
                type="button"
                onClick={() => {
                  setActiveTab('BANKS');
                  setRecipientName('');
                  setAccountNumber('');
                  setSelectedSavedId(null);
                }}
                className="text-xs text-blue-400 hover:underline"
              >
                + Transfer to New Payee
              </button>
            </div>

            <div className="max-h-52 overflow-y-auto space-y-1.5 pr-1">
              {filteredSavedBeneficiaries.length === 0 ? (
                <div className="text-center py-6 bg-slate-900/50 rounded-xl border border-slate-800">
                  <p className="text-xs text-slate-400">No saved beneficiaries matched your search.</p>
                  <button
                    type="button"
                    onClick={() => setActiveTab('BANKS')}
                    className="mt-2 text-xs font-semibold text-blue-400 hover:underline"
                  >
                    Select a worldwide bank to add a recipient
                  </button>
                </div>
              ) : (
                filteredSavedBeneficiaries.map((b) => {
                  const isSelected = selectedSavedId === b.id;
                  return (
                    <div
                      key={b.id}
                      onClick={() => handleSelectSavedBeneficiary(b)}
                      className={`flex items-center justify-between p-2.5 rounded-xl border transition-all cursor-pointer ${
                        isSelected
                          ? 'bg-blue-900/30 border-blue-500'
                          : 'bg-slate-900/80 hover:bg-slate-800/90 border-slate-800'
                      }`}
                    >
                      <div className="flex items-center gap-3 min-w-0">
                        <img
                          src={
                            b.avatar_url ||
                            `https://ui-avatars.com/api/?name=${encodeURIComponent(b.name)}&background=1e293b&color=fff`
                          }
                          alt={b.name}
                          className="w-8 h-8 rounded-full object-cover border border-slate-700 shrink-0"
                          onError={(e: any) => {
                            e.target.src = `https://ui-avatars.com/api/?name=${encodeURIComponent(b.name)}&background=1e293b&color=fff`;
                          }}
                        />
                        <div className="min-w-0">
                          <p className="text-xs font-semibold text-white truncate">{b.name}</p>
                          <p className="text-[11px] text-slate-400 truncate">
                            {b.bank} • <span className="font-mono text-slate-300">••••{b.account.slice(-4) || b.account}</span>
                          </p>
                        </div>
                      </div>

                      <div
                        className={`w-5 h-5 rounded-full flex items-center justify-center border shrink-0 transition-colors ${
                          isSelected
                            ? 'bg-blue-600 border-blue-600 text-white'
                            : 'border-slate-700 bg-slate-850'
                        }`}
                      >
                        {isSelected && <Check className="w-3 h-3 stroke-[3]" />}
                      </div>
                    </div>
                  );
                })
              )}
            </div>
          </div>
        )}

        {/* RECIPIENT DETAILS INPUT FORM */}
        <div className="bg-slate-900/90 border border-slate-800 rounded-2xl p-3.5 space-y-3">
          <div className="flex items-center justify-between border-b border-slate-800 pb-2">
            <span className="text-xs font-semibold uppercase tracking-wider text-slate-300 flex items-center gap-1.5">
              <Building2 className="w-3.5 h-3.5 text-blue-400" />
              Recipient Account Details
            </span>
            <span className="text-[10px] text-slate-400">
              Bank: <span className="text-blue-400 font-semibold">{chosenBank?.name || 'Selected Bank'}</span>
            </span>
          </div>

          <div>
            <label className="block text-xs font-medium text-slate-300 mb-1">
              Recipient Full Name
            </label>
            <input
              type="text"
              placeholder="e.g. Johnny Mike or Corporate Entity"
              value={recipientName}
              onChange={(e) => {
                setRecipientName(e.target.value);
                setSelectedSavedId(null);
              }}
              className="w-full px-3.5 py-2.5 bg-slate-950 border border-slate-700/80 rounded-xl text-xs sm:text-sm text-white placeholder-slate-500 outline-none focus:border-blue-500 focus:ring-1 focus:ring-blue-500 transition-colors"
            />
          </div>

          <div>
            <label className="block text-xs font-medium text-slate-300 mb-1 flex items-center justify-between">
              <span>{chosenBank?.accountFormatLabel || 'Account Number / IBAN'}</span>
              <span className="text-[10px] font-mono text-slate-400">
                {chosenBank?.countryCode ? `Standard: ${chosenBank.countryCode}` : 'SWIFT Format'}
              </span>
            </label>
            <input
              type="text"
              placeholder={chosenBank?.accountPlaceholder || 'e.g. 4829104829 or IBAN'}
              value={accountNumber}
              onChange={(e) => {
                setAccountNumber(e.target.value);
                setSelectedSavedId(null);
              }}
              className="w-full px-3.5 py-2.5 bg-slate-950 border border-slate-700/80 rounded-xl text-xs sm:text-sm font-mono text-white placeholder-slate-500 outline-none focus:border-blue-500 focus:ring-1 focus:ring-blue-500 transition-colors"
            />
          </div>

          {formError && (
            <p className="text-xs text-rose-400 bg-rose-950/30 border border-rose-900/50 p-2 rounded-lg">
              {formError}
            </p>
          )}
        </div>
      </div>

      {/* Footer Actions: [Back] [Continue to Review] */}
      <div className="pt-4 border-t border-slate-800/80 flex items-center gap-3 mt-4">
        <button
          type="button"
          onClick={() => navigate('/transfer/amount')}
          className="flex-1 py-3.5 px-4 rounded-xl font-medium text-slate-300 hover:bg-slate-800 border border-slate-700 transition-all text-center text-xs sm:text-sm"
        >
          Back
        </button>
        <button
          type="button"
          onClick={handleContinue}
          disabled={isSaving}
          className="flex-1 py-3.5 px-4 rounded-xl font-bold text-white bg-blue-600 hover:bg-blue-500 active:scale-[0.99] transition-all shadow-lg shadow-blue-600/25 text-center text-xs sm:text-sm disabled:opacity-50"
        >
          {isSaving ? 'Validating...' : 'Continue'}
        </button>
      </div>
    </div>
  );
};

export default TransferBeneficiaryScreen;
