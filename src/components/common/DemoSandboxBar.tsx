import React, { useState } from 'react';
import { UserCheck, Shield, Globe, Landmark, ChevronDown, RefreshCw, Smartphone } from 'lucide-react';
import { useBank } from '../../context/BankContext';

export const DemoSandboxBar: React.FC = () => {
  const {
    currentUser,
    currentRole,
    region,
    setRegion,
    switchDemoUser,
    switchToAdmin,
    setCurrentView,
    refreshData,
    isLoading
  } = useBank();

  const [isOpen, setIsOpen] = useState(false);

  return (
    <header className="bg-[#050f1d] text-slate-300 text-xs border-b border-slate-800/80 sticky top-0 z-40">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 py-1.5 flex flex-wrap items-center justify-between gap-3">
        {/* Bank System Status indicator */}
        <div className="flex items-center gap-2.5">
          <div className="flex items-center gap-1.5 font-mono text-[11px]">
            <span className="w-2 h-2 rounded-full bg-emerald-400 animate-pulse" />
            <span className="text-slate-200 font-semibold uppercase tracking-wider">FAB Core Ledger:</span>
            <span className="text-emerald-400">ONLINE</span>
          </div>
          <span className="text-slate-600 hidden sm:inline">|</span>
          <span className="text-[11px] text-slate-400 hidden sm:inline">
            Clearing: {region === 'US' ? 'Fedwire & ACH (ABA 021000089)' : 'Faster Payments & CHAPS (Sort 40-12-88)'}
          </span>
        </div>

        {/* Action controls */}
        <div className="flex items-center gap-2 sm:gap-3">
          {/* Region Clearing Hub */}
          <div className="flex items-center bg-slate-800/80 rounded-md p-0.5 border border-slate-700">
            <button
              onClick={() => setRegion('EU')}
              className={`px-2 py-0.5 rounded text-[11px] font-medium transition-all ${
                region === 'EU' ? 'bg-[#c5a880] text-slate-950 font-bold' : 'text-slate-400 hover:text-white'
              }`}
            >
              🇪🇺 EU
            </button>
            <button
              onClick={() => setRegion('UK')}
              className={`px-2 py-0.5 rounded text-[11px] font-medium transition-all ${
                region === 'UK' ? 'bg-[#c5a880] text-slate-950 font-bold' : 'text-slate-400 hover:text-white'
              }`}
            >
              🇬🇧 UK
            </button>
            <button
              onClick={() => setRegion('US')}
              className={`px-2 py-0.5 rounded text-[11px] font-medium transition-all ${
                region === 'US' ? 'bg-[#c5a880] text-slate-950 font-bold' : 'text-slate-400 hover:text-white'
              }`}
            >
              🇺🇸 US
            </button>
          </div>

          {/* Admin Suite Quick Test Toggle */}
          <button
            onClick={() => {
              if (currentRole === 'ADMIN') {
                setCurrentView('ADMIN_DASHBOARD');
              } else {
                switchToAdmin();
              }
            }}
            className="px-2.5 py-1 rounded-md bg-[#0a1f38] hover:bg-[#133257] text-[#d4af37] border border-[#d4af37]/40 text-[11px] font-bold flex items-center gap-1 transition-all cursor-pointer shadow-xs"
            title="Access Master Administrator & Compliance Suite"
          >
            <Shield className="w-3 h-3 text-[#d4af37]" />
            <span>Admin Suite</span>
          </button>

          {/* Quick Refresh */}
          <button
            onClick={() => refreshData()}
            className="p-1 rounded-md bg-slate-800 hover:bg-slate-700 text-slate-400 hover:text-white transition-colors"
            title="Sync Core Ledger"
            disabled={isLoading}
          >
            <RefreshCw className={`w-3.5 h-3.5 ${isLoading ? 'animate-spin text-[#c5a880]' : ''}`} />
          </button>
        </div>
      </div>
    </header>
  );
};
