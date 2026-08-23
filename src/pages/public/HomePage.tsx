import React, { useState } from 'react';
import { useBank } from '../../context/BankContext';
import { motion, AnimatePresence } from 'motion/react';
import {
  ShieldCheck,
  Globe2,
  ArrowRight,
  Lock,
  CheckCircle2,
  Sparkles,
  Shield,
  TrendingUp,
  Award,
  BookOpen,
  Calendar,
  Compass,
  DollarSign,
  ChevronRight,
  Users,
  Target,
  BarChart3,
  Quote
} from 'lucide-react';
import fabBuildingHqImg from '../../assets/images/fab_building_hq_1787395818959.jpg';
import futureFamilyImg from '../../assets/images/future_wealth_family_legacy_1787482918598.jpg';
import futureFounderImg from '../../assets/images/innovative_founder_success_1787482940279.jpg';
import clientOfficerImg from '../../assets/images/fab_client_officer_1787395907319.jpg';

export const HomePage: React.FC = () => {
  const { setCurrentView } = useBank();

  // State for interactive future growth calculator
  const [initialDeposit, setInitialDeposit] = useState<number>(250000);
  const [horizonYears, setHorizonYears] = useState<number>(5);
  const [monthlyContribution, setMonthlyContribution] = useState<number>(5000);
  const [activeStoryIndex, setActiveStoryIndex] = useState<number>(0);

  // Future compound growth calculation (5.15% APY compound)
  const apyRate = 0.0515;
  const calculateFutureValue = (principal: number, years: number, monthly: number) => {
    let total = principal;
    const monthlyRate = apyRate / 12;
    for (let m = 0; m < years * 12; m++) {
      total = total * (1 + monthlyRate) + monthly;
    }
    return Math.round(total);
  };

  const futureVal = calculateFutureValue(initialDeposit, horizonYears, monthlyContribution);
  const totalContributed = initialDeposit + monthlyContribution * horizonYears * 12;
  const interestEarned = futureVal - totalContributed;

  const inspiringStories = [
    {
      id: 'family-legacy',
      category: 'Generational Wealth Stewardship',
      title: 'Preserving a 3-Generation Family Dynasty Across Continents',
      subtitle: 'The Althaus Family Office • Frankfurt & Zurich',
      image: futureFamilyImg,
      badge: 'Multigenerational Estate',
      quote: 'First Atlantic Bank provided our family with the sovereign peace of mind that borders and currency volatility could never compromise our grandchildren’s security.',
      clientName: 'Julian & Elena von Althaus',
      role: 'Family Office Principals',
      metrics: [
        { label: 'Capital Preserved', value: '€48.5M' },
        { label: 'Annual Apex Yield', value: '5.15% APY' },
        { label: 'Jurisdictions Unified', value: 'Frankfurt • Zurich • London' }
      ],
      blueprint: [
        'Discretionary fiduciary trust structure shielding assets from cross-border legal friction.',
        'High-liquidity treasury reserve with daily compounding interest credited monthly.',
        'Multi-signatory governance ensuring next-gen heirs inherit with seamless fiduciary training.'
      ]
    },
    {
      id: 'founder-scaling',
      category: 'Entrepreneurial Frontier',
      title: 'Scaling Transatlantic Clean-Tech Treasury from Seed to Series C',
      subtitle: 'Kaelen BioSystems & Robotics • London & New York',
      image: futureFounderImg,
      badge: 'High-Growth Commercial',
      quote: 'Instant interbank SWIFT and SEPA clearing transformed our transatlantic operations. We settled multi-million Euro supply lines in seconds without intermediary fees.',
      clientName: 'Dr. Marcus Vance',
      role: 'Co-Founder & Chief Executive Officer',
      metrics: [
        { label: 'Cross-Border Velocity', value: '< 4 Seconds' },
        { label: 'FX Overhead Saved', value: '73% Reduced' },
        { label: 'Currencies Managed', value: 'USD • EUR • GBP' }
      ],
      blueprint: [
        'Segregated multi-currency IBANs for dedicated vendor, payroll, and investor tranches.',
        'Automated real-time spot FX hedging locking in optimal wholesale exchange windows.',
        'Dual-officer 4-eyes wire authorization preventing unauthorized treasury diversion.'
      ]
    },
    {
      id: 'sustainable-infrastructure',
      category: 'Impact & Sovereign Real Assets',
      title: 'Financing Pan-European Green Infrastructure & Micro-Grids',
      subtitle: 'Vanguard Renewable Capital • London Desk',
      image: clientOfficerImg,
      badge: 'Sovereign Real Assets',
      quote: 'The precision of First Atlantic’s escrow and institutional custody allowed our institutional partners to disburse capital safely into critical renewable micro-grids.',
      clientName: 'Beatrix Thorne, CFA',
      role: 'Managing Partner, Infrastructure Fiduciary',
      metrics: [
        { label: 'Facility Structured', value: '£115M' },
        { label: 'Escrow Release SLA', value: 'Same-Hour' },
        { label: 'Audit Clearance', value: '100% SOC 2' }
      ],
      blueprint: [
        'Cryptographic milestone escrow smart verification for green infrastructure disbursements.',
        'Zero-trust hardware security module (HSM) multi-key authorization for tranche approvals.',
        'Dedicated senior institutional wealth advisor coordinating cross-border banking desks.'
      ]
    }
  ];

  const futurePillars = [
    {
      icon: ShieldCheck,
      step: '01',
      title: 'Fortify Your Capital Baseline',
      desc: 'Anchor your liquid reserves in high-yield Apex Cash Accounts yielding 5.15% APY, backed by statutory European (DGS €100k), UK (FSCS £85k), and US (FDIC $250k) protections.'
    },
    {
      icon: Compass,
      step: '02',
      title: 'Structure Multi-Jurisdictional Freedom',
      desc: 'Eliminate geographic dependency with dedicated IBANs in USD, EUR, and GBP. Execute instantaneous global wire settlements with zero correspondent intermediary friction.'
    },
    {
      icon: Users,
      step: '03',
      title: 'Architect Generational Governance',
      desc: 'Implement family trusts, bespoke spending thresholds, and multi-signature 4-eyes authorization so your capital compounds and transfers smoothly to successors.'
    },
    {
      icon: Target,
      step: '04',
      title: 'Direct Fiduciary Concierge',
      desc: 'Engage with a dedicated Senior Wealth Director in Frankfurt, Zurich, or London tailored to your specific liquidity, tax optimization, and enterprise treasury goals.'
    }
  ];

  return (
    <div className="bg-[#f8fafc] dark:bg-[#060e1a] text-slate-800 dark:text-slate-100 min-h-screen transition-colors">
      {/* 1. SHARP, PRESTIGIOUS HERO SECTION */}
      <section className="relative bg-[#071322] text-white min-h-[620px] sm:min-h-[700px] flex items-center justify-center overflow-hidden border-b border-slate-800">
        {/* Subtle Background Backdrop */}
        <div className="absolute inset-0 z-0 opacity-25">
          <img
            src={fabBuildingHqImg}
            alt="First Atlantic Bank Global HQ"
            referrerPolicy="no-referrer"
            className="w-full h-full object-cover object-center"
          />
          <div className="absolute inset-0 bg-gradient-to-t from-[#071322] via-[#071322]/80 to-[#071322]/90" />
        </div>

        {/* Ambient Subtle Glow */}
        <div className="absolute top-1/3 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[600px] h-[350px] bg-[#c5a880]/10 blur-[120px] rounded-full pointer-events-none" />

        <div className="relative z-10 max-w-5xl mx-auto px-6 sm:px-8 py-20 sm:py-28 text-center space-y-8">
          {/* Institutional Badge */}
          <motion.div
            initial={{ opacity: 0, y: -10 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.4 }}
            className="inline-flex items-center gap-2.5 px-4 py-1.5 rounded-full bg-[#0d223c]/90 border border-[#c5a880]/40 text-xs font-mono font-bold tracking-widest text-[#e5ca95] uppercase shadow-md"
          >
            <span className="w-2 h-2 rounded-full bg-emerald-400 animate-pulse" />
            <span>Chartered Private Institution • Frankfurt • Zurich • London • New York</span>
          </motion.div>

          {/* Core Sharp Headline */}
          <motion.div
            initial={{ opacity: 0, y: 15 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5, delay: 0.1 }}
            className="space-y-4"
          >
            <h1 className="text-3xl sm:text-5xl md:text-6xl font-bold tracking-tight font-serif text-white leading-tight">
              Institutional Precision. <br />
              <span className="text-transparent bg-clip-text bg-gradient-to-r from-[#f7e6b5] via-[#d4af37] to-[#c5a880]">
                Sovereign Capital Stewardship.
              </span>
            </h1>
            <p className="text-slate-300 text-sm sm:text-base md:text-lg max-w-2xl mx-auto leading-relaxed font-light">
              Discreet private wealth management, multi-currency corporate treasury, and instant interbank settlement backed by statutory European, UK, and US deposit insurance.
            </p>
          </motion.div>

          {/* Sharp Action Buttons */}
          <motion.div
            initial={{ opacity: 0, y: 15 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5, delay: 0.2 }}
            className="flex flex-col sm:flex-row items-center justify-center gap-4 pt-2"
          >
            <button
              id="hero-access-portal-btn"
              onClick={() => setCurrentView('AUTH_LOGIN')}
              className="w-full sm:w-auto px-8 py-3.5 rounded-xl bg-white text-slate-950 font-bold text-sm hover:bg-slate-100 transition-all shadow-xl flex items-center justify-center gap-2.5 cursor-pointer border border-white"
            >
              <Lock className="w-4 h-4 text-[#8c6d37]" />
              <span>Access Client Portal</span>
            </button>

            <button
              id="hero-open-account-btn"
              onClick={() => setCurrentView('AUTH_ENROLL')}
              className="w-full sm:w-auto px-8 py-3.5 rounded-xl bg-[#0e2746]/90 hover:bg-[#14365f] text-[#f7e6b5] border border-[#c5a880]/50 font-bold text-sm transition-all flex items-center justify-center gap-2 cursor-pointer shadow-lg"
            >
              <span>Apply for Private Account</span>
              <ArrowRight className="w-4 h-4 text-[#c5a880]" />
            </button>
          </motion.div>

          {/* Quick Metrics Bar */}
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ duration: 0.6, delay: 0.3 }}
            className="pt-8 grid grid-cols-2 md:grid-cols-4 gap-4 max-w-3xl mx-auto border-t border-slate-800/80 text-left"
          >
            <div className="p-3 rounded-xl bg-[#091b30]/60 border border-slate-800">
              <span className="text-[10px] uppercase font-mono text-slate-400 block">Apex Yield</span>
              <span className="text-base sm:text-lg font-bold font-mono text-[#e5ca95]">5.15% APY</span>
            </div>
            <div className="p-3 rounded-xl bg-[#091b30]/60 border border-slate-800">
              <span className="text-[10px] uppercase font-mono text-slate-400 block">Currencies</span>
              <span className="text-base sm:text-lg font-bold font-mono text-white">USD • EUR • GBP</span>
            </div>
            <div className="p-3 rounded-xl bg-[#091b30]/60 border border-slate-800">
              <span className="text-[10px] uppercase font-mono text-slate-400 block">Interbank Wires</span>
              <span className="text-base sm:text-lg font-bold font-mono text-white">Real-Time Clearing</span>
            </div>
            <div className="p-3 rounded-xl bg-[#091b30]/60 border border-slate-800">
              <span className="text-[10px] uppercase font-mono text-slate-400 block">Custody Safety</span>
              <span className="text-base sm:text-lg font-bold font-mono text-emerald-400">FDIC / FSCS / DGS</span>
            </div>
          </motion.div>
        </div>
      </section>

      {/* 2. THREE SHARP INSTITUTIONAL PILLARS */}
      <section className="py-16 sm:py-24 max-w-7xl mx-auto px-6 sm:px-8">
        <div className="text-center max-w-2xl mx-auto space-y-2 mb-12">
          <span className="text-xs uppercase font-bold tracking-widest text-[#8c6d37] dark:text-[#c5a880] font-mono">
            Core Banking Disciplines
          </span>
          <h2 className="text-2xl sm:text-4xl font-bold font-serif text-slate-900 dark:text-white">
            Engineered for Sovereign Capital
          </h2>
          <p className="text-xs sm:text-sm text-slate-500 dark:text-slate-400">
            A unified suite of private fiduciary and commercial treasury services designed without intermediary friction.
          </p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          {/* Pillar 1: Private Wealth */}
          <div className="bg-white dark:bg-[#0a192f] rounded-2xl p-7 border border-slate-200 dark:border-[#1e3656] shadow-sm hover:border-[#c5a880] transition-all flex flex-col justify-between space-y-6">
            <div className="space-y-4">
              <div className="w-12 h-12 rounded-xl bg-[#0a192f] dark:bg-[#112a4a] text-[#d4af37] flex items-center justify-center border border-[#c5a880]/30 shadow-xs">
                <Sparkles className="w-5 h-5" />
              </div>
              <h3 className="text-xl font-bold font-serif text-slate-900 dark:text-white">
                Private Wealth &amp; Fiduciary
              </h3>
              <p className="text-xs sm:text-sm text-slate-600 dark:text-slate-300 leading-relaxed">
                Discretionary estate stewardship, family office structuring, and high-yield reserve accounts yielding 5.15% APY with daily compounding transparency.
              </p>
              <ul className="space-y-2 text-xs text-slate-500 dark:text-slate-400 pt-2 border-t border-slate-100 dark:border-slate-800">
                <li className="flex items-center gap-2">
                  <CheckCircle2 className="w-4 h-4 text-emerald-500 shrink-0" />
                  <span>Dedicated Senior Wealth Director</span>
                </li>
                <li className="flex items-center gap-2">
                  <CheckCircle2 className="w-4 h-4 text-emerald-500 shrink-0" />
                  <span>5.15% APY Sovereign Cash Reserves</span>
                </li>
                <li className="flex items-center gap-2">
                  <CheckCircle2 className="w-4 h-4 text-emerald-500 shrink-0" />
                  <span>Private Fiduciary Trust Governance</span>
                </li>
              </ul>
            </div>
            <button
              onClick={() => setCurrentView('PUBLIC_WEALTH')}
              className="inline-flex items-center gap-2 text-xs font-bold text-[#8c6d37] dark:text-[#c5a880] hover:text-[#b38f4d] transition-colors cursor-pointer"
            >
              <span>Explore Wealth Advisory</span>
              <ArrowRight className="w-3.5 h-3.5" />
            </button>
          </div>

          {/* Pillar 2: Multi-Currency Treasury */}
          <div className="bg-white dark:bg-[#0a192f] rounded-2xl p-7 border border-slate-200 dark:border-[#1e3656] shadow-sm hover:border-[#c5a880] transition-all flex flex-col justify-between space-y-6">
            <div className="space-y-4">
              <div className="w-12 h-12 rounded-xl bg-[#0a192f] dark:bg-[#112a4a] text-[#d4af37] flex items-center justify-center border border-[#c5a880]/30 shadow-xs">
                <Globe2 className="w-5 h-5" />
              </div>
              <h3 className="text-xl font-bold font-serif text-slate-900 dark:text-white">
                Multi-Currency Treasury
              </h3>
              <p className="text-xs sm:text-sm text-slate-600 dark:text-slate-300 leading-relaxed">
                Native USD, EUR, and GBP account numbers with direct Fedwire, SEPA Instant, and SWIFT gpi execution for instantaneous international payments.
              </p>
              <ul className="space-y-2 text-xs text-slate-500 dark:text-slate-400 pt-2 border-t border-slate-100 dark:border-slate-800">
                <li className="flex items-center gap-2">
                  <CheckCircle2 className="w-4 h-4 text-emerald-500 shrink-0" />
                  <span>Real-time Interbank FX Spot Rates</span>
                </li>
                <li className="flex items-center gap-2">
                  <CheckCircle2 className="w-4 h-4 text-emerald-500 shrink-0" />
                  <span>Dedicated Multi-Currency IBANs</span>
                </li>
                <li className="flex items-center gap-2">
                  <CheckCircle2 className="w-4 h-4 text-emerald-500 shrink-0" />
                  <span>Zero Intermediary Correspondent Lag</span>
                </li>
              </ul>
            </div>
            <button
              onClick={() => setCurrentView('PUBLIC_BUSINESS')}
              className="inline-flex items-center gap-2 text-xs font-bold text-[#8c6d37] dark:text-[#c5a880] hover:text-[#b38f4d] transition-colors cursor-pointer"
            >
              <span>Explore Treasury Solutions</span>
              <ArrowRight className="w-3.5 h-3.5" />
            </button>
          </div>

          {/* Pillar 3: Fortified Custody & Security */}
          <div className="bg-white dark:bg-[#0a192f] rounded-2xl p-7 border border-slate-200 dark:border-[#1e3656] shadow-sm hover:border-[#c5a880] transition-all flex flex-col justify-between space-y-6">
            <div className="space-y-4">
              <div className="w-12 h-12 rounded-xl bg-[#0a192f] dark:bg-[#112a4a] text-[#d4af37] flex items-center justify-center border border-[#c5a880]/30 shadow-xs">
                <ShieldCheck className="w-5 h-5" />
              </div>
              <h3 className="text-xl font-bold font-serif text-slate-900 dark:text-white">
                Fortified Institutional Custody
              </h3>
              <p className="text-xs sm:text-sm text-slate-600 dark:text-slate-300 leading-relaxed">
                Immutable double-entry mathematical ledger, Hardware Security Module (HSM) keys, and statutory deposit insurance across European and US jurisdictions.
              </p>
              <ul className="space-y-2 text-xs text-slate-500 dark:text-slate-400 pt-2 border-t border-slate-100 dark:border-slate-800">
                <li className="flex items-center gap-2">
                  <CheckCircle2 className="w-4 h-4 text-emerald-500 shrink-0" />
                  <span>FDIC $250k • FSCS £85k • DGS €100k</span>
                </li>
                <li className="flex items-center gap-2">
                  <CheckCircle2 className="w-4 h-4 text-emerald-500 shrink-0" />
                  <span>Dual-Control 4-Eyes Wire Approvals</span>
                </li>
                <li className="flex items-center gap-2">
                  <CheckCircle2 className="w-4 h-4 text-emerald-500 shrink-0" />
                  <span>256-Bit HSM Key Modules</span>
                </li>
              </ul>
            </div>
            <button
              onClick={() => {
                setCurrentView('PUBLIC_SECURITY');
                window.scrollTo({ top: 0, behavior: 'smooth' });
              }}
              className="inline-flex items-center gap-2 text-xs font-bold text-[#8c6d37] dark:text-[#c5a880] hover:text-[#b38f4d] transition-colors cursor-pointer"
            >
              <span>View Security Architecture</span>
              <ArrowRight className="w-3.5 h-3.5" />
            </button>
          </div>
        </div>
      </section>

      {/* 3. INSPIRING STORIES & CAPITAL STEWARDSHIP PROFILES */}
      <section className="py-16 sm:py-24 bg-slate-50 dark:bg-[#071526] border-t border-slate-200 dark:border-slate-800 transition-colors">
        <div className="max-w-7xl mx-auto px-6 sm:px-8 space-y-12">
          <div className="flex flex-col md:flex-row md:items-end justify-between gap-4">
            <div className="space-y-2">
              <span className="text-xs uppercase font-bold tracking-widest text-[#8c6d37] dark:text-[#c5a880] font-mono">
                Real Client Transformations
              </span>
              <h2 className="text-2xl sm:text-4xl font-bold font-serif text-slate-900 dark:text-white">
                Inspiring Stories: Building Generational Prosperity
              </h2>
              <p className="text-xs sm:text-sm text-slate-600 dark:text-slate-300 max-w-2xl">
                See how sovereign families, visionary founders, and institutional leaders leverage First Atlantic Bank to protect wealth, expand globally, and achieve long-term financial freedom.
              </p>
            </div>

            {/* Story Selector Tabs */}
            <div className="flex items-center gap-2 p-1.5 rounded-xl bg-white dark:bg-[#0a192f] border border-slate-200 dark:border-slate-800 shadow-xs self-start md:self-auto">
              {inspiringStories.map((story, idx) => (
                <button
                  key={story.id}
                  onClick={() => setActiveStoryIndex(idx)}
                  className={`px-3.5 py-1.5 rounded-lg text-xs font-bold transition-all cursor-pointer ${
                    activeStoryIndex === idx
                      ? 'bg-[#0a192f] dark:bg-[#15345a] text-[#f7e6b5] border border-[#c5a880]/50 shadow-xs'
                      : 'text-slate-600 dark:text-slate-400 hover:text-slate-900 dark:hover:text-white'
                  }`}
                >
                  {story.badge}
                </button>
              ))}
            </div>
          </div>

          {/* Active Story Featured Showcase Card */}
          <div className="bg-white dark:bg-[#0a192f] rounded-3xl border border-slate-200 dark:border-[#1e3656] shadow-xl overflow-hidden">
            <div className="grid grid-cols-1 lg:grid-cols-12">
              {/* Story Visual Imagery */}
              <div className="lg:col-span-5 relative min-h-[320px] lg:min-h-[460px] overflow-hidden bg-slate-900">
                <img
                  src={inspiringStories[activeStoryIndex].image}
                  alt={inspiringStories[activeStoryIndex].title}
                  referrerPolicy="no-referrer"
                  className="w-full h-full object-cover object-center transition-transform duration-700 hover:scale-105"
                />
                <div className="absolute inset-0 bg-gradient-to-t from-[#0a192f] via-transparent to-black/20" />
                <div className="absolute top-4 left-4">
                  <span className="px-3 py-1 rounded-full bg-[#0a192f]/90 text-[#f7e6b5] border border-[#c5a880]/40 text-xs font-mono font-bold uppercase tracking-wider backdrop-blur-md">
                    {inspiringStories[activeStoryIndex].category}
                  </span>
                </div>
                <div className="absolute bottom-4 left-4 right-4 text-white">
                  <span className="text-xs text-slate-300 font-mono block">
                    {inspiringStories[activeStoryIndex].subtitle}
                  </span>
                  <div className="font-serif font-bold text-base text-[#f7e6b5]">
                    {inspiringStories[activeStoryIndex].clientName}
                  </div>
                  <span className="text-[11px] text-slate-400">
                    {inspiringStories[activeStoryIndex].role}
                  </span>
                </div>
              </div>

              {/* Story Narrative & Blueprint Breakdown */}
              <div className="lg:col-span-7 p-6 sm:p-10 flex flex-col justify-between space-y-6">
                <div className="space-y-6">
                  <div>
                    <h3 className="text-xl sm:text-2xl font-bold font-serif text-slate-900 dark:text-white leading-snug">
                      {inspiringStories[activeStoryIndex].title}
                    </h3>
                  </div>

                  {/* Executive Client Quote */}
                  <div className="p-4.5 rounded-2xl bg-slate-50 dark:bg-slate-900/70 border-l-4 border-[#c5a880] border-y border-r border-slate-200/80 dark:border-slate-800 space-y-2">
                    <Quote className="w-5 h-5 text-[#c5a880] opacity-80" />
                    <p className="text-xs sm:text-sm text-slate-700 dark:text-slate-200 italic leading-relaxed">
                      "{inspiringStories[activeStoryIndex].quote}"
                    </p>
                  </div>

                  {/* Metrics Row */}
                  <div className="grid grid-cols-3 gap-3">
                    {inspiringStories[activeStoryIndex].metrics.map((m, idx) => (
                      <div key={idx} className="p-3 rounded-xl bg-slate-50 dark:bg-slate-900/60 border border-slate-200 dark:border-slate-800">
                        <span className="text-[10px] uppercase font-mono text-slate-500 dark:text-slate-400 block">{m.label}</span>
                        <span className="text-xs sm:text-sm font-bold font-mono text-slate-900 dark:text-[#f7e6b5]">{m.value}</span>
                      </div>
                    ))}
                  </div>

                  {/* Blueprint Points */}
                  <div className="space-y-2">
                    <span className="text-xs font-mono font-bold uppercase tracking-wider text-[#8c6d37] dark:text-[#c5a880]">
                      The Strategic Wealth Blueprint
                    </span>
                    <div className="space-y-2">
                      {inspiringStories[activeStoryIndex].blueprint.map((step, idx) => (
                        <div key={idx} className="flex items-start gap-2.5 text-xs text-slate-600 dark:text-slate-300">
                          <CheckCircle2 className="w-4 h-4 text-emerald-500 shrink-0 mt-0.5" />
                          <span>{step}</span>
                        </div>
                      ))}
                    </div>
                  </div>
                </div>

                <div className="pt-4 border-t border-slate-100 dark:border-slate-800 flex flex-col sm:flex-row items-center justify-between gap-4">
                  <div className="flex items-center gap-2 text-xs text-slate-500 dark:text-slate-400">
                    <ShieldCheck className="w-4 h-4 text-emerald-500" />
                    <span>Protected by European &amp; US Statutory Fiduciary Oversight</span>
                  </div>

                  <button
                    onClick={() => {
                      setCurrentView('AUTH_ENROLL');
                      window.scrollTo({ top: 0, behavior: 'smooth' });
                    }}
                    className="w-full sm:w-auto px-6 py-2.5 rounded-xl bg-[#0e2746] dark:bg-[#133257] hover:bg-[#1a4170] text-[#f7e6b5] border border-[#c5a880]/50 font-bold text-xs transition-all flex items-center justify-center gap-2 cursor-pointer shadow-md"
                  >
                    <span>Design Your Wealth Blueprint</span>
                    <ArrowRight className="w-3.5 h-3.5 text-[#c5a880]" />
                  </button>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* 4. HELPFUL INFORMATION: 4 STRATEGIC PILLARS TO BUILD YOUR BEST POSSIBLE FUTURE */}
      <section className="py-16 sm:py-24 max-w-7xl mx-auto px-6 sm:px-8">
        <div className="text-center max-w-3xl mx-auto space-y-3 mb-14">
          <span className="text-xs uppercase font-bold tracking-widest text-[#8c6d37] dark:text-[#c5a880] font-mono">
            Fiduciary Roadmap
          </span>
          <h2 className="text-2xl sm:text-4xl font-bold font-serif text-slate-900 dark:text-white">
            Helpful Information: 4 Steps to Build Your Best Possible Future
          </h2>
          <p className="text-xs sm:text-sm text-slate-600 dark:text-slate-400">
            A practical, structured guide to transitioning from basic commercial banking into sovereign capital preservation, compounding yield, and generational freedom.
          </p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
          {futurePillars.map((p, idx) => {
            const Icon = p.icon;
            return (
              <div
                key={idx}
                className="bg-white dark:bg-[#0a192f] rounded-2xl p-6 border border-slate-200 dark:border-[#1e3656] shadow-xs hover:border-[#c5a880] transition-all flex flex-col justify-between space-y-6"
              >
                <div className="space-y-4">
                  <div className="flex items-center justify-between">
                    <div className="w-12 h-12 rounded-xl bg-[#0a192f] dark:bg-[#112a4a] text-[#d4af37] flex items-center justify-center border border-[#c5a880]/30 shadow-xs">
                      <Icon className="w-5 h-5" />
                    </div>
                    <span className="font-mono text-xl font-bold text-slate-300 dark:text-slate-700">
                      {p.step}
                    </span>
                  </div>
                  <h3 className="text-lg font-bold font-serif text-slate-900 dark:text-white">
                    {p.title}
                  </h3>
                  <p className="text-xs text-slate-600 dark:text-slate-300 leading-relaxed">
                    {p.desc}
                  </p>
                </div>

                <div className="pt-3 border-t border-slate-100 dark:border-slate-800">
                  <span className="inline-flex items-center gap-1.5 text-[11px] font-bold text-[#8c6d37] dark:text-[#c5a880]">
                    <CheckCircle2 className="w-3.5 h-3.5 text-emerald-500" />
                    Standard Protocol
                  </span>
                </div>
              </div>
            );
          })}
        </div>

        {/* 5. INTERACTIVE FUTURE GROWTH & COMPOUNDING CALCULATOR */}
        <div className="mt-12 bg-white dark:bg-[#0a192f] rounded-3xl p-6 sm:p-10 border border-slate-200 dark:border-[#1e3656] shadow-lg">
          <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-center">
            {/* Calculator Controls */}
            <div className="lg:col-span-6 space-y-6">
              <div className="space-y-2">
                <div className="inline-flex items-center gap-2 px-2.5 py-1 rounded-full bg-[#c5a880]/15 text-[#8c6d37] dark:text-[#f7e6b5] text-xs font-mono font-bold uppercase">
                  <TrendingUp className="w-3.5 h-3.5" />
                  <span>Apex Compound Simulator (5.15% APY)</span>
                </div>
                <h3 className="text-xl sm:text-2xl font-bold font-serif text-slate-900 dark:text-white">
                  Simulate Your Sovereign Capital Horizon
                </h3>
                <p className="text-xs text-slate-500 dark:text-slate-400">
                  Estimate the compounding trajectory of your private wealth reserve over your chosen horizon.
                </p>
              </div>

              {/* Slider 1: Initial Deposit */}
              <div className="space-y-2">
                <div className="flex justify-between text-xs font-mono">
                  <span className="text-slate-500 dark:text-slate-400">Initial Reserve Deposit</span>
                  <span className="font-bold text-slate-900 dark:text-white">${initialDeposit.toLocaleString()} USD</span>
                </div>
                <input
                  type="range"
                  min="25000"
                  max="2500000"
                  step="25000"
                  value={initialDeposit}
                  onChange={(e) => setInitialDeposit(Number(e.target.value))}
                  className="w-full h-2 bg-slate-200 dark:bg-slate-800 rounded-lg appearance-none cursor-pointer accent-[#c5a880]"
                />
                <div className="flex justify-between text-[10px] text-slate-400 font-mono">
                  <span>$25,000</span>
                  <span>$1,000,000</span>
                  <span>$2,500,000+</span>
                </div>
              </div>

              {/* Slider 2: Horizon Years */}
              <div className="space-y-2">
                <div className="flex justify-between text-xs font-mono">
                  <span className="text-slate-500 dark:text-slate-400">Time Horizon</span>
                  <span className="font-bold text-slate-900 dark:text-white">{horizonYears} Years ({horizonYears * 12} Months)</span>
                </div>
                <input
                  type="range"
                  min="1"
                  max="20"
                  step="1"
                  value={horizonYears}
                  onChange={(e) => setHorizonYears(Number(e.target.value))}
                  className="w-full h-2 bg-slate-200 dark:bg-slate-800 rounded-lg appearance-none cursor-pointer accent-[#c5a880]"
                />
                <div className="flex justify-between text-[10px] text-slate-400 font-mono">
                  <span>1 Year</span>
                  <span>10 Years</span>
                  <span>20 Years</span>
                </div>
              </div>

              {/* Slider 3: Monthly Allocation */}
              <div className="space-y-2">
                <div className="flex justify-between text-xs font-mono">
                  <span className="text-slate-500 dark:text-slate-400">Monthly Liquidity Inflow</span>
                  <span className="font-bold text-slate-900 dark:text-white">${monthlyContribution.toLocaleString()} /mo</span>
                </div>
                <input
                  type="range"
                  min="0"
                  max="25000"
                  step="1000"
                  value={monthlyContribution}
                  onChange={(e) => setMonthlyContribution(Number(e.target.value))}
                  className="w-full h-2 bg-slate-200 dark:bg-slate-800 rounded-lg appearance-none cursor-pointer accent-[#c5a880]"
                />
                <div className="flex justify-between text-[10px] text-slate-400 font-mono">
                  <span>$0</span>
                  <span>$10,000</span>
                  <span>$25,000</span>
                </div>
              </div>
            </div>

            {/* Projection Display Card */}
            <div className="lg:col-span-6 bg-[#071322] text-white rounded-2xl p-6 sm:p-8 border border-[#c5a880]/40 space-y-6 shadow-xl relative overflow-hidden">
              <div className="absolute top-0 right-0 w-48 h-48 bg-[#c5a880]/10 rounded-full blur-3xl pointer-events-none" />

              <div className="space-y-1">
                <span className="text-xs font-mono uppercase text-[#e5ca95] tracking-wider">
                  Estimated Sovereign Valuation ({horizonYears} Years)
                </span>
                <div className="text-3xl sm:text-4xl font-bold font-mono text-white">
                  ${futureVal.toLocaleString()} <span className="text-xs font-normal text-slate-400">USD</span>
                </div>
                <span className="text-xs text-emerald-400 font-mono block">
                  +${interestEarned.toLocaleString()} in cumulative compound earnings
                </span>
              </div>

              <div className="grid grid-cols-2 gap-3 pt-4 border-t border-slate-800 text-xs font-mono">
                <div className="p-3 rounded-xl bg-slate-900/80 border border-slate-800">
                  <span className="text-slate-400 block text-[10px] uppercase">Total Injected</span>
                  <span className="font-bold text-white text-sm">${totalContributed.toLocaleString()}</span>
                </div>
                <div className="p-3 rounded-xl bg-slate-900/80 border border-slate-800">
                  <span className="text-slate-400 block text-[10px] uppercase">Yield Generated</span>
                  <span className="font-bold text-[#e5ca95] text-sm">+${interestEarned.toLocaleString()}</span>
                </div>
              </div>

              <div className="p-3.5 rounded-xl bg-[#0e2746]/80 border border-[#c5a880]/30 text-xs text-slate-300 space-y-1">
                <div className="flex items-center gap-2 text-[#f7e6b5] font-bold">
                  <Award className="w-4 h-4" />
                  <span>Sovereign Fiduciary Allocation</span>
                </div>
                <p className="text-[11px] leading-relaxed">
                  Your funds compound daily and are protected by multi-jurisdictional statutory deposit guarantees across Frankfurt, Zurich, London, and New York.
                </p>
              </div>

              <button
                id="simulator-open-account-btn"
                onClick={() => {
                  setCurrentView('AUTH_ENROLL');
                  window.scrollTo({ top: 0, behavior: 'smooth' });
                }}
                className="w-full py-3.5 rounded-xl bg-gradient-to-r from-[#c5a880] to-[#b39366] text-slate-950 font-bold text-xs uppercase tracking-wider hover:brightness-105 transition-all flex items-center justify-center gap-2 cursor-pointer shadow-lg"
              >
                <span>Open Apex High-Yield Account</span>
                <ArrowRight className="w-4 h-4" />
              </button>
            </div>
          </div>
        </div>
      </section>

      {/* 6. SHARP, COMPACT TRUST & REGULATORY BADGE STRIP */}
      <section className="py-8 bg-slate-100/70 dark:bg-[#071322] border-t border-slate-200 dark:border-slate-800 transition-colors">
        <div className="max-w-7xl mx-auto px-6 sm:px-8">
          <div className="flex flex-col md:flex-row items-center justify-between gap-4 p-4 rounded-xl bg-white dark:bg-[#0a192f] border border-slate-200 dark:border-[#1e3656] shadow-xs">
            <div className="flex flex-wrap items-center gap-4 sm:gap-6 text-xs">
              <div className="flex items-center gap-2">
                <span className="w-5 h-5 rounded bg-[#00b67a] text-white flex items-center justify-center font-bold text-xs">★</span>
                <span className="font-bold text-slate-800 dark:text-slate-200">Trustpilot 4.9 / 5.0 (2,840+ Reviews)</span>
              </div>
              <div className="hidden sm:block h-3.5 w-px bg-slate-300 dark:bg-slate-700" />
              <div className="flex items-center gap-1.5 text-slate-700 dark:text-slate-300">
                <ShieldCheck className="w-4 h-4 text-emerald-500" />
                <span><strong>ISO 27001 &amp; SOC 2 Type II</strong> Certified</span>
              </div>
              <div className="hidden sm:block h-3.5 w-px bg-slate-300 dark:bg-slate-700" />
              <div className="flex items-center gap-1.5 text-slate-600 dark:text-slate-400">
                <Shield className="w-3.5 h-3.5 text-[#8c6d37] dark:text-[#c5a880]" />
                <span>Full Tier 1 Capital Adequacy</span>
              </div>
            </div>

            <button
              onClick={() => {
                setCurrentView('PUBLIC_SECURITY');
                window.scrollTo({ top: 0, behavior: 'smooth' });
              }}
              className="inline-flex items-center gap-1 text-xs font-bold text-[#8c6d37] dark:text-[#c5a880] hover:text-[#b38f4d] transition-colors cursor-pointer shrink-0"
            >
              <span>Security &amp; Client Reviews</span>
              <ArrowRight className="w-3.5 h-3.5" />
            </button>
          </div>
        </div>
      </section>
    </div>
  );
};
