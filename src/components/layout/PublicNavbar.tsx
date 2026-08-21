import React, { useState } from 'react';
import { InstitutionalCrest } from '../common/InstitutionalCrest';
import { useBank, AppView } from '../../context/BankContext';
import { Lock, Menu, X, ChevronRight, Globe, Shield, PhoneCall, Building2 } from 'lucide-react';

export const PublicNavbar: React.FC = () => {
  const { currentView, setCurrentView, region, setRegion } = useBank();
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);

  const navItems: { label: string; view: AppView }[] = [
    { label: 'Personal', view: 'PUBLIC_PERSONAL' },
    { label: 'Business', view: 'PUBLIC_BUSINESS' },
    { label: 'Wealth & Private', view: 'PUBLIC_WEALTH' },
    { label: 'International', view: 'PUBLIC_INTERNATIONAL' },
    { label: 'Locations', view: 'PUBLIC_LOCATIONS' },
    { label: 'Security', view: 'PUBLIC_SECURITY' }
  ];

  return (
    <nav className="bg-[#0a192f] border-b border-slate-800 text-white sticky top-7 z-30 shadow-lg">
      {/* Top micro institutional bar */}
      <div className="border-b border-slate-800/80 px-4 sm:px-8 py-1 text-[11px] text-slate-400 flex justify-between items-center max-w-7xl mx-auto font-sans">
        <div className="flex items-center gap-4">
          <span className="flex items-center gap-1 text-[#c5a880]">
            <Shield className="w-3 h-3" />
            <span>EU Guarantee €100k • FSCS £85k • FDIC $250k Protected</span>
          </span>
          <span className="hidden md:inline text-slate-600">•</span>
          <span className="hidden md:inline">24/7 Concierge: +49 69 9000 8800</span>
          <span className="hidden lg:inline text-slate-600">•</span>
          <a href="mailto:support@firstatlanticbank.com" className="hidden lg:inline hover:text-[#c5a880] transition-colors">
            support@firstatlanticbank.com
          </a>
        </div>
        <div className="flex items-center gap-3">
          <a href="mailto:contact@firstatlanticbank.com" className="hover:text-white transition-colors flex items-center gap-1 text-[11px]">
            <span>contact@firstatlanticbank.com</span>
          </a>
          <span className="text-slate-600">|</span>
          <button
            onClick={() => setCurrentView('PUBLIC_LOCATIONS')}
            className="hover:text-white transition-colors flex items-center gap-1"
          >
            <Building2 className="w-3 h-3 text-[#c5a880]" />
            <span className="hidden sm:inline">Frankfurt • Zurich • London • New York</span>
            <span className="sm:hidden">Branches</span>
          </button>
        </div>
      </div>

      {/* Main Bar */}
      <div className="max-w-7xl mx-auto px-4 sm:px-8 py-3.5 flex items-center justify-between">
        <button
          onClick={() => setCurrentView('PUBLIC_HOME')}
          className="text-left focus:outline-none"
        >
          <InstitutionalCrest size="md" variant="gold" />
        </button>

        {/* Desktop Nav Links */}
        <div className="hidden lg:flex items-center gap-7 text-sm font-medium text-slate-300">
          {navItems.map((item) => (
            <button
              key={item.view}
              onClick={() => setCurrentView(item.view)}
              className={`hover:text-white transition-colors py-1 relative ${
                currentView === item.view ? 'text-[#e5ca95] font-semibold' : ''
              }`}
            >
              {item.label}
              {currentView === item.view && (
                <span className="absolute bottom-0 left-0 right-0 h-0.5 bg-[#c5a880]" />
              )}
            </button>
          ))}
        </div>

        {/* Actions */}
        <div className="hidden sm:flex items-center gap-3">
          <button
            onClick={() => setCurrentView('AUTH_ENROLL')}
            className="px-4 py-2 text-xs font-semibold uppercase tracking-wider text-[#e5ca95] hover:text-white border border-[#c5a880]/50 hover:border-[#c5a880] rounded-lg transition-all"
          >
            Open Account
          </button>
          <button
            onClick={() => setCurrentView('AUTH_LOGIN')}
            className="px-5 py-2 text-xs font-semibold uppercase tracking-wider bg-gradient-to-r from-[#c5a880] to-[#b39366] text-slate-950 hover:brightness-105 rounded-lg shadow-md flex items-center gap-1.5 transition-all font-sans font-bold"
          >
            <Lock className="w-3.5 h-3.5" />
            <span>Sign In</span>
          </button>
        </div>

        {/* Mobile Menu Toggle */}
        <button
          onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
          className="lg:hidden text-slate-300 hover:text-white p-1.5"
          aria-label="Toggle Navigation"
        >
          {mobileMenuOpen ? <X className="w-6 h-6" /> : <Menu className="w-6 h-6" />}
        </button>
      </div>

      {/* Mobile Drawer */}
      {mobileMenuOpen && (
        <div className="lg:hidden border-t border-slate-800 bg-[#071322] px-6 py-5 space-y-4">
          <div className="flex flex-col space-y-3">
            {navItems.map((item) => (
              <button
                key={item.view}
                onClick={() => {
                  setCurrentView(item.view);
                  setMobileMenuOpen(false);
                }}
                className={`text-left text-sm py-2 px-3 rounded-lg ${
                  currentView === item.view ? 'bg-slate-800 text-[#e5ca95] font-semibold' : 'text-slate-300'
                }`}
              >
                {item.label}
              </button>
            ))}
          </div>

          <div className="pt-4 border-t border-slate-800 flex flex-col gap-3">
            <button
              onClick={() => {
                setCurrentView('AUTH_LOGIN');
                setMobileMenuOpen(false);
              }}
              className="w-full py-2.5 text-center text-sm font-bold bg-[#c5a880] text-slate-950 rounded-lg flex items-center justify-center gap-2"
            >
              <Lock className="w-4 h-4" />
              Sign In to First Atlantic
            </button>
            <button
              onClick={() => {
                setCurrentView('AUTH_ENROLL');
                setMobileMenuOpen(false);
              }}
              className="w-full py-2.5 text-center text-sm font-semibold border border-slate-700 text-slate-300 rounded-lg"
            >
              Open an Account
            </button>
          </div>
        </div>
      )}
    </nav>
  );
};
