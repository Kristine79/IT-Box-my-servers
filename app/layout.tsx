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

const geist = Geist({subsets:['latin'],variable:'--font-sans'});

export const metadata: Metadata = {
  title: 'StackBox | Unified Asset Manager',
  description: 'Secure vault for your infrastructure. Manage servers, services, and credentials with enterprise-grade AES-256-GCM encryption.',
  keywords: ['IT Asset Management', 'Infrastructure Security', 'Server Management', 'Credential Vault', 'AES-256-GCM'],
  authors: [{ name: 'StackBox Team' }],
  icons: {
    icon: '/favicon.ico',
  },
  openGraph: {
    title: 'StackBox | Unified Asset Manager',
    description: 'Secure vault for your infrastructure tools.',
    type: 'website',
    url: 'https://stackbox.app',
    siteName: 'StackBox',
  },
  twitter: {
    card: 'summary_large_image',
    title: 'StackBox | Unified Asset Manager',
    description: 'Secure vault for your infrastructure tools.',
  },
  alternates: {
    canonical: 'https://stackbox.app',
    languages: {
      'en-US': 'https://stackbox.app',
      'ru-RU': 'https://stackbox.app/ru', // Assuming middleware or segment is planned, but adding it for crawler awareness
    },
  },
  manifest: '/manifest.json',
  robots: {
    index: true,
    follow: true,
    googleBot: {
      index: true,
      follow: true,
    },
  },
};

export default function RootLayout({children}: {children: React.ReactNode}) {
  return (
    <html lang="en" className={cn("font-sans", geist.variable)} suppressHydrationWarning>
      <head>
        <meta name="theme-color" content="#3b82f6" />
        <link rel="icon" href="/favicon.ico" sizes="any" />
        <link rel="manifest" href="/manifest.json" />
      </head>
      <body suppressHydrationWarning>
        <SchemaMarkup />
        <Providers>
          <NotificationProvider>
            {children}
            <Toaster />
          </NotificationProvider>
        </Providers>
        <GoogleAnalytics gaId={GA_ID} />
      </body>
    </html>
  );
}
