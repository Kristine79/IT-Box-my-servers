'use client';

import { toast } from 'sonner';
import { useCallback } from 'react';

interface UndoableDeleteOptions {
  itemName?: string;
  onDelete: () => Promise<void>;
  onUndo?: () => Promise<void>;
  duration?: number;
}

export function useUndoableDelete() {
  const showUndoToast = useCallback((options: UndoableDeleteOptions) => {
    const { itemName, onDelete, onUndo, duration = 5000 } = options;

    let isUndone = false;

    const toastId = toast(
      <div className="flex items-center justify-between gap-4 w-full">
        <div className="flex-1">
          <p className="font-medium text-sm">
            «{itemName || 'Item'}» удалено
          </p>
          <p className="text-xs opacity-70 mt-0.5">
            Нажмите Отмена, чтобы восстановить
          </p>
        </div>
        <button
          onClick={async () => {
            isUndone = true;
            toast.dismiss(toastId);
            if (onUndo) {
              await onUndo();
            }
            toast.success('Восстановлено');
          }}
          className="neu-button px-3 py-1.5 text-xs font-semibold shrink-0"
        >
          Отмена
        </button>
      </div>,
      { duration }
    );

    // Execute delete after delay if not undone
    setTimeout(async () => {
      if (!isUndone) {
        await onDelete();
      }
    }, duration);
  }, []);

  return { showUndoToast };
}
