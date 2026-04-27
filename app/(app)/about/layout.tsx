import type { Metadata } from 'next';

export const metadata: Metadata = {
  title: 'О продукте',
  description: 'StackBox — SaaS-платформа для безопасного управления IT-инфраструктурой. Серверы, проекты, сервисы и доступы с шифрованием AES-256-GCM.',
  openGraph: {
    title: 'О продукте StackBox',
    description: 'Управляйте серверами, проектами и паролями в одном месте. AES-256 шифрование. Бесплатный старт.',
    url: 'https://stackbox.app/about',
  },
  alternates: { canonical: 'https://stackbox.app/about' },
};

export default function AboutLayout({ children }: { children: React.ReactNode }) {
  return <>{children}</>;
}
