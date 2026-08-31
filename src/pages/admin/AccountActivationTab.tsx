import React, { useState, useEffect } from 'react';
import { useBank } from '../../context/BankContext';
import {
  Fingerprint,
  ShieldCheck,
  UserCheck,
  UserX,
  UserPlus,
  RefreshCw,
  Search,
  CheckCircle2,
  XCircle,
  AlertTriangle,
  AlertCircle,
  ShieldAlert,
  BadgeCheck,
  Key,
  Layers,
  ArrowRight,
  Send,
  Lock,
  Building2,
  Globe2,
  Check,
  Clock
} from 'lucide-react';
import { AccountActivationRequest, UserApprovalStatus } from '../../types';
import { safeFetchJson } from '../../lib/apiHelper';
import { CreateCustomerModal } from './CreateCustomerModal';

export const AccountActivationTab: React.FC = () => {
  const {
    activationQueue,
    fetchActivationQueue,
    createActivationRequest,
    approveActivationRequest,
    rejectActivationRequest,
    toggleUserAccess,
    setUserApprovalStatus,
    fetchAdminStats,
    fetchAuditLogs,
    adminSessionRole,
    setAdminSessionRole,
    showToast
  } = useBank();

  const [activationFilter, setActivationFilter] = useState<'ALL' | 'PENDING_DUAL_APPROVAL' | 'ACTIVATED' | 'REJECTED'>('ALL');
  const [activationSearch, setActivationSearch] = useState('');
  const [selectedReq, setSelectedReq] = useState<AccountActivationRequest | null>(null);
  const [checkerNotes, setCheckerNotes] = useState('Dual-signature compliance verified. Account access fully authorized.');
  const [isProcessingActivation, setIsProcessingActivation] = useState(false);

  // Users Matrix State
  const [allUsersList, setAllUsersList] = useState<any[]>([]);
  const [isLoadingUsers, setIsLoadingUsers] = useState(false);
  const [userSearch, setUserSearch] = useState('');

  // Propose Modal State
  const [isProposeModalOpen, setIsProposeModalOpen] = useState(false);
  const [isCreateModalOpen, setIsCreateModalOpen] = useState(false);
  const [proposeUserId, setProposeUserId] = useState('');
  const [proposeReason, setProposeReason] = useState('Institutional Account Onboarding Verification');
  const [proposeNotes, setProposeNotes] = useState('Maker signature applied. Dispatched for 4-Eyes checker review.');
  const [isSubmittingPropose, setIsSubmittingPropose] = useState(false);

  const fetchUsers = async () => {
    setIsLoadingUsers(true);
    try {
      const result = await safeFetchJson<any>('/api/admin/approval/users', {
        headers: {
          'x-admin-id': 'adm_master_01'
        }
      });
      if (result.data?.users) {
        setAllUsersList(result.data.users);
        if (result.data.users.length > 0 && !proposeUserId) {
          const pending = result.data.users.find((u: any) => u.approval_status === 'PENDING');
          setProposeUserId(pending ? pending.id : result.data.users[0]?.id || '');
        }
      }
    } catch (err) {
      console.warn('Failed to fetch admin users:', err);
    } finally {
      setIsLoadingUsers(false);
    }
  };

  useEffect(() => {
    fetchActivationQueue();
    fetchUsers();
  }, [adminSessionRole]);

  const handleApprove = async (reqId: string) => {
    setIsProcessingActivation(true);
    try {
      const res = await approveActivationRequest(reqId, checkerNotes);
      if (res.success) {
        setSelectedReq(null);
        await Promise.all([fetchActivationQueue(), fetchUsers(), fetchAdminStats()]);
      }
    } finally {
      setIsProcessingActivation(false);
    }
  };

  const handleReject = async (reqId: string) => {
    setIsProcessingActivation(true);
    try {
      const res = await rejectActivationRequest(reqId, checkerNotes);
      if (res.success) {
        setSelectedReq(null);
        await Promise.all([fetchActivationQueue(), fetchUsers(), fetchAdminStats()]);
      }
    } finally {
      setIsProcessingActivation(false);
    }
  };

  const handleToggleAccess = async (userId: string) => {
    const res = await toggleUserAccess(userId, 'Administrative security access toggle');
    if (res.success) {
      await Promise.all([fetchUsers(), fetchActivationQueue(), fetchAdminStats()]);
    }
  };

  const handleSetStatus = async (userId: string, status: UserApprovalStatus) => {
    const res = await setUserApprovalStatus(userId, status, `Direct admin status transition to ${status}`);
    if (res.success) {
      await Promise.all([fetchUsers(), fetchActivationQueue(), fetchAdminStats()]);
    }
  };

  const handleProposeSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!proposeUserId) {
      showToast('ERROR', 'Selection Required', 'Please select a user account.');
      return;
    }

    setIsSubmittingPropose(true);
    try {
      const res = await createActivationRequest({
        userId: proposeUserId,
        targetStatus: 'APPROVED',
        reason: proposeReason,
        notes: proposeNotes
      });
      if (res.success) {
        setIsProposeModalOpen(false);
        setProposeReason('Institutional Account Onboarding Verification');
        await Promise.all([fetchActivationQueue(), fetchUsers()]);
      }
    } finally {
      setIsSubmittingPropose(false);
    }
  };

  const filteredQueue = activationQueue.filter(req => {
    const matchesFilter = activationFilter === 'ALL' || req.status === activationFilter;
    const q = activationSearch.toLowerCase();
    const matchesSearch =
      !activationSearch ||
      req.userName.toLowerCase().includes(q) ||
      req.userEmail.toLowerCase().includes(q) ||
      req.userId.toLowerCase().includes(q) ||
      req.id.toLowerCase().includes(q);
    return matchesFilter && matchesSearch;
  });

  const filteredUsers = allUsersList.filter(u => {
    const q = userSearch.toLowerCase();
    return (
      !userSearch ||
      `${u.firstName} ${u.lastName}`.toLowerCase().includes(q) ||
      u.email.toLowerCase().includes(q) ||
      u.username.toLowerCase().includes(q) ||
      u.id.toLowerCase().includes(q) ||
      (u.approval_status && u.approval_status.toLowerCase().includes(q))
    );
  });

  const pendingCount = activationQueue.filter(q => q.status === 'PENDING_DUAL_APPROVAL').length;

  return (
    <div className="space-y-6">
      {/* Overview Banner & 4-Eyes Compliance Info */}
      <div className="p-5 bg-[#0a1f38] border border-[#1e4573] rounded-2xl flex flex-col lg:flex-row gap-5 items-start lg:items-center justify-between">
        <div className="space-y-1 max-w-2xl">
          <div className="flex items-center gap-2">
            <Fingerprint className="w-5 h-5 text-[#d4af37]" />
            <h3 className="text-base font-bold text-white font-serif">
              Account Activation Queue &amp; Dual-Signature Authorization
            </h3>
          </div>
          <p className="text-xs text-slate-300 leading-relaxed">
            Enforcing the institutional <span className="text-[#d4af37] font-semibold">Four-Eyes Principle</span>: Account activation and access provisioning require an authenticated <span className="font-semibold text-sky-300">Maker signature</span> followed by an independent <span className="font-semibold text-emerald-300">Checker sign-off</span> before the client can log in to their dashboard.
          </p>
        </div>

        <div className="flex flex-wrap items-center gap-2.5">
          <button
            onClick={() => setIsCreateModalOpen(true)}
            className="px-4 py-2 rounded-xl bg-emerald-600 hover:bg-emerald-500 text-white font-bold text-xs shadow-md flex items-center gap-1.5 transition-all cursor-pointer"
          >
            <UserPlus className="w-4 h-4" />
            <span>+ Onboard New Customer</span>
          </button>

          <button
            onClick={() => setIsProposeModalOpen(true)}
            className="px-4 py-2 rounded-xl bg-gradient-to-r from-[#d4af37] to-[#bfa130] hover:from-[#e5bd3b] hover:to-[#cca833] text-slate-950 font-bold text-xs shadow-md flex items-center gap-1.5 transition-all cursor-pointer"
          >
            <ShieldCheck className="w-4 h-4" />
            <span>Propose Activation</span>
          </button>

          <button
            onClick={() => { fetchActivationQueue(); fetchUsers(); }}
            className="p-2.5 rounded-xl bg-slate-800 hover:bg-slate-700 text-xs flex items-center gap-1.5 text-slate-300 border border-slate-700 cursor-pointer"
          >
            <RefreshCw className="w-3.5 h-3.5" />
            <span>Refresh</span>
          </button>
        </div>
      </div>

      {/* SECTION 1: DUAL-SIGNATURE QUEUE */}
      <div className="space-y-4">
        <div className="flex flex-col sm:flex-row gap-3 justify-between items-start sm:items-center">
          <div className="flex flex-wrap gap-2">
            {(['ALL', 'PENDING_DUAL_APPROVAL', 'ACTIVATED', 'REJECTED'] as const).map(filter => (
              <button
                key={`act-filter-${filter}`}
                onClick={() => setActivationFilter(filter)}
                className={`px-3 py-1.5 rounded-lg text-xs font-semibold transition-all ${
                  activationFilter === filter
                    ? 'bg-[#d4af37] text-slate-950 font-bold'
                    : 'bg-slate-800 text-slate-300 hover:bg-slate-700'
                }`}
              >
                {filter === 'ALL' && `All Requests (${activationQueue.length})`}
                {filter === 'PENDING_DUAL_APPROVAL' && `Pending Checker Sign-Off (${pendingCount})`}
                {filter === 'ACTIVATED' && `Activated (${activationQueue.filter(q => q.status === 'ACTIVATED').length})`}
                {filter === 'REJECTED' && `Declined (${activationQueue.filter(q => q.status === 'REJECTED').length})`}
              </button>
            ))}
          </div>

          <div className="relative w-full sm:w-64">
            <Search className="w-3.5 h-3.5 text-slate-400 absolute left-3 top-2.5" />
            <input
              type="text"
              placeholder="Search user, email, or request ID..."
              value={activationSearch}
              onChange={(e) => setActivationSearch(e.target.value)}
              className="w-full pl-8 pr-3 py-1.5 text-xs bg-slate-900 border border-slate-700 rounded-lg text-slate-100 placeholder:text-slate-500 focus:outline-none focus:border-[#d4af37]"
            />
          </div>
        </div>

        {filteredQueue.length === 0 ? (
          <div className="p-10 text-center bg-[#050e1a] rounded-2xl border border-slate-800 space-y-2">
            <ShieldCheck className="w-10 h-10 text-slate-600 mx-auto" />
            <h4 className="text-sm font-bold text-slate-300">No Dual-Signature Requests Found</h4>
            <p className="text-xs text-slate-500 max-w-md mx-auto">
              All account activation proposals have been authorized, or click &ldquo;Propose New Activation&rdquo; to initiate a request for a pending customer.
            </p>
          </div>
        ) : (
          <div className="grid grid-cols-1 gap-4">
            {filteredQueue.map(req => {
              const isMakerSelf = req.makerAdminId === (adminSessionRole === 'MAKER' ? 'adm_charles_88' : adminSessionRole === 'SUPER_ADMIN' ? 'adm_alexandra_99' : 'adm_priya_77');
              const canSignAsChecker = adminSessionRole === 'SUPER_ADMIN' || adminSessionRole === 'CHECKER';

              return (
                <div
                  key={req.id}
                  className={`p-5 rounded-2xl border transition-all ${
                    req.status === 'PENDING_DUAL_APPROVAL'
                      ? 'bg-[#091e36] border-[#225088] shadow-lg'
                      : req.status === 'ACTIVATED'
                      ? 'bg-[#051524] border-emerald-900/60'
                      : 'bg-[#150a0e] border-rose-900/60'
                  }`}
                >
                  <div className="flex flex-col md:flex-row md:items-center justify-between gap-3 pb-3 border-b border-slate-800/80">
                    <div className="flex items-center gap-3">
                      <div className={`p-2.5 rounded-xl ${
                        req.status === 'PENDING_DUAL_APPROVAL'
                          ? 'bg-amber-500/20 text-amber-400 border border-amber-500/30'
                          : req.status === 'ACTIVATED'
                          ? 'bg-emerald-500/20 text-emerald-400 border border-emerald-500/30'
                          : 'bg-rose-500/20 text-rose-400 border border-rose-500/30'
                      }`}>
                        <Fingerprint className="w-5 h-5" />
                      </div>
                      <div>
                        <div className="flex items-center gap-2">
                          <h4 className="text-sm font-bold text-white font-serif">{req.userName}</h4>
                          <span className="text-[11px] font-mono text-slate-400">({req.userEmail})</span>
                        </div>
                        <p className="text-xs text-slate-300">
                          Account User ID: <span className="font-mono text-sky-400 font-semibold">{req.userId}</span> • Reason: {req.reason}
                        </p>
                      </div>
                    </div>

                    <div className="flex items-center gap-2">
                      <span className={`px-2.5 py-1 rounded-full text-[11px] font-mono font-bold ${
                        req.status === 'PENDING_DUAL_APPROVAL'
                          ? 'bg-amber-900/60 text-amber-300 border border-amber-600/60'
                          : req.status === 'ACTIVATED'
                          ? 'bg-emerald-900/60 text-emerald-300 border border-emerald-600/60'
                          : 'bg-rose-900/60 text-rose-300 border border-rose-600/60'
                      }`}>
                        {req.status === 'PENDING_DUAL_APPROVAL' ? '⏳ PENDING DUAL-SIGNATURE' : req.status === 'ACTIVATED' ? '✓ FULLY ACTIVATED' : '✕ REJECTED'}
                      </span>
                      <span className="text-[10px] font-mono text-slate-500">ID: {req.id}</span>
                    </div>
                  </div>

                  {/* Signatures & Hash Verification Grid */}
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4 py-3 text-xs">
                    {/* Maker Signature Block */}
                    <div className="p-3.5 bg-[#050e1a]/80 rounded-xl border border-slate-800 space-y-1.5 font-mono">
                      <div className="flex items-center justify-between text-sky-400 font-bold">
                        <span className="flex items-center gap-1.5">
                          <BadgeCheck className="w-4 h-4" />
                          PRIMARY SIGNATURE (MAKER)
                        </span>
                        <span className="text-[10px] text-slate-400">Step 1 Completed</span>
                      </div>
                      <div className="text-slate-200">
                        Signatory: <span className="font-bold text-white">{req.makerAdminName}</span> ({req.makerAdminRole})
                      </div>
                      <div className="text-slate-400 text-[11px]">
                        Timestamp: {new Date(req.createdAt).toLocaleString()}
                      </div>
                      <div className="text-[10px] text-slate-500 truncate pt-1 border-t border-slate-800">
                        Sig Hash: <span className="text-sky-300">{req.makerSignatureHash}</span>
                      </div>
                    </div>

                    {/* Checker Signature Block */}
                    <div className={`p-3.5 rounded-xl border font-mono space-y-1.5 ${
                      req.checkerAdminName
                        ? 'bg-[#050e1a]/80 border-emerald-800/80 text-emerald-300'
                        : 'bg-slate-900/40 border-dashed border-slate-700 text-slate-400'
                    }`}>
                      <div className="flex items-center justify-between font-bold">
                        <span className="flex items-center gap-1.5">
                          {req.checkerAdminName ? <ShieldCheck className="w-4 h-4 text-emerald-400" /> : <Clock className="w-4 h-4 text-amber-400" />}
                          COUNTERSIGNATURE (CHECKER)
                        </span>
                        <span className="text-[10px]">
                          {req.checkerAdminName ? 'Step 2 Completed' : 'Awaiting Sign-off'}
                        </span>
                      </div>
                      {req.checkerAdminName ? (
                        <>
                          <div className="text-slate-200">
                            Signatory: <span className="font-bold text-emerald-300">{req.checkerAdminName}</span> ({req.checkerAdminRole})
                          </div>
                          <div className="text-slate-400 text-[11px]">
                            Timestamp: {req.decidedAt ? new Date(req.decidedAt).toLocaleString() : 'N/A'}
                          </div>
                          <div className="text-[10px] text-slate-500 truncate pt-1 border-t border-slate-800">
                            Sig Hash: <span className="text-emerald-400">{req.checkerSignatureHash}</span>
                          </div>
                        </>
                      ) : (
                        <div className="py-2 text-[11px] text-amber-300/80">
                          Independent Checker verification required to transition account from <span className="font-bold">PENDING</span> to <span className="font-bold text-emerald-300">APPROVED</span>.
                        </div>
                      )}
                    </div>
                  </div>

                  {/* Notes / Reason */}
                  {req.notes && (
                    <div className="text-xs text-slate-400 bg-[#050e1a]/40 p-2.5 rounded-lg border border-slate-800/60">
                      <span className="font-semibold text-slate-300">Compliance Notes:</span> {req.notes}
                    </div>
                  )}

                  {/* Master Administrator Sign-off Action Bar */}
                  {req.status === 'PENDING_DUAL_APPROVAL' && (
                    <div className="mt-3 pt-3 border-t border-slate-700/60 flex flex-wrap items-center justify-between gap-3">
                      <div className="text-xs text-slate-300 flex items-center gap-2">
                        <ShieldAlert className="w-4 h-4 text-amber-400" />
                        <span>Executive Signatory: <span className="font-bold text-[#d4af37]">Alexandra Vance (Master Administrator &amp; CRO)</span></span>
                      </div>

                      <div className="flex items-center gap-2">
                        <button
                          disabled={isProcessingActivation}
                          onClick={() => handleReject(req.id)}
                          className="px-3.5 py-1.5 rounded-lg bg-rose-900/60 hover:bg-rose-800 text-rose-200 border border-rose-700 text-xs font-semibold transition-all"
                        >
                          Decline Activation
                        </button>

                        <button
                          disabled={isProcessingActivation}
                          onClick={() => handleApprove(req.id)}
                          className="px-4 py-1.5 rounded-lg bg-gradient-to-r from-emerald-500 to-teal-600 hover:from-emerald-400 hover:to-teal-500 text-slate-950 font-bold text-xs shadow-md flex items-center gap-1.5 transition-all"
                        >
                          <ShieldCheck className="w-4 h-4" />
                          <span>Authorize &amp; Sign Master Activation</span>
                        </button>
                      </div>
                    </div>
                  )}
                </div>
              );
            })}
          </div>
        )}
      </div>

      {/* SECTION 2: DIRECT USER ACCESS & APPROVAL MATRIX */}
      <div className="p-5 bg-[#050e1a] rounded-2xl border border-slate-800 space-y-4">
        <div className="flex flex-col sm:flex-row gap-3 justify-between items-start sm:items-center">
          <div>
            <h4 className="text-sm font-bold text-white font-serif flex items-center gap-2">
              <UserCheck className="w-4 h-4 text-[#d4af37]" />
              <span>Customer Access Control &amp; Approval Status Matrix</span>
            </h4>
            <p className="text-xs text-slate-400">
              Direct administrative access override. Toggle customer account access between <span className="text-emerald-400 font-semibold">APPROVED</span>, <span className="text-amber-400 font-semibold">PENDING</span>, and <span className="text-rose-400 font-semibold">SUSPENDED</span> with live audit logging.
            </p>
          </div>

          <div className="relative w-full sm:w-64">
            <Search className="w-3.5 h-3.5 text-slate-400 absolute left-3 top-2.5" />
            <input
              type="text"
              placeholder="Filter customer accounts..."
              value={userSearch}
              onChange={(e) => setUserSearch(e.target.value)}
              className="w-full pl-8 pr-3 py-1.5 text-xs bg-slate-900 border border-slate-700 rounded-lg text-slate-100 placeholder:text-slate-500 focus:outline-none focus:border-[#d4af37]"
            />
          </div>
        </div>

        <div className="overflow-x-auto rounded-xl border border-slate-800">
          <table className="w-full text-left text-xs">
            <thead className="bg-[#091b30] text-slate-300 font-mono uppercase text-[10px] tracking-wider border-b border-slate-800">
              <tr>
                <th className="py-3 px-4">Client Name &amp; Contact</th>
                <th className="py-3 px-4">User ID</th>
                <th className="py-3 px-4">Accounts &amp; Cards</th>
                <th className="py-3 px-4">Approval Status</th>
                <th className="py-3 px-4">Quick Toggle</th>
                <th className="py-3 px-4 text-right">Status Selector</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-800/80">
              {filteredUsers.map(u => {
                const isApproved = u.approval_status === 'APPROVED';
                const isPending = u.approval_status === 'PENDING';
                const isSuspended = u.approval_status === 'SUSPENDED';

                return (
                  <tr key={u.id} className="hover:bg-slate-900/50 transition-colors">
                    <td className="py-3 px-4">
                      <div className="font-semibold text-white">{u.firstName} {u.lastName}</div>
                      <div className="text-[11px] text-slate-400 font-mono">{u.email}</div>
                    </td>
                    <td className="py-3 px-4 font-mono text-sky-400 font-semibold">{u.id}</td>
                    <td className="py-3 px-4 text-slate-300 font-mono">
                      {u.accountsCount || 0} Accounts • {u.cardsCount || 0} Cards
                    </td>
                    <td className="py-3 px-4">
                      <span className={`inline-flex items-center gap-1 px-2.5 py-1 rounded-full text-[10px] font-mono font-bold ${
                        isApproved
                          ? 'bg-emerald-950 text-emerald-400 border border-emerald-700/60'
                          : isPending
                          ? 'bg-amber-950 text-amber-400 border border-amber-700/60'
                          : 'bg-rose-950 text-rose-400 border border-rose-700/60'
                      }`}>
                        {isApproved && <CheckCircle2 className="w-3 h-3" />}
                        {isPending && <Clock className="w-3 h-3" />}
                        {isSuspended && <AlertCircle className="w-3 h-3" />}
                        {u.approval_status || 'APPROVED'}
                      </span>
                    </td>
                    <td className="py-3 px-4">
                      <button
                        onClick={() => handleToggleAccess(u.id)}
                        className={`px-3 py-1 rounded-lg text-xs font-semibold transition-all flex items-center gap-1.5 ${
                          isApproved
                            ? 'bg-rose-950/80 hover:bg-rose-900 text-rose-300 border border-rose-800'
                            : 'bg-emerald-950/80 hover:bg-emerald-900 text-emerald-300 border border-emerald-800'
                        }`}
                      >
                        {isApproved ? (
                          <>
                            <UserX className="w-3.5 h-3.5" />
                            <span>Suspend Access</span>
                          </>
                        ) : (
                          <>
                            <UserCheck className="w-3.5 h-3.5" />
                            <span>Activate Access</span>
                          </>
                        )}
                      </button>
                    </td>
                    <td className="py-3 px-4 text-right">
                      <select
                        value={u.approval_status || 'APPROVED'}
                        onChange={(e) => handleSetStatus(u.id, e.target.value as UserApprovalStatus)}
                        className="bg-slate-900 border border-slate-700 rounded-lg px-2.5 py-1 text-xs text-slate-200 focus:outline-none focus:border-[#d4af37] font-mono"
                      >
                        <option value="APPROVED">APPROVED (Active)</option>
                        <option value="PENDING">PENDING (Review)</option>
                        <option value="SUSPENDED">SUSPENDED (Frozen)</option>
                        <option value="REJECTED">REJECTED (Declined)</option>
                      </select>
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
      </div>

      {/* PROPOSE ACTIVATION MODAL */}
      {isProposeModalOpen && (
        <div className="fixed inset-0 z-50 bg-slate-950/80 backdrop-blur-sm flex items-center justify-center p-4">
          <div className="bg-[#08182b] border border-[#234b7a] rounded-2xl p-6 max-w-lg w-full shadow-2xl space-y-4">
            <div className="flex items-center justify-between pb-3 border-b border-slate-800">
              <div className="flex items-center gap-2">
                <Fingerprint className="w-5 h-5 text-[#d4af37]" />
                <h3 className="text-base font-bold text-white font-serif">Propose Dual-Signature Activation</h3>
              </div>
              <button
                onClick={() => setIsProposeModalOpen(false)}
                className="text-slate-400 hover:text-white text-lg leading-none"
              >
                &times;
              </button>
            </div>

            <form onSubmit={handleProposeSubmit} className="space-y-4 text-xs">
              <div>
                <label className="block text-slate-300 font-semibold mb-1.5">Select User Account</label>
                <select
                  value={proposeUserId}
                  onChange={(e) => setProposeUserId(e.target.value)}
                  className="w-full bg-slate-900 border border-slate-700 rounded-lg p-2.5 text-slate-100 focus:outline-none focus:border-[#d4af37]"
                >
                  {allUsersList.map(u => (
                    <option key={u.id} value={u.id}>
                      {u.firstName} {u.lastName} ({u.email}) - Current: {u.approval_status || 'PENDING'}
                    </option>
                  ))}
                </select>
              </div>

              <div>
                <label className="block text-slate-300 font-semibold mb-1.5">Onboarding Justification &amp; Reason</label>
                <input
                  type="text"
                  required
                  value={proposeReason}
                  onChange={(e) => setProposeReason(e.target.value)}
                  className="w-full bg-slate-900 border border-slate-700 rounded-lg p-2.5 text-slate-100 focus:outline-none focus:border-[#d4af37]"
                  placeholder="e.g. KYC Compliance Cleared / High Net Worth Account Activation"
                />
              </div>

              <div>
                <label className="block text-slate-300 font-semibold mb-1.5">Maker Compliance Notes</label>
                <textarea
                  rows={3}
                  value={proposeNotes}
                  onChange={(e) => setProposeNotes(e.target.value)}
                  className="w-full bg-slate-900 border border-slate-700 rounded-lg p-2.5 text-slate-100 focus:outline-none focus:border-[#d4af37]"
                  placeholder="Additional verification notes for Checker review..."
                />
              </div>

              <div className="p-3 bg-[#050e1a] rounded-xl border border-slate-800 text-[11px] text-slate-400 font-mono">
                Maker Signature: <span className="text-sky-400 font-bold">{adminSessionRole === 'MAKER' ? 'Charles Montgomery (MAKER)' : 'Alexandra Vance (SUPER_ADMIN)'}</span>
                <div className="text-[10px] text-slate-500 pt-1">
                  Applying cryptographic SHA-256 seal upon submission.
                </div>
              </div>

              <div className="flex items-center justify-end gap-2 pt-2 border-t border-slate-800">
                <button
                  type="button"
                  onClick={() => setIsProposeModalOpen(false)}
                  className="px-4 py-2 rounded-lg bg-slate-800 hover:bg-slate-700 text-slate-300 font-semibold"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={isSubmittingPropose}
                  className="px-4 py-2 rounded-lg bg-[#d4af37] hover:bg-[#c4a030] text-slate-950 font-bold flex items-center gap-1.5"
                >
                  <Send className="w-3.5 h-3.5" />
                  <span>{isSubmittingPropose ? 'Signing...' : 'Sign & Dispatch to Checker'}</span>
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
      {/* Create Customer Modal */}
      <CreateCustomerModal
        isOpen={isCreateModalOpen}
        onClose={() => setIsCreateModalOpen(false)}
        onSuccess={async () => {
          await Promise.all([fetchUsers(), fetchActivationQueue(), fetchAdminStats()]);
        }}
      />
    </div>
  );
};
