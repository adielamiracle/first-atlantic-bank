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
        <div className="fixed inset-0 z-50 lg:hidden bg-slate-900/60 backdrop-blur-xs flex">
          <div className="w-72 max-w-[80vw] bg-white dark:bg-[#071322] h-full shadow-2xl p-5 flex flex-col justify-between overflow-y-auto animate-in slide-in-from-left duration-200">
            <div className="space-y-4">
              <div className="flex items-center justify-between pb-3 border-b border-slate-100 dark:border-slate-800">
                <button
                  onClick={() => {
                    setCurrentView('DASHBOARD_OVERVIEW');
                    setMobileDrawerOpen(false);
                  }}
                  className="flex items-center gap-1.5 cursor-pointer"
                >
                  <span className="font-serif text-lg font-bold tracking-tight text-slate-900 dark:text-white">
                    First Atlantic
                  </span>
                  <span className="w-2 h-2 rounded-full bg-[#f8c22d]" />
                </button>
                <button
                  onClick={() => setMobileDrawerOpen(false)}
                  className="p-1 rounded-lg text-slate-400 hover:text-slate-700 dark:hover:text-slate-200"
                >
                  <X className="w-5 h-5" />
                </button>
              </div>

              {/* User badge */}
              <div className="p-3 rounded-xl bg-amber-50/80 dark:bg-amber-950/30 border border-amber-200/60 dark:border-amber-900/40 flex items-center gap-3">
                <div className="w-10 h-10 rounded-full bg-[#f8c22d] text-slate-950 font-bold flex items-center justify-center text-sm shadow-xs shrink-0">
                  {userInitials}
                </div>
                <div className="min-w-0">
                  <div className="text-xs font-bold text-slate-900 dark:text-white truncate">
                    {currentUser ? `${currentUser.firstName} ${currentUser.lastName}` : 'First Atlantic Client'}
                  </div>
                  <div className="text-[11px] text-amber-800 dark:text-amber-300 font-medium">
                    Verified Tier 3 Account
                  </div>
                </div>
              </div>

              {/* Nav links */}
              <div className="space-y-1 text-xs">
                {[
                  { label: 'Overview', view: 'DASHBOARD_OVERVIEW' },
                  { label: 'Accounts & Ledger', view: 'DASHBOARD_ACCOUNT_DETAIL' },
                  { label: 'Transfers & Wires', view: 'DASHBOARD_TRANSFERS' },
                  { label: 'Bill Pay & Remittance', view: 'DASHBOARD_BILLPAY' },
                  { label: 'Cards & Spend Limits', view: 'DASHBOARD_CARDS' },
                  { label: 'Mobile Check Deposit', view: 'DASHBOARD_DEPOSIT' },
                  { label: 'Statements & Tax Reports', view: 'DASHBOARD_STATEMENTS' },
                  { label: 'Security & Biometrics', view: 'DASHBOARD_SECURITY' },
                  { label: 'Private Concierge', view: 'DASHBOARD_MESSAGES' },
                  { label: 'Profile & KYC Settings', view: 'DASHBOARD_PROFILE' }
                ].map((item) => (
                  <button
                    key={item.view}
                    onClick={() => {
                      setCurrentView(item.view as any);
                      setMobileDrawerOpen(false);
                    }}
                    className="w-full text-left px-3 py-2.5 rounded-lg font-medium text-slate-700 dark:text-slate-200 hover:bg-slate-100 dark:hover:bg-slate-800/80 transition-colors"
                  >
                    {item.label}
                  </button>
                ))}
              </div>
            </div>

            <div className="pt-4 border-t border-slate-100 dark:border-slate-800 space-y-2">
              <button
                onClick={toggleDarkMode}
                className="w-full flex items-center justify-between px-3 py-2 rounded-lg text-xs font-medium text-slate-600 dark:text-slate-300 hover:bg-slate-100 dark:hover:bg-slate-800"
              >
                <span className="flex items-center gap-2">
                  {darkMode ? <Sun className="w-4 h-4 text-[#f8c22d]" /> : <Moon className="w-4 h-4 text-slate-500" />}
                  {darkMode ? 'Light Theme' : 'Dark Theme'}
                </span>
                <span className="text-[10px] font-bold px-1.5 py-0.5 rounded bg-slate-100 dark:bg-slate-800">
                  {darkMode ? 'DARK' : 'LIGHT'}
                </span>
              </button>

              <button
                onClick={() => logout()}
                className="w-full flex items-center gap-2 px-3 py-2 rounded-lg text-xs font-semibold text-rose-600 dark:text-rose-400 hover:bg-rose-50 dark:hover:bg-rose-950/30"
              >
                <LogOut className="w-4 h-4" />
                <span>Sign Out</span>
              </button>
            </div>
          </div>
        </div>
      )}

      <header className="bg-white dark:bg-[#071322] border-b border-slate-100 dark:border-slate-800/80 sticky top-0 z-30 transition-colors duration-200 shadow-xs">
        <div className="px-3 sm:px-6 lg:px-8 py-2.5 flex items-center justify-between gap-2 sm:gap-4 max-w-7xl mx-auto">
          {/* Mobile Left: Hamburger + Brand Name */}
          <div className="flex items-center gap-2 sm:gap-4 min-w-0">
            <button
              onClick={() => setMobileDrawerOpen(true)}
              className="lg:hidden p-1.5 rounded-lg text-slate-700 dark:text-slate-200 hover:bg-slate-100 dark:hover:bg-slate-800 cursor-pointer"
              aria-label="Open Navigation Menu"
            >
              <Menu className="w-5 h-5" />
            </button>

            <button
              onClick={() => setCurrentView('DASHBOARD_OVERVIEW')}
              className="flex items-center gap-1.5 cursor-pointer text-left select-none shrink-0"
            >
              <span className="text-lg sm:text-xl font-bold font-serif tracking-tight text-slate-900 dark:text-white">
                First Atlantic
              </span>
              <span className="w-2 h-2 rounded-full bg-[#f8c22d] inline-block shadow-2xs" />
            </button>

            {/* Sticky Search trigger for tablet/desktop */}
            <button
              onClick={() => setSearchModalOpen(true)}
              className="hidden md:flex items-center justify-between gap-2 px-3 py-1.5 rounded-full bg-slate-100 dark:bg-slate-900 border border-slate-200/80 dark:border-slate-800 text-slate-500 dark:text-slate-400 text-xs w-48 lg:w-64 cursor-pointer hover:border-slate-300 dark:hover:border-slate-700 transition-colors text-left shadow-2xs"
            >
              <div className="flex items-center gap-2 overflow-hidden min-w-0">
                <Search className="w-3.5 h-3.5 text-slate-400 shrink-0" />
                <span className="text-slate-500 dark:text-slate-400 truncate text-[11px]">
                  Search accounts, wires...
                </span>
              </div>
              <kbd className="hidden lg:inline-block px-1.5 py-0.2 text-[9px] font-mono bg-slate-200 dark:bg-slate-800 text-slate-500 rounded">
                ⌘K
              </kbd>
            </button>
          </div>

          {/* Center Mobile Sticky Quick Search Bar */}
          <div className="flex-1 md:hidden max-w-[210px] sm:max-w-[280px]">
            <button
              onClick={() => setSearchModalOpen(true)}
              className="w-full flex items-center gap-1.5 px-2.5 py-1.5 rounded-full bg-slate-100 dark:bg-slate-900 border border-slate-200/80 dark:border-slate-800 text-slate-500 dark:text-slate-400 text-xs cursor-pointer hover:bg-slate-200/60 transition-colors"
            >
              <Search className="w-3.5 h-3.5 text-slate-400 shrink-0" />
              <span className="truncate text-[11px] text-slate-500 dark:text-slate-400">Search...</span>
            </button>
          </div>

          {/* Right: Notifications & Yellow Initials Avatar */}
          <div className="flex items-center gap-1.5 sm:gap-3 shrink-0">
            {/* Dark mode toggle */}
            <button
              onClick={toggleDarkMode}
              title={darkMode ? "Switch to Light Mode" : "Switch to Dark Mode"}
              aria-label="Toggle dark mode theme"
              className="p-1.5 sm:p-2 rounded-full text-slate-600 dark:text-slate-300 hover:bg-slate-100 dark:hover:bg-slate-800 transition-colors cursor-pointer"
            >
              {darkMode ? <Sun className="w-4 h-4 text-[#f8c22d]" /> : <Moon className="w-4 h-4 text-slate-600" />}
            </button>

            {/* Quick Pay button on desktop */}
            <button
              onClick={() => setCurrentView('DASHBOARD_TRANSFERS')}
              className="hidden lg:flex items-center gap-1.5 px-3.5 py-1.5 rounded-full bg-slate-900 dark:bg-white text-white dark:text-slate-900 text-xs font-semibold hover:opacity-90 transition-opacity cursor-pointer shadow-2xs"
            >
              <ArrowUpRight className="w-3.5 h-3.5" />
              <span>Send Money</span>
            </button>

            {/* Notifications Bell with Mobile & Desktop Unread Alerts Badge */}
            <div className="relative">
              <button
                onClick={() => setNotificationsOpen(!notificationsOpen)}
                className="p-1.5 sm:p-2 rounded-full text-slate-700 dark:text-slate-200 hover:bg-slate-100 dark:hover:bg-slate-800 relative transition-colors cursor-pointer"
                aria-label="View notifications and unread alerts"
              >
                <Bell className="w-5 h-5" />
                {/* Visual Unread Counter Badge visible on mobile and desktop */}
                <span className="absolute -top-0.5 -right-0.5 min-w-4 h-4 px-1 rounded-full bg-[#d4001a] text-white text-[9px] font-bold flex items-center justify-center ring-2 ring-white dark:ring-[#071322] shadow-xs animate-pulse">
                  2
                </span>
              </button>

              {notificationsOpen && (
                <div
                  className="absolute right-0 mt-2 w-80 sm:w-96 rounded-2xl bg-white dark:bg-[#0d2038] border border-slate-200 dark:border-[#1e3656] shadow-xl py-3 z-50 text-slate-800 dark:text-slate-100 animate-in fade-in zoom-in-95 duration-150"
                  onClick={() => setNotificationsOpen(false)}
                >
                  <div className="px-4 py-2 border-b border-slate-100 dark:border-slate-800 flex items-center justify-between">
                    <h4 className="text-xs font-bold uppercase tracking-wider text-slate-700 dark:text-slate-300">
                      Bank Alerts &amp; Notifications
                    </h4>
                    <span className="text-[10px] font-bold text-white bg-[#d4001a] px-2 py-0.5 rounded-full">
                      2 Unread
                    </span>
                  </div>

                  <div className="divide-y divide-slate-100 dark:divide-slate-800 max-h-72 overflow-y-auto">
                    <div className="p-3.5 hover:bg-slate-50 dark:hover:bg-slate-800/60 flex items-start gap-3 transition-colors">
                      <CheckCircle2 className="w-4 h-4 text-emerald-600 dark:text-emerald-400 shrink-0 mt-0.5" />
                      <div>
                        <div className="flex items-center gap-1.5">
                          <p className="text-xs font-semibold text-slate-900 dark:text-slate-100">Direct Deposit Credited</p>
                          <span className="w-1.5 h-1.5 rounded-full bg-[#d4001a]" />
                        </div>
                        <p className="text-[11px] text-slate-600 dark:text-slate-400 mt-0.5">
                          Direct clearing distribution of $28,500.00 posted to Checking.
                        </p>
                        <span className="text-[10px] text-slate-400 font-mono mt-1 block">2 hours ago</span>
                      </div>
                    </div>

                    <div className="p-3.5 hover:bg-slate-50 dark:hover:bg-slate-800/60 flex items-start gap-3 transition-colors">
                      <Shield className="w-4 h-4 text-amber-500 shrink-0 mt-0.5" />
                      <div>
                        <div className="flex items-center gap-1.5">
                          <p className="text-xs font-semibold text-slate-900 dark:text-slate-100">Security &amp; Device Protected</p>
                          <span className="w-1.5 h-1.5 rounded-full bg-[#d4001a]" />
                        </div>
                        <p className="text-[11px] text-slate-600 dark:text-slate-400 mt-0.5">
                          {biometricState.enabled ? 'FIDO2 Hardware Enclave verified active.' : 'Hardware authenticator active.'}
                        </p>
                        <span className="text-[10px] text-slate-400 font-mono mt-1 block">Today, 14:22 EST</span>
                      </div>
                    </div>
                  </div>

                  <div className="p-2 border-t border-slate-100 dark:border-slate-800 text-center">
                    <button
                      onClick={() => setCurrentView('DASHBOARD_SECURITY')}
                      className="text-xs font-semibold text-amber-600 dark:text-amber-400 hover:underline cursor-pointer"
                    >
                      Manage in Security Center &rarr;
                    </button>
                  </div>
                </div>
              )}
            </div>

            {/* Circular Yellow Avatar matching screenshot (NB or JS) */}
            <div className="relative">
              <button
                onClick={() => setProfileMenuOpen(!profileMenuOpen)}
                className="w-8 h-8 sm:w-9 sm:h-9 rounded-full bg-[#f8c22d] text-slate-950 font-bold flex items-center justify-center text-xs shadow-xs hover:opacity-90 transition-opacity cursor-pointer border border-amber-300/50"
                aria-label="User profile menu"
              >
                {userInitials}
              </button>

              {profileMenuOpen && (
                <div
                  className="absolute right-0 mt-2 w-60 rounded-2xl bg-white dark:bg-[#0d2038] border border-slate-200 dark:border-[#1e3656] shadow-xl py-2 z-50 text-slate-800 dark:text-slate-100 animate-in fade-in zoom-in-95 duration-150"
                  onClick={() => setProfileMenuOpen(false)}
                >
                  <div className="px-4 py-2.5 border-b border-slate-100 dark:border-slate-800">
                    <p className="text-xs font-bold text-slate-900 dark:text-slate-100">
                      {currentUser ? `${currentUser.firstName} ${currentUser.lastName}` : 'First Atlantic Client'}
                    </p>
                    <p className="text-[11px] text-slate-500 dark:text-slate-400 truncate">{currentUser?.email || 'client@firstatlantic.com'}</p>
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
                      className="w-full text-left px-4 py-2 text-xs text-rose-600 dark:text-rose-400 hover:bg-rose-50 dark:hover:bg-rose-950/30 flex items-center gap-2 font-semibold cursor-pointer"
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


