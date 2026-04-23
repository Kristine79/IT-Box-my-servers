'use client';

import { Shield, FolderKanban, Server, Network, KeyRound, Share2, Search, Zap, Smartphone } from 'lucide-react';
import { motion } from 'motion/react';
import { useTranslation } from 'react-i18next';
import { cn } from '@/lib/utils';

export default function AboutPage() {
  const { t, i18n } = useTranslation();
  const isEn = i18n.language === 'en';

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
            <h1 className="text-xl md:text-2xl font-bold tracking-wide text-[var(--neu-text)]">IT-Box</h1>
            <p className="text-[var(--neu-text-muted)] text-[10px] uppercase tracking-widest mt-0.5">{t('about')}</p>
          </div>
        </div>
        <p className="text-[var(--neu-text-muted)] leading-relaxed text-sm md:text-base mt-4">
          {isEn 
            ? "IT-Box is a centralized vault for IT infrastructure: servers, projects, services, access, and secure configuration sharing." 
            : "IT-Box — централизованный сейф для IT-инфраструктуры: серверы, проекты, сервисы, доступы и безопасный шеринг конфигураций."}
        </p>
      </motion.div>

      {/* Intro section section */}
      <motion.div 
        initial={{ opacity: 0, y: 10 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.1 }}
        className="neu-panel p-6 md:p-8 rounded-2xl"
      >
        <h2 className="text-lg md:text-xl font-bold tracking-tight text-[var(--neu-text)] mb-3">{isEn ? "What is IT-Box?" : "Что такое IT-Box?"}</h2>
        <p className="text-[var(--neu-text-muted)] leading-relaxed text-sm md:text-base">
          {isEn 
            ? "IT-Box is a web application for system administrators, DevOps engineers, and webmasters. It allows you to keep all your infrastructure at your fingertips: servers, projects, services, and credentials — in one secure place."
            : "IT-Box — это веб-приложение для системных администраторов, DevOps-инженеров и веб-мастеров. Оно позволяет держать всю инфраструктуру под рукой: серверы, проекты, сервисы и учётные данные — в одном защищённом месте."}
        </p>
      </motion.div>

      {/* Main Modules */}
      <div className="space-y-4">
        <h2 className="text-lg md:text-xl font-bold tracking-tight text-[var(--neu-text)] px-2">{isEn ? "Core Modules" : "Основные модули"}</h2>
        <div className="grid gap-3">
          <ModuleCard 
            icon={FolderKanban}
            title={isEn ? "Projects" : "Проекты"}
            description={isEn 
              ? "Manage projects: status, URLs, and tech stack. Links to servers and credentials."
              : "Управляйте проектами: статус, URL и стек. Привязка серверов и доступов."}
            delay={0.15}
          />
          <ModuleCard 
            icon={Server}
            title={isEn ? "Servers" : "Серверы"}
            description={isEn 
              ? "Inventory: IP, provider, OS, and notes. Instant linking to projects."
              : "Инвентаризация: IP, провайдер, ОС и заметки. Мгновенная привязка к проектам."}
            delay={0.2}
          />
          <ModuleCard 
            icon={Network}
            title={isEn ? "Services" : "Сервисы"}
            description={isEn 
              ? "Dashboard for server services: URLs, ports, and availability status."
              : "Дашборд сервисов: URL, порты и статус доступности приложений."}
            delay={0.25}
          />
          <ModuleCard 
            icon={KeyRound}
            title={isEn ? "Credentials" : "Доступы"}
            description={isEn 
              ? "AES-256-GCM encrypted vault for SSH, FTP, DB, and API keys."
              : "Зашифрованное AES-256-GCM хранилище для SSH, FTP, БД и API ключей."}
            delay={0.3}
          />
        </div>
      </div>

      {/* Key features */}
      <div className="space-y-4">
        <h2 className="text-lg md:text-xl font-bold tracking-tight text-[var(--neu-text)] px-2">{isEn ? "Key Features" : "Ключевые возможности"}</h2>
        <div className="grid gap-3 sm:grid-cols-2">
          <ModuleCard 
            icon={Shield}
            title={isEn ? "Security" : "Безопасность"}
            description={isEn ? "AES-256 encryption." : "Шифрование AES-256."}
            delay={0.4}
            iconColor="text-blue-400"
            compact
          />
          <ModuleCard 
            icon={Share2}
            title={isEn ? "Sharing" : "Шеринг"}
            description={isEn ? "Secure temporary links." : "Временные ссылки."}
            delay={0.45}
            iconColor="text-blue-400"
            compact
          />
          <ModuleCard 
            icon={Smartphone}
            title={isEn ? "PWA" : "PWA"}
            description={isEn ? "Native web experience." : "Нативное веб-приложение."}
            delay={0.5}
            iconColor="text-blue-400"
            compact
          />
          <ModuleCard 
            icon={Search}
            title={isEn ? "Search" : "Поиск"}
            description={isEn ? "Instant global search." : "Мгновенный поиск."}
            delay={0.55}
            iconColor="text-blue-400"
            compact
          />
        </div>
      </div>

      {/* Target Audience */}
      <div className="space-y-6">
        <h2 className="text-xl md:text-2xl font-bold tracking-tight text-[var(--neu-text)] px-2">{isEn ? "Who is it for?" : "Для кого?"}</h2>
        <div className="grid gap-6 md:grid-cols-2">
          <AudienceCard 
            title={isEn ? "System Administrator" : "Системный администратор"}
            description={isEn 
              ? "Maintains a full server registry, stores encrypted SSH/RDP access, shares configuration via temporary links."
              : "Ведёт полный реестр серверов компании, хранит SSH/RDP-доступы в зашифрованном виде, делится конфигурацией с коллегами через временные ссылки."}
            delay={0.7}
          />
          <AudienceCard 
            title={isEn ? "DevOps Engineer" : "DevOps-инженер"}
            description={isEn 
              ? "Structures infrastructure by projects, links services to servers, tracks each project's technology stack."
              : "Структурирует инфраструктуру по проектам, привязывает сервисы к серверам, отслеживает стек технологий каждого проекта."}
            delay={0.75}
          />
          <AudienceCard 
            title={isEn ? "Webmaster / Freelancer" : "Веб-мастер / фрилансер"}
            description={isEn 
              ? "Manages client hostings and sites, stores FTP/cPanel credentials, quickly finds servers by project."
              : "Управляет хостингами и сайтами клиентов, хранит FTP/cPanel-доступы, быстро находит нужный сервер по проекту."}
            delay={0.8}
          />
          <AudienceCard 
            title={isEn ? "Small IT Team" : "Небольшая IT-команда"}
            description={isEn 
              ? "Centralized infrastructure knowledge hub instead of fragmented tables and messengers."
              : "Централизованное хранилище знаний об инфраструктуре вместо разрозненных таблиц и мессенджеров."}
            delay={0.85}
          />
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

