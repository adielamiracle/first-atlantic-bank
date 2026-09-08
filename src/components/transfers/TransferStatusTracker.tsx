import React, { useState } from 'react';
import { TransferRecord, WiseTransferStatus } from '../../types';
import {
  Clock,
  CheckCircle2,
  AlertCircle,
  XCircle,
  ArrowRight,
  Building,
  RefreshCw,
  ExternalLink,
  ShieldCheck,
  Eye,
  Search,
  Filter,
  Layers,
  Zap
} from 'lucide-react';
import { CurrencyDisplay } from '../common/CurrencyDisplay';

interface Props {
  transfers: TransferRecord[];
  onRefresh?: () => void;
}

export const TransferStatusTracker: React.FC<Props> = ({ transfers, onRefresh }) => {
  const [selectedTransfer, setSelectedTransfer] = useState<TransferRecord | null>(null);
  const [filter, setFilter] = useState<'ALL' | 'PENDING' | 'PROCESSING' | 'COMPLETED' | 'FAILED'>('ALL');
  const [searchQuery, setSearchQuery] = useState('');

  const filteredTransfers = transfers.filter(tx => {
    const matchesFilter = filter === 'ALL' || tx.status === filter;
    const q = searchQuery.toLowerCase();
    const matchesSearch =
      tx.recipient.name.toLowerCase().includes(q) ||
      tx.reference.toLowerCase().includes(q) ||
      tx.recipient.bankName.toLowerCase().includes(q) ||
      (tx.wiseTransferId && tx.wiseTransferId.toLowerCase().includes(q));
    return matchesFilter && matchesSearch;
  });

  const getStatusBadge = (status: TransferRecord['status'], wiseStatus?: WiseTransferStatus) => {
    switch (status) {
      case 'PENDING':
        return (
          <span className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-xs font-bold bg-amber-100 text-amber-800 dark:bg-amber-950/80 dark:text-amber-300 border border-amber-300 dark:border-amber-800">
            <span className="w-1.5 h-1.5 rounded-full bg-amber-500 animate-pulse" />
            Pending Approval
          </span>
        );
      case 'PROCESSING':
        return (
          <span className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-xs font-bold bg-sky-100 text-sky-800 dark:bg-sky-950/80 dark:text-sky-300 border border-sky-300 dark:border-sky-800">
            <RefreshCw className="w-3 h-3 text-sky-600 dark:text-sky-400 animate-spin" />
            Processing
          </span>
        );
      case 'COMPLETED':
        return (
          <span className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-xs font-bold bg-emerald-100 text-emerald-800 dark:bg-emerald-950/80 dark:text-emerald-300 border border-emerald-300 dark:border-emerald-800">
            <CheckCircle2 className="w-3 h-3 text-emerald-600 dark:text-emerald-400" />
            Completed
          </span>
        );
      case 'FAILED':
        return (
          <span className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-xs font-bold bg-rose-100 text-rose-800 dark:bg-rose-950/80 dark:text-rose-300 border border-rose-300 dark:border-rose-800">
            <XCircle className="w-3 h-3 text-rose-600 dark:text-rose-400" />
            Failed / Rejected
          </span>
        );
    }
  };

  const formatCurrency = (minor: number, currency: string) => {
    const symbol = currency === 'GBP' ? '£' : currency === 'EUR' ? '€' : '$';
    return `${symbol}${(minor / 100).toLocaleString('en-US', { minimumFractionDigits: 2 })}`;
  };

  return (
    <div className="space-y-4">
      {/* Top Controls: Filter Pills & Search */}
      <div className="flex flex-col sm:flex-row items-stretch sm:items-center justify-between gap-3">
        {/* Filter Pills */}
        <div className="flex items-center gap-1.5 overflow-x-auto pb-1 sm:pb-0">
          {[
            { id: 'ALL', label: 'All Transfers' },
            { id: 'PENDING', label: 'Pending' },
            { id: 'PROCESSING', label: 'Processing' },
            { id: 'COMPLETED', label: 'Completed' },
            { id: 'FAILED', label: 'Failed' }
          ].map(tab => (
            <button
              key={tab.id}
              onClick={() => setFilter(tab.id as any)}
              className={`py-1.5 px-3 rounded-xl text-xs font-bold whitespace-nowrap cursor-pointer transition-all ${
                filter === tab.id
                  ? 'bg-[#004281] text-white shadow-xs'
                  : 'bg-white dark:bg-slate-800 text-slate-600 dark:text-slate-300 border border-slate-200 dark:border-slate-700 hover:bg-slate-50 dark:hover:bg-slate-750'
              }`}
            >
              {tab.label}
            </button>
          ))}
        </div>

        {/* Search & Refresh */}
        <div className="flex items-center gap-2">
          <div className="relative flex-1 sm:w-64">
            <Search className="w-3.5 h-3.5 text-slate-400 absolute left-3 top-2.5" />
            <input
              type="text"
              value={searchQuery}
              onChange={e => setSearchQuery(e.target.value)}
              placeholder="Search recipient, ref, bank..."
              className="w-full pl-8 pr-3 py-1.5 text-xs rounded-xl border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-900 text-slate-900 dark:text-white focus:outline-hidden focus:ring-2 focus:ring-[#004281]"
            />
          </div>

          {onRefresh && (
            <button
              onClick={onRefresh}
              className="p-2 rounded-xl border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-800 text-slate-600 dark:text-slate-300 hover:text-slate-900 dark:hover:text-white cursor-pointer"
              title="Refresh Transfer Records"
            >
              <RefreshCw className="w-3.5 h-3.5" />
            </button>
          )}
        </div>
      </div>

      {/* Transfers List */}
      {filteredTransfers.length === 0 ? (
        <div className="p-10 text-center rounded-2xl bg-white dark:bg-[#0f172a] border border-slate-200 dark:border-slate-800">
          <Clock className="w-10 h-10 text-slate-300 dark:text-slate-600 mx-auto mb-3" />
          <h4 className="text-sm font-bold text-slate-900 dark:text-white">No Transfers Found</h4>
          <p className="text-xs text-slate-500 dark:text-slate-400 mt-1 max-w-sm mx-auto">
            {searchQuery || filter !== 'ALL'
              ? 'No transfer records match your selected filter criteria.'
              : 'You have not initiated any international transfers yet. Use the Send Transfer form above to dispatch funds to UK, US, or EU.'}
          </p>
        </div>
      ) : (
        <div className="bg-white dark:bg-[#0f172a] rounded-2xl border border-slate-200 dark:border-slate-800 overflow-hidden shadow-xs">
          <div className="overflow-x-auto">
            <table className="w-full text-left text-xs">
              <thead>
                <tr className="border-b border-slate-100 dark:border-slate-800 text-[11px] font-bold uppercase tracking-wider text-slate-400 bg-slate-50/70 dark:bg-slate-900/50">
                  <th className="py-3 px-4">Beneficiary &amp; Bank</th>
                  <th className="py-3 px-4">Region</th>
                  <th className="py-3 px-4">Debited Amount</th>
                  <th className="py-3 px-4">Recipient Receives</th>
                  <th className="py-3 px-4">Tracking Status</th>
                  <th className="py-3 px-4 text-right">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100 dark:divide-slate-800">
                {filteredTransfers.map(tx => (
                  <tr
                    key={tx.id}
                    className="hover:bg-slate-50/80 dark:hover:bg-slate-800/40 transition-colors"
                  >
                    <td className="py-3 px-4">
                      <div className="font-bold text-slate-900 dark:text-white flex items-center gap-1.5">
                        <span>{tx.recipient.name}</span>
                      </div>
                      <div className="text-[11px] text-slate-500 dark:text-slate-400 flex items-center gap-1 mt-0.5">
                        <Building className="w-3 h-3 text-slate-400" />
                        <span>{tx.recipient.bankName}</span>
                      </div>
                      <span className="text-[10px] text-slate-400 font-mono">Ref: {tx.reference}</span>
                    </td>

                    <td className="py-3 px-4">
                      <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-md text-[11px] font-bold bg-slate-100 dark:bg-slate-800 text-slate-700 dark:text-slate-300">
                        {tx.recipient.region === 'UK' ? '🇬🇧 UK' : tx.recipient.region === 'US' ? '🇺🇸 USA' : '🇪🇺 Europe'}
                      </span>
                    </td>

                    <td className="py-3 px-4 font-mono font-bold text-slate-900 dark:text-white">
                      {formatCurrency(tx.amountMinor, tx.sourceCurrency)}
                      <span className="text-[10px] text-slate-400 font-sans block">
                        from {tx.sourceAccountName || 'Premier Account'}
                      </span>
                    </td>

                    <td className="py-3 px-4 font-mono font-bold text-emerald-600 dark:text-emerald-400">
                      {formatCurrency(tx.convertedAmountMinor, tx.destCurrency)}
                      <span className="text-[10px] text-slate-400 font-sans block">
                        Rate: 1 {tx.sourceCurrency} = {tx.exchangeRate} {tx.destCurrency}
                      </span>
                    </td>

                    <td className="py-3 px-4">
                      {getStatusBadge(tx.status, tx.wiseStatus)}
                      {tx.estimatedDelivery && (
                        <span className="text-[10px] text-slate-400 block mt-1 truncate max-w-[160px]">
                          {tx.estimatedDelivery}
                        </span>
                      )}
                    </td>

                    <td className="py-3 px-4 text-right">
                      <button
                        onClick={() => setSelectedTransfer(tx)}
                        className="p-1.5 rounded-lg border border-slate-200 dark:border-slate-700 hover:bg-slate-100 dark:hover:bg-slate-800 text-slate-600 dark:text-slate-300 hover:text-slate-900 dark:hover:text-white cursor-pointer transition-all inline-flex items-center gap-1 text-[11px] font-bold"
                      >
                        <Eye className="w-3.5 h-3.5" />
                        <span>Timeline</span>
                      </button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {/* INSPECT DETAIL & TIMELINE MODAL */}
      {selectedTransfer && (
        <div className="fixed inset-0 z-50 bg-slate-950/60 backdrop-blur-xs flex items-center justify-center p-4 overflow-y-auto">
          <div className="bg-white dark:bg-[#0f172a] rounded-2xl max-w-lg w-full p-6 shadow-2xl border border-slate-200 dark:border-slate-800 space-y-5 animate-in fade-in zoom-in-95 duration-150 my-6">
            <div className="flex items-center justify-between pb-3 border-b border-slate-100 dark:border-slate-800">
              <div>
                <span className="text-[10px] font-bold uppercase tracking-wider text-slate-400">
                  Global Wire &amp; Payout Dossier
                </span>
                <h3 className="text-base font-bold text-slate-900 dark:text-white flex items-center gap-2">
                  <span>Transfer #{selectedTransfer.reference}</span>
                  {getStatusBadge(selectedTransfer.status, selectedTransfer.wiseStatus)}
                </h3>
              </div>
              <button
                onClick={() => setSelectedTransfer(null)}
                className="p-1.5 rounded-lg text-slate-400 hover:text-slate-700 dark:hover:text-slate-200 hover:bg-slate-100 dark:hover:bg-slate-800 cursor-pointer"
              >
                &times;
              </button>
            </div>

            {/* Amount Summary Card */}
            <div className="p-4 bg-slate-50 dark:bg-slate-800/60 rounded-xl border border-slate-100 dark:border-slate-800 flex items-center justify-between">
              <div>
                <span className="text-[10px] uppercase font-bold text-slate-400 block">Sent Amount</span>
                <span className="text-lg font-bold text-slate-900 dark:text-white font-mono">
                  {formatCurrency(selectedTransfer.amountMinor, selectedTransfer.sourceCurrency)}
                </span>
                <span className="text-[11px] text-slate-500 dark:text-slate-400 block">
                  Fee: {formatCurrency(selectedTransfer.feeMinor, selectedTransfer.sourceCurrency)} (Transparent Wise Fee)
                </span>
              </div>
              <ArrowRight className="w-5 h-5 text-slate-300 dark:text-slate-600" />
              <div className="text-right">
                <span className="text-[10px] uppercase font-bold text-slate-400 block">Recipient Receives</span>
                <span className="text-lg font-bold text-emerald-600 dark:text-emerald-400 font-mono">
                  {formatCurrency(selectedTransfer.convertedAmountMinor, selectedTransfer.destCurrency)}
                </span>
                <span className="text-[11px] text-slate-500 dark:text-slate-400 block">
                  Rate: 1 {selectedTransfer.sourceCurrency} = {selectedTransfer.exchangeRate} {selectedTransfer.destCurrency}
                </span>
              </div>
            </div>

            {/* BENEFICIARY BANK SPECS */}
            <div className="space-y-2 text-xs">
              <span className="font-bold text-slate-700 dark:text-slate-300 uppercase tracking-wider text-[10px]">
                Beneficiary Bank Credentials
              </span>
              <div className="p-3.5 bg-slate-50 dark:bg-slate-800/40 rounded-xl border border-slate-100 dark:border-slate-800 space-y-2">
                <div className="flex justify-between">
                  <span className="text-slate-500">Beneficiary:</span>
                  <span className="font-bold text-slate-900 dark:text-white">{selectedTransfer.recipient.name}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-slate-500">Bank Name:</span>
                  <span className="font-semibold text-slate-900 dark:text-white">{selectedTransfer.recipient.bankName}</span>
                </div>
                {selectedTransfer.recipient.sortCode && (
                  <div className="flex justify-between">
                    <span className="text-slate-500">UK Sort Code:</span>
                    <span className="font-mono font-bold text-slate-900 dark:text-white">{selectedTransfer.recipient.sortCode}</span>
                  </div>
                )}
                {selectedTransfer.recipient.routingNumber && (
                  <div className="flex justify-between">
                    <span className="text-slate-500">US ABA Routing:</span>
                    <span className="font-mono font-bold text-slate-900 dark:text-white">{selectedTransfer.recipient.routingNumber}</span>
                  </div>
                )}
                {selectedTransfer.recipient.iban && (
                  <div className="flex justify-between">
                    <span className="text-slate-500">Euro IBAN:</span>
                    <span className="font-mono font-bold text-slate-900 dark:text-white">{selectedTransfer.recipient.iban}</span>
                  </div>
                )}
                <div className="flex justify-between">
                  <span className="text-slate-500">Account / IBAN:</span>
                  <span className="font-mono font-bold text-slate-900 dark:text-white">
                    {selectedTransfer.recipient.accountNumberOrIban}
                  </span>
                </div>
                {selectedTransfer.recipient.swiftBic && (
                  <div className="flex justify-between">
                    <span className="text-slate-500">SWIFT / BIC:</span>
                    <span className="font-mono text-slate-900 dark:text-white">{selectedTransfer.recipient.swiftBic}</span>
                  </div>
                )}
                {selectedTransfer.memo && (
                  <div className="flex justify-between pt-1 border-t border-slate-200 dark:border-slate-700">
                    <span className="text-slate-500">Transfer Memo:</span>
                    <span className="italic text-slate-700 dark:text-slate-300">{selectedTransfer.memo}</span>
                  </div>
                )}
              </div>
            </div>

            {/* PAYMENT TIMELINE TRACKER */}
            <div className="space-y-3">
              <span className="font-bold text-slate-700 dark:text-slate-300 uppercase tracking-wider text-[10px]">
                Execution Journey &amp; Rail Settlement
              </span>

              <div className="relative pl-6 space-y-4 before:absolute before:left-2 before:top-2 before:bottom-2 before:w-0.5 before:bg-slate-200 dark:before:bg-slate-700">
                {/* Step 1: Initiated */}
                <div className="relative">
                  <div className="absolute -left-6 top-0.5 w-4 h-4 rounded-full bg-emerald-500 flex items-center justify-center text-white">
                    <CheckCircle2 className="w-3 h-3" />
                  </div>
                  <div className="text-xs">
                    <span className="font-bold text-slate-900 dark:text-white block">1. Order Initiated by Client</span>
                    <span className="text-[11px] text-slate-500">
                      {new Date(selectedTransfer.createdTimestamp).toLocaleString()} • Funding account debited
                    </span>
                  </div>
                </div>

                {/* Step 2: Risk & Compliance Approval */}
                <div className="relative">
                  <div
                    className={`absolute -left-6 top-0.5 w-4 h-4 rounded-full flex items-center justify-center text-white ${
                      selectedTransfer.approvalStatus === 'APPROVED'
                        ? 'bg-emerald-500'
                        : selectedTransfer.approvalStatus === 'REJECTED'
                        ? 'bg-rose-500'
                        : 'bg-amber-500 animate-pulse'
                    }`}
                  >
                    {selectedTransfer.approvalStatus === 'APPROVED' ? (
                      <CheckCircle2 className="w-3 h-3" />
                    ) : selectedTransfer.approvalStatus === 'REJECTED' ? (
                      <XCircle className="w-3 h-3" />
                    ) : (
                      <Clock className="w-3 h-3" />
                    )}
                  </div>
                  <div className="text-xs">
                    <span className="font-bold text-slate-900 dark:text-white block">
                      2. Operations Desk &amp; Compliance Review
                    </span>
                    <span className="text-[11px] text-slate-500">
                      {selectedTransfer.approvalStatus === 'APPROVED'
                        ? `Approved by ${selectedTransfer.approvedBy || 'Operations Lead'}: ${selectedTransfer.approvalNotes || 'Cleared AML thresholds'}`
                        : selectedTransfer.approvalStatus === 'REJECTED'
                        ? `Rejected: ${selectedTransfer.rejectionReason || 'Compliance policy'}. Funds refunded.`
                        : 'Awaiting Institutional Officer clearance'}
                    </span>
                  </div>
                </div>

                {/* Step 3: Clearing Rail & Wise Dispatch */}
                <div className="relative">
                  <div
                    className={`absolute -left-6 top-0.5 w-4 h-4 rounded-full flex items-center justify-center text-white ${
                      selectedTransfer.status === 'COMPLETED'
                        ? 'bg-emerald-500'
                        : selectedTransfer.status === 'PROCESSING'
                        ? 'bg-sky-500'
                        : selectedTransfer.status === 'FAILED'
                        ? 'bg-slate-300 dark:bg-slate-700'
                        : 'bg-slate-300 dark:bg-slate-700'
                    }`}
                  >
                    <Zap className="w-3 h-3" />
                  </div>
                  <div className="text-xs">
                    <span className="font-bold text-slate-900 dark:text-white block">
                      3. Dispatch via Wise International Rail
                    </span>
                    <span className="text-[11px] text-slate-500">
                      Wise ID: <span className="font-mono">{selectedTransfer.wiseTransferId || 'Pending Assignment'}</span>
                      {selectedTransfer.wiseStatus && ` (${selectedTransfer.wiseStatus})`}
                    </span>
                  </div>
                </div>

                {/* Step 4: Final Settlement in Recipient Bank */}
                <div className="relative">
                  <div
                    className={`absolute -left-6 top-0.5 w-4 h-4 rounded-full flex items-center justify-center text-white ${
                      selectedTransfer.status === 'COMPLETED'
                        ? 'bg-emerald-500'
                        : selectedTransfer.status === 'FAILED'
                        ? 'bg-rose-500'
                        : 'bg-slate-300 dark:bg-slate-700'
                    }`}
                  >
                    {selectedTransfer.status === 'COMPLETED' ? (
                      <CheckCircle2 className="w-3 h-3" />
                    ) : selectedTransfer.status === 'FAILED' ? (
                      <XCircle className="w-3 h-3" />
                    ) : (
                      <Clock className="w-3 h-3" />
                    )}
                  </div>
                  <div className="text-xs">
                    <span className="font-bold text-slate-900 dark:text-white block">
                      4. Beneficiary Bank Delivery &amp; Credit
                    </span>
                    <span className="text-[11px] text-slate-500">
                      {selectedTransfer.status === 'COMPLETED'
                        ? `Funds settled into ${selectedTransfer.recipient.bankName}`
                        : selectedTransfer.status === 'FAILED'
                        ? 'Settlement failed. Reversal credited back to sender.'
                        : selectedTransfer.estimatedDelivery || 'In transit via payment clearing network'}
                    </span>
                  </div>
                </div>
              </div>
            </div>

            <div className="pt-2 flex justify-end">
              <button
                onClick={() => setSelectedTransfer(null)}
                className="py-2 px-4 rounded-xl bg-slate-100 dark:bg-slate-800 text-slate-700 dark:text-slate-300 text-xs font-bold hover:bg-slate-200 dark:hover:bg-slate-700 cursor-pointer"
              >
                Close Dossier
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
