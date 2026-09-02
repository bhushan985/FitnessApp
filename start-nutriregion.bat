@echo off
title NutriRegion App Launcher
echo =======================================================
echo    Launching NutriRegion Health and Fitness App...
echo =======================================================
echo.

echo [1/2] Starting Backend API Server (Port 5000)...
start "NutriRegion Backend" cmd /k "cd /d %~dp0backend && npm start"

timeout /t 3 /nobreak >nul

echo [2/2] Starting Mobile App Server (Port 3000)...
start "NutriRegion Mobile App" cmd /k "cd /d %~dp0mobile && npm run dev"

timeout /t 2 /nobreak >nul
echo.
echo Opening browser to http://localhost:3000 ...
start http://localhost:3000

echo.
echo =======================================================
echo    NutriRegion is running!
echo    - Mobile Web App:  http://localhost:3000
echo    - Backend API:     http://localhost:5000
echo =======================================================
