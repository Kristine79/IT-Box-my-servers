import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "Согласие на обработку персональных данных | StackBox",
  description: "Форма согласия на обработку персональных данных сервиса StackBox",
};

export default function ConsentPage() {
  return (
    <div className="max-w-3xl mx-auto">
      <div className="mb-8">
        <h1 className="text-3xl font-bold tracking-tight mb-4">Согласие на обработку персональных данных</h1>
        <p className="text-[var(--neu-text-muted)]">Действует с 26 апреля 2026 г.</p>
      </div>

      <div className="neu-panel p-8 space-y-8">
        <section>
          <h2 className="text-xl font-bold mb-4">Согласие на обработку персональных данных</h2>
          <p className="text-[var(--neu-text-muted)] leading-relaxed mb-4">
            Заполняя форму регистрации и используя сервис StackBox, я выражаю свое согласие 
            на обработку моих персональных данных в соответствии с Федеральным законом № 152-ФЗ 
            «О персональных данных» от 27.07.2006 г.
          </p>
        </section>

        <section>
          <h2 className="text-xl font-bold mb-4">Персональные данные, подлежащие обработке:</h2>
          <ul className="space-y-2 text-[var(--neu-text-muted)]">
            <li className="flex items-start gap-2">
              <span className="text-[var(--neu-accent)]">•</span>
              <span>Фамилия, имя, отчество (при указании)</span>
            </li>
            <li className="flex items-start gap-2">
              <span className="text-[var(--neu-accent)]">•</span>
              <span>Адрес электронной почты (email)</span>
            </li>
            <li className="flex items-start gap-2">
              <span className="text-[var(--neu-accent)]">•</span>
              <span>Контактный телефон (при указании)</span>
            </li>
            <li className="flex items-start gap-2">
              <span className="text-[var(--neu-accent)]">•</span>
              <span>Данные об IP-адресе, устройстве и браузере</span>
            </li>
            <li className="flex items-start gap-2">
              <span className="text-[var(--neu-accent)]">•</span>
              <span>Информация о действиях в системе (логи)</span>
            </li>
          </ul>
        </section>

        <section>
          <h2 className="text-xl font-bold mb-4">Цели обработки персональных данных:</h2>
          <ul className="space-y-2 text-[var(--neu-text-muted)]">
            <li className="flex items-start gap-2">
              <span className="text-[var(--neu-accent)]">•</span>
              <span>Регистрация и идентификация пользователя в системе</span>
            </li>
            <li className="flex items-start gap-2">
              <span className="text-[var(--neu-accent)]">•</span>
              <span>Предоставление доступа к функционалу сервиса</span>
            </li>
            <li className="flex items-start gap-2">
              <span className="text-[var(--neu-accent)]">•</span>
              <span>Обеспечение безопасности аккаунта и данных</span>
            </li>
            <li className="flex items-start gap-2">
              <span className="text-[var(--neu-accent)]">•</span>
              <span>Обратная связь с пользователем (уведомления, поддержка)</span>
            </li>
            <li className="flex items-start gap-2">
              <span className="text-[var(--neu-accent)]">•</span>
              <span>Обработка платежей и управление подпиской</span>
            </li>
            <li className="flex items-start gap-2">
              <span className="text-[var(--neu-accent)]">•</span>
              <span>Улучшение качества работы сервиса</span>
            </li>
          </ul>
        </section>

        <section>
          <h2 className="text-xl font-bold mb-4">Способы обработки:</h2>
          <p className="text-[var(--neu-text-muted)] leading-relaxed">
            Обработка персональных данных осуществляется с использованием средств автоматизации 
            и/или без использования таких средств в информационной системе персональных данных 
            с соблюдением требований законодательства РФ о защите персональных данных.
          </p>
        </section>

        <section>
          <h2 className="text-xl font-bold mb-4">Срок действия согласия:</h2>
          <p className="text-[var(--neu-text-muted)] leading-relaxed">
            Настоящее согласие действует до достижения целей обработки или до момента его отзыва. 
            Согласие может быть отозвано путем направления письменного уведомления 
            на электронный адрес: privacy@stackbox.app
          </p>
        </section>

        <section>
          <h2 className="text-xl font-bold mb-4">Права субъекта персональных данных:</h2>
          <p className="text-[var(--neu-text-muted)] leading-relaxed mb-4">
            Я подтверждаю, что мне известны мои права, предусмотренные статьей 14 Федерального закона 
            № 152-ФЗ «О персональных данных», включая право:
          </p>
          <ul className="space-y-2 text-[var(--neu-text-muted)]">
            <li className="flex items-start gap-2">
              <span className="text-[var(--neu-accent)]">•</span>
              <span>Получать информацию об обработке моих персональных данных</span>
            </li>
            <li className="flex items-start gap-2">
              <span className="text-[var(--neu-accent)]">•</span>
              <span>Требовать уточнения, блокирования или уничтожения данных</span>
            </li>
            <li className="flex items-start gap-2">
              <span className="text-[var(--neu-accent)]">•</span>
              <span>Отозвать настоящее согласие</span>
            </li>
            <li className="flex items-start gap-2">
              <span className="text-[var(--neu-accent)]">•</span>
              <span>Обжаловать действия или бездействие оператора</span>
            </li>
          </ul>
        </section>

        <section>
          <h2 className="text-xl font-bold mb-4">Подтверждение:</h2>
          <p className="text-[var(--neu-text-muted)] leading-relaxed">
            Я подтверждаю, что даю согласие добровольно, для достижения целей, указанных выше, 
            и ознакомлен с Политикой конфиденциальности сервиса StackBox.
          </p>
        </section>

        <section className="neu-panel-inset p-6 rounded-xl">
          <h3 className="font-bold mb-3">Контактная информация оператора:</h3>
          <div className="space-y-1 text-sm text-[var(--neu-text-muted)]">
            <p><span className="font-medium">Email:</span> privacy@stackbox.app</p>
            <p><span className="font-medium">Сайт:</span> https://stackbox.app</p>
          </div>
        </section>
      </div>
    </div>
  );
}
