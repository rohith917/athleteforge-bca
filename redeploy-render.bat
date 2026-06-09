@echo off
echo.
echo ============================================
echo  AthleteForge - MANUAL Render Redeploy
echo ============================================
echo.
echo Auto-deploy did NOT run. You must redeploy manually:
echo.
echo 1. Open https://dashboard.render.com
echo 2. Click service: athleteforge-bca  (the BACKEND)
echo 3. Click "Manual Deploy" -^> "Deploy latest commit"
echo 4. Wait 5-8 minutes for build to finish
echo 5. Open the app at:
echo    https://athleteforge-bca.onrender.com/login
echo.
echo Login: admin / admin123
echo.
echo (Ignore athleteforge-frontend — app now runs on the backend URL)
echo.
start https://dashboard.render.com
pause