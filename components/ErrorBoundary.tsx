'use client';

import { Component, ReactNode } from 'react';
import { useTranslation } from 'react-i18next';
import { AlertTriangle, RefreshCw } from 'lucide-react';

interface Props {
  children: ReactNode;
}

interface State {
  hasError: boolean;
  error?: Error;
}

export class ErrorBoundary extends Component<Props, State> {
  constructor(props: Props) {
    super(props);
    this.state = { hasError: false };
  }

  static getDerivedStateFromError(error: Error): State {
    return { hasError: true, error };
  }

  componentDidCatch(error: Error, errorInfo: React.ErrorInfo) {
    console.error('ErrorBoundary caught an error:', error, errorInfo);
  }

  handleRetry = () => {
    this.setState({ hasError: false, error: undefined });
    window.location.reload();
  };

  render() {
    if (this.state.hasError) {
      return <ErrorFallback error={this.state.error} onRetry={this.handleRetry} />;
    }

    return this.props.children;
  }
}

function ErrorFallback({ error, onRetry }: { error?: Error; onRetry: () => void }) {
  const { t } = useTranslation();

  return (
    <div className="min-h-screen flex items-center justify-center bg-[var(--neu-bg)] p-4">
      <div className="neu-panel max-w-md w-full p-8 text-center">
        <div className="neu-panel-inset w-16 h-16 rounded-full mx-auto flex items-center justify-center text-red-500 mb-6">
          <AlertTriangle className="w-8 h-8" />
        </div>
        <h2 className="text-xl font-bold mb-2 text-[var(--neu-text)]">
          {t('error_boundary_title', 'Что-то пошло не так')}
        </h2>
        <p className="text-[var(--neu-text-muted)] mb-6 text-sm">
          {t('error_boundary_desc', 'Произошла ошибка при загрузке приложения. Попробуйте обновить страницу.')}
        </p>
        {error && (
          <pre className="text-xs text-left bg-[var(--neu-bg)] p-3 rounded-lg mb-6 overflow-auto max-h-32 text-[var(--neu-text-muted)]">
            {error.message}
          </pre>
        )}
        <button
          onClick={onRetry}
          className="neu-button neu-button-accent px-6 py-3 font-semibold flex items-center justify-center gap-2 mx-auto"
        >
          <RefreshCw className="w-4 h-4" />
          {t('reload', 'Обновить страницу')}
        </button>
      </div>
    </div>
  );
}
