'use client';

import { motion } from 'motion/react';
import { Button } from '@/components/ui/button';
import { Check } from 'lucide-react';
import Link from 'next/link';

const plans = [
  {
    name: 'Бесплатный',
    price: '0',
    period: '/мес',
    description: 'Для знакомства',
    features: [
      '2 проекта, 1 сервер',
      '2 сервиса, 4 доступа',
      'Базовое хранение',
      'Стандартная тема',
    ],
    cta: 'Начать',
    popular: false,
  },
  {
    name: 'Стандарт',
    price: '300',
    period: '/мес',
    description: 'Для профессионалов',
    features: [
      '10 проектов, 5 серверов',
      '15 сервисов, 50 доступов',
      'Экспорт JSON/CSV',
      'Уведомления Email/TG',
      'Выбор темы',
      'История 7 дней',
    ],
    cta: 'Попробовать',
    popular: true,
  },
  {
    name: 'Максимум',
    price: '900',
    period: '/мес',
    description: 'Для команд',
    features: [
      'Безлимит всего',
      'Командный доступ',
      'Интеграции',
      'Расширенный шаринг',
      'Продвинутые уведомления',
      'Приоритетная поддержка',
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
                relative rounded-2xl p-6
                ${plan.popular
                  ? 'bg-white dark:bg-slate-800 border-2 border-blue-500 shadow-lg scale-105 z-10'
                  : 'bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700'
                }
              `}
            >
              {plan.popular && (
                <div className="absolute -top-3 left-1/2 -translate-x-1/2">
                  <span className="px-3 py-1 rounded-full bg-blue-500 text-white text-xs font-medium">
                    Популярный
                  </span>
                </div>
              )}

              <div className="mb-4">
                <h3 className="text-lg font-semibold">{plan.name}</h3>
                <p className="text-xs text-slate-500 dark:text-slate-400">{plan.description}</p>
              </div>

              <div className="mb-4">
                <span className="text-3xl font-bold">{plan.price}₽</span>
                <span className="text-sm text-slate-500 dark:text-slate-400">{plan.period}</span>
              </div>

              <ul className="space-y-2 mb-6">
                {plan.features.map((feature, fi) => (
                  <li key={fi} className="flex items-start gap-2 text-sm">
                    <Check size={16} className="text-blue-500 mt-0.5 shrink-0" />
                    <span className="text-slate-600 dark:text-slate-400">{feature}</span>
                  </li>
                ))}
              </ul>

              <Link href="/app/pricing" className="block">
                <Button
                  className={`
                    w-full rounded-xl py-4 font-medium transition-colors
                    ${plan.popular
                      ? 'bg-blue-600 hover:bg-blue-700 text-white'
                      : 'border-2 border-slate-200 dark:border-slate-600 text-slate-700 dark:text-slate-300 hover:bg-slate-50 dark:hover:bg-slate-800'
                    }
                  `}
                >
                  {plan.cta}
                </Button>
              </Link>
            </motion.div>
          ))}
        </div>
      </div>
    </section>
  );
}
