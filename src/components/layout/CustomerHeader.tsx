import React, { useState } from 'react';
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
  Lock
} from 'lucide-react';
import { useBank } from '../../context/BankContext';
import { InstitutionalCrest } from '../common/InstitutionalCrest';

export const CustomerHeader: React.FC = () => {
  const {
    currentUser,
    region,
    setRegion,
    setCurrentView,
    logout,
    accounts,
    recentTransactions
  } = useBank();

  const [notificationsOpen, setNotificationsOpen] = useState(false);
  const [profileMenuOpen, setProfileMenuOpen] = useState(false);

  return (
    <header className="bg-white border-b border-slate-200 sticky top-7 z-20 shadow-xs">
      <div className="px-4 sm:px-8 py-3 flex items-center justify-between gap-4">
        {/* Mobile brand header or search */}
        <div className="flex items-center gap-3">
          <div className="lg:hidden">
            <button onClick={() => setCurrentView('DASHBOARD_OVERVIEW')}>
              <InstitutionalCrest size="sm" variant="light" showSubtitle={false} />
            </button>
          </div>

          <div className="hidden sm:flex items-center gap-2 px-3 py-1.5 rounded-lg bg-slate-100 border border-slate-200 text-slate-500 text-xs w-64 md:w-80">
            <Search className="w-3.5 h-3.5 text-slate-400" />
            <input
              type="text"
              placeholder="Search transactions, payees, reference #"
              className="bg-transparent focus:outline-none text-slate-800 placeholder-slate-400 w-full text-xs"
              onFocus={() => setCurrentView('DASHBOARD_ACCOUNT_DETAIL')}
            />
          </div>
        </div>

        {/* Right Tools & Profile */}
        <div className="flex items-center gap-2 sm:gap-4">
          {/* Quick Transfer Button */}
          <button
            onClick={() => setCurrentView('DASHBOARD_TRANSFERS')}
            className="hidden sm:flex items-center gap-1.5 px-3.5 py-1.5 rounded-lg bg-[#0a192f] hover:bg-[#132c4d] text-white text-xs font-semibold shadow-xs transition-colors"
          >
            <ArrowUpRight className="w-3.5 h-3.5 text-[#d4af37]" />
            <span>Pay &amp; Transfer</span>
          </button>

          {/* Region Badge */}
          <div className="hidden md:flex items-center gap-1 text-xs font-medium text-slate-600 px-2.5 py-1 rounded-md bg-slate-50 border border-slate-200">
            <Globe className="w-3.5 h-3.5 text-slate-500" />
            <span>{region === 'US' ? 'US Hub (USD)' : 'UK Hub (GBP)'}</span>
          </div>

          {/* Notifications */}
          <div className="relative">
            <button
              onClick={() => setNotificationsOpen(!notificationsOpen)}
              className="p-2 rounded-lg text-slate-600 hover:bg-slate-100 relative transition-colors"
              aria-label="View notifications"
            >
              <Bell className="w-4 h-4" />
              <span className="absolute top-1.5 right-1.5 w-2 h-2 rounded-full bg-[#c5a880]" />
            </button>

            {notificationsOpen && (
              <div
                className="absolute right-0 mt-2 w-80 sm:w-96 rounded-xl bg-white border border-slate-200 shadow-xl py-3 z-50 text-slate-800"
                onClick={() => setNotificationsOpen(false)}
              >
                <div className="px-4 py-2 border-b border-slate-100 flex items-center justify-between">
                  <h4 className="text-xs font-bold uppercase tracking-wider text-slate-700 font-serif">
                    Bank Alerts &amp; Notifications
                  </h4>
                  <span className="text-[10px] font-medium text-emerald-700 bg-emerald-50 px-2 py-0.5 rounded-full">
                    2 New
                  </span>
                </div>

                <div className="divide-y divide-slate-100 max-h-72 overflow-y-auto">
                  <div className="p-3.5 hover:bg-slate-50 flex items-start gap-3 transition-colors">
                    <CheckCircle2 className="w-4 h-4 text-emerald-600 shrink-0 mt-0.5" />
                    <div>
                      <p className="text-xs font-semibold text-slate-900">Direct Deposit Credited</p>
                      <p className="text-[11px] text-slate-600 mt-0.5">
                        Morgan Stanley Global Wealth distribution of $28,500.00 posted to Checking.
                      </p>
                      <span className="text-[10px] text-slate-400 font-mono mt-1 block">2 hours ago</span>
                    </div>
                  </div>

                  <div className="p-3.5 hover:bg-slate-50 flex items-start gap-3 transition-colors">
                    <Shield className="w-4 h-4 text-[#8c6d37] shrink-0 mt-0.5" />
                    <div>
                      <p className="text-xs font-semibold text-slate-900">Security Health Check</p>
                      <p className="text-[11px] text-slate-600 mt-0.5">
                        Hardware authenticator TOTP verified successfully from New York session.
                      </p>
                      <span className="text-[10px] text-slate-400 font-mono mt-1 block">Today, 14:22 EST</span>
                    </div>
                  </div>
                </div>

                <div className="p-2 border-t border-slate-100 text-center">
                  <button
                    onClick={() => setCurrentView('DASHBOARD_SECURITY')}
                    className="text-xs font-semibold text-[#8c6d37] hover:text-[#705527]"
                  >
                    Manage Notification Rules in Security Center &rarr;
                  </button>
                </div>
              </div>
            )}
          </div>

          {/* Profile Dropdown */}
          <div className="relative">
            <button
              onClick={() => setProfileMenuOpen(!profileMenuOpen)}
              className="flex items-center gap-2 p-1.5 rounded-lg hover:bg-slate-100 text-slate-800 transition-colors"
            >
              <div className="w-8 h-8 rounded-full bg-gradient-to-tr from-[#0a192f] to-[#1d3d63] text-white flex items-center justify-center font-semibold text-xs border border-[#c5a880]/30 shadow-xs">
                {currentUser?.firstName?.charAt(0) || 'J'}
                {currentUser?.lastName?.charAt(0) || 'S'}
              </div>
            </button>

            {profileMenuOpen && (
              <div
                className="absolute right-0 mt-2 w-56 rounded-xl bg-white border border-slate-200 shadow-xl py-2 z-50 text-slate-800"
                onClick={() => setProfileMenuOpen(false)}
              >
                <div className="px-4 py-2 border-b border-slate-100">
                  <p className="text-xs font-bold text-slate-900">
                    {currentUser ? `${currentUser.firstName} ${currentUser.lastName}` : 'Jonathan Sterling'}
                  </p>
                  <p className="text-[11px] text-slate-500 truncate">{currentUser?.email}</p>
                </div>

                <div className="py-1">
                  <button
                    onClick={() => setCurrentView('DASHBOARD_PROFILE')}
                    className="w-full text-left px-4 py-2 text-xs text-slate-700 hover:bg-slate-50 flex items-center gap-2"
                  >
                    <User className="w-3.5 h-3.5 text-slate-400" />
                    <span>Profile &amp; KYC Info</span>
                  </button>
                  <button
                    onClick={() => setCurrentView('DASHBOARD_SECURITY')}
                    className="w-full text-left px-4 py-2 text-xs text-slate-700 hover:bg-slate-50 flex items-center gap-2"
                  >
                    <Lock className="w-3.5 h-3.5 text-slate-400" />
                    <span>Security Center</span>
                  </button>
                  <button
                    onClick={() => setCurrentView('DASHBOARD_MESSAGES')}
                    className="w-full text-left px-4 py-2 text-xs text-slate-700 hover:bg-slate-50 flex items-center gap-2"
                  >
                    <HelpCircle className="w-3.5 h-3.5 text-slate-400" />
                    <span>Private Concierge</span>
                  </button>
                </div>

                <div className="pt-1 border-t border-slate-100">
                  <button
                    onClick={() => logout()}
                    className="w-full text-left px-4 py-2 text-xs text-rose-600 hover:bg-rose-50 flex items-center gap-2 font-medium"
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
  );
};
