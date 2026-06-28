# GitHub Secrets Verification Script for Windows/PowerShell
# Run: .\check_github_secrets.ps1

Write-Host "==========================================" -ForegroundColor Cyan
Write-Host "🔍 Checking GitHub Secrets Prerequisites" -ForegroundColor Cyan
Write-Host "==========================================" -ForegroundColor Cyan
Write-Host ""

# Load .env.local if exists
$envFile = ".env.local"
if (Test-Path $envFile) {
    Get-Content $envFile | ForEach-Object {
        if ($_ -match "^([^#][^=]+)=(.+)$") {
            $name = $matches[1].Trim()
            $value = $matches[2].Trim() -replace '^["\'']' -replace '["\'']$'
            [Environment]::SetEnvironmentVariable($name, $value, "Process")
        }
    }
}

# Required secrets
$required = @(
    "NEXT_PUBLIC_FIREBASE_API_KEY"
    "NEXT_PUBLIC_FIREBASE_AUTH_DOMAIN"
    "NEXT_PUBLIC_FIREBASE_PROJECT_ID"
    "NEXT_PUBLIC_FIREBASE_STORAGE_BUCKET"
    "NEXT_PUBLIC_FIREBASE_MESSAGING_SENDER_ID"
    "NEXT_PUBLIC_FIREBASE_APP_ID"
    "NEXT_PUBLIC_FIREBASE_MEASUREMENT_ID"
)

$adminRequired = @(
    "FIREBASE_ADMIN_PRIVATE_KEY"
    "FIREBASE_ADMIN_CLIENT_EMAIL"
    "FIREBASE_PROJECT_ID"
)

$optional = @(
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

Write-Host "✅ REQUIRED (Firebase Client):" -ForegroundColor White
foreach ($var in $required) {
    $val = [Environment]::GetEnvironmentVariable($var, "Process")
    if ([string]::IsNullOrWhiteSpace($val)) {
        Write-Host "  ❌ $var - NOT SET" -ForegroundColor Red
    } else {
        Write-Host "  ✓ $var" -ForegroundColor Green
    }
}

Write-Host ""
Write-Host "🔐 REQUIRED (Firebase Admin SDK):" -ForegroundColor White
foreach ($var in $adminRequired) {
    $val = [Environment]::GetEnvironmentVariable($var, "Process")
    if ([string]::IsNullOrWhiteSpace($val)) {
        Write-Host "  ❌ $var - NOT SET" -ForegroundColor Red
    } else {
        Write-Host "  ✓ $var" -ForegroundColor Green
    }
}

Write-Host ""
Write-Host "📦 OPTIONAL (but recommended):" -ForegroundColor White
foreach ($var in $optional) {
    $val = [Environment]::GetEnvironmentVariable($var, "Process")
    if ([string]::IsNullOrWhiteSpace($val)) {
        Write-Host "  ⚠️  $var - not set" -ForegroundColor Yellow
    } else {
        Write-Host "  ✓ $var" -ForegroundColor Green
    }
}

Write-Host ""
Write-Host "==========================================" -ForegroundColor Cyan

# Check if all required are set
$allRequiredSet = $true
$checkVars = $required + $adminRequired
foreach ($var in $checkVars) {
    $val = [Environment]::GetEnvironmentVariable($var, "Process")
    if ([string]::IsNullOrWhiteSpace($val)) {
        $allRequiredSet = $false
        break
    }
}

if ($allRequiredSet) {
    Write-Host "🎉 All required secrets are set!" -ForegroundColor Green
    Write-Host "You can now add these to GitHub:" -ForegroundColor White
    Write-Host "  Settings → Secrets and variables → Actions" -ForegroundColor Gray
} else {
    Write-Host "⚠️  Some required secrets are missing." -ForegroundColor Red
    Write-Host "Please fill in .env.local file first." -ForegroundColor White
}

Write-Host "==========================================" -ForegroundColor Cyan
