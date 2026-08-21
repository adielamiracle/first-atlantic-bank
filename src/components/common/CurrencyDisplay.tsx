import React from 'react';
import { CurrencyCode } from '../../types';

interface CurrencyDisplayProps {
  amountMinor: number;
  currency: CurrencyCode;
  showSign?: boolean;
  className?: string;
  size?: 'sm' | 'md' | 'lg' | 'xl' | '2xl';
  precision?: number;
}

export const CurrencyDisplay: React.FC<CurrencyDisplayProps> = ({
  amountMinor,
  currency,
  showSign = false,
  className = '',
  size = 'md',
  precision = 2
}) => {
  const isPositive = amountMinor > 0;
  const isNegative = amountMinor < 0;
  const absAmount = Math.abs(amountMinor) / 100;

  const symbol = currency === 'USD' ? '$' : currency === 'GBP' ? '£' : '€';

  const sizeClasses = {
    sm: 'text-sm font-medium',
    md: 'text-base font-semibold',
    lg: 'text-lg font-bold',
    xl: 'text-2xl font-bold tracking-tight',
    '2xl': 'text-3xl sm:text-4xl font-extrabold tracking-tight'
  };

  const formattedNum = absAmount.toLocaleString('en-US', {
    minimumFractionDigits: precision,
    maximumFractionDigits: precision
  });

  const sign = showSign ? (isPositive ? '+' : isNegative ? '-' : '') : isNegative ? '-' : '';

  return (
    <span className={`inline-flex items-baseline font-mono tabular-nums ${sizeClasses[size]} ${className}`}>
      {sign && <span className="mr-0.5">{sign}</span>}
      <span className="opacity-90 font-serif mr-0.5">{symbol}</span>
      <span>{formattedNum}</span>
    </span>
  );
};
