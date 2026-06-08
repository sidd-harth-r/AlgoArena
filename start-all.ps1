$root = Split-Path -Parent $MyInvocation.MyCommand.Path

Write-Host "============================================" -ForegroundColor Cyan
Write-Host "  AlgoArena - Starting All Services" -ForegroundColor Cyan
Write-Host "============================================" -ForegroundColor Cyan

Write-Host "`n[1/3] Starting Docker Services (Judge0, DB, Redis)..." -ForegroundColor Yellow
docker-compose -f "$root\docker-compose.yml" up -d

Write-Host "`n[2/3] Starting FastAPI Backend (port 8000)..." -ForegroundColor Yellow
Start-Process powershell -ArgumentList "-NoExit", "-Command", "Set-Location '$root\apps\api'; if (Test-Path '.\venv\Scripts\activate.ps1') { . '.\venv\Scripts\activate.ps1' }; Write-Host 'Backend starting...' -ForegroundColor Green; uvicorn main:app --reload --host 0.0.0.0 --port 8000"

Write-Host "`n[3/3] Starting Next.js Frontend (port 3000)..." -ForegroundColor Yellow
Start-Process powershell -ArgumentList "-NoExit", "-Command", "Set-Location '$root\apps\web'; Write-Host 'Frontend starting...' -ForegroundColor Green; npm run dev"

Write-Host "`n============================================" -ForegroundColor Green
Write-Host "  All services started!" -ForegroundColor Green
Write-Host "  Frontend: http://localhost:3000" -ForegroundColor White
Write-Host "  Backend:  http://localhost:8000" -ForegroundColor White
Write-Host "  Judge0:   http://localhost:2358" -ForegroundColor White
Write-Host "============================================" -ForegroundColor Green
