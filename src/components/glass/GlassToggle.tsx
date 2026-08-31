import React from 'react';
import { Check, Sparkles, Sun, Moon } from 'lucide-react';

export interface GlassToggleProps {
  checked: boolean;
  onChange: (checked: boolean) => void;
  label?: string;
  sublabel?: string;
  size?: 'sm' | 'md' | 'lg';
  variant?: 'gold' | 'emerald' | 'sapphire';
  iconType?: 'check' | 'sparkle' | 'sun-moon' | 'dot' | 'none';
  disabled?: boolean;
  className?: string;
}

export const GlassToggle: React.FC<GlassToggleProps> = ({
  checked,
  onChange,
  label,
  sublabel,
  size = 'md',
  variant = 'gold',
  iconType = 'dot',
  disabled = false,
  className = ''
}) => {
  const sizeMap = {
    sm: {
      capsule: 'w-10 h-6',
      knob: 'w-4 h-4',
      translate: 'translate-x-4',
      iconSize: 'w-2.5 h-2.5'
    },
    md: {
      capsule: 'w-13 h-7',
      knob: 'w-5 h-5',
      translate: 'translate-x-6',
      iconSize: 'w-3 h-3'
    },
    lg: {
      capsule: 'w-16 h-9',
      knob: 'w-7 h-7',
      translate: 'translate-x-7',
      iconSize: 'w-3.5 h-3.5'
    }
  }[size];

  const variantActiveClass = {
    gold: 'bg-gradient-to-r from-amber-500/80 to-[#c5a880]/90 border-amber-300/80 shadow-[0_0_16px_rgba(217,119,6,0.35)]',
    emerald: 'bg-gradient-to-r from-emerald-500/80 to-teal-500/90 border-emerald-300/80 shadow-[0_0_16px_rgba(16,185,129,0.35)]',
    sapphire: 'bg-gradient-to-r from-blue-500/80 to-indigo-600/90 border-blue-300/80 shadow-[0_0_16px_rgba(59,130,246,0.35)]'
  }[variant];

  const renderKnobIcon = () => {
    if (iconType === 'check') {
      return checked ? (
        <Check className={`${sizeMap.iconSize} text-emerald-600 dark:text-emerald-400 stroke-[3]`} />
      ) : null;
    }
    if (iconType === 'sparkle') {
      return <Sparkles className={`${sizeMap.iconSize} ${checked ? 'text-amber-500' : 'text-slate-400'}`} />;
    }
    if (iconType === 'sun-moon') {
      return checked ? (
        <Moon className={`${sizeMap.iconSize} text-indigo-500`} />
      ) : (
        <Sun className={`${sizeMap.iconSize} text-amber-500`} />
      );
    }
    if (iconType === 'dot') {
      return (
        <div
          className={`w-1.5 h-1.5 rounded-full transition-colors ${
            checked ? 'bg-[#c5a880]' : 'bg-slate-400 dark:bg-slate-500'
          }`}
        />
      );
    }
    return null;
  };

  return (
    <label
      className={`inline-flex items-center justify-between gap-3 cursor-pointer select-none ${
        disabled ? 'opacity-50 pointer-events-none' : ''
      } ${className}`}
    >
      {(label || sublabel) && (
        <div className="flex flex-col min-w-0 pr-2">
          {label && (
            <span className="text-xs sm:text-sm font-semibold text-slate-800 dark:text-slate-100">
              {label}
            </span>
          )}
          {sublabel && (
            <span className="text-[11px] text-slate-500 dark:text-slate-400 leading-tight">
              {sublabel}
            </span>
          )}
        </div>
      )}

      {/* Glass Capsule */}
      <div
        onClick={() => !disabled && onChange(!checked)}
        className={`relative ${sizeMap.capsule} p-1 rounded-full backdrop-blur-md transition-all duration-300 border cursor-pointer ${
          checked
            ? variantActiveClass
            : 'bg-slate-200/60 dark:bg-white/10 border-white/60 dark:border-white/15 shadow-inner'
        }`}
      >
        {/* Specular Capsule Highlight */}
        <div className="pointer-events-none absolute inset-x-2 top-0.5 h-px bg-white/60 rounded-full" />

        {/* Sliding Glass Marble Bead */}
        <div
          className={`relative ${sizeMap.knob} rounded-full bg-white/95 dark:bg-slate-900/90 backdrop-blur-md shadow-md border border-white/80 dark:border-white/20 flex items-center justify-center transition-transform duration-300 ${
            checked ? sizeMap.translate : 'translate-x-0'
          }`}
        >
          {renderKnobIcon()}
        </div>
      </div>
    </label>
  );
};
