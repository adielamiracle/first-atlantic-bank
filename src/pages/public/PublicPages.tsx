import React, { useState } from 'react';
import { useBank } from '../../context/BankContext';
import {
  Shield,
  Landmark,
  CreditCard,
  Building,
  TrendingUp,
  Globe2,
  Lock,
  ArrowRight,
  CheckCircle2,
  FileCheck,
  Award,
  PhoneCall,
  MapPin,
  Clock,
  Briefcase,
  KeyRound,
  ShieldCheck,
  Server,
  Star,
  ExternalLink,
  Search,
  Cpu,
  Check,
  Activity,
  FileText,
  RefreshCw,
  X
} from 'lucide-react';

export const PersonalPage: React.FC = () => {
  const { setCurrentView } = useBank();
  return (
    <div className="bg-[#f8fafc] dark:bg-[#07101e] text-slate-800 dark:text-slate-100 py-12 px-6 sm:px-8 max-w-7xl mx-auto space-y-12 transition-colors">
      <div className="text-center max-w-3xl mx-auto space-y-3">
        <span className="text-xs uppercase font-bold tracking-widest text-[#8c6d37] dark:text-[#c5a880]">Personal Banking Solutions</span>
        <h1 className="text-3xl sm:text-5xl font-bold font-serif text-slate-900 dark:text-white">
          Crafted for Everyday Sophistication
        </h1>
        <p className="text-slate-600 dark:text-slate-300 text-sm leading-relaxed">
          From high-yield liquidity to unlimited global fee-free checking, First Atlantic personal banking is tailored to transatlantic professionals and private families.
        </p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
        <div className="bg-white dark:bg-[#0a192f] rounded-2xl p-8 border border-slate-200 dark:border-[#1e3656] shadow-sm space-y-4 flex flex-col justify-between transition-colors">
          <div className="space-y-3">
            <div className="w-12 h-12 rounded-xl bg-[#0a192f] dark:bg-[#112a4a] text-[#d4af37] flex items-center justify-center border border-[#c5a880]/30">
              <Landmark className="w-6 h-6" />
            </div>
            <h3 className="text-xl font-bold font-serif text-slate-900 dark:text-white">Premier Checking</h3>
            <p className="text-xs text-slate-600 dark:text-slate-300 leading-relaxed">
              No monthly maintenance fees with qualifying balance. Includes complimentary outgoing domestic wires, personalized checkbooks, and private concierge phone dispatch.
            </p>
            <div className="text-2xl font-bold font-mono text-slate-900 dark:text-white pt-2">$0 <span className="text-xs text-slate-500 dark:text-slate-400 font-normal">Monthly Fee</span></div>
          </div>
          <button
            onClick={() => setCurrentView('AUTH_ENROLL')}
            className="w-full py-2.5 rounded-lg bg-[#0a192f] dark:bg-[#112a4a] hover:bg-[#153459] dark:hover:bg-[#1a3f6d] text-white font-semibold text-xs uppercase tracking-wider transition-colors border border-[#c5a880]/30 cursor-pointer"
          >
            Apply Online
          </button>
        </div>

        <div className="bg-white dark:bg-[#0a192f] rounded-2xl p-8 border border-[#c5a880]/60 shadow-md space-y-4 flex flex-col justify-between relative transition-colors">
          <div className="absolute top-4 right-4 bg-[#c5a880]/20 text-[#8c6d37] dark:text-[#e5ca95] text-[10px] font-bold uppercase px-2.5 py-1 rounded-md">
            5.15% APY
          </div>
          <div className="space-y-3">
            <div className="w-12 h-12 rounded-xl bg-[#0a192f] dark:bg-[#112a4a] text-[#d4af37] flex items-center justify-center border border-[#c5a880]/30">
              <TrendingUp className="w-6 h-6" />
            </div>
            <h3 className="text-xl font-bold font-serif text-slate-900 dark:text-white">Apex High-Yield Savings</h3>
            <p className="text-xs text-slate-600 dark:text-slate-300 leading-relaxed">
              Leading market yield compounded daily with zero lockup requirements. Fully insured up to $250k (US) / £85k (UK).
            </p>
            <div className="text-2xl font-bold font-mono text-emerald-600 dark:text-emerald-400 pt-2">5.15% <span className="text-xs text-slate-500 dark:text-slate-400 font-normal">APY</span></div>
          </div>
          <button
            onClick={() => setCurrentView('AUTH_ENROLL')}
            className="w-full py-2.5 rounded-lg bg-[#c5a880] hover:bg-[#d4af37] text-slate-950 font-bold text-xs uppercase tracking-wider transition-colors cursor-pointer"
          >
            Open Account
          </button>
        </div>

        <div className="bg-white dark:bg-[#0a192f] rounded-2xl p-8 border border-slate-200 dark:border-[#1e3656] shadow-sm space-y-4 flex flex-col justify-between transition-colors">
          <div className="space-y-3">
            <div className="w-12 h-12 rounded-xl bg-[#0a192f] dark:bg-[#112a4a] text-[#d4af37] flex items-center justify-center border border-[#c5a880]/30">
              <CreditCard className="w-6 h-6" />
            </div>
            <h3 className="text-xl font-bold font-serif text-slate-900 dark:text-white">Atlantic Infinite Card</h3>
            <p className="text-xs text-slate-600 dark:text-slate-300 leading-relaxed">
              Heavy metal card with 3x points on global travel, comprehensive airport lounge access, and zero foreign transaction surcharges.
            </p>
            <div className="text-2xl font-bold font-mono text-slate-900 dark:text-white pt-2">0% Intro APR <span className="text-xs text-slate-500 dark:text-slate-400 font-normal">for 15 mos</span></div>
          </div>
          <button
            onClick={() => setCurrentView('AUTH_ENROLL')}
            className="w-full py-2.5 rounded-lg bg-[#0a192f] dark:bg-[#112a4a] hover:bg-[#153459] dark:hover:bg-[#1a3f6d] text-white font-semibold text-xs uppercase tracking-wider transition-colors border border-[#c5a880]/30 cursor-pointer"
          >
            Apply for Card
          </button>
        </div>
      </div>
    </div>
  );
};

export const BusinessPage: React.FC = () => {
  const { setCurrentView } = useBank();
  return (
    <div className="bg-[#f8fafc] dark:bg-[#07101e] text-slate-800 dark:text-slate-100 py-12 px-6 sm:px-8 max-w-7xl mx-auto space-y-12 transition-colors">
      <div className="text-center max-w-3xl mx-auto space-y-3">
        <span className="text-xs uppercase font-bold tracking-widest text-[#8c6d37] dark:text-[#c5a880]">Commercial &amp; Corporate Banking</span>
        <h1 className="text-3xl sm:text-5xl font-bold font-serif text-slate-900 dark:text-white">
          Institutional Treasury &amp; Credit
        </h1>
        <p className="text-slate-600 dark:text-slate-300 text-sm leading-relaxed">
          Robust treasury liquidity management, multi-signatory maker-checker payment approvals, automated FX sweeps, and revolving commercial lines of credit.
        </p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
        <div className="bg-white dark:bg-[#0a192f] rounded-2xl p-8 border border-slate-200 dark:border-[#1e3656] shadow-sm space-y-5 transition-colors">
          <div className="w-12 h-12 rounded-xl bg-[#0a192f] dark:bg-[#112a4a] text-[#d4af37] flex items-center justify-center border border-[#c5a880]/30">
            <Building className="w-6 h-6" />
          </div>
          <h3 className="text-xl font-bold font-serif text-slate-900 dark:text-white">Corporate Treasury Operating Account</h3>
          <p className="text-xs text-slate-600 dark:text-slate-300 leading-relaxed">
            Engineered for high-volume enterprises operating across US and European jurisdictions. Direct API ledger synchronization, batch ACH/BACS payroll processing, and multi-user RBAC controls.
          </p>
          <ul className="space-y-2 text-xs text-slate-700 dark:text-slate-300">
            <li className="flex items-center gap-2"><CheckCircle2 className="w-4 h-4 text-emerald-600 dark:text-emerald-400" /> Multi-user maker-checker dual controls</li>
            <li className="flex items-center gap-2"><CheckCircle2 className="w-4 h-4 text-emerald-600 dark:text-emerald-400" /> Automated overnight yield sweep accounts</li>
            <li className="flex items-center gap-2"><CheckCircle2 className="w-4 h-4 text-emerald-600 dark:text-emerald-400" /> Sub-accounts for tax escrow and departmental budgeting</li>
          </ul>
          <button
            onClick={() => setCurrentView('AUTH_ENROLL')}
            className="px-5 py-2.5 rounded-lg bg-[#0a192f] dark:bg-[#112a4a] hover:bg-[#153459] text-white font-semibold text-xs uppercase tracking-wider border border-[#c5a880]/30 cursor-pointer"
          >
            Inquire for Enterprise
          </button>
        </div>

        <div className="bg-white dark:bg-[#0a192f] rounded-2xl p-8 border border-slate-200 dark:border-[#1e3656] shadow-sm space-y-5 transition-colors">
          <div className="w-12 h-12 rounded-xl bg-[#0a192f] dark:bg-[#112a4a] text-[#d4af37] flex items-center justify-center border border-[#c5a880]/30">
            <Briefcase className="w-6 h-6" />
          </div>
          <h3 className="text-xl font-bold font-serif text-slate-900 dark:text-white">Commercial Lending &amp; Real Estate</h3>
          <p className="text-xs text-slate-600 dark:text-slate-300 leading-relaxed">
            Custom-structured debt facilities from $1M to $50M+ for acquisition, refinance, construction, or operational working capital in prime US and UK markets.
          </p>
          <ul className="space-y-2 text-xs text-slate-700 dark:text-slate-300">
            <li className="flex items-center gap-2"><CheckCircle2 className="w-4 h-4 text-emerald-600 dark:text-emerald-400" /> Fixed and floating rate commercial mortgages</li>
            <li className="flex items-center gap-2"><CheckCircle2 className="w-4 h-4 text-emerald-600 dark:text-emerald-400" /> Revolving working capital lines with flexible drawdowns</li>
            <li className="flex items-center gap-2"><CheckCircle2 className="w-4 h-4 text-emerald-600 dark:text-emerald-400" /> Equipment financing and structured project debt</li>
          </ul>
          <button
            onClick={() => setCurrentView('AUTH_ENROLL')}
            className="px-5 py-2.5 rounded-lg bg-[#0a192f] dark:bg-[#112a4a] hover:bg-[#153459] text-white font-semibold text-xs uppercase tracking-wider border border-[#c5a880]/30 cursor-pointer"
          >
            Connect with Loan Officer
          </button>
        </div>
      </div>
    </div>
  );
};

export const WealthPage: React.FC = () => {
  return (
    <div className="bg-[#f8fafc] dark:bg-[#07101e] text-slate-800 dark:text-slate-100 py-12 px-6 sm:px-8 max-w-7xl mx-auto space-y-12 transition-colors">
      <div className="text-center max-w-3xl mx-auto space-y-3">
        <span className="text-xs uppercase font-bold tracking-widest text-[#8c6d37] dark:text-[#c5a880]">Private Client &amp; Family Office</span>
        <h1 className="text-3xl sm:text-5xl font-bold font-serif text-slate-900 dark:text-white">
          Stewardship Across Generations
        </h1>
        <p className="text-slate-600 dark:text-slate-300 text-sm leading-relaxed">
          First Atlantic Private Wealth provides discretionary portfolio management, trust &amp; fiduciary governance, and bespoke liquidity solutions for high-net-worth individuals.
        </p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        <div className="bg-white dark:bg-[#0a192f] rounded-2xl p-7 border border-slate-200 dark:border-[#1e3656] shadow-sm space-y-4 transition-colors">
          <div className="w-10 h-10 rounded-lg bg-[#0a192f] dark:bg-[#112a4a] text-[#d4af37] flex items-center justify-center border border-[#c5a880]/30">
            <Shield className="w-5 h-5" />
          </div>
          <h3 className="text-lg font-bold font-serif text-slate-900 dark:text-white">Fiduciary Trust Services</h3>
          <p className="text-xs text-slate-600 dark:text-slate-300 leading-relaxed">
            Delaware, London, and international trust administration, charitable foundations, and tax-efficient wealth succession.
          </p>
        </div>

        <div className="bg-white dark:bg-[#0a192f] rounded-2xl p-7 border border-slate-200 dark:border-[#1e3656] shadow-sm space-y-4 transition-colors">
          <div className="w-10 h-10 rounded-lg bg-[#0a192f] dark:bg-[#112a4a] text-[#d4af37] flex items-center justify-center border border-[#c5a880]/30">
            <Award className="w-5 h-5" />
          </div>
          <h3 className="text-lg font-bold font-serif text-slate-900 dark:text-white">Bespoke Lombard Credit</h3>
          <p className="text-xs text-slate-600 dark:text-slate-300 leading-relaxed">
            Liquidity facilities secured against high-grade equity portfolios, sovereign debt, or physical precious metals without tax realization events.
          </p>
        </div>

        <div className="bg-white dark:bg-[#0a192f] rounded-2xl p-7 border border-slate-200 dark:border-[#1e3656] shadow-sm space-y-4 transition-colors">
          <div className="w-10 h-10 rounded-lg bg-[#0a192f] dark:bg-[#112a4a] text-[#d4af37] flex items-center justify-center border border-[#c5a880]/30">
            <Globe2 className="w-5 h-6" />
          </div>
          <h3 className="text-lg font-bold font-serif text-slate-900 dark:text-white">Transatlantic Advisory</h3>
          <p className="text-xs text-slate-600 dark:text-slate-300 leading-relaxed">
            Dual US-UK residency wealth structuring, FATCA/CRS compliance optimization, and cross-border multi-currency hedging.
          </p>
        </div>
      </div>
    </div>
  );
};

export const InternationalPage: React.FC = () => {
  const { setCurrentView } = useBank();
  return (
    <div className="bg-[#f8fafc] dark:bg-[#07101e] text-slate-800 dark:text-slate-100 py-12 px-6 sm:px-8 max-w-7xl mx-auto space-y-12 transition-colors">
      <div className="text-center max-w-3xl mx-auto space-y-3">
        <span className="text-xs uppercase font-bold tracking-widest text-[#8c6d37] dark:text-[#c5a880]">Cross-Border Treasury</span>
        <h1 className="text-3xl sm:text-5xl font-bold font-serif text-slate-900 dark:text-white">
          Global Multi-Currency Banking
        </h1>
        <p className="text-slate-600 dark:text-slate-300 text-sm leading-relaxed">
          Seamlessly navigate US Dollar, British Pound, and Euro liquidity with native clearing networks (Fedwire, CHAPS, Faster Payments, SEPA, and SWIFT).
        </p>
      </div>

      <div className="bg-[#0a192f] text-white rounded-2xl p-8 sm:p-12 border border-slate-800 shadow-xl space-y-8">
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-6 text-center">
          <div className="p-6 rounded-xl bg-[#0e2746] border border-slate-700">
            <span className="text-xs uppercase font-bold text-[#c5a880] tracking-wider block mb-1">United States</span>
            <div className="text-2xl font-bold font-mono">USD ($)</div>
            <p className="text-[11px] text-slate-400 mt-1">ABA Routing: 021000089 (Fedwire &amp; ACH)</p>
          </div>

          <div className="p-6 rounded-xl bg-[#0e2746] border border-slate-700">
            <span className="text-xs uppercase font-bold text-[#c5a880] tracking-wider block mb-1">United Kingdom</span>
            <div className="text-2xl font-bold font-mono">GBP (£)</div>
            <p className="text-[11px] text-slate-400 mt-1">Sort Code: 40-12-88 (FPS &amp; CHAPS)</p>
          </div>

          <div className="p-6 rounded-xl bg-[#0e2746] border border-slate-700">
            <span className="text-xs uppercase font-bold text-[#c5a880] tracking-wider block mb-1">European Union</span>
            <div className="text-2xl font-bold font-mono">EUR (€)</div>
            <p className="text-[11px] text-slate-400 mt-1">IBAN &amp; SEPA Instant Network</p>
          </div>
        </div>

        <div className="text-center pt-4">
          <button
            onClick={() => setCurrentView('AUTH_ENROLL')}
            className="px-6 py-3 rounded-lg bg-[#c5a880] hover:bg-[#d4af37] text-slate-950 font-bold text-xs uppercase tracking-wider shadow-md transition-all cursor-pointer"
          >
            Open Multi-Currency Account
          </button>
        </div>
      </div>
    </div>
  );
};

export const LocationsPage: React.FC = () => {
  return (
    <div className="bg-[#f8fafc] dark:bg-[#07101e] text-slate-800 dark:text-slate-100 py-12 px-6 sm:px-8 max-w-7xl mx-auto space-y-12 transition-colors">
      <div className="text-center max-w-3xl mx-auto space-y-3">
        <span className="text-xs uppercase font-bold tracking-widest text-[#8c6d37] dark:text-[#c5a880]">Global Advisory Footprint</span>
        <h1 className="text-3xl sm:text-5xl font-bold font-serif text-slate-900 dark:text-white">
          Executive Lounges &amp; Offices
        </h1>
        <p className="text-slate-600 dark:text-slate-300 text-sm leading-relaxed">
          Private conference rooms, vault deposit boxes, and in-person relationship manager appointments.
        </p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        <div className="bg-white dark:bg-[#0a192f] rounded-2xl p-7 border border-slate-200 dark:border-[#1e3656] shadow-sm space-y-3 transition-colors">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-lg bg-[#0a192f] dark:bg-[#112a4a] text-[#d4af37] flex items-center justify-center border border-[#c5a880]/30">
              <MapPin className="w-5 h-5" />
            </div>
            <div>
              <h3 className="text-base font-bold font-serif text-slate-900 dark:text-white">Frankfurt am Main Hub</h3>
              <p className="text-xs text-[#8c6d37] dark:text-[#c5a880] font-semibold">Headquarters (European Union)</p>
            </div>
          </div>
          <p className="text-xs text-slate-600 dark:text-slate-300 leading-relaxed">
            Mainzer Landstraße 180, 60327 Frankfurt am Main, Germany<br />
            Phone: +49 69 9000 8800 • Email: frankfurt.client@firstatlanticbank.com
          </p>
          <div className="text-xs text-slate-500 dark:text-slate-400 flex items-center gap-2">
            <Clock className="w-3.5 h-3.5" /> Monday – Friday: 8:30 AM – 5:30 PM CET
          </div>
        </div>

        <div className="bg-white dark:bg-[#0a192f] rounded-2xl p-7 border border-slate-200 dark:border-[#1e3656] shadow-sm space-y-3 transition-colors">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-lg bg-[#0a192f] dark:bg-[#112a4a] text-[#d4af37] flex items-center justify-center border border-[#c5a880]/30">
              <MapPin className="w-5 h-5" />
            </div>
            <div>
              <h3 className="text-base font-bold font-serif text-slate-900 dark:text-white">Zurich Wealth Centre</h3>
              <p className="text-xs text-[#8c6d37] dark:text-[#c5a880] font-semibold">Private Client &amp; Asset Management</p>
            </div>
          </div>
          <p className="text-xs text-slate-600 dark:text-slate-300 leading-relaxed">
            Bahnhofstrasse 45, 8001 Zürich, Switzerland<br />
            Phone: +41 44 215 9000 • Email: zurich.private@firstatlanticbank.com
          </p>
          <div className="text-xs text-slate-500 dark:text-slate-400 flex items-center gap-2">
            <Clock className="w-3.5 h-3.5" /> Monday – Friday: 8:30 AM – 5:00 PM CET
          </div>
        </div>

        <div className="bg-white dark:bg-[#0a192f] rounded-2xl p-7 border border-slate-200 dark:border-[#1e3656] shadow-sm space-y-3 transition-colors">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-lg bg-[#0a192f] dark:bg-[#112a4a] text-[#d4af37] flex items-center justify-center border border-[#c5a880]/30">
              <MapPin className="w-5 h-5" />
            </div>
            <div>
              <h3 className="text-base font-bold font-serif text-slate-900 dark:text-white">London Mayfair Advisory</h3>
              <p className="text-xs text-[#8c6d37] dark:text-[#c5a880] font-semibold">Headquarters (United Kingdom)</p>
            </div>
          </div>
          <p className="text-xs text-slate-600 dark:text-slate-300 leading-relaxed">
            14 Berkeley Square, Mayfair, London W1J 6BQ, UK<br />
            Phone: +44 20 7946 0912 • Email: london.private@firstatlanticbank.com
          </p>
          <div className="text-xs text-slate-500 dark:text-slate-400 flex items-center gap-2">
            <Clock className="w-3.5 h-3.5" /> Monday – Friday: 8:30 AM – 5:30 PM GMT
          </div>
        </div>

        <div className="bg-white dark:bg-[#0a192f] rounded-2xl p-7 border border-slate-200 dark:border-[#1e3656] shadow-sm space-y-3 transition-colors">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-lg bg-[#0a192f] dark:bg-[#112a4a] text-[#d4af37] flex items-center justify-center border border-[#c5a880]/30">
              <MapPin className="w-5 h-5" />
            </div>
            <div>
              <h3 className="text-base font-bold font-serif text-slate-900 dark:text-white">New York Flagship &amp; Treasury</h3>
              <p className="text-xs text-[#8c6d37] dark:text-[#c5a880] font-semibold">Headquarters (Americas)</p>
            </div>
          </div>
          <p className="text-xs text-slate-600 dark:text-slate-300 leading-relaxed">
            740 Park Avenue, 18th Floor, New York, NY 10021, USA<br />
            Phone: +1 (212) 555-0190 • Email: contact@firstatlanticbank.com
          </p>
          <div className="text-xs text-slate-500 dark:text-slate-400 flex items-center gap-2">
            <Clock className="w-3.5 h-3.5" /> Monday – Friday: 8:00 AM – 6:00 PM EST
          </div>
        </div>
      </div>

      {/* Global Inquiries & Support Desk Box */}
      <div className="bg-[#0a192f] rounded-2xl p-8 text-white border border-[#c5a880]/40 shadow-xl space-y-6">
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 border-b border-slate-700/80 pb-6">
          <div>
            <span className="text-xs uppercase font-bold tracking-widest text-[#d4af37]">24/7 Global Client Services</span>
            <h2 className="text-2xl font-bold font-serif pt-1">Direct Correspondence Channels</h2>
          </div>
          <div className="flex items-center gap-2 text-xs text-emerald-400 font-mono">
            <span className="w-2 h-2 rounded-full bg-emerald-400 animate-pulse" />
            Active Priority Routing Gateway
          </div>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          <div className="p-5 rounded-xl bg-slate-900/80 border border-slate-700/60 space-y-2">
            <h4 className="text-sm font-bold text-[#d4af37] uppercase tracking-wider">Client &amp; Technical Support</h4>
            <p className="text-xs text-slate-300 leading-relaxed">
              For online banking access, password assistance, debit cards, transfer queries, and mobile banking:
            </p>
            <a
              href="mailto:support@firstatlanticbank.com"
              className="inline-block pt-2 text-sm font-mono font-bold text-white hover:text-[#d4af37] underline transition-colors"
            >
              support@firstatlanticbank.com
            </a>
          </div>

          <div className="p-5 rounded-xl bg-slate-900/80 border border-slate-700/60 space-y-2">
            <h4 className="text-sm font-bold text-[#d4af37] uppercase tracking-wider">General Inquiries &amp; Corporate</h4>
            <p className="text-xs text-slate-300 leading-relaxed">
              For institutional onboarding, private wealth consultation, regulatory compliance, and media relations:
            </p>
            <a
              href="mailto:contact@firstatlanticbank.com"
              className="inline-block pt-2 text-sm font-mono font-bold text-white hover:text-[#d4af37] underline transition-colors"
            >
              contact@firstatlanticbank.com
            </a>
          </div>
        </div>
      </div>
    </div>
  );
};

export const SecurityPublicPage: React.FC = () => {
  const { setCurrentView } = useBank();
  const [reviewFilter, setReviewFilter] = useState<'ALL' | 'WEALTH' | 'TREASURY' | 'SAVINGS' | 'CARDS'>('ALL');
  const [activeProtocolTab, setActiveProtocolTab] = useState<'MULTI_SIG' | 'HSM_KEYS' | 'SOC2_AUDIT' | 'WAF_DDOS'>('MULTI_SIG');
  const [showVerifyModal, setShowVerifyModal] = useState<boolean>(false);
  const [isVerifyingLive, setIsVerifyingLive] = useState<boolean>(false);
  const [lastVerifiedTime, setLastVerifiedTime] = useState<string>('Just now (0ms latency)');

  const triggerLiveVerification = () => {
    setIsVerifyingLive(true);
    setTimeout(() => {
      setIsVerifyingLive(false);
      setLastVerifiedTime(`Verified at ${new Date().toLocaleTimeString()} UTC`);
      setShowVerifyModal(true);
    }, 600);
  };

  const securityPartners = [
    {
      id: 'digicert',
      name: 'DigiCert Sovereign EV',
      role: 'Root Certificate Authority & Post-Quantum TLS 1.3',
      badge: 'Extended Validation (EV)',
      badgeColor: 'bg-emerald-500/10 text-emerald-600 dark:text-emerald-400 border-emerald-500/20',
      certId: 'CRT-FAB-8942-X9',
      sha: 'SHA-256: 7F:8A:2C:99:E1:5D:84:10:9B:33:4F:12:00:AA:CD:55',
      protocols: 'TLS 1.3 • AES-256-GCM • ECDSA P-384 • Certificate Transparency',
      auditStatus: 'Active & Enforced',
      linkText: 'Inspect DigiCert EV Fingerprint'
    },
    {
      id: 'thales',
      name: 'Thales Luna HSM',
      role: 'Hardware Security Modules & Ledger Signing',
      badge: 'FIPS 140-2 Level 3',
      badgeColor: 'bg-amber-500/10 text-amber-600 dark:text-[#c5a880] border-amber-500/20',
      certId: 'HSM-VAULT-FRA-01',
      sha: 'Enclave Signature: 0x93FA8B41D99201C65E87123AB948',
      protocols: 'Cryptographic Zero-Knowledge Key Partitioning • 4-Eyes Dual Control',
      auditStatus: 'Air-Gapped Sovereign Enclave',
      linkText: 'Verify HSM Vault Specs'
    },
    {
      id: 'kroll',
      name: 'Kroll Cyber Risk',
      role: 'Continuous Pen-Testing & SOC 2 Type II Surveillance',
      badge: 'SOC 2 Type II & ISO 27001',
      badgeColor: 'bg-blue-500/10 text-blue-600 dark:text-blue-400 border-blue-500/20',
      certId: 'SOC2-ATT-2026-Q3',
      sha: 'AoC Hash: 44B9-87CE-9021-AF19-8812',
      protocols: 'Real-time DAST/SAST Scanning • Zero Critical CVE Tolerance',
      auditStatus: 'Attestation Current (2026)',
      linkText: 'View Audit Scope & AoC'
    },
    {
      id: 'cloudflare',
      name: 'Cloudflare Magic Transit',
      role: 'Enterprise DDoS Shield & Global Anycast Edge',
      badge: 'Anycast Edge Defense',
      badgeColor: 'bg-purple-500/10 text-purple-600 dark:text-purple-400 border-purple-500/20',
      certId: 'EDGE-CF-FAB-NET',
      sha: 'Edge Route: AS13335 (Zero Packet Loss)',
      protocols: 'Layer 7 WAF • Rate Limiting • Zero-Trust SASE Gateway',
      auditStatus: '99.999% Historical Uptime',
      linkText: 'Check Global Edge Latency'
    }
  ];

  const reviews = [
    {
      id: 'rev_1',
      name: 'Sir Alistair Vance',
      role: 'Family Office Principal',
      location: 'Mayfair, London',
      stars: 5,
      date: 'July 14, 2026',
      title: 'Flawless multi-currency clearing and escrow execution',
      category: 'WEALTH',
      content: 'Transitioned our primary European treasury and GBP settlement lines to First Atlantic. Wire settlements clear in seconds and our dedicated Relationship Director in London is always available.'
    },
    {
      id: 'rev_2',
      name: 'Elena Rostova, CFA',
      role: 'Chief Investment Officer',
      location: 'Geneva / Zurich',
      stars: 5,
      date: 'August 02, 2026',
      title: '5.15% APY yield with sovereign safety backing',
      category: 'SAVINGS',
      content: 'The daily compounding transparency on the Apex High-Yield Euro and USD reserve accounts is unmatched. Full double-entry balance verification gives our board complete peace of mind.'
    },
    {
      id: 'rev_3',
      name: 'Marcus H. Sterling',
      role: 'Managing Partner, Sterling Global',
      location: 'New York, NY',
      stars: 5,
      date: 'August 18, 2026',
      title: 'Executive concierge and metal Infinite Card excellence',
      category: 'CARDS',
      content: 'The custom limits and immediate contactless authorizations across New York, London, and Frankfurt have made cross-border travel seamless. Truly bespoke institutional private banking.'
    },
    {
      id: 'rev_4',
      name: 'Dr. Charlotte Dubois',
      role: 'Biotech Founder & Angel Investor',
      location: 'Paris, France',
      stars: 5,
      date: 'August 10, 2026',
      title: 'Smooth SEPA Instant & Fedwire corporate routing',
      category: 'TREASURY',
      content: 'We run multiple corporate operations across the EU and US. Having native IBANs and US ABA routing numbers under one cryptographic single sign-on portal eliminated all friction.'
    },
    {
      id: 'rev_5',
      name: 'Lord Henry Montgomery',
      role: 'Private Estates Trustee',
      location: 'Edinburgh, UK',
      stars: 5,
      date: 'July 29, 2026',
      title: 'Impeccable security architecture & KYC verification',
      category: 'WEALTH',
      content: 'The onboarding compliance was thorough, respectful, and executed with utmost discretion. Digital biometric authentication and cryptographic audit trails set the gold standard.'
    },
    {
      id: 'rev_6',
      name: 'Victor Vance-Smith',
      role: 'Treasury Director',
      location: 'Boston, MA',
      stars: 5,
      date: 'August 16, 2026',
      title: 'Instant FX locked rates without predatory spreads',
      category: 'TREASURY',
      content: 'Exchanging USD to EUR and GBP in real-time with transparent institutional interbank rates saved our corporate balance sheet substantial overhead this quarter.'
    }
  ];

  const filteredReviews = reviewFilter === 'ALL'
    ? reviews
    : reviews.filter((r) => r.category === reviewFilter);

  return (
    <div className="bg-[#f8fafc] dark:bg-[#07101e] text-slate-800 dark:text-slate-100 py-12 px-6 sm:px-8 max-w-7xl mx-auto space-y-14 transition-colors">
      <div className="text-center max-w-3xl mx-auto space-y-3">
        <span className="text-xs uppercase font-bold tracking-widest text-[#8c6d37] dark:text-[#c5a880]">Institutional Cyber Resilience &amp; Trust</span>
        <h1 className="text-3xl sm:text-5xl font-bold font-serif text-slate-900 dark:text-white">
          Security Architecture &amp; Trust Ratings
        </h1>
        <p className="text-slate-600 dark:text-slate-300 text-sm leading-relaxed">
          How our defense-in-depth framework protects sovereign customer capital, confidential transaction journals, and API integration pathways across global jurisdictions.
        </p>
      </div>

      {/* Trust & Verification Bar */}
      <div className="flex flex-col md:flex-row items-center justify-between gap-6 p-6 rounded-2xl bg-white dark:bg-[#0a192f] border border-slate-200 dark:border-[#1e3656] shadow-sm">
        {/* Trustpilot Summary */}
        <div className="flex flex-col sm:flex-row items-start sm:items-center gap-4">
          <div className="flex items-center gap-3">
            <div className="w-12 h-12 rounded-xl bg-[#00b67a] flex items-center justify-center text-white font-bold text-xl shadow-sm">
              ★
            </div>
            <div>
              <div className="flex items-center gap-2">
                <span className="font-extrabold text-lg text-slate-900 dark:text-white font-serif">Trustpilot</span>
                <span className="px-2 py-0.5 rounded bg-[#00b67a]/20 text-[#00b67a] text-[10px] font-bold uppercase tracking-wider">
                  Excellent
                </span>
              </div>
              <div className="flex items-center gap-2 text-xs text-slate-500 dark:text-slate-400 mt-0.5">
                <div className="flex text-[#00b67a]">
                  {[...Array(5)].map((_, i) => (
                    <Star key={i} className="w-3.5 h-3.5 fill-[#00b67a] text-[#00b67a]" />
                  ))}
                </div>
                <span className="font-bold text-slate-800 dark:text-slate-200">4.9 / 5.0</span>
                <span>• 2,840+ verified client reviews</span>
              </div>
            </div>
          </div>
        </div>

        {/* Institutional Integrity & Zero Breaches */}
        <div className="flex flex-wrap items-center gap-4 text-xs">
          <div className="flex items-center gap-2 px-3.5 py-2 rounded-xl bg-slate-50 dark:bg-slate-900/60 border border-slate-200 dark:border-slate-800 text-slate-700 dark:text-slate-300">
            <ShieldCheck className="w-4 h-4 text-emerald-500" />
            <span className="font-semibold">ISO 27001 &amp; SOC 2 Type II Certified</span>
          </div>

          <div className="flex items-center gap-2 px-3.5 py-2 rounded-xl bg-slate-50 dark:bg-slate-900/60 border border-slate-200 dark:border-slate-800 text-[#8c6d37] dark:text-[#c5a880]">
            <Shield className="w-4 h-4" />
            <span className="font-semibold">Zero Historical Security Breaches</span>
          </div>
        </div>
      </div>

      {/* Security Architecture Pillars */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        <div className="bg-white dark:bg-[#0a192f] rounded-2xl p-7 border border-slate-200 dark:border-[#1e3656] shadow-sm space-y-4 transition-colors">
          <div className="w-10 h-10 rounded-lg bg-[#0a192f] dark:bg-[#112a4a] text-[#d4af37] flex items-center justify-center border border-[#c5a880]/30">
            <Lock className="w-5 h-5" />
          </div>
          <h3 className="text-lg font-bold font-serif text-slate-900 dark:text-white">End-to-End Cryptography</h3>
          <p className="text-xs text-slate-600 dark:text-slate-300 leading-relaxed">
            All customer sessions, ledger journals, and inter-service communications are encrypted in transit via TLS 1.3 and at rest with AES-256 HSM keys.
          </p>
          <ul className="text-xs text-slate-500 dark:text-slate-400 space-y-1.5 pt-2 border-t border-slate-100 dark:border-slate-800">
            <li className="flex items-center gap-2">✓ FIPS 140-2 Level 3 HSM key modules</li>
            <li className="flex items-center gap-2">✓ Biometric passkey &amp; WebAuthn support</li>
            <li className="flex items-center gap-2">✓ Strict CSP and zero third-party telemetry</li>
          </ul>
        </div>

        <div className="bg-white dark:bg-[#0a192f] rounded-2xl p-7 border border-slate-200 dark:border-[#1e3656] shadow-sm space-y-4 transition-colors">
          <div className="w-10 h-10 rounded-lg bg-[#0a192f] dark:bg-[#112a4a] text-[#d4af37] flex items-center justify-center border border-[#c5a880]/30">
            <ShieldCheck className="w-5 h-5" />
          </div>
          <h3 className="text-lg font-bold font-serif text-slate-900 dark:text-white">Immutable Ledger Auditing</h3>
          <p className="text-xs text-slate-600 dark:text-slate-300 leading-relaxed">
            Financial adjustments and transfers are signed with cryptographic checksum hashes, preventing unauthorized retroactive modifications.
          </p>
          <ul className="text-xs text-slate-500 dark:text-slate-400 space-y-1.5 pt-2 border-t border-slate-100 dark:border-slate-800">
            <li className="flex items-center gap-2">✓ Balanced double-entry general ledger</li>
            <li className="flex items-center gap-2">✓ Dual-control 4-eyes authorization engine</li>
            <li className="flex items-center gap-2">✓ Real-time audit logs with actor signatures</li>
          </ul>
        </div>

        <div className="bg-white dark:bg-[#0a192f] rounded-2xl p-7 border border-slate-200 dark:border-[#1e3656] shadow-sm space-y-4 transition-colors">
          <div className="w-10 h-10 rounded-lg bg-[#0a192f] dark:bg-[#112a4a] text-[#d4af37] flex items-center justify-center border border-[#c5a880]/30">
            <Server className="w-5 h-5" />
          </div>
          <h3 className="text-lg font-bold font-serif text-slate-900 dark:text-white">24/7 AML &amp; Fraud Radar</h3>
          <p className="text-xs text-slate-600 dark:text-slate-300 leading-relaxed">
            Real-time heuristic engines inspect transaction velocity, geolocation anomalies, impossible travel, and device fingerprints.
          </p>
          <ul className="text-xs text-slate-500 dark:text-slate-400 space-y-1.5 pt-2 border-t border-slate-100 dark:border-slate-800">
            <li className="flex items-center gap-2">✓ Automated PEP &amp; OFAC sanctions checking</li>
            <li className="flex items-center gap-2">✓ Geo-velocity &amp; impossible travel alerts</li>
            <li className="flex items-center gap-2">✓ Dedicated Tier-3 private client concierge</li>
          </ul>
        </div>
      </div>

      {/* Verified Client Testimonials Section */}
      <div className="space-y-6 pt-4 border-t border-slate-200 dark:border-slate-800">
        <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
          <div>
            <h2 className="text-xl sm:text-2xl font-bold font-serif text-slate-900 dark:text-white">
              Verified Client Testimonials &amp; Trust Ratings
            </h2>
            <p className="text-xs text-slate-500 dark:text-slate-400 mt-0.5">
              Authentic feedback from private wealth, family office, and commercial treasury clients.
            </p>
          </div>

          {/* Filter Tabs */}
          <div className="flex flex-wrap items-center gap-1.5 p-1 rounded-xl bg-slate-100 dark:bg-[#0a192f] border border-slate-200 dark:border-slate-800">
            {[
              { id: 'ALL', label: 'All Reviews (2.8k)' },
              { id: 'WEALTH', label: 'Private Wealth' },
              { id: 'TREASURY', label: 'Treasury & FX' },
              { id: 'SAVINGS', label: 'High-Yield' },
              { id: 'CARDS', label: 'Titanium Card' }
            ].map((tab) => (
              <button
                key={tab.id}
                onClick={() => setReviewFilter(tab.id as any)}
                className={`px-3 py-1.5 rounded-lg text-xs font-semibold transition-all cursor-pointer ${
                  reviewFilter === tab.id
                    ? 'bg-white dark:bg-[#112a4a] text-slate-900 dark:text-[#c5a880] shadow-xs font-bold'
                    : 'text-slate-500 dark:text-slate-400 hover:text-slate-900 dark:hover:text-white'
                }`}
              >
                {tab.label}
              </button>
            ))}
          </div>
        </div>

        {/* Reviews Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {filteredReviews.map((review) => (
            <div
              key={review.id}
              className="bg-white dark:bg-[#0a192f] rounded-2xl p-6 border border-slate-200 dark:border-[#1e3656] shadow-sm hover:shadow-md transition-all flex flex-col justify-between space-y-4"
            >
              <div className="space-y-3">
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-1">
                    <div className="flex text-[#00b67a]">
                      {[...Array(review.stars)].map((_, i) => (
                        <Star key={i} className="w-4 h-4 fill-[#00b67a] text-[#00b67a]" />
                      ))}
                    </div>
                    <span className="text-xs font-bold text-slate-700 dark:text-slate-300 ml-1">5.0</span>
                  </div>

                  <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-full bg-emerald-50 dark:bg-emerald-950/40 text-emerald-600 dark:text-emerald-400 text-[10px] font-semibold border border-emerald-200 dark:border-emerald-800">
                    <CheckCircle2 className="w-3 h-3" />
                    <span>Verified Client</span>
                  </span>
                </div>

                <h4 className="text-sm font-bold text-slate-900 dark:text-white font-serif leading-snug">
                  "{review.title}"
                </h4>
                <p className="text-xs text-slate-600 dark:text-slate-300 leading-relaxed">
                  {review.content}
                </p>
              </div>

              <div className="pt-3 border-t border-slate-100 dark:border-slate-800 flex items-center justify-between text-xs">
                <div>
                  <div className="font-bold text-slate-800 dark:text-slate-200">{review.name}</div>
                  <div className="text-[11px] text-slate-500 dark:text-slate-400">{review.role} • {review.location}</div>
                </div>
                <span className="text-[10px] font-mono text-slate-400">{review.date}</span>
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* VERIFIED SECURITY PARTNERS & PROTOCOLS SECTION */}
      <div className="space-y-8 pt-4 border-t border-slate-200 dark:border-slate-800">
        <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-4">
          <div>
            <div className="inline-flex items-center gap-2 px-2.5 py-1 rounded-full bg-emerald-500/10 border border-emerald-500/30 text-emerald-600 dark:text-emerald-400 text-xs font-mono font-bold uppercase tracking-wider mb-2">
              <ShieldCheck className="w-3.5 h-3.5" />
              <span>Independent Audit &amp; Technical Clearances</span>
            </div>
            <h2 className="text-2xl sm:text-3xl font-bold font-serif text-slate-900 dark:text-white">
              Verified Security Partners &amp; Infrastructure
            </h2>
            <p className="text-xs sm:text-sm text-slate-600 dark:text-slate-300 max-w-2xl mt-1">
              External independent verification services, cryptographic hardware enclaves, and continuous SOC 2 surveillance securing transatlantic client capital.
            </p>
          </div>

          <div className="flex items-center gap-3">
            <button
              id="live-security-verify-btn"
              onClick={triggerLiveVerification}
              disabled={isVerifyingLive}
              className="inline-flex items-center gap-2.5 px-4 py-2.5 rounded-xl bg-slate-900 dark:bg-[#112a4a] hover:bg-slate-800 dark:hover:bg-[#1a3f6d] text-white border border-[#c5a880]/50 text-xs font-bold transition-all shadow-md cursor-pointer disabled:opacity-70 group"
            >
              <RefreshCw className={`w-3.5 h-3.5 text-[#c5a880] ${isVerifyingLive ? 'animate-spin' : 'group-hover:rotate-180 transition-transform duration-500'}`} />
              <span>{isVerifyingLive ? 'Querying Verification Nodes...' : 'Verify Live Certificate & Protocols'}</span>
            </button>
          </div>
        </div>

        {/* Partner Cards Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-5">
          {securityPartners.map((partner) => (
            <div
              key={partner.id}
              className="bg-white dark:bg-[#0a192f] rounded-2xl p-5 border border-slate-200 dark:border-[#1e3656] shadow-xs hover:border-[#c5a880]/70 hover:shadow-md transition-all flex flex-col justify-between space-y-4"
            >
              <div className="space-y-3">
                <div className="flex items-center justify-between">
                  <span className={`text-[10px] font-bold px-2 py-0.5 rounded-full border ${partner.badgeColor} uppercase tracking-wider`}>
                    {partner.badge}
                  </span>
                  <span className="inline-flex items-center gap-1 text-[10px] text-emerald-600 dark:text-emerald-400 font-semibold">
                    <span className="w-1.5 h-1.5 rounded-full bg-emerald-500 animate-pulse" />
                    Verified
                  </span>
                </div>

                <div>
                  <h3 className="text-base font-bold font-serif text-slate-900 dark:text-white">
                    {partner.name}
                  </h3>
                  <p className="text-xs text-slate-500 dark:text-slate-400 mt-0.5">
                    {partner.role}
                  </p>
                </div>

                <div className="p-2.5 rounded-lg bg-slate-50 dark:bg-slate-900/70 border border-slate-200/80 dark:border-slate-800 space-y-1 font-mono text-[10px]">
                  <div className="text-slate-400 dark:text-slate-500 uppercase tracking-wider">Protocol Certificate</div>
                  <div className="text-slate-800 dark:text-slate-200 font-bold truncate">{partner.certId}</div>
                  <div className="text-slate-500 dark:text-slate-400 text-[9px] truncate">{partner.sha}</div>
                </div>

                <p className="text-[11px] text-slate-600 dark:text-slate-300 leading-relaxed">
                  {partner.protocols}
                </p>
              </div>

              <div className="pt-3 border-t border-slate-100 dark:border-slate-800 flex items-center justify-between">
                <span className="text-[10px] font-mono text-[#8c6d37] dark:text-[#c5a880] font-semibold">
                  {partner.auditStatus}
                </span>
                <button
                  onClick={triggerLiveVerification}
                  className="inline-flex items-center gap-1 text-[11px] font-bold text-slate-700 dark:text-slate-300 hover:text-[#8c6d37] dark:hover:text-[#c5a880] transition-colors cursor-pointer"
                >
                  <span>Verify</span>
                  <ExternalLink className="w-3 h-3 text-[#c5a880]" />
                </button>
              </div>
            </div>
          ))}
        </div>

        {/* Interactive Technical Protocols Breakdown Panel */}
        <div className="p-6 rounded-2xl bg-white dark:bg-[#0a192f] border border-slate-200 dark:border-[#1e3656] shadow-sm space-y-6">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 border-b border-slate-200 dark:border-slate-800 pb-4">
            <div className="flex items-center gap-2">
              <Cpu className="w-5 h-5 text-[#8c6d37] dark:text-[#c5a880]" />
              <h3 className="text-base sm:text-lg font-bold font-serif text-slate-900 dark:text-white">
                Technical Security Protocols &amp; Execution Standards
              </h3>
            </div>

            {/* Protocol Tabs */}
            <div className="flex flex-wrap items-center gap-1.5 p-1 rounded-xl bg-slate-100 dark:bg-[#071322] border border-slate-200 dark:border-slate-800 text-xs">
              {[
                { id: 'MULTI_SIG', label: 'Multi-Sig & 4-Eyes' },
                { id: 'HSM_KEYS', label: 'HSM Enclaves' },
                { id: 'SOC2_AUDIT', label: 'SOC 2 & ISO 27001' },
                { id: 'WAF_DDOS', label: 'Edge DDoS & WAF' }
              ].map((tab) => (
                <button
                  key={tab.id}
                  onClick={() => setActiveProtocolTab(tab.id as any)}
                  className={`px-3 py-1.5 rounded-lg font-semibold transition-all cursor-pointer ${
                    activeProtocolTab === tab.id
                      ? 'bg-white dark:bg-[#112a4a] text-slate-900 dark:text-[#c5a880] shadow-xs font-bold'
                      : 'text-slate-500 dark:text-slate-400 hover:text-slate-900 dark:hover:text-white'
                  }`}
                >
                  {tab.label}
                </button>
              ))}
            </div>
          </div>

          {/* Active Tab Protocol Detail Content */}
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6 text-xs leading-relaxed">
            {activeProtocolTab === 'MULTI_SIG' && (
              <>
                <div className="p-4 rounded-xl bg-slate-50 dark:bg-slate-900/60 border border-slate-200 dark:border-slate-800 space-y-2">
                  <div className="font-bold text-slate-900 dark:text-white flex items-center gap-2">
                    <CheckCircle2 className="w-4 h-4 text-emerald-500" />
                    Dual-Officer Signing Thresholds
                  </div>
                  <p className="text-slate-600 dark:text-slate-300">
                    Wires exceeding $100,000 equivalent require two distinct authorized signatory cryptographic tokens before queue release to clearing rails.
                  </p>
                </div>
                <div className="p-4 rounded-xl bg-slate-50 dark:bg-slate-900/60 border border-slate-200 dark:border-slate-800 space-y-2">
                  <div className="font-bold text-slate-900 dark:text-white flex items-center gap-2">
                    <CheckCircle2 className="w-4 h-4 text-emerald-500" />
                    Time-Locked Beneficiary Escrow
                  </div>
                  <p className="text-slate-600 dark:text-slate-300">
                    Newly enrolled international beneficiaries observe an institutional 60-minute cryptographic cooldown to prevent unauthorized session takeovers.
                  </p>
                </div>
                <div className="p-4 rounded-xl bg-slate-50 dark:bg-slate-900/60 border border-slate-200 dark:border-slate-800 space-y-2">
                  <div className="font-bold text-slate-900 dark:text-white flex items-center gap-2">
                    <CheckCircle2 className="w-4 h-4 text-emerald-500" />
                    Biometric WebAuthn Attestation
                  </div>
                  <p className="text-slate-600 dark:text-slate-300">
                    Client portal authorizations utilize FIDO2 hardware passkeys and biometric secure enclaves (Apple TouchID / Windows Hello).
                  </p>
                </div>
              </>
            )}

            {activeProtocolTab === 'HSM_KEYS' && (
              <>
                <div className="p-4 rounded-xl bg-slate-50 dark:bg-slate-900/60 border border-slate-200 dark:border-slate-800 space-y-2">
                  <div className="font-bold text-slate-900 dark:text-white flex items-center gap-2">
                    <CheckCircle2 className="w-4 h-4 text-emerald-500" />
                    FIPS 140-2 Level 3 HSM Enclaves
                  </div>
                  <p className="text-slate-600 dark:text-slate-300">
                    Private keys never touch software memory or hard drives. All ledger journals are signed directly inside tamper-resistant physical modules in Frankfurt and Zurich.
                  </p>
                </div>
                <div className="p-4 rounded-xl bg-slate-50 dark:bg-slate-900/60 border border-slate-200 dark:border-slate-800 space-y-2">
                  <div className="font-bold text-slate-900 dark:text-white flex items-center gap-2">
                    <CheckCircle2 className="w-4 h-4 text-emerald-500" />
                    Post-Quantum Curve Resilience
                  </div>
                  <p className="text-slate-600 dark:text-slate-300">
                    Prepared for next-generation quantum threats with hybrid ECDSA P-384 and lattice-based cryptographic signature encapsulation.
                  </p>
                </div>
                <div className="p-4 rounded-xl bg-slate-50 dark:bg-slate-900/60 border border-slate-200 dark:border-slate-800 space-y-2">
                  <div className="font-bold text-slate-900 dark:text-white flex items-center gap-2">
                    <CheckCircle2 className="w-4 h-4 text-emerald-500" />
                    Immutable Hash Chains
                  </div>
                  <p className="text-slate-600 dark:text-slate-300">
                    Every ledger adjustment is appended to an immutable Merkle DAG structure preventing historical ledger modification or reordering.
                  </p>
                </div>
              </>
            )}

            {activeProtocolTab === 'SOC2_AUDIT' && (
              <>
                <div className="p-4 rounded-xl bg-slate-50 dark:bg-slate-900/60 border border-slate-200 dark:border-slate-800 space-y-2">
                  <div className="font-bold text-slate-900 dark:text-white flex items-center gap-2">
                    <CheckCircle2 className="w-4 h-4 text-emerald-500" />
                    Annual SOC 2 Type II Attestation
                  </div>
                  <p className="text-slate-600 dark:text-slate-300">
                    Continuous evaluation across Security, Availability, and Confidentiality Trust Services Criteria audited independently by Kroll.
                  </p>
                </div>
                <div className="p-4 rounded-xl bg-slate-50 dark:bg-slate-900/60 border border-slate-200 dark:border-slate-800 space-y-2">
                  <div className="font-bold text-slate-900 dark:text-white flex items-center gap-2">
                    <CheckCircle2 className="w-4 h-4 text-emerald-500" />
                    ISO/IEC 27001:2022 Certified
                  </div>
                  <p className="text-slate-600 dark:text-slate-300">
                    Global Information Security Management System (ISMS) governing cloud infra, physical data vaults, and employee operational access.
                  </p>
                </div>
                <div className="p-4 rounded-xl bg-slate-50 dark:bg-slate-900/60 border border-slate-200 dark:border-slate-800 space-y-2">
                  <div className="font-bold text-slate-900 dark:text-white flex items-center gap-2">
                    <CheckCircle2 className="w-4 h-4 text-emerald-500" />
                    Zero Critical CVE SLA
                  </div>
                  <p className="text-slate-600 dark:text-slate-300">
                    Continuous automated vulnerability scans with guaranteed sub-24h patching SLAs for any upstream third-party security advisory.
                  </p>
                </div>
              </>
            )}

            {activeProtocolTab === 'WAF_DDOS' && (
              <>
                <div className="p-4 rounded-xl bg-slate-50 dark:bg-slate-900/60 border border-slate-200 dark:border-slate-800 space-y-2">
                  <div className="font-bold text-slate-900 dark:text-white flex items-center gap-2">
                    <CheckCircle2 className="w-4 h-4 text-emerald-500" />
                    Layer 7 Intelligent WAF &amp; Bot Defense
                  </div>
                  <p className="text-slate-600 dark:text-slate-300">
                    Real-time behavioral ML models analyzing request signatures to block credential stuffing, SQL injection, and automated scraping.
                  </p>
                </div>
                <div className="p-4 rounded-xl bg-slate-50 dark:bg-slate-900/60 border border-slate-200 dark:border-slate-800 space-y-2">
                  <div className="font-bold text-slate-900 dark:text-white flex items-center gap-2">
                    <CheckCircle2 className="w-4 h-4 text-emerald-500" />
                    300+ Tbps Global Anycast Edge
                  </div>
                  <p className="text-slate-600 dark:text-slate-300">
                    Distributed Anycast network absorbs and mitigates volumetric DDoS attacks at edge nodes without impacting core banking latency.
                  </p>
                </div>
                <div className="p-4 rounded-xl bg-slate-50 dark:bg-slate-900/60 border border-slate-200 dark:border-slate-800 space-y-2">
                  <div className="font-bold text-slate-900 dark:text-white flex items-center gap-2">
                    <CheckCircle2 className="w-4 h-4 text-emerald-500" />
                    Strict CSP &amp; HSTS Preload
                  </div>
                  <p className="text-slate-600 dark:text-slate-300">
                    Mandatory HTTPS with max-age HSTS preload, zero inline script evaluation, and isolated client session sandboxing.
                  </p>
                </div>
              </>
            )}
          </div>
        </div>
      </div>

      {/* DYNAMIC SECURITY VERIFICATION MODAL / INSPECTOR */}
      {showVerifyModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-xs">
          <div className="bg-white dark:bg-[#0a192f] border border-slate-200 dark:border-[#1e3656] rounded-2xl p-6 sm:p-8 max-w-2xl w-full shadow-2xl space-y-6 text-slate-800 dark:text-slate-100">
            <div className="flex items-center justify-between border-b border-slate-200 dark:border-slate-800 pb-4">
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 rounded-xl bg-emerald-500/20 text-emerald-500 flex items-center justify-center border border-emerald-500/40">
                  <ShieldCheck className="w-5 h-5" />
                </div>
                <div>
                  <h3 className="text-lg font-bold font-serif text-slate-900 dark:text-white">
                    Live Security Certificate &amp; Protocol Attestation
                  </h3>
                  <div className="flex items-center gap-2 text-xs text-slate-500 dark:text-slate-400 font-mono">
                    <span className="w-2 h-2 rounded-full bg-emerald-400 animate-pulse" />
                    <span>{lastVerifiedTime}</span>
                  </div>
                </div>
              </div>
              <button
                onClick={() => setShowVerifyModal(false)}
                className="p-2 rounded-lg text-slate-400 hover:text-slate-900 dark:hover:text-white hover:bg-slate-100 dark:hover:bg-slate-800 transition-colors cursor-pointer"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <div className="space-y-4 text-xs font-mono">
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                <div className="p-3 rounded-xl bg-slate-50 dark:bg-slate-900 border border-slate-200 dark:border-slate-800 space-y-1">
                  <span className="text-slate-400 block text-[10px] uppercase">LEI Identifier</span>
                  <span className="font-bold text-slate-900 dark:text-white text-xs">984500732A11BC894412</span>
                  <span className="text-[10px] text-emerald-500 block">Active &amp; GLEIF Verified</span>
                </div>
                <div className="p-3 rounded-xl bg-slate-50 dark:bg-slate-900 border border-slate-200 dark:border-slate-800 space-y-1">
                  <span className="text-slate-400 block text-[10px] uppercase">Cipher Suite</span>
                  <span className="font-bold text-slate-900 dark:text-white text-xs">TLS_AES_256_GCM_SHA384</span>
                  <span className="text-[10px] text-emerald-500 block">Post-Quantum Ready</span>
                </div>
              </div>

              <div className="p-3.5 rounded-xl bg-slate-50 dark:bg-slate-900 border border-slate-200 dark:border-slate-800 space-y-1.5">
                <div className="flex items-center justify-between text-[10px] text-slate-400">
                  <span className="uppercase">SHA-256 Public Key Fingerprint</span>
                  <span className="text-emerald-500 font-bold">DIGICERT EV ROOT CA</span>
                </div>
                <div className="text-[11px] text-slate-800 dark:text-slate-200 font-bold break-all bg-white dark:bg-slate-950 p-2 rounded-lg border border-slate-200 dark:border-slate-800">
                  7F:8A:2C:99:E1:5D:84:10:9B:33:4F:12:00:AA:CD:55:E2:81:90:4B:C7:32:09:11:88:FE:41:99:34:BC:01:A9
                </div>
              </div>

              <div className="p-3.5 rounded-xl bg-slate-50 dark:bg-slate-900 border border-slate-200 dark:border-slate-800 space-y-2">
                <span className="text-slate-400 text-[10px] uppercase block">Independent Verification Nodes</span>
                <div className="space-y-1 text-slate-700 dark:text-slate-300">
                  <div className="flex items-center justify-between">
                    <span>✓ Kroll SOC 2 Type II Surveillance:</span>
                    <span className="text-emerald-500 font-bold">Current (No Deficiencies)</span>
                  </div>
                  <div className="flex items-center justify-between">
                    <span>✓ Cloudflare Magic Transit Anycast WAF:</span>
                    <span className="text-emerald-500 font-bold">Active (0 Anomalies)</span>
                  </div>
                  <div className="flex items-center justify-between">
                    <span>✓ Thales Luna HSM Enclave Vault:</span>
                    <span className="text-emerald-500 font-bold">Operational (FIPS 140-2 Level 3)</span>
                  </div>
                </div>
              </div>
            </div>

            <div className="flex flex-col sm:flex-row items-center justify-between gap-3 pt-2">
              <a
                href="https://www.gleif.org"
                target="_blank"
                rel="noreferrer"
                className="inline-flex items-center gap-1.5 text-xs text-[#8c6d37] dark:text-[#c5a880] hover:underline font-semibold"
              >
                <span>Check GLEIF Global Legal Entity Registry</span>
                <ExternalLink className="w-3.5 h-3.5" />
              </a>

              <button
                onClick={() => setShowVerifyModal(false)}
                className="w-full sm:w-auto px-6 py-2.5 rounded-xl bg-[#c5a880] hover:bg-[#d4af37] text-slate-950 font-bold text-xs uppercase tracking-wider transition-colors cursor-pointer"
              >
                Close Attestation Inspector
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Statutory Custody Proof */}
      <div className="bg-[#0a192f] rounded-2xl p-8 text-white border border-[#c5a880]/40 shadow-xl space-y-6">
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 border-b border-slate-700/80 pb-6">
          <div>
            <span className="text-xs uppercase font-bold tracking-widest text-[#d4af37]">Sovereign Legal Clearances</span>
            <h2 className="text-2xl font-bold font-serif pt-1">Institutional Custody &amp; Regulatory Protection</h2>
          </div>
          <div className="flex items-center gap-2 text-xs text-emerald-400 font-mono">
            <span className="w-2 h-2 rounded-full bg-emerald-400 animate-pulse" />
            Global Compliance Active
          </div>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 text-xs text-slate-300">
          <div className="p-4 rounded-xl bg-slate-900/80 border border-slate-700/60 space-y-2">
            <h4 className="font-bold text-[#d4af37] uppercase tracking-wider">United States (FDIC)</h4>
            <p>FDIC Certificate #34920. Standard insurance up to $250,000 per depositor across all qualifying accounts.</p>
          </div>
          <div className="p-4 rounded-xl bg-slate-900/80 border border-slate-700/60 space-y-2">
            <h4 className="font-bold text-[#d4af37] uppercase tracking-wider">United Kingdom (PRA / FCA)</h4>
            <p>PRA &amp; FCA Authorised Firm #900188. Financial Services Compensation Scheme (FSCS) protection up to £85,000.</p>
          </div>
          <div className="p-4 rounded-xl bg-slate-900/80 border border-slate-700/60 space-y-2">
            <h4 className="font-bold text-[#d4af37] uppercase tracking-wider">European Union (BaFin / ECB)</h4>
            <p>Institutional Registry #108420. Statutory European Deposit Guarantee Scheme (DGS) coverage up to €100,000.</p>
          </div>
        </div>

        <div className="pt-2 flex justify-end">
          <button
            onClick={() => setCurrentView('AUTH_ENROLL')}
            className="px-6 py-2.5 rounded-xl bg-[#c5a880] hover:bg-[#d4af37] text-slate-950 font-bold text-xs uppercase tracking-wider transition-colors cursor-pointer"
          >
            Apply for Private Client Account &rarr;
          </button>
        </div>
      </div>
    </div>
  );
};
