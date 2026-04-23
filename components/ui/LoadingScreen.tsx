'use client';

import { useState, useEffect } from 'react';
import { motion } from 'motion/react';
import { useTranslation } from 'react-i18next';

export const LoadingScreen = () => {
  const { t } = useTranslation();
  const [mounted, setMounted] = useState(false);

  useEffect(() => {
    setMounted(true);
  }, []);

  return (
    <div className="fixed inset-0 z-[9999] flex flex-col items-center justify-center bg-[var(--neu-bg)]">
      <div className="relative w-24 h-24 flex items-center justify-center">
        {/* Neumorphic outer ring animating */}
        <motion.div 
          className="absolute inset-0 rounded-full neu-panel"
          animate={{
            scale: [1, 1.1, 1],
            boxShadow: [
              'var(--neu-shadow)',
              '10px 10px 20px rgba(0,0,0,0.2), -10px -10px 20px rgba(255,255,255,0.1)',
              'var(--neu-shadow)'
            ]
          }}
          transition={{
            duration: 2,
            repeat: Infinity,
            ease: "easeInOut"
          }}
        />
        
        {/* Glowing center */}
        <motion.div 
          className="w-12 h-12 rounded-full bg-[var(--neu-accent)] shadow-[0_0_20px_var(--neu-accent)]"
          animate={{
            opacity: [0.5, 1, 0.5],
            scale: [0.8, 1, 0.8]
          }}
          transition={{
            duration: 1.5,
            repeat: Infinity,
            ease: "easeInOut"
          }}
        />
      </div>
      
      <motion.div 
        initial={{ opacity: 0, y: 10 }}
        animate={{ opacity: 1, y: 0 }}
        className="mt-8 text-center"
      >
        <h2 className="text-xl font-bold tracking-widest text-[var(--neu-text)] uppercase mb-2">IT-Box</h2>
        <p className="text-[var(--neu-text-muted)] font-medium text-sm animate-pulse">
          {mounted ? t('loading') : 'Loading...'}
        </p>
      </motion.div>
    </div>
  );
};
