'use client';

import { motion } from 'motion/react';
import { Button } from '@/components/ui/button';
import Link from 'next/link';

export function CTASection() {
  return (
    <section className="py-24 px-6 relative overflow-hidden">
      {/* Subtle ambient depth */}
      <div className="absolute inset-0 overflow-hidden pointer-events-none">
        <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[600px] h-[300px] bg-[var(--primary)]/[0.03] rounded-full blur-[120px]" />
      </div>

      <motion.div
        initial={{ opacity: 0, y: 30 }}
        whileInView={{ opacity: 1, y: 0 }}
        viewport={{ once: true, margin: '-100px' }}
        transition={{ duration: 0.6 }}
        className="max-w-3xl mx-auto"
      >
        <div className="bg-white dark:bg-slate-800 rounded-2xl p-10 md:p-12 text-center border border-slate-200 dark:border-slate-700">
          <div className="inline-flex items-center px-4 py-2 rounded-full bg-blue-50 dark:bg-blue-500/10 text-blue-600 dark:text-blue-400 text-sm font-medium mb-6">
            <span>Стартовый пакет: 2 проекта, 1 сервер</span>
          </div>

          <h2 className="text-3xl md:text-4xl font-bold mb-4">
            Готовы управлять инфраструктурой?
          </h2>

          <p className="text-slate-600 dark:text-slate-400 max-w-xl mx-auto mb-8">
            Начните бесплатно и обновитесь, когда понадобится больше ресурсов.
          </p>

          <div className="flex flex-col sm:flex-row items-center justify-center gap-3">
            <Link href="/app">
              <Button
                size="lg"
                className="bg-blue-600 hover:bg-blue-700 text-white px-8 py-6 rounded-xl font-medium"
              >
                Создать аккаунт
              </Button>
            </Link>
            <Link href="/app/pricing">
              <Button
                variant="outline"
                size="lg"
                className="border-2 border-slate-200 dark:border-slate-600 text-slate-700 dark:text-slate-300 hover:bg-slate-50 dark:hover:bg-slate-800 px-8 py-6 rounded-xl font-medium"
              >
                Смотреть тарифы
              </Button>
            </Link>
          </div>

          <p className="text-xs text-slate-500 dark:text-slate-500 mt-6">
            Без кредитной карты • Отмена в любой момент
          </p>
        </div>
      </motion.div>
    </section>
  );
}
