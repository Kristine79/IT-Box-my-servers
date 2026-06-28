#!/bin/bash
# GitHub Secrets Verification Script
# Run this locally to check if all required env vars are set

echo "=========================================="
echo "🔍 Checking GitHub Secrets Prerequisites"
echo "=========================================="
echo ""

# Colors
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
NC='\033[0m' # No Color

# Required secrets
REQUIRED=(
  "NEXT_PUBLIC_FIREBASE_API_KEY"
  "NEXT_PUBLIC_FIREBASE_AUTH_DOMAIN"
  "NEXT_PUBLIC_FIREBASE_PROJECT_ID"
  "NEXT_PUBLIC_FIREBASE_STORAGE_BUCKET"
  "NEXT_PUBLIC_FIREBASE_MESSAGING_SENDER_ID"
  "NEXT_PUBLIC_FIREBASE_APP_ID"
  "NEXT_PUBLIC_FIREBASE_MEASUREMENT_ID"
)

ADMIN_REQUIRED=(
  "FIREBASE_ADMIN_PRIVATE_KEY"
  "FIREBASE_ADMIN_CLIENT_EMAIL"
  "FIREBASE_PROJECT_ID"
)

OPTIONAL=(
  "NEXT_PUBLIC_GA_ID"
  "NEXT_PUBLIC_SENTRY_DSN"
  "SENTRY_ORG"
  "SENTRY_PROJECT"
  "NEXT_PUBLIC_RECAPTCHA_SITE_KEY"
  "RECAPTCHA_SECRET_KEY"
  "YOOKASSA_SHOP_ID"
  "YOOKASSA_SECRET_KEY"
  "GEMINI_API_KEY"
  "AES_SECRET_KEY"
  "NEXT_PUBLIC_ADMIN_EMAIL"
)

echo "✅ REQUIRED (Firebase Client):"
for var in "${REQUIRED[@]}"; do
  if [ -z "${!var}" ]; then
    echo -e "  ${RED}❌ $var - NOT SET${NC}"
  else
    echo -e "  ${GREEN}✓ $var${NC}"
  fi
done

echo ""
echo "🔐 REQUIRED (Firebase Admin SDK):"
for var in "${ADMIN_REQUIRED[@]}"; do
  if [ -z "${!var}" ]; then
    echo -e "  ${RED}❌ $var - NOT SET${NC}"
  else
    echo -e "  ${GREEN}✓ $var${NC}"
  fi
done

echo ""
echo "📦 OPTIONAL (but recommended):"
for var in "${OPTIONAL[@]}"; do
  if [ -z "${!var}" ]; then
    echo -e "  ${YELLOW}⚠️  $var - not set${NC}"
  else
    echo -e "  ${GREEN}✓ $var${NC}"
  fi
done

echo ""
echo "=========================================="

# Check if all required are set
ALL_REQUIRED_SET=true
for var in "${REQUIRED[@]}" "${ADMIN_REQUIRED[@]}"; do
  if [ -z "${!var}" ]; then
    ALL_REQUIRED_SET=false
    break
  fi
done

if [ "$ALL_REQUIRED_SET" = true ]; then
  echo -e "${GREEN}🎉 All required secrets are set!${NC}"
  echo "You can now add these to GitHub:"
  echo "  Settings → Secrets and variables → Actions"
else
  echo -e "${RED}⚠️  Some required secrets are missing.${NC}"
  echo "Please set them in your .env.local file first."
fi

echo "=========================================="
