'use client';

import { motion } from 'motion/react';
import {
  FolderOpen, Server, Layers, KeyRound,
  LayoutDashboard, CheckCircle2, Globe,
  Code2, Calendar, AlertTriangle
} from 'lucide-react';

const showcases = [
  {
    title: 'Дашборд',
    subtitle: 'Обзор всей инфраструктуры',
    icon: LayoutDashboard,
    stats: [
      { label: 'Активные проекты', value: '3', icon: FolderOpen, color: 'blue' },
      { label: 'Серверы', value: '5', icon: Server, color: 'purple' },
      { label: 'Сервисы', value: '12', icon: Layers, color: 'amber' },
      { label: 'Доступы', value: '24', icon: KeyRound, color: 'rose' },
    ],
    description: 'Все метрики на одном экране. Отслеживайте состояние проектов, серверов и сервисов в реальном времени.',
  },
  {
    title: 'Проекты',
    subtitle: 'Управление активными и архивными проектами',
    icon: FolderOpen,
    content: {
      status: 'АКТИВЕН',
      name: 'Лендинг для студии дизайна',
      url: 'https://site.com',
      tech: ['React', 'Next.js', 'Express', 'Node.js'],
      tasks: 2,
    },
    description: 'Структурируйте работу по проектам. Добавляйте URL, технологический стек, заметки и задачи.',
  },
  {
    title: 'Срочные задачи',
    subtitle: 'Контроль дедлайнов',
    icon: AlertTriangle,
    content: {
      empty: true,
      message: 'Нет срочных задач. Отличная работа!',
    },
    description: 'Не пропустите важные сроки. Уведомления о приближающихся дедлайнах и истекающих сертификатах.',
  },
];

function getColorClasses(color: string) {
  const colors: Record<string, { bg: string; text: string }> = {
    blue: { bg: 'bg-blue-100 dark:bg-blue-500/10', text: 'text-blue-600 dark:text-blue-400' },
    purple: { bg: 'bg-purple-100 dark:bg-purple-500/10', text: 'text-purple-600 dark:text-purple-400' },
    amber: { bg: 'bg-amber-100 dark:bg-amber-500/10', text: 'text-amber-600 dark:text-amber-400' },
    rose: { bg: 'bg-rose-100 dark:bg-rose-500/10', text: 'text-rose-600 dark:text-rose-400' },
  };
  return colors[color] || colors.blue;
}

export function AppShowcase() {
  return (
    <section className="py-24 px-6 bg-slate-50 dark:bg-slate-900/50">
      <div className="max-w-6xl mx-auto">
        <motion.div
          initial={{ opacity: 0, y: 30 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true, margin: '-100px' }}
          transition={{ duration: 0.6 }}
          className="text-center mb-16"
        >
          <h2 className="text-4xl md:text-5xl font-bold mb-4">
            Как работает приложение
          </h2>
          <p className="text-lg text-slate-600 dark:text-slate-400 max-w-2xl mx-auto">
            Простой интерфейс для управления всей IT-инфраструктурой
          </p>
        </motion.div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          {showcases.map((showcase, i) => {
            const Icon = showcase.icon;
            return (
              <motion.div
                key={i}
                initial={{ opacity: 0, y: 20 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true, margin: '-50px' }}
                transition={{ duration: 0.5, delay: i * 0.1 }}
                className="bg-white dark:bg-slate-800 rounded-2xl border border-slate-200 dark:border-slate-700 overflow-hidden"
              >
                {/* Header */}
                <div className="p-6 border-b border-slate-100 dark:border-slate-700">
                  <div className="flex items-center gap-3 mb-2">
                    <div className="w-10 h-10 rounded-xl bg-blue-50 dark:bg-blue-500/10 text-blue-600 dark:text-blue-400 flex items-center justify-center">
                      <Icon size={20} strokeWidth={1.5} />
                    </div>
                    <div>
                      <h3 className="font-semibold">{showcase.title}</h3>
                      <p className="text-xs text-slate-500 dark:text-slate-500">{showcase.subtitle}</p>
                    </div>
                  </div>
                </div>

                {/* Content */}
                <div className="p-6">
                  {showcase.stats && (
                    <div className="grid grid-cols-2 gap-3 mb-4">
                      {showcase.stats.map((stat, si) => {
                        const StatIcon = stat.icon;
                        const colors = getColorClasses(stat.color);
                        return (
                          <div
                            key={si}
                            className="p-3 rounded-xl bg-slate-50 dark:bg-slate-700/50"
                          >
                            <div className={`w-8 h-8 rounded-lg ${colors.bg} ${colors.text} flex items-center justify-center mb-2`}>
                              <StatIcon size={16} strokeWidth={1.5} />
                            </div>
                            <div className="text-2xl font-bold">{stat.value}</div>
                            <div className="text-xs text-slate-500">{stat.label}</div>
                          </div>
                        );
                      })}
                    </div>
                  )}

                  {showcase.content && !showcase.stats && (
                    <div className="mb-4">
                      {showcase.content.status && (
                        <div className="flex items-center gap-2 mb-4">
                          <span className="px-2 py-1 rounded-full bg-green-100 dark:bg-green-500/10 text-green-600 dark:text-green-400 text-xs font-medium">
                            {showcase.content.status}
                          </span>
                        </div>
                      )}
                      
                      {showcase.content.name && (
                        <div className="mb-4">
                          <h4 className="font-medium mb-1">{showcase.content.name}</h4>
                          {showcase.content.url && (
                            <a href="#" className="text-sm text-blue-500 flex items-center gap-1">
                              <Globe size={14} />
                              {showcase.content.url}
                            </a>
                          )}
                        </div>
                      )}

                      {showcase.content.tech && (
                        <div className="flex flex-wrap gap-2 mb-4">
                          {showcase.content.tech.map((tech, ti) => (
                            <span
                              key={ti}
                              className="px-2 py-1 rounded-md bg-slate-100 dark:bg-slate-700 text-xs text-slate-600 dark:text-slate-400"
                            >
                              {tech}
                            </span>
                          ))}
                        </div>
                      )}

                      {showcase.content.tasks !== undefined && (
                        <div className="w-full py-2.5 rounded-xl bg-blue-600 text-white text-sm font-medium flex items-center justify-center gap-2">
                          <Calendar size={16} />
                          Задачи ({showcase.content.tasks})
                        </div>
                      )}

                      {showcase.content.empty && (
                        <div className="text-center py-6">
                          <div className="w-12 h-12 rounded-full bg-green-100 dark:bg-green-500/10 text-green-600 dark:text-green-400 flex items-center justify-center mx-auto mb-3">
                            <CheckCircle2 size={24} />
                          </div>
                          <p className="text-sm text-slate-500">{showcase.content.message}</p>
                        </div>
                      )}
                    </div>
                  )}

                  <p className="text-sm text-slate-600 dark:text-slate-400">
                    {showcase.description}
                  </p>
                </div>
              </motion.div>
            );
          })}
        </div>
      </div>
    </section>
  );
}
