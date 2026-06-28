'use client';

import { motion } from 'motion/react';
import { Shield, Server, Lock, KeyRound, Bell, FileText, Users } from 'lucide-react';

const coreFeatures = [
  {
    icon: Server,
    title: 'Управление серверами',
    description: 'Инвентаризация всех серверов: IP, провайдер, ОС, заметки. Привязка к проектам.',
  },
  {
    icon: FileText,
    title: 'Проекты',
    description: 'Структурируйте инфраструктуру по проектам. Статус, URL, технологический стек.',
  },
  {
    icon: KeyRound,
    title: 'Безопасные доступы',
    description: 'Хранение SSH, FTP, БД и API ключей с шифрованием AES-256-GCM.',
  },
];

const advancedFeatures = [
  {
    icon: Bell,
    title: 'Уведомления',
    description: 'Email и Telegram оповещения о важных событиях.',
  },
  {
    icon: Users,
    title: 'Командная работа',
    description: 'Делитесь доступами с командой через временные ссылки.',
  },
  {
    icon: Shield,
    title: 'Шифрование',
    description: 'Военный стандарт AES-256-GCM на стороне сервера.',
  },
  {
    icon: Lock,
    title: 'Безопасность',
    description: 'Rate limiting, WAF, CSP headers, защита от XSS.',
  },
];

export function FeaturesBento() {
  return (
    <section id="features" className="py-24 px-6 bg-slate-50/50 dark:bg-slate-900/20">
      <div className="max-w-6xl mx-auto">
        <motion.div
          initial={{ opacity: 0, y: 30 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true, margin: '-100px' }}
          transition={{ duration: 0.6 }}
          className="text-center mb-12"
        >
          <h2 className="text-4xl md:text-5xl font-bold mb-4">
            Всё, что нужно для управления IT
          </h2>
          <p className="text-lg text-slate-600 dark:text-slate-400 max-w-2xl mx-auto">
            Единая платформа для серверов, проектов и безопасного хранения данных
          </p>
        </motion.div>

        {/* Core Features */}
        <div className="mb-12">
          <h3 className="text-sm font-semibold text-slate-500 dark:text-slate-500 uppercase tracking-wider mb-6 text-center">
            Основные возможности
          </h3>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            {coreFeatures.map((feature, i) => {
              const Icon = feature.icon;
              return (
                <motion.div
                  key={i}
                  initial={{ opacity: 0, y: 20 }}
                  whileInView={{ opacity: 1, y: 0 }}
                  viewport={{ once: true, margin: '-50px' }}
                  transition={{ duration: 0.5, delay: i * 0.1 }}
                  className="p-6 bg-white dark:bg-slate-800 rounded-2xl border border-slate-200 dark:border-slate-700 hover:border-blue-300 dark:hover:border-blue-600 transition-colors"
                >
                  <div className="w-12 h-12 rounded-xl bg-blue-50 dark:bg-blue-500/10 text-blue-600 dark:text-blue-400 flex items-center justify-center mb-4">
                    <Icon size={24} strokeWidth={1.5} />
                  </div>
                  <h4 className="text-lg font-semibold mb-2">{feature.title}</h4>
                  <p className="text-sm text-slate-600 dark:text-slate-400 leading-relaxed">
                    {feature.description}
                  </p>
                </motion.div>
              );
            })}
          </div>
        </div>

        {/* Advanced Features */}
        <div>
          <h3 className="text-sm font-semibold text-slate-500 dark:text-slate-500 uppercase tracking-wider mb-6 text-center">
            Дополнительно
          </h3>
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
            {advancedFeatures.map((feature, i) => {
              const Icon = feature.icon;
              return (
                <motion.div
                  key={i}
                  initial={{ opacity: 0, y: 20 }}
                  whileInView={{ opacity: 1, y: 0 }}
                  viewport={{ once: true, margin: '-50px' }}
                  transition={{ duration: 0.5, delay: i * 0.1 }}
                  className="p-5 bg-white dark:bg-slate-800 rounded-xl border border-slate-200 dark:border-slate-700"
                >
                  <div className="w-10 h-10 rounded-lg bg-slate-100 dark:bg-slate-700 text-slate-600 dark:text-slate-400 flex items-center justify-center mb-3">
                    <Icon size={20} strokeWidth={1.5} />
                  </div>
                  <h4 className="font-medium mb-1">{feature.title}</h4>
                  <p className="text-xs text-slate-500 dark:text-slate-500 leading-relaxed">
                    {feature.description}
                  </p>
                </motion.div>
              );
            })}
          </div>
        </div>
      </div>
    </section>
  );
}
