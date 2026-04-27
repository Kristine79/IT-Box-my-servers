import type { Metadata } from 'next';

export const metadata: Metadata = {
  title: 'Политика конфиденциальности',
  description: 'Политика конфиденциальности StackBox. Как мы собираем, используем и защищаем ваши персональные данные.',
  openGraph: {
    title: 'Политика конфиденциальности — StackBox',
    url: 'https://stackbox.app/privacy',
  },
  alternates: { canonical: 'https://stackbox.app/privacy' },
  robots: { index: true, follow: true },
};

export default function PrivacyLayout({ children }: { children: React.ReactNode }) {
  return <>{children}</>;
}
