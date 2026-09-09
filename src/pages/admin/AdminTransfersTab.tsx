import React, { useState, useEffect } from 'react';
import { useBank } from '../../context/BankContext';
import { TransferRecord, WiseTransferStatus } from '../../types';
import {
  ArrowLeftRight,
  ShieldCheck,
  CheckCircle2,
  XCircle,
  Clock,
  RefreshCw,
  Search,
  Filter,
  Eye,
  Building,
  Radio,
  ExternalLink,
  Zap,
  AlertCircle,
  FileText,
  DollarSign,
  Send,
  SlidersHorizontal,
  Settings,
  Check,
  User
} from 'lucide-react';

export const AdminTransfersTab: React.FC = () => {
  const {
    accounts,
    wiseTransfers,
    fetchWiseTransfers,
    approveWiseTransfer,
    rejectWiseTransfer,
    webhookLogs,
    fetchWebhookLogs,
    simulateWiseWebhook,
    showToast
  } = useBank();

  const [activeSubTab, setActiveSubTab] = useState<'TRANSFERS' | 'CONFIG' | 'ATTEMPTS_LOG' | 'WEBHOOKS'>('TRANSFERS');
  const [filter, setFilter] = useState<'ALL' | 'PENDING' | 'PROCESSING' | 'COMPLETED' | 'FAILED'>('ALL');
  const [searchQuery, setSearchQuery] = useState('');

  // Transfer Behavior Config State
  const [accountConfigs, setAccountConfigs] = useState<Record<string, 'instant_success' | 'pending_review' | 'manual_approval'>>({});
  const [isLoadingConfigs, setIsLoadingConfigs] = useState(false);
  const [savingAccountId, setSavingAccountId] = useState<string | null>(null);

  // Transfer Attempts Log State
  const [transactionsLog, setTransactionsLog] = useState<any[]>([]);
  const [isLoadingLogs, setIsLoadingLogs] = useState(false);
  const [logFilter, setLogFilter] = useState<'ALL' | 'PENDING' | 'PROCESSING' | 'SUCCESS' | 'FAILED'>('ALL');
  const [logSearchQuery, setLogSearchQuery] = useState('');
  const [actionLoadingId, setActionLoadingId] = useState<string | null>(null);

  // Modals state
  const [inspectTransfer, setInspectTransfer] = useState<TransferRecord | null>(null);
  const [approvalModalTransfer, setApprovalModalTransfer] = useState<TransferRecord | null>(null);
  const [approvalNotes, setApprovalNotes] = useState('Cleared OFAC screening and liquidity authorization thresholds.');
  const [isApproving, setIsApproving] = useState(false);

  const [rejectionModalTransfer, setRejectionModalTransfer] = useState<TransferRecord | null>(null);
  const [rejectionReason, setRejectionReason] = useState('Beneficiary bank account verification failed or destination blocked.');
  const [isRejecting, setIsRejecting] = useState(false);

  // Webhook Simulator state
  const [simTransferId, setSimTransferId] = useState<string>('');
  const [simStatus, setSimStatus] = useState<WiseTransferStatus>('outgoing_payment_sent');
  const [isSimulating, setIsSimulating] = useState(false);

  const getAdminAuthHeader = () => {
    const token = localStorage.getItem('token') || localStorage.getItem('fab_token') || localStorage.getItem('admin_token');
    return { Authorization: token ? `Bearer ${token}` : 'Bearer adm_super_admin' };
  };

  const fetchAccountConfigs = async () => {
    setIsLoadingConfigs(true);
    try {
      const res = await fetch('/api/admin/account-transfer-config', {
        headers: getAdminAuthHeader()
      });
      const data = await res.json();
      if (res.ok && data.configs) {
        const map: Record<string, 'instant_success' | 'pending_review' | 'manual_approval'> = {};
        data.configs.forEach((c: any) => {
          map[c.account_id] = c.default_status;
        });
        setAccountConfigs(map);
      }
    } catch (err: any) {
      console.warn('Error fetching account configs:', err);
    } finally {
      setIsLoadingConfigs(false);
    }
  };

  const saveAccountConfig = async (accountId: string, defaultStatus: 'instant_success' | 'pending_review' | 'manual_approval') => {
    setSavingAccountId(accountId);
    try {
      const res = await fetch('/api/admin/account-transfer-config', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json', ...getAdminAuthHeader() },
        body: JSON.stringify({ accountId, defaultStatus })
      });
      const data = await res.json();
      if (res.ok && data.success) {
        setAccountConfigs(prev => ({ ...prev, [accountId]: defaultStatus }));
        showToast('SUCCESS', 'Policy Updated', `Transfer behavior for account set to "${defaultStatus}".`);
      } else {
        showToast('ERROR', 'Update Failed', data.error || 'Failed to update policy.');
      }
    } catch (err: any) {
      showToast('ERROR', 'Update Failed', err.message);
    } finally {
      setSavingAccountId(null);
    }
  };

  const fetchTransactionsLog = async () => {
    setIsLoadingLogs(true);
    try {
      const res = await fetch('/api/admin/transactions-log', {
        headers: getAdminAuthHeader()
      });
      const data = await res.json();
      if (res.ok && data.transactions) {
        setTransactionsLog(data.transactions);
      }
    } catch (err: any) {
      console.warn('Error fetching transactions log:', err);
    } finally {
      setIsLoadingLogs(false);
    }
  };

  const handleApproveAttempt = async (txId: string) => {
    setActionLoadingId(txId);
    try {
      const res = await fetch(`/api/admin/transfers/${txId}/approve`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json', ...getAdminAuthHeader() },
        body: JSON.stringify({ notes: 'Admin approved transfer clearance.' })
      });
      const data = await res.json();
      if (res.ok && data.success) {
        showToast('SUCCESS', 'Transfer Approved', 'Transfer marked as SUCCESS and funds credited to beneficiary.');
        await fetchTransactionsLog();
      } else {
        showToast('ERROR', 'Approval Failed', data.error || 'Unable to approve transfer.');
      }
    } catch (err: any) {
      showToast('ERROR', 'Approval Failed', err.message);
    } finally {
      setActionLoadingId(null);
    }
  };

  const handleRejectAttempt = async (txId: string) => {
    const reason = prompt('Enter rejection justification reason:', 'Beneficiary details invalid or compliance block.');
    if (!reason) return;
    setActionLoadingId(txId);
    try {
      const res = await fetch(`/api/admin/transfers/${txId}/reject`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json', ...getAdminAuthHeader() },
        body: JSON.stringify({ reason })
      });
      const data = await res.json();
      if (res.ok && data.success) {
        showToast('SUCCESS', 'Transfer Rejected', 'Transfer marked as FAILED and funds refunded to sender.');
        await fetchTransactionsLog();
      } else {
        showToast('ERROR', 'Rejection Failed', data.error || 'Unable to reject transfer.');
      }
    } catch (err: any) {
      showToast('ERROR', 'Rejection Failed', err.message);
    } finally {
      setActionLoadingId(null);
    }
  };

  useEffect(() => {
    fetchWiseTransfers(true);
    fetchWebhookLogs();
    fetchAccountConfigs();
    fetchTransactionsLog();
  }, []);

  useEffect(() => {
    if (activeSubTab === 'CONFIG') {
      fetchAccountConfigs();
    } else if (activeSubTab === 'ATTEMPTS_LOG') {
      fetchTransactionsLog();
    }
  }, [activeSubTab]);

  useEffect(() => {
    if (wiseTransfers.length > 0 && !simTransferId) {
      setSimTransferId(wiseTransfers[0].id);
    }
  }, [wiseTransfers, simTransferId]);

  const handleApprove = async () => {
    if (!approvalModalTransfer) return;
    setIsApproving(true);
    try {
      const res = await approveWiseTransfer(approvalModalTransfer.id, approvalNotes);
      if (res.success) {
        setApprovalModalTransfer(null);
        if (inspectTransfer?.id === approvalModalTransfer.id) {
          setInspectTransfer(null);
        }
      }
    } finally {
      setIsApproving(false);
    }
  };

  const handleReject = async () => {
    if (!rejectionModalTransfer) return;
    if (!rejectionReason.trim()) {
      showToast('ERROR', 'Reason Required', 'Please enter a justification for the transfer rejection.');
      return;
    }
    setIsRejecting(true);
    try {
      const res = await rejectWiseTransfer(rejectionModalTransfer.id, rejectionReason);
      if (res.success) {
        setRejectionModalTransfer(null);
        if (inspectTransfer?.id === rejectionModalTransfer.id) {
          setInspectTransfer(null);
        }
      }
    } finally {
      setIsRejecting(false);
    }
  };

  const handleSimulateWebhook = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!simTransferId) {
      showToast('ERROR', 'Selection Required', 'Please choose a transfer to simulate.');
      return;
    }
    setIsSimulating(true);
    try {
      await simulateWiseWebhook(simTransferId, simStatus);
      await fetchWiseTransfers(true);
    } finally {
      setIsSimulating(false);
    }
  };

  const filteredTransfers = wiseTransfers.filter(tx => {
    const matchesFilter = filter === 'ALL' || tx.status === filter;
    const q = searchQuery.toLowerCase();
    const matchesSearch =
      tx.reference.toLowerCase().includes(q) ||
      tx.userName.toLowerCase().includes(q) ||
      tx.userEmail.toLowerCase().includes(q) ||
      tx.recipient.name.toLowerCase().includes(q) ||
      tx.recipient.bankName.toLowerCase().includes(q) ||
      (tx.wiseTransferId && tx.wiseTransferId.toLowerCase().includes(q));
    return matchesFilter && matchesSearch;
  });

  const pendingCount = wiseTransfers.filter(t => t.status === 'PENDING').length;
  const processingCount = wiseTransfers.filter(t => t.status === 'PROCESSING').length;
  const completedCount = wiseTransfers.filter(t => t.status === 'COMPLETED').length;
  const failedCount = wiseTransfers.filter(t => t.status === 'FAILED').length;

  const formatCurrency = (minor: number, currency: string) => {
    const symbol = currency === 'GBP' ? '£' : currency === 'EUR' ? '€' : '$';
    return `${symbol}${(minor / 100).toLocaleString('en-US', { minimumFractionDigits: 2 })}`;
  };

  return (
    <div className="space-y-6">
      {/* Header & Sub-tabs */}
      <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 pb-4 border-b border-slate-200 dark:border-slate-800">
        <div>
          <div className="flex items-center gap-2">
            <span className="text-xs font-bold uppercase tracking-wider text-[#00A651]">
              Institutional Settlement Desk
            </span>
            <span className="text-[10px] px-2 py-0.5 rounded-full font-mono font-bold bg-amber-100 text-amber-800 dark:bg-amber-950/80 dark:text-amber-300">
              {pendingCount} Pending Approvals
            </span>
          </div>
          <h2 className="text-lg sm:text-xl font-bold text-slate-900 dark:text-white">
            Global Wire Transfers &amp; Webhook Events
          </h2>
        </div>

        {/* Sub-tab navigation */}
        <div className="flex flex-wrap items-center gap-2 bg-slate-100 dark:bg-slate-800/80 p-1 rounded-xl">
          <button
            type="button"
            onClick={() => setActiveSubTab('TRANSFERS')}
            className={`py-1.5 px-3 rounded-lg text-xs font-bold transition-all cursor-pointer ${
              activeSubTab === 'TRANSFERS'
                ? 'bg-white dark:bg-slate-900 text-slate-900 dark:text-white shadow-xs'
                : 'text-slate-600 dark:text-slate-400 hover:text-slate-900 dark:hover:text-white'
            }`}
          >
            All Transfers ({wiseTransfers.length})
          </button>
          <button
            type="button"
            onClick={() => setActiveSubTab('CONFIG')}
            className={`py-1.5 px-3 rounded-lg text-xs font-bold transition-all cursor-pointer flex items-center gap-1.5 ${
              activeSubTab === 'CONFIG'
                ? 'bg-white dark:bg-slate-900 text-slate-900 dark:text-white shadow-xs'
                : 'text-slate-600 dark:text-slate-400 hover:text-slate-900 dark:hover:text-white'
            }`}
          >
            <SlidersHorizontal className="w-3.5 h-3.5 text-blue-500" />
            <span>Transfer Behavior Config</span>
          </button>
          <button
            type="button"
            onClick={() => setActiveSubTab('ATTEMPTS_LOG')}
            className={`py-1.5 px-3 rounded-lg text-xs font-bold transition-all cursor-pointer flex items-center gap-1.5 ${
              activeSubTab === 'ATTEMPTS_LOG'
                ? 'bg-white dark:bg-slate-900 text-slate-900 dark:text-white shadow-xs'
                : 'text-slate-600 dark:text-slate-400 hover:text-slate-900 dark:hover:text-white'
            }`}
          >
            <FileText className="w-3.5 h-3.5 text-amber-500" />
            <span>Transfer Attempts Log ({transactionsLog.length})</span>
          </button>
          <button
            type="button"
            onClick={() => setActiveSubTab('WEBHOOKS')}
            className={`py-1.5 px-3 rounded-lg text-xs font-bold transition-all cursor-pointer flex items-center gap-1.5 ${
              activeSubTab === 'WEBHOOKS'
                ? 'bg-white dark:bg-slate-900 text-slate-900 dark:text-white shadow-xs'
                : 'text-slate-600 dark:text-slate-400 hover:text-slate-900 dark:hover:text-white'
            }`}
          >
            <Radio className="w-3.5 h-3.5 text-emerald-500 animate-pulse" />
            <span>Webhooks &amp; Simulator ({webhookLogs.length})</span>
          </button>
        </div>
      </div>

      {/* KPI Metrics */}
      <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
        <div className="p-4 rounded-2xl bg-white dark:bg-[#0f172a] border border-slate-200 dark:border-slate-800 shadow-xs">
          <span className="text-[11px] uppercase font-bold text-slate-400 block">Pending Review</span>
          <div className="text-xl sm:text-2xl font-bold text-amber-600 dark:text-amber-400 font-mono mt-1">
            {pendingCount}
          </div>
          <span className="text-[10px] text-slate-500 block mt-0.5">Awaiting compliance sign-off</span>
        </div>

        <div className="p-4 rounded-2xl bg-white dark:bg-[#0f172a] border border-slate-200 dark:border-slate-800 shadow-xs">
          <span className="text-[11px] uppercase font-bold text-slate-400 block">In Processing</span>
          <div className="text-xl sm:text-2xl font-bold text-sky-600 dark:text-sky-400 font-mono mt-1">
            {processingCount}
          </div>
          <span className="text-[10px] text-slate-500 block mt-0.5">In flight on clearing rail</span>
        </div>

        <div className="p-4 rounded-2xl bg-white dark:bg-[#0f172a] border border-slate-200 dark:border-slate-800 shadow-xs">
          <span className="text-[11px] uppercase font-bold text-slate-400 block">Completed &amp; Settled</span>
          <div className="text-xl sm:text-2xl font-bold text-emerald-600 dark:text-emerald-400 font-mono mt-1">
            {completedCount}
          </div>
          <span className="text-[10px] text-slate-500 block mt-0.5">Dispatched to beneficiary bank</span>
        </div>

        <div className="p-4 rounded-2xl bg-white dark:bg-[#0f172a] border border-slate-200 dark:border-slate-800 shadow-xs">
          <span className="text-[11px] uppercase font-bold text-slate-400 block">Rejected / Failed</span>
          <div className="text-xl sm:text-2xl font-bold text-rose-600 dark:text-rose-400 font-mono mt-1">
            {failedCount}
          </div>
          <span className="text-[10px] text-slate-500 block mt-0.5">Client balance refunded</span>
        </div>
      </div>

      {activeSubTab === 'TRANSFERS' && (
        <div className="space-y-4">
          {/* Filter Bar */}
          <div className="flex flex-col sm:flex-row items-stretch sm:items-center justify-between gap-3">
            <div className="flex items-center gap-1.5 overflow-x-auto pb-1 sm:pb-0">
              {[
                { id: 'ALL', label: 'All Transfers' },
                { id: 'PENDING', label: `Pending (${pendingCount})` },
                { id: 'PROCESSING', label: 'Processing' },
                { id: 'COMPLETED', label: 'Completed' },
                { id: 'FAILED', label: 'Failed/Rejected' }
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

            <div className="flex items-center gap-2">
              <div className="relative flex-1 sm:w-64">
                <Search className="w-3.5 h-3.5 text-slate-400 absolute left-3 top-2.5" />
                <input
                  type="text"
                  value={searchQuery}
                  onChange={e => setSearchQuery(e.target.value)}
                  placeholder="Filter client, bank, reference..."
                  className="w-full pl-8 pr-3 py-1.5 text-xs rounded-xl border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-900 text-slate-900 dark:text-white focus:outline-hidden focus:ring-2 focus:ring-[#004281]"
                />
              </div>

              <button
                onClick={() => fetchWiseTransfers(true)}
                className="p-2 rounded-xl border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-800 text-slate-600 dark:text-slate-300 hover:text-slate-900 dark:hover:text-white cursor-pointer"
                title="Refresh from Database"
              >
                <RefreshCw className="w-3.5 h-3.5" />
              </button>
            </div>
          </div>

          {/* Transfers Table */}
          <div className="bg-white dark:bg-[#0f172a] rounded-2xl border border-slate-200 dark:border-slate-800 overflow-hidden shadow-xs">
            <div className="overflow-x-auto">
              <table className="w-full text-left text-xs">
                <thead>
                  <tr className="border-b border-slate-100 dark:border-slate-800 text-[11px] font-bold uppercase tracking-wider text-slate-400 bg-slate-50/70 dark:bg-slate-900/50">
                    <th className="py-3 px-4">Transfer / Reference</th>
                    <th className="py-3 px-4">Client User</th>
                    <th className="py-3 px-4">Beneficiary &amp; Region</th>
                    <th className="py-3 px-4">Debited / Payout</th>
                    <th className="py-3 px-4">Status</th>
                    <th className="py-3 px-4 text-right">Operational Actions</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-100 dark:divide-slate-800">
                  {filteredTransfers.length === 0 ? (
                    <tr>
                      <td colSpan={6} className="py-12 text-center text-slate-400">
                        No wire records found matching criteria.
                      </td>
                    </tr>
                  ) : (
                    filteredTransfers.map(tx => (
                      <tr
                        key={tx.id}
                        className="hover:bg-slate-50/80 dark:hover:bg-slate-800/40 transition-colors"
                      >
                        <td className="py-3 px-4">
                          <div className="font-mono font-bold text-slate-900 dark:text-white">
                            {tx.reference}
                          </div>
                          <div className="text-[10px] text-slate-400">
                            {new Date(tx.createdTimestamp).toLocaleDateString()} {new Date(tx.createdTimestamp).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                          </div>
                          {tx.memo && (
                            <span className="text-[10px] text-slate-500 italic block mt-0.5 truncate max-w-[150px]">
                              {tx.memo}
                            </span>
                          )}
                        </td>

                        <td className="py-3 px-4">
                          <div className="font-bold text-slate-900 dark:text-white">{tx.userName}</div>
                          <div className="text-[11px] text-slate-400">{tx.userEmail}</div>
                          <div className="text-[10px] text-slate-500 font-mono mt-0.5">
                            From: {tx.sourceAccountName}
                          </div>
                        </td>

                        <td className="py-3 px-4">
                          <div className="font-bold text-slate-900 dark:text-white flex items-center gap-1.5">
                            <span>{tx.recipient.name}</span>
                            <span className="text-[10px] px-1.5 py-0.2 rounded font-bold bg-slate-100 dark:bg-slate-800 text-slate-700 dark:text-slate-300">
                              {tx.recipient.region === 'UK' ? '🇬🇧 UK' : tx.recipient.region === 'US' ? '🇺🇸 US' : '🇪🇺 EU'}
                            </span>
                          </div>
                          <div className="text-[11px] text-slate-500 dark:text-slate-400">
                            {tx.recipient.bankName}
                          </div>
                          <div className="text-[10px] font-mono text-slate-400 mt-0.5">
                            {tx.recipient.sortCode && `Sort: ${tx.recipient.sortCode} • `}
                            {tx.recipient.routingNumber && `ABA: ${tx.recipient.routingNumber} • `}
                            Acc: {tx.recipient.accountNumberOrIban}
                          </div>
                        </td>

                        <td className="py-3 px-4">
                          <div className="font-mono font-bold text-slate-900 dark:text-white">
                            {formatCurrency(tx.amountMinor, tx.sourceCurrency)}
                          </div>
                          <div className="text-[11px] font-mono font-bold text-emerald-600 dark:text-emerald-400 mt-0.5">
                            → {formatCurrency(tx.convertedAmountMinor, tx.destCurrency)}
                          </div>
                          <span className="text-[10px] text-slate-400 block font-mono">
                            Rate: {tx.exchangeRate}
                          </span>
                        </td>

                        <td className="py-3 px-4">
                          {tx.status === 'PENDING' && (
                            <span className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-xs font-bold bg-amber-100 text-amber-800 dark:bg-amber-950/80 dark:text-amber-300 border border-amber-300 dark:border-amber-800">
                              <span className="w-1.5 h-1.5 rounded-full bg-amber-500 animate-pulse" />
                              Pending Approval
                            </span>
                          )}
                          {tx.status === 'PROCESSING' && (
                            <span className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-xs font-bold bg-sky-100 text-sky-800 dark:bg-sky-950/80 dark:text-sky-300 border border-sky-300 dark:border-sky-800">
                              <RefreshCw className="w-3 h-3 text-sky-600 dark:text-sky-400 animate-spin" />
                              Processing
                            </span>
                          )}
                          {tx.status === 'COMPLETED' && (
                            <span className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-xs font-bold bg-emerald-100 text-emerald-800 dark:bg-emerald-950/80 dark:text-emerald-300 border border-emerald-300 dark:border-emerald-800">
                              <CheckCircle2 className="w-3 h-3 text-emerald-600" />
                              Completed
                            </span>
                          )}
                          {tx.status === 'FAILED' && (
                            <span className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-xs font-bold bg-rose-100 text-rose-800 dark:bg-rose-950/80 dark:text-rose-300 border border-rose-300 dark:border-rose-800">
                              <XCircle className="w-3 h-3 text-rose-600" />
                              Rejected / Failed
                            </span>
                          )}
                        </td>

                        <td className="py-3 px-4 text-right space-x-1.5">
                          <button
                            onClick={() => setInspectTransfer(tx)}
                            className="p-1.5 rounded-lg border border-slate-200 dark:border-slate-700 hover:bg-slate-100 dark:hover:bg-slate-800 text-slate-600 dark:text-slate-300 hover:text-slate-900 dark:hover:text-white cursor-pointer inline-flex items-center gap-1 text-[11px] font-bold"
                            title="Inspect Details"
                          >
                            <Eye className="w-3 h-3" />
                            <span>Details</span>
                          </button>

                          {tx.status === 'PENDING' && (
                            <>
                              <button
                                onClick={() => {
                                  setApprovalModalTransfer(tx);
                                  setApprovalNotes('Identity verified. Outbound wire authorized through institutional desk.');
                                }}
                                className="py-1 px-2.5 rounded-lg bg-emerald-600 hover:bg-emerald-700 text-white text-[11px] font-bold shadow-xs cursor-pointer inline-flex items-center gap-1"
                              >
                                <CheckCircle2 className="w-3 h-3" />
                                <span>Approve</span>
                              </button>

                              <button
                                onClick={() => {
                                  setRejectionModalTransfer(tx);
                                  setRejectionReason('Compliance threshold review or beneficiary validation failure.');
                                }}
                                className="py-1 px-2.5 rounded-lg bg-rose-600 hover:bg-rose-700 text-white text-[11px] font-bold shadow-xs cursor-pointer inline-flex items-center gap-1"
                              >
                                <XCircle className="w-3 h-3" />
                                <span>Reject</span>
                              </button>
                            </>
                          )}
                        </td>
                      </tr>
                    ))
                  )}
                </tbody>
              </table>
            </div>
          </div>
        </div>
      )}

      {/* CONFIG SUB-TAB: Per-Account Transfer Behavior */}
      {activeSubTab === 'CONFIG' && (
        <div className="space-y-4">
          <div className="bg-white dark:bg-[#0f172a] rounded-2xl p-5 sm:p-6 border border-slate-200 dark:border-slate-800 shadow-xs space-y-4">
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-4 border-b border-slate-100 dark:border-slate-800">
              <div>
                <h3 className="text-sm sm:text-base font-bold text-slate-900 dark:text-white flex items-center gap-2">
                  <SlidersHorizontal className="w-4 h-4 text-blue-500" />
                  <span>Account Transfer Response Policies</span>
                </h3>
                <p className="text-xs text-slate-500 dark:text-slate-400 mt-0.5">
                  Configure simulation behavior per account: Instant Settlement, 10-second Pending Review, or Manual Compliance Approval.
                </p>
              </div>
              <button
                type="button"
                onClick={fetchAccountConfigs}
                disabled={isLoadingConfigs}
                className="flex items-center gap-1.5 px-3 py-1.5 rounded-xl border border-slate-200 dark:border-slate-700 text-xs font-semibold text-slate-700 dark:text-slate-300 hover:bg-slate-50 dark:hover:bg-slate-800 cursor-pointer"
              >
                <RefreshCw className={`w-3.5 h-3.5 ${isLoadingConfigs ? 'animate-spin' : ''}`} />
                <span>Refresh Configs</span>
              </button>
            </div>

            <div className="overflow-x-auto">
              <table className="w-full text-left border-collapse text-xs">
                <thead>
                  <tr className="border-b border-slate-200 dark:border-slate-800 text-[11px] uppercase tracking-wider text-slate-400">
                    <th className="py-3 px-3">Account Number</th>
                    <th className="py-3 px-3">Account Title / Owner</th>
                    <th className="py-3 px-3">Current Balance</th>
                    <th className="py-3 px-3">Transfer Response Behavior</th>
                    <th className="py-3 px-3 text-right">Actions</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-100 dark:divide-slate-800 font-mono">
                  {accounts.length === 0 ? (
                    <tr>
                      <td colSpan={5} className="py-8 text-center text-slate-400 font-sans">
                        No customer accounts loaded.
                      </td>
                    </tr>
                  ) : (
                    accounts.map(acc => {
                      const currentPolicy = accountConfigs[acc.id] || 'instant_success';
                      const isSaving = savingAccountId === acc.id;

                      return (
                        <tr key={acc.id} className="hover:bg-slate-50/50 dark:hover:bg-slate-800/30">
                          <td className="py-3.5 px-3 font-bold text-slate-900 dark:text-white">
                            {acc.accountNumberFull || acc.accountNumber}
                            <span className="block text-[10px] text-slate-400 font-sans">{acc.type} • {acc.currency}</span>
                          </td>
                          <td className="py-3.5 px-3 font-sans text-slate-700 dark:text-slate-300">
                            <span className="font-semibold">{acc.name}</span>
                            <span className="block text-[10px] text-slate-400 font-mono">ID: {acc.id}</span>
                          </td>
                          <td className="py-3.5 px-3 font-bold text-emerald-600 dark:text-emerald-400">
                            {formatCurrency(acc.balanceMinor, acc.currency)}
                          </td>
                          <td className="py-3.5 px-3 font-sans">
                            <select
                              value={currentPolicy}
                              onChange={e => {
                                const val = e.target.value as any;
                                setAccountConfigs(prev => ({ ...prev, [acc.id]: val }));
                              }}
                              className="px-2.5 py-1.5 text-xs rounded-xl border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-900 text-slate-800 dark:text-slate-200 font-medium cursor-pointer"
                            >
                              <option value="instant_success">Instant Success (Immediate Deduction &amp; Settle)</option>
                              <option value="pending_review">Pending Review (Holds PENDING for 10s then auto SUCCESS)</option>
                              <option value="manual_approval">Manual Approval (Holds PENDING until Admin approves)</option>
                            </select>
                          </td>
                          <td className="py-3.5 px-3 text-right">
                            <button
                              type="button"
                              onClick={() => saveAccountConfig(acc.id, accountConfigs[acc.id] || 'instant_success')}
                              disabled={isSaving}
                              className="px-3 py-1.5 rounded-xl bg-[#004281] hover:bg-[#003366] text-white text-xs font-bold transition-all shadow-xs cursor-pointer disabled:opacity-50 inline-flex items-center gap-1.5"
                            >
                              {isSaving ? <RefreshCw className="w-3 h-3 animate-spin" /> : <Check className="w-3 h-3" />}
                              <span>Save Policy</span>
                            </button>
                          </td>
                        </tr>
                      );
                    })
                  )}
                </tbody>
              </table>
            </div>

            <div className="p-3 rounded-xl bg-blue-50 dark:bg-blue-950/40 border border-blue-200 dark:border-blue-900 text-xs text-blue-800 dark:text-blue-300 flex items-center gap-2">
              <ShieldCheck className="w-4 h-4 shrink-0 text-blue-600 dark:text-blue-400" />
              <span>
                All policy updates are persisted immediately to the Supabase / in-memory <strong>account_transfer_config</strong> table and take effect on the next client transfer.
              </span>
            </div>
          </div>
        </div>
      )}

      {/* ATTEMPTS_LOG SUB-TAB: Audit Log of All Transfer Attempts */}
      {activeSubTab === 'ATTEMPTS_LOG' && (
        <div className="space-y-4">
          <div className="bg-white dark:bg-[#0f172a] rounded-2xl p-5 sm:p-6 border border-slate-200 dark:border-slate-800 shadow-xs space-y-4">
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-4 border-b border-slate-100 dark:border-slate-800">
              <div>
                <h3 className="text-sm sm:text-base font-bold text-slate-900 dark:text-white flex items-center gap-2">
                  <FileText className="w-4 h-4 text-amber-500" />
                  <span>Authoritative Transfer Attempts &amp; Ledger Log</span>
                </h3>
                <p className="text-xs text-slate-500 dark:text-slate-400 mt-0.5">
                  Real-time record of all transfers submitted across the demo bank with one-click admin clearance actions.
                </p>
              </div>

              <div className="flex items-center gap-2">
                <button
                  type="button"
                  onClick={fetchTransactionsLog}
                  disabled={isLoadingLogs}
                  className="flex items-center gap-1.5 px-3 py-1.5 rounded-xl border border-slate-200 dark:border-slate-700 text-xs font-semibold text-slate-700 dark:text-slate-300 hover:bg-slate-50 dark:hover:bg-slate-800 cursor-pointer"
                >
                  <RefreshCw className={`w-3.5 h-3.5 ${isLoadingLogs ? 'animate-spin' : ''}`} />
                  <span>Refresh Logs</span>
                </button>
              </div>
            </div>

            {/* Filter and Search */}
            <div className="flex flex-col sm:flex-row items-stretch sm:items-center justify-between gap-3">
              <div className="flex items-center gap-1.5 overflow-x-auto pb-1 sm:pb-0">
                {[
                  { id: 'ALL', label: 'All Attempts' },
                  { id: 'PENDING', label: 'Pending' },
                  { id: 'PROCESSING', label: 'Processing' },
                  { id: 'SUCCESS', label: 'Success' },
                  { id: 'FAILED', label: 'Failed' }
                ].map(item => (
                  <button
                    key={item.id}
                    onClick={() => setLogFilter(item.id as any)}
                    className={`py-1.5 px-3 rounded-xl text-xs font-bold whitespace-nowrap cursor-pointer transition-all ${
                      logFilter === item.id
                        ? 'bg-[#004281] text-white shadow-xs'
                        : 'bg-white dark:bg-slate-800 text-slate-600 dark:text-slate-300 border border-slate-200 dark:border-slate-700 hover:bg-slate-50 dark:hover:bg-slate-750'
                    }`}
                  >
                    {item.label}
                  </button>
                ))}
              </div>

              <div className="relative flex-1 sm:w-64">
                <Search className="w-3.5 h-3.5 text-slate-400 absolute left-3 top-2.5" />
                <input
                  type="text"
                  value={logSearchQuery}
                  onChange={e => setLogSearchQuery(e.target.value)}
                  placeholder="Search sender, beneficiary, ID..."
                  className="w-full pl-8 pr-3 py-1.5 text-xs rounded-xl border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-900 text-slate-900 dark:text-white focus:outline-hidden focus:ring-2 focus:ring-[#004281]"
                />
              </div>
            </div>

            {/* Logs Table */}
            <div className="overflow-x-auto">
              <table className="w-full text-left border-collapse text-xs">
                <thead>
                  <tr className="border-b border-slate-200 dark:border-slate-800 text-[11px] uppercase tracking-wider text-slate-400">
                    <th className="py-3 px-3">Attempt ID</th>
                    <th className="py-3 px-3">Sender</th>
                    <th className="py-3 px-3">Beneficiary Account / Name</th>
                    <th className="py-3 px-3">Amount</th>
                    <th className="py-3 px-3">Status</th>
                    <th className="py-3 px-3">Timestamp</th>
                    <th className="py-3 px-3">Notes</th>
                    <th className="py-3 px-3 text-right">Actions</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-100 dark:divide-slate-800 font-mono">
                  {(() => {
                    const filtered = transactionsLog.filter(tx => {
                      const matchesStatus = logFilter === 'ALL' || tx.status === logFilter;
                      const q = logSearchQuery.toLowerCase();
                      const matchesSearch =
                        !q ||
                        (tx.id && tx.id.toLowerCase().includes(q)) ||
                        (tx.sender_id && tx.sender_id.toLowerCase().includes(q)) ||
                        (tx.sender_name && tx.sender_name.toLowerCase().includes(q)) ||
                        (tx.beneficiary_account && tx.beneficiary_account.toLowerCase().includes(q)) ||
                        (tx.notes && tx.notes.toLowerCase().includes(q));
                      return matchesStatus && matchesSearch;
                    });

                    if (filtered.length === 0) {
                      return (
                        <tr>
                          <td colSpan={8} className="py-8 text-center text-slate-400 font-sans">
                            No transfer attempts recorded matching your filter.
                          </td>
                        </tr>
                      );
                    }

                    return filtered.map(tx => {
                      const isPending = tx.status === 'PENDING';
                      const isActionBusy = actionLoadingId === tx.id;

                      return (
                        <tr key={tx.id} className="hover:bg-slate-50/50 dark:hover:bg-slate-800/30">
                          <td className="py-3 px-3 font-semibold text-slate-900 dark:text-white">
                            <span className="truncate block max-w-[120px]" title={tx.id}>{tx.id}</span>
                          </td>
                          <td className="py-3 px-3 font-sans">
                            <span className="font-semibold text-slate-900 dark:text-white">{tx.sender_name || 'Client'}</span>
                            <span className="block text-[10px] text-slate-400 font-mono truncate max-w-[120px]">{tx.sender_id}</span>
                          </td>
                          <td className="py-3 px-3 font-sans">
                            <span className="font-semibold text-slate-900 dark:text-white">{tx.beneficiary_account}</span>
                          </td>
                          <td className="py-3 px-3 font-bold text-slate-900 dark:text-white font-mono">
                            ${typeof tx.amount === 'number' ? tx.amount.toFixed(2) : tx.amount} {tx.currency || 'USD'}
                          </td>
                          <td className="py-3 px-3">
                            <span className={`px-2 py-0.5 rounded-full text-[10px] font-bold ${
                              tx.status === 'SUCCESS' ? 'bg-emerald-100 text-emerald-800 dark:bg-emerald-950 dark:text-emerald-300' :
                              tx.status === 'FAILED' ? 'bg-rose-100 text-rose-800 dark:bg-rose-950 dark:text-rose-300' :
                              tx.status === 'PROCESSING' ? 'bg-sky-100 text-sky-800 dark:bg-sky-950 dark:text-sky-300' :
                              'bg-amber-100 text-amber-800 dark:bg-amber-950 dark:text-amber-300'
                            }`}>
                              {tx.status}
                            </span>
                          </td>
                          <td className="py-3 px-3 text-slate-400 text-[11px] whitespace-nowrap">
                            {new Date(tx.timestamp || tx.created_at || Date.now()).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit', second: '2-digit' })}
                          </td>
                          <td className="py-3 px-3 font-sans text-slate-500 max-w-[150px] truncate text-[11px]" title={tx.notes}>
                            {tx.notes || '—'}
                          </td>
                          <td className="py-3 px-3 text-right">
                            {isPending ? (
                              <div className="flex items-center justify-end gap-1.5 font-sans">
                                <button
                                  type="button"
                                  onClick={() => handleApproveAttempt(tx.id)}
                                  disabled={isActionBusy}
                                  className="px-2.5 py-1 rounded-lg bg-emerald-600 hover:bg-emerald-700 text-white text-[11px] font-bold transition-all shadow-xs cursor-pointer disabled:opacity-50 inline-flex items-center gap-1"
                                >
                                  {isActionBusy ? <RefreshCw className="w-3 h-3 animate-spin" /> : <Check className="w-3 h-3" />}
                                  <span>Approve</span>
                                </button>
                                <button
                                  type="button"
                                  onClick={() => handleRejectAttempt(tx.id)}
                                  disabled={isActionBusy}
                                  className="px-2.5 py-1 rounded-lg bg-rose-600 hover:bg-rose-700 text-white text-[11px] font-bold transition-all shadow-xs cursor-pointer disabled:opacity-50 inline-flex items-center gap-1"
                                >
                                  <XCircle className="w-3 h-3" />
                                  <span>Reject</span>
                                </button>
                              </div>
                            ) : (
                              <span className="text-[10px] text-slate-400 font-sans">Settled</span>
                            )}
                          </td>
                        </tr>
                      );
                    })
                  })()}
                </tbody>
              </table>
            </div>
          </div>
        </div>
      )}

      {/* WEBHOOKS & SIMULATOR SUB-TAB */}
      {activeSubTab === 'WEBHOOKS' && (
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
          {/* Simulator Controls on Left */}
          <div className="lg:col-span-5 space-y-4">
            <div className="bg-white dark:bg-[#0f172a] rounded-2xl p-5 sm:p-6 border border-slate-200 dark:border-slate-800 shadow-xs space-y-4">
              <div className="flex items-center gap-2 pb-3 border-b border-slate-100 dark:border-slate-800">
                <Radio className="w-5 h-5 text-emerald-500 animate-pulse" />
                <div>
                  <h4 className="text-sm font-bold text-slate-900 dark:text-white">
                    Simulate Wise Webhook Event
                  </h4>
                  <p className="text-[11px] text-slate-400">
                    Trigger live external state transitions into First Atlantic Bank
                  </p>
                </div>
              </div>

              <form onSubmit={handleSimulateWebhook} className="space-y-3.5 text-xs">
                <div className="space-y-1">
                  <label className="font-semibold text-slate-700 dark:text-slate-300">
                    Target Transfer Reference *
                  </label>
                  <select
                    value={simTransferId}
                    onChange={e => setSimTransferId(e.target.value)}
                    className="w-full px-3 py-2.5 rounded-xl border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-900 text-slate-900 dark:text-white font-mono text-xs focus:outline-hidden focus:ring-2 focus:ring-[#004281]"
                    required
                  >
                    {wiseTransfers.map(tx => (
                      <option key={tx.id} value={tx.id}>
                        {tx.reference} — {tx.recipient.name} ({formatCurrency(tx.amountMinor, tx.sourceCurrency)}) [{tx.status}]
                      </option>
                    ))}
                  </select>
                </div>

                <div className="space-y-1">
                  <label className="font-semibold text-slate-700 dark:text-slate-300">
                    Wise Webhook Target State (`event_type`) *
                  </label>
                  <select
                    value={simStatus}
                    onChange={e => setSimStatus(e.target.value as WiseTransferStatus)}
                    className="w-full px-3 py-2.5 rounded-xl border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-900 text-slate-900 dark:text-white font-mono text-xs focus:outline-hidden focus:ring-2 focus:ring-[#004281]"
                  >
                    <option value="outgoing_payment_sent">
                      outgoing_payment_sent → COMPLETED (Funds cleared to beneficiary)
                    </option>
                    <option value="processing">
                      processing → PROCESSING (Rail clearing in transit)
                    </option>
                    <option value="incoming_payment_waiting">
                      incoming_payment_waiting → PENDING (Waiting settlement)
                    </option>
                    <option value="cancelled">
                      cancelled → FAILED (Reversed back to customer balance)
                    </option>
                  </select>
                </div>

                <button
                  type="submit"
                  disabled={isSimulating}
                  className="w-full py-3 px-4 rounded-xl bg-emerald-600 hover:bg-emerald-700 text-white font-bold text-xs shadow-xs transition-all flex items-center justify-center gap-2 cursor-pointer disabled:opacity-50"
                >
                  <Zap className="w-4 h-4" />
                  <span>{isSimulating ? 'Firing Webhook Request...' : 'Trigger Webhook Delivery'}</span>
                </button>
              </form>
            </div>

            {/* Webhook Endpoint Info Box */}
            <div className="p-4 rounded-2xl bg-slate-50 dark:bg-slate-850 border border-slate-200 dark:border-slate-800 text-xs space-y-2">
              <span className="font-bold text-slate-900 dark:text-white flex items-center gap-1.5">
                <ShieldCheck className="w-4 h-4 text-emerald-500" />
                <span>Production Webhook Ingress</span>
              </span>
              <p className="text-[11px] text-slate-500 dark:text-slate-400">
                Registered listener receives live HMAC SHA-256 authenticated webhooks from Wise API on status mutations:
              </p>
              <div className="p-2.5 rounded-xl bg-slate-900 text-slate-200 font-mono text-[10px] break-all border border-slate-800">
                POST /api/webhooks/wise
              </div>
            </div>
          </div>

          {/* Webhook Activity Stream on Right */}
          <div className="lg:col-span-7 bg-white dark:bg-[#0f172a] rounded-2xl p-5 sm:p-6 border border-slate-200 dark:border-slate-800 shadow-xs space-y-4">
            <div className="flex items-center justify-between pb-3 border-b border-slate-100 dark:border-slate-800">
              <h4 className="text-sm font-bold text-slate-900 dark:text-white flex items-center gap-2">
                <FileText className="w-4 h-4 text-[#004281] dark:text-sky-400" />
                <span>Webhook Delivery Audit Stream</span>
              </h4>
              <button
                onClick={fetchWebhookLogs}
                className="p-1.5 rounded-lg border border-slate-200 dark:border-slate-700 text-slate-500 hover:text-slate-900 dark:hover:text-white cursor-pointer"
                title="Refresh Logs"
              >
                <RefreshCw className="w-3.5 h-3.5" />
              </button>
            </div>

            {webhookLogs.length === 0 ? (
              <div className="py-12 text-center text-slate-400 text-xs">
                No webhook logs recorded yet. Use the simulator on the left to test!
              </div>
            ) : (
              <div className="space-y-3 max-h-[500px] overflow-y-auto pr-1">
                {webhookLogs.map(log => (
                  <div
                    key={log.id}
                    className="p-3.5 rounded-xl bg-slate-50 dark:bg-slate-800/60 border border-slate-100 dark:border-slate-800 text-xs space-y-2"
                  >
                    <div className="flex items-center justify-between">
                      <div className="flex items-center gap-2 font-mono">
                        <span className="font-bold text-slate-900 dark:text-white">{log.eventType}</span>
                        <span className="text-[10px] bg-emerald-100 text-emerald-800 dark:bg-emerald-950 dark:text-emerald-300 px-1.5 py-0.2 rounded">
                          HTTP {log.httpStatus}
                        </span>
                      </div>
                      <span className="text-[10px] text-slate-400">
                        {new Date(log.timestamp).toLocaleTimeString()}
                      </span>
                    </div>

                    <div className="text-[11px] text-slate-600 dark:text-slate-300">
                      Transfer ID: <span className="font-mono font-semibold">{log.transferId}</span> • Current State: <span className="font-bold text-emerald-600 dark:text-emerald-400 font-mono">{log.status}</span>
                    </div>

                    <pre className="p-2 rounded-lg bg-slate-900 text-slate-200 font-mono text-[10px] overflow-x-auto">
                      {JSON.stringify(log.payload, null, 2)}
                    </pre>
                  </div>
                ))}
              </div>
            )}
          </div>
        </div>
      )}

      {/* APPROVAL MODAL */}
      {approvalModalTransfer && (
        <div className="fixed inset-0 z-50 bg-slate-950/60 backdrop-blur-xs flex items-center justify-center p-4">
          <div className="bg-white dark:bg-[#0f172a] rounded-2xl max-w-md w-full p-6 shadow-2xl border border-slate-200 dark:border-slate-800 space-y-4 animate-in fade-in zoom-in-95 duration-150">
            <div className="flex items-center justify-between pb-3 border-b border-slate-100 dark:border-slate-800">
              <div className="flex items-center gap-2 text-emerald-600 dark:text-emerald-400">
                <CheckCircle2 className="w-5 h-5" />
                <h3 className="text-base font-bold text-slate-900 dark:text-white">Approve Outbound Wire</h3>
              </div>
              <button
                onClick={() => setApprovalModalTransfer(null)}
                className="p-1.5 rounded-lg text-slate-400 hover:text-slate-700 dark:hover:text-slate-200 cursor-pointer"
              >
                &times;
              </button>
            </div>

            <div className="p-3.5 rounded-xl bg-slate-50 dark:bg-slate-800/60 space-y-2 text-xs border border-slate-100 dark:border-slate-800">
              <div className="flex justify-between">
                <span className="text-slate-500">Ref:</span>
                <span className="font-mono font-bold text-slate-900 dark:text-white">{approvalModalTransfer.reference}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-slate-500">Client:</span>
                <span className="font-bold text-slate-900 dark:text-white">{approvalModalTransfer.userName}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-slate-500">Beneficiary:</span>
                <span className="font-bold text-slate-900 dark:text-white">{approvalModalTransfer.recipient.name} ({approvalModalTransfer.recipient.bankName})</span>
              </div>
              <div className="flex justify-between">
                <span className="text-slate-500">Amount:</span>
                <span className="font-mono font-bold text-emerald-600 dark:text-emerald-400">
                  {formatCurrency(approvalModalTransfer.amountMinor, approvalModalTransfer.sourceCurrency)} → {formatCurrency(approvalModalTransfer.convertedAmountMinor, approvalModalTransfer.destCurrency)}
                </span>
              </div>
            </div>

            <div className="space-y-1 text-xs">
              <label className="font-semibold text-slate-700 dark:text-slate-300">
                Compliance Officer Clearance Memo
              </label>
              <textarea
                rows={2}
                value={approvalNotes}
                onChange={e => setApprovalNotes(e.target.value)}
                className="w-full p-2.5 rounded-xl border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-900 text-slate-900 dark:text-white focus:outline-hidden focus:ring-2 focus:ring-emerald-600 text-xs"
              />
            </div>

            <div className="flex items-center justify-end gap-3 pt-2">
              <button
                type="button"
                onClick={() => setApprovalModalTransfer(null)}
                className="py-2 px-4 rounded-xl border border-slate-200 dark:border-slate-700 text-slate-600 dark:text-slate-400 font-bold hover:bg-slate-100 dark:hover:bg-slate-800 cursor-pointer text-xs"
              >
                Cancel
              </button>
              <button
                type="button"
                onClick={handleApprove}
                disabled={isApproving}
                className="py-2 px-4 rounded-xl bg-emerald-600 hover:bg-emerald-700 text-white font-bold shadow-xs flex items-center gap-1.5 cursor-pointer disabled:opacity-50 text-xs"
              >
                <CheckCircle2 className="w-4 h-4" />
                <span>{isApproving ? 'Approving...' : 'Confirm Approval & Clear Rail'}</span>
              </button>
            </div>
          </div>
        </div>
      )}

      {/* REJECTION MODAL */}
      {rejectionModalTransfer && (
        <div className="fixed inset-0 z-50 bg-slate-950/60 backdrop-blur-xs flex items-center justify-center p-4">
          <div className="bg-white dark:bg-[#0f172a] rounded-2xl max-w-md w-full p-6 shadow-2xl border border-slate-200 dark:border-slate-800 space-y-4 animate-in fade-in zoom-in-95 duration-150">
            <div className="flex items-center justify-between pb-3 border-b border-slate-100 dark:border-slate-800">
              <div className="flex items-center gap-2 text-rose-600 dark:text-rose-400">
                <XCircle className="w-5 h-5" />
                <h3 className="text-base font-bold text-slate-900 dark:text-white">Reject Wire &amp; Refund Client</h3>
              </div>
              <button
                onClick={() => setRejectionModalTransfer(null)}
                className="p-1.5 rounded-lg text-slate-400 hover:text-slate-700 dark:hover:text-slate-200 cursor-pointer"
              >
                &times;
              </button>
            </div>

            <div className="p-3.5 rounded-xl bg-slate-50 dark:bg-slate-800/60 space-y-2 text-xs border border-slate-100 dark:border-slate-800">
              <div className="flex justify-between">
                <span className="text-slate-500">Ref:</span>
                <span className="font-mono font-bold text-slate-900 dark:text-white">{rejectionModalTransfer.reference}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-slate-500">Refund Amount:</span>
                <span className="font-mono font-bold text-rose-600 dark:text-rose-400">
                  {formatCurrency(rejectionModalTransfer.amountMinor, rejectionModalTransfer.sourceCurrency)}
                </span>
              </div>
              <div className="flex justify-between">
                <span className="text-slate-500">Refund Destination:</span>
                <span className="font-bold text-slate-900 dark:text-white">{rejectionModalTransfer.sourceAccountName}</span>
              </div>
            </div>

            <div className="space-y-1 text-xs">
              <label className="font-semibold text-slate-700 dark:text-slate-300">
                Mandatory Rejection Reason *
              </label>
              <textarea
                rows={3}
                value={rejectionReason}
                onChange={e => setRejectionReason(e.target.value)}
                placeholder="Specify regulatory, compliance, or routing discrepancy reason..."
                className="w-full p-2.5 rounded-xl border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-900 text-slate-900 dark:text-white focus:outline-hidden focus:ring-2 focus:ring-rose-600 text-xs"
                required
              />
            </div>

            <div className="p-3 bg-amber-50 dark:bg-amber-950/40 border border-amber-200 dark:border-amber-800/60 rounded-xl text-[11px] text-amber-800 dark:text-amber-300">
              Upon rejection, funds will immediately be reversed into client account #{rejectionModalTransfer.sourceAccountId} with audit note.
            </div>

            <div className="flex items-center justify-end gap-3 pt-2">
              <button
                type="button"
                onClick={() => setRejectionModalTransfer(null)}
                className="py-2 px-4 rounded-xl border border-slate-200 dark:border-slate-700 text-slate-600 dark:text-slate-400 font-bold hover:bg-slate-100 dark:hover:bg-slate-800 cursor-pointer text-xs"
              >
                Cancel
              </button>
              <button
                type="button"
                onClick={handleReject}
                disabled={isRejecting || !rejectionReason.trim()}
                className="py-2 px-4 rounded-xl bg-rose-600 hover:bg-rose-700 text-white font-bold shadow-xs flex items-center gap-1.5 cursor-pointer disabled:opacity-50 text-xs"
              >
                <XCircle className="w-4 h-4" />
                <span>{isRejecting ? 'Reversing...' : 'Confirm Rejection & Refund'}</span>
              </button>
            </div>
          </div>
        </div>
      )}

      {/* INSPECT DETAIL MODAL */}
      {inspectTransfer && (
        <div className="fixed inset-0 z-50 bg-slate-950/60 backdrop-blur-xs flex items-center justify-center p-4 overflow-y-auto">
          <div className="bg-white dark:bg-[#0f172a] rounded-2xl max-w-lg w-full p-6 shadow-2xl border border-slate-200 dark:border-slate-800 space-y-5 animate-in fade-in zoom-in-95 duration-150 my-6">
            <div className="flex items-center justify-between pb-3 border-b border-slate-100 dark:border-slate-800">
              <div>
                <span className="text-[10px] font-bold uppercase tracking-wider text-slate-400">
                  Global Wire Dossier &amp; Compliance Audit
                </span>
                <h3 className="text-base font-bold text-slate-900 dark:text-white">
                  Transfer #{inspectTransfer.reference}
                </h3>
              </div>
              <button
                onClick={() => setInspectTransfer(null)}
                className="p-1.5 rounded-lg text-slate-400 hover:text-slate-700 dark:hover:text-slate-200 cursor-pointer"
              >
                &times;
              </button>
            </div>

            <div className="space-y-3 text-xs">
              <div className="p-3.5 bg-slate-50 dark:bg-slate-800/40 rounded-xl space-y-2 border border-slate-100 dark:border-slate-800">
                <div className="flex justify-between">
                  <span className="text-slate-500">Sender / Customer:</span>
                  <span className="font-bold text-slate-900 dark:text-white">{inspectTransfer.userName} ({inspectTransfer.userEmail})</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-slate-500">Funding Account:</span>
                  <span className="font-mono text-slate-900 dark:text-white">{inspectTransfer.sourceAccountName}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-slate-500">Amount Debited:</span>
                  <span className="font-mono font-bold text-slate-900 dark:text-white">
                    {formatCurrency(inspectTransfer.amountMinor, inspectTransfer.sourceCurrency)}
                  </span>
                </div>
                <div className="flex justify-between">
                  <span className="text-slate-500">Wise Exchange Rate:</span>
                  <span className="font-mono font-bold text-amber-600 dark:text-amber-400">
                    1 {inspectTransfer.sourceCurrency} = {inspectTransfer.exchangeRate} {inspectTransfer.destCurrency}
                  </span>
                </div>
                <div className="flex justify-between">
                  <span className="text-slate-500">Recipient Receives:</span>
                  <span className="font-mono font-bold text-emerald-600 dark:text-emerald-400 text-sm">
                    {formatCurrency(inspectTransfer.convertedAmountMinor, inspectTransfer.destCurrency)}
                  </span>
                </div>
              </div>

              <div className="p-3.5 bg-slate-50 dark:bg-slate-800/40 rounded-xl space-y-2 border border-slate-100 dark:border-slate-800">
                <span className="font-bold text-slate-700 dark:text-slate-300 uppercase tracking-wider text-[10px] block">
                  Beneficiary Account Specifications
                </span>
                <div className="flex justify-between">
                  <span className="text-slate-500">Beneficiary Name:</span>
                  <span className="font-bold text-slate-900 dark:text-white">{inspectTransfer.recipient.name}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-slate-500">Bank Name &amp; Region:</span>
                  <span className="font-semibold text-slate-900 dark:text-white">
                    {inspectTransfer.recipient.bankName} ({inspectTransfer.recipient.region})
                  </span>
                </div>
                {inspectTransfer.recipient.sortCode && (
                  <div className="flex justify-between">
                    <span className="text-slate-500">UK Sort Code:</span>
                    <span className="font-mono text-slate-900 dark:text-white">{inspectTransfer.recipient.sortCode}</span>
                  </div>
                )}
                {inspectTransfer.recipient.routingNumber && (
                  <div className="flex justify-between">
                    <span className="text-slate-500">US ABA Routing:</span>
                    <span className="font-mono text-slate-900 dark:text-white">{inspectTransfer.recipient.routingNumber}</span>
                  </div>
                )}
                {inspectTransfer.recipient.iban && (
                  <div className="flex justify-between">
                    <span className="text-slate-500">Euro IBAN:</span>
                    <span className="font-mono text-slate-900 dark:text-white">{inspectTransfer.recipient.iban}</span>
                  </div>
                )}
                <div className="flex justify-between">
                  <span className="text-slate-500">Account / IBAN:</span>
                  <span className="font-mono font-bold text-slate-900 dark:text-white">
                    {inspectTransfer.recipient.accountNumberOrIban}
                  </span>
                </div>
                <div className="flex justify-between">
                  <span className="text-slate-500">Wise Transfer ID:</span>
                  <span className="font-mono text-slate-900 dark:text-white">{inspectTransfer.wiseTransferId || 'N/A'}</span>
                </div>
              </div>
            </div>

            <div className="flex items-center justify-between pt-2">
              <div className="space-x-2">
                {inspectTransfer.status === 'PENDING' && (
                  <>
                    <button
                      onClick={() => {
                        setApprovalModalTransfer(inspectTransfer);
                      }}
                      className="py-2 px-3.5 rounded-xl bg-emerald-600 hover:bg-emerald-700 text-white font-bold text-xs shadow-xs cursor-pointer"
                    >
                      Approve Transfer
                    </button>
                    <button
                      onClick={() => {
                        setRejectionModalTransfer(inspectTransfer);
                      }}
                      className="py-2 px-3.5 rounded-xl bg-rose-600 hover:bg-rose-700 text-white font-bold text-xs shadow-xs cursor-pointer"
                    >
                      Reject Transfer
                    </button>
                  </>
                )}
              </div>

              <button
                onClick={() => setInspectTransfer(null)}
                className="py-2 px-4 rounded-xl bg-slate-100 dark:bg-slate-800 text-slate-700 dark:text-slate-300 font-bold text-xs hover:bg-slate-200 cursor-pointer"
              >
                Close
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
