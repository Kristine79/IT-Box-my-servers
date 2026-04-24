'use client';

import { useState, useRef, useEffect } from 'react';
import { Bell, CheckCircle2, Info, AlertTriangle, XCircle, Settings, BellOff } from 'lucide-react';
import { useNotifications, Notification } from '@/lib/notifications';
import { useTranslation } from 'react-i18next';
import { cn } from '@/lib/utils';
import { useAuth } from '@/lib/providers';
import { motion, AnimatePresence } from 'motion/react';
import { formatDistanceToNow } from 'date-fns';
import { ru, enUS } from 'date-fns/locale';

export function NotificationBell() {
  const { notifications, unreadCount, markAsRead, markAllAsRead, loading } = useNotifications();
  const { notificationsEnabled, updateProfile } = useAuth();
  const { t, i18n } = useTranslation();
  const [isOpen, setIsOpen] = useState(false);
  const [showSettings, setShowSettings] = useState(false);
  const dropdownRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    function handleClickOutside(event: MouseEvent) {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target as Node)) {
        setIsOpen(false);
        setShowSettings(false);
      }
    }
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  const getIcon = (type: string) => {
    switch (type) {
      case 'success': return <div className="p-2 rounded-full bg-emerald-500/10"><CheckCircle2 className="w-4 h-4 text-emerald-500" /></div>;
      case 'warning': return <div className="p-2 rounded-full bg-amber-500/10"><AlertTriangle className="w-4 h-4 text-amber-500" /></div>;
      case 'error': return <div className="p-2 rounded-full bg-rose-500/10"><XCircle className="w-4 h-4 text-rose-500" /></div>;
      default: return <div className="p-2 rounded-full bg-blue-500/10"><Info className="w-4 h-4 text-blue-500" /></div>;
    }
  };

  const handleToggleNotifications = async () => {
    await updateProfile({ notificationsEnabled: !notificationsEnabled });
  };

  const currentLocale = i18n.language === 'ru' ? ru : enUS;

  return (
    <div className="relative" ref={dropdownRef}>
      <div 
        className={cn(
          "neu-button h-10 w-10 md:h-12 md:w-12 flex items-center justify-center cursor-pointer transition-all relative group",
          isOpen && "neu-panel-inset text-[var(--neu-accent)]",
          !notificationsEnabled && "opacity-50 grayscale-[0.5]"
        )}
        onClick={() => setIsOpen(!isOpen)}
      >
        {notificationsEnabled ? (
          <Bell className={cn("h-4 w-4 md:h-5 md:w-5 transition-transform group-hover:rotate-12", isOpen && "scale-110")} />
        ) : (
          <BellOff className="h-4 w-4 md:h-5 md:w-5 opacity-40" />
        )}
        
        {unreadCount > 0 && notificationsEnabled && (
          <span className="absolute top-2.5 right-2.5 md:top-3.5 md:right-3.5 flex h-2 w-2">
            <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-rose-400 opacity-75"></span>
            <span className="relative inline-flex rounded-full h-full w-full bg-rose-500"></span>
          </span>
        )}
      </div>

      <AnimatePresence>
        {isOpen && (
          <motion.div 
            initial={{ opacity: 0, scale: 0.95, y: 10 }}
            animate={{ opacity: 1, scale: 1, y: 0 }}
            exit={{ opacity: 0, scale: 0.95, y: 10 }}
            transition={{ duration: 0.15, ease: [0.23, 1, 0.32, 1] }}
            className="fixed md:absolute top-16 md:top-auto inset-x-4 md:inset-auto md:right-0 mt-4 md:w-[400px] neu-panel rounded-[2rem] overflow-hidden z-[100] shadow-2xl border border-white/5"
          >
            <div className="p-5 md:p-6 border-b border-white/5 flex items-center justify-between bg-[var(--neu-bg)] relative z-10">
              <div className="flex items-center gap-3">
                <h3 className="font-bold text-lg">{t('notifications')}</h3>
              </div>
              <div className="flex items-center gap-2">
                <button 
                   onClick={() => setShowSettings(!showSettings)}
                   className={cn(
                     "p-2 rounded-full transition-all",
                     showSettings ? "bg-[var(--neu-accent)] text-white shadow-lg" : "hover:bg-white/10 opacity-60 hover:opacity-100"
                   )}
                >
                  <Settings className="w-4 h-4" />
                </button>
                {unreadCount > 0 && notificationsEnabled && !showSettings && (
                    <button 
                    onClick={markAllAsRead}
                    className="text-[11px] uppercase tracking-wider text-white hover:opacity-90 font-bold ml-2 bg-[var(--neu-accent)] px-3 py-1.5 rounded-full transition-all shadow-sm"
                  >
                    {t('read')}
                  </button>
                )}
              </div>
            </div>

            <div className="relative">
              <AnimatePresence mode="wait">
                {showSettings ? (
                  <motion.div 
                    key="settings"
                    initial={{ opacity: 0, x: 20 }}
                    animate={{ opacity: 1, x: 0 }}
                    exit={{ opacity: 0, x: -20 }}
                    className="p-8 pb-10 bg-[var(--neu-bg)]"
                  >
                    <div className="flex items-center justify-between p-6 rounded-2xl neu-panel-inset">
                      <div className="flex flex-col gap-1">
                        <span className="text-sm font-bold">{t('enable_notifications')}</span>
                        <span className="text-[10px] opacity-40 uppercase tracking-widest">{notificationsEnabled ? "Active" : "Disabled"}</span>
                      </div>
                      <button 
                        onClick={handleToggleNotifications}
                        className={cn(
                          "w-12 h-6 rounded-full p-1 transition-all duration-300 relative",
                          notificationsEnabled ? "bg-[var(--neu-accent)]" : "bg-white/10"
                        )}
                      >
                        <motion.div 
                          animate={{ x: notificationsEnabled ? 24 : 0 }}
                          className="w-4 h-4 bg-white rounded-full shadow-md"
                        />
                      </button>
                    </div>
                  </motion.div>
                ) : (
                  <motion.div 
                    key="list"
                    initial={{ opacity: 0, x: -20 }}
                    animate={{ opacity: 1, x: 0 }}
                    exit={{ opacity: 0, x: 20 }}
                    className="max-h-[60vh] overflow-y-auto bg-[var(--neu-bg)] scrollbar-hide text-white"
                  >
                    {!notificationsEnabled ? (
                      <div className="p-16 text-center flex flex-col items-center gap-4">
                         <div className="neu-panel-inset p-6 rounded-full opacity-20">
                            <BellOff className="w-10 h-10" />
                         </div>
                         <div className="space-y-1">
                           <p className="font-bold text-sm opacity-60">Notifications Disabled</p>
                           <p className="text-[11px] opacity-40 leading-relaxed max-w-[200px]">Turn them on in settings to see real-time updates.</p>
                         </div>
                         <button 
                           onClick={() => setShowSettings(true)}
                           className="mt-2 neu-button px-6 py-2 text-xs font-bold text-[var(--neu-accent)]"
                         >
                           Open Settings
                         </button>
                      </div>
                    ) : loading ? (
                      <div className="p-12 text-center flex flex-col items-center gap-4">
                         <div className="w-8 h-8 border-2 border-[var(--neu-accent)] border-t-transparent rounded-full animate-spin" />
                         <p className="opacity-40 text-xs font-medium tracking-widest uppercase">{t('loading')}</p>
                      </div>
                    ) : notifications.length === 0 ? (
                      <div className="p-16 text-center flex flex-col items-center gap-4">
                         <div className="neu-panel-inset p-6 rounded-full opacity-10">
                            <Bell className="w-10 h-10" />
                         </div>
                         <p className="opacity-40 text-sm font-medium">{t('no_notifications')}</p>
                      </div>
                    ) : (
                      <div className="divide-y divide-white/[0.03]">
                        {notifications.map((n) => (
                          <div 
                            key={n.id}
                            onClick={() => {
                              if (!n.isRead) markAsRead(n.id);
                              if (n.link) window.location.href = n.link;
                            }}
                            className={cn(
                              "p-5 md:p-6 transition-all cursor-pointer flex gap-5 group items-start text-white",
                              !n.isRead ? "bg-[var(--neu-accent)]/[0.03] hover:bg-[var(--neu-accent)]/[0.06]" : "hover:bg-white/[0.02]"
                            )}
                          >
                            <div className="shrink-0">
                              {getIcon(n.type)}
                            </div>
                            <div className="flex-1 min-w-0 text-white">
                              <div className="flex justify-between items-start mb-1.5 overflow-hidden">
                                <h4 className={cn("text-[13px] md:text-sm font-bold truncate transition-colors", !n.isRead ? "text-[var(--neu-accent)]" : "opacity-80")}>{n.title}</h4>
                                <span className={cn(
                                  "text-[10px] opacity-40 whitespace-nowrap ml-3 font-medium",
                                  !n.isRead && "opacity-100 text-[var(--neu-accent)]"
                                )}>
                                   {n.createdAt && formatDistanceToNow(n.createdAt.toDate ? n.createdAt.toDate() : new Date(), { 
                                     addSuffix: true,
                                     locale: currentLocale
                                   })}
                                </span>
                              </div>
                              <p className={cn(
                                "text-xs leading-relaxed line-clamp-2 transition-opacity",
                                !n.isRead ? "text-[var(--neu-text-muted)] opacity-100" : "text-[var(--neu-text-muted)] opacity-60"
                              )}>
                                {n.message}
                              </p>
                            </div>
                            {!n.isRead && (
                              <div className="shrink-0 self-center">
                                <div className="w-1.5 h-1.5 rounded-full bg-[var(--neu-accent)] shadow-[0_0_8px_rgba(var(--neu-accent-rgb),0.5)]" />
                              </div>
                            )}
                          </div>
                        ))}
                      </div>
                    )}
                  </motion.div>
                )}
              </AnimatePresence>
            </div>

            {!showSettings && notifications.length > 5 && (
               <div className="h-12 bg-gradient-to-t from-[var(--neu-bg)] to-transparent pointer-events-none absolute bottom-0 left-0 right-0 z-10" />
            )}
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}
