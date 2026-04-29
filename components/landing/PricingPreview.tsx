'use client';

import { motion } from 'motion/react';
import { Button } from '@/components/ui/button';
import { Check, Sparkles, ArrowRight } from 'lucide-react';
import Link from 'next/link';

const plans = [
  {
    name: 'Бесплатный',
    price: '0',
    period: '/мес',
    description: 'Идеально для знакомства',
    features: [
      'До 3 серверов',
      'До 2 проектов',
      'Базовое шифрование',
      'AI-консультант',
      '14 дней пробный период',
    ],
    cta: 'Начать',
    popular: false,
  },
  {
    name: 'Стандарт',
    price: '999',
    period: '/мес',
    description: 'Для профессионалов',
    features: [
      'До 15 серверов',
      'До 10 проектов',
      'Расширенное шифрование',
      'Приоритетный AI',
      'Уведомления в Telegram',
      'Glassmorphism тема',
    ],
    cta: 'Попробовать',
    popular: true,
  },
  {
    name: 'Максимум',
    price: '2499',
    period: '/мес',
    description: 'Для команд',
    features: [
      'Безлимит серверов',
      'Безлимит проектов',
      'Максимальная безопасность',
      'Все темы оформления',
      'Командный доступ',
      'Персональная поддержка',
    ],
    cta: 'Выбрать',
    popular: false,
  },
];

export function PricingPreview() {
  return (
    <section id="pricing" className="py-24 px-6 relative">
      <div className="max-w-6xl mx-auto">
        <motion.div
          initial={{ opacity: 0, y: 30 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true, margin: '-100px' }}
          transition={{ duration: 0.6 }}
          className="text-center mb-16"
        >
          <h2 className="text-4xl md:text-5xl font-bold mb-4">
            Прозрачное ценообразование
          </h2>
          <p className="text-lg text-[var(--muted-foreground)] max-w-2xl mx-auto">
            Начните бесплатно, обновляйтесь когда понадобится
          </p>
        </motion.div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 max-w-5xl mx-auto">
          {plans.map((plan, i) => (
            <motion.div
              key={i}
              initial={{ opacity: 0, y: 30 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true, margin: '-50px' }}
              transition={{ duration: 0.5, delay: i * 0.1 }}
              className={`
                relative rounded-3xl p-8 overflow-hidden
                ${plan.popular
                  ? 'bg-white/80 dark:bg-white/[0.04] backdrop-blur-xl border-2 border-blue-200/50 dark:border-blue-500/20 shadow-[0_16px_48px_rgba(59,130,246,0.12)] scale-105 z-10'
                  : 'bg-white/60 dark:bg-white/[0.02] backdrop-blur-xl border border-white/60 dark:border-white/[0.08] shadow-[0_8px_32px_rgba(59,130,246,0.06)] hover:shadow-[0_12px_48px_rgba(59,130,246,0.1)] hover:-translate-y-1 transition-all duration-500'
                }
              `}
            >
              {plan.popular && (
                <div className="absolute -top-4 left-1/2 -translate-x-1/2">
                  <div className="inline-flex items-center gap-1.5 px-4 py-1.5 rounded-full bg-blue-500 text-white text-sm font-medium shadow-md shadow-blue-500/20">
                    <Sparkles size={14} />
                    Популярный
                  </div>
                </div>
              )}

              <div className="mb-6">
                <h3 className="text-xl font-semibold mb-2">{plan.name}</h3>
                <p className="text-sm text-[var(--muted-foreground)]">{plan.description}</p>
              </div>

              <div className="mb-8">
                <span className="text-4xl font-bold">{plan.price}₽</span>
                <span className="text-[var(--muted-foreground)]">{plan.period}</span>
              </div>

              <ul className="space-y-3 mb-8">
                {plan.features.map((feature, fi) => (
                  <li key={fi} className="flex items-start gap-3 text-sm">
                    <Check size={18} className="text-blue-500 mt-0.5 shrink-0" />
                    <span className="text-[var(--muted-foreground)]">{feature}</span>
                  </li>
                ))}
              </ul>

              <Link href="/app/pricing" className="block">
                <Button
                  className={`
                    w-full rounded-2xl py-5 group
                    ${plan.popular
                      ? 'bg-blue-500 text-white shadow-lg shadow-blue-500/20 hover:bg-blue-600 hover:shadow-xl hover:shadow-blue-500/30'
                      : 'bg-white/80 dark:bg-white/5 backdrop-blur-sm border border-white/60 dark:border-white/10 hover:bg-white/90 dark:hover:bg-white/10'
                    }
                    transition-all duration-300
                  `}
                >
                  {plan.cta}
                  <ArrowRight size={16} className="ml-2 group-hover:translate-x-1 transition-transform" />
                </Button>
              </Link>
            </motion.div>
          ))}
        </div>
      </div>
    </section>
  );
}
