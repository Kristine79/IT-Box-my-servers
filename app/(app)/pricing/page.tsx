import { Suspense } from 'react';
import { defaultPricing } from '@/lib/contentDefaults';
import PricingClient from './PricingClient';

export default function PricingPage() {
  const c = defaultPricing.ru;
  const plans = c.plans;

  return (
    <>
      {/* SSR: pricing schema + HTML for crawlers */}
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{
          __html: JSON.stringify({
            "@context": "https://schema.org",
            "@type": "Product",
            "name": "StackBox Subscription",
            "description": "Тарифы для управления IT-инфраструктурой и безопасного хранения доступов.",
            "offers": plans.map(plan => ({
              "@type": "Offer",
              "name": plan.name,
              "price": plan.price,
              "priceCurrency": "RUB",
              "itemOffered": {
                "@type": "Service",
                "name": plan.name,
                "description": plan.features.join(', ')
              }
            }))
          })
        }}
      />
      <article className="sr-only" aria-hidden="true" suppressHydrationWarning>
        <h1>Тарифы StackBox — управление IT-инфраструктурой</h1>
        <p>Три тарифа: Free (0 ₽/мес), Standard (300 ₽/мес) и Premium (900 ₽/мес). Годовая скидка −17%.</p>
        {plans.map((plan, i) => (
          <section key={i}>
            <h2>{plan.name} — {plan.price} ₽ {plan.duration}</h2>
            {plan.annualPrice && <p>При оплате за год: {plan.annualPrice} ₽ {plan.duration}</p>}
            <ul>
              {plan.features.map((f, j) => (
                <li key={j}>{f}</li>
              ))}
            </ul>
          </section>
        ))}
        <section>
          <h2>{c.enterpriseTitle}</h2>
          <p>{c.enterpriseDesc}</p>
          <p>Контакт: info@premiumwebsite.ru</p>
        </section>
      </article>
      <Suspense fallback={<div className="p-8 opacity-50">Загрузка...</div>}>
        <PricingClient />
      </Suspense>
    </>
  );
}
