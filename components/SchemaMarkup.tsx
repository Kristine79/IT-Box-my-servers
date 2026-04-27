'use client';

import { useEffect, useState } from 'react';
import { usePathname } from 'next/navigation';

export function SchemaMarkup() {
  const [mounted, setMounted] = useState(false);
  const pathname = usePathname();

  useEffect(() => {
    setMounted(true);
  }, []);

  if (!mounted) return null;

  const baseUrl = 'https://stackbox.app';

  const organization = {
    "@context": "https://schema.org",
    "@type": "Organization",
    "name": "StackBox",
    "url": baseUrl,
    "logo": `${baseUrl}/logo.png`,
    "sameAs": [],
    "contactPoint": {
      "@type": "ContactPoint",
      "email": "info@premiumwebsite.ru",
      "contactType": "sales"
    }
  };

  const softwareApp = {
    "@context": "https://schema.org",
    "@type": "SoftwareApplication",
    "name": "StackBox",
    "url": baseUrl,
    "applicationCategory": "BusinessApplication",
    "operatingSystem": "Web",
    "description": "Единое защищённое хранилище IT-инфраструктуры: серверы, проекты, сервисы и пароли с шифрованием AES-256-GCM.",
    "author": { "@type": "Organization", "name": "StackBox" },
    "offers": [
      {
        "@type": "Offer",
        "name": "Free",
        "price": "0",
        "priceCurrency": "RUB",
        "description": "До 2 проектов, 1 сервер, базовое хранение"
      },
      {
        "@type": "Offer",
        "name": "Standard",
        "price": "300",
        "priceCurrency": "RUB",
        "billingIncrement": "MON",
        "description": "До 10 проектов, экспорт, уведомления, AES-256"
      },
      {
        "@type": "Offer",
        "name": "Premium",
        "price": "900",
        "priceCurrency": "RUB",
        "billingIncrement": "MON",
        "description": "Безлимит, команда, интеграции, аудит, бэкапы"
      }
    ],
    "aggregateRating": {
      "@type": "AggregateRating",
      "ratingValue": "4.8",
      "ratingCount": "12"
    },
    "featureList": [
      "Шифрование AES-256-GCM",
      "Управление серверами и проектами",
      "Хранилище паролей и API ключей",
      "Безопасный шаринг конфигураций",
      "Командный доступ с ролями",
      "PWA / мобильная версия"
    ]
  };

  const faqSchema = {
    "@context": "https://schema.org",
    "@type": "FAQPage",
    "mainEntity": [
      {
        "@type": "Question",
        "name": "Что такое StackBox?",
        "acceptedAnswer": {
          "@type": "Answer",
          "text": "StackBox — это SaaS-платформа для безопасного управления IT-инфраструктурой: серверами, сервисами, проектами и учётными данными с шифрованием AES-256-GCM."
        }
      },
      {
        "@type": "Question",
        "name": "Сколько стоит StackBox?",
        "acceptedAnswer": {
          "@type": "Answer",
          "text": "Бесплатный тариф — 0 ₽/мес (до 2 проектов). Standard — 300 ₽/мес (до 10 проектов, экспорт, уведомления). Premium — 900 ₽/мес (безлимит, команда, интеграции)."
        }
      },
      {
        "@type": "Question",
        "name": "Безопасно ли хранить пароли в StackBox?",
        "acceptedAnswer": {
          "@type": "Answer",
          "text": "Да. Все пароли шифруются алгоритмом AES-256-GCM на стороне сервера. В Premium доступно client-side шифрование с zero-knowledge архитектурой."
        }
      }
    ]
  };

  const breadcrumbs = pathname !== '/' ? {
    "@context": "https://schema.org",
    "@type": "BreadcrumbList",
    "itemListElement": [
      { "@type": "ListItem", "position": 1, "name": "Главная", "item": baseUrl },
      ...(pathname ? [{
        "@type": "ListItem",
        "position": 2,
        "name": pathname.replace('/', '').replace(/-/g, ' ') || 'Дашборд',
        "item": `${baseUrl}${pathname}`
      }] : [])
    ]
  } : null;

  const webPage = {
    "@context": "https://schema.org",
    "@type": "WebPage",
    "name": "StackBox",
    "url": `${baseUrl}${pathname}`,
    "speakable": {
      "@type": "SpeakableSpecification",
      "cssSelector": ["h1", "h2", "article"]
    },
    "isPartOf": {
      "@type": "WebSite",
      "name": "StackBox",
      "url": baseUrl
    }
  };

  const schemas: Record<string, unknown>[] = [organization, softwareApp, webPage];
  if (pathname === '/faq' || pathname === '/') schemas.push(faqSchema);
  if (breadcrumbs) schemas.push(breadcrumbs);

  return (
    <>
      {schemas.map((schema, i) => (
        <script
          key={i}
          type="application/ld+json"
          dangerouslySetInnerHTML={{ __html: JSON.stringify(schema) }}
        />
      ))}
    </>
  );
}
