'use client';

import { useAuth } from '@/lib/providers';
import { Button } from './ui/button';
import { useTranslation } from 'react-i18next';
import { LayoutDashboard, FolderKanban, Server, Network, KeyRound, Share2, LogOut, Menu, Languages, Search, Moon, Sun, CreditCard, HelpCircle } from 'lucide-react';
import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { cn } from '@/lib/utils';
import { useState, useEffect } from 'react';
import { Input } from './ui/input';

import { Paywall } from './Paywall';
import { LoadingScreen } from './ui/LoadingScreen';
import { motion, AnimatePresence } from 'motion/react';
import { NotificationBell } from './NotificationBell';

export default function AppLayout({ children }: { children: React.ReactNode }) {
  const { user, loading, isPaywall, login, loginWithEmail, logout } = useAuth();
  const { t, i18n } = useTranslation();
  const [sidebarOpen, setSidebarOpen] = useState(false);
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

  // If public route like /share/:token, we don't force login or show sidebar.
  // We'll let the individual page handle it, but wait, usually we apply AppLayout in an (app) group.
  // Actually, we can just check if pathname starts with /share/
  if (pathname.startsWith('/share/')) {
    return <main className="min-h-screen bg-[var(--neu-bg)]">{children}</main>;
  }

  // If not logged in
  if (!user) {
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
        <div className="neu-panel p-10 md:p-14 text-center rounded-3xl max-w-lg w-full relative overflow-hidden">
          <div className="absolute top-0 left-0 right-0 h-2 bg-[var(--neu-accent)]" />
          
          <div className="neu-panel-inset mx-auto w-16 h-16 md:w-20 md:h-20 rounded-full flex flex-col justify-center items-center text-blue-400 mb-6 overflow-hidden">
            <img src="/logo.png" alt="IT-Box Logo" className="w-[120%] h-[120%] object-contain" />
          </div>
          <h1 className="text-2xl md:text-3xl font-bold tracking-wide mb-3">IT-Box</h1>
          <p className="text-[var(--neu-text-muted)] font-medium mb-8 md:mb-10 leading-relaxed text-sm lg:text-base">
            {t('login_subtitle')}
          </p>
          
          {isEmailView ? (
             <form onSubmit={handleEmailAuth} className="space-y-4 text-left">
                {authError && <div className="text-sm text-red-500 bg-red-100 dark:bg-red-900/30 p-2 rounded">{authError}</div>}
                
                <div>
                  <label className="text-xs uppercase tracking-wider font-bold text-[var(--neu-text-muted)] ml-1">{t('email_ph', 'Email address')}</label>
                  <Input type="email" required value={email} onChange={e=>setEmail(e.target.value)} className="neu-input w-full mt-1" />
                </div>
                <div>
                  <label className="text-xs uppercase tracking-wider font-bold text-[var(--neu-text-muted)] ml-1">{t('password_ph', 'Password')}</label>
                  <Input type="password" required value={password} onChange={e=>setPassword(e.target.value)} className="neu-input w-full mt-1" />
                </div>
                
                <div className="flex items-center gap-2 mt-2">
                  <input type="checkbox" id="register" checked={isRegistering} onChange={e=>setIsRegistering(e.target.checked)} className="rounded" />
                  <label htmlFor="register" className="text-sm cursor-pointer">{t('register_new_account', 'Register new account')}</label>
                </div>

                <div className="pt-2 flex flex-col gap-3">
                   <button type="submit" className="neu-button font-bold py-3 bg-[var(--neu-accent)] text-white shadow-none w-full">
                     {isRegistering ? t('sign_up', 'Sign Up') : t('sign_in', 'Sign In')}
                   </button>
                   <button type="button" onClick={() => {setIsEmailView(false); setAuthError('');}} className="neu-button py-3 text-sm font-medium w-full">
                     {t('back', 'Back')}
                   </button>
                </div>
             </form>
          ) : (
             <div className="flex flex-col gap-3">
                <button onClick={login} className="neu-button font-bold text-base w-full py-4 bg-[var(--neu-accent)] text-white shadow-none hover:opacity-90 transition-opacity">
                  {t('login', 'Login with Google')}
                </button>
                <button onClick={() => setIsEmailView(true)} className="neu-button font-bold text-base w-full py-4 border border-[var(--neu-border)] hover:opacity-90 transition-opacity text-[var(--neu-text-muted)]">
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
    { href: '/share-links', icon: Share2, label: t('share_links') },
  ];

  const toggleLang = () => {
    i18n.changeLanguage(i18n.language === 'en' ? 'ru' : 'en');
  };

  return (
    <div className="flex h-screen overflow-hidden bg-[var(--neu-bg)] text-[var(--neu-text)]">
      {/* Top progress bar for navigation feedback */}
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

      {/* Sidebar Desktop */}
      <aside className="hidden w-72 flex-col neu-panel m-4 mr-0 rounded-3xl md:flex shrink-0">
        <div className="px-8 pt-8 pb-4">
           <div className="flex items-center gap-3">
              <div className="neu-panel-inset p-2 rounded-xl text-[var(--neu-accent)]">
                <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M12 22s8-4 8-10V5l-8-3-8 3v7c0 6 8 10 8 10z"/></svg>
              </div>
              <span className="text-xl font-bold tracking-tight">IT-Box</span>
           </div>
        </div>

        <div className="flex-1 overflow-y-auto px-4 py-4 scrollbar-hide">
          <nav className="grid gap-2 items-start font-medium text-[15px]">
            {navItems.map((item) => {
              const isActive = pathname === item.href;
              return (
              <Link
                key={item.href}
                href={item.href}
                className={cn(
                  "flex items-center gap-4 rounded-xl px-4 py-2 transition-all duration-200",
                  isActive ? "neu-panel text-[var(--neu-accent)] border-l-4 border-[var(--neu-accent)]" : "hover:text-[var(--neu-accent)] text-[var(--neu-text)] opacity-80 hover:opacity-100"
                )}
              >
                <item.icon className="h-5 w-5" />
                {item.label}
              </Link>
            )})}
            
            <div className="my-4 h-px neu-panel-inset opacity-50" />
            
            <Link href="/about" className={cn("flex items-center gap-4 rounded-xl px-4 py-2 transition-all duration-200", pathname === "/about" ? "neu-panel text-[var(--neu-accent)] border-l-4 border-[var(--neu-accent)]" : "text-[var(--neu-text)] opacity-60 hover:opacity-100")}>
               <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M4 19.5v-15A2.5 2.5 0 0 1 6.5 2H20v20H6.5a2.5 2.5 0 0 1-0-2.5z"/><path d="M6.5 2H20v20H6.5A2.5 2.5 0 0 1 4 19.5v-15A2.5 2.5 0 0 1 6.5 2z"/></svg>
               {t('about')}
            </Link>
            <Link href="/faq" className={cn("flex items-center gap-4 rounded-xl px-4 py-2 transition-all duration-200", pathname === "/faq" ? "neu-panel text-[var(--neu-accent)] border-l-4 border-[var(--neu-accent)]" : "text-[var(--neu-text)] opacity-60 hover:opacity-100")}>
               <HelpCircle className="h-5 w-5" />
               {t('faq')}
            </Link>
            <Link href="/pricing" className={cn("flex items-center gap-4 rounded-xl px-4 py-2 transition-all duration-200", pathname === "/pricing" ? "neu-panel text-[var(--neu-accent)] border-l-4 border-[var(--neu-accent)]" : "text-[var(--neu-text)] opacity-60 hover:opacity-100")}>
               <CreditCard className="h-5 w-5" />
               {t('pricing')}
            </Link>
          </nav>
        </div>
        
        <div className="p-6 text-xs text-[var(--neu-text-muted)] opacity-70">
           <p className="font-semibold text-[13px] mb-1">{t('it_asset_manager')}</p>
           <p>v1.0.0</p>
           <p className="mt-4 mb-2">© 2026 IT-Box<br/>
           <a href="mailto:info@premiumwebsite.ru" className="hover:text-[var(--neu-accent)] transition-colors inline-block font-medium">{i18n.language === 'en' ? 'Technical support' : 'Техническая поддержка'}</a><br/>
           <a href="https://t.me/usefulbots2026_bot" target="_blank" className="hover:text-[var(--neu-accent)] transition-colors inline-block font-medium mt-1">{i18n.language === 'en' ? 'Useful Telegram bots' : 'Полезные Telegram боты'}</a></p>
           <p className="mt-2"><a href="#" className="hover:text-[var(--neu-accent)] transition-colors">{t('privacy_policy')}</a></p>
        </div>
      </aside>

      {/* Main Content */}
      <div className="flex flex-1 flex-col overflow-hidden">
        <header className="flex h-16 lg:h-20 items-center justify-between px-6 lg:px-12 mt-2 lg:mt-4">
          <div className="flex items-center gap-4 md:hidden">
            <Button variant="outline" size="icon" className="neu-button h-10 w-10 border-0 bg-transparent shrink-0" onClick={() => setSidebarOpen(!sidebarOpen)}>
              <Menu className="h-5 w-5" />
            </Button>
          </div>
          
          <div className="flex-1 md:hidden"></div>
          
          <div className="flex md:hidden gap-2 ml-auto items-center">
             <div className="neu-panel-inset flex items-center p-0.5 rounded-full">
                <div className={cn(
                  "h-8 px-3 flex items-center justify-center text-[10px] cursor-pointer rounded-full font-bold transition-all",
                  i18n.language === 'ru' ? "neu-button bg-[var(--neu-accent)] text-white shadow-none" : "opacity-60"
                )} onClick={() => i18n.changeLanguage('ru')}>RU</div>
                <div className={cn(
                  "h-8 px-3 flex items-center justify-center text-[10px] cursor-pointer rounded-full font-bold transition-all",
                  i18n.language === 'en' ? "neu-button bg-[var(--neu-accent)] text-white shadow-none" : "opacity-60"
                )} onClick={() => i18n.changeLanguage('en')}>EN</div>
             </div>
             <div className="neu-button h-10 w-10 flex items-center justify-center cursor-pointer" onClick={toggleTheme}>
                {isDark ? <Sun className="h-4 w-4" /> : <Moon className="h-4 w-4" />}
             </div>
             <NotificationBell />
             <div className="neu-button h-10 w-10 flex items-center justify-center cursor-pointer text-red-500" onClick={logout}>
                <LogOut className="h-4 w-4" />
             </div>
          </div>

          <div className="hidden md:flex gap-4 ml-auto items-center">
             <div className="neu-button h-12 w-12 flex items-center justify-center cursor-pointer" onClick={toggleTheme}>
                {isDark ? <Sun className="h-5 w-5" /> : <Moon className="h-5 w-5" />}
             </div>
             <NotificationBell />
             <div className="neu-button h-12 w-12 flex items-center justify-center cursor-pointer">
                <Search className="h-5 w-5" />
             </div>
             <div className="neu-button h-12 w-12 flex items-center justify-center cursor-pointer">
                <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><circle cx="12" cy="12" r="4"/><path d="M12 2v2"/><path d="M12 20v2"/><path d="m4.93 4.93 1.41 1.41"/><path d="m17.66 17.66 1.41 1.41"/><path d="M2 12h2"/><path d="M20 12h2"/><path d="m6.34 17.66-1.41 1.41"/><path d="m19.07 4.93-1.41 1.41"/></svg>
             </div>
             
             <div className="neu-panel-inset flex items-center p-1 rounded-full ml-4">
               <div className={`h-10 px-5 flex items-center justify-center text-sm cursor-pointer rounded-full font-bold ${i18n.language === 'ru' ? 'neu-button bg-[var(--neu-accent)] text-white shadow-none' : 'opacity-60 hover:opacity-100'}`} onClick={() => i18n.changeLanguage('ru')}>RU</div>
               <div className={`h-10 px-5 flex items-center justify-center text-sm cursor-pointer rounded-full font-bold ${i18n.language === 'en' ? 'neu-button bg-[var(--neu-accent)] text-white shadow-none' : 'opacity-60 hover:opacity-100'}`} onClick={() => i18n.changeLanguage('en')}>EN</div>
             </div>
             
             <div className="neu-button h-12 w-12 flex items-center justify-center cursor-pointer ml-4 text-red-500" onClick={logout}>
                <LogOut className="h-5 w-5" />
             </div>
          </div>
        </header>

        {/* Mobile Navigation overlay */}
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
                className="relative flex w-72 flex-col bg-[var(--neu-bg)] m-0 rounded-r-xl h-full pt-6 border-r border-[var(--neu-text-muted)]/10 shadow-2xl"
              >
                 <nav className="flex-1 p-4 text-sm font-medium gap-2 overflow-y-auto flex flex-col">
                   {navItems.map((item) => (
                      <Link
                        key={item.href}
                        href={item.href}
                        onClick={() => setSidebarOpen(false)}
                        className={cn(
                          "flex items-center gap-4 rounded-xl px-4 py-2 transition-all text-[15px]",
                          pathname === item.href ? "neu-panel text-[var(--neu-accent)] border-l-4 border-[var(--neu-accent)]" : "hover:text-[var(--neu-accent)] opacity-80"
                        )}
                      >
                        <item.icon className="h-5 w-5" />
                        {item.label}
                      </Link>
                    ))}
                    
                    <div className="my-2 h-px neu-panel-inset opacity-50" />
                    
                    <Link href="/about" onClick={() => setSidebarOpen(false)} className={cn("flex items-center gap-4 rounded-xl px-4 py-2 transition-all text-[15px]", pathname === "/about" ? "neu-panel text-[var(--neu-accent)] border-l-4 border-[var(--neu-accent)]" : "hover:text-[var(--neu-accent)] opacity-80")}>
                       <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M4 19.5v-15A2.5 2.5 0 0 1 6.5 2H20v20H6.5a2.5 2.5 0 0 1-0-2.5z"/><path d="M6.5 2H20v20H6.5A2.5 2.5 0 0 1 4 19.5v-15A2.5 2.5 0 0 1 6.5 2z"/></svg>
                       {t('about')}
                    </Link>
                    <Link href="/faq" onClick={() => setSidebarOpen(false)} className={cn("flex items-center gap-4 rounded-xl px-4 py-2 transition-all text-[15px]", pathname === "/faq" ? "neu-panel text-[var(--neu-accent)] border-l-4 border-[var(--neu-accent)]" : "hover:text-[var(--neu-accent)] opacity-80")}>
                       <HelpCircle className="h-5 w-5" />
                       {t('faq')}
                    </Link>
                    <Link href="/pricing" onClick={() => setSidebarOpen(false)} className={cn("flex items-center gap-4 rounded-xl px-4 py-2 transition-all text-[15px]", pathname === "/pricing" ? "neu-panel text-[var(--neu-accent)] border-l-4 border-[var(--neu-accent)]" : "hover:text-[var(--neu-accent)] opacity-80")}>
                       <CreditCard className="h-5 w-5" />
                       {t('pricing')}
                    </Link>
                 </nav>
                 <div className="p-6 text-xs text-[var(--neu-text-muted)] opacity-70 border-t border-[var(--neu-border)]/5">
                   <p className="font-semibold text-[13px] mb-1">{t('it_asset_manager')}</p>
                   <p>v1.0.0</p>
                   <p className="mt-4 mb-2">© 2026 IT-Box<br/>
                   <a href="mailto:info@premiumwebsite.ru" className="hover:text-[var(--neu-accent)] transition-colors inline-block font-medium">{i18n.language === 'en' ? 'Technical support' : 'Техническая поддержка'}</a><br/>
                   <a href="https://t.me/usefulbots2026_bot" target="_blank" className="hover:text-[var(--neu-accent)] transition-colors inline-block font-medium mt-1">{i18n.language === 'en' ? 'Useful Telegram bots' : 'Полезные Telegram боты'}</a></p>
                   <p className="mt-2"><a href="#" className="hover:text-[var(--neu-accent)] transition-colors">{t('privacy_policy')}</a></p>
                </div>
              </motion.aside>
            </div>
          )}
        </AnimatePresence>

        {/* Main scrollable area */}
        <main className="flex-1 overflow-y-auto p-4 pt-4 md:p-8 lg:p-12 pb-24">
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
            </motion.div>
          </AnimatePresence>
        </main>
      </div>
    </div>
  );
}
