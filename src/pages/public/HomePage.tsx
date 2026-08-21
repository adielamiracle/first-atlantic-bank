import React, { useState } from 'react';
import { useBank } from '../../context/BankContext';
import {
  ShieldCheck,
  Landmark,
  Globe2,
  TrendingUp,
  ArrowRight,
  Lock,
  CreditCard,
  Building,
  CheckCircle2,
  PhoneCall,
  Sparkles,
  ChevronRight
} from 'lucide-react';
import { CurrencyDisplay } from '../../components/common/CurrencyDisplay';

export const HomePage: React.FC = () => {
  const { setCurrentView, region } = useBank();
  const [calcDeposit, setCalcDeposit] = useState(100000);
  const [calcYears, setCalcYears] = useState(3);

  // 5.15% APY compound interest calculation
  const apy = 0.0515;
  const projectedBalance = calcDeposit * Math.pow(1 + apy, calcYears);
  const interestEarned = projectedBalance - calcDeposit;

  return (
    <div className="bg-[#f8fafc] text-slate-800">
      {/* Hero Section */}
      <section className="relative bg-[#07172c] text-white overflow-hidden pt-12 pb-20 sm:pb-28">
        {/* Subtle geometric background grid */}
        <div className="absolute inset-0 opacity-10 bg-[linear-gradient(to_right,#c5a880_1px,transparent_1px),linear-gradient(to_bottom,#c5a880_1px,transparent_1px)] bg-[size:4rem_4rem] pointer-events-none" />
        <div className="absolute top-0 right-0 w-96 h-96 bg-radial from-[#1e4470]/30 to-transparent blur-3xl pointer-events-none" />

        <div className="max-w-7xl mx-auto px-6 sm:px-8 relative z-10">
          <div className="grid grid-cols-1 lg:grid-cols-12 gap-12 items-center">
            <div className="lg:col-span-7 space-y-6">
                <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-[#112d50] border border-[#c5a880]/30 text-[#e5ca95] text-xs font-semibold uppercase tracking-wider font-mono">
                <ShieldCheck className="w-3.5 h-3.5 text-[#d4af37]" />
                <span>EU • UK • US Chartered International Institution</span>
              </div>

              <h1 className="text-3xl sm:text-5xl lg:text-6xl font-bold tracking-tight text-white font-serif leading-[1.15]">
                Financial Precision. <br />
                <span className="text-transparent bg-clip-text bg-gradient-to-r from-[#e5ca95] via-[#d4af37] to-[#f7e6b5]">
                  Global &amp; European Reach.
                </span>
              </h1>

              <p className="text-slate-300 text-base sm:text-lg leading-relaxed max-w-xl">
                First Atlantic Bank seamlessly integrates modern digital treasury capabilities with institutional private wealth stewardship across Frankfurt, Zurich, London, and New York.
              </p>

              {/* Rate Callout Badge */}
              <div className="p-4 rounded-xl bg-[#0e2746] border border-[#c5a880]/30 max-w-lg flex items-center justify-between shadow-lg">
                <div>
                  <span className="text-[11px] uppercase tracking-wider text-[#c5a880] font-bold block">
                    Atlantic Apex High-Yield Savings
                  </span>
                  <span className="text-2xl sm:text-3xl font-extrabold text-white font-mono">5.15% APY / 4.10% EUR</span>
                  <span className="text-[11px] text-slate-400 block mt-0.5">
                    EU Scheme €100k • FSCS £85k • FDIC $250k • Multicurrency IBAN
                  </span>
                </div>
                <button
                  onClick={() => setCurrentView('AUTH_ENROLL')}
                  className="px-4 py-2 bg-[#c5a880] hover:bg-[#d4af37] text-slate-950 font-bold text-xs uppercase tracking-wider rounded-lg shadow-md transition-all shrink-0"
                >
                  Open Account
                </button>
              </div>

              <div className="pt-2 flex flex-wrap items-center gap-4">
                <button
                  onClick={() => setCurrentView('AUTH_LOGIN')}
                  className="px-6 py-3.5 rounded-xl bg-white text-slate-950 font-bold text-sm hover:bg-slate-100 transition-all shadow-md flex items-center gap-2"
                >
                  <Lock className="w-4 h-4 text-[#8c6d37]" />
                  <span>Access Client Portal</span>
                </button>
                <button
                  onClick={() => setCurrentView('PUBLIC_PERSONAL')}
                  className="px-6 py-3.5 rounded-xl border border-slate-600 hover:border-slate-400 text-slate-200 font-semibold text-sm hover:text-white transition-all flex items-center gap-2"
                >
                  <span>Explore Banking Products</span>
                  <ArrowRight className="w-4 h-4" />
                </button>
              </div>
            </div>

            {/* Hero Quick Preview Card */}
            <div className="lg:col-span-5">
              <div className="rounded-2xl bg-gradient-to-b from-[#0f2a4d] to-[#081729] p-6 border border-[#c5a880]/30 shadow-2xl space-y-5">
                <div className="flex items-center justify-between pb-4 border-b border-slate-700/60">
                  <div className="flex items-center gap-3">
                    <div className="w-9 h-9 rounded-lg bg-[#143966] text-[#d4af37] flex items-center justify-center font-bold font-serif">
                      FA
                    </div>
                    <div>
                      <h4 className="text-xs font-semibold text-white uppercase tracking-wider">Client Snapshot</h4>
                      <p className="text-[11px] text-slate-400">Institutional Multi-Currency</p>
                    </div>
                  </div>
                  <span className="px-2 py-0.5 rounded-md bg-emerald-950/60 text-emerald-300 text-[10px] font-mono border border-emerald-800/40">
                    256-Bit Live
                  </span>
                </div>

                <div className="space-y-1">
                  <span className="text-[11px] text-slate-400 uppercase tracking-wider font-medium">Total Liquid Portfolio</span>
                  <div className="text-3xl font-extrabold text-white font-mono">$533,420.50</div>
                  <span className="text-xs text-emerald-400 flex items-center gap-1 font-medium">
                    <TrendingUp className="w-3.5 h-3.5" /> +$1,648.90 monthly compound yield credited
                  </span>
                </div>

                <div className="space-y-2.5 pt-2">
                  <div className="p-3 rounded-lg bg-[#08182b] border border-slate-800 flex justify-between items-center">
                    <div>
                      <div className="text-xs font-semibold text-white">Premier Checking (USD)</div>
                      <div className="text-[10px] text-slate-400 font-mono">ABA 021000089 •••• 4892</div>
                    </div>
                    <span className="text-sm font-bold text-white font-mono">$148,920.50</span>
                  </div>

                  <div className="p-3 rounded-lg bg-[#08182b] border border-slate-800 flex justify-between items-center">
                    <div>
                      <div className="text-xs font-semibold text-white">Apex High-Yield Savings (5.15%)</div>
                      <div className="text-[10px] text-slate-400 font-mono">ABA 021000089 •••• 7104</div>
                    </div>
                    <span className="text-sm font-bold text-emerald-400 font-mono">$384,500.00</span>
                  </div>

                  <div className="p-3 rounded-lg bg-[#08182b] border border-slate-800 flex justify-between items-center">
                    <div>
                      <div className="text-xs font-semibold text-white">Global London Reserve (GBP)</div>
                      <div className="text-[10px] text-slate-400 font-mono">Sort 40-12-88 •••• 9381</div>
                    </div>
                    <span className="text-sm font-bold text-amber-200 font-mono">£89,400.00</span>
                  </div>
                </div>

                <div className="pt-2">
                  <button
                    onClick={() => setCurrentView('AUTH_LOGIN')}
                    className="w-full py-2.5 rounded-lg bg-gradient-to-r from-[#c5a880] to-[#b08e5e] text-slate-950 font-bold text-xs uppercase tracking-wider shadow-md hover:brightness-105 transition-all text-center"
                  >
                    Access Secure Banking Portal
                  </button>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Core Banking Products Grid */}
      <section className="py-16 sm:py-24 max-w-7xl mx-auto px-6 sm:px-8">
        <div className="text-center max-w-2xl mx-auto space-y-3 mb-14">
          <span className="text-xs uppercase font-bold tracking-widest text-[#8c6d37]">Banking &amp; Lending Architecture</span>
          <h2 className="text-2xl sm:text-4xl font-bold font-serif text-slate-900">
            Tailored Financial Solutions
          </h2>
          <p className="text-slate-600 text-sm leading-relaxed">
            Every First Atlantic account is backed by authoritative ledger technology, multi-currency routing, and comprehensive regulatory guarantees.
          </p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {/* Card 1 */}
          <div className="bg-white rounded-2xl p-7 border border-slate-200/90 shadow-sm hover:shadow-md transition-shadow space-y-4">
            <div className="w-12 h-12 rounded-xl bg-[#0a192f] text-[#d4af37] flex items-center justify-center">
              <Landmark className="w-6 h-6" />
            </div>
            <h3 className="text-lg font-bold font-serif text-slate-900">Premier Private Checking</h3>
            <p className="text-xs text-slate-600 leading-relaxed">
              Uncapped domestic wire transfers, zero international ATM fees globally, and integrated US ABA / UK Sort Code dual clearing.
            </p>
            <ul className="space-y-1.5 text-xs text-slate-700 pt-2">
              <li className="flex items-center gap-2"><CheckCircle2 className="w-3.5 h-3.5 text-emerald-600" /> Unlimited Free Fedwire &amp; ACH</li>
              <li className="flex items-center gap-2"><CheckCircle2 className="w-3.5 h-3.5 text-emerald-600" /> Dedicated Private Banking Concierge</li>
              <li className="flex items-center gap-2"><CheckCircle2 className="w-3.5 h-3.5 text-emerald-600" /> 24/7 Global Fraud Monitoring</li>
            </ul>
            <div className="pt-2">
              <button
                onClick={() => setCurrentView('PUBLIC_PERSONAL')}
                className="text-xs font-bold text-[#8c6d37] hover:text-[#6e5325] flex items-center gap-1"
              >
                Account Details &amp; Disclosures &rarr;
              </button>
            </div>
          </div>

          {/* Card 2 */}
          <div className="bg-white rounded-2xl p-7 border border-[#c5a880]/50 shadow-sm hover:shadow-md transition-shadow space-y-4 relative overflow-hidden">
            <div className="absolute top-4 right-4 bg-[#c5a880]/20 text-[#8c6d37] text-[10px] font-bold uppercase px-2.5 py-1 rounded-md">
              Featured 5.15% APY
            </div>
            <div className="w-12 h-12 rounded-xl bg-[#0a192f] text-[#d4af37] flex items-center justify-center">
              <TrendingUp className="w-6 h-6" />
            </div>
            <h3 className="text-lg font-bold font-serif text-slate-900">Apex High-Yield Savings</h3>
            <p className="text-xs text-slate-600 leading-relaxed">
              Compound daily interest on all balances with instant liquidity. No lockup period or transfer fees.
            </p>
            <ul className="space-y-1.5 text-xs text-slate-700 pt-2">
              <li className="flex items-center gap-2"><CheckCircle2 className="w-3.5 h-3.5 text-emerald-600" /> 5.15% Annual Percentage Yield</li>
              <li className="flex items-center gap-2"><CheckCircle2 className="w-3.5 h-3.5 text-emerald-600" /> Daily Compound Interest Crediting</li>
              <li className="flex items-center gap-2"><CheckCircle2 className="w-3.5 h-3.5 text-emerald-600" /> FDIC / FSCS Segregated Protection</li>
            </ul>
            <div className="pt-2">
              <button
                onClick={() => setCurrentView('AUTH_ENROLL')}
                className="text-xs font-bold text-[#8c6d37] hover:text-[#6e5325] flex items-center gap-1"
              >
                Open Savings Account &rarr;
              </button>
            </div>
          </div>

          {/* Card 3 */}
          <div className="bg-white rounded-2xl p-7 border border-slate-200/90 shadow-sm hover:shadow-md transition-shadow space-y-4">
            <div className="w-12 h-12 rounded-xl bg-[#0a192f] text-[#d4af37] flex items-center justify-center">
              <CreditCard className="w-6 h-6" />
            </div>
            <h3 className="text-lg font-bold font-serif text-slate-900">Atlantic Infinite Card</h3>
            <p className="text-xs text-slate-600 leading-relaxed">
              Full metal card crafted in brushed titanium. Zero foreign transaction fees, $100k+ credit facility, and bespoke travel protection.
            </p>
            <ul className="space-y-1.5 text-xs text-slate-700 pt-2">
              <li className="flex items-center gap-2"><CheckCircle2 className="w-3.5 h-3.5 text-emerald-600" /> 3x Points on Global Travel &amp; Dining</li>
              <li className="flex items-center gap-2"><CheckCircle2 className="w-3.5 h-3.5 text-emerald-600" /> Priority Pass Worldwide Lounge Access</li>
              <li className="flex items-center gap-2"><CheckCircle2 className="w-3.5 h-3.5 text-emerald-600" /> Instant In-App Freeze &amp; Controls</li>
            </ul>
            <div className="pt-2">
              <button
                onClick={() => setCurrentView('PUBLIC_PERSONAL')}
                className="text-xs font-bold text-[#8c6d37] hover:text-[#6e5325] flex items-center gap-1"
              >
                Card Privileges &rarr;
              </button>
            </div>
          </div>

          {/* Card 4 */}
          <div className="bg-white rounded-2xl p-7 border border-slate-200/90 shadow-sm hover:shadow-md transition-shadow space-y-4">
            <div className="w-12 h-12 rounded-xl bg-[#0a192f] text-[#d4af37] flex items-center justify-center">
              <Globe2 className="w-6 h-6" />
            </div>
            <h3 className="text-lg font-bold font-serif text-slate-900">Global Multi-Currency Reserve</h3>
            <p className="text-xs text-slate-600 leading-relaxed">
              Hold, convert, and remit in USD, GBP, and EUR simultaneously with real-time institutional exchange rate locking.
            </p>
            <ul className="space-y-1.5 text-xs text-slate-700 pt-2">
              <li className="flex items-center gap-2"><CheckCircle2 className="w-3.5 h-3.5 text-emerald-600" /> Dedicated UK Sort Code &amp; US ABA</li>
              <li className="flex items-center gap-2"><CheckCircle2 className="w-3.5 h-3.5 text-emerald-600" /> Interbank Real-Time Spot FX Pricing</li>
              <li className="flex items-center gap-2"><CheckCircle2 className="w-3.5 h-3.5 text-emerald-600" /> SWIFT, FPS, and CHAPS Integration</li>
            </ul>
            <div className="pt-2">
              <button
                onClick={() => setCurrentView('PUBLIC_INTERNATIONAL')}
                className="text-xs font-bold text-[#8c6d37] hover:text-[#6e5325] flex items-center gap-1"
              >
                International Treasury Details &rarr;
              </button>
            </div>
          </div>

          {/* Card 5 */}
          <div className="bg-white rounded-2xl p-7 border border-slate-200/90 shadow-sm hover:shadow-md transition-shadow space-y-4">
            <div className="w-12 h-12 rounded-xl bg-[#0a192f] text-[#d4af37] flex items-center justify-center">
              <Building className="w-6 h-6" />
            </div>
            <h3 className="text-lg font-bold font-serif text-slate-900">Commercial Treasury Liquidity</h3>
            <p className="text-xs text-slate-600 leading-relaxed">
              Enterprise payroll distribution, automated sweeps, multi-user role permissions, and dual-control maker-checker approvals.
            </p>
            <ul className="space-y-1.5 text-xs text-slate-700 pt-2">
              <li className="flex items-center gap-2"><CheckCircle2 className="w-3.5 h-3.5 text-emerald-600" /> Automated Liquidity Sweeps</li>
              <li className="flex items-center gap-2"><CheckCircle2 className="w-3.5 h-3.5 text-emerald-600" /> Multi-Tier Corporate Approvals</li>
              <li className="flex items-center gap-2"><CheckCircle2 className="w-3.5 h-3.5 text-emerald-600" /> Direct ERP &amp; API Ledger Feeds</li>
            </ul>
            <div className="pt-2">
              <button
                onClick={() => setCurrentView('PUBLIC_BUSINESS')}
                className="text-xs font-bold text-[#8c6d37] hover:text-[#6e5325] flex items-center gap-1"
              >
                Commercial Solutions &rarr;
              </button>
            </div>
          </div>

          {/* Card 6 */}
          <div className="bg-white rounded-2xl p-7 border border-slate-200/90 shadow-sm hover:shadow-md transition-shadow space-y-4">
            <div className="w-12 h-12 rounded-xl bg-[#0a192f] text-[#d4af37] flex items-center justify-center">
              <Sparkles className="w-6 h-6" />
            </div>
            <h3 className="text-lg font-bold font-serif text-slate-900">Private Wealth &amp; Fiduciary Trust</h3>
            <p className="text-xs text-slate-600 leading-relaxed">
              Generational estate structuring, bespoke Lombard lending against liquid collateral, and discretionary investment mandates.
            </p>
            <ul className="space-y-1.5 text-xs text-slate-700 pt-2">
              <li className="flex items-center gap-2"><CheckCircle2 className="w-3.5 h-3.5 text-emerald-600" /> Cross-Border Estate Planning</li>
              <li className="flex items-center gap-2"><CheckCircle2 className="w-3.5 h-3.5 text-emerald-600" /> Collateralized Security Lending</li>
              <li className="flex items-center gap-2"><CheckCircle2 className="w-3.5 h-3.5 text-emerald-600" /> Discretionary Portfolio Management</li>
            </ul>
            <div className="pt-2">
              <button
                onClick={() => setCurrentView('PUBLIC_WEALTH')}
                className="text-xs font-bold text-[#8c6d37] hover:text-[#6e5325] flex items-center gap-1"
              >
                Private Wealth Portal &rarr;
              </button>
            </div>
          </div>
        </div>
      </section>

      {/* Interactive Interest Calculator */}
      <section className="bg-[#0a192f] text-white py-16 sm:py-20 border-y border-slate-800">
        <div className="max-w-5xl mx-auto px-6 sm:px-8">
          <div className="grid grid-cols-1 lg:grid-cols-12 gap-10 items-center">
            <div className="lg:col-span-6 space-y-4">
              <span className="text-xs uppercase font-bold tracking-widest text-[#c5a880]">Yield Calculator</span>
              <h2 className="text-2xl sm:text-4xl font-bold font-serif">
                Calculate Your Compound Returns
              </h2>
              <p className="text-slate-300 text-sm leading-relaxed">
                See how much your cash reserve grows with Atlantic Apex High-Yield Savings at 5.15% APY compounded daily.
              </p>

              <div className="space-y-5 pt-4">
                <div>
                  <div className="flex justify-between text-xs text-slate-300 mb-2 font-mono">
                    <span>Initial Deposit:</span>
                    <span className="font-bold text-[#e5ca95]">${calcDeposit.toLocaleString()}</span>
                  </div>
                  <input
                    type="range"
                    min="10000"
                    max="1000000"
                    step="5000"
                    value={calcDeposit}
                    onChange={(e) => setCalcDeposit(Number(e.target.value))}
                    className="w-full h-2 bg-slate-700 rounded-lg appearance-none cursor-pointer accent-[#c5a880]"
                  />
                  <div className="flex justify-between text-[10px] text-slate-500 font-mono mt-1">
                    <span>$10,000</span>
                    <span>$500,000</span>
                    <span>$1,000,000+</span>
                  </div>
                </div>

                <div>
                  <div className="flex justify-between text-xs text-slate-300 mb-2 font-mono">
                    <span>Growth Horizon:</span>
                    <span className="font-bold text-[#e5ca95]">{calcYears} {calcYears === 1 ? 'Year' : 'Years'}</span>
                  </div>
                  <div className="flex gap-2">
                    {[1, 2, 3, 5].map((yr) => (
                      <button
                        key={yr}
                        onClick={() => setCalcYears(yr)}
                        className={`flex-1 py-2 text-xs font-semibold rounded-lg border transition-all ${
                          calcYears === yr
                            ? 'bg-[#c5a880] text-slate-950 border-[#c5a880]'
                            : 'bg-slate-800 text-slate-300 border-slate-700 hover:bg-slate-700'
                        }`}
                      >
                        {yr} {yr === 1 ? 'Yr' : 'Yrs'}
                      </button>
                    ))}
                  </div>
                </div>
              </div>
            </div>

            {/* Results Display */}
            <div className="lg:col-span-6 bg-[#08182b] p-8 rounded-2xl border border-[#c5a880]/30 shadow-xl space-y-6">
              <div className="space-y-1">
                <span className="text-xs uppercase text-[#c5a880] font-bold tracking-wider">Projected Portfolio Balance</span>
                <div className="text-3xl sm:text-4xl font-extrabold text-white font-mono">
                  ${Math.round(projectedBalance).toLocaleString()}
                </div>
              </div>

              <div className="grid grid-cols-2 gap-4 pt-4 border-t border-slate-800">
                <div>
                  <span className="text-[11px] text-slate-400 block">Total Interest Earned</span>
                  <span className="text-lg font-bold text-emerald-400 font-mono">
                    +${Math.round(interestEarned).toLocaleString()}
                  </span>
                </div>
                <div>
                  <span className="text-[11px] text-slate-400 block">Annual Percentage Yield</span>
                  <span className="text-lg font-bold text-white font-mono">5.15% Fixed APY</span>
                </div>
              </div>

              <button
                onClick={() => setCurrentView('AUTH_ENROLL')}
                className="w-full py-3.5 rounded-xl bg-gradient-to-r from-[#c5a880] to-[#b39366] text-slate-950 font-bold text-xs uppercase tracking-wider shadow-lg hover:brightness-105 transition-all text-center"
              >
                Open High-Yield Account in 5 Minutes
              </button>
            </div>
          </div>
        </div>
      </section>

      {/* Locations & Private Concierge */}
      <section className="py-16 sm:py-24 max-w-7xl mx-auto px-6 sm:px-8">
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-12 items-center">
          <div className="space-y-6">
            <span className="text-xs uppercase font-bold tracking-widest text-[#8c6d37]">Private Executive Lounges</span>
            <h2 className="text-2xl sm:text-4xl font-bold font-serif text-slate-900">
              New York &amp; London Presence
            </h2>
            <p className="text-slate-600 text-sm leading-relaxed">
              First Atlantic Bank maintains flagship executive advisory centers on Park Avenue, New York and Berkeley Square, London. Private clients enjoy discrete conference suites, fiduciary counsel, and secure vault facilities.
            </p>

            <div className="space-y-3 pt-2">
              <div className="p-4 rounded-xl bg-white border border-slate-200 flex items-start gap-4">
                <div className="w-10 h-10 rounded-lg bg-[#0a192f] text-[#d4af37] flex items-center justify-center shrink-0">
                  <Building className="w-5 h-5" />
                </div>
                <div>
                  <h4 className="text-sm font-bold text-slate-900">New York Flagship &amp; Treasury Core</h4>
                  <p className="text-xs text-slate-600 mt-0.5">740 Park Avenue, 18th Floor, New York, NY 10021</p>
                  <span className="text-[11px] text-[#8c6d37] font-semibold mt-1 block">Mon–Fri: 8:00 AM – 6:00 PM EST</span>
                </div>
              </div>

              <div className="p-4 rounded-xl bg-white border border-slate-200 flex items-start gap-4">
                <div className="w-10 h-10 rounded-lg bg-[#0a192f] text-[#d4af37] flex items-center justify-center shrink-0">
                  <Building className="w-5 h-5" />
                </div>
                <div>
                  <h4 className="text-sm font-bold text-slate-900">London Mayfair Private Advisory</h4>
                  <p className="text-xs text-slate-600 mt-0.5">14 Berkeley Square, Mayfair, London W1J 6BQ</p>
                  <span className="text-[11px] text-[#8c6d37] font-semibold mt-1 block">Mon–Fri: 8:30 AM – 5:30 PM GMT</span>
                </div>
              </div>
            </div>

            <button
              onClick={() => setCurrentView('PUBLIC_LOCATIONS')}
              className="px-5 py-2.5 rounded-lg border border-slate-300 hover:border-slate-800 text-xs font-bold uppercase tracking-wider text-slate-800 transition-colors"
            >
              View All Global Locations &rarr;
            </button>
          </div>

          {/* Institutional Trust Badges */}
          <div className="bg-gradient-to-br from-[#0c1f36] to-[#06111f] rounded-2xl p-8 text-white border border-[#c5a880]/30 shadow-2xl space-y-6">
            <h3 className="text-xl font-bold font-serif text-white">Institutional Safeguards</h3>
            
            <div className="space-y-4">
              <div className="flex items-start gap-3.5">
                <div className="p-2 rounded-lg bg-[#143357] text-[#d4af37] shrink-0">
                  <ShieldCheck className="w-5 h-5" />
                </div>
                <div>
                  <h4 className="text-sm font-bold text-white">Full Double-Entry Ledger Immutability</h4>
                  <p className="text-xs text-slate-300 mt-0.5 leading-relaxed">
                    Balances are derived directly from cryptographically auditable transaction journals. No phantom ledger mutations.
                  </p>
                </div>
              </div>

              <div className="flex items-start gap-3.5">
                <div className="p-2 rounded-lg bg-[#143357] text-[#d4af37] shrink-0">
                  <Lock className="w-5 h-5" />
                </div>
                <div>
                  <h4 className="text-sm font-bold text-white">Dual-Control Maker-Checker Architecture</h4>
                  <p className="text-xs text-slate-300 mt-0.5 leading-relaxed">
                    High-value financial corrections and adjustments require separate administrative approval before settlement.
                  </p>
                </div>
              </div>

              <div className="flex items-start gap-3.5">
                <div className="p-2 rounded-lg bg-[#143357] text-[#d4af37] shrink-0">
                  <Landmark className="w-5 h-5" />
                </div>
                <div>
                  <h4 className="text-sm font-bold text-white">Dual Jurisdiction Deposit Protection</h4>
                  <p className="text-xs text-slate-300 mt-0.5 leading-relaxed">
                    Full FDIC membership in the United States and FSCS compensation protection under the UK PRA regime.
                  </p>
                </div>
              </div>
            </div>

            <div className="pt-2 border-t border-slate-700/60 flex items-center justify-between text-xs text-slate-400 font-mono">
              <span>SECURITY RATING: AAA</span>
              <span>256-BIT TLS 1.3 ENCRYPTION</span>
            </div>
          </div>
        </div>
      </section>
    </div>
  );
};
