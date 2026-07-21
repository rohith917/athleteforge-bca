@echo off
title AthleteForge - LAUNCH DEMO (auto-generated)
cd /d "%~dp0"

echo.
echo ============================================
echo   ATHLETEFORGE - LOCAL DEMO LAUNCHER
echo ============================================
echo.
echo Project: C:\BCA_Project\athlete-performance-system
echo.
echo Launching two server consoles...
echo.

:: Backend: migrate + seed + run (in its own persistent window)
start "AthleteForge Backend :8000" cmd /k "cd /d backend && call venv\Scripts\activate.bat && python manage.py migrate --no-input && python manage.py setup_admin && python manage.py seed_data && python manage.py runserver 127.0.0.1:8000"

:: Give backend a head start
timeout /t 6 /nobreak >nul

:: Frontend dev server (in its own persistent window)
start "AthleteForge Frontend :5173" cmd /k "cd /d frontend && npm run dev"

:: Wait for Vite to be ready
timeout /t 10 /nobreak >nul

:: Open browser (prefer Chrome if present, else default)
where chrome >nul 2>&1 && (
  start chrome "http://localhost:5173"
) || (
  start http://localhost:5173
)

echo.
echo ============================================
echo  SERVERS LAUNCHED
echo ============================================
echo.
echo   Backend window:   http://127.0.0.1:8000/api/health/
echo   Frontend window:  http://localhost:5173
echo   Browser opened to the app.
echo.
echo DEMO ACCOUNTS (from seed_data):
echo   Admin   : admin / admin123
echo   Coach   : coach / coach123   ^<-- recommended for most features
echo   Student : rahul.sharma@email.com / student123
echo.
echo TIPS:
echo - Wait 10-30 seconds for full init (Django migrate/seed + Vite)
echo - Always use http://localhost:5173 (cookies require it)
echo - Use Chrome or Edge
echo - First load may show "Server waking" messages on cloud, but local is fast
echo.
echo Two new CMD windows are now running the servers.
echo Close those windows to stop the demo.
echo.
echo This launcher window will close in 5 seconds...
timeout /t 5 /nobreak >nul

exit /b 0
