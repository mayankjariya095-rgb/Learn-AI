@echo off
title LearnAI Public Live Link Generator
cls
echo ========================================================
echo          LearnAI - Generating Public Live Link
echo ========================================================
echo.

:: 1. Clear old processes
echo [1/4] Clearing existing processes...
taskkill /f /im cloudflared.exe >nul 2>&1
for /f "tokens=5" %%a in ('netstat -aon ^| findstr ":8000" ^| findstr "LISTENING"') do taskkill /f /t /pid %%a >nul 2>&1
for /f "tokens=5" %%a in ('netstat -aon ^| findstr ":5173" ^| findstr "LISTENING"') do taskkill /f /t /pid %%a >nul 2>&1

:: 2. Start Django Backend
echo [2/4] Starting Django Backend...
start "LearnAI - Backend" /min cmd /k "cd /d %~dp0backend && call venv\Scripts\activate.bat && python manage.py runserver 127.0.0.1:8000"

ping 127.0.0.1 -n 3 >nul

:: 3. Start Vite Frontend
echo [3/4] Starting Vite Frontend...
start "LearnAI - Frontend" /min cmd /k "cd /d %~dp0frontend && npm run dev"

ping 127.0.0.1 -n 4 >nul

:: 4. Start Cloudflare Tunnel
echo [4/4] Starting Cloudflare Tunnel...
echo.
echo ========================================================
echo  Aapki Public Live Link neeche create ho rahi hai...
echo  (Is window ko BAND MAT KARNA jab tak chalana ho)
echo ========================================================
echo.
"%~dp0cloudflared.exe" tunnel --url http://localhost:5173
pause

