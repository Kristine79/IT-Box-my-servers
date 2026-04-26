'use client';

import { useState, useEffect } from 'react';
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
        {/* Neumorphic outer ring */}
        <div 
          className="absolute inset-0 rounded-full neu-panel animate-loading-ring"
        />
        
        {/* Glowing center */}
        <div 
          className="w-12 h-12 rounded-full bg-[var(--neu-accent)] shadow-[0_0_20px_var(--neu-accent)] animate-loading-pulse"
        />
      </div>
      
      <div className="mt-8 text-center animate-fade-in">
        <h2 className="text-xl font-bold tracking-widest text-[var(--neu-text)] uppercase mb-2">StackBox</h2>
        <p className="text-[var(--neu-text-muted)] font-medium text-sm animate-pulse">
          {mounted ? t('loading') : 'Loading...'}
        </p>
      </div>
    </div>
  );
};
