@echo off
echo.
echo ============================================
echo  AthleteForge - Fix Render Settings
echo ============================================
echo.
echo ERROR FIX: Root Directory was set wrong.
echo It must be "backend" — NOT a pip/npm command.
echo.
echo In Render Dashboard -^> athleteforge-bca -^> Settings:
echo.
echo   Root Directory:  backend
echo   Build Command:   bash build.sh
echo   Start Command:   gunicorn athlete_system.wsgi:application --bind 0.0.0.0:$PORT
echo.
echo Then: Manual Deploy -^> Deploy latest commit
echo Wait 5-8 min, then open:
echo   https://athleteforge-bca.onrender.com/login
echo.
echo Login: admin / admin123
echo.
start https://dashboard.render.com
pause