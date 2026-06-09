@echo off
echo.
echo ============================================
echo  AthleteForge - Deploy on Render NOW
echo ============================================
echo.
echo 1. Open https://dashboard.render.com
echo 2. Click: athleteforge-bca
echo 3. Settings -^> Root Directory MUST be: backend
echo 4. Manual Deploy -^> Deploy latest commit
echo 5. Wait 5-8 minutes
echo.
echo LIVE URL: https://athleteforge-bca.onrender.com
echo LOGIN:    https://athleteforge-bca.onrender.com/login
echo.
echo Credentials: admin / admin123
echo.
start https://dashboard.render.com
start https://athleteforge-bca.onrender.com/login
pause