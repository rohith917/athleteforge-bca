@echo off
echo.
echo ============================================
echo  AthleteForge - Fix Render Deploy
echo ============================================
echo.
echo STEP 1: Open RENDER_SETTINGS.txt in this folder
echo         Copy the settings EXACTLY into Render Dashboard.
echo.
echo STEP 2: Root Directory must be BLANK (empty) OR exactly: backend
echo         NEVER: "backend " (with space) or pip install command
echo.
echo STEP 3: Build Command:  bash build.sh
echo         Start Command:  bash start.sh
echo.
echo STEP 4: Add DATABASE_URL from PostgreSQL database
echo.
echo STEP 5: Manual Deploy -^> Deploy latest commit
echo.
echo LIVE URL: https://athleteforge-bca.onrender.com
echo Login: admin / admin123
echo.
start notepad "%~dp0RENDER_SETTINGS.txt"
start https://dashboard.render.com
start https://github.com/rohith917/athleteforge-bca
pause