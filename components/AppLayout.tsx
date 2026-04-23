'use client';

import { useAuth } from '@/lib/providers';
import { Button } from './ui/button';
import { useTranslation } from 'react-i18next';
import { LayoutDashboard, FolderKanban, Server, Network, KeyRound, Share2, LogOut, Menu, HelpCircle, CreditCard, Moon, Sun, Search } from 'lucide-react';
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

      <aside className={cn("hidden flex-col neu-panel m-4 mr-0 rounded-3xl md:flex shrink-0 transition-all duration-300", desktopSidebarOpen ? "w-52" : "w-16")}>
         <div className="px-6 pt-6 pb-2">
            <div className="flex items-center gap-2">
               <div className="neu-panel-inset p-0.5 rounded-xl text-[var(--neu-accent)] overflow-hidden w-8 h-8 flex items-center justify-center cursor-pointer" onClick={() => setDesktopSidebarOpen(!desktopSidebarOpen)}>
                  <img src="/logo.png" alt="IT-Box Logo" className="w-[140%] h-[140%] object-contain" />
               </div>
               <span className={cn("text-base font-bold tracking-tight transition-opacity duration-300", desktopSidebarOpen ? "opacity-100" : "opacity-0")}>IT-Box</span>
            </div>
         </div>

         <div className="flex-1 overflow-y-auto px-2 py-1 scrollbar-hide">
           <nav className="grid gap-0.5 items-start font-medium text-[13px]">
             {navItems.map((item) => {
               const isActive = pathname === item.href;
               return (
               <Link
                 key={item.href}
                 href={item.href}
                 className={cn(
                   "flex items-center gap-2 rounded-md px-3 py-1.5 transition-all duration-200",
                   isActive ? "neu-panel text-[var(--neu-accent)] border-l-2 border-[var(--neu-accent)]" : "hover:text-[var(--neu-accent)] text-[var(--neu-text)] opacity-80 hover:opacity-100"
                 )}
               >
                 <item.icon className="h-4 w-4" />
                 {desktopSidebarOpen && <span className="transition-opacity duration-300">{item.label}</span>}
               </Link>
             )})}
             
             <div className="my-1.5 h-px neu-panel-inset opacity-50" />
             
             <Link href="/about" className={cn("flex items-center gap-2 rounded-md px-3 py-1.5 transition-all duration-200", pathname === "/about" ? "neu-panel text-[var(--neu-accent)] border-l-2 border-[var(--neu-accent)]" : "text-[var(--neu-text)] opacity-60 hover:opacity-100")}>
                <HelpCircle className="h-4 w-4" />
                {desktopSidebarOpen && <span className="transition-opacity duration-300">{t('about')}</span>}
             </Link>
             <Link href="/faq" className={cn("flex items-center gap-2 rounded-md px-3 py-1.5 transition-all duration-200", pathname === "/faq" ? "neu-panel text-[var(--neu-accent)] border-l-2 border-[var(--neu-accent)]" : "text-[var(--neu-text)] opacity-60 hover:opacity-100")}>
                <HelpCircle className="h-4 w-4" />
                {desktopSidebarOpen && <span className="transition-opacity duration-300">{t('faq')}</span>}
             </Link>
             <Link href="/pricing" className={cn("flex items-center gap-2 rounded-md px-3 py-1.5 transition-all duration-200", pathname === "/pricing" ? "neu-panel text-[var(--neu-accent)] border-l-2 border-[var(--neu-accent)]" : "text-[var(--neu-text)] opacity-60 hover:opacity-100")}>
                <CreditCard className="h-4 w-4" />
                {desktopSidebarOpen && <span className="transition-opacity duration-300">{t('pricing')}</span>}
             </Link>
           </nav>
         </div>
       </aside>

      <div className="flex flex-1 flex-col overflow-hidden">
        <header className="flex h-14 items-center justify-between px-4 mt-2">
          <div className="flex items-center gap-2 md:hidden">
            <Button variant="outline" size="icon" className="neu-button h-8 w-8 border-0 bg-transparent shrink-0" onClick={() => setSidebarOpen(!sidebarOpen)}>
              <Menu className="h-5 w-5" />
            </Button>
          </div>
          
          <div className="hidden md:flex gap-2 ml-auto items-center">
             <div className="neu-button h-10 w-10 flex items-center justify-center cursor-pointer" onClick={toggleTheme}>
                {isDark ? <Sun className="h-4 w-4" /> : <Moon className="h-4 w-4" />}
             </div>
             <NotificationBell />
             <div className="neu-button h-10 w-10 flex items-center justify-center cursor-pointer">
                <Search className="h-4 w-4" />
             </div>
               <div className={`h-8 px-4 flex items-center justify-center text-xs cursor-pointer rounded-full font-bold ${i18n.language === 'ru' ? 'neu-button bg-[var(--neu-accent)] text-white shadow-none' : 'opacity-60 hover:opacity-100'}`} onClick={() => i18n.changeLanguage('ru')}>RU</div>
               <div className={`h-8 px-4 flex items-center justify-center text-xs cursor-pointer rounded-full font-bold ${i18n.language === 'en' ? 'neu-button bg-[var(--neu-accent)] text-white shadow-none' : 'opacity-60 hover:opacity-100'}`} onClick={() => i18n.changeLanguage('en')}>EN</div>
             <div className="neu-button h-10 w-10 flex items-center justify-center cursor-pointer ml-3 text-red-500" onClick={logout}>
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
                className="relative flex w-60 flex-col bg-[var(--neu-bg)] m-0 rounded-r-xl h-full pt-4 border-r border-[var(--neu-text-muted)]/10 shadow-2xl"
              >
                 <nav className="flex-1 p-3 text-xs font-medium gap-1 overflow-y-auto flex flex-col">
                   {navItems.map((item) => (
                      <Link
                        key={item.href}
                        href={item.href}
                        onClick={() => setSidebarOpen(false)}
                        className={cn(
                          "flex items-center gap-3 rounded-lg px-3 py-1.5 transition-all",
                          pathname === item.href ? "neu-panel text-[var(--neu-accent)] border-l-2 border-[var(--neu-accent)]" : "hover:text-[var(--neu-accent)] opacity-80"
                        )}
                      >
                        <item.icon className="h-4 w-4" />
                        {item.label}
                      </Link>
                    ))}
                    <div className="my-1.5 h-px neu-panel-inset opacity-50" />
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
              <footer className="mt-10 pt-6 border-t border-[var(--neu-border)] text-[var(--neu-text-muted)] opacity-70 text-[11px] text-center md:text-left flex flex-col md:flex-row md:justify-between items-center md:items-start gap-4">
                <div>
                  <p className="font-bold mb-1">{t('it_asset_manager')} v1.0.0</p>
                  <p>© 2026 IT-Box</p>
                </div>
                <div className="flex flex-col gap-1.5">
                  <a href="mailto:info@premiumwebsite.ru" className="hover:text-[var(--neu-accent)] transition-colors font-medium">{i18n.language === 'en' ? 'Technical support' : 'Техническая поддержка'}</a>
                  <a href="https://t.me/usefulbots2026_bot" target="_blank" className="hover:text-[var(--neu-accent)] transition-colors font-medium">{i18n.language === 'en' ? 'Useful Telegram bots' : 'Полезные Telegram боты'}</a>
                </div>
                <div className="flex flex-col gap-1.5">
                  <a href="/privacy-consent" className="hover:text-[var(--neu-accent)] transition-colors font-medium">Согласие на обработку персональных данных</a>
                  <a href="#" className="hover:text-[var(--neu-accent)] transition-colors font-medium">{t('privacy_policy')}</a>
                </div>
              </footer>
            </motion.div>
          </AnimatePresence>
        </main>
      </div>
    </div>
  );
}
