import React, { useState, useEffect } from 'react';
import {
  Bell,
  Search,
  HelpCircle,
  Shield,
  ArrowUpRight,
  LogOut,
  User,
  CheckCircle2,
  AlertTriangle,
  Globe,
  Lock,
  Sun,
  Moon,
  Fingerprint,
  ShieldCheck
} from 'lucide-react';
import { useBank } from '../../context/BankContext';
import { InstitutionalCrest } from '../common/InstitutionalCrest';
import { GlobalSearchModal } from '../common/GlobalSearchModal';

export const CustomerHeader: React.FC = () => {
  const {
    currentUser,
    region,
    setRegion,
    setCurrentView,
    logout,
    accounts,
    recentTransactions,
    darkMode,
    toggleDarkMode,
    biometricState,
    openBiometricPrompt
  } = useBank();

  const [notificationsOpen, setNotificationsOpen] = useState(false);
  const [profileMenuOpen, setProfileMenuOpen] = useState(false);
  const [searchModalOpen, setSearchModalOpen] = useState(false);

  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if ((e.metaKey || e.ctrlKey) && e.key === 'k') {
        e.preventDefault();
        setSearchModalOpen(true);
      }
    };
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, []);

  return (
    <>
      <GlobalSearchModal isOpen={searchModalOpen} onClose={() => setSearchModalOpen(false)} />

      <header className="bg-white dark:bg-[#0a192f] border-b border-slate-200 dark:border-[#1e3656] sticky top-0 z-20 shadow-xs transition-colors duration-200">
        <div className="px-4 sm:px-8 py-3 flex items-center justify-between gap-4">
          {/* Mobile brand header or search */}
          <div className="flex items-center gap-3">
            <div className="lg:hidden">
              <button onClick={() => setCurrentView('DASHBOARD_OVERVIEW')} className="cursor-pointer">
                <InstitutionalCrest size="sm" variant={darkMode ? "dark" : "light"} showSubtitle={false} />
              </button>
            </div>

            <button
              onClick={() => setSearchModalOpen(true)}
              className="flex items-center justify-between gap-2 px-3 py-1.5 rounded-lg bg-slate-100 dark:bg-slate-900 border border-slate-200 dark:border-slate-800 text-slate-500 dark:text-slate-400 text-xs w-60 md:w-80 cursor-pointer hover:border-slate-300 dark:hover:border-slate-700 transition-colors text-left"
            >
              <div className="flex items-center gap-2 overflow-hidden">
                <Search className="w-3.5 h-3.5 text-[#d4af37] shrink-0" />
                <span className="text-slate-500 dark:text-slate-400 truncate">
                  Search banks, routing codes, wires...
                </span>
              </div>
              <kbd className="hidden sm:inline-block px-1.5 py-0.5 text-[10px] font-mono bg-slate-200 dark:bg-slate-800 text-slate-600 dark:text-slate-400 rounded border border-slate-300 dark:border-slate-700 shrink-0">
                ⌘K
              </kbd>
            </button>
          </div>

        {/* Right Tools & Profile */}
        <div className="flex items-center gap-2 sm:gap-4">
          {/* Dark Mode Toggle Button */}
          <button
            onClick={toggleDarkMode}
            title={darkMode ? "Switch to Light Mode" : "Switch to Institutional Dark Mode"}
            aria-label="Toggle dark mode theme"
            className="p-2 rounded-lg text-slate-600 dark:text-slate-300 hover:bg-slate-100 dark:hover:bg-slate-800 transition-colors border border-transparent hover:border-slate-200 dark:hover:border-slate-700 cursor-pointer flex items-center gap-1.5"
          >
            {darkMode ? (
              <>
                <Sun className="w-4 h-4 text-[#e5ca95]" />
                <span className="hidden xl:inline text-[11px] font-semibold text-[#e5ca95]">Light</span>
              </>
            ) : (
              <>
                <Moon className="w-4 h-4 text-[#0a192f]" />
                <span className="hidden xl:inline text-[11px] font-semibold text-slate-700">Dark</span>
              </>
            )}
          </button>

          {/* Quick Biometric Verification Shortcut if enabled */}
          {biometricState.enabled && (
            <button
              onClick={() => openBiometricPrompt({ mode: 'VERIFY', title: 'Hardware Biometric Verification', subtitle: 'Simulate instant Touch ID / Face ID sensor verification.' })}
              className="hidden lg:flex items-center gap-1.5 px-2.5 py-1 rounded-md text-[11px] font-semibold bg-emerald-500/10 text-emerald-600 dark:text-emerald-400 border border-emerald-500/20 hover:bg-emerald-500/20 transition-colors cursor-pointer"
              title="Biometric Hardware Enclave Active"
            >
              <Fingerprint className="w-3.5 h-3.5" />
              <span>FIDO2 Active</span>
            </button>
          )}

          {/* Quick Transfer Button */}
          <button
            onClick={() => setCurrentView('DASHBOARD_TRANSFERS')}
            className="hidden sm:flex items-center gap-1.5 px-3.5 py-1.5 rounded-lg bg-[#0a192f] dark:bg-[#112a4a] hover:bg-[#132c4d] dark:hover:bg-[#193a64] text-white text-xs font-semibold shadow-xs transition-colors cursor-pointer border border-[#c5a880]/30"
          >
            <ArrowUpRight className="w-3.5 h-3.5 text-[#d4af37]" />
            <span>Pay &amp; Transfer</span>
          </button>

          {/* Region Badge */}
          <div className="hidden md:flex items-center gap-1 text-xs font-medium text-slate-600 dark:text-slate-300 px-2.5 py-1 rounded-md bg-slate-50 dark:bg-slate-900 border border-slate-200 dark:border-slate-800">
            <Globe className="w-3.5 h-3.5 text-slate-500 dark:text-slate-400" />
            <span>{region === 'US' ? 'US Hub (USD)' : 'UK Hub (GBP)'}</span>
          </div>

          {/* Notifications */}
          <div className="relative">
            <button
              onClick={() => setNotificationsOpen(!notificationsOpen)}
              className="p-2 rounded-lg text-slate-600 dark:text-slate-300 hover:bg-slate-100 dark:hover:bg-slate-800 relative transition-colors cursor-pointer"
              aria-label="View notifications"
            >
              <Bell className="w-4 h-4" />
              <span className="absolute top-1.5 right-1.5 w-2 h-2 rounded-full bg-[#c5a880]" />
            </button>

            {notificationsOpen && (
              <div
                className="absolute right-0 mt-2 w-80 sm:w-96 rounded-xl bg-white dark:bg-[#0d2038] border border-slate-200 dark:border-[#1e3656] shadow-xl py-3 z-50 text-slate-800 dark:text-slate-100"
                onClick={() => setNotificationsOpen(false)}
              >
                <div className="px-4 py-2 border-b border-slate-100 dark:border-slate-800 flex items-center justify-between">
                  <h4 className="text-xs font-bold uppercase tracking-wider text-slate-700 dark:text-slate-300 font-serif">
                    Bank Alerts &amp; Notifications
                  </h4>
                  <span className="text-[10px] font-medium text-emerald-700 dark:text-emerald-400 bg-emerald-50 dark:bg-emerald-950/60 px-2 py-0.5 rounded-full border border-emerald-200 dark:border-emerald-800">
                    2 New
                  </span>
                </div>

                <div className="divide-y divide-slate-100 dark:divide-slate-800 max-h-72 overflow-y-auto">
                  <div className="p-3.5 hover:bg-slate-50 dark:hover:bg-slate-800/60 flex items-start gap-3 transition-colors">
                    <CheckCircle2 className="w-4 h-4 text-emerald-600 dark:text-emerald-400 shrink-0 mt-0.5" />
                    <div>
                      <p className="text-xs font-semibold text-slate-900 dark:text-slate-100">Direct Deposit Credited</p>
                      <p className="text-[11px] text-slate-600 dark:text-slate-400 mt-0.5">
                        Morgan Stanley Global Wealth distribution of $28,500.00 posted to Checking.
                      </p>
                      <span className="text-[10px] text-slate-400 font-mono mt-1 block">2 hours ago</span>
                    </div>
                  </div>

                  <div className="p-3.5 hover:bg-slate-50 dark:hover:bg-slate-800/60 flex items-start gap-3 transition-colors">
                    <Shield className="w-4 h-4 text-[#8c6d37] dark:text-[#c5a880] shrink-0 mt-0.5" />
                    <div>
                      <p className="text-xs font-semibold text-slate-900 dark:text-slate-100">Biometric &amp; Security Health</p>
                      <p className="text-[11px] text-slate-600 dark:text-slate-400 mt-0.5">
                        {biometricState.enabled ? 'FIDO2 Hardware Enclave verified active.' : 'Hardware authenticator TOTP verified successfully.'}
                      </p>
                      <span className="text-[10px] text-slate-400 font-mono mt-1 block">Today, 14:22 EST</span>
                    </div>
                  </div>
                </div>

                <div className="p-2 border-t border-slate-100 dark:border-slate-800 text-center">
                  <button
                    onClick={() => setCurrentView('DASHBOARD_SECURITY')}
                    className="text-xs font-semibold text-[#8c6d37] dark:text-[#c5a880] hover:underline cursor-pointer"
                  >
                    Manage Security in Security Center &rarr;
                  </button>
                </div>
              </div>
            )}
          </div>

          {/* Profile Dropdown */}
          <div className="relative">
            <button
              onClick={() => setProfileMenuOpen(!profileMenuOpen)}
              className="flex items-center gap-2 p-1.5 rounded-lg hover:bg-slate-100 dark:hover:bg-slate-800 text-slate-800 dark:text-slate-100 transition-colors cursor-pointer"
            >
              <div className="w-8 h-8 rounded-full bg-gradient-to-tr from-[#0a192f] to-[#1d3d63] text-white flex items-center justify-center font-semibold text-xs border border-[#c5a880]/30 shadow-xs">
                {currentUser?.firstName?.charAt(0) || 'J'}
                {currentUser?.lastName?.charAt(0) || 'S'}
              </div>
            </button>

            {profileMenuOpen && (
              <div
                className="absolute right-0 mt-2 w-60 rounded-xl bg-white dark:bg-[#0d2038] border border-slate-200 dark:border-[#1e3656] shadow-xl py-2 z-50 text-slate-800 dark:text-slate-100"
                onClick={() => setProfileMenuOpen(false)}
              >
                <div className="px-4 py-2 border-b border-slate-100 dark:border-slate-800">
                  <p className="text-xs font-bold text-slate-900 dark:text-slate-100">
                    {currentUser ? `${currentUser.firstName} ${currentUser.lastName}` : 'Jonathan Sterling'}
                  </p>
                  <p className="text-[11px] text-slate-500 dark:text-slate-400 truncate">{currentUser?.email}</p>
                </div>

                <div className="py-1">
                  <button
                    onClick={() => setCurrentView('DASHBOARD_PROFILE')}
                    className="w-full text-left px-4 py-2 text-xs text-slate-700 dark:text-slate-300 hover:bg-slate-50 dark:hover:bg-slate-800/80 flex items-center gap-2 cursor-pointer"
                  >
                    <User className="w-3.5 h-3.5 text-slate-400" />
                    <span>Profile &amp; KYC Info</span>
                  </button>
                  <button
                    onClick={() => setCurrentView('DASHBOARD_SECURITY')}
                    className="w-full text-left px-4 py-2 text-xs text-slate-700 dark:text-slate-300 hover:bg-slate-50 dark:hover:bg-slate-800/80 flex items-center gap-2 cursor-pointer"
                  >
                    <Lock className="w-3.5 h-3.5 text-slate-400" />
                    <span>Security &amp; Biometrics</span>
                  </button>
                  <button
                    onClick={toggleDarkMode}
                    className="w-full text-left px-4 py-2 text-xs text-slate-700 dark:text-slate-300 hover:bg-slate-50 dark:hover:bg-slate-800/80 flex items-center justify-between cursor-pointer"
                  >
                    <div className="flex items-center gap-2">
                      {darkMode ? <Sun className="w-3.5 h-3.5 text-[#c5a880]" /> : <Moon className="w-3.5 h-3.5 text-slate-400" />}
                      <span>Dark Mode</span>
                    </div>
                    <span className="text-[10px] font-mono font-bold px-1.5 py-0.5 rounded bg-slate-100 dark:bg-slate-800 text-slate-600 dark:text-slate-400">
                      {darkMode ? 'ON' : 'OFF'}
                    </span>
                  </button>
                  <button
                    onClick={() => setCurrentView('DASHBOARD_MESSAGES')}
                    className="w-full text-left px-4 py-2 text-xs text-slate-700 dark:text-slate-300 hover:bg-slate-50 dark:hover:bg-slate-800/80 flex items-center gap-2 cursor-pointer"
                  >
                    <HelpCircle className="w-3.5 h-3.5 text-slate-400" />
                    <span>Private Concierge</span>
                  </button>
                </div>

                <div className="pt-1 border-t border-slate-100 dark:border-slate-800">
                  <button
                    onClick={() => logout()}
                    className="w-full text-left px-4 py-2 text-xs text-rose-600 dark:text-rose-400 hover:bg-rose-50 dark:hover:bg-rose-950/30 flex items-center gap-2 font-medium cursor-pointer"
                  >
                    <LogOut className="w-3.5 h-3.5" />
                    <span>Sign Out</span>
                  </button>
                </div>
              </div>
            )}
          </div>
        </div>
      </div>
    </header>
  </>
  );
};

