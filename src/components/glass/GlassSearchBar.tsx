import React, { useState, useRef } from 'react';
import { Search, X, Command, SlidersHorizontal, ArrowRight, Sparkles } from 'lucide-react';

export interface GlassSearchBarProps {
  value: string;
  onChange: (val: string) => void;
  onSubmit?: (val: string) => void;
  placeholder?: string;
  onFilterClick?: () => void;
  showFilterButton?: boolean;
  filterActive?: boolean;
  suggestions?: string[];
  onSelectSuggestion?: (sug: string) => void;
  size?: 'sm' | 'md' | 'lg';
  className?: string;
}

export const GlassSearchBar: React.FC<GlassSearchBarProps> = ({
  value,
  onChange,
  onSubmit,
  placeholder = 'Search accounts, wires, payees, transactions...',
  onFilterClick,
  showFilterButton = true,
  filterActive = false,
  suggestions = [],
  onSelectSuggestion,
  size = 'md',
  className = ''
}) => {
  const [isFocused, setIsFocused] = useState(false);
  const inputRef = useRef<HTMLInputElement>(null);

  const sizeClasses = {
    sm: 'py-1.5 pl-8 pr-16 text-xs',
    md: 'py-2.5 pl-10 pr-20 text-xs sm:text-sm',
    lg: 'py-3.5 pl-12 pr-24 text-sm sm:text-base'
  }[size];

  const iconSizes = {
    sm: 'w-3.5 h-3.5 left-2.5',
    md: 'w-4 h-4 left-3.5',
    lg: 'w-5 h-5 left-4'
  }[size];

  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter' && onSubmit) {
      onSubmit(value);
    }
    if (e.key === 'Escape') {
      inputRef.current?.blur();
      setIsFocused(false);
    }
  };

  const handleClear = () => {
    onChange('');
    inputRef.current?.focus();
  };

  return (
    <div className={`relative w-full ${className}`}>
      {/* Outer Glow Halo on Focus */}
      <div
        className={`absolute -inset-0.5 rounded-2xl bg-gradient-to-r from-[#c5a880]/30 via-amber-400/20 to-blue-500/20 blur-sm transition-opacity duration-300 pointer-events-none ${
          isFocused ? 'opacity-100' : 'opacity-0'
        }`}
      />

      <div className="relative flex items-center w-full">
        {/* Search Lens Icon */}
        <Search
          className={`absolute ${iconSizes} top-1/2 -translate-y-1/2 text-slate-400 transition-colors pointer-events-none ${
            isFocused ? 'text-[#c5a880]' : ''
          }`}
        />

        {/* Transparent Frosted Input Field */}
        <input
          ref={inputRef}
          type="text"
          value={value}
          onChange={(e) => onChange(e.target.value)}
          onKeyDown={handleKeyDown}
          onFocus={() => setIsFocused(true)}
          onBlur={() => setTimeout(() => setIsFocused(false), 200)}
          placeholder={placeholder}
          className={`w-full glass-input rounded-xl sm:rounded-2xl font-sans text-slate-900 dark:text-white placeholder-slate-400 dark:placeholder-slate-500 focus:outline-none transition-all ${sizeClasses}`}
        />

        {/* Right Action Elements: Clear & Filter */}
        <div className="absolute right-2.5 top-1/2 -translate-y-1/2 flex items-center gap-1.5">
          {value && (
            <button
              type="button"
              onClick={handleClear}
              className="p-1 rounded-full text-slate-400 hover:text-slate-700 dark:hover:text-slate-200 hover:bg-white/40 dark:hover:bg-white/10 transition-colors cursor-pointer"
              title="Clear Search"
            >
              <X className="w-3.5 h-3.5" />
            </button>
          )}

          {/* Keyboard Shortcut Indicator Pill (Hidden on Mobile) */}
          <div className="hidden sm:inline-flex items-center gap-0.5 px-1.5 py-0.5 rounded-md bg-white/60 dark:bg-white/10 border border-white/40 dark:border-white/10 text-[10px] font-mono text-slate-400 pointer-events-none shadow-2xs">
            <Command className="w-2.5 h-2.5" />
            <span>K</span>
          </div>

          {/* Filter Option Trigger */}
          {showFilterButton && (
            <button
              type="button"
              onClick={onFilterClick}
              className={`p-1.5 rounded-lg border transition-all cursor-pointer ${
                filterActive
                  ? 'bg-[#c5a880]/20 border-[#c5a880] text-[#c5a880]'
                  : 'bg-white/50 dark:bg-white/10 border-white/50 dark:border-white/15 text-slate-500 hover:text-slate-800 dark:text-slate-300 dark:hover:text-white'
              }`}
              title="Filter Results"
            >
              <SlidersHorizontal className="w-3.5 h-3.5" />
            </button>
          )}
        </div>
      </div>

      {/* Floating Suggestions Dropdown */}
      {isFocused && suggestions.length > 0 && (
        <div className="absolute top-full left-0 right-0 mt-2 z-50 p-2 rounded-xl glass-panel-elevated space-y-1 animate-in fade-in slide-in-from-top-2 duration-150">
          <div className="px-2 py-1 text-[10px] font-mono font-bold text-slate-400 uppercase tracking-wider flex items-center justify-between">
            <span>Instant Suggestions</span>
            <Sparkles className="w-3 h-3 text-[#c5a880]" />
          </div>
          {suggestions.map((item, idx) => (
            <button
              key={idx}
              type="button"
              onClick={() => onSelectSuggestion && onSelectSuggestion(item)}
              className="w-full px-3 py-2 text-left text-xs font-semibold text-slate-700 dark:text-slate-200 hover:bg-white/60 dark:hover:bg-white/10 rounded-lg flex items-center justify-between transition-colors cursor-pointer"
            >
              <span>{item}</span>
              <ArrowRight className="w-3 h-3 text-slate-400" />
            </button>
          ))}
        </div>
      )}
    </div>
  );
};
