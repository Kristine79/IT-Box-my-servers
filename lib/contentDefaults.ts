export const defaultAbout = {
  en: {
    intro: "StackBox is a centralized vault for IT infrastructure: servers, projects, services, access, and secure configuration sharing.",
    whatIs: "StackBox is a web application for system administrators, DevOps engineers, and webmasters. It allows you to keep all your infrastructure at your fingertips: servers, projects, services, and credentials — in one secure place.",
    modules: [
      { title: "Projects", desc: "Manage projects: status, URLs, and tech stack. Links to servers and credentials." },
      { title: "Servers", desc: "Inventory: IP, provider, OS, and notes. Instant linking to projects." },
      { title: "Services", desc: "Dashboard for server services: URLs, ports, and availability status." },
      { title: "Credentials", desc: "AES-256-GCM encrypted vault for SSH, FTP, DB, and API keys." }
    ],
    features: [
      { title: "Security", desc: "AES-256 encryption." },
      { title: "Sharing", desc: "Secure temporary links." },
      { title: "PWA", desc: "Native web experience." },
      { title: "Search", desc: "Instant global search." }
    ],
    audience: [
      { title: "System Administrator", desc: "Maintains a full server registry, stores encrypted SSH/RDP access, shares configuration via temporary links." },
      { title: "DevOps Engineer", desc: "Structures infrastructure by projects, links services to servers, tracks each project's technology stack." },
      { title: "Webmaster / Freelancer", desc: "Manages client hostings and sites, stores FTP/cPanel credentials, quickly finds servers by project." },
      { title: "Small IT Team", desc: "Centralized infrastructure knowledge hub instead of fragmented tables and messengers." }
    ]
  },
  ru: {
    intro: "StackBox — централизованный сейф для IT-инфраструктуры: серверы, проекты, сервисы, доступы и безопасный шеринг конфигураций.",
    whatIs: "StackBox — это веб-приложение для системных администраторов, DevOps-инженеров и веб-мастеров. Оно позволяет держать всю инфраструктуру под рукой: серверы, проекты, сервисы и учётные данные — в одном защищённом месте.",
    modules: [
      { title: "Проекты", desc: "Управляйте проектами: статус, URL и стек. Привязка серверов и доступов." },
      { title: "Серверы", desc: "Инвентаризация: IP, провайдер, ОС и заметки. Мгновенная привязка к проектам." },
      { title: "Сервисы", desc: "Дашборд сервисов: URL, порты и статус доступности приложений." },
      { title: "Доступы", desc: "Зашифрованное AES-256-GCM хранилище для SSH, FTP, БД и API ключей." }
    ],
    features: [
      { title: "Безопасность", desc: "Шифрование AES-256." },
      { title: "Шеринг", desc: "Временные ссылки." },
      { title: "PWA", desc: "Нативное веб-приложение." },
      { title: "Поиск", desc: "Мгновенный поиск." }
    ],
    audience: [
      { title: "Системный администратор", desc: "Ведёт полный реестр серверов компании, хранит SSH/RDP-доступы в зашифрованном виде, делится конфигурацией с коллегами через временные ссылки." },
      { title: "DevOps-инженер", desc: "Структурирует инфраструктуру по проектам, привязывает сервисы к серверам, отслеживает стек технологий каждого проекта." },
      { title: "Веб-мастер / фрилансер", desc: "Управляет хостингами и сайтами клиентов, хранит FTP/cPanel-доступы, быстро находит нужный сервер по проекту." },
      { title: "Небольшая IT-команда", desc: "Централизованное хранилище знаний об инфраструктуре вместо разрозненных таблиц и мессенджеров." }
    ]
  }
};

export type FAQItem = { q: string; a: string };

export const defaultFAQ: { en: FAQItem[]; ru: FAQItem[] } = {
  en: [
    { q: "What is StackBox?", a: "StackBox is a centralized vault for storing information about your servers, projects, microservices, and authentication data." },
    { q: "Where are my passwords stored?", a: "All data is securely stored in a protected database. Passwords, private keys, and other critical secrets are encrypted on the server using the AES-256-GCM algorithm." },
    { q: "Can I share access with a contractor?", a: "Yes, you can generate a temporary link with a specific timer and view counter to securely transfer necessary access to external contractors. Passwords are not included in the link." },
    { q: "How do I restore access?", a: "Authorization happens through your linked Google Account. No separate master password, which could be lost or forgotten, is required in the system." },
    { q: "Is it safe to use the system?", a: "Yes, we use strict Firebase Security Rules (zero trust). Passwords are hidden by default, and their decryption occurs only upon explicit request through a secure API." }
  ],
  ru: [
    { q: "Что такое StackBox?", a: "StackBox — это централизованный сейф для хранения информации о ваших серверах, проектах, микросервисах и аутентификационных данных." },
    { q: "Где хранятся мои пароли?", a: "Все данные безопасно хранятся в защищенной базе. При этом пароли, приватные ключи и прочие критические секреты шифруются на сервере с использованием алгоритма AES-256-GCM." },
    { q: "Могу ли я поделиться доступом с подрядчиком?", a: "Да, вы можете сгенерировать временную ссылку с определенным таймером и счетчиком открытий, чтобы безопасно передать нужные доступы внешним подрядчикам. Пароли в ссылку не попадают." },
    { q: "Как восстановить доступ?", a: "Авторизация происходит через ваш привязанный Google Аккаунт. Отдельного мастер-пароля, который можно было бы потерять или забыть, в системе не требуется." },
    { q: "Безопасно ли использовать систему?", a: "Да, мы используем строгие правила безопасности Firebase Security Rules (нулевое доверие). Пароли скрыты по умолчанию, и их дешифровка происходит исключительно при явном запросе через защищенный API." }
  ]
};

export const defaultPricing = {
  en: {
    plans: [
      { id: 'free', name: 'Free Trial', price: '0', duration: '14 days', features: ['Up to 5 projects', 'Basic tracking', '1 user'], current: true },
      { id: 'basic', name: 'Basic', price: '300', duration: 'per month', features: ['Unlimited projects', 'Encrypted vault', 'Priority support'], current: false },
      { id: 'pro', name: 'Pro', price: '700', duration: 'per month', features: ['Everything in Basic', 'Unlimited sharing', 'API access', 'Account manager'], current: false }
    ],
    enterpriseTitle: "Need more?",
    enterpriseDesc: "Custom solutions for large teams with dedicated infrastructure requirements.",
    contactSales: "Contact Sales"
  },
  ru: {
    plans: [
      { id: 'free', name: 'Бесплатный', price: '0', duration: '14 дней', features: ['До 5 проектов', 'Базовый трекинг', '1 пользователь'], current: true },
      { id: 'basic', name: 'Базовый', price: '300', duration: 'в месяц', features: ['Безлимит проектов', 'Зашифрованное хранилище', 'Приоритетная поддержка'], current: false },
      { id: 'pro', name: 'Про', price: '700', duration: 'в месяц', features: ['Всё из Базового', 'Безлимит шеринг', 'API доступ', 'Персональный менеджер'], current: false }
    ],
    enterpriseTitle: "Нужно больше?",
    enterpriseDesc: "Индивидуальные решения для крупных команд со специфическими требованиями к инфраструктуре.",
    contactSales: "Связаться с отделом продаж"
  }
};
