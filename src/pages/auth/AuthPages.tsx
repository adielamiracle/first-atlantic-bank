import React, { useState } from 'react';
import { useBank } from '../../context/BankContext';
import { InstitutionalCrest } from '../../components/common/InstitutionalCrest';
import {
  Lock,
  User,
  KeyRound,
  Shield,
  Fingerprint,
  ArrowRight,
  AlertCircle,
  CheckCircle2,
  Phone,
  ShieldCheck,
  RefreshCw,
  Globe2,
  Building2,
  FileText,
  CreditCard,
  Landmark,
  Briefcase,
  BadgeCheck,
  Check
} from 'lucide-react';
import { BankRegion } from '../../types';

export const LoginPage: React.FC = () => {
  const { login, setCurrentView, showToast, switchToAdmin } = useBank();

  const [authMode, setAuthMode] = useState<'CLIENT' | 'ADMIN'>('CLIENT');
  const [username, setUsername] = useState('');
  const [password, setPassword] = useState('');
  const [rememberDevice, setRememberDevice] = useState(true);
  const [isLoading, setIsLoading] = useState(false);
  const [errorMessage, setErrorMessage] = useState('');
  const [copiedKey, setCopiedKey] = useState<string | null>(null);
  const [applicationNotice, setApplicationNotice] = useState<{
    referenceNumber?: string;
    status?: string;
    submittedAt?: string;
    message?: string;
  } | null>(null);

  // Quick helper to fill Admin credentials
  const fillAdminCredentials = () => {
    setAuthMode('ADMIN');
    setUsername('admin@firstatlanticbank.com');
    setPassword('AdminMaster2026!');
    setErrorMessage('');
  };

  // Quick helper to fill Demo Client
  const fillClientCredentials = (type: 'sterling' | 'montgomery') => {
    setAuthMode('CLIENT');
    if (type === 'sterling') {
      setUsername('jsterling');
      setPassword('PremierClient2026!');
    } else {
      setUsername('emontgomery');
      setPassword('MayfairLondon2026!');
    }
    setErrorMessage('');
  };

  // Direct 1-Click Instant Admin Test Run
  const handleInstantAdminTestRun = async () => {
    setIsLoading(true);
    setErrorMessage('');
    try {
      const res = await fetch('/api/auth/admin-login', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          usernameOrEmail: 'admin@firstatlanticbank.com',
          password: 'AdminMaster2026!'
        })
      });
      const data = await res.json();
      if (res.ok && data.isAdmin) {
        showToast('SUCCESS', 'Admin Session Verified', 'Authenticated as Alexandra Vance (Chief Risk Officer & Master Admin).');
        switchToAdmin();
      } else {
        setErrorMessage(data.error || 'Failed to authenticate administrator session.');
      }
    } catch (err: any) {
      setErrorMessage(err.message || 'Connection error to core admin server.');
    } finally {
      setIsLoading(false);
    }
  };

  // MFA Challenge State
  const [mfaChallenge, setMfaChallenge] = useState<{
    required: boolean;
    userId?: string;
    phoneMasked?: string;
    method?: string;
    code: string;
  } | null>(null);

  const handleInitialSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setErrorMessage('');
    setApplicationNotice(null);
    setIsLoading(true);

    try {
      const res = await fetch('/api/auth/login', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ usernameOrEmail: username, password })
      });

      const data = await res.json();
      if (!res.ok) {
        if (data.error === 'ACCOUNT_PENDING_APPROVAL' || data.approval_status === 'PENDING' || (data.status && data.status.startsWith('PENDING'))) {
          setApplicationNotice({
            referenceNumber: data.referenceNumber || 'FAB-ACT-2026',
            status: data.approval_status || data.status || 'PENDING_DUAL_APPROVAL',
            submittedAt: data.submittedAt,
            message: data.message || 'Your account registration is pending dual-signature administrative approval and activation.'
          });
          return;
        }
        if (data.error === 'ACCOUNT_SUSPENDED' || data.approval_status === 'SUSPENDED') {
          setErrorMessage(data.message || 'Account access is currently suspended. Please contact Private Banking Concierge.');
          return;
        }
        setErrorMessage(data.message || data.error || 'Authentication failed. Please verify your credentials.');
        return;
      }

      if (data.isAdmin) {
        showToast('SUCCESS', 'Master Administrator Authenticated', `Welcome, ${data.adminUser?.name || 'Alexandra Vance'}.`);
        switchToAdmin();
        return;
      }

      if (data.mfaRequired) {
        setMfaChallenge({
          required: true,
          userId: data.userId,
          phoneMasked: data.phoneMasked,
          method: data.mfaMethod,
          code: '849201'
        });
      } else if (data.token && data.user) {
        login(data.token, data.user);
      }
    } catch (err: any) {
      setErrorMessage(err.message || 'Unable to connect to core authentication server.');
    } finally {
      setIsLoading(false);
    }
  };

  const handleMfaVerify = async (useBiometric = false) => {
    if (!mfaChallenge) return;
    setIsLoading(true);
    setErrorMessage('');

    try {
      const codeToSend = useBiometric ? 'BIOMETRIC_PASS' : mfaChallenge.code;
      const res = await fetch('/api/auth/mfa-verify', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          userId: mfaChallenge.userId,
          code: codeToSend,
          rememberDevice
        })
      });

      const data = await res.json();
      if (!res.ok) {
        setErrorMessage(data.error || 'Verification code failed.');
        return;
      }

      login(data.token, data.user);
    } catch (err: any) {
      setErrorMessage(err.message || 'MFA validation exception.');
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="min-h-[85vh] bg-[#f8fafc] flex flex-col justify-center items-center py-10 px-4 sm:px-6">
      <div className="w-full max-w-lg space-y-5">
        {/* Institutional Branding Header */}
        <div className="text-center space-y-1.5">
          <div className="inline-block">
            <InstitutionalCrest size="lg" variant="light" />
          </div>
          <p className="text-xs uppercase tracking-widest text-[#8c6d37] font-semibold pt-1 font-sans">
            Global Private &amp; Institutional Banking Gateway
          </p>
        </div>

        {/* Segmented Gateway Portal Switcher */}
        <div className="bg-slate-200/90 p-1 rounded-xl flex items-center gap-1 shadow-inner border border-slate-300">
          <button
            type="button"
            onClick={() => {
              setAuthMode('CLIENT');
              setErrorMessage('');
              if (username === 'admin@firstatlanticbank.com') {
                setUsername('');
                setPassword('');
              }
            }}
            className={`flex-1 py-2 px-3 rounded-lg text-xs font-bold transition-all flex items-center justify-center gap-2 cursor-pointer ${
              authMode === 'CLIENT'
                ? 'bg-white text-[#0a192f] shadow-sm'
                : 'text-slate-600 hover:text-slate-900'
            }`}
          >
            <User className="w-3.5 h-3.5 text-[#8c6d37]" />
            <span>Private Client Portal</span>
          </button>

          <button
            type="button"
            onClick={() => {
              fillAdminCredentials();
            }}
            className={`flex-1 py-2 px-3 rounded-lg text-xs font-bold transition-all flex items-center justify-center gap-2 cursor-pointer ${
              authMode === 'ADMIN'
                ? 'bg-[#0a192f] text-[#d4af37] shadow-sm'
                : 'text-slate-600 hover:text-slate-900'
            }`}
          >
            <ShieldCheck className="w-3.5 h-3.5 text-[#d4af37]" />
            <span>Master Admin &amp; Compliance</span>
          </button>
        </div>

        {/* Main Sign In Container */}
        <div
          className={`rounded-2xl p-6 sm:p-8 border shadow-xl transition-all space-y-5 ${
            authMode === 'ADMIN'
              ? 'bg-[#071526] border-[#1e4573] text-slate-100'
              : 'bg-white border-slate-200 text-slate-900'
          }`}
        >
          {/* Header Banner */}
          {authMode === 'ADMIN' ? (
            <div className="p-3.5 rounded-xl bg-[#0c223c] border border-[#c5a880]/30 space-y-1.5 font-sans">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-2 text-[#d4af37] font-bold text-xs">
                  <ShieldCheck className="w-4 h-4 text-emerald-400" />
                  <span>MASTER ADMINISTRATOR GATEWAY</span>
                </div>
                <span className="text-[10px] uppercase font-mono px-2 py-0.5 rounded bg-emerald-500/20 text-emerald-300 border border-emerald-500/30 font-bold">
                  SUPER ADMIN
                </span>
              </div>
              <p className="text-[11px] text-slate-300 leading-relaxed">
                Executive back-office suite for onboarding compliance, KYC approvals, automated alerts, clearing settlement, and double-entry general ledger.
              </p>
            </div>
          ) : (
            <div className="flex items-center justify-between pb-1 border-b border-slate-100">
              <div>
                <h2 className="text-base font-bold font-serif text-slate-900">
                  Client Account Sign In
                </h2>
                <p className="text-xs text-slate-500">
                  Access your multi-currency accounts, wires, and private banking.
                </p>
              </div>
            </div>
          )}

          {errorMessage && (
            <div className="p-3.5 rounded-xl bg-rose-50 border border-rose-200 text-rose-800 text-xs flex items-start gap-2.5">
              <AlertCircle className="w-4 h-4 text-rose-600 shrink-0 mt-0.5" />
              <span>{errorMessage}</span>
            </div>
          )}

          {applicationNotice && (
            <div className="p-4 rounded-xl bg-amber-50 border border-amber-200 text-amber-900 text-xs space-y-2">
              <div className="flex items-center gap-2 font-bold text-amber-800">
                <AlertCircle className="w-4 h-4 text-amber-600 shrink-0" />
                <span>Application Under Compliance Review</span>
              </div>
              <p className="text-slate-700">{applicationNotice.message}</p>
              {applicationNotice.referenceNumber && (
                <div className="bg-white/80 p-2 rounded border border-amber-200 font-mono text-[11px] text-slate-800">
                  Reference: <span className="font-bold text-slate-950">{applicationNotice.referenceNumber}</span>
                </div>
              )}
              <p className="text-[11px] text-slate-500">
                Our compliance officers review new accounts within 1–2 business days. Once approved, your IBANs and account access will be activated immediately.
              </p>
            </div>
          )}

          {!mfaChallenge ? (
            /* Standard Login Form */
            <form onSubmit={handleInitialSubmit} className="space-y-4">
              <div>
                <label
                  className={`block text-xs font-bold uppercase tracking-wider mb-1.5 font-sans ${
                    authMode === 'ADMIN' ? 'text-slate-300' : 'text-slate-700'
                  }`}
                >
                  {authMode === 'ADMIN' ? 'Administrator Identifier or Email' : 'Username or Client ID'}
                </label>
                <div className="relative">
                  <div
                    className={`absolute inset-y-0 left-0 pl-3.5 flex items-center pointer-events-none ${
                      authMode === 'ADMIN' ? 'text-[#d4af37]' : 'text-slate-400'
                    }`}
                  >
                    {authMode === 'ADMIN' ? <Shield className="w-4 h-4" /> : <User className="w-4 h-4" />}
                  </div>
                  <input
                    type="text"
                    required
                    value={username}
                    onChange={(e) => setUsername(e.target.value)}
                    placeholder={
                      authMode === 'ADMIN'
                        ? 'admin@firstatlanticbank.com'
                        : 'Enter your FAB username or Client ID'
                    }
                    className={`w-full pl-10 pr-3.5 py-2.5 text-sm rounded-lg font-sans transition-all focus:outline-none ${
                      authMode === 'ADMIN'
                        ? 'bg-[#0a1f38] border border-[#1e4573] text-slate-100 placeholder-slate-500 focus:border-[#d4af37] focus:ring-1 focus:ring-[#d4af37]'
                        : 'bg-slate-50 border border-slate-300 text-slate-900 placeholder-slate-400 focus:bg-white focus:border-[#8c6d37] focus:ring-1 focus:ring-[#8c6d37]'
                    }`}
                  />
                </div>
              </div>

              <div>
                <div className="flex justify-between items-center mb-1.5">
                  <label
                    className={`block text-xs font-bold uppercase tracking-wider font-sans ${
                      authMode === 'ADMIN' ? 'text-slate-300' : 'text-slate-700'
                    }`}
                  >
                    {authMode === 'ADMIN' ? 'Master Security Key / Password' : 'Password'}
                  </label>
                  {authMode === 'CLIENT' && (
                    <button
                      type="button"
                      onClick={() => showToast('INFO', 'Password Recovery', 'Security recovery instructions dispatched to your registered email.')}
                      className="text-[11px] text-[#8c6d37] hover:underline"
                    >
                      Forgot password?
                    </button>
                  )}
                </div>
                <div className="relative">
                  <div
                    className={`absolute inset-y-0 left-0 pl-3.5 flex items-center pointer-events-none ${
                      authMode === 'ADMIN' ? 'text-[#d4af37]' : 'text-slate-400'
                    }`}
                  >
                    <KeyRound className="w-4 h-4" />
                  </div>
                  <input
                    type="password"
                    required
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    placeholder="••••••••••••"
                    className={`w-full pl-10 pr-3.5 py-2.5 text-sm rounded-lg font-sans transition-all focus:outline-none ${
                      authMode === 'ADMIN'
                        ? 'bg-[#0a1f38] border border-[#1e4573] text-slate-100 placeholder-slate-500 focus:border-[#d4af37] focus:ring-1 focus:ring-[#d4af37]'
                        : 'bg-slate-50 border border-slate-300 text-slate-900 placeholder-slate-400 focus:bg-white focus:border-[#8c6d37] focus:ring-1 focus:ring-[#8c6d37]'
                    }`}
                  />
                </div>
              </div>

              <div className="flex items-center justify-between pt-0.5">
                <label
                  className={`flex items-center gap-2 text-xs cursor-pointer ${
                    authMode === 'ADMIN' ? 'text-slate-400' : 'text-slate-600'
                  }`}
                >
                  <input
                    type="checkbox"
                    checked={rememberDevice}
                    onChange={(e) => setRememberDevice(e.target.checked)}
                    className="rounded border-slate-300 text-[#0a192f] focus:ring-[#8c6d37]"
                  />
                  <span>Remember secure terminal</span>
                </label>
                <span className="text-[11px] font-mono text-emerald-400 flex items-center gap-1">
                  <span className="w-1.5 h-1.5 rounded-full bg-emerald-400 animate-pulse" />
                  FAB Core v4.9
                </span>
              </div>

              {/* Submit Buttons */}
              <div className="space-y-2 pt-1">
                <button
                  type="submit"
                  disabled={isLoading}
                  className={`w-full py-3 rounded-xl font-bold text-xs uppercase tracking-widest transition-all shadow-md flex items-center justify-center gap-2 font-sans cursor-pointer ${
                    authMode === 'ADMIN'
                      ? 'bg-gradient-to-r from-[#d4af37] to-[#b8952b] text-slate-950 hover:brightness-110'
                      : 'bg-[#0a192f] hover:bg-[#132d52] text-white'
                  }`}
                >
                  {isLoading ? (
                    <RefreshCw className="w-4 h-4 animate-spin text-slate-900" />
                  ) : authMode === 'ADMIN' ? (
                    <>
                      <ShieldCheck className="w-4 h-4 text-slate-950" />
                      <span>Sign In to Master Admin Suite</span>
                    </>
                  ) : (
                    <>
                      <Lock className="w-3.5 h-3.5 text-[#d4af37]" />
                      <span>Sign In to Account</span>
                    </>
                  )}
                </button>

                {/* Instant 1-Click Test Run Button for Admin */}
                {authMode === 'ADMIN' && (
                  <button
                    type="button"
                    disabled={isLoading}
                    onClick={handleInstantAdminTestRun}
                    className="w-full py-2.5 rounded-xl bg-slate-800/90 hover:bg-slate-800 text-slate-200 border border-slate-700 text-xs font-semibold flex items-center justify-center gap-2 transition cursor-pointer"
                  >
                    <span>⚡ 1-Click Instant Test Run (Alexandra Vance)</span>
                  </button>
                )}
              </div>
            </form>
          ) : (
            /* Multi-Factor Authentication Challenge */
            <div className="space-y-5 animate-in fade-in duration-300">
              <div className="text-center space-y-1">
                <div className="w-12 h-12 rounded-full bg-[#0a192f] text-[#d4af37] flex items-center justify-center mx-auto mb-3">
                  <ShieldCheck className="w-6 h-6" />
                </div>
                <h3 className="text-base font-bold font-serif text-slate-900">
                  Two-Factor Authentication Required
                </h3>
                <p className="text-xs text-slate-500">
                  Enter the 6-digit verification code sent to {mfaChallenge.phoneMasked || 'your registered device'}
                </p>
              </div>

              <div>
                <label className="block text-xs font-bold uppercase tracking-wider text-slate-700 mb-1.5 font-sans">
                  6-Digit Security Code
                </label>
                <input
                  type="text"
                  maxLength={6}
                  value={mfaChallenge.code}
                  onChange={(e) =>
                    setMfaChallenge({ ...mfaChallenge, code: e.target.value.replace(/\D/g, '') })
                  }
                  className="w-full text-center tracking-[0.5em] text-xl font-mono py-2.5 bg-slate-50 border border-slate-300 rounded-lg text-slate-900 focus:bg-white focus:outline-none focus:border-[#8c6d37]"
                />
              </div>

              <div className="space-y-2.5">
                <button
                  type="button"
                  disabled={isLoading || mfaChallenge.code.length !== 6}
                  onClick={() => handleMfaVerify(false)}
                  className="w-full py-3 rounded-xl bg-[#0a192f] hover:bg-[#132d52] text-white font-bold text-xs uppercase tracking-widest shadow-md flex items-center justify-center gap-2 cursor-pointer"
                >
                  <Lock className="w-3.5 h-3.5 text-[#d4af37]" />
                  <span>Verify &amp; Enter Dashboard</span>
                </button>

                <button
                  type="button"
                  onClick={() => handleMfaVerify(true)}
                  className="w-full py-2.5 rounded-xl border border-slate-300 hover:bg-slate-50 text-slate-700 font-semibold text-xs flex items-center justify-center gap-2 cursor-pointer"
                >
                  <Fingerprint className="w-4 h-4 text-[#8c6d37]" />
                  <span>Authenticate via Biometrics / Passkey</span>
                </button>
              </div>

              <div className="text-center pt-2">
                <button
                  type="button"
                  onClick={() => setMfaChallenge(null)}
                  className="text-xs text-slate-500 hover:text-slate-800 cursor-pointer"
                >
                  &larr; Back to sign in
                </button>
              </div>
            </div>
          )}

          {/* Test Credentials Sandbox Callout */}
          <div
            className={`p-3.5 rounded-xl text-xs space-y-2 border ${
              authMode === 'ADMIN'
                ? 'bg-[#091b30] border-[#1e4573] text-slate-300'
                : 'bg-slate-50 border-slate-200 text-slate-700'
            }`}
          >
            <div className="flex items-center justify-between">
              <span className="font-bold uppercase tracking-wider text-[10px] text-[#8c6d37] font-sans flex items-center gap-1">
                <KeyRound className="w-3 h-3" />
                {authMode === 'ADMIN' ? 'Master Admin Test Credentials' : 'Quick Demo Client Personas'}
              </span>
              <span className="text-[10px] text-slate-400 font-mono">Sandbox Enabled</span>
            </div>

            {authMode === 'ADMIN' ? (
              <div className="space-y-1.5 font-mono text-[11px]">
                <div className="flex items-center justify-between bg-[#061322] p-2 rounded border border-slate-800">
                  <span className="text-slate-400">Admin Email:</span>
                  <span className="text-amber-300 font-bold select-all">admin@firstatlanticbank.com</span>
                </div>
                <div className="flex items-center justify-between bg-[#061322] p-2 rounded border border-slate-800">
                  <span className="text-slate-400">Master Password:</span>
                  <span className="text-amber-300 font-bold select-all">AdminMaster2026!</span>
                </div>
                <div className="flex items-center justify-between bg-[#061322] p-2 rounded border border-slate-800">
                  <span className="text-slate-400">Authority Role:</span>
                  <span className="text-emerald-400 font-semibold">Alexandra Vance (CRO &amp; Super Admin)</span>
                </div>
                <div className="pt-1 flex gap-2">
                  <button
                    type="button"
                    onClick={fillAdminCredentials}
                    className="flex-1 py-1.5 px-2 rounded bg-slate-800 hover:bg-slate-700 text-slate-200 text-[10px] font-sans font-bold border border-slate-700 cursor-pointer"
                  >
                    Autofill Credentials
                  </button>
                  <button
                    type="button"
                    onClick={handleInstantAdminTestRun}
                    className="flex-1 py-1.5 px-2 rounded bg-[#d4af37]/20 hover:bg-[#d4af37]/30 text-[#d4af37] text-[10px] font-sans font-bold border border-[#d4af37]/40 cursor-pointer"
                  >
                    Direct Test Run
                  </button>
                </div>
              </div>
            ) : (
              <div className="flex flex-wrap gap-2 pt-1 font-sans">
                <button
                  type="button"
                  onClick={() => fillClientCredentials('sterling')}
                  className="px-2.5 py-1.5 rounded-lg bg-white border border-slate-300 hover:border-[#8c6d37] text-[11px] font-medium text-slate-800 flex items-center gap-1.5 cursor-pointer shadow-xs"
                >
                  <span className="w-2 h-2 rounded-full bg-blue-500" />
                  <span>Jonathan Sterling (US / Global)</span>
                </button>
                <button
                  type="button"
                  onClick={() => fillClientCredentials('montgomery')}
                  className="px-2.5 py-1.5 rounded-lg bg-white border border-slate-300 hover:border-[#8c6d37] text-[11px] font-medium text-slate-800 flex items-center gap-1.5 cursor-pointer shadow-xs"
                >
                  <span className="w-2 h-2 rounded-full bg-purple-500" />
                  <span>Evelyn Montgomery (UK Private)</span>
                </button>
              </div>
            )}
          </div>

          {/* Footer Inside Card */}
          <div
            className={`pt-3 border-t flex items-center justify-between text-xs ${
              authMode === 'ADMIN' ? 'border-slate-800 text-slate-400' : 'border-slate-100 text-slate-500'
            }`}
          >
            {authMode === 'ADMIN' ? (
              <>
                <span>Looking for client online banking?</span>
                <button
                  type="button"
                  onClick={() => {
                    setAuthMode('CLIENT');
                    setUsername('');
                    setPassword('');
                  }}
                  className="font-bold text-[#d4af37] hover:underline cursor-pointer"
                >
                  Client Portal &rarr;
                </button>
              </>
            ) : (
              <>
                <span>Need a new international account?</span>
                <button
                  type="button"
                  onClick={() => setCurrentView('AUTH_ENROLL')}
                  className="font-bold text-[#8c6d37] hover:underline cursor-pointer"
                >
                  Open Account &rarr;
                </button>
              </>
            )}
          </div>
        </div>

        {/* Security & System Info */}
        <div className="flex items-center justify-between text-xs text-slate-500 px-2 font-mono">
          <span className="flex items-center gap-1">
            <Shield className="w-3.5 h-3.5 text-[#8c6d37]" /> TLS 1.3 256-Bit SSL Encryption
          </span>
          <span className="text-slate-400">
            Protected Institutional Gateway
          </span>
        </div>
      </div>
    </div>
  );
};

export const EnrollPage: React.FC = () => {
  const { setCurrentView, submitAccountApplication, isLoading } = useBank();
  
  const [step, setStep] = useState(1);
  const [isSubmitted, setIsSubmitted] = useState(false);
  const [submissionReference, setSubmissionReference] = useState('');
  const [errorMsg, setErrorMsg] = useState('');

  // Full form state for real international banking onboarding
  const [formData, setFormData] = useState({
    // Step 1: Personal Profile
    title: 'Mr',
    firstName: '',
    middleName: '',
    lastName: '',
    dateOfBirth: '',
    email: '',
    countryCode: '+49',
    phone: '',
    nationality: 'Germany',
    username: '',
    password: '',
    confirmPassword: '',

    // Step 2: Residential Address & Tax Residency
    streetAddress: '',
    apartment: '',
    city: '',
    stateOrProvince: '',
    postalCode: '',
    countryOfResidence: 'Germany',
    taxId: '',
    taxResidencyCountry: 'Germany',

    // Step 3: Employment & Source of Funds
    employmentStatus: 'EMPLOYED',
    employerName: '',
    jobTitle: '',
    annualIncomeEur: '120000',
    sourceOfFunds: 'SALARY_AND_BONUS',
    estimatedLiquidWealthEur: '250000',

    // Step 4: Account Configuration & Regulation
    bookingRegion: 'EU' as BankRegion,
    accountType: 'PREMIER_MULTICURRENCY',
    primaryCurrency: 'EUR',
    initialDepositMinor: 2500000, // €25,000.00
    isPep: 'NO',
    termsAccepted: false,
    fatcaAccepted: false
  });

  const handleChange = (field: string, value: any) => {
    setFormData(prev => ({ ...prev, [field]: value }));
  };

  const validateStep1 = () => {
    if (!formData.firstName.trim() || !formData.lastName.trim() || !formData.email.trim() || !formData.phone.trim() || !formData.dateOfBirth) {
      setErrorMsg('Please complete all required personal details before continuing.');
      return false;
    }
    if (!formData.username.trim() || !formData.password.trim()) {
      setErrorMsg('Please specify your desired digital banking username and password.');
      return false;
    }
    if (formData.password.length < 8) {
      setErrorMsg('Password must contain at least 8 characters.');
      return false;
    }
    if (formData.password !== formData.confirmPassword) {
      setErrorMsg('Passwords do not match.');
      return false;
    }
    setErrorMsg('');
    return true;
  };

  const validateStep2 = () => {
    if (!formData.streetAddress.trim() || !formData.city.trim() || !formData.postalCode.trim() || !formData.taxId.trim()) {
      setErrorMsg('Please complete your residential address and Tax Identification Number.');
      return false;
    }
    setErrorMsg('');
    return true;
  };

  const validateStep3 = () => {
    if (!formData.employmentStatus || !formData.sourceOfFunds) {
      setErrorMsg('Please provide your employment status and source of funds.');
      return false;
    }
    setErrorMsg('');
    return true;
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!formData.termsAccepted || !formData.fatcaAccepted) {
      setErrorMsg('Please accept the regulatory agreements and disclosures to proceed.');
      return;
    }

    setErrorMsg('');
    const fullPhone = `${formData.countryCode} ${formData.phone}`.trim();
    
    const payload = {
      firstName: formData.firstName.trim(),
      lastName: formData.lastName.trim(),
      email: formData.email.trim().toLowerCase(),
      phone: fullPhone,
      username: formData.username.trim(),
      password: formData.password,
      dateOfBirth: formData.dateOfBirth,
      nationality: formData.nationality,
      region: formData.bookingRegion,
      address: {
        street: formData.apartment ? `${formData.streetAddress}, ${formData.apartment}` : formData.streetAddress,
        city: formData.city,
        state: formData.stateOrProvince || formData.city,
        postalCode: formData.postalCode,
        country: formData.countryOfResidence
      },
      employment: {
        status: formData.employmentStatus,
        employer: formData.employerName || 'Self-Employed / Independent',
        annualIncomeEur: Number(formData.annualIncomeEur) || 100000,
        sourceOfFunds: formData.sourceOfFunds
      },
      taxId: formData.taxId,
      product: formData.accountType,
      initialDepositAmount: Number(formData.initialDepositMinor) / 100
    };

    const result = await submitAccountApplication(payload);
    if (result.success && result.referenceNumber) {
      setSubmissionReference(result.referenceNumber);
      setIsSubmitted(true);
    } else if (result.error) {
      setErrorMsg(result.error);
    }
  };

  if (isSubmitted) {
    return (
      <div className="min-h-[85vh] bg-[#f8fafc] py-12 px-4 sm:px-6 flex justify-center items-center">
        <div className="w-full max-w-2xl bg-white rounded-2xl p-8 sm:p-10 border border-slate-200 shadow-2xl space-y-6 text-center">
          <div className="w-16 h-16 rounded-full bg-emerald-50 text-emerald-600 border-2 border-emerald-500/30 flex items-center justify-center mx-auto">
            <CheckCircle2 className="w-10 h-10" />
          </div>

          <div className="space-y-2">
            <span className="text-xs uppercase tracking-widest text-[#8c6d37] font-bold">
              Compliance Onboarding Dispatched
            </span>
            <h2 className="text-2xl sm:text-3xl font-bold font-serif text-slate-900">
              Account Application Submitted
            </h2>
            <p className="text-sm text-slate-600 max-w-lg mx-auto">
              Thank you, <span className="font-semibold text-slate-900">{formData.firstName} {formData.lastName}</span>. Your international account application has been received and registered into our executive compliance review queue.
            </p>
          </div>

          {/* Reference Card */}
          <div className="p-5 rounded-xl bg-slate-50 border border-slate-200 max-w-md mx-auto space-y-3 text-left font-mono">
            <div className="flex justify-between items-center text-xs">
              <span className="text-slate-500">Application Reference:</span>
              <span className="font-bold text-slate-950 text-sm">{submissionReference}</span>
            </div>
            <div className="flex justify-between items-center text-xs">
              <span className="text-slate-500">Booking Centre:</span>
              <span className="font-semibold text-slate-800">
                {formData.bookingRegion === 'EU' ? '🇪🇺 Frankfurt (ECB / SEPA)' : formData.bookingRegion === 'UK' ? '🇬🇧 London Mayfair (PRA / FSCS)' : '🇺🇸 New York Wall St (FDIC)'}
              </span>
            </div>
            <div className="flex justify-between items-center text-xs">
              <span className="text-slate-500">Initial Deposit:</span>
              <span className="font-semibold text-slate-800">€{(Number(formData.initialDepositMinor) / 100).toLocaleString()}</span>
            </div>
            <div className="flex justify-between items-center text-xs">
              <span className="text-slate-500">Status:</span>
              <span className="px-2 py-0.5 rounded bg-amber-100 text-amber-800 text-[11px] font-bold">
                PENDING COMPLIANCE APPROVAL
              </span>
            </div>
          </div>

          {/* Workflow Explanation */}
          <div className="p-4 rounded-xl bg-blue-50/70 border border-blue-200 text-xs text-blue-950 text-left space-y-2 max-w-lg mx-auto">
            <div className="font-bold flex items-center gap-2">
              <ShieldCheck className="w-4 h-4 text-blue-700 shrink-0" />
              <span>What happens next?</span>
            </div>
            <ul className="space-y-1.5 text-slate-700 list-disc list-inside">
              <li>Our compliance officers verify your identity and tax identification.</li>
              <li>Once approved by the Bank Admin, your international IBAN, routing numbers, and multicurrency accounts are generated automatically.</li>
              <li>You can sign in immediately once the application is approved using the username and password you just selected.</li>
            </ul>
          </div>

          <div className="flex flex-col sm:flex-row gap-3 justify-center pt-2">
            <button
              onClick={() => setCurrentView('AUTH_LOGIN')}
              className="px-6 py-3 rounded-xl bg-[#0a192f] hover:bg-[#132d52] text-white font-bold text-xs uppercase tracking-widest shadow-md transition-all"
            >
              Go to Sign In Screen
            </button>
            <button
              onClick={() => setCurrentView('PUBLIC_HOME')}
              className="px-6 py-3 rounded-xl border border-slate-300 hover:bg-slate-50 text-slate-700 font-semibold text-xs transition-all"
            >
              Return to Homepage
            </button>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-[85vh] bg-[#f8fafc] py-10 px-4 sm:px-6 flex justify-center items-center">
      <div className="w-full max-w-3xl bg-white rounded-2xl p-6 sm:p-10 border border-slate-200 shadow-xl space-y-7">
        {/* Header */}
        <div className="text-center space-y-1.5 border-b border-slate-100 pb-6">
          <InstitutionalCrest size="md" variant="light" />
          <h2 className="text-2xl sm:text-3xl font-bold font-serif text-slate-900 pt-2">
            Open an International Bank Account
          </h2>
          <p className="text-xs text-slate-500 max-w-lg mx-auto">
            European Central Bank &amp; Transatlantic Regulatory Compliance • Multicurrency IBANs in EUR, GBP &amp; USD • Institutional Deposit Protection
          </p>
        </div>

        {/* Multi-Step Progress Stepper */}
        <div className="grid grid-cols-4 gap-2 text-center text-xs font-semibold">
          {[
            { num: 1, label: '1. Applicant Info' },
            { num: 2, label: '2. Address & Tax' },
            { num: 3, label: '3. Employment & KYC' },
            { num: 4, label: '4. Jurisdictions' }
          ].map((s) => (
            <div
              key={s.num}
              className={`p-2.5 rounded-xl border transition-all ${
                step === s.num
                  ? 'bg-[#0a192f] text-[#d4af37] border-[#0a192f] shadow-sm'
                  : step > s.num
                  ? 'bg-emerald-50 text-emerald-800 border-emerald-200 font-medium'
                  : 'bg-slate-50 text-slate-400 border-slate-200'
              }`}
            >
              <div className="flex items-center justify-center gap-1.5">
                {step > s.num && <Check className="w-3.5 h-3.5 text-emerald-600" />}
                <span className="text-[11px] sm:text-xs truncate">{s.label}</span>
              </div>
            </div>
          ))}
        </div>

        {errorMsg && (
          <div className="p-3.5 rounded-xl bg-rose-50 border border-rose-200 text-rose-800 text-xs flex items-start gap-2.5">
            <AlertCircle className="w-4 h-4 text-rose-600 shrink-0 mt-0.5" />
            <span>{errorMsg}</span>
          </div>
        )}

        <form onSubmit={handleSubmit} className="space-y-6">
          {/* STEP 1: Personal Applicant Details */}
          {step === 1 && (
            <div className="space-y-4">
              <div className="text-xs uppercase font-bold tracking-wider text-[#8c6d37] font-mono border-b border-slate-100 pb-1">
                Primary Account Holder Identity
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-4 gap-3">
                <div className="sm:col-span-1">
                  <label className="block text-xs font-bold uppercase text-slate-700 mb-1">Title</label>
                  <select
                    value={formData.title}
                    onChange={(e) => handleChange('title', e.target.value)}
                    className="w-full px-3 py-2 text-sm bg-slate-50 border border-slate-300 rounded-lg text-slate-900 focus:bg-white focus:outline-none focus:border-[#8c6d37]"
                  >
                    <option value="Mr">Mr.</option>
                    <option value="Ms">Ms.</option>
                    <option value="Mrs">Mrs.</option>
                    <option value="Dr">Dr.</option>
                    <option value="Prof">Prof.</option>
                    <option value="Baron">Baron / Baroness</option>
                  </select>
                </div>

                <div className="sm:col-span-3 grid grid-cols-2 gap-3">
                  <div>
                    <label className="block text-xs font-bold uppercase text-slate-700 mb-1">First Name *</label>
                    <input
                      type="text"
                      required
                      placeholder="e.g. Maximilian"
                      value={formData.firstName}
                      onChange={(e) => handleChange('firstName', e.target.value)}
                      className="w-full px-3.5 py-2 text-sm bg-slate-50 border border-slate-300 rounded-lg text-slate-900 focus:bg-white focus:outline-none focus:border-[#8c6d37]"
                    />
                  </div>
                  <div>
                    <label className="block text-xs font-bold uppercase text-slate-700 mb-1">Last Name *</label>
                    <input
                      type="text"
                      required
                      placeholder="e.g. Von Schneider"
                      value={formData.lastName}
                      onChange={(e) => handleChange('lastName', e.target.value)}
                      className="w-full px-3.5 py-2 text-sm bg-slate-50 border border-slate-300 rounded-lg text-slate-900 focus:bg-white focus:outline-none focus:border-[#8c6d37]"
                    />
                  </div>
                </div>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                <div>
                  <label className="block text-xs font-bold uppercase text-slate-700 mb-1">Date of Birth *</label>
                  <input
                    type="date"
                    required
                    value={formData.dateOfBirth}
                    onChange={(e) => handleChange('dateOfBirth', e.target.value)}
                    className="w-full px-3.5 py-2 text-sm bg-slate-50 border border-slate-300 rounded-lg text-slate-900 focus:bg-white focus:outline-none focus:border-[#8c6d37]"
                  />
                </div>
                <div>
                  <label className="block text-xs font-bold uppercase text-slate-700 mb-1">Nationality / Citizenship *</label>
                  <select
                    value={formData.nationality}
                    onChange={(e) => handleChange('nationality', e.target.value)}
                    className="w-full px-3.5 py-2 text-sm bg-slate-50 border border-slate-300 rounded-lg text-slate-900 focus:bg-white focus:outline-none focus:border-[#8c6d37]"
                  >
                    <option value="Germany">Germany (Deutschland)</option>
                    <option value="France">France</option>
                    <option value="Italy">Italy (Italia)</option>
                    <option value="Spain">Spain (España)</option>
                    <option value="Netherlands">Netherlands (Nederland)</option>
                    <option value="Switzerland">Switzerland (Schweiz)</option>
                    <option value="Austria">Austria (Österreich)</option>
                    <option value="Belgium">Belgium</option>
                    <option value="Ireland">Ireland</option>
                    <option value="Luxembourg">Luxembourg</option>
                    <option value="Sweden">Sweden</option>
                    <option value="United Kingdom">United Kingdom</option>
                    <option value="United States">United States</option>
                  </select>
                </div>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                <div>
                  <label className="block text-xs font-bold uppercase text-slate-700 mb-1">Email Address *</label>
                  <input
                    type="email"
                    required
                    placeholder="name@domain.com"
                    value={formData.email}
                    onChange={(e) => handleChange('email', e.target.value)}
                    className="w-full px-3.5 py-2 text-sm bg-slate-50 border border-slate-300 rounded-lg text-slate-900 focus:bg-white focus:outline-none focus:border-[#8c6d37]"
                  />
                </div>
                <div>
                  <label className="block text-xs font-bold uppercase text-slate-700 mb-1">Mobile Telephone *</label>
                  <div className="flex gap-2">
                    <select
                      value={formData.countryCode}
                      onChange={(e) => handleChange('countryCode', e.target.value)}
                      className="w-28 px-2 py-2 text-xs bg-slate-50 border border-slate-300 rounded-lg text-slate-900 focus:bg-white"
                    >
                      <option value="+49">🇩🇪 +49 (DE)</option>
                      <option value="+33">🇫🇷 +33 (FR)</option>
                      <option value="+39">🇮🇹 +39 (IT)</option>
                      <option value="+34">🇪🇸 +34 (ES)</option>
                      <option value="+31">🇳🇱 +31 (NL)</option>
                      <option value="+41">🇨🇭 +41 (CH)</option>
                      <option value="+43">🇦🇹 +43 (AT)</option>
                      <option value="+353">🇮🇪 +353 (IE)</option>
                      <option value="+44">🇬🇧 +44 (UK)</option>
                      <option value="+1">🇺🇸 +1 (US)</option>
                    </select>
                    <input
                      type="tel"
                      required
                      placeholder="170 1234567"
                      value={formData.phone}
                      onChange={(e) => handleChange('phone', e.target.value)}
                      className="flex-1 px-3.5 py-2 text-sm bg-slate-50 border border-slate-300 rounded-lg text-slate-900 focus:bg-white focus:outline-none focus:border-[#8c6d37]"
                    />
                  </div>
                </div>
              </div>

              {/* Online Banking Credentials Configuration */}
              <div className="p-4 bg-slate-50 rounded-xl border border-slate-200 space-y-3">
                <span className="text-xs font-bold uppercase tracking-wider text-slate-800 flex items-center gap-1.5 font-sans">
                  <Lock className="w-3.5 h-3.5 text-[#8c6d37]" />
                  <span>Choose Your Digital Banking Login Credentials</span>
                </span>
                <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
                  <div>
                    <label className="block text-[11px] font-bold text-slate-600 mb-1">Username *</label>
                    <input
                      type="text"
                      required
                      placeholder="e.g. mschneider"
                      value={formData.username}
                      onChange={(e) => handleChange('username', e.target.value)}
                      className="w-full px-3 py-2 text-xs bg-white border border-slate-300 rounded-lg text-slate-900 font-mono"
                    />
                  </div>
                  <div>
                    <label className="block text-[11px] font-bold text-slate-600 mb-1">Password *</label>
                    <input
                      type="password"
                      required
                      placeholder="Min 8 characters"
                      value={formData.password}
                      onChange={(e) => handleChange('password', e.target.value)}
                      className="w-full px-3 py-2 text-xs bg-white border border-slate-300 rounded-lg text-slate-900"
                    />
                  </div>
                  <div>
                    <label className="block text-[11px] font-bold text-slate-600 mb-1">Confirm Password *</label>
                    <input
                      type="password"
                      required
                      placeholder="Repeat password"
                      value={formData.confirmPassword}
                      onChange={(e) => handleChange('confirmPassword', e.target.value)}
                      className="w-full px-3 py-2 text-xs bg-white border border-slate-300 rounded-lg text-slate-900"
                    />
                  </div>
                </div>
              </div>

              <button
                type="button"
                onClick={() => {
                  if (validateStep1()) setStep(2);
                }}
                className="w-full py-3 rounded-xl bg-[#0a192f] hover:bg-[#132d52] text-white font-bold text-xs uppercase tracking-widest transition-all shadow-md flex items-center justify-center gap-2"
              >
                <span>Continue to Residential &amp; Tax Info</span>
                <ArrowRight className="w-4 h-4" />
              </button>
            </div>
          )}

          {/* STEP 2: Residential Address & Tax Residency */}
          {step === 2 && (
            <div className="space-y-4">
              <div className="text-xs uppercase font-bold tracking-wider text-[#8c6d37] font-mono border-b border-slate-100 pb-1">
                Residential Address &amp; International Tax Residency
              </div>

              <div>
                <label className="block text-xs font-bold uppercase text-slate-700 mb-1">Street Address *</label>
                <input
                  type="text"
                  required
                  placeholder="e.g. Bockenheimer Landstraße 24"
                  value={formData.streetAddress}
                  onChange={(e) => handleChange('streetAddress', e.target.value)}
                  className="w-full px-3.5 py-2 text-sm bg-slate-50 border border-slate-300 rounded-lg text-slate-900 focus:bg-white focus:outline-none focus:border-[#8c6d37]"
                />
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
                <div>
                  <label className="block text-xs font-bold uppercase text-slate-700 mb-1">Apartment / Suite</label>
                  <input
                    type="text"
                    placeholder="e.g. Floor 4, Suite B"
                    value={formData.apartment}
                    onChange={(e) => handleChange('apartment', e.target.value)}
                    className="w-full px-3.5 py-2 text-sm bg-slate-50 border border-slate-300 rounded-lg text-slate-900 focus:bg-white"
                  />
                </div>
                <div>
                  <label className="block text-xs font-bold uppercase text-slate-700 mb-1">City *</label>
                  <input
                    type="text"
                    required
                    placeholder="e.g. Frankfurt am Main"
                    value={formData.city}
                    onChange={(e) => handleChange('city', e.target.value)}
                    className="w-full px-3.5 py-2 text-sm bg-slate-50 border border-slate-300 rounded-lg text-slate-900 focus:bg-white"
                  />
                </div>
                <div>
                  <label className="block text-xs font-bold uppercase text-slate-700 mb-1">Postal / ZIP Code *</label>
                  <input
                    type="text"
                    required
                    placeholder="e.g. 60323"
                    value={formData.postalCode}
                    onChange={(e) => handleChange('postalCode', e.target.value)}
                    className="w-full px-3.5 py-2 text-sm bg-slate-50 border border-slate-300 rounded-lg text-slate-900 focus:bg-white font-mono"
                  />
                </div>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                <div>
                  <label className="block text-xs font-bold uppercase text-slate-700 mb-1">Country of Residence *</label>
                  <select
                    value={formData.countryOfResidence}
                    onChange={(e) => handleChange('countryOfResidence', e.target.value)}
                    className="w-full px-3.5 py-2 text-sm bg-slate-50 border border-slate-300 rounded-lg text-slate-900 focus:bg-white"
                  >
                    <option value="Germany">Germany (Deutschland)</option>
                    <option value="France">France</option>
                    <option value="Italy">Italy (Italia)</option>
                    <option value="Spain">Spain (España)</option>
                    <option value="Netherlands">Netherlands</option>
                    <option value="Switzerland">Switzerland</option>
                    <option value="Austria">Austria</option>
                    <option value="Belgium">Belgium</option>
                    <option value="Ireland">Ireland</option>
                    <option value="United Kingdom">United Kingdom</option>
                    <option value="United States">United States</option>
                  </select>
                </div>
                <div>
                  <label className="block text-xs font-bold uppercase text-slate-700 mb-1">
                    Tax ID (Steuernummer / NIF / SSN / NIN) *
                  </label>
                  <input
                    type="text"
                    required
                    placeholder="e.g. DE 815 492 810"
                    value={formData.taxId}
                    onChange={(e) => handleChange('taxId', e.target.value)}
                    className="w-full px-3.5 py-2 text-sm bg-slate-50 border border-slate-300 rounded-lg text-slate-900 focus:bg-white font-mono"
                  />
                </div>
              </div>

              <div className="flex gap-3 pt-2">
                <button
                  type="button"
                  onClick={() => setStep(1)}
                  className="w-1/3 py-2.5 rounded-xl border border-slate-300 hover:bg-slate-50 text-slate-700 font-semibold text-xs"
                >
                  Back
                </button>
                <button
                  type="button"
                  onClick={() => {
                    if (validateStep2()) setStep(3);
                  }}
                  className="w-2/3 py-2.5 rounded-xl bg-[#0a192f] hover:bg-[#132d52] text-white font-bold text-xs uppercase tracking-widest flex items-center justify-center gap-2"
                >
                  <span>Continue to Employment &amp; KYC</span>
                  <ArrowRight className="w-4 h-4" />
                </button>
              </div>
            </div>
          )}

          {/* STEP 3: Employment, Wealth & Source of Funds */}
          {step === 3 && (
            <div className="space-y-4">
              <div className="text-xs uppercase font-bold tracking-wider text-[#8c6d37] font-mono border-b border-slate-100 pb-1">
                Financial Profile &amp; Anti-Money Laundering (AML) KYC
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                <div>
                  <label className="block text-xs font-bold uppercase text-slate-700 mb-1">Employment Status *</label>
                  <select
                    value={formData.employmentStatus}
                    onChange={(e) => handleChange('employmentStatus', e.target.value)}
                    className="w-full px-3.5 py-2 text-sm bg-slate-50 border border-slate-300 rounded-lg text-slate-900 focus:bg-white"
                  >
                    <option value="EXECUTIVE_DIRECTOR">Corporate Executive / Managing Director</option>
                    <option value="EMPLOYED">Employed Professional</option>
                    <option value="BUSINESS_OWNER">Business Owner / Entrepreneur</option>
                    <option value="INVESTOR">Private Investor / Family Office</option>
                    <option value="RETIRED">Retired</option>
                  </select>
                </div>

                <div>
                  <label className="block text-xs font-bold uppercase text-slate-700 mb-1">Employer / Business Name</label>
                  <input
                    type="text"
                    placeholder="e.g. Allianz Global Investors / Tech GmbH"
                    value={formData.employerName}
                    onChange={(e) => handleChange('employerName', e.target.value)}
                    className="w-full px-3.5 py-2 text-sm bg-slate-50 border border-slate-300 rounded-lg text-slate-900 focus:bg-white"
                  />
                </div>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                <div>
                  <label className="block text-xs font-bold uppercase text-slate-700 mb-1">Annual Income Bracket (€ / $ / £) *</label>
                  <select
                    value={formData.annualIncomeEur}
                    onChange={(e) => handleChange('annualIncomeEur', e.target.value)}
                    className="w-full px-3.5 py-2 text-sm bg-slate-50 border border-slate-300 rounded-lg text-slate-900 focus:bg-white"
                  >
                    <option value="75000">€50,000 – €100,000</option>
                    <option value="150000">€100,000 – €250,000</option>
                    <option value="350000">€250,000 – €500,000</option>
                    <option value="750000">€500,000 – €1,000,000</option>
                    <option value="2000000">€1,000,000+</option>
                  </select>
                </div>

                <div>
                  <label className="block text-xs font-bold uppercase text-slate-700 mb-1">Primary Source of Wealth *</label>
                  <select
                    value={formData.sourceOfFunds}
                    onChange={(e) => handleChange('sourceOfFunds', e.target.value)}
                    className="w-full px-3.5 py-2 text-sm bg-slate-50 border border-slate-300 rounded-lg text-slate-900 focus:bg-white"
                  >
                    <option value="SALARY_AND_BONUS">Executive Salary, Bonus &amp; Equity</option>
                    <option value="BUSINESS_PROFIT">Commercial Business Profits &amp; Dividends</option>
                    <option value="INVESTMENT_RETURNS">Capital Markets &amp; Securities Trading</option>
                    <option value="REAL_ESTATE">Real Estate Holdings &amp; Rental Income</option>
                    <option value="INHERITANCE">Inheritance &amp; Trust Distributions</option>
                  </select>
                </div>
              </div>

              <div className="p-3.5 rounded-xl bg-slate-50 border border-slate-200 text-xs text-slate-600 space-y-1">
                <span className="font-bold text-slate-900">European &amp; Global Banking Compliance Notice:</span>
                <p>In adherence to EU 5th AML Directive and international FATCA/CRS frameworks, First Atlantic Bank cross-references applicant identity against global compliance registries.</p>
              </div>

              <div className="flex gap-3 pt-2">
                <button
                  type="button"
                  onClick={() => setStep(2)}
                  className="w-1/3 py-2.5 rounded-xl border border-slate-300 hover:bg-slate-50 text-slate-700 font-semibold text-xs"
                >
                  Back
                </button>
                <button
                  type="button"
                  onClick={() => {
                    if (validateStep3()) setStep(4);
                  }}
                  className="w-2/3 py-2.5 rounded-xl bg-[#0a192f] hover:bg-[#132d52] text-white font-bold text-xs uppercase tracking-widest flex items-center justify-center gap-2"
                >
                  <span>Continue to Account Tier &amp; Booking</span>
                  <ArrowRight className="w-4 h-4" />
                </button>
              </div>
            </div>
          )}

          {/* STEP 4: Account Configuration, Region & Agreements */}
          {step === 4 && (
            <div className="space-y-5">
              <div className="text-xs uppercase font-bold tracking-wider text-[#8c6d37] font-mono border-b border-slate-100 pb-1">
                Jurisdiction Booking Hub &amp; Final Authorization
              </div>

              <div>
                <label className="block text-xs font-bold uppercase text-slate-700 mb-2">
                  Primary Booking Jurisdiction *
                </label>
                <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
                  {[
                    { id: 'EU', label: 'European Union Hub', sub: 'Frankfurt / Zurich • EUR SEPA & IBAN', flag: '🇪🇺' },
                    { id: 'UK', label: 'United Kingdom Hub', sub: 'London Mayfair • GBP Faster Payments', flag: '🇬🇧' },
                    { id: 'US', label: 'United States Hub', sub: 'New York Wall St • USD Fedwire / ACH', flag: '🇺🇸' }
                  ].map((r) => (
                    <button
                      key={r.id}
                      type="button"
                      onClick={() => handleChange('bookingRegion', r.id)}
                      className={`p-3.5 rounded-xl border text-left transition-all ${
                        formData.bookingRegion === r.id
                          ? 'border-[#8c6d37] bg-amber-50/50 ring-2 ring-[#8c6d37]/20'
                          : 'border-slate-200 bg-slate-50 hover:bg-white'
                      }`}
                    >
                      <div className="text-xl mb-1">{r.flag}</div>
                      <div className="text-xs font-bold text-slate-900">{r.label}</div>
                      <div className="text-[11px] text-slate-500">{r.sub}</div>
                    </button>
                  ))}
                </div>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                <div>
                  <label className="block text-xs font-bold uppercase text-slate-700 mb-1">Initial Opening Funding Amount (€/$/£)</label>
                  <input
                    type="number"
                    required
                    min="1000"
                    value={formData.initialDepositMinor / 100}
                    onChange={(e) => handleChange('initialDepositMinor', Math.round(Number(e.target.value) * 100))}
                    className="w-full px-3.5 py-2 text-sm bg-slate-50 border border-slate-300 rounded-lg text-slate-900 focus:bg-white font-mono"
                  />
                  <span className="text-[11px] text-slate-500 mt-1 block">
                    Funds will be ledger-credited upon Admin approval.
                  </span>
                </div>

                <div>
                  <label className="block text-xs font-bold uppercase text-slate-700 mb-1">Politically Exposed Person (PEP) Status</label>
                  <select
                    value={formData.isPep}
                    onChange={(e) => handleChange('isPep', e.target.value)}
                    className="w-full px-3.5 py-2 text-sm bg-slate-50 border border-slate-300 rounded-lg text-slate-900 focus:bg-white"
                  >
                    <option value="NO">No - Not a PEP or close associate</option>
                    <option value="YES">Yes - PEP or family member of PEP</option>
                  </select>
                </div>
              </div>

              {/* Regulatory Affirmations */}
              <div className="space-y-3 pt-2">
                <label className="flex items-start gap-2.5 text-xs text-slate-700 cursor-pointer">
                  <input
                    type="checkbox"
                    checked={formData.termsAccepted}
                    onChange={(e) => handleChange('termsAccepted', e.target.checked)}
                    className="mt-0.5 rounded border-slate-300 text-[#0a192f] focus:ring-[#8c6d37]"
                  />
                  <span>
                    I confirm that the information provided is accurate and true, and I agree to First Atlantic Bank Master Client Agreement, European Central Bank electronic settlement regulations, and statutory data governance.
                  </span>
                </label>

                <label className="flex items-start gap-2.5 text-xs text-slate-700 cursor-pointer">
                  <input
                    type="checkbox"
                    checked={formData.fatcaAccepted}
                    onChange={(e) => handleChange('fatcaAccepted', e.target.checked)}
                    className="mt-0.5 rounded border-slate-300 text-[#0a192f] focus:ring-[#8c6d37]"
                  />
                  <span>
                    I certify my declared tax residency and acknowledge Common Reporting Standard (CRS) and FATCA automatic exchange of financial information standards.
                  </span>
                </label>
              </div>

              <div className="flex gap-3 pt-2">
                <button
                  type="button"
                  onClick={() => setStep(3)}
                  className="w-1/3 py-3 rounded-xl border border-slate-300 hover:bg-slate-50 text-slate-700 font-semibold text-xs"
                >
                  Back
                </button>
                <button
                  type="submit"
                  disabled={isLoading || !formData.termsAccepted || !formData.fatcaAccepted}
                  className="w-2/3 py-3 rounded-xl bg-gradient-to-r from-[#c5a880] to-[#b39366] hover:brightness-105 text-slate-950 font-bold text-xs uppercase tracking-widest shadow-lg flex items-center justify-center gap-2"
                >
                  {isLoading ? (
                    <RefreshCw className="w-4 h-4 animate-spin" />
                  ) : (
                    <>
                      <BadgeCheck className="w-4 h-4" />
                      <span>Submit Application for Approval</span>
                    </>
                  )}
                </button>
              </div>
            </div>
          )}
        </form>

        <div className="text-center pt-2 border-t border-slate-100">
          <button
            onClick={() => setCurrentView('AUTH_LOGIN')}
            className="text-xs text-slate-500 hover:text-slate-800"
          >
            Already an account holder? Sign In &rarr;
          </button>
        </div>
      </div>
    </div>
  );
};
