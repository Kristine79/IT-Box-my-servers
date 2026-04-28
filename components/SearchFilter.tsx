'use client';

import { useState, useMemo } from 'react';
import { useTranslation } from 'react-i18next';
import { Search, X } from 'lucide-react';
import { cn } from '@/lib/utils';

interface SearchFilterProps {
  value: string;
  onChange: (value: string) => void;
  placeholder?: string;
  className?: string;
}

export function SearchFilter({ value, onChange, placeholder, className }: SearchFilterProps) {
  const { t } = useTranslation();

  return (
    <div className={cn("relative", className)}>
      <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-[var(--neu-text-muted)]" />
      <input
        type="text"
        value={value}
        onChange={(e) => onChange(e.target.value)}
        placeholder={placeholder || t('search_placeholder', 'Поиск...')}
        className="neu-input w-full pl-10 pr-9 py-2.5 text-sm"
      />
      {value && (
        <button
          onClick={() => onChange('')}
          className="absolute right-3 top-1/2 -translate-y-1/2 text-[var(--neu-text-muted)] hover:text-[var(--neu-accent)]"
        >
          <X className="w-4 h-4" />
        </button>
      )}
    </div>
  );
}

// Hook for filtering items
export function useFilteredItems<T>(
  items: T[],
  searchQuery: string,
  getSearchableText: (item: T) => string
) {
  return useMemo(() => {
    if (!searchQuery.trim()) return items;
    const query = searchQuery.toLowerCase();
    return items.filter(item =>
      getSearchableText(item).toLowerCase().includes(query)
    );
  }, [items, searchQuery, getSearchableText]);
}

// Hook for pagination
export function usePagination<T>(items: T[], limit: number = 20) {
  const [page, setPage] = useState(1);
  
  const paginatedItems = useMemo(() => {
    return items.slice(0, page * limit);
  }, [items, page, limit]);

  const hasMore = paginatedItems.length < items.length;

  const loadMore = () => {
    if (hasMore) setPage(p => p + 1);
  };

  const reset = () => setPage(1);

  return { paginatedItems, hasMore, loadMore, reset, page };
}
