import React, { useState, useEffect } from 'react';
import { useBank } from '../../context/BankContext';
import {
  Users,
  Search,
  ShieldCheck,
  ShieldAlert,
  CreditCard,
  Landmark,
  FileText,
  Lock,
  Unlock,
  DollarSign,
  Edit3,
  CheckCircle2,
  XCircle,
  AlertCircle,
  RefreshCw,
  Eye,
  EyeOff,
  UserCheck,
  Building,
  Mail,
  Phone,
  MapPin,
  Calendar,
  Layers,
  ArrowUpRight,
  ArrowDownLeft,
  X
} from 'lucide-react';
import { CurrencyDisplay } from '../../components/common/CurrencyDisplay';
import { StatusBadge } from '../../components/common/StatusBadge';
import { DirectFundsManager } from './DirectFundsManager';

export const UserDetailsInspector: React.FC = () => {
  const {
    fetchUserBackendDetails,
    updateUserProfile,
    toggleUserAccess,
    setUserApprovalStatus,
    showToast
  } = useBank();

  const [usersList, setUsersList] = useState<any[]>([]);
  const [isLoadingList, setIsLoadingList] = useState(true);
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedUserId, setSelectedUserId] = useState<string | null>(null);
  const [userDetails, setUserDetails] = useState<any | null>(null);
  const [isLoadingDetails, setIsLoadingDetails] = useState(false);

  // Unmasked SSN toggle
  const [showSensitiveData, setShowSensitiveData] = useState(false);

  // Edit User Profile Modal
  const [isEditingProfile, setIsEditingProfile] = useState(false);
  const [editFirstName, setEditFirstName] = useState('');
  const [editLastName, setEditLastName] = useState('');
  const [editEmail, setEditEmail] = useState('');
  const [editPhone, setEditPhone] = useState('');
  const [editAddress, setEditAddress] = useState('');
  const [editKycTier, setEditKycTier] = useState<number>(3);
  const [isSavingProfile, setIsSavingProfile] = useState(false);

  // Direct Fund Action for this user
  const [activeFundActionAccountId, setActiveFundActionAccountId] = useState<string | null>(null);

  const loadUsersList = async () => {
    setIsLoadingList(true);
    try {
      const res = await fetch('/api/admin/approval/users', {
        headers: { 'x-admin-id': 'adm_master_01' }
      });
      if (res.ok) {
        const data = await res.json();
        setUsersList(data.users || []);
        if (data.users && data.users.length > 0 && !selectedUserId) {
          inspectUser(data.users[0].id);
        }
      }
    } catch (err) {
      console.error(err);
    } finally {
      setIsLoadingList(false);
    }
  };

  const inspectUser = async (userId: string) => {
    setSelectedUserId(userId);
    setIsLoadingDetails(true);
    try {
      const data = await fetchUserBackendDetails(userId);
      setUserDetails(data);
    } catch (err) {
      console.error(err);
    } finally {
      setIsLoadingDetails(false);
    }
  };

  useEffect(() => {
    loadUsersList();
  }, []);

  const filteredUsers = usersList.filter(u =>
    `${u.first_name} ${u.last_name}`.toLowerCase().includes(searchQuery.toLowerCase()) ||
    u.email.toLowerCase().includes(searchQuery.toLowerCase()) ||
    u.username.toLowerCase().includes(searchQuery.toLowerCase())
  );

  const openEditProfile = () => {
    if (!userDetails?.user) return;
    const u = userDetails.user;
    setEditFirstName(u.firstName);
    setEditLastName(u.lastName);
    setEditEmail(u.email);
    setEditPhone(u.phone || '');
    setEditAddress(u.address || '');
    setEditKycTier(u.kycTier || 3);
    setIsEditingProfile(true);
  };

  const handleSaveProfile = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!selectedUserId) return;
    setIsSavingProfile(true);
    try {
      const res = await updateUserProfile(selectedUserId, {
        firstName: editFirstName.trim(),
        lastName: editLastName.trim(),
        email: editEmail.trim(),
        phone: editPhone.trim(),
        address: editAddress.trim(),
        kycTier: editKycTier
      });
      if (res.success) {
        setIsEditingProfile(false);
        await inspectUser(selectedUserId);
        await loadUsersList();
      }
    } catch (err: any) {
      showToast('ERROR', 'Update Failed', err.message);
    } finally {
      setIsSavingProfile(false);
    }
  };

  const handleToggleLock = async (userId: string, isCurrentlyLocked: boolean) => {
    await toggleUserAccess(userId, isCurrentlyLocked ? 'UNFREEZE' : 'FREEZE');
    await inspectUser(userId);
    await loadUsersList();
  };

  const handleSetApproval = async (userId: string, status: any) => {
    await setUserApprovalStatus(userId, status, `Executive Admin Manual Approval Update to ${status}`);
    await inspectUser(userId);
    await loadUsersList();
  };

  return (
    <div className="space-y-4">
      {/* Search Header */}
      <div className="bg-white rounded-2xl border border-slate-200 p-4 sm:p-6 shadow-sm flex flex-col sm:flex-row sm:items-center justify-between gap-3">
        <div>
          <h2 className="text-lg font-bold font-serif text-slate-900 flex items-center gap-2">
            <Users className="w-5 h-5 text-[#c5a880]" />
            <span>Customer Backend Intelligence &amp; Record Inspector</span>
          </h2>
          <p className="text-xs text-slate-500">
            Full unmasked backend view of client identity, regulatory KYC, accounts, linked cards, and ledger streams
          </p>
        </div>

        <div className="relative w-full sm:w-72">
          <Search className="w-4 h-4 text-slate-400 absolute left-3 top-2.5" />
          <input
            type="text"
            placeholder="Search customer name, email..."
            value={searchQuery}
            onChange={e => setSearchQuery(e.target.value)}
            className="w-full pl-9 pr-3 py-2 text-xs rounded-xl border border-slate-200 focus:outline-none focus:ring-2 focus:ring-[#0a192f] bg-slate-50"
          />
        </div>
      </div>

      {/* Main Grid: User Selection & Detailed Inspector */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-5">
        {/* User List Selector (Column) */}
        <div className="lg:col-span-4 space-y-2 max-h-[700px] overflow-y-auto pr-1">
          {isLoadingList ? (
            <div className="p-8 text-center text-slate-400 text-xs flex flex-col items-center gap-2 bg-white rounded-2xl border border-slate-200">
              <RefreshCw className="w-5 h-5 animate-spin text-[#c5a880]" />
              <span>Loading customer directory...</span>
            </div>
          ) : filteredUsers.map(u => {
            const isSelected = selectedUserId === u.id;
            return (
              <div
                key={u.id}
                onClick={() => inspectUser(u.id)}
                className={`p-3.5 rounded-2xl border cursor-pointer transition-all ${
                  isSelected
                    ? 'border-[#0a192f] bg-[#0a192f] text-white shadow-md ring-2 ring-[#c5a880]/30'
                    : 'border-slate-200 hover:border-slate-300 bg-white text-slate-800'
                }`}
              >
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-2.5 min-w-0">
                    <div
                      className={`w-8 h-8 rounded-full flex items-center justify-center font-bold text-xs shrink-0 ${
                        isSelected
                          ? 'bg-[#d4af37] text-slate-950 font-serif'
                          : 'bg-slate-100 text-[#0a192f]'
                      }`}
                    >
                      {u.first_name[0]}{u.last_name[0]}
                    </div>
                    <div className="min-w-0">
                      <div className="text-xs font-bold truncate">
                        {u.first_name} {u.last_name}
                      </div>
                      <div className={`text-[11px] truncate ${isSelected ? 'text-slate-300' : 'text-slate-500'}`}>
                        {u.email}
                      </div>
                    </div>
                  </div>

                  <span
                    className={`text-[10px] font-bold px-2 py-0.5 rounded uppercase font-mono shrink-0 ${
                      u.approval_status === 'ACTIVATED'
                        ? 'bg-emerald-500/20 text-emerald-300'
                        : u.approval_status === 'PENDING'
                        ? 'bg-amber-500/20 text-amber-300'
                        : 'bg-rose-500/20 text-rose-300'
                    }`}
                  >
                    {u.approval_status}
                  </span>
                </div>
              </div>
            );
          })}
        </div>

        {/* User Full Backend Details Inspector (Column) */}
        <div className="lg:col-span-8">
          {isLoadingDetails ? (
            <div className="bg-white rounded-2xl border border-slate-200 p-12 text-center text-slate-400 text-xs flex flex-col items-center gap-2 shadow-sm">
              <RefreshCw className="w-6 h-6 animate-spin text-[#c5a880]" />
              <span>Fetching user records &amp; vault ledger...</span>
            </div>
          ) : !userDetails ? (
            <div className="bg-white rounded-2xl border border-slate-200 p-12 text-center text-slate-500 text-xs shadow-sm">
              Select a customer from the left directory to inspect backend vault records.
            </div>
          ) : (
            <div className="space-y-4">
              {/* Profile Card Header */}
              <div className="bg-white rounded-2xl border border-slate-200 shadow-sm p-5 space-y-4">
                <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-4 border-b border-slate-100">
                  <div className="flex items-center gap-3">
                    <div className="w-12 h-12 rounded-2xl bg-gradient-to-br from-[#0a192f] to-[#153459] text-[#d4af37] flex items-center justify-center font-bold text-lg font-serif shadow-sm">
                      {userDetails.user.firstName[0]}{userDetails.user.lastName[0]}
                    </div>
                    <div>
                      <div className="flex items-center gap-2">
                        <h3 className="text-base font-bold text-slate-900 font-serif">
                          {userDetails.user.firstName} {userDetails.user.lastName}
                        </h3>
                        <span className="text-[10px] font-bold px-2 py-0.5 rounded bg-slate-100 text-slate-700 font-mono">
                          Tier {userDetails.user.kycTier || 3} VIP
                        </span>
                      </div>
                      <p className="text-xs text-slate-500 font-mono">
                        User ID: {userDetails.user.id} • Region: {userDetails.user.region}
                      </p>
                    </div>
                  </div>

                  {/* Actions */}
                  <div className="flex items-center gap-2 self-start sm:self-auto flex-wrap">
                    <button
                      onClick={openEditProfile}
                      className="px-3 py-1.5 rounded-xl bg-slate-100 hover:bg-slate-200 text-slate-700 text-xs font-bold flex items-center gap-1.5 transition-colors cursor-pointer"
                    >
                      <Edit3 className="w-3.5 h-3.5" />
                      <span>Edit Profile</span>
                    </button>

                    <button
                      onClick={() => handleToggleLock(userDetails.user.id, userDetails.user.isLocked)}
                      className={`px-3 py-1.5 rounded-xl text-xs font-bold flex items-center gap-1.5 transition-colors cursor-pointer ${
                        userDetails.user.isLocked
                          ? 'bg-emerald-600 hover:bg-emerald-700 text-white'
                          : 'bg-rose-50 hover:bg-rose-100 text-rose-700 border border-rose-200'
                      }`}
                    >
                      {userDetails.user.isLocked ? (
                        <>
                          <Unlock className="w-3.5 h-3.5" />
                          <span>Unlock Account</span>
                        </>
                      ) : (
                        <>
                          <Lock className="w-3.5 h-3.5" />
                          <span>Freeze Account</span>
                        </>
                      )}
                    </button>
                  </div>
                </div>

                {/* Unmasked Identity & Regulatory Compliance Grid */}
                <div className="space-y-2">
                  <div className="flex items-center justify-between">
                    <span className="text-[11px] font-bold uppercase tracking-wider text-slate-500">
                      Regulatory KYC &amp; Unmasked Identification
                    </span>
                    <button
                      onClick={() => setShowSensitiveData(!showSensitiveData)}
                      className="text-xs text-[#8c6d37] hover:text-[#0a192f] font-bold flex items-center gap-1 transition-colors cursor-pointer"
                    >
                      {showSensitiveData ? <EyeOff className="w-3.5 h-3.5" /> : <Eye className="w-3.5 h-3.5" />}
                      <span>{showSensitiveData ? 'Mask Identity' : 'Reveal Unmasked Identity'}</span>
                    </button>
                  </div>

                  <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
                    <div className="p-3 rounded-xl bg-slate-50 border border-slate-200/60">
                      <span className="text-[10px] text-slate-400 font-bold uppercase block">
                        Official SSN / Tax ID
                      </span>
                      <div className="text-xs font-mono font-bold text-slate-900 mt-0.5">
                        {showSensitiveData
                          ? userDetails.user.unmaskedSSN || userDetails.user.taxId || '987-65-8492'
                          : userDetails.user.ssnMasked || '•••-••-8492'}
                      </div>
                    </div>

                    <div className="p-3 rounded-xl bg-slate-50 border border-slate-200/60">
                      <span className="text-[10px] text-slate-400 font-bold uppercase block">
                        Direct Email Address
                      </span>
                      <div className="text-xs font-mono text-slate-900 mt-0.5 truncate">
                        {userDetails.user.email}
                      </div>
                    </div>

                    <div className="p-3 rounded-xl bg-slate-50 border border-slate-200/60">
                      <span className="text-[10px] text-slate-400 font-bold uppercase block">
                        Verified Telephone
                      </span>
                      <div className="text-xs font-mono text-slate-900 mt-0.5">
                        {userDetails.user.phone || '+1 (555) 234-5678'}
                      </div>
                    </div>

                    <div className="p-3 rounded-xl bg-slate-50 border border-slate-200/60 sm:col-span-2">
                      <span className="text-[10px] text-slate-400 font-bold uppercase block">
                        Verified Residential Address
                      </span>
                      <div className="text-xs text-slate-800 mt-0.5">
                        {userDetails.user.address || '740 Park Avenue, Apt 14B, New York, NY 10021'}
                      </div>
                    </div>

                    <div className="p-3 rounded-xl bg-slate-50 border border-slate-200/60">
                      <span className="text-[10px] text-slate-400 font-bold uppercase block">
                        Approval Status
                      </span>
                      <div className="mt-1">
                        <select
                          value={userDetails.user.approvalStatus}
                          onChange={e => handleSetApproval(userDetails.user.id, e.target.value)}
                          className="w-full text-xs font-bold px-2 py-1 rounded-lg border border-slate-300 bg-white focus:ring-2 focus:ring-[#0a192f]"
                        >
                          <option value="ACTIVATED">ACTIVATED (Full Access)</option>
                          <option value="PENDING">PENDING (Hold)</option>
                          <option value="REJECTED">REJECTED (Restricted)</option>
                        </select>
                      </div>
                    </div>
                  </div>
                </div>

                {/* Balance & Aggregates */}
                <div className="p-4 rounded-xl bg-gradient-to-r from-[#0a192f] to-[#163861] text-white flex flex-col sm:flex-row sm:items-center justify-between gap-4">
                  <div>
                    <span className="text-[10px] font-bold text-slate-300 uppercase tracking-wider block">
                      Total Aggregate Liquid Net Worth
                    </span>
                    <div className="text-2xl font-bold font-mono text-[#d4af37]">
                      <CurrencyDisplay
                        amountMinor={userDetails.stats.totalBalanceUsdMinor}
                        currency="USD"
                        size="xl"
                        className="font-bold text-[#d4af37] font-mono"
                      />
                    </div>
                  </div>

                  <div className="flex items-center gap-4 text-xs font-mono">
                    <div>
                      <span className="text-[10px] text-slate-300 block">Total Inflow</span>
                      <span className="text-emerald-400 font-bold">
                        +${(userDetails.stats.totalInflowMinor / 100).toLocaleString('en-US', { minimumFractionDigits: 2 })}
                      </span>
                    </div>
                    <div className="border-l border-slate-700 pl-4">
                      <span className="text-[10px] text-slate-300 block">Total Outflow</span>
                      <span className="text-rose-300 font-bold">
                        -${(userDetails.stats.totalOutflowMinor / 100).toLocaleString('en-US', { minimumFractionDigits: 2 })}
                      </span>
                    </div>
                  </div>
                </div>
              </div>

              {/* Linked Bank Accounts */}
              <div className="bg-white rounded-2xl border border-slate-200 shadow-sm p-5 space-y-3">
                <div className="flex items-center justify-between">
                  <h4 className="text-xs font-bold uppercase tracking-wider text-slate-700 flex items-center gap-1.5">
                    <Landmark className="w-4 h-4 text-[#c5a880]" />
                    <span>Active Multi-Currency Accounts ({userDetails.accounts.length})</span>
                  </h4>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                  {userDetails.accounts.map((acc: any) => (
                    <div
                      key={acc.id}
                      className="p-3.5 rounded-xl border border-slate-200 bg-slate-50/50 space-y-2"
                    >
                      <div className="flex items-center justify-between">
                        <span className="text-xs font-bold text-slate-900">{acc.name}</span>
                        <span className="text-[10px] font-bold px-1.5 py-0.5 rounded bg-slate-200 text-slate-800 font-mono">
                          {acc.currency}
                        </span>
                      </div>

                      <div className="space-y-0.5 text-[11px] font-mono text-slate-600">
                        <div>Acct: <strong className="text-slate-800">{acc.accountNumber}</strong></div>
                        {acc.iban && <div>IBAN: <strong className="text-slate-800">{acc.iban}</strong></div>}
                        {acc.routingNumber && <div>Routing: <strong className="text-slate-800">{acc.routingNumber}</strong></div>}
                      </div>

                      <div className="pt-2 border-t border-slate-200 flex items-center justify-between">
                        <div className="text-xs font-bold text-slate-900 font-mono">
                          <CurrencyDisplay amountMinor={acc.balanceMinor} currency={acc.currency} size="sm" />
                        </div>
                        <button
                          onClick={() => setActiveFundActionAccountId(acc.id)}
                          className="px-2.5 py-1 rounded-lg bg-[#0a192f] hover:bg-[#153459] text-white text-[11px] font-bold flex items-center gap-1 transition-colors cursor-pointer"
                        >
                          <DollarSign className="w-3 h-3 text-[#d4af37]" />
                          <span>Credit / Debit</span>
                        </button>
                      </div>
                    </div>
                  ))}
                </div>
              </div>

              {/* Quick Direct Fund Drawer if triggered */}
              {activeFundActionAccountId && (
                <div className="space-y-2">
                  <div className="flex items-center justify-between">
                    <span className="text-xs font-bold text-slate-700">Quick Fund Adjustment for this Account:</span>
                    <button
                      onClick={() => setActiveFundActionAccountId(null)}
                      className="text-xs text-rose-600 font-bold hover:underline"
                    >
                      Close Fund Drawer
                    </button>
                  </div>
                  <DirectFundsManager
                    preselectedAccountId={activeFundActionAccountId}
                    onSuccess={() => {
                      inspectUser(selectedUserId);
                    }}
                  />
                </div>
              )}
            </div>
          )}
        </div>
      </div>

      {/* EDIT USER PROFILE MODAL */}
      {isEditingProfile && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/70 backdrop-blur-xs">
          <div className="bg-white rounded-2xl max-w-md w-full overflow-hidden shadow-2xl border border-slate-200">
            <div className="p-4 bg-[#0a192f] text-white flex items-center justify-between">
              <h3 className="text-sm font-bold font-serif">Edit Customer Profile</h3>
              <button
                onClick={() => setIsEditingProfile(false)}
                className="text-slate-400 hover:text-white"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <form onSubmit={handleSaveProfile} className="p-5 space-y-3">
              <div className="grid grid-cols-2 gap-3">
                <div className="space-y-1">
                  <label className="text-xs font-bold text-slate-700">First Name</label>
                  <input
                    type="text"
                    required
                    value={editFirstName}
                    onChange={e => setEditFirstName(e.target.value)}
                    className="w-full px-3 py-2 text-xs rounded-xl border border-slate-300 focus:ring-2 focus:ring-[#0a192f]"
                  />
                </div>
                <div className="space-y-1">
                  <label className="text-xs font-bold text-slate-700">Last Name</label>
                  <input
                    type="text"
                    required
                    value={editLastName}
                    onChange={e => setEditLastName(e.target.value)}
                    className="w-full px-3 py-2 text-xs rounded-xl border border-slate-300 focus:ring-2 focus:ring-[#0a192f]"
                  />
                </div>
              </div>

              <div className="space-y-1">
                <label className="text-xs font-bold text-slate-700">Email Address</label>
                <input
                  type="email"
                  required
                  value={editEmail}
                  onChange={e => setEditEmail(e.target.value)}
                  className="w-full px-3 py-2 text-xs rounded-xl border border-slate-300 focus:ring-2 focus:ring-[#0a192f]"
                />
              </div>

              <div className="space-y-1">
                <label className="text-xs font-bold text-slate-700">Phone</label>
                <input
                  type="text"
                  value={editPhone}
                  onChange={e => setEditPhone(e.target.value)}
                  className="w-full px-3 py-2 text-xs rounded-xl border border-slate-300 focus:ring-2 focus:ring-[#0a192f]"
                />
              </div>

              <div className="space-y-1">
                <label className="text-xs font-bold text-slate-700">Address</label>
                <input
                  type="text"
                  value={editAddress}
                  onChange={e => setEditAddress(e.target.value)}
                  className="w-full px-3 py-2 text-xs rounded-xl border border-slate-300 focus:ring-2 focus:ring-[#0a192f]"
                />
              </div>

              <div className="space-y-1">
                <label className="text-xs font-bold text-slate-700">KYC Verification Tier</label>
                <select
                  value={editKycTier}
                  onChange={e => setEditKycTier(Number(e.target.value))}
                  className="w-full px-3 py-2 text-xs rounded-xl border border-slate-300 focus:ring-2 focus:ring-[#0a192f] bg-white"
                >
                  <option value={1}>Tier 1 - Basic Registered</option>
                  <option value={2}>Tier 2 - Identity Verified</option>
                  <option value={3}>Tier 3 - Executive Full Sovereign Clearance</option>
                </select>
              </div>

              <div className="flex items-center justify-end gap-2 pt-3">
                <button
                  type="button"
                  onClick={() => setIsEditingProfile(false)}
                  className="px-4 py-2 rounded-xl text-xs font-bold text-slate-600 hover:bg-slate-100"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={isSavingProfile}
                  className="px-5 py-2 rounded-xl bg-[#0a192f] hover:bg-[#153459] text-white text-xs font-bold flex items-center gap-1.5 shadow-md disabled:opacity-50"
                >
                  {isSavingProfile ? <RefreshCw className="w-3.5 h-3.5 animate-spin" /> : <CheckCircle2 className="w-3.5 h-3.5 text-[#d4af37]" />}
                  <span>Save Profile</span>
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};
