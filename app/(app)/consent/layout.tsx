import type { Metadata } from 'next';

export const metadata: Metadata = {
  title: 'Согласие на обработку данных',
  description: 'Согласие на обработку персональных данных пользователей StackBox.',
  openGraph: {
    title: 'Согласие на обработку данных — StackBox',
    url: 'https://stackbox.app/consent',
  },
  alternates: { canonical: 'https://stackbox.app/consent' },
  robots: { index: true, follow: true },
};

export default function ConsentLayout({ children }: { children: React.ReactNode }) {
  return <>{children}</>;
}
