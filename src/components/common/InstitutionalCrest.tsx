import React from 'react';
import { Landmark } from 'lucide-react';

interface CrestProps {
  size?: 'sm' | 'md' | 'lg';
  variant?: 'light' | 'dark' | 'gold';
  showSubtitle?: boolean;
}

export const InstitutionalCrest: React.FC<CrestProps> = ({
  size = 'md',
  variant = 'light',
  showSubtitle = true,
}) => {
  const isLight = variant === 'light';
  const isGold = variant === 'gold';

  const iconSizes = {
    sm: 'w-7 h-7 p-1.5',
    md: 'w-9 h-9 p-2',
    lg: 'w-12 h-12 p-2.5',
  };

  const titleSizes = {
    sm: 'text-sm font-semibold tracking-wider',
    md: 'text-base font-semibold tracking-widest',
    lg: 'text-xl font-bold tracking-widest',
  };

  const subSizes = {
    sm: 'text-[9px] tracking-[0.2em]',
    md: 'text-[10px] tracking-[0.25em]',
    lg: 'text-xs tracking-[0.3em]',
  };

  return (
    <div className="flex items-center gap-3 select-none">
      <div
        className={`${iconSizes[size]} rounded-lg bg-gradient-to-b from-[#0e2746] to-[#08172b] border border-[#c5a880]/30 shadow-md flex items-center justify-center flex-shrink-0`}
      >
        <Landmark className="w-full h-full text-[#d4af37]" />
      </div>
      <div className="flex flex-col">
        <span
          className={`${titleSizes[size]} font-serif uppercase ${
            isLight ? 'text-slate-900' : isGold ? 'text-[#f5e6cc]' : 'text-white'
          }`}
        >
          First Atlantic
        </span>
        {showSubtitle && (
          <span
            className={`${subSizes[size]} font-sans font-medium uppercase ${
              isLight ? 'text-[#8c6d37]' : 'text-[#c5a880]'
            }`}
          >
            Bank &amp; Trust
          </span>
        )}
      </div>
    </div>
  );
};
