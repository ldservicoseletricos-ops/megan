Write-Host "Megan OS 7.0 Deploy Autopilot - Preflight" -ForegroundColor Cyan

$required = @(
  "GITHUB_TOKEN",
  "GITHUB_OWNER",
  "GITHUB_REPO",
  "VERCEL_TOKEN",
  "VERCEL_PROJECT_NAME",
  "RENDER_API_KEY",
  "RENDER_SERVICE_NAME",
  "SUPABASE_ACCESS_TOKEN",
  "SUPABASE_PROJECT_REF",
  "DATABASE_URL",
  "GEMINI_API_KEY"
)

$missing = @()
foreach ($key in $required) {
  if (-not [Environment]::GetEnvironmentVariable($key)) {
    $missing += $key
  }
}

if ($missing.Count -gt 0) {
  Write-Host "Variaveis ausentes:" -ForegroundColor Yellow
  $missing | ForEach-Object { Write-Host " - $_" -ForegroundColor Yellow }
  Write-Host "Preencha backend/.env ou configure no ambiente antes do deploy real." -ForegroundColor Yellow
} else {
  Write-Host "Todas as variaveis principais estao presentes." -ForegroundColor Green
}

Write-Host "\nChecando Node..." -ForegroundColor Cyan
node -v

Write-Host "\nChecando npm..." -ForegroundColor Cyan
npm -v

Write-Host "\nPreflight concluido." -ForegroundColor Green
