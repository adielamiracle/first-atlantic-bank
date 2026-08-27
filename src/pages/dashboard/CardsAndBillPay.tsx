import React, { useState, useEffect } from 'react';
import { useBank } from '../../context/BankContext';
import { CurrencyDisplay } from '../../components/common/CurrencyDisplay';
import {
  Receipt,
  Search,
  CheckCircle2,
  Lock,
  Building,
  Calendar,
  Zap,
  CreditCard,
  PhoneCall,
  ShieldAlert
} from 'lucide-react';
import { BillPayVendor } from '../../types';

export const BillPayPage: React.FC = () => {
  const { accounts, executeBillPay, showToast, region } = useBank();

  const [vendors, setVendors] = useState<BillPayVendor[]>([
    { id: 'vnd_coned_01', name: 'Consolidated Edison NY', category: 'Utilities', billerCode: 'CONED-US', region: 'US' },
    { id: 'vnd_verizon_02', name: 'Verizon Wireless Sovereign', category: 'Telecommunications', billerCode: 'VZW-US', region: 'US' },
    { id: 'vnd_amex_03', name: 'American Express Centurion', category: 'Credit Card', billerCode: 'AMEX-GLB', region: 'US' }
  ]);
  const [selectedVendorId, setSelectedVendorId] = useState('vnd_coned_01');
  const [sourceAccountId, setSourceAccountId] = useState(accounts[0]?.id || '');
  const [amountStr, setAmountStr] = useState('350.00');
  const [accountNumberWithVendor, setAccountNumberWithVendor] = useState('9812-491-002');
  const [isProcessing, setIsProcessing] = useState(false);
  const [search, setSearch] = useState('');

  useEffect(() => {
    fetch('/api/payments/vendors')
      .then(async (res) => {
        const text = await res.text();
        if (text.trim().startsWith('<')) return null;
        return JSON.parse(text);
      })
      .then((data) => {
        if (data && data.vendors && data.vendors.length > 0) {
          setVendors(data.vendors);
          setSelectedVendorId(data.vendors[0].id);
        }
      })
      .catch((e) => console.warn('Vendor fetch notice:', e));
  }, []);

  const filteredVendors = vendors.filter((v) =>
    v.name.toLowerCase().includes(search.toLowerCase()) ||
    v.billerCode.toLowerCase().includes(search.toLowerCase())
  );

  const selectedVendor = vendors.find((v) => v.id === selectedVendorId) || vendors[0];
  const sourceAccount = accounts.find((a) => a.id === sourceAccountId) || accounts[0];

  const handlePay = async (e: React.FormEvent) => {
    e.preventDefault();
    const amountMinor = Math.round(parseFloat(amountStr || '0') * 100);

    if (amountMinor <= 0) {
      showToast('ERROR', 'Invalid Amount', 'Please enter a valid bill payment amount.');
      return;
    }

    setIsProcessing(true);
    try {
      const res = await executeBillPay(
        sourceAccountId,
        selectedVendorId,
        amountMinor,
        accountNumberWithVendor
      );

      if (res.success) {
        setAmountStr('');
      }
    } finally {
      setIsProcessing(false);
    }
  };

  return (
    <div className="max-w-4xl mx-auto space-y-6">
      <div className="bg-white dark:bg-[#0a192f] rounded-2xl p-6 border border-slate-200 dark:border-[#1e3656] shadow-sm space-y-2 transition-colors">
        <h1 className="text-xl font-bold font-serif text-slate-900 dark:text-white">
          Electronic Bill Pay &amp; Remittance
        </h1>
        <p className="text-xs text-slate-500 dark:text-slate-400">
          Direct electronic settlement to verified corporate utilities, tax authorities, and credit issuers.
        </p>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
        {/* Left Column: Vendor Directory */}
        <div className="lg:col-span-5 bg-white dark:bg-[#0a192f] rounded-2xl p-5 border border-slate-200 dark:border-[#1e3656] shadow-sm space-y-4 transition-colors">
          <div className="space-y-2">
            <h3 className="text-xs font-bold uppercase tracking-wider text-slate-700 dark:text-slate-300 font-serif">
              Select Payee / Biller
            </h3>
            <div className="relative">
              <Search className="w-3.5 h-3.5 absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" />
              <input
                type="text"
                placeholder="Search utility, biller code..."
                value={search}
                onChange={(e) => setSearch(e.target.value)}
                className="w-full pl-8 pr-3 py-1.5 text-xs bg-slate-50 dark:bg-slate-900/60 border border-slate-300 dark:border-slate-700 rounded-lg text-slate-900 dark:text-slate-100 focus:outline-none focus:border-[#c5a880]"
              />
            </div>
          </div>

          <div className="space-y-2 max-h-[380px] overflow-y-auto pr-1">
            {filteredVendors.map((vendor) => (
              <div
                key={vendor.id}
                onClick={() => setSelectedVendorId(vendor.id)}
                className={`p-3 rounded-xl border transition-all cursor-pointer flex items-center gap-3 ${
                  selectedVendorId === vendor.id
                    ? 'bg-[#0a192f] dark:bg-[#112a4a] text-white border-[#c5a880]/60 shadow-xs'
                    : 'bg-slate-50 dark:bg-slate-800/50 hover:bg-slate-100 dark:hover:bg-slate-800 text-slate-800 dark:text-slate-200 border-slate-200 dark:border-slate-700/60'
                }`}
              >
                <div className="text-xl p-1 bg-white/10 rounded-lg shrink-0">{vendor.logo}</div>
                <div className="min-w-0">
                  <h4 className="text-xs font-bold truncate text-slate-900 dark:text-white">{vendor.name}</h4>
                  <p className={`text-[10px] font-mono ${selectedVendorId === vendor.id ? 'text-slate-300' : 'text-slate-500 dark:text-slate-400'}`}>
                    Code: {vendor.billerCode}
                  </p>
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* Right Column: Payment Form */}
        <div className="lg:col-span-7 bg-white dark:bg-[#0a192f] rounded-2xl p-6 sm:p-7 border border-slate-200 dark:border-[#1e3656] shadow-sm space-y-5 transition-colors">
          <div className="pb-3 border-b border-slate-100 dark:border-slate-800 flex items-center justify-between">
            <div>
              <span className="text-[10px] uppercase font-bold text-[#8c6d37] dark:text-[#c5a880] tracking-wider">
                Selected Payee
              </span>
              <h3 className="text-base font-bold text-slate-900 dark:text-white">{selectedVendor?.name}</h3>
            </div>
            <span className="text-xs font-mono px-2 py-0.5 rounded bg-slate-100 dark:bg-slate-800 text-slate-600 dark:text-slate-300 border border-slate-200 dark:border-slate-700">
              {selectedVendor?.billerCode}
            </span>
          </div>

          <form onSubmit={handlePay} className="space-y-4">
            <div>
              <label className="block text-xs font-bold uppercase tracking-wider text-slate-700 dark:text-slate-300 mb-1">
                Pay From Account
              </label>
              <select
                value={sourceAccountId}
                onChange={(e) => setSourceAccountId(e.target.value)}
                className="w-full px-3.5 py-2.5 text-xs bg-slate-50 dark:bg-slate-900 border border-slate-300 dark:border-slate-700 rounded-xl text-slate-900 dark:text-slate-100 font-medium focus:bg-white dark:focus:bg-slate-900 focus:outline-none focus:border-[#c5a880]"
              >
                {accounts.map((acc) => (
                  <option key={acc.id} value={acc.id}>
                    {acc.name} ({acc.accountNumber}) — Available: ${(acc.availableBalanceMinor / 100).toLocaleString()} {acc.currency}
                  </option>
                ))}
              </select>
            </div>

            <div>
              <label className="block text-xs font-bold uppercase tracking-wider text-slate-700 dark:text-slate-300 mb-1">
                Your Account Number with Biller
              </label>
              <input
                type="text"
                required
                value={accountNumberWithVendor}
                onChange={(e) => setAccountNumberWithVendor(e.target.value)}
                placeholder="e.g. 8820-194-001"
                className="w-full px-3.5 py-2.5 text-xs bg-slate-50 dark:bg-slate-900 border border-slate-300 dark:border-slate-700 rounded-xl text-slate-900 dark:text-slate-100 font-mono focus:bg-white dark:focus:bg-slate-900 focus:outline-none focus:border-[#c5a880]"
              />
            </div>

            <div>
              <label className="block text-xs font-bold uppercase tracking-wider text-slate-700 dark:text-slate-300 mb-1">
                Payment Amount ($)
              </label>
              <div className="relative">
                <span className="absolute left-3.5 top-1/2 -translate-y-1/2 font-bold text-slate-500 font-serif">$</span>
                <input
                  type="number"
                  step="0.01"
                  required
                  value={amountStr}
                  onChange={(e) => setAmountStr(e.target.value)}
                  placeholder="0.00"
                  className="w-full pl-8 pr-4 py-2.5 text-base font-mono font-bold bg-slate-50 dark:bg-slate-900 border border-slate-300 dark:border-slate-700 rounded-xl text-slate-900 dark:text-slate-100 focus:bg-white dark:focus:bg-slate-900 focus:outline-none focus:border-[#c5a880]"
                />
              </div>
            </div>

            <div className="p-3.5 rounded-xl bg-slate-50 dark:bg-slate-900/60 border border-slate-200 dark:border-slate-800 text-xs text-slate-600 dark:text-slate-300 flex items-start gap-2.5">
              <CheckCircle2 className="w-4 h-4 text-emerald-600 dark:text-emerald-400 shrink-0 mt-0.5" />
              <span>
                Standard automated clearing applies. Payments submitted before 5:00 PM EST credit the same business cycle.
              </span>
            </div>

            <button
              type="submit"
              disabled={isProcessing}
              className="w-full py-3.5 rounded-xl bg-[#0a192f] dark:bg-[#112a4a] hover:bg-[#132d52] text-white font-bold text-xs uppercase tracking-widest transition-all shadow-md flex items-center justify-center gap-2 cursor-pointer border border-[#c5a880]/30"
            >
              <Lock className="w-3.5 h-3.5 text-[#d4af37]" />
              <span>{isProcessing ? 'Transmitting Payment...' : 'Authorize Bill Payment'}</span>
            </button>
          </form>
        </div>
      </div>
    </div>
  );
};

export const CardsPage: React.FC = () => {
  const { cards, toggleCardFreeze, updateCardControls, showToast } = useBank();
  const [selectedCardId, setSelectedCardId] = useState<string>(cards[0]?.id || '');
  const [flipped, setFlipped] = useState(false);
  const [showPinModal, setShowPinModal] = useState(false);
  const [pinInput, setPinInput] = useState('');

  const selectedCard = cards.find((c) => c.id === selectedCardId) || cards[0];

  if (!selectedCard) {
    return <div className="p-8 text-center text-slate-500 dark:text-slate-400">No payment cards on file.</div>;
  }

  const isFrozen = selectedCard.status === 'FROZEN';

  const handleUpdateLimit = (e: React.ChangeEvent<HTMLInputElement>) => {
    const val = Number(e.target.value) * 100;
    updateCardControls(selectedCard.id, { dailySpendLimitMinor: val });
  };

  return (
    <div className="max-w-5xl mx-auto space-y-6">
      <div className="bg-white dark:bg-[#0a192f] rounded-2xl p-6 border border-slate-200 dark:border-[#1e3656] shadow-sm flex flex-col sm:flex-row sm:items-center justify-between gap-4 transition-colors">
        <div>
          <h1 className="text-xl font-bold font-serif text-slate-900 dark:text-white">
            Card Management &amp; Spend Controls
          </h1>
          <p className="text-xs text-slate-500 dark:text-slate-400">
            Manage your physical and virtual Visa Signature and Infinite credit cards.
          </p>
        </div>

        <div className="flex gap-2">
          {cards.map((c) => (
            <button
              key={c.id}
              onClick={() => {
                setSelectedCardId(c.id);
                setFlipped(false);
              }}
              className={`px-3 py-1.5 rounded-lg text-xs font-semibold transition-all cursor-pointer ${
                selectedCardId === c.id
                  ? 'bg-[#0a192f] dark:bg-[#112a4a] text-white shadow-xs border border-[#c5a880]/50'
                  : 'bg-slate-100 dark:bg-slate-800 text-slate-700 dark:text-slate-300 hover:bg-slate-200 dark:hover:bg-slate-700'
              }`}
            >
              {c.cardType === 'CREDIT_ATLANTIC_INFINITE' ? 'Infinite Credit' : 'Debit Signature'} (•••• {c.cardNumberMasked ? c.cardNumberMasked.slice(-4) : '••••'})
            </button>
          ))}
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-start">
        {/* Left Column: Visual Card */}
        <div className="lg:col-span-5 space-y-4">
          {/* Card Graphic with Flip Interaction */}
          <div
            onClick={() => setFlipped(!flipped)}
            className="cursor-pointer perspective-1000 select-none"
          >
            <div
              className={`relative h-56 rounded-2xl p-6 shadow-2xl transition-transform duration-500 text-white flex flex-col justify-between overflow-hidden border ${
                selectedCard.cardType === 'CREDIT_ATLANTIC_INFINITE'
                  ? 'bg-gradient-to-tr from-[#050e1a] via-[#102a4a] to-[#071322] border-[#c5a880]/40'
                  : 'bg-gradient-to-tr from-[#0f243d] via-[#1b3d63] to-[#0a1b2e] border-slate-700'
              }`}
            >
              {/* Card Texture Highlights */}
              <div className="absolute top-0 right-0 w-48 h-48 bg-radial from-[#c5a880]/20 to-transparent blur-xl pointer-events-none" />

              {!flipped ? (
                /* Card Front */
                <>
                  <div className="flex items-start justify-between relative z-10">
                    <div>
                      <span className="text-[10px] font-mono tracking-widest text-[#c5a880] uppercase font-bold">
                        FIRST ATLANTIC BANK
                      </span>
                      <div className="text-xs font-serif font-semibold text-slate-300">
                        {selectedCard.cardType === 'CREDIT_ATLANTIC_INFINITE' ? 'Atlantic Infinite' : 'Visa Signature'}
                      </div>
                    </div>
                    <div className="w-10 h-7 rounded-md bg-gradient-to-r from-[#d4af37] to-[#e6ca65] opacity-80 border border-[#b89758]" />
                  </div>

                  <div className="relative z-10 space-y-1">
                    <div className="text-lg sm:text-xl font-mono tracking-[0.25em] font-bold text-slate-100">
                      {selectedCard.cardNumberMasked}
                    </div>
                    <div className="flex items-center gap-4 text-[10px] font-mono text-slate-400">
                      <span>EXP: {String(selectedCard.expiryMonth || '12').padStart(2, '0')}/{String(selectedCard.expiryYear || '28').slice(-2)}</span>
                      <span>CVV: •••</span>
                    </div>
                  </div>

                  <div className="flex items-end justify-between relative z-10">
                    <span className="text-xs font-mono uppercase tracking-wider text-slate-300 font-semibold">
                      {selectedCard.cardHolderName}
                    </span>
                    <span className="text-base font-bold italic font-serif text-slate-100">
                      VISA
                    </span>
                  </div>
                </>
              ) : (
                /* Card Back */
                <>
                  <div className="bg-black/90 h-10 -mx-6 mt-1" />
                  <div className="p-2 bg-slate-200 text-slate-900 rounded font-mono text-xs text-right font-bold tracking-widest">
                    CVV: {selectedCard.cvv}
                  </div>
                  <div className="text-[9px] text-slate-400 font-mono leading-tight">
                    Authoritative card property of First Atlantic Bank. Issued under license by Visa USA Inc.
                  </div>
                </>
              )}

              {isFrozen && (
                <div className="absolute inset-0 bg-slate-950/80 backdrop-blur-xs flex flex-col items-center justify-center text-center p-4">
                  <ShieldAlert className="w-10 h-10 text-rose-400 mb-1" />
                  <span className="text-sm font-bold text-white uppercase tracking-wider">Card Temporarily Frozen</span>
                  <span className="text-[11px] text-slate-300 mt-0.5">Authorizations blocked until unfrozen</span>
                </div>
              )}
            </div>
          </div>

          <div className="text-center text-xs text-slate-500 dark:text-slate-400">
            Click card to flip and reveal security details
          </div>

          {/* Quick Actions */}
          <div className="grid grid-cols-2 gap-3">
            <button
              onClick={() => toggleCardFreeze(selectedCard.id)}
              className={`py-3 rounded-xl font-bold text-xs uppercase tracking-wider transition-colors flex items-center justify-center gap-2 shadow-xs cursor-pointer ${
                isFrozen
                  ? 'bg-emerald-600 hover:bg-emerald-700 text-white'
                  : 'bg-rose-600 hover:bg-rose-700 text-white'
              }`}
            >
              <ShieldAlert className="w-4 h-4" />
              <span>{isFrozen ? 'Unfreeze Card' : 'Freeze Card'}</span>
            </button>

            <button
              onClick={() => setShowPinModal(true)}
              className="py-3 rounded-xl border border-slate-300 dark:border-slate-700 hover:bg-slate-50 dark:hover:bg-slate-800 font-semibold text-xs text-slate-700 dark:text-slate-200 transition-colors cursor-pointer"
            >
              Change Card PIN
            </button>
          </div>
        </div>

        {/* Right Column: Card Rules & Limits */}
        <div className="lg:col-span-7 bg-white dark:bg-[#0a192f] rounded-2xl p-6 sm:p-7 border border-slate-200 dark:border-[#1e3656] shadow-sm space-y-6 transition-colors">
          <h3 className="text-sm font-bold uppercase tracking-wider text-slate-800 dark:text-slate-200 font-serif">
            Security &amp; Usage Controls
          </h3>

          {/* Toggle Switches */}
          <div className="space-y-4 divide-y divide-slate-100 dark:divide-slate-800">
            <div className="pt-2 flex items-center justify-between">
              <div>
                <h4 className="text-xs font-bold text-slate-900 dark:text-white">Contactless NFC Payments</h4>
                <p className="text-[11px] text-slate-500 dark:text-slate-400">Allow tap-to-pay on Apple Pay, Google Wallet &amp; POS terminals</p>
              </div>
              <input
                type="checkbox"
                checked={selectedCard.contactlessEnabled}
                onChange={(e) => updateCardControls(selectedCard.id, { contactlessEnabled: e.target.checked })}
                className="w-5 h-5 rounded text-[#0a192f] focus:ring-[#8c6d37] cursor-pointer"
              />
            </div>

            <div className="pt-4 flex items-center justify-between">
              <div>
                <h4 className="text-xs font-bold text-slate-900 dark:text-white">Online &amp; E-Commerce Transactions</h4>
                <p className="text-[11px] text-slate-500 dark:text-slate-400">Allow web card authorizations with 3D-Secure 2.0 verification</p>
              </div>
              <input
                type="checkbox"
                checked={selectedCard.onlineTransactionsEnabled}
                onChange={(e) => updateCardControls(selectedCard.id, { onlineTransactionsEnabled: e.target.checked })}
                className="w-5 h-5 rounded text-[#0a192f] focus:ring-[#8c6d37] cursor-pointer"
              />
            </div>

            <div className="pt-4 flex items-center justify-between">
              <div>
                <h4 className="text-xs font-bold text-slate-900 dark:text-white">International Cross-Border Spending</h4>
                <p className="text-[11px] text-slate-500 dark:text-slate-400">Zero foreign transaction fee settlement across 140+ countries</p>
              </div>
              <input
                type="checkbox"
                checked={selectedCard.internationalSpendEnabled}
                onChange={(e) => updateCardControls(selectedCard.id, { internationalSpendEnabled: e.target.checked })}
                className="w-5 h-5 rounded text-[#0a192f] focus:ring-[#8c6d37] cursor-pointer"
              />
            </div>
          </div>

          {/* Limit Slider */}
          <div className="pt-2 space-y-2">
            <div className="flex justify-between text-xs font-bold text-slate-800 dark:text-slate-200 font-mono">
              <span>Daily Spending Limit:</span>
              <span className="text-[#8c6d37] dark:text-[#c5a880]">${(selectedCard.dailySpendLimitMinor / 100).toLocaleString()} USD</span>
            </div>
            <input
              type="range"
              min="1000"
              max="50000"
              step="1000"
              value={selectedCard.dailySpendLimitMinor / 100}
              onChange={handleUpdateLimit}
              className="w-full h-2 bg-slate-200 dark:bg-slate-700 rounded-lg appearance-none cursor-pointer accent-[#c5a880]"
            />
            <div className="flex justify-between text-[10px] text-slate-400 font-mono">
              <span>$1,000</span>
              <span>$25,000</span>
              <span>$50,000</span>
            </div>
          </div>
        </div>
      </div>

      {/* PIN Change Modal */}
      {showPinModal && (
        <div className="fixed inset-0 z-50 bg-slate-900/70 backdrop-blur-xs flex items-center justify-center p-4">
          <div className="bg-white dark:bg-[#0a192f] rounded-2xl max-w-sm w-full p-6 shadow-2xl border border-slate-200 dark:border-[#1e3656] space-y-4">
            <h3 className="text-base font-bold text-slate-900 dark:text-white font-serif">Set New 4-Digit Card PIN</h3>
            <p className="text-xs text-slate-500 dark:text-slate-400">
              PIN updates synchronize with EMV chips upon your next chip-and-PIN authorization.
            </p>
            <input
              type="password"
              maxLength={4}
              value={pinInput}
              onChange={(e) => setPinInput(e.target.value.replace(/\D/g, ''))}
              placeholder="••••"
              className="w-full text-center text-2xl font-mono tracking-[0.5em] py-2 bg-slate-50 dark:bg-slate-900 border border-slate-300 dark:border-slate-700 rounded-xl text-slate-900 dark:text-white focus:outline-none focus:border-[#c5a880]"
            />
            <div className="flex gap-2">
              <button
                onClick={() => setShowPinModal(false)}
                className="flex-1 py-2 rounded-xl border border-slate-300 dark:border-slate-700 text-xs font-semibold text-slate-700 dark:text-slate-300 hover:bg-slate-50 dark:hover:bg-slate-800 cursor-pointer"
              >
                Cancel
              </button>
              <button
                onClick={() => {
                  if (pinInput.length === 4) {
                    showToast('SUCCESS', 'PIN Updated', 'New card PIN has been programmed.');
                    setShowPinModal(false);
                    setPinInput('');
                  }
                }}
                disabled={pinInput.length !== 4}
                className="flex-1 py-2 rounded-xl bg-[#0a192f] dark:bg-[#112a4a] text-white font-bold text-xs uppercase cursor-pointer border border-[#c5a880]/30"
              >
                Save PIN
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
