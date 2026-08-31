import React from 'react';

export interface GlassTabItem {
  id: string;
  label: string;
  icon?: React.ReactNode;
  badge?: string | number;
}

export interface GlassTabsProps {
  items: GlassTabItem[];
  activeId: string;
  onChange: (id: string) => void;
  variant?: 'capsule' | 'underline' | 'cards';
  size?: 'sm' | 'md' | 'lg';
  fullWidth?: boolean;
  className?: string;
}

export const GlassTabs: React.FC<GlassTabsProps> = ({
  items,
  activeId,
  onChange,
  variant = 'capsule',
  size = 'md',
  fullWidth = false,
  className = ''
}) => {
  const sizeClasses = {
    sm: 'px-2.5 py-1 text-xs gap-1',
    md: 'px-3.5 py-1.5 text-xs sm:text-sm gap-1.5',
    lg: 'px-5 py-2 text-sm sm:text-base gap-2 font-bold'
  }[size];

  return (
    <div
      className={`inline-flex items-center p-1 rounded-2xl bg-white/60 dark:bg-black/30 backdrop-blur-lg border border-white/60 dark:border-white/10 shadow-inner ${
        fullWidth ? 'w-full grid grid-flow-col auto-cols-fr' : ''
      } ${className}`}
    >
      {items.map((tab) => {
        const isActive = activeId === tab.id;
        return (
          <button
            key={tab.id}
            type="button"
            onClick={() => onChange(tab.id)}
            className={`relative flex items-center justify-center font-semibold rounded-xl transition-all duration-200 cursor-pointer ${sizeClasses} ${
              isActive
                ? 'bg-white/90 dark:bg-[#112a4a] text-slate-900 dark:text-white shadow-md border border-white/80 dark:border-[#c5a880]/40 font-bold'
                : 'text-slate-600 dark:text-slate-400 hover:text-slate-900 dark:hover:text-white hover:bg-white/40 dark:hover:bg-white/5'
            }`}
          >
            {tab.icon && <span className="shrink-0">{tab.icon}</span>}
            <span className="truncate">{tab.label}</span>
            {tab.badge !== undefined && (
              <span
                className={`ml-1.5 px-1.5 py-0.2 rounded-full text-[10px] font-mono font-bold ${
                  isActive
                    ? 'bg-[#c5a880] text-slate-950'
                    : 'bg-slate-200/80 dark:bg-slate-700/80 text-slate-700 dark:text-slate-300'
                }`}
              >
                {tab.badge}
              </span>
            )}
          </button>
        );
      })}
    </div>
  );
};

export interface GlassBadgeProps {
  variant?: 'gold' | 'emerald' | 'sapphire' | 'rose' | 'neutral';
  size?: 'sm' | 'md';
  pulse?: boolean;
  icon?: React.ReactNode;
  children: React.ReactNode;
  className?: string;
}

export const GlassBadge: React.FC<GlassBadgeProps> = ({
  variant = 'gold',
  size = 'md',
  pulse = false,
  icon,
  children,
  className = ''
}) => {
  const sizeClasses = {
    sm: 'px-2 py-0.5 text-[10px] gap-1',
    md: 'px-2.5 py-1 text-xs gap-1.5'
  }[size];

  const variantStyles = {
    gold: 'bg-amber-500/15 border-amber-500/30 text-amber-800 dark:text-[#f8c22d]',
    emerald: 'bg-emerald-500/15 border-emerald-500/30 text-emerald-800 dark:text-emerald-300',
    sapphire: 'bg-blue-500/15 border-blue-500/30 text-blue-800 dark:text-blue-300',
    rose: 'bg-rose-500/15 border-rose-500/30 text-rose-800 dark:text-rose-300',
    neutral: 'bg-white/60 dark:bg-white/10 border-white/60 dark:border-white/15 text-slate-700 dark:text-slate-300'
  }[variant];

  return (
    <span
      className={`inline-flex items-center font-mono font-bold rounded-full border backdrop-blur-md shadow-xs ${sizeClasses} ${variantStyles} ${className}`}
    >
      {pulse && (
        <span className="w-1.5 h-1.5 rounded-full bg-current animate-pulse shrink-0" />
      )}
      {icon && <span className="shrink-0">{icon}</span>}
      <span className="truncate">{children}</span>
    </span>
  );
};
