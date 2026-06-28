# Vercel Deployment Guide 🚀

## Prerequisites

1. Проект на Vercel уже создан
2. Node.js 18.x или выше
3. Аккаунт Firebase с настроенным Firestore и Auth

## Требуемые Environment Variables

### Firebase Config (публичные)
```
NEXT_PUBLIC_FIREBASE_API_KEY=your_api_key
NEXT_PUBLIC_FIREBASE_AUTH_DOMAIN=your_project.firebaseapp.com
NEXT_PUBLIC_FIREBASE_PROJECT_ID=your_project_id
NEXT_PUBLIC_FIREBASE_STORAGE_BUCKET=your_project.appspot.com
NEXT_PUBLIC_FIREBASE_MESSAGING_SENDER_ID=your_sender_id
NEXT_PUBLIC_FIREBASE_APP_ID=your_app_id
```

### Server-side (секретные)
```
ENCRYPTION_KEY=your_32_byte_hex_key (генерируется через openssl rand -hex 32)
```

### Sentry (опционально)
```
SENTRY_ORG=your_org
SENTRY_PROJECT=your_project
```

### Billing (опционально)
```
YOOKASSA_SHOP_ID=your_shop_id
YOOKASSA_SECRET_KEY=your_secret_key
```

## Шаги деплоя

### 1. Установите Vercel CLI
```bash
npm i -g vercel
```

### 2. Войдите в аккаунт
```bash
vercel login
```

### 3. Деплой
```bash
vercel
```

Следуйте инструкциям:
- Team? Select your team
- Which scope? Select your project
- Link to existing project? Yes
- Directory to deploy? ./ (текущая директория)
- Want to modify settings? Yes
- Build Command? `npm run build` or `next build`
- Output Directory? `.next`
- Install dependencies? Yes

### 4. Настройка переменных окружения

После деплоя перейдите в Dashboard:
1. Settings → Environment Variables
2. Добавьте все переменные из списка выше

### 5. Redeploy
```bash
vercel --prod
```

## Структура проекта (проверено)

✅ Next.js 15 (App Router)
✅ React 19
✅ Tailwind CSS v4
✅ Firebase Auth + Firestore
✅ Sentry интеграция
✅ API routes (billing, crypto, monitoring, og, ai)
✅ i18n (English + Russian)
✅ PWA (manifest.json)

## Troubleshooting

### Ошибка "API route not found"
- Убедитесь что все API routes находятся в `app/api/`

### Ошибка Firebase
- Проверьте что Firebase Auth и Firestore включены в консоли Firebase
- Добавьте домен в "Authorized domains"

### Ошибка Sentry
- Sentry опциональный, можно удалить из `next.config.ts`

### Билд ошибки
```bash
npm run build
```

## Команды Vercel

```bash
vercel dev          # Локальная разработка
vercel deploy       # Деплой наpreview
vercel --prod       # Прод деплой
vercel logs         # Логи
