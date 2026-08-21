import React, { useEffect } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { Shield, Lock, Landmark } from 'lucide-react';

interface LoadingSplashProps {
  onComplete: () => void;
}

export const LoadingSplash: React.FC<LoadingSplashProps> = ({ onComplete }) => {
  useEffect(() => {
    const timer = setTimeout(() => {
      onComplete();
    }, 1800);
    return () => clearTimeout(timer);
  }, [onComplete]);

  return (
    <motion.div
      id="bank-boot-splash"
      className="fixed inset-0 z-50 flex flex-col items-center justify-center bg-[#071322] text-white select-none px-6"
      initial={{ opacity: 1 }}
      exit={{ opacity: 0, transition: { duration: 0.6, ease: 'easeInOut' } }}
    >
      {/* Background ambient subtle glow */}
      <div className="absolute inset-0 bg-[radial-gradient(ellipse_at_center,_var(--tw-gradient-stops))] from-[#132c4d]/40 via-[#071322] to-[#040a12] pointer-events-none" />

      <div className="relative flex flex-col items-center max-w-md text-center">
        {/* Animated Crest Icon */}
        <motion.div
          initial={{ scale: 0.8, opacity: 0, y: 15 }}
          animate={{ scale: 1, opacity: 1, y: 0 }}
          transition={{ duration: 0.8, ease: [0.16, 1, 0.3, 1] }}
          className="relative mb-6 flex items-center justify-center"
        >
          <div className="w-20 h-20 rounded-2xl bg-gradient-to-b from-[#1c385c] to-[#0c1f36] border border-[#c5a880]/30 shadow-2xl flex items-center justify-center p-3 relative overflow-hidden">
            {/* Subtle inner highlight */}
            <div className="absolute inset-x-0 top-0 h-[1px] bg-gradient-to-r from-transparent via-[#c5a880]/60 to-transparent" />
            
            <div className="w-14 h-14 rounded-xl bg-[#09182b] flex items-center justify-center border border-[#c5a880]/20">
              <Landmark className="w-7 h-7 text-[#d4af37]" />
            </div>
          </div>
          
          {/* Subtle pulse ring */}
          <motion.div 
            className="absolute inset-0 rounded-2xl border border-[#c5a880]/20"
            animate={{ scale: [1, 1.15, 1.25], opacity: [0.6, 0.2, 0] }}
            transition={{ duration: 1.8, repeat: Infinity, ease: 'easeOut' }}
          />
        </motion.div>

        {/* Wordmark */}
        <motion.div
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.3, duration: 0.7 }}
          className="space-y-1.5"
        >
          <h1 className="text-2xl sm:text-3xl font-semibold tracking-[0.25em] text-white font-serif uppercase">
            First Atlantic
          </h1>
          <p className="text-xs sm:text-sm font-medium tracking-[0.4em] text-[#c5a880] uppercase">
            Bank &amp; Trust
          </p>
        </motion.div>

        {/* Established & Jurisdiction line */}
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 0.6, duration: 0.6 }}
          className="mt-6 flex items-center gap-3 text-[11px] text-slate-400 font-mono tracking-wider"
        >
          <span>NEW YORK</span>
          <span className="w-1 h-1 rounded-full bg-[#c5a880]/60" />
          <span>LONDON</span>
          <span className="w-1 h-1 rounded-full bg-[#c5a880]/60" />
          <span>EST. 1894</span>
        </motion.div>

        {/* Security Progress Bar */}
        <motion.div 
          className="mt-8 w-48 h-1 bg-slate-800/80 rounded-full overflow-hidden"
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 0.4 }}
        >
          <motion.div
            className="h-full bg-gradient-to-r from-[#9e7d4d] via-[#d4af37] to-[#e6ca65]"
            initial={{ width: '0%' }}
            animate={{ width: '100%' }}
            transition={{ duration: 1.4, ease: 'easeInOut' }}
          />
        </motion.div>

        <motion.div 
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 0.8 }}
          className="mt-3 flex items-center gap-1.5 text-[10px] text-slate-500 font-mono"
        >
          <Lock className="w-3 h-3 text-[#c5a880]/80" />
          <span>ESTABLISHING 256-BIT ENCRYPTED CORE CONNECTION...</span>
        </motion.div>
      </div>
    </motion.div>
  );
};
