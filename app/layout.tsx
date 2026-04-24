import type {Metadata} from 'next';
import './globals.css';
import { Geist } from "next/font/google";
import { cn } from "@/lib/utils";
import { Providers } from '@/lib/providers';
import { NotificationProvider } from '@/lib/notifications';
import { Toaster } from '@/components/ui/sonner';
import { GoogleAnalytics } from '@next/third-parties/google';

const geist = Geist({subsets:['latin'],variable:'--font-sans'});

export const metadata: Metadata = {
  title: 'IT-Box | Unified Asset Manager',
  description: 'Secure vault for your infrastructure. Manage servers, services, and credentials with enterprise-grade AES-256-GCM encryption.',
  keywords: ['IT Asset Management', 'Infrastructure Security', 'Server Management', 'Credential Vault', 'AES-256-GCM'],
  authors: [{ name: 'IT-Box Team' }],
  icons: {
    icon: '/favicon.ico',
  },
  openGraph: {
    title: 'IT-Box | Unified Asset Manager',
    description: 'Secure vault for your infrastructure tools.',
    type: 'website',
    url: 'https://it-box.app',
    siteName: 'IT-Box',
  },
  twitter: {
    card: 'summary_large_image',
    title: 'IT-Box | Unified Asset Manager',
    description: 'Secure vault for your infrastructure tools.',
  },
  alternates: {
    canonical: 'https://it-box.app',
    languages: {
      'en-US': 'https://it-box.app',
      'ru-RU': 'https://it-box.app/ru', // Assuming middleware or segment is planned, but adding it for crawler awareness
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
        <script
          type="application/ld+json"
          dangerouslySetInnerHTML={{
            __html: JSON.stringify({
              "@context": "https://schema.org",
              "@type": "WebApplication",
              "name": "IT-Box",
              "url": "https://it-box.app",
              "applicationCategory": "BusinessApplication",
              "operatingSystem": "Web, Windows, macOS, Linux, iOS, Android",
              "description": "Unified secure vault for IT infrastructure: servers, projects, services, and credentials with enterprise-grade encryption.",
              "author": {
                "@type": "Organization",
                "name": "IT-Box Team"
              },
              "offers": {
                "@type": "AggregateOffer",
                "priceCurrency": "RUB",
                "lowPrice": "0",
                "highPrice": "700",
                "offerCount": "3"
              },
              "featureList": [
                "AES-256-GCM Encryption",
                "Secure Configuration Sharing",
                "Project & Server Management",
                "Team Collaboration",
                "PWA Support"
              ]
            })
          }}
        />
      </head>
      <body suppressHydrationWarning>
        <Providers>
          <NotificationProvider>
            {children}
            <Toaster />
          </NotificationProvider>
        </Providers>
        <GoogleAnalytics gaId="G-YD1230Y7R5" />
      </body>
    </html>
  );
}
