@echo off
title AthleteForge - Deploy on Render
cd /d "%~dp0"

echo.
echo ============================================
echo  AthleteForge - Deploy on RENDER
echo ============================================
echo.
echo LIVE URL: https://athleteforge-bca.onrender.com
echo Login:    admin / admin123
echo.
echo CHECKLIST:
echo   [ ] Root Directory = BLANK (empty)
echo   [ ] Build Command  = bash build.sh
echo   [ ] Start Command  = bash start.sh
echo   [ ] DATABASE_URL linked from PostgreSQL
echo   [ ] Manual Deploy - Deploy latest commit
echo.
start notepad "%~dp0RENDER_SETTINGS.txt"
start notepad "%~dp0RENDER_FIX_ALL.txt"
start https://dashboard.render.com
start https://athleteforge-bca.onrender.com
echo.
pause