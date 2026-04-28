import type {Metadata} from 'next';
import './globals.css';
import { Geist } from "next/font/google";
import { cn } from "@/lib/utils";
import { Providers } from '@/lib/providers';
import { NotificationProvider } from '@/lib/notifications';
import { Toaster } from '@/components/ui/sonner';
import { GoogleAnalytics } from '@next/third-parties/google';

const GA_ID = process.env.NEXT_PUBLIC_GA_ID || 'G-YD1230Y7R5';
import { SchemaMarkup } from '@/components/SchemaMarkup';
import { ErrorBoundary } from '@/components/ErrorBoundary';

const geist = Geist({subsets:['latin'],variable:'--font-sans'});

export const metadata: Metadata = {
  metadataBase: new URL('https://stackbox.app'),
  title: {
    default: 'StackBox — Управление серверами, сервисами и доступами',
    template: '%s | StackBox',
  },
  description: 'Единое защищённое хранилище IT-инфраструктуры: серверы, проекты, сервисы и пароли с шифрованием AES-256-GCM. Бесплатный старт.',
  keywords: [
    'управление серверами', 'хранилище паролей', 'менеджер IT инфраструктуры',
    'IT Asset Management', 'server management', 'credential vault',
    'AES-256-GCM', 'шифрование данных', 'SaaS', 'StackBox',
    'безопасность инфраструктуры', 'командный доступ',
  ],
  authors: [{ name: 'StackBox Team', url: 'https://stackbox.app' }],
  creator: 'StackBox',
  publisher: 'StackBox',
  icons: {
    icon: '/favicon.ico',
    apple: '/logo.png',
  },
  openGraph: {
    title: 'StackBox — Управление серверами и доступами',
    description: 'Единое защищённое хранилище IT-инфраструктуры. Шифрование AES-256. Бесплатный старт.',
    type: 'website',
    url: 'https://stackbox.app',
    siteName: 'StackBox',
    locale: 'ru_RU',
    alternateLocale: 'en_US',
    images: [{
      url: '/api/og',
      width: 1200,
      height: 630,
      alt: 'StackBox — Управление IT-инфраструктурой',
    }],
  },
  twitter: {
    card: 'summary_large_image',
    title: 'StackBox — Управление серверами и доступами',
    description: 'Единое защищённое хранилище IT-инфраструктуры. AES-256. Бесплатный старт.',
    images: ['/api/og'],
  },
  alternates: {
    canonical: 'https://stackbox.app',
    languages: {
      'ru-RU': 'https://stackbox.app',
      'en-US': 'https://stackbox.app/en',
    },
  },
  manifest: '/manifest.json',
  robots: {
    index: true,
    follow: true,
    googleBot: {
      index: true,
      follow: true,
      'max-video-preview': -1,
      'max-image-preview': 'large' as const,
      'max-snippet': -1,
    },
  },
  category: 'technology',
};

export default function RootLayout({children}: {children: React.ReactNode}) {
  return (
    <html lang="en" className={cn("font-sans", geist.variable)} suppressHydrationWarning>
      <head>
        <meta name="theme-color" content="#3b82f6" />
        <link rel="icon" href="/favicon.ico" sizes="any" />
        <link rel="apple-touch-icon" href="/logo.png" />
        <link rel="manifest" href="/manifest.json" />
        <link rel="dns-prefetch" href="https://firestore.googleapis.com" />
        <link rel="preconnect" href="https://firestore.googleapis.com" crossOrigin="anonymous" />
        <link rel="dns-prefetch" href="https://www.googletagmanager.com" />
        <link rel="preconnect" href="https://www.googletagmanager.com" crossOrigin="anonymous" />
      </head>
      <body suppressHydrationWarning>
        <SchemaMarkup />
        <ErrorBoundary>
          <Providers>
            <NotificationProvider>
              {children}
              <Toaster />
            </NotificationProvider>
          </Providers>
        </ErrorBoundary>
        <GoogleAnalytics gaId={GA_ID} />
      </body>
    </html>
  );
}
