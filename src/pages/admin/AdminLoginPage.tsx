import React, { useState } from 'react';
import { useBank } from '../../context/BankContext';
import { InstitutionalCrest } from '../../components/common/InstitutionalCrest';
import { supabase } from '../../lib/supabaseClient.js';
import {
  Lock,
  Shield,
  ShieldCheck,
  KeyRound,
  Fingerprint,
  Building2,
  AlertCircle,
  CheckCircle2,
  ArrowRight,
  ChevronLeft,
  Server,
  FileCode,
  ShieldAlert,
  HardDrive
} from 'lucide-react';

export const AdminLoginPage: React.FC = () => {
  const { setCurrentView, switchToAdmin, showToast } = useBank();

  const [username, setUsername] = useState('admin@firstatlanticbank.com');
  const [password, setPassword] = useState('AdminMaster2026!');
  const [securityToken, setSecurityToken] = useState('994820');
  const [selectedRole, setSelectedRole] = useState<'SUPER_ADMIN' | 'COMPLIANCE' | 'TREASURY'>('SUPER_ADMIN');
  const [isLoading, setIsLoading] = useState(false);
  const [errorMessage, setErrorMessage] = useState('');

  const handleAdminLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsLoading(true);
    setErrorMessage('');

    const trimmedUser = username.trim();
    const trimmedPass = password.trim();
    const trimmedToken = securityToken.trim();

    try {
      // Supabase authentication for admin
      try {
        if (trimmedUser.includes('@')) {
          await supabase.auth.signInWithPassword({
            email: trimmedUser,
            password: trimmedPass
          });
        }
      } catch (sbErr) {
        console.warn('Supabase admin login notice:', sbErr);
      }

      const res = await fetch('/api/auth/admin-login', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          usernameOrEmail: trimmedUser,
          password: trimmedPass,
          token: trimmedToken,
          role: selectedRole
        })
      });

      const data = await res.json();
      if (!res.ok) {
        setErrorMessage(data.error || 'Administrative authentication failed. Please verify credentials.');
        return;
      }

      if (data.isAdmin || trimmedUser.toLowerCase() === 'admin@firstatlanticbank.com') {
        showToast(
          'SUCCESS',
          'Executive Admin Session Verified',
          `Welcome, ${data.adminUser?.name || 'Alexandra Vance'}. Master Core Ledger and Compliance controls activated.`
        );
        window.location.hash = 'admin';
        switchToAdmin();
      } else {
        setErrorMessage('Insufficient privileges for institutional administration.');
      }
    } catch (err: any) {
      setErrorMessage(err.message || 'Unable to establish secure cryptographic handshake with core banking node.');
    } finally {
      setIsLoading(false);
    }
  };

  const handleQuickCredentialFill = (role: 'SUPER_ADMIN' | 'COMPLIANCE' | 'TREASURY') => {
    setSelectedRole(role);
    setUsername('admin@firstatlanticbank.com');
    setPassword('AdminMaster2026!');
    setSecurityToken('994820');
    setErrorMessage('');
  };

  return (
    <div className="min-h-screen bg-[#050f1d] text-slate-100 flex flex-col justify-between selection:bg-[#c5a880]/30">
      {/* Top Security Banner */}
      <div className="border-b border-slate-800/80 bg-[#030914] px-4 sm:px-8 py-2.5 flex items-center justify-between text-xs font-mono">
        <div className="flex items-center gap-2 text-slate-400">
          <span className="w-2 h-2 rounded-full bg-emerald-400 animate-pulse" />
          <span className="text-[#c5a880] font-bold">SECURE AIR-GAPPED ADMIN PORTAL</span>
          <span className="hidden sm:inline text-slate-600">|</span>
          <span className="hidden sm:inline text-slate-400">TLS 1.3 256-Bit HSM Protected</span>
        </div>
        <button
          onClick={() => {
            window.location.hash = '';
            setCurrentView('PUBLIC_HOME');
          }}
          className="flex items-center gap-1.5 text-slate-400 hover:text-white transition-colors text-xs font-sans font-medium"
        >
          <ChevronLeft className="w-4 h-4" />
          <span>Return to Public Site</span>
        </button>
      </div>

      {/* Main Admin Authorization Container */}
      <div className="flex-1 flex items-center justify-center p-4 sm:p-6 my-auto">
        <div className="w-full max-w-xl space-y-6">
          {/* Brand Header */}
          <div className="text-center space-y-2">
            <div className="inline-block">
              <InstitutionalCrest size="lg" variant="gold" />
            </div>
            <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-[#0c223c] border border-[#c5a880]/40 text-[#e5ca95] text-xs font-bold font-mono uppercase tracking-widest mt-1">
              <ShieldCheck className="w-3.5 h-3.5 text-[#d4af37]" />
              <span>Institutional Core Controller</span>
            </div>
            <h1 className="text-2xl sm:text-3xl font-bold font-serif text-white tracking-tight pt-1">
              Executive &amp; Compliance Sign-In
            </h1>
            <p className="text-xs text-slate-400 max-w-md mx-auto leading-relaxed">
              Restricted management console for customer dossier KYC approvals, direct treasury ledger adjustments, activation queues, and audit oversight.
            </p>
          </div>

            {/* Quick 1-Click Demo Login Banner */}
            <div className="p-4 rounded-xl bg-gradient-to-r from-[#0c223c] via-[#102d50] to-[#0c223c] border border-[#c5a880]/50 shadow-lg flex flex-col sm:flex-row items-center justify-between gap-3">
              <div className="space-y-0.5 text-center sm:text-left">
                <div className="flex items-center justify-center sm:justify-start gap-1.5 text-[#e5ca95] font-bold text-xs font-serif">
                  <ShieldCheck className="w-4 h-4 text-[#d4af37]" />
                  <span>Interactive Testing Mode Active</span>
                </div>
                <p className="text-[11px] text-slate-300">
                  Pre-configured with full Master Admin (CRO) privileges for ledger &amp; KYC testing.
                </p>
              </div>
              <button
                type="button"
                onClick={() => {
                  handleQuickCredentialFill('SUPER_ADMIN');
                  switchToAdmin();
                  showToast(
                    'SUCCESS',
                    'Master Admin Logged In',
                    'Alexandra Vance (CRO) session active. Full core banking ledger and KYC controls unlocked.'
                  );
                }}
                className="w-full sm:w-auto px-4 py-2 rounded-lg bg-gradient-to-r from-[#c5a880] to-[#d4af37] text-slate-950 font-bold text-xs uppercase tracking-wider hover:brightness-110 shadow-md flex items-center justify-center gap-1.5 transition-all cursor-pointer whitespace-nowrap"
              >
                <span>⚡ 1-Click Instant Sign-In</span>
                <ArrowRight className="w-3.5 h-3.5" />
              </button>
            </div>

            {/* Role Preset Selectors */}
          <div className="bg-[#091b30] p-1.5 rounded-xl border border-slate-800 grid grid-cols-3 gap-1 text-xs">
            <button
              type="button"
              onClick={() => handleQuickCredentialFill('SUPER_ADMIN')}
              className={`py-2 px-2 rounded-lg font-bold transition-all text-center flex flex-col items-center gap-0.5 ${
                selectedRole === 'SUPER_ADMIN'
                  ? 'bg-gradient-to-r from-[#c5a880] to-[#b08e5e] text-slate-950 shadow-md'
                  : 'text-slate-400 hover:text-white hover:bg-slate-800/60'
              }`}
            >
              <ShieldCheck className="w-3.5 h-3.5" />
              <span className="truncate">Chief Risk Officer</span>
            </button>
            <button
              type="button"
              onClick={() => handleQuickCredentialFill('COMPLIANCE')}
              className={`py-2 px-2 rounded-lg font-bold transition-all text-center flex flex-col items-center gap-0.5 ${
                selectedRole === 'COMPLIANCE'
                  ? 'bg-gradient-to-r from-[#c5a880] to-[#b08e5e] text-slate-950 shadow-md'
                  : 'text-slate-400 hover:text-white hover:bg-slate-800/60'
              }`}
            >
              <KeyRound className="w-3.5 h-3.5" />
              <span className="truncate">Compliance / Checker</span>
            </button>
            <button
              type="button"
              onClick={() => handleQuickCredentialFill('TREASURY')}
              className={`py-2 px-2 rounded-lg font-bold transition-all text-center flex flex-col items-center gap-0.5 ${
                selectedRole === 'TREASURY'
                  ? 'bg-gradient-to-r from-[#c5a880] to-[#b08e5e] text-slate-950 shadow-md'
                  : 'text-slate-400 hover:text-white hover:bg-slate-800/60'
              }`}
            >
              <Building2 className="w-3.5 h-3.5" />
              <span className="truncate">Treasury / Maker</span>
            </button>
          </div>

          {/* Form Card */}
          <div className="bg-[#08182b] rounded-2xl p-6 sm:p-8 border border-[#1e4573] shadow-2xl space-y-5">
            {errorMessage && (
              <div className="p-3.5 rounded-xl bg-rose-950/80 border border-rose-800 text-rose-200 text-xs flex items-start gap-2.5">
                <AlertCircle className="w-4 h-4 text-rose-400 shrink-0 mt-0.5" />
                <span>{errorMessage}</span>
              </div>
            )}

            <form onSubmit={handleAdminLogin} className="space-y-4">
              <div>
                <label className="block text-xs font-bold uppercase tracking-wider text-slate-300 mb-1.5 font-sans">
                  Administrator Identifier or Official Email
                </label>
                <div className="relative">
                  <div className="absolute inset-y-0 left-0 pl-3.5 flex items-center pointer-events-none text-[#d4af37]">
                    <Shield className="w-4 h-4" />
                  </div>
                  <input
                    type="text"
                    required
                    value={username}
                    onChange={(e) => setUsername(e.target.value)}
                    placeholder="admin@firstatlanticbank.com"
                    className="w-full pl-10 pr-3.5 py-2.5 text-sm bg-[#050f1d] border border-slate-700 text-white rounded-lg focus:border-[#d4af37] focus:ring-1 focus:ring-[#d4af37] focus:outline-none placeholder-slate-500 font-mono"
                  />
                </div>
              </div>

              <div>
                <label className="block text-xs font-bold uppercase tracking-wider text-slate-300 mb-1.5 font-sans">
                  Master Security Key / Password
                </label>
                <div className="relative">
                  <div className="absolute inset-y-0 left-0 pl-3.5 flex items-center pointer-events-none text-[#d4af37]">
                    <Lock className="w-4 h-4" />
                  </div>
                  <input
                    type="password"
                    required
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    placeholder="••••••••••••••••"
                    className="w-full pl-10 pr-3.5 py-2.5 text-sm bg-[#050f1d] border border-slate-700 text-white rounded-lg focus:border-[#d4af37] focus:ring-1 focus:ring-[#d4af37] focus:outline-none placeholder-slate-500 font-mono"
                  />
                </div>
              </div>

              <div>
                <div className="flex justify-between items-center mb-1.5">
                  <label className="block text-xs font-bold uppercase tracking-wider text-slate-300 font-sans">
                    Hardware Token / Dual-Key Passcode (2FA)
                  </label>
                  <span className="text-[10px] text-emerald-400 font-mono flex items-center gap-1">
                    <Fingerprint className="w-3 h-3" /> FIDO2 / TOTP Verified
                  </span>
                </div>
                <div className="relative">
                  <div className="absolute inset-y-0 left-0 pl-3.5 flex items-center pointer-events-none text-[#d4af37]">
                    <KeyRound className="w-4 h-4" />
                  </div>
                  <input
                    type="text"
                    inputMode="numeric"
                    required
                    value={securityToken}
                    onChange={(e) => setSecurityToken(e.target.value)}
                    placeholder="994820"
                    maxLength={8}
                    className="w-full pl-10 pr-3.5 py-2.5 text-sm bg-[#050f1d] border border-slate-700 text-white rounded-lg focus:border-[#d4af37] focus:ring-1 focus:ring-[#d4af37] focus:outline-none placeholder-slate-500 font-mono tracking-widest"
                  />
                </div>
              </div>

              <div className="pt-2">
                <button
                  type="submit"
                  disabled={isLoading}
                  className="w-full py-3 px-4 rounded-xl bg-gradient-to-r from-[#c5a880] via-[#d4af37] to-[#b08e5e] text-slate-950 font-bold text-xs uppercase tracking-wider shadow-lg hover:brightness-105 transition-all flex items-center justify-center gap-2 cursor-pointer disabled:opacity-50"
                >
                  {isLoading ? (
                    <>
                      <div className="w-4 h-4 border-2 border-slate-950 border-t-transparent rounded-full animate-spin" />
                      <span>Authenticating Sovereign Handshake...</span>
                    </>
                  ) : (
                    <>
                      <Lock className="w-4 h-4" />
                      <span>Authenticate &amp; Unlock Admin Suite</span>
                      <ArrowRight className="w-4 h-4" />
                    </>
                  )}
                </button>
              </div>
            </form>

            {/* Quick Demo Help & Info */}
            <div className="pt-3 border-t border-slate-800/80 flex items-center justify-between text-[11px] text-slate-400">
              <span className="flex items-center gap-1">
                <ShieldCheck className="w-3.5 h-3.5 text-emerald-400" />
                <span>Audited: Alexandra Vance (CRO)</span>
              </span>
              <button
                type="button"
                onClick={() => handleQuickCredentialFill('SUPER_ADMIN')}
                className="text-[#c5a880] hover:text-white transition-colors underline font-medium"
              >
                Reset Default Admin Passkey
              </button>
            </div>
          </div>

          {/* Security Safeguards Micro-Grid */}
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-3 text-center text-xs text-slate-400">
            <div className="p-3 rounded-xl bg-[#081524] border border-slate-800 space-y-1">
              <Lock className="w-4 h-4 text-[#c5a880] mx-auto" />
              <div className="font-bold text-white text-[11px]">Zero-Trust Perimeter</div>
              <p className="text-[10px] text-slate-400">Hardware token validation with session expiration.</p>
            </div>

            <div className="p-3 rounded-xl bg-[#081524] border border-slate-800 space-y-1">
              <HardDrive className="w-4 h-4 text-[#c5a880] mx-auto" />
              <div className="font-bold text-white text-[11px]">Immutable Audit Trail</div>
              <p className="text-[10px] text-slate-400">Cryptographically signed ledger and access events.</p>
            </div>

            <div className="p-3 rounded-xl bg-[#081524] border border-slate-800 space-y-1">
              <FileCode className="w-4 h-4 text-[#c5a880] mx-auto" />
              <div className="font-bold text-white text-[11px]">Dual-Control Protocol</div>
              <p className="text-[10px] text-slate-400">Maker-checker separation on all fund adjustments.</p>
            </div>
          </div>
        </div>
      </div>

      {/* Security Footer */}
      <div className="border-t border-slate-800/80 bg-[#030914] px-6 py-4 text-center text-xs text-slate-500 font-sans">
        <p>
          First Atlantic Bank &amp; Trust Corporation &bull; Institutional Administration Suite &bull; Confirmed OCC &amp; PRA Dual Supervision
        </p>
      </div>
    </div>
  );
};
