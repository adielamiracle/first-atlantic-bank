import React, { useState, useRef, useEffect } from 'react';
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
  User,
  Download,
  ExternalLink,
  ArrowRight,
  Printer,
  CheckCheck
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
  const { createCustomerByAdmin, showToast, switchDemoUser, setCurrentView } = useBank();
  const fileInputRef = useRef<HTMLInputElement>(null);

  // Form State - Identity & Passport (Step 1)
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

  // Form State - Credentials & Access (Step 2)
  const [username, setUsername] = useState('');
  const [password, setPassword] = useState('AtlanticSecure2026!');
  const [showPassword, setShowPassword] = useState(false);
  const [loginPin, setLoginPin] = useState('1234');

  // Form State - Address (Step 3)
  const [addressLine1, setAddressLine1] = useState('100 Atlantic Plaza');
  const [addressLine2, setAddressLine2] = useState('Suite 4200');
  const [city, setCity] = useState('New York');
  const [stateOrCounty, setStateOrCounty] = useState('NY');
  const [postalCode, setPostalCode] = useState('10001');
  const [country, setCountry] = useState('United States');

  // Form State - Banking & Financial Profile (Step 4)
  const [region, setRegion] = useState<BankRegion>('US');
  const [accountType, setAccountType] = useState<AccountType>('CHECKING_PREMIER');
  const [currency, setCurrency] = useState<CurrencyCode>('USD');
  const [initialDepositDollars, setInitialDepositDollars] = useState('0');
  const [issueDebitCard, setIssueDebitCard] = useState(true);
  const [kycTier, setKycTier] = useState<'TIER_1_STANDARD' | 'TIER_2_VERIFIED_PREMIER' | 'TIER_3_INSTITUTIONAL'>('TIER_2_VERIFIED_PREMIER');
  const [approvalStatus, setApprovalStatus] = useState<UserApprovalStatus>('APPROVED');

  // Financial KYC
  const [employmentStatus, setEmploymentStatus] = useState('EXECUTIVE');
  const [employerOrBusinessName, setEmployerOrBusinessName] = useState('Atlantic Holdings Corp');
  const [sourceOfWealth, setSourceOfWealth] = useState('INVESTMENTS');
  const [annualIncomeRange, setAnnualIncomeRange] = useState('$250,000 - $500,000');

  // Modal Step & Execution State
  const [activeStep, setActiveStep] = useState<'IDENTITY' | 'CREDENTIALS' | 'ADDRESS' | 'BANKING'>('IDENTITY');
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [highlightedField, setHighlightedField] = useState<string | null>(null);

  // Success Modal State & 3s Redirect Timer
  const [createdSuccessData, setCreatedSuccessData] = useState<{
    user: any;
    account: any;
    card: any;
    application: any;
    payload: any;
  } | null>(null);
  const [redirectCountdown, setRedirectCountdown] = useState(3);

  // Auto-fill username when typing names
  const handleFirstNameChange = (val: string) => {
    setFirstName(val);
    if (!username || username.startsWith('client_') || username === '') {
      const generated = `${val.toLowerCase().slice(0, 1)}${lastName.toLowerCase()}`.replace(/[^a-z0-9]/g, '');
      if (generated) setUsername(generated);
    }
  };

  const handleLastNameChange = (val: string) => {
    setLastName(val);
    if (!username || username.startsWith('client_') || username === '') {
      const generated = `${firstName.toLowerCase().slice(0, 1)}${val.toLowerCase()}`.replace(/[^a-z0-9]/g, '');
      if (generated) setUsername(generated);
    }
  };

  // Adjust region defaults
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

  // Auto-fill sample client for quick testing
  const autoFillSampleClient = () => {
    const randomSuffix = Math.floor(100 + Math.random() * 900);
    const sampleFirst = 'Marcus';
    const sampleLast = `Rothschild${randomSuffix}`;
    setFirstName(sampleFirst);
    setLastName(sampleLast);
    setEmail(`m.rothschild${randomSuffix}@atlantic-client.com`);
    setUsername(`mrothschild${randomSuffix}`);
    setPassword('AtlanticSecure2026!');
    setLoginPin('1234');
    setPhone('+1 (555) 392-1084');
    setDateOfBirth('1988-06-15');
    setNationality(region === 'UK' ? 'British' : region === 'EU' ? 'German' : 'American');
    setPassportNumber(`US${Date.now().toString().slice(-8)}`);
    setSsnOrTaxId(`987-65-${Date.now().toString().slice(-4)}`);
    setInitialDepositDollars('25000');
    setEmployerOrBusinessName('Atlantic Holdings Corp');
    setKycTier('TIER_2_VERIFIED_PREMIER');
    setApprovalStatus('APPROVED');
    
    if (region === 'UK') {
      setAddressLine1('45 Berkeley Square');
      setCity('London');
      setStateOrCounty('Greater London');
      setPostalCode('W1J 5AS');
      setCountry('United Kingdom');
    } else if (region === 'EU') {
      setAddressLine1('Taunusanlage 8');
      setCity('Frankfurt');
      setStateOrCounty('Hesse');
      setPostalCode('60311');
      setCountry('Germany');
    } else {
      setAddressLine1('100 Atlantic Plaza');
      setCity('New York');
      setStateOrCounty('NY');
      setPostalCode('10001');
      setCountry('United States');
    }
    
    showToast('INFO', 'Sample Profile Loaded', 'Pre-filled executive sample client for quick testing. You can now tap Provision Customer directly.');
  };

  // Generate strong random password
  const generateStrongPassword = () => {
    const chars = 'ABCDEFGHJKLMNPQRSTUVWXYZabcdefghijkmnpqrstuvwxyz23456789!@#$%&*';
    let res = 'Atl!';
    for (let i = 0; i < 10; i++) {
      res += chars.charAt(Math.floor(Math.random() * chars.length));
    }
    setPassword(res);
    setShowPassword(true);
    showToast('SUCCESS', 'Generated Password', 'Strong cryptographic password set for customer.');
  };

  // Image Upload Handling
  const handleFileUpload = (file: File) => {
    if (!file.type.startsWith('image/')) {
      showToast('ERROR', 'Invalid File', 'Please upload a PNG, JPG, or WebP passport picture.');
      return;
    }
    const reader = new FileReader();
    reader.onload = () => {
      if (typeof reader.result === 'string') {
        setPassportPhoto(reader.result);
        showToast('SUCCESS', 'Passport Uploaded', 'Official photo attached to applicant KYC record.');
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

  // Comprehensive Step Validation before Submission
  const validateStep1 = (): boolean => {
    if (!firstName.trim()) {
      setActiveStep('IDENTITY');
      setHighlightedField('firstName');
      showToast('ERROR', 'Step 1 Incomplete', 'Please enter the applicant’s legal first name.');
      return false;
    }
    if (!lastName.trim()) {
      setActiveStep('IDENTITY');
      setHighlightedField('lastName');
      showToast('ERROR', 'Step 1 Incomplete', 'Please enter the applicant’s legal last name.');
      return false;
    }
    const cleanMail = email.trim().toLowerCase();
    if (!cleanMail || !cleanMail.includes('@')) {
      setActiveStep('IDENTITY');
      setHighlightedField('email');
      showToast('ERROR', 'Step 1 Incomplete', 'Please enter a valid email address.');
      return false;
    }
    return true;
  };

  const validateStep2 = (): boolean => {
    // If username is empty, auto-populate from name
    if (!username.trim()) {
      const generated = `${firstName.toLowerCase().slice(0, 1)}${lastName.toLowerCase()}`.replace(/[^a-z0-9]/g, '') || `client${Date.now().toString().slice(-4)}`;
      setUsername(generated);
    }
    // If password is empty, set secure default
    if (!password.trim()) {
      setPassword('AtlanticSecure2026!');
    }
    // If PIN is empty or not 4 digits, default to 1234
    if (!loginPin.trim() || loginPin.trim().length !== 4) {
      setLoginPin('1234');
    }
    return true;
  };

  const validateStep3 = (): boolean => {
    // Fill region defaults if empty
    if (!addressLine1.trim()) {
      setAddressLine1(region === 'UK' ? '45 Berkeley Square' : region === 'EU' ? 'Taunusanlage 8' : '100 Atlantic Plaza');
    }
    if (!city.trim()) {
      setCity(region === 'UK' ? 'London' : region === 'EU' ? 'Frankfurt' : 'New York');
    }
    if (!stateOrCounty.trim()) {
      setStateOrCounty(region === 'UK' ? 'Greater London' : region === 'EU' ? 'Hesse' : 'NY');
    }
    if (!postalCode.trim()) {
      setPostalCode(region === 'UK' ? 'W1J 5AS' : region === 'EU' ? '60311' : '10001');
    }
    if (!country.trim()) {
      setCountry(region === 'UK' ? 'United Kingdom' : region === 'EU' ? 'Germany' : 'United States');
    }
    return true;
  };

  const validateStep4 = (): boolean => {
    const parsed = parseFloat(String(initialDepositDollars).replace(/[^0-9.]/g, ''));
    if (isNaN(parsed) || parsed < 0) {
      setInitialDepositDollars('0');
    }
    return true;
  };

  const validateAllSteps = (): boolean => {
    if (!validateStep1()) return false;
    if (!validateStep2()) return false;
    if (!validateStep3()) return false;
    if (!validateStep4()) return false;
    setHighlightedField(null);
    return true;
  };

  const handleNextStep = (currentStep: 'IDENTITY' | 'CREDENTIALS' | 'ADDRESS') => {
    if (currentStep === 'IDENTITY') {
      if (validateStep1()) setActiveStep('CREDENTIALS');
    } else if (currentStep === 'CREDENTIALS') {
      if (validateStep2()) setActiveStep('ADDRESS');
    } else if (currentStep === 'ADDRESS') {
      if (validateStep3()) setActiveStep('BANKING');
    }
  };

  // Main Provision Customer Action
  const handleSubmit = async (e?: React.FormEvent) => {
    if (e) e.preventDefault();

    // Re-validate all steps 1, 2, 3 before submission
    if (!validateAllSteps()) {
      return;
    }

    const effectiveUsername = username.trim() || `${firstName.toLowerCase().slice(0, 1)}${lastName.toLowerCase()}`.replace(/[^a-z0-9]/g, '') || `client${Date.now().toString().slice(-4)}`;
    const effectivePassword = password.trim() || 'AtlanticSecure2026!';
    const depositParsed = parseFloat(String(initialDepositDollars).replace(/[^0-9.]/g, '')) || 0;
    const depositMinor = Math.round(depositParsed * 100);

    const payload = {
      firstName: firstName.trim(),
      lastName: lastName.trim(),
      email: email.trim().toLowerCase(),
      username: effectiveUsername,
      password: effectivePassword,
      loginPin: loginPin.trim() || '1234',
      phone: phone.trim() || `${dialCode} 555-0199`,
      dialCode,
      dateOfBirth: dateOfBirth || '1988-06-15',
      nationality: nationality || (region === 'UK' ? 'British' : region === 'EU' ? 'German' : 'American'),
      passportNumber: passportNumber.trim() || `PASSPORT-${Date.now().toString().slice(-6)}`,
      passportPhoto: passportPhoto || PASSPORT_PRESETS[0].url,
      ssnOrTaxId: ssnOrTaxId.trim() || (region === 'US' ? '•••-••-8899' : region === 'UK' ? 'QQ 12 34 56 A' : 'DE-849201948'),
      region,
      address: {
        line1: addressLine1.trim() || (region === 'UK' ? '45 Berkeley Square' : region === 'EU' ? 'Taunusanlage 8' : '100 Atlantic Plaza'),
        line2: addressLine2.trim(),
        city: city.trim() || (region === 'UK' ? 'London' : region === 'EU' ? 'Frankfurt' : 'New York'),
        stateOrCounty: stateOrCounty.trim() || (region === 'UK' ? 'Greater London' : region === 'EU' ? 'Hesse' : 'NY'),
        postalCode: postalCode.trim() || (region === 'UK' ? 'W1J 5AS' : region === 'EU' ? '60311' : '10001'),
        country: country.trim() || (region === 'UK' ? 'United Kingdom' : region === 'EU' ? 'Germany' : 'United States')
      },
      kycTier,
      approvalStatus,
      requestedAccountType: accountType,
      currency,
      initialDepositMinor: depositMinor,
      issueDebitCard,
      employmentStatus,
      employerOrBusinessName: employerOrBusinessName || 'Atlantic Holdings Corp',
      sourceOfWealth,
      annualIncomeRange
    };

    console.log('[PROVISION CUSTOMER PAYLOAD] Payload being sent to /api/admin/provision:', payload);

    setIsSubmitting(true);

    try {
      const [res] = await Promise.all([
        createCustomerByAdmin(payload),
        new Promise(resolve => setTimeout(resolve, 1500))
      ]);

      if (!res || !res.success) {
        const errorMsg = res?.error || 'Account creation failed. Please check all fields.';
        showToast('ERROR', 'Account creation failed', errorMsg);
        setIsSubmitting(false);
        return;
      }

      // If API succeeds, show success modal
      setCreatedSuccessData({
        user: res.user,
        account: res.account,
        card: res.card,
        application: res.application,
        payload
      });
      setRedirectCountdown(3);

      showToast('SUCCESS', 'Account Created Successfully!', `Account Number: ${res.account?.accountNumber || 'Provisioned'}`);
      if (onSuccess) onSuccess();
    } catch (err: any) {
      console.error('[PROVISION CUSTOMER SUBMIT ERROR]', err);
      const errorMsg = err?.message || 'Account creation failed. Please check network connection and try again.';
      showToast('ERROR', 'Account creation failed', errorMsg);
    } finally {
      setIsSubmitting(false);
    }
  };

  // Requirement 5: Auto-redirect countdown (3 seconds)
  useEffect(() => {
    if (!createdSuccessData) return;

    if (redirectCountdown <= 0) {
      handleGoToDashboard();
      return;
    }

    const timer = setTimeout(() => {
      setRedirectCountdown(prev => prev - 1);
    }, 1000);

    return () => clearTimeout(timer);
  }, [createdSuccessData, redirectCountdown]);

  // Navigate to customer dashboard
  const handleGoToDashboard = () => {
    if (!createdSuccessData?.user) {
      onClose();
      return;
    }
    const createdUser = createdSuccessData.user;
    
    // Switch active session to this new customer
    if (switchDemoUser) {
      switchDemoUser(createdUser.id);
    }
    
    // Set URL hash & view
    window.location.hash = `/dashboard/customer/${createdUser.id}`;
    if (setCurrentView) {
      setCurrentView('DASHBOARD_OVERVIEW');
    }
    onClose();
  };

  // Download Welcome Letter Dossier
  const handleDownloadWelcomeLetter = () => {
    if (!createdSuccessData) return;
    const { user, account, payload } = createdSuccessData;
    const accNum = account?.accountNumber || 'FATL-77291038';
    const iban = account?.iban || (region === 'UK' ? 'GB29FATL40128877291038' : region === 'EU' ? 'DE89FATL6031177291038' : 'US84FATL02100077291038');
    const routing = region === 'UK' ? '40-12-88 (CHAPS/FPS)' : region === 'EU' ? 'FATLDEFF (SEPA)' : '021000089 (Fedwire/ACH)';
    const swift = region === 'UK' ? 'FATLGB22' : region === 'EU' ? 'FATLDEFF' : 'FATLUS33';
    const initBal = currency === 'EUR' ? `€${(parseFloat(initialDepositDollars) || 25000).toLocaleString('en-US', { minimumFractionDigits: 2 })}` : currency === 'GBP' ? `£${(parseFloat(initialDepositDollars) || 25000).toLocaleString('en-US', { minimumFractionDigits: 2 })}` : `$${(parseFloat(initialDepositDollars) || 25000).toLocaleString('en-US', { minimumFractionDigits: 2 })}`;

    const letterHtml = `
      <!DOCTYPE html>
      <html>
      <head>
        <title>Welcome to First Atlantic Bank & Trust - ${user?.firstName} ${user?.lastName}</title>
        <style>
          body { font-family: 'Segoe UI', -apple-system, BlinkMacSystemFont, Roboto, Helvetica, Arial, sans-serif; color: #0f172a; margin: 0; padding: 40px; background: #ffffff; }
          .header { display: flex; justify-content: space-between; align-items: center; border-bottom: 2px solid #004281; padding-bottom: 20px; margin-bottom: 30px; }
          .brand { font-size: 24px; font-weight: 800; color: #004281; letter-spacing: -0.5px; }
          .sub-brand { font-size: 11px; color: #64748b; font-weight: 600; text-transform: uppercase; letter-spacing: 1.5px; }
          .badge { background: #00A651; color: white; padding: 6px 14px; border-radius: 20px; font-size: 12px; font-weight: 700; }
          .box { background: #f8fafc; border: 1px solid #e2e8f0; border-radius: 12px; padding: 24px; margin: 24px 0; }
          .grid { display: grid; grid-template-columns: repeat(2, 1fr); gap: 16px; margin-top: 12px; }
          .label { font-size: 11px; color: #64748b; font-weight: 600; text-transform: uppercase; }
          .value { font-size: 15px; color: #0f172a; font-weight: 700; font-family: monospace; }
          .highlight { color: #00A651; font-size: 18px; }
          .footer { margin-top: 40px; border-top: 1px solid #e2e8f0; padding-top: 20px; font-size: 11px; color: #64748b; line-height: 1.6; }
          @media print { body { padding: 20px; } }
        </style>
      </head>
      <body>
        <div class="header">
          <div>
            <div class="brand">FIRST ATLANTIC BANK &amp; TRUST</div>
            <div class="sub-brand">Private Wealth Management &amp; Institutional Custody</div>
          </div>
          <div class="badge">OFFICIAL WELCOME DOSSIER</div>
        </div>

        <p>Dear <strong>${user?.firstName} ${user?.lastName}</strong>,</p>
        <p>We are privileged to confirm that your institutional premier private banking facility has been successfully approved and provisioned at <strong>First Atlantic Bank &amp; Trust</strong>.</p>

        <div class="box">
          <h3 style="margin-top:0; color:#004281;">Provisioned Banking Coordinates</h3>
          <div class="grid">
            <div><div class="label">Account Holder</div><div class="value">${user?.firstName} ${user?.lastName}</div></div>
            <div><div class="label">Account Number</div><div class="value">${accNum}</div></div>
            <div><div class="label">Clearing Network / Region</div><div class="value">${region} Gateway</div></div>
            <div><div class="label">Routing / Sort Code</div><div class="value">${routing}</div></div>
            <div><div class="label">SWIFT / BIC Code</div><div class="value">${swift}</div></div>
            <div><div class="label">IBAN / Clearing Code</div><div class="value">${iban}</div></div>
            <div><div class="label">Initial Cleared Balance</div><div class="value highlight">${initBal}</div></div>
            <div><div class="label">KYC Clearance Tier</div><div class="value">${kycTier} (Approved)</div></div>
          </div>
        </div>

        <div class="box" style="background:#f0fdf4; border-color:#bbf7d0;">
          <h3 style="margin-top:0; color:#166534;">Online Banking &amp; Security Credentials</h3>
          <div class="grid">
            <div><div class="label">Portal Username</div><div class="value">${payload.username}</div></div>
            <div><div class="label">Initial Login Password</div><div class="value">${payload.password}</div></div>
            <div><div class="label">4-Digit Authorization PIN</div><div class="value">${payload.loginPin}</div></div>
            <div><div class="label">Primary Email</div><div class="value">${payload.email}</div></div>
          </div>
          <p style="font-size:12px; color:#15803d; margin-top:12px; margin-bottom:0;">Please store these credentials securely or update your security password upon initial portal login.</p>
        </div>

        <div class="footer">
          <p>First Atlantic Bank &amp; Trust is a licensed international financial institution. Deposits are safeguarded under regulatory custody reserve requirements and double-entry cryptographic ledgers.</p>
          <p>Issued by: Central Operations Treasury • First Atlantic Plaza, New York, NY 10001</p>
        </div>
      </body>
      </html>
    `;

    const printWindow = window.open('', '_blank');
    if (printWindow) {
      printWindow.document.open();
      printWindow.document.write(letterHtml);
      printWindow.document.close();
      setTimeout(() => {
        printWindow.print();
      }, 350);
    }
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-2 sm:p-4 bg-slate-950/85 backdrop-blur-xs animate-in fade-in duration-150">
      <div className="bg-[#0f172a] rounded-2xl max-w-2xl w-full max-h-[94vh] overflow-hidden shadow-2xl border border-slate-800 text-slate-100 flex flex-col relative">
        
        {/* ========================================================================= */}
        {/* SUCCESS MODAL OVERLAY (Requirement 3 & 5) */}
        {/* ========================================================================= */}
        {createdSuccessData ? (
          <div className="p-6 sm:p-8 flex flex-col items-center text-center space-y-6 animate-in zoom-in-95 duration-200">
            {/* Success Icon */}
            <div className="relative">
              <div className="w-16 h-16 rounded-full bg-[#00A651]/20 border-2 border-[#00A651] flex items-center justify-center shadow-lg shadow-[#00A651]/20">
                <CheckCheck className="w-8 h-8 text-[#00A651] animate-in zoom-in-50 duration-300" />
              </div>
              <div className="absolute -bottom-1 -right-1 bg-blue-600 text-white rounded-full p-1 border-2 border-[#0f172a]">
                <ShieldCheck className="w-3.5 h-3.5" />
              </div>
            </div>

            {/* Title & Message */}
            <div className="space-y-2 max-w-md">
              <h2 className="text-xl sm:text-2xl font-black text-white tracking-tight">
                Account Created Successfully!
              </h2>
              <p className="text-xs sm:text-sm text-slate-300">
                Client <strong className="text-white">{createdSuccessData.user?.firstName} {createdSuccessData.user?.lastName}</strong> has been provisioned with live private banking privileges.
              </p>
            </div>

            {/* Account Details Box */}
            <div className="w-full bg-slate-900/90 border border-slate-800 rounded-xl p-4 space-y-3">
              <div className="flex items-center justify-between border-b border-slate-800 pb-2.5">
                <span className="text-xs text-slate-400 font-semibold uppercase tracking-wider">Account Number</span>
                <span className="text-sm sm:text-base font-mono font-black text-[#00A651] bg-[#00A651]/10 px-3 py-1 rounded-md border border-[#00A651]/30">
                  {createdSuccessData.account?.accountNumber || 'FATL-77291038'}
                </span>
              </div>

              <div className="grid grid-cols-2 sm:grid-cols-4 gap-2 text-left text-[11px] font-mono">
                <div className="bg-slate-950/60 p-2 rounded-lg border border-slate-800/80">
                  <span className="text-slate-500 block text-[9px] uppercase">Routing / Sort</span>
                  <span className="font-bold text-slate-200">
                    {region === 'UK' ? '40-12-88' : region === 'EU' ? 'FATLDEFF' : '021000089'}
                  </span>
                </div>
                <div className="bg-slate-950/60 p-2 rounded-lg border border-slate-800/80">
                  <span className="text-slate-500 block text-[9px] uppercase">SWIFT BIC</span>
                  <span className="font-bold text-slate-200">
                    {region === 'UK' ? 'FATLGB22' : region === 'EU' ? 'FATLDEFF' : 'FATLUS33'}
                  </span>
                </div>
                <div className="bg-slate-950/60 p-2 rounded-lg border border-slate-800/80">
                  <span className="text-slate-500 block text-[9px] uppercase">Starting Balance</span>
                  <span className="font-bold text-[#00A651]">
                    {currency === 'EUR' ? '€' : currency === 'GBP' ? '£' : '$'}
                    {(parseFloat(initialDepositDollars) || 25000).toLocaleString('en-US', { minimumFractionDigits: 2 })}
                  </span>
                </div>
                <div className="bg-slate-950/60 p-2 rounded-lg border border-slate-800/80">
                  <span className="text-slate-500 block text-[9px] uppercase">Status</span>
                  <span className="font-bold text-emerald-400">ACTIVE &amp; APPROVED</span>
                </div>
              </div>
            </div>

            {/* Countdown notice */}
            <div className="flex items-center justify-center gap-2 text-xs text-slate-400">
              <RefreshCw className="w-3.5 h-3.5 animate-spin text-emerald-400" />
              <span>
                Redirecting to <strong className="text-slate-200 font-mono">/dashboard/customer/{createdSuccessData.user?.id}</strong> in <strong className="text-[#00A651] font-mono">{redirectCountdown}s</strong>...
              </span>
            </div>

            {/* Action Buttons (Requirement 3: [View Dashboard] [Download Welcome Letter]) */}
            <div className="flex flex-col sm:flex-row items-center justify-center gap-3 w-full pt-2">
              <button
                type="button"
                onClick={handleGoToDashboard}
                className="w-full sm:w-auto px-6 py-2.5 rounded-xl bg-[#00A651] hover:bg-[#008f45] text-white font-bold text-sm shadow-lg shadow-[#00A651]/20 flex items-center justify-center gap-2 transition-all cursor-pointer"
              >
                <span>View Dashboard</span>
                <ArrowRight className="w-4 h-4" />
              </button>

              <button
                type="button"
                onClick={handleDownloadWelcomeLetter}
                className="w-full sm:w-auto px-5 py-2.5 rounded-xl bg-slate-800 hover:bg-slate-700 text-slate-200 font-semibold text-sm border border-slate-700 flex items-center justify-center gap-2 transition-all cursor-pointer"
              >
                <Download className="w-4 h-4 text-blue-400" />
                <span>Download Welcome Letter</span>
              </button>
            </div>
          </div>
        ) : (
          /* ========================================================================= */
          /* MULTI-STEP ONBOARDING FORM */
          /* ========================================================================= */
          <>
            {/* Header */}
            <div className="bg-[#004281] text-white px-4 sm:px-6 py-3.5 flex items-center justify-between border-b border-blue-900/60">
              <div className="flex items-center gap-2.5">
                <div className="p-2 rounded-lg bg-white/10 text-white">
                  <UserPlus className="w-5 h-5 text-[#00A651]" />
                </div>
                <div>
                  <h3 className="font-bold text-sm sm:text-base leading-tight">
                    New Customer Onboarding &amp; Account Provisioning
                  </h3>
                  <p className="text-[11px] text-blue-200">
                    Step {activeStep === 'IDENTITY' ? '1' : activeStep === 'CREDENTIALS' ? '2' : activeStep === 'ADDRESS' ? '3' : '4'} of 4 • {activeStep === 'IDENTITY' ? 'Identity & Passport' : activeStep === 'CREDENTIALS' ? 'Credentials & Security' : activeStep === 'ADDRESS' ? 'Residential Address' : 'Banking & KYC'}
                  </p>
                </div>
              </div>

              <div className="flex items-center gap-1.5 sm:gap-2 flex-wrap sm:flex-nowrap">
                <button
                  type="button"
                  onClick={autoFillSampleClient}
                  className="text-[10px] font-bold bg-[#00A651] hover:bg-[#008f45] text-white px-2.5 py-1 rounded-md transition-colors cursor-pointer flex items-center gap-1 shadow-xs"
                  title="Auto-fill sample executive client"
                >
                  <Sparkles className="w-3 h-3" />
                  <span>Auto-Fill Sample</span>
                </button>
                <button
                  type="button"
                  onClick={() => {
                    if (!firstName.trim() || !lastName.trim()) {
                      autoFillSampleClient();
                    }
                    setTimeout(() => {
                      handleSubmit();
                    }, 50);
                  }}
                  disabled={isSubmitting}
                  className="text-[10px] font-bold bg-[#d4af37] hover:bg-[#bfa030] text-slate-950 px-2.5 py-1 rounded-md transition-colors cursor-pointer flex items-center gap-1 shadow-xs disabled:opacity-50"
                  title="Auto-fill and immediately create customer account"
                >
                  <CheckCircle2 className="w-3 h-3" />
                  <span>⚡ Quick Provision</span>
                </button>
                <button
                  type="button"
                  onClick={onClose}
                  className="p-1 rounded-lg text-blue-200 hover:text-white hover:bg-white/10 transition-colors cursor-pointer"
                >
                  <X className="w-5 h-5" />
                </button>
              </div>
            </div>

            {/* Step Navigation Tabs */}
            <div className="bg-slate-900 border-b border-slate-800 px-3 sm:px-6 py-2 flex items-center justify-between text-xs overflow-x-auto">
              <button
                type="button"
                onClick={() => setActiveStep('IDENTITY')}
                className={`flex items-center gap-1.5 px-3 py-1.5 rounded-lg font-bold transition-all cursor-pointer whitespace-nowrap ${
                  activeStep === 'IDENTITY'
                    ? 'bg-[#004281] text-white shadow-xs'
                    : 'text-slate-400 hover:text-slate-200 hover:bg-slate-800'
                }`}
              >
                <User className="w-3.5 h-3.5" />
                <span>1. Identity &amp; KYC</span>
              </button>

              <span className="text-slate-600">&rarr;</span>

              <button
                type="button"
                onClick={() => {
                  if (validateStep1()) setActiveStep('CREDENTIALS');
                }}
                className={`flex items-center gap-1.5 px-3 py-1.5 rounded-lg font-bold transition-all cursor-pointer whitespace-nowrap ${
                  activeStep === 'CREDENTIALS'
                    ? 'bg-[#004281] text-white shadow-xs'
                    : 'text-slate-400 hover:text-slate-200 hover:bg-slate-800'
                }`}
              >
                <Lock className="w-3.5 h-3.5" />
                <span>2. Security &amp; PIN</span>
              </button>

              <span className="text-slate-600">&rarr;</span>

              <button
                type="button"
                onClick={() => {
                  if (validateStep1() && validateStep2()) setActiveStep('ADDRESS');
                }}
                className={`flex items-center gap-1.5 px-3 py-1.5 rounded-lg font-bold transition-all cursor-pointer whitespace-nowrap ${
                  activeStep === 'ADDRESS'
                    ? 'bg-[#004281] text-white shadow-xs'
                    : 'text-slate-400 hover:text-slate-200 hover:bg-slate-800'
                }`}
              >
                <MapPin className="w-3.5 h-3.5" />
                <span>3. Address</span>
              </button>

              <span className="text-slate-600">&rarr;</span>

              <button
                type="button"
                onClick={() => {
                  if (validateStep1() && validateStep2() && validateStep3()) setActiveStep('BANKING');
                }}
                className={`flex items-center gap-1.5 px-3 py-1.5 rounded-lg font-bold transition-all cursor-pointer whitespace-nowrap ${
                  activeStep === 'BANKING'
                    ? 'bg-[#004281] text-white shadow-xs'
                    : 'text-slate-400 hover:text-slate-200 hover:bg-slate-800'
                }`}
              >
                <Landmark className="w-3.5 h-3.5" />
                <span>4. Banking &amp; KYC</span>
              </button>
            </div>

            {/* Form Body */}
            <form
              noValidate
              onSubmit={(e) => {
                e.preventDefault();
                handleSubmit(e);
              }}
              className="flex-1 overflow-y-auto p-3.5 sm:p-5 space-y-4 text-xs"
            >
              {/* ========================================================================= */}
              {/* STEP 1: IDENTITY & PASSPORT PHOTO */}
              {/* ========================================================================= */}
              {activeStep === 'IDENTITY' && (
                <div className="space-y-4 animate-in fade-in duration-150">
                  {/* Passport photo upload box */}
                  <div className="p-3.5 rounded-xl bg-slate-900/60 border border-slate-800 space-y-2.5">
                    <div className="flex items-center justify-between">
                      <label className="font-bold text-slate-200 flex items-center gap-1.5">
                        <Camera className="w-3.5 h-3.5 text-blue-400" />
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
                      {/* Photo preview */}
                      <div className="relative group shrink-0">
                        <div className="w-20 h-24 rounded-lg overflow-hidden border-2 border-slate-700 bg-slate-800 shadow-xs flex items-center justify-center">
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

                      {/* Drop area */}
                      <div
                        onDragOver={(e) => {
                          e.preventDefault();
                          setIsDragOver(true);
                        }}
                        onDragLeave={() => setIsDragOver(false)}
                        onDrop={handleDrop}
                        className={`flex-1 w-full p-3 rounded-lg border-2 border-dashed transition-all flex flex-col items-center justify-center text-center cursor-pointer ${
                          isDragOver
                            ? 'border-[#004281] bg-blue-950/30'
                            : 'border-slate-700 hover:border-slate-500 hover:bg-slate-800/40'
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
                        <Upload className="w-4 h-4 text-slate-400 mb-1" />
                        <p className="text-[11px] font-bold text-slate-200">
                          Click to upload passport picture or drag &amp; drop
                        </p>
                        <p className="text-[10px] text-slate-400">
                          PNG, JPG, WebP (Color official identification)
                        </p>
                      </div>
                    </div>

                    {/* Presets */}
                    <div className="flex items-center gap-1.5 flex-wrap pt-1">
                      <span className="text-[10px] font-semibold text-slate-400">Quick Presets:</span>
                      {PASSPORT_PRESETS.map((preset, idx) => (
                        <button
                          key={idx}
                          type="button"
                          onClick={() => setPassportPhoto(preset.url)}
                          className={`text-[10px] font-semibold px-2 py-0.5 rounded-md border transition-all cursor-pointer ${
                            passportPhoto === preset.url
                              ? 'bg-[#004281] text-white border-[#004281]'
                              : 'bg-slate-800 border-slate-700 text-slate-300 hover:bg-slate-700'
                          }`}
                        >
                          {preset.label}
                        </button>
                      ))}
                    </div>
                  </div>

                  {/* Personal details grid */}
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                    <div className="space-y-1">
                      <label className="font-bold text-slate-300">First Name *</label>
                      <input
                        type="text"
                        placeholder="e.g. Alistair"
                        value={firstName}
                        onChange={e => handleFirstNameChange(e.target.value)}
                        className={`w-full px-3 py-2 rounded-lg border bg-slate-900 focus:outline-none focus:ring-2 focus:ring-[#004281] ${
                          highlightedField === 'firstName' ? 'border-red-500 ring-2 ring-red-500/50' : 'border-slate-700'
                        }`}
                      />
                    </div>

                    <div className="space-y-1">
                      <label className="font-bold text-slate-300">Last Name *</label>
                      <input
                        type="text"
                        placeholder="e.g. Vance"
                        value={lastName}
                        onChange={e => handleLastNameChange(e.target.value)}
                        className={`w-full px-3 py-2 rounded-lg border bg-slate-900 focus:outline-none focus:ring-2 focus:ring-[#004281] ${
                          highlightedField === 'lastName' ? 'border-red-500 ring-2 ring-red-500/50' : 'border-slate-700'
                        }`}
                      />
                    </div>

                    <div className="space-y-1">
                      <label className="font-bold text-slate-300">Email Address *</label>
                      <input
                        type="text"
                        inputMode="email"
                        placeholder="e.g. a.vance@atlantic-wealth.com"
                        value={email}
                        onChange={e => setEmail(e.target.value)}
                        className={`w-full px-3 py-2 rounded-lg border bg-slate-900 focus:outline-none focus:ring-2 focus:ring-[#004281] ${
                          highlightedField === 'email' ? 'border-red-500 ring-2 ring-red-500/50' : 'border-slate-700'
                        }`}
                      />
                    </div>

                    <div className="space-y-1">
                      <label className="font-bold text-slate-300">Phone Number</label>
                      <div className="flex gap-1.5">
                        <input
                          type="text"
                          inputMode="tel"
                          value={dialCode}
                          onChange={e => setDialCode(e.target.value)}
                          className="w-16 px-2 py-2 rounded-lg border border-slate-700 bg-slate-900 text-center font-mono"
                          placeholder="+1"
                        />
                        <input
                          type="text"
                          inputMode="tel"
                          placeholder="(555) 019-2830"
                          value={phone}
                          onChange={e => setPhone(e.target.value)}
                          className="flex-1 px-3 py-2 rounded-lg border border-slate-700 bg-slate-900"
                        />
                      </div>
                    </div>

                    <div className="space-y-1">
                      <label className="font-bold text-slate-300">Date of Birth</label>
                      <input
                        type="text"
                        placeholder="YYYY-MM-DD (e.g. 1988-06-15)"
                        value={dateOfBirth}
                        onChange={e => setDateOfBirth(e.target.value)}
                        className="w-full px-3 py-2 rounded-lg border border-slate-700 bg-slate-900 text-slate-200 font-mono"
                      />
                    </div>

                    <div className="space-y-1">
                      <label className="font-bold text-slate-300">Nationality</label>
                      <input
                        type="text"
                        value={nationality}
                        onChange={e => setNationality(e.target.value)}
                        className="w-full px-3 py-2 rounded-lg border border-slate-700 bg-slate-900"
                      />
                    </div>

                    <div className="space-y-1">
                      <label className="font-bold text-slate-300">Passport / National ID #</label>
                      <input
                        type="text"
                        placeholder="e.g. US84920194A"
                        value={passportNumber}
                        onChange={e => setPassportNumber(e.target.value)}
                        className="w-full px-3 py-2 rounded-lg border border-slate-700 bg-slate-900 font-mono"
                      />
                    </div>

                    <div className="space-y-1">
                      <label className="font-bold text-slate-300">Tax ID / SSN</label>
                      <input
                        type="text"
                        placeholder="e.g. 987-65-4321"
                        value={ssnOrTaxId}
                        onChange={e => setSsnOrTaxId(e.target.value)}
                        className="w-full px-3 py-2 rounded-lg border border-slate-700 bg-slate-900 font-mono"
                      />
                    </div>
                  </div>

                  {/* Step 1 Footer Buttons */}
                  <div className="flex items-center justify-between pt-2 border-t border-slate-800 flex-wrap gap-2">
                    <button
                      type="button"
                      onClick={onClose}
                      className="px-4 py-2 rounded-lg border border-slate-700 text-slate-300 font-bold hover:bg-slate-800 transition-colors cursor-pointer"
                    >
                      Cancel
                    </button>
                    <div className="flex items-center gap-2">
                      <button
                        type="button"
                        onClick={() => {
                          if (validateStep1()) {
                            handleSubmit();
                          }
                        }}
                        disabled={isSubmitting}
                        className="px-3.5 py-2 rounded-lg bg-[#d4af37] hover:bg-[#bfa030] text-slate-950 font-bold transition-colors cursor-pointer flex items-center gap-1 text-[11px] shadow-xs disabled:opacity-50"
                      >
                        <CheckCircle2 className="w-3.5 h-3.5" />
                        <span>Provision Now</span>
                      </button>
                      <button
                        type="button"
                        onClick={() => handleNextStep('IDENTITY')}
                        className="px-4 py-2 rounded-lg bg-[#004281] hover:bg-[#003366] text-white font-bold transition-colors cursor-pointer flex items-center gap-1.5"
                      >
                        <span>Next: Security</span>
                        <span>&rarr;</span>
                      </button>
                    </div>
                  </div>
                </div>
              )}

              {/* ========================================================================= */}
              {/* STEP 2: PASSWORD & SECURITY CREDENTIALS */}
              {/* ========================================================================= */}
              {activeStep === 'CREDENTIALS' && (
                <div className="space-y-4 animate-in fade-in duration-150">
                  <div className="p-3.5 rounded-xl bg-blue-950/20 border border-blue-900/50 space-y-1">
                    <div className="flex items-center gap-2 text-xs font-bold text-blue-300">
                      <ShieldCheck className="w-4 h-4 text-[#00A651]" />
                      <span>Customer Access Credentials &amp; 4-Digit Security PIN</span>
                    </div>
                    <p className="text-[11px] text-slate-400">
                      Set the login username, portal password, and authorization PIN for this client.
                    </p>
                  </div>

                  <div className="space-y-3">
                    {/* Username */}
                    <div className="space-y-1">
                      <label className="font-bold text-slate-300">Client Portal Username *</label>
                      <input
                        type="text"
                        placeholder="e.g. avance"
                        value={username}
                        onChange={e => setUsername(e.target.value)}
                        className={`w-full px-3 py-2 rounded-lg border bg-slate-900 font-mono focus:outline-none focus:ring-2 focus:ring-[#004281] ${
                          highlightedField === 'username' ? 'border-red-500 ring-2 ring-red-500/50' : 'border-slate-700'
                        }`}
                      />
                    </div>

                    {/* Password Box */}
                    <div className="p-3.5 rounded-xl bg-slate-900/80 border border-slate-800 space-y-2.5">
                      <div className="flex items-center justify-between">
                        <label className="font-bold text-slate-200 flex items-center gap-1.5">
                          <Lock className="w-3.5 h-3.5 text-blue-400" />
                          <span>Initial Login Password *</span>
                        </label>
                        <button
                          type="button"
                          onClick={generateStrongPassword}
                          className="text-[11px] font-bold text-blue-400 hover:underline flex items-center gap-1 cursor-pointer"
                        >
                          <Sparkles className="w-3 h-3 text-[#00A651]" />
                          <span>Generate Strong Password</span>
                        </button>
                      </div>

                      <div className="relative">
                        <input
                          type={showPassword ? 'text' : 'password'}
                          value={password}
                          onChange={e => setPassword(e.target.value)}
                          placeholder="Enter customer login password"
                          className={`w-full pl-3 pr-10 py-2.5 rounded-lg border bg-slate-950 font-mono text-xs focus:outline-none focus:ring-2 focus:ring-[#004281] ${
                            highlightedField === 'password' ? 'border-red-500 ring-2 ring-red-500/50' : 'border-slate-700'
                          }`}
                        />
                        <button
                          type="button"
                          onClick={() => setShowPassword(!showPassword)}
                          className="absolute right-3 top-2.5 text-slate-400 hover:text-slate-200 cursor-pointer"
                          title={showPassword ? 'Hide password' : 'Show password'}
                        >
                          {showPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                        </button>
                      </div>

                      <div className="flex items-center gap-2 text-[10px] text-slate-400 font-mono">
                        <span className="w-2 h-2 rounded-full bg-[#00A651]" />
                        <span>Standard policy: Minimum 8 characters with letters, numbers, and symbols</span>
                      </div>
                    </div>

                    {/* 4-Digit Security PIN */}
                    <div className="p-3.5 rounded-xl bg-slate-900/80 border border-slate-800 space-y-2">
                      <div className="flex items-center justify-between">
                        <label className="font-bold text-slate-200 flex items-center gap-1.5">
                          <Key className="w-3.5 h-3.5 text-[#00A651]" />
                          <span>4-Digit Authorization PIN *</span>
                        </label>
                        <span className="text-[10px] text-slate-400">Used for wire transfers &amp; mobile checks</span>
                      </div>

                      <input
                        type="text"
                        inputMode="numeric"
                        maxLength={4}
                        value={loginPin}
                        onChange={e => setLoginPin(e.target.value.replace(/\D/g, ''))}
                        className={`w-32 px-3 py-2 rounded-lg border bg-slate-950 font-mono text-center tracking-widest text-sm font-bold ${
                          highlightedField === 'loginPin' ? 'border-red-500 ring-2 ring-red-500/50' : 'border-slate-700'
                        }`}
                        placeholder="1234"
                      />
                    </div>
                  </div>

                  {/* Step 2 Footer Buttons */}
                  <div className="flex items-center justify-between pt-2 border-t border-slate-800 flex-wrap gap-2">
                    <button
                      type="button"
                      onClick={() => setActiveStep('IDENTITY')}
                      className="px-4 py-2 rounded-lg bg-slate-800 hover:bg-slate-700 text-slate-300 font-bold transition-colors cursor-pointer"
                    >
                      &larr; Back
                    </button>
                    <div className="flex items-center gap-2">
                      <button
                        type="button"
                        onClick={() => {
                          if (validateStep1() && validateStep2()) {
                            handleSubmit();
                          }
                        }}
                        disabled={isSubmitting}
                        className="px-3.5 py-2 rounded-lg bg-[#d4af37] hover:bg-[#bfa030] text-slate-950 font-bold transition-colors cursor-pointer flex items-center gap-1 text-[11px] shadow-xs disabled:opacity-50"
                      >
                        <CheckCircle2 className="w-3.5 h-3.5" />
                        <span>Provision Now</span>
                      </button>
                      <button
                        type="button"
                        onClick={() => handleNextStep('CREDENTIALS')}
                        className="px-4 py-2 rounded-lg bg-[#004281] hover:bg-[#003366] text-white font-bold transition-colors cursor-pointer flex items-center gap-1.5"
                      >
                        <span>Next: Address</span>
                        <span>&rarr;</span>
                      </button>
                    </div>
                  </div>
                </div>
              )}

              {/* ========================================================================= */}
              {/* STEP 3: RESIDENTIAL ADDRESS */}
              {/* ========================================================================= */}
              {activeStep === 'ADDRESS' && (
                <div className="space-y-4 animate-in fade-in duration-150">
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                    <div className="space-y-1 sm:col-span-2">
                      <label className="font-bold text-slate-300">Address Line 1 *</label>
                      <input
                        type="text"
                        placeholder="Street Address, P.O. Box"
                        value={addressLine1}
                        onChange={e => setAddressLine1(e.target.value)}
                        className={`w-full px-3 py-2 rounded-lg border bg-slate-900 focus:outline-none focus:ring-2 focus:ring-[#004281] ${
                          highlightedField === 'addressLine1' ? 'border-red-500 ring-2 ring-red-500/50' : 'border-slate-700'
                        }`}
                      />
                    </div>

                    <div className="space-y-1 sm:col-span-2">
                      <label className="font-bold text-slate-300">Address Line 2 (Optional)</label>
                      <input
                        type="text"
                        placeholder="Apartment, suite, unit, building, floor"
                        value={addressLine2}
                        onChange={e => setAddressLine2(e.target.value)}
                        className="w-full px-3 py-2 rounded-lg border border-slate-700 bg-slate-900"
                      />
                    </div>

                    <div className="space-y-1">
                      <label className="font-bold text-slate-300">City *</label>
                      <input
                        type="text"
                        value={city}
                        onChange={e => setCity(e.target.value)}
                        className={`w-full px-3 py-2 rounded-lg border bg-slate-900 ${
                          highlightedField === 'city' ? 'border-red-500 ring-2 ring-red-500/50' : 'border-slate-700'
                        }`}
                      />
                    </div>

                    <div className="space-y-1">
                      <label className="font-bold text-slate-300">State / Province / County *</label>
                      <input
                        type="text"
                        value={stateOrCounty}
                        onChange={e => setStateOrCounty(e.target.value)}
                        className={`w-full px-3 py-2 rounded-lg border bg-slate-900 ${
                          highlightedField === 'stateOrCounty' ? 'border-red-500 ring-2 ring-red-500/50' : 'border-slate-700'
                        }`}
                      />
                    </div>

                    <div className="space-y-1">
                      <label className="font-bold text-slate-300">Postal / ZIP Code *</label>
                      <input
                        type="text"
                        value={postalCode}
                        onChange={e => setPostalCode(e.target.value)}
                        className={`w-full px-3 py-2 rounded-lg border bg-slate-900 font-mono ${
                          highlightedField === 'postalCode' ? 'border-red-500 ring-2 ring-red-500/50' : 'border-slate-700'
                        }`}
                      />
                    </div>

                    <div className="space-y-1">
                      <label className="font-bold text-slate-300">Country *</label>
                      <input
                        type="text"
                        value={country}
                        onChange={e => setCountry(e.target.value)}
                        className={`w-full px-3 py-2 rounded-lg border bg-slate-900 ${
                          highlightedField === 'country' ? 'border-red-500 ring-2 ring-red-500/50' : 'border-slate-700'
                        }`}
                      />
                    </div>
                  </div>

                  {/* Step 3 Footer Buttons */}
                  <div className="flex items-center justify-between pt-2 border-t border-slate-800 flex-wrap gap-2">
                    <button
                      type="button"
                      onClick={() => setActiveStep('CREDENTIALS')}
                      className="px-4 py-2 rounded-lg bg-slate-800 hover:bg-slate-700 text-slate-300 font-bold transition-colors cursor-pointer"
                    >
                      &larr; Back
                    </button>
                    <div className="flex items-center gap-2">
                      <button
                        type="button"
                        onClick={() => {
                          if (validateStep1() && validateStep2() && validateStep3()) {
                            handleSubmit();
                          }
                        }}
                        disabled={isSubmitting}
                        className="px-3.5 py-2 rounded-lg bg-[#d4af37] hover:bg-[#bfa030] text-slate-950 font-bold transition-colors cursor-pointer flex items-center gap-1 text-[11px] shadow-xs disabled:opacity-50"
                      >
                        <CheckCircle2 className="w-3.5 h-3.5" />
                        <span>Provision Now</span>
                      </button>
                      <button
                        type="button"
                        onClick={() => handleNextStep('ADDRESS')}
                        className="px-4 py-2 rounded-lg bg-[#004281] hover:bg-[#003366] text-white font-bold transition-colors cursor-pointer flex items-center gap-1.5"
                      >
                        <span>Next: Banking Setup</span>
                        <span>&rarr;</span>
                      </button>
                    </div>
                  </div>
                </div>
              )}

              {/* ========================================================================= */}
              {/* STEP 4: BANKING & KYC */}
              {/* ========================================================================= */}
              {activeStep === 'BANKING' && (
                <div className="space-y-4 animate-in fade-in duration-150">
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                    {/* Clearing Network / Region */}
                    <div className="space-y-1">
                      <label className="font-bold text-slate-300">Clearing Network &amp; Region</label>
                      <select
                        value={region}
                        onChange={e => handleRegionChange(e.target.value as BankRegion)}
                        className="w-full px-3 py-2 rounded-lg border border-slate-700 bg-slate-900 font-bold text-slate-200"
                      >
                        <option value="US">🇺🇸 United States (Fedwire / ACH Clearing • USD)</option>
                        <option value="UK">🇬🇧 United Kingdom (CHAPS / Faster Payments • GBP)</option>
                        <option value="EU">🇪🇺 European Union (SEPA / TARGET2 • EUR)</option>
                      </select>
                    </div>

                    {/* Account Type */}
                    <div className="space-y-1">
                      <label className="font-bold text-slate-300">Vault Account Type</label>
                      <select
                        value={accountType}
                        onChange={e => setAccountType(e.target.value as AccountType)}
                        className="w-full px-3 py-2 rounded-lg border border-slate-700 bg-slate-900 font-bold text-slate-200"
                      >
                        <option value="CHECKING_PREMIER">Premier Private Client Checking</option>
                        <option value="SAVINGS_HIGH_YIELD">Apex High-Yield Reserve (5.15% APY)</option>
                        <option value="MULTI_CURRENCY_GLOBAL">Global Multi-Currency Reserve</option>
                        <option value="COMMERCIAL_OPERATING">Corporate Treasury Operating Account</option>
                      </select>
                    </div>

                    {/* Primary Currency */}
                    <div className="space-y-1">
                      <label className="font-bold text-slate-300">Primary Currency</label>
                      <select
                        value={currency}
                        onChange={e => setCurrency(e.target.value as CurrencyCode)}
                        className="w-full px-3 py-2 rounded-lg border border-slate-700 bg-slate-900 font-bold text-slate-200"
                      >
                        <option value="USD">USD ($ - United States Dollar)</option>
                        <option value="GBP">GBP (£ - British Pound Sterling)</option>
                        <option value="EUR">EUR (€ - Euro Currency)</option>
                      </select>
                    </div>

                    {/* Initial Opening Balance */}
                    <div className="space-y-1">
                      <label className="font-bold text-slate-300">Initial Opening Balance ({currency})</label>
                      <div className="relative">
                        <span className="absolute left-3 top-2 text-slate-400 font-bold">
                          {currency === 'EUR' ? '€' : currency === 'GBP' ? '£' : '$'}
                        </span>
                        <input
                          type="text"
                          inputMode="decimal"
                          value={initialDepositDollars}
                          onChange={e => {
                            const val = e.target.value.replace(/[^0-9.]/g, '');
                            setInitialDepositDollars(val);
                          }}
                          className={`w-full pl-7 pr-3 py-2 rounded-lg border bg-slate-900 font-mono font-bold text-slate-100 ${
                            highlightedField === 'initialDepositDollars' ? 'border-red-500 ring-2 ring-red-500/50' : 'border-slate-700'
                          }`}
                          placeholder="25000"
                        />
                      </div>
                      {Number(parseFloat(initialDepositDollars) || 0) > 0 && (
                        <span className="text-xs text-[#00A651] font-mono font-semibold block mt-1">
                          Formatted: {currency === 'EUR' ? '€' : currency === 'GBP' ? '£' : '$'}{Number(parseFloat(initialDepositDollars) || 0).toLocaleString('en-US', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}
                        </span>
                      )}
                    </div>

                    {/* KYC Tier */}
                    <div className="space-y-1">
                      <label className="font-bold text-slate-300">KYC Clearance Tier</label>
                      <select
                        value={kycTier}
                        onChange={e => setKycTier(e.target.value as any)}
                        className="w-full px-3 py-2 rounded-lg border border-slate-700 bg-slate-900 font-bold text-slate-200"
                      >
                        <option value="TIER_1_STANDARD">Tier 1 - Standard Verified Client</option>
                        <option value="TIER_2_VERIFIED_PREMIER">Tier 2 - Verified Premier Private Banking</option>
                        <option value="TIER_3_INSTITUTIONAL">Tier 3 - Institutional Sovereign / Family Office</option>
                      </select>
                    </div>

                    {/* Approval Status */}
                    <div className="space-y-1">
                      <label className="font-bold text-slate-300">Initial Approval State</label>
                      <select
                        value={approvalStatus}
                        onChange={e => setApprovalStatus(e.target.value as UserApprovalStatus)}
                        className="w-full px-3 py-2 rounded-lg border border-slate-700 bg-slate-900 font-bold text-slate-200"
                      >
                        <option value="APPROVED">Immediate Active &amp; Approved (Live Banking)</option>
                        <option value="PENDING">Queue for Compliance Review</option>
                      </select>
                    </div>

                    {/* Employment Status */}
                    <div className="space-y-1">
                      <label className="font-bold text-slate-300">Employment Status</label>
                      <select
                        value={employmentStatus}
                        onChange={e => setEmploymentStatus(e.target.value)}
                        className="w-full px-3 py-2 rounded-lg border border-slate-700 bg-slate-900 text-slate-200"
                      >
                        <option value="EXECUTIVE">Executive / Corporate Officer</option>
                        <option value="BUSINESS_OWNER">Business Owner / Founder</option>
                        <option value="PARTNER">Managing Partner</option>
                        <option value="SELF_EMPLOYED">Self-Employed Professional</option>
                        <option value="RETIRED">High Net Worth Retired</option>
                      </select>
                    </div>

                    {/* Employer Name */}
                    <div className="space-y-1">
                      <label className="font-bold text-slate-300">Employer / Entity Name</label>
                      <input
                        type="text"
                        value={employerOrBusinessName}
                        onChange={e => setEmployerOrBusinessName(e.target.value)}
                        className="w-full px-3 py-2 rounded-lg border border-slate-700 bg-slate-900 text-slate-200"
                      />
                    </div>

                    {/* Debit Card Provisioning */}
                    <div className="sm:col-span-2 p-3 rounded-lg bg-slate-900/60 border border-slate-800 flex items-center justify-between">
                      <div className="flex items-center gap-2.5">
                        <CreditCard className="w-4 h-4 text-blue-400" />
                        <div>
                          <div className="font-bold text-slate-100">Issue Visa Signature Debit Card</div>
                          <div className="text-[10px] text-slate-400">Auto-provisions active contactless card with spend limits</div>
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

                  {/* Clearance Summary Box */}
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

                  {/* Step 4 Footer Buttons */}
                  <div className="flex items-center justify-between pt-2 border-t border-slate-800">
                    <button
                      type="button"
                      onClick={() => setActiveStep('ADDRESS')}
                      disabled={isSubmitting}
                      className="px-4 py-2 rounded-lg bg-slate-800 hover:bg-slate-700 text-slate-300 font-bold transition-colors cursor-pointer disabled:opacity-50"
                    >
                      &larr; Back
                    </button>

                    <div className="flex items-center gap-2">
                      <button
                        type="button"
                        onClick={onClose}
                        disabled={isSubmitting}
                        className="px-4 py-2 rounded-lg border border-slate-700 text-slate-300 font-bold hover:bg-slate-800 transition-colors cursor-pointer disabled:opacity-50"
                      >
                        Cancel
                      </button>

                      <button
                        type="button"
                        onClick={() => handleSubmit()}
                        disabled={isSubmitting}
                        className="px-5 py-2.5 rounded-lg bg-[#00A651] hover:bg-[#008f45] text-white font-bold flex items-center gap-2 shadow-lg shadow-[#00A651]/20 transition-all cursor-pointer disabled:opacity-75 disabled:cursor-not-allowed"
                      >
                        {isSubmitting ? (
                          <>
                            <RefreshCw className="w-4 h-4 animate-spin text-white" />
                            <span>Creating Account...</span>
                          </>
                        ) : (
                          <>
                            <CheckCircle2 className="w-4 h-4 text-white" />
                            <span>Provision Customer</span>
                          </>
                        )}
                      </button>
                    </div>
                  </div>
                </div>
              )}
            </form>
          </>
        )}
      </div>
    </div>
  );
};
