@echo off
title LearnAI Launcher
cls
echo ========================================================
echo              Starting LearnAI Platform
echo ========================================================
echo.

:: Check karo ki setup hua hai ya nahi
if not exist "%~dp0backend\venv" (
    echo  Virtual environment nahi mila!
    echo  Pehle setup.bat run karo.
    echo.
    pause
    exit /b 1
)

if not exist "%~dp0frontend\node_modules" (
    echo  node_modules nahi mili!
    echo  Pehle setup.bat run karo.
    echo.
    pause
    exit /b 1
)

:: 1. Purane processes ko band karo
echo [1/4] Clearing ports 8000 and 5173...
for /f "tokens=5" %%a in ('netstat -aon ^| findstr ":8000" ^| findstr "LISTENING"') do taskkill /f /t /pid %%a >nul 2>&1
for /f "tokens=5" %%a in ('netstat -aon ^| findstr ":5173" ^| findstr "LISTENING"') do taskkill /f /t /pid %%a >nul 2>&1

:: 2. Django Backend (with venv)
echo [2/4] Starting Django Backend on http://127.0.0.1:8000 ...
start "LearnAI - Backend" cmd /k "cd /d %~dp0backend && call venv\Scripts\activate.bat && python manage.py runserver 127.0.0.1:8000"

ping 127.0.0.1 -n 3 >nul

:: 3. Vite Frontend
echo [3/4] Starting Vite Frontend on http://localhost:5173 ...
start "LearnAI - Frontend" cmd /k "cd /d %~dp0frontend && npm run dev"

ping 127.0.0.1 -n 4 >nul

:: 4. Browser open
echo [4/4] Opening browser...
start http://localhost:5173/

echo.
echo ========================================================
echo           LearnAI is Running!
echo ========================================================
echo  Frontend  : http://localhost:5173/
echo  Backend   : http://127.0.0.1:8000/
echo --------------------------------------------------------
echo  Backend aur Frontend windows ko KHULA rakhein.
echo  Band karne ke liye: stop_project.bat
echo --------------------------------------------------------
echo.
pause
