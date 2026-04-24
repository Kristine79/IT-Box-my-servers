'use client';

import { useState, useEffect } from 'react';
import { motion } from 'motion/react';
import { useTranslation } from 'react-i18next';

export const LoadingScreen = () => {
  const { t } = useTranslation();
  const [mounted, setMounted] = useState(false);
  const [key, setKey] = useState(0);

  useEffect(() => {
    setMounted(true);
    const interval = setInterval(() => {
      setKey(k => k + 1);
    }, 3500); // Wait for all letters to fall + some hold time, then repeat
    return () => clearInterval(interval);
  }, []);

  const text = "Stack Box";
  const letters = text.split("");

  return (
    <div className="fixed inset-0 z-[9999] flex flex-col items-center justify-center bg-[var(--neu-bg)]">
      
      {/* Box container */}
      <div 
        className="relative w-[300px] h-[100px] border-b-[6px] border-x-[6px] border-[var(--neu-accent)] rounded-b-2xl overflow-hidden flex items-end justify-center pb-4"
        style={{
          boxShadow: 'inset 0 -10px 20px rgba(0,0,0,0.05), var(--neu-shadow)',
          backgroundColor: 'var(--neu-bg)'
        }}
      >
        {/* Letters container */}
        <div className="flex" key={key}>
          {letters.map((char, index) => (
            <motion.span
              key={index}
              initial={{ y: -120, opacity: 0 }}
              animate={{ y: 0, opacity: 1 }}
              transition={{
                duration: 0.6,
                delay: index * 0.15,
                ease: "easeOut",
                type: "spring",
                stiffness: 150,
                damping: 10
              }}
              className="text-[24px] font-bold text-[var(--neu-accent)] uppercase px-[1px]"
            >
              {char === " " ? "\u00A0" : char}
            </motion.span>
          ))}
        </div>
      </div>
      
      <motion.div 
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ delay: 0.5 }}
        className="mt-8 text-center"
      >
        <p className="text-[var(--neu-text-muted)] font-bold tracking-widest text-sm uppercase animate-pulse">
          {mounted ? t('loading') : 'Loading...'}
        </p>
      </motion.div>
    </div>
  );
};
