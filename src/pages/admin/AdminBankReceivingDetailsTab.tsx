import React, { useState } from 'react';
import { useBank } from '../../context/BankContext';
import {
  Landmark,
  Plus,
  Edit3,
  Trash2,
  CheckCircle2,
  AlertCircle,
  Copy,
  Building2,
  Globe,
  DollarSign,
  ShieldCheck,
  Save,
  X,
  RefreshCw,
  Info,
  Check
} from 'lucide-react';
import { BankReceivingAccount, CurrencyCode } from '../../types';

export const AdminBankReceivingDetailsTab: React.FC = () => {
  const { bankReceivingAccounts, fetchBankReceivingAccounts, saveBankReceivingAccount, deleteBankReceivingAccount, showToast } = useBank();

  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingAccount, setEditingAccount] = useState<Partial<BankReceivingAccount> | null>(null);
  const [copiedId, setCopiedId] = useState<string | null>(null);
  const [isSaving, setIsSaving] = useState(false);
  const [deletingId, setDeletingId] = useState<string | null>(null);

  // Form State
  const [bankName, setBankName] = useState('');
  const [accountName, setAccountName] = useState('First Atlantic Bank & Trust Corporation');
  const [currency, setCurrency] = useState<CurrencyCode>('USD');
  const [accountNumber, setAccountNumber] = useState('');
  const [routingNumber, setRoutingNumber] = useState('');
  const [iban, setIban] = useState('');
  const [swiftBic, setSwiftBic] = useState('');
  const [bankAddress, setBankAddress] = useState('');
  const [instructions, setInstructions] = useState('');
  const [status, setStatus] = useState<'ACTIVE' | 'INACTIVE'>('ACTIVE');

  const openAddModal = () => {
    setEditingAccount(null);
    setBankName('First Atlantic Bank N.A.');
    setAccountName('First Atlantic Bank & Trust Corporation — Master Treasury');
    setCurrency('USD');
    setAccountNumber('');
    setRoutingNumber('021000021');
    setIban('');
    setSwiftBic('FABKUS33NYC');
    setBankAddress('767 Fifth Avenue, New York, NY 10153, USA');
    setInstructions('Include your First Atlantic Account Number in the wire reference memo.');
    setStatus('ACTIVE');
    setIsModalOpen(true);
  };

  const openEditModal = (acc: BankReceivingAccount) => {
    setEditingAccount(acc);
    setBankName(acc.bankName || '');
    setAccountName(acc.accountName || '');
    setCurrency(acc.currency || 'USD');
    setAccountNumber(acc.accountNumber || '');
    setRoutingNumber(acc.routingNumber || '');
    setIban(acc.iban || '');
    setSwiftBic(acc.swiftBic || '');
    setBankAddress(acc.bankAddress || '');
    setInstructions(acc.instructions || '');
    setStatus(acc.status || 'ACTIVE');
    setIsModalOpen(true);
  };

  const handleSave = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!bankName || !accountNumber || !accountName) {
      showToast('ERROR', 'Required Fields', 'Please enter Bank Name, Account Name, and Account Number.');
      return;
    }

    setIsSaving(true);
    try {
      const payload: Partial<BankReceivingAccount> = {
        id: editingAccount?.id,
        bankName,
        accountName,
        currency,
        accountNumber,
        routingNumber,
        iban,
        swiftBic,
        bankAddress,
        instructions,
        status
      };

      const res = await saveBankReceivingAccount(payload);
      if (res.success) {
        setIsModalOpen(false);
      }
    } finally {
      setIsSaving(false);
    }
  };

  const handleDelete = async (id: string) => {
    if (!confirm('Are you sure you want to remove this bank receiving account?')) return;
    setDeletingId(id);
    try {
      await deleteBankReceivingAccount(id);
    } finally {
      setDeletingId(null);
    }
  };

  const copyToClipboard = (text: string, id: string) => {
    navigator.clipboard.writeText(text);
    setCopiedId(id);
    setTimeout(() => setCopiedId(null), 2000);
    showToast('INFO', 'Copied', 'Account detail copied to clipboard.');
  };

  return (
    <div className="space-y-6 max-w-7xl mx-auto">
      {/* Top Banner */}
      <div className="bg-gradient-to-r from-[#0a192f] via-[#0d213f] to-[#122b52] p-5 sm:p-6 rounded-2xl border border-slate-700/80 shadow-xl text-white">
        <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
          <div>
            <div className="flex items-center gap-2 text-[#c5a880] text-xs font-semibold uppercase tracking-wider">
              <Landmark className="w-4 h-4" />
              <span>Treasury Settlement &amp; Inbound Deposit Routing</span>
            </div>
            <h2 className="text-xl sm:text-2xl font-serif font-bold text-white mt-1">
              Bank Receiving Accounts (Where Money is Received)
            </h2>
            <p className="text-xs sm:text-sm text-slate-300 mt-1 max-w-2xl">
              Configure and manage the official First Atlantic receiving bank accounts, IBANs, and wire coordinates where all customer deposits and incoming payments are received.
            </p>
          </div>

          <button
            onClick={openAddModal}
            className="px-4 py-2.5 bg-gradient-to-r from-[#c5a880] to-[#b39366] text-slate-950 font-bold text-xs uppercase tracking-wider rounded-xl hover:brightness-105 shadow-md flex items-center gap-2 shrink-0 transition-all"
          >
            <Plus className="w-4 h-4" />
            <span>Add Receiving Bank</span>
          </button>
        </div>
      </div>

      {/* Info notice */}
      <div className="bg-slate-900/90 border border-slate-800 p-4 rounded-2xl flex items-start gap-3 text-xs text-slate-300 shadow-md">
        <Info className="w-4 h-4 text-[#c5a880] shrink-0 mt-0.5" />
        <div>
          <strong className="text-white">Active Wire Instructions Routing:</strong> All active receiving accounts below are verified settlement channels. When users initiate wire transfers or external inbound deposits, they reference these bank account coordinates with their unique customer reference memo.
        </div>
      </div>

      {/* Grid of Bank Accounts */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {bankReceivingAccounts.map((acc) => (
          <div
            key={acc.id}
            className="bg-slate-900/90 border border-slate-800 hover:border-slate-700 rounded-2xl p-5 shadow-xl transition-all flex flex-col justify-between space-y-4 relative overflow-hidden group"
          >
            {/* Top row */}
            <div>
              <div className="flex items-center justify-between gap-2 mb-2">
                <span className="px-2.5 py-0.5 rounded-full text-[10px] font-bold uppercase tracking-wider bg-[#c5a880]/20 text-[#c5a880] border border-[#c5a880]/30 font-mono">
                  {acc.currency} SETTLEMENT
                </span>
                <span
                  className={`px-2 py-0.5 rounded-full text-[10px] font-bold uppercase ${
                    acc.status === 'ACTIVE'
                      ? 'bg-emerald-950/80 text-emerald-400 border border-emerald-800/60'
                      : 'bg-slate-800 text-slate-400'
                  }`}
                >
                  {acc.status}
                </span>
              </div>

              <h3 className="font-serif font-bold text-white text-base leading-snug">
                {acc.bankName}
              </h3>
              <div className="text-xs text-[#c5a880] font-medium mt-0.5 truncate">
                Beneficiary: {acc.accountName}
              </div>
            </div>

            {/* Account Details Box */}
            <div className="bg-slate-950 p-4 rounded-xl border border-slate-800 space-y-2 text-xs font-mono">
              <div className="flex items-center justify-between">
                <span className="text-slate-400">Account Number:</span>
                <div className="flex items-center gap-1.5 font-bold text-white">
                  <span>{acc.accountNumber}</span>
                  <button
                    onClick={() => copyToClipboard(acc.accountNumber, `${acc.id}-acc`)}
                    className="text-slate-500 hover:text-[#c5a880] transition-colors"
                  >
                    {copiedId === `${acc.id}-acc` ? <Check className="w-3.5 h-3.5 text-emerald-400" /> : <Copy className="w-3.5 h-3.5" />}
                  </button>
                </div>
              </div>

              {acc.routingNumber && (
                <div className="flex items-center justify-between">
                  <span className="text-slate-400">Routing / Sort Code:</span>
                  <span className="text-slate-200">{acc.routingNumber}</span>
                </div>
              )}

              {acc.iban && (
                <div className="flex items-center justify-between">
                  <span className="text-slate-400">IBAN:</span>
                  <div className="flex items-center gap-1.5 text-slate-200">
                    <span className="truncate max-w-[150px]">{acc.iban}</span>
                    <button
                      onClick={() => copyToClipboard(acc.iban!, `${acc.id}-iban`)}
                      className="text-slate-500 hover:text-[#c5a880] transition-colors"
                    >
                      {copiedId === `${acc.id}-iban` ? <Check className="w-3.5 h-3.5 text-emerald-400" /> : <Copy className="w-3.5 h-3.5" />}
                    </button>
                  </div>
                </div>
              )}

              {acc.swiftBic && (
                <div className="flex items-center justify-between">
                  <span className="text-slate-400">SWIFT / BIC:</span>
                  <span className="text-slate-200">{acc.swiftBic}</span>
                </div>
              )}

              {acc.bankAddress && (
                <div className="pt-2 border-t border-slate-900 text-[11px] text-slate-400 font-sans">
                  <strong>Bank Location:</strong> {acc.bankAddress}
                </div>
              )}
            </div>

            {/* Reference instructions */}
            {acc.instructions && (
              <div className="bg-slate-950/60 p-3 rounded-xl border border-slate-800 text-[11px] text-slate-300">
                <span className="font-semibold text-[#c5a880]">Memo Instruction: </span>
                {acc.instructions}
              </div>
            )}

            {/* Actions */}
            <div className="flex items-center justify-end gap-2 pt-2 border-t border-slate-800">
              <button
                onClick={() => openEditModal(acc)}
                className="px-3 py-1.5 bg-slate-800 hover:bg-[#c5a880] text-slate-300 hover:text-slate-950 rounded-xl border border-slate-700 text-xs font-semibold transition-all flex items-center gap-1.5"
              >
                <Edit3 className="w-3.5 h-3.5" />
                <span>Edit</span>
              </button>
              <button
                onClick={() => handleDelete(acc.id)}
                disabled={deletingId === acc.id}
                className="px-3 py-1.5 bg-slate-800 hover:bg-rose-600 text-slate-300 hover:text-white rounded-xl border border-slate-700 text-xs font-semibold transition-all flex items-center gap-1.5"
              >
                <Trash2 className="w-3.5 h-3.5" />
                <span>Delete</span>
              </button>
            </div>
          </div>
        ))}
      </div>

      {/* Add / Edit Modal */}
      {isModalOpen && (
        <div className="fixed inset-0 z-50 bg-slate-950/80 backdrop-blur-sm flex items-center justify-center p-4">
          <div className="bg-slate-900 border border-slate-700 rounded-2xl w-full max-w-xl shadow-2xl overflow-hidden animate-in fade-in zoom-in-95 duration-150">
            <div className="p-5 border-b border-slate-800 flex items-center justify-between bg-slate-950/60">
              <div className="flex items-center gap-2 text-[#c5a880] font-bold">
                <Landmark className="w-5 h-5" />
                <span>{editingAccount ? 'Edit Bank Receiving Account' : 'Add Bank Receiving Account'}</span>
              </div>
              <button
                onClick={() => setIsModalOpen(false)}
                className="text-slate-400 hover:text-white p-1 rounded-lg hover:bg-slate-800"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <form onSubmit={handleSave} className="p-5 sm:p-6 space-y-4 max-h-[80vh] overflow-y-auto">
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div>
                  <label className="block text-xs font-semibold text-slate-400 uppercase tracking-wider mb-1.5">
                    Receiving Bank Name
                  </label>
                  <input
                    type="text"
                    value={bankName}
                    onChange={(e) => setBankName(e.target.value)}
                    placeholder="e.g. First Atlantic Bank N.A."
                    className="w-full bg-slate-950 border border-slate-700 text-white rounded-xl px-3.5 py-2 text-sm focus:outline-none focus:border-[#c5a880]"
                    required
                  />
                </div>

                <div>
                  <label className="block text-xs font-semibold text-slate-400 uppercase tracking-wider mb-1.5">
                    Settlement Currency
                  </label>
                  <select
                    value={currency}
                    onChange={(e) => setCurrency(e.target.value as CurrencyCode)}
                    className="w-full bg-slate-950 border border-slate-700 text-white rounded-xl px-3.5 py-2 text-sm focus:outline-none focus:border-[#c5a880]"
                  >
                    <option value="USD">USD ($) — US Fedwire / ACH</option>
                    <option value="GBP">GBP (£) — Faster Payments / CHAPS</option>
                    <option value="EUR">EUR (€) — SEPA / TARGET2</option>
                  </select>
                </div>
              </div>

              <div>
                <label className="block text-xs font-semibold text-slate-400 uppercase tracking-wider mb-1.5">
                  Account Name / Beneficiary
                </label>
                <input
                  type="text"
                  value={accountName}
                  onChange={(e) => setAccountName(e.target.value)}
                  placeholder="e.g. First Atlantic Bank & Trust Corp"
                  className="w-full bg-slate-950 border border-slate-700 text-white rounded-xl px-3.5 py-2 text-sm focus:outline-none focus:border-[#c5a880]"
                  required
                />
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div>
                  <label className="block text-xs font-semibold text-slate-400 uppercase tracking-wider mb-1.5">
                    Account Number
                  </label>
                  <input
                    type="text"
                    value={accountNumber}
                    onChange={(e) => setAccountNumber(e.target.value)}
                    placeholder="e.g. 9820019283"
                    className="w-full bg-slate-950 border border-slate-700 text-white font-mono rounded-xl px-3.5 py-2 text-sm focus:outline-none focus:border-[#c5a880]"
                    required
                  />
                </div>

                <div>
                  <label className="block text-xs font-semibold text-slate-400 uppercase tracking-wider mb-1.5">
                    Routing Number / Sort Code
                  </label>
                  <input
                    type="text"
                    value={routingNumber}
                    onChange={(e) => setRoutingNumber(e.target.value)}
                    placeholder="e.g. 021000021 or 40-12-88"
                    className="w-full bg-slate-950 border border-slate-700 text-white font-mono rounded-xl px-3.5 py-2 text-sm focus:outline-none focus:border-[#c5a880]"
                  />
                </div>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div>
                  <label className="block text-xs font-semibold text-slate-400 uppercase tracking-wider mb-1.5">
                    IBAN (For Europe &amp; Global)
                  </label>
                  <input
                    type="text"
                    value={iban}
                    onChange={(e) => setIban(e.target.value)}
                    placeholder="e.g. DE89 5001 0517 0982 0019 28"
                    className="w-full bg-slate-950 border border-slate-700 text-white font-mono rounded-xl px-3.5 py-2 text-sm focus:outline-none focus:border-[#c5a880]"
                  />
                </div>

                <div>
                  <label className="block text-xs font-semibold text-slate-400 uppercase tracking-wider mb-1.5">
                    SWIFT / BIC Code
                  </label>
                  <input
                    type="text"
                    value={swiftBic}
                    onChange={(e) => setSwiftBic(e.target.value)}
                    placeholder="e.g. FABKUS33NYC"
                    className="w-full bg-slate-950 border border-slate-700 text-white font-mono rounded-xl px-3.5 py-2 text-sm focus:outline-none focus:border-[#c5a880]"
                  />
                </div>
              </div>

              <div>
                <label className="block text-xs font-semibold text-slate-400 uppercase tracking-wider mb-1.5">
                  Bank Physical Address
                </label>
                <input
                  type="text"
                  value={bankAddress}
                  onChange={(e) => setBankAddress(e.target.value)}
                  placeholder="e.g. 767 Fifth Avenue, New York, NY 10153, USA"
                  className="w-full bg-slate-950 border border-slate-700 text-white rounded-xl px-3.5 py-2 text-sm focus:outline-none focus:border-[#c5a880]"
                />
              </div>

              <div>
                <label className="block text-xs font-semibold text-slate-400 uppercase tracking-wider mb-1.5">
                  Payment &amp; Wire Memo Instructions
                </label>
                <textarea
                  value={instructions}
                  onChange={(e) => setInstructions(e.target.value)}
                  rows={2}
                  placeholder="e.g. Include your First Atlantic Account Number in the wire reference memo so funds credit automatically."
                  className="w-full bg-slate-950 border border-slate-700 text-white rounded-xl px-3.5 py-2 text-sm focus:outline-none focus:border-[#c5a880]"
                />
              </div>

              <div>
                <label className="block text-xs font-semibold text-slate-400 uppercase tracking-wider mb-1.5">
                  Status
                </label>
                <select
                  value={status}
                  onChange={(e) => setStatus(e.target.value as 'ACTIVE' | 'INACTIVE')}
                  className="w-full bg-slate-950 border border-slate-700 text-white rounded-xl px-3.5 py-2 text-sm focus:outline-none focus:border-[#c5a880]"
                >
                  <option value="ACTIVE">ACTIVE (Accepting Inbound Payments)</option>
                  <option value="INACTIVE">INACTIVE (Temporarily Disabled)</option>
                </select>
              </div>

              <div className="flex items-center justify-end gap-3 pt-3 border-t border-slate-800">
                <button
                  type="button"
                  onClick={() => setIsModalOpen(false)}
                  className="px-4 py-2 text-xs font-semibold text-slate-400 hover:text-white rounded-xl hover:bg-slate-800"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={isSaving}
                  className="px-5 py-2.5 bg-gradient-to-r from-[#c5a880] to-[#b39366] text-slate-950 font-bold text-xs uppercase tracking-wider rounded-xl hover:brightness-105 shadow-md flex items-center gap-2"
                >
                  {isSaving ? (
                    <>
                      <RefreshCw className="w-3.5 h-3.5 animate-spin" />
                      <span>Saving Account...</span>
                    </>
                  ) : (
                    <>
                      <Save className="w-3.5 h-3.5" />
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
