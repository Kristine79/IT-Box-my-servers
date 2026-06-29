'use client';

import { useState, useEffect } from 'react';
import Link from 'next/link';
import { Button } from '@/components/ui/button';
import { Moon, Sun, Menu, X } from 'lucide-react';
import { motion, AnimatePresence } from 'motion/react';
import { LOGO_BASE64 } from '@/lib/logoBase64';

export function LandingLayout({ children }: { children: React.ReactNode }) {
  const [isDark, setIsDark] = useState(false);
  const [scrolled, setScrolled] = useState(false);
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);

  useEffect(() => {
    const checkDark = () => {
      setIsDark(document.documentElement.classList.contains('dark'));
    };
    checkDark();
    const observer = new MutationObserver(checkDark);
    observer.observe(document.documentElement, { attributes: true, attributeFilter: ['class'] });
    return () => observer.disconnect();
  }, []);

  useEffect(() => {
    const onScroll = () => setScrolled(window.scrollY > 20);
    window.addEventListener('scroll', onScroll);
    return () => window.removeEventListener('scroll', onScroll);
  }, []);

  const toggleTheme = () => {
    const html = document.documentElement;
    if (html.classList.contains('dark')) {
      html.classList.remove('dark');
      setIsDark(false);
    } else {
      html.classList.add('dark');
      setIsDark(true);
    }
  };

  const navLinks = [
    { href: '#features', label: 'Возможности' },
    { href: '#pricing', label: 'Тарифы' },
    { href: '/app', label: 'Войти' },
  ];

  return (
    <div className="min-h-screen bg-[var(--background)] text-[var(--foreground)]">
      {/* Header */}
      <header
        className={`
          fixed top-0 left-0 right-0 z-50 transition-all duration-300
          ${scrolled
            ? 'bg-[var(--background)]/80 backdrop-blur-xl shadow-lg shadow-black/5'
            : 'bg-transparent'
          }
        `}
      >
        <div className="max-w-6xl mx-auto px-6 h-16 flex items-center justify-between">
<Link href="/" className="flex items-center gap-3">
            <div className="w-12 h-12 rounded-lg overflow-hidden">
              <img src="/logo.png" alt="StackBox Logo" className="w-full h-full object-contain" />
            </div>
            <span className="font-bold text-2xl tracking-tight">StackBox</span>
          </Link>

{/* Desktop Nav */}
          <nav className="hidden md:flex items-center gap-1">
            {navLinks.slice(0, 2).map((link) => (
              <a
                key={link.href}
                href={link.href}
                className="px-4 py-2 rounded-xl text-sm font-medium uppercase tracking-wide text-[var(--muted-foreground)] hover:text-[var(--foreground)] hover:bg-[var(--muted)]/50 transition-colors"
              >
                {link.label}
              </a>
            ))}
          </nav>

<div className="hidden md:flex items-center gap-3">
            <button
              onClick={toggleTheme}
              className="w-10 h-10 rounded-xl flex items-center justify-center bg-slate-100 dark:bg-slate-800 text-slate-600 dark:text-slate-400 hover:bg-slate-200 dark:hover:bg-slate-700"
              aria-label="Toggle theme"
            >
              {isDark ? <Sun size={18} /> : <Moon size={18} />}
            </button>
            <Link href="/app">
              <Button className="bg-blue-600 hover:bg-blue-700 text-white rounded-xl px-5">
                Начать бесплатно
              </Button>
            </Link>
          </div>

          {/* Mobile Menu Button */}
          <button
            className="md:hidden w-10 h-10 rounded-xl flex items-center justify-center bg-slate-100 dark:bg-slate-800 text-slate-600 dark:text-slate-400 hover:bg-slate-200 dark:hover:bg-slate-700 transition-colors"
            onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
          >
            {mobileMenuOpen ? <X size={20} /> : <Menu size={20} />}
          </button>
        </div>

{/* Mobile Menu */}
        <AnimatePresence>
          {mobileMenuOpen && (
            <motion.div
              initial={{ opacity: 0, height: 0 }}
              animate={{ opacity: 1, height: 'auto' }}
              exit={{ opacity: 0, height: 0 }}
              className="md:hidden border-t border-[var(--border)] bg-[var(--background)]/95 backdrop-blur-xl overflow-hidden"
            >
              <div className="px-6 py-4 space-y-2">
                {navLinks.map((link) => (
                  <a
                    key={link.href}
                    href={link.href}
                    className="block px-4 py-3 rounded-xl text-sm font-medium uppercase tracking-wide text-[var(--muted-foreground)] hover:text-[var(--foreground)] hover:bg-[var(--muted)]/50 transition-colors"
                    onClick={() => setMobileMenuOpen(false)}
                  >
                    {link.label}
                  </a>
                ))}
                <div className="pt-2 border-t border-[var(--border)]">
                  <button
                    onClick={toggleTheme}
                    className="flex items-center gap-3 px-4 py-3 rounded-xl text-sm font-medium w-full hover:bg-[var(--muted)]/50"
                  >
                    {isDark ? <Sun size={18} /> : <Moon size={18} />}
                    {isDark ? 'Светлая тема' : 'Тёмная тема'}
                  </button>
                </div>
              </div>
            </motion.div>
          )}
        </AnimatePresence>
      </header>

      {/* Main Content */}
      <main className="pt-16">{children}</main>

      {/* Footer */}
      <footer className="border-t border-[var(--border)] py-12 px-6">
        <div className="max-w-6xl mx-auto">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-8 mb-12">
            <div>
<Link href="/" className="flex items-center gap-3 mb-4">
                <div className="w-12 h-12 rounded-lg overflow-hidden">
                  <img src="/logo.png" alt="StackBox Logo" className="w-full h-full object-contain" />
                </div>
                <span className="font-bold text-xl tracking-tight">StackBox</span>
              </Link>
              <p className="text-sm text-[var(--muted-foreground)]">
                Умное управление серверами с AI и максимальной безопасностью.
              </p>
            </div>

            <div>
              <h4 className="font-medium text-sm mb-4">Правовая информация</h4>
              <ul className="space-y-2">
                <li><Link href="/privacy" className="text-sm text-[var(--muted-foreground)] hover:text-[var(--foreground)] transition-colors">Политика конфиденциальности</Link></li>
                <li><Link href="/terms" className="text-sm text-[var(--muted-foreground)] hover:text-[var(--foreground)] transition-colors">Условия использования</Link></li>
                <li><Link href="/cookies" className="text-sm text-[var(--muted-foreground)] hover:text-[var(--foreground)] transition-colors">Политика cookies</Link></li>
              </ul>
            </div>
          </div>

          <div className="pt-8 border-t border-[var(--border)] flex flex-col md:flex-row items-center justify-between gap-4">
            <p className="text-sm text-[var(--muted-foreground)]">
              © 2026 StackBox. Все права защищены.
            </p>
            <div className="flex items-center gap-4">
              <span className="text-xs text-[var(--muted-foreground)]">
                Сделано с заботой о безопасности
              </span>
            </div>
          </div>
        </div>
      </footer>
    </div>
  );
}
