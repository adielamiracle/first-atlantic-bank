import React, { useState } from 'react';
import { useBank } from '../../context/BankContext';
import {
  UserPlus,
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
  Lock,
  Key,
  Globe,
  FileText,
  CheckCircle2,
  AlertCircle,
  RefreshCw,
  Sparkles,
  Shield
} from 'lucide-react';
import { BankRegion, CurrencyCode, AccountType, UserApprovalStatus } from '../../types';

interface CreateCustomerModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSuccess?: () => void;
}

export const CreateCustomerModal: React.FC<CreateCustomerModalProps> = ({
  isOpen,
  onClose,
  onSuccess
}) => {
  const { createCustomerByAdmin, showToast } = useBank();

  // Form State
  const [firstName, setFirstName] = useState('');
  const [lastName, setLastName] = useState('');
  const [email, setEmail] = useState('');
  const [username, setUsername] = useState('');
  const [password, setPassword] = useState('AtlanticSecure2026!');
  const [loginPin, setLoginPin] = useState('1234');
  const [dialCode, setDialCode] = useState('+1');
  const [phone, setPhone] = useState('');
  const [dateOfBirth, setDateOfBirth] = useState('1988-06-15');
  const [nationality, setNationality] = useState('United States');
  const [passportNumber, setPassportNumber] = useState('');
  const [passportPhoto, setPassportPhoto] = useState('https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=500&auto=format&fit=crop&q=80');
  const [ssnOrTaxId, setSsnOrTaxId] = useState('');

  // Address
  const [addressLine1, setAddressLine1] = useState('100 Atlantic Plaza');
  const [addressLine2, setAddressLine2] = useState('Suite 4200');
  const [city, setCity] = useState('New York');
  const [stateOrCounty, setStateOrCounty] = useState('NY');
  const [postalCode, setPostalCode] = useState('10001');
  const [country, setCountry] = useState('United States');

  // Banking Configuration
  const [region, setRegion] = useState<BankRegion>('US');
  const [accountType, setAccountType] = useState<AccountType>('CHECKING_PREMIER');
  const [currency, setCurrency] = useState<CurrencyCode>('USD');
  const [initialDepositDollars, setInitialDepositDollars] = useState('25000');
  const [issueDebitCard, setIssueDebitCard] = useState(true);
  const [kycTier, setKycTier] = useState<'TIER_1_STANDARD' | 'TIER_2_VERIFIED_PREMIER' | 'TIER_3_INSTITUTIONAL'>('TIER_2_VERIFIED_PREMIER');
  const [approvalStatus, setApprovalStatus] = useState<UserApprovalStatus>('APPROVED');

  // Financial KYC
  const [employmentStatus, setEmploymentStatus] = useState('EXECUTIVE');
  const [employerOrBusinessName, setEmployerOrBusinessName] = useState('Atlantic Holdings Corp');
  const [sourceOfWealth, setSourceOfWealth] = useState('INVESTMENTS');
  const [annualIncomeRange, setAnnualIncomeRange] = useState('$250,000 - $500,000');

  const [isSubmitting, setIsSubmitting] = useState(false);
  const [activeStep, setActiveStep] = useState<'IDENTITY' | 'ADDRESS' | 'BANKING'>('IDENTITY');

  // Adjust defaults when region changes
  const handleRegionChange = (newRegion: BankRegion) => {
    setRegion(newRegion);
    if (newRegion === 'EU') {
      setCurrency('EUR');
      setDialCode('+49');
      setNationality('Germany');
      setCity('Frankfurt');
      setStateOrCounty('Hesse');
      setPostalCode('60311');
      setCountry('Germany');
      setAddressLine1('Taunusanlage 8');
    } else if (newRegion === 'UK') {
      setCurrency('GBP');
      setDialCode('+44');
      setNationality('United Kingdom');
      setCity('London');
      setStateOrCounty('Greater London');
      setPostalCode('W1J 5AS');
      setCountry('United Kingdom');
      setAddressLine1('45 Berkeley Square');
    } else {
      setCurrency('USD');
      setDialCode('+1');
      setNationality('United States');
      setCity('New York');
      setStateOrCounty('NY');
      setPostalCode('10001');
      setCountry('United States');
      setAddressLine1('100 Atlantic Plaza');
    }
  };

  // Auto-generate username from names
  const handleFirstNameChange = (val: string) => {
    setFirstName(val);
    if (!username || username === `${firstName.toLowerCase().slice(0, 1)}${lastName.toLowerCase()}`) {
      setUsername(`${val.toLowerCase().slice(0, 1)}${lastName.toLowerCase()}`.replace(/[^a-z0-9]/g, ''));
    }
  };

  const handleLastNameChange = (val: string) => {
    setLastName(val);
    if (!username || username === `${firstName.toLowerCase().slice(0, 1)}${lastName.toLowerCase()}`) {
      setUsername(`${firstName.toLowerCase().slice(0, 1)}${val.toLowerCase()}`.replace(/[^a-z0-9]/g, ''));
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!firstName.trim() || !lastName.trim() || !email.trim() || !username.trim()) {
      showToast('ERROR', 'Validation Error', 'Please complete the applicant first name, last name, email, and username.');
      setActiveStep('IDENTITY');
      return;
    }

    setIsSubmitting(true);
    try {
      const depositMinor = Math.round((parseFloat(initialDepositDollars) || 0) * 100);

      const res = await createCustomerByAdmin({
        firstName: firstName.trim(),
        lastName: lastName.trim(),
        email: email.trim(),
        username: username.trim(),
        password: password.trim() || 'AtlanticSecure2026!',
        loginPin: loginPin.trim() || '1234',
        phone: phone.trim() || `${dialCode} 555-0199`,
        dialCode,
        dateOfBirth,
        nationality,
        passportNumber: passportNumber.trim() || `PASSPORT-${Date.now().toString().slice(-6)}`,
        passportPhoto,
        ssnOrTaxId: ssnOrTaxId.trim() || (region === 'US' ? '•••-••-8899' : 'GB-123456'),
        region,
        address: {
          line1: addressLine1.trim(),
          line2: addressLine2.trim(),
          city: city.trim(),
          stateOrCounty: stateOrCounty.trim(),
          postalCode: postalCode.trim(),
          country: country.trim()
        },
        kycTier,
        approvalStatus,
        requestedAccountType: accountType,
        currency,
        initialDepositMinor: depositMinor,
        issueDebitCard,
        employmentStatus,
        employerOrBusinessName,
        sourceOfWealth,
        annualIncomeRange
      });

      if (res.success) {
        onClose();
        if (onSuccess) onSuccess();
      }
    } catch (err: any) {
      showToast('ERROR', 'Submission Error', err.message);
    } finally {
      setIsSubmitting(false);
    }
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-3 sm:p-4 bg-slate-950/80 backdrop-blur-xs animate-in fade-in duration-150">
      <div className="bg-white rounded-2xl max-w-3xl w-full max-h-[92vh] overflow-hidden shadow-2xl border border-slate-200 text-slate-800 flex flex-col">
        {/* Header */}
        <div className="p-4 sm:p-5 bg-gradient-to-r from-[#0a192f] via-[#0d223f] to-[#0a192f] text-white flex items-center justify-between shrink-0">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-[#c5a880] to-[#8c6d37] text-slate-950 flex items-center justify-center font-bold shadow-sm shrink-0">
              <UserPlus className="w-5 h-5 text-slate-950" />
            </div>
            <div>
              <div className="flex items-center gap-2">
                <h3 className="text-base sm:text-lg font-bold font-serif">Executive Client Onboarding</h3>
                <span className="text-[10px] font-bold px-2 py-0.5 rounded bg-emerald-500/20 text-emerald-300 border border-emerald-500/30 font-mono">
                  DIRECT PROVISION
                </span>
              </div>
              <p className="text-[11px] text-slate-300">
                Provision new customer profile, international IBAN accounts, and access credentials
              </p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="p-1.5 rounded-lg text-slate-400 hover:text-white hover:bg-slate-800/80 transition-colors"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Step Navigation Tabs */}
        <div className="flex items-center border-b border-slate-200 bg-slate-50 px-4 sm:px-6 gap-2 sm:gap-4 shrink-0 overflow-x-auto">
          <button
            type="button"
            onClick={() => setActiveStep('IDENTITY')}
            className={`py-3 px-3 text-xs font-bold border-b-2 transition-all flex items-center gap-1.5 whitespace-nowrap cursor-pointer ${
              activeStep === 'IDENTITY'
                ? 'border-[#c5a880] text-[#8c6d37]'
                : 'border-transparent text-slate-500 hover:text-slate-800'
            }`}
          >
            <span className="w-5 h-5 rounded-full bg-slate-200 text-slate-700 flex items-center justify-center text-[10px] font-mono">1</span>
            <span>Personal &amp; Credentials</span>
          </button>

          <button
            type="button"
            onClick={() => setActiveStep('ADDRESS')}
            className={`py-3 px-3 text-xs font-bold border-b-2 transition-all flex items-center gap-1.5 whitespace-nowrap cursor-pointer ${
              activeStep === 'ADDRESS'
                ? 'border-[#c5a880] text-[#8c6d37]'
                : 'border-transparent text-slate-500 hover:text-slate-800'
            }`}
          >
            <span className="w-5 h-5 rounded-full bg-slate-200 text-slate-700 flex items-center justify-center text-[10px] font-mono">2</span>
            <span>Residential Address</span>
          </button>

          <button
            type="button"
            onClick={() => setActiveStep('BANKING')}
            className={`py-3 px-3 text-xs font-bold border-b-2 transition-all flex items-center gap-1.5 whitespace-nowrap cursor-pointer ${
              activeStep === 'BANKING'
                ? 'border-[#c5a880] text-[#8c6d37]'
                : 'border-transparent text-slate-500 hover:text-slate-800'
            }`}
          >
            <span className="w-5 h-5 rounded-full bg-slate-200 text-slate-700 flex items-center justify-center text-[10px] font-mono">3</span>
            <span>Banking &amp; KYC Setup</span>
          </button>
        </div>

        {/* Form Body */}
        <form onSubmit={handleSubmit} className="flex-1 overflow-y-auto p-4 sm:p-6 space-y-5 text-xs">
          {/* STEP 1: IDENTITY & CREDENTIALS */}
          {activeStep === 'IDENTITY' && (
            <div className="space-y-4 animate-in fade-in duration-150">
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3.5">
                <div className="space-y-1">
                  <label className="font-bold text-slate-700">First Name *</label>
                  <input
                    type="text"
                    required
                    placeholder="e.g. Alistair"
                    value={firstName}
                    onChange={e => handleFirstNameChange(e.target.value)}
                    className="w-full px-3 py-2 rounded-xl border border-slate-300 focus:outline-none focus:ring-2 focus:ring-[#c5a880]"
                  />
                </div>

                <div className="space-y-1">
                  <label className="font-bold text-slate-700">Last Name *</label>
                  <input
                    type="text"
                    required
                    placeholder="e.g. Vance"
                    value={lastName}
                    onChange={e => handleLastNameChange(e.target.value)}
                    className="w-full px-3 py-2 rounded-xl border border-slate-300 focus:outline-none focus:ring-2 focus:ring-[#c5a880]"
                  />
                </div>

                <div className="space-y-1">
                  <label className="font-bold text-slate-700">Email Address *</label>
                  <input
                    type="email"
                    required
                    placeholder="e.g. a.vance@atlantic-wealth.com"
                    value={email}
                    onChange={e => setEmail(e.target.value)}
                    className="w-full px-3 py-2 rounded-xl border border-slate-300 focus:outline-none focus:ring-2 focus:ring-[#c5a880]"
                  />
                </div>

                <div className="space-y-1">
                  <label className="font-bold text-slate-700">Username *</label>
                  <input
                    type="text"
                    required
                    placeholder="e.g. avance"
                    value={username}
                    onChange={e => setUsername(e.target.value)}
                    className="w-full px-3 py-2 rounded-xl border border-slate-300 font-mono focus:outline-none focus:ring-2 focus:ring-[#c5a880]"
                  />
                </div>

                <div className="space-y-1">
                  <label className="font-bold text-slate-700">Initial Password</label>
                  <input
                    type="text"
                    value={password}
                    onChange={e => setPassword(e.target.value)}
                    className="w-full px-3 py-2 rounded-xl border border-slate-300 font-mono"
                  />
                </div>

                <div className="space-y-1">
                  <label className="font-bold text-slate-700">4-Digit Security / Login PIN</label>
                  <input
                    type="text"
                    maxLength={4}
                    value={loginPin}
                    onChange={e => setLoginPin(e.target.value.replace(/\D/g, ''))}
                    className="w-full px-3 py-2 rounded-xl border border-slate-300 font-mono text-center tracking-widest text-sm"
                    placeholder="1234"
                  />
                </div>

                <div className="space-y-1">
                  <label className="font-bold text-slate-700">Dial Code &amp; Phone</label>
                  <div className="flex gap-2">
                    <input
                      type="text"
                      value={dialCode}
                      onChange={e => setDialCode(e.target.value)}
                      className="w-20 px-2.5 py-2 rounded-xl border border-slate-300 text-center font-mono"
                      placeholder="+1"
                    />
                    <input
                      type="text"
                      placeholder="(555) 019-2830"
                      value={phone}
                      onChange={e => setPhone(e.target.value)}
                      className="flex-1 px-3 py-2 rounded-xl border border-slate-300"
                    />
                  </div>
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

                <div className="space-y-1">
                  <label className="font-bold text-slate-700">Passport / National ID Number</label>
                  <input
                    type="text"
                    placeholder="e.g. US84920194A"
                    value={passportNumber}
                    onChange={e => setPassportNumber(e.target.value)}
                    className="w-full px-3 py-2 rounded-xl border border-slate-300 font-mono"
                  />
                </div>

                <div className="space-y-1 sm:col-span-2">
                  <label className="font-bold text-slate-700">Tax ID / SSN / National Insurance</label>
                  <input
                    type="text"
                    placeholder="e.g. 987-65-4321 or QQ 12 34 56 A"
                    value={ssnOrTaxId}
                    onChange={e => setSsnOrTaxId(e.target.value)}
                    className="w-full px-3 py-2 rounded-xl border border-slate-300 font-mono"
                  />
                </div>
              </div>

              <div className="flex justify-end pt-2">
                <button
                  type="button"
                  onClick={() => setActiveStep('ADDRESS')}
                  className="px-4 py-2 rounded-xl bg-[#0a192f] hover:bg-[#153459] text-white font-bold transition-colors cursor-pointer"
                >
                  Proceed to Address &rarr;
                </button>
              </div>
            </div>
          )}

          {/* STEP 2: RESIDENTIAL ADDRESS */}
          {activeStep === 'ADDRESS' && (
            <div className="space-y-4 animate-in fade-in duration-150">
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3.5">
                <div className="space-y-1 sm:col-span-2">
                  <label className="font-bold text-slate-700">Address Line 1 *</label>
                  <input
                    type="text"
                    required
                    placeholder="Street Address, P.O. Box"
                    value={addressLine1}
                    onChange={e => setAddressLine1(e.target.value)}
                    className="w-full px-3 py-2 rounded-xl border border-slate-300 focus:outline-none focus:ring-2 focus:ring-[#c5a880]"
                  />
                </div>

                <div className="space-y-1 sm:col-span-2">
                  <label className="font-bold text-slate-700">Address Line 2 (Optional)</label>
                  <input
                    type="text"
                    placeholder="Apartment, suite, unit, building, floor"
                    value={addressLine2}
                    onChange={e => setAddressLine2(e.target.value)}
                    className="w-full px-3 py-2 rounded-xl border border-slate-300"
                  />
                </div>

                <div className="space-y-1">
                  <label className="font-bold text-slate-700">City *</label>
                  <input
                    type="text"
                    required
                    value={city}
                    onChange={e => setCity(e.target.value)}
                    className="w-full px-3 py-2 rounded-xl border border-slate-300"
                  />
                </div>

                <div className="space-y-1">
                  <label className="font-bold text-slate-700">State / Province / County *</label>
                  <input
                    type="text"
                    required
                    value={stateOrCounty}
                    onChange={e => setStateOrCounty(e.target.value)}
                    className="w-full px-3 py-2 rounded-xl border border-slate-300"
                  />
                </div>

                <div className="space-y-1">
                  <label className="font-bold text-slate-700">Postal / ZIP Code *</label>
                  <input
                    type="text"
                    required
                    value={postalCode}
                    onChange={e => setPostalCode(e.target.value)}
                    className="w-full px-3 py-2 rounded-xl border border-slate-300 font-mono"
                  />
                </div>

                <div className="space-y-1">
                  <label className="font-bold text-slate-700">Country *</label>
                  <input
                    type="text"
                    required
                    value={country}
                    onChange={e => setCountry(e.target.value)}
                    className="w-full px-3 py-2 rounded-xl border border-slate-300"
                  />
                </div>
              </div>

              <div className="flex justify-between pt-2">
                <button
                  type="button"
                  onClick={() => setActiveStep('IDENTITY')}
                  className="px-4 py-2 rounded-xl bg-slate-100 hover:bg-slate-200 text-slate-700 font-bold transition-colors cursor-pointer"
                >
                  &larr; Back
                </button>
                <button
                  type="button"
                  onClick={() => setActiveStep('BANKING')}
                  className="px-4 py-2 rounded-xl bg-[#0a192f] hover:bg-[#153459] text-white font-bold transition-colors cursor-pointer"
                >
                  Proceed to Banking Setup &rarr;
                </button>
              </div>
            </div>
          )}

          {/* STEP 3: BANKING SETUP & FINANCIAL PROFILE */}
          {activeStep === 'BANKING' && (
            <div className="space-y-4 animate-in fade-in duration-150">
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3.5">
                {/* Region Selector */}
                <div className="space-y-1">
                  <label className="font-bold text-slate-700">Operating Region &amp; Clearing Network</label>
                  <select
                    value={region}
                    onChange={e => handleRegionChange(e.target.value as BankRegion)}
                    className="w-full px-3 py-2 rounded-xl border border-slate-300 bg-white font-bold"
                  >
                    <option value="US">🇺🇸 United States (Fedwire / ACH Clearing • USD)</option>
                    <option value="UK">🇬🇧 United Kingdom (CHAPS / Faster Payments • GBP)</option>
                    <option value="EU">🇪🇺 European Union (SEPA / TARGET2 • EUR)</option>
                  </select>
                </div>

                {/* Account Type */}
                <div className="space-y-1">
                  <label className="font-bold text-slate-700">Account Type</label>
                  <select
                    value={accountType}
                    onChange={e => setAccountType(e.target.value as AccountType)}
                    className="w-full px-3 py-2 rounded-xl border border-slate-300 bg-white font-bold"
                  >
                    <option value="CHECKING_PREMIER">Premier Private Client Checking</option>
                    <option value="SAVINGS_HIGH_YIELD">Apex High-Yield Euro Reserve (5.15% APY)</option>
                    <option value="MULTI_CURRENCY_GLOBAL">Global Multi-Currency Reserve</option>
                    <option value="COMMERCIAL_OPERATING">Corporate Treasury Operating Account</option>
                  </select>
                </div>

                {/* Primary Currency */}
                <div className="space-y-1">
                  <label className="font-bold text-slate-700">Primary Currency</label>
                  <select
                    value={currency}
                    onChange={e => setCurrency(e.target.value as CurrencyCode)}
                    className="w-full px-3 py-2 rounded-xl border border-slate-300 bg-white font-bold"
                  >
                    <option value="USD">USD ($ - United States Dollar)</option>
                    <option value="GBP">GBP (£ - British Pound Sterling)</option>
                    <option value="EUR">EUR (€ - Euro Currency)</option>
                  </select>
                </div>

                {/* Initial Opening Deposit */}
                <div className="space-y-1">
                  <label className="font-bold text-slate-700">Initial Opening Deposit ({currency})</label>
                  <div className="relative">
                    <span className="absolute left-3 top-2.5 text-slate-400 font-bold">
                      {currency === 'EUR' ? '€' : currency === 'GBP' ? '£' : '$'}
                    </span>
                    <input
                      type="number"
                      step="any"
                      value={initialDepositDollars}
                      onChange={e => setInitialDepositDollars(e.target.value)}
                      className="w-full pl-8 pr-3 py-2 rounded-xl border border-slate-300 font-mono font-bold"
                      placeholder="25000"
                    />
                  </div>
                </div>

                {/* KYC Tier */}
                <div className="space-y-1">
                  <label className="font-bold text-slate-700">KYC Clearance Tier</label>
                  <select
                    value={kycTier}
                    onChange={e => setKycTier(e.target.value as any)}
                    className="w-full px-3 py-2 rounded-xl border border-slate-300 bg-white font-bold"
                  >
                    <option value="TIER_1_STANDARD">Tier 1 - Standard Verified Client</option>
                    <option value="TIER_2_VERIFIED_PREMIER">Tier 2 - Verified Premier Private Banking</option>
                    <option value="TIER_3_INSTITUTIONAL">Tier 3 - Institutional Sovereign / Family Office</option>
                  </select>
                </div>

                {/* Approval Status */}
                <div className="space-y-1">
                  <label className="font-bold text-slate-700">Initial Account Status</label>
                  <select
                    value={approvalStatus}
                    onChange={e => setApprovalStatus(e.target.value as UserApprovalStatus)}
                    className="w-full px-3 py-2 rounded-xl border border-slate-300 bg-white font-bold"
                  >
                    <option value="APPROVED">Immediate Active &amp; Approved (Live Banking)</option>
                    <option value="PENDING">Queue for Compliance Review</option>
                  </select>
                </div>

                {/* Employment Status */}
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

                {/* Employer / Entity */}
                <div className="space-y-1">
                  <label className="font-bold text-slate-700">Employer / Entity Name</label>
                  <input
                    type="text"
                    value={employerOrBusinessName}
                    onChange={e => setEmployerOrBusinessName(e.target.value)}
                    className="w-full px-3 py-2 rounded-xl border border-slate-300"
                  />
                </div>

                {/* Debit Card Toggle */}
                <div className="sm:col-span-2 p-3 rounded-xl bg-slate-50 border border-slate-200 flex items-center justify-between">
                  <div className="flex items-center gap-2.5">
                    <CreditCard className="w-4 h-4 text-[#c5a880]" />
                    <div>
                      <div className="font-bold text-slate-900">Issue Visa Signature Debit Card</div>
                      <div className="text-[11px] text-slate-500">Auto-provisions active contactless card with spend limits</div>
                    </div>
                  </div>
                  <input
                    type="checkbox"
                    checked={issueDebitCard}
                    onChange={e => setIssueDebitCard(e.target.checked)}
                    className="w-4 h-4 text-[#c5a880] rounded cursor-pointer"
                  />
                </div>
              </div>

              {/* Live Preview of Provisioning Structure */}
              <div className="p-3.5 rounded-xl bg-[#091b33] text-slate-200 space-y-2 border border-slate-800">
                <div className="flex items-center justify-between text-[11px]">
                  <span className="font-bold text-[#d4af37] flex items-center gap-1.5">
                    <Sparkles className="w-3.5 h-3.5" />
                    <span>Automatic Core Clearance Provisioning</span>
                  </span>
                  <span className="font-mono text-slate-400">{region} Node</span>
                </div>
                <div className="grid grid-cols-2 sm:grid-cols-4 gap-2 text-[10px] font-mono">
                  <div className="p-2 rounded-lg bg-slate-900/60">
                    <span className="text-slate-400 block">Routing / Sort</span>
                    <span className="font-bold text-white">
                      {region === 'UK' ? '40-12-88' : region === 'EU' ? 'FATLDEFF' : '021000089'}
                    </span>
                  </div>
                  <div className="p-2 rounded-lg bg-slate-900/60">
                    <span className="text-slate-400 block">SWIFT BIC</span>
                    <span className="font-bold text-white">
                      {region === 'UK' ? 'FATLGB22LON' : region === 'EU' ? 'FATLDEFF' : 'FATLUS33NYC'}
                    </span>
                  </div>
                  <div className="p-2 rounded-lg bg-slate-900/60">
                    <span className="text-slate-400 block">IBAN Format</span>
                    <span className="font-bold text-white">
                      {region === 'UK' ? 'GB29 FATL...' : region === 'EU' ? 'DE89 FATL...' : 'US Fedwire'}
                    </span>
                  </div>
                  <div className="p-2 rounded-lg bg-slate-900/60">
                    <span className="text-slate-400 block">Starting Ledger</span>
                    <span className="font-bold text-emerald-400">
                      {currency} {(parseFloat(initialDepositDollars) || 0).toLocaleString()}
                    </span>
                  </div>
                </div>
              </div>

              {/* Submit Buttons */}
              <div className="flex items-center justify-between pt-2 border-t border-slate-200">
                <button
                  type="button"
                  onClick={() => setActiveStep('ADDRESS')}
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
                    className="px-5 py-2 rounded-xl bg-emerald-600 hover:bg-emerald-700 text-white font-bold flex items-center gap-1.5 shadow-md transition-colors cursor-pointer"
                  >
                    {isSubmitting ? (
                      <RefreshCw className="w-3.5 h-3.5 animate-spin" />
                    ) : (
                      <CheckCircle2 className="w-3.5 h-3.5" />
                    )}
                    <span>Provision &amp; Create Customer</span>
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
