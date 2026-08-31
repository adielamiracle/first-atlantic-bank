import React, { useState, useRef, useEffect } from 'react';

export interface GlassSliderProps {
  value: number;
  onChange: (val: number) => void;
  min?: number;
  max?: number;
  step?: number;
  label?: string;
  unit?: string;
  showValueBubble?: boolean;
  showMinMax?: boolean;
  stepTicks?: boolean;
  variant?: 'gold' | 'sapphire' | 'emerald' | 'default';
  className?: string;
  disabled?: boolean;
}

export const GlassSlider: React.FC<GlassSliderProps> = ({
  value,
  onChange,
  min = 0,
  max = 100,
  step = 1,
  label,
  unit = '',
  showValueBubble = true,
  showMinMax = true,
  stepTicks = false,
  variant = 'gold',
  className = '',
  disabled = false
}) => {
  const [isDragging, setIsDragging] = useState(false);
  const trackRef = useRef<HTMLDivElement>(null);

  const percentage = Math.min(100, Math.max(0, ((value - min) / (max - min)) * 100));

  const variantGradients = {
    gold: 'from-amber-400 via-[#c5a880] to-amber-600 shadow-[0_0_15px_rgba(197,168,128,0.4)]',
    sapphire: 'from-blue-400 via-indigo-500 to-blue-600 shadow-[0_0_15px_rgba(59,130,246,0.4)]',
    emerald: 'from-emerald-400 via-teal-500 to-emerald-600 shadow-[0_0_15px_rgba(16,185,129,0.4)]',
    default: 'from-slate-300 via-slate-400 to-slate-500 shadow-[0_0_10px_rgba(148,163,184,0.3)]'
  }[variant];

  const variantThumbRings = {
    gold: 'border-[#c5a880] ring-[#c5a880]/30',
    sapphire: 'border-blue-500 ring-blue-500/30',
    emerald: 'border-emerald-500 ring-emerald-500/30',
    default: 'border-slate-400 ring-slate-400/30'
  }[variant];

  const handlePointer = (clientX: number) => {
    if (!trackRef.current || disabled) return;
    const rect = trackRef.current.getBoundingClientRect();
    const ratio = Math.max(0, Math.min(1, (clientX - rect.left) / rect.width));
    const rawVal = min + ratio * (max - min);
    const steppedVal = Math.round(rawVal / step) * step;
    const clampedVal = Math.min(max, Math.max(min, steppedVal));
    onChange(clampedVal);
  };

  const handleMouseDown = (e: React.MouseEvent) => {
    setIsDragging(true);
    handlePointer(e.clientX);
  };

  const handleTouchStart = (e: React.TouchEvent) => {
    setIsDragging(true);
    if (e.touches.length > 0) {
      handlePointer(e.touches[0].clientX);
    }
  };

  useEffect(() => {
    const handleMouseMove = (e: MouseEvent) => {
      if (isDragging) {
        handlePointer(e.clientX);
      }
    };
    const handleTouchMove = (e: TouchEvent) => {
      if (isDragging && e.touches.length > 0) {
        handlePointer(e.touches[0].clientX);
      }
    };
    const handleMouseUp = () => setIsDragging(false);

    if (isDragging) {
      window.addEventListener('mousemove', handleMouseMove);
      window.addEventListener('mouseup', handleMouseUp);
      window.addEventListener('touchmove', handleTouchMove);
      window.addEventListener('touchend', handleMouseUp);
    }
    return () => {
      window.removeEventListener('mousemove', handleMouseMove);
      window.removeEventListener('mouseup', handleMouseUp);
      window.removeEventListener('touchmove', handleTouchMove);
      window.removeEventListener('touchend', handleMouseUp);
    };
  }, [isDragging, min, max, step]);

  return (
    <div className={`w-full space-y-2 select-none ${disabled ? 'opacity-50 pointer-events-none' : ''} ${className}`}>
      {/* Label and Current Readout */}
      {(label || showValueBubble) && (
        <div className="flex items-center justify-between text-xs font-semibold">
          {label && <span className="text-slate-700 dark:text-slate-300">{label}</span>}
          <div className="flex items-center gap-1 px-2.5 py-0.5 rounded-full bg-white/70 dark:bg-white/10 backdrop-blur-md border border-white/60 dark:border-white/15 text-xs font-mono font-bold text-slate-900 dark:text-white shadow-xs">
            <span>{value.toLocaleString()}</span>
            {unit && <span className="text-[10px] text-slate-500 dark:text-slate-400">{unit}</span>}
          </div>
        </div>
      )}

      {/* Slider Interactive Track Area */}
      <div
        ref={trackRef}
        onMouseDown={handleMouseDown}
        onTouchStart={handleTouchStart}
        className="relative py-3 cursor-pointer touch-none"
      >
        {/* Track Background */}
        <div className="relative h-2.5 w-full rounded-full glass-slider-track overflow-hidden">
          {/* Active Liquid Gradient Fill */}
          <div
            className={`absolute top-0 bottom-0 left-0 bg-gradient-to-r ${variantGradients} rounded-full transition-all duration-75`}
            style={{ width: `${percentage}%` }}
          >
            {/* Shimmer light bar across fill */}
            <div className="absolute inset-0 bg-gradient-to-r from-transparent via-white/30 to-transparent" />
          </div>
        </div>

        {/* Draggable Glass Marble Thumb */}
        <div
          className="absolute top-1/2 -translate-y-1/2 -translate-x-1/2 transition-transform duration-75"
          style={{ left: `${percentage}%` }}
        >
          <div
            className={`w-6 h-6 rounded-full bg-white/95 dark:bg-slate-900/90 backdrop-blur-md border-2 ${variantThumbRings} ring-4 flex items-center justify-center shadow-lg transition-transform ${
              isDragging ? 'scale-125' : 'hover:scale-110'
            }`}
          >
            {/* Inner jewel reflection dot */}
            <div className="w-1.5 h-1.5 rounded-full bg-[#c5a880] shadow-[0_0_6px_#c5a880]" />
          </div>

          {/* Floating Tooltip Bubble when Dragging */}
          {showValueBubble && isDragging && (
            <div className="absolute -top-9 left-1/2 -translate-x-1/2 px-2 py-0.5 rounded-md bg-slate-900/90 dark:bg-white/90 text-white dark:text-slate-900 text-[10px] font-mono font-bold whitespace-nowrap shadow-xl backdrop-blur-md pointer-events-none animate-in fade-in zoom-in-75">
              {value} {unit}
            </div>
          )}
        </div>
      </div>

      {/* Min / Max Range Markers */}
      {showMinMax && (
        <div className="flex justify-between items-center text-[10px] font-mono text-slate-400 dark:text-slate-500">
          <span>{min} {unit}</span>
          {stepTicks && (
            <span className="text-[9px] opacity-70">Step: {step}</span>
          )}
          <span>{max} {unit}</span>
        </div>
      )}
    </div>
  );
};
