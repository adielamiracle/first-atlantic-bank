import React, { useState, useEffect } from 'react';
import { useBank } from '../../context/BankContext';
import { CurrencyDisplay } from '../../components/common/CurrencyDisplay';
import { StatusBadge } from '../../components/common/StatusBadge';
import {
  Search,
  SlidersHorizontal,
  Edit3,
  Trash2,
  RefreshCw,
  ArrowDownLeft,
  ArrowUpRight,
  Filter,
  CheckCircle2,
  XCircle,
  AlertTriangle,
  X,
  Save,
  Clock,
  User,
  CreditCard,
  FileText,
  Calendar
} from 'lucide-react';
import { LedgerEntry } from '../../types';

export const AdminTransactionManagerTab: React.FC = () => {
  const { fetchAdminTransactions, editAdminTransaction, deleteAdminTransaction, showToast, accounts } = useBank();

  const [transactions, setTransactions] = useState<any[]>([]);
  const [totalCount, setTotalCount] = useState<number>(0);
  const [isLoading, setIsLoading] = useState<boolean>(true);

  // Filters
  const [searchQuery, setSearchQuery] = useState<string>('');
  const [selectedStatus, setSelectedStatus] = useState<string>('ALL');
  const [selectedAccountId, setSelectedAccountId] = useState<string>('');

  // Edit Modal State
  const [editingTx, setEditingTx] = useState<any | null>(null);
  const [editDesc, setEditDesc] = useState<string>('');
  const [editAmountStr, setEditAmountStr] = useState<string>('');
  const [editStatus, setEditStatus] = useState<string>('COMPLETED');
  const [editCounterparty, setEditCounterparty] = useState<string>('');
  const [editCategory, setEditCategory] = useState<string>('');
  const [editRef, setEditRef] = useState<string>('');
  const [editDate, setEditDate] = useState<string>('');
  const [editAdjustBalance, setEditAdjustBalance] = useState<boolean>(true);
  const [isSavingEdit, setIsSavingEdit] = useState<boolean>(false);

  // Delete Confirmation State
  const [deletingTx, setDeletingTx] = useState<any | null>(null);
  const [deleteRevertBalance, setDeleteRevertBalance] = useState<boolean>(true);
  const [isDeleting, setIsDeleting] = useState<boolean>(false);

  const loadTransactions = async () => {
    setIsLoading(true);
    try {
      const data = await fetchAdminTransactions({
        search: searchQuery || undefined,
        accountId: selectedAccountId || undefined,
        status: selectedStatus !== 'ALL' ? selectedStatus : undefined,
        limit: 150
      });
      setTransactions(data.transactions || []);
      setTotalCount(data.total || 0);
    } catch (err) {
      console.error(err);
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    const timer = setTimeout(() => {
      loadTransactions();
    }, 250);
    return () => clearTimeout(timer);
  }, [searchQuery, selectedStatus, selectedAccountId]);

  const openEditModal = (tx: any) => {
    setEditingTx(tx);
    setEditDesc(tx.description || '');
    setEditAmountStr((tx.amountMinor / 100).toFixed(2));
    setEditStatus(tx.status || 'COMPLETED');
    setEditCounterparty(tx.counterparty || '');
    setEditCategory(tx.category || 'TRANSFER');
    setEditRef(tx.referenceNumber || '');
    const dateObj = new Date(tx.createdTimestamp || tx.effectiveTimestamp);
    setEditDate(dateObj.toISOString().slice(0, 16));
    setEditAdjustBalance(true);
  };

  const handleSaveEdit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!editingTx) return;

    const parsed = parseFloat(editAmountStr);
    if (isNaN(parsed) || parsed <= 0) {
      showToast('ERROR', 'Invalid Amount', 'Please specify a valid amount.');
      return;
    }

    setIsSavingEdit(true);
    try {
      const res = await editAdminTransaction(editingTx.id, {
        description: editDesc,
        amountMinor: Math.round(parsed * 100),
        status: editStatus,
        counterparty: editCounterparty,
        category: editCategory,
        referenceNumber: editRef,
        effectiveTimestamp: editDate ? new Date(editDate).toISOString() : editingTx.effectiveTimestamp,
        adjustAccountBalance: editAdjustBalance
      });

      if (res.success) {
        setEditingTx(null);
        await loadTransactions();
      }
    } finally {
      setIsSavingEdit(false);
    }
  };

  const handleDelete = async () => {
    if (!deletingTx) return;
    setIsDeleting(true);
    try {
      const res = await deleteAdminTransaction(deletingTx.id, deleteRevertBalance);
      if (res.success) {
        setDeletingTx(null);
        await loadTransactions();
      }
    } finally {
      setIsDeleting(false);
    }
  };

  return (
    <div className="space-y-6 max-w-7xl mx-auto">
      {/* Top Banner */}
      <div className="bg-gradient-to-r from-[#0a192f] via-[#0d213f] to-[#122b52] p-5 sm:p-6 rounded-2xl border border-slate-700/80 shadow-xl text-white">
        <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
          <div>
            <div className="flex items-center gap-2 text-[#c5a880] text-xs font-semibold uppercase tracking-wider">
              <FileText className="w-4 h-4" />
              <span>General Ledger Operations</span>
            </div>
            <h2 className="text-xl sm:text-2xl font-serif font-bold text-white mt-1">
              Transaction History Manager &amp; Editor
            </h2>
            <p className="text-xs sm:text-sm text-slate-300 mt-1 max-w-2xl">
              Inspect, modify transaction details, edit amounts/descriptions, change posting timestamps, or delete and reverse transaction entries across customer accounts.
            </p>
          </div>
          <div className="flex items-center gap-3">
            <button
              onClick={loadTransactions}
              disabled={isLoading}
              className="p-2.5 bg-slate-800/80 hover:bg-slate-700 border border-slate-700 rounded-xl text-slate-300 hover:text-white transition-all flex items-center gap-2 text-xs font-semibold"
            >
              <RefreshCw className={`w-4 h-4 ${isLoading ? 'animate-spin' : ''}`} />
              <span className="hidden sm:inline">Refresh</span>
            </button>
            <div className="bg-slate-900/90 border border-[#c5a880]/40 px-3.5 py-2.5 rounded-xl text-right">
              <span className="text-[10px] uppercase text-slate-400 font-medium block">Total Entries</span>
              <span className="text-base font-bold text-[#c5a880] font-mono">{totalCount}</span>
            </div>
          </div>
        </div>
      </div>

      {/* Filter Bar */}
      <div className="bg-slate-900/90 border border-slate-800 rounded-2xl p-4 sm:p-5 shadow-xl space-y-4">
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-12 gap-3">
          {/* Search input */}
          <div className="lg:col-span-6 relative">
            <Search className="w-4 h-4 absolute left-3.5 top-1/2 -translate-y-1/2 text-slate-400" />
            <input
              type="text"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              placeholder="Search description, reference #, counterparty, category..."
              className="w-full bg-slate-950 border border-slate-700 text-white rounded-xl pl-10 pr-4 py-2.5 text-sm focus:outline-none focus:border-[#c5a880]"
            />
          </div>

          {/* Account selector filter */}
          <div className="lg:col-span-3">
            <select
              value={selectedAccountId}
              onChange={(e) => setSelectedAccountId(e.target.value)}
              className="w-full bg-slate-950 border border-slate-700 text-white rounded-xl px-3 py-2.5 text-sm focus:outline-none focus:border-[#c5a880]"
            >
              <option value="">All Customer Accounts</option>
              {accounts.map((acc) => (
                <option key={acc.id} value={acc.id}>
                  {acc.name} ({acc.accountNumber})
                </option>
              ))}
            </select>
          </div>

          {/* Status filter */}
          <div className="lg:col-span-3">
            <select
              value={selectedStatus}
              onChange={(e) => setSelectedStatus(e.target.value)}
              className="w-full bg-slate-950 border border-slate-700 text-white rounded-xl px-3 py-2.5 text-sm focus:outline-none focus:border-[#c5a880]"
            >
              <option value="ALL">All Statuses</option>
              <option value="COMPLETED">Completed</option>
              <option value="PENDING">Pending</option>
              <option value="REVERSED">Reversed</option>
              <option value="FAILED">Failed</option>
            </select>
          </div>
        </div>
      </div>

      {/* Transaction List / Cards */}
      <div className="bg-slate-900/90 border border-slate-800 rounded-2xl shadow-xl overflow-hidden">
        {isLoading ? (
          <div className="py-16 text-center text-slate-400 space-y-3">
            <RefreshCw className="w-8 h-8 animate-spin mx-auto text-[#c5a880]" />
            <p className="text-sm">Loading transactions from double-entry ledger...</p>
          </div>
        ) : transactions.length === 0 ? (
          <div className="py-16 text-center text-slate-500 space-y-2">
            <FileText className="w-10 h-10 mx-auto text-slate-600" />
            <p className="text-base font-semibold text-slate-300">No transactions match your search filter</p>
            <p className="text-xs text-slate-500">Try adjusting your keyword query or account filter.</p>
          </div>
        ) : (
          <div className="divide-y divide-slate-800">
            {transactions.map((tx) => (
              <div
                key={tx.id}
                className="p-4 sm:p-5 hover:bg-slate-800/40 transition-colors flex flex-col md:flex-row items-start md:items-center justify-between gap-4"
              >
                {/* Left details */}
                <div className="flex items-start gap-3.5 min-w-0">
                  <div
                    className={`w-10 h-10 rounded-xl flex items-center justify-center shrink-0 border ${
                      tx.direction === 'CREDIT'
                        ? 'bg-emerald-950/60 border-emerald-800/60 text-emerald-400'
                        : 'bg-rose-950/60 border-rose-800/60 text-rose-400'
                    }`}
                  >
                    {tx.direction === 'CREDIT' ? (
                      <ArrowDownLeft className="w-5 h-5" />
                    ) : (
                      <ArrowUpRight className="w-5 h-5" />
                    )}
                  </div>
                  <div className="min-w-0">
                    <div className="flex flex-wrap items-center gap-2">
                      <span className="font-bold text-white text-sm sm:text-base truncate">
                        {tx.description}
                      </span>
                      <StatusBadge status={tx.status} />
                      <span className="text-[11px] font-mono text-slate-400 bg-slate-950 px-2 py-0.5 rounded border border-slate-800">
                        {tx.category}
                      </span>
                    </div>

                    <div className="flex flex-wrap items-center gap-x-4 gap-y-1 text-xs text-slate-400 mt-1">
                      <span><strong>Account:</strong> {tx.accountName} ({tx.accountNumber})</span>
                      <span>•</span>
                      <span><strong>Counterparty:</strong> {tx.counterparty || 'N/A'}</span>
                      <span>•</span>
                      <span className="font-mono text-slate-400">Ref: {tx.referenceNumber}</span>
                      <span>•</span>
                      <span>{new Date(tx.createdTimestamp || tx.effectiveTimestamp).toLocaleString()}</span>
                    </div>
                  </div>
                </div>

                {/* Right Amount & Actions */}
                <div className="flex items-center justify-between md:justify-end gap-4 w-full md:w-auto shrink-0 pt-2 md:pt-0 border-t md:border-t-0 border-slate-800/80">
                  <div className="text-left md:text-right">
                    <div
                      className={`font-mono text-base sm:text-lg font-bold ${
                        tx.direction === 'CREDIT' ? 'text-emerald-400' : 'text-slate-100'
                      }`}
                    >
                      {tx.direction === 'CREDIT' ? '+' : '-'}
                      <CurrencyDisplay amountMinor={tx.amountMinor} currency={tx.currency || 'USD'} />
                    </div>
                    {tx.balanceAfterMinor !== undefined && (
                      <div className="text-[11px] font-mono text-slate-400">
                        Bal after: <CurrencyDisplay amountMinor={tx.balanceAfterMinor} currency={tx.currency || 'USD'} />
                      </div>
                    )}
                  </div>

                  <div className="flex items-center gap-2">
                    <button
                      onClick={() => openEditModal(tx)}
                      className="p-2 bg-slate-800 hover:bg-[#c5a880] text-slate-300 hover:text-slate-950 rounded-lg border border-slate-700 hover:border-[#c5a880] transition-colors"
                      title="Edit Transaction"
                    >
                      <Edit3 className="w-4 h-4" />
                    </button>
                    <button
                      onClick={() => {
                        setDeletingTx(tx);
                        setDeleteRevertBalance(true);
                      }}
                      className="p-2 bg-slate-800 hover:bg-rose-600 text-slate-300 hover:text-white rounded-lg border border-slate-700 hover:border-rose-600 transition-colors"
                      title="Delete / Reverse Transaction"
                    >
                      <Trash2 className="w-4 h-4" />
                    </button>
                  </div>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>

      {/* Edit Transaction Modal */}
      {editingTx && (
        <div className="fixed inset-0 z-50 bg-slate-950/80 backdrop-blur-sm flex items-center justify-center p-4">
          <div className="bg-slate-900 border border-slate-700 rounded-2xl w-full max-w-lg shadow-2xl overflow-hidden animate-in fade-in zoom-in-95 duration-150">
            <div className="p-5 border-b border-slate-800 flex items-center justify-between bg-slate-950/60">
              <div className="flex items-center gap-2 text-[#c5a880] font-bold">
                <Edit3 className="w-5 h-5" />
                <span>Edit Transaction Details</span>
              </div>
              <button
                onClick={() => setEditingTx(null)}
                className="text-slate-400 hover:text-white p-1 rounded-lg hover:bg-slate-800"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <form noValidate onSubmit={handleSaveEdit} className="p-5 sm:p-6 space-y-4 max-h-[80vh] overflow-y-auto">
              <div className="bg-slate-950 p-3.5 rounded-xl border border-slate-800 text-xs text-slate-400 space-y-1">
                <div><strong>Transaction ID:</strong> <span className="font-mono text-slate-300">{editingTx.id}</span></div>
                <div><strong>Account:</strong> <span className="text-white">{editingTx.accountName}</span></div>
              </div>

              <div>
                <label className="block text-xs font-semibold text-slate-400 uppercase tracking-wider mb-1.5">
                  Description
                </label>
                <input
                  type="text"
                  value={editDesc}
                  onChange={(e) => setEditDesc(e.target.value)}
                  className="w-full bg-slate-950 border border-slate-700 text-white rounded-xl px-3.5 py-2 text-sm focus:outline-none focus:border-[#c5a880]"
                  required
                />
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-xs font-semibold text-slate-400 uppercase tracking-wider mb-1.5">
                    Amount ({editingTx.currency})
                  </label>
                  <input
                    type="number"
                    step="0.01"
                    min="0.01"
                    value={editAmountStr}
                    onChange={(e) => setEditAmountStr(e.target.value)}
                    className="w-full bg-slate-950 border border-slate-700 text-white font-mono text-sm font-bold rounded-xl px-3.5 py-2 focus:outline-none focus:border-[#c5a880]"
                    required
                  />
                </div>

                <div>
                  <label className="block text-xs font-semibold text-slate-400 uppercase tracking-wider mb-1.5">
                    Status
                  </label>
                  <select
                    value={editStatus}
                    onChange={(e) => setEditStatus(e.target.value)}
                    className="w-full bg-slate-950 border border-slate-700 text-white rounded-xl px-3.5 py-2 text-sm focus:outline-none focus:border-[#c5a880]"
                  >
                    <option value="COMPLETED">COMPLETED</option>
                    <option value="PENDING">PENDING</option>
                    <option value="REVERSED">REVERSED</option>
                    <option value="FAILED">FAILED</option>
                  </select>
                </div>
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-xs font-semibold text-slate-400 uppercase tracking-wider mb-1.5">
                    Counterparty
                  </label>
                  <input
                    type="text"
                    value={editCounterparty}
                    onChange={(e) => setEditCounterparty(e.target.value)}
                    className="w-full bg-slate-950 border border-slate-700 text-white rounded-xl px-3.5 py-2 text-sm focus:outline-none focus:border-[#c5a880]"
                  />
                </div>

                <div>
                  <label className="block text-xs font-semibold text-slate-400 uppercase tracking-wider mb-1.5">
                    Category
                  </label>
                  <input
                    type="text"
                    value={editCategory}
                    onChange={(e) => setEditCategory(e.target.value)}
                    className="w-full bg-slate-950 border border-slate-700 text-white rounded-xl px-3.5 py-2 text-sm focus:outline-none focus:border-[#c5a880]"
                  />
                </div>
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-xs font-semibold text-slate-400 uppercase tracking-wider mb-1.5">
                    Reference Number
                  </label>
                  <input
                    type="text"
                    value={editRef}
                    onChange={(e) => setEditRef(e.target.value)}
                    className="w-full bg-slate-950 border border-slate-700 text-white font-mono text-sm rounded-xl px-3.5 py-2 focus:outline-none focus:border-[#c5a880]"
                  />
                </div>

                <div>
                  <label className="block text-xs font-semibold text-slate-400 uppercase tracking-wider mb-1.5">
                    Effective Date
                  </label>
                  <input
                    type="datetime-local"
                    value={editDate}
                    onChange={(e) => setEditDate(e.target.value)}
                    className="w-full bg-slate-950 border border-slate-700 text-white rounded-xl px-3.5 py-2 text-xs focus:outline-none focus:border-[#c5a880]"
                  />
                </div>
              </div>

              {/* Adjust Balance Checkbox */}
              <div className="bg-slate-950 p-3.5 rounded-xl border border-slate-800 flex items-start gap-3">
                <input
                  type="checkbox"
                  id="adjustBalanceCheckbox"
                  checked={editAdjustBalance}
                  onChange={(e) => setEditAdjustBalance(e.target.checked)}
                  className="mt-1 rounded text-[#c5a880] focus:ring-[#c5a880]"
                />
                <label htmlFor="adjustBalanceCheckbox" className="text-xs text-slate-300 cursor-pointer">
                  <strong>Re-calculate and adjust account balance</strong>
                  <p className="text-slate-400 mt-0.5">
                    When checked, if the amount or direction is changed, the customer's available balance will be automatically adjusted to match.
                  </p>
                </label>
              </div>

              <div className="flex items-center justify-end gap-3 pt-3 border-t border-slate-800">
                <button
                  type="button"
                  onClick={() => setEditingTx(null)}
                  className="px-4 py-2 text-xs font-semibold text-slate-400 hover:text-white rounded-xl hover:bg-slate-800"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={isSavingEdit}
                  className="px-5 py-2.5 bg-gradient-to-r from-[#c5a880] to-[#b39366] text-slate-950 font-bold text-xs uppercase tracking-wider rounded-xl hover:brightness-105 shadow-md flex items-center gap-2"
                >
                  {isSavingEdit ? (
                    <>
                      <RefreshCw className="w-3.5 h-3.5 animate-spin" />
                      <span>Saving Changes...</span>
                    </>
                  ) : (
                    <>
                      <Save className="w-3.5 h-3.5" />
                      <span>Save Transaction</span>
                    </>
                  )}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Delete / Reverse Confirmation Modal */}
      {deletingTx && (
        <div className="fixed inset-0 z-50 bg-slate-950/80 backdrop-blur-sm flex items-center justify-center p-4">
          <div className="bg-slate-900 border border-slate-700 rounded-2xl w-full max-w-md shadow-2xl p-6 space-y-4">
            <div className="flex items-center gap-3 text-rose-400">
              <AlertTriangle className="w-6 h-6 shrink-0" />
              <h3 className="text-lg font-bold text-white">Delete or Reverse Transaction</h3>
            </div>

            <p className="text-sm text-slate-300 leading-relaxed">
              Are you sure you want to remove this transaction for <strong className="text-white">{deletingTx.description}</strong> (<span className="font-mono text-[#c5a880]">{deletingTx.currency} {(deletingTx.amountMinor / 100).toFixed(2)}</span>)?
            </p>

            <div className="bg-slate-950 p-3.5 rounded-xl border border-slate-800 flex items-start gap-3">
              <input
                type="checkbox"
                id="deleteRevertCheckbox"
                checked={deleteRevertBalance}
                onChange={(e) => setDeleteRevertBalance(e.target.checked)}
                className="mt-1 rounded text-rose-500 focus:ring-rose-500"
              />
              <label htmlFor="deleteRevertCheckbox" className="text-xs text-slate-300 cursor-pointer">
                <strong>Revert Account Balance</strong>
                <p className="text-slate-400 mt-0.5">
                  Undo the financial effect on the customer's account (e.g. refunding debited funds or deducting credited funds).
                </p>
              </label>
            </div>

            <div className="flex items-center justify-end gap-3 pt-3">
              <button
                type="button"
                onClick={() => setDeletingTx(null)}
                className="px-4 py-2 text-xs font-semibold text-slate-400 hover:text-white rounded-xl hover:bg-slate-800"
              >
                Cancel
              </button>
              <button
                type="button"
                onClick={handleDelete}
                disabled={isDeleting}
                className="px-5 py-2.5 bg-rose-600 hover:bg-rose-500 text-white font-bold text-xs uppercase tracking-wider rounded-xl shadow-lg flex items-center gap-2"
              >
                {isDeleting ? (
                  <>
                    <RefreshCw className="w-3.5 h-3.5 animate-spin" />
                    <span>Removing...</span>
                  </>
                ) : (
                  <>
                    <Trash2 className="w-3.5 h-3.5" />
                    <span>Confirm Removal</span>
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
