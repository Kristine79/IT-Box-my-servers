'use client';

import { useAuth } from '@/lib/providers';
import { Button } from './ui/button';
import { useTranslation } from 'react-i18next';
import { Share2, LogOut, Menu, Moon, Sun, X, LogIn, Sparkles, Lock } from 'lucide-react';
import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { cn } from '@/lib/utils';
import { useState, useEffect } from 'react';
import { LOGO_BASE64 } from '@/lib/logoBase64';

import { Paywall } from './Paywall';
import { LoadingScreen } from './ui/LoadingScreen';
import { motion, AnimatePresence, useReducedMotion } from 'motion/react';
import { NotificationBell } from './NotificationBell';

// import { useGoogleReCaptcha } from 'react-google-recaptcha-v3';

import { AIConsultant } from './AIConsultant';
import { CommandPalette } from './CommandPalette';
import { UpgradeModal } from './UpgradeModal';
import { NavItems } from './NavItems';
import { SecurityOnboarding } from './SecurityOnboarding';

export default function AppLayout({ children }: { children: React.ReactNode }) {
  const { user, loading, isPaywall, isAdmin, login, loginWithEmail, logout, theme, setTheme, canUsePremiumTheme, planLimits } = useAuth();
  const { t, i18n } = useTranslation();
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const [desktopSidebarOpen, setDesktopSidebarOpen] = useState(true);
  const [mounted, setMounted] = useState(false);
  const [isDark, setIsDark] = useState(false);
  const [themeUpgradeOpen, setThemeUpgradeOpen] = useState(false);
  const pathname = usePathname();
  const prefersReducedMotion = useReducedMotion();

  const breadcrumbMap: Record<string, string> = {
    projects: t('projects'),
    servers: t('servers'),
    services: t('services'),
    credentials: t('credentials'),
    pricing: t('pricing'),
    admin: t('admin'),
    profile: t('profile'),
    faq: t('faq'),
    about: t('about', 'About'),
    privacy: t('privacy_policy'),
    consent: t('personal_data_consent'),
  };
  const [isNavigating, setIsNavigating] = useState(false);
  
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [isEmailView, setIsEmailView] = useState(false);
  const [isRegistering, setIsRegistering] = useState(false);
  const [authError, setAuthError] = useState('');

  useEffect(() => {
    setIsNavigating(true);
    const timer = setTimeout(() => setIsNavigating(false), 200);
    return () => clearTimeout(timer);
  }, [pathname]);

  useEffect(() => {
    const isDarkMode = localStorage.getItem('theme') === 'dark' || 
      (!('theme' in localStorage) && window.matchMedia('(prefers-color-scheme: dark)').matches);
    setIsDark(isDarkMode);
    if (isDarkMode) {
      document.documentElement.classList.add('dark');
    } else {
      document.documentElement.classList.remove('dark');
    }
    setMounted(true);
  }, []);

  useEffect(() => {
    document.body.classList.remove('glassmorphism-theme', 'defi-theme', 'eco-theme');
    if (theme === 'glassmorphism') {
      document.body.classList.add('glassmorphism-theme');
    } else if (theme === 'defi') {
      document.body.classList.add('defi-theme');
    } else if (theme === 'eco') {
      document.body.classList.add('eco-theme');
    }
  }, [theme]);

  const toggleTheme = () => {
    const newTheme = !isDark;
    setIsDark(newTheme);
    if (newTheme) {
      document.documentElement.classList.add('dark');
      localStorage.setItem('theme', 'dark');
    } else {
      document.documentElement.classList.remove('dark');
      localStorage.setItem('theme', 'light');
    }
  };

  if (!mounted || loading) {
    return <LoadingScreen />;
  }

  if (pathname.startsWith('/share/')) {
    return <main className="min-h-screen bg-[var(--neu-bg)]">{children}</main>;
  }

  if (isPaywall) {
    return <Paywall />;
  }

  const motionProps = prefersReducedMotion ? { initial: false, animate: false, exit: undefined } : {};

  return (
    <div className="flex h-screen overflow-hidden bg-[var(--neu-bg)] text-[var(--neu-text)]">
      <UpgradeModal
        open={themeUpgradeOpen}
        onClose={() => setThemeUpgradeOpen(false)}
        title={t('theme_locked_title', 'Выбор темы — в Standard')}
        description={t('theme_locked_desc', 'В бесплатном тарифе доступна только стандартная тема. Переходите на Standard за 300 ₽/мес — выбор цветовой схемы, экспорт, уведомления и многое другое.')}
        targetPlan="standard"
      />
      <a href="#main-content" className="sr-only focus:not-sr-only focus:fixed focus:top-4 focus:left-4 focus:z-[999] focus:px-4 focus:py-2 focus:neu-button focus:neu-button-accent focus:rounded-lg">
        {t('skip_to_content', 'Skip to content')}
      </a>
      <AnimatePresence>
        {isNavigating && (
          <motion.div 
            {...motionProps}
            initial={{ width: 0, opacity: 1 }}
            animate={{ width: '100%', opacity: 1 }}
            exit={{ opacity: 0 }}
            transition={{ duration: 0.2, ease: "linear" }}
            className="fixed top-0 left-0 right-0 h-1 bg-[var(--neu-accent)] z-[100] shadow-[0_0_10px_var(--neu-accent)]"
          />
        )}
      </AnimatePresence>

      <aside className={cn("hidden flex-col neu-panel-sidebar m-4 mr-0 rounded-2xl md:flex shrink-0 transition-all duration-300 overflow-hidden", desktopSidebarOpen ? "w-44" : "w-[68px]")}>
        <div className="flex-1 overflow-y-auto px-2 py-6 scrollbar-hide">
          <nav className={cn("flex flex-col gap-0.5 font-normal text-[13px]", desktopSidebarOpen ? "items-stretch" : "items-center")}>
            <NavItems mode="desktop" isOpen={desktopSidebarOpen} />
            <button 
              title={!desktopSidebarOpen ? (isDark ? t('light_mode', 'Светлая тема') : t('dark_mode', 'Тёмная тема')) : undefined}
              className={cn("flex items-center gap-2 rounded-md py-1.5 transition-all duration-200 overflow-hidden", desktopSidebarOpen ? "px-3" : "px-0 justify-center w-10", "text-[var(--neu-text)] opacity-60 hover:opacity-100")}
              onClick={toggleTheme}
            >
              {isDark ? <Sun className="h-4 w-4 shrink-0" /> : <Moon className="h-4 w-4 shrink-0" />}
              {desktopSidebarOpen && <span className="transition-opacity duration-300 whitespace-nowrap overflow-hidden text-ellipsis">{isDark ? t('light_mode', 'Светлая тема') : t('dark_mode', 'Тёмная тема')}</span>}
            </button>
            <button
              title={!desktopSidebarOpen ? (theme === 'neumorphic' ? 'Glassmorphism' : theme === 'glassmorphism' ? 'DeFi Yield' : theme === 'defi' ? 'Eco' : 'Neumorphic') : undefined}
              className={cn(
                "flex items-center gap-2 rounded-md py-1.5 transition-all duration-200 overflow-hidden relative",
                desktopSidebarOpen ? "px-3" : "px-0 justify-center w-10",
                canUsePremiumTheme ? "cursor-pointer" : "cursor-not-allowed opacity-50",
                (theme === 'glassmorphism' || theme === 'defi' || theme === 'eco') && canUsePremiumTheme && "text-[var(--neu-accent)]",
                "text-[var(--neu-text)] opacity-60 hover:opacity-100"
              )}
              onClick={() => {
                if (!planLimits.canChangeTheme) {
                  setThemeUpgradeOpen(true);
                  return;
                }
                if (!canUsePremiumTheme) return;
                const cycle: ('neumorphic' | 'glassmorphism' | 'defi' | 'eco')[] = ['neumorphic', 'glassmorphism', 'defi', 'eco'];
                const next = cycle[(cycle.indexOf(theme) + 1) % cycle.length];
                setTheme(next);
              }}
              disabled={false}
            >
              <Sparkles className="h-4 w-4 shrink-0" />
              {!planLimits.canChangeTheme && !desktopSidebarOpen && <Lock className="h-2 w-2 absolute bottom-2 right-2 text-[var(--neu-text-muted)]" />}
              {desktopSidebarOpen && (
                <span className="transition-opacity duration-300 whitespace-nowrap overflow-hidden text-ellipsis">
                  {theme === 'neumorphic' ? 'Glassmorphism' : theme === 'glassmorphism' ? 'DeFi Yield' : theme === 'defi' ? 'Eco' : 'Neumorphic'}
                  {!planLimits.canChangeTheme && <Lock className="inline h-3 w-3 text-[var(--neu-text-muted)] ml-1" />}
                </span>
              )}
            </button>
            <button 
              title={!desktopSidebarOpen ? t('change_language', 'Сменить язык') : undefined}
              className={cn("flex items-center gap-2 rounded-md py-1.5 transition-all duration-200 overflow-hidden", desktopSidebarOpen ? "px-3" : "px-0 justify-center w-10", "text-[var(--neu-text)] opacity-60 hover:opacity-100")}
              onClick={() => i18n.changeLanguage(i18n.language === 'ru' ? 'en' : 'ru')}
            >
              <span className="h-4 w-4 shrink-0 flex items-center justify-center font-bold text-[10px]">{i18n.language === 'ru' ? 'RU' : 'EN'}</span>
              {desktopSidebarOpen && <span className="transition-opacity duration-300 whitespace-nowrap overflow-hidden text-ellipsis">{t('change_language', 'Сменить язык')}</span>}
            </button>
          </nav>
        </div>
       </aside>

      <div className="flex flex-1 flex-col overflow-hidden">
        <header className="flex h-14 items-center justify-between px-4 mt-2">
          <div className="flex items-center gap-3">
            <Button variant="outline" size="icon" className="neu-button h-8 w-8 border-0 bg-transparent shrink-0 md:hidden" onClick={() => setSidebarOpen(!sidebarOpen)} aria-label="Open sidebar menu">
              <Menu className="h-5 w-5" />
            </Button>
            <Button variant="outline" size="icon" className="neu-button h-8 w-8 border-0 bg-transparent shrink-0 hidden md:flex" onClick={() => setDesktopSidebarOpen(!desktopSidebarOpen)} aria-label="Toggle sidebar">
              <Menu className="h-5 w-5" />
            </Button>
            
            <Link href="/" className="flex items-center gap-2 hover:opacity-80 transition-opacity ml-1">
               <div className="neu-panel-inset p-0.5 rounded-xl text-[var(--neu-accent)] overflow-hidden w-9 h-9 flex items-center justify-center shrink-0">
                  <img src={LOGO_BASE64} alt="StackBox Logo" className="w-[450%] h-[450%] object-contain scale-[1.5]" />
               </div>
               <span className="text-lg font-bold tracking-tight hidden sm:block">StackBox</span>
            </Link>
          </div>
          
          <div className="flex gap-1.5 md:gap-2 ml-auto items-center">
             <NotificationBell />
             <CommandPalette />
              {user && user.isAnonymous ? (
                <button className="neu-button h-9 px-3 md:h-10 hidden md:flex items-center justify-center cursor-pointer gap-2 shrink-0" onClick={login}>
                  <LogIn className="h-4 w-4" />
                  <span className="text-xs font-bold">{t('sign_in')}</span>
                </button>
              ) : (
                <button className="neu-button h-9 w-9 md:h-10 md:w-10 hidden md:flex items-center justify-center cursor-pointer ml-1 md:ml-3 text-red-500 shrink-0" onClick={logout} aria-label="Log out">
                  <LogOut className="h-4 w-4" />
                </button>
              )}
          </div>
        </header>

        <AnimatePresence>
          {sidebarOpen && (
            <div className="fixed inset-0 z-50 flex md:hidden">
              <motion.div 
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                exit={{ opacity: 0 }}
                className="fixed inset-0 bg-black/50 backdrop-blur-sm" 
                onClick={() => setSidebarOpen(false)} 
              />
              <motion.aside 
                initial={{ x: '-100%' }}
                animate={{ x: 0 }}
                exit={{ x: '-100%' }}
                transition={{ duration: 0.5, ease: [0.22, 1, 0.36, 1] }}
                className="relative flex w-fit min-w-[200px] max-w-[90vw] flex-col neu-panel-sidebar rounded-r-2xl h-full pt-4 pr-6"
              >
                 <div className="flex justify-between items-center px-4 mb-2">
                    <div className="flex items-center gap-3">
                       <div className="neu-panel-inset p-0.5 rounded-2xl text-[var(--neu-accent)] overflow-hidden w-12 h-12 flex items-center justify-center shrink-0">
                          <img src={LOGO_BASE64} alt="StackBox Logo" className="w-[450%] h-[450%] object-contain scale-[1.5]" />
                       </div>
                       <span className="text-2xl font-bold tracking-tight">StackBox</span>
                    </div>
                    <button className="p-2 rounded-lg text-[var(--neu-text-muted)] hover:text-[var(--neu-accent)] hover:bg-[var(--neu-accent)]/10 transition-colors" onClick={() => setSidebarOpen(false)}>
                       <X className="w-6 h-6" />
                    </button>
                 </div>
                 <nav className="flex-1 p-4 text-sm font-normal gap-0.5 overflow-y-auto flex flex-col items-start w-full">
                   <NavItems mode="mobile" onNavigate={() => setSidebarOpen(false)} />
                    <button onClick={() => { toggleTheme(); setSidebarOpen(false); }} className="flex items-center gap-3 rounded-xl px-3 py-1.5 transition-all text-[var(--neu-text)] opacity-60 hover:opacity-100 text-left w-full">
                       {isDark ? <Sun className="h-4 w-4 shrink-0" /> : <Moon className="h-4 w-4 shrink-0" />}
                       {isDark ? t('light_mode', 'Светлая тема') : t('dark_mode', 'Тёмная тема')}
                    </button>
                    <button 
                      onClick={() => { 
                        if (!planLimits.canChangeTheme) {
                          setThemeUpgradeOpen(true);
                          setSidebarOpen(false);
                          return;
                        }
                        if (!canUsePremiumTheme) return;
                        const cycle: ('neumorphic' | 'glassmorphism' | 'defi' | 'eco')[] = ['neumorphic', 'glassmorphism', 'defi', 'eco'];
                        setTheme(cycle[(cycle.indexOf(theme) + 1) % cycle.length]);
                        setSidebarOpen(false); 
                      }} 
                      className={cn(
                        "flex items-center gap-3 rounded-xl px-3 py-1.5 transition-all text-left w-full",
                        planLimits.canChangeTheme && canUsePremiumTheme ? "" : "opacity-50",
                        (theme === 'glassmorphism' || theme === 'defi' || theme === 'eco') && canUsePremiumTheme ? "text-[var(--neu-accent)]" : "text-[var(--neu-text)]",
                        "opacity-60 hover:opacity-100"
                      )}
                    >
                       <Sparkles className="h-4 w-4 shrink-0" />
                       {theme === 'neumorphic' ? 'Glassmorphism' : theme === 'glassmorphism' ? 'DeFi Yield' : theme === 'defi' ? 'Eco' : 'Neumorphic'}
                       {!planLimits.canChangeTheme && <Lock className="inline h-3 w-3 text-[var(--neu-text-muted)] ml-1" />}
                    </button>
                    <button onClick={() => { i18n.changeLanguage(i18n.language === 'ru' ? 'en' : 'ru'); setSidebarOpen(false); }} className="flex items-center gap-3 rounded-xl px-3 py-1.5 transition-all text-[var(--neu-text)] opacity-60 hover:opacity-100 text-left w-full">
                       <div className="w-4 h-4 flex items-center justify-center font-bold text-[10px] shrink-0">{i18n.language === 'ru' ? 'RU' : 'EN'}</div>
                       {t('change_language', 'Сменить язык')}
                    </button>
                    {user && user.isAnonymous ? (
                      <button onClick={() => { login(); setSidebarOpen(false); }} className="flex items-center gap-3 rounded-xl px-3 py-1.5 transition-all text-[var(--neu-accent)] opacity-80 hover:opacity-100 text-left w-full">
                        <LogIn className="h-4 w-4 shrink-0" />
                        {t('sign_in', 'Войти')}
                      </button>
                    ) : (
                      <button onClick={logout} className="flex items-center gap-3 rounded-xl px-3 py-1.5 transition-all text-red-500 opacity-60 hover:opacity-100 text-left w-full">
                        <LogOut className="h-4 w-4 shrink-0" />
                        {t('logout', 'Выйти')}
                      </button>
                    )}
                 </nav>
              </motion.aside>
            </div>
          )}
        </AnimatePresence>

        <main id="main-content" className="flex-1 overflow-y-auto p-4 md:p-6 pb-20">
          <nav aria-label="Breadcrumb" className="mb-4">
            <ol className="flex items-center gap-2 text-xs text-[var(--neu-text-muted)]">
              <li>
                <Link href="/" className="hover:text-[var(--neu-accent)] transition-colors">{t('dashboard', 'Dashboard')}</Link>
              </li>
              {pathname !== '/' && (
                <>
                  <li>/</li>
                  <li className="text-[var(--neu-text)] font-medium">{breadcrumbMap[pathname.split('/')[1]] || pathname.split('/')[1] || ''}</li>
                </>
              )}
            </ol>
          </nav>
          <AnimatePresence initial={false}>
            <motion.div
              key={pathname}
              initial={{ opacity: 0, y: 4 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0 }}
              transition={{ duration: 0.12, ease: "easeOut" }}
              className="h-full"
            >
              {children}
              <footer className="mt-10 pt-6 pb-8 border-t border-[var(--neu-border)] text-[var(--neu-text-muted)] opacity-80 text-[12px] font-medium text-center md:text-left flex flex-col md:flex-row md:justify-between items-center md:items-start gap-4">
                <div className="flex flex-col gap-1.5">
                  <p>{t('it_asset_manager')} v1.0.0</p>
                  <p>© 2026 StackBox</p>
                </div>
                <div className="flex flex-col gap-1.5">
                  <a href="mailto:info@premiumwebsite.ru" className="hover:text-[var(--neu-accent)] transition-colors">{t('technical_support')}</a>
                  <a href="https://t.me/usefulbots2026_bot" target="_blank" rel="noopener noreferrer" className="hover:text-[var(--neu-accent)] transition-colors">{t('useful_bots')}</a>
                </div>
                <div className="flex flex-col gap-1.5">
                  <Link href="/consent" className="hover:text-[var(--neu-accent)] transition-colors">{t('personal_data_consent')}</Link>
                  <Link href="/privacy" className="hover:text-[var(--neu-accent)] transition-colors">{t('privacy_policy')}</Link>
                  <a href="https://github.com/Kristine79/IT-Box-my-servers/blob/main/SECURITY_GUIDE.md" target="_blank" rel="noopener noreferrer" className="hover:text-[var(--neu-accent)] transition-colors">{t('security', 'Безопасность')}</a>
                </div>
              </footer>
            </motion.div>
          </AnimatePresence>
        </main>
      </div>
      <AIConsultant />
      <SecurityOnboarding />
    </div>
  );
}
