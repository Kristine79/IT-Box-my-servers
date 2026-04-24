'use client';

import { useAuth } from '@/lib/providers';
import { Button } from './ui/button';
import { useTranslation } from 'react-i18next';
import { LayoutDashboard, FolderKanban, Server, Network, KeyRound, Share2, LogOut, Menu, HelpCircle, CreditCard, Moon, Sun, Search, X } from 'lucide-react';
import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { cn } from '@/lib/utils';
import { useState, useEffect } from 'react';
import { Input } from './ui/input';
import { LOGO_BASE64 } from '@/lib/logoBase64';

import { Paywall } from './Paywall';
import { LoadingScreen } from './ui/LoadingScreen';
import { motion, AnimatePresence } from 'motion/react';
import { NotificationBell } from './NotificationBell';

// import { useGoogleReCaptcha } from 'react-google-recaptcha-v3';

import { AIConsultant } from './AIConsultant';

export default function AppLayout({ children }: { children: React.ReactNode }) {
  const { user, loading, isPaywall, login, loginWithEmail, logout } = useAuth();
  const { t, i18n } = useTranslation();
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const [desktopSidebarOpen, setDesktopSidebarOpen] = useState(true);
  const [mounted, setMounted] = useState(false);
  const [isDark, setIsDark] = useState(false);
  const pathname = usePathname();
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

  if (false) {
    const handleEmailAuth = async (e: React.FormEvent) => {
      e.preventDefault();
      setAuthError('');

      try {
        await loginWithEmail(email, password, isRegistering);
      } catch (err: any) {
        setAuthError(err.message || 'Authentication error');
      }
    };

    return (
      <div className="flex bg-[var(--neu-bg)] text-[var(--neu-text)] h-screen w-full flex-col items-center justify-center p-6">
        <div className="neu-panel p-8 md:p-10 text-center rounded-3xl max-w-md w-full relative overflow-hidden">
          <div className="absolute top-0 left-0 right-0 h-2 bg-[var(--neu-accent)]" />
          
          <div className="flex items-center justify-center gap-3 mb-4">
            <div className="neu-panel-inset w-14 h-14 rounded-full flex flex-col justify-center items-center text-blue-400 overflow-hidden shrink-0">
              <img src={LOGO_BASE64} alt="StackBox Logo" className="w-[220%] h-[220%] object-contain" />
            </div>
            <h1 className="text-2xl md:text-3xl font-bold tracking-wide">StackBox</h1>
          </div>
          <p className="text-[var(--neu-text-muted)] font-medium mb-6 leading-relaxed text-sm">
            {t('login_subtitle')}
          </p>
          
          {isEmailView ? (
             <form onSubmit={handleEmailAuth} className="space-y-3 text-left">
                {authError && <div className="text-sm text-red-500 bg-red-100 dark:bg-red-900/30 p-2 rounded">{authError}</div>}
                
                <div>
                  <label className="text-xs uppercase tracking-wider font-bold text-[var(--neu-text-muted)] ml-1">{t('email_ph', 'Email address')}</label>
                  <Input type="email" required value={email} onChange={e=>setEmail(e.target.value)} className="neu-input w-full mt-1 h-10" />
                </div>
                <div>
                  <label className="text-xs uppercase tracking-wider font-bold text-[var(--neu-text-muted)] ml-1">{t('password_ph', 'Password')}</label>
                  <Input type="password" required value={password} onChange={e=>setPassword(e.target.value)} className="neu-input w-full mt-1 h-10" />
                </div>
                
                <div className="flex items-center gap-2 mt-1">
                  <input type="checkbox" id="register" checked={isRegistering} onChange={e=>setIsRegistering(e.target.checked)} className="rounded" />
                  <label htmlFor="register" className="text-sm cursor-pointer">{t('register_new_account', 'Зарегистрировать новый аккаунт')}</label>
                </div>

                <div className="pt-1 flex flex-col gap-2">
                   <button type="submit" className="neu-button font-bold py-2.5 bg-[var(--neu-accent)] text-white shadow-none w-full">
                     {isRegistering ? t('sign_up', 'Sign Up') : t('sign_in', 'Sign In')}
                   </button>
                   <button type="button" onClick={() => {setIsEmailView(false); setAuthError('');}} className="neu-button py-2.5 text-sm font-medium w-full">
                     {t('back', 'Back')}
                   </button>
                </div>
             </form>
          ) : (
             <div className="flex flex-col gap-3">
                <button onClick={login} className="neu-button font-bold text-sm md:text-base w-full py-3 md:py-3.5 bg-[var(--neu-accent)] text-white shadow-none hover:opacity-90 transition-opacity">
                  {t('login', 'Login with Google')}
                </button>
                <button onClick={() => setIsEmailView(true)} className="neu-button font-bold text-sm md:text-base w-full py-3 md:py-3.5 border border-[var(--neu-border)] hover:opacity-90 transition-opacity text-[var(--neu-text-muted)]">
                  {t('login_email', 'Login with Email')}
                </button>
             </div>
          )}
        </div>
      </div>
    );
  }

  if (isPaywall) {
    return <Paywall />;
  }

  const navItems = [
    { href: '/', icon: LayoutDashboard, label: t('dashboard') },
    { href: '/projects', icon: FolderKanban, label: t('projects') },
    { href: '/servers', icon: Server, label: t('servers') },
    { href: '/services', icon: Network, label: t('services') },
    { href: '/credentials', icon: KeyRound, label: t('credentials') },
  ];

  return (
    <div className="flex h-screen overflow-hidden bg-[var(--neu-bg)] text-[var(--neu-text)]">
      <AnimatePresence>
        {isNavigating && (
          <motion.div 
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

            {navItems.map((item) => {
              const isActive = pathname === item.href;
              return (
              <Link
                key={item.href}
                href={item.href}
                title={!desktopSidebarOpen ? item.label : undefined}
                className={cn(
                  "flex items-center gap-2 rounded-md py-1.5 transition-all duration-200 overflow-hidden",
                  desktopSidebarOpen ? "px-3" : "px-0 justify-center w-10",
                  isActive ? "neu-panel text-[var(--neu-accent)] border-l-2 border-[var(--neu-accent)]" : "hover:text-[var(--neu-accent)] text-[var(--neu-text)] opacity-80 hover:opacity-100"
                )}
              >
                <item.icon className="h-4 w-4 shrink-0" />
                {desktopSidebarOpen && <span className="transition-opacity duration-300 whitespace-nowrap overflow-hidden text-ellipsis">{item.label}</span>}
              </Link>
            )})}
            
            <div className={cn("my-1.5 h-px neu-panel-inset opacity-50", desktopSidebarOpen ? "w-full" : "w-10")} />
            
            <Link href="/about" title={!desktopSidebarOpen ? t('about') : undefined} className={cn("flex items-center gap-2 rounded-md py-1.5 transition-all duration-200 overflow-hidden", desktopSidebarOpen ? "px-3" : "px-0 justify-center w-10", pathname === "/about" ? "neu-panel text-[var(--neu-accent)] border-l-2 border-[var(--neu-accent)]" : "text-[var(--neu-text)] opacity-60 hover:opacity-100")}>
               <HelpCircle className="h-4 w-4 shrink-0" />
               {desktopSidebarOpen && <span className="transition-opacity duration-300 whitespace-nowrap overflow-hidden text-ellipsis">{t('about')}</span>}
            </Link>
            <Link href="/faq" title={!desktopSidebarOpen ? t('faq') : undefined} className={cn("flex items-center gap-2 rounded-md py-1.5 transition-all duration-200 overflow-hidden", desktopSidebarOpen ? "px-3" : "px-0 justify-center w-10", pathname === "/faq" ? "neu-panel text-[var(--neu-accent)] border-l-2 border-[var(--neu-accent)]" : "text-[var(--neu-text)] opacity-60 hover:opacity-100")}>
               <HelpCircle className="h-4 w-4 shrink-0" />
               {desktopSidebarOpen && <span className="transition-opacity duration-300 whitespace-nowrap overflow-hidden text-ellipsis">{t('faq')}</span>}
            </Link>
            <Link href="/pricing" title={!desktopSidebarOpen ? t('pricing') : undefined} className={cn("flex items-center gap-2 rounded-md py-1.5 transition-all duration-200 overflow-hidden", desktopSidebarOpen ? "px-3" : "px-0 justify-center w-10", pathname === "/pricing" ? "neu-panel text-[var(--neu-accent)] border-l-2 border-[var(--neu-accent)]" : "text-[var(--neu-text)] opacity-60 hover:opacity-100")}>
               <CreditCard className="h-4 w-4 shrink-0" />
               {desktopSidebarOpen && <span className="transition-opacity duration-300 whitespace-nowrap overflow-hidden text-ellipsis">{t('pricing')}</span>}
            </Link>
          </nav>
        </div>
       </aside>

      <div className="flex flex-1 flex-col overflow-hidden">
        <header className="flex h-14 items-center justify-between px-4 mt-2">
          <div className="flex items-center gap-3">
            <Button variant="outline" size="icon" className="neu-button h-8 w-8 border-0 bg-transparent shrink-0 md:hidden" onClick={() => setSidebarOpen(!sidebarOpen)}>
              <Menu className="h-5 w-5" />
            </Button>
            <Button variant="outline" size="icon" className="neu-button h-8 w-8 border-0 bg-transparent shrink-0 hidden md:flex" onClick={() => setDesktopSidebarOpen(!desktopSidebarOpen)}>
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
             <div className="neu-button h-9 w-9 md:h-10 md:w-10 hidden md:flex items-center justify-center cursor-pointer shrink-0" onClick={toggleTheme}>
                {isDark ? <Sun className="h-4 w-4" /> : <Moon className="h-4 w-4" />}
             </div>
             <NotificationBell />
             <div className="neu-button h-9 w-9 md:h-10 md:w-10 flex items-center justify-center cursor-pointer shrink-0">
                <Search className="h-4 w-4" />
             </div>
               <div className="neu-button h-9 w-9 md:h-10 md:w-10 hidden md:flex items-center justify-center cursor-pointer font-bold text-[10px] md:text-xs shrink-0 transition-colors" onClick={() => i18n.changeLanguage(i18n.language === 'ru' ? 'en' : 'ru')}>
                  {i18n.language === 'ru' ? 'RU' : 'EN'}
               </div>
             <div className="neu-button h-9 w-9 md:h-10 md:w-10 hidden md:flex items-center justify-center cursor-pointer ml-1 md:ml-3 text-red-500 shrink-0" onClick={logout}>
                <LogOut className="h-4 w-4" />
             </div>
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
                   {navItems.map((item) => (
                      <Link
                        key={item.href}
                        href={item.href}
                        onClick={() => setSidebarOpen(false)}
                        className={cn(
                          "flex items-center gap-3 rounded-xl px-3 py-1.5 transition-all w-full",
                          pathname === item.href ? "neu-panel text-[var(--neu-accent)] border-l-4 border-[var(--neu-accent)]" : "hover:text-[var(--neu-accent)] opacity-80"
                        )}
                      >
                        <item.icon className="h-4 w-4" />
                        {item.label}
                      </Link>
                    ))}
                    <div className="my-1.5 h-px neu-panel-inset opacity-50 w-full" />
                    
                    <Link href="/about" onClick={() => setSidebarOpen(false)} className={cn("flex items-center gap-3 rounded-xl px-3 py-1.5 transition-all w-full", pathname === "/about" ? "neu-panel text-[var(--neu-accent)] border-l-4 border-[var(--neu-accent)]" : "text-[var(--neu-text)] opacity-60 hover:opacity-100")}>
                       <HelpCircle className="h-4 w-4" />
                       {t('about')}
                    </Link>
                    <Link href="/faq" onClick={() => setSidebarOpen(false)} className={cn("flex items-center gap-3 rounded-xl px-3 py-1.5 transition-all w-full", pathname === "/faq" ? "neu-panel text-[var(--neu-accent)] border-l-4 border-[var(--neu-accent)]" : "text-[var(--neu-text)] opacity-60 hover:opacity-100")}>
                       <HelpCircle className="h-4 w-4" />
                       {t('faq')}
                    </Link>
                    <Link href="/pricing" onClick={() => setSidebarOpen(false)} className={cn("flex items-center gap-3 rounded-xl px-3 py-1.5 transition-all w-full", pathname === "/pricing" ? "neu-panel text-[var(--neu-accent)] border-l-4 border-[var(--neu-accent)]" : "text-[var(--neu-text)] opacity-60 hover:opacity-100")}>
                       <CreditCard className="h-4 w-4" />
                       {t('pricing')}
                    </Link>
                    <div className="my-1.5 h-px neu-panel-inset opacity-50 w-full" />
                    <button onClick={() => { toggleTheme(); setSidebarOpen(false); }} className="flex items-center gap-3 rounded-xl px-3 py-1.5 transition-all text-[var(--neu-text)] opacity-60 hover:opacity-100 text-left w-full">
                       {isDark ? <Sun className="h-4 w-4 shrink-0" /> : <Moon className="h-4 w-4 shrink-0" />}
                       {isDark ? t('light_mode', 'Светлая тема') : t('dark_mode', 'Тёмная тема')}
                    </button>
                    <button onClick={() => { i18n.changeLanguage(i18n.language === 'ru' ? 'en' : 'ru'); setSidebarOpen(false); }} className="flex items-center gap-3 rounded-xl px-3 py-1.5 transition-all text-[var(--neu-text)] opacity-60 hover:opacity-100 text-left w-full">
                       <div className="w-4 h-4 flex items-center justify-center font-bold text-[10px] shrink-0">{i18n.language === 'ru' ? 'RU' : 'EN'}</div>
                       {t('change_language', 'Сменить язык')}
                    </button>
                    <button onClick={logout} className="flex items-center gap-3 rounded-xl px-3 py-1.5 transition-all text-red-500 opacity-60 hover:opacity-100 text-left w-full">
                       <LogOut className="h-4 w-4 shrink-0" />
                       {t('logout', 'Выйти')}
                    </button>
                 </nav>
              </motion.aside>
            </div>
          )}
        </AnimatePresence>

        <main className="flex-1 overflow-y-auto p-4 md:p-6 pb-20">
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
                  <a href="mailto:info@premiumwebsite.ru" className="hover:text-[var(--neu-accent)] transition-colors">{i18n.language === 'en' ? 'Technical support' : 'Техническая поддержка'}</a>
                  <a href="https://t.me/usefulbots2026_bot" target="_blank" className="hover:text-[var(--neu-accent)] transition-colors">{i18n.language === 'en' ? 'Useful Telegram bots' : 'Полезные Telegram боты'}</a>
                </div>
                <div className="flex flex-col gap-1.5">
                  <a href="/privacy-consent" className="hover:text-[var(--neu-accent)] transition-colors">Согласие на обработку персональных данных</a>
                  <a href="#" className="hover:text-[var(--neu-accent)] transition-colors">{t('privacy_policy')}</a>
                </div>
              </footer>
            </motion.div>
          </AnimatePresence>
        </main>
      </div>
      <AIConsultant />
    </div>
  );
}
