import { Suspense } from 'react';
import { defaultAbout } from '@/lib/contentDefaults';
import AboutClient from './AboutClient';

export default function AboutPage() {
  const c = defaultAbout.ru;

  return (
    <>
      {/* SSR fallback: full HTML for crawlers that don't execute JS */}
      <article className="sr-only" aria-hidden="true" suppressHydrationWarning>
        <h1>StackBox — О продукте</h1>
        <p>{c.intro}</p>
        <h2>Что такое StackBox?</h2>
        <p>{c.whatIs}</p>
        <h2>Основные модули</h2>
        <ul>
          {c.modules.map((m, i) => (
            <li key={i}><strong>{m.title}</strong>: {m.desc}</li>
          ))}
        </ul>
        <h2>Ключевые возможности</h2>
        <ul>
          {c.features.map((f, i) => (
            <li key={i}><strong>{f.title}</strong>: {f.desc}</li>
          ))}
        </ul>
        <h2>Для кого?</h2>
        <ul>
          {c.audience.map((a, i) => (
            <li key={i}><strong>{a.title}</strong>: {a.desc}</li>
          ))}
        </ul>
      </article>
      {/* Client component with animations */}
      <Suspense fallback={<div className="p-8 opacity-50">Загрузка...</div>}>
        <AboutClient />
      </Suspense>
    </>
  );
}

