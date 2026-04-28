'use client';

import { useTranslation } from 'react-i18next';
import { useAuth } from '@/lib/providers';
import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { cn } from '@/lib/utils';
import {
  LayoutDashboard,
  FolderKanban,
  Server,
  Network,
  KeyRound,
  HelpCircle,
  CreditCard,
  Settings,
  User,
  LucideIcon,
} from 'lucide-react';

interface NavItemConfig {
  href: string;
  icon: LucideIcon;
  labelKey: string;
  requiresAuth?: boolean;
  adminOnly?: boolean;
}

interface NavItemsProps {
  mode: 'desktop' | 'mobile';
  isOpen?: boolean;
  onNavigate?: () => void;
  showLabels?: boolean;
}

export function NavItems({ mode, isOpen = true, onNavigate, showLabels = true }: NavItemsProps) {
  const { t } = useTranslation();
  const { user, isAdmin } = useAuth();
  const pathname = usePathname();

  const mainNavItems: NavItemConfig[] = [
    { href: '/', icon: LayoutDashboard, labelKey: 'dashboard' },
    { href: '/projects', icon: FolderKanban, labelKey: 'projects' },
    { href: '/servers', icon: Server, labelKey: 'servers' },
    { href: '/services', icon: Network, labelKey: 'services' },
    { href: '/credentials', icon: KeyRound, labelKey: 'credentials' },
  ];

  const secondaryNavItems: NavItemConfig[] = [
    { href: '/about', icon: HelpCircle, labelKey: 'about' },
    { href: '/faq', icon: HelpCircle, labelKey: 'faq' },
    { href: '/pricing', icon: CreditCard, labelKey: 'pricing' },
  ];

  const userNavItems: NavItemConfig[] = [
    { href: '/admin', icon: Settings, labelKey: 'admin', adminOnly: true },
    { href: '/profile', icon: User, labelKey: 'profile', requiresAuth: true },
  ];

  const isActive = (href: string) => pathname === href;

  const renderNavItem = (item: NavItemConfig, index: number, isSecondary = false) => {
    if (item.adminOnly && (!user || !isAdmin)) return null;
    if (item.requiresAuth && (!user || user.isAnonymous)) return null;

    const Icon = item.icon;
    const label = t(item.labelKey);

    if (mode === 'desktop') {
      return (
        <Link
          key={item.href}
          href={item.href}
          title={!isOpen ? label : undefined}
          className={cn(
            "flex items-center gap-2 rounded-md py-1.5 transition-all duration-200 overflow-hidden",
            isOpen ? "px-3" : "px-0 justify-center w-10",
            isActive(item.href)
              ? "neu-panel text-[var(--neu-accent)] ring-2 ring-[var(--neu-accent)]/40 ring-inset"
              : isSecondary
                ? "text-[var(--neu-text)] opacity-60 hover:opacity-100"
                : "hover:text-[var(--neu-accent)] text-[var(--neu-text)] opacity-80 hover:opacity-100"
          )}
        >
          <Icon className="h-4 w-4 shrink-0" />
          {isOpen && <span className="transition-opacity duration-300 whitespace-nowrap overflow-hidden text-ellipsis">{label}</span>}
        </Link>
      );
    }

    // Mobile mode
    return (
      <Link
        key={item.href}
        href={item.href}
        onClick={onNavigate}
        className={cn(
          "flex items-center gap-3 rounded-xl px-3 py-1.5 transition-all w-full",
          isActive(item.href)
            ? "neu-panel text-[var(--neu-accent)] ring-2 ring-[var(--neu-accent)]/40 ring-inset"
            : isSecondary
              ? "text-[var(--neu-text)] opacity-60 hover:opacity-100"
              : "hover:text-[var(--neu-accent)] opacity-80"
        )}
      >
        <Icon className="h-4 w-4" />
        {showLabels && label}
      </Link>
    );
  };

  const renderDivider = () => {
    if (mode === 'desktop') {
      return (
        <div className={cn("my-1.5 h-px neu-panel-inset opacity-50", isOpen ? "w-full" : "w-10")} />
      );
    }
    return <div className="my-1.5 h-px neu-panel-inset opacity-50 w-full" />;
  };

  return (
    <>
      {mainNavItems.map((item, idx) => renderNavItem(item, idx))}
      {renderDivider()}
      {secondaryNavItems.map((item, idx) => renderNavItem(item, idx, true))}
      {renderDivider()}
      {userNavItems.map((item, idx) => renderNavItem(item, idx, true))}
    </>
  );
}
