@echo off
title Stop LearnAI
echo ========================================================
echo               Stopping LearnAI Platform
echo ========================================================
echo.
echo [*] Closing LearnAI servers and freeing ports 8000 and 5173...

taskkill /FI "WINDOWTITLE eq LearnAI - Backend*" /T /F >nul 2>&1
taskkill /FI "WINDOWTITLE eq LearnAI - Frontend*" /T /F >nul 2>&1
taskkill /FI "WINDOWTITLE eq LearnAI_Backend*" /T /F >nul 2>&1
taskkill /FI "WINDOWTITLE eq LearnAI_Frontend*" /T /F >nul 2>&1
taskkill /FI "WINDOWTITLE eq LearnAI Controller*" /T /F >nul 2>&1

for /f "tokens=5" %%a in ('netstat -aon ^| findstr ":8000" ^| findstr "LISTENING"') do taskkill /f /t /pid %%a >nul 2>&1
for /f "tokens=5" %%a in ('netstat -aon ^| findstr ":5173" ^| findstr "LISTENING"') do taskkill /f /t /pid %%a >nul 2>&1

echo.
echo [OK] LearnAI servers have been completely stopped!
echo.
pause
