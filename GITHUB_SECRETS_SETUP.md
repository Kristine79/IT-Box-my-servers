# GitHub Secrets Setup Guide

## Быстрая настройка Secrets для CI/CD Pipeline

### Шаги

1. Открой **Settings** в твоём GitHub репозитории
2. Перейди в **Secrets and variables** → **Actions**
3. Нажми **New repository secret**
4. Добавь по очереди все переменные из списка ниже

---

## Required Secrets (Обязательные)

### Firebase Client Configuration
| Secret Name | Value | Откуда взять |
|------------|-------|--------------|
| `NEXT_PUBLIC_FIREBASE_API_KEY` | `AIza...` | Firebase Console → Project Settings → General → Web API Key |
| `NEXT_PUBLIC_FIREBASE_AUTH_DOMAIN` | `your-project.firebaseapp.com` | Firebase Console → Project Settings → General |
| `NEXT_PUBLIC_FIREBASE_PROJECT_ID` | `your-project-id` | Firebase Console → Project Settings → General |
| `NEXT_PUBLIC_FIREBASE_STORAGE_BUCKET` | `your-project.appspot.com` | Firebase Console → Project Settings → General |
| `NEXT_PUBLIC_FIREBASE_MESSAGING_SENDER_ID` | `123456789` | Firebase Console → Project Settings → General |
| `NEXT_PUBLIC_FIREBASE_APP_ID` | `1:123...:web:...` | Firebase Console → Project Settings → General |
| `NEXT_PUBLIC_FIREBASE_MEASUREMENT_ID` | `G-XXXXXXXXXX` | Firebase Console → Project Settings → General |

### Firebase Admin SDK (для API auth)
| Secret Name | Value | Откуда взять |
|------------|-------|--------------|
| `FIREBASE_ADMIN_PRIVATE_KEY` | `-----BEGIN PRIVATE KEY-----\nMIIE...\n-----END PRIVATE KEY-----\n` | Firebase Console → Project Settings → Service Accounts → Generate new private key |
| `FIREBASE_ADMIN_CLIENT_EMAIL` | `firebase-adminsdk-...` | Firebase Console → Project Settings → Service Accounts |
| `FIREBASE_PROJECT_ID` | `your-project-id` | Firebase Console → Project Settings → General |

**⚠️ Важно:** Ключ нужно конвертировать в одну строку, заменив реальные переносы на `\n`.

Пример:
```
-----BEGIN PRIVATE KEY-----
MIIE...
ABC123...
XYZ789...
-----END PRIVATE KEY-----
```

Становится:
```
-----BEGIN PRIVATE KEY-----\nMIIE...\nABC123...\nXYZ789...\n-----END PRIVATE KEY-----\n
```

---

## Optional Secrets (Опциональные)

### Google Analytics
| Secret Name | Value |
|------------|-------|
| `NEXT_PUBLIC_GA_ID` | `G-XXXXXXXXXX` |

### Sentry Monitoring
| Secret Name | Value |
|------------|-------|
| `NEXT_PUBLIC_SENTRY_DSN` | `https://xxx@yyy.ingest.sentry.io/zzz` |
| `SENTRY_ORG` | `your-org-name` |
| `SENTRY_PROJECT` | `your-project-name` |

### reCAPTCHA v3
| Secret Name | Value |
|------------|-------|
| `NEXT_PUBLIC_RECAPTCHA_SITE_KEY` | `6L...` |
| `RECAPTCHA_SECRET_KEY` | `6L...` |

### YooKassa Payments
| Secret Name | Value |
|------------|-------|
| `YOOKASSA_SHOP_ID` | `12345` |
| `YOOKASSA_SECRET_KEY` | `test_...` или `live_...` |

### Other
| Secret Name | Value |
|------------|-------|
| `GEMINI_API_KEY` | `AI...` |
| `AES_SECRET_KEY` | 64-char hex string |
| `NEXT_PUBLIC_ADMIN_EMAIL` | `admin@yourdomain.com` |

---

## Копировать как Secret

Для быстрого копирования используй `.env.local` файл в репозитории — там уже все имена переменных.

1. Открой `.env.local` локально
2. Скопируй значение (без кавычек!)
3. Вставь в GitHub Secret

---

## Проверка

После настройки secrets запушь любой коммит — CI pipeline должен пройти успешно.
