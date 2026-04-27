import type { Metadata } from 'next';

export const metadata: Metadata = {
  title: 'Тарифы и цены',
  description: 'Тарифы StackBox: Free (0 ₽), Standard (300 ₽/мес) и Premium (900 ₽/мес). Управляйте серверами, сервисами и доступами с шифрованием AES-256.',
  openGraph: {
    title: 'Тарифы StackBox — от 0 ₽/мес',
    description: 'Free / Standard / Premium. Экспорт, уведомления, командный доступ. Годовая скидка −17%.',
    url: 'https://stackbox.app/pricing',
  },
  alternates: { canonical: 'https://stackbox.app/pricing' },
};

export default function PricingLayout({ children }: { children: React.ReactNode }) {
  return <>{children}</>;
}
