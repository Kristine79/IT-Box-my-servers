'use client';

import { useAuth } from '@/lib/providers';
import { CreditCard, User, CalendarDays, CheckCircle2, Clock, AlertCircle, LogOut, Shield } from 'lucide-react';
import Link from 'next/link';
import { motion } from 'motion/react';

function StatusBadge({ active, label }: { active: boolean; label: string }) {
  return (
    <span className={`inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-bold ${active ? 'bg-green-500/15 text-green-400' : 'bg-red-500/15 text-red-400'}`}>
      {active ? <CheckCircle2 className="w-3.5 h-3.5" /> : <AlertCircle className="w-3.5 h-3.5" />}
      {label}
    </span>
  );
}

function formatDate(date: Date | null): string {
  if (!date) return '-';
  return date.toLocaleDateString('ru-RU', { day: 'numeric', month: 'long', year: 'numeric' });
}

export default function ProfilePage() {
  const { user, trialEndsAt, subscriptionEndsAt, logout } = useAuth();

  if (!user || user.isAnonymous) {
    return (
      <div className="max-w-lg mx-auto mt-20 neu-panel p-10 text-center">
        <User className="w-12 h-12 mx-auto mb-4 opacity-30" />
        <h2 className="text-xl font-bold mb-2">Вы не авторизованы</h2>
        <p className="text-[var(--neu-text-muted)] mb-6">Войдите в аккаунт чтобы видеть свой профиль.</p>
        <Link href="/pricing" className="neu-button neu-button-accent px-6 py-3 font-bold inline-block">
          Перейти к тарифам
        </Link>
      </div>
    );
  }

  const now = new Date();
  const trialActive = trialEndsAt ? now <= trialEndsAt : false;
  const subActive = subscriptionEndsAt ? now <= subscriptionEndsAt : false;
  const hasAccess = trialActive || subActive;

  return (
    <div className="max-w-2xl mx-auto space-y-6 pb-10">
      <motion.div initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} className="neu-panel p-6">
        <div className="flex items-center gap-4 mb-6">
          <div className="neu-panel-inset w-14 h-14 rounded-full flex items-center justify-center text-[var(--neu-accent)] shrink-0 overflow-hidden">
            {user.photoURL ? (
              <img src={user.photoURL} alt="avatar" className="w-full h-full object-cover" />
            ) : (
              <User className="w-7 h-7" />
            )}
          </div>
          <div>
            <h1 className="text-xl font-bold">{user.displayName || 'Пользователь'}</h1>
            <p className="text-sm text-[var(--neu-text-muted)]">{user.email}</p>
          </div>
        </div>

        <div className="space-y-0">
          <div className="flex items-start justify-between py-4 gap-4">
            <div className="flex items-center gap-2 text-sm text-[var(--neu-text-muted)] pt-0.5">
              <Shield className="w-4 h-4 shrink-0" />
              <span>Статус доступа</span>
            </div>
            <div className="text-right shrink-0">
              <StatusBadge active={hasAccess} label={hasAccess ? 'Активен' : 'Нет доступа'} />
            </div>
          </div>
          <div className="my-1.5 h-px neu-panel-inset opacity-50 w-full" />
          <div className="flex items-start justify-between py-4 gap-4">
            <div className="flex items-center gap-2 text-sm text-[var(--neu-text-muted)] pt-0.5">
              <Clock className="w-4 h-4 shrink-0" />
              <span>Пробный период</span>
            </div>
            <div className="text-right shrink-0">
              <StatusBadge active={trialActive} label={trialActive ? 'Активен' : 'Истёк'} />
              {trialEndsAt && (
                <p className="text-xs text-[var(--neu-text-muted)] mt-1">
                  {trialActive ? 'до ' : 'закончился '}{formatDate(trialEndsAt)}
                </p>
              )}
            </div>
          </div>
          <div className="my-1.5 h-px neu-panel-inset opacity-50 w-full" />
          <div className="flex items-start justify-between py-4 gap-4">
            <div className="flex items-center gap-2 text-sm text-[var(--neu-text-muted)] pt-0.5">
              <CalendarDays className="w-4 h-4 shrink-0" />
              <span>Подписка</span>
            </div>
            <div className="text-right shrink-0">
              {subscriptionEndsAt ? (
                <>
                  <StatusBadge active={subActive} label={subActive ? 'Активна' : 'Истекла'} />
                  <p className="text-xs text-[var(--neu-text-muted)] mt-1">
                    {subActive ? 'до ' : 'закончилась '}{formatDate(subscriptionEndsAt)}
                  </p>
                </>
              ) : (
                <span className="text-xs text-[var(--neu-text-muted)] inline-block mt-1.5">Не оформлена</span>
              )}
            </div>
          </div>
        </div>
      </motion.div>

      {!subActive && (
        <motion.div initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.1 }} className="neu-panel p-6">
          <div className="flex items-start gap-4">
            <CreditCard className="w-5 h-5 text-[var(--neu-accent)] shrink-0 mt-0.5" />
            <div className="flex-1">
              <h2 className="font-bold mb-1">
                {subscriptionEndsAt ? 'Подписка истекла' : 'Оформите подписку'}
              </h2>
              <p className="text-sm text-[var(--neu-text-muted)] mb-4">
                {subscriptionEndsAt
                  ? 'Продлите подписку чтобы сохранить доступ ко всем функциям.'
                  : 'Получите полный доступ ко всем возможностям StackBox.'}
              </p>
              <Link href="/pricing" className="neu-button neu-button-accent px-5 py-2.5 font-bold text-sm inline-block">
                {subscriptionEndsAt ? 'Продлить подписку' : 'Выбрать тариф'}
              </Link>
            </div>
          </div>
        </motion.div>
      )}

      <motion.div initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.2 }} className="neu-panel p-6">
        <button
          onClick={logout}
          className="neu-button w-full py-3 font-bold flex items-center justify-center gap-2 text-red-400 hover:text-red-500 transition-colors"
        >
          <LogOut className="w-4 h-4" />
          Выйти из аккаунта
        </button>
      </motion.div>
    </div>
  );
}
