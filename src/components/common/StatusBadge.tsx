import React from 'react';

interface StatusBadgeProps {
  status: string;
  className?: string;
  size?: 'sm' | 'md';
}

export const StatusBadge: React.FC<StatusBadgeProps> = ({ status, className = '', size = 'md' }) => {
  let bg = 'bg-slate-100 text-slate-700 border-slate-200';

  switch (status.toUpperCase()) {
    case 'ACTIVE':
    case 'SETTLED':
    case 'APPROVED_AND_POSTED':
    case 'CLEARED':
    case 'TIER_2_VERIFIED_PREMIER':
    case 'TIER_3_INSTITUTIONAL':
    case 'OPERATIONAL':
    case 'RESOLVED':
      bg = 'bg-emerald-50 text-emerald-800 border-emerald-200/80';
      break;
    case 'PENDING':
    case 'PENDING_APPROVAL':
    case 'PENDING_VERIFICATION':
    case 'HELD':
    case 'HOLD_APPLIED':
    case 'UNDER_REVIEW':
    case 'IN_PROGRESS':
    case 'OPEN':
      bg = 'bg-amber-50 text-amber-800 border-amber-200/80';
      break;
    case 'FROZEN':
    case 'LOCKED':
    case 'RESTRICTED':
    case 'HIGH':
    case 'CRITICAL':
    case 'FAILED':
    case 'REJECTED':
      bg = 'bg-rose-50 text-rose-800 border-rose-200/80';
      break;
    case 'REVERSED':
    case 'DISMISSED':
    case 'DORMANT':
    case 'CLOSED':
      bg = 'bg-slate-100 text-slate-600 border-slate-200';
      break;
    default:
      bg = 'bg-slate-100 text-slate-700 border-slate-200';
  }

  const sizeClasses = size === 'sm' ? 'px-2 py-0.5 text-[10px]' : 'px-2.5 py-1 text-xs';

  return (
    <span
      className={`inline-flex items-center font-medium uppercase tracking-wider rounded-md border ${sizeClasses} ${bg} ${className}`}
    >
      <span className="w-1.5 h-1.5 rounded-full mr-1.5 bg-current opacity-70" />
      {status.replace(/_/g, ' ')}
    </span>
  );
};
