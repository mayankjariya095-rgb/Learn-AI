@echo off
title LearnAI - First Time Setup
cls
echo ========================================================
echo          LearnAI - First Time Setup
echo ========================================================
echo.
echo Yeh script pehli baar run karo. Baad mein sirf
echo run_project.bat use karna.
echo.

:: -------------------------------------------------------
:: 1. Python check
:: -------------------------------------------------------
echo [1/6] Checking Python...
python --version >nul 2>&1
if %errorlevel% neq 0 (
    echo  ERROR: Python nahi mila!
    echo  Python install karo: https://www.python.org/downloads/
    pause
    exit /b 1
)
python --version
echo  Python OK!
echo.

:: -------------------------------------------------------
:: 2. Node.js check
:: -------------------------------------------------------
echo [2/6] Checking Node.js...
node --version >nul 2>&1
if %errorlevel% neq 0 (
    echo  ERROR: Node.js nahi mila!
    echo  Node.js install karo: https://nodejs.org/
    pause
    exit /b 1
)
node --version
echo  Node.js OK!
echo.

:: -------------------------------------------------------
:: 3. Python Virtual Environment + Dependencies
:: -------------------------------------------------------
echo [3/6] Setting up Python Virtual Environment...
cd /d %~dp0backend

if not exist "venv" (
    echo  Creating virtual environment...
    python -m venv venv
)

echo  Activating virtual environment...
call venv\Scripts\activate.bat

echo  Installing Python packages (may take a few minutes)...
pip install -r requirements.txt --quiet
if %errorlevel% neq 0 (
    echo  ERROR: pip install fail hua!
    pause
    exit /b 1
)
echo  Python packages installed!
echo.

:: -------------------------------------------------------
:: 4. Django Migrations + DB setup
:: -------------------------------------------------------
echo [4/6] Setting up Database...
python manage.py migrate --run-syncdb
if %errorlevel% neq 0 (
    echo  ERROR: Migration fail hua!
    pause
    exit /b 1
)
echo  Database ready!
echo.

:: -------------------------------------------------------
:: 5. Frontend Node modules
:: -------------------------------------------------------
echo [5/6] Installing Frontend packages...
cd /d %~dp0frontend
call npm install --silent
if %errorlevel% neq 0 (
    echo  ERROR: npm install fail hua!
    pause
    exit /b 1
)
echo  Frontend packages installed!
echo.

:: -------------------------------------------------------
:: 6. Done - auto launch
:: -------------------------------------------------------
echo [6/6] Setup complete! Project launch ho raha hai...
echo.
echo ========================================================
echo           Setup Successfully Complete!
echo ========================================================
echo.
echo  Ab se sirf run_project.bat use karna.
echo.
ping 127.0.0.1 -n 2 >nul
cd /d %~dp0
call run_project.bat

