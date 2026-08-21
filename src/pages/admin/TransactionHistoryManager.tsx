import React, { useState, useEffect } from 'react';
import { useBank } from '../../context/BankContext';
import {
  Search,
  Filter,
  Edit3,
  Trash2,
  CheckCircle2,
  Clock,
  ArrowUpRight,
  ArrowDownLeft,
  DollarSign,
  FileText,
  Calendar,
  X,
  AlertTriangle,
  RefreshCw,
  SlidersHorizontal,
  ChevronLeft,
  ChevronRight,
  Eye,
  CheckSquare
} from 'lucide-react';
import { CurrencyDisplay } from '../../components/common/CurrencyDisplay';
import { StatusBadge } from '../../components/common/StatusBadge';
import { LedgerEntry } from '../../types';

export const TransactionHistoryManager: React.FC = () => {
  const {
    fetchAdminTransactions,
    editAdminTransaction,
    deleteAdminTransaction,
    showToast,
    accounts
  } = useBank();

  const [transactions, setTransactions] = useState<any[]>([]);
  const [totalCount, setTotalCount] = useState<number>(0);
  const [isLoading, setIsLoading] = useState<boolean>(true);
  const [searchQuery, setSearchQuery] = useState<string>('');
  const [statusFilter, setStatusFilter] = useState<string>('ALL');
  const [selectedAccountId, setSelectedAccountId] = useState<string>('');

  // Edit Modal State
  const [editingTx, setEditingTx] = useState<any | null>(null);
  const [editAmountStr, setEditAmountStr] = useState<string>('');
  const [editDirection, setEditDirection] = useState<'CREDIT' | 'DEBIT'>('CREDIT');
  const [editDescription, setEditDescription] = useState<string>('');
  const [editCategory, setEditCategory] = useState<string>('');
  const [editCounterparty, setEditCounterparty] = useState<string>('');
  const [editReference, setEditReference] = useState<string>('');
  const [editStatus, setEditStatus] = useState<string>('SETTLED');
  const [editTimestamp, setEditTimestamp] = useState<string>('');
  const [adjustBalance, setAdjustBalance] = useState<boolean>(true);
  const [isSavingEdit, setIsSavingEdit] = useState<boolean>(false);

  // Delete Confirmation State
  const [deletingTx, setDeletingTx] = useState<any | null>(null);
  const [revertBalanceOnDelete, setRevertBalanceOnDelete] = useState<boolean>(true);
  const [isDeleting, setIsDeleting] = useState<boolean>(false);

  const loadTransactions = async () => {
    setIsLoading(true);
    try {
      const data = await fetchAdminTransactions({
        search: searchQuery,
        accountId: selectedAccountId || undefined,
        status: statusFilter !== 'ALL' ? statusFilter : undefined,
        limit: 100
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
    const delayDebounce = setTimeout(() => {
      loadTransactions();
    }, 250);
    return () => clearTimeout(delayDebounce);
  }, [searchQuery, statusFilter, selectedAccountId]);

  const openEditModal = (tx: any) => {
    setEditingTx(tx);
    setEditAmountStr((tx.amountMinor / 100).toFixed(2));
    setEditDirection(tx.direction);
    setEditDescription(tx.description);
    setEditCategory(tx.category);
    setEditCounterparty(tx.counterparty);
    setEditReference(tx.referenceNumber);
    setEditStatus(tx.status);
    setEditTimestamp(
      tx.effectiveTimestamp
        ? new Date(tx.effectiveTimestamp).toISOString().slice(0, 16)
        : new Date().toISOString().slice(0, 16)
    );
    setAdjustBalance(true);
  };

  const handleSaveEdit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!editingTx) return;

    const numAmount = parseFloat(editAmountStr);
    if (isNaN(numAmount) || numAmount < 0) {
      showToast('ERROR', 'Invalid Amount', 'Please enter a valid non-negative amount.');
      return;
    }

    const minorAmount = Math.round(numAmount * 100);

    setIsSavingEdit(true);
    try {
      const res = await editAdminTransaction(editingTx.id, {
        amountMinor: minorAmount,
        direction: editDirection,
        description: editDescription.trim(),
        category: editCategory,
        counterparty: editCounterparty.trim(),
        referenceNumber: editReference.trim(),
        status: editStatus,
        effectiveTimestamp: editTimestamp ? new Date(editTimestamp).toISOString() : undefined,
        adjustAccountBalance: adjustBalance
      });

      if (res.success) {
        setEditingTx(null);
        await loadTransactions();
      }
    } catch (err: any) {
      showToast('ERROR', 'Edit Failed', err.message);
    } finally {
      setIsSavingEdit(false);
    }
  };

  const handleDelete = async () => {
    if (!deletingTx) return;
    setIsDeleting(true);
    try {
      const res = await deleteAdminTransaction(deletingTx.id, revertBalanceOnDelete);
      if (res.success) {
        setDeletingTx(null);
        await loadTransactions();
      }
    } catch (err: any) {
      showToast('ERROR', 'Delete Failed', err.message);
    } finally {
      setIsDeleting(false);
    }
  };

  return (
    <div className="space-y-4">
      {/* Search & Filter Header Card */}
      <div className="bg-white rounded-2xl border border-slate-200 p-4 sm:p-6 shadow-sm space-y-4">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
          <div>
            <h2 className="text-lg font-bold font-serif text-slate-900 flex items-center gap-2">
              <FileText className="w-5 h-5 text-[#c5a880]" />
              <span>Transaction History &amp; Ledger Editor</span>
            </h2>
            <p className="text-xs text-slate-500">
              Audit, modify descriptions, dates, amounts, status, or remove ledger entries with balance sync
            </p>
          </div>

          <div className="flex items-center gap-2">
            <span className="text-xs font-mono px-2.5 py-1 rounded-lg bg-slate-100 text-slate-700 font-bold">
              {totalCount} Total Entries
            </span>
            <button
              onClick={loadTransactions}
              className="p-2 rounded-lg bg-slate-100 hover:bg-slate-200 text-slate-600 transition-colors"
              title="Refresh Transactions"
            >
              <RefreshCw className={`w-4 h-4 ${isLoading ? 'animate-spin' : ''}`} />
            </button>
          </div>
        </div>

        {/* Filter Controls */}
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
          {/* Search Box */}
          <div className="relative sm:col-span-1">
            <Search className="w-4 h-4 text-slate-400 absolute left-3 top-2.5" />
            <input
              type="text"
              placeholder="Search reference, description, counterparty..."
              value={searchQuery}
              onChange={e => setSearchQuery(e.target.value)}
              className="w-full pl-9 pr-3 py-2 text-xs rounded-xl border border-slate-200 focus:outline-none focus:ring-2 focus:ring-[#0a192f] bg-slate-50/50"
            />
          </div>

          {/* Account Filter */}
          <div>
            <select
              value={selectedAccountId}
              onChange={e => setSelectedAccountId(e.target.value)}
              className="w-full px-3 py-2 text-xs rounded-xl border border-slate-200 focus:outline-none focus:ring-2 focus:ring-[#0a192f] bg-slate-50/50 text-slate-800"
            >
              <option value="">All Customer Accounts</option>
              {accounts.map(a => (
                <option key={a.id} value={a.id}>
                  {a.name} ({a.accountNumber}) - {a.currency}
                </option>
              ))}
            </select>
          </div>

          {/* Status Filter */}
          <div>
            <select
              value={statusFilter}
              onChange={e => setStatusFilter(e.target.value)}
              className="w-full px-3 py-2 text-xs rounded-xl border border-slate-200 focus:outline-none focus:ring-2 focus:ring-[#0a192f] bg-slate-50/50 text-slate-800"
            >
              <option value="ALL">All Statuses</option>
              <option value="SETTLED">Settled</option>
              <option value="PENDING">Pending</option>
              <option value="REVERSED">Reversed</option>
              <option value="CANCELLED">Cancelled</option>
            </select>
          </div>
        </div>
      </div>

      {/* Transaction List */}
      <div className="bg-white rounded-2xl border border-slate-200 shadow-sm overflow-hidden">
        {isLoading ? (
          <div className="p-12 text-center text-slate-400 text-xs flex flex-col items-center gap-2">
            <RefreshCw className="w-6 h-6 animate-spin text-[#c5a880]" />
            <span>Loading transactions...</span>
          </div>
        ) : transactions.length === 0 ? (
          <div className="p-12 text-center text-slate-500 text-xs space-y-2">
            <FileText className="w-8 h-8 text-slate-300 mx-auto" />
            <p className="font-semibold text-slate-700">No transactions match your criteria.</p>
            <p>Try broadening your search query or removing filters.</p>
          </div>
        ) : (
          <div className="divide-y divide-slate-100">
            {/* Desktop Table Header */}
            <div className="hidden lg:grid grid-cols-12 gap-4 px-6 py-3 bg-slate-50 text-[11px] font-bold text-slate-500 uppercase tracking-wider">
              <div className="col-span-3">Details &amp; Customer</div>
              <div className="col-span-2">Account / Ref</div>
              <div className="col-span-2">Date &amp; Category</div>
              <div className="col-span-2 text-right">Amount</div>
              <div className="col-span-1 text-center">Status</div>
              <div className="col-span-2 text-right">Actions</div>
            </div>

            {transactions.map(tx => {
              const isCredit = tx.direction === 'CREDIT';
              return (
                <div
                  key={tx.id}
                  className="p-4 sm:px-6 hover:bg-slate-50/80 transition-colors flex flex-col lg:grid lg:grid-cols-12 gap-3 sm:gap-4 items-start lg:items-center"
                >
                  {/* Column 1: Details & Counterparty */}
                  <div className="lg:col-span-3 flex items-start gap-3 w-full">
                    <div
                      className={`p-2 rounded-xl shrink-0 mt-0.5 ${
                        isCredit
                          ? 'bg-emerald-50 text-emerald-600 border border-emerald-200/60'
                          : 'bg-rose-50 text-rose-600 border border-rose-200/60'
                      }`}
                    >
                      {isCredit ? (
                        <ArrowUpRight className="w-4 h-4" />
                      ) : (
                        <ArrowDownLeft className="w-4 h-4" />
                      )}
                    </div>
                    <div className="min-w-0 flex-1">
                      <div className="text-xs font-bold text-slate-900 truncate">
                        {tx.description}
                      </div>
                      <div className="text-[11px] text-slate-500 truncate">
                        {tx.counterparty || 'First Atlantic Bank'}
                      </div>
                      {tx.customerName && (
                        <div className="text-[10px] text-[#8c6d37] font-semibold mt-0.5">
                          {tx.customerName}
                        </div>
                      )}
                    </div>
                  </div>

                  {/* Column 2: Account & Ref */}
                  <div className="lg:col-span-2 text-xs w-full lg:w-auto">
                    <div className="font-semibold text-slate-800 text-[11px] truncate">
                      {tx.accountName}
                    </div>
                    <div className="text-[10px] font-mono text-slate-500">
                      Ref: {tx.referenceNumber}
                    </div>
                  </div>

                  {/* Column 3: Date & Category */}
                  <div className="lg:col-span-2 text-xs w-full lg:w-auto">
                    <div className="text-[11px] text-slate-700">
                      {new Date(tx.effectiveTimestamp || tx.createdTimestamp).toLocaleDateString(
                        'en-US',
                        {
                          month: 'short',
                          day: 'numeric',
                          year: 'numeric'
                        }
                      )}
                    </div>
                    <div className="text-[10px] text-slate-500 font-medium">{tx.category}</div>
                  </div>

                  {/* Column 4: Amount */}
                  <div className="lg:col-span-2 text-left lg:text-right w-full lg:w-auto flex lg:block items-center justify-between">
                    <span className="lg:hidden text-xs text-slate-500">Amount:</span>
                    <div>
                      <span
                        className={`text-sm font-bold font-mono ${
                          isCredit ? 'text-emerald-600' : 'text-slate-900'
                        }`}
                      >
                        {isCredit ? '+' : '-'}
                        <CurrencyDisplay
                          amountMinor={tx.amountMinor}
                          currency={tx.currency}
                          size="sm"
                          className="inline font-bold font-mono"
                        />
                      </span>
                    </div>
                  </div>

                  {/* Column 5: Status */}
                  <div className="lg:col-span-1 text-left lg:text-center w-full lg:w-auto flex lg:block items-center justify-between">
                    <span className="lg:hidden text-xs text-slate-500">Status:</span>
                    <StatusBadge status={tx.status} size="sm" />
                  </div>

                  {/* Column 6: Actions */}
                  <div className="lg:col-span-2 text-right w-full lg:w-auto flex items-center justify-end gap-2 pt-2 lg:pt-0 border-t lg:border-t-0 border-slate-100">
                    <button
                      onClick={() => openEditModal(tx)}
                      className="px-2.5 py-1.5 rounded-lg bg-[#0a192f] hover:bg-[#153459] text-white text-xs font-bold flex items-center gap-1 transition-colors cursor-pointer"
                      title="Edit Transaction Details"
                    >
                      <Edit3 className="w-3.5 h-3.5 text-[#d4af37]" />
                      <span>Edit</span>
                    </button>
                    <button
                      onClick={() => setDeletingTx(tx)}
                      className="px-2.5 py-1.5 rounded-lg bg-rose-50 hover:bg-rose-100 text-rose-700 text-xs font-bold flex items-center gap-1 transition-colors cursor-pointer border border-rose-200"
                      title="Delete / Reverse Transaction"
                    >
                      <Trash2 className="w-3.5 h-3.5" />
                      <span className="hidden sm:inline">Delete</span>
                    </button>
                  </div>
                </div>
              );
            })}
          </div>
        )}
      </div>

      {/* EDIT TRANSACTION MODAL */}
      {editingTx && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/70 backdrop-blur-xs">
          <div className="bg-white rounded-2xl max-w-lg w-full overflow-hidden shadow-2xl border border-slate-200 animate-in fade-in zoom-in duration-150">
            {/* Modal Header */}
            <div className="p-5 bg-gradient-to-r from-[#0a192f] to-[#122846] text-white flex items-center justify-between">
              <div className="flex items-center gap-2">
                <Edit3 className="w-5 h-5 text-[#d4af37]" />
                <div>
                  <h3 className="text-base font-bold font-serif">Edit Transaction Record</h3>
                  <p className="text-[11px] text-slate-300 font-mono">Ref: {editingTx.referenceNumber}</p>
                </div>
              </div>
              <button
                onClick={() => setEditingTx(null)}
                className="p-1 rounded-lg text-slate-400 hover:text-white transition-colors"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <form onSubmit={handleSaveEdit} className="p-5 space-y-4 max-h-[80vh] overflow-y-auto">
              {/* Amount & Direction */}
              <div className="grid grid-cols-2 gap-3">
                <div className="space-y-1">
                  <label className="block text-xs font-bold text-slate-700">
                    Amount ({editingTx.currency})
                  </label>
                  <input
                    type="number"
                    step="0.01"
                    min="0"
                    required
                    value={editAmountStr}
                    onChange={e => setEditAmountStr(e.target.value)}
                    className="w-full px-3 py-2 text-sm font-bold font-mono rounded-xl border border-slate-300 focus:ring-2 focus:ring-[#0a192f]"
                  />
                </div>

                <div className="space-y-1">
                  <label className="block text-xs font-bold text-slate-700">Direction</label>
                  <select
                    value={editDirection}
                    onChange={e => setEditDirection(e.target.value as any)}
                    className="w-full px-3 py-2 text-xs rounded-xl border border-slate-300 focus:ring-2 focus:ring-[#0a192f] bg-white"
                  >
                    <option value="CREDIT">CREDIT (+ Inflow)</option>
                    <option value="DEBIT">DEBIT (- Outflow)</option>
                  </select>
                </div>
              </div>

              {/* Description / Memo */}
              <div className="space-y-1">
                <label className="block text-xs font-bold text-slate-700">
                  Description / Statement Memo
                </label>
                <input
                  type="text"
                  required
                  value={editDescription}
                  onChange={e => setEditDescription(e.target.value)}
                  className="w-full px-3 py-2 text-xs rounded-xl border border-slate-300 focus:ring-2 focus:ring-[#0a192f]"
                />
              </div>

              {/* Counterparty & Category */}
              <div className="grid grid-cols-2 gap-3">
                <div className="space-y-1">
                  <label className="block text-xs font-bold text-slate-700">Counterparty</label>
                  <input
                    type="text"
                    value={editCounterparty}
                    onChange={e => setEditCounterparty(e.target.value)}
                    className="w-full px-3 py-2 text-xs rounded-xl border border-slate-300 focus:ring-2 focus:ring-[#0a192f]"
                  />
                </div>

                <div className="space-y-1">
                  <label className="block text-xs font-bold text-slate-700">Category</label>
                  <input
                    type="text"
                    value={editCategory}
                    onChange={e => setEditCategory(e.target.value)}
                    className="w-full px-3 py-2 text-xs rounded-xl border border-slate-300 focus:ring-2 focus:ring-[#0a192f]"
                  />
                </div>
              </div>

              {/* Status & Timestamp */}
              <div className="grid grid-cols-2 gap-3">
                <div className="space-y-1">
                  <label className="block text-xs font-bold text-slate-700">Status</label>
                  <select
                    value={editStatus}
                    onChange={e => setEditStatus(e.target.value)}
                    className="w-full px-3 py-2 text-xs rounded-xl border border-slate-300 focus:ring-2 focus:ring-[#0a192f] bg-white"
                  >
                    <option value="SETTLED">SETTLED</option>
                    <option value="PENDING">PENDING</option>
                    <option value="REVERSED">REVERSED</option>
                    <option value="CANCELLED">CANCELLED</option>
                  </select>
                </div>

                <div className="space-y-1">
                  <label className="block text-xs font-bold text-slate-700">Effective Date</label>
                  <input
                    type="datetime-local"
                    value={editTimestamp}
                    onChange={e => setEditTimestamp(e.target.value)}
                    className="w-full px-3 py-2 text-xs rounded-xl border border-slate-300 focus:ring-2 focus:ring-[#0a192f] font-mono"
                  />
                </div>
              </div>

              {/* Balance Synchronization Checkbox */}
              <div className="p-3 rounded-xl bg-amber-50 border border-amber-200/80 space-y-1">
                <label className="flex items-start gap-2 cursor-pointer">
                  <input
                    type="checkbox"
                    checked={adjustBalance}
                    onChange={e => setAdjustBalance(e.target.checked)}
                    className="mt-0.5 rounded text-[#0a192f] focus:ring-[#0a192f]"
                  />
                  <div className="text-xs text-amber-900">
                    <span className="font-bold block">Synchronize Customer Account Balance</span>
                    <span className="text-[11px] text-amber-800 leading-tight block">
                      Automatically recalculate the live account balance based on the revised amount/direction.
                    </span>
                  </div>
                </label>
              </div>

              {/* Modal Action Buttons */}
              <div className="flex items-center justify-end gap-3 pt-3 border-t border-slate-200">
                <button
                  type="button"
                  onClick={() => setEditingTx(null)}
                  className="px-4 py-2 rounded-xl text-xs font-bold text-slate-600 hover:bg-slate-100 transition-colors"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={isSavingEdit}
                  className="px-5 py-2 rounded-xl bg-[#0a192f] hover:bg-[#153459] text-white text-xs font-bold flex items-center gap-2 shadow-md transition-colors disabled:opacity-50"
                >
                  {isSavingEdit ? (
                    <>
                      <RefreshCw className="w-3.5 h-3.5 animate-spin" />
                      <span>Saving Changes...</span>
                    </>
                  ) : (
                    <>
                      <CheckCircle2 className="w-3.5 h-3.5 text-[#d4af37]" />
                      <span>Update Transaction</span>
                    </>
                  )}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* DELETE CONFIRMATION MODAL */}
      {deletingTx && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/70 backdrop-blur-xs">
          <div className="bg-white rounded-2xl max-w-md w-full overflow-hidden shadow-2xl border border-slate-200 p-6 space-y-4">
            <div className="flex items-center gap-3 text-rose-600">
              <div className="p-3 rounded-xl bg-rose-100">
                <AlertTriangle className="w-6 h-6" />
              </div>
              <div>
                <h3 className="text-base font-bold text-slate-900">Confirm Transaction Removal</h3>
                <p className="text-xs text-slate-500 font-mono">Ref: {deletingTx.referenceNumber}</p>
              </div>
            </div>

            <p className="text-xs text-slate-600 leading-relaxed">
              Are you sure you want to permanently delete transaction{' '}
              <strong>"{deletingTx.description}"</strong> ({deletingTx.currency}{' '}
              {(deletingTx.amountMinor / 100).toFixed(2)})?
            </p>

            <div className="p-3 rounded-xl bg-slate-50 border border-slate-200">
              <label className="flex items-start gap-2 cursor-pointer">
                <input
                  type="checkbox"
                  checked={revertBalanceOnDelete}
                  onChange={e => setRevertBalanceOnDelete(e.target.checked)}
                  className="mt-0.5 rounded text-rose-600 focus:ring-rose-500"
                />
                <div className="text-xs text-slate-800">
                  <span className="font-bold block">Revert Customer Account Balance</span>
                  <span className="text-[11px] text-slate-500 block">
                    {deletingTx.direction === 'CREDIT'
                      ? 'Deduct credited funds back from account balance'
                      : 'Restore debited funds back to account balance'}
                  </span>
                </div>
              </label>
            </div>

            <div className="flex items-center justify-end gap-3 pt-2">
              <button
                type="button"
                onClick={() => setDeletingTx(null)}
                className="px-4 py-2 rounded-xl text-xs font-bold text-slate-600 hover:bg-slate-100 transition-colors"
              >
                Cancel
              </button>
              <button
                type="button"
                onClick={handleDelete}
                disabled={isDeleting}
                className="px-4 py-2 rounded-xl bg-rose-600 hover:bg-rose-700 text-white text-xs font-bold flex items-center gap-2 shadow-sm transition-colors disabled:opacity-50"
              >
                {isDeleting ? (
                  <>
                    <RefreshCw className="w-3.5 h-3.5 animate-spin" />
                    <span>Removing...</span>
                  </>
                ) : (
                  <>
                    <Trash2 className="w-3.5 h-3.5" />
                    <span>Confirm Delete</span>
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
