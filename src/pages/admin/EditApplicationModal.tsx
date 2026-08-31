import React, { useState, useEffect } from 'react';
import { useBank } from '../../context/BankContext';
import {
  Edit3,
  X,
  Building,
  CreditCard,
  Landmark,
  ShieldCheck,
  DollarSign,
  Mail,
  Phone,
  MapPin,
  Calendar,
  Clock,
  Lock,
  Globe,
  FileText,
  CheckCircle2,
  AlertCircle,
  RefreshCw,
  UserCheck,
  Sparkles
} from 'lucide-react';
import { AccountApplication, BankRegion, CurrencyCode, AccountType, ApplicationStatus, formatDateTime } from '../../types';

interface EditApplicationModalProps {
  isOpen: boolean;
  application: AccountApplication | null;
  onClose: () => void;
  onSuccess?: () => void;
}

export const EditApplicationModal: React.FC<EditApplicationModalProps> = ({
  isOpen,
  application,
  onClose,
  onSuccess
}) => {
  const { updateApplicationDetails, showToast } = useBank();

  // Form State
  const [firstName, setFirstName] = useState('');
  const [lastName, setLastName] = useState('');
  const [email, setEmail] = useState('');
  const [phone, setPhone] = useState('');
  const [dateOfBirth, setDateOfBirth] = useState('');
  const [nationality, setNationality] = useState('');
  const [taxIdOrSsn, setTaxIdOrSsn] = useState('');
  const [isPep, setIsPep] = useState(false);

  // Address
  const [addressLine1, setAddressLine1] = useState('');
  const [addressLine2, setAddressLine2] = useState('');
  const [city, setCity] = useState('');
  const [stateOrProvince, setStateOrProvince] = useState('');
  const [postalCode, setPostalCode] = useState('');
  const [country, setCountry] = useState('');

  // Financial & KYC
  const [employmentStatus, setEmploymentStatus] = useState('EXECUTIVE');
  const [employerOrBusinessName, setEmployerOrBusinessName] = useState('');
  const [sourceOfWealth, setSourceOfWealth] = useState('INVESTMENTS');
  const [annualIncomeRange, setAnnualIncomeRange] = useState('');
  const [riskAssessmentScore, setRiskAssessmentScore] = useState(15);
  const [complianceNotes, setComplianceNotes] = useState('');

  // Account Request
  const [requestedCurrency, setRequestedCurrency] = useState<CurrencyCode>('USD');
  const [requestedRegion, setRequestedRegion] = useState<BankRegion>('US');
  const [requestedAccountType, setRequestedAccountType] = useState<AccountType>('CHECKING_PREMIER');
  const [initialDepositDollars, setInitialDepositDollars] = useState('10000');
  const [status, setStatus] = useState<ApplicationStatus>('PENDING_COMPLIANCE_REVIEW');
  const [syncToUserProfile, setSyncToUserProfile] = useState(true);

  const [isSubmitting, setIsSubmitting] = useState(false);
  const [activeTab, setActiveTab] = useState<'PERSONAL' | 'FINANCIAL' | 'STATUS'>('PERSONAL');

  useEffect(() => {
    if (application) {
      setFirstName(application.firstName || '');
      setLastName(application.lastName || '');
      setEmail(application.email || '');
      setPhone(application.phone || '');
      setDateOfBirth(application.dateOfBirth || '');
      setNationality(application.nationality || '');
      setTaxIdOrSsn(application.taxIdOrSsn || '');
      setIsPep(!!application.isPep);

      if (application.address) {
        setAddressLine1(application.address.line1 || '');
        setAddressLine2(application.address.line2 || '');
        setCity(application.address.city || '');
        setStateOrProvince(application.address.stateOrProvince || '');
        setPostalCode(application.address.postalCode || '');
        setCountry(application.address.country || '');
      }

      setEmploymentStatus(application.employmentStatus || 'EXECUTIVE');
      setEmployerOrBusinessName(application.employerOrBusinessName || '');
      setSourceOfWealth(application.sourceOfWealth || 'INVESTMENTS');
      setAnnualIncomeRange(application.annualIncomeRange || '');
      setRiskAssessmentScore(application.riskAssessmentScore ?? 15);
      setComplianceNotes(application.complianceNotes || '');

      setRequestedCurrency(application.requestedCurrency || 'USD');
      setRequestedRegion(application.requestedRegion || 'US');
      setRequestedAccountType(application.requestedAccountType || 'CHECKING_PREMIER');
      setInitialDepositDollars(
        application.initialDepositAmountMinor ? (application.initialDepositAmountMinor / 100).toString() : '10000'
      );
      setStatus(application.status || 'PENDING_COMPLIANCE_REVIEW');
    }
  }, [application]);

  if (!isOpen || !application) return null;

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsSubmitting(true);

    try {
      const depositMinor = Math.round((parseFloat(initialDepositDollars) || 0) * 100);

      const updates = {
        firstName: firstName.trim(),
        lastName: lastName.trim(),
        email: email.trim(),
        phone: phone.trim(),
        dateOfBirth,
        nationality: nationality.trim(),
        taxIdOrSsn: taxIdOrSsn.trim(),
        isPep,
        address: {
          line1: addressLine1.trim(),
          line2: addressLine2.trim(),
          city: city.trim(),
          stateOrProvince: stateOrProvince.trim(),
          postalCode: postalCode.trim(),
          country: country.trim()
        },
        employmentStatus,
        employerOrBusinessName: employerOrBusinessName.trim(),
        sourceOfWealth,
        annualIncomeRange,
        riskAssessmentScore: Number(riskAssessmentScore),
        complianceNotes: complianceNotes.trim(),
        requestedCurrency,
        requestedRegion,
        requestedAccountType,
        initialDepositAmountMinor: depositMinor,
        status,
        syncToUserProfile
      };

      const res = await updateApplicationDetails(application.id, updates);
      if (res.success) {
        onClose();
        if (onSuccess) onSuccess();
      }
    } catch (err: any) {
      showToast('ERROR', 'Update Failed', err.message);
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-3 sm:p-4 bg-slate-950/80 backdrop-blur-xs animate-in fade-in duration-150">
      <div className="bg-white rounded-2xl max-w-3xl w-full max-h-[92vh] overflow-hidden shadow-2xl border border-slate-200 text-slate-800 flex flex-col">
        {/* Header */}
        <div className="p-4 sm:p-5 bg-gradient-to-r from-[#0a192f] via-[#0d223f] to-[#0a192f] text-white flex items-center justify-between shrink-0">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-indigo-500 to-indigo-700 text-white flex items-center justify-center font-bold shadow-sm shrink-0">
              <Edit3 className="w-5 h-5 text-white" />
            </div>
            <div>
              <div className="flex items-center gap-2">
                <h3 className="text-base sm:text-lg font-bold font-serif">Edit Onboarding Application</h3>
                <span className="text-[10px] font-bold px-2 py-0.5 rounded bg-indigo-500/20 text-indigo-300 border border-indigo-500/30 font-mono">
                  REF #{application.referenceNumber}
                </span>
              </div>
              <div className="flex items-center gap-3 text-[11px] text-slate-300 flex-wrap mt-0.5">
                <span className="inline-flex items-center gap-1 text-slate-200">
                  <Calendar className="w-3 h-3 text-indigo-300" />
                  <span>Submitted: <strong>{formatDateTime(application.submittedAt || (application as any).createdAt)}</strong></span>
                </span>
                {application.reviewedAt && (
                  <span className="inline-flex items-center gap-1 text-emerald-300">
                    <Clock className="w-3 h-3 text-emerald-400" />
                    <span>Reviewed: <strong>{formatDateTime(application.reviewedAt)}</strong></span>
                  </span>
                )}
              </div>
            </div>
          </div>
          <button
            onClick={onClose}
            className="p-1.5 rounded-lg text-slate-400 hover:text-white hover:bg-slate-800/80 transition-colors"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Tab Navigation */}
        <div className="flex items-center border-b border-slate-200 bg-slate-50 px-4 sm:px-6 gap-2 sm:gap-4 shrink-0 overflow-x-auto">
          <button
            type="button"
            onClick={() => setActiveTab('PERSONAL')}
            className={`py-3 px-3 text-xs font-bold border-b-2 transition-all flex items-center gap-1.5 whitespace-nowrap cursor-pointer ${
              activeTab === 'PERSONAL'
                ? 'border-indigo-600 text-indigo-700'
                : 'border-transparent text-slate-500 hover:text-slate-800'
            }`}
          >
            <span>1. Identity &amp; Address</span>
          </button>

          <button
            type="button"
            onClick={() => setActiveTab('FINANCIAL')}
            className={`py-3 px-3 text-xs font-bold border-b-2 transition-all flex items-center gap-1.5 whitespace-nowrap cursor-pointer ${
              activeTab === 'FINANCIAL'
                ? 'border-indigo-600 text-indigo-700'
                : 'border-transparent text-slate-500 hover:text-slate-800'
            }`}
          >
            <span>2. Financial KYC &amp; Banking</span>
          </button>

          <button
            type="button"
            onClick={() => setActiveTab('STATUS')}
            className={`py-3 px-3 text-xs font-bold border-b-2 transition-all flex items-center gap-1.5 whitespace-nowrap cursor-pointer ${
              activeTab === 'STATUS'
                ? 'border-indigo-600 text-indigo-700'
                : 'border-transparent text-slate-500 hover:text-slate-800'
            }`}
          >
            <span>3. Review Status &amp; Sync</span>
          </button>
        </div>

        {/* Form Body */}
        <form onSubmit={handleSubmit} className="flex-1 overflow-y-auto p-4 sm:p-6 space-y-5 text-xs">
          {/* TAB 1: IDENTITY & ADDRESS */}
          {activeTab === 'PERSONAL' && (
            <div className="space-y-4 animate-in fade-in duration-150">
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3.5">
                <div className="space-y-1">
                  <label className="font-bold text-slate-700">First Name *</label>
                  <input
                    type="text"
                    required
                    value={firstName}
                    onChange={e => setFirstName(e.target.value)}
                    className="w-full px-3 py-2 rounded-xl border border-slate-300 focus:outline-none focus:ring-2 focus:ring-indigo-500"
                  />
                </div>

                <div className="space-y-1">
                  <label className="font-bold text-slate-700">Last Name *</label>
                  <input
                    type="text"
                    required
                    value={lastName}
                    onChange={e => setLastName(e.target.value)}
                    className="w-full px-3 py-2 rounded-xl border border-slate-300 focus:outline-none focus:ring-2 focus:ring-indigo-500"
                  />
                </div>

                <div className="space-y-1">
                  <label className="font-bold text-slate-700">Email Address *</label>
                  <input
                    type="email"
                    required
                    value={email}
                    onChange={e => setEmail(e.target.value)}
                    className="w-full px-3 py-2 rounded-xl border border-slate-300 focus:outline-none focus:ring-2 focus:ring-indigo-500"
                  />
                </div>

                <div className="space-y-1">
                  <label className="font-bold text-slate-700">Phone Number</label>
                  <input
                    type="text"
                    value={phone}
                    onChange={e => setPhone(e.target.value)}
                    className="w-full px-3 py-2 rounded-xl border border-slate-300"
                  />
                </div>

                <div className="space-y-1">
                  <label className="font-bold text-slate-700">Date of Birth</label>
                  <input
                    type="date"
                    value={dateOfBirth}
                    onChange={e => setDateOfBirth(e.target.value)}
                    className="w-full px-3 py-2 rounded-xl border border-slate-300"
                  />
                </div>

                <div className="space-y-1">
                  <label className="font-bold text-slate-700">Nationality</label>
                  <input
                    type="text"
                    value={nationality}
                    onChange={e => setNationality(e.target.value)}
                    className="w-full px-3 py-2 rounded-xl border border-slate-300"
                  />
                </div>

                <div className="space-y-1 sm:col-span-2">
                  <label className="font-bold text-slate-700">Tax ID / SSN / National Insurance</label>
                  <input
                    type="text"
                    value={taxIdOrSsn}
                    onChange={e => setTaxIdOrSsn(e.target.value)}
                    className="w-full px-3 py-2 rounded-xl border border-slate-300 font-mono"
                  />
                </div>

                <div className="space-y-1 sm:col-span-2">
                  <label className="font-bold text-slate-700">Address Line 1</label>
                  <input
                    type="text"
                    value={addressLine1}
                    onChange={e => setAddressLine1(e.target.value)}
                    className="w-full px-3 py-2 rounded-xl border border-slate-300"
                  />
                </div>

                <div className="space-y-1 sm:col-span-2">
                  <label className="font-bold text-slate-700">Address Line 2</label>
                  <input
                    type="text"
                    value={addressLine2}
                    onChange={e => setAddressLine2(e.target.value)}
                    className="w-full px-3 py-2 rounded-xl border border-slate-300"
                  />
                </div>

                <div className="space-y-1">
                  <label className="font-bold text-slate-700">City</label>
                  <input
                    type="text"
                    value={city}
                    onChange={e => setCity(e.target.value)}
                    className="w-full px-3 py-2 rounded-xl border border-slate-300"
                  />
                </div>

                <div className="space-y-1">
                  <label className="font-bold text-slate-700">State / Province</label>
                  <input
                    type="text"
                    value={stateOrProvince}
                    onChange={e => setStateOrProvince(e.target.value)}
                    className="w-full px-3 py-2 rounded-xl border border-slate-300"
                  />
                </div>

                <div className="space-y-1">
                  <label className="font-bold text-slate-700">Postal / ZIP Code</label>
                  <input
                    type="text"
                    value={postalCode}
                    onChange={e => setPostalCode(e.target.value)}
                    className="w-full px-3 py-2 rounded-xl border border-slate-300 font-mono"
                  />
                </div>

                <div className="space-y-1">
                  <label className="font-bold text-slate-700">Country</label>
                  <input
                    type="text"
                    value={country}
                    onChange={e => setCountry(e.target.value)}
                    className="w-full px-3 py-2 rounded-xl border border-slate-300"
                  />
                </div>
              </div>

              <div className="flex justify-end pt-2">
                <button
                  type="button"
                  onClick={() => setActiveTab('FINANCIAL')}
                  className="px-4 py-2 rounded-xl bg-indigo-600 hover:bg-indigo-700 text-white font-bold transition-colors cursor-pointer"
                >
                  Next: Financial KYC &rarr;
                </button>
              </div>
            </div>
          )}

          {/* TAB 2: FINANCIAL KYC & BANKING */}
          {activeTab === 'FINANCIAL' && (
            <div className="space-y-4 animate-in fade-in duration-150">
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3.5">
                <div className="space-y-1">
                  <label className="font-bold text-slate-700">Employment Status</label>
                  <select
                    value={employmentStatus}
                    onChange={e => setEmploymentStatus(e.target.value)}
                    className="w-full px-3 py-2 rounded-xl border border-slate-300 bg-white"
                  >
                    <option value="EXECUTIVE">Executive / Corporate Officer</option>
                    <option value="BUSINESS_OWNER">Business Owner / Founder</option>
                    <option value="PARTNER">Managing Partner</option>
                    <option value="SELF_EMPLOYED">Self-Employed Professional</option>
                    <option value="RETIRED">High Net Worth Retired</option>
                  </select>
                </div>

                <div className="space-y-1">
                  <label className="font-bold text-slate-700">Employer / Entity Name</label>
                  <input
                    type="text"
                    value={employerOrBusinessName}
                    onChange={e => setEmployerOrBusinessName(e.target.value)}
                    className="w-full px-3 py-2 rounded-xl border border-slate-300"
                  />
                </div>

                <div className="space-y-1">
                  <label className="font-bold text-slate-700">Source of Wealth</label>
                  <input
                    type="text"
                    value={sourceOfWealth}
                    onChange={e => setSourceOfWealth(e.target.value)}
                    className="w-full px-3 py-2 rounded-xl border border-slate-300"
                  />
                </div>

                <div className="space-y-1">
                  <label className="font-bold text-slate-700">Annual Income Range</label>
                  <input
                    type="text"
                    value={annualIncomeRange}
                    onChange={e => setAnnualIncomeRange(e.target.value)}
                    className="w-full px-3 py-2 rounded-xl border border-slate-300"
                  />
                </div>

                <div className="space-y-1">
                  <label className="font-bold text-slate-700">Requested Region</label>
                  <select
                    value={requestedRegion}
                    onChange={e => setRequestedRegion(e.target.value as BankRegion)}
                    className="w-full px-3 py-2 rounded-xl border border-slate-300 bg-white font-bold"
                  >
                    <option value="US">🇺🇸 United States (USD)</option>
                    <option value="UK">🇬🇧 United Kingdom (GBP)</option>
                    <option value="EU">🇪🇺 European Union (EUR)</option>
                  </select>
                </div>

                <div className="space-y-1">
                  <label className="font-bold text-slate-700">Requested Currency</label>
                  <select
                    value={requestedCurrency}
                    onChange={e => setRequestedCurrency(e.target.value as CurrencyCode)}
                    className="w-full px-3 py-2 rounded-xl border border-slate-300 bg-white font-bold"
                  >
                    <option value="USD">USD ($)</option>
                    <option value="GBP">GBP (£)</option>
                    <option value="EUR">EUR (€)</option>
                  </select>
                </div>

                <div className="space-y-1">
                  <label className="font-bold text-slate-700">Account Type</label>
                  <select
                    value={requestedAccountType}
                    onChange={e => setRequestedAccountType(e.target.value as AccountType)}
                    className="w-full px-3 py-2 rounded-xl border border-slate-300 bg-white font-bold"
                  >
                    <option value="CHECKING_PREMIER">Premier Private Client Checking</option>
                    <option value="SAVINGS_HIGH_YIELD">Apex High-Yield Savings Reserve</option>
                    <option value="MULTI_CURRENCY_GLOBAL">Global Multi-Currency Reserve</option>
                    <option value="COMMERCIAL_OPERATING">Corporate Treasury Operating Account</option>
                  </select>
                </div>

                <div className="space-y-1">
                  <label className="font-bold text-slate-700">Initial Opening Deposit ({requestedCurrency})</label>
                  <input
                    type="number"
                    step="0.01"
                    min="0"
                    value={initialDepositDollars}
                    onChange={e => setInitialDepositDollars(e.target.value)}
                    className="w-full px-3 py-2 rounded-xl border border-slate-300 font-mono font-bold"
                  />
                  {Number(initialDepositDollars) > 0 && (
                    <span className="text-xs text-emerald-600 font-mono font-semibold block mt-1">
                      Formatted: {requestedCurrency === 'EUR' ? '€' : requestedCurrency === 'GBP' ? '£' : '$'}{Number(initialDepositDollars).toLocaleString('en-US', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}
                    </span>
                  )}
                </div>

                <div className="sm:col-span-2 p-3 rounded-xl bg-amber-50 border border-amber-200 flex items-center justify-between">
                  <div>
                    <div className="font-bold text-amber-900">Politically Exposed Person (PEP) Flag</div>
                    <div className="text-[11px] text-amber-700">Enforces enhanced due diligence and sanctions verification</div>
                  </div>
                  <input
                    type="checkbox"
                    checked={isPep}
                    onChange={e => setIsPep(e.target.checked)}
                    className="w-4 h-4 text-amber-600 rounded cursor-pointer"
                  />
                </div>
              </div>

              <div className="flex justify-between pt-2">
                <button
                  type="button"
                  onClick={() => setActiveTab('PERSONAL')}
                  className="px-4 py-2 rounded-xl bg-slate-100 hover:bg-slate-200 text-slate-700 font-bold transition-colors cursor-pointer"
                >
                  &larr; Back
                </button>
                <button
                  type="button"
                  onClick={() => setActiveTab('STATUS')}
                  className="px-4 py-2 rounded-xl bg-indigo-600 hover:bg-indigo-700 text-white font-bold transition-colors cursor-pointer"
                >
                  Next: Compliance &amp; Status &rarr;
                </button>
              </div>
            </div>
          )}

          {/* TAB 3: REVIEW STATUS & AUDIT */}
          {activeTab === 'STATUS' && (
            <div className="space-y-4 animate-in fade-in duration-150">
              {/* Date & Time Timestamp Card */}
              <div className="p-3.5 rounded-xl bg-slate-50 border border-slate-200 grid grid-cols-1 sm:grid-cols-2 gap-3 text-xs">
                <div className="space-y-0.5">
                  <span className="text-[10px] font-bold text-slate-400 uppercase tracking-wider flex items-center gap-1.5">
                    <Calendar className="w-3.5 h-3.5 text-indigo-600" />
                    Application Submitted Date &amp; Time
                  </span>
                  <div className="font-mono font-bold text-slate-800 text-xs">
                    {formatDateTime(application.submittedAt || (application as any).createdAt)}
                  </div>
                  <span className="text-[10px] text-slate-400">Timestamp logged at client onboarding submission</span>
                </div>

                <div className="space-y-0.5">
                  <span className="text-[10px] font-bold text-slate-400 uppercase tracking-wider flex items-center gap-1.5">
                    <Clock className="w-3.5 h-3.5 text-emerald-600" />
                    Last KYC Compliance Review
                  </span>
                  <div className="font-mono font-bold text-emerald-700 text-xs">
                    {application.reviewedAt ? formatDateTime(application.reviewedAt) : 'Pending first compliance review'}
                  </div>
                  {application.reviewedByAdminName && (
                    <span className="text-[10px] text-slate-500">Reviewed by Officer: {application.reviewedByAdminName}</span>
                  )}
                </div>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3.5">
                <div className="space-y-1">
                  <label className="font-bold text-slate-700">Application Status</label>
                  <select
                    value={status}
                    onChange={e => setStatus(e.target.value as ApplicationStatus)}
                    className="w-full px-3 py-2 rounded-xl border border-slate-300 bg-white font-bold"
                  >
                    <option value="PENDING_COMPLIANCE_REVIEW">Pending Compliance Review</option>
                    <option value="APPROVED">Approved (Provisioned)</option>
                    <option value="REJECTED">Rejected</option>
                    <option value="DOCS_REQUESTED">Additional KYC Documents Requested</option>
                  </select>
                </div>

                <div className="space-y-1">
                  <label className="font-bold text-slate-700">Risk Assessment Score (0-100)</label>
                  <input
                    type="number"
                    min={0}
                    max={100}
                    value={riskAssessmentScore}
                    onChange={e => setRiskAssessmentScore(Number(e.target.value))}
                    className="w-full px-3 py-2 rounded-xl border border-slate-300 font-mono font-bold"
                  />
                </div>

                <div className="space-y-1 sm:col-span-2">
                  <label className="font-bold text-slate-700">Internal Compliance &amp; Audit Notes</label>
                  <textarea
                    rows={3}
                    value={complianceNotes}
                    onChange={e => setComplianceNotes(e.target.value)}
                    placeholder="Enter compliance observations, source of wealth audit findings, or sanctions screening clearance..."
                    className="w-full px-3 py-2 rounded-xl border border-slate-300 resize-none"
                  />
                </div>

                {application.createdUserId && (
                  <div className="sm:col-span-2 p-3 rounded-xl bg-blue-50 border border-blue-200 flex items-center justify-between">
                    <div className="flex items-center gap-2.5">
                      <UserCheck className="w-4 h-4 text-blue-600" />
                      <div>
                        <div className="font-bold text-blue-900">Synchronize to Active Customer Profile</div>
                        <div className="text-[11px] text-blue-700">
                          Automatically update linked user record ({application.createdUserId}) with these changes
                        </div>
                      </div>
                    </div>
                    <input
                      type="checkbox"
                      checked={syncToUserProfile}
                      onChange={e => setSyncToUserProfile(e.target.checked)}
                      className="w-4 h-4 text-blue-600 rounded cursor-pointer"
                    />
                  </div>
                )}
              </div>

              {/* Submit Buttons */}
              <div className="flex items-center justify-between pt-3 border-t border-slate-200">
                <button
                  type="button"
                  onClick={() => setActiveTab('FINANCIAL')}
                  className="px-4 py-2 rounded-xl bg-slate-100 hover:bg-slate-200 text-slate-700 font-bold transition-colors cursor-pointer"
                >
                  &larr; Back
                </button>

                <div className="flex items-center gap-2">
                  <button
                    type="button"
                    onClick={onClose}
                    className="px-4 py-2 rounded-xl border border-slate-300 text-slate-700 font-bold hover:bg-slate-100 transition-colors cursor-pointer"
                  >
                    Cancel
                  </button>
                  <button
                    type="submit"
                    disabled={isSubmitting}
                    className="px-5 py-2 rounded-xl bg-indigo-600 hover:bg-indigo-700 text-white font-bold flex items-center gap-1.5 shadow-md transition-colors cursor-pointer"
                  >
                    {isSubmitting ? (
                      <RefreshCw className="w-3.5 h-3.5 animate-spin" />
                    ) : (
                      <CheckCircle2 className="w-3.5 h-3.5" />
                    )}
                    <span>Save Application Changes</span>
                  </button>
                </div>
              </div>
            </div>
          )}
        </form>
      </div>
    </div>
  );
};
