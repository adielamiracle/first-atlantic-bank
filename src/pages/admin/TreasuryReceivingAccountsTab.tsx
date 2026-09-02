import React, { useState, useEffect } from 'react';
import { useBank } from '../../context/BankContext';
import {
  Landmark,
  Plus,
  Edit2,
  Trash2,
  Copy,
  Check,
  Building,
  Globe2,
  ShieldCheck,
  HelpCircle,
  FileText,
  Star,
  CheckCircle2,
  X,
  RefreshCw,
  AlertCircle
} from 'lucide-react';
import { BankReceivingAccount, CurrencyCode, BankRegion } from '../../types';

export const TreasuryReceivingAccountsTab: React.FC = () => {
  const {
    bankReceivingAccounts,
    fetchBankReceivingAccounts,
    saveBankReceivingAccount,
    deleteBankReceivingAccount,
    showToast
  } = useBank();

  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingAccount, setEditingAccount] = useState<Partial<BankReceivingAccount> | null>(null);
  const [copiedId, setCopiedId] = useState<string | null>(null);
  const [isSaving, setIsSaving] = useState(false);

  // Form fields
  const [label, setLabel] = useState('');
  const [bankName, setBankName] = useState('');
  const [beneficiaryName, setBeneficiaryName] = useState('');
  const [accountNumberOrIban, setAccountNumberOrIban] = useState('');
  const [routingNumber, setRoutingNumber] = useState('');
  const [sortCode, setSortCode] = useState('');
  const [swiftBic, setSwiftBic] = useState('');
  const [currency, setCurrency] = useState<CurrencyCode>('USD');
  const [region, setRegion] = useState<BankRegion>('US');
  const [bankAddress, setBankAddress] = useState('');
  const [intermediaryBankName, setIntermediaryBankName] = useState('');
  const [intermediarySwiftBic, setIntermediarySwiftBic] = useState('');
  const [specialInstructions, setSpecialInstructions] = useState('');
  const [isDefault, setIsDefault] = useState(true);
  const [status, setStatus] = useState<'ACTIVE' | 'INACTIVE'>('ACTIVE');

  useEffect(() => {
    fetchBankReceivingAccounts();
  }, []);

  const openAddModal = () => {
    setEditingAccount(null);
    setLabel('Primary USD Treasury Inflow Desk');
    setBankName('First Atlantic Bank N.A.');
    setBeneficiaryName('First Atlantic Bank & Trust Corp - Inflow Receiving Desk');
    setAccountNumberOrIban('');
    setRoutingNumber('021000089');
    setSortCode('');
    setSwiftBic('FATLUS33NYC');
    setCurrency('USD');
    setRegion('US');
    setBankAddress('450 Lexington Avenue, Suite 2800, New York, NY 10017, USA');
    setIntermediaryBankName('');
    setIntermediarySwiftBic('');
    setSpecialInstructions('Quote Client Account Reference in SWIFT / Wire field 70.');
    setIsDefault(true);
    setStatus('ACTIVE');
    setIsModalOpen(true);
  };

  const openEditModal = (acc: BankReceivingAccount) => {
    setEditingAccount(acc);
    setLabel(acc.label);
    setBankName(acc.bankName);
    setBeneficiaryName(acc.beneficiaryName);
    setAccountNumberOrIban(acc.accountNumberOrIban);
    setRoutingNumber(acc.routingNumber || '');
    setSortCode(acc.sortCode || '');
    setSwiftBic(acc.swiftBic);
    setCurrency(acc.currency);
    setRegion(acc.region);
    setBankAddress(acc.bankAddress);
    setIntermediaryBankName(acc.intermediaryBankName || '');
    setIntermediarySwiftBic(acc.intermediarySwiftBic || '');
    setSpecialInstructions(acc.specialInstructions || '');
    setIsDefault(acc.isDefault);
    setStatus(acc.status);
    setIsModalOpen(true);
  };

  const handleSave = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!bankName || !beneficiaryName || !accountNumberOrIban) {
      showToast('ERROR', 'Missing Fields', 'Bank name, Beneficiary, and Account/IBAN are required.');
      return;
    }

    setIsSaving(true);
    try {
      const res = await saveBankReceivingAccount({
        id: editingAccount?.id,
        label,
        bankName,
        beneficiaryName,
        accountNumberOrIban,
        routingNumber: routingNumber.trim() || undefined,
        sortCode: sortCode.trim() || undefined,
        swiftBic: swiftBic.trim(),
        currency,
        region,
        bankAddress,
        intermediaryBankName: intermediaryBankName.trim() || undefined,
        intermediarySwiftBic: intermediarySwiftBic.trim() || undefined,
        specialInstructions,
        isDefault,
        status
      });

      if (res.success) {
        setIsModalOpen(false);
      }
    } catch (err: any) {
      showToast('ERROR', 'Save Failed', err.message);
    } finally {
      setIsSaving(false);
    }
  };

  const handleDelete = async (id: string, name: string) => {
    if (window.confirm(`Are you sure you want to delete receiving account "${name}"?`)) {
      await deleteBankReceivingAccount(id);
    }
  };

  const handleCopyInstructions = (acc: BankReceivingAccount) => {
    const text = `FIRST ATLANTIC BANK - OFFICIAL RECEIVING ACCOUNT
Currency: ${acc.currency}
Beneficiary Name: ${acc.beneficiaryName}
Receiving Bank: ${acc.bankName}
Account Number / IBAN: ${acc.accountNumberOrIban}
${acc.routingNumber ? `Routing Number (ABA): ${acc.routingNumber}\n` : ''}${acc.sortCode ? `Sort Code: ${acc.sortCode}\n` : ''}SWIFT / BIC: ${acc.swiftBic}
Bank Address: ${acc.bankAddress}
${acc.specialInstructions ? `Special Instructions: ${acc.specialInstructions}` : ''}`;

    navigator.clipboard.writeText(text);
    setCopiedId(acc.id);
    showToast('SUCCESS', 'Copied Wire Details', 'Complete wire transfer receiving instructions copied to clipboard.');
    setTimeout(() => setCopiedId(null), 3000);
  };

  return (
    <div className="space-y-6">
      {/* Header Banner */}
      <div className="bg-white rounded-2xl border border-slate-200 p-4 sm:p-6 shadow-sm flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div className="space-y-1">
          <div className="flex items-center gap-2">
            <div className="p-2 rounded-lg bg-[#0a192f] text-[#d4af37]">
              <Landmark className="w-5 h-5" />
            </div>
            <div>
              <h2 className="text-lg font-bold font-serif text-slate-900">
                Official Bank Receiving Accounts (Treasury Inflow Desks)
              </h2>
              <p className="text-xs text-slate-500">
                Define the institutional bank accounts where client payments, incoming wire transfers, and deposit settlements are received
              </p>
            </div>
          </div>
        </div>

        <button
          onClick={openAddModal}
          className="px-4 py-2.5 rounded-xl bg-[#0a192f] hover:bg-[#153459] text-white text-xs font-bold flex items-center justify-center gap-2 shadow-md transition-all cursor-pointer self-start sm:self-auto"
        >
          <Plus className="w-4 h-4 text-[#d4af37]" />
          <span>Add New Bank Receiving Account</span>
        </button>
      </div>

      {/* Accounts List Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-5">
        {bankReceivingAccounts.map(acc => {
          const isCopied = copiedId === acc.id;
          return (
            <div
              key={acc.id}
              className="bg-white rounded-2xl border border-slate-200 shadow-sm overflow-hidden flex flex-col justify-between hover:shadow-md transition-shadow relative"
            >
              {/* Top Bar */}
              <div className="p-4 bg-gradient-to-r from-[#0a192f] to-[#142f54] text-white space-y-2">
                <div className="flex items-center justify-between">
                  <span className="text-[10px] font-bold uppercase tracking-wider px-2 py-0.5 rounded bg-white/10 text-[#d4af37] border border-white/10 font-mono">
                    {acc.currency} Inflow Desk
                  </span>
                  <div className="flex items-center gap-1.5">
                    {acc.isDefault && (
                      <span className="flex items-center gap-1 text-[10px] font-bold px-2 py-0.5 rounded bg-emerald-500/20 text-emerald-300 border border-emerald-500/30">
                        <Star className="w-2.5 h-2.5 fill-current" /> Default
                      </span>
                    )}
                    <span
                      className={`text-[10px] font-bold px-2 py-0.5 rounded ${
                        acc.status === 'ACTIVE'
                          ? 'bg-emerald-600 text-white'
                          : 'bg-slate-600 text-slate-200'
                      }`}
                    >
                      {acc.status}
                    </span>
                  </div>
                </div>

                <h3 className="text-sm font-bold text-white font-serif">{acc.label}</h3>
                <p className="text-[11px] text-slate-300 truncate">{acc.bankName}</p>
              </div>

              {/* Body Details */}
              <div className="p-4 space-y-3 text-xs flex-1">
                <div className="space-y-1">
                  <span className="text-[10px] font-bold text-slate-400 uppercase tracking-wider block">
                    Beneficiary Customer Name
                  </span>
                  <div className="font-semibold text-slate-800 bg-slate-50 p-2 rounded-lg border border-slate-100 select-all font-mono text-[11px]">
                    {acc.beneficiaryName}
                  </div>
                </div>

                <div className="grid grid-cols-2 gap-2">
                  <div>
                    <span className="text-[10px] font-bold text-slate-400 uppercase tracking-wider block">
                      Account / IBAN
                    </span>
                    <div className="font-mono font-bold text-slate-900 bg-slate-50 p-2 rounded-lg border border-slate-100 select-all text-[11px] truncate">
                      {acc.accountNumberOrIban}
                    </div>
                  </div>

                  <div>
                    <span className="text-[10px] font-bold text-slate-400 uppercase tracking-wider block">
                      SWIFT / BIC
                    </span>
                    <div className="font-mono font-bold text-slate-900 bg-slate-50 p-2 rounded-lg border border-slate-100 select-all text-[11px]">
                      {acc.swiftBic}
                    </div>
                  </div>
                </div>

                {acc.routingNumber && (
                  <div>
                    <span className="text-[10px] font-bold text-slate-400 uppercase tracking-wider block">
                      Routing Number (ABA)
                    </span>
                    <div className="font-mono text-slate-700 bg-slate-50 p-1.5 rounded-lg border border-slate-100 text-[11px]">
                      {acc.routingNumber}
                    </div>
                  </div>
                )}

                {acc.sortCode && (
                  <div>
                    <span className="text-[10px] font-bold text-slate-400 uppercase tracking-wider block">
                      UK Sort Code
                    </span>
                    <div className="font-mono text-slate-700 bg-slate-50 p-1.5 rounded-lg border border-slate-100 text-[11px]">
                      {acc.sortCode}
                    </div>
                  </div>
                )}

                <div>
                  <span className="text-[10px] font-bold text-slate-400 uppercase tracking-wider block">
                    Bank Address
                  </span>
                  <div className="text-slate-600 text-[11px] leading-tight">
                    {acc.bankAddress}
                  </div>
                </div>

                {acc.specialInstructions && (
                  <div className="p-2.5 rounded-lg bg-amber-50/80 border border-amber-200/60 text-[11px] text-amber-900 leading-snug">
                    <strong>Memo Note:</strong> {acc.specialInstructions}
                  </div>
                )}
              </div>

              {/* Bottom Actions */}
              <div className="p-3 bg-slate-50 border-t border-slate-100 flex items-center justify-between gap-2">
                <button
                  type="button"
                  onClick={() => handleCopyInstructions(acc)}
                  className={`flex-1 py-1.5 px-3 rounded-lg text-xs font-bold flex items-center justify-center gap-1.5 transition-all cursor-pointer ${
                    isCopied
                      ? 'bg-emerald-600 text-white'
                      : 'bg-white hover:bg-slate-100 text-slate-700 border border-slate-200 shadow-2xs'
                  }`}
                >
                  {isCopied ? <Check className="w-3.5 h-3.5" /> : <Copy className="w-3.5 h-3.5" />}
                  <span>{isCopied ? 'Instructions Copied!' : 'Copy Wire Info'}</span>
                </button>

                <div className="flex items-center gap-1">
                  <button
                    type="button"
                    onClick={() => openEditModal(acc)}
                    className="p-1.5 rounded-lg bg-white hover:bg-slate-100 text-slate-700 border border-slate-200 transition-colors"
                    title="Edit Receiving Account"
                  >
                    <Edit2 className="w-3.5 h-3.5" />
                  </button>
                  <button
                    type="button"
                    onClick={() => handleDelete(acc.id, acc.label)}
                    className="p-1.5 rounded-lg bg-rose-50 hover:bg-rose-100 text-rose-700 border border-rose-200 transition-colors"
                    title="Delete Receiving Account"
                  >
                    <Trash2 className="w-3.5 h-3.5" />
                  </button>
                </div>
              </div>
            </div>
          );
        })}
      </div>

      {/* ADD / EDIT MODAL */}
      {isModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/70 backdrop-blur-xs">
          <div className="bg-white rounded-2xl max-w-xl w-full overflow-hidden shadow-2xl border border-slate-200 animate-in fade-in zoom-in duration-150">
            <div className="p-5 bg-gradient-to-r from-[#0a192f] to-[#122846] text-white flex items-center justify-between">
              <div className="flex items-center gap-2">
                <Landmark className="w-5 h-5 text-[#d4af37]" />
                <div>
                  <h3 className="text-base font-bold font-serif">
                    {editingAccount ? 'Edit Bank Receiving Account' : 'Add Bank Receiving Account'}
                  </h3>
                  <p className="text-[11px] text-slate-300">
                    Configured for client payment receipt &amp; inbound wire routing
                  </p>
                </div>
              </div>
              <button
                onClick={() => setIsModalOpen(false)}
                className="p-1 rounded-lg text-slate-400 hover:text-white transition-colors"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <form noValidate onSubmit={handleSave} className="p-5 space-y-4 max-h-[80vh] overflow-y-auto">
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                <div className="sm:col-span-2 space-y-1">
                  <label className="block text-xs font-bold text-slate-700">
                    Account Label / Desk Identifier *
                  </label>
                  <input
                    type="text"
                    required
                    value={label}
                    onChange={e => setLabel(e.target.value)}
                    placeholder="e.g. Master USD Treasury Inflow Desk"
                    className="w-full px-3 py-2 text-xs rounded-xl border border-slate-300 focus:ring-2 focus:ring-[#0a192f]"
                  />
                </div>

                <div className="space-y-1">
                  <label className="block text-xs font-bold text-slate-700">Currency *</label>
                  <select
                    value={currency}
                    onChange={e => setCurrency(e.target.value as CurrencyCode)}
                    className="w-full px-3 py-2 text-xs rounded-xl border border-slate-300 focus:ring-2 focus:ring-[#0a192f] bg-white font-bold"
                  >
                    <option value="USD">USD ($ - US Dollar)</option>
                    <option value="GBP">GBP (£ - British Pound)</option>
                    <option value="EUR">EUR (€ - Euro)</option>
                  </select>
                </div>

                <div className="space-y-1">
                  <label className="block text-xs font-bold text-slate-700">Jurisdiction Region</label>
                  <select
                    value={region}
                    onChange={e => setRegion(e.target.value as BankRegion)}
                    className="w-full px-3 py-2 text-xs rounded-xl border border-slate-300 focus:ring-2 focus:ring-[#0a192f] bg-white"
                  >
                    <option value="US">United States (US)</option>
                    <option value="UK">United Kingdom (UK)</option>
                    <option value="EU">European Union (EU)</option>
                  </select>
                </div>

                <div className="sm:col-span-2 space-y-1">
                  <label className="block text-xs font-bold text-slate-700">Bank Name *</label>
                  <input
                    type="text"
                    required
                    value={bankName}
                    onChange={e => setBankName(e.target.value)}
                    placeholder="e.g. First Atlantic Bank N.A."
                    className="w-full px-3 py-2 text-xs rounded-xl border border-slate-300 focus:ring-2 focus:ring-[#0a192f]"
                  />
                </div>

                <div className="sm:col-span-2 space-y-1">
                  <label className="block text-xs font-bold text-slate-700">
                    Beneficiary Name (Account Title) *
                  </label>
                  <input
                    type="text"
                    required
                    value={beneficiaryName}
                    onChange={e => setBeneficiaryName(e.target.value)}
                    placeholder="e.g. First Atlantic Bank & Trust Corp - Inbound Settlement"
                    className="w-full px-3 py-2 text-xs rounded-xl border border-slate-300 focus:ring-2 focus:ring-[#0a192f]"
                  />
                </div>

                <div className="space-y-1">
                  <label className="block text-xs font-bold text-slate-700">
                    Account Number or IBAN *
                  </label>
                  <input
                    type="text"
                    required
                    value={accountNumberOrIban}
                    onChange={e => setAccountNumberOrIban(e.target.value)}
                    placeholder="e.g. 02100008988492019 or GB29 FATL..."
                    className="w-full px-3 py-2 text-xs rounded-xl border border-slate-300 focus:ring-2 focus:ring-[#0a192f] font-mono font-bold"
                  />
                </div>

                <div className="space-y-1">
                  <label className="block text-xs font-bold text-slate-700">SWIFT / BIC Code *</label>
                  <input
                    type="text"
                    required
                    value={swiftBic}
                    onChange={e => setSwiftBic(e.target.value)}
                    placeholder="e.g. FATLUS33NYC"
                    className="w-full px-3 py-2 text-xs rounded-xl border border-slate-300 focus:ring-2 focus:ring-[#0a192f] font-mono"
                  />
                </div>

                <div className="space-y-1">
                  <label className="block text-xs font-bold text-slate-700">
                    Routing Number (US ABA)
                  </label>
                  <input
                    type="text"
                    value={routingNumber}
                    onChange={e => setRoutingNumber(e.target.value)}
                    placeholder="e.g. 021000089"
                    className="w-full px-3 py-2 text-xs rounded-xl border border-slate-300 focus:ring-2 focus:ring-[#0a192f] font-mono"
                  />
                </div>

                <div className="space-y-1">
                  <label className="block text-xs font-bold text-slate-700">UK Sort Code</label>
                  <input
                    type="text"
                    value={sortCode}
                    onChange={e => setSortCode(e.target.value)}
                    placeholder="e.g. 40-12-88"
                    className="w-full px-3 py-2 text-xs rounded-xl border border-slate-300 focus:ring-2 focus:ring-[#0a192f] font-mono"
                  />
                </div>

                <div className="sm:col-span-2 space-y-1">
                  <label className="block text-xs font-bold text-slate-700">Bank Physical Address</label>
                  <input
                    type="text"
                    value={bankAddress}
                    onChange={e => setBankAddress(e.target.value)}
                    placeholder="e.g. 450 Lexington Avenue, Suite 2800, New York, NY 10017, USA"
                    className="w-full px-3 py-2 text-xs rounded-xl border border-slate-300 focus:ring-2 focus:ring-[#0a192f]"
                  />
                </div>

                <div className="sm:col-span-2 space-y-1">
                  <label className="block text-xs font-bold text-slate-700">
                    Special Wire Instructions / Remittance Advice
                  </label>
                  <textarea
                    rows={2}
                    value={specialInstructions}
                    onChange={e => setSpecialInstructions(e.target.value)}
                    placeholder="e.g. Include client 8-digit account number in Reference field for instant automated STP posting."
                    className="w-full px-3 py-2 text-xs rounded-xl border border-slate-300 focus:ring-2 focus:ring-[#0a192f]"
                  />
                </div>

                <div className="flex items-center gap-4 sm:col-span-2 pt-1">
                  <label className="flex items-center gap-2 cursor-pointer text-xs font-bold text-slate-700">
                    <input
                      type="checkbox"
                      checked={isDefault}
                      onChange={e => setIsDefault(e.target.checked)}
                      className="rounded text-[#0a192f] focus:ring-[#0a192f]"
                    />
                    <span>Set as Default Receiving Desk for {currency}</span>
                  </label>

                  <label className="flex items-center gap-2 cursor-pointer text-xs font-bold text-slate-700">
                    <input
                      type="checkbox"
                      checked={status === 'ACTIVE'}
                      onChange={e => setStatus(e.target.checked ? 'ACTIVE' : 'INACTIVE')}
                      className="rounded text-[#0a192f] focus:ring-[#0a192f]"
                    />
                    <span>Active Status</span>
                  </label>
                </div>
              </div>

              <div className="flex items-center justify-end gap-3 pt-4 border-t border-slate-200">
                <button
                  type="button"
                  onClick={() => setIsModalOpen(false)}
                  className="px-4 py-2 rounded-xl text-xs font-bold text-slate-600 hover:bg-slate-100 transition-colors"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={isSaving}
                  className="px-5 py-2.5 rounded-xl bg-[#0a192f] hover:bg-[#153459] text-white text-xs font-bold flex items-center gap-2 shadow-md transition-colors disabled:opacity-50"
                >
                  {isSaving ? (
                    <>
                      <RefreshCw className="w-3.5 h-3.5 animate-spin" />
                      <span>Saving Details...</span>
                    </>
                  ) : (
                    <>
                      <CheckCircle2 className="w-3.5 h-3.5 text-[#d4af37]" />
                      <span>Save Receiving Account</span>
                    </>
                  )}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};
