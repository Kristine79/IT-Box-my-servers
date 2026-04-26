'use client';

import { useState, useEffect, useCallback, useRef } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { Search, X, FolderKanban, Server, Network, KeyRound, FileText, HelpCircle, CreditCard, Settings, LayoutDashboard } from 'lucide-react';
import { useRouter } from 'next/navigation';
import { cn } from '@/lib/utils';

interface SearchItem {
  id: string;
  title: string;
  subtitle?: string;
  icon: React.ReactNode;
  href: string;
  type: 'nav' | 'project' | 'server' | 'service' | 'credential';
}

const navItems: SearchItem[] = [
  { id: 'dash', title: 'Dashboard', icon: <LayoutDashboard className="w-4 h-4" />, href: '/', type: 'nav' },
  { id: 'proj', title: 'Projects', icon: <FolderKanban className="w-4 h-4" />, href: '/projects', type: 'nav' },
  { id: 'srv', title: 'Servers', icon: <Server className="w-4 h-4" />, href: '/servers', type: 'nav' },
  { id: 'svc', title: 'Services', icon: <Network className="w-4 h-4" />, href: '/services', type: 'nav' },
  { id: 'cred', title: 'Credentials', icon: <KeyRound className="w-4 h-4" />, href: '/credentials', type: 'nav' },
  { id: 'about', title: 'About', icon: <FileText className="w-4 h-4" />, href: '/about', type: 'nav' },
  { id: 'faq', title: 'FAQ', icon: <HelpCircle className="w-4 h-4" />, href: '/faq', type: 'nav' },
  { id: 'pricing', title: 'Pricing', icon: <CreditCard className="w-4 h-4" />, href: '/pricing', type: 'nav' },
  { id: 'admin', title: 'Admin', icon: <Settings className="w-4 h-4" />, href: '/admin', type: 'nav' },
];

export function CommandPalette() {
  const [isOpen, setIsOpen] = useState(false);
  const [query, setQuery] = useState('');
  const [selectedIndex, setSelectedIndex] = useState(0);
  const inputRef = useRef<HTMLInputElement>(null);
  const router = useRouter();

  const filteredItems = query.trim() === '' 
    ? navItems 
    : navItems.filter(item => 
        item.title.toLowerCase().includes(query.toLowerCase())
      );

  useEffect(() => {
    setSelectedIndex(0);
  }, [query]);

  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if ((e.metaKey || e.ctrlKey) && e.key === 'k') {
        e.preventDefault();
        setIsOpen(prev => !prev);
      }
      if (e.key === 'Escape') {
        setIsOpen(false);
      }
    };
    document.addEventListener('keydown', handleKeyDown);
    return () => document.removeEventListener('keydown', handleKeyDown);
  }, []);

  useEffect(() => {
    if (isOpen) {
      inputRef.current?.focus();
    }
  }, [isOpen]);

  const handleSelect = useCallback((item: SearchItem) => {
    router.push(item.href);
    setIsOpen(false);
    setQuery('');
  }, [router]);

  const handleKeyDown = useCallback((e: React.KeyboardEvent) => {
    if (e.key === 'ArrowDown') {
      e.preventDefault();
      setSelectedIndex(prev => (prev + 1) % filteredItems.length);
    } else if (e.key === 'ArrowUp') {
      e.preventDefault();
      setSelectedIndex(prev => (prev - 1 + filteredItems.length) % filteredItems.length);
    } else if (e.key === 'Enter') {
      e.preventDefault();
      if (filteredItems[selectedIndex]) {
        handleSelect(filteredItems[selectedIndex]);
      }
    }
  }, [filteredItems, selectedIndex, handleSelect]);

  return (
    <>
      <button
        onClick={() => setIsOpen(true)}
        className="neu-button h-9 w-9 md:h-10 md:w-10 flex items-center justify-center cursor-pointer shrink-0"
        aria-label="Open search (Ctrl+K)"
        title="Search (Ctrl+K)"
      >
        <Search className="h-4 w-4" />
      </button>

      <AnimatePresence>
        {isOpen && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            transition={{ duration: 0.15 }}
            className="fixed inset-0 z-[200] bg-black/50 backdrop-blur-sm flex items-start justify-center pt-[20vh]"
            onClick={() => setIsOpen(false)}
          >
            <motion.div
              initial={{ opacity: 0, y: -20, scale: 0.95 }}
              animate={{ opacity: 1, y: 0, scale: 1 }}
              exit={{ opacity: 0, y: -20, scale: 0.95 }}
              transition={{ duration: 0.2 }}
              className="w-full max-w-lg mx-4 neu-panel rounded-2xl overflow-hidden shadow-2xl"
              onClick={e => e.stopPropagation()}
              onKeyDown={handleKeyDown}
            >
              <div className="flex items-center gap-3 px-4 py-3 border-b border-[var(--neu-border)]/20">
                <Search className="h-5 w-5 text-[var(--neu-text-muted)] shrink-0" />
                <input
                  ref={inputRef}
                  type="text"
                  value={query}
                  onChange={e => setQuery(e.target.value)}
                  placeholder="Search pages..."
                  className="flex-1 bg-transparent border-none outline-none text-[var(--neu-text)] placeholder:text-[var(--neu-text-muted)] text-base"
                  aria-label="Search input"
                />
                <button
                  onClick={() => setIsOpen(false)}
                  className="p-1 rounded-md hover:bg-[var(--neu-accent)]/10 text-[var(--neu-text-muted)] transition-colors"
                  aria-label="Close search"
                >
                  <X className="h-4 w-4" />
                </button>
              </div>

              <div className="max-h-[300px] overflow-y-auto py-2">
                {filteredItems.length === 0 ? (
                  <div className="px-4 py-8 text-center text-[var(--neu-text-muted)]">
                    <Search className="h-8 w-8 mx-auto mb-2 opacity-50" />
                    <p className="text-sm">No results found</p>
                  </div>
                ) : (
                  filteredItems.map((item, index) => (
                    <button
                      key={item.id}
                      onClick={() => handleSelect(item)}
                      className={cn(
                        "w-full flex items-center gap-3 px-4 py-2.5 text-left transition-colors",
                        index === selectedIndex 
                          ? "bg-[var(--neu-accent)]/10 text-[var(--neu-accent)]" 
                          : "text-[var(--neu-text)] hover:bg-[var(--neu-accent)]/5"
                      )}
                      aria-selected={index === selectedIndex}
                      role="option"
                    >
                      <span className={cn(
                        "shrink-0",
                        index === selectedIndex ? "text-[var(--neu-accent)]" : "text-[var(--neu-text-muted)]"
                      )}>
                        {item.icon}
                      </span>
                      <span className="font-medium text-sm">{item.title}</span>
                      <span className="ml-auto text-xs text-[var(--neu-text-muted)] uppercase tracking-wider opacity-60">
                        {item.type}
                      </span>
                    </button>
                  ))
                )}
              </div>

              <div className="px-4 py-2 border-t border-[var(--neu-border)]/20 text-xs text-[var(--neu-text-muted)] flex items-center gap-4">
                <span className="flex items-center gap-1">
                  <kbd className="px-1.5 py-0.5 rounded bg-[var(--neu-bg)] text-[10px] font-mono border border-[var(--neu-border)]/30">↑↓</kbd>
                  <span>Navigate</span>
                </span>
                <span className="flex items-center gap-1">
                  <kbd className="px-1.5 py-0.5 rounded bg-[var(--neu-bg)] text-[10px] font-mono border border-[var(--neu-border)]/30">Enter</kbd>
                  <span>Select</span>
                </span>
                <span className="flex items-center gap-1">
                  <kbd className="px-1.5 py-0.5 rounded bg-[var(--neu-bg)] text-[10px] font-mono border border-[var(--neu-border)]/30">Esc</kbd>
                  <span>Close</span>
                </span>
              </div>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>
    </>
  );
}
