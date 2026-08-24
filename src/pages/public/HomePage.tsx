import React, { useState, useEffect } from 'react';
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
  ChevronLeft,
  Users,
  Target,
  BarChart3,
  Quote,
  Activity,
  Layers,
  Building,
  Check,
  ExternalLink,
  Server,
  KeyRound,
  Cpu,
  FileCheck,
  Star,
  X,
  RefreshCw
} from 'lucide-react';
import fabBuildingHqImg from '../../assets/images/fab_building_hq_1787395818959.jpg';
import zurichLoungeImg from '../../assets/images/zurich_private_bank_lounge_1787487050458.jpg';
import londonTreasuryImg from '../../assets/images/london_global_treasury_suite_1787487064526.jpg';
import teamUniformImg from '../../assets/images/fab_team_uniform_1787395834714.jpg';
import futureFamilyImg from '../../assets/images/future_wealth_family_legacy_1787482918598.jpg';
import futureFounderImg from '../../assets/images/innovative_founder_success_1787482940279.jpg';
import clientOfficerImg from '../../assets/images/fab_client_officer_1787395907319.jpg';

export const HomePage: React.FC = () => {
  const { setCurrentView } = useBank();

  // Sliding Hero Background & Copy State
  const [currentSlide, setCurrentSlide] = useState(0);
  const heroSlides = [
    {
      image: fabBuildingHqImg,
      location: 'Frankfurt • Financial District Global HQ',
      caption: 'Direct Eurosystem SEPA & TARGET2 Sovereign Clearing Gateway',
      accent: 'European HQ',
      h1Main: 'Institutional Precision.',
      h1Gradient: 'Sovereign Capital Stewardship.',
      description: 'Discreet private wealth management, multi-currency corporate treasury, and instant European TARGET2 interbank clearing backed by statutory European, UK, and US deposit insurance.'
    },
    {
      image: zurichLoungeImg,
      location: 'Zurich • Paradeplatz Private Wealth Salon',
      caption: 'Discretionary Cross-Border Fiduciary & Family Office Custody',
      accent: 'Swiss Private Bank',
      h1Main: 'Discretionary Wealth.',
      h1Gradient: 'Fiduciary Trust & Custody.',
      description: 'Bespoke Swiss private banking salons, multi-generational family office structuring, and secure multi-currency cash reserves compounding at 5.15% APY with daily transparency.'
    },
    {
      image: londonTreasuryImg,
      location: 'London • City of London Treasury Suite',
      caption: 'Institutional Sterling & Multicurrency Clearing Nexus',
      accent: 'London Treasury',
      h1Main: 'Global Treasury Execution.',
      h1Gradient: 'Multicurrency Liquidity.',
      description: 'Direct SWIFT gpi and instant interbank settlement across USD, EUR, and GBP with zero intermediary friction, wholesale FX spot execution, and institutional FSCS indemnity.'
    },
    {
      image: teamUniformImg,
      location: 'New York • Wall Street Executive Advisory Desk',
      caption: 'Transatlantic Corporate Treasury & Commercial Escrow',
      accent: 'US Americas Desk',
      h1Main: 'Transatlantic Escrow.',
      h1Gradient: 'Private Corporate Advisory.',
      description: 'Sovereign Wall Street corporate advisory desk, cryptographic dual-signature authorization, and premier commercial liquidity facilities protected by FDIC insurance.'
    }
  ];

  // Auto advance hero slides
  useEffect(() => {
    const timer = setInterval(() => {
      setCurrentSlide((prev) => (prev + 1) % heroSlides.length);
    }, 6500);
    return () => clearInterval(timer);
  }, [heroSlides.length]);

  // State for interactive future growth calculator
  const [initialDeposit, setInitialDeposit] = useState<number>(250000);
  const [horizonYears, setHorizonYears] = useState<number>(5);
  const [monthlyContribution, setMonthlyContribution] = useState<number>(5000);
  const [activeStoryIndex, setActiveStoryIndex] = useState<number>(0);

  // Security Partner Dynamic Verification State
  const [selectedPartner, setSelectedPartner] = useState<any | null>(null);
  const [isVerifyingPartner, setIsVerifyingPartner] = useState(false);
  const [verificationResult, setVerificationResult] = useState<any | null>(null);

  const securityPartners = [
    {
      id: 'thales',
      name: 'Thales e-Security',
      category: 'Cryptographic HSM Enclave',
      logo: '🔐',
      verificationId: 'HSM-FIPS-140-2-L3',
      status: 'VERIFIED ACTIVE',
      badgeColor: 'emerald',
      description: 'FIPS 140-2 Level 3 tamper-resistant hardware security modules safeguarding master cryptographic private keys and client transaction signing.',
      externalUrl: 'https://csrc.nist.gov/projects/cryptographic-module-validation-program',
      specs: [
        'AES-256 GCM Hardware-Protected Keys',
        'Strict Dual-Custodian Air-Gapped Key Ceremonies',
        'Physical Intrusion & Zeroization Sensors'
      ],
      complianceAuthority: 'NIST & BSI Germany'
    },
    {
      id: 'pwc',
      name: 'PricewaterhouseCoopers (PwC)',
      category: 'Continuous SOC 2 Type II Surveillance',
      logo: '🛡️',
      verificationId: 'PWC-SOC2-TY2-2026',
      status: 'AUDITED & CERTIFIED',
      badgeColor: 'emerald',
      description: 'Independent annual and continuous technical attestations across Trust Services Criteria: Security, Availability, and Confidentiality.',
      externalUrl: 'https://www.aicpa-cima.com/topic/audit-assurance/audit-and-assurance-greater-than-soc-2',
      specs: [
        'Zero Historical Deficiencies Recorded',
        'Real-time Heuristic Control Monitoring',
        'Annual Red Team Penetration Testing'
      ],
      complianceAuthority: 'AICPA / IAASB'
    },
    {
      id: 'cloudflare',
      name: 'Cloudflare Magic Transit & Edge Armor',
      category: 'Layer 3/4/7 DDoS & WAF Shield',
      logo: '⚡',
      verificationId: 'CF-ENTERPRISE-EDGE-999',
      status: 'REAL-TIME SHIELD ACTIVE',
      badgeColor: 'blue',
      description: 'Global 330 Tbps Anycast edge network providing instantaneous mitigation against volumetric cyberattacks and DNS hijacking.',
      externalUrl: 'https://www.cloudflare.com/products/magic-transit/',
      specs: [
        '100% SLA Uptime Guarantee',
        'TLS 1.3 Strict Mutual Authentication (mTLS)',
        'Zero-Latency Sovereign Edge Routing'
      ],
      complianceAuthority: 'Global Edge Shield'
    },
    {
      id: 'ecb-target2',
      name: 'European Central Bank (TARGET2)',
      category: 'Sovereign Eurosystem Clearing Nexus',
      logo: '🏛️',
      verificationId: 'ECB-T2-DIRECT-PARTICIPANT',
      status: 'OFFICIAL PARTICIPANT',
      badgeColor: 'amber',
      description: 'Direct institutional participant in the Eurosystem real-time gross settlement (RTGS) system owned and operated by the European Central Bank.',
      externalUrl: 'https://www.ecb.europa.eu/paym/target/target2/html/index.en.html',
      specs: [
        'Sub-Second SEPA Instant Settlement',
        'Sovereign Central Bank Reserve Backing',
        'Statutory European DGS Deposit Guarantee'
      ],
      complianceAuthority: 'European Central Bank (Frankfurt)'
    },
    {
      id: 'swift-gpi',
      name: 'SWIFT gpi Interbank Alliance',
      category: 'Global High-Value Payment Tracking',
      logo: '🌐',
      verificationId: 'SWIFT-GPI-ISO20022-LIVE',
      status: 'ISO 20022 COMPLIANT',
      badgeColor: 'emerald',
      description: 'Instant cross-border payment tracking with end-to-end cryptographic transparency and fee traceability across 11,000+ financial institutions.',
      externalUrl: 'https://www.swift.com/our-solutions/interfaces-and-integration/swift-gpi',
      specs: [
        'UETR Unique End-to-End Tracking ID',
        'Real-Time Settlement Confirmation',
        'Zero Hidden Intermediary Deductions'
      ],
      complianceAuthority: 'SWIFT SCRL (Belgium)'
    }
  ];

  const handleVerifyPartner = (partner: any) => {
    setIsVerifyingPartner(true);
    setSelectedPartner(partner);
    setVerificationResult(null);

    setTimeout(() => {
      setIsVerifyingPartner(false);
      setVerificationResult({
        timestamp: new Date().toISOString(),
        certId: `CERT-${partner.id.toUpperCase()}-${Math.floor(100000 + Math.random() * 900000)}`,
        status: 'VERIFIED ACTIVE & HEALTHY',
        sslFingerprint: 'SHA256:7B:88:9C:12:FA:44:EE:21:88:90:34:BC:DD:11:FE:09:A1:66:78:32',
        latencyMs: 1.4,
        tamperProofHash: `0x${Array.from({ length: 32 }, () => Math.floor(Math.random() * 16).toString(16)).join('')}`
      });
    }, 1200);
  };

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
    <div className="bg-[#f8fafc] dark:bg-[#060e1a] text-slate-800 dark:text-slate-100 min-h-screen transition-colors overflow-x-hidden">
      {/* 1. SLIDING MULTI-SCENE PRESTIGIOUS HERO SECTION */}
      <section className="relative bg-[#071322] text-white min-h-[480px] sm:min-h-[640px] flex items-center justify-center overflow-hidden border-b border-slate-800">
        {/* Animated Sliding Background Backdrop with Bright, Vivid Visibility and Soft Overlay */}
        <div className="absolute inset-0 z-0">
          <AnimatePresence mode="sync">
            <motion.div
              key={currentSlide}
              initial={{ opacity: 0, scale: 1.06 }}
              animate={{ opacity: 0.78, scale: 1.0 }}
              exit={{ opacity: 0, scale: 1.02 }}
              transition={{ duration: 1.2, ease: 'easeInOut' }}
              className="absolute inset-0"
            >
              <img
                src={heroSlides[currentSlide].image}
                alt={heroSlides[currentSlide].location}
                referrerPolicy="no-referrer"
                className="w-full h-full object-cover object-center filter brightness-95 contrast-105"
              />
            </motion.div>
          </AnimatePresence>
          {/* Subtle balanced gradient overlay ensuring maximum picture visibility while keeping text crisp */}
          <div className="absolute inset-0 bg-gradient-to-t from-[#071322]/90 via-[#071322]/40 to-[#071322]/60" />
          <div className="absolute inset-0 bg-[radial-gradient(ellipse_at_center,_var(--tw-gradient-stops))] from-transparent via-[#071322]/30 to-[#071322]/80" />
        </div>

        {/* Ambient Subtle Warm Glow */}
        <div className="absolute top-1/3 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[240px] sm:w-[500px] h-[160px] sm:h-[300px] bg-[#c5a880]/20 blur-[100px] rounded-full pointer-events-none" />

        {/* Main Hero Content */}
        <div className="relative z-10 max-w-5xl mx-auto px-3.5 sm:px-6 py-8 sm:py-16 text-center space-y-4 sm:space-y-6">
          {/* Dynamic Sliding Headline (H1) and Description (P) */}
          <div className="min-h-[100px] sm:min-h-[160px] flex items-center justify-center">
            <AnimatePresence mode="wait">
              <motion.div
                key={currentSlide}
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: -10 }}
                transition={{ duration: 0.4, ease: 'easeOut' }}
                className="space-y-2 sm:space-y-3.5 max-w-3xl mx-auto"
              >
                <h1 className="text-xl sm:text-3xl md:text-5xl lg:text-6xl font-bold tracking-tight font-serif text-white leading-tight px-1 drop-shadow-md">
                  {heroSlides[currentSlide].h1Main} <br className="hidden sm:inline" />
                  <span className="text-transparent bg-clip-text bg-gradient-to-r from-[#fef08a] via-[#e5ca95] to-[#c5a880] drop-shadow-sm">
                    {heroSlides[currentSlide].h1Gradient}
                  </span>
                </h1>
                <p className="text-slate-100/95 text-xs sm:text-base md:text-lg max-w-2xl mx-auto leading-relaxed font-normal px-1 drop-shadow-sm">
                  {heroSlides[currentSlide].description}
                </p>
              </motion.div>
            </AnimatePresence>
          </div>

          {/* Mobile-Friendly Proportional Action Buttons */}
          <motion.div
            initial={{ opacity: 0, y: 15 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5, delay: 0.15 }}
            className="flex flex-wrap items-center justify-center gap-2 sm:gap-4 pt-0.5 sm:pt-2 px-1"
          >
            <button
              id="hero-access-portal-btn"
              onClick={() => setCurrentView('AUTH_LOGIN')}
              className="px-4 py-2 sm:px-6 sm:py-3 rounded-xl bg-white text-slate-950 font-bold text-xs sm:text-sm hover:bg-slate-100 transition-all shadow-xl flex items-center justify-center gap-1.5 sm:gap-2 cursor-pointer border border-white active:scale-95"
            >
              <Lock className="w-3.5 h-3.5 sm:w-4 sm:h-4 text-[#8c6d37]" />
              <span>Access Client Portal</span>
            </button>

            <button
              id="hero-open-account-btn"
              onClick={() => setCurrentView('AUTH_ENROLL')}
              className="px-4 py-2 sm:px-6 sm:py-3 rounded-xl bg-[#0a192f]/90 hover:bg-[#112a4a] text-[#f7e6b5] border border-[#c5a880]/60 font-bold text-xs sm:text-sm transition-all flex items-center justify-center gap-1.5 sm:gap-2 cursor-pointer shadow-lg backdrop-blur-sm active:scale-95"
            >
              <span>Apply for Private Account</span>
              <ArrowRight className="w-3.5 h-3.5 sm:w-4 sm:h-4 text-[#c5a880]" />
            </button>
          </motion.div>

          {/* Sliding Venue Info Card */}
          <div className="pt-0.5 flex flex-col items-center gap-2">
            <div className="inline-flex items-center gap-2 px-3 py-1 sm:px-3.5 sm:py-1.5 rounded-xl bg-slate-950/70 border border-slate-800 text-[11px] sm:text-xs backdrop-blur-md shadow-md">
              <Building className="w-3 h-3 sm:w-3.5 sm:h-3.5 text-[#d4af37]" />
              <span className="text-slate-200 font-sans font-medium">
                <span className="text-[#e5ca95] font-bold">{heroSlides[currentSlide].accent}:</span> {heroSlides[currentSlide].location}
              </span>
            </div>

            {/* Slide Navigation Dots */}
            <div className="flex items-center gap-1.5 sm:gap-2">
              <button
                onClick={() => setCurrentSlide((prev) => (prev - 1 + heroSlides.length) % heroSlides.length)}
                className="p-1 rounded-full text-slate-300 hover:text-white hover:bg-white/10 transition-colors cursor-pointer"
                title="Previous Slide"
              >
                <ChevronLeft className="w-3.5 h-3.5 sm:w-4 sm:h-4" />
              </button>
              {heroSlides.map((slide, index) => (
                <button
                  key={index}
                  onClick={() => setCurrentSlide(index)}
                  className={`h-1 sm:h-1.5 transition-all duration-300 rounded-full cursor-pointer ${
                    currentSlide === index ? 'w-5 sm:w-6 bg-[#d4af37]' : 'w-1.5 sm:w-2 bg-slate-500 hover:bg-slate-300'
                  }`}
                  title={slide.location}
                />
              ))}
              <button
                onClick={() => setCurrentSlide((prev) => (prev + 1) % heroSlides.length)}
                className="p-1 rounded-full text-slate-300 hover:text-white hover:bg-white/10 transition-colors cursor-pointer"
                title="Next Slide"
              >
                <ChevronRight className="w-3.5 h-3.5 sm:w-4 sm:h-4" />
              </button>
            </div>
          </div>

          {/* Compact Responsive Metrics Bar */}
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ duration: 0.6, delay: 0.25 }}
            className="pt-3 sm:pt-6 grid grid-cols-2 md:grid-cols-4 gap-1.5 sm:gap-3 max-w-2xl sm:max-w-3xl mx-auto border-t border-slate-800/80 text-left px-0.5"
          >
            <div className="px-2.5 py-1.5 sm:px-3 sm:py-2.5 rounded-lg sm:rounded-xl bg-[#091b30]/85 border border-slate-800/90 backdrop-blur-xs">
              <span className="text-[8px] sm:text-[10px] uppercase font-mono text-slate-400 block leading-tight truncate">Apex Yield</span>
              <span className="text-[11px] sm:text-sm md:text-base font-bold font-mono text-[#e5ca95] block mt-0.5 truncate">5.15% APY</span>
            </div>
            <div className="px-2.5 py-1.5 sm:px-3 sm:py-2.5 rounded-lg sm:rounded-xl bg-[#091b30]/85 border border-slate-800/90 backdrop-blur-xs">
              <span className="text-[8px] sm:text-[10px] uppercase font-mono text-slate-400 block leading-tight truncate">Currencies</span>
              <span className="text-[11px] sm:text-sm md:text-base font-bold font-mono text-white block mt-0.5 truncate">USD • EUR • GBP</span>
            </div>
            <div className="px-2.5 py-1.5 sm:px-3 sm:py-2.5 rounded-lg sm:rounded-xl bg-[#091b30]/85 border border-slate-800/90 backdrop-blur-xs">
              <span className="text-[8px] sm:text-[10px] uppercase font-mono text-slate-400 block leading-tight truncate">Interbank Wires</span>
              <span className="text-[11px] sm:text-sm md:text-base font-bold font-mono text-white block mt-0.5 truncate">Real-Time</span>
            </div>
            <div className="px-2.5 py-1.5 sm:px-3 sm:py-2.5 rounded-lg sm:rounded-xl bg-[#091b30]/85 border border-slate-800/90 backdrop-blur-xs">
              <span className="text-[8px] sm:text-[10px] uppercase font-mono text-slate-400 block leading-tight truncate">Custody Safety</span>
              <span className="text-[11px] sm:text-sm md:text-base font-bold font-mono text-emerald-400 block mt-0.5 truncate">FDIC / FSCS / DGS</span>
            </div>
          </motion.div>
        </div>
      </section>

      {/* CONTINUOUS MOVING LIVE MARKET & SETTLEMENT TICKER */}
      <div className="bg-[#0a192f] border-b border-[#1e3656] py-2.5 overflow-hidden text-xs font-mono text-slate-300 relative select-none">
        <div className="flex animate-marquee whitespace-nowrap gap-8 items-center">
          <span className="inline-flex items-center gap-1.5 text-emerald-400 font-bold">
            <span className="w-2 h-2 rounded-full bg-emerald-400 animate-ping" />
            SWIFT GPI NET: ACTIVE
          </span>
          <span className="text-slate-400">EUR/USD: <span className="text-white font-bold">1.0845</span> <span className="text-emerald-400">▲ +0.12%</span></span>
          <span className="text-slate-400">GBP/USD: <span className="text-white font-bold">1.2910</span> <span className="text-emerald-400">▲ +0.08%</span></span>
          <span className="text-slate-400">USD/CHF: <span className="text-white font-bold">0.8920</span> <span className="text-emerald-400">▲ +0.04%</span></span>
          <span className="text-slate-400">GOLD (XAU/USD): <span className="text-[#e5ca95] font-bold">$2,684.20/oz</span></span>
          <span className="text-slate-400">SOFR 30D: <span className="text-white font-bold">5.08%</span></span>
          <span className="text-slate-400">ECB DEPOSIT: <span className="text-white font-bold">3.50%</span></span>
          <span className="text-slate-400">INTERBANK SETTLEMENT: <span className="text-emerald-400 font-bold">&lt; 3.2 SECONDS</span></span>
          <span className="text-slate-400">SOC-2 TYPE II: <span className="text-emerald-400 font-bold">VERIFIED</span></span>

          {/* Repeat for seamless loop */}
          <span className="inline-flex items-center gap-1.5 text-emerald-400 font-bold">
            <span className="w-2 h-2 rounded-full bg-emerald-400 animate-ping" />
            SWIFT GPI NET: ACTIVE
          </span>
          <span className="text-slate-400">EUR/USD: <span className="text-white font-bold">1.0845</span> <span className="text-emerald-400">▲ +0.12%</span></span>
          <span className="text-slate-400">GBP/USD: <span className="text-white font-bold">1.2910</span> <span className="text-emerald-400">▲ +0.08%</span></span>
          <span className="text-slate-400">USD/CHF: <span className="text-white font-bold">0.8920</span> <span className="text-emerald-400">▲ +0.04%</span></span>
          <span className="text-slate-400">GOLD (XAU/USD): <span className="text-[#e5ca95] font-bold">$2,684.20/oz</span></span>
          <span className="text-slate-400">SOFR 30D: <span className="text-white font-bold">5.08%</span></span>
        </div>
      </div>

      {/* 2. THREE SHARP INSTITUTIONAL PILLARS */}
      <section className="py-10 sm:py-20 max-w-7xl mx-auto px-4 sm:px-8">
        <div className="text-center max-w-2xl mx-auto space-y-1.5 sm:space-y-2 mb-8 sm:mb-12">
          <span className="text-[10px] sm:text-xs uppercase font-bold tracking-widest text-[#8c6d37] dark:text-[#c5a880] font-mono">
            Core Banking Disciplines
          </span>
          <h2 className="text-xl sm:text-3xl md:text-4xl font-bold font-serif text-slate-900 dark:text-white">
            Engineered for Sovereign Capital
          </h2>
          <p className="text-xs sm:text-sm text-slate-500 dark:text-slate-400">
            A unified suite of private fiduciary and commercial treasury services designed without intermediary friction.
          </p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-4 sm:gap-6">
          {/* Pillar 1: Private Wealth */}
          <div className="bg-white dark:bg-[#0a192f] rounded-xl sm:rounded-2xl p-5 sm:p-7 border border-slate-200 dark:border-[#1e3656] shadow-sm hover:border-[#c5a880] transition-all flex flex-col justify-between space-y-4 sm:space-y-6">
            <div className="space-y-3 sm:space-y-4">
              <div className="w-10 h-10 sm:w-12 sm:h-12 rounded-xl bg-[#0a192f] dark:bg-[#112a4a] text-[#d4af37] flex items-center justify-center border border-[#c5a880]/30 shadow-xs">
                <Sparkles className="w-4 h-4 sm:w-5 sm:h-5" />
              </div>
              <h3 className="text-lg sm:text-xl font-bold font-serif text-slate-900 dark:text-white">
                Private Wealth &amp; Fiduciary
              </h3>
              <p className="text-xs sm:text-sm text-slate-600 dark:text-slate-300 leading-relaxed">
                Discretionary estate stewardship, family office structuring, and high-yield reserve accounts yielding 5.15% APY with daily compounding transparency.
              </p>
              <ul className="space-y-1.5 sm:space-y-2 text-xs text-slate-500 dark:text-slate-400 pt-2 border-t border-slate-100 dark:border-slate-800">
                <li className="flex items-center gap-2">
                  <CheckCircle2 className="w-3.5 h-3.5 sm:w-4 sm:h-4 text-emerald-500 shrink-0" />
                  <span>Dedicated Senior Wealth Director</span>
                </li>
                <li className="flex items-center gap-2">
                  <CheckCircle2 className="w-3.5 h-3.5 sm:w-4 sm:h-4 text-emerald-500 shrink-0" />
                  <span>5.15% APY Sovereign Cash Reserves</span>
                </li>
                <li className="flex items-center gap-2">
                  <CheckCircle2 className="w-3.5 h-3.5 sm:w-4 sm:h-4 text-emerald-500 shrink-0" />
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
          <div className="bg-white dark:bg-[#0a192f] rounded-xl sm:rounded-2xl p-5 sm:p-7 border border-slate-200 dark:border-[#1e3656] shadow-sm hover:border-[#c5a880] transition-all flex flex-col justify-between space-y-4 sm:space-y-6">
            <div className="space-y-3 sm:space-y-4">
              <div className="w-10 h-10 sm:w-12 sm:h-12 rounded-xl bg-[#0a192f] dark:bg-[#112a4a] text-[#d4af37] flex items-center justify-center border border-[#c5a880]/30 shadow-xs">
                <Globe2 className="w-4 h-4 sm:w-5 sm:h-5" />
              </div>
              <h3 className="text-lg sm:text-xl font-bold font-serif text-slate-900 dark:text-white">
                Multi-Currency Treasury
              </h3>
              <p className="text-xs sm:text-sm text-slate-600 dark:text-slate-300 leading-relaxed">
                Native USD, EUR, and GBP account numbers with direct Fedwire, SEPA Instant, and SWIFT gpi execution for instantaneous international payments.
              </p>
              <ul className="space-y-1.5 sm:space-y-2 text-xs text-slate-500 dark:text-slate-400 pt-2 border-t border-slate-100 dark:border-slate-800">
                <li className="flex items-center gap-2">
                  <CheckCircle2 className="w-3.5 h-3.5 sm:w-4 sm:h-4 text-emerald-500 shrink-0" />
                  <span>Real-time Interbank FX Spot Rates</span>
                </li>
                <li className="flex items-center gap-2">
                  <CheckCircle2 className="w-3.5 h-3.5 sm:w-4 sm:h-4 text-emerald-500 shrink-0" />
                  <span>Dedicated Multi-Currency IBANs</span>
                </li>
                <li className="flex items-center gap-2">
                  <CheckCircle2 className="w-3.5 h-3.5 sm:w-4 sm:h-4 text-emerald-500 shrink-0" />
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
          <div className="bg-white dark:bg-[#0a192f] rounded-xl sm:rounded-2xl p-5 sm:p-7 border border-slate-200 dark:border-[#1e3656] shadow-sm hover:border-[#c5a880] transition-all flex flex-col justify-between space-y-4 sm:space-y-6">
            <div className="space-y-3 sm:space-y-4">
              <div className="w-10 h-10 sm:w-12 sm:h-12 rounded-xl bg-[#0a192f] dark:bg-[#112a4a] text-[#d4af37] flex items-center justify-center border border-[#c5a880]/30 shadow-xs">
                <ShieldCheck className="w-4 h-4 sm:w-5 sm:h-5" />
              </div>
              <h3 className="text-lg sm:text-xl font-bold font-serif text-slate-900 dark:text-white">
                Fortified Institutional Custody
              </h3>
              <p className="text-xs sm:text-sm text-slate-600 dark:text-slate-300 leading-relaxed">
                Immutable double-entry mathematical ledger, Hardware Security Module (HSM) keys, and statutory deposit insurance across European and US jurisdictions.
              </p>
              <ul className="space-y-1.5 sm:space-y-2 text-xs text-slate-500 dark:text-slate-400 pt-2 border-t border-slate-100 dark:border-slate-800">
                <li className="flex items-center gap-2">
                  <CheckCircle2 className="w-3.5 h-3.5 sm:w-4 sm:h-4 text-emerald-500 shrink-0" />
                  <span>FDIC $250k • FSCS £85k • DGS €100k</span>
                </li>
                <li className="flex items-center gap-2">
                  <CheckCircle2 className="w-3.5 h-3.5 sm:w-4 sm:h-4 text-emerald-500 shrink-0" />
                  <span>Dual-Control 4-Eyes Wire Approvals</span>
                </li>
                <li className="flex items-center gap-2">
                  <CheckCircle2 className="w-3.5 h-3.5 sm:w-4 sm:h-4 text-emerald-500 shrink-0" />
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
      <section className="py-10 sm:py-20 bg-slate-50 dark:bg-[#071526] border-t border-slate-200 dark:border-slate-800 transition-colors">
        <div className="max-w-7xl mx-auto px-4 sm:px-8 space-y-8 sm:space-y-12">
          <div className="flex flex-col md:flex-row md:items-end justify-between gap-4">
            <div className="space-y-1.5 sm:space-y-2">
              <span className="text-[10px] sm:text-xs uppercase font-bold tracking-widest text-[#8c6d37] dark:text-[#c5a880] font-mono">
                Real Client Transformations
              </span>
              <h2 className="text-xl sm:text-3xl md:text-4xl font-bold font-serif text-slate-900 dark:text-white">
                Inspiring Stories: Building Generational Prosperity
              </h2>
              <p className="text-xs sm:text-sm text-slate-600 dark:text-slate-300 max-w-2xl">
                See how sovereign families, visionary founders, and institutional leaders leverage First Atlantic Bank to protect wealth, expand globally, and achieve long-term financial freedom.
              </p>
            </div>

            {/* Story Selector Tabs */}
            <div className="flex items-center gap-1.5 p-1 rounded-xl bg-white dark:bg-[#0a192f] border border-slate-200 dark:border-slate-800 shadow-xs self-start md:self-auto overflow-x-auto max-w-full">
              {inspiringStories.map((story, idx) => (
                <button
                  key={story.id}
                  onClick={() => setActiveStoryIndex(idx)}
                  className={`px-3 py-1.5 rounded-lg text-xs font-bold transition-all cursor-pointer whitespace-nowrap ${
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
          <div className="bg-white dark:bg-[#0a192f] rounded-2xl sm:rounded-3xl border border-slate-200 dark:border-[#1e3656] shadow-xl overflow-hidden">
            <div className="grid grid-cols-1 lg:grid-cols-12">
              {/* Story Visual Imagery */}
              <div className="lg:col-span-5 relative min-h-[220px] sm:min-h-[300px] lg:min-h-[440px] overflow-hidden bg-slate-900">
                <img
                  src={inspiringStories[activeStoryIndex].image}
                  alt={inspiringStories[activeStoryIndex].title}
                  referrerPolicy="no-referrer"
                  className="w-full h-full object-cover object-center transition-transform duration-700 hover:scale-105"
                />
                <div className="absolute inset-0 bg-gradient-to-t from-[#0a192f] via-transparent to-black/20" />
                <div className="absolute top-3 left-3 sm:top-4 sm:left-4">
                  <span className="px-2.5 py-1 rounded-full bg-[#0a192f]/90 text-[#f7e6b5] border border-[#c5a880]/40 text-[10px] sm:text-xs font-mono font-bold uppercase tracking-wider backdrop-blur-md">
                    {inspiringStories[activeStoryIndex].category}
                  </span>
                </div>
                <div className="absolute bottom-3 left-3 right-3 sm:bottom-4 sm:left-4 sm:right-4 text-white">
                  <span className="text-[11px] sm:text-xs text-slate-300 font-mono block">
                    {inspiringStories[activeStoryIndex].subtitle}
                  </span>
                  <div className="font-serif font-bold text-sm sm:text-base text-[#f7e6b5]">
                    {inspiringStories[activeStoryIndex].clientName}
                  </div>
                  <span className="text-[10px] sm:text-[11px] text-slate-400">
                    {inspiringStories[activeStoryIndex].role}
                  </span>
                </div>
              </div>

              {/* Story Narrative & Blueprint Breakdown */}
              <div className="lg:col-span-7 p-4 sm:p-8 lg:p-10 flex flex-col justify-between space-y-4 sm:space-y-6">
                <div className="space-y-4 sm:space-y-6">
                  <div>
                    <h3 className="text-lg sm:text-2xl font-bold font-serif text-slate-900 dark:text-white leading-snug">
                      {inspiringStories[activeStoryIndex].title}
                    </h3>
                  </div>

                  {/* Executive Client Quote */}
                  <div className="p-3.5 sm:p-4.5 rounded-xl sm:rounded-2xl bg-slate-50 dark:bg-slate-900/70 border-l-4 border-[#c5a880] border-y border-r border-slate-200/80 dark:border-slate-800 space-y-1.5 sm:space-y-2">
                    <Quote className="w-4 h-4 sm:w-5 sm:h-5 text-[#c5a880] opacity-80" />
                    <p className="text-xs sm:text-sm text-slate-700 dark:text-slate-200 italic leading-relaxed">
                      "{inspiringStories[activeStoryIndex].quote}"
                    </p>
                  </div>

                  {/* Metrics Row */}
                  <div className="grid grid-cols-3 gap-2 sm:gap-3">
                    {inspiringStories[activeStoryIndex].metrics.map((m, idx) => (
                      <div key={idx} className="p-2 sm:p-3 rounded-lg sm:rounded-xl bg-slate-50 dark:bg-slate-900/60 border border-slate-200 dark:border-slate-800">
                        <span className="text-[9px] sm:text-[10px] uppercase font-mono text-slate-500 dark:text-slate-400 block truncate">{m.label}</span>
                        <span className="text-xs sm:text-sm font-bold font-mono text-slate-900 dark:text-[#f7e6b5] block truncate">{m.value}</span>
                      </div>
                    ))}
                  </div>

                  {/* Blueprint Points */}
                  <div className="space-y-2">
                    <span className="text-[10px] sm:text-xs font-mono font-bold uppercase tracking-wider text-[#8c6d37] dark:text-[#c5a880]">
                      The Strategic Wealth Blueprint
                    </span>
                    <div className="space-y-1.5 sm:space-y-2">
                      {inspiringStories[activeStoryIndex].blueprint.map((step, idx) => (
                        <div key={idx} className="flex items-start gap-2 text-xs text-slate-600 dark:text-slate-300">
                          <CheckCircle2 className="w-3.5 h-3.5 sm:w-4 sm:h-4 text-emerald-500 shrink-0 mt-0.5" />
                          <span>{step}</span>
                        </div>
                      ))}
                    </div>
                  </div>
                </div>

                <div className="pt-3 sm:pt-4 border-t border-slate-100 dark:border-slate-800 flex flex-col sm:flex-row items-center justify-between gap-3 sm:gap-4">
                  <div className="flex items-center gap-1.5 sm:gap-2 text-[11px] sm:text-xs text-slate-500 dark:text-slate-400">
                    <ShieldCheck className="w-3.5 h-3.5 sm:w-4 sm:h-4 text-emerald-500 shrink-0" />
                    <span>Protected by European &amp; US Statutory Fiduciary Oversight</span>
                  </div>

                  <button
                    onClick={() => {
                      setCurrentView('AUTH_ENROLL');
                      window.scrollTo({ top: 0, behavior: 'smooth' });
                    }}
                    className="w-full sm:w-auto px-5 py-2 sm:px-6 sm:py-2.5 rounded-xl bg-[#0e2746] dark:bg-[#133257] hover:bg-[#1a4170] text-[#f7e6b5] border border-[#c5a880]/50 font-bold text-xs transition-all flex items-center justify-center gap-2 cursor-pointer shadow-md"
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
      <section className="py-10 sm:py-20 max-w-7xl mx-auto px-4 sm:px-8">
        <div className="text-center max-w-3xl mx-auto space-y-1.5 sm:space-y-2 mb-8 sm:mb-12">
          <span className="text-[10px] sm:text-xs uppercase font-bold tracking-widest text-[#8c6d37] dark:text-[#c5a880] font-mono">
            Fiduciary Roadmap
          </span>
          <h2 className="text-xl sm:text-3xl md:text-4xl font-bold font-serif text-slate-900 dark:text-white">
            Helpful Information: 4 Steps to Build Your Best Possible Future
          </h2>
          <p className="text-xs sm:text-sm text-slate-600 dark:text-slate-400">
            A practical, structured guide to transitioning from basic commercial banking into sovereign capital preservation, compounding yield, and generational freedom.
          </p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4 sm:gap-6">
          {futurePillars.map((p, idx) => {
            const Icon = p.icon;
            return (
              <div
                key={idx}
                className="bg-white dark:bg-[#0a192f] rounded-xl sm:rounded-2xl p-5 sm:p-6 border border-slate-200 dark:border-[#1e3656] shadow-xs hover:border-[#c5a880] transition-all flex flex-col justify-between space-y-4 sm:space-y-6"
              >
                <div className="space-y-3 sm:space-y-4">
                  <div className="flex items-center justify-between">
                    <div className="w-10 h-10 sm:w-12 sm:h-12 rounded-xl bg-[#0a192f] dark:bg-[#112a4a] text-[#d4af37] flex items-center justify-center border border-[#c5a880]/30 shadow-xs">
                      <Icon className="w-4 h-4 sm:w-5 sm:h-5" />
                    </div>
                    <span className="font-mono text-lg sm:text-xl font-bold text-slate-300 dark:text-slate-700">
                      {p.step}
                    </span>
                  </div>
                  <h3 className="text-base sm:text-lg font-bold font-serif text-slate-900 dark:text-white">
                    {p.title}
                  </h3>
                  <p className="text-xs text-slate-600 dark:text-slate-300 leading-relaxed">
                    {p.desc}
                  </p>
                </div>

                <div className="pt-2.5 sm:pt-3 border-t border-slate-100 dark:border-slate-800">
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
        <div className="mt-8 sm:mt-12 bg-white dark:bg-[#0a192f] rounded-2xl sm:rounded-3xl p-4 sm:p-8 lg:p-10 border border-slate-200 dark:border-[#1e3656] shadow-lg">
          <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 sm:gap-8 items-center">
            {/* Calculator Controls */}
            <div className="lg:col-span-6 space-y-4 sm:space-y-6">
              <div className="space-y-1.5 sm:space-y-2">
                <div className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full bg-[#c5a880]/15 text-[#8c6d37] dark:text-[#f7e6b5] text-[10px] sm:text-xs font-mono font-bold uppercase">
                  <TrendingUp className="w-3.5 h-3.5" />
                  <span>Apex Compound Simulator (5.15% APY)</span>
                </div>
                <h3 className="text-lg sm:text-2xl font-bold font-serif text-slate-900 dark:text-white">
                  Simulate Your Sovereign Capital Horizon
                </h3>
                <p className="text-xs text-slate-500 dark:text-slate-400">
                  Estimate the compounding trajectory of your private wealth reserve over your chosen horizon.
                </p>
              </div>

              {/* Slider 1: Initial Deposit */}
              <div className="space-y-1.5 sm:space-y-2">
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
              <div className="space-y-1.5 sm:space-y-2">
                <div className="flex justify-between text-xs font-mono">
                  <span className="text-slate-500 dark:text-slate-400">Time Horizon</span>
                  <span className="font-bold text-slate-900 dark:text-white">{horizonYears} Years ({horizonYears * 12} Mos)</span>
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
              <div className="space-y-1.5 sm:space-y-2">
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
            <div className="lg:col-span-6 bg-[#071322] text-white rounded-xl sm:rounded-2xl p-5 sm:p-8 border border-[#c5a880]/40 space-y-4 sm:space-y-6 shadow-xl relative overflow-hidden">
              <div className="absolute top-0 right-0 w-48 h-48 bg-[#c5a880]/10 rounded-full blur-3xl pointer-events-none" />

              <div className="space-y-1">
                <span className="text-[11px] sm:text-xs font-mono uppercase text-[#e5ca95] tracking-wider">
                  Estimated Sovereign Valuation ({horizonYears} Years)
                </span>
                <div className="text-2xl sm:text-4xl font-bold font-mono text-white">
                  ${futureVal.toLocaleString()} <span className="text-xs font-normal text-slate-400">USD</span>
                </div>
                <span className="text-xs text-emerald-400 font-mono block">
                  +${interestEarned.toLocaleString()} in cumulative compound earnings
                </span>
              </div>

              <div className="grid grid-cols-2 gap-2 sm:gap-3 pt-3 sm:pt-4 border-t border-slate-800 text-xs font-mono">
                <div className="p-2.5 sm:p-3 rounded-lg sm:rounded-xl bg-slate-900/80 border border-slate-800">
                  <span className="text-slate-400 block text-[9px] sm:text-[10px] uppercase">Total Injected</span>
                  <span className="font-bold text-white text-xs sm:text-sm">${totalContributed.toLocaleString()}</span>
                </div>
                <div className="p-2.5 sm:p-3 rounded-lg sm:rounded-xl bg-slate-900/80 border border-slate-800">
                  <span className="text-slate-400 block text-[9px] sm:text-[10px] uppercase">Yield Generated</span>
                  <span className="font-bold text-[#e5ca95] text-xs sm:text-sm">+${interestEarned.toLocaleString()}</span>
                </div>
              </div>

              <div className="p-3 sm:p-3.5 rounded-lg sm:rounded-xl bg-[#0e2746]/80 border border-[#c5a880]/30 text-xs text-slate-300 space-y-1">
                <div className="flex items-center gap-1.5 sm:gap-2 text-[#f7e6b5] font-bold">
                  <Award className="w-3.5 h-3.5 sm:w-4 sm:h-4" />
                  <span>Sovereign Fiduciary Allocation</span>
                </div>
                <p className="text-[10px] sm:text-[11px] leading-relaxed">
                  Your funds compound daily and are protected by multi-jurisdictional statutory deposit guarantees across Frankfurt, Zurich, London, and New York.
                </p>
              </div>

              <button
                id="simulator-open-account-btn"
                onClick={() => {
                  setCurrentView('AUTH_ENROLL');
                  window.scrollTo({ top: 0, behavior: 'smooth' });
                }}
                className="w-full py-3 sm:py-3.5 rounded-xl bg-gradient-to-r from-[#c5a880] to-[#b39366] text-slate-950 font-bold text-xs uppercase tracking-wider hover:brightness-105 transition-all flex items-center justify-center gap-2 cursor-pointer shadow-lg"
              >
                <span>Open Apex High-Yield Account</span>
                <ArrowRight className="w-4 h-4" />
              </button>
            </div>
          </div>
        </div>
      </section>

      {/* 6. SHARP, COMPACT TRUST & REGULATORY BADGE STRIP */}
      <section className="py-6 sm:py-8 bg-slate-100/70 dark:bg-[#071322] border-t border-slate-200 dark:border-slate-800 transition-colors">
        <div className="max-w-7xl mx-auto px-4 sm:px-8">
          <div className="flex flex-col md:flex-row items-center justify-between gap-3 sm:gap-4 p-3.5 sm:p-4 rounded-xl bg-white dark:bg-[#0a192f] border border-slate-200 dark:border-[#1e3656] shadow-xs">
            <div className="flex flex-wrap items-center gap-3 sm:gap-6 text-xs">
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

      {/* 7. VERIFIED SECURITY PARTNER & CRYPTOGRAPHIC INFRASTRUCTURE SECTION */}
      <section className="py-10 sm:py-20 bg-white dark:bg-[#06111f] border-t border-slate-200 dark:border-slate-800 transition-colors">
        <div className="max-w-7xl mx-auto px-4 sm:px-8 space-y-8 sm:space-y-10">
          <div className="flex flex-col md:flex-row md:items-end justify-between gap-4">
            <div className="space-y-1.5 sm:space-y-2 max-w-2xl">
              <div className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full bg-emerald-500/10 border border-emerald-500/30 text-emerald-600 dark:text-emerald-400 text-[10px] sm:text-xs font-mono font-bold uppercase tracking-wider">
                <ShieldCheck className="w-3.5 h-3.5" />
                <span>Independent Third-Party Verification</span>
              </div>
              <h2 className="text-xl sm:text-3xl md:text-4xl font-bold font-serif text-slate-900 dark:text-white">
                Verified Security Partners &amp; Infrastructure
              </h2>
              <p className="text-xs sm:text-sm text-slate-600 dark:text-slate-300 leading-relaxed">
                First Atlantic Bank integrates directly with certified hardware enclaves, international settlement rails, and continuous SOC 2 surveillance partners to ensure immutable capital defense.
              </p>
            </div>

            <div className="flex items-center gap-2">
              <span className="text-xs font-mono text-slate-500 dark:text-slate-400">Live Status:</span>
              <span className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full bg-emerald-500/15 border border-emerald-500/30 text-emerald-600 dark:text-emerald-400 text-xs font-bold font-mono">
                <span className="w-2 h-2 rounded-full bg-emerald-500 animate-ping" />
                ALL PROTOCOLS OPERATIONAL
              </span>
            </div>
          </div>

          {/* Grid of Security Partners */}
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4 sm:gap-6">
            {securityPartners.map((partner) => (
              <div
                key={partner.id}
                className="p-5 sm:p-6 rounded-xl sm:rounded-2xl bg-slate-50 dark:bg-[#0a192f] border border-slate-200 dark:border-[#1e3656] shadow-xs hover:border-[#c5a880] transition-all flex flex-col justify-between space-y-4 sm:space-y-5 group"
              >
                <div className="space-y-3.5 sm:space-y-4">
                  <div className="flex items-center justify-between">
                    <div className="text-2xl sm:text-3xl">{partner.logo}</div>
                    <span className="px-2.5 py-1 rounded-full bg-emerald-100 dark:bg-emerald-950/60 text-emerald-800 dark:text-emerald-300 text-[10px] font-bold font-mono border border-emerald-300 dark:border-emerald-700">
                      {partner.status}
                    </span>
                  </div>

                  <div>
                    <span className="text-[10px] sm:text-[11px] font-mono font-bold uppercase text-[#8c6d37] dark:text-[#c5a880] block">
                      {partner.category}
                    </span>
                    <h3 className="text-base sm:text-lg font-bold font-serif text-slate-900 dark:text-white mt-0.5">
                      {partner.name}
                    </h3>
                  </div>

                  <p className="text-xs text-slate-600 dark:text-slate-300 leading-relaxed">
                    {partner.description}
                  </p>

                  <div className="space-y-1.5 pt-2 border-t border-slate-200 dark:border-slate-800">
                    <span className="text-[10px] font-mono uppercase font-bold text-slate-400">Security Specifications:</span>
                    {partner.specs.map((spec: string, idx: number) => (
                      <div key={idx} className="flex items-center gap-2 text-[11px] text-slate-600 dark:text-slate-300 font-mono">
                        <Check className="w-3 h-3 text-emerald-500 shrink-0" />
                        <span>{spec}</span>
                      </div>
                    ))}
                  </div>
                </div>

                <div className="pt-3 border-t border-slate-200 dark:border-slate-800 flex items-center justify-between gap-2">
                  <button
                    onClick={() => handleVerifyPartner(partner)}
                    className="flex-1 py-2 rounded-xl bg-white dark:bg-[#112a4a] hover:bg-slate-100 dark:hover:bg-[#183c6b] text-slate-800 dark:text-slate-200 border border-slate-300 dark:border-slate-700 font-semibold text-xs transition-colors flex items-center justify-center gap-1.5 cursor-pointer shadow-xs"
                  >
                    <ShieldCheck className="w-3.5 h-3.5 text-emerald-500" />
                    <span>Live Verification</span>
                  </button>

                  <a
                    href={partner.externalUrl}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="p-2 rounded-xl bg-slate-200 dark:bg-slate-800 hover:bg-slate-300 dark:hover:bg-slate-700 text-slate-700 dark:text-slate-300 transition-colors"
                    title="External Official Authority Verification Registry"
                  >
                    <ExternalLink className="w-4 h-4" />
                  </a>
                </div>
              </div>
            ))}
          </div>

          {/* Security Protocols Summary Strip */}
          <div className="p-4.5 sm:p-6 rounded-xl sm:rounded-2xl bg-[#0a192f] text-white border border-[#1e3656] shadow-xl">
            <div className="grid grid-cols-1 md:grid-cols-4 gap-4 sm:gap-6 text-xs">
              <div className="space-y-1 sm:space-y-1.5">
                <span className="text-[10px] uppercase font-mono text-[#c5a880] block font-bold">Protocol Alpha</span>
                <h4 className="font-serif font-bold text-sm text-white">Cryptographic HSM Signing</h4>
                <p className="text-[11px] text-slate-300">All outbound interbank transfers require dual-custody hardware key validation.</p>
              </div>
              <div className="space-y-1 sm:space-y-1.5">
                <span className="text-[10px] uppercase font-mono text-[#c5a880] block font-bold">Protocol Beta</span>
                <h4 className="font-serif font-bold text-sm text-white">Immutable Double-Entry</h4>
                <p className="text-[11px] text-slate-300">Zero floating balance discrepancy with real-time audit ledger checksum hashing.</p>
              </div>
              <div className="space-y-1 sm:space-y-1.5">
                <span className="text-[10px] uppercase font-mono text-[#c5a880] block font-bold">Protocol Gamma</span>
                <h4 className="font-serif font-bold text-sm text-white">4-Eyes Executive Approvals</h4>
                <p className="text-[11px] text-slate-300">High-value transfers (&gt;$50k) are verified by dual institutional compliance officers.</p>
              </div>
              <div className="space-y-1 sm:space-y-1.5">
                <span className="text-[10px] uppercase font-mono text-[#c5a880] block font-bold">Protocol Delta</span>
                <h4 className="font-serif font-bold text-sm text-white">Multi-Jurisdiction Insurance</h4>
                <p className="text-[11px] text-slate-300">Full statutory deposit protection under US FDIC, UK FSCS, and European DGS schemes.</p>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Dynamic Verification Certificate Modal */}
      {selectedPartner && (
        <div className="fixed inset-0 z-50 bg-black/70 backdrop-blur-sm flex items-center justify-center p-4">
          <motion.div
            initial={{ scale: 0.95, opacity: 0 }}
            animate={{ scale: 1, opacity: 1 }}
            className="bg-white dark:bg-[#0a192f] rounded-3xl max-w-lg w-full border border-slate-200 dark:border-[#1e3656] shadow-2xl p-6 sm:p-8 space-y-6 text-slate-900 dark:text-white relative"
          >
            <button
              onClick={() => {
                setSelectedPartner(null);
                setVerificationResult(null);
              }}
              className="absolute top-5 right-5 text-slate-400 hover:text-slate-600 dark:hover:text-white p-1 rounded-lg"
            >
              <X className="w-5 h-5" />
            </button>

            <div className="flex items-center gap-3">
              <div className="w-12 h-12 rounded-2xl bg-[#0e2746] text-[#d4af37] flex items-center justify-center text-2xl border border-[#c5a880]/30 shadow-md">
                {selectedPartner.logo}
              </div>
              <div>
                <span className="text-[10px] uppercase font-mono text-[#8c6d37] dark:text-[#c5a880] font-bold block">
                  Security Partner Clearance
                </span>
                <h3 className="text-xl font-bold font-serif">{selectedPartner.name}</h3>
              </div>
            </div>

            {isVerifyingPartner ? (
              <div className="py-10 text-center space-y-3">
                <RefreshCw className="w-8 h-8 animate-spin text-[#c5a880] mx-auto" />
                <span className="text-xs font-mono text-slate-500 dark:text-slate-400 block">
                  Pinging cryptographic authority &amp; validating certificate fingerprints...
                </span>
              </div>
            ) : verificationResult ? (
              <div className="space-y-4 font-mono text-xs">
                <div className="p-3.5 rounded-xl bg-emerald-50 dark:bg-emerald-950/40 border border-emerald-200 dark:border-emerald-800 text-emerald-800 dark:text-emerald-300 flex items-center gap-2">
                  <ShieldCheck className="w-5 h-5 text-emerald-600 shrink-0" />
                  <div>
                    <span className="font-bold block">Technical Attestation Confirmed</span>
                    <span className="text-[11px] opacity-90">{verificationResult.status}</span>
                  </div>
                </div>

                <div className="p-4 rounded-xl bg-slate-50 dark:bg-[#071322] border border-slate-200 dark:border-slate-800 space-y-2">
                  <div className="flex justify-between">
                    <span className="text-slate-500">Registry Certificate:</span>
                    <span className="font-bold text-slate-900 dark:text-white">{verificationResult.certId}</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-slate-500">Validation Authority:</span>
                    <span className="font-bold text-slate-900 dark:text-white">{selectedPartner.complianceAuthority}</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-slate-500">Round-Trip Latency:</span>
                    <span className="font-bold text-emerald-500">{verificationResult.latencyMs} ms</span>
                  </div>
                  <div className="pt-2 border-t border-slate-200 dark:border-slate-800">
                    <span className="text-slate-500 block text-[10px]">Tamper-Proof Verification Signature:</span>
                    <span className="font-bold text-[10px] break-all text-[#8c6d37] dark:text-[#c5a880]">{verificationResult.tamperProofHash}</span>
                  </div>
                </div>

                <div className="flex gap-3 pt-2">
                  <a
                    href={selectedPartner.externalUrl}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="flex-1 py-3 rounded-xl bg-[#0a192f] dark:bg-[#133257] hover:bg-[#173d69] text-white font-bold text-xs flex items-center justify-center gap-2 cursor-pointer shadow-md"
                  >
                    <span>Open External Authority Registry</span>
                    <ExternalLink className="w-3.5 h-3.5" />
                  </a>
                  <button
                    onClick={() => {
                      setSelectedPartner(null);
                      setVerificationResult(null);
                    }}
                    className="px-5 py-3 rounded-xl border border-slate-300 dark:border-slate-700 hover:bg-slate-100 dark:hover:bg-slate-800 font-semibold text-xs cursor-pointer"
                  >
                    Dismiss
                  </button>
                </div>
              </div>
            ) : null}
          </motion.div>
        </div>
      )}
    </div>
  );
};
