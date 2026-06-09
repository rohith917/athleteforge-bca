@echo off
title AthleteForge - Start Demo (Local)
echo.
echo ============================================
echo  AthleteForge - Starting LOCAL demo
echo ============================================
echo.
echo This opens your website on YOUR laptop (no cloud needed).
echo.
echo Website: http://localhost:5173
echo Login:   admin / admin123
echo.
cd /d "%~dp0"

start "AthleteForge Backend" cmd /k "cd /d %~dp0backend && call venv\Scripts\activate.bat && python manage.py migrate --no-input 2>nul && python manage.py setup_admin 2>nul && python manage.py seed_data 2>nul && python manage.py runserver"

timeout /t 4 /nobreak >nul

start "AthleteForge Frontend" cmd /k "cd /d %~dp0frontend && npm.cmd run dev"

timeout /t 8 /nobreak >nul

start http://localhost:5173

echo.
echo Two windows opened (Backend + Frontend).
echo Browser opening http://localhost:5173
echo.
echo For CLOUD deploy: double-click deploy-railway.bat
echo.
pause