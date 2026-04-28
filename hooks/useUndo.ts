'use client';

import { useState, useCallback, useRef } from 'react';
import { toast } from 'sonner';
import { useTranslation } from 'react-i18next';

interface UndoState<T> {
  data: T;
  action: 'delete' | 'update' | 'create';
  timestamp: number;
}

export function useUndo<T>(options?: {
  onUndo?: (state: UndoState<T>) => void;
  duration?: number;
}) {
  const { t } = useTranslation();
  const [undoStack, setUndoStack] = useState<UndoState<T>[]>([]);
  const timeoutRef = useRef<NodeJS.Timeout | null>(null);

  const pushUndo = useCallback((data: T, action: 'delete' | 'update' | 'create') => {
    const state: UndoState<T> = {
      data,
      action,
      timestamp: Date.now(),
    };

    setUndoStack((prev) => [...prev, state]);

    // Auto-clear after duration
    if (timeoutRef.current) {
      clearTimeout(timeoutRef.current);
    }

    const duration = options?.duration || 10000; // 10 seconds default

    timeoutRef.current = setTimeout(() => {
      setUndoStack((prev) => prev.filter((s) => s.timestamp !== state.timestamp));
    }, duration);

    // Show toast with undo button
    toast.success(
      t(`undo_${action}_message`, `${action} undone`),
      {
        action: {
          label: t('undo', 'Undo'),
          onClick: () => {
            if (options?.onUndo) {
              options.onUndo(state);
            }
            setUndoStack((prev) => prev.filter((s) => s.timestamp !== state.timestamp));
          },
        },
        duration: duration,
      }
    );

    return state;
  }, [options, t]);

  const clearUndo = useCallback(() => {
    setUndoStack([]);
    if (timeoutRef.current) {
      clearTimeout(timeoutRef.current);
    }
  }, []);

  const canUndo = undoStack.length > 0;

  return {
    pushUndo,
    clearUndo,
    canUndo,
    undoStack,
  };
}
