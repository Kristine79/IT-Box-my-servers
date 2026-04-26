'use client';

import { useState } from 'react';
import { useAuth } from '@/lib/providers';
import { Lock, CreditCard, Check, LogOut } from 'lucide-react';
import { Button } from './ui/button';
import { useTranslation } from 'react-i18next';
import { toast } from 'sonner';

export function Paywall() {
  const { logout, user } = useAuth();
  const { t } = useTranslation();
  const [loading, setLoading] = useState(false);

  const handleCheckout = async () => {
    setLoading(true);
    try {
      const res = await fetch('/api/billing/create-payment', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ uid: user?.uid, email: user?.email })
      });
      const data = await res.json();
      if (data.url) {
        window.location.href = data.url;
      } else {
        toast.error('Failed to initialize payment. Please try again.');
        setLoading(false);
      }
    } catch (e) {
      console.error(e);
      toast.error('Error connecting to payment provider. Please try again later.');
      setLoading(false);
    }
  };

  return (
    <div className="flex h-screen w-full items-center justify-center bg-[var(--neu-bg)] text-[var(--neu-text)] p-4">
      <div className="neu-panel max-w-lg w-full p-8 md:p-12 text-center rounded-3xl relative overflow-hidden">
        <div className="absolute top-0 left-0 right-0 h-2 bg-[var(--neu-accent)]" />
        
        <div className="neu-panel-inset w-20 h-20 rounded-full mx-auto flex items-center justify-center text-[var(--neu-accent)] mb-8">
          <Lock className="w-8 h-8" />
        </div>
        
        <h1 className="text-3xl font-bold mb-4">{t('paywall_title')}</h1>
        <p className="text-[var(--neu-text-muted)] mb-8 leading-relaxed">
          {t('paywall_desc')}
        </p>

        <div className="neu-panel-inset p-6 mb-8 text-left rounded-2xl">
          <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-2 sm:gap-4 mb-6">
             <span className="font-bold text-lg leading-tight">{t('full_access_label')}</span>
             <span className="text-2xl font-bold text-[var(--neu-accent)] whitespace-nowrap">300 ₽</span>
          </div>
          <ul className="space-y-3">
             <li className="flex items-center gap-3 text-sm font-medium">
               <div className="text-emerald-500 bg-emerald-500/10 p-1 rounded-full"><Check className="w-3 h-3"/></div> 
               {t('unlimited_items')}
             </li>
             <li className="flex items-center gap-3 text-sm font-medium">
               <div className="text-emerald-500 bg-emerald-500/10 p-1 rounded-full"><Check className="w-3 h-3"/></div> 
               {t('secure_storage')}
             </li>
             <li className="flex items-center gap-3 text-sm font-medium">
               <div className="text-emerald-500 bg-emerald-500/10 p-1 rounded-full"><Check className="w-3 h-3"/></div> 
               {t('share_links')}
             </li>
          </ul>
        </div>

        <button 
          onClick={handleCheckout} 
          disabled={loading}
          className="neu-button neu-button-accent w-full py-4 text-base font-bold flex items-center justify-center gap-2 mb-6 disabled:opacity-70"
        >
          {loading ? t('preparing_payment') : (
            <>
              <CreditCard className="w-5 h-5" /> 
              {t('pay_btn')}
            </>
          )}
        </button>
        
        <button 
           onClick={logout} 
           className="text-sm font-semibold flex flex-row items-center justify-center mx-auto gap-2 outline-none text-[var(--neu-text-muted)] hover:text-red-500 transition-colors"
        >
           <LogOut className="w-4 h-4" /> 
           {t('logout')}
        </button>
      </div>
    </div>
  );
}
