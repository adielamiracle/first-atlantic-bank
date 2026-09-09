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
  CheckSquare,
  Plus,
  Sparkles,
  Landmark,
  Layers
} from 'lucide-react';
import { CurrencyDisplay } from '../../components/common/CurrencyDisplay';
import { StatusBadge } from '../../components/common/StatusBadge';
import { LedgerEntry } from '../../types';

interface TransactionHistoryManagerProps {
  preselectedAccountId?: string;
}

export const TransactionHistoryManager: React.FC<TransactionHistoryManagerProps> = ({
  preselectedAccountId
}) => {
  const {
    fetchAdminTransactions,
    addAdminTransaction,
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
  const [selectedAccountId, setSelectedAccountId] = useState<string>(preselectedAccountId || '');

  // Add Transaction Modal State
  const [isAddModalOpen, setIsAddModalOpen] = useState<boolean>(false);
  const [addAccountId, setAddAccountId] = useState<string>('');
  const [addAmountStr, setAddAmountStr] = useState<string>('');
  const [addDirection, setAddDirection] = useState<'CREDIT' | 'DEBIT'>('CREDIT');
  const [addDescription, setAddDescription] = useState<string>('Direct Deposit - Salary');
  const [addCategory, setAddCategory] = useState<string>('Deposits');
  const [addChannel, setAddChannel] = useState<string>('ADMIN_PORTAL');
  const [addCounterparty, setAddCounterparty] = useState<string>('Treasury Reserve Settlement Desk');
  const [addReference, setAddReference] = useState<string>('');
  const [addStatus, setAddStatus] = useState<string>('SETTLED');
  const [addTimestamp, setAddTimestamp] = useState<string>(new Date().toISOString().slice(0, 16));
  const [addAdjustBalance, setAddAdjustBalance] = useState<boolean>(true);
  const [isSubmittingAdd, setIsSubmittingAdd] = useState<boolean>(false);

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

  useEffect(() => {
    if (preselectedAccountId) {
      setSelectedAccountId(preselectedAccountId);
    }
  }, [preselectedAccountId]);

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
      console.warn('Notice loading transaction history:', err);
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

  const openAddModal = (accountIdToUse?: string) => {
    const targetAccId = accountIdToUse || selectedAccountId || (accounts.length > 0 ? accounts[0].id : '');
    setAddAccountId(targetAccId);
    setAddAmountStr('');
    setAddDirection('CREDIT');
    setAddDescription('Direct Deposit - Salary');
    setAddCategory('Deposits');
    setAddChannel('ADMIN_PORTAL');
    setAddCounterparty('Treasury Reserve Settlement Desk');
    setAddReference(`TXN-ADM-${Date.now().toString().slice(-7)}${Math.floor(10 + Math.random() * 90)}`);
    setAddStatus('SETTLED');
    setAddTimestamp(new Date().toISOString().slice(0, 16));
    setAddAdjustBalance(true);
    setIsAddModalOpen(true);
  };

  const handleSaveAdd = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!addAccountId) {
      showToast('ERROR', 'Missing Account', 'Please select a customer target account.');
      return;
    }
    const numAmount = parseFloat(addAmountStr);
    if (isNaN(numAmount) || numAmount <= 0) {
      showToast('ERROR', 'Invalid Amount', 'Please enter an amount greater than zero.');
      return;
    }

    const minorAmount = Math.round(numAmount * 100);
    setIsSubmittingAdd(true);
    try {
      const res = await addAdminTransaction({
        accountId: addAccountId,
        amountMinor: minorAmount,
        direction: addDirection,
        description: addDescription.trim() || 'Authorized Direct Deposit',
        category: addCategory,
        channel: addChannel,
        counterparty: addCounterparty.trim() || 'Treasury Desk',
        referenceNumber: addReference.trim(),
        status: addStatus,
        effectiveTimestamp: addTimestamp ? new Date(addTimestamp).toISOString() : undefined,
        adjustAccountBalance: addAdjustBalance
      });

      if (res.success) {
        setIsAddModalOpen(false);
        await loadTransactions();
      }
    } catch (err: any) {
      showToast('ERROR', 'Error Posting Transaction', err.message);
    } finally {
      setIsSubmittingAdd(false);
    }
  };

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
            <span className="text-xs font-mono px-2.5 py-1 rounded-lg bg-slate-100 text-slate-700 font-bold hidden sm:inline">
              {totalCount} Total Entries
            </span>
            <button
              onClick={loadTransactions}
              className="p-2 rounded-lg bg-slate-100 hover:bg-slate-200 text-slate-600 transition-colors cursor-pointer"
              title="Refresh Transactions"
            >
              <RefreshCw className={`w-4 h-4 ${isLoading ? 'animate-spin' : ''}`} />
            </button>
            <button
              onClick={() => openAddModal()}
              className="px-3.5 py-2 rounded-xl bg-[#00A651] hover:bg-[#008f45] text-white font-bold text-xs flex items-center gap-1.5 shadow-xs transition-all cursor-pointer"
            >
              <Plus className="w-4 h-4" />
              <span>+ Add Transaction</span>
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

            <form noValidate onSubmit={handleSaveEdit} className="p-5 space-y-4 max-h-[80vh] overflow-y-auto">
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
                className="px-4 py-2 rounded-xl text-xs font-bold text-slate-600 hover:bg-slate-100 transition-colors cursor-pointer"
              >
                Cancel
              </button>
              <button
                type="button"
                onClick={handleDelete}
                disabled={isDeleting}
                className="px-4 py-2 rounded-xl bg-rose-600 hover:bg-rose-700 text-white text-xs font-bold flex items-center gap-2 shadow-sm transition-colors disabled:opacity-50 cursor-pointer"
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

      {/* 3. ADD TRANSACTION MODAL (ADMIN DIRECT ENTRY) */}
      {isAddModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/60 backdrop-blur-xs">
          <div className="bg-white dark:bg-[#0f172a] rounded-2xl max-w-xl w-full border border-slate-200 dark:border-slate-800 shadow-2xl overflow-hidden animate-in fade-in zoom-in-95 duration-150">
            {/* Modal Header */}
            <div className="px-6 py-4 bg-gradient-to-r from-[#004281] to-[#002b53] text-white flex items-center justify-between">
              <div className="flex items-center gap-2.5">
                <div className="w-8 h-8 rounded-lg bg-white/10 flex items-center justify-center text-amber-300">
                  <Plus className="w-4 h-4" />
                </div>
                <div>
                  <h3 className="text-sm font-bold tracking-tight">Add Transaction to Customer Account</h3>
                  <p className="text-[11px] text-slate-300">
                    Post authorized deposit, wire remittance, or adjustment to core ledger
                  </p>
                </div>
              </div>
              <button
                type="button"
                onClick={() => setIsAddModalOpen(false)}
                className="p-1 rounded-lg text-slate-300 hover:text-white hover:bg-white/10 transition-colors cursor-pointer"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            {/* Modal Form */}
            <form noValidate onSubmit={handleSaveAdd} className="p-6 space-y-4 max-h-[82vh] overflow-y-auto text-xs">
              {/* 1. Target Account */}
              <div className="space-y-1.5">
                <label className="font-bold text-slate-700 dark:text-slate-300 flex items-center justify-between">
                  <span>1. Target Customer Account *</span>
                  <span className="text-[10px] text-slate-400 font-normal">Select beneficiary account</span>
                </label>
                <select
                  value={addAccountId}
                  onChange={e => setAddAccountId(e.target.value)}
                  required
                  className="w-full px-3 py-2.5 rounded-xl border border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-800 text-slate-900 dark:text-white font-semibold focus:ring-2 focus:ring-[#004281]"
                >
                  <option value="">-- Choose Account --</option>
                  {accounts.map(acc => (
                    <option key={acc.id} value={acc.id}>
                      {acc.name} ({acc.accountNumber}) — {acc.currency} (Bal: {acc.currency} {(acc.balanceMinor / 100).toLocaleString('en-US', { minimumFractionDigits: 2 })})
                    </option>
                  ))}
                </select>
              </div>

              {/* 2. Direction & Amount */}
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                <div className="space-y-1.5">
                  <label className="font-bold text-slate-700 dark:text-slate-300">2. Transaction Flow *</label>
                  <div className="grid grid-cols-2 gap-1.5 p-1 rounded-xl bg-slate-100 dark:bg-slate-800 border border-slate-200 dark:border-slate-700">
                    <button
                      type="button"
                      onClick={() => setAddDirection('CREDIT')}
                      className={`py-2 rounded-lg font-bold text-xs flex items-center justify-center gap-1.5 transition-all cursor-pointer ${
                        addDirection === 'CREDIT'
                          ? 'bg-[#00A651] text-white shadow-xs'
                          : 'text-slate-600 dark:text-slate-300 hover:text-slate-900'
                      }`}
                    >
                      <ArrowDownLeft className="w-3.5 h-3.5" />
                      <span>Credit (Inflow)</span>
                    </button>
                    <button
                      type="button"
                      onClick={() => setAddDirection('DEBIT')}
                      className={`py-2 rounded-lg font-bold text-xs flex items-center justify-center gap-1.5 transition-all cursor-pointer ${
                        addDirection === 'DEBIT'
                          ? 'bg-rose-600 text-white shadow-xs'
                          : 'text-slate-600 dark:text-slate-300 hover:text-slate-900'
                      }`}
                    >
                      <ArrowUpRight className="w-3.5 h-3.5" />
                      <span>Debit (Outflow)</span>
                    </button>
                  </div>
                </div>

                <div className="space-y-1.5">
                  <label className="font-bold text-slate-700 dark:text-slate-300">3. Amount *</label>
                  <div className="relative">
                    <input
                      type="number"
                      step="0.01"
                      min="0.01"
                      placeholder="0.00"
                      value={addAmountStr}
                      onChange={e => setAddAmountStr(e.target.value)}
                      required
                      className="w-full px-3 py-2 rounded-xl border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-800 text-slate-900 dark:text-white font-mono font-bold text-sm focus:ring-2 focus:ring-[#004281]"
                    />
                  </div>
                </div>
              </div>

              {/* Preset Quick Tags */}
              <div className="space-y-1">
                <label className="text-[10px] text-slate-400 font-bold uppercase tracking-wider">Quick Preset Templates</label>
                <div className="flex items-center gap-1.5 flex-wrap">
                  {[
                    { label: 'Salary Deposit', desc: 'Direct Deposit - Monthly Executive Salary', cat: 'Income', dir: 'CREDIT' },
                    { label: 'Wire Inflow', desc: 'Inbound Institutional Wire Remittance', cat: 'Deposits', dir: 'CREDIT' },
                    { label: 'Consulting Retainer', desc: 'Commercial Consulting Retainer Settlement', cat: 'Income', dir: 'CREDIT' },
                    { label: 'Investment Return', desc: 'Private Equity Capital Distribution', cat: 'Income', dir: 'CREDIT' },
                    { label: 'Wire Outflow', desc: 'Authorized Swift International Wire Outbound', cat: 'Transfers', dir: 'DEBIT' },
                    { label: 'Ledger Adjustment', desc: 'Administrative Reconciled Ledger Adjustment', cat: 'Adjustments', dir: 'CREDIT' }
                  ].map(p => (
                    <button
                      key={p.label}
                      type="button"
                      onClick={() => {
                        setAddDescription(p.desc);
                        setAddCategory(p.cat);
                        setAddDirection(p.dir as any);
                      }}
                      className="px-2 py-1 rounded-md text-[10.5px] font-semibold bg-slate-100 hover:bg-slate-200 dark:bg-slate-800 dark:hover:bg-slate-700 text-slate-700 dark:text-slate-300 border border-slate-200/60 dark:border-slate-700 transition-colors cursor-pointer"
                    >
                      {p.label}
                    </button>
                  ))}
                </div>
              </div>

              {/* 4. Description & Counterparty */}
              <div className="space-y-1.5">
                <label className="font-bold text-slate-700 dark:text-slate-300">4. Transaction Description *</label>
                <input
                  type="text"
                  placeholder="e.g. Inbound Wire Settlement via London Clearing House"
                  value={addDescription}
                  onChange={e => setAddDescription(e.target.value)}
                  required
                  className="w-full px-3 py-2 rounded-xl border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-800 text-slate-900 dark:text-white"
                />
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                <div className="space-y-1.5">
                  <label className="font-bold text-slate-700 dark:text-slate-300">5. Counterparty / Entity</label>
                  <input
                    type="text"
                    placeholder="e.g. JPMorgan Chase Bank N.A."
                    value={addCounterparty}
                    onChange={e => setAddCounterparty(e.target.value)}
                    className="w-full px-3 py-2 rounded-xl border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-800 text-slate-900 dark:text-white"
                  />
                </div>

                <div className="space-y-1.5">
                  <label className="font-bold text-slate-700 dark:text-slate-300">6. Reference Number</label>
                  <div className="flex items-center gap-1.5">
                    <input
                      type="text"
                      value={addReference}
                      onChange={e => setAddReference(e.target.value)}
                      className="w-full px-3 py-2 rounded-xl border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-800 text-slate-900 dark:text-white font-mono text-xs"
                    />
                    <button
                      type="button"
                      onClick={() => setAddReference(`TXN-ADM-${Date.now().toString().slice(-7)}${Math.floor(10 + Math.random() * 90)}`)}
                      className="p-2 rounded-xl border border-slate-200 dark:border-slate-700 hover:bg-slate-100 dark:hover:bg-slate-800 text-slate-600 transition-colors cursor-pointer"
                      title="Generate Reference"
                    >
                      <RefreshCw className="w-3.5 h-3.5" />
                    </button>
                  </div>
                </div>
              </div>

              {/* 7. Category, Channel & Status */}
              <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
                <div className="space-y-1.5">
                  <label className="font-bold text-slate-700 dark:text-slate-300">Category</label>
                  <select
                    value={addCategory}
                    onChange={e => setAddCategory(e.target.value)}
                    className="w-full px-3 py-2 rounded-xl border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-800 text-slate-900 dark:text-white"
                  >
                    <option value="Deposits">Deposits</option>
                    <option value="Income">Income</option>
                    <option value="Transfers">Transfers</option>
                    <option value="Bills & Utilities">Bills &amp; Utilities</option>
                    <option value="Shopping & Dining">Shopping &amp; Dining</option>
                    <option value="Fees & Interest">Fees &amp; Interest</option>
                    <option value="Adjustments">Adjustments</option>
                  </select>
                </div>

                <div className="space-y-1.5">
                  <label className="font-bold text-slate-700 dark:text-slate-300">Channel</label>
                  <select
                    value={addChannel}
                    onChange={e => setAddChannel(e.target.value)}
                    className="w-full px-3 py-2 rounded-xl border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-800 text-slate-900 dark:text-white"
                  >
                    <option value="ADMIN_PORTAL">Admin Portal Entry</option>
                    <option value="WIRE">Fedwire / SWIFT Wire</option>
                    <option value="FPS">Faster Payments (FPS)</option>
                    <option value="CHAPS">CHAPS High-Value</option>
                    <option value="ACH">ACH Direct Deposit</option>
                    <option value="ONLINE">Online Banking</option>
                  </select>
                </div>

                <div className="space-y-1.5">
                  <label className="font-bold text-slate-700 dark:text-slate-300">Status</label>
                  <select
                    value={addStatus}
                    onChange={e => setAddStatus(e.target.value)}
                    className="w-full px-3 py-2 rounded-xl border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-800 text-slate-900 dark:text-white font-semibold"
                  >
                    <option value="SETTLED">Settled (Completed)</option>
                    <option value="PENDING">Pending Approval</option>
                    <option value="PROCESSING">Processing</option>
                  </select>
                </div>
              </div>

              {/* 8. Effective Date & Time (Allows Backdating) */}
              <div className="space-y-1.5">
                <label className="font-bold text-slate-700 dark:text-slate-300 flex items-center justify-between">
                  <span>Effective Date &amp; Time (Backdating Support)</span>
                  <span className="text-[10px] text-slate-400 font-normal">Custom historical or live timestamp</span>
                </label>
                <input
                  type="datetime-local"
                  value={addTimestamp}
                  onChange={e => setAddTimestamp(e.target.value)}
                  required
                  className="w-full px-3 py-2 rounded-xl border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-800 text-slate-900 dark:text-white font-mono"
                />
              </div>

              {/* 9. Adjust Account Balance Option */}
              <div className="p-3.5 rounded-xl bg-slate-50 dark:bg-slate-800/60 border border-slate-200 dark:border-slate-700">
                <label className="flex items-start gap-2.5 cursor-pointer">
                  <input
                    type="checkbox"
                    checked={addAdjustBalance}
                    onChange={e => setAddAdjustBalance(e.target.checked)}
                    className="mt-0.5 rounded text-[#00A651] focus:ring-[#00A651]"
                  />
                  <div className="text-xs text-slate-800 dark:text-slate-200">
                    <span className="font-bold block">Immediately Update Customer Account Balance</span>
                    <span className="text-[11px] text-slate-500 dark:text-slate-400 block">
                      {addDirection === 'CREDIT'
                        ? 'Account balance will be increased by this amount.'
                        : 'Account balance will be decreased by this amount.'}
                    </span>
                  </div>
                </label>
              </div>

              {/* Actions */}
              <div className="flex items-center justify-end gap-3 pt-3 border-t border-slate-200 dark:border-slate-800">
                <button
                  type="button"
                  onClick={() => setIsAddModalOpen(false)}
                  className="px-4 py-2 rounded-xl font-bold text-slate-600 dark:text-slate-300 hover:bg-slate-100 dark:hover:bg-slate-800 transition-colors cursor-pointer"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={isSubmittingAdd}
                  className="px-5 py-2 rounded-xl bg-[#00A651] hover:bg-[#008f45] text-white font-bold flex items-center gap-2 shadow-sm transition-colors cursor-pointer disabled:opacity-50"
                >
                  {isSubmittingAdd ? (
                    <>
                      <RefreshCw className="w-3.5 h-3.5 animate-spin" />
                      <span>Posting to Ledger...</span>
                    </>
                  ) : (
                    <>
                      <CheckCircle2 className="w-3.5 h-3.5" />
                      <span>Post Transaction to Ledger</span>
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
