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
  Menu,
  X
} from 'lucide-react';
import { useBank } from '../../context/BankContext';
import { InstitutionalCrest } from '../common/InstitutionalCrest';
import { GlobalSearchModal } from '../common/GlobalSearchModal';
import { CustomerSidebar } from './CustomerSidebar';

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
  const [mobileDrawerOpen, setMobileDrawerOpen] = useState(false);

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

  const userInitials = currentUser
    ? `${currentUser.firstName?.charAt(0) || 'F'}${currentUser.lastName?.charAt(0) || 'A'}`
    : 'FA';

  return (
    <>
      <GlobalSearchModal isOpen={searchModalOpen} onClose={() => setSearchModalOpen(false)} />

      {/* Mobile Drawer */}
      {mobileDrawerOpen && (
        <div className="fixed inset-0 z-50 lg:hidden bg-black/75 backdrop-blur-sm flex animate-in fade-in duration-200">
          <div 
            className="fixed inset-0" 
            onClick={() => setMobileDrawerOpen(false)} 
            aria-hidden="true" 
          />
          <div className="relative z-10 animate-in slide-in-from-left duration-250 ease-out h-full">
            <CustomerSidebar isMobile onClose={() => setMobileDrawerOpen(false)} />
          </div>
        </div>
      )}

      <header className="bg-white dark:bg-[#121212] border-b border-slate-100 dark:border-slate-800 sticky top-0 z-30 transition-colors duration-200">
        <div className="px-4 sm:px-6 py-3 flex items-center justify-between gap-3 max-w-md mx-auto sm:max-w-lg md:max-w-xl">
          {/* Left: Hamburger menu & First Atlantic Brand Logo */}
          <div className="flex items-center gap-3">
            <button
              onClick={() => setMobileDrawerOpen(true)}
              className="p-1 -ml-1 rounded-lg text-black dark:text-white hover:bg-slate-100 dark:hover:bg-slate-800 transition-colors cursor-pointer"
              aria-label="Open Navigation Menu"
            >
              <Menu className="w-6 h-6 stroke-[2.2]" />
            </button>

            {/* Logo: First Atlantic. */}
            <button
              onClick={() => setCurrentView('DASHBOARD_OVERVIEW')}
              className="flex items-center cursor-pointer select-none transition-transform active:scale-98"
            >
              <span className="text-xl sm:text-2xl font-bold tracking-tight text-black dark:text-white">
                First Atlantic
              </span>
              <span className="w-2 h-2 rounded-full bg-[#FFC300] ml-1 self-end mb-1" />
            </button>
          </div>

          {/* Right: Bell Icon + Round Avatar with #FFC300 background & "FA" */}
          <div className="flex items-center gap-3 shrink-0">
            {/* Bell Icon */}
            <div className="relative">
              <button
                onClick={() => setNotificationsOpen(!notificationsOpen)}
                className="p-1.5 text-black dark:text-white hover:bg-slate-100 dark:hover:bg-slate-800 rounded-full transition-colors cursor-pointer relative"
                aria-label="View notifications"
              >
                <Bell className="w-5 h-5 stroke-[1.8]" />
              </button>

              {notificationsOpen && (
                <div
                  className="absolute right-0 mt-2 w-80 sm:w-96 rounded-2xl bg-white dark:bg-[#1a1a1a] border border-slate-200 dark:border-slate-800 shadow-xl py-3 z-50 text-black dark:text-white animate-in fade-in zoom-in-95 duration-150"
                  onClick={() => setNotificationsOpen(false)}
                >
                  <div className="px-4 py-2 border-b border-slate-100 dark:border-slate-800 flex items-center justify-between">
                    <h4 className="text-xs font-bold uppercase tracking-wider text-[#6B7280]">
                      Notifications
                    </h4>
                    <span className="text-[10px] font-bold text-black bg-[#FFC300] px-2 py-0.5 rounded-full">
                      2 New
                    </span>
                  </div>

                  <div className="divide-y divide-slate-100 dark:divide-slate-800 max-h-72 overflow-y-auto">
                    <div className="p-3.5 hover:bg-slate-50 dark:hover:bg-slate-800/50 flex items-start gap-3 transition-colors">
                      <CheckCircle2 className="w-4 h-4 text-[#10B981] shrink-0 mt-0.5" />
                      <div>
                        <p className="text-xs font-semibold text-black dark:text-white">Direct Deposit Credited</p>
                        <p className="text-[11px] text-[#6B7280] mt-0.5">
                          Direct clearing distribution of $28,500.00 posted to Checking.
                        </p>
                        <span className="text-[10px] text-[#6B7280] mt-1 block">2 hours ago</span>
                      </div>
                    </div>

                    <div className="p-3.5 hover:bg-slate-50 dark:hover:bg-slate-800/50 flex items-start gap-3 transition-colors">
                      <Shield className="w-4 h-4 text-[#FFC300] shrink-0 mt-0.5" />
                      <div>
                        <p className="text-xs font-semibold text-black dark:text-white">Security Enclave Active</p>
                        <p className="text-[11px] text-[#6B7280] mt-0.5">
                          Hardware authenticator &amp; FIDO2 passkey are operational.
                        </p>
                        <span className="text-[10px] text-[#6B7280] mt-1 block">Today, 14:22 EST</span>
                      </div>
                    </div>
                  </div>

                  <div className="p-2 border-t border-slate-100 dark:border-slate-800 text-center">
                    <button
                      onClick={() => setCurrentView('DASHBOARD_SECURITY')}
                      className="text-xs font-semibold text-black dark:text-white hover:underline cursor-pointer"
                    >
                      Manage in Security Center &rarr;
                    </button>
                  </div>
                </div>
              )}
            </div>

            {/* Round Avatar "FA" with #FFC300 Background */}
            <div className="relative">
              <button
                onClick={() => setProfileMenuOpen(!profileMenuOpen)}
                className="w-8 h-8 sm:w-9 sm:h-9 rounded-full bg-[#FFC300] text-black font-bold flex items-center justify-center text-xs sm:text-sm shadow-xs hover:opacity-95 transition-all cursor-pointer select-none"
                aria-label="User profile menu"
              >
                {userInitials || 'FA'}
              </button>

              {profileMenuOpen && (
                <div
                  className="absolute right-0 mt-2 w-60 rounded-2xl bg-white dark:bg-[#1a1a1a] border border-slate-200 dark:border-slate-800 shadow-xl py-2 z-50 text-black dark:text-white animate-in fade-in zoom-in-95 duration-150"
                  onClick={() => setProfileMenuOpen(false)}
                >
                  <div className="px-4 py-2.5 border-b border-slate-100 dark:border-slate-800">
                    <p className="text-xs font-bold text-black dark:text-white">
                      {currentUser ? `${currentUser.firstName} ${currentUser.lastName}` : 'First Atlantic Admin'}
                    </p>
                    <p className="text-[11px] text-[#6B7280] truncate">{currentUser?.email || 'admin@firstatlantic.com'}</p>
                  </div>

                  <div className="py-1">
                    <button
                      onClick={() => setCurrentView('DASHBOARD_PROFILE')}
                      className="w-full text-left px-4 py-2 text-xs text-slate-700 dark:text-slate-300 hover:bg-slate-100 dark:hover:bg-slate-800 flex items-center gap-2 cursor-pointer"
                    >
                      <User className="w-3.5 h-3.5 text-slate-400" />
                      <span>Profile &amp; KYC Info</span>
                    </button>
                    <button
                      onClick={() => setCurrentView('DASHBOARD_SECURITY')}
                      className="w-full text-left px-4 py-2 text-xs text-slate-700 dark:text-slate-300 hover:bg-slate-100 dark:hover:bg-slate-800 flex items-center gap-2 cursor-pointer"
                    >
                      <Lock className="w-3.5 h-3.5 text-slate-400" />
                      <span>Security &amp; Biometrics</span>
                    </button>
                    <button
                      onClick={toggleDarkMode}
                      className="w-full text-left px-4 py-2 text-xs text-slate-700 dark:text-slate-300 hover:bg-slate-100 dark:hover:bg-slate-800 flex items-center justify-between cursor-pointer"
                    >
                      <span className="flex items-center gap-2">
                        {darkMode ? <Sun className="w-3.5 h-3.5 text-[#FFC300]" /> : <Moon className="w-3.5 h-3.5 text-slate-400" />}
                        <span>{darkMode ? 'Light Mode' : 'Dark Mode'}</span>
                      </span>
                      <span className="text-[10px] font-bold px-1.5 py-0.5 rounded bg-slate-100 dark:bg-slate-800">
                        {darkMode ? 'DARK' : 'LIGHT'}
                      </span>
                    </button>
                  </div>

                  <div className="pt-1 border-t border-slate-100 dark:border-slate-800">
                    <button
                      onClick={() => logout()}
                      className="w-full text-left px-4 py-2 text-xs text-rose-600 dark:text-rose-400 hover:bg-rose-50 dark:hover:bg-rose-950/20 flex items-center gap-2 font-semibold cursor-pointer"
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


