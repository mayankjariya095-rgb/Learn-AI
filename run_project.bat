@echo off
title LearnAI Launcher
cls
echo ========================================================
echo              Starting LearnAI Platform
echo ========================================================
echo.

:: 1. Purane atke hue processes ko clean karein (ports 8000 aur 5173)
echo [1/4] Checking and clearing ports 8000 and 5173...
taskkill /FI "WINDOWTITLE eq LearnAI - Backend*" /T /F >nul 2>&1
taskkill /FI "WINDOWTITLE eq LearnAI - Frontend*" /T /F >nul 2>&1
taskkill /FI "WINDOWTITLE eq LearnAI_Backend*" /T /F >nul 2>&1
taskkill /FI "WINDOWTITLE eq LearnAI_Frontend*" /T /F >nul 2>&1
for /f "tokens=5" %%a in ('netstat -aon ^| findstr ":8000" ^| findstr "LISTENING"') do taskkill /f /t /pid %%a >nul 2>&1
for /f "tokens=5" %%a in ('netstat -aon ^| findstr ":5173" ^| findstr "LISTENING"') do taskkill /f /t /pid %%a >nul 2>&1

:: 2. Start Django Backend
echo [2/4] Starting Django Backend on http://127.0.0.1:8000 ...
start "LearnAI - Backend" cmd /k "cd /d %~dp0backend && python manage.py runserver 127.0.0.1:8000"

ping 127.0.0.1 -n 3 >nul

:: 3. Start Vite Frontend
echo [3/4] Starting Vite Frontend on http://localhost:5173 ...
start "LearnAI - Frontend" cmd /k "cd /d %~dp0frontend && npm run dev"

ping 127.0.0.1 -n 4 >nul

:: 4. Open browser
echo [4/4] Opening browser...
start http://localhost:5173/

echo.
echo ========================================================
echo              LearnAI is successfully running!
echo ========================================================
echo  - Frontend URL : http://localhost:5173/
echo  - Backend API  : http://127.0.0.1:8000/
echo.
echo --------------------------------------------------------
echo  ZAROORI JAANKARI (IMPORTANT):
echo  * Backend aur Frontend ki Command Prompt windows ko
echo    KHULA RAKHEIN (chahein to minimize kar dein).
echo  * Agar aap un windows ko band kar denge, to website link
echo    kaam karna band kar degi.
echo  * Project ko completely STOP karne ke liye stop_project.bat
echo    par double click karein.
echo --------------------------------------------------------
echo.
pause
