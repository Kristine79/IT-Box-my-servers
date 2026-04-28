'use client';

import React from 'react';
import { AlertTriangle, RefreshCcw, Home } from 'lucide-react';
import Link from 'next/link';

interface Props {
  children: React.ReactNode;
  fallback?: React.ReactNode;
}

interface State {
  hasError: boolean;
  error?: Error;
}

export class ErrorBoundary extends React.Component<Props, State> {
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
      if (this.props.fallback) {
        return this.props.fallback;
      }

      return (
        <div className="min-h-screen bg-[var(--neu-bg)] flex items-center justify-center p-4">
          <div className="neu-panel p-8 rounded-3xl max-w-md w-full text-center">
            <div className="neu-panel-inset p-4 rounded-2xl inline-flex mb-6">
              <AlertTriangle className="w-12 h-12 text-red-500" />
            </div>
            <h1 className="text-2xl font-bold mb-3">Something went wrong</h1>
            <p className="text-[var(--neu-text-muted)] mb-6">
              An unexpected error occurred. We&apos;ve been notified and are working to fix it.
            </p>
            {this.state.error && (
              <div className="neu-panel-inset p-4 rounded-xl mb-6 text-left">
                <p className="text-xs text-red-500 font-mono break-all">
                  {this.state.error.message}
                </p>
              </div>
            )}
            <div className="flex gap-3 justify-center">
              <button
                onClick={this.handleRetry}
                className="neu-button neu-button-accent px-5 py-2.5 font-semibold flex items-center gap-2"
              >
                <RefreshCcw className="w-4 h-4" />
                Retry
              </button>
              <Link
                href="/"
                className="neu-button px-5 py-2.5 font-semibold flex items-center gap-2"
              >
                <Home className="w-4 h-4" />
                Home
              </Link>
            </div>
          </div>
        </div>
      );
    }

    return this.props.children;
  }
}
