import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "Политика конфиденциальности | StackBox",
  description: "Политика конфиденциальности и обработки персональных данных сервиса StackBox",
};

export default function PrivacyPage() {
  return (
    <div className="max-w-3xl mx-auto">
      <div className="mb-8">
        <h1 className="text-3xl font-bold tracking-tight mb-4">Политика конфиденциальности</h1>
        <p className="text-[var(--neu-text-muted)]">Последнее обновление: 26 апреля 2026 г.</p>
      </div>

      <div className="neu-panel p-8 space-y-8">
        <section>
          <h2 className="text-xl font-bold mb-4">1. Общие положения</h2>
          <p className="text-[var(--neu-text-muted)] leading-relaxed mb-4">
            Настоящая Политика конфиденциальности определяет порядок обработки и защиты персональных данных 
            пользователей сервиса StackBox (далее — «Сервис»). Используя Сервис, вы выражаете согласие 
            с условиями данной Политики.
          </p>
          <p className="text-[var(--neu-text-muted)] leading-relaxed">
            Оператором персональных данных является компания, предоставляющая услуги по управлению 
            инфраструктурой и доступами через платформу StackBox.
          </p>
        </section>

        <section>
          <h2 className="text-xl font-bold mb-4">2. Какие данные мы собираем</h2>
          <ul className="space-y-2 text-[var(--neu-text-muted)]">
            <li className="flex items-start gap-2">
              <span className="text-[var(--neu-accent)]">•</span>
              <span>Email-адрес для регистрации и идентификации</span>
            </li>
            <li className="flex items-start gap-2">
              <span className="text-[var(--neu-accent)]">•</span>
              <span>Информация о серверах, проектах и доступах (в зашифрованном виде)</span>
            </li>
            <li className="flex items-start gap-2">
              <span className="text-[var(--neu-accent)]">•</span>
              <span>Логи доступа и действий в системе (IP-адрес, User-Agent, время)</span>
            </li>
            <li className="flex items-start gap-2">
              <span className="text-[var(--neu-accent)]">•</span>
              <span>Информация о подписке и платежах (через защищенный процессинг)</span>
            </li>
          </ul>
        </section>

        <section>
          <h2 className="text-xl font-bold mb-4">3. Цели обработки данных</h2>
          <p className="text-[var(--neu-text-muted)] leading-relaxed mb-4">
            Мы обрабатываем персональные данные исключительно для следующих целей:
          </p>
          <ul className="space-y-2 text-[var(--neu-text-muted)]">
            <li className="flex items-start gap-2">
              <span className="text-[var(--neu-accent)]">•</span>
              <span>Предоставление доступа к функционалу Сервиса</span>
            </li>
            <li className="flex items-start gap-2">
              <span className="text-[var(--neu-accent)]">•</span>
              <span>Обеспечение безопасности аккаунта и данных</span>
            </li>
            <li className="flex items-start gap-2">
              <span className="text-[var(--neu-accent)]">•</span>
              <span>Техническая поддержка пользователей</span>
            </li>
            <li className="flex items-start gap-2">
              <span className="text-[var(--neu-accent)]">•</span>
              <span>Улучшение качества работы Сервиса</span>
            </li>
            <li className="flex items-start gap-2">
              <span className="text-[var(--neu-accent)]">•</span>
              <span>Соблюдение требований законодательства</span>
            </li>
          </ul>
        </section>

        <section>
          <h2 className="text-xl font-bold mb-4">4. Хранение и защита данных</h2>
          <p className="text-[var(--neu-text-muted)] leading-relaxed mb-4">
            Мы применяем комплексные меры для защиты ваших данных:
          </p>
          <ul className="space-y-2 text-[var(--neu-text-muted)]">
            <li className="flex items-start gap-2">
              <span className="text-[var(--neu-accent)]">•</span>
              <span>Все пароли хранятся в зашифрованном виде (AES-256-GCM)</span>
            </li>
            <li className="flex items-start gap-2">
              <span className="text-[var(--neu-accent)]">•</span>
              <span>Используем защищенное соединение (TLS 1.3)</span>
            </li>
            <li className="flex items-start gap-2">
              <span className="text-[var(--neu-accent)]">•</span>
              <span>Данные хранятся в защищенных дата-центрах Firebase/Google Cloud</span>
            </li>
            <li className="flex items-start gap-2">
              <span className="text-[var(--neu-accent)]">•</span>
              <span>Регулярное резервное копирование данных</span>
            </li>
            <li className="flex items-start gap-2">
              <span className="text-[var(--neu-accent)]">•</span>
              <span>Двухфакторная аутентификация (опционально)</span>
            </li>
          </ul>
        </section>

        <section>
          <h2 className="text-xl font-bold mb-4">5. Передача данных третьим лицам</h2>
          <p className="text-[var(--neu-text-muted)] leading-relaxed">
            Мы не передаем персональные данные третьим лицам, за исключением случаев, 
            когда это необходимо для работы Сервиса (облачная инфраструктура Google Cloud) 
            или требуется по закону. Все подрядчики связаны договорными обязательствами 
            о конфиденциальности.
          </p>
        </section>

        <section>
          <h2 className="text-xl font-bold mb-4">6. Сроки хранения</h2>
          <p className="text-[var(--neu-text-muted)] leading-relaxed">
            Персональные данные хранятся в течение всего периода использования вами Сервиса 
            и до 3 лет после удаления аккаунта, если иное не требуется законодательством. 
            Логи доступа хранятся до 1 года.
          </p>
        </section>

        <section>
          <h2 className="text-xl font-bold mb-4">7. Ваши права</h2>
          <p className="text-[var(--neu-text-muted)] leading-relaxed mb-4">
            Вы имеете право:
          </p>
          <ul className="space-y-2 text-[var(--neu-text-muted)]">
            <li className="flex items-start gap-2">
              <span className="text-[var(--neu-accent)]">•</span>
              <span>Получить информацию об обрабатываемых данных</span>
            </li>
            <li className="flex items-start gap-2">
              <span className="text-[var(--neu-accent)]">•</span>
              <span>Исправить неточные или неполные данные</span>
            </li>
            <li className="flex items-start gap-2">
              <span className="text-[var(--neu-accent)]">•</span>
              <span>Удалить данные (право на забвение)</span>
            </li>
            <li className="flex items-start gap-2">
              <span className="text-[var(--neu-accent)]">•</span>
              <span>Ограничить обработку данных</span>
            </li>
            <li className="flex items-start gap-2">
              <span className="text-[var(--neu-accent)]">•</span>
              <span>Отозвать согласие на обработку данных</span>
            </li>
          </ul>
        </section>

        <section>
          <h2 className="text-xl font-bold mb-4">8. Контакты</h2>
          <p className="text-[var(--neu-text-muted)] leading-relaxed">
            По всем вопросам, связанным с обработкой персональных данных, 
            обращайтесь по электронной почте: privacy@stackbox.app
          </p>
        </section>
      </div>
    </div>
  );
}
