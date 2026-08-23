import React from 'react';

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

  const iconDimensions = {
    sm: 30,
    md: 40,
    lg: 52,
  };

  const titleSizes = {
    sm: 'text-sm font-semibold tracking-wider',
    md: 'text-base font-bold tracking-widest',
    lg: 'text-xl font-bold tracking-widest',
  };

  const subSizes = {
    sm: 'text-[8.5px] tracking-[0.25em]',
    md: 'text-[9.5px] tracking-[0.28em]',
    lg: 'text-[11px] tracking-[0.32em]',
  };

  const dimension = iconDimensions[size];

  return (
    <div className="flex items-center gap-3 select-none">
      {/* Bespoke Luxury Bank Emblem */}
      <div className="flex-shrink-0 relative group">
        <svg
          width={dimension}
          height={dimension}
          viewBox="0 0 48 48"
          fill="none"
          xmlns="http://www.w3.org/2000/svg"
          className="drop-shadow-md"
        >
          <defs>
            <linearGradient id="crestGoldGrad" x1="0%" y1="0%" x2="100%" y2="100%">
              <stop offset="0%" stopColor="#F5E6CC" />
              <stop offset="30%" stopColor="#D4AF37" />
              <stop offset="70%" stopColor="#AA822A" />
              <stop offset="100%" stopColor="#E2C98F" />
            </linearGradient>
            <linearGradient id="shieldBgGrad" x1="0%" y1="0%" x2="0%" y2="100%">
              <stop offset="0%" stopColor="#0E2338" />
              <stop offset="50%" stopColor="#091829" />
              <stop offset="100%" stopColor="#040C16" />
            </linearGradient>
            <linearGradient id="borderGrad" x1="0%" y1="0%" x2="100%" y2="100%">
              <stop offset="0%" stopColor="#E5CA95" stopOpacity="0.8" />
              <stop offset="50%" stopColor="#C5A880" stopOpacity="0.3" />
              <stop offset="100%" stopColor="#9C7838" stopOpacity="0.9" />
            </linearGradient>
          </defs>

          {/* Outer Shield Boundary */}
          <path
            d="M24 3L42 9V22C42 33.2 34.3 42.5 24 45.5C13.7 42.5 6 33.2 6 22V9L24 3Z"
            fill="url(#shieldBgGrad)"
            stroke="url(#borderGrad)"
            strokeWidth="1.5"
          />

          {/* Inner Inset Shield Ring */}
          <path
            d="M24 6.5L38.5 11.5V21.5C38.5 30.8 32.2 38.8 24 41.5C15.8 38.8 9.5 30.8 9.5 21.5V11.5L24 6.5Z"
            stroke="url(#crestGoldGrad)"
            strokeWidth="0.75"
            strokeOpacity="0.5"
          />

          {/* Classical Architectural Pediment / Capital Header */}
          <path
            d="M17 14.5H31L32 16.5H16L17 14.5Z"
            fill="url(#crestGoldGrad)"
          />

          {/* Neoclassical Institutional Columns */}
          <rect x="18" y="18" width="2.2" height="11" rx="0.5" fill="url(#crestGoldGrad)" />
          <rect x="22.9" y="18" width="2.2" height="11" rx="0.5" fill="url(#crestGoldGrad)" />
          <rect x="27.8" y="18" width="2.2" height="11" rx="0.5" fill="url(#crestGoldGrad)" />

          {/* Column Base Plinth */}
          <rect x="16" y="30" width="16" height="1.8" rx="0.4" fill="url(#crestGoldGrad)" />

          {/* Central Sovereign Monogram Star / Compass Accent */}
          <path
            d="M24 10.5L25.2 12.8L27.6 13.2L25.8 14.8L26.3 17.2L24 15.9L21.7 17.2L22.2 14.8L20.4 13.2L22.8 12.8L24 10.5Z"
            fill="url(#crestGoldGrad)"
          />

          {/* Foundation Diamond Accent */}
          <path
            d="M24 34.5L26 36.5L24 38.5L22 36.5L24 34.5Z"
            fill="url(#crestGoldGrad)"
          />
        </svg>
      </div>

      {/* Typography Pairing */}
      <div className="flex flex-col">
        <span
          className={`${titleSizes[size]} font-serif tracking-wider uppercase leading-none ${
            isLight ? 'text-slate-900' : isGold ? 'text-[#f5e6cc]' : 'text-white'
          }`}
        >
          First Atlantic
        </span>
        {showSubtitle && (
          <span
            className={`${subSizes[size]} font-sans font-semibold uppercase mt-1 leading-none ${
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
