'use client';

import { motion } from 'motion/react';
import { Button } from '@/components/ui/button';
import { ArrowRight, Sparkles } from 'lucide-react';
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
        className="max-w-4xl mx-auto relative z-10"
      >
        <div className="neu-card rounded-3xl p-12 md:p-16 text-center">
          <div className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-[var(--primary)]/10 text-[var(--primary)] text-sm font-medium mb-8 border border-[var(--primary)]/20">
            <Sparkles size={14} />
            <span>Бесплатный старт: 14 дней полного доступа</span>
          </div>

          <h2 className="text-4xl md:text-5xl font-bold mb-6">
            Готовы управлять
            <br />
            инфраструктурой умнее?
          </h2>

          <p className="text-lg text-[var(--muted-foreground)] max-w-2xl mx-auto mb-10">
            Присоединяйтесь к тысячам IT-специалистов, которые уже используют IT Box для управления серверами, проектами и доступами.
          </p>

          <div className="flex flex-col sm:flex-row items-center justify-center gap-4">
            <Link href="/app">
              <Button
                size="lg"
                className="neu-button-accent text-lg px-8 py-6 rounded-3xl group"
              >
                Начать бесплатно
                <ArrowRight size={20} className="ml-2 group-hover:translate-x-1 transition-transform" />
              </Button>
            </Link>
            <Link href="/app/pricing">
              <Button
                variant="outline"
                size="lg"
                className="neu-button text-lg px-8 py-6 rounded-3xl"
              >
                Сравнить тарифы
              </Button>
            </Link>
          </div>

          <p className="text-sm text-[var(--muted-foreground)] mt-6">
            Не требуется кредитная карта • Отмена в любое время
          </p>
        </div>
      </motion.div>
    </section>
  );
}
