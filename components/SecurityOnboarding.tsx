'use client';

import { useState, useEffect } from 'react';
import { useTranslation } from 'react-i18next';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { Shield, Lock, Eye, Server, CheckCircle, ChevronRight, ChevronLeft, X } from 'lucide-react';
import { useAuth } from '@/lib/providers';

interface SecuritySlide {
  icon: React.ReactNode;
  title: string;
  description: string;
  details: string[];
}

export function SecurityOnboarding() {
  const { t } = useTranslation();
  const { user } = useAuth();
  const [open, setOpen] = useState(false);
  const [currentSlide, setCurrentSlide] = useState(0);

  // Check if user is new (first login)
  useEffect(() => {
    if (user) {
      const hasSeenSecurityGuide = localStorage.getItem(`security-guide-${user.uid}`);
      const userCreatedAt = user.metadata?.creationTime;
      const isNewUser = userCreatedAt && 
        (Date.now() - new Date(userCreatedAt).getTime()) < 24 * 60 * 60 * 1000; // 24 hours
      
      if (!hasSeenSecurityGuide && isNewUser) {
        setOpen(true);
      }
    }
  }, [user]);

  const slides: SecuritySlide[] = [
    {
      icon: <Shield className="w-12 h-12 text-emerald-500" />,
      title: t('security_welcome_title', 'Ваши данные под надежной защитой'),
      description: t('security_welcome_desc', 'IT-Box использует военный уровень шифрования для защиты ваших паролей и данных серверов.'),
      details: [
        t('security_detail_1', 'AES-256-GCM — тот же алгоритм, что использует Apple и Google'),
        t('security_detail_2', 'Даже при взломе сервера ваши данные останутся зашифрованными'),
        t('security_detail_3', 'Многоуровневая защита от атак и несанкционированного доступа'),
      ],
    },
    {
      icon: <Lock className="w-12 h-12 text-blue-500" />,
      title: t('security_encryption_title', 'Шифрование военного уровня'),
      description: t('security_encryption_desc', 'Все пароли шифруются перед сохранением. Ключ шифрования никогда не покидает сервер.'),
      details: [
        t('security_encrypt_1', '256-битный ключ — невозможно взломать перебором'),
        t('security_encrypt_2', 'Уникальный ключ для каждой операции шифрования'),
        t('security_encrypt_3', 'Автоматическая проверка целостности данных'),
      ],
    },
    {
      icon: <Eye className="w-12 h-12 text-purple-500" />,
      title: t('security_privacy_title', 'Приватность и контроль'),
      description: t('security_privacy_desc', 'Только вы имеете доступ к своим данным. Разработчики не могут прочитать ваши пароли.'),
      details: [
        t('security_privacy_1', 'Пароли видны только вам при расшифровке'),
        t('security_privacy_2', 'Никакого отслеживания или аналитики ваших данных'),
        t('security_privacy_3', 'Вы можете удалить все данные в любой момент'),
      ],
    },
    {
      icon: <Server className="w-12 h-12 text-orange-500" />,
      title: t('security_protection_title', 'Защита от атак'),
      description: t('security_protection_desc', 'Автоматическая защита от взлома, перебора паролей и вредоносных запросов.'),
      details: [
        t('security_protect_1', 'Ограничение попыток входа: 5 попыток за 15 минут'),
        t('security_protect_2', 'Автоматическое обнаружение подозрительной активности'),
        t('security_protect_3', 'HTTPS/TLS 1.3 для всех соединений'),
      ],
    },
  ];

  const handleClose = () => {
    if (user) {
      localStorage.setItem(`security-guide-${user.uid}`, 'seen');
    }
    setOpen(false);
  };

  const handleNext = () => {
    if (currentSlide < slides.length - 1) {
      setCurrentSlide(currentSlide + 1);
    } else {
      handleClose();
    }
  };

  const handlePrev = () => {
    if (currentSlide > 0) {
      setCurrentSlide(currentSlide - 1);
    }
  };

  const slide = slides[currentSlide];
  const isLastSlide = currentSlide === slides.length - 1;

  return (
    <Dialog open={open} onOpenChange={(v) => !v && handleClose()}>
      <DialogContent
        className="border-0 sm:rounded-3xl p-0 max-w-md overflow-hidden"
        style={{ background: 'var(--neu-bg)', boxShadow: 'var(--neu-shadow)', color: 'var(--neu-text)' }}
      >
        {/* Progress bar */}
        <div className="flex h-1 bg-[var(--neu-bg-secondary)]">
          {slides.map((_, idx) => (
            <div
              key={idx}
              className={`flex-1 transition-all duration-300 ${
                idx <= currentSlide ? 'bg-emerald-500' : 'bg-transparent'
              }`}
            />
          ))}
        </div>

        <div className="p-8">
          <DialogHeader className="mb-6">
            <div className="flex justify-between items-start">
              <div className="neu-panel-inset p-4 rounded-2xl mx-auto mb-4">
                {slide.icon}
              </div>
              <button
                onClick={handleClose}
                className="p-2 rounded-full hover:bg-[var(--neu-bg-secondary)] transition-colors"
              >
                <X className="w-5 h-5 text-[var(--neu-text-muted)]" />
              </button>
            </div>
            <DialogTitle className="text-xl font-bold text-center">
              {slide.title}
            </DialogTitle>
          </DialogHeader>

          <p className="text-[var(--neu-text-muted)] text-sm leading-relaxed text-center mb-6">
            {slide.description}
          </p>

          <ul className="space-y-3 mb-8">
            {slide.details.map((detail, idx) => (
              <li key={idx} className="flex items-start gap-3 text-sm">
                <CheckCircle className="w-5 h-5 text-emerald-500 flex-shrink-0 mt-0.5" />
                <span className="text-[var(--neu-text)]">{detail}</span>
              </li>
            ))}
          </ul>

          {/* Navigation */}
          <div className="flex items-center justify-between">
            <button
              onClick={handlePrev}
              disabled={currentSlide === 0}
              className={`p-2 rounded-full transition-colors ${
                currentSlide === 0
                  ? 'opacity-30 cursor-not-allowed'
                  : 'hover:bg-[var(--neu-bg-secondary)]'
              }`}
            >
              <ChevronLeft className="w-6 h-6" />
            </button>

            <div className="flex gap-2">
              {slides.map((_, idx) => (
                <button
                  key={idx}
                  onClick={() => setCurrentSlide(idx)}
                  className={`w-2 h-2 rounded-full transition-colors ${
                    idx === currentSlide ? 'bg-emerald-500' : 'bg-[var(--neu-text-muted)] opacity-30'
                  }`}
                />
              ))}
            </div>

            <button
              onClick={handleNext}
              className="neu-button neu-button-accent px-6 py-2 flex items-center gap-2"
            >
              {isLastSlide 
                ? t('security_finish', 'Готово') 
                : t('security_next', 'Далее')
              }
              {!isLastSlide && <ChevronRight className="w-4 h-4" />}
            </button>
          </div>
        </div>

        {/* Footer link */}
        <div className="px-8 pb-6 text-center">
          <a
            href="/SECURITY_GUIDE.md"
            target="_blank"
            rel="noopener noreferrer"
            className="text-xs text-[var(--neu-text-muted)] hover:text-emerald-500 transition-colors underline"
          >
            {t('security_full_guide', 'Подробное руководство по безопасности')}
          </a>
        </div>
      </DialogContent>
    </Dialog>
  );
}
