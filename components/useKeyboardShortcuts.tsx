'use client';

import { useEffect, useCallback } from 'react';

interface ShortcutsConfig {
  onSearch?: () => void;
  onEscape?: () => void;
  onNew?: () => void;
  onSave?: () => void;
}

export function useKeyboardShortcuts(config: ShortcutsConfig) {
  const handleKeyDown = useCallback((e: KeyboardEvent) => {
    // Ctrl/Cmd + K - Search
    if ((e.ctrlKey || e.metaKey) && e.key === 'k') {
      e.preventDefault();
      config.onSearch?.();
    }
    
    // Escape - Close/Cancel
    if (e.key === 'Escape') {
      config.onEscape?.();
    }
    
    // Ctrl/Cmd + Enter - Save/Submit
    if ((e.ctrlKey || e.metaKey) && e.key === 'Enter') {
      config.onSave?.();
    }
    
    // Ctrl/Cmd + Shift + N - New item
    if ((e.ctrlKey || e.metaKey) && e.shiftKey && e.key === 'N') {
      e.preventDefault();
      config.onNew?.();
    }
  }, [config]);

  useEffect(() => {
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [handleKeyDown]);
}

// Hook specifically for focusable search
export function useSearchFocus() {
  const focusSearch = useCallback(() => {
    const searchInput = document.querySelector('[data-search-input]') as HTMLInputElement;
    if (searchInput) {
      searchInput.focus();
    }
  }, []);

  return { focusSearch };
}
