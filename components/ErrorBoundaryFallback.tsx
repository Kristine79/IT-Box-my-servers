'use client';

import { useTranslation } from 'react-i18next';
import { AlertTriangle, RefreshCw, Home } from 'lucide-react';
import Link from 'next/link';

interface ErrorBoundaryFallbackProps {
  error: Error & { digest?: string };
  reset: () => void;
}

export function ErrorBoundaryFallback({ error, reset }: ErrorBoundaryFallbackProps) {
  const { t } = useTranslation();

  return (
    <div className="min-h-screen flex items-center justify-center p-4 bg-[var(--neu-bg)]">
      <div className="neu-panel max-w-md w-full p-8 text-center">
        <div className="w-16 h-16 rounded-full bg-red-500/10 flex items-center justify-center mx-auto mb-4">
          <AlertTriangle className="w-8 h-8 text-red-500" />
        </div>

        <h1 className="text-xl font-bold mb-2">
          {t('error_boundary_title', 'Something went wrong')}
        </h1>

        <p className="text-[var(--neu-text-muted)] text-sm mb-4">
          {t('error_boundary_description', 'We apologize for the inconvenience. Our team has been notified.')}
        </p>

        {process.env.NODE_ENV === 'development' && (
          <div className="mb-4 p-3 bg-[var(--neu-bg-secondary)] rounded-lg text-left">
            <p className="text-xs font-mono text-red-400 break-all">
              {error.message}
            </p>
            {error.digest && (
              <p className="text-xs text-[var(--neu-text-muted)] mt-2">
                Error ID: {error.digest}
              </p>
            )}
          </div>
        )}

        <div className="flex flex-col gap-3">
          <button
            onClick={reset}
            className="neu-button neu-button-primary flex items-center justify-center gap-2"
          >
            <RefreshCw className="w-4 h-4" />
            {t('error_boundary_try_again', 'Try Again')}
          </button>

          <Link
            href="/"
            className="neu-button flex items-center justify-center gap-2"
          >
            <Home className="w-4 h-4" />
            {t('error_boundary_go_home', 'Go Home')}
          </Link>
        </div>
      </div>
    </div>
  );
}
