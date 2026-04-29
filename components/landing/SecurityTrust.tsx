'use client';

import { motion } from 'motion/react';
import {
  Shield, Lock, Fingerprint, ServerCrash, Eye, FileCheck
} from 'lucide-react';

const securityFeatures = [
  {
    icon: Lock,
    title: 'AES-256-GCM',
    desc: 'Военный стандарт шифрования данных на стороне сервера',
  },
  {
    icon: Fingerprint,
    title: 'JWT + OAuth2',
    desc: 'Многофакторная аутентификация через Google, GitHub, Apple',
  },
  {
    icon: Shield,
    title: 'Rate Limiting',
    desc: 'Интеллектуальная защита от DDoS и brute-force атак',
  },
  {
    icon: ServerCrash,
    title: 'WAF Protection',
    desc: 'Web Application Firewall с автоматической фильтрацией',
  },
  {
    icon: Eye,
    title: 'Anomaly Detection',
    desc: 'Мониторинг подозрительной активности в реальном времени',
  },
  {
    icon: FileCheck,
    title: 'CSP + Headers',
    desc: 'OWASP-совместимые security headers для защиты от XSS',
  },
];

export function SecurityTrust() {
  return (
    <section className="relative py-24 px-6 overflow-hidden">
      {/* Soft background */}
      <div className="absolute inset-0 bg-gradient-to-b from-white via-slate-50/50 to-white dark:from-[var(--background)] dark:via-slate-950/30 dark:to-[var(--background)] pointer-events-none" />

      <div className="relative max-w-6xl mx-auto z-10">
        <motion.div
          initial={{ opacity: 0, y: 30 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true, margin: '-100px' }}
          transition={{ duration: 0.6 }}
          className="text-center mb-16"
        >
          <div className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-white/60 dark:bg-white/5 backdrop-blur-sm text-blue-600 dark:text-blue-400 text-sm font-medium mb-6 border border-blue-100/50 dark:border-blue-500/20 shadow-sm">
            <Shield size={14} />
            <span>Enterprise-grade Security</span>
          </div>
          <h2 className="text-4xl md:text-5xl font-bold mb-4">
            Безопасность на первом месте
          </h2>
          <p className="text-lg text-[var(--muted-foreground)] max-w-2xl mx-auto">
            Применяем передовые стандарты безопасности. Ваши данные защищены на уровне банков и государственных систем.
          </p>
        </motion.div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4 max-w-5xl mx-auto">
          {securityFeatures.map((item, i) => {
            const Icon = item.icon;
            return (
              <motion.div
                key={i}
                initial={{ opacity: 0, y: 20 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true, margin: '-50px' }}
                transition={{ duration: 0.5, delay: i * 0.1 }}
                className="relative group overflow-hidden rounded-3xl p-6 bg-white/70 dark:bg-white/[0.03] backdrop-blur-xl border border-white/60 dark:border-white/[0.08] shadow-[0_8px_32px_rgba(59,130,246,0.06)] hover:shadow-[0_12px_48px_rgba(59,130,246,0.12)] hover:-translate-y-1 transition-all duration-500"
              >
                <div className="absolute inset-0 bg-gradient-to-br from-blue-500/[0.02] to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-700" />
                <div className="relative z-10 flex flex-col items-start">
                  <div className="w-12 h-12 rounded-2xl bg-gradient-to-br from-blue-50 to-sky-50 dark:from-blue-500/10 dark:to-sky-500/10 text-blue-600 dark:text-blue-400 flex items-center justify-center mb-4 shadow-inner shadow-blue-500/5 border border-blue-100/50 dark:border-blue-500/10">
                    <Icon size={22} strokeWidth={1.5} />
                  </div>
                  <h3 className="text-lg font-semibold mb-2">{item.title}</h3>
                  <p className="text-sm text-[var(--muted-foreground)] leading-relaxed">
                    {item.desc}
                  </p>
                </div>
              </motion.div>
            );
          })}
        </div>

        {/* Trust Badge */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 0.6, delay: 0.3 }}
          className="mt-12 text-center"
        >
          <div className="inline-flex items-center gap-4 px-6 py-4 rounded-3xl bg-white/70 dark:bg-white/[0.03] backdrop-blur-xl border border-white/60 dark:border-white/[0.08] shadow-[0_8px_32px_rgba(59,130,246,0.06)]">
            <div className="flex items-center gap-2 text-sm text-[var(--muted-foreground)]">
              <Shield size={16} className="text-blue-600 dark:text-blue-400" />
              <span>Соответствует стандартам</span>
            </div>
            <div className="h-4 w-px bg-[var(--border)]" />
            <div className="flex items-center gap-3 text-xs font-medium text-[var(--muted-foreground)]">
              <span className="px-2 py-1 rounded-md bg-blue-50 dark:bg-blue-500/10 text-blue-600 dark:text-blue-400">MITRE ATT&CK</span>
              <span className="px-2 py-1 rounded-md bg-blue-50 dark:bg-blue-500/10 text-blue-600 dark:text-blue-400">NIST CSF 2.0</span>
              <span className="px-2 py-1 rounded-md bg-blue-50 dark:bg-blue-500/10 text-blue-600 dark:text-blue-400">OWASP</span>
            </div>
          </div>
        </motion.div>
      </div>
    </section>
  );
}
