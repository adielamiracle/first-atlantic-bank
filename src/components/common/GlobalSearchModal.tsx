import React, { useState, useEffect, useMemo, useRef } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import {
  Search,
  Building,
  Globe,
  ShieldCheck,
  CreditCard,
  ArrowRight,
  Sparkles,
  Lock,
  FileText,
  MapPin,
  HelpCircle,
  X,
  Phone,
  Mail,
  Zap,
  TrendingUp
} from 'lucide-react';
import { useBank, AppView } from '../../context/BankContext';
import { REGISTERED_BANKS } from '../../data/banksData';

interface SearchItem {
  id: string;
  title: string;
  subtitle: string;
  category: 'ROUTING_BANKS' | 'LOCATIONS' | 'SERVICES' | 'SECURITY_COMPLIANCE' | 'NAVIGATION';
  badge?: string;
  viewTarget?: AppView;
  action?: () => void;
  keywords: string;
}

export const GlobalSearchModal: React.FC<{ isOpen: boolean; onClose: () => void }> = ({
  isOpen,
  onClose
}) => {
  const { setCurrentView, setRegion, region, showToast, isAuthenticated } = useBank();
  const [query, setQuery] = useState('');
  const [activeCategory, setActiveCategory] = useState<'ALL' | 'ROUTING_BANKS' | 'LOCATIONS' | 'SERVICES' | 'SECURITY_COMPLIANCE'>('ALL');
  const [selectedIndex, setSelectedIndex] = useState(0);
  const inputRef = useRef<HTMLInputElement>(null);

  // Focus on mount
  useEffect(() => {
    if (isOpen) {
      setTimeout(() => inputRef.current?.focus(), 50);
      setQuery('');
      setSelectedIndex(0);
    }
  }, [isOpen]);

  // Global search database
  const searchDatabase: SearchItem[] = useMemo(() => {
    const items: SearchItem[] = [
      // 1. Banking Products & Services
      {
        id: 'srv_yield',
        title: '5.15% APY Sovereign Compound Vault',
        subtitle: 'High-yield USD, GBP, and EUR liquidity reserve compounding daily with zero lockup fees.',
        category: 'SERVICES',
        badge: '5.15% APY',
        viewTarget: 'PUBLIC_PERSONAL',
        keywords: 'savings yield interest apy compound vault high rate rate dollar sterling euro'
      },
      {
        id: 'srv_glass_uikit',
        title: 'Glassmorphism UI Kit & Modern Vector Interface Set',
        subtitle: 'Transparent buttons, sliders, panels, toggles, frosted search bars, and real-time audio synthesizer media controls.',
        category: 'SERVICES',
        badge: 'UI Kit',
        viewTarget: (isAuthenticated ? 'DASHBOARD_GLASS_STUDIO' : 'PUBLIC_GLASS_STUDIO') as AppView,
        keywords: 'glass glassmorphism ui kit vector transparent buttons sliders toggles search bar media controls audio sound mobile first'
      },
      {
        id: 'srv_infinite_card',
        title: 'Atlantic Sovereign Infinite Metal Card',
        subtitle: 'Uncapped worldwide concierge access, wholesale FX spot interbank rates, and zero foreign transaction fees.',
        category: 'SERVICES',
        badge: 'Private Card',
        viewTarget: 'PUBLIC_PERSONAL',
        keywords: 'card credit debit infinite metal concierge perks lounge access fx'
      },
      {
        id: 'srv_escrow',
        title: 'Dual-Currency Commercial Escrow & Wire Settlement',
        subtitle: 'Institutional escrow for transatlantic real estate, M&A acquisitions, and cross-border disbursements.',
        category: 'SERVICES',
        badge: 'Institutional',
        viewTarget: 'PUBLIC_INTERNATIONAL',
        keywords: 'escrow wire transfer settlement m&a real estate commercial international fx'
      },
      {
        id: 'srv_transfers_hub',
        title: 'Universal Instant Wire & Remittance Hub',
        subtitle: 'Direct wire clearing to all UK sort codes, US ABA routing, and SWIFT GPI global corridors.',
        category: 'SERVICES',
        badge: isAuthenticated ? 'Instant Wire' : 'Portal Transfer',
        viewTarget: isAuthenticated ? 'DASHBOARD_TRANSFERS' : 'PUBLIC_INTERNATIONAL',
        keywords: 'transfer wire send money remittance fedwire chaps faster payments swift routing'
      },
      {
        id: 'srv_check_deposit',
        title: 'Mobile Remote Check Capture (MICR)',
        subtitle: 'Instant digital optical check deposit with automated clearing according to Regulation CC.',
        category: 'SERVICES',
        badge: 'Remote Check',
        viewTarget: isAuthenticated ? 'DASHBOARD_DEPOSIT' : 'PUBLIC_PERSONAL',
        keywords: 'deposit check mobile remote capture endorse micr funds'
      },

      // 2. Global Offices & Wealth Salons
      {
        id: 'loc_london',
        title: 'London Global Treasury Suite • One Canada Square',
        subtitle: 'Canary Wharf & City of London Sovereign Clearing. Sort Code: 40-05-18 | SWIFT: FABKGB2L.',
        category: 'LOCATIONS',
        badge: 'London HQ',
        viewTarget: 'PUBLIC_LOCATIONS',
        keywords: 'london uk canary wharf sterling gbp chaps faster payments sort code england britain'
      },
      {
        id: 'loc_new_york',
        title: 'New York Wall Street Executive Advisory Desk • 100 Wall Street',
        subtitle: 'Manhattan Private Client Reserve & Escrow. Fedwire ABA: 021000089 | SWIFT: FABKUS33.',
        category: 'LOCATIONS',
        badge: 'Wall St HQ',
        viewTarget: 'PUBLIC_LOCATIONS',
        keywords: 'new york ny wall street usa america dollar fedwire ach aba routing manhattan'
      },
      {
        id: 'loc_zurich',
        title: 'Zurich Paradeplatz Fiduciary & Family Office Salon',
        subtitle: 'Bahnhofstrasse / Paradeplatz. Discretionary multi-currency fiduciary wealth custody.',
        category: 'LOCATIONS',
        badge: 'Swiss Wealth',
        viewTarget: 'PUBLIC_LOCATIONS',
        keywords: 'zurich switzerland swiss paradeplatz fiduciary custody family office chf'
      },
      {
        id: 'loc_frankfurt',
        title: 'Frankfurt Financial District European Clearing Hub',
        subtitle: 'Taunusanlage Main Tower. Direct Eurosystem SEPA & TARGET2 RTGS Gateway.',
        category: 'LOCATIONS',
        badge: 'Euro Gateway',
        viewTarget: 'PUBLIC_LOCATIONS',
        keywords: 'frankfurt germany europe sepa target2 euro eur central bank bundesbank'
      },
      {
        id: 'loc_singapore',
        title: 'Singapore Marina Bay Financial Centre (MBFC)',
        subtitle: 'Asia-Pacific cross-border wealth salon & sovereign trade settlement nexus.',
        category: 'LOCATIONS',
        badge: 'Asia-Pacific',
        viewTarget: 'PUBLIC_LOCATIONS',
        keywords: 'singapore marina bay asia pacific trade finance trade settlement private wealth'
      },

      // 3. Security & Anti-Fraud Compliance
      {
        id: 'sec_fdic_fscs',
        title: 'Statutory Deposit Protection (FDIC $250,000 & FSCS £85,000)',
        subtitle: 'Government-backed statutory deposit indemnity across both the United States and the United Kingdom.',
        category: 'SECURITY_COMPLIANCE',
        badge: 'FDIC / FSCS',
        viewTarget: 'PUBLIC_SECURITY',
        keywords: 'fdic fscs insurance protection deposit safety guarantee legal regulation'
      },
      {
        id: 'sec_hsm_fips',
        title: 'Thales FIPS 140-2 Level 3 Hardware Security Modules (HSM)',
        subtitle: 'Tamper-resistant cryptographic enclaves safeguarding master signing keys and TLS 1.3 encryption.',
        category: 'SECURITY_COMPLIANCE',
        badge: 'FIPS 140-2',
        viewTarget: 'PUBLIC_SECURITY',
        keywords: 'security hsm encryption aes-256 thales cryptography fips compliance keys'
      },
      {
        id: 'sec_anti_phishing',
        title: 'Anti-Phishing & Anti-Scammer Domain Verification Protocol',
        subtitle: 'Always verify you are connected to the official authenticated domain: firstatlanticbank.com.',
        category: 'SECURITY_COMPLIANCE',
        badge: 'Anti-Scam',
        viewTarget: 'PUBLIC_SECURITY',
        keywords: 'scam hacker anti-phishing security safety fraud verify domain url authenticate'
      },
      {
        id: 'sec_biometrics',
        title: 'FIDO2 / WebAuthn Hardware Biometric Authentication',
        subtitle: 'Cryptographic on-device biometric Touch ID / Face ID validation for wire authorizations.',
        category: 'SECURITY_COMPLIANCE',
        badge: 'FIDO2 Auth',
        viewTarget: (isAuthenticated ? 'DASHBOARD_PROFILE' : 'PUBLIC_SECURITY') as AppView,
        keywords: 'biometric fido2 webauthn fingerprint touch id face id 2fa security pin'
      },

      // 4. Pre-Registered Global Banks & Routing Codes
      ...REGISTERED_BANKS.map((b) => ({
        id: `bank_${b.id}`,
        title: `${b.name} (${b.country === 'US' ? 'USA' : b.country === 'UK' ? 'UK' : 'Global'})`,
        subtitle: `${b.codeType}: ${b.routingOrSortCode} | SWIFT: ${b.swiftBic} • Clearing: ${b.clearingRail}`,
        category: 'ROUTING_BANKS' as const,
        badge: b.shortName,
        viewTarget: (isAuthenticated ? 'DASHBOARD_TRANSFERS' : 'PUBLIC_INTERNATIONAL') as AppView,
        keywords: `${b.name} ${b.shortName} ${b.routingOrSortCode} ${b.swiftBic} ${b.countryName} sort code routing aba swift iban clearing wire`
      }))
    ];

    return items;
  }, [isAuthenticated]);

  // Filter items based on active query & category
  const filteredItems = useMemo(() => {
    let list = searchDatabase;
    if (activeCategory !== 'ALL') {
      list = list.filter((i) => i.category === activeCategory);
    }
    if (!query.trim()) {
      return list.slice(0, 10);
    }
    const q = query.toLowerCase().trim();
    return list.filter(
      (item) =>
        item.title.toLowerCase().includes(q) ||
        item.subtitle.toLowerCase().includes(q) ||
        item.keywords.toLowerCase().includes(q) ||
        (item.badge && item.badge.toLowerCase().includes(q))
    ).slice(0, 15);
  }, [searchDatabase, activeCategory, query]);

  const handleSelectItem = (item: SearchItem) => {
    if (item.viewTarget) {
      setCurrentView(item.viewTarget);
    }
    if (item.action) {
      item.action();
    }
    showToast('INFO', item.title, item.subtitle);
    onClose();
  };

  // Keyboard Navigation
  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === 'ArrowDown') {
      e.preventDefault();
      setSelectedIndex((prev) => (prev + 1) % Math.max(1, filteredItems.length));
    } else if (e.key === 'ArrowUp') {
      e.preventDefault();
      setSelectedIndex((prev) => (prev - 1 + filteredItems.length) % Math.max(1, filteredItems.length));
    } else if (e.key === 'Enter') {
      e.preventDefault();
      if (filteredItems[selectedIndex]) {
        handleSelectItem(filteredItems[selectedIndex]);
      }
    } else if (e.key === 'Escape') {
      onClose();
    }
  };

  if (!isOpen) return null;

  return (
    <div
      className="fixed inset-0 z-50 bg-slate-950/80 backdrop-blur-sm flex items-start justify-center p-3 sm:p-6 pt-12 sm:pt-20 font-sans"
      onClick={onClose}
    >
      <motion.div
        initial={{ opacity: 0, scale: 0.96, y: -20 }}
        animate={{ opacity: 1, scale: 1, y: 0 }}
        exit={{ opacity: 0, scale: 0.96, y: -20 }}
        className="bg-[#071322] border border-[#c5a880]/50 rounded-2xl max-w-2xl w-full shadow-2xl overflow-hidden flex flex-col text-white max-h-[85vh]"
        onClick={(e) => e.stopPropagation()}
      >
        {/* Search Input Bar */}
        <div className="p-4 sm:p-5 border-b border-slate-800 flex items-center gap-3 bg-[#0a192f]">
          <Search className="w-5 h-5 text-[#d4af37] shrink-0" />
          <input
            ref={inputRef}
            type="text"
            placeholder="Search worldwide banks, routing codes, SWIFT, branches, vaults, security..."
            value={query}
            onChange={(e) => {
              setQuery(e.target.value);
              setSelectedIndex(0);
            }}
            onKeyDown={handleKeyDown}
            className="flex-1 bg-transparent text-sm sm:text-base text-white placeholder-slate-400 focus:outline-none font-medium"
          />
          {query && (
            <button
              onClick={() => setQuery('')}
              className="p-1 rounded-lg text-slate-400 hover:text-white transition-colors cursor-pointer"
            >
              <X className="w-4 h-4" />
            </button>
          )}
          <span className="hidden sm:inline text-[10px] font-mono px-2 py-0.5 rounded bg-slate-800 text-slate-400 border border-slate-700">
            ESC to close
          </span>
        </div>

        {/* Filter Category Tabs */}
        <div className="flex items-center gap-1.5 px-4 py-2.5 bg-slate-900/90 border-b border-slate-800 overflow-x-auto no-scrollbar text-xs font-semibold">
          {[
            { id: 'ALL', label: 'All Results' },
            { id: 'ROUTING_BANKS', label: '🏦 Banks & Routing Codes' },
            { id: 'SERVICES', label: '💳 Banking & Vaults' },
            { id: 'LOCATIONS', label: '📍 Global Offices' },
            { id: 'SECURITY_COMPLIANCE', label: '🛡️ Security & FDIC/FSCS' }
          ].map((cat) => (
            <button
              key={cat.id}
              onClick={() => {
                setActiveCategory(cat.id as any);
                setSelectedIndex(0);
              }}
              className={`px-3 py-1.5 rounded-lg whitespace-nowrap transition-all cursor-pointer ${
                activeCategory === cat.id
                  ? 'bg-[#c5a880] text-slate-950 font-bold shadow-xs'
                  : 'text-slate-400 hover:text-white hover:bg-slate-800'
              }`}
            >
              {cat.label}
            </button>
          ))}
        </div>

        {/* Results List */}
        <div className="flex-1 overflow-y-auto p-2 sm:p-3 divide-y divide-slate-800/60 max-h-96">
          {filteredItems.length === 0 ? (
            <div className="py-12 text-center space-y-2">
              <HelpCircle className="w-8 h-8 text-slate-500 mx-auto" />
              <p className="text-sm font-semibold text-slate-300">No matches found for "{query}"</p>
              <p className="text-xs text-slate-500">
                Try searching for "Barclays", "JPMorgan", "SWIFT", "Fedwire", "London", "5.15%", or "FDIC".
              </p>
            </div>
          ) : (
            filteredItems.map((item, idx) => {
              const isSelected = selectedIndex === idx;
              return (
                <div
                  key={item.id}
                  onClick={() => handleSelectItem(item)}
                  onMouseEnter={() => setSelectedIndex(idx)}
                  className={`p-3 rounded-xl transition-all cursor-pointer flex items-start justify-between gap-3 ${
                    isSelected
                      ? 'bg-[#112a4a] text-white border border-[#c5a880]/40'
                      : 'hover:bg-slate-900/60 text-slate-200 border border-transparent'
                  }`}
                >
                  <div className="flex items-start gap-3 min-w-0">
                    <div
                      className={`w-9 h-9 rounded-lg flex items-center justify-center shrink-0 mt-0.5 ${
                        item.category === 'ROUTING_BANKS'
                          ? 'bg-amber-500/20 text-[#e5ca95]'
                          : item.category === 'SERVICES'
                          ? 'bg-emerald-500/20 text-emerald-400'
                          : item.category === 'LOCATIONS'
                          ? 'bg-blue-500/20 text-blue-400'
                          : 'bg-purple-500/20 text-purple-400'
                      }`}
                    >
                      {item.category === 'ROUTING_BANKS' && <Building className="w-4 h-4" />}
                      {item.category === 'SERVICES' && <CreditCard className="w-4 h-4" />}
                      {item.category === 'LOCATIONS' && <MapPin className="w-4 h-4" />}
                      {item.category === 'SECURITY_COMPLIANCE' && <ShieldCheck className="w-4 h-4" />}
                    </div>

                    <div className="min-w-0">
                      <div className="flex items-center gap-2">
                        <h4 className="text-xs sm:text-sm font-bold text-white truncate">
                          {item.title}
                        </h4>
                        {item.badge && (
                          <span className="text-[10px] font-mono font-bold px-1.5 py-0.2 rounded bg-slate-800 text-[#e5ca95] border border-slate-700 shrink-0">
                            {item.badge}
                          </span>
                        )}
                      </div>
                      <p className="text-[11px] text-slate-300 line-clamp-1 mt-0.5 font-sans">
                        {item.subtitle}
                      </p>
                    </div>
                  </div>

                  <div className="flex items-center gap-1.5 shrink-0 self-center">
                    <span className="text-[11px] text-[#c5a880] font-semibold hidden sm:inline">Select</span>
                    <ArrowRight className="w-3.5 h-3.5 text-[#c5a880]" />
                  </div>
                </div>
              );
            })
          )}
        </div>

        {/* Footer info */}
        <div className="p-3 bg-[#0a192f] border-t border-slate-800 flex items-center justify-between text-[11px] text-slate-400">
          <div className="flex items-center gap-2">
            <ShieldCheck className="w-3.5 h-3.5 text-emerald-400" />
            <span>Official First Atlantic Bank Institutional Search Gateway</span>
          </div>
          <span className="font-mono text-[10px] text-slate-400">
            ↑ ↓ to navigate • ↵ to select
          </span>
        </div>
      </motion.div>
    </div>
  );
};
