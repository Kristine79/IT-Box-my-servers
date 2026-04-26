'use client';

import { useState } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { X, Mail, Github, Loader2, Eye, EyeOff, KeyRound } from 'lucide-react';
import { useAuth } from '@/lib/providers';
import { toast } from 'sonner';

const firebaseErrorRu: Record<string, string> = {
  'auth/account-exists-with-different-credential':
    'Этот email уже привязан к другому способу входа. Войдите через Google или GitHub, которым регистрировались.',
  'auth/popup-closed-by-user': 'Окно входа закрыто. Попробуйте ещё раз.',
  'auth/popup-blocked': 'Браузер заблокировал всплывающее окно. Разрешите попапы для этого сайта.',
  'auth/cancelled-popup-request': 'Запрос отменён. Попробуйте ещё раз.',
  'auth/unauthorized-continue-uri': 'Домен не авторизован в Firebase. Обратитесь к администратору.',
  'auth/invalid-email': 'Неверный формат email.',
  'auth/user-not-found': 'Пользователь с таким email не найден.',
  'auth/wrong-password': 'Неверный пароль.',
  'auth/too-many-requests': 'Слишком много попыток. Подождите немного и попробуйте снова.',
  'auth/network-request-failed': 'Ошибка сети. Проверьте подключение к интернету.',
  'auth/email-already-in-use': 'Этот email уже зарегистрирован. Попробуйте войти.',
  'auth/weak-password': 'Пароль слишком простой. Минимум 6 символов.',
  'auth/invalid-credential': 'Неверный email или пароль.',
  'auth/operation-not-allowed': 'Этот способ входа отключён. Обратитесь к администратору.',
};

function getAuthError(e: any): string {
  const code = e?.code as string;
  return firebaseErrorRu[code] || e?.message || 'Произошла ошибка. Попробуйте ещё раз.';
}

interface AuthModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSuccess?: () => void;
  title?: string;
  description?: string;
}

export function AuthModal({ isOpen, onClose, onSuccess, title, description }: AuthModalProps) {
  const { login, loginWithGitHub, loginWithEmail } = useAuth();
  const [loadingProvider, setLoadingProvider] = useState<string | null>(null);
  const [emailView, setEmailView] = useState(false);
  const [isRegister, setIsRegister] = useState(false);
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [showPass, setShowPass] = useState(false);

  const handleGoogle = async () => {
    setLoadingProvider('google');
    try {
      await login();
      onSuccess?.();
      onClose();
    } catch (e: any) {
      toast.error(getAuthError(e));
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
      toast.error(getAuthError(e));
    } finally {
      setLoadingProvider(null);
    }
  };

  const handleEmailSubmit = async () => {
    if (!email.trim() || !password.trim()) {
      toast.error('Заполните email и пароль');
      return;
    }
    setLoadingProvider('email');
    try {
      await loginWithEmail(email.trim(), password, isRegister);
      onSuccess?.();
      onClose();
    } catch (e: any) {
      toast.error(getAuthError(e));
    } finally {
      setLoadingProvider(null);
    }
  };

  const resetEmailView = () => {
    setEmailView(false);
    setEmail('');
    setPassword('');
    setShowPass(false);
    setIsRegister(false);
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

            <AnimatePresence mode="wait">
              {!emailView ? (
                <motion.div
                  key="oauth"
                  initial={{ opacity: 0, x: -10 }}
                  animate={{ opacity: 1, x: 0 }}
                  exit={{ opacity: 0, x: -10 }}
                  className="space-y-3"
                >
                  <button
                    onClick={handleGoogle}
                    disabled={!!loadingProvider}
                    className="neu-button neu-button-accent w-full py-3 font-bold flex items-center justify-center gap-3 disabled:opacity-60"
                  >
                    {loadingProvider === 'google' ? (
                      <Loader2 className="w-4 h-4 animate-spin" />
                    ) : (
                      <svg className="w-4 h-4 shrink-0" viewBox="0 0 24 24">
                        <path d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z" fill="#4285F4"/>
                        <path d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z" fill="#34A853"/>
                        <path d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z" fill="#FBBC05"/>
                        <path d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z" fill="#EA4335"/>
                      </svg>
                    )}
                    Войти через Google
                  </button>

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

                  <div className="flex items-center gap-3 py-1">
                    <div className="flex-1 h-px neu-panel-inset opacity-40" />
                    <span className="text-xs text-[var(--neu-text-muted)] uppercase tracking-widest">или</span>
                    <div className="flex-1 h-px neu-panel-inset opacity-40" />
                  </div>

                  <button
                    onClick={() => setEmailView(true)}
                    disabled={!!loadingProvider}
                    className="neu-button w-full py-3 font-bold flex items-center justify-center gap-3 disabled:opacity-60 hover:text-[var(--neu-accent)]"
                  >
                    <Mail className="w-4 h-4" />
                    Войти по email и паролю
                  </button>
                </motion.div>
              ) : (
                <motion.div
                  key="email"
                  initial={{ opacity: 0, x: 10 }}
                  animate={{ opacity: 1, x: 0 }}
                  exit={{ opacity: 0, x: 10 }}
                  className="space-y-3"
                >
                  <div className="flex neu-panel-inset rounded-xl p-1 gap-1 mb-4">
                    <button
                      onClick={() => setIsRegister(false)}
                      className={`flex-1 py-2 rounded-lg text-sm font-bold transition-all ${!isRegister ? 'neu-button text-[var(--neu-accent)]' : 'opacity-50 hover:opacity-80'}`}
                    >
                      Войти
                    </button>
                    <button
                      onClick={() => setIsRegister(true)}
                      className={`flex-1 py-2 rounded-lg text-sm font-bold transition-all ${isRegister ? 'neu-button text-[var(--neu-accent)]' : 'opacity-50 hover:opacity-80'}`}
                    >
                      Зарегистрироваться
                    </button>
                  </div>

                  <input
                    type="email"
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    placeholder="your@email.com"
                    autoComplete="email"
                    className="w-full neu-panel-inset px-4 py-3 text-sm rounded-xl bg-transparent outline-none text-[var(--neu-text)] placeholder:text-[var(--neu-text-muted)]"
                  />

                  <div className="relative">
                    <input
                      type={showPass ? 'text' : 'password'}
                      value={password}
                      onChange={(e) => setPassword(e.target.value)}
                      onKeyDown={(e) => e.key === 'Enter' && handleEmailSubmit()}
                      placeholder={isRegister ? 'Придумайте пароль (мин. 6 символов)' : 'Пароль'}
                      autoComplete={isRegister ? 'new-password' : 'current-password'}
                      className="w-full neu-panel-inset px-4 py-3 pr-11 text-sm rounded-xl bg-transparent outline-none text-[var(--neu-text)] placeholder:text-[var(--neu-text-muted)]"
                    />
                    <button
                      type="button"
                      onClick={() => setShowPass(!showPass)}
                      className="absolute right-3 top-1/2 -translate-y-1/2 text-[var(--neu-text-muted)] hover:text-[var(--neu-text)]"
                      aria-label={showPass ? 'Скрыть пароль' : 'Показать пароль'}
                    >
                      {showPass ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                    </button>
                  </div>

                  <button
                    onClick={handleEmailSubmit}
                    disabled={!!loadingProvider || !email.trim() || !password.trim()}
                    className="neu-button neu-button-accent w-full py-3 font-bold flex items-center justify-center gap-2 disabled:opacity-60"
                  >
                    {loadingProvider === 'email' ? (
                      <Loader2 className="w-4 h-4 animate-spin" />
                    ) : (
                      <KeyRound className="w-4 h-4" />
                    )}
                    {isRegister ? 'Создать аккаунт' : 'Войти'}
                  </button>

                  <button
                    onClick={resetEmailView}
                    className="w-full text-xs text-[var(--neu-text-muted)] hover:text-[var(--neu-text)] py-1 transition-colors"
                  >
                    ← Назад к другим способам входа
                  </button>
                </motion.div>
              )}
            </AnimatePresence>
          </motion.div>
        </motion.div>
      )}
    </AnimatePresence>
  );
}
