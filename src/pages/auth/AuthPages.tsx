import React, { useState } from 'react';
import { useBank } from '../../context/BankContext';
import { InstitutionalCrest } from '../../components/common/InstitutionalCrest';
import { PassportPhotoUploader } from '../../components/common/PassportPhotoUploader';
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
  Check,
  Key,
  Camera,
  Upload,
  Sparkles,
  ArrowLeft,
  Eye,
  EyeOff,
  Calendar,
  Clock
} from 'lucide-react';
import { BankRegion, formatDateTime } from '../../types';
import { COUNTRIES, NATIONALITIES } from '../../data/countries';
import { supabase, safeSupabaseOp } from '../../lib/supabaseClient.js';
import { safeFetchJson, DEMO_CLIENT_USER } from '../../lib/apiHelper';

export const LoginPage: React.FC = () => {
  const { login, setCurrentView, showToast, openBiometricPrompt, switchToAdmin } = useBank();

  const [isSignUpMode, setIsSignUpMode] = useState(false);
  const [fullName, setFullName] = useState('');
  const [username, setUsername] = useState(() => {
    return localStorage.getItem('last_registered_username') || '';
  });
  const [password, setPassword] = useState(() => {
    return localStorage.getItem('last_registered_password') || '';
  });
  const [rememberDevice, setRememberDevice] = useState(true);
  const [agreeTerms, setAgreeTerms] = useState(true);
  const [showPassword, setShowPassword] = useState(false);
  const [showPin, setShowPin] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [errorMessage, setErrorMessage] = useState('');
  const [applicationNotice, setApplicationNotice] = useState<{
    referenceNumber?: string;
    status?: string;
    submittedAt?: string;
    message?: string;
  } | null>(null);

  // Sovereign Passport & PIN Checkpoint State
  const [passportCheckpoint, setPassportCheckpoint] = useState<{
    required: boolean;
    userId?: string;
    username?: string;
    firstName?: string;
    lastName?: string;
    passportPhoto?: string;
    passportNumber?: string;
    nationality?: string;
    kycTier?: string;
    region?: string;
    phoneMasked?: string;
    loginPin?: string;
  } | null>(null);

  const [enteredPin, setEnteredPin] = useState('');

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

    if (isSignUpMode) {
      if (!agreeTerms) {
        setErrorMessage('Please agree with the Terms & Conditions to proceed.');
        setIsLoading(false);
        return;
      }
      // Redirect to full onboarding or fast create
      setCurrentView('AUTH_ENROLL');
      setIsLoading(false);
      return;
    }

    const emailOrUser = username.trim();
    const enteredPassword = password.trim();

    try {
      // Supabase authentication check
      let sbUser = null;

      try {
        if (emailOrUser.includes('@')) {
          const { data: sbData, error: sbError } = await supabase.auth.signInWithPassword({
            email: emailOrUser,
            password: enteredPassword
          });
          if (!sbError && sbData?.user) {
            sbUser = sbData.user;
          } else if (sbError && sbError.message && !sbError.message.includes('Invalid login credentials')) {
            console.info('Supabase auth feedback:', sbError.message);
          }
        }
      } catch (sbErr: any) {
        console.warn('Supabase auth notice:', sbErr?.message || sbErr);
      }

      // After login, if email === 'admin@firstatlanticbank.com' redirect to /admin dashboard
      if (
        emailOrUser.toLowerCase() === 'admin@firstatlanticbank.com' ||
        sbUser?.email?.toLowerCase() === 'admin@firstatlanticbank.com'
      ) {
        showToast(
          'SUCCESS',
          'Executive Admin Session Verified',
          'Welcome, Administrator. Master Core Ledger and Compliance controls activated.'
        );
        window.location.hash = 'admin';
        switchToAdmin();
        setIsLoading(false);
        return;
      }

      // Safe API login fetch
      const result = await safeFetchJson<any>('/api/auth/login', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ usernameOrEmail: emailOrUser, password: enteredPassword })
      });

      // If backend returned valid JSON
      if (result.data) {
        const data = result.data;
        if (!result.ok) {
          if (data.error === 'ACCOUNT_PENDING_APPROVAL' || data.approval_status === 'PENDING' || (data.status && data.status.startsWith('PENDING'))) {
            setApplicationNotice({
              referenceNumber: data.referenceNumber || 'FAB-ACT-2026',
              status: data.approval_status || data.status || 'PENDING_DUAL_APPROVAL',
              submittedAt: data.submittedAt,
              message: data.message || 'Your account registration is active and verified.'
            });
            return;
          }
          if (data.error === 'ACCOUNT_SUSPENDED' || data.approval_status === 'SUSPENDED') {
            const suspMsg = data.message || 'Account access is currently suspended. Please contact Private Banking Concierge.';
            setErrorMessage(suspMsg);
            showToast('ERROR', 'Account Suspended', suspMsg);
            return;
          }
          const failMessage = data.message || data.error || 'Invalid credentials. Please verify your username/email and password.';
          setErrorMessage(failMessage);
          showToast('ERROR', 'Login Failed', failMessage);
          return;
        }

        // Checkpoint with verified Passport & 4-Digit PIN
        if (data.passportCheckpointRequired) {
          setPassportCheckpoint({
            required: true,
            userId: data.userId,
            username: data.username,
            firstName: data.firstName,
            lastName: data.lastName,
            passportPhoto: data.passportPhoto,
            passportNumber: data.passportNumber,
            nationality: data.nationality,
            kycTier: data.kycTier,
            region: data.region,
            phoneMasked: data.phoneMasked,
            loginPin: data.loginPin
          });
          const savedPin = localStorage.getItem('last_registered_pin') || data.loginPin || '1234';
          setEnteredPin(savedPin.trim());
          return;
        } else if (data.mfaRequired) {
          setMfaChallenge({
            required: true,
            userId: data.userId,
            phoneMasked: data.phoneMasked,
            method: data.mfaMethod,
            code: '849201'
          });
          return;
        } else if (data.token && data.user) {
          login(data.token, data.user);
          return;
        }
      }

      // If backend is unavailable or returned non-JSON (e.g. static host/Vercel)
      // Provide instant local authentication fallback ONLY for exact demo account
      const isDemoClient =
        emailOrUser.toLowerCase() === 'j.sterling@atlantic-client.com' ||
        emailOrUser.toLowerCase() === 'jsterling';

      if (isDemoClient && (enteredPassword === '1234' || enteredPassword === 'AtlanticSecure2026!')) {
        setPassportCheckpoint({
          required: true,
          userId: DEMO_CLIENT_USER.id,
          username: DEMO_CLIENT_USER.username,
          firstName: DEMO_CLIENT_USER.firstName,
          lastName: DEMO_CLIENT_USER.lastName,
          passportPhoto: DEMO_CLIENT_USER.passportPhoto,
          passportNumber: DEMO_CLIENT_USER.passportNumber,
          nationality: DEMO_CLIENT_USER.nationality,
          kycTier: DEMO_CLIENT_USER.kycTier,
          region: DEMO_CLIENT_USER.region,
          phoneMasked: DEMO_CLIENT_USER.phone,
          loginPin: DEMO_CLIENT_USER.loginPin
        });
        setEnteredPin('1234');
        return;
      }

      // Check localStorage for registered user
      try {
        const localUserStr = localStorage.getItem('fab_current_user_profile');
        if (localUserStr) {
          const localUser = JSON.parse(localUserStr);
          if (
            localUser.email?.toLowerCase() === emailOrUser.toLowerCase() ||
            localUser.username?.toLowerCase() === emailOrUser.toLowerCase()
          ) {
            setPassportCheckpoint({
              required: true,
              userId: localUser.id,
              username: localUser.username,
              firstName: localUser.firstName,
              lastName: localUser.lastName,
              passportPhoto: localUser.passportPhoto,
              passportNumber: localUser.passportNumber,
              nationality: localUser.nationality,
              kycTier: localUser.kycTier,
              region: localUser.region,
              phoneMasked: localUser.phone,
              loginPin: localUser.loginPin || '1234'
            });
            setEnteredPin(localUser.loginPin || '1234');
            return;
          }
        }
      } catch {}

      // If credentials do not match
      const failMsg = result.errorMessage || 'Invalid credentials. Please verify your username/email and password.';
      setErrorMessage(failMsg);
      showToast('ERROR', 'Login Failed', failMsg);
    } catch (err: any) {
      const connError = err?.message || 'Unable to connect to core authentication server.';
      setErrorMessage(connError);
      showToast('ERROR', 'Authentication Error', connError);
    } finally {
      setIsLoading(false);
    }
  };

  const handlePasskeySignIn = () => {
    openBiometricPrompt({
      mode: 'VERIFY',
      title: 'Sign in with Biometric Passkey',
      subtitle: 'Authenticate using Touch ID, Face ID, Windows Hello or FIDO2 hardware key.',
      onComplete: async (success) => {
        if (success) {
          setIsLoading(true);
          try {
            const targetUser = username.trim() || localStorage.getItem('last_registered_username');
            if (!targetUser) {
              showToast('INFO', 'Passkey Setup Required', 'Please sign in with your email/username and password first to pair your biometric passkey.');
              return;
            }
            const result = await safeFetchJson<any>('/api/auth/login', {
              method: 'POST',
              headers: { 'Content-Type': 'application/json' },
              body: JSON.stringify({
                usernameOrEmail: targetUser,
                password: password.trim() || 'AtlanticSecure2026!'
              })
            });

            if (result.data?.token && result.data?.user) {
              showToast('SUCCESS', 'Biometric Passkey Verified', `Welcome back, ${result.data.user.firstName}. Authenticated via hardware key.`);
              login(result.data.token, result.data.user);
              return;
            }

            showToast('ERROR', 'Passkey Verification Failed', result.errorMessage || 'No enrolled passkey found for this user.');
          } catch (err: any) {
            showToast('ERROR', 'Passkey Login Failed', err?.message || 'Passkey authentication failed');
          } finally {
            setIsLoading(false);
          }
        }
      }
    });
  };

  const handlePinVerify = async (useBiometric = false) => {
    if (!passportCheckpoint?.userId) return;
    setIsLoading(true);
    setErrorMessage('');

    try {
      const pinToSend = useBiometric ? (passportCheckpoint.loginPin || '1234') : (enteredPin || passportCheckpoint.loginPin || '1234');
      const result = await safeFetchJson<any>('/api/auth/verify-pin', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          userId: passportCheckpoint.userId,
          pin: pinToSend
        })
      });

      if (result.data?.user && result.data?.token) {
        showToast('SUCCESS', 'Identity Verified', `Welcome to your Private Wealth Dashboard, ${result.data.user?.firstName || 'Client'}.`);
        login(result.data.token, result.data.user);
        return;
      }

      const msg = result.errorMessage || 'Invalid 4-digit PIN.';
      setErrorMessage(msg);
      showToast('ERROR', 'PIN Verification Failed', msg);
    } catch (err: any) {
      setErrorMessage(err?.message || 'Verification exception occurred.');
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
      const result = await safeFetchJson<any>('/api/auth/mfa-verify', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          userId: mfaChallenge.userId,
          code: codeToSend,
          rememberDevice
        })
      });

      if (result.data?.user && result.data?.token) {
        login(result.data.token, result.data.user);
        return;
      }

      const msg = result.errorMessage || 'Invalid MFA security code. Please check SMS / Authenticator app.';
      setErrorMessage(msg);
      showToast('ERROR', 'MFA Failed', msg);
    } catch (err: any) {
      setErrorMessage(err?.message || 'MFA validation exception.');
    } finally {
      setIsLoading(false);
    }
  };

  const handleGoogleAuth = () => {
    showToast(
      'INFO',
      'Google Login Coming Soon',
      'Google Sovereign Single Sign-On is currently undergoing final institutional SOC2 compliance review. Please sign in with your email and password.'
    );
  };

  return (
    <div className="min-h-screen bg-[#F4F5F7] dark:bg-[#0A0D14] flex flex-col justify-center items-center py-6 sm:py-10 px-3 sm:px-6 font-sans">
      <div className="w-full max-w-[960px] bg-white dark:bg-[#11141D] rounded-[24px] sm:rounded-[28px] border border-slate-200/80 dark:border-slate-800 shadow-xl overflow-hidden p-4 sm:p-6 lg:p-7 grid grid-cols-1 md:grid-cols-12 gap-6 lg:gap-8 items-stretch">
        
        {/* Left Side: Atmospheric Hero Card (Desktop & Tablet) */}
        <div className="hidden md:flex md:col-span-5 lg:col-span-5 rounded-[20px] overflow-hidden relative flex-col justify-between p-6 text-white bg-[#064E3B] shadow-inner select-none group min-h-[500px]">
          {/* Background image with subtle tint overlay matching uploaded reference */}
          <img
            src="https://images.unsplash.com/photo-1522071820081-009f0129c71c?w=1000&auto=format&fit=crop&q=80"
            alt="First Atlantic Global Banking"
            className="absolute inset-0 w-full h-full object-cover brightness-[0.70] contrast-[1.05] saturate-[0.85] transition-transform duration-700 group-hover:scale-105"
            referrerPolicy="no-referrer"
          />
          <div className="absolute inset-0 bg-gradient-to-t from-[#042F2E]/90 via-[#064E3B]/35 to-[#064E3B]/20 pointer-events-none" />

          {/* Top Floating Badge */}
          <div className="relative z-10 flex items-center gap-2">
            <div className="w-8 h-8 rounded-lg bg-[#FFC300] text-black flex items-center justify-center font-bold text-xs shadow-md">
              FA
            </div>
            <span className="text-[12px] font-semibold tracking-wider text-white/90 uppercase">
              First Atlantic
            </span>
          </div>

          {/* Bottom Headline & Carousel indicator */}
          <div className="relative z-10 space-y-3.5">
            <div>
              <h3 className="text-[26px] font-bold text-white leading-tight tracking-tight">
                Easy to Access Wealth
              </h3>
              <p className="text-[13px] text-white/80 mt-1.5 leading-relaxed font-normal">
                Find global liquidity and private multi-currency banking all around the world
              </p>
            </div>

            {/* Pagination indicator matching uploaded screenshot */}
            <div className="flex items-center gap-1.5 pt-1">
              <span className="w-7 h-1.5 rounded-full bg-white shadow-xs" />
              <span className="w-1.5 h-1.5 rounded-full bg-white/40" />
              <span className="w-1.5 h-1.5 rounded-full bg-white/40" />
            </div>
          </div>
        </div>

        {/* Right Side: Form Container (Mobile-First) */}
        <div className="col-span-1 md:col-span-7 lg:col-span-7 flex flex-col justify-center px-1 sm:px-4 py-2 space-y-5">
          
          {/* Top Navigation */}
          <div className="flex items-center justify-end">
            <button
              type="button"
              onClick={() => setCurrentView('PUBLIC_HOME')}
              className="text-xs font-medium text-slate-500 hover:text-black dark:hover:text-white transition-colors cursor-pointer inline-flex items-center gap-1.5"
            >
              <ArrowLeft className="w-3.5 h-3.5" />
              <span>Back to Home</span>
            </button>
          </div>

          {/* Form Header Title */}
          <div className="space-y-1">
            <h2 className="text-[24px] sm:text-[28px] font-bold text-[#111827] dark:text-white tracking-tight leading-tight">
              {passportCheckpoint 
                ? 'Security Checkpoint' 
                : isSignUpMode 
                ? 'Create your account' 
                : 'Sign in to your account'}
            </h2>
            <p className="text-[13px] text-[#6B7280] dark:text-slate-400">
              {passportCheckpoint 
                ? 'Enter your 4-digit security PIN to access your dashboard' 
                : isSignUpMode 
                ? 'start for free • Instant IBAN & multi-currency ledger' 
                : 'Enter your credentials to access your private portfolio'}
            </p>
          </div>

          {/* Error Message */}
          {errorMessage && (
            <div className="p-3.5 rounded-xl bg-rose-50 dark:bg-rose-950/40 border border-rose-200 dark:border-rose-800 text-rose-800 dark:text-rose-300 text-xs flex items-center gap-2.5">
              <AlertCircle className="w-4 h-4 text-rose-600 dark:text-rose-400 shrink-0" />
              <span className="font-medium">{errorMessage}</span>
            </div>
          )}

          {applicationNotice && (
            <div className="p-4 rounded-xl bg-amber-50 border border-amber-200 text-amber-900 text-xs space-y-2">
              <div className="flex items-center gap-2 font-bold text-amber-800">
                <AlertCircle className="w-4 h-4 text-amber-600 shrink-0" />
                <span>Account Ready</span>
              </div>
              <p className="text-slate-700">{applicationNotice.message}</p>
              {applicationNotice.referenceNumber && (
                <div className="bg-white/80 p-2 rounded border border-amber-200 font-mono text-[11px] text-slate-800">
                  Reference: <span className="font-bold text-slate-950">{applicationNotice.referenceNumber}</span>
                </div>
              )}
            </div>
          )}

          {passportCheckpoint ? (
            /* SIMPLE & DECENT CIRCULAR PASSPORT CHECKPOINT */
            <div className="space-y-5 animate-in fade-in duration-300">
              {/* Centered Circular Passport Avatar */}
              <div className="flex flex-col items-center justify-center pt-1 pb-2 text-center">
                <div className="relative w-20 h-20 rounded-full overflow-hidden border-2 border-[#00593B] shadow-sm bg-slate-100 dark:bg-slate-800 p-0.5">
                  <img
                    src={
                      passportCheckpoint.passportPhoto ||
                      'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=300&auto=format&fit=crop&q=80'
                    }
                    alt="Passport Identity"
                    className="w-full h-full object-cover rounded-full"
                    referrerPolicy="no-referrer"
                  />
                </div>
                <div className="mt-2.5 font-bold text-slate-900 dark:text-white text-base">
                  {passportCheckpoint.firstName} {passportCheckpoint.lastName}
                </div>
              </div>

              {/* 4-Digit Security PIN Input */}
              <div className="space-y-2">
                <label className="block text-xs font-bold uppercase tracking-wider text-slate-700 dark:text-slate-300">
                  Enter Your 4-Digit Private PIN *
                </label>

                <div className="relative">
                  <input
                    type={showPin ? "text" : "password"}
                    inputMode="numeric"
                    maxLength={4}
                    autoFocus
                    placeholder="••••"
                    value={enteredPin}
                    onChange={(e) => setEnteredPin(e.target.value.replace(/\D/g, '').slice(0, 4))}
                    className="w-full text-center tracking-[0.8em] text-2xl font-mono py-3 bg-white dark:bg-[#161B22] border-2 border-slate-300 dark:border-slate-700 rounded-xl text-slate-900 dark:text-white focus:outline-none focus:border-[#00593B] font-bold"
                  />
                  <button
                    type="button"
                    onClick={() => setShowPin(!showPin)}
                    aria-label={showPin ? "Hide PIN" : "Show PIN"}
                    className="absolute right-3.5 top-1/2 -translate-y-1/2 text-slate-400 hover:text-slate-600 cursor-pointer p-1"
                  >
                    {showPin ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                  </button>
                </div>
              </div>

              <div className="space-y-2 pt-1">
                <button
                  type="button"
                  disabled={isLoading || (enteredPin.length !== 4 && !passportCheckpoint.loginPin)}
                  onClick={() => handlePinVerify(false)}
                  className="w-full py-3 rounded-xl bg-[#00593B] hover:bg-[#00472f] text-white font-bold text-sm tracking-wide shadow-md flex items-center justify-center gap-2 cursor-pointer transition-all disabled:opacity-50"
                >
                  {isLoading ? (
                    <RefreshCw className="w-4 h-4 animate-spin text-white" />
                  ) : (
                    <>
                      <Lock className="w-4 h-4 text-[#FFC300]" />
                      <span>Unlock Dashboard</span>
                    </>
                  )}
                </button>
              </div>

              <div className="text-center pt-1">
                <button
                  type="button"
                  onClick={() => {
                    setPassportCheckpoint(null);
                    setEnteredPin('');
                  }}
                  className="inline-flex items-center gap-1.5 text-xs text-slate-500 hover:text-slate-800 dark:hover:text-white cursor-pointer"
                >
                  <ArrowLeft className="w-3.5 h-3.5" />
                  <span>Back to Credentials</span>
                </button>
              </div>
            </div>
          ) : !mfaChallenge ? (
            /* Main Form with Input Box Badges matching uploaded design */
            <form onSubmit={handleInitialSubmit} className="space-y-3.5">
              
              {/* Full name (Visible in Sign Up mode) */}
              {isSignUpMode && (
                <div className="space-y-1">
                  <div className="relative flex items-center">
                    <div className="absolute left-3 w-7 h-7 rounded-md bg-[#00593B]/10 dark:bg-[#00593B]/30 flex items-center justify-center text-[#00593B] dark:text-[#34D399]">
                      <User className="w-3.5 h-3.5" />
                    </div>
                    <input
                      type="text"
                      required
                      value={fullName}
                      onChange={(e) => setFullName(e.target.value)}
                      placeholder="Full name"
                      className="w-full pl-12 pr-4 py-3 text-[14px] rounded-xl font-sans transition-all focus:outline-none bg-white dark:bg-[#161B22] border border-slate-200 dark:border-slate-800 text-slate-900 dark:text-white placeholder-slate-400 focus:border-[#00593B] focus:ring-2 focus:ring-[#00593B]/15"
                    />
                  </div>
                </div>
              )}

              {/* Email / Username */}
              <div className="space-y-1">
                <div className="relative flex items-center">
                  <div className="absolute left-3 w-7 h-7 rounded-md bg-[#00593B]/10 dark:bg-[#00593B]/30 flex items-center justify-center text-[#00593B] dark:text-[#34D399]">
                    <FileText className="w-3.5 h-3.5" />
                  </div>
                  <input
                    type="text"
                    required
                    value={username}
                    onChange={(e) => setUsername(e.target.value)}
                    placeholder={isSignUpMode ? "Email address" : "Email or Username"}
                    className="w-full pl-12 pr-4 py-3 text-[14px] rounded-xl font-sans transition-all focus:outline-none bg-white dark:bg-[#161B22] border border-slate-200 dark:border-slate-800 text-slate-900 dark:text-white placeholder-slate-400 focus:border-[#00593B] focus:ring-2 focus:ring-[#00593B]/15"
                  />
                </div>
              </div>

              {/* Password */}
              <div className="space-y-1">
                <div className="relative flex items-center">
                  <div className="absolute left-3 w-7 h-7 rounded-md bg-[#00593B]/10 dark:bg-[#00593B]/30 flex items-center justify-center text-[#00593B] dark:text-[#34D399]">
                    <Lock className="w-3.5 h-3.5" />
                  </div>
                  <input
                    type={showPassword ? "text" : "password"}
                    required
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    placeholder="Password"
                    className="w-full pl-12 pr-11 py-3 text-[14px] rounded-xl font-sans transition-all focus:outline-none bg-white dark:bg-[#161B22] border border-slate-200 dark:border-slate-800 text-slate-900 dark:text-white placeholder-slate-400 focus:border-[#00593B] focus:ring-2 focus:ring-[#00593B]/15"
                  />
                  <button
                    type="button"
                    onClick={() => setShowPassword(!showPassword)}
                    aria-label={showPassword ? "Hide password" : "Show password"}
                    className="absolute right-3.5 text-slate-400 hover:text-slate-600 dark:hover:text-slate-200 cursor-pointer p-1 transition-colors"
                  >
                    {showPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                  </button>
                </div>
              </div>

              {/* Checkbox: Terms & Condition / Remember terminal */}
              <div className="flex items-center justify-between pt-1">
                <label className="flex items-center gap-2.5 text-[13px] text-slate-600 dark:text-slate-300 cursor-pointer select-none">
                  <input
                    type="checkbox"
                    checked={isSignUpMode ? agreeTerms : rememberDevice}
                    onChange={(e) => isSignUpMode ? setAgreeTerms(e.target.checked) : setRememberDevice(e.target.checked)}
                    className="w-4 h-4 rounded border-slate-300 dark:border-slate-700 text-[#00593B] focus:ring-[#00593B] cursor-pointer"
                  />
                  {isSignUpMode ? (
                    <span>
                      I agree with the <span className="font-semibold text-[#00593B] dark:text-[#34D399] hover:underline">Terms &amp; Condition</span>
                    </span>
                  ) : (
                    <span>Remember this device</span>
                  )}
                </label>

                {!isSignUpMode && (
                  <button
                    type="button"
                    onClick={() => setCurrentView('AUTH_FORGOT_PASSWORD')}
                    className="text-[12px] font-semibold text-[#00593B] dark:text-[#34D399] hover:underline cursor-pointer"
                  >
                    Forgot Password?
                  </button>
                )}
              </div>

              {/* Primary Action Button (Green button matching uploaded screenshot) */}
              <div className="pt-2">
                <button
                  type="submit"
                  disabled={isLoading || (!username.trim() && !isSignUpMode)}
                  className="w-full py-3.5 rounded-xl font-bold text-[15px] transition-all shadow-md flex items-center justify-center gap-2 cursor-pointer bg-[#00593B] hover:bg-[#00482f] text-white disabled:opacity-50 active:scale-[0.99]"
                >
                  {isLoading ? (
                    <RefreshCw className="w-4 h-4 animate-spin text-white" />
                  ) : (
                    <>
                      <span>{isSignUpMode ? 'Continue' : 'Continue'}</span>
                      <span className="w-5 h-5 rounded-full bg-white/20 flex items-center justify-center text-xs">➔</span>
                    </>
                  )}
                </button>
              </div>

              {/* "or" Divider */}
              <div className="relative flex py-1 items-center">
                <div className="grow border-t border-slate-200 dark:border-slate-800" />
                <span className="shrink mx-3 text-xs text-slate-400 font-medium">or</span>
                <div className="grow border-t border-slate-200 dark:border-slate-800" />
              </div>

              {/* Google SSO Button */}
              <button
                type="button"
                onClick={handleGoogleAuth}
                title="Google Login Coming Soon"
                className="w-full py-3 rounded-xl border border-slate-200 dark:border-slate-700 bg-white dark:bg-[#161B22] hover:bg-slate-50 dark:hover:bg-slate-800 text-slate-800 dark:text-slate-100 font-semibold text-[13px] sm:text-[14px] flex items-center justify-center gap-2.5 cursor-pointer transition-all shadow-xs active:scale-[0.99]"
              >
                <svg className="w-4 h-4" viewBox="0 0 24 24">
                  <path fill="#4285F4" d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z" />
                  <path fill="#34A853" d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z" />
                  <path fill="#FBBC05" d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.06H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.94l2.85-2.22.81-.63z" />
                  <path fill="#EA4335" d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.06l3.66 2.84c.87-2.6 3.3-4.52 6.16-4.52z" />
                </svg>
                <span>{isSignUpMode ? 'Sign Up with Google' : 'Sign In with Google'}</span>
              </button>
            </form>
          ) : (
            /* Multi-Factor Authentication Challenge */
            <div className="space-y-4 animate-in fade-in duration-300">
              <div className="text-center space-y-1">
                <div className="w-12 h-12 rounded-full bg-[#00593B] text-[#FFC300] flex items-center justify-center mx-auto mb-2">
                  <ShieldCheck className="w-6 h-6" />
                </div>
                <h3 className="text-base font-bold text-slate-900 dark:text-white">
                  Two-Factor Authentication Required
                </h3>
                <p className="text-xs text-slate-500">
                  Enter the 6-digit verification code sent to {mfaChallenge.phoneMasked || 'your registered device'}
                </p>
              </div>

              <div>
                <input
                  type="text"
                  inputMode="numeric"
                  maxLength={6}
                  value={mfaChallenge.code}
                  onChange={(e) =>
                    setMfaChallenge({ ...mfaChallenge, code: e.target.value.replace(/\D/g, '').slice(0, 6) })
                  }
                  className="w-full text-center tracking-[0.5em] text-xl font-mono py-2.5 bg-white dark:bg-[#161B22] border border-slate-300 dark:border-slate-700 rounded-xl text-slate-900 dark:text-white focus:outline-none focus:border-[#00593B]"
                />
              </div>

              <div className="space-y-2">
                <button
                  type="button"
                  disabled={isLoading || mfaChallenge.code.length !== 6}
                  onClick={() => handleMfaVerify(false)}
                  className="w-full py-3 rounded-xl bg-[#00593B] hover:bg-[#00472f] text-white font-bold text-xs uppercase tracking-widest shadow-md flex items-center justify-center gap-2 cursor-pointer"
                >
                  <Lock className="w-3.5 h-3.5 text-[#FFC300]" />
                  <span>Verify &amp; Enter Dashboard</span>
                </button>
              </div>

              <div className="text-center pt-1">
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

          {/* Bottom Switcher: Already have an account? Login / Don't have an account? Sign up */}
          <div className="pt-3 text-center text-[13px] text-slate-600 dark:text-slate-400 border-t border-slate-100 dark:border-slate-800">
            {isSignUpMode ? (
              <span>
                Already have an account?{' '}
                <button
                  type="button"
                  onClick={() => setIsSignUpMode(false)}
                  className="font-bold text-[#00593B] dark:text-[#34D399] hover:underline cursor-pointer ml-1"
                >
                  Login
                </button>
              </span>
            ) : (
              <span>
                Don't have an account?{' '}
                <button
                  type="button"
                  onClick={() => setIsSignUpMode(true)}
                  className="font-bold text-[#00593B] dark:text-[#34D399] hover:underline cursor-pointer ml-1"
                >
                  Sign up
                </button>
              </span>
            )}
          </div>

        </div>
      </div>

      {/* Security & System Info Footer */}
      <div className="flex items-center justify-between w-full max-w-[960px] text-[11px] text-slate-500 dark:text-slate-400 px-4 pt-3 font-mono">
        <span className="flex items-center gap-1.5">
          <Shield className="w-3.5 h-3.5 text-[#00593B] dark:text-[#34D399]" /> TLS 1.3 256-Bit SSL Protection
        </span>
        <span>
          First Atlantic Private Banking Gateway
        </span>
      </div>
    </div>
  );
};

export const ForgotPasswordPage: React.FC = () => {
  const { setCurrentView, showToast } = useBank();
  const [emailOrUsername, setEmailOrUsername] = useState('');
  const [step, setStep] = useState<'REQUEST' | 'VERIFY' | 'RESET' | 'DONE'>('REQUEST');
  const [code, setCode] = useState('');
  const [newPassword, setNewPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [errorMsg, setErrorMsg] = useState('');

  const handleSendCode = (e: React.FormEvent) => {
    e.preventDefault();
    if (!emailOrUsername.trim()) {
      setErrorMsg('Please enter your registered email address or username.');
      return;
    }
    setErrorMsg('');
    setIsLoading(true);
    setTimeout(() => {
      setIsLoading(false);
      setStep('VERIFY');
      showToast('SUCCESS', 'Recovery Code Dispatched', 'A 6-digit verification code was sent to your registered contact channel.');
    }, 600);
  };

  const handleVerifyCode = (e: React.FormEvent) => {
    e.preventDefault();
    if (code.trim().length !== 6) {
      setErrorMsg('Please enter the 6-digit recovery code.');
      return;
    }
    setErrorMsg('');
    setIsLoading(true);
    setTimeout(() => {
      setIsLoading(false);
      setStep('RESET');
    }, 500);
  };

  const handleResetPassword = (e: React.FormEvent) => {
    e.preventDefault();
    if (newPassword.length < 8) {
      setErrorMsg('New password must be at least 8 characters long.');
      return;
    }
    if (newPassword !== confirmPassword) {
      setErrorMsg('Passwords do not match.');
      return;
    }
    setErrorMsg('');
    setIsLoading(true);
    setTimeout(() => {
      setIsLoading(false);
      setStep('DONE');
      showToast('SUCCESS', 'Credentials Updated', 'Your digital banking password has been successfully reset.');
    }, 600);
  };

  return (
    <div className="min-h-screen bg-[#F4F5F7] dark:bg-[#0A0D14] flex flex-col justify-center items-center py-6 sm:py-10 px-3 sm:px-6 font-sans">
      <div className="w-full max-w-[520px] bg-white dark:bg-[#11141D] rounded-[24px] sm:rounded-[28px] border border-slate-200/80 dark:border-slate-800 shadow-xl p-6 sm:p-8 space-y-6">
        
        {/* Header */}
        <div className="flex items-center justify-between">
          <button
            type="button"
            onClick={() => setCurrentView('AUTH_LOGIN')}
            className="text-xs font-medium text-slate-500 hover:text-black dark:hover:text-white transition-colors cursor-pointer inline-flex items-center gap-1.5"
          >
            <ArrowLeft className="w-3.5 h-3.5" />
            <span>Back to Sign In</span>
          </button>
          <span className="text-[11px] font-mono text-[#00593B] dark:text-[#34D399] uppercase tracking-wider font-semibold">
            Security Recovery
          </span>
        </div>

        {/* Title */}
        <div className="space-y-1">
          <h2 className="text-[22px] sm:text-[26px] font-bold text-[#111827] dark:text-white tracking-tight leading-tight">
            {step === 'REQUEST' && 'Reset your password'}
            {step === 'VERIFY' && 'Enter recovery code'}
            {step === 'RESET' && 'Set new password'}
            {step === 'DONE' && 'Password reset complete'}
          </h2>
          <p className="text-[13px] text-[#6B7280] dark:text-slate-400">
            {step === 'REQUEST' && 'Enter your verified account email or username to receive a secure recovery code.'}
            {step === 'VERIFY' && `We sent a 6-digit one-time code to ${emailOrUsername}.`}
            {step === 'RESET' && 'Choose a strong, confidential password for your online banking access.'}
            {step === 'DONE' && 'You can now sign in with your updated digital banking credentials.'}
          </p>
        </div>

        {/* Error Alert */}
        {errorMsg && (
          <div className="p-3.5 rounded-xl bg-rose-50 dark:bg-rose-950/40 border border-rose-200 dark:border-rose-800 text-rose-800 dark:text-rose-300 text-xs flex items-center gap-2.5">
            <AlertCircle className="w-4 h-4 text-rose-600 dark:text-rose-400 shrink-0" />
            <span className="font-medium">{errorMsg}</span>
          </div>
        )}

        {/* Form Steps */}
        {step === 'REQUEST' && (
          <form onSubmit={handleSendCode} className="space-y-4">
            <div className="space-y-1">
              <div className="relative flex items-center">
                <div className="absolute left-3 w-7 h-7 rounded-md bg-[#00593B]/10 dark:bg-[#00593B]/30 flex items-center justify-center text-[#00593B] dark:text-[#34D399]">
                  <FileText className="w-3.5 h-3.5" />
                </div>
                <input
                  type="text"
                  required
                  value={emailOrUsername}
                  onChange={(e) => setEmailOrUsername(e.target.value)}
                  placeholder="Email or Username"
                  className="w-full pl-12 pr-4 py-3 text-[14px] rounded-xl font-sans transition-all focus:outline-none bg-white dark:bg-[#161B22] border border-slate-200 dark:border-slate-800 text-slate-900 dark:text-white placeholder-slate-400 focus:border-[#00593B] focus:ring-2 focus:ring-[#00593B]/15"
                />
              </div>
            </div>

            <button
              type="submit"
              disabled={isLoading || !emailOrUsername.trim()}
              className="w-full py-3.5 rounded-xl font-bold text-[14px] transition-all shadow-md flex items-center justify-center gap-2 cursor-pointer bg-[#00593B] hover:bg-[#00482f] text-white disabled:opacity-50"
            >
              {isLoading ? (
                <RefreshCw className="w-4 h-4 animate-spin text-white" />
              ) : (
                <>
                  <span>Send Recovery Code</span>
                  <ArrowRight className="w-4 h-4" />
                </>
              )}
            </button>
          </form>
        )}

        {step === 'VERIFY' && (
          <form onSubmit={handleVerifyCode} className="space-y-4">
            <div className="space-y-1">
              <input
                type="text"
                inputMode="numeric"
                maxLength={6}
                value={code}
                onChange={(e) => setCode(e.target.value.replace(/\D/g, '').slice(0, 6))}
                placeholder="••••••"
                className="w-full text-center tracking-[0.5em] text-2xl font-mono py-3 rounded-xl bg-white dark:bg-[#161B22] border border-slate-200 dark:border-slate-800 text-slate-900 dark:text-white focus:outline-none focus:border-[#00593B]"
              />
              <span className="text-[11px] text-slate-400 text-center block pt-1">
                Demo code: enter any 6 digits (e.g. 123456)
              </span>
            </div>

            <button
              type="submit"
              disabled={isLoading || code.length !== 6}
              className="w-full py-3.5 rounded-xl font-bold text-[14px] transition-all shadow-md flex items-center justify-center gap-2 cursor-pointer bg-[#00593B] hover:bg-[#00482f] text-white disabled:opacity-50"
            >
              {isLoading ? <RefreshCw className="w-4 h-4 animate-spin" /> : <span>Verify Code</span>}
            </button>
          </form>
        )}

        {step === 'RESET' && (
          <form onSubmit={handleResetPassword} className="space-y-3.5">
            <div className="space-y-1">
              <div className="relative flex items-center">
                <div className="absolute left-3 w-7 h-7 rounded-md bg-[#00593B]/10 dark:bg-[#00593B]/30 flex items-center justify-center text-[#00593B] dark:text-[#34D399]">
                  <Lock className="w-3.5 h-3.5" />
                </div>
                <input
                  type="password"
                  required
                  value={newPassword}
                  onChange={(e) => setNewPassword(e.target.value)}
                  placeholder="New Password (min. 8 characters)"
                  className="w-full pl-12 pr-4 py-3 text-[14px] rounded-xl font-sans transition-all focus:outline-none bg-white dark:bg-[#161B22] border border-slate-200 dark:border-slate-800 text-slate-900 dark:text-white placeholder-slate-400 focus:border-[#00593B] focus:ring-2 focus:ring-[#00593B]/15"
                />
              </div>
            </div>

            <div className="space-y-1">
              <div className="relative flex items-center">
                <div className="absolute left-3 w-7 h-7 rounded-md bg-[#00593B]/10 dark:bg-[#00593B]/30 flex items-center justify-center text-[#00593B] dark:text-[#34D399]">
                  <Lock className="w-3.5 h-3.5" />
                </div>
                <input
                  type="password"
                  required
                  value={confirmPassword}
                  onChange={(e) => setConfirmPassword(e.target.value)}
                  placeholder="Confirm New Password"
                  className="w-full pl-12 pr-4 py-3 text-[14px] rounded-xl font-sans transition-all focus:outline-none bg-white dark:bg-[#161B22] border border-slate-200 dark:border-slate-800 text-slate-900 dark:text-white placeholder-slate-400 focus:border-[#00593B] focus:ring-2 focus:ring-[#00593B]/15"
                />
              </div>
            </div>

            <button
              type="submit"
              disabled={isLoading || !newPassword || !confirmPassword}
              className="w-full py-3.5 rounded-xl font-bold text-[14px] transition-all shadow-md flex items-center justify-center gap-2 cursor-pointer bg-[#00593B] hover:bg-[#00482f] text-white disabled:opacity-50"
            >
              {isLoading ? <RefreshCw className="w-4 h-4 animate-spin" /> : <span>Update Password</span>}
            </button>
          </form>
        )}

        {step === 'DONE' && (
          <div className="text-center space-y-4 py-2">
            <div className="w-12 h-12 rounded-full bg-emerald-500/10 text-emerald-600 dark:text-emerald-400 flex items-center justify-center mx-auto">
              <Check className="w-6 h-6 stroke-[2.5]" />
            </div>
            <p className="text-sm text-slate-600 dark:text-slate-300">
              Your password has been successfully updated. You can now log into your online banking account.
            </p>
            <button
              type="button"
              onClick={() => setCurrentView('AUTH_LOGIN')}
              className="w-full py-3.5 rounded-xl font-bold text-[14px] transition-all shadow-md flex items-center justify-center gap-2 cursor-pointer bg-[#00593B] hover:bg-[#00482f] text-white"
            >
              <span>Sign In Now</span>
              <ArrowRight className="w-4 h-4" />
            </button>
          </div>
        )}

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

  // Full form state for international banking onboarding with robust defaults
  const [formData, setFormData] = useState({
    // Step 1: Personal Profile & Digital Credentials
    title: 'Mr',
    firstName: '',
    middleName: '',
    lastName: '',
    dateOfBirth: '1988-06-15',
    email: '',
    countryCode: '+1',
    phone: '',
    nationality: 'United States',
    username: '',
    password: '',
    confirmPassword: '',
    loginPin: '1234',
    confirmLoginPin: '1234',

    // Step 2: Residential Address & Tax Residency
    streetAddress: '100 Atlantic Plaza',
    apartment: 'Suite 4200',
    city: 'New York',
    stateOrProvince: 'NY',
    postalCode: '10001',
    countryOfResidence: 'United States',
    taxId: 'US-9948201',
    taxResidencyCountry: 'United States',

    // Step 3: Employment, KYC & Passport Identity
    employmentStatus: 'EMPLOYED',
    employerName: 'Atlantic Enterprises LLC',
    jobTitle: 'Managing Partner',
    annualIncomeEur: '185000',
    sourceOfFunds: 'SALARY_AND_BONUS',
    estimatedLiquidWealthEur: '500000',
    passportNumber: 'US84920194A',
    passportPhoto: 'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=500&auto=format&fit=crop&q=80',

    // Step 4: Account Configuration & Regulation
    bookingRegion: 'US' as BankRegion,
    accountType: 'PREMIER_MULTICURRENCY',
    primaryCurrency: 'USD',
    initialDepositMinor: 2500000, // $25,000.00
    isPep: 'NO',
    termsAccepted: true,
    fatcaAccepted: true
  });

  const handleApplyPreset = (presetType: 'US' | 'EU' | 'UK') => {
    const timestamp = Date.now().toString().slice(-4);
    if (presetType === 'US') {
      setFormData({
        title: 'Mr',
        firstName: 'Alexander',
        middleName: 'C.',
        lastName: 'Hayes',
        dateOfBirth: '1986-04-12',
        email: `a.hayes.${timestamp}@atlantic-client.com`,
        countryCode: '+1',
        phone: `212 555 ${timestamp}`,
        nationality: 'United States',
        username: `ahayes${timestamp}`,
        password: 'AtlanticSecure2026!',
        confirmPassword: 'AtlanticSecure2026!',
        loginPin: '1234',
        confirmLoginPin: '1234',
        streetAddress: '100 Atlantic Plaza',
        apartment: 'Suite 4200',
        city: 'New York',
        stateOrProvince: 'NY',
        postalCode: '10001',
        countryOfResidence: 'United States',
        taxId: `US-${timestamp}892`,
        taxResidencyCountry: 'United States',
        employmentStatus: 'EMPLOYED',
        employerName: 'Hayes Capital Partners',
        jobTitle: 'Senior Managing Director',
        annualIncomeEur: '250000',
        sourceOfFunds: 'SALARY_AND_BONUS',
        estimatedLiquidWealthEur: '750000',
        passportNumber: `US${timestamp}9012A`,
        passportPhoto: 'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=500&auto=format&fit=crop&q=80',
        bookingRegion: 'US',
        accountType: 'PREMIER_MULTICURRENCY',
        primaryCurrency: 'USD',
        initialDepositMinor: 5000000,
        isPep: 'NO',
        termsAccepted: true,
        fatcaAccepted: true
      });
    } else if (presetType === 'EU') {
      setFormData({
        title: 'Dr',
        firstName: 'Maximilian',
        middleName: '',
        lastName: 'Von Schneider',
        dateOfBirth: '1984-09-20',
        email: `m.schneider.${timestamp}@atlantic-client.eu`,
        countryCode: '+49',
        phone: `170 882 ${timestamp}`,
        nationality: 'Germany',
        username: `mschneider${timestamp}`,
        password: 'AtlanticSecure2026!',
        confirmPassword: 'AtlanticSecure2026!',
        loginPin: '1234',
        confirmLoginPin: '1234',
        streetAddress: 'Bockenheimer Landstraße 24',
        apartment: 'Penthouse 8',
        city: 'Frankfurt am Main',
        stateOrProvince: 'Hessen',
        postalCode: '60323',
        countryOfResidence: 'Germany',
        taxId: `DE 815 ${timestamp} 01`,
        taxResidencyCountry: 'Germany',
        employmentStatus: 'EXECUTIVE',
        employerName: 'Schneider Global AG',
        jobTitle: 'Chief Investment Officer',
        annualIncomeEur: '320000',
        sourceOfFunds: 'SALARY_AND_BONUS',
        estimatedLiquidWealthEur: '1200000',
        passportNumber: `DE${timestamp}4920F`,
        passportPhoto: 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=500&auto=format&fit=crop&q=80',
        bookingRegion: 'EU',
        accountType: 'PREMIER_MULTICURRENCY',
        primaryCurrency: 'EUR',
        initialDepositMinor: 5000000,
        isPep: 'NO',
        termsAccepted: true,
        fatcaAccepted: true
      });
    } else {
      setFormData({
        title: 'Ms',
        firstName: 'Eleanor',
        middleName: 'Victoria',
        lastName: 'Montgomery',
        dateOfBirth: '1990-11-05',
        email: `e.montgomery.${timestamp}@atlantic-client.co.uk`,
        countryCode: '+44',
        phone: `7911 20${timestamp}`,
        nationality: 'United Kingdom',
        username: `emontgomery${timestamp}`,
        password: 'AtlanticSecure2026!',
        confirmPassword: 'AtlanticSecure2026!',
        loginPin: '1234',
        confirmLoginPin: '1234',
        streetAddress: '14 Berkeley Square',
        apartment: 'Apartment 3A',
        city: 'London',
        stateOrProvince: 'Greater London',
        postalCode: 'W1J 6BQ',
        countryOfResidence: 'United Kingdom',
        taxId: `GB-${timestamp}-TAX`,
        taxResidencyCountry: 'United Kingdom',
        employmentStatus: 'EMPLOYED',
        employerName: 'Mayfair Sovereign Advisory',
        jobTitle: 'Partner',
        annualIncomeEur: '280000',
        sourceOfFunds: 'SALARY_AND_BONUS',
        estimatedLiquidWealthEur: '900000',
        passportNumber: `GB${timestamp}8491M`,
        passportPhoto: 'https://images.unsplash.com/photo-1573496359142-b8d87734a5a2?w=500&auto=format&fit=crop&q=80',
        bookingRegion: 'UK',
        accountType: 'PREMIER_MULTICURRENCY',
        primaryCurrency: 'GBP',
        initialDepositMinor: 4000000,
        isPep: 'NO',
        termsAccepted: true,
        fatcaAccepted: true
      });
    }
  };

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
    if (!formData.loginPin || formData.loginPin.length !== 4) {
      setErrorMsg('Please enter a 4-digit numeric login and transfer PIN.');
      return false;
    }
    if (formData.loginPin !== formData.confirmLoginPin) {
      setErrorMsg('4-Digit PIN and confirmation PIN do not match.');
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
    setErrorMsg('');
    return true;
  };

  const validateStep4 = () => {
    if (!formData.bookingRegion) {
      setErrorMsg('Please select your Primary Booking Jurisdiction.');
      return false;
    }
    const fundingAmount = Number(formData.initialDepositMinor) / 100;
    if (isNaN(fundingAmount) || fundingAmount < 0) {
      setErrorMsg('Please specify a valid initial opening funding amount.');
      return false;
    }
    if (!formData.termsAccepted || !formData.fatcaAccepted) {
      setErrorMsg('Please accept the regulatory agreements and disclosures to proceed.');
      return false;
    }
    setErrorMsg('');
    return true;
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!validateStep4()) {
      return;
    }

    setErrorMsg('');
    const fullPhone = `${formData.countryCode} ${formData.phone}`.trim();
    const signupEmail = formData.email.trim().toLowerCase();
    const signupPassword = formData.password;

    // Safe non-blocking Supabase registration
    safeSupabaseOp(
      supabase.auth.signUp({
        email: signupEmail,
        password: signupPassword,
        options: {
          data: {
            name: `${formData.firstName} ${formData.lastName}`,
            username: formData.username.trim(),
            pin: formData.loginPin,
            region: formData.bookingRegion
          }
        }
      }),
      2000
    ).catch(err => {
      console.debug('Supabase client registration catch notice:', err);
    });
    
    const payload = {
      firstName: formData.firstName.trim(),
      lastName: formData.lastName.trim(),
      email: signupEmail,
      phone: fullPhone,
      username: formData.username.trim(),
      password: signupPassword,
      loginPin: formData.loginPin,
      passportNumber: formData.passportNumber.trim(),
      passportPhoto: formData.passportPhoto,
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
      // Store credentials locally for seamless login
      localStorage.setItem('last_registered_username', formData.username.trim());
      localStorage.setItem('last_registered_password', formData.password);
      localStorage.setItem('last_registered_pin', formData.loginPin);
      
      setSubmissionReference(result.referenceNumber);
      setIsSubmitted(true);
    } else if (result.error) {
      setErrorMsg(result.error);
    }
  };

  if (isSubmitted) {
    return (
      <div className="min-h-[85vh] bg-[#f8fafc] py-10 px-4 sm:px-6 flex justify-center items-center">
        <div className="w-full max-w-2xl bg-white rounded-2xl p-6 sm:p-10 border border-slate-200 shadow-2xl space-y-6 text-center">
          <div className="w-16 h-16 rounded-full bg-emerald-50 text-emerald-600 border-2 border-emerald-500/30 flex items-center justify-center mx-auto shadow-sm">
            <CheckCircle2 className="w-10 h-10" />
          </div>

          <div className="space-y-2">
            <span className="text-xs uppercase tracking-widest text-[#8c6d37] font-bold">
              Account Provisioned &amp; Ready
            </span>
            <h2 className="text-2xl sm:text-3xl font-bold font-serif text-slate-900">
              Welcome to First Atlantic Bank
            </h2>
            <p className="text-sm text-slate-600 max-w-lg mx-auto">
              Congratulations, <span className="font-semibold text-slate-900">{formData.firstName} {formData.lastName}</span>! Your transatlantic private account has been provisioned and authorized for immediate online access.
            </p>
          </div>

          {/* Application Summary Box */}
          <div className="bg-slate-50 rounded-xl p-5 border border-slate-200 text-left space-y-2.5 max-w-md mx-auto font-mono text-xs">
            <div className="flex justify-between items-center text-xs pb-1.5 border-b border-slate-200">
              <span className="text-slate-500 font-sans">Account Reference:</span>
              <span className="font-bold text-slate-950 text-sm">{submissionReference}</span>
            </div>
            <div className="flex justify-between items-center text-xs">
              <span className="text-slate-500 font-sans flex items-center gap-1">
                <Calendar className="w-3 h-3 text-[#8c6d37]" />
                <span>Submitted Date &amp; Time:</span>
              </span>
              <span className="font-bold text-slate-900 font-mono text-[11px]">{formatDateTime(new Date())}</span>
            </div>
            <div className="flex justify-between items-center text-xs">
              <span className="text-slate-500 font-sans">Username:</span>
              <span className="font-bold text-[#8c6d37] font-mono">{formData.username}</span>
            </div>
            <div className="flex justify-between items-center text-xs">
              <span className="text-slate-500 font-sans">Configured 4-Digit PIN:</span>
              <span className="font-bold text-slate-900 font-mono tracking-widest">{formData.loginPin || '1234'}</span>
            </div>
            <div className="flex justify-between items-center text-xs">
              <span className="text-slate-500 font-sans">Booking Centre:</span>
              <span className="font-semibold text-slate-800 font-sans">
                {formData.bookingRegion === 'EU' ? '🇪🇺 Frankfurt (ECB / SEPA)' : formData.bookingRegion === 'UK' ? '🇬🇧 London Mayfair (PRA / FSCS)' : '🇺🇸 New York Wall St (FDIC)'}
              </span>
            </div>
            <div className="flex justify-between items-center text-xs">
              <span className="text-slate-500 font-sans">Initial Balance:</span>
              <span className="font-bold text-emerald-700">€{(Number(formData.initialDepositMinor) / 100).toLocaleString()}</span>
            </div>
            <div className="flex justify-between items-center text-xs pt-1 border-t border-slate-200">
              <span className="text-slate-500 font-sans">Account Status:</span>
              <span className="px-2 py-0.5 rounded bg-emerald-100 text-emerald-800 text-[11px] font-bold inline-flex items-center gap-1">
                <span className="w-1.5 h-1.5 rounded-full bg-emerald-600" />
                ACTIVE &amp; APPROVED
              </span>
            </div>
          </div>

          <div className="flex flex-col sm:flex-row gap-3 justify-center pt-2">
            <button
              onClick={() => setCurrentView('AUTH_LOGIN')}
              className="px-6 py-3.5 rounded-xl bg-[#0a192f] hover:bg-[#132d52] text-white font-bold text-xs uppercase tracking-widest shadow-md transition-all cursor-pointer flex items-center justify-center gap-2"
            >
              <Lock className="w-4 h-4 text-[#d4af37]" />
              <span>Sign In to Your Dashboard</span>
            </button>
            <button
              onClick={() => setCurrentView('PUBLIC_HOME')}
              className="px-6 py-3.5 rounded-xl border border-slate-300 hover:bg-slate-50 text-slate-700 font-semibold text-xs transition-all cursor-pointer"
            >
              Return to Homepage
            </button>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-[85vh] bg-[#f8fafc] py-6 sm:py-10 px-3 sm:px-6 flex justify-center items-center">
      <div className="w-full max-w-3xl bg-white rounded-xl sm:rounded-2xl p-4 sm:p-8 md:p-10 border border-slate-200 shadow-xl space-y-5 sm:space-y-7">
        {/* Header */}
        <div className="text-center space-y-1.5 border-b border-slate-100 pb-4 sm:pb-6">
          <InstitutionalCrest size="md" variant="light" />
          <h2 className="text-xl sm:text-3xl font-bold font-serif text-slate-900 pt-2">
            Open an International Bank Account
          </h2>
          <p className="text-[11px] sm:text-xs text-slate-500 max-w-lg mx-auto">
            European Central Bank &amp; Transatlantic Regulatory Compliance • Multicurrency IBANs in EUR, GBP &amp; USD • Sovereign Deposit Protection
          </p>
        </div>

        {/* Multi-Step Progress Stepper */}
        <div className="grid grid-cols-2 sm:grid-cols-4 gap-2 text-center text-xs font-semibold">
          {[
            { num: 1, label: '1. Applicant & PIN' },
            { num: 2, label: '2. Address & Tax' },
            { num: 3, label: '3. Passport Photo' },
            { num: 4, label: '4. Jurisdictions' }
          ].map((s) => (
            <div
              key={s.num}
              className={`p-2 sm:p-2.5 rounded-xl border transition-all ${
                step === s.num
                  ? 'bg-[#0a192f] text-[#d4af37] border-[#0a192f] shadow-sm'
                  : step > s.num
                  ? 'bg-emerald-50 text-emerald-800 border-emerald-200 font-medium'
                  : 'bg-slate-50 text-slate-400 border-slate-200'
              }`}
            >
              <div className="flex items-center justify-center gap-1.5">
                {step > s.num && <Check className="w-3.5 h-3.5 text-emerald-600" />}
                <span className="text-[11px] sm:text-xs">{s.label}</span>
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
          {/* STEP 1: Personal Applicant Details & Digital Banking PIN */}
          {step === 1 && (
            <div className="space-y-4">
              <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 border-b border-slate-100 pb-2">
                <div className="text-xs uppercase font-bold tracking-wider text-[#8c6d37] font-mono">
                  Primary Account Holder Identity
                </div>
                <div className="flex items-center gap-1.5 overflow-x-auto pb-1 sm:pb-0">
                  <span className="text-[11px] font-semibold text-slate-500 flex items-center gap-1 shrink-0">
                    <Sparkles className="w-3 h-3 text-[#8c6d37]" />
                    <span>Quick Fill:</span>
                  </span>
                  <button
                    type="button"
                    onClick={() => handleApplyPreset('US')}
                    className="px-2 py-1 text-[11px] font-semibold rounded bg-slate-100 hover:bg-slate-200 text-slate-800 border border-slate-200 transition-colors shrink-0 cursor-pointer"
                  >
                    🇺🇸 US Client
                  </button>
                  <button
                    type="button"
                    onClick={() => handleApplyPreset('EU')}
                    className="px-2 py-1 text-[11px] font-semibold rounded bg-slate-100 hover:bg-slate-200 text-slate-800 border border-slate-200 transition-colors shrink-0 cursor-pointer"
                  >
                    🇪🇺 EU Client
                  </button>
                  <button
                    type="button"
                    onClick={() => handleApplyPreset('UK')}
                    className="px-2 py-1 text-[11px] font-semibold rounded bg-slate-100 hover:bg-slate-200 text-slate-800 border border-slate-200 transition-colors shrink-0 cursor-pointer"
                  >
                    🇬🇧 UK Client
                  </button>
                </div>
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
                    {NATIONALITIES.map((nat) => (
                      <option key={nat} value={nat}>
                        {nat}
                      </option>
                    ))}
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
                      className="w-36 px-2 py-2 text-xs bg-slate-50 border border-slate-300 rounded-lg text-slate-900 focus:bg-white truncate"
                    >
                      {COUNTRIES.map((c) => (
                        <option key={c.code} value={c.dialCode}>
                          {c.flag} {c.dialCode} ({c.name})
                        </option>
                      ))}
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

              {/* Digital Banking Credentials & 4-Digit Security PIN */}
              <div className="p-4 bg-slate-50 rounded-xl border border-slate-200 space-y-3">
                <span className="text-xs font-bold uppercase tracking-wider text-slate-800 flex items-center gap-1.5 font-sans">
                  <Lock className="w-3.5 h-3.5 text-[#8c6d37]" />
                  <span>Choose Your Digital Banking Login &amp; 4-Digit Security PIN</span>
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

                {/* 4-Digit PIN selection */}
                <div className="pt-2 border-t border-slate-200 grid grid-cols-1 sm:grid-cols-2 gap-3">
                  <div>
                    <label className="block text-[11px] font-bold text-slate-700 mb-1 flex items-center gap-1">
                      <Key className="w-3 h-3 text-[#8c6d37]" />
                      <span>Login &amp; Transfer PIN (4 Digits) *</span>
                    </label>
                    <input
                      type="password"
                      maxLength={4}
                      required
                      placeholder="••••"
                      value={formData.loginPin}
                      onChange={(e) => handleChange('loginPin', e.target.value.replace(/\D/g, '').slice(0, 4))}
                      className="w-full px-3 py-2 text-sm font-mono text-center tracking-[0.5em] bg-white border border-slate-300 rounded-lg text-slate-900 font-bold"
                    />
                    <span className="text-[10px] text-slate-500 mt-0.5 block">
                      Required at Passport Checkpoint &amp; for transfer approval.
                    </span>
                  </div>

                  <div>
                    <label className="block text-[11px] font-bold text-slate-700 mb-1">
                      Confirm 4-Digit PIN *
                    </label>
                    <input
                      type="password"
                      maxLength={4}
                      required
                      placeholder="••••"
                      value={formData.confirmLoginPin}
                      onChange={(e) => handleChange('confirmLoginPin', e.target.value.replace(/\D/g, '').slice(0, 4))}
                      className="w-full px-3 py-2 text-sm font-mono text-center tracking-[0.5em] bg-white border border-slate-300 rounded-lg text-slate-900 font-bold"
                    />
                  </div>
                </div>
              </div>

              <button
                type="button"
                onClick={() => {
                  if (validateStep1()) setStep(2);
                }}
                className="w-full py-3 rounded-xl bg-[#0a192f] hover:bg-[#132d52] text-white font-bold text-xs uppercase tracking-widest transition-all shadow-md flex items-center justify-center gap-2 cursor-pointer"
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
                    {COUNTRIES.map((c) => (
                      <option key={c.code} value={c.name}>
                        {c.flag} {c.name}
                      </option>
                    ))}
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
                  className="w-1/3 py-2.5 rounded-xl border border-slate-300 hover:bg-slate-50 text-slate-700 font-semibold text-xs cursor-pointer"
                >
                  Back
                </button>
                <button
                  type="button"
                  onClick={() => {
                    if (validateStep2()) setStep(3);
                  }}
                  className="w-2/3 py-2.5 rounded-xl bg-[#0a192f] hover:bg-[#132d52] text-white font-bold text-xs uppercase tracking-widest flex items-center justify-center gap-2 cursor-pointer"
                >
                  <span>Continue to KYC &amp; Passport</span>
                  <ArrowRight className="w-4 h-4" />
                </button>
              </div>
            </div>
          )}

          {/* STEP 3: Passport Biometric Profile Photo Section */}
          {step === 3 && (
            <div className="space-y-4">
              <div className="text-xs uppercase font-bold tracking-wider text-[#8c6d37] font-mono border-b border-slate-100 pb-1">
                Biometric Passport &amp; Profile Picture
              </div>

              <div className="space-y-3">
                <PassportPhotoUploader
                  currentPhoto={formData.passportPhoto}
                  onPhotoChange={(newPhoto) => handleChange('passportPhoto', newPhoto)}
                />
              </div>

              <div className="flex gap-3 pt-2">
                <button
                  type="button"
                  onClick={() => setStep(2)}
                  className="w-1/3 py-2.5 rounded-xl border border-slate-300 hover:bg-slate-50 text-slate-700 font-semibold text-xs cursor-pointer"
                >
                  Back
                </button>
                <button
                  type="button"
                  onClick={() => {
                    if (validateStep3()) setStep(4);
                  }}
                  className="w-2/3 py-2.5 rounded-xl bg-[#0a192f] hover:bg-[#132d52] text-white font-bold text-xs uppercase tracking-widest flex items-center justify-center gap-2 cursor-pointer"
                >
                  <span>Continue to Jurisdictions &amp; Region</span>
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
                      className={`p-3.5 rounded-xl border text-left transition-all cursor-pointer ${
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
                  <label className="block text-xs font-bold uppercase text-slate-700 mb-1">
                    Initial Opening Funding Amount ({formData.requestedCurrency === 'EUR' ? '€' : formData.requestedCurrency === 'GBP' ? '£' : '$'})
                  </label>
                  <div className="relative">
                    <input
                      type="number"
                      step="0.01"
                      min="0"
                      value={formData.initialDepositMinor !== undefined && formData.initialDepositMinor !== null ? (formData.initialDepositMinor / 100) : ''}
                      onChange={(e) => {
                        const num = parseFloat(e.target.value);
                        handleChange('initialDepositMinor', isNaN(num) ? 0 : Math.round(num * 100));
                      }}
                      placeholder="25000"
                      className="w-full px-3.5 py-2 text-sm bg-slate-50 border border-slate-300 rounded-lg text-slate-900 focus:bg-white font-mono font-bold"
                    />
                  </div>
                  {formData.initialDepositMinor > 0 && (
                    <span className="text-xs text-emerald-600 font-mono font-semibold block mt-1">
                      Formatted: {formData.requestedCurrency === 'EUR' ? '€' : formData.requestedCurrency === 'GBP' ? '£' : '$'}{(formData.initialDepositMinor / 100).toLocaleString('en-US', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}
                    </span>
                  )}
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
                  className="w-1/3 py-3 rounded-xl border border-slate-300 hover:bg-slate-50 text-slate-700 font-semibold text-xs cursor-pointer"
                >
                  Back
                </button>
                <button
                  type="submit"
                  disabled={isLoading || !formData.termsAccepted || !formData.fatcaAccepted}
                  className="w-2/3 py-3 rounded-xl bg-gradient-to-r from-[#c5a880] to-[#b39366] hover:brightness-105 text-slate-950 font-bold text-xs uppercase tracking-widest shadow-lg flex items-center justify-center gap-2 cursor-pointer disabled:opacity-50"
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
            className="text-xs text-slate-500 hover:text-slate-800 cursor-pointer"
          >
            Already an account holder? Sign In &rarr;
          </button>
        </div>
      </div>
    </div>
  );
};
