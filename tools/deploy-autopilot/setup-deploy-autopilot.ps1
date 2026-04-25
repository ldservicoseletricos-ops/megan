Write-Host "Megan OS 7.0 Deploy Autopilot - Setup local" -ForegroundColor Cyan

$root = Split-Path -Parent (Split-Path -Parent $MyInvocation.MyCommand.Path)
$projectRoot = Split-Path -Parent $root
$envExample = Join-Path $projectRoot "tools\deploy-autopilot\deploy-autopilot.env.example"
$backendEnv = Join-Path $projectRoot "backend\.env"

if (-not (Test-Path $backendEnv)) {
  Copy-Item $envExample $backendEnv
  Write-Host "Criado backend\.env a partir do template." -ForegroundColor Green
} else {
  Write-Host "backend\.env ja existe. Nada foi sobrescrito." -ForegroundColor Yellow
}

Write-Host "\nInstalando dependencias do backend..." -ForegroundColor Cyan
Push-Location (Join-Path $projectRoot "backend")
npm install
Pop-Location

Write-Host "\nInstalando dependencias do frontend..." -ForegroundColor Cyan
Push-Location (Join-Path $projectRoot "frontend")
npm install
Pop-Location

Write-Host "\nSetup concluido. Preencha backend\.env e abra o modulo Deploy Autopilot 7.0." -ForegroundColor Green
