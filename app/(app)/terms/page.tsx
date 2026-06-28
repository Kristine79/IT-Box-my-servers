import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "Условия использования | StackBox",
  description: "Условия использования сервиса StackBox",
};

export default function TermsPage() {
  return (
    <div className="max-w-3xl mx-auto">
      <div className="mb-8">
        <h1 className="text-3xl font-bold tracking-tight mb-4">Условия использования</h1>
        <p className="text-[var(--neu-text-muted)]">Последнее обновление: 26 апреля 2026 г.</p>
      </div>

      <div className="neu-panel p-8 space-y-8">
        <section>
          <h2 className="text-xl font-bold mb-4">1. Общие положения</h2>
          <p className="text-[var(--neu-text-muted)] leading-relaxed mb-4">
            Настоящие Условия использования (далее — «Условия») регулируют отношения между 
            пользователем (далее — «Пользователь») и сервисом StackBox (далее — «Сервис»). 
            Используя Сервис, вы соглашаетесь с настоящими Условиями.
          </p>
          <p className="text-[var(--neu-text-muted)] leading-relaxed">
            Сервис предоставляется компанией StackBox для управления IT-инфраструктурой, 
            проектами, серверами и доступами.
          </p>
        </section>

        <section>
          <h2 className="text-xl font-bold mb-4">2. Регистрация и аккаунт</h2>
          <ul className="space-y-2 text-[var(--neu-text-muted)]">
            <li className="flex items-start gap-2">
              <span className="text-[var(--neu-accent)]">•</span>
              <span>Для использования Сервиса требуется регистрация с действующим email-адресом</span>
            </li>
            <li className="flex items-start gap-2">
              <span className="text-[var(--neu-accent)]">•</span>
              <span>Пользователь несет ответственность за сохранность своих учетных данных</span>
            </li>
            <li className="flex items-start gap-2">
              <span className="text-[var(--neu-accent)]">•</span>
              <span>Запрещена передача доступа к аккаунту третьим лицам</span>
            </li>
            <li className="flex items-start gap-2">
              <span className="text-[var(--neu-accent)]">•</span>
              <span>Сервис имеет право заблокировать аккаунт при нарушении Условий</span>
            </li>
          </ul>
        </section>

        <section>
          <h2 className="text-xl font-bold mb-4">3. Платные услуги и подписки</h2>
          <p className="text-[var(--neu-text-muted)] leading-relaxed mb-4">
            Сервис предоставляется по модели freemium с бесплатным базовым тарифом и 
            платными расширенными тарифами:
          </p>
          <ul className="space-y-2 text-[var(--neu-text-muted)]">
            <li className="flex items-start gap-2">
              <span className="text-[var(--neu-accent)]">•</span>
              <span>Бесплатный тариф: до 2 проектов, 1 сервер, 2 сервиса</span>
            </li>
            <li className="flex items-start gap-2">
              <span className="text-[var(--neu-accent)]">•</span>
              <span>Стандарт: 300 ₽/мес — до 10 проектов, 5 серверов, экспорт, уведомления</span>
            </li>
            <li className="flex items-start gap-2">
              <span className="text-[var(--neu-accent)]">•</span>
              <span>Максимум: 900 ₽/мес — безлимит, команда, интеграции</span>
            </li>
            <li className="flex items-start gap-2">
              <span className="text-[var(--neu-accent)]">•</span>
              <span>Подписка автоматически продлевается, отмена возможна в любой момент</span>
            </li>
          </ul>
        </section>

        <section>
          <h2 className="text-xl font-bold mb-4">4. Ответственность сторон</h2>
          <p className="text-[var(--neu-text-muted)] leading-relaxed mb-4">
            Сервис предоставляется «как есть». Администрация не несет ответственности за:
          </p>
          <ul className="space-y-2 text-[var(--neu-text-muted)]">
            <li className="flex items-start gap-2">
              <span className="text-[var(--neu-accent)]">•</span>
              <span>Временные перебои в работе по техническим причинам</span>
            </li>
            <li className="flex items-start gap-2">
              <span className="text-[var(--neu-accent)]">•</span>
              <span>Потеру данных по вине Пользователя</span>
            </li>
            <li className="flex items-start gap-2">
              <span className="text-[var(--neu-accent)]">•</span>
              <span>Несанкционированный доступ к данным при компрометации учетных данных Пользователя</span>
            </li>
          </ul>
        </section>

        <section>
          <h2 className="text-xl font-bold mb-4">5. Запрещенное использование</h2>
          <p className="text-[var(--neu-text-muted)] leading-relaxed mb-4">
            Пользователю запрещается:
          </p>
          <ul className="space-y-2 text-[var(--neu-text-muted)]">
            <li className="flex items-start gap-2">
              <span className="text-[var(--neu-accent)]">•</span>
              <span>Использовать Сервис для незаконной деятельности</span>
            </li>
            <li className="flex items-start gap-2">
              <span className="text-[var(--neu-accent)]">•</span>
              <span>Пытаться получить несанкционированный доступ к системе</span>
            </li>
            <li className="flex items-start gap-2">
              <span className="text-[var(--neu-accent)]">•</span>
              <span>Распространять вредоносное ПО через Сервис</span>
            </li>
            <li className="flex items-start gap-2">
              <span className="text-[var(--neu-accent)]">•</span>
              <span>Создавать фиктивные аккаунты для обхода ограничений</span>
            </li>
          </ul>
        </section>

        <section>
          <h2 className="text-xl font-bold mb-4">6. Прекращение использования</h2>
          <p className="text-[var(--neu-text-muted)] leading-relaxed">
            Пользователь может удалить свой аккаунт в любой момент через настройки профиля. 
            Данные будут удалены в течение 30 дней. При нарушении Условий администрация 
            оставляет за собой право заблокировать доступ без предварительного уведомления.
          </p>
        </section>

        <section>
          <h2 className="text-xl font-bold mb-4">7. Контакты</h2>
          <p className="text-[var(--neu-text-muted)] leading-relaxed">
            По вопросам, связанным с Условиями использования, обращайтесь: 
            info@stackbox.app
          </p>
        </section>
      </div>
    </div>
  );
}
