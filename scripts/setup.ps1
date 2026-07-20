# MRMS local environment bootstrap (Windows / PowerShell)
# Usage: pwsh ./scripts/setup.ps1
$ErrorActionPreference = 'Stop'

Write-Host 'MRMS setup: bootstrapping local environment...' -ForegroundColor Cyan

if (-not (Test-Path '.env')) {
  Copy-Item '.env.example' '.env'
  Write-Host 'Created .env from .env.example - fill in real values before running.' -ForegroundColor Yellow
} else {
  Write-Host '.env already exists - leaving it unchanged.' -ForegroundColor Green
}

if (Get-Command pnpm -ErrorAction SilentlyContinue) {
  Write-Host 'Installing workspace dependencies with pnpm...' -ForegroundColor Cyan
  pnpm install
} else {
  Write-Host 'pnpm not found. Install pnpm (https://pnpm.io) then re-run.' -ForegroundColor Red
}

Write-Host 'Setup complete.' -ForegroundColor Green
