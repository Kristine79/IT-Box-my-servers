'use client';

import { motion } from 'motion/react';
import {
  Shield, Server, BrainCircuit, Lock, KeyRound, Bell,
  FileText, Users, ArrowUpRight
} from 'lucide-react';

const features = [
  {
    icon: BrainCircuit,
    title: 'AI-Консультант',
    description: 'Интеллектуальный помощник помогает управлять серверами, анализировать проблемы и предлагать решения в реальном времени.',
    size: 'large',
  },
  {
    icon: Shield,
    title: 'AES-256-GCM',
    description: 'Военный уровень шифрования для всех ваших данных и паролей.',
    size: 'medium',
  },
  {
    icon: Server,
    title: 'Управление серверами',
    description: 'Добавляйте, отслеживайте и управляйте любыми серверами в одном месте.',
    size: 'medium',
  },
  {
    icon: KeyRound,
    title: 'Безопасные доступы',
    description: 'Храните SSH-ключи, пароли и токены с автоматическим шифрованием.',
    size: 'medium',
  },
  {
    icon: Bell,
    title: 'Умные уведомления',
    description: 'Получайте оповещения о важных событиях и сроках действия серверов.',
    size: 'small',
  },
  {
    icon: FileText,
    title: 'Проекты и задачи',
    description: 'Организуйте работу в проектах с системой задач и заметок.',
    size: 'small',
  },
  {
    icon: Users,
    title: 'Командная работа',
    description: 'Делитесь доступами с командой безопасно и контролируемо.',
    size: 'medium',
  },
  {
    icon: Lock,
    title: 'Многослойная защита',
    description: 'Rate limiting, WAF, CSP headers и мониторинг аномалий в реальном времени.',
    size: 'large',
  },
];

export function FeaturesBento() {
  return (
    <section id="features" className="relative py-24 px-6 overflow-hidden">
      {/* Soft background */}
      <div className="absolute inset-0 bg-gradient-to-b from-slate-50/50 via-white to-slate-50/30 dark:from-slate-950/50 dark:via-[var(--background)] dark:to-slate-950/30 pointer-events-none" />

      <div className="relative max-w-6xl mx-auto">
        <motion.div
          initial={{ opacity: 0, y: 30 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true, margin: '-100px' }}
          transition={{ duration: 0.6 }}
          className="text-center mb-16"
        >
          <h2 className="text-4xl md:text-5xl font-bold mb-4">
            Всё, что нужно для управления IT
          </h2>
          <p className="text-lg text-[var(--muted-foreground)] max-w-2xl mx-auto">
            Современный набор инструментов для управления серверами, проектами и безопасным хранением данных
          </p>
        </motion.div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4 auto-rows-min">
          {features.map((feature, i) => {
            const Icon = feature.icon;
            const isLarge = feature.size === 'large';
            const isSmall = feature.size === 'small';

            return (
              <motion.div
                key={i}
                initial={{ opacity: 0, y: 30 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true, margin: '-50px' }}
                transition={{ duration: 0.5, delay: i * 0.1 }}
                className={`
                  relative overflow-hidden rounded-3xl p-6
                  ${isLarge ? 'md:col-span-2 md:row-span-2' : ''}
                  ${isSmall ? '' : 'md:col-span-1'}
                  bg-white/70 dark:bg-white/[0.03] backdrop-blur-xl
                  border border-white/60 dark:border-white/[0.08]
                  shadow-[0_8px_32px_rgba(59,130,246,0.06)]
                  hover:shadow-[0_12px_48px_rgba(59,130,246,0.12)]
                  hover:-translate-y-1
                  transition-all duration-500 ease-out
                  group cursor-default
                `}
              >
                <div className="absolute inset-0 bg-gradient-to-br from-blue-500/[0.02] to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-700" />

                <div className="relative z-10">
                  <div className={`
                    inline-flex items-center justify-center rounded-2xl
                    ${isLarge ? 'w-14 h-14 mb-6' : 'w-11 h-11 mb-4'}
                    bg-gradient-to-br from-blue-50 to-sky-50 dark:from-blue-500/10 dark:to-sky-500/10
                    text-blue-600 dark:text-blue-400
                    shadow-inner shadow-blue-500/5
                    border border-blue-100/50 dark:border-blue-500/10
                  `}>
                    <Icon size={isLarge ? 28 : 22} strokeWidth={1.5} />
                  </div>

                  <h3 className={`font-semibold mb-2 ${isLarge ? 'text-2xl' : 'text-lg'}`}>
                    {feature.title}
                  </h3>

                  <p className={`text-[var(--muted-foreground)] leading-relaxed ${isLarge ? 'text-base max-w-sm' : 'text-sm'}`}>
                    {feature.description}
                  </p>

                  {isLarge && (
                    <div className="mt-8 flex items-center gap-2 text-blue-600 dark:text-blue-400 text-sm font-medium">
                      <span>Подробнее</span>
                      <ArrowUpRight size={16} className="group-hover:translate-x-1 group-hover:-translate-y-1 transition-transform duration-300" />
                    </div>
                  )}
                </div>
              </motion.div>
            );
          })}
        </div>
      </div>
    </section>
  );
}
