import React, { useState } from 'react';
import {
  Sparkles,
  Sliders,
  ToggleLeft,
  Search,
  Music,
  Layout,
  Layers,
  Zap,
  ShieldCheck,
  Send,
  CreditCard,
  Eye,
  CheckCircle2,
  TrendingUp,
  Globe,
  Lock,
  RefreshCw,
  Maximize2,
  Smartphone,
  Compass,
  ArrowRight
} from 'lucide-react';
import { GlassPanel } from './GlassPanel';
import { GlassButton } from './GlassButton';
import { GlassSlider } from './GlassSlider';
import { GlassToggle } from './GlassToggle';
import { GlassSearchBar } from './GlassSearchBar';
import { GlassMediaControls } from './GlassMediaControls';
import { GlassTabs, GlassBadge } from './GlassTabs';
import { motion, AnimatePresence } from 'motion/react';

export const GlassmorphicShowcase: React.FC<{ className?: string }> = ({ className = '' }) => {
  // Active Showcase Tab
  const [activeTab, setActiveTab] = useState<string>('all');

  // Customizer Controls
  const [blurLevel, setBlurLevel] = useState<number>(20);
  const [glassOpacity, setGlassOpacity] = useState<number>(65);
  const [specularGlow, setSpecularGlow] = useState<boolean>(true);
  const [themeAccent, setThemeAccent] = useState<'gold' | 'sapphire' | 'emerald'>('gold');
  const [bgStyle, setBgStyle] = useState<'aurora' | 'obsidian' | 'crystal' | 'mesh'>('aurora');

  // Interactive UI Kit State
  const [sliderVal1, setSliderVal1] = useState<number>(45000);
  const [sliderVal2, setSliderVal2] = useState<number>(75);
  const [sliderVal3, setSliderVal3] = useState<number>(3.8);

  const [toggleBiometric, setToggleBiometric] = useState<boolean>(true);
  const [toggleInstantAlerts, setToggleInstantAlerts] = useState<boolean>(true);
  const [toggleFxRateLock, setToggleFxRateLock] = useState<boolean>(false);
  const [toggleDarkModeGlass, setToggleDarkModeGlass] = useState<boolean>(true);

  const [searchQuery, setSearchQuery] = useState<string>('');
  const [selectedPill, setSelectedPill] = useState<string>('all-wires');

  const tabItems = [
    { id: 'all', label: 'Full UI Kit', icon: <Layers className="w-3.5 h-3.5" /> },
    { id: 'buttons', label: 'Glass Buttons', icon: <Zap className="w-3.5 h-3.5" /> },
    { id: 'sliders', label: 'Sliders', icon: <Sliders className="w-3.5 h-3.5" /> },
    { id: 'toggles', label: 'Toggles', icon: <ToggleLeft className="w-3.5 h-3.5" /> },
    { id: 'search', label: 'Search Bars', icon: <Search className="w-3.5 h-3.5" /> },
    { id: 'media', label: 'Media Controls', icon: <Music className="w-3.5 h-3.5" /> }
  ];

  // Dynamic Background Wallpapers for Glass Testing
  const bgClasses = {
    aurora:
      'bg-gradient-to-br from-indigo-900 via-slate-900 to-amber-950 text-white',
    obsidian:
      'bg-gradient-to-br from-slate-950 via-[#071322] to-[#0d1d36] text-white',
    crystal:
      'bg-gradient-to-br from-blue-100 via-white to-amber-100 text-slate-900',
    mesh:
      'bg-[radial-gradient(ellipse_at_top_right,_var(--tw-gradient-stops))] from-amber-700/40 via-slate-900 to-blue-950 text-white'
  }[bgStyle];

  return (
    <div className={`space-y-6 font-sans ${className}`}>
      {/* Showcase Hero Header */}
      <GlassPanel
        variant="elevated"
        blur="2xl"
        rounded="3xl"
        glow
        className="p-5 sm:p-8 relative overflow-hidden"
      >
        {/* Background Ambient Orbs */}
        <div className="absolute top-0 right-0 -mt-8 -mr-8 w-64 h-64 rounded-full bg-amber-500/20 blur-3xl pointer-events-none" />
        <div className="absolute bottom-0 left-1/3 -mb-8 w-72 h-72 rounded-full bg-blue-500/20 blur-3xl pointer-events-none" />

        <div className="relative z-10 space-y-4">
          <div className="flex flex-wrap items-center justify-between gap-3">
            <div className="flex items-center gap-2.5">
              <div className="w-10 h-10 rounded-2xl bg-gradient-to-tr from-amber-400 to-[#c5a880] p-0.5 shadow-lg shadow-amber-500/30">
                <div className="w-full h-full rounded-[14px] bg-[#0a192f] flex items-center justify-center text-[#c5a880]">
                  <Sparkles className="w-5 h-5 animate-pulse" />
                </div>
              </div>
              <div>
                <h2 className="text-xl sm:text-2xl font-bold font-serif tracking-tight text-slate-900 dark:text-white">
                  Glassmorphism UI Kit & Vector Interface Studio
                </h2>
                <p className="text-xs sm:text-sm text-slate-600 dark:text-slate-300">
                  Modern mobile-first frosted glass components: transparent buttons, precision sliders, panels, switches, search bars & media controls.
                </p>
              </div>
            </div>

            <div className="flex items-center gap-2">
              <GlassBadge variant="gold" pulse>
                Vector Interface Set
              </GlassBadge>
              <GlassBadge variant="emerald">
                Mobile-First
              </GlassBadge>
            </div>
          </div>

          {/* Quick Customizer Bar */}
          <div className="p-3 sm:p-4 rounded-2xl bg-white/50 dark:bg-black/30 backdrop-blur-md border border-white/60 dark:border-white/10 grid grid-cols-1 sm:grid-cols-4 gap-3 text-xs">
            {/* Background Style Switcher */}
            <div>
              <label className="text-[10px] font-mono font-bold text-slate-500 dark:text-slate-400 uppercase tracking-wider block mb-1">
                Glass Canvas Backdrop
              </label>
              <div className="flex items-center gap-1">
                {(['aurora', 'obsidian', 'crystal', 'mesh'] as const).map((s) => (
                  <button
                    key={s}
                    type="button"
                    onClick={() => setBgStyle(s)}
                    className={`flex-1 py-1 rounded-lg text-[10px] font-mono font-bold capitalize transition-all cursor-pointer ${
                      bgStyle === s
                        ? 'bg-[#c5a880] text-slate-950 shadow-xs'
                        : 'bg-white/40 dark:bg-white/10 text-slate-700 dark:text-slate-300 hover:bg-white/70'
                    }`}
                  >
                    {s}
                  </button>
                ))}
              </div>
            </div>

            {/* Accent Theme */}
            <div>
              <label className="text-[10px] font-mono font-bold text-slate-500 dark:text-slate-400 uppercase tracking-wider block mb-1">
                Accent Luminous Glow
              </label>
              <div className="flex items-center gap-1">
                {(['gold', 'emerald', 'sapphire'] as const).map((a) => (
                  <button
                    key={a}
                    type="button"
                    onClick={() => setThemeAccent(a)}
                    className={`flex-1 py-1 rounded-lg text-[10px] font-mono font-bold capitalize transition-all cursor-pointer ${
                      themeAccent === a
                        ? 'bg-[#c5a880] text-slate-950 shadow-xs'
                        : 'bg-white/40 dark:bg-white/10 text-slate-700 dark:text-slate-300 hover:bg-white/70'
                    }`}
                  >
                    {a}
                  </button>
                ))}
              </div>
            </div>

            {/* Blur Slider */}
            <div>
              <label className="text-[10px] font-mono font-bold text-slate-500 dark:text-slate-400 uppercase tracking-wider block mb-1">
                Backdrop Blur: {blurLevel}px
              </label>
              <GlassSlider
                value={blurLevel}
                onChange={setBlurLevel}
                min={4}
                max={40}
                step={2}
                unit="px"
                showValueBubble={false}
                showMinMax={false}
                variant={themeAccent}
              />
            </div>

            {/* Specular Glow Toggle */}
            <div className="flex items-center justify-between sm:justify-center gap-2 pt-1">
              <span className="text-[11px] font-bold text-slate-700 dark:text-slate-300">
                Specular Border Glow
              </span>
              <GlassToggle
                checked={specularGlow}
                onChange={setSpecularGlow}
                size="sm"
                variant={themeAccent}
                iconType="sparkle"
              />
            </div>
          </div>

          {/* Navigation Filter Tabs */}
          <div className="pt-2 overflow-x-auto no-scrollbar">
            <GlassTabs
              items={tabItems}
              activeId={activeTab}
              onChange={setActiveTab}
              size="md"
            />
          </div>
        </div>
      </GlassPanel>

      {/* Main Glass Canvas Preview Area */}
      <div className={`p-4 sm:p-8 rounded-3xl transition-all duration-500 shadow-2xl relative overflow-hidden ${bgClasses}`}>
        {/* Dynamic Light Specular Backdrop Nodes */}
        <div className="absolute top-1/4 left-1/4 w-96 h-96 rounded-full bg-amber-400/15 blur-[100px] pointer-events-none" />
        <div className="absolute bottom-1/4 right-1/4 w-96 h-96 rounded-full bg-blue-400/15 blur-[100px] pointer-events-none" />

        <div className="relative z-10 space-y-8">
          {/* =========================================================================
              SECTION 1: MEDIA CONTROLS & AUDIO/VOICE PLAYER
             ========================================================================= */}
          {(activeTab === 'all' || activeTab === 'media') && (
            <motion.div
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              className="space-y-3"
            >
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-2">
                  <Music className="w-4 h-4 text-[#c5a880]" />
                  <h3 className="text-sm sm:text-base font-bold font-serif tracking-tight">
                    Glassmorphic Media & Voice Player
                  </h3>
                </div>
                <GlassBadge variant="gold" size="sm">
                  Interactive Web Audio
                </GlassBadge>
              </div>

              <GlassMediaControls />
            </motion.div>
          )}

          {/* =========================================================================
              SECTION 2: TRANSPARENT GLASS BUTTONS
             ========================================================================= */}
          {(activeTab === 'all' || activeTab === 'buttons') && (
            <motion.div
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              className="space-y-4"
            >
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-2">
                  <Zap className="w-4 h-4 text-[#c5a880]" />
                  <h3 className="text-sm sm:text-base font-bold font-serif tracking-tight">
                    Transparent Glass Buttons & Floating Controls
                  </h3>
                </div>
                <span className="text-xs font-mono opacity-75">Touch-Optimized & Glowing</span>
              </div>

              <GlassPanel variant="standard" blur="xl" rounded="2xl" className="p-4 sm:p-6 space-y-5">
                {/* Variant Row */}
                <div>
                  <h4 className="text-xs font-bold uppercase tracking-wider text-slate-400 mb-3 font-mono">
                    Color Variants with Specular Sheen
                  </h4>
                  <div className="flex flex-wrap items-center gap-2.5 sm:gap-3">
                    <GlassButton variant="primary-gold" glow iconLeft={<Sparkles className="w-4 h-4" />}>
                      Institutional Gold
                    </GlassButton>

                    <GlassButton variant="glass-frosted" iconLeft={<ShieldCheck className="w-4 h-4" />}>
                      Frosted Crystalline
                    </GlassButton>

                    <GlassButton variant="glass-emerald" iconLeft={<CheckCircle2 className="w-4 h-4" />}>
                      Emerald Settled
                    </GlassButton>

                    <GlassButton variant="glass-sapphire" iconLeft={<Globe className="w-4 h-4" />}>
                      Sapphire SWIFT
                    </GlassButton>

                    <GlassButton variant="glass-danger" iconLeft={<Lock className="w-4 h-4" />}>
                      Emergency Freeze
                    </GlassButton>

                    <GlassButton variant="glass-ghost" iconLeft={<Compass className="w-4 h-4" />}>
                      Ghost Translucent
                    </GlassButton>
                  </div>
                </div>

                {/* Sizing & Pill Shapes */}
                <div>
                  <h4 className="text-xs font-bold uppercase tracking-wider text-slate-400 mb-3 font-mono">
                    Sizing, Pill Shapes & Loading States
                  </h4>
                  <div className="flex flex-wrap items-center gap-2.5 sm:gap-3">
                    <GlassButton size="xs" pill variant="glass-frosted">
                      Pill Mini
                    </GlassButton>

                    <GlassButton size="sm" pill variant="primary-gold">
                      Small Capsule
                    </GlassButton>

                    <GlassButton size="md" pill variant="glass-emerald" iconRight={<ArrowRight className="w-3.5 h-3.5" />}>
                      Execute Transfer
                    </GlassButton>

                    <GlassButton size="lg" variant="primary-gold" iconLeft={<Send className="w-4 h-4" />}>
                      Initiate Fedwire Wire
                    </GlassButton>

                    <GlassButton size="md" loading variant="glass-frosted">
                      Processing Wire
                    </GlassButton>
                  </div>
                </div>
              </GlassPanel>
            </motion.div>
          )}

          {/* =========================================================================
              SECTION 3: PRECISION GLASS SLIDERS
             ========================================================================= */}
          {(activeTab === 'all' || activeTab === 'sliders') && (
            <motion.div
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              className="space-y-4"
            >
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-2">
                  <Sliders className="w-4 h-4 text-[#c5a880]" />
                  <h3 className="text-sm sm:text-base font-bold font-serif tracking-tight">
                    Smooth Glass Range Sliders with Tooltip Bubbles
                  </h3>
                </div>
                <span className="text-xs font-mono opacity-75">Touch & Gesture Dragging</span>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                {/* Slider 1: Wire Amount Limit */}
                <GlassPanel variant="standard" blur="xl" rounded="2xl" className="p-4 sm:p-5 space-y-3">
                  <div className="flex items-center justify-between text-xs font-bold font-mono">
                    <span>Daily Wire Authorization</span>
                    <span className="text-[#c5a880]">${sliderVal1.toLocaleString()}</span>
                  </div>
                  <GlassSlider
                    value={sliderVal1}
                    onChange={setSliderVal1}
                    min={1000}
                    max={100000}
                    step={1000}
                    unit="USD"
                    variant="gold"
                    showValueBubble
                  />
                  <p className="text-[11px] text-slate-400">
                    Drag to dynamically calibrate biometric wire clearance thresholds.
                  </p>
                </GlassPanel>

                {/* Slider 2: Percentage Allocation */}
                <GlassPanel variant="standard" blur="xl" rounded="2xl" className="p-4 sm:p-5 space-y-3">
                  <div className="flex items-center justify-between text-xs font-bold font-mono">
                    <span>Treasury Yield Allocation</span>
                    <span className="text-emerald-400">{sliderVal2}%</span>
                  </div>
                  <GlassSlider
                    value={sliderVal2}
                    onChange={setSliderVal2}
                    min={0}
                    max={100}
                    step={5}
                    unit="%"
                    variant="emerald"
                    showValueBubble
                  />
                  <p className="text-[11px] text-slate-400">
                    Automated liquid overnight sweep allocation to 5.15% APY yield vault.
                  </p>
                </GlassPanel>

                {/* Slider 3: APY Interest Rate Target */}
                <GlassPanel variant="standard" blur="xl" rounded="2xl" className="p-4 sm:p-5 space-y-3">
                  <div className="flex items-center justify-between text-xs font-bold font-mono">
                    <span>Target FX Spread Cap</span>
                    <span className="text-blue-400">{sliderVal3}%</span>
                  </div>
                  <GlassSlider
                    value={sliderVal3}
                    onChange={setSliderVal3}
                    min={0.5}
                    max={5.0}
                    step={0.1}
                    unit="%"
                    variant="sapphire"
                    showValueBubble
                  />
                  <p className="text-[11px] text-slate-400">
                    Maximum acceptable slippage tolerance for cross-border conversions.
                  </p>
                </GlassPanel>
              </div>
            </motion.div>
          )}

          {/* =========================================================================
              SECTION 4: GLASS TOGGLES & SWITCHES
             ========================================================================= */}
          {(activeTab === 'all' || activeTab === 'toggles') && (
            <motion.div
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              className="space-y-4"
            >
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-2">
                  <ToggleLeft className="w-4 h-4 text-[#c5a880]" />
                  <h3 className="text-sm sm:text-base font-bold font-serif tracking-tight">
                    Glass Capsule Switches & Toggles
                  </h3>
                </div>
                <span className="text-xs font-mono opacity-75">Smooth Marble Beads</span>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-3.5">
                <GlassPanel variant="standard" blur="xl" rounded="2xl" className="p-4">
                  <GlassToggle
                    checked={toggleBiometric}
                    onChange={setToggleBiometric}
                    label="Face ID / Touch ID"
                    sublabel="Hardware enclave wire auth"
                    size="md"
                    variant="gold"
                    iconType="sparkle"
                  />
                </GlassPanel>

                <GlassPanel variant="standard" blur="xl" rounded="2xl" className="p-4">
                  <GlassToggle
                    checked={toggleInstantAlerts}
                    onChange={setToggleInstantAlerts}
                    label="Instant Push Telemetry"
                    sublabel="Real-time SMS & webhook alerts"
                    size="md"
                    variant="emerald"
                    iconType="check"
                  />
                </GlassPanel>

                <GlassPanel variant="standard" blur="xl" rounded="2xl" className="p-4">
                  <GlassToggle
                    checked={toggleFxRateLock}
                    onChange={setToggleFxRateLock}
                    label="60s Spot Rate Lock"
                    sublabel="Hold interbank pricing"
                    size="md"
                    variant="sapphire"
                    iconType="dot"
                  />
                </GlassPanel>

                <GlassPanel variant="standard" blur="xl" rounded="2xl" className="p-4">
                  <GlassToggle
                    checked={toggleDarkModeGlass}
                    onChange={setToggleDarkModeGlass}
                    label="Obsidian Prism Mode"
                    sublabel="Deep twilight refraction"
                    size="md"
                    variant="gold"
                    iconType="sun-moon"
                  />
                </GlassPanel>
              </div>
            </motion.div>
          )}

          {/* =========================================================================
              SECTION 5: GLASS SEARCH BARS & VECTOR INPUTS
             ========================================================================= */}
          {(activeTab === 'all' || activeTab === 'search') && (
            <motion.div
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              className="space-y-4"
            >
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-2">
                  <Search className="w-4 h-4 text-[#c5a880]" />
                  <h3 className="text-sm sm:text-base font-bold font-serif tracking-tight">
                    Transparent Frosted Search Bars & Filter Hub
                  </h3>
                </div>
                <span className="text-xs font-mono opacity-75">Keyboard Shortcut ⌘K Ready</span>
              </div>

              <GlassPanel variant="standard" blur="xl" rounded="2xl" className="p-4 sm:p-6 space-y-4">
                <GlassSearchBar
                  value={searchQuery}
                  onChange={setSearchQuery}
                  placeholder="Search beneficiary IBAN, Fedwire routing, statement month, card number..."
                  suggestions={[
                    'Federal Reserve Bank of New York (021000021)',
                    'Barclays Bank London CHAPS (20-00-00)',
                    'SWIFT GPI MT103 Wire Reference #FATL-98214',
                    'American Express Platinum Monthly Auto-Pay'
                  ]}
                  onSelectSuggestion={(sug) => setSearchQuery(sug)}
                  size="lg"
                />

                {/* Quick Filter Pill Badges */}
                <div className="flex flex-wrap items-center gap-2 pt-1">
                  <span className="text-[11px] font-mono font-bold text-slate-400 mr-1">
                    Quick Filter:
                  </span>
                  {[
                    { id: 'all-wires', label: 'All Operations' },
                    { id: 'intl-swift', label: 'SWIFT International' },
                    { id: 'fedwire-usd', label: 'Fedwire Real-Time' },
                    { id: 'sepa-eur', label: 'SEPA Instant' },
                    { id: 'fps-gbp', label: 'Faster Payments UK' }
                  ].map((filter) => (
                    <button
                      key={filter.id}
                      type="button"
                      onClick={() => setSelectedPill(filter.id)}
                      className={`px-3 py-1 rounded-full text-xs font-mono font-semibold transition-all cursor-pointer ${
                        selectedPill === filter.id
                          ? 'bg-[#c5a880] text-slate-950 shadow-md font-bold'
                          : 'bg-white/50 dark:bg-white/10 text-slate-700 dark:text-slate-300 hover:bg-white/80 border border-white/40 dark:border-white/10'
                      }`}
                    >
                      {filter.label}
                    </button>
                  ))}
                </div>
              </GlassPanel>
            </motion.div>
          )}

          {/* =========================================================================
              SECTION 6: GLASS STATS & METRIC TILES
             ========================================================================= */}
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
            <GlassPanel variant="gold" blur="xl" rounded="2xl" className="p-4 sm:p-5 space-y-2">
              <div className="flex items-center justify-between text-xs text-slate-500 dark:text-slate-400">
                <span className="font-mono font-semibold">Total Portfolio Assets</span>
                <TrendingUp className="w-4 h-4 text-emerald-500" />
              </div>
              <div className="text-2xl font-bold font-mono tracking-tight text-slate-900 dark:text-white">
                $4,892,150.00
              </div>
              <div className="text-[11px] text-emerald-600 dark:text-emerald-400 font-mono font-bold">
                +14.2% YTD Yield Performance
              </div>
            </GlassPanel>

            <GlassPanel variant="sapphire" blur="xl" rounded="2xl" className="p-4 sm:p-5 space-y-2">
              <div className="flex items-center justify-between text-xs text-slate-500 dark:text-slate-400">
                <span className="font-mono font-semibold">Real-Time Corridors</span>
                <Globe className="w-4 h-4 text-blue-500" />
              </div>
              <div className="text-2xl font-bold font-mono tracking-tight text-slate-900 dark:text-white">
                142 Countries
              </div>
              <div className="text-[11px] text-blue-600 dark:text-blue-400 font-mono font-bold">
                Sub-minute clearing via SWIFT GPI
              </div>
            </GlassPanel>

            <GlassPanel variant="standard" blur="xl" rounded="2xl" className="p-4 sm:p-5 space-y-2">
              <div className="flex items-center justify-between text-xs text-slate-500 dark:text-slate-400">
                <span className="font-mono font-semibold">Active Cards & Virtual Tokens</span>
                <CreditCard className="w-4 h-4 text-[#c5a880]" />
              </div>
              <div className="text-2xl font-bold font-mono tracking-tight text-slate-900 dark:text-white">
                6 Cards Active
              </div>
              <div className="text-[11px] text-slate-500 dark:text-slate-400 font-mono">
                Encrypted Apple Pay & Google Pay
              </div>
            </GlassPanel>

            <GlassPanel variant="standard" blur="xl" rounded="2xl" className="p-4 sm:p-5 space-y-2">
              <div className="flex items-center justify-between text-xs text-slate-500 dark:text-slate-400">
                <span className="font-mono font-semibold">Autonomous Fraud Risk</span>
                <ShieldCheck className="w-4 h-4 text-emerald-500" />
              </div>
              <div className="text-2xl font-bold font-mono tracking-tight text-emerald-600 dark:text-emerald-400">
                0.00% Zero-Loss
              </div>
              <div className="text-[11px] text-emerald-600 dark:text-emerald-400 font-mono font-bold">
                ISO 20022 Multi-Sig Guard
              </div>
            </GlassPanel>
          </div>
        </div>
      </div>
    </div>
  );
};
