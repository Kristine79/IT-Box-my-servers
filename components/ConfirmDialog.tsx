'use client';

import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { AlertTriangle } from 'lucide-react';
import { useTranslation } from 'react-i18next';

interface ConfirmDialogProps {
  isOpen: boolean;
  onClose: () => void;
  onConfirm: () => void;
  title: string;
  description: string;
  confirmText?: string;
  cancelText?: string;
  destructive?: boolean;
}

export function ConfirmDialog({
  isOpen,
  onClose,
  onConfirm,
  title,
  description,
  confirmText,
  cancelText,
  destructive = false,
}: ConfirmDialogProps) {
  const { t } = useTranslation();

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="border-0 sm:rounded-3xl p-0 max-w-md overflow-hidden" style={{ background: 'var(--neu-bg)', boxShadow: 'var(--neu-shadow)', color: 'var(--neu-text)' }}>
        <div className="p-6">
          <DialogHeader className="mb-6">
            <DialogTitle className="text-xl font-bold flex items-center gap-3">
              <div className={`neu-panel-inset p-2 rounded-lg ${destructive ? 'text-red-500' : 'text-[var(--neu-accent)]'}`}>
                <AlertTriangle className="w-5 h-5" />
              </div>
              {title}
            </DialogTitle>
          </DialogHeader>

          <p className="text-[var(--neu-text-muted)] mb-6">{description}</p>

          <div className="flex gap-3 justify-end">
            <button
              onClick={onClose}
              className="neu-button px-5 py-2.5 font-semibold"
            >
              {cancelText || t('cancel', 'Cancel')}
            </button>
            <button
              onClick={() => {
                onConfirm();
                onClose();
              }}
              className={`neu-button px-5 py-2.5 font-semibold ${destructive ? 'text-red-500' : 'neu-button-accent'}`}
            >
              {confirmText || t('confirm', 'Confirm')}
            </button>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
}
