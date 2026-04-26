'use client';

import { useState } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { X, Mail, Github, Loader2, CheckCircle2 } from 'lucide-react';
import { useAuth } from '@/lib/providers';
import { toast } from 'sonner';

interface AuthModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSuccess?: () => void;
  title?: string;
  description?: string;
}

export function AuthModal({ isOpen, onClose, onSuccess, title, description }: AuthModalProps) {
  const { login, loginWithGitHub, loginWithMagicLink } = useAuth();
  const [magicEmail, setMagicEmail] = useState('');
  const [magicSent, setMagicSent] = useState(false);
  const [loadingProvider, setLoadingProvider] = useState<string | null>(null);

  const handleGoogle = async () => {
    setLoadingProvider('google');
    try {
      await login();
      onSuccess?.();
      onClose();
    } catch (e: any) {
      toast.error(e?.message || 'Ошибка входа через Google');
    } finally {
      setLoadingProvider(null);
    }
  };

  const handleGitHub = async () => {
    setLoadingProvider('github');
    try {
      await loginWithGitHub();
      onSuccess?.();
      onClose();
    } catch (e: any) {
      toast.error(e?.message || 'Ошибка входа через GitHub');
    } finally {
      setLoadingProvider(null);
    }
  };

  const handleMagicLink = async () => {
    if (!magicEmail.trim()) {
      toast.error('Введите email');
      return;
    }
    setLoadingProvider('magic');
    try {
      await loginWithMagicLink(magicEmail.trim());
      setMagicSent(true);
    } catch (e: any) {
      toast.error(e?.message || 'Ошибка отправки ссылки');
    } finally {
      setLoadingProvider(null);
    }
  };

  return (
    <AnimatePresence>
      {isOpen && (
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          className="fixed inset-0 z-[200] flex items-center justify-center p-4 bg-black/50 backdrop-blur-sm"
          onClick={(e) => { if (e.target === e.currentTarget) onClose(); }}
        >
          <motion.div
            initial={{ opacity: 0, scale: 0.95, y: 20 }}
            animate={{ opacity: 1, scale: 1, y: 0 }}
            exit={{ opacity: 0, scale: 0.95, y: 20 }}
            transition={{ type: 'spring', damping: 25, stiffness: 300 }}
            className="neu-panel w-full max-w-md p-8 relative"
          >
            <button
              onClick={onClose}
              className="absolute top-4 right-4 neu-button w-8 h-8 flex items-center justify-center text-[var(--neu-text-muted)] hover:text-[var(--neu-text)] transition-colors"
              aria-label="Закрыть"
            >
              <X className="w-4 h-4" />
            </button>

            <div className="mb-6">
              <h2 className="text-xl font-bold mb-1">{title || 'Войдите в аккаунт'}</h2>
              {description && (
                <p className="text-sm text-[var(--neu-text-muted)]">{description}</p>
              )}
            </div>

            {magicSent ? (
              <div className="text-center py-6 flex flex-col items-center gap-4">
                <div className="neu-panel-inset p-4 rounded-full text-green-400">
                  <CheckCircle2 className="w-8 h-8" />
                </div>
                <div>
                  <p className="font-bold mb-1">Ссылка отправлена!</p>
                  <p className="text-sm text-[var(--neu-text-muted)]">
                    Проверьте <span className="text-[var(--neu-accent)]">{magicEmail}</span> — нажмите ссылку в письме и оплата запустится автоматически.
                  </p>
                </div>
                <button
                  onClick={() => { setMagicSent(false); setMagicEmail(''); }}
                  className="text-xs text-[var(--neu-text-muted)] hover:text-[var(--neu-text)] underline"
                >
                  Ввести другой email
                </button>
              </div>
            ) : (
              <div className="space-y-3">
                {/* Google */}
                <button
                  onClick={handleGoogle}
                  disabled={!!loadingProvider}
                  className="neu-button neu-button-accent w-full py-3 font-bold flex items-center justify-center gap-3 disabled:opacity-60"
                >
                  {loadingProvider === 'google' ? (
                    <Loader2 className="w-4 h-4 animate-spin" />
                  ) : (
                    <svg className="w-4 h-4" viewBox="0 0 24 24" fill="currentColor">
                      <path d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z" fill="#4285F4"/>
                      <path d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z" fill="#34A853"/>
                      <path d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z" fill="#FBBC05"/>
                      <path d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z" fill="#EA4335"/>
                    </svg>
                  )}
                  Войти через Google
                </button>

                {/* GitHub */}
                <button
                  onClick={handleGitHub}
                  disabled={!!loadingProvider}
                  className="neu-button w-full py-3 font-bold flex items-center justify-center gap-3 disabled:opacity-60 hover:text-[var(--neu-accent)]"
                >
                  {loadingProvider === 'github' ? (
                    <Loader2 className="w-4 h-4 animate-spin" />
                  ) : (
                    <Github className="w-4 h-4" />
                  )}
                  Войти через GitHub
                </button>

                {/* Divider */}
                <div className="flex items-center gap-3 py-1">
                  <div className="flex-1 h-px neu-panel-inset opacity-40" />
                  <span className="text-xs text-[var(--neu-text-muted)] uppercase tracking-widest">или</span>
                  <div className="flex-1 h-px neu-panel-inset opacity-40" />
                </div>

                {/* Magic Link */}
                <div className="space-y-2">
                  <div className="flex gap-2">
                    <input
                      type="email"
                      value={magicEmail}
                      onChange={(e) => setMagicEmail(e.target.value)}
                      onKeyDown={(e) => e.key === 'Enter' && handleMagicLink()}
                      placeholder="your@email.com"
                      className="flex-1 neu-panel-inset px-3 py-2.5 text-sm rounded-xl bg-transparent outline-none text-[var(--neu-text)] placeholder:text-[var(--neu-text-muted)]"
                    />
                    <button
                      onClick={handleMagicLink}
                      disabled={!!loadingProvider || !magicEmail.trim()}
                      className="neu-button px-4 py-2.5 flex items-center gap-2 font-bold text-sm disabled:opacity-60 hover:text-[var(--neu-accent)]"
                    >
                      {loadingProvider === 'magic' ? (
                        <Loader2 className="w-4 h-4 animate-spin" />
                      ) : (
                        <Mail className="w-4 h-4" />
                      )}
                      Ссылка
                    </button>
                  </div>
                  <p className="text-[11px] text-[var(--neu-text-muted)] px-1">
                    Без пароля — пришлём ссылку для входа на почту
                  </p>
                </div>
              </div>
            )}
          </motion.div>
        </motion.div>
      )}
    </AnimatePresence>
  );
}
