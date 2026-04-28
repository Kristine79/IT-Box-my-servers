'use client';

import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription } from "@/components/ui/dialog";
import { useTranslation } from "react-i18next";

interface DeleteConfirmDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  onConfirm: () => void;
  title?: string;
  description?: string;
  itemName?: string;
}

export function DeleteConfirmDialog({
  open,
  onOpenChange,
  onConfirm,
  title,
  description,
  itemName,
}: DeleteConfirmDialogProps) {
  const { t } = useTranslation();

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent 
        className="border-0 sm:rounded-3xl p-6 max-w-md" 
        style={{ background: 'var(--neu-bg)', boxShadow: 'var(--neu-shadow)', color: 'var(--neu-text)' }}
      >
        <DialogHeader>
          <DialogTitle className="text-xl font-bold">
            {title || t('confirm_delete_title', 'Подтвердите удаление')}
          </DialogTitle>
          <DialogDescription className="text-[var(--neu-text-muted)] mt-2">
            {description || (itemName 
              ? t('confirm_delete_desc_named', 'Вы уверены, что хотите удалить "{{name}}"? Это действие нельзя отменить.', { name: itemName })
              : t('confirm_delete_desc', 'Вы уверены, что хотите удалить этот элемент? Это действие нельзя отменить.'))}
          </DialogDescription>
        </DialogHeader>
        <div className="mt-6 flex justify-end gap-3">
          <button 
            onClick={() => onOpenChange(false)}
            className="neu-button px-6 py-2.5 font-semibold"
          >
            {t('cancel', 'Отмена')}
          </button>
          <button 
            onClick={() => { onConfirm(); onOpenChange(false); }}
            className="neu-button px-6 py-2.5 font-semibold bg-red-500 text-white shadow-red-500/20 hover:shadow-red-500/40"
          >
            {t('delete', 'Удалить')}
          </button>
        </div>
      </DialogContent>
    </Dialog>
  );
}
