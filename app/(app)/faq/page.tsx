import { Suspense } from 'react';
import { defaultFAQ } from '@/lib/contentDefaults';
import FAQClient from './FAQClient';

export default function FAQPage() {
  const faqs = defaultFAQ.ru;

  return (
    <>
      {/* SSR: FAQ schema + HTML for crawlers */}
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{
          __html: JSON.stringify({
            "@context": "https://schema.org",
            "@type": "FAQPage",
            "mainEntity": faqs.map(faq => ({
              "@type": "Question",
              "name": faq.q,
              "acceptedAnswer": {
                "@type": "Answer",
                "text": faq.a
              }
            }))
          })
        }}
      />
      <article className="sr-only" aria-hidden="true" suppressHydrationWarning>
        <h1>FAQ — Частые вопросы о StackBox</h1>
        <p>Здесь собраны ответы на самые частые вопросы о возможностях, безопасности и устройстве платформы StackBox.</p>
        <dl>
          {faqs.map((faq, i) => (
            <div key={i}>
              <dt><strong>{faq.q}</strong></dt>
              <dd>{faq.a}</dd>
            </div>
          ))}
        </dl>
      </article>
      <Suspense fallback={<div className="p-8 opacity-50">Загрузка...</div>}>
        <FAQClient />
      </Suspense>
    </>
  );
}
