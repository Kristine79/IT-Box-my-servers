'use client';

import Link from 'next/link';
import { cn } from '@/lib/utils';
import { useTranslation } from 'react-i18next';

export interface NavItem {
  href: string;
  icon: React.ComponentType<{ className?: string }>;
  label: string;
  active?: boolean;
  onClick?: () => void;
}

interface SidebarNavProps {
  items: NavItem[];
  variant?: 'desktop' | 'mobile';
  collapsed?: boolean;
  className?: string;
}

export function SidebarNav({ items, variant = 'desktop', collapsed = false, className }: SidebarNavProps) {
  const { t } = useTranslation();
  const isMobile = variant === 'mobile';

  return (
    <nav
      className={cn(
        'flex flex-col gap-0.5 font-normal text-[13px]',
        isMobile ? 'p-4 gap-0.5 items-start w-full' : collapsed ? 'items-center' : 'items-stretch',
        className
      )}
      aria-label={isMobile ? 'Mobile navigation' : 'Desktop navigation'}
    >
      {items.map((item) => (
        <Link
          key={item.href}
          href={item.href}
          onClick={item.onClick}
          title={collapsed && !isMobile ? item.label : undefined}
          className={cn(
            'flex items-center transition-all duration-200 overflow-hidden',
            isMobile
              ? 'gap-3 rounded-xl px-3 py-1.5 w-full'
              : 'gap-2 rounded-md py-1.5',
            !isMobile && (collapsed ? 'px-0 justify-center w-10' : 'px-3'),
            item.active
              ? 'neu-panel text-[var(--neu-accent)] ring-2 ring-[var(--neu-accent)]/40 ring-inset'
              : 'hover:text-[var(--neu-accent)] text-[var(--neu-text)] opacity-80 hover:opacity-100'
          )}
          aria-current={item.active ? 'page' : undefined}
        >
          <item.icon className="h-4 w-4 shrink-0" aria-hidden="true" />
          {(isMobile || !collapsed) && (
            <span className="transition-opacity duration-300 whitespace-nowrap overflow-hidden text-ellipsis">
              {item.label}
            </span>
          )}
        </Link>
      ))}
    </nav>
  );
}

export function SidebarDivider({ collapsed }: { collapsed?: boolean }) {
  return (
    <div
      className={cn(
        'my-1.5 h-px neu-panel-inset opacity-50',
        collapsed ? 'w-10' : 'w-full'
      )}
      role="separator"
      aria-orientation="horizontal"
    />
  );
}
