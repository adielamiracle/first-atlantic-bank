import React, { useState, useEffect } from 'react';
import { useBank } from '../../context/BankContext';
import { CurrencyDisplay } from '../../components/common/CurrencyDisplay';
import { StatusBadge } from '../../components/common/StatusBadge';
import {
  Users,
  Search,
  UserCheck,
  UserX,
  CreditCard,
  Building2,
  Shield,
  ShieldAlert,
  FileText,
  Edit3,
  Save,
  X,
  RefreshCw,
  Eye,
  Lock,
  Unlock,
  CheckCircle2,
  DollarSign,
  Activity,
  ArrowRight,
  Phone,
  Mail,
  MapPin,
  Calendar,
  Key
} from 'lucide-react';
import { UserProfile, BankAccount, BankCard, LedgerEntry, AuditLog, formatAddress } from '../../types';
import { safeFetchJson } from '../../lib/apiHelper';

export const AdminUserDetailsTab: React.FC = () => {
  const { fetchUserBackendDetails, updateUserProfile, toggleUserAccess, setUserApprovalStatus, showToast, setCurrentView } = useBank();

  const [usersList, setUsersList] = useState<any[]>([]);
  const [searchQuery, setSearchQuery] = useState<string>('');
  const [selectedUserId, setSelectedUserId] = useState<string>('');
  const [backendData, setBackendData] = useState<{
    user: UserProfile;
    accounts: BankAccount[];
    cards: BankCard[];
    recentTransactions: LedgerEntry[];
    auditLogs: AuditLog[];
  } | null>(null);

  const [isLoadingList, setIsLoadingList] = useState<boolean>(true);
  const [isLoadingDetails, setIsLoadingDetails] = useState<boolean>(false);

  // Edit User State
  const [isEditingUser, setIsEditingUser] = useState<boolean>(false);
  const [editFirstName, setEditFirstName] = useState<string>('');
  const [editLastName, setEditLastName] = useState<string>('');
  const [editEmail, setEditEmail] = useState<string>('');
  const [editPhone, setEditPhone] = useState<string>('');
  const [editAddress, setEditAddress] = useState<string>('');
  const [editRole, setEditRole] = useState<string>('CUSTOMER');
  const [editStatus, setEditStatus] = useState<string>('APPROVED');
  const [isSavingUser, setIsSavingUser] = useState<boolean>(false);

  const loadUsersList = async () => {
    setIsLoadingList(true);
    try {
      const result = await safeFetchJson<any>('/api/admin/approval/users', {
        headers: { 'x-admin-id': 'adm_master_01' }
      });
      if (result.data?.users) {
        setUsersList(result.data.users);
        if (result.data.users.length > 0 && !selectedUserId) {
          setSelectedUserId(result.data.users[0]?.id || '');
        }
      }
    } catch (err) {
      console.warn('Load users notice:', err);
    } finally {
      setIsLoadingList(false);
    }
  };

  const loadUserDetails = async (userId: string) => {
    if (!userId) return;
    setIsLoadingDetails(true);
    try {
      const data = await fetchUserBackendDetails(userId);
      if (data) {
        setBackendData(data);
        setEditFirstName(data.user.firstName || '');
        setEditLastName(data.user.lastName || '');
        setEditEmail(data.user.email || '');
        setEditPhone(data.user.phone || '');
        setEditAddress(typeof data.user.address === 'string' ? data.user.address : formatAddress(data.user.address));
        setEditRole(data.user.role || 'CUSTOMER');
        setEditStatus(data.user.approval_status || 'APPROVED');
      }
    } catch (err) {
      console.error(err);
    } finally {
      setIsLoadingDetails(false);
    }
  };

  useEffect(() => {
    loadUsersList();
  }, []);

  useEffect(() => {
    if (selectedUserId) {
      loadUserDetails(selectedUserId);
    }
  }, [selectedUserId]);

  const handleSaveUser = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!backendData) return;

    setIsSavingUser(true);
    try {
      const res = await updateUserProfile(backendData.user.id, {
        firstName: editFirstName,
        lastName: editLastName,
        email: editEmail,
        phone: editPhone,
        address: editAddress,
        role: editRole,
        approval_status: editStatus
      });

      if (res.success) {
        setIsEditingUser(false);
        await Promise.all([loadUsersList(), loadUserDetails(backendData.user.id)]);
      }
    } finally {
      setIsSavingUser(false);
    }
  };

  const filteredUsers = usersList.filter((u) => {
    const q = searchQuery.toLowerCase();
    const name = `${u.firstName || ''} ${u.lastName || ''}`.toLowerCase();
    const email = (u.email || '').toLowerCase();
    return name.includes(q) || email.includes(q) || (u.id || '').toLowerCase().includes(q);
  });

  return (
    <div className="space-y-6 max-w-7xl mx-auto">
      {/* Top Banner */}
      <div className="bg-gradient-to-r from-[#0a192f] via-[#0d213f] to-[#122b52] p-5 sm:p-6 rounded-2xl border border-slate-700/80 shadow-xl text-white">
        <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
          <div>
            <div className="flex items-center gap-2 text-[#c5a880] text-xs font-semibold uppercase tracking-wider">
              <Eye className="w-4 h-4" />
              <span>Full Customer Dossier &amp; Backend Inspector</span>
            </div>
            <h2 className="text-xl sm:text-2xl font-serif font-bold text-white mt-1">
              Client Deep Profile &amp; Account Details
            </h2>
            <p className="text-xs sm:text-sm text-slate-300 mt-1 max-w-2xl">
              Inspect unmasked user records, manage customer profile information, review linked bank accounts, audit card authorizations, and monitor user compliance state.
            </p>
          </div>
          <button
            onClick={() => {
              loadUsersList();
              if (selectedUserId) loadUserDetails(selectedUserId);
            }}
            className="p-2.5 bg-slate-800/80 hover:bg-slate-700 border border-slate-700 rounded-xl text-slate-300 hover:text-white transition-all flex items-center gap-2 text-xs font-semibold"
          >
            <RefreshCw className={`w-4 h-4 ${isLoadingDetails || isLoadingList ? 'animate-spin' : ''}`} />
            <span>Refresh Data</span>
          </button>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
        {/* User Selection Sidebar */}
        <div className="lg:col-span-4 space-y-4">
          <div className="bg-slate-900/90 border border-slate-800 rounded-2xl p-4 shadow-xl space-y-3">
            <div className="relative">
              <Search className="w-4 h-4 absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" />
              <input
                type="text"
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                placeholder="Search clients by name, email..."
                className="w-full bg-slate-950 border border-slate-700 text-white rounded-xl pl-9 pr-3 py-2 text-xs focus:outline-none focus:border-[#c5a880]"
              />
            </div>

            <div className="space-y-2 max-h-[600px] overflow-y-auto pr-1">
              {isLoadingList ? (
                <div className="py-8 text-center text-slate-500 text-xs">Loading clients...</div>
              ) : filteredUsers.length === 0 ? (
                <div className="py-8 text-center text-slate-500 text-xs">No clients found</div>
              ) : (
                filteredUsers.map((u) => {
                  const isSelected = u.id === selectedUserId;
                  return (
                    <button
                      key={u.id}
                      type="button"
                      onClick={() => setSelectedUserId(u.id)}
                      className={`w-full text-left p-3 rounded-xl border transition-all ${
                        isSelected
                          ? 'bg-slate-800 border-[#c5a880] ring-1 ring-[#c5a880]/30 shadow-md'
                          : 'bg-slate-950/60 border-slate-800 hover:bg-slate-800/60'
                      }`}
                    >
                      <div className="flex items-center justify-between gap-2">
                        <span className="font-bold text-white text-xs truncate">
                          {u.firstName} {u.lastName}
                        </span>
                        <StatusBadge status={u.approval_status || 'APPROVED'} />
                      </div>
                      <div className="text-[11px] text-slate-400 truncate mt-0.5">{u.email}</div>
                      <div className="flex items-center justify-between text-[10px] text-slate-500 font-mono mt-1">
                        <span>Role: {u.role}</span>
                        <span>ID: {u.id ? u.id.slice(0, 8) : 'USR'}...</span>
                      </div>
                    </button>
                  );
                })
              )}
            </div>
          </div>
        </div>

        {/* Backend Details View */}
        <div className="lg:col-span-8 space-y-6">
          {isLoadingDetails ? (
            <div className="bg-slate-900/90 border border-slate-800 rounded-2xl p-16 text-center text-slate-400 space-y-3">
              <RefreshCw className="w-8 h-8 animate-spin mx-auto text-[#c5a880]" />
              <p className="text-sm">Fetching unmasked backend dossier...</p>
            </div>
          ) : !backendData ? (
            <div className="bg-slate-900/90 border border-slate-800 rounded-2xl p-12 text-center text-slate-500">
              Select a customer to inspect backend details.
            </div>
          ) : (
            <div className="space-y-6">
              {/* Profile Card */}
              <div className="bg-slate-900/90 border border-slate-800 rounded-2xl p-5 sm:p-6 shadow-xl space-y-5">
                <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 pb-4 border-b border-slate-800">
                  <div className="flex items-center gap-3.5">
                    <div className="w-12 h-12 rounded-2xl bg-gradient-to-br from-[#c5a880] to-[#8c6b3e] text-slate-950 font-bold text-lg flex items-center justify-center font-serif shadow-lg">
                      {backendData.user.firstName?.charAt(0) || ''}
                      {backendData.user.lastName?.charAt(0) || ''}
                    </div>
                    <div>
                      <h3 className="text-lg font-serif font-bold text-white flex items-center gap-2">
                        <span>{backendData.user.firstName} {backendData.user.lastName}</span>
                        <StatusBadge status={backendData.user.approval_status || 'APPROVED'} />
                      </h3>
                      <div className="text-xs text-slate-400 font-mono">
                        User ID: {backendData.user.id} • Tier: {backendData.user.tier || 'PRIVATE_CLIENT'}
                      </div>
                    </div>
                  </div>

                  <div className="flex items-center gap-2">
                    <button
                      onClick={() => setIsEditingUser(!isEditingUser)}
                      className="px-3.5 py-1.5 bg-slate-800 hover:bg-[#c5a880] text-slate-300 hover:text-slate-950 rounded-xl border border-slate-700 text-xs font-bold transition-all flex items-center gap-1.5"
                    >
                      <Edit3 className="w-3.5 h-3.5" />
                      <span>{isEditingUser ? 'Cancel Edit' : 'Edit Profile'}</span>
                    </button>
                    <button
                      onClick={async () => {
                        await toggleUserAccess(backendData.user.id, 'Administrative Security Toggle');
                        loadUserDetails(backendData.user.id);
                      }}
                      className="px-3.5 py-1.5 bg-slate-800 hover:bg-slate-700 text-slate-300 rounded-xl border border-slate-700 text-xs font-bold transition-all flex items-center gap-1.5"
                    >
                      <Lock className="w-3.5 h-3.5 text-amber-400" />
                      <span>Security Lock</span>
                    </button>
                  </div>
                </div>

                {/* Edit Form or Readonly Grid */}
                {isEditingUser ? (
                  <form onSubmit={handleSaveUser} className="space-y-4 pt-2">
                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                      <div>
                        <label className="block text-xs font-semibold text-slate-400 uppercase tracking-wider mb-1">
                          First Name
                        </label>
                        <input
                          type="text"
                          value={editFirstName}
                          onChange={(e) => setEditFirstName(e.target.value)}
                          className="w-full bg-slate-950 border border-slate-700 text-white rounded-xl px-3 py-2 text-sm focus:border-[#c5a880]"
                          required
                        />
                      </div>
                      <div>
                        <label className="block text-xs font-semibold text-slate-400 uppercase tracking-wider mb-1">
                          Last Name
                        </label>
                        <input
                          type="text"
                          value={editLastName}
                          onChange={(e) => setEditLastName(e.target.value)}
                          className="w-full bg-slate-950 border border-slate-700 text-white rounded-xl px-3 py-2 text-sm focus:border-[#c5a880]"
                          required
                        />
                      </div>
                    </div>

                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                      <div>
                        <label className="block text-xs font-semibold text-slate-400 uppercase tracking-wider mb-1">
                          Email Address
                        </label>
                        <input
                          type="email"
                          value={editEmail}
                          onChange={(e) => setEditEmail(e.target.value)}
                          className="w-full bg-slate-950 border border-slate-700 text-white rounded-xl px-3 py-2 text-sm focus:border-[#c5a880]"
                          required
                        />
                      </div>
                      <div>
                        <label className="block text-xs font-semibold text-slate-400 uppercase tracking-wider mb-1">
                          Phone Number
                        </label>
                        <input
                          type="text"
                          value={editPhone}
                          onChange={(e) => setEditPhone(e.target.value)}
                          className="w-full bg-slate-950 border border-slate-700 text-white rounded-xl px-3 py-2 text-sm focus:border-[#c5a880]"
                        />
                      </div>
                    </div>

                    <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
                      <div>
                        <label className="block text-xs font-semibold text-slate-400 uppercase tracking-wider mb-1">
                          Residential Address
                        </label>
                        <input
                          type="text"
                          value={editAddress}
                          onChange={(e) => setEditAddress(e.target.value)}
                          className="w-full bg-slate-950 border border-slate-700 text-white rounded-xl px-3 py-2 text-sm focus:border-[#c5a880]"
                        />
                      </div>
                      <div>
                        <label className="block text-xs font-semibold text-slate-400 uppercase tracking-wider mb-1">
                          System Role
                        </label>
                        <select
                          value={editRole}
                          onChange={(e) => setEditRole(e.target.value)}
                          className="w-full bg-slate-950 border border-slate-700 text-white rounded-xl px-3 py-2 text-sm focus:border-[#c5a880]"
                        >
                          <option value="CUSTOMER">CUSTOMER</option>
                          <option value="ADMIN">ADMIN</option>
                        </select>
                      </div>
                      <div>
                        <label className="block text-xs font-semibold text-slate-400 uppercase tracking-wider mb-1">
                          Approval Status
                        </label>
                        <select
                          value={editStatus}
                          onChange={(e) => setEditStatus(e.target.value)}
                          className="w-full bg-slate-950 border border-slate-700 text-white rounded-xl px-3 py-2 text-sm focus:border-[#c5a880]"
                        >
                          <option value="APPROVED">APPROVED</option>
                          <option value="PENDING">PENDING</option>
                          <option value="REJECTED">REJECTED</option>
                          <option value="SUSPENDED">SUSPENDED</option>
                        </select>
                      </div>
                    </div>

                    <div className="flex justify-end gap-3 pt-3">
                      <button
                        type="button"
                        onClick={() => setIsEditingUser(false)}
                        className="px-4 py-2 text-xs font-semibold text-slate-400 hover:text-white rounded-xl"
                      >
                        Cancel
                      </button>
                      <button
                        type="submit"
                        disabled={isSavingUser}
                        className="px-5 py-2 bg-gradient-to-r from-[#c5a880] to-[#b39366] text-slate-950 font-bold text-xs uppercase tracking-wider rounded-xl hover:brightness-105 shadow-md flex items-center gap-2"
                      >
                        {isSavingUser ? (
                          <>
                            <RefreshCw className="w-3.5 h-3.5 animate-spin" />
                            <span>Updating...</span>
                          </>
                        ) : (
                          <>
                            <Save className="w-3.5 h-3.5" />
                            <span>Save Profile</span>
                          </>
                        )}
                      </button>
                    </div>
                  </form>
                ) : (
                  <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-4 text-xs">
                    <div className="bg-slate-950 p-3.5 rounded-xl border border-slate-800">
                      <div className="text-slate-400 mb-1 flex items-center gap-1.5">
                        <Mail className="w-3.5 h-3.5 text-[#c5a880]" />
                        <span>Email Address</span>
                      </div>
                      <div className="font-semibold text-white truncate">{backendData.user.email}</div>
                    </div>

                    <div className="bg-slate-950 p-3.5 rounded-xl border border-slate-800">
                      <div className="text-slate-400 mb-1 flex items-center gap-1.5">
                        <Phone className="w-3.5 h-3.5 text-[#c5a880]" />
                        <span>Phone Contact</span>
                      </div>
                      <div className="font-semibold text-white">{backendData.user.phone || 'Not Specified'}</div>
                    </div>

                    <div className="bg-slate-950 p-3.5 rounded-xl border border-slate-800">
                      <div className="text-slate-400 mb-1 flex items-center gap-1.5">
                        <MapPin className="w-3.5 h-3.5 text-[#c5a880]" />
                        <span>Jurisdiction / Address</span>
                      </div>
                      <div className="font-semibold text-white truncate">{formatAddress(backendData.user.address) || 'Frankfurt, Germany'}</div>
                    </div>

                    <div className="bg-slate-950 p-3.5 rounded-xl border border-slate-800">
                      <div className="text-slate-400 mb-1">KYC / AML Status</div>
                      <div className="font-bold text-emerald-400 flex items-center gap-1">
                        <CheckCircle2 className="w-3.5 h-3.5" />
                        <span>{backendData.user.kycStatus || 'VERIFIED_TIER_3'}</span>
                      </div>
                    </div>

                    <div className="bg-slate-950 p-3.5 rounded-xl border border-slate-800">
                      <div className="text-slate-400 mb-1">Two-Factor Authentication</div>
                      <div className="font-semibold text-white">
                        {backendData.user.twoFactorEnabled ? 'Enabled (FIDO2 / TOTP)' : 'SMS OTP'}
                      </div>
                    </div>

                    <div className="bg-slate-950 p-3.5 rounded-xl border border-slate-800">
                      <div className="text-slate-400 mb-1">Enrollment Date</div>
                      <div className="font-mono text-slate-300">
                        {new Date(backendData.user.created_at || Date.now()).toLocaleDateString()}
                      </div>
                    </div>
                  </div>
                )}
              </div>

              {/* Linked Bank Accounts */}
              <div className="bg-slate-900/90 border border-slate-800 rounded-2xl p-5 sm:p-6 shadow-xl space-y-4">
                <div className="flex items-center justify-between">
                  <h3 className="text-sm font-semibold text-white uppercase tracking-wider flex items-center gap-2">
                    <Building2 className="w-4 h-4 text-[#c5a880]" />
                    <span>Linked Bank Accounts ({backendData.accounts.length})</span>
                  </h3>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  {backendData.accounts.map((acc) => (
                    <div key={acc.id} className="bg-slate-950 p-4 rounded-xl border border-slate-800 space-y-3">
                      <div className="flex items-center justify-between">
                        <span className="font-bold text-white text-sm">{acc.name}</span>
                        <StatusBadge status={acc.status} />
                      </div>

                      <div className="space-y-1 text-xs font-mono text-slate-400">
                        <div>Account #: <span className="text-slate-200">{acc.accountNumber}</span></div>
                        <div>Routing / Sort: <span className="text-slate-200">{acc.routingNumber || 'FABK00921'}</span></div>
                        {acc.iban && <div>IBAN: <span className="text-slate-200">{acc.iban}</span></div>}
                      </div>

                      <div className="pt-2 border-t border-slate-800 flex items-center justify-between">
                        <span className="text-xs text-slate-400">Available Balance:</span>
                        <span className="font-mono text-base font-bold text-[#c5a880]">
                          <CurrencyDisplay amountMinor={acc.balanceMinor} currency={acc.currency} />
                        </span>
                      </div>
                    </div>
                  ))}
                </div>
              </div>

              {/* Payment Cards */}
              <div className="bg-slate-900/90 border border-slate-800 rounded-2xl p-5 sm:p-6 shadow-xl space-y-4">
                <h3 className="text-sm font-semibold text-white uppercase tracking-wider flex items-center gap-2">
                  <CreditCard className="w-4 h-4 text-[#c5a880]" />
                  <span>Assigned Cards &amp; Authorization Limits ({backendData.cards.length})</span>
                </h3>

                {backendData.cards.length === 0 ? (
                  <div className="text-xs text-slate-500 py-4 text-center">No payment cards issued to this profile.</div>
                ) : (
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    {backendData.cards.map((card) => (
                      <div key={card.id} className="bg-slate-950 p-4 rounded-xl border border-slate-800 space-y-3">
                        <div className="flex items-center justify-between">
                          <span className="font-bold text-white text-xs">{card.type} Card</span>
                          <StatusBadge status={card.status} />
                        </div>
                        <div className="font-mono text-base font-bold text-white tracking-widest">
                          {card.cardNumberMasked}
                        </div>
                        <div className="flex justify-between text-xs text-slate-400 font-mono">
                          <span>Expires: {card.expiryDate}</span>
                          <span>Daily Limit: ${(card.dailyLimitMinor / 100).toLocaleString()}</span>
                        </div>
                      </div>
                    ))}
                  </div>
                )}
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};
