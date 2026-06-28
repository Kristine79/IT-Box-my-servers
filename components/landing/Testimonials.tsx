'use client';

import { motion } from 'motion/react';
import { Quote } from 'lucide-react';

const testimonials = [
  {
    role: 'DevOps-инженер',
    text: 'Наконец-то все доступы в одном месте. Не нужно искать пароли в чатах и таблицах.',
    company: 'SaaS-стартап',
    gradient: 'from-blue-500 to-cyan-400',
  },
  {
    role: 'Системный администратор',
    text: 'Шифрование AES-256 даёт уверенность, что данные не утекут. Удобно шарить доступы с коллегами.',
    company: 'IT-компания',
    gradient: 'from-purple-500 to-pink-400',
  },
  {
    role: 'Фрилансер',
    text: 'Веду проекты клиентов в одной системе. Бесплатного тарифа хватает для моих задач.',
    company: 'Веб-студия',
    gradient: 'from-emerald-500 to-teal-400',
  },
];

export function Testimonials() {
  return (
    <section className="py-24 px-6 bg-slate-50/50 dark:bg-slate-900/20">
      <div className="max-w-6xl mx-auto">
        <motion.div
          initial={{ opacity: 0, y: 30 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true, margin: '-100px' }}
          transition={{ duration: 0.6 }}
          className="text-center mb-12"
        >
          <h2 className="text-4xl md:text-5xl font-bold mb-4">
            Что говорят пользователи
          </h2>
          <p className="text-lg text-slate-600 dark:text-slate-400 max-w-2xl mx-auto">
            IT-специалисты и команды уже используют IT Box
          </p>
        </motion.div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          {testimonials.map((item, i) => (
            <motion.div
              key={i}
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true, margin: '-50px' }}
              transition={{ duration: 0.5, delay: i * 0.1 }}
              className="p-6 bg-white dark:bg-slate-800 rounded-2xl border border-slate-200 dark:border-slate-700"
            >
              <Quote size={24} className="text-blue-500 mb-4" />
              <p className="text-slate-700 dark:text-slate-300 mb-4 leading-relaxed">
                "{item.text}"
              </p>
              <div className="flex items-center gap-3">
                <div className={`w-10 h-10 rounded-full bg-gradient-to-br ${item.gradient} flex items-center justify-center text-white font-semibold text-sm`}>
                  {item.role[0]}
                </div>
                <div>
                  <p className="font-medium text-sm">{item.role}</p>
                  <p className="text-xs text-slate-500 dark:text-slate-500">{item.company}</p>
                </div>
              </div>
            </motion.div>
          ))}
        </div>
      </div>
    </section>
  );
}
