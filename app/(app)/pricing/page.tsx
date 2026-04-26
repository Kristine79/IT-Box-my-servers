'use client';

import { useTranslation } from "react-i18next";
import { Check, Zap, Shield, Crown, Loader2 } from "lucide-react";
import { motion } from "motion/react";
import { useEffect, useState } from 'react';
import { doc, getDoc } from 'firebase/firestore';
import { db, useAuth } from '@/lib/providers';
import { defaultPricing } from '@/lib/contentDefaults';
import { toast } from 'sonner';

const container = {
  hidden: { opacity: 0 },
  show: {
    opacity: 1,
    transition: {
      staggerChildren: 0.04
    }
  }
};

const item = {
  hidden: { opacity: 0, y: 20 },
  show: { opacity: 1, y: 0 }
};

export default function PricingPage() {
  const { t, i18n } = useTranslation();
  const { user } = useAuth();
  const isEn = i18n.language === 'en';
  const lang = isEn ? 'en' : 'ru';
  const [content, setContent] = useState(defaultPricing);
  const [loading, setLoading] = useState(true);
  const [loadingPlanId, setLoadingPlanId] = useState<string | null>(null);

  useEffect(() => {
    getDoc(doc(db, 'siteContent', 'pricing')).then(snap => {
      if (snap.exists()) setContent(snap.data() as typeof defaultPricing);
    }).catch(console.error).finally(() => setLoading(false));
  }, []);

  const handleCheckout = async (planId: string, price: string, planName: string) => {
    if (planId === 'free') return;
    if (!user || user.isAnonymous) {
      toast.error('Войдите в аккаунт для оформления подписки');
      return;
    }
    setLoadingPlanId(planId);
    try {
      const res = await fetch('/api/billing/create-payment', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          uid: user.uid,
          email: user.email,
          planId,
          amount: price,
          description: `StackBox — ${planName}`
        })
      });
      const data = await res.json();
      if (data.url) {
        window.location.href = data.url;
      } else {
        toast.error('Не удалось создать платёж. Попробуйте ещё раз.');
      }
    } catch (e) {
      console.error(e);
      toast.error('Ошибка подключения к платёжному сервису.');
    } finally {
      setLoadingPlanId(null);
    }
  };

  const c = content[lang] || defaultPricing[lang];
  const plans = c.plans;

  if (loading) return <div className="p-8 opacity-50">{t('loading')}</div>;

  return (
    <motion.div 
      variants={container}
      initial="hidden"
      animate="show"
      className="max-w-7xl mx-auto space-y-12 pb-20"
    >
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{
          __html: JSON.stringify({
            "@context": "https://schema.org",
            "@type": "Product",
            "name": "StackBox Subscription",
            "description": "Subscription plans for infrastructure management and credential vault.",
            "offers": plans.map(plan => ({
              "@type": "Offer",
              "name": plan.name,
              "price": plan.price,
              "priceCurrency": "RUB",
              "itemOffered": {
                "@type": "Service",
                "name": plan.name,
                "description": plan.features.join(', ')
              }
            }))
          })
        }}
      />
      <motion.div variants={item} className="text-center space-y-4">
        <h1 className="text-4xl md:text-5xl font-bold tracking-tight">{t('pricing')}</h1>
        <p className="text-lg text-[var(--neu-text-muted)] max-w-2xl mx-auto">
          {t('pricing_subtitle')}
        </p>
      </motion.div>

      <div className="grid md:grid-cols-3 gap-8">
        {plans.map((plan, idx) => {
          const PlanIcon = [Zap, Shield, Crown][idx];
          const planColor = ['text-blue-400', 'text-purple-400', 'text-amber-500'][idx];
          return (
          <motion.div 
            key={plan.id}
            variants={item}
            className={`neu-panel p-8 flex flex-col h-full relative overflow-hidden transition-all duration-300 hover:scale-[1.02] ${plan.current ? 'border-2 border-[var(--neu-accent)]/30' : ''}`}
          >
            {plan.current && (
              <div className="absolute top-0 right-0 bg-[var(--neu-accent)] text-white text-[10px] font-bold px-3 py-1 rounded-bl-xl uppercase tracking-tighter">
                {t('plan_current')}
              </div>
            )}
            
            <div className="flex items-center gap-4 mb-8">
              <div className={`neu-panel-inset p-3 rounded-2xl ${planColor}`}>
                <PlanIcon className="w-8 h-8" />
              </div>
              <div>
                <h3 className="text-xl font-bold">{plan.name}</h3>
              </div>
            </div>

            <div className="mb-8">
              <div className="flex items-baseline gap-1">
                <span className="text-4xl font-bold">{plan.price} ₽</span>
                <span className="text-[var(--neu-text-muted)]">{plan.duration}</span>
              </div>
            </div>

            <div className="flex-1 space-y-4 mb-10">
              {plan.features.map((feature, i) => (
                <div key={i} className="flex items-start gap-3">
                  <div className="mt-1 neu-panel-inset rounded-full p-0.5 text-green-500">
                    <Check className="w-3 h-3" />
                  </div>
                  <span className="text-sm opacity-90">{feature}</span>
                </div>
              ))}
            </div>

            <button
              className={`neu-button w-full py-4 font-bold transition-all flex items-center justify-center gap-2 ${plan.current || plan.id === 'free' ? 'opacity-50 cursor-not-allowed' : 'neu-button-accent hover:opacity-90'}`}
              onClick={() => handleCheckout(plan.id, plan.price, plan.name)}
              disabled={!!loadingPlanId || plan.id === 'free'}
              aria-label={plan.current ? t('plan_current') : `${t('plan_choose')} ${plan.name}`}
            >
              {loadingPlanId === plan.id ? (
                <><Loader2 className="w-4 h-4 animate-spin" /> {isEn ? 'Redirecting...' : 'Переход...'}</>
              ) : (
                plan.current ? t('plan_current') : t('plan_choose')
              )}
            </button>
          </motion.div>
          );
        })}
      </div>

      <motion.div variants={item} className="neu-panel p-8 md:p-12 text-center bg-muted/30">
        <h3 className="text-2xl font-bold mb-4">{c.enterpriseTitle}</h3>
        <p className="text-[var(--neu-text-muted)] mb-8 max-w-xl mx-auto">
          {c.enterpriseDesc}
        </p>
        <a href="mailto:info@premiumwebsite.ru" className="neu-button neu-button-accent px-10 py-4 font-bold inline-block">
          {c.contactSales}
        </a>
      </motion.div>
    </motion.div>
  );
}
