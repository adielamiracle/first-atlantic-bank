import React, { useState, useEffect } from 'react';
import { InstitutionalCrest } from '../common/InstitutionalCrest';
import { useBank, AppView } from '../../context/BankContext';
import { Lock, Menu, X, Globe, Building2, Sun, Moon, Search, ShieldCheck } from 'lucide-react';
import { GlobalSearchModal } from '../common/GlobalSearchModal';

export const PublicNavbar: React.FC = () => {
  const { currentView, setCurrentView, region, setRegion, darkMode, toggleDarkMode } = useBank();
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const [searchModalOpen, setSearchModalOpen] = useState(false);

  // Global keyboard shortcut for search (Cmd+K / Ctrl+K)
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

  const navItems: { label: string; view: AppView }[] = [
    { label: 'Private Banking', view: 'PUBLIC_PERSONAL' },
    { label: 'Corporate Treasury', view: 'PUBLIC_BUSINESS' },
    { label: 'Wealth Management', view: 'PUBLIC_WEALTH' },
    { label: 'International Markets', view: 'PUBLIC_INTERNATIONAL' },
    { label: 'Global Offices', view: 'PUBLIC_LOCATIONS' },
    { label: 'Security & Custody', view: 'PUBLIC_SECURITY' }
  ];

  return (
    <>
      <GlobalSearchModal isOpen={searchModalOpen} onClose={() => setSearchModalOpen(false)} />

      <nav className="bg-[#030813]/95 dark:bg-[#02050c]/98 backdrop-blur-2xl border-b border-slate-800/80 text-white sticky top-0 z-30 shadow-2xl transition-colors">
        {/* Main Bar */}
        <div className="max-w-7xl mx-auto px-4 sm:px-8 py-3.5 flex items-center justify-between gap-3 sm:gap-4">
          <button
            onClick={() => setCurrentView('PUBLIC_HOME')}
            className="text-left focus:outline-none cursor-pointer shrink-0 transition-transform active:scale-95"
          >
            <InstitutionalCrest size="md" variant="gold" />
          </button>

          {/* Desktop Nav Links */}
          <div className="hidden lg:flex items-center gap-1.5 p-1 rounded-full bg-black/50 dark:bg-black/70 border border-white/10 backdrop-blur-md text-xs xl:text-sm font-medium text-slate-300 shadow-inner">
            {navItems.map((item) => (
              <button
                key={item.view}
                onClick={() => setCurrentView(item.view)}
                className={`px-3.5 py-1.5 rounded-full transition-all cursor-pointer whitespace-nowrap ${
                  currentView === item.view
                    ? 'bg-white/15 text-[#fce7b2] font-semibold shadow-xs border border-white/20'
                    : 'hover:text-white hover:bg-white/10 text-slate-300'
                }`}
              >
                {item.label}
              </button>
            ))}
          </div>

          {/* Actions */}
          <div className="hidden sm:flex items-center gap-2.5">
            {/* Global Search Trigger (Glass Capsule) */}
            <button
              onClick={() => setSearchModalOpen(true)}
              title="Search worldwide banks, routing codes, branches (⌘K)"
              className="flex items-center gap-2 px-3 py-1.5 rounded-full bg-black/40 hover:bg-black/60 border border-white/10 hover:border-white/25 text-slate-300 text-xs transition-all cursor-pointer backdrop-blur-md shadow-xs"
            >
              <Search className="w-3.5 h-3.5 text-[#d4af37]" />
              <span className="hidden xl:inline text-slate-300 text-xs">Search Banks &amp; Codes</span>
              <kbd className="hidden sm:inline-block px-1.5 py-0.5 text-[10px] font-mono bg-white/10 text-slate-300 rounded border border-white/10">
                ⌘K
              </kbd>
            </button>

            {/* Subtle Region Selector */}
            <div className="flex items-center rounded-full p-0.5 bg-black/40 border border-white/10 backdrop-blur-md text-[11px]">
              {(['EU', 'UK', 'US'] as const).map((r) => (
                <button
                  key={r}
                  onClick={() => setRegion(r)}
                  className={`px-2.5 py-1 rounded-full text-[10px] font-bold transition-all cursor-pointer ${
                    region === r ? 'bg-gradient-to-r from-[#d4af37] to-[#c5a880] text-slate-950 shadow-xs' : 'text-slate-400 hover:text-white'
                  }`}
                >
                  {r}
                </button>
              ))}
            </div>

            <button
              onClick={toggleDarkMode}
              title={darkMode ? "Switch to Light Mode" : "Switch to Dark Mode"}
              aria-label="Toggle Dark Mode"
              className="p-2 rounded-full text-slate-300 hover:text-white bg-black/40 hover:bg-black/60 transition-all cursor-pointer border border-white/10 backdrop-blur-md"
            >
              {darkMode ? <Sun className="w-4 h-4 text-[#e5ca95]" /> : <Moon className="w-4 h-4 text-slate-300" />}
            </button>

            <button
              onClick={() => setCurrentView('AUTH_ENROLL')}
              className="px-3.5 py-1.5 text-xs font-bold uppercase tracking-wider text-[#e5ca95] hover:text-white bg-black/30 hover:bg-black/50 border border-[#c5a880]/50 hover:border-[#c5a880] rounded-full backdrop-blur-md transition-all cursor-pointer whitespace-nowrap"
            >
              Open Account
            </button>
            <button
              onClick={() => setCurrentView('AUTH_LOGIN')}
              className="px-4.5 py-1.5 text-xs font-bold uppercase tracking-wider bg-gradient-to-r from-[#c5a880] to-[#b39366] text-slate-950 hover:brightness-110 rounded-full shadow-md flex items-center gap-1.5 transition-all font-sans cursor-pointer whitespace-nowrap active:scale-95"
            >
              <Lock className="w-3.5 h-3.5" />
              <span>Sign In</span>
            </button>
            <button
              onClick={() => {
                window.location.hash = 'admin';
                setCurrentView('AUTH_ADMIN_LOGIN');
              }}
              title="First Atlantic Institutional Admin Portal"
              className="px-3 py-1.5 text-xs font-bold uppercase tracking-wider text-[#d4af37] hover:text-white bg-[#004281]/50 hover:bg-[#004281]/90 border border-[#d4af37]/40 hover:border-[#d4af37] rounded-full backdrop-blur-md transition-all cursor-pointer flex items-center gap-1.5 whitespace-nowrap"
            >
              <ShieldCheck className="w-3.5 h-3.5 text-[#d4af37]" />
              <span>Admin Portal</span>
            </button>
          </div>

          {/* Mobile Actions & Menu Toggle */}
          <div className="flex sm:hidden items-center gap-1.5">
            <button
              onClick={() => setSearchModalOpen(true)}
              className="p-2 rounded-full text-slate-300 hover:text-white bg-black/40 border border-white/10 cursor-pointer backdrop-blur-md"
              aria-label="Open Global Search"
            >
              <Search className="w-4 h-4 text-[#d4af37]" />
            </button>
            <button
              onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
              className="text-slate-300 hover:text-white p-2 rounded-full bg-black/40 border border-white/10 backdrop-blur-md cursor-pointer"
              aria-label="Toggle Navigation"
            >
              {mobileMenuOpen ? <X className="w-5 h-5" /> : <Menu className="w-5 h-5" />}
            </button>
          </div>
        </div>

        {/* Mobile Drawer */}
        {mobileMenuOpen && (
          <div className="lg:hidden border-t border-slate-800 bg-[#030813]/98 backdrop-blur-2xl px-4 sm:px-6 py-4 space-y-4 animate-in slide-in-from-top-2 duration-200">
            {/* Quick Region & Dark Mode Row on Mobile */}
            <div className="flex items-center justify-between pb-3 border-b border-white/10">
              <div className="flex items-center rounded-full p-0.5 bg-white/5 border border-white/10 text-xs">
                {(['EU', 'UK', 'US'] as const).map((r) => (
                  <button
                    key={r}
                    onClick={() => setRegion(r)}
                    className={`px-3 py-1 rounded-full text-xs font-bold transition-colors cursor-pointer ${
                      region === r ? 'bg-[#c5a880] text-slate-950' : 'text-slate-400 hover:text-white'
                    }`}
                  >
                    {r}
                  </button>
                ))}
              </div>

              <button
                onClick={toggleDarkMode}
                className="px-3 py-1.5 rounded-full text-xs font-medium text-slate-300 hover:text-white bg-white/5 border border-white/10 flex items-center gap-1.5 cursor-pointer backdrop-blur-md"
              >
                {darkMode ? <Sun className="w-3.5 h-3.5 text-[#e5ca95]" /> : <Moon className="w-3.5 h-3.5 text-slate-300" />}
                <span>{darkMode ? "Light" : "Dark"}</span>
              </button>
            </div>

            <div className="flex flex-col space-y-1.5">
              <button
                onClick={() => {
                  setMobileMenuOpen(false);
                  setSearchModalOpen(true);
                }}
                className="text-left text-sm py-2.5 px-3.5 rounded-xl text-[#e5ca95] bg-white/5 border border-white/10 flex items-center gap-2 cursor-pointer font-medium backdrop-blur-md"
              >
                <Search className="w-4 h-4 text-[#d4af37]" />
                <span>Search Worldwide Banks &amp; Codes (⌘K)</span>
              </button>

              {navItems.map((item) => (
                <button
                  key={item.view}
                  onClick={() => {
                    setCurrentView(item.view);
                    setMobileMenuOpen(false);
                  }}
                  className={`text-left text-sm py-2 px-3.5 rounded-xl cursor-pointer transition-colors ${
                    currentView === item.view ? 'bg-white/15 text-[#e5ca95] font-semibold border border-white/10' : 'text-slate-300 hover:bg-white/5'
                  }`}
                >
                  {item.label}
                </button>
              ))}
            </div>

            <div className="pt-3 border-t border-white/10 flex flex-col gap-2.5">
              <button
                onClick={() => {
                  setCurrentView('AUTH_LOGIN');
                  setMobileMenuOpen(false);
                }}
                className="w-full py-2.5 text-center text-sm font-bold bg-gradient-to-r from-[#d4af37] to-[#c5a880] text-slate-950 rounded-xl flex items-center justify-center gap-2 cursor-pointer active:scale-98 shadow-md"
              >
                <Lock className="w-4 h-4" />
                <span>Sign In to First Atlantic</span>
              </button>
              <button
                onClick={() => {
                  setCurrentView('AUTH_ENROLL');
                  setMobileMenuOpen(false);
                }}
                className="w-full py-2.5 text-center text-sm font-semibold bg-white/5 hover:bg-white/10 border border-white/15 text-slate-200 rounded-xl cursor-pointer active:scale-98 backdrop-blur-md"
              >
                Open an Account
              </button>
              <button
                onClick={() => {
                  window.location.hash = 'admin';
                  setCurrentView('AUTH_ADMIN_LOGIN');
                  setMobileMenuOpen(false);
                }}
                className="w-full py-2.5 text-center text-xs font-bold bg-[#004281]/50 hover:bg-[#004281] border border-[#d4af37]/60 text-[#d4af37] hover:text-white rounded-xl flex items-center justify-center gap-2 cursor-pointer active:scale-98 transition-all"
              >
                <ShieldCheck className="w-4 h-4 text-[#d4af37]" />
                <span>Institutional Admin Portal &amp; Provisioning</span>
              </button>
            </div>
          </div>
        )}
      </nav>
    </>
  );
};

export default PublicNavbar;
