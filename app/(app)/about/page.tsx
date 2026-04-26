'use client';

import { Shield, FolderKanban, Server, Network, KeyRound, Share2, Search, Zap, Smartphone } from 'lucide-react';
import { motion } from 'motion/react';
import { useTranslation } from 'react-i18next';
import { cn } from '@/lib/utils';
import { useEffect, useState } from 'react';
import { doc, getDoc } from 'firebase/firestore';
import { db } from '@/lib/providers';
import { defaultAbout } from '@/lib/contentDefaults';

export default function AboutPage() {
  const { t, i18n } = useTranslation();
  const isEn = i18n.language === 'en';
  const lang = isEn ? 'en' : 'ru';
  const [content, setContent] = useState(defaultAbout);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    getDoc(doc(db, 'siteContent', 'about')).then(snap => {
      if (snap.exists()) setContent(snap.data() as typeof defaultAbout);
    }).catch(console.error).finally(() => setLoading(false));
  }, []);

  const c = content[lang] || defaultAbout[lang];

  if (loading) return <div className="p-8 opacity-50">{t('loading')}</div>;

  return (
    <div className="mx-auto max-w-4xl space-y-8 pb-10">
      
      {/* Header section */}
      <motion.div 
        initial={{ opacity: 0, y: 10 }}
        animate={{ opacity: 1, y: 0 }}
        className="neu-panel p-6 md:p-8 rounded-2xl"
      >
        <div className="flex items-center gap-4">
          <div className="neu-panel-inset p-3 rounded-xl text-blue-400 shrink-0">
             <Shield className="h-6 w-6 md:h-8 md:w-8" />
          </div>
          <div>
            <h1 className="text-xl md:text-2xl font-bold tracking-wide text-[var(--neu-text)]">StackBox</h1>
            <p className="text-[var(--neu-text-muted)] text-[10px] uppercase tracking-widest mt-0.5">{t('about')}</p>
          </div>
        </div>
        <p className="text-[var(--neu-text-muted)] leading-relaxed text-sm md:text-base mt-4">{c.intro}</p>
      </motion.div>

      {/* Intro section section */}
      <motion.div 
        initial={{ opacity: 0, y: 10 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.1 }}
        className="neu-panel p-6 md:p-8 rounded-2xl"
      >
        <h2 className="text-lg md:text-xl font-bold tracking-tight text-[var(--neu-text)] mb-3">{isEn ? "What is StackBox?" : "Что такое StackBox?"}</h2>
        <p className="text-[var(--neu-text-muted)] leading-relaxed text-sm md:text-base">{c.whatIs}</p>
      </motion.div>

      {/* Main Modules */}
      <div className="space-y-4">
        <h2 className="text-lg md:text-xl font-bold tracking-tight text-[var(--neu-text)] px-2">{isEn ? "Core Modules" : "Основные модули"}</h2>
        <div className="grid gap-3">
          {c.modules.map((m, i) => (
            <ModuleCard key={i} icon={[FolderKanban, Server, Network, KeyRound][i]} title={m.title} description={m.desc} delay={0.15 + i * 0.05} />
          ))}
        </div>
      </div>

      {/* Key features */}
      <div className="space-y-4">
        <h2 className="text-lg md:text-xl font-bold tracking-tight text-[var(--neu-text)] px-2">{isEn ? "Key Features" : "Ключевые возможности"}</h2>
        <div className="grid gap-3 sm:grid-cols-2">
          {c.features.map((f, i) => (
            <ModuleCard key={i} icon={[Shield, Share2, Smartphone, Search][i]} title={f.title} description={f.desc} delay={0.4 + i * 0.05} iconColor="text-blue-400" compact />
          ))}
        </div>
      </div>

      {/* Target Audience */}
      <div className="space-y-6">
        <h2 className="text-xl md:text-2xl font-bold tracking-tight text-[var(--neu-text)] px-2">{isEn ? "Who is it for?" : "Для кого?"}</h2>
        <div className="grid gap-6 md:grid-cols-2">
          {c.audience.map((a, i) => (
            <AudienceCard key={i} title={a.title} description={a.desc} delay={0.7 + i * 0.05} />
          ))}
        </div>
      </div>

    </div>
  );
}

function ModuleCard({ icon: Icon, title, description, delay, iconColor = "text-[var(--neu-accent)]", compact = false }: { icon: any, title: string, description: string, delay: number, iconColor?: string, compact?: boolean }) {
  return (
    <motion.div 
      initial={{ opacity: 0, y: 10 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ delay }}
      className={cn(
        "neu-panel rounded-2xl flex items-center gap-4 transition-all hover:scale-[1.01]",
        compact ? "p-4" : "p-5 md:p-6"
      )}
    >
      <div className={cn(
        "neu-panel-inset rounded-xl shrink-0 flex items-center justify-center",
        compact ? "p-2.5" : "p-3.5",
        iconColor
      )}>
         <Icon className={cn(compact ? "h-5 w-5" : "h-6 w-6")} />
      </div>
      <div>
        <h3 className={cn("font-bold text-[var(--neu-text)]", compact ? "text-base" : "text-lg mb-1")}>{title}</h3>
        {!compact && (
          <p className="text-[var(--neu-text-muted)] leading-tight text-xs md:text-sm">
            {description}
          </p>
        )}
        {compact && description && (
           <p className="text-[var(--neu-text-muted)] text-[11px] leading-none mt-0.5">{description}</p>
        )}
      </div>
    </motion.div>
  );
}

function AudienceCard({ title, description, delay }: { title: string, description: string, delay: number }) {
  return (
    <motion.div 
      initial={{ opacity: 0, y: 10 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ delay }}
      className="neu-panel p-5 md:p-6 rounded-2xl h-full flex flex-col"
    >
      <h3 className="text-base md:text-lg font-bold text-[var(--neu-text)] mb-2">{title}</h3>
      <p className="text-[var(--neu-text-muted)] leading-relaxed text-xs md:text-sm flex-1">
        {description}
      </p>
    </motion.div>
  );
}

