Write-Host "=======================================================" -ForegroundColor Green
Write-Host "   Launching NutriRegion Health & Fitness App..." -ForegroundColor Green
Write-Host "=======================================================" -ForegroundColor Green
Write-Host ""

$ScriptDir = Split-Path -Parent $MyInvocation.MyCommand.Definition

Write-Host "[1/2] Starting Backend API Server (Port 5000)..." -ForegroundColor Yellow
Start-Process cmd -ArgumentList "/k cd /d `"$ScriptDir\backend`" && npm start"

Start-Sleep -Seconds 3

Write-Host "[2/2] Starting Mobile App Dev Server (Port 3000)..." -ForegroundColor Yellow
Start-Process cmd -ArgumentList "/k cd /d `"$ScriptDir\mobile`" && npm run dev"

Start-Sleep -Seconds 2

Write-Host "Opening browser to http://localhost:3000 ..." -ForegroundColor Cyan
Start-Process "http://localhost:3000"

Write-Host ""
Write-Host "=======================================================" -ForegroundColor Green
Write-Host "   NutriRegion is running!" -ForegroundColor Green
Write-Host "   - App URL:     http://localhost:3000" -ForegroundColor Cyan
Write-Host "   - Backend API: http://localhost:5000" -ForegroundColor Cyan
Write-Host "=======================================================" -ForegroundColor Green
