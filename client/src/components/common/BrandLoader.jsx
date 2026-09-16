import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Sparkles, Leaf } from 'lucide-react';

export function BrandLoader({ minDisplayTime = 1100, onComplete }) {
  const [isVisible, setIsVisible] = useState(true);
  const [progress, setProgress] = useState(20);

  useEffect(() => {
    const interval = setInterval(() => {
      setProgress((prev) => {
        if (prev >= 100) {
          clearInterval(interval);
          return 100;
        }
        const step = Math.floor(Math.random() * 25) + 15;
        const next = prev + step;
        return next > 100 ? 100 : next;
      });
    }, 120);

    const timer = setTimeout(() => {
      setProgress(100);
      setTimeout(() => {
        setIsVisible(false);
        if (onComplete) onComplete();
      }, 250);
    }, minDisplayTime);

    return () => {
      clearInterval(interval);
      clearTimeout(timer);
    };
  }, [minDisplayTime, onComplete]);

  return (
    <AnimatePresence>
      {isVisible && (
        <motion.div
          key="fibax-loader"
          initial={{ opacity: 1 }}
          exit={{ opacity: 0, scale: 1.02 }}
          transition={{ duration: 0.45, ease: [0.22, 1, 0.36, 1] }}
          className="fixed inset-0 z-[9999] flex flex-col items-center justify-center bg-[#fbf9f4] select-none"
        >
          {/* Subtle botanical ambient glow */}
          <div className="absolute w-80 h-80 rounded-full bg-gradient-to-tr from-emerald-500/15 via-amber-400/15 to-transparent blur-3xl pointer-events-none" />

          <div className="relative z-10 flex flex-col items-center max-w-xs sm:max-w-sm text-center px-6">
            {/* Logo Container with glowing rings */}
            <div className="relative mb-6">
              {/* Rotating botanical accent ring */}
              <motion.div
                animate={{ rotate: 360 }}
                transition={{ repeat: Infinity, duration: 10, ease: 'linear' }}
                className="absolute -inset-3 rounded-full border-2 border-dashed border-forest/20"
              />

              <motion.div
                initial={{ scale: 0.82, opacity: 0 }}
                animate={{ scale: 1, opacity: 1 }}
                transition={{ duration: 0.45, ease: 'easeOut' }}
                className="relative w-24 h-24 sm:w-28 sm:h-28 rounded-2xl bg-white shadow-xl border border-sand-border flex items-center justify-center p-3"
              >
                <img
                  src="/fibax-logo.png"
                  alt="Fibax Pharma"
                  className="w-full h-full object-contain"
                />
              </motion.div>

              {/* Floating Leaf badge */}
              <motion.div
                initial={{ scale: 0 }}
                animate={{ scale: 1 }}
                transition={{ delay: 0.25, type: 'spring', stiffness: 220 }}
                className="absolute -bottom-2 -right-2 w-8 h-8 rounded-full bg-forest text-amber-300 flex items-center justify-center shadow-md border-2 border-white"
              >
                <Leaf className="w-4 h-4" />
              </motion.div>
            </div>

            {/* Title & Slogan */}
            <motion.div
              initial={{ opacity: 0, y: 8 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.15, duration: 0.4 }}
              className="space-y-1 mb-6"
            >
              <h3 className="font-heading font-extrabold text-forest-deep text-lg sm:text-xl tracking-tight">
                FIBAX PHARMA
              </h3>
              <p className="text-xs font-semibold text-charcoal-muted uppercase tracking-widest flex items-center justify-center gap-1.5">
                <Sparkles className="w-3 h-3 text-amber-500 fill-amber-400" />
                <span>Pure Ayurveda • WHO-GMP Certified</span>
              </p>
            </motion.div>

            {/* Sleek Gradient Progress Bar */}
            <div className="w-48 sm:w-56 h-1.5 bg-sand-border/60 rounded-full overflow-hidden mb-3 p-0.5">
              <motion.div
                className="h-full bg-gradient-to-r from-forest via-leaf to-amber-400 rounded-full"
                animate={{ width: `${progress}%` }}
                transition={{ ease: 'easeOut', duration: 0.2 }}
              />
            </div>

            <motion.p
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              transition={{ delay: 0.25 }}
              className="text-[11px] font-medium text-charcoal-subtle"
            >
              Preparing authentic Ayurvedic formulations...
            </motion.p>
          </div>
        </motion.div>
      )}
    </AnimatePresence>
  );
}
