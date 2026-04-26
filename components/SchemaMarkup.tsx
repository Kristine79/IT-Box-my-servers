'use client';

import { useEffect, useState } from 'react';

export function SchemaMarkup() {
  const [mounted, setMounted] = useState(false);

  useEffect(() => {
    setMounted(true);
  }, []);

  if (!mounted) return null;

  const schema = {
    "@context": "https://schema.org",
    "@type": "WebApplication",
    "name": "StackBox",
    "url": "https://stackbox.app",
    "applicationCategory": "BusinessApplication",
    "operatingSystem": "Web, Windows, macOS, Linux, iOS, Android",
    "description": "Unified secure vault for IT infrastructure: servers, projects, services, and credentials with enterprise-grade encryption.",
    "author": {
      "@type": "Organization",
      "name": "StackBox Team"
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
  };

  return (
    <script
      type="application/ld+json"
      dangerouslySetInnerHTML={{
        __html: JSON.stringify(schema)
      }}
    />
  );
}
