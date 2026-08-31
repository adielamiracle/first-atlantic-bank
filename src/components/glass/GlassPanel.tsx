import React from 'react';

export interface GlassPanelProps extends React.HTMLAttributes<HTMLDivElement> {
  variant?: 'standard' | 'elevated' | 'ultra' | 'subtle' | 'gold' | 'sapphire';
  blur?: 'sm' | 'md' | 'lg' | 'xl' | '2xl';
  rounded?: 'sm' | 'md' | 'lg' | 'xl' | '2xl' | '3xl' | 'full';
  glow?: boolean;
  shimmer?: boolean;
  children?: React.ReactNode;
}

export const GlassPanel: React.FC<GlassPanelProps> = ({
  variant = 'standard',
  blur = 'lg',
  rounded = '2xl',
  glow = false,
  shimmer = false,
  className = '',
  children,
  ...props
}) => {
  const blurClasses = {
    sm: 'backdrop-blur-xs',
    md: 'backdrop-blur-sm',
    lg: 'backdrop-blur-md',
    xl: 'backdrop-blur-xl',
    '2xl': 'backdrop-blur-2xl'
  }[blur];

  const roundedClasses = {
    sm: 'rounded-md',
    md: 'rounded-lg',
    lg: 'rounded-xl',
    xl: 'rounded-2xl',
    '2xl': 'rounded-3xl',
    '3xl': 'rounded-[28px]',
    full: 'rounded-full'
  }[rounded];

  const variantClasses = {
    standard:
      'bg-white/75 dark:bg-[#0a192f]/70 border border-white/60 dark:border-white/10 shadow-lg shadow-black/5 dark:shadow-black/40',
    elevated:
      'bg-white/85 dark:bg-[#0f2444]/80 border border-white/80 dark:border-white/15 shadow-xl shadow-black/8 dark:shadow-black/60',
    ultra:
      'bg-white/40 dark:bg-[#071322]/55 border border-white/50 dark:border-[#c5a880]/30 shadow-2xl shadow-blue-900/10 dark:shadow-black/70',
    subtle:
      'bg-white/50 dark:bg-white/[0.04] border border-white/40 dark:border-white/10 shadow-sm',
    gold:
      'bg-gradient-to-br from-amber-50/80 via-white/70 to-amber-100/60 dark:from-[#1b263b]/80 dark:via-[#112233]/70 dark:to-amber-950/30 border border-amber-300/60 dark:border-[#c5a880]/40 shadow-xl shadow-amber-900/5 dark:shadow-black/50',
    sapphire:
      'bg-gradient-to-br from-blue-50/80 via-white/70 to-indigo-100/60 dark:from-[#0a1b33]/85 dark:via-[#07152b]/75 dark:to-blue-950/40 border border-blue-200/70 dark:border-blue-500/30 shadow-xl shadow-blue-950/10'
  }[variant];

  return (
    <div
      className={`relative overflow-hidden transition-all duration-200 ${blurClasses} ${roundedClasses} ${variantClasses} ${
        glow ? 'ring-1 ring-[#c5a880]/40 dark:ring-[#c5a880]/30 shadow-[0_0_25px_rgba(197,168,128,0.15)]' : ''
      } ${className}`}
      {...props}
    >
      {/* Top Specular Inner Reflection Sheen */}
      <div className="pointer-events-none absolute inset-x-0 top-0 h-px bg-gradient-to-r from-transparent via-white/80 dark:via-white/20 to-transparent" />
      
      {/* Optional Shimmer Aurora */}
      {shimmer && (
        <div className="pointer-events-none absolute inset-0 glass-shimmer opacity-40" />
      )}

      {children}
    </div>
  );
};
