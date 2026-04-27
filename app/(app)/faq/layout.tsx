import type { Metadata } from 'next';

export const metadata: Metadata = {
  title: 'Частые вопросы (FAQ)',
  description: 'Ответы на популярные вопросы о StackBox: безопасность, тарифы, шифрование, командный доступ и интеграции.',
  openGraph: {
    title: 'FAQ — StackBox',
    description: 'Всё, что нужно знать о StackBox: безопасность, шифрование, тарифы.',
    url: 'https://stackbox.app/faq',
  },
  alternates: { canonical: 'https://stackbox.app/faq' },
};

export default function FAQLayout({ children }: { children: React.ReactNode }) {
  return <>{children}</>;
}
