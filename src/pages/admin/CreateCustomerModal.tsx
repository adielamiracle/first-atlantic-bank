import React, { useState, useRef } from 'react';
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
  Shield,
  Upload,
  Camera,
  Eye,
  EyeOff,
  Image as ImageIcon,
  Trash2,
  Check,
  User
} from 'lucide-react';
import { BankRegion, CurrencyCode, AccountType, UserApprovalStatus } from '../../types';

interface CreateCustomerModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSuccess?: () => void;
}

const PASSPORT_PRESETS = [
  {
    label: 'Executive (M)',
    url: 'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=500&auto=format&fit=crop&q=80'
  },
  {
    label: 'Executive (F)',
    url: 'https://images.unsplash.com/photo-1573496359142-b8d87734a5a2?w=500&auto=format&fit=crop&q=80'
  },
  {
    label: 'Private Client',
    url: 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=500&auto=format&fit=crop&q=80'
  },
  {
    label: 'Sovereign Desk',
    url: 'https://images.unsplash.com/photo-1500648767791-00dcc994a43e?w=500&auto=format&fit=crop&q=80'
  }
];

export const CreateCustomerModal: React.FC<CreateCustomerModalProps> = ({
  isOpen,
  onClose,
  onSuccess
}) => {
  const { createCustomerByAdmin, showToast } = useBank();
  const fileInputRef = useRef<HTMLInputElement>(null);

  // Form State - Identity & Passport
  const [firstName, setFirstName] = useState('');
  const [lastName, setLastName] = useState('');
  const [email, setEmail] = useState('');
  const [dialCode, setDialCode] = useState('+1');
  const [phone, setPhone] = useState('');
  const [dateOfBirth, setDateOfBirth] = useState('1988-06-15');
  const [nationality, setNationality] = useState('United States');
  const [passportNumber, setPassportNumber] = useState('');
  const [passportPhoto, setPassportPhoto] = useState<string>(PASSPORT_PRESETS[0].url);
  const [ssnOrTaxId, setSsnOrTaxId] = useState('');
  const [isDragOver, setIsDragOver] = useState(false);

  // Form State - Credentials & Access
  const [username, setUsername] = useState('');
  const [password, setPassword] = useState('AtlanticSecure2026!');
  const [showPassword, setShowPassword] = useState(false);
  const [loginPin, setLoginPin] = useState('1234');

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
  const [activeStep, setActiveStep] = useState<'IDENTITY' | 'CREDENTIALS' | 'ADDRESS' | 'BANKING'>('IDENTITY');

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
    if (!username || username.startsWith(firstName.toLowerCase().slice(0, 1))) {
      setUsername(`${val.toLowerCase().slice(0, 1)}${lastName.toLowerCase()}`.replace(/[^a-z0-9]/g, ''));
    }
  };

  const handleLastNameChange = (val: string) => {
    setLastName(val);
    if (!username || username.startsWith(firstName.toLowerCase().slice(0, 1))) {
      setUsername(`${firstName.toLowerCase().slice(0, 1)}${val.toLowerCase()}`.replace(/[^a-z0-9]/g, ''));
    }
  };

  // Generate strong random password
  const generateStrongPassword = () => {
    const chars = 'ABCDEFGHJKLMNPQRSTUVWXYZabcdefghijkmnpqrstuvwxyz23456789!@#$%^&*';
    let generated = 'Atlantic#';
    for (let i = 0; i < 6; i++) {
      generated += chars.charAt(Math.floor(Math.random() * chars.length));
    }
    setPassword(generated);
    showToast('INFO', 'Generated Password', 'Created high-entropy executive credentials.');
  };

  // Handle image upload from file or drop
  const handleFileUpload = (file: File) => {
    if (!file.type.startsWith('image/')) {
      showToast('ERROR', 'Invalid File Type', 'Please upload a valid JPEG, PNG, or WebP photo.');
      return;
    }
    const reader = new FileReader();
    reader.onload = (e) => {
      if (e.target?.result) {
        setPassportPhoto(e.target.result as string);
        showToast('SUCCESS', 'Passport Photo Uploaded', 'Customer verification image captured.');
      }
    };
    reader.readAsDataURL(file);
  };

  const handleDrop = (e: React.DragEvent) => {
    e.preventDefault();
    setIsDragOver(false);
    if (e.dataTransfer.files && e.dataTransfer.files[0]) {
      handleFileUpload(e.dataTransfer.files[0]);
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!firstName.trim() || !lastName.trim() || !email.trim() || !username.trim()) {
      showToast('ERROR', 'Validation Error', 'Please complete the applicant first name, last name, email, and username.');
      setActiveStep('IDENTITY');
      return;
    }

    if (!password.trim()) {
      showToast('ERROR', 'Validation Error', 'Please set an initial access password for the customer.');
      setActiveStep('CREDENTIALS');
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
    <div className="fixed inset-0 z-50 flex items-center justify-center p-2 sm:p-4 bg-slate-950/80 backdrop-blur-xs animate-in fade-in duration-150">
      <div className="bg-white dark:bg-[#0f172a] rounded-2xl max-w-2xl w-full max-h-[94vh] overflow-hidden shadow-2xl border border-slate-200 dark:border-slate-800 text-slate-800 dark:text-slate-100 flex flex-col">
        {/* Header - Bank Blue */}
        <div className="p-3.5 sm:p-4 bg-[#004281] text-white flex items-center justify-between shrink-0">
          <div className="flex items-center gap-2.5">
            <div className="w-8 h-8 rounded-lg bg-white/10 text-white flex items-center justify-center font-bold shrink-0">
              <UserPlus className="w-4 h-4 text-white" />
            </div>
            <div>
              <div className="flex items-center gap-2">
                <h3 className="text-sm sm:text-base font-bold text-white tracking-tight">
                  New Customer Onboarding
                </h3>
                <span className="text-[9px] font-bold px-1.5 py-0.5 rounded bg-[#00A651] text-white font-mono uppercase">
                  Executive Desk
                </span>
              </div>
              <p className="text-[11px] text-blue-100/80 hidden sm:block">
                Provision profile, credentials, KYC passport picture, and live IBAN vault
              </p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="p-1 rounded-lg text-blue-200 hover:text-white hover:bg-white/10 transition-colors cursor-pointer"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Step Navigation Tabs - Mobile First & Responsive */}
        <div className="flex items-center border-b border-slate-200 dark:border-slate-800 bg-slate-50 dark:bg-slate-900/60 px-2 sm:px-4 gap-1 sm:gap-2 shrink-0 overflow-x-auto">
          <button
            type="button"
            onClick={() => setActiveStep('IDENTITY')}
            className={`py-2.5 px-2.5 sm:px-3 text-xs font-semibold border-b-2 transition-all flex items-center gap-1.5 whitespace-nowrap cursor-pointer ${
              activeStep === 'IDENTITY'
                ? 'border-[#004281] text-[#004281] dark:border-blue-400 dark:text-blue-400 font-bold'
                : 'border-transparent text-slate-500 hover:text-slate-800 dark:text-slate-400'
            }`}
          >
            <span className={`w-4 h-4 rounded-full flex items-center justify-center text-[10px] font-mono ${
              activeStep === 'IDENTITY' ? 'bg-[#004281] text-white dark:bg-blue-500' : 'bg-slate-200 dark:bg-slate-800 text-slate-700 dark:text-slate-300'
            }`}>1</span>
            <span>Identity &amp; Passport</span>
          </button>

          <button
            type="button"
            onClick={() => setActiveStep('CREDENTIALS')}
            className={`py-2.5 px-2.5 sm:px-3 text-xs font-semibold border-b-2 transition-all flex items-center gap-1.5 whitespace-nowrap cursor-pointer ${
              activeStep === 'CREDENTIALS'
                ? 'border-[#004281] text-[#004281] dark:border-blue-400 dark:text-blue-400 font-bold'
                : 'border-transparent text-slate-500 hover:text-slate-800 dark:text-slate-400'
            }`}
          >
            <span className={`w-4 h-4 rounded-full flex items-center justify-center text-[10px] font-mono ${
              activeStep === 'CREDENTIALS' ? 'bg-[#004281] text-white dark:bg-blue-500' : 'bg-slate-200 dark:bg-slate-800 text-slate-700 dark:text-slate-300'
            }`}>2</span>
            <span>Password &amp; Security</span>
          </button>

          <button
            type="button"
            onClick={() => setActiveStep('ADDRESS')}
            className={`py-2.5 px-2.5 sm:px-3 text-xs font-semibold border-b-2 transition-all flex items-center gap-1.5 whitespace-nowrap cursor-pointer ${
              activeStep === 'ADDRESS'
                ? 'border-[#004281] text-[#004281] dark:border-blue-400 dark:text-blue-400 font-bold'
                : 'border-transparent text-slate-500 hover:text-slate-800 dark:text-slate-400'
            }`}
          >
            <span className={`w-4 h-4 rounded-full flex items-center justify-center text-[10px] font-mono ${
              activeStep === 'ADDRESS' ? 'bg-[#004281] text-white dark:bg-blue-500' : 'bg-slate-200 dark:bg-slate-800 text-slate-700 dark:text-slate-300'
            }`}>3</span>
            <span>Address</span>
          </button>

          <button
            type="button"
            onClick={() => setActiveStep('BANKING')}
            className={`py-2.5 px-2.5 sm:px-3 text-xs font-semibold border-b-2 transition-all flex items-center gap-1.5 whitespace-nowrap cursor-pointer ${
              activeStep === 'BANKING'
                ? 'border-[#004281] text-[#004281] dark:border-blue-400 dark:text-blue-400 font-bold'
                : 'border-transparent text-slate-500 hover:text-slate-800 dark:text-slate-400'
            }`}
          >
            <span className={`w-4 h-4 rounded-full flex items-center justify-center text-[10px] font-mono ${
              activeStep === 'BANKING' ? 'bg-[#004281] text-white dark:bg-blue-500' : 'bg-slate-200 dark:bg-slate-800 text-slate-700 dark:text-slate-300'
            }`}>4</span>
            <span>Banking &amp; KYC</span>
          </button>
        </div>

        {/* Form Body */}
        <form onSubmit={handleSubmit} className="flex-1 overflow-y-auto p-3.5 sm:p-5 space-y-4 text-xs">
          {/* STEP 1: IDENTITY & PASSPORT PHOTO UPLOAD */}
          {activeStep === 'IDENTITY' && (
            <div className="space-y-4 animate-in fade-in duration-150">
              {/* PASSPORT PHOTO UPLOAD SPACE */}
              <div className="p-3.5 rounded-xl bg-slate-50 dark:bg-slate-900/50 border border-slate-200 dark:border-slate-800 space-y-2.5">
                <div className="flex items-center justify-between">
                  <label className="font-bold text-slate-800 dark:text-slate-200 flex items-center gap-1.5">
                    <Camera className="w-3.5 h-3.5 text-[#004281] dark:text-blue-400" />
                    <span>Customer Passport / Official ID Picture</span>
                    <span className="text-[10px] text-slate-400 font-normal">(KYC Document)</span>
                  </label>
                  {passportPhoto && (
                    <span className="text-[10px] font-semibold text-[#00A651] flex items-center gap-1">
                      <CheckCircle2 className="w-3 h-3" />
                      <span>Photo Attached</span>
                    </span>
                  )}
                </div>

                <div className="flex flex-col sm:flex-row gap-3 items-center">
                  {/* Live Photo Preview */}
                  <div className="relative group shrink-0">
                    <div className="w-20 h-24 rounded-lg overflow-hidden border-2 border-slate-300 dark:border-slate-700 bg-slate-200 dark:bg-slate-800 shadow-xs flex items-center justify-center">
                      {passportPhoto ? (
                        <img
                          src={passportPhoto}
                          alt="Passport Preview"
                          className="w-full h-full object-cover"
                          referrerPolicy="no-referrer"
                        />
                      ) : (
                        <User className="w-8 h-8 text-slate-400" />
                      )}
                    </div>
                    <div className="absolute -bottom-1.5 left-1/2 -translate-x-1/2 bg-[#004281] text-white text-[8px] font-bold px-1.5 py-0.5 rounded shadow-xs uppercase tracking-wider whitespace-nowrap">
                      PASSPORT
                    </div>
                  </div>

                  {/* Upload Drop Area */}
                  <div
                    onDragOver={(e) => {
                      e.preventDefault();
                      setIsDragOver(true);
                    }}
                    onDragLeave={() => setIsDragOver(false)}
                    onDrop={handleDrop}
                    className={`flex-1 w-full p-3 rounded-lg border-2 border-dashed transition-all flex flex-col items-center justify-center text-center cursor-pointer ${
                      isDragOver
                        ? 'border-[#004281] bg-blue-50/50 dark:bg-blue-950/30'
                        : 'border-slate-300 dark:border-slate-700 hover:border-slate-400 hover:bg-slate-100/50 dark:hover:bg-slate-800/40'
                    }`}
                    onClick={() => fileInputRef.current?.click()}
                  >
                    <input
                      ref={fileInputRef}
                      type="file"
                      accept="image/*"
                      className="hidden"
                      onChange={(e) => {
                        if (e.target.files && e.target.files[0]) {
                          handleFileUpload(e.target.files[0]);
                        }
                      }}
                    />
                    <Upload className="w-4 h-4 text-slate-500 mb-1" />
                    <p className="text-[11px] font-bold text-slate-700 dark:text-slate-200">
                      Click to upload passport picture or drag &amp; drop
                    </p>
                    <p className="text-[10px] text-slate-400">
                      PNG, JPG, WebP (Color official passport photo)
                    </p>
                  </div>
                </div>

                {/* Quick Preset Selection */}
                <div className="flex items-center gap-1.5 flex-wrap pt-1">
                  <span className="text-[10px] font-semibold text-slate-500">Quick Presets:</span>
                  {PASSPORT_PRESETS.map((preset, idx) => (
                    <button
                      key={idx}
                      type="button"
                      onClick={() => setPassportPhoto(preset.url)}
                      className={`text-[10px] font-semibold px-2 py-0.5 rounded-md border transition-all cursor-pointer ${
                        passportPhoto === preset.url
                          ? 'bg-[#004281] text-white border-[#004281]'
                          : 'bg-white dark:bg-slate-800 border-slate-200 dark:border-slate-700 text-slate-600 dark:text-slate-300 hover:bg-slate-100'
                      }`}
                    >
                      {preset.label}
                    </button>
                  ))}
                </div>
              </div>

              {/* Personal Details Grid */}
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                <div className="space-y-1">
                  <label className="font-bold text-slate-700 dark:text-slate-300">First Name *</label>
                  <input
                    type="text"
                    required
                    placeholder="e.g. Alistair"
                    value={firstName}
                    onChange={e => handleFirstNameChange(e.target.value)}
                    className="w-full px-3 py-2 rounded-lg border border-slate-300 dark:border-slate-700 bg-white dark:bg-slate-800 focus:outline-none focus:ring-2 focus:ring-[#004281]"
                  />
                </div>

                <div className="space-y-1">
                  <label className="font-bold text-slate-700 dark:text-slate-300">Last Name *</label>
                  <input
                    type="text"
                    required
                    placeholder="e.g. Vance"
                    value={lastName}
                    onChange={e => handleLastNameChange(e.target.value)}
                    className="w-full px-3 py-2 rounded-lg border border-slate-300 dark:border-slate-700 bg-white dark:bg-slate-800 focus:outline-none focus:ring-2 focus:ring-[#004281]"
                  />
                </div>

                <div className="space-y-1">
                  <label className="font-bold text-slate-700 dark:text-slate-300">Email Address *</label>
                  <input
                    type="email"
                    required
                    placeholder="e.g. a.vance@atlantic-wealth.com"
                    value={email}
                    onChange={e => setEmail(e.target.value)}
                    className="w-full px-3 py-2 rounded-lg border border-slate-300 dark:border-slate-700 bg-white dark:bg-slate-800 focus:outline-none focus:ring-2 focus:ring-[#004281]"
                  />
                </div>

                <div className="space-y-1">
                  <label className="font-bold text-slate-700 dark:text-slate-300">Phone Number</label>
                  <div className="flex gap-1.5">
                    <input
                      type="text"
                      value={dialCode}
                      onChange={e => setDialCode(e.target.value)}
                      className="w-16 px-2 py-2 rounded-lg border border-slate-300 dark:border-slate-700 bg-white dark:bg-slate-800 text-center font-mono"
                      placeholder="+1"
                    />
                    <input
                      type="text"
                      placeholder="(555) 019-2830"
                      value={phone}
                      onChange={e => setPhone(e.target.value)}
                      className="flex-1 px-3 py-2 rounded-lg border border-slate-300 dark:border-slate-700 bg-white dark:bg-slate-800"
                    />
                  </div>
                </div>

                <div className="space-y-1">
                  <label className="font-bold text-slate-700 dark:text-slate-300">Date of Birth</label>
                  <input
                    type="date"
                    value={dateOfBirth}
                    onChange={e => setDateOfBirth(e.target.value)}
                    className="w-full px-3 py-2 rounded-lg border border-slate-300 dark:border-slate-700 bg-white dark:bg-slate-800"
                  />
                </div>

                <div className="space-y-1">
                  <label className="font-bold text-slate-700 dark:text-slate-300">Nationality</label>
                  <input
                    type="text"
                    value={nationality}
                    onChange={e => setNationality(e.target.value)}
                    className="w-full px-3 py-2 rounded-lg border border-slate-300 dark:border-slate-700 bg-white dark:bg-slate-800"
                  />
                </div>

                <div className="space-y-1">
                  <label className="font-bold text-slate-700 dark:text-slate-300">Passport / National ID #</label>
                  <input
                    type="text"
                    placeholder="e.g. US84920194A"
                    value={passportNumber}
                    onChange={e => setPassportNumber(e.target.value)}
                    className="w-full px-3 py-2 rounded-lg border border-slate-300 dark:border-slate-700 bg-white dark:bg-slate-800 font-mono"
                  />
                </div>

                <div className="space-y-1">
                  <label className="font-bold text-slate-700 dark:text-slate-300">Tax ID / SSN / National Insurance</label>
                  <input
                    type="text"
                    placeholder="e.g. 987-65-4321"
                    value={ssnOrTaxId}
                    onChange={e => setSsnOrTaxId(e.target.value)}
                    className="w-full px-3 py-2 rounded-lg border border-slate-300 dark:border-slate-700 bg-white dark:bg-slate-800 font-mono"
                  />
                </div>
              </div>

              <div className="flex justify-end pt-2">
                <button
                  type="button"
                  onClick={() => setActiveStep('CREDENTIALS')}
                  className="px-4 py-2 rounded-lg bg-[#004281] hover:bg-[#003366] text-white font-bold transition-colors cursor-pointer flex items-center gap-1.5"
                >
                  <span>Next: Password &amp; Security</span>
                  <span>&rarr;</span>
                </button>
              </div>
            </div>
          )}

          {/* STEP 2: PASSWORD & SECURITY CREDENTIALS */}
          {activeStep === 'CREDENTIALS' && (
            <div className="space-y-4 animate-in fade-in duration-150">
              <div className="p-3.5 rounded-xl bg-blue-50/60 dark:bg-blue-950/20 border border-blue-100 dark:border-blue-900/50 space-y-1">
                <div className="flex items-center gap-2 text-xs font-bold text-[#004281] dark:text-blue-300">
                  <ShieldCheck className="w-4 h-4" />
                  <span>Customer Access Credentials &amp; 4-Digit Security PIN</span>
                </div>
                <p className="text-[11px] text-slate-600 dark:text-slate-400">
                  Set the login username, portal password, and authorization PIN for this client.
                </p>
              </div>

              <div className="space-y-3">
                {/* Username */}
                <div className="space-y-1">
                  <label className="font-bold text-slate-700 dark:text-slate-300">Client Portal Username *</label>
                  <input
                    type="text"
                    required
                    placeholder="e.g. avance"
                    value={username}
                    onChange={e => setUsername(e.target.value)}
                    className="w-full px-3 py-2 rounded-lg border border-slate-300 dark:border-slate-700 bg-white dark:bg-slate-800 font-mono focus:outline-none focus:ring-2 focus:ring-[#004281]"
                  />
                </div>

                {/* PASSWORD SPACE */}
                <div className="p-3.5 rounded-xl bg-white dark:bg-slate-800/80 border border-slate-200 dark:border-slate-700 space-y-2.5">
                  <div className="flex items-center justify-between">
                    <label className="font-bold text-slate-800 dark:text-slate-200 flex items-center gap-1.5">
                      <Lock className="w-3.5 h-3.5 text-[#004281] dark:text-blue-400" />
                      <span>Initial Login Password *</span>
                    </label>
                    <button
                      type="button"
                      onClick={generateStrongPassword}
                      className="text-[11px] font-bold text-[#004281] dark:text-blue-400 hover:underline flex items-center gap-1 cursor-pointer"
                    >
                      <Sparkles className="w-3 h-3 text-[#00A651]" />
                      <span>Generate Strong Password</span>
                    </button>
                  </div>

                  <div className="relative">
                    <input
                      type={showPassword ? 'text' : 'password'}
                      required
                      value={password}
                      onChange={e => setPassword(e.target.value)}
                      placeholder="Enter customer login password"
                      className="w-full pl-3 pr-10 py-2.5 rounded-lg border border-slate-300 dark:border-slate-600 bg-white dark:bg-slate-900 font-mono text-xs focus:outline-none focus:ring-2 focus:ring-[#004281]"
                    />
                    <button
                      type="button"
                      onClick={() => setShowPassword(!showPassword)}
                      className="absolute right-3 top-2.5 text-slate-400 hover:text-slate-600 dark:hover:text-slate-200 cursor-pointer"
                      title={showPassword ? 'Hide password' : 'Show password'}
                    >
                      {showPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                    </button>
                  </div>

                  <div className="flex items-center gap-2 text-[10px] text-slate-500 font-mono">
                    <span className="w-2 h-2 rounded-full bg-[#00A651]" />
                    <span>Standard policy: Minimum 8 characters with letters, numbers, and symbols</span>
                  </div>
                </div>

                {/* 4-Digit Security PIN */}
                <div className="p-3.5 rounded-xl bg-white dark:bg-slate-800/80 border border-slate-200 dark:border-slate-700 space-y-2">
                  <div className="flex items-center justify-between">
                    <label className="font-bold text-slate-800 dark:text-slate-200 flex items-center gap-1.5">
                      <Key className="w-3.5 h-3.5 text-[#00A651]" />
                      <span>4-Digit Authorization PIN</span>
                    </label>
                    <span className="text-[10px] text-slate-400">Used for wire transfers &amp; mobile checks</span>
                  </div>

                  <input
                    type="text"
                    maxLength={4}
                    value={loginPin}
                    onChange={e => setLoginPin(e.target.value.replace(/\D/g, ''))}
                    className="w-32 px-3 py-2 rounded-lg border border-slate-300 dark:border-slate-600 bg-white dark:bg-slate-900 font-mono text-center tracking-widest text-sm font-bold"
                    placeholder="1234"
                  />
                </div>
              </div>

              <div className="flex justify-between pt-2">
                <button
                  type="button"
                  onClick={() => setActiveStep('IDENTITY')}
                  className="px-4 py-2 rounded-lg bg-slate-100 dark:bg-slate-800 hover:bg-slate-200 text-slate-700 dark:text-slate-300 font-bold transition-colors cursor-pointer"
                >
                  &larr; Back
                </button>
                <button
                  type="button"
                  onClick={() => setActiveStep('ADDRESS')}
                  className="px-4 py-2 rounded-lg bg-[#004281] hover:bg-[#003366] text-white font-bold transition-colors cursor-pointer flex items-center gap-1.5"
                >
                  <span>Next: Residential Address</span>
                  <span>&rarr;</span>
                </button>
              </div>
            </div>
          )}

          {/* STEP 3: RESIDENTIAL ADDRESS */}
          {activeStep === 'ADDRESS' && (
            <div className="space-y-4 animate-in fade-in duration-150">
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                <div className="space-y-1 sm:col-span-2">
                  <label className="font-bold text-slate-700 dark:text-slate-300">Address Line 1 *</label>
                  <input
                    type="text"
                    required
                    placeholder="Street Address, P.O. Box"
                    value={addressLine1}
                    onChange={e => setAddressLine1(e.target.value)}
                    className="w-full px-3 py-2 rounded-lg border border-slate-300 dark:border-slate-700 bg-white dark:bg-slate-800 focus:outline-none focus:ring-2 focus:ring-[#004281]"
                  />
                </div>

                <div className="space-y-1 sm:col-span-2">
                  <label className="font-bold text-slate-700 dark:text-slate-300">Address Line 2 (Optional)</label>
                  <input
                    type="text"
                    placeholder="Apartment, suite, unit, building, floor"
                    value={addressLine2}
                    onChange={e => setAddressLine2(e.target.value)}
                    className="w-full px-3 py-2 rounded-lg border border-slate-300 dark:border-slate-700 bg-white dark:bg-slate-800"
                  />
                </div>

                <div className="space-y-1">
                  <label className="font-bold text-slate-700 dark:text-slate-300">City *</label>
                  <input
                    type="text"
                    required
                    value={city}
                    onChange={e => setCity(e.target.value)}
                    className="w-full px-3 py-2 rounded-lg border border-slate-300 dark:border-slate-700 bg-white dark:bg-slate-800"
                  />
                </div>

                <div className="space-y-1">
                  <label className="font-bold text-slate-700 dark:text-slate-300">State / Province / County *</label>
                  <input
                    type="text"
                    required
                    value={stateOrCounty}
                    onChange={e => setStateOrCounty(e.target.value)}
                    className="w-full px-3 py-2 rounded-lg border border-slate-300 dark:border-slate-700 bg-white dark:bg-slate-800"
                  />
                </div>

                <div className="space-y-1">
                  <label className="font-bold text-slate-700 dark:text-slate-300">Postal / ZIP Code *</label>
                  <input
                    type="text"
                    required
                    value={postalCode}
                    onChange={e => setPostalCode(e.target.value)}
                    className="w-full px-3 py-2 rounded-lg border border-slate-300 dark:border-slate-700 bg-white dark:bg-slate-800 font-mono"
                  />
                </div>

                <div className="space-y-1">
                  <label className="font-bold text-slate-700 dark:text-slate-300">Country *</label>
                  <input
                    type="text"
                    required
                    value={country}
                    onChange={e => setCountry(e.target.value)}
                    className="w-full px-3 py-2 rounded-lg border border-slate-300 dark:border-slate-700 bg-white dark:bg-slate-800"
                  />
                </div>
              </div>

              <div className="flex justify-between pt-2">
                <button
                  type="button"
                  onClick={() => setActiveStep('CREDENTIALS')}
                  className="px-4 py-2 rounded-lg bg-slate-100 dark:bg-slate-800 hover:bg-slate-200 text-slate-700 dark:text-slate-300 font-bold transition-colors cursor-pointer"
                >
                  &larr; Back
                </button>
                <button
                  type="button"
                  onClick={() => setActiveStep('BANKING')}
                  className="px-4 py-2 rounded-lg bg-[#004281] hover:bg-[#003366] text-white font-bold transition-colors cursor-pointer flex items-center gap-1.5"
                >
                  <span>Next: Banking Setup</span>
                  <span>&rarr;</span>
                </button>
              </div>
            </div>
          )}

          {/* STEP 4: BANKING SETUP & FINANCIAL PROFILE */}
          {activeStep === 'BANKING' && (
            <div className="space-y-4 animate-in fade-in duration-150">
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                {/* Region Selector */}
                <div className="space-y-1">
                  <label className="font-bold text-slate-700 dark:text-slate-300">Clearing Network &amp; Region</label>
                  <select
                    value={region}
                    onChange={e => handleRegionChange(e.target.value as BankRegion)}
                    className="w-full px-3 py-2 rounded-lg border border-slate-300 dark:border-slate-700 bg-white dark:bg-slate-800 font-bold"
                  >
                    <option value="US">🇺🇸 United States (Fedwire / ACH Clearing • USD)</option>
                    <option value="UK">🇬🇧 United Kingdom (CHAPS / Faster Payments • GBP)</option>
                    <option value="EU">🇪🇺 European Union (SEPA / TARGET2 • EUR)</option>
                  </select>
                </div>

                {/* Account Type */}
                <div className="space-y-1">
                  <label className="font-bold text-slate-700 dark:text-slate-300">Vault Account Type</label>
                  <select
                    value={accountType}
                    onChange={e => setAccountType(e.target.value as AccountType)}
                    className="w-full px-3 py-2 rounded-lg border border-slate-300 dark:border-slate-700 bg-white dark:bg-slate-800 font-bold"
                  >
                    <option value="CHECKING_PREMIER">Premier Private Client Checking</option>
                    <option value="SAVINGS_HIGH_YIELD">Apex High-Yield Reserve (5.15% APY)</option>
                    <option value="MULTI_CURRENCY_GLOBAL">Global Multi-Currency Reserve</option>
                    <option value="COMMERCIAL_OPERATING">Corporate Treasury Operating Account</option>
                  </select>
                </div>

                {/* Primary Currency */}
                <div className="space-y-1">
                  <label className="font-bold text-slate-700 dark:text-slate-300">Primary Currency</label>
                  <select
                    value={currency}
                    onChange={e => setCurrency(e.target.value as CurrencyCode)}
                    className="w-full px-3 py-2 rounded-lg border border-slate-300 dark:border-slate-700 bg-white dark:bg-slate-800 font-bold"
                  >
                    <option value="USD">USD ($ - United States Dollar)</option>
                    <option value="GBP">GBP (£ - British Pound Sterling)</option>
                    <option value="EUR">EUR (€ - Euro Currency)</option>
                  </select>
                </div>

                {/* Initial Opening Deposit */}
                <div className="space-y-1">
                  <label className="font-bold text-slate-700 dark:text-slate-300">Initial Opening Balance ({currency})</label>
                  <div className="relative">
                    <span className="absolute left-3 top-2 text-slate-400 font-bold">
                      {currency === 'EUR' ? '€' : currency === 'GBP' ? '£' : '$'}
                    </span>
                    <input
                      type="number"
                      step="0.01"
                      min="0"
                      value={initialDepositDollars}
                      onChange={e => setInitialDepositDollars(e.target.value)}
                      className="w-full pl-7 pr-3 py-2 rounded-lg border border-slate-300 dark:border-slate-700 bg-white dark:bg-slate-800 font-mono font-bold"
                      placeholder="25000"
                    />
                  </div>
                  {Number(initialDepositDollars) > 0 && (
                    <span className="text-xs text-emerald-600 dark:text-emerald-400 font-mono font-semibold block mt-1">
                      Formatted: {currency === 'EUR' ? '€' : currency === 'GBP' ? '£' : '$'}{Number(initialDepositDollars).toLocaleString('en-US', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}
                    </span>
                  )}
                </div>

                {/* KYC Tier */}
                <div className="space-y-1">
                  <label className="font-bold text-slate-700 dark:text-slate-300">KYC Clearance Tier</label>
                  <select
                    value={kycTier}
                    onChange={e => setKycTier(e.target.value as any)}
                    className="w-full px-3 py-2 rounded-lg border border-slate-300 dark:border-slate-700 bg-white dark:bg-slate-800 font-bold"
                  >
                    <option value="TIER_1_STANDARD">Tier 1 - Standard Verified Client</option>
                    <option value="TIER_2_VERIFIED_PREMIER">Tier 2 - Verified Premier Private Banking</option>
                    <option value="TIER_3_INSTITUTIONAL">Tier 3 - Institutional Sovereign / Family Office</option>
                  </select>
                </div>

                {/* Approval Status */}
                <div className="space-y-1">
                  <label className="font-bold text-slate-700 dark:text-slate-300">Initial Approval State</label>
                  <select
                    value={approvalStatus}
                    onChange={e => setApprovalStatus(e.target.value as UserApprovalStatus)}
                    className="w-full px-3 py-2 rounded-lg border border-slate-300 dark:border-slate-700 bg-white dark:bg-slate-800 font-bold"
                  >
                    <option value="APPROVED">Immediate Active &amp; Approved (Live Banking)</option>
                    <option value="PENDING">Queue for Compliance Review</option>
                  </select>
                </div>

                {/* Employment Status */}
                <div className="space-y-1">
                  <label className="font-bold text-slate-700 dark:text-slate-300">Employment Status</label>
                  <select
                    value={employmentStatus}
                    onChange={e => setEmploymentStatus(e.target.value)}
                    className="w-full px-3 py-2 rounded-lg border border-slate-300 dark:border-slate-700 bg-white dark:bg-slate-800"
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
                  <label className="font-bold text-slate-700 dark:text-slate-300">Employer / Entity Name</label>
                  <input
                    type="text"
                    value={employerOrBusinessName}
                    onChange={e => setEmployerOrBusinessName(e.target.value)}
                    className="w-full px-3 py-2 rounded-lg border border-slate-300 dark:border-slate-700 bg-white dark:bg-slate-800"
                  />
                </div>

                {/* Debit Card Toggle */}
                <div className="sm:col-span-2 p-3 rounded-lg bg-slate-50 dark:bg-slate-900/50 border border-slate-200 dark:border-slate-800 flex items-center justify-between">
                  <div className="flex items-center gap-2.5">
                    <CreditCard className="w-4 h-4 text-[#004281] dark:text-blue-400" />
                    <div>
                      <div className="font-bold text-slate-900 dark:text-slate-100">Issue Visa Signature Debit Card</div>
                      <div className="text-[10px] text-slate-500">Auto-provisions active contactless card with spend limits</div>
                    </div>
                  </div>
                  <input
                    type="checkbox"
                    checked={issueDebitCard}
                    onChange={e => setIssueDebitCard(e.target.checked)}
                    className="w-4 h-4 text-[#004281] rounded cursor-pointer"
                  />
                </div>
              </div>

              {/* Live Preview of Provisioning Structure */}
              <div className="p-3 rounded-xl bg-[#004281] text-white space-y-2">
                <div className="flex items-center justify-between text-[11px]">
                  <span className="font-bold flex items-center gap-1.5">
                    <Sparkles className="w-3.5 h-3.5 text-[#00A651]" />
                    <span>Clearance Node Summary</span>
                  </span>
                  <span className="font-mono text-blue-200">{region} Gateway</span>
                </div>
                <div className="grid grid-cols-2 sm:grid-cols-4 gap-2 text-[10px] font-mono">
                  <div className="p-1.5 rounded bg-black/20">
                    <span className="text-blue-200 block text-[9px]">Routing / Sort</span>
                    <span className="font-bold text-white">
                      {region === 'UK' ? '40-12-88' : region === 'EU' ? 'FATLDEFF' : '021000089'}
                    </span>
                  </div>
                  <div className="p-1.5 rounded bg-black/20">
                    <span className="text-blue-200 block text-[9px]">SWIFT BIC</span>
                    <span className="font-bold text-white">
                      {region === 'UK' ? 'FATLGB22' : region === 'EU' ? 'FATLDEFF' : 'FATLUS33'}
                    </span>
                  </div>
                  <div className="p-1.5 rounded bg-black/20">
                    <span className="text-blue-200 block text-[9px]">IBAN Format</span>
                    <span className="font-bold text-white">
                      {region === 'UK' ? 'GB29 FATL...' : region === 'EU' ? 'DE89 FATL...' : 'US Fedwire'}
                    </span>
                  </div>
                  <div className="p-1.5 rounded bg-black/20">
                    <span className="text-blue-200 block text-[9px]">Starting Ledger</span>
                    <span className="font-bold text-[#00A651]">
                      {currency} {(parseFloat(initialDepositDollars) || 0).toLocaleString()}
                    </span>
                  </div>
                </div>
              </div>

              {/* Submit Buttons */}
              <div className="flex items-center justify-between pt-2 border-t border-slate-200 dark:border-slate-800">
                <button
                  type="button"
                  onClick={() => setActiveStep('ADDRESS')}
                  className="px-4 py-2 rounded-lg bg-slate-100 dark:bg-slate-800 hover:bg-slate-200 text-slate-700 dark:text-slate-300 font-bold transition-colors cursor-pointer"
                >
                  &larr; Back
                </button>

                <div className="flex items-center gap-2">
                  <button
                    type="button"
                    onClick={onClose}
                    className="px-4 py-2 rounded-lg border border-slate-300 dark:border-slate-700 text-slate-700 dark:text-slate-300 font-bold hover:bg-slate-100 dark:hover:bg-slate-800 transition-colors cursor-pointer"
                  >
                    Cancel
                  </button>
                  <button
                    type="submit"
                    disabled={isSubmitting}
                    className="px-5 py-2 rounded-lg bg-[#00A651] hover:bg-[#008f45] text-white font-bold flex items-center gap-1.5 shadow-xs transition-colors cursor-pointer"
                  >
                    {isSubmitting ? (
                      <RefreshCw className="w-3.5 h-3.5 animate-spin" />
                    ) : (
                      <CheckCircle2 className="w-3.5 h-3.5" />
                    )}
                    <span>Provision Customer</span>
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

