import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "Политика использования cookies | StackBox",
  description: "Информация об использовании cookies на сайте StackBox",
};

export default function CookiesPage() {
  return (
    <div className="max-w-3xl mx-auto">
      <div className="mb-8">
        <h1 className="text-3xl font-bold tracking-tight mb-4">Политика использования cookies</h1>
        <p className="text-[var(--neu-text-muted)]">Последнее обновление: 26 апреля 2026 г.</p>
      </div>

      <div className="neu-panel p-8 space-y-8">
        <section>
          <h2 className="text-xl font-bold mb-4">Что такое cookies</h2>
          <p className="text-[var(--neu-text-muted)] leading-relaxed">
            Cookies — это небольшие текстовые файлы, которые сохраняются на вашем устройстве 
            при посещении веб-сайтов. Они позволяют сайту запоминать ваши действия и предпочтения 
            для более удобного использования.
          </p>
        </section>

        <section>
          <h2 className="text-xl font-bold mb-4">Какие cookies мы используем</h2>
          <div className="space-y-4">
            <div>
              <h3 className="font-medium mb-2">Необходимые cookies</h3>
              <p className="text-[var(--neu-text-muted)] leading-relaxed">
                Обеспечивают базовую функциональность сайта: аутентификацию, сохранение сессии, 
                настройки темы. Без этих cookies Сервис не может работать корректно.
              </p>
            </div>
            <div>
              <h3 className="font-medium mb-2">Функциональные cookies</h3>
              <p className="text-[var(--neu-text-muted)] leading-relaxed">
                Запоминают ваши предпочтения: язык интерфейса, последние просмотренные проекты, 
                состояние UI (свернуто/развернуто).
              </p>
            </div>
            <div>
              <h3 className="font-medium mb-2">Аналитические cookies</h3>
              <p className="text-[var(--neu-text-muted)] leading-relaxed">
                Помогают нам понять, как пользователи взаимодействуют с Сервисом. 
                Используем Google Analytics (анонимизированные данные).
              </p>
            </div>
          </div>
        </section>

        <section>
          <h2 className="text-xl font-bold mb-4">Сроки хранения cookies</h2>
          <ul className="space-y-2 text-[var(--neu-text-muted)]">
            <li className="flex items-start gap-2">
              <span className="text-[var(--neu-accent)]">•</span>
              <span>Сессионные cookies — удаляются при закрытии браузера</span>
            </li>
            <li className="flex items-start gap-2">
              <span className="text-[var(--neu-accent)]">•</span>
              <span>Постоянные cookies — хранятся до 1 года (настройки, предпочтения)</span>
            </li>
            <li className="flex items-start gap-2">
              <span className="text-[var(--neu-accent)]">•</span>
              <span>Аналитические cookies — до 2 лет</span>
            </li>
          </ul>
        </section>

        <section>
          <h2 className="text-xl font-bold mb-4">Управление cookies</h2>
          <p className="text-[var(--neu-text-muted)] leading-relaxed mb-4">
            Вы можете управлять cookies через настройки браузера:
          </p>
          <ul className="space-y-2 text-[var(--neu-text-muted)]">
            <li className="flex items-start gap-2">
              <span className="text-[var(--neu-accent)]">•</span>
              <span>Chrome: Настройки → Конфиденциальность и безопасность → Cookies</span>
            </li>
            <li className="flex items-start gap-2">
              <span className="text-[var(--neu-accent)]">•</span>
              <span>Firefox: Настройки → Приватность и защита → Cookies и данные сайтов</span>
            </li>
            <li className="flex items-start gap-2">
              <span className="text-[var(--neu-accent)]">•</span>
              <span>Safari: Настройки → Конфиденциальность → Cookies</span>
            </li>
          </ul>
          <p className="text-[var(--neu-text-muted)] leading-relaxed mt-4">
            Обратите внимание: отключение необходимых cookies может привести 
            к некорректной работе Сервиса.
          </p>
        </section>

        <section>
          <h2 className="text-xl font-bold mb-4">Сторонние сервисы</h2>
          <p className="text-[var(--neu-text-muted)] leading-relaxed">
            Мы используем сторонние сервисы, которые также могут устанавливать cookies:
          </p>
          <ul className="space-y-2 text-[var(--neu-text-muted)] mt-4">
            <li className="flex items-start gap-2">
              <span className="text-[var(--neu-accent)]">•</span>
              <span>Google Analytics — сбор анонимной статистики</span>
            </li>
            <li className="flex items-start gap-2">
              <span className="text-[var(--neu-accent)]">•</span>
              <span>Firebase Authentication — аутентификация пользователей</span>
            </li>
            <li className="flex items-start gap-2">
              <span className="text-[var(--neu-accent)]">•</span>
              <span>Stripe — обработка платежей (только на страницах оплаты)</span>
            </li>
          </ul>
        </section>

        <section>
          <h2 className="text-xl font-bold mb-4">Изменения в политике</h2>
          <p className="text-[var(--neu-text-muted)] leading-relaxed">
            Мы можем обновлять данную Политику cookies. Все изменения публикуются на этой странице 
            с указанием даты последнего обновления.
          </p>
        </section>

        <section>
          <h2 className="text-xl font-bold mb-4">Контакты</h2>
          <p className="text-[var(--neu-text-muted)] leading-relaxed">
            По вопросам, связанным с использованием cookies, обращайтесь: 
            privacy@stackbox.app
          </p>
        </section>
      </div>
    </div>
  );
}
