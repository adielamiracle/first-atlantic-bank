import React from 'react';
import { Loader2 } from 'lucide-react';

export interface GlassButtonProps extends React.ButtonHTMLAttributes<HTMLButtonElement> {
  variant?: 'primary-gold' | 'glass-default' | 'glass-frosted' | 'glass-emerald' | 'glass-sapphire' | 'glass-danger' | 'glass-ghost';
  size?: 'xs' | 'sm' | 'md' | 'lg' | 'xl' | 'icon-sm' | 'icon-md' | 'icon-lg';
  pill?: boolean;
  glow?: boolean;
  loading?: boolean;
  iconLeft?: React.ReactNode;
  iconRight?: React.ReactNode;
}

export const GlassButton: React.FC<GlassButtonProps> = ({
  variant = 'glass-default',
  size = 'md',
  pill = false,
  glow = false,
  loading = false,
  iconLeft,
  iconRight,
  className = '',
  disabled,
  children,
  ...props
}) => {
  const sizeClasses = {
    xs: 'px-2.5 py-1 text-[11px] font-medium gap-1 min-h-[28px]',
    sm: 'px-3.5 py-1.5 text-xs font-semibold gap-1.5 min-h-[34px]',
    md: 'px-4 py-2 text-xs sm:text-sm font-semibold gap-2 min-h-[40px]',
    lg: 'px-6 py-2.5 text-sm sm:text-base font-bold gap-2.5 min-h-[46px]',
    xl: 'px-7 py-3 text-base sm:text-lg font-bold gap-3 min-h-[52px]',
    'icon-sm': 'p-1.5 w-8 h-8 flex items-center justify-center',
    'icon-md': 'p-2 w-10 h-10 flex items-center justify-center',
    'icon-lg': 'p-2.5 w-12 h-12 flex items-center justify-center'
  }[size];

  const roundedClasses = pill ? 'rounded-full' : size.startsWith('icon') ? 'rounded-xl' : 'rounded-xl';

  const variantClasses = {
    'primary-gold':
      'glass-btn-gold text-[#8c6d37] dark:text-[#f8c22d] font-bold shadow-md hover:shadow-lg',
    'glass-default':
      'glass-btn text-slate-800 dark:text-slate-100 font-semibold',
    'glass-frosted':
      'bg-white/80 dark:bg-white/10 hover:bg-white/95 dark:hover:bg-white/20 text-slate-900 dark:text-white backdrop-blur-md border border-white/70 dark:border-white/20 shadow-md',
    'glass-emerald':
      'bg-emerald-500/15 hover:bg-emerald-500/25 text-emerald-800 dark:text-emerald-300 border border-emerald-500/30 backdrop-blur-md shadow-md shadow-emerald-950/5',
    'glass-sapphire':
      'bg-blue-600/15 hover:bg-blue-600/25 text-blue-800 dark:text-blue-300 border border-blue-500/30 backdrop-blur-md shadow-md shadow-blue-950/10',
    'glass-danger':
      'bg-rose-500/15 hover:bg-rose-500/25 text-rose-700 dark:text-rose-300 border border-rose-500/30 backdrop-blur-md shadow-md',
    'glass-ghost':
      'bg-transparent hover:bg-white/40 dark:hover:bg-white/10 text-slate-700 dark:text-slate-300 border border-transparent hover:border-white/30 backdrop-blur-xs'
  }[variant];

  return (
    <button
      disabled={disabled || loading}
      className={`relative inline-flex items-center justify-center select-none cursor-pointer overflow-hidden transition-all duration-200 active:scale-95 disabled:opacity-50 disabled:cursor-not-allowed disabled:active:scale-100 ${roundedClasses} ${sizeClasses} ${variantClasses} ${
        glow ? 'ring-2 ring-[#c5a880]/50 shadow-[0_0_20px_rgba(197,168,128,0.3)]' : ''
      } ${className}`}
      {...props}
    >
      {/* Specular Inner Light Reflection */}
      <span className="pointer-events-none absolute inset-x-0 top-0 h-1/2 bg-gradient-to-b from-white/40 dark:from-white/15 to-transparent rounded-t-xl" />

      {loading ? (
        <Loader2 className="w-4 h-4 animate-spin shrink-0" />
      ) : (
        <>
          {iconLeft && <span className="shrink-0">{iconLeft}</span>}
          {children && <span className="truncate">{children}</span>}
          {iconRight && <span className="shrink-0">{iconRight}</span>}
        </>
      )}
    </button>
  );
};
