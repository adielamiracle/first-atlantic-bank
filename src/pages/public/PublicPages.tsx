import React from 'react';
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
  Server
} from 'lucide-react';

export const PersonalPage: React.FC = () => {
  const { setCurrentView, region } = useBank();
  return (
    <div className="bg-[#f8fafc] text-slate-800 py-12 px-6 sm:px-8 max-w-7xl mx-auto space-y-12">
      <div className="text-center max-w-3xl mx-auto space-y-3">
        <span className="text-xs uppercase font-bold tracking-widest text-[#8c6d37]">Personal Banking Solutions</span>
        <h1 className="text-3xl sm:text-5xl font-bold font-serif text-slate-900">
          Crafted for Everyday Sophistication
        </h1>
        <p className="text-slate-600 text-sm leading-relaxed">
          From high-yield liquidity to unlimited global fee-free checking, First Atlantic personal banking is tailored to transatlantic professionals and private families.
        </p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
        <div className="bg-white rounded-2xl p-8 border border-slate-200 shadow-sm space-y-4 flex flex-col justify-between">
          <div className="space-y-3">
            <div className="w-12 h-12 rounded-xl bg-[#0a192f] text-[#d4af37] flex items-center justify-center">
              <Landmark className="w-6 h-6" />
            </div>
            <h3 className="text-xl font-bold font-serif text-slate-900">Premier Checking</h3>
            <p className="text-xs text-slate-600 leading-relaxed">
              No monthly maintenance fees with qualifying balance. Includes complimentary outgoing domestic wires, personalized checkbooks, and private concierge phone dispatch.
            </p>
            <div className="text-2xl font-bold font-mono text-slate-900 pt-2">$0 <span className="text-xs text-slate-500 font-normal">Monthly Fee</span></div>
          </div>
          <button
            onClick={() => setCurrentView('AUTH_ENROLL')}
            className="w-full py-2.5 rounded-lg bg-[#0a192f] hover:bg-[#153459] text-white font-semibold text-xs uppercase tracking-wider transition-colors"
          >
            Apply Online
          </button>
        </div>

        <div className="bg-white rounded-2xl p-8 border border-[#c5a880]/60 shadow-md space-y-4 flex flex-col justify-between relative">
          <div className="absolute top-4 right-4 bg-[#c5a880]/20 text-[#8c6d37] text-[10px] font-bold uppercase px-2.5 py-1 rounded-md">
            5.15% APY
          </div>
          <div className="space-y-3">
            <div className="w-12 h-12 rounded-xl bg-[#0a192f] text-[#d4af37] flex items-center justify-center">
              <TrendingUp className="w-6 h-6" />
            </div>
            <h3 className="text-xl font-bold font-serif text-slate-900">Apex High-Yield Savings</h3>
            <p className="text-xs text-slate-600 leading-relaxed">
              Leading market yield compounded daily with zero lockup requirements. Fully insured up to $250k (US) / £85k (UK).
            </p>
            <div className="text-2xl font-bold font-mono text-emerald-600 pt-2">5.15% <span className="text-xs text-slate-500 font-normal">APY</span></div>
          </div>
          <button
            onClick={() => setCurrentView('AUTH_ENROLL')}
            className="w-full py-2.5 rounded-lg bg-[#c5a880] hover:bg-[#d4af37] text-slate-950 font-bold text-xs uppercase tracking-wider transition-colors"
          >
            Open Account
          </button>
        </div>

        <div className="bg-white rounded-2xl p-8 border border-slate-200 shadow-sm space-y-4 flex flex-col justify-between">
          <div className="space-y-3">
            <div className="w-12 h-12 rounded-xl bg-[#0a192f] text-[#d4af37] flex items-center justify-center">
              <CreditCard className="w-6 h-6" />
            </div>
            <h3 className="text-xl font-bold font-serif text-slate-900">Atlantic Infinite Card</h3>
            <p className="text-xs text-slate-600 leading-relaxed">
              Heavy metal card with 3x points on global travel, comprehensive airport lounge access, and zero foreign transaction surcharges.
            </p>
            <div className="text-2xl font-bold font-mono text-slate-900 pt-2">0% Intro APR <span className="text-xs text-slate-500 font-normal">for 15 mos</span></div>
          </div>
          <button
            onClick={() => setCurrentView('AUTH_ENROLL')}
            className="w-full py-2.5 rounded-lg bg-[#0a192f] hover:bg-[#153459] text-white font-semibold text-xs uppercase tracking-wider transition-colors"
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
    <div className="bg-[#f8fafc] text-slate-800 py-12 px-6 sm:px-8 max-w-7xl mx-auto space-y-12">
      <div className="text-center max-w-3xl mx-auto space-y-3">
        <span className="text-xs uppercase font-bold tracking-widest text-[#8c6d37]">Commercial &amp; Corporate Banking</span>
        <h1 className="text-3xl sm:text-5xl font-bold font-serif text-slate-900">
          Institutional Treasury &amp; Credit
        </h1>
        <p className="text-slate-600 text-sm leading-relaxed">
          Robust treasury liquidity management, multi-signatory maker-checker payment approvals, automated FX sweeps, and revolving commercial lines of credit.
        </p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
        <div className="bg-white rounded-2xl p-8 border border-slate-200 shadow-sm space-y-5">
          <div className="w-12 h-12 rounded-xl bg-[#0a192f] text-[#d4af37] flex items-center justify-center">
            <Building className="w-6 h-6" />
          </div>
          <h3 className="text-xl font-bold font-serif text-slate-900">Corporate Treasury Operating Account</h3>
          <p className="text-xs text-slate-600 leading-relaxed">
            Engineered for high-volume enterprises operating across US and European jurisdictions. Direct API ledger synchronization, batch ACH/BACS payroll processing, and multi-user RBAC controls.
          </p>
          <ul className="space-y-2 text-xs text-slate-700">
            <li className="flex items-center gap-2"><CheckCircle2 className="w-4 h-4 text-emerald-600" /> Multi-user maker-checker dual controls</li>
            <li className="flex items-center gap-2"><CheckCircle2 className="w-4 h-4 text-emerald-600" /> Automated overnight yield sweep accounts</li>
            <li className="flex items-center gap-2"><CheckCircle2 className="w-4 h-4 text-emerald-600" /> Sub-accounts for tax escrow and departmental budgeting</li>
          </ul>
          <button
            onClick={() => setCurrentView('AUTH_ENROLL')}
            className="px-5 py-2.5 rounded-lg bg-[#0a192f] text-white font-semibold text-xs uppercase tracking-wider"
          >
            Inquire for Enterprise
          </button>
        </div>

        <div className="bg-white rounded-2xl p-8 border border-slate-200 shadow-sm space-y-5">
          <div className="w-12 h-12 rounded-xl bg-[#0a192f] text-[#d4af37] flex items-center justify-center">
            <Briefcase className="w-6 h-6" />
          </div>
          <h3 className="text-xl font-bold font-serif text-slate-900">Commercial Lending &amp; Real Estate</h3>
          <p className="text-xs text-slate-600 leading-relaxed">
            Custom-structured debt facilities from $1M to $50M+ for acquisition, refinance, construction, or operational working capital in prime US and UK markets.
          </p>
          <ul className="space-y-2 text-xs text-slate-700">
            <li className="flex items-center gap-2"><CheckCircle2 className="w-4 h-4 text-emerald-600" /> Fixed and floating rate commercial mortgages</li>
            <li className="flex items-center gap-2"><CheckCircle2 className="w-4 h-4 text-emerald-600" /> Revolving working capital lines with flexible drawdowns</li>
            <li className="flex items-center gap-2"><CheckCircle2 className="w-4 h-4 text-emerald-600" /> Equipment financing and structured project debt</li>
          </ul>
          <button
            onClick={() => setCurrentView('AUTH_ENROLL')}
            className="px-5 py-2.5 rounded-lg bg-[#0a192f] text-white font-semibold text-xs uppercase tracking-wider"
          >
            Connect with Loan Officer
          </button>
        </div>
      </div>
    </div>
  );
};

export const WealthPage: React.FC = () => {
  const { setCurrentView } = useBank();
  return (
    <div className="bg-[#f8fafc] text-slate-800 py-12 px-6 sm:px-8 max-w-7xl mx-auto space-y-12">
      <div className="text-center max-w-3xl mx-auto space-y-3">
        <span className="text-xs uppercase font-bold tracking-widest text-[#8c6d37]">Private Client &amp; Family Office</span>
        <h1 className="text-3xl sm:text-5xl font-bold font-serif text-slate-900">
          Stewardship Across Generations
        </h1>
        <p className="text-slate-600 text-sm leading-relaxed">
          First Atlantic Private Wealth provides discretionary portfolio management, trust &amp; fiduciary governance, and bespoke liquidity solutions for high-net-worth individuals.
        </p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        <div className="bg-white rounded-2xl p-7 border border-slate-200 shadow-sm space-y-4">
          <div className="w-10 h-10 rounded-lg bg-[#0a192f] text-[#d4af37] flex items-center justify-center">
            <Shield className="w-5 h-5" />
          </div>
          <h3 className="text-lg font-bold font-serif text-slate-900">Fiduciary Trust Services</h3>
          <p className="text-xs text-slate-600 leading-relaxed">
            Delaware, London, and international trust administration, charitable foundations, and tax-efficient wealth succession.
          </p>
        </div>

        <div className="bg-white rounded-2xl p-7 border border-slate-200 shadow-sm space-y-4">
          <div className="w-10 h-10 rounded-lg bg-[#0a192f] text-[#d4af37] flex items-center justify-center">
            <Award className="w-5 h-5" />
          </div>
          <h3 className="text-lg font-bold font-serif text-slate-900">Bespoke Lombard Credit</h3>
          <p className="text-xs text-slate-600 leading-relaxed">
            Liquidity facilities secured against high-grade equity portfolios, sovereign debt, or physical precious metals without tax realization events.
          </p>
        </div>

        <div className="bg-white rounded-2xl p-7 border border-slate-200 shadow-sm space-y-4">
          <div className="w-10 h-10 rounded-lg bg-[#0a192f] text-[#d4af37] flex items-center justify-center">
            <Globe2 className="w-5 h-6" />
          </div>
          <h3 className="text-lg font-bold font-serif text-slate-900">Transatlantic Advisory</h3>
          <p className="text-xs text-slate-600 leading-relaxed">
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
    <div className="bg-[#f8fafc] text-slate-800 py-12 px-6 sm:px-8 max-w-7xl mx-auto space-y-12">
      <div className="text-center max-w-3xl mx-auto space-y-3">
        <span className="text-xs uppercase font-bold tracking-widest text-[#8c6d37]">Cross-Border Treasury</span>
        <h1 className="text-3xl sm:text-5xl font-bold font-serif text-slate-900">
          Global Multi-Currency Banking
        </h1>
        <p className="text-slate-600 text-sm leading-relaxed">
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
            className="px-6 py-3 rounded-lg bg-[#c5a880] hover:bg-[#d4af37] text-slate-950 font-bold text-xs uppercase tracking-wider shadow-md transition-all"
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
    <div className="bg-[#f8fafc] text-slate-800 py-12 px-6 sm:px-8 max-w-7xl mx-auto space-y-12">
      <div className="text-center max-w-3xl mx-auto space-y-3">
        <span className="text-xs uppercase font-bold tracking-widest text-[#8c6d37]">Global Advisory Footprint</span>
        <h1 className="text-3xl sm:text-5xl font-bold font-serif text-slate-900">
          Executive Lounges &amp; Offices
        </h1>
        <p className="text-slate-600 text-sm leading-relaxed">
          Private conference rooms, vault deposit boxes, and in-person relationship manager appointments.
        </p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        <div className="bg-white rounded-2xl p-7 border border-slate-200 shadow-sm space-y-3">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-lg bg-[#0a192f] text-[#d4af37] flex items-center justify-center">
              <MapPin className="w-5 h-5" />
            </div>
            <div>
              <h3 className="text-base font-bold font-serif text-slate-900">Frankfurt am Main Hub</h3>
              <p className="text-xs text-[#8c6d37] font-semibold">Headquarters (European Union)</p>
            </div>
          </div>
          <p className="text-xs text-slate-600 leading-relaxed">
            Mainzer Landstraße 180, 60327 Frankfurt am Main, Germany<br />
            Phone: +49 69 9000 8800 • Email: frankfurt.client@firstatlanticbank.com
          </p>
          <div className="text-xs text-slate-500 flex items-center gap-2">
            <Clock className="w-3.5 h-3.5" /> Monday – Friday: 8:30 AM – 5:30 PM CET
          </div>
        </div>

        <div className="bg-white rounded-2xl p-7 border border-slate-200 shadow-sm space-y-3">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-lg bg-[#0a192f] text-[#d4af37] flex items-center justify-center">
              <MapPin className="w-5 h-5" />
            </div>
            <div>
              <h3 className="text-base font-bold font-serif text-slate-900">Zurich Wealth Centre</h3>
              <p className="text-xs text-[#8c6d37] font-semibold">Private Client &amp; Asset Management</p>
            </div>
          </div>
          <p className="text-xs text-slate-600 leading-relaxed">
            Bahnhofstrasse 45, 8001 Zürich, Switzerland<br />
            Phone: +41 44 215 9000 • Email: zurich.private@firstatlanticbank.com
          </p>
          <div className="text-xs text-slate-500 flex items-center gap-2">
            <Clock className="w-3.5 h-3.5" /> Monday – Friday: 8:30 AM – 5:00 PM CET
          </div>
        </div>

        <div className="bg-white rounded-2xl p-7 border border-slate-200 shadow-sm space-y-3">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-lg bg-[#0a192f] text-[#d4af37] flex items-center justify-center">
              <MapPin className="w-5 h-5" />
            </div>
            <div>
              <h3 className="text-base font-bold font-serif text-slate-900">London Mayfair Advisory</h3>
              <p className="text-xs text-[#8c6d37] font-semibold">Headquarters (United Kingdom)</p>
            </div>
          </div>
          <p className="text-xs text-slate-600 leading-relaxed">
            14 Berkeley Square, Mayfair, London W1J 6BQ, UK<br />
            Phone: +44 20 7946 0912 • Email: london.private@firstatlanticbank.com
          </p>
          <div className="text-xs text-slate-500 flex items-center gap-2">
            <Clock className="w-3.5 h-3.5" /> Monday – Friday: 8:30 AM – 5:30 PM GMT
          </div>
        </div>

        <div className="bg-white rounded-2xl p-7 border border-slate-200 shadow-sm space-y-3">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-lg bg-[#0a192f] text-[#d4af37] flex items-center justify-center">
              <MapPin className="w-5 h-5" />
            </div>
            <div>
              <h3 className="text-base font-bold font-serif text-slate-900">New York Flagship &amp; Treasury</h3>
              <p className="text-xs text-[#8c6d37] font-semibold">Headquarters (Americas)</p>
            </div>
          </div>
          <p className="text-xs text-slate-600 leading-relaxed">
            740 Park Avenue, 18th Floor, New York, NY 10021, USA<br />
            Phone: +1 (212) 555-0190 • Email: contact@firstatlanticbank.com
          </p>
          <div className="text-xs text-slate-500 flex items-center gap-2">
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
  return (
    <div className="bg-[#f8fafc] text-slate-800 py-12 px-6 sm:px-8 max-w-7xl mx-auto space-y-12">
      <div className="text-center max-w-3xl mx-auto space-y-3">
        <span className="text-xs uppercase font-bold tracking-widest text-[#8c6d37]">Institutional Cyber Resilience</span>
        <h1 className="text-3xl sm:text-5xl font-bold font-serif text-slate-900">
          The First Atlantic Security Architecture
        </h1>
        <p className="text-slate-600 text-sm leading-relaxed">
          How our defense-in-depth framework protects sovereign customer capital, confidential transaction journals, and API integration pathways.
        </p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        <div className="bg-white rounded-2xl p-7 border border-slate-200 shadow-sm space-y-4">
          <div className="w-10 h-10 rounded-lg bg-[#0a192f] text-[#d4af37] flex items-center justify-center">
            <Lock className="w-5 h-5" />
          </div>
          <h3 className="text-lg font-bold font-serif text-slate-900">End-to-End Cryptography</h3>
          <p className="text-xs text-slate-600 leading-relaxed">
            All customer sessions, ledger journals, and inter-service communications are encrypted in transit via TLS 1.3 and at rest with AES-256 HSM keys.
          </p>
        </div>

        <div className="bg-white rounded-2xl p-7 border border-slate-200 shadow-sm space-y-4">
          <div className="w-10 h-10 rounded-lg bg-[#0a192f] text-[#d4af37] flex items-center justify-center">
            <ShieldCheck className="w-5 h-5" />
          </div>
          <h3 className="text-lg font-bold font-serif text-slate-900">Immutable Ledger Auditing</h3>
          <p className="text-xs text-slate-600 leading-relaxed">
            Financial adjustments and transfers are signed with cryptographic checksum hashes, preventing unauthorized retroactive modifications.
          </p>
        </div>

        <div className="bg-white rounded-2xl p-7 border border-slate-200 shadow-sm space-y-4">
          <div className="w-10 h-10 rounded-lg bg-[#0a192f] text-[#d4af37] flex items-center justify-center">
            <Server className="w-5 h-5" />
          </div>
          <h3 className="text-lg font-bold font-serif text-slate-900">24/7 AML &amp; Fraud Radar</h3>
          <p className="text-xs text-slate-600 leading-relaxed">
            Real-time heuristic engines inspect transaction velocity, geolocation anomalies, impossible travel, and device fingerprints.
          </p>
        </div>
      </div>
    </div>
  );
};
