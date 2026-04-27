'use client';

import { useTranslation } from 'react-i18next';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { Crown, Zap, X } from 'lucide-react';
import { useRouter } from 'next/navigation';
import type { PlanId } from '@/lib/planLimits';

interface UpgradeModalProps {
  open: boolean;
  onClose: () => void;
  title: string;
  description: string;
  targetPlan: PlanId;
  buttonText?: string;
}

export function UpgradeModal({ open, onClose, title, description, targetPlan, buttonText }: UpgradeModalProps) {
  const { t } = useTranslation();
  const router = useRouter();

  const isPremium = targetPlan === 'premium';
  const Icon = isPremium ? Crown : Zap;
  const iconColor = isPremium ? 'text-amber-500' : 'text-purple-500';
  const defaultButton = isPremium
    ? t('upgrade_to_premium', 'Перейти на Premium')
    : t('upgrade_to_standard', 'Перейти на Standard');

  return (
    <Dialog open={open} onOpenChange={(v) => !v && onClose()}>
      <DialogContent
        className="border-0 sm:rounded-3xl p-8 max-w-sm text-center"
        style={{ background: 'var(--neu-bg)', boxShadow: 'var(--neu-shadow)', color: 'var(--neu-text)' }}
      >
        <DialogHeader>
          <DialogTitle className="text-xl font-bold flex flex-col items-center gap-4">
            <div className={`neu-panel-inset p-4 rounded-2xl ${iconColor}`}>
              <Icon className="w-10 h-10" />
            </div>
            {title}
          </DialogTitle>
        </DialogHeader>

        <p className="text-[var(--neu-text-muted)] text-sm leading-relaxed py-4">
          {description}
        </p>

        <div className="flex flex-col gap-3 w-full">
          <button
            onClick={() => { onClose(); router.push('/pricing'); }}
            className="neu-button neu-button-accent w-full py-3 font-bold text-sm"
          >
            {buttonText || defaultButton}
          </button>
          <button
            onClick={onClose}
            className="neu-button w-full py-2.5 text-sm opacity-70 hover:opacity-100"
          >
            {t('stay_on_free', 'Остаться на текущем тарифе')}
          </button>
        </div>
      </DialogContent>
    </Dialog>
  );
}
