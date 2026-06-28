'use client';

import { motion } from 'motion/react';
import { Shield, Lock, Fingerprint, ServerCrash, Eye, FileCheck } from 'lucide-react';

const securityFeatures = [
  {
    icon: Lock,
    title: 'AES-256-GCM',
    desc: 'Военный стандарт шифрования данных',
  },
  {
    icon: Fingerprint,
    title: 'OAuth2 + JWT',
    desc: 'Безопасная аутентификация',
  },
  {
    icon: Shield,
    title: 'Rate Limiting',
    desc: 'Защита от DDoS и brute-force',
  },
  {
    icon: ServerCrash,
    title: 'WAF',
    desc: 'Web Application Firewall',
  },
  {
    icon: Eye,
    title: 'Мониторинг',
    desc: 'Обнаружение аномалий 24/7',
  },
  {
    icon: FileCheck,
    title: 'OWASP',
    desc: 'Security headers, защита от XSS',
  },
];

export function SecurityTrust() {
  return (
    <section className="py-24 px-6 bg-white dark:bg-slate-900">
      <div className="max-w-6xl mx-auto">
        <motion.div
          initial={{ opacity: 0, y: 30 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true, margin: '-100px' }}
          transition={{ duration: 0.6 }}
          className="text-center mb-12"
        >
          <h2 className="text-4xl md:text-5xl font-bold mb-4">
            Безопасность на первом месте
          </h2>
          <p className="text-lg text-slate-600 dark:text-slate-400 max-w-2xl mx-auto">
            Применяем передовые стандарты безопасности. Ваши данные защищены на уровне банков и государственных систем.
          </p>
        </motion.div>

        <div className="grid grid-cols-2 md:grid-cols-3 gap-4 max-w-4xl mx-auto">
          {securityFeatures.map((item, i) => {
            const Icon = item.icon;
            return (
              <motion.div
                key={i}
                initial={{ opacity: 0, y: 20 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true, margin: '-50px' }}
                transition={{ duration: 0.5, delay: i * 0.1 }}
                className="p-5 bg-slate-50 dark:bg-slate-800 rounded-xl border border-slate-200 dark:border-slate-700"
              >
                <div className="w-10 h-10 rounded-lg bg-blue-100 dark:bg-blue-500/10 text-blue-600 dark:text-blue-400 flex items-center justify-center mb-3">
                  <Icon size={20} strokeWidth={1.5} />
                </div>
                <h3 className="font-semibold mb-1">{item.title}</h3>
                <p className="text-xs text-slate-500 dark:text-slate-500">
                  {item.desc}
                </p>
              </motion.div>
            );
          })}
        </div>

        {/* Standards */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 0.6, delay: 0.3 }}
          className="mt-10 text-center"
        >
          <p className="text-sm text-slate-500 dark:text-slate-500 mb-3">Соответствует стандартам</p>
          <div className="flex items-center justify-center gap-3 text-xs font-medium">
            <span className="px-3 py-1.5 rounded-full bg-slate-100 dark:bg-slate-800 text-slate-600 dark:text-slate-400">MITRE ATT&CK</span>
            <span className="px-3 py-1.5 rounded-full bg-slate-100 dark:bg-slate-800 text-slate-600 dark:text-slate-400">NIST CSF</span>
            <span className="px-3 py-1.5 rounded-full bg-slate-100 dark:bg-slate-800 text-slate-600 dark:text-slate-400">OWASP</span>
          </div>
        </motion.div>
      </div>
    </section>
  );
}
