@echo off
title AthleteForge - Start Demo (Local)
echo.
echo ============================================
echo  AthleteForge - LOCAL development
echo ============================================
echo.
echo IMPORTANT: Always use http://localhost:5173
echo            (not 127.0.0.1 — cookies need localhost)
echo.
echo Login: admin / admin123
echo.
cd /d "%~dp0"

where npm.cmd >nul 2>&1
if errorlevel 1 (
  echo ERROR: Node.js/npm not found. Install from https://nodejs.org
  pause
  exit /b 1
)

if not exist "%~dp0backend\venv\Scripts\python.exe" (
  echo ERROR: Backend venv missing. Run: cd backend ^&^& python -m venv venv ^&^& venv\Scripts\pip install -r requirements.txt
  pause
  exit /b 1
)

start "AthleteForge Backend :8000" cmd /k "cd /d %~dp0backend && call venv\Scripts\activate.bat && python manage.py migrate --no-input && python manage.py setup_admin && python manage.py seed_data && python manage.py runserver 127.0.0.1:8000"

timeout /t 5 /nobreak >nul

start "AthleteForge Frontend :5173" cmd /k "cd /d %~dp0frontend && npm.cmd run dev"

timeout /t 10 /nobreak >nul

start http://localhost:5173

echo.
echo Backend:  http://127.0.0.1:8000/api/health/
echo Frontend: http://localhost:5173
echo.
echo Two windows opened. Keep both running while you work.
echo.
pause