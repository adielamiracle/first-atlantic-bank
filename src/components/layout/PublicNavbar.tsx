import React, { useState, useEffect } from 'react';
import { InstitutionalCrest } from '../common/InstitutionalCrest';
import { useBank, AppView } from '../../context/BankContext';
import { Lock, Menu, X, Globe, Building2, Sun, Moon, Search } from 'lucide-react';
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

      <nav className="bg-[#071322]/95 backdrop-blur-md border-b border-slate-800 text-white sticky top-0 z-30 shadow-md">
        {/* Main Bar */}
        <div className="max-w-7xl mx-auto px-4 sm:px-8 py-3.5 flex items-center justify-between gap-3 sm:gap-4">
          <button
            onClick={() => setCurrentView('PUBLIC_HOME')}
            className="text-left focus:outline-none cursor-pointer shrink-0"
          >
            <InstitutionalCrest size="md" variant="gold" />
          </button>

          {/* Desktop Nav Links */}
          <div className="hidden lg:flex items-center gap-5 xl:gap-6 text-sm font-medium text-slate-300">
            {navItems.map((item) => (
              <button
                key={item.view}
                onClick={() => setCurrentView(item.view)}
                className={`hover:text-white transition-colors py-1 relative cursor-pointer whitespace-nowrap ${
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
          <div className="hidden sm:flex items-center gap-2.5">
            {/* Global Search Trigger */}
            <button
              onClick={() => setSearchModalOpen(true)}
              title="Search worldwide banks, routing codes, branches (⌘K)"
              className="flex items-center gap-2 px-2.5 py-1.5 rounded-lg bg-slate-900 border border-slate-800 hover:border-slate-700 text-slate-400 hover:text-slate-200 text-xs transition-colors cursor-pointer"
            >
              <Search className="w-3.5 h-3.5 text-[#d4af37]" />
              <span className="hidden xl:inline text-slate-300">Search Banks &amp; Codes</span>
              <kbd className="hidden sm:inline-block px-1.5 py-0.5 text-[10px] font-mono bg-slate-800 text-slate-400 rounded border border-slate-700">
                ⌘K
              </kbd>
            </button>

            {/* Subtle Region Selector */}
            <div className="flex items-center rounded-lg p-0.5 bg-slate-900 border border-slate-800 text-[11px]">
              {(['EU', 'UK', 'US'] as const).map((r) => (
                <button
                  key={r}
                  onClick={() => setRegion(r)}
                  className={`px-2 py-1 rounded text-[10px] font-bold transition-colors cursor-pointer ${
                    region === r ? 'bg-[#c5a880] text-slate-950' : 'text-slate-400 hover:text-white'
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
              className="p-2 rounded-lg text-slate-300 hover:text-white hover:bg-slate-800 transition-colors cursor-pointer border border-slate-700/60"
            >
              {darkMode ? <Sun className="w-4 h-4 text-[#e5ca95]" /> : <Moon className="w-4 h-4 text-slate-300" />}
            </button>

            <button
              onClick={() => setCurrentView('AUTH_ENROLL')}
              className="px-3.5 py-2 text-xs font-bold uppercase tracking-wider text-[#e5ca95] hover:text-white border border-[#c5a880]/40 hover:border-[#c5a880] rounded-lg transition-all cursor-pointer whitespace-nowrap"
            >
              Open Account
            </button>
            <button
              onClick={() => setCurrentView('AUTH_LOGIN')}
              className="px-4.5 py-2 text-xs font-bold uppercase tracking-wider bg-gradient-to-r from-[#c5a880] to-[#b39366] text-slate-950 hover:brightness-105 rounded-lg shadow-md flex items-center gap-1.5 transition-all font-sans cursor-pointer whitespace-nowrap"
            >
              <Lock className="w-3.5 h-3.5" />
              <span>Sign In</span>
            </button>
          </div>

          {/* Mobile Actions & Menu Toggle */}
          <div className="flex sm:hidden items-center gap-1.5">
            <button
              onClick={() => setSearchModalOpen(true)}
              className="p-2 rounded-lg text-slate-300 hover:text-white bg-slate-900 border border-slate-800 cursor-pointer"
              aria-label="Open Global Search"
            >
              <Search className="w-4 h-4 text-[#d4af37]" />
            </button>
            <button
              onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
              className="text-slate-300 hover:text-white p-1.5 cursor-pointer"
              aria-label="Toggle Navigation"
            >
              {mobileMenuOpen ? <X className="w-6 h-6" /> : <Menu className="w-6 h-6" />}
            </button>
          </div>
        </div>

        {/* Mobile Drawer */}
        {mobileMenuOpen && (
          <div className="lg:hidden border-t border-slate-800 bg-[#071322] px-4 sm:px-6 py-4 space-y-4">
            {/* Quick Region & Dark Mode Row on Mobile */}
            <div className="flex items-center justify-between pb-3 border-b border-slate-800/80">
              <div className="flex items-center rounded-lg p-0.5 bg-slate-900 border border-slate-800 text-xs">
                {(['EU', 'UK', 'US'] as const).map((r) => (
                  <button
                    key={r}
                    onClick={() => setRegion(r)}
                    className={`px-3 py-1 rounded text-xs font-bold transition-colors cursor-pointer ${
                      region === r ? 'bg-[#c5a880] text-slate-950' : 'text-slate-400 hover:text-white'
                    }`}
                  >
                    {r}
                  </button>
                ))}
              </div>

              <button
                onClick={toggleDarkMode}
                className="px-3 py-1.5 rounded-lg text-xs font-medium text-slate-300 hover:text-white bg-slate-900 border border-slate-800 flex items-center gap-1.5 cursor-pointer"
              >
                {darkMode ? <Sun className="w-3.5 h-3.5 text-[#e5ca95]" /> : <Moon className="w-3.5 h-3.5 text-slate-300" />}
                <span>{darkMode ? "Light" : "Dark"}</span>
              </button>
            </div>

            <div className="flex flex-col space-y-1">
              <button
                onClick={() => {
                  setMobileMenuOpen(false);
                  setSearchModalOpen(true);
                }}
                className="text-left text-sm py-2.5 px-3 rounded-lg text-[#e5ca95] bg-slate-900 border border-slate-800 flex items-center gap-2 cursor-pointer font-medium"
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
                  className={`text-left text-sm py-2 px-3 rounded-lg cursor-pointer ${
                    currentView === item.view ? 'bg-slate-800 text-[#e5ca95] font-semibold' : 'text-slate-300 hover:bg-slate-800/50'
                  }`}
                >
                  {item.label}
                </button>
              ))}
            </div>

            <div className="pt-3 border-t border-slate-800 flex flex-col gap-2.5">
              <button
                onClick={() => {
                  setCurrentView('AUTH_LOGIN');
                  setMobileMenuOpen(false);
                }}
                className="w-full py-2.5 text-center text-sm font-bold bg-[#c5a880] text-slate-950 rounded-lg flex items-center justify-center gap-2 cursor-pointer active:scale-98"
              >
                <Lock className="w-4 h-4" />
                <span>Sign In to First Atlantic</span>
              </button>
              <button
                onClick={() => {
                  setCurrentView('AUTH_ENROLL');
                  setMobileMenuOpen(false);
                }}
                className="w-full py-2.5 text-center text-sm font-semibold border border-slate-700 text-slate-200 rounded-lg cursor-pointer active:scale-98"
              >
                Open an Account
              </button>
            </div>
          </div>
        )}
      </nav>
    </>
  );
};

export default PublicNavbar;
