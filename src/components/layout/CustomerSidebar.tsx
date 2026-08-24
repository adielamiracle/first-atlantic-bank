import React from 'react';
import {
  LayoutDashboard,
  Wallet,
  ArrowLeftRight,
  Receipt,
  CreditCard,
  Camera,
  FileText,
  ShieldCheck,
  MessageSquare,
  User,
  LogOut,
  Landmark,
  ShieldAlert,
  ChevronRight,
  Sun,
  Moon,
  Fingerprint
} from 'lucide-react';
import { useBank, AppView } from '../../context/BankContext';
import { InstitutionalCrest } from '../common/InstitutionalCrest';

export const CustomerSidebar: React.FC = () => {
  const { 
    currentView, 
    setCurrentView, 
    currentUser, 
    currentRole,
    logout, 
    switchToAdmin, 
    darkMode, 
    toggleDarkMode,
    biometricState
  } = useBank();

  const menuItems: { label: string; view: AppView; icon: React.ComponentType<{ className?: string }> }[] = [
    { label: 'Overview', view: 'DASHBOARD_OVERVIEW', icon: LayoutDashboard },
    { label: 'Accounts & Ledger', view: 'DASHBOARD_ACCOUNT_DETAIL', icon: Wallet },
    { label: 'Transfers & Wires', view: 'DASHBOARD_TRANSFERS', icon: ArrowLeftRight },
    { label: 'Bill Pay & Remittance', view: 'DASHBOARD_BILLPAY', icon: Receipt },
    { label: 'Cards & Limits', view: 'DASHBOARD_CARDS', icon: CreditCard },
    { label: 'Mobile Check Deposit', view: 'DASHBOARD_DEPOSIT', icon: Camera },
    { label: 'Statements & Tax', view: 'DASHBOARD_STATEMENTS', icon: FileText },
    { label: 'Security Center', view: 'DASHBOARD_SECURITY', icon: ShieldCheck },
    { label: 'Concierge Messages', view: 'DASHBOARD_MESSAGES', icon: MessageSquare },
    { label: 'Profile & Settings', view: 'DASHBOARD_PROFILE', icon: User }
  ];

  return (
    <aside className="w-64 bg-[#081728] border-r border-slate-800/90 text-slate-300 flex flex-col justify-between shrink-0 h-screen sticky top-0 overflow-y-auto select-none hidden lg:flex shadow-xl">
      <div>
        {/* Top Brand Logo */}
        <div className="p-5 border-b border-slate-800/80">
          <button
            onClick={() => setCurrentView('DASHBOARD_OVERVIEW')}
            className="w-full text-left focus:outline-none cursor-pointer"
          >
            <InstitutionalCrest size="sm" variant="gold" />
          </button>
        </div>

        {/* Client Tier Indicator & Biometric Status */}
        <div className="mx-4 my-3.5 p-3 rounded-xl bg-[#0d233e] border border-[#c5a880]/20 flex items-center justify-between">
          <div>
            <div className="text-[10px] uppercase font-bold tracking-wider text-[#c5a880]">
              {currentUser?.kycTier ? String(currentUser.kycTier).replace(/_/g, ' ') : 'Private Client'}
            </div>
            <div className="text-xs font-semibold text-white truncate max-w-[130px]">
              {currentUser ? `${currentUser.firstName} ${currentUser.lastName}` : 'Client Session'}
            </div>
          </div>
          <div className="flex items-center gap-1.5">
            {biometricState.enabled && (
              <span title="FIDO2 Hardware Biometrics Enrolled">
                <Fingerprint className="w-3.5 h-3.5 text-emerald-400" />
              </span>
            )}
            <div className="w-2 h-2 rounded-full bg-emerald-400" title="Tier 2 Authenticated" />
          </div>
        </div>

        {/* Nav Links */}
        <div className="px-3 py-2 space-y-1">
          {menuItems.map((item) => {
            const Icon = item.icon;
            const isActive = currentView === item.view;
            return (
              <button
                key={item.view}
                onClick={() => setCurrentView(item.view)}
                className={`w-full flex items-center gap-3 px-3 py-2.5 rounded-lg text-xs font-medium transition-all cursor-pointer ${
                  isActive
                    ? 'bg-gradient-to-r from-[#1c3a60] to-[#122842] text-white font-semibold shadow-sm border-l-2 border-[#c5a880]'
                    : 'text-slate-400 hover:text-white hover:bg-slate-800/60'
                }`}
              >
                <Icon className={`w-4 h-4 ${isActive ? 'text-[#d4af37]' : 'text-slate-400'}`} />
                <span className="truncate">{item.label}</span>
              </button>
            );
          })}
        </div>
      </div>

      {/* Bottom Controls: Dark Mode Toggle, Admin, Sign Out */}
      <div className="p-4 border-t border-slate-800 space-y-2">
        {/* Dark Mode Switcher */}
        <button
          onClick={toggleDarkMode}
          className="w-full flex items-center justify-between px-3 py-2 rounded-lg bg-slate-900/80 hover:bg-slate-800 text-slate-300 text-xs font-medium border border-slate-800 transition-colors cursor-pointer"
        >
          <span className="flex items-center gap-2">
            {darkMode ? <Sun className="w-3.5 h-3.5 text-[#e5ca95]" /> : <Moon className="w-3.5 h-3.5 text-slate-400" />}
            <span>{darkMode ? 'Dark Theme (Active)' : 'Light Theme'}</span>
          </span>
          <span className="text-[10px] font-mono px-1.5 py-0.5 rounded bg-slate-800 text-[#c5a880]">
            {darkMode ? 'DARK' : 'LIGHT'}
          </span>
        </button>

        {/* Admin Console - Only visible if user has ADMIN role for maximum privacy and security */}
        {(currentRole === 'ADMIN' || currentUser?.role === 'ADMIN') && (
          <button
            onClick={() => switchToAdmin()}
            className="w-full flex items-center justify-between px-3 py-2 rounded-lg bg-amber-950/30 hover:bg-amber-950/60 text-amber-300 text-xs font-medium border border-amber-800/40 transition-colors cursor-pointer"
          >
            <span className="flex items-center gap-2">
              <ShieldAlert className="w-3.5 h-3.5 text-amber-400" />
              <span>Admin Console</span>
            </span>
            <ChevronRight className="w-3 h-3 text-amber-400/70" />
          </button>
        )}

        <button
          onClick={() => logout()}
          className="w-full flex items-center gap-2.5 px-3 py-2 rounded-lg text-slate-400 hover:text-rose-400 hover:bg-rose-950/20 text-xs font-medium transition-colors cursor-pointer"
        >
          <LogOut className="w-4 h-4" />
          <span>Sign Out</span>
        </button>
      </div>
    </aside>
  );
};
